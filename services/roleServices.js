const { db } = require('../config/firebase');
const { collection, addDoc, getDoc, doc, setDoc, deleteDoc, getDocs, query, orderBy } = require('firebase/firestore');

// Create a new role in Firestore with createdOn timestamp
const createRole = async (roleData) => {
    try {
        const roleWithTimestamp = { ...roleData, createdOn: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "roles"), roleWithTimestamp);
        return { id: docRef.id, ...roleWithTimestamp };
    } catch (error) {
        throw new Error("Error creating role: " + error.message);
    }
};

// Get all roles from Firestore sorted by createdOn in descending order
const getRoles = async () => {
    try {
        const rolesQuery = query(collection(db, "roles"), orderBy("createdOn", "desc"));
        const querySnapshot = await getDocs(rolesQuery);
        const roles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return roles;
    } catch (error) {
        throw new Error("Error fetching roles: " + error.message);
    }
};

// Get a single role by ID from Firestore
const getRoleById = async (roleId) => {
    try {
        const roleRef = doc(db, "roles", roleId);
        const roleDoc = await getDoc(roleRef);

        if (!roleDoc.exists()) {
            throw new Error("Role not found");
        }

        return { id: roleDoc.id, ...roleDoc.data() };
    } catch (error) {
        throw new Error("Error fetching role: " + error.message);
    }
};

// Update role data in Firestore
const updateRole = async (roleId, roleData) => {
    try {
        const roleRef = doc(db, "roles", roleId);
        await setDoc(roleRef, roleData, { merge: true });
        return { id: roleId, ...roleData };
    } catch (error) {
        throw new Error("Error updating role: " + error.message);
    }
};

// Delete a role from Firestore
const deleteRole = async (roleId) => {
    try {
        const roleRef = doc(db, "roles", roleId);
        await deleteDoc(roleRef);
        return { message: "Role deleted successfully" };
    } catch (error) {
        throw new Error("Error deleting role: " + error.message);
    }
};

module.exports = { createRole, getRoles, getRoleById, updateRole, deleteRole };
