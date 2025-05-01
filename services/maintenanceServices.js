const { db } = require('../config/firebase');
const { collection, addDoc, getDoc, doc, setDoc, deleteDoc, getDocs, query, orderBy } = require('firebase/firestore');

// Create a new maintenance in Firestore with createdOn timestamp
const createMaintenance = async (maintenanceData) => {
    try {
        const maintenanceWithTimestamp = { ...maintenanceData, createdOn: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "maintenances"), maintenanceWithTimestamp);
        return { id: docRef.id, ...maintenanceWithTimestamp };
    } catch (error) {
        throw new Error("Error creating maintenance: " + error.message);
    }
};

// Get all maintenances from Firestore sorted by createdOn in descending order (newest first)
const getMaintenances = async () => {
    try {
        const maintenancesQuery = query(collection(db, "maintenances"), orderBy("createdOn", "desc"));
        const querySnapshot = await getDocs(maintenancesQuery);
        const maintenances = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return maintenances;
    } catch (error) {
        throw new Error("Error fetching maintenances: " + error.message);
    }
};

// Get a single maintenance by ID from Firestore
const getMaintenanceById = async (maintenanceId) => {
    try {
        const maintenanceRef = doc(db, "maintenances", maintenanceId);
        const maintenanceDoc = await getDoc(maintenanceRef);

        if (!maintenanceDoc.exists()) {
            throw new Error("Maintenance not found");
        }

        return { id: maintenanceDoc.id, ...maintenanceDoc.data() };
    } catch (error) {
        throw new Error("Error fetching maintenance: " + error.message);
    }
};

// Update maintenance data in Firestore
const updateMaintenance = async (maintenanceId, maintenanceData) => {
    try {
        const maintenanceRef = doc(db, "maintenances", maintenanceId);
        await setDoc(maintenanceRef, maintenanceData, { merge: true });
        return { id: maintenanceId, ...maintenanceData };
    } catch (error) {
        throw new Error("Error updating maintenance: " + error.message);
    }
};

// Delete a maintenance from Firestore
const deleteMaintenance = async (maintenanceId) => {
    try {
        const maintenanceRef = doc(db, "maintenances", maintenanceId);
        await deleteDoc(maintenanceRef);
        return { message: "Maintenance deleted successfully" };
    } catch (error) {
        throw new Error("Error deleting maintenance: " + error.message);
    }
};

module.exports = { createMaintenance, getMaintenances, getMaintenanceById, updateMaintenance, deleteMaintenance };