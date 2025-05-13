const { db } = require('../config/firebase');
const { collection, addDoc, getDoc, doc, setDoc, deleteDoc, getDocs, query, orderBy } = require('firebase/firestore');

// Create a new maintenance request in Firestore with createdOn timestamp
const createMaintenanceRequest = async (maintenanceRequestData) => {
    try {
        const maintenanceRequestWithTimestamp = { ...maintenanceRequestData, createdOn: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "maintenanceRequests"), maintenanceRequestWithTimestamp);
            return { id: docRef.id, ...maintenanceRequestWithTimestamp };
    } catch (error) {
        throw new Error("Error creating maintenance request: " + error.message);
    }
};

// Get all maintenance requests from Firestore sorted by createdOn in descending order (newest first)
const getMaintenanceRequests = async () => {
    try {
        const maintenanceRequestsQuery = query(collection(db, "maintenanceRequests"), orderBy("createdOn", "desc"));
        const querySnapshot = await getDocs(maintenanceRequestsQuery);
        const maintenanceRequests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return maintenanceRequests;
    } catch (error) {
        throw new Error("Error fetching maintenance requests: " + error.message);
    }
};

// Get a single maintenance request by ID from Firestore
const getMaintenanceRequestById = async (maintenanceRequestId) => {
    try {
        const maintenanceRequestRef = doc(db, "maintenanceRequests", maintenanceRequestId);
        const maintenanceRequestDoc = await getDoc(maintenanceRequestRef);

        if (!maintenanceRequestDoc.exists()) {
            throw new Error("Maintenance request not found");
        }

        return { id: maintenanceRequestDoc.id, ...maintenanceRequestDoc.data() };
    } catch (error) {
        throw new Error("Error fetching maintenance request: " + error.message);
    }
};

// Update maintenance request data in Firestore
const updateMaintenanceRequest = async (maintenanceRequestId, maintenanceRequestData) => {
    try {
        const maintenanceRequestRef = doc(db, "maintenanceRequests", maintenanceRequestId);
        await setDoc(maintenanceRequestRef, maintenanceRequestData, { merge: true });
        return { id: maintenanceRequestId, ...maintenanceRequestData };
    } catch (error) {
            throw new Error("Error updating maintenance request: " + error.message);
    }
};

// Delete a maintenance request from Firestore
const deleteMaintenanceRequest = async (maintenanceRequestId) => {
    try {
        const maintenanceRequestRef = doc(db, "maintenanceRequests", maintenanceRequestId);
        await deleteDoc(maintenanceRequestRef);
        return { message: "Maintenance request deleted successfully" };
    } catch (error) {
        throw new Error("Error deleting maintenance request: " + error.message);
    }
};

module.exports = { createMaintenanceRequest, getMaintenanceRequests, getMaintenanceRequestById, updateMaintenanceRequest, deleteMaintenanceRequest };