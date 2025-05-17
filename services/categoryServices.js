const { db } = require('../config/firebase');
const { collection, addDoc, getDoc, doc, setDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp } = require('firebase/firestore');

// Create a new category in Firestore
const createCategory = async (categoryData) => {
    try {
        const docRef = await addDoc(collection(db, "categories"), {
            ...categoryData,
            createdOn: serverTimestamp(), // Add createdOn field
        });
        return { id: docRef.id, ...categoryData };
    } catch (error) {
        throw new Error("Error creating category: " + error.message);
    }
};

// Get all categories from Firestore
const getCategories = async () => {
    try {
        const categoriesQuery = query(collection(db, "categories"), orderBy("createdOn", "desc"));
        const querySnapshot = await getDocs(categoriesQuery);
        const categories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return categories;
    } catch (error) {
        throw new Error("Error fetching categories: " + error.message);
    }
};

// Get a single category by ID from Firestore
const getCategoryById = async (categoryId) => {
    try {
        const categoryRef = doc(db, "categories", categoryId);
        const categoryDoc = await getDoc(categoryRef);

        if (!categoryDoc.exists()) {
            throw new Error("Category not found");
        }

        return { id: categoryDoc.id, ...categoryDoc.data() };
    } catch (error) {
        throw new Error("Error fetching category: " + error.message);
    }
};

// Get a single category by name from Firestore
const getCategoryByName = async (categoryName) => {
    try {
        const categoryRef = doc(db, "categories", categoryName);
        const categoryDoc = await getDoc(categoryRef);  

        if (!categoryDoc.exists()) {
            throw new Error("Category not found");
        }

        return { id: categoryDoc.id, ...categoryDoc.data() };
    } catch (error) {
        throw new Error("Error fetching category: " + error.message);
    }
};


// Update category data in Firestore
const updateCategory = async (categoryId, categoryData) => {
    try {
        const categoryRef = doc(db, "categories", categoryId);
        await setDoc(categoryRef, categoryData, { merge: true });
        return { id: categoryId, ...categoryData };
    } catch (error) {
        throw new Error("Error updating category: " + error.message);
    }
};

// Delete a category from Firestore
const deleteCategory = async (categoryId) => {
    try {
        const categoryRef = doc(db, "categories", categoryId);
        await deleteDoc(categoryRef);
        return { message: "Category deleted successfully" };
    } catch (error) {
        throw new Error("Error deleting product: " + error.message);
    }
};

module.exports = { createCategory, getCategories, getCategoryById, getCategoryByName, updateCategory, deleteCategory };
