const express = require("express");
const router = express.Router();
const { createServiceHistory, getServiceHistories, getServiceHistoryById, getServiceHistoriesByUserId, updateServiceHistory, deleteServiceHistory } = require("../services/serviceHistoryServices");
const { successResponse, errorResponse } = require("../utils/responseManager");


router.post("/createServiceHistory", async (req, res) => {
    try {
        const serviceHistoryData = req.body;
        const newServiceHistory = await createServiceHistory(serviceHistoryData);
        successResponse(res, newServiceHistory, "Service history created successfully", 201);
    } catch (error) {
        errorResponse(res, error, "Error creating service history", 500);
    }
}); 

router.get("/getServiceHistories", async (req, res) => {
    try {
        const serviceHistories = await getServiceHistories();
        successResponse(res, serviceHistories, "Service histories fetched successfully", 200);
    } catch (error) {
        errorResponse(res, error, "Error fetching service histories", 500);
    }
}); 

router.get("/getServiceHistoryById/:id", async (req, res) => {
    try {
        const serviceHistoryId = req.params.id;
        const serviceHistory = await getServiceHistoryById(serviceHistoryId);
        successResponse(res, serviceHistory, "Service history fetched successfully", 200);
    } catch (error) {
        errorResponse(res, error, "Error fetching service history", 500);
    }
});         

router.get("/getServiceHistoriesByUserId/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const serviceHistories = await getServiceHistoriesByUserId(userId);
        successResponse(res, serviceHistories, "Service histories fetched successfully", 200);
    } catch (error) {
        errorResponse(res, error, "Error fetching service histories", 500);
    }
}); 


router.put("/updateServiceHistory/:id", async (req, res) => {
    try {
        const serviceHistoryId = req.params.id;
        const serviceHistoryData = req.body;
        const updatedServiceHistory = await updateServiceHistory(serviceHistoryId, serviceHistoryData);
        successResponse(res, updatedServiceHistory, "Service history updated successfully", 200);   
    } catch (error) {
        errorResponse(res, error, "Error updating service history", 500);
    }
});  

router.delete("/deleteServiceHistory/:id", async (req, res) => {
    try {
        const serviceHistoryId = req.params.id;
        const result = await deleteServiceHistory(serviceHistoryId);
        successResponse(res, result, "Service history deleted successfully", 200);
    } catch (error) {       
        errorResponse(res, error, "Error deleting service history", 500);
    }
}); 

module.exports = router;    


    


    
    