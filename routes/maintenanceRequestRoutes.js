const express = require("express");
const { 
  createMaintenanceRequest, 
  getMaintenanceRequests, 
  getMaintenanceRequestById, 
  updateMaintenanceRequest, 
  deleteMaintenanceRequest 
} = require("../services/maintenanceRequestService");
const { successResponse, errorResponse } = require("../utils/responseManager");

const router = express.Router();

// Create a new maintenance request
router.post("/newMaintenanceRequest", async (req, res) => {
  try {
    const maintenanceRequestData = req.body;
    const newMaintenanceRequest = await createMaintenanceRequest(maintenanceRequestData);
    successResponse(res, newMaintenanceRequest, "Maintenance request created successfully", 201);
  } catch (error) {
    errorResponse(res, error, "Error creating maintenance request");
  }
});

// Get all maintenance requests
router.get("/getAllMaintenanceRequests", async (req, res) => {
  try {
    const maintenanceRequests = await getMaintenanceRequests();
    successResponse(res, maintenanceRequests, "Maintenance requests fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Error fetching maintenance requests");
  }
});

// Get a single maintenance request by ID
router.get("/getMaintenanceRequestById/:id", async (req, res) => {
  try {
    const maintenanceRequestId = req.params.id;
    const maintenanceRequest = await getMaintenanceRequestById(maintenanceRequestId);
    successResponse(res, maintenanceRequest, "Maintenance request fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Maintenance request not found", 404);
  }
});

// Update maintenance request data
router.put("/updateMaintenanceRequest/:id", async (req, res) => {
  try {
    const maintenanceRequestId = req.params.id;
    const maintenanceRequestData = req.body;
    const updatedMaintenanceRequest = await updateMaintenanceRequest(maintenanceRequestId, maintenanceRequestData);
    successResponse(res, updatedMaintenanceRequest, "Maintenance request updated successfully");
  } catch (error) {
    errorResponse(res, error, "Error updating maintenance request");
  }
});

// Delete a maintenance request
router.delete("/deleteMaintenanceRequest/:id", async (req, res) => {
  try {
    const maintenanceRequestId = req.params.id;
    const result = await deleteMaintenanceRequest(maintenanceRequestId);
    successResponse(res, result, "Maintenance request deleted successfully");
  } catch (error) {
    errorResponse(res, error, "Error deleting maintenance request");
  }
});

module.exports = router;
