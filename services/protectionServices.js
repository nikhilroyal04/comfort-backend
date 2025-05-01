const { db } = require('../config/firebase');
const { collection, addDoc, getDoc, doc, setDoc, deleteDoc, getDocs, query, orderBy } = require('firebase/firestore');

// Create a new protection plan in Firestore with createdOn timestamp
const createProtectionPlan = async (protectionPlanData) => {
    try {
        const protectionPlanWithTimestamp = { ...protectionPlanData, createdOn: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "protectionPlans"), protectionPlanWithTimestamp);
        return { id: docRef.id, ...protectionPlanWithTimestamp };
    } catch (error) {
        throw new Error("Error creating protection plan: " + error.message);
    }
};

// Get all protection plans from Firestore sorted by createdOn in descending order (newest first)
const getProtectionPlans = async () => {
    try {
        const protectionPlansQuery = query(collection(db, "protectionPlans"), orderBy("createdOn", "desc"));
        const querySnapshot = await getDocs(protectionPlansQuery);
        const protectionPlans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return protectionPlans;
    } catch (error) {
        throw new Error("Error fetching protection plans: " + error.message);
    }
};

// Get a single protection plan by ID from Firestore
const getProtectionPlanById = async (protectionPlanId) => {
    try {
        const protectionPlanRef = doc(db, "protectionPlans", protectionPlanId);
        const protectionPlanDoc = await getDoc(protectionPlanRef);

        if (!protectionPlanDoc.exists()) {
                throw new Error("Protection plan not found");
        }

        return { id: protectionPlanDoc.id, ...protectionPlanDoc.data() };
    } catch (error) {
        throw new Error("Error fetching protection plan: " + error.message);
    }
};

// Update protection plan data in Firestore
const updateProtectionPlan = async (protectionPlanId, protectionPlanData) => {
    try {
        const protectionPlanRef = doc(db, "protectionPlans", protectionPlanId);
        await setDoc(protectionPlanRef, protectionPlanData, { merge: true });
        return { id: protectionPlanId, ...protectionPlanData };
    } catch (error) {
            throw new Error("Error updating protection plan: " + error.message);
    }
};

// Delete a protection plan from Firestore
const deleteProtectionPlan = async (protectionPlanId) => {
    try {
        const protectionPlanRef = doc(db, "protectionPlans", protectionPlanId);
        await deleteDoc(protectionPlanRef);
        return { message: "Protection plan deleted successfully" };
    } catch (error) {
        throw new Error("Error deleting protection plan: " + error.message);
    }
};

module.exports = { createProtectionPlan, getProtectionPlans, getProtectionPlanById, updateProtectionPlan, deleteProtectionPlan };