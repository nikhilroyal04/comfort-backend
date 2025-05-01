const { db } = require('../config/firebase');
const { collection, addDoc, getDoc, doc, setDoc, deleteDoc, getDocs, query, orderBy } = require('firebase/firestore');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Create a new maintenance in Firestore with createdOn timestamp
const login = async (loginData) => {
    try {
        const loginWithTimestamp = { ...loginData, createdOn: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "users"), loginWithTimestamp);
        const token = jwt.sign({ userId: docRef.id }, JWT_SECRET, { expiresIn: '24h' });
        return { id: docRef.id, ...loginWithTimestamp, token };
    } catch (error) {
        throw new Error("Error creating user: " + error.message);
    }
};

// Get all users from Firestore
const getUsers = async () => {
    try {
        const usersQuery = query(collection(db, "users"), orderBy("createdOn", "desc"));
        const querySnapshot = await getDocs(usersQuery);
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return users;
    } catch (error) {
        throw new Error("Error fetching users: " + error.message);
    }
};  

// Get a single user by ID from Firestore
const getUserById = async (userId) => {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            throw new Error("User not found");
        }
        return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
        throw new Error("Error fetching user: " + error.message);
    }
};

// Update a user by ID in Firestore
const updateUser = async (userId, userData) => {
    try {
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, userData, { merge: true });
        return { id: userId, ...userData };
    } catch (error) {
        throw new Error("Error updating user: " + error.message);
    }
};

// Delete a user by ID from Firestore
const deleteUser = async (userId) => {
    try {
        const userRef = doc(db, "users", userId);
        await deleteDoc(userRef);
        return { message: "User deleted successfully" };
    } catch (error) {
        throw new Error("Error deleting user: " + error.message);
    }
};

const register = async (registerData) => {
    try {
        const registerWithTimestamp = { ...registerData, createdOn: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "users"), registerWithTimestamp);
        return { id: docRef.id, ...registerWithTimestamp };
    } catch (error) {
        throw new Error("Error registering user: " + error.message);
    }
};

const logout = async (logoutData) => {  
    try {
        const logoutWithTimestamp = { ...logoutData, createdOn: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "users"), logoutWithTimestamp);
        return { id: docRef.id, ...logoutWithTimestamp };
    } catch (error) {
        throw new Error("Error logging out: " + error.message);
    }
};

module.exports = { login, getUsers, getUserById, updateUser, deleteUser, register, logout };