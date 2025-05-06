const { db, auth, googleProvider, adminAuth } = require('../config/firebase');
const {
  doc, setDoc, getDoc, getDocs,
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

// Common function to manage user data in Firestore
const manageUserInFirestore = async (user, additionalData = {}) => {
  const userRef = doc(db, "users", user.uid);

  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || additionalData.name || '',
    photoURL: user.photoURL || '',
    createdAt: additionalData.createdAt || new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    role: additionalData.role || 'user',
    provider: user.providerData?.[0]?.providerId || 'google',
    ...additionalData
  };

  await setDoc(userRef, userData, { merge: true });
  return userData;
};

// Register with manual email/password
const registerWithEmail = async (email, password, name) => {
  const existing = await getDoc(doc(db, "usersByEmail", email));
  if (existing.exists()) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();

  const userData = {
    uid: userId,
    email,
    displayName: name,
    role: 'user',
    createdAt: new Date().toISOString(),
    provider: 'manual',
    passwordHash: hashedPassword,
  };

  await setDoc(doc(db, "users", userId), userData);
  await setDoc(doc(db, "usersByEmail", email), { uid: userId });

  const token = jwt.sign({
    userId: userId,
    email: email,
    role: 'user'
  }, JWT_SECRET, { expiresIn: '24h' });

  return { token, user: userData };
};

// Login with manual email/password
const loginWithEmail = async (email, password) => {
  const emailDoc = await getDoc(doc(db, "usersByEmail", email));
  if (!emailDoc.exists()) throw new Error("Invalid credentials");

  const userId = emailDoc.data().uid;
  const userDoc = await getDoc(doc(db, "users", userId));
  const user = userDoc.data();

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign({
    userId: user.uid,
    email: user.email,
    role: user.role || 'user'
  }, JWT_SECRET, { expiresIn: '24h' });

  return { token, user };
};

// Google Sign-In using Firebase Auth
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
    role: userData.role || 'user'
  }, JWT_SECRET, { expiresIn: '24h' });

  return { token, user: userData, isNewUser };
};

// User CRUD
const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getUserById = async (userId) => {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) throw new Error('User not found');
  return { id: userDoc.id, ...userDoc.data() };
};

const updateUser = async (userId, updateData) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, updateData);
  const updatedDoc = await getDoc(userRef);
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

const deleteUser = async (userId) => {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) throw new Error('User not found');

  if (userDoc.data().uid) {
    try {
      await adminAuth.deleteUser(userDoc.data().uid);
    } catch (error) {
      console.error("Error deleting auth user:", error);
    }
  }

  await deleteDoc(doc(db, "users", userId));
  await deleteDoc(doc(db, "usersByEmail", userDoc.data().email));
  return { message: 'User deleted successfully' };
};

// Profile update
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
  loginWithEmail,
  googleSignIn,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserProfile
};
