const { db } = require('../config/firebase');
const { collection, addDoc, getDoc, doc, setDoc, deleteDoc, getDocs, query, orderBy, serverTimestamp } = require('firebase/firestore');

// Create a new service in Firestore
const createService = async (serviceData) => {
    try {
        const docRef = await addDoc(collection(db, "services"), {
            ...serviceData,
            createdOn: serverTimestamp(), // Add createdOn field
        });
        return { id: docRef.id, ...serviceData };
    } catch (error) {
        throw new Error("Error creating service: " + error.message);
    }
};

// Get all services from Firestore
const getServices = async () => {
    try {
        const servicesQuery = query(collection(db, "services"), orderBy("createdOn", "desc"));
        const querySnapshot = await getDocs(servicesQuery);
        const services = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return services;
    } catch (error) {
        throw new Error("Error fetching services: " + error.message);
    }
};

// Get a single service by ID from Firestore
const getServiceById = async (serviceId) => {
    try {
        const serviceRef = doc(db, "services", serviceId);
        const serviceDoc = await getDoc(serviceRef);

        if (!serviceDoc.exists()) {
            throw new Error("Service not found");
        }

        return { id: serviceDoc.id, ...serviceDoc.data() };
    } catch (error) {
        throw new Error("Error fetching service: " + error.message);
    }
};

// Update service data in Firestore
const updateService = async (serviceId, serviceData) => {
    try {
        const serviceRef = doc(db, "services", serviceId);
        await setDoc(serviceRef, serviceData, { merge: true });
        return { id: serviceId, ...serviceData };
    } catch (error) {
        throw new Error("Error updating service: " + error.message);
    }
};

// Delete a service from Firestore
const deleteService = async (serviceId) => {
    try {
        const serviceRef = doc(db, "services", serviceId);
        await deleteDoc(serviceRef);
        return { message: "Service deleted successfully" };
    } catch (error) {
        throw new Error("Error deleting service: " + error.message);
    }
};

module.exports = { createService, getServices, getServiceById, updateService, deleteService };
