const { db, auth, adminAuth } = require('../config/firebase');
const {
  doc, setDoc, getDoc, getDocs, where, 
  collection, updateDoc, deleteDoc
} = require('firebase/firestore');
const {
  signInWithCredential,
  GoogleAuthProvider
} = require('firebase/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;

// Utility to encode email for Firestore doc ID
const encodeEmail = (email) => email.replace(/\./g, '(dot)');

// Save or update user data in Firestore
const manageUserInFirestore = async (user, additionalData = {}) => {
  const userRef = doc(db, "users", user.uid);

  const userData = {
    uid: user.uid,
    email: user.email,
    name: user.displayName || additionalData.name || '',
    photoURL: user.photoURL || additionalData.photoURL || '',
    createdOn: additionalData.createdOn || new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    role: additionalData.role || 'NpkR5K3M242WKHPdVTTw',
    provider: user.providerData?.[0]?.providerId || 'google',
    ...additionalData
  };

  await setDoc(userRef, userData, { merge: true });
  return userData;
};

// Register new user with email/password (self-registration)
const registerWithEmail = async (email, password, name, role = 'NpkR5K3M242WKHPdVTTw') => {
  const snapshot = await getDocs(collection(db, "users"));
  const userDoc = snapshot.docs.find(doc => doc.data().email === email);

  // ❌ FIX: Throw if user already exists
  if (userDoc) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();

  const userData = {
    uid: userId,
    email,
    name,
    role,
    password: hashedPassword,
    createdOn: new Date().toISOString(),
    updatedOn: new Date().toISOString(),
    provider: 'manual',
  };

  await setDoc(doc(db, "users", userId), userData);

  const token = jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '24h' });

  return { token, user: userData };
};

// Create new user manually (admin or system)
const newUser = async (email, password, name, role) => {
  const snapshot = await getDocs(collection(db, "users"));
  const userDoc = snapshot.docs.find(doc => doc.data().email === email);

  // ❌ FIX: Throw if user already exists
  if (userDoc) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();

  const userData = {
    uid: userId,
    email,
    name,
    role,
    password: hashedPassword,
    createdOn: new Date().toISOString(),
    updatedOn: new Date().toISOString(),
    provider: 'manual',
  };

  await setDoc(doc(db, "users", userId), userData);

  return userData;
};


// Login with email/password
const loginWithEmail = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const snapshot = await getDocs(collection(db, "users"));
  const userDoc = snapshot.docs.find(doc => doc.data().email == email);

  if (!userDoc) throw new Error("User not found");

  const user = userDoc.data();
  
  if (!user.password) {
    throw new Error("Invalid credentials");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign({
    userId: user.uid,
    email: user.email,
    role: user.role
  }, JWT_SECRET, { expiresIn: '24h' });

  return { token, user };
};

// Google Sign-In
const googleSignIn = async (idToken) => {
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);
  const user = userCredential.user;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const isNewUser = !userDoc.exists();

  const userData = await manageUserInFirestore(user);

  const token = jwt.sign({
    userId: user.uid,
    email: user.email,
    role: userData.role
  }, JWT_SECRET, { expiresIn: '24h' });

  return { token, user: userData, isNewUser };
};

// Get all users
const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getAllCustomers = async () => {
  const q = query(collection(db, "users"), where("role", "==", "NpkR5K3M242WKHPdVTTw"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getAllMembers = async () => {
  const q = query(collection(db, "users"), where("role", "!=", "NpkR5K3M242WKHPdVTTw"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get user by ID
const getUserById = async (userId) => {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) throw new Error("User not found");
  return { id: userDoc.id, ...userDoc.data() };
};

// Update user
const updateUser = async (userId, updateData) => {
  const userRef = doc(db, "users", userId);
  updateData.updatedOn = new Date().toISOString();
  await updateDoc(userRef, updateData);
  const updatedDoc = await getDoc(userRef);
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

// Delete user
const deleteUser = async (userId) => {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) throw new Error("User not found");

  const user = userDoc.data();

  try {
    if (user.uid) await adminAuth.deleteUser(user.uid);
  } catch (error) {
    console.error("Error deleting Firebase Auth user:", error);
  }

  const emailKey = encodeEmail(user.email);
  await deleteDoc(doc(db, "users", userId));
  return { message: "User deleted successfully" };
};

// Update user profile (including auth if needed)
const updateUserProfile = async (userId, updates) => {
  const updatedUser = await updateUser(userId, updates);

  if (updates.email || updates.password) {
    const updateAuth = {};
    if (updates.email) updateAuth.email = updates.email;
    if (updates.password) updateAuth.password = updates.password;

    try {
      await adminAuth.updateUser(updatedUser.uid, updateAuth);
    } catch (err) {
      console.error("Error updating Firebase Auth user:", err);
    }
  }

  return updatedUser;
};

module.exports = {
  registerWithEmail,
  newUser,
  loginWithEmail,
  googleSignIn,
  getAllUsers,
  getAllCustomers,
  getAllMembers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserProfile
};
