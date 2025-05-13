const { db } = require('../config/firebase');
const { collection, addDoc, getDoc, doc, setDoc, deleteDoc, getDocs, query, orderBy, where } = require('firebase/firestore');

// Create a new task in Firestore with createdOn timestamp
const createTask = async (taskData) => {
    try {
        const taskWithTimestamp = { ...taskData, createdOn: new Date().toISOString() };
        const docRef = await addDoc(collection(db, "tasks"), taskWithTimestamp);
        return { id: docRef.id, ...taskWithTimestamp };
    } catch (error) {
        throw new Error("Error creating task: " + error.message);
    }
};

// Get all tasks from Firestore sorted by createdOn in descending order
const getTasks = async () => {
    try {
        const tasksQuery = query(collection(db, "tasks"), orderBy("createdOn", "desc"));
        const querySnapshot = await getDocs(tasksQuery);
        const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return tasks;
    } catch (error) {
        throw new Error("Error fetching tasks: " + error.message);
    }
};

// Get a single task by ID from Firestore
const getTaskById = async (taskId) => {
    try {
        const taskRef = doc(db, "tasks", taskId);
        const taskDoc = await getDoc(taskRef);

        if (!taskDoc.exists()) {
            throw new Error("Task not found");
        }

        return { id: taskDoc.id, ...taskDoc.data() };
    } catch (error) {
        throw new Error("Error fetching task: " + error.message);
    }
};

const getTasksByUserId = async (userId) => {
    try {
        const tasksQuery = query(collection(db, "tasks"), where("assignee", "==", userId), orderBy("createdOn", "desc"));
        const querySnapshot = await getDocs(tasksQuery);
        const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return tasks;
    } catch (error) {
        throw new Error("Error fetching tasks: " + error.message);
    }
};

// Update task data in Firestore
const updateTask = async (taskId, taskData) => {
    try {
        const taskRef = doc(db, "tasks", taskId);
        await setDoc(taskRef, taskData, { merge: true });
        return { id: taskId, ...taskData };
    } catch (error) {
        throw new Error("Error updating task: " + error.message);
    }
};

// Delete a task from Firestore
const deleteTask = async (taskId) => {
    try {
        const taskRef = doc(db, "tasks", taskId);
        await deleteDoc(taskRef);
        return { message: "Task deleted successfully" };
    } catch (error) {
        throw new Error("Error deleting task: " + error.message);
    }
};

// Assign a task to a specific user
const assignTask = async (taskId, userId) => {
    try {
        const taskRef = doc(db, "tasks", taskId);
        await setDoc(taskRef, { assignedTo: userId }, { merge: true });
        return { message: `Task ${taskId} assigned to user ${userId}` };
    } catch (error) {
        throw new Error("Error assigning task: " + error.message);
    }
};

// Bulk assign multiple tasks to a single user
const bulkAssignTasks = async (taskIds, userId) => {
    try {
        const updates = taskIds.map(async (taskId) => {
            const taskRef = doc(db, "tasks", taskId);
            await setDoc(taskRef, { assignedTo: userId }, { merge: true });
        });

        await Promise.all(updates);

        return { message: `${taskIds.length} tasks assigned to user ${userId}` };
    } catch (error) {
        throw new Error("Error bulk assigning tasks: " + error.message);
    }
};


module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask, assignTask, bulkAssignTasks, getTasksByUserId };
