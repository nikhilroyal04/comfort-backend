const express = require('express');
const router = express.Router();
const { login, register, getUsers, getUserById, updateUser, deleteUser } = require('../services/authServices');
const { successResponse, errorResponse } = require('../utils/responseManager');

router.post('/login', async (req, res) => {
    const data = req.body;
    try {
        const user = await login(data);
        if (!user) {
            return errorResponse(res, null, "Invalid credentials");
        }
        successResponse(res, user, "Login successful");
    } catch (error) {
        errorResponse(res, error, "Login failed");
    }   
});

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await register(email, password);
        successResponse(res, user, "Registration successful");
    } catch (error) {
        errorResponse(res, error, "Registration failed");
    }
}); 

router.get('/getAllUsers', async (req, res) => {
    try {
        const users = await getUsers();
        successResponse(res, users, "Users fetched successfully");
    } catch (error) {
        errorResponse(res, error, "Error fetching users");
    }
});

router.get('/getUserById/:id', async (req, res) => {
    const { id } = req.params;  
    try {
        const user = await getUserById(id);
        successResponse(res, user, "User fetched successfully");
    } catch (error) {
        errorResponse(res, error, "Error fetching user");
    }
}); 

router.put('/updateUser/:id', async (req, res) => {
    const { id } = req.params;
    const { email, password } = req.body;
    try {
        const user = await updateUser(id, email, password);
        successResponse(res, user, "User updated successfully");
    } catch (error) {
        errorResponse(res, error, "Error updating user");
    }
}); 

router.delete('/deleteUser/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await deleteUser(id);
        successResponse(res, user, "User deleted successfully");
    } catch (error) {
        errorResponse(res, error, "Error deleting user");
    }
});

module.exports = router;