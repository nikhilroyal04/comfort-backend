const { db } = require('../config/firebase');
const { collection, addDoc, getDoc, doc, setDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp, where } = require('firebase/firestore');

// Create a new service history in Firestore
const createServiceHistory = async (serviceHistoryData) => {
    try {
        const docRef = await addDoc(collection(db, "serviceHistory"), {
            ...serviceHistoryData,
            createdOn: serverTimestamp(), // Add createdOn field
        });
        return { id: docRef.id, ...serviceHistoryData };
    } catch (error) {
        throw new Error("Error creating service history: " + error.message);
    }
};

// Get all service histories from Firestore
const getServiceHistories = async () => {
    try {
        const serviceHistoriesQuery = query(collection(db, "serviceHistory"), orderBy("createdOn", "desc"));
        const querySnapshot = await getDocs(serviceHistoriesQuery);
        const serviceHistories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return serviceHistories;
    } catch (error) {
        throw new Error("Error fetching service histories: " + error.message);
    }
};

// Get a single service history by ID from Firestore
const getServiceHistoryById = async (serviceHistoryId) => {
    try {
        const serviceHistoryRef = doc(db, "serviceHistory", serviceHistoryId);
        const serviceHistoryDoc = await getDoc(serviceHistoryRef);

        if (!serviceHistoryDoc.exists()) {
                throw new Error("Service history not found");
        }

        return { id: serviceHistoryDoc.id, ...serviceHistoryDoc.data() };
    } catch (error) {
        throw new Error("Error fetching service history: " + error.message);
    }
};

// Get service histories by user ID
const getServiceHistoriesByUserId = async (userId) => {
    try {
        const serviceHistoriesQuery = query(collection(db, "serviceHistory"), where("userId", "==", userId));
        const querySnapshot = await getDocs(serviceHistoriesQuery);
        const serviceHistories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return serviceHistories;
    } catch (error) {
        throw new Error("Error fetching service histories: " + error.message);
    }
};

// Update service history data in Firestore
const updateServiceHistory = async (serviceHistoryId, serviceHistoryData) => {
    try {
        const serviceHistoryRef = doc(db, "serviceHistory", serviceHistoryId);
        await setDoc(serviceHistoryRef, serviceHistoryData, { merge: true });
        return { id: serviceHistoryId, ...serviceHistoryData };
    } catch (error) {
        throw new Error("Error updating service history: " + error.message);
    }
};

// Delete a service history from Firestore
const deleteServiceHistory = async (serviceHistoryId) => {
    try {
        const serviceHistoryRef = doc(db, "serviceHistory", serviceHistoryId);
        await deleteDoc(serviceHistoryRef);
        return { message: "Service history deleted successfully" };
    } catch (error) {
        throw new Error("Error deleting service history: " + error.message);
    }
};

module.exports = { createServiceHistory, getServiceHistories, getServiceHistoryById, getServiceHistoriesByUserId, updateServiceHistory, deleteServiceHistory };
