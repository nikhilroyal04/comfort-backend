const express = require('express');
const router = express.Router();
const { createProtectionPlan, getProtectionPlans, getProtectionPlanById, updateProtectionPlan, deleteProtectionPlan } = require('../services/protectionServices');
const { successResponse, errorResponse } = require('../utils/responseManager');


router.post('/createProtectionPlan', async (req, res) => {
    try {
        const protectionPlan = await createProtectionPlan(req.body);
        successResponse(res, protectionPlan, "Protection plan created successfully");
    } catch (error) {
        errorResponse(res, error, "Error creating protection plan");
    }
}); 

router.get('/getProtectionPlans', async (req, res) => {
    try {
        const protectionPlans = await getProtectionPlans();
        successResponse(res, protectionPlans, "Protection plans fetched successfully");
    } catch (error) {
        errorResponse(res, error, "Error fetching protection plans");
    }
});

router.get('/getProtectionPlanById/:id', async (req, res) => {
    try {
        const protectionPlan = await getProtectionPlanById(req.params.id);
        successResponse(res, protectionPlan, "Protection plan fetched successfully");
    } catch (error) {
        errorResponse(res, error, "Error fetching protection plan");
    }
});

router.put('/updateProtectionPlan/:id', async (req, res) => {
    try {
        const protectionPlan = await updateProtectionPlan(req.params.id, req.body);
        successResponse(res, protectionPlan, "Protection plan updated successfully");
    } catch (error) {
        errorResponse(res, error, "Error updating protection plan");
    }
}); 

router.delete('/deleteProtectionPlan/:id', async (req, res) => {
    try {
        const protectionPlan = await deleteProtectionPlan(req.params.id);
        successResponse(res, protectionPlan, "Protection plan deleted successfully");
    } catch (error) {
        errorResponse(res, error, "Error deleting protection plan");
    }
});

module.exports = router;    