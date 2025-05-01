const express = require("express");
const { 
  createMaintenance, 
  getMaintenances, 
  getMaintenanceById, 
  updateMaintenance, 
  deleteMaintenance 
} = require("../services/maintenanceServices");
const { successResponse, errorResponse } = require("../utils/responseManager");

const router = express.Router();

// Create a new maintenance
router.post("/newRequest", async (req, res) => {
  try {
    const maintenanceData = req.body;
    const newMaintenance = await createMaintenance(maintenanceData);
    successResponse(res, newMaintenance, "Maintenance created successfully", 201);
  } catch (error) {
    errorResponse(res, error, "Error creating maintenance");
  }
});

// Get all maintenances
router.get("/getAllRequests", async (req, res) => {
  try {
    const maintenances = await getMaintenances();
    successResponse(res, maintenances, "Maintenances fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Error fetching maintenances");
  }
});

// Get a single maintenance by ID
router.get("/getRequestById/:id", async (req, res) => {
  try {
    const maintenanceId = req.params.id;
    const maintenance = await getMaintenanceById(maintenanceId);
    successResponse(res, maintenance, "Maintenance fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Maintenance not found", 404);
  }
});

// Update maintenance data
router.put("/updateRequest/:id", async (req, res) => {
  try {
    const maintenanceId = req.params.id;
    const maintenanceData = req.body;
    const updatedMaintenance = await updateMaintenance(maintenanceId, maintenanceData);
    successResponse(res, updatedMaintenance, "Maintenance updated successfully");
  } catch (error) {
    errorResponse(res, error, "Error updating maintenance");
  }
});

// Delete a maintenance
router.delete("/deleteRequest/:id", async (req, res) => {
  try {
    const maintenanceId = req.params.id;
    const result = await deleteMaintenance(maintenanceId);
    successResponse(res, result, "Maintenance deleted successfully");
  } catch (error) {
    errorResponse(res, error, "Error deleting maintenance");
  }
});

module.exports = router;
