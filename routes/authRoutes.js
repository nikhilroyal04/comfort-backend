const express = require('express');
const router = express.Router();
const { 
    login, 
    register, 
    sendSignInLink,
    verifySignInLink,
    signInWithGoogle,
    createCustomToken,
    setUserRole,
    getUsers, 
    getUserById, 
    updateUser, 
    deleteUser 
} = require('../services/authServices');
const { successResponse, errorResponse } = require('../utils/responseManager');
const { verifyToken } = require('../middleware/authMiddleware');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    try {
        const user = req.user;
        if (user && user.role === 'admin') {
            next();
        } else {
            return errorResponse(res, null, "Unauthorized: Admin access required", 403);
        }
    } catch (error) {
        return errorResponse(res, error, "Authorization failed", 403);
    }
};

// Middleware to check if user is sales team
const isSalesTeam = (req, res, next) => {
    try {
        const user = req.user;
        if (user && (user.role === 'sales' || user.role === 'admin')) {
            next();
        } else {
            return errorResponse(res, null, "Unauthorized: Sales team access required", 403);
        }
    } catch (error) {
        return errorResponse(res, error, "Authorization failed", 403);
    }
};

// Public routes (no authentication required)
// ==========================================

// Sign in with Google (process token from frontend)
router.post('/google-signin', async (req, res) => {
    const { idToken } = req.body;
    
    if (!idToken) {
        return errorResponse(res, null, "Google ID token is required");
    }
    
    try {
        const result = await signInWithGoogle(idToken);
        
        if (result.isNewUser) {
            successResponse(res, result, "Google sign-in successful. New account created.");
        } else {
            successResponse(res, result, "Google sign-in successful");
        }
    } catch (error) {
        errorResponse(res, error, "Google sign-in failed");
    }
});

// Send sign-in link to email (passwordless authentication)
router.post('/send-sign-in-link', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return errorResponse(res, null, "Email is required");
    }
    
    try {
        const result = await sendSignInLink(email);
        successResponse(res, result, "Sign-in link sent successfully to your email");
    } catch (error) {
        errorResponse(res, error, "Failed to send sign-in link");
    }
});

// Verify sign-in link
router.post('/verify-sign-in-link', async (req, res) => {
    const { email, link } = req.body;
    
    if (!email || !link) {
        return errorResponse(res, null, "Email and sign-in link are required");
    }
    
    try {
        const result = await verifySignInLink(email, link);
        
        if (result.isNewUser) {
            successResponse(res, result, "Email verified successfully. Please complete registration.");
        } else {
            successResponse(res, result, "Sign-in successful");
        }
    } catch (error) {
        errorResponse(res, error, "Sign-in link verification failed");
    }
});

// Register with email (after email verification)
router.post('/register', async (req, res) => {
    const { token, ...userData } = req.body;
    
    // Check token to ensure email was verified
    if (!token) {
        return errorResponse(res, null, "Email verification is required before registration");
    }
    
    try {
        const user = await register(userData);
        successResponse(res, user, "Registration successful");
    } catch (error) {
        errorResponse(res, error, "Registration failed");
    }
});

// Login with email and password
router.post('/login', async (req, res) => {
    try {
        const user = await login(req.body);
        successResponse(res, user, "Login successful");
    } catch (error) {
        errorResponse(res, error, "Login failed");
    }
});

// Protected routes (authentication required)
// =========================================

// Admin only: Create custom token for a user
router.post('/create-custom-token', verifyToken, isAdmin, async (req, res) => {
    const { uid, role } = req.body;
    
    if (!uid) {
        return errorResponse(res, null, "User ID is required");
    }
    
    try {
        const token = await createCustomToken(uid, role);
        successResponse(res, { token }, "Custom token created successfully");
    } catch (error) {
        errorResponse(res, error, "Failed to create custom token");
    }
});

// Admin only: Set user role
router.post('/set-user-role', verifyToken, isAdmin, async (req, res) => {
    const { uid, role } = req.body;
    
    if (!uid || !role) {
        return errorResponse(res, null, "User ID and role are required");
    }
    
    try {
        const result = await setUserRole(uid, role);
        successResponse(res, result, "User role updated successfully");
    } catch (error) {
        errorResponse(res, error, "Failed to update user role");
    }
});

// Admin only: Get all users
router.get('/getAllUsers', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await getUsers();
        successResponse(res, users, "Users fetched successfully");
    } catch (error) {
        errorResponse(res, error, "Error fetching users");
    }
});

// Get user by ID (self or admin)
router.get('/getUserById/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        // Check if user is requesting their own data or is an admin
        if (req.user.userId !== id && req.user.role !== 'admin') {
            return errorResponse(res, null, "Unauthorized: You can only access your own data", 403);
        }
        
        const user = await getUserById(id);
        successResponse(res, user, "User fetched successfully");
    } catch (error) {
        errorResponse(res, error, "Error fetching user");
    }
});

// Update user (self or admin)
router.put('/updateUser/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const userData = req.body;
    
    try {
        // Check if user is updating their own data or is an admin
        if (req.user.userId !== id && req.user.role !== 'admin') {
            return errorResponse(res, null, "Unauthorized: You can only update your own data", 403);
        }
        
        // If not admin, prevent role change
        if (req.user.role !== 'admin' && userData.role) {
            delete userData.role;
        }
        
        const user = await updateUser(id, userData);
        successResponse(res, user, "User updated successfully");
    } catch (error) {
        errorResponse(res, error, "Error updating user");
    }
});

// Admin only: Delete user
router.delete('/deleteUser/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await deleteUser(id);
        successResponse(res, result, "User deleted successfully");
    } catch (error) {
        errorResponse(res, error, "Error deleting user");
    }
});

// Sales team route example
router.get('/sales-dashboard', verifyToken, isSalesTeam, async (req, res) => {
    try {
        // Implement sales dashboard logic here
        const dashboardData = {
            // Example data
            totalSales: 1000,
            monthlySales: 250,
            recentSales: []
        };
        
        successResponse(res, dashboardData, "Sales dashboard data fetched successfully");
    } catch (error) {
        errorResponse(res, error, "Error fetching sales dashboard");
    }
});

module.exports = router;