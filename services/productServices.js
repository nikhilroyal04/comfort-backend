const { db } = require('../config/firebase');
const { collection, addDoc, getDoc, doc, setDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp, where } = require('firebase/firestore');

// Create a new product in Firestore
const createProduct = async (productData) => {
    try {
        const docRef = await addDoc(collection(db, "products"), {
            ...productData,
            createdAt: serverTimestamp(), // Add createdAt field
        });
        return { id: docRef.id, ...productData };
    } catch (error) {
        throw new Error("Error creating product: " + error.message);
    }
};

// Get all products from Firestore
const getProducts = async () => {
    try {
        const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(productsQuery);
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return products;
    } catch (error) {
        throw new Error("Error fetching products: " + error.message);
    }
};

// Get all products by category from Firestore
const getProductsByCategory = async (category) => {
    try {
        const productsQuery = query(collection(db, "products"), where("category", "==", category), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(productsQuery);
        const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return products;
    } catch (error) {
        throw new Error("Error fetching products: " + error.message);
    }
};

// Get a single product by ID from Firestore
const getProductById = async (productId) => {
    try {
        const productRef = doc(db, "products", productId);
        const productDoc = await getDoc(productRef);

        if (!productDoc.exists()) {
            throw new Error("Product not found");
        }

        return { id: productDoc.id, ...productDoc.data() };
    } catch (error) {
        throw new Error("Error fetching product: " + error.message);
    }
};

// Update product data in Firestore
const updateProduct = async (productId, productData) => {
    try {
        const productRef = doc(db, "products", productId);
        await setDoc(productRef, productData, { merge: true });
        return { id: productId, ...productData };
    } catch (error) {
        throw new Error("Error updating product: " + error.message);
    }
};

// Delete a product from Firestore
const deleteProduct = async (productId) => {
    try {
        const productRef = doc(db, "products", productId);
        await deleteDoc(productRef);
        return { message: "Product deleted successfully" };
    } catch (error) {
        throw new Error("Error deleting product: " + error.message);
    }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getProductsByCategory };
