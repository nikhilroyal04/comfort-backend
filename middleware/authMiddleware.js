const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseManager');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    try {
        // Get the token from the request headers
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, null, "No token provided", 401);
        }

        const token = authHeader.split(' ')[1];
        
        // Verify the token
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return errorResponse(res, err, "Invalid token", 401);
            }
            
            // Check if two-factor authentication is verified
            if (!decoded.twoFactorVerified) {
                return errorResponse(res, null, "Two-factor authentication required", 401);
            }
            
            // Add the decoded token to the request object
            req.user = decoded;
            next();
        });
    } catch (error) {
        return errorResponse(res, error, "Authentication failed", 401);
    }
};

module.exports = { verifyToken }; 