const { db, auth, googleProvider, adminAuth } = require('../config/firebase');
const { 
  doc, setDoc, getDoc, getDocs, 
  collection, query, where, deleteDoc,
  updateDoc
} = require('firebase/firestore');
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  updateEmail,
  updatePassword,
  deleteUser: deleteAuthUser
} = require('firebase/auth');
const jwt = require('jsonwebtoken');

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
    provider: user.providerData?.[0]?.providerId || 'email',
    ...additionalData
  };

  await setDoc(userRef, userData, { merge: true });
  return userData;
};

// Auth Functions
const registerWithEmail = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const userData = await manageUserInFirestore(user, { name });
  
  const token = jwt.sign({ 
    userId: user.uid, 
    email: user.email,
    role: 'user'
  }, JWT_SECRET, { expiresIn: '24h' });
  
  return { token, user: userData };
};

const loginWithEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const userData = await manageUserInFirestore(user);
  
  const token = jwt.sign({ 
    userId: user.uid, 
    email: user.email,
    role: userData.role || 'user'
  }, JWT_SECRET, { expiresIn: '24h' });
  
  return { token, user: userData };
};

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

// User CRUD Functions
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
  // Get user data first
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) throw new Error('User not found');
  
  // Delete from Auth if UID exists
  if (userDoc.data().uid) {
    try {
      await adminAuth.deleteUser(userDoc.data().uid);
    } catch (error) {
      console.error("Error deleting auth user:", error);
    }
  }
  
  // Delete from Firestore
  await deleteDoc(doc(db, "users", userId));
  return { message: 'User deleted successfully' };
};

// Profile Management
const updateUserProfile = async (userId, updates) => {
  // Update Firestore
  const updatedUser = await updateUser(userId, updates);
  
  // Update Auth if email/password changed
  if (updates.email || updates.password) {
    const authUser = await adminAuth.getUser(updatedUser.uid);
    
    const updateAuth = {};
    if (updates.email) updateAuth.email = updates.email;
    if (updates.password) updateAuth.password = updates.password;
    
    await adminAuth.updateUser(updatedUser.uid, updateAuth);
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