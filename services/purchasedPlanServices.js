const { db } = require('../config/firebase');
const { collection, addDoc, getDoc, doc, setDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp } = require('firebase/firestore');

// Create a new purchased plan in Firestore
const createPurchasedPlan = async (purchasedPlanData) => {
    try {
        const docRef = await addDoc(collection(db, "purchasedPlans"), {
            ...purchasedPlanData,
            createdOn: serverTimestamp(), // Add createdOn field
        });
        return { id: docRef.id, ...purchasedPlanData };
    } catch (error) {
        throw new Error("Error creating purchased plan: " + error.message);
    }
};

// Get all purchased plans from Firestore
const getPurchasedPlans = async () => {
    try {
        const purchasedPlansQuery = query(collection(db, "purchasedPlans"), orderBy("createdOn", "desc"));
        const querySnapshot = await getDocs(purchasedPlansQuery);
        const purchasedPlans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return purchasedPlans;
    } catch (error) {
        throw new Error("Error fetching purchased plans: " + error.message);
    }
};

// Get a single purchased plan by ID from Firestore
const getPurchasedPlanById = async (purchasedPlanId) => {
    try {
        const purchasedPlanRef = doc(db, "purchasedPlans", purchasedPlanId);
        const purchasedPlanDoc = await getDoc(purchasedPlanRef);

        if (!purchasedPlanDoc.exists()) {
            throw new Error("Purchased plan not found");
        }

        return { id: purchasedPlanDoc.id, ...purchasedPlanDoc.data() };
    } catch (error) {
        throw new Error("Error fetching purchased plan: " + error.message);
    }
};

// Get all purchased plans by user ID from Firestore
const getPurchasedPlansByUserId = async (userId) => {
    try {
        const purchasedPlansQuery = query(collection(db, "purchasedPlans"), where("userId", "==", userId), orderBy("createdOn", "desc"));
        const querySnapshot = await getDocs(purchasedPlansQuery);   
        const purchasedPlans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return purchasedPlans;
    } catch (error) {
        throw new Error("Error fetching purchased plans: " + error.message);
    }
};

// Update purchased plan data in Firestore
const updatePurchasedPlan = async (purchasedPlanId, purchasedPlanData) => {
    try {
        const purchasedPlanRef = doc(db, "purchasedPlans", purchasedPlanId);
        await setDoc(purchasedPlanRef, purchasedPlanData, { merge: true });
        return { id: purchasedPlanId, ...purchasedPlanData };
    } catch (error) {
        throw new Error("Error updating purchased plan: " + error.message);
    }
};

// Delete a purchased plan from Firestore
const deletePurchasedPlan = async (purchasedPlanId) => {
    try {
        const purchasedPlanRef = doc(db, "purchasedPlans", purchasedPlanId);
        await deleteDoc(purchasedPlanRef);
        return { message: "Purchased plan deleted successfully" };
    } catch (error) {
        throw new Error("Error deleting purchased plan: " + error.message);
    }
};

module.exports = { createPurchasedPlan, getPurchasedPlans, getPurchasedPlanById, getPurchasedPlansByUserId, updatePurchasedPlan, deletePurchasedPlan };
