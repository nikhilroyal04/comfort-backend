const express = require('express');
const router = express.Router();
const { createProductPlan, getProductPlans, getProductPlanById, updateProductPlan, deleteProductPlan } = require('../services/productPlan');
const { successResponse, errorResponse } = require('../utils/responseManager');


router.post('/createProductPlan', async (req, res) => {
    try {
        const productPlan = await createProductPlan(req.body);
        successResponse(res, productPlan, "Product plan created successfully");
    } catch (error) {
        errorResponse(res, error, "Error creating product plan");
    }
}); 

router.get('/getProductPlans', async (req, res) => {
    try {
        const productPlans = await getProductPlans();
        successResponse(res, productPlans, "Product plans fetched successfully");
    } catch (error) {
        errorResponse(res, error, "Error fetching product plans");
    }
});

router.get('/getProductPlanById/:id', async (req, res) => {
    try {
        const productPlan = await getProductPlanById(req.params.id);
        successResponse(res, productPlan, "Product plan fetched successfully");
    } catch (error) {
        errorResponse(res, error, "Error fetching product plan");
    }
});

router.put('/updateProductPlan/:id', async (req, res) => {
    try {
        const productPlan = await updateProductPlan(req.params.id, req.body);
        successResponse(res, productPlan, "Product plan updated successfully");
    } catch (error) {
        errorResponse(res, error, "Error updating product plan");
    }
}); 

router.delete('/deleteProductPlan/:id', async (req, res) => {
    try {
        const productPlan = await deleteProductPlan(req.params.id);
        successResponse(res, productPlan, "Product plan deleted successfully");
    } catch (error) {
        errorResponse(res, error, "Error deleting product plan");
    }
});

module.exports = router;    