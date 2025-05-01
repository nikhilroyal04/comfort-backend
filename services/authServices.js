const { db } = require('../config/firebase');
const { 
    collection, 
    addDoc, 
    getDoc, 
    doc, 
    setDoc, 
    deleteDoc, 
    getDocs, 
    query, 
    orderBy, 
    where 
} = require('firebase/firestore');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Login: Authenticate a user and return a JWT token
const login = async (data) => {
    try {
        const usersRef = collection(db, "users");

        const q = query(usersRef, where("email", "==", data.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("User not found");
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        if (userData.password !== data.password) {
            throw new Error("Invalid password");
        }

        const token = jwt.sign({ userId: userDoc.id }, JWT_SECRET, { expiresIn: '24h' });
        return { id: userDoc.id, ...userData, token };
    } catch (error) {
        throw new Error("Error logging in: " + error.message);
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

// Register a new user with a timestamp
const register = async (registerData) => {
    try {
        const registerWithTimestamp = { ...registerData, createdOn: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "users"), registerWithTimestamp);
        return { id: docRef.id, ...registerWithTimestamp };
    } catch (error) {
        throw new Error("Error registering user: " + error.message);
    }
};

module.exports = { login, getUsers, getUserById, updateUser, deleteUser, register };