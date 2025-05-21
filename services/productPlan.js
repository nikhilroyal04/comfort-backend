const { db } = require('../config/firebase');
const { collection, addDoc, getDoc, doc, setDoc, deleteDoc, getDocs, query, orderBy } = require('firebase/firestore');

// Create a new protection plan in Firestore with createdOn timestamp
const createProductPlan = async (productPlanData) => {
    try {
        const productPlanWithTimestamp = { ...productPlanData, createdOn: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "productPlans"), productPlanWithTimestamp);
        return { id: docRef.id, ...productPlanWithTimestamp };
    } catch (error) {
        throw new Error("Error creating product plan: " + error.message);
    }
};

// Get all protection plans from Firestore sorted by createdOn in descending order (newest first)
const getProductPlans = async () => {
    try {
        const productPlansQuery = query(collection(db, "productPlans"), orderBy("createdOn", "desc"));
        const querySnapshot = await getDocs(productPlansQuery);
        const productPlans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return productPlans;
    } catch (error) {
        throw new Error("Error fetching product plans: " + error.message);
    }
};

// Get a single protection plan by ID from Firestore
const getProductPlanById = async (productPlanId) => {
    try {
        const productPlanRef = doc(db, "productPlans", productPlanId);
        const productPlanDoc = await getDoc(productPlanRef);

        if (!productPlanDoc.exists()) {
                throw new Error("Product plan not found");
        }

        return { id: productPlanDoc.id, ...productPlanDoc.data() };
    } catch (error) {
        throw new Error("Error fetching product plan: " + error.message);
    }
};

// Update protection plan data in Firestore
const updateProductPlan = async (productPlanId, productPlanData) => {
    try {
        const productPlanRef = doc(db, "productPlans", productPlanId);
        await setDoc(productPlanRef, productPlanData, { merge: true });
        return { id: productPlanId, ...productPlanData };
    } catch (error) {
                throw new Error("Error updating product plan: " + error.message);
    }
};

// Delete a protection plan from Firestore
const deleteProductPlan = async (productPlanId) => {
    try {
        const productPlanRef = doc(db, "productPlans", productPlanId);
        await deleteDoc(productPlanRef);
        return { message: "Product plan deleted successfully" };
    } catch (error) {
        throw new Error("Error deleting product plan: " + error.message);
    }
};

module.exports = { createProductPlan, getProductPlans, getProductPlanById, updateProductPlan, deleteProductPlan };