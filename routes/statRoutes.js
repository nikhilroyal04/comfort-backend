 const express = require('express');
 const router = express.Router();
 const statServices = require('../services/statServices');
 const { successResponse, errorResponse } = require("../utils/responseManager");

 router.get('/', async (req, res) => {
    try {
        const stats = await statServices.getAllCollectionCounts();
        successResponse(res, stats, "Stats fetched successfully", 200);
    } catch (error) {
        errorResponse(res, error, "Failed to fetch stats");
    }
 });
 module.exports = router;