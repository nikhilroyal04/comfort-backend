const express = require("express");
const { 
  createService, 
  getServices, 
  getServiceById, 
  updateService, 
  deleteService 
} = require("../services/serviceServices");
const { successResponse, errorResponse } = require("../utils/responseManager");
const { uploadFile, upload } = require("../controllers/imageController");

const router = express.Router();

// Create a new service
router.post("/newService", upload.single('media'), async (req, res) => {
  try {
    const serviceData = req.body;

    // If a media file is uploaded, handle the file upload via uploadFile
    if (req.file) {
      const uploadedMedia = await uploadFile(req.file);
      if (uploadedMedia.img) {
        serviceData.img = uploadedMedia.img; // Image URL
      }
    }

    const newService = await createService(serviceData);
    successResponse(res, newService, "Service created successfully", 201);
  } catch (error) {
    errorResponse(res, error, "Error creating service");
  }
});

// Get all services
router.get("/getAllServices", async (req, res) => {
  try {
    const services = await getServices();
    successResponse(res, services, "Services fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Error fetching services");
  }
});

// Get a single service by ID
router.get("/getServiceById/:id", async (req, res) => {
  try {
    const serviceId = req.params.id;
    const service = await getServiceById(serviceId);
    successResponse(res, service, "Service fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Service not found", 404);
  }
});

// Update service data
router.put("/updateService/:id", upload.single('media'), async (req, res) => {
  try {
    const serviceId = req.params.id;
    const serviceData = req.body;

    // If a new media file is uploaded, handle the file upload via uploadFile
    if (req.file) {
      const uploadedMedia = await uploadFile(req.file);
      if (uploadedMedia.img) {
        serviceData.img = uploadedMedia.img; // Image URL
      }
    }

    const updatedService = await updateService(serviceId, serviceData);
    successResponse(res, updatedService, "Service updated successfully");
  } catch (error) {
    errorResponse(res, error, "Error updating service");
  }
});

// Delete a service
router.delete("/deleteService/:id", async (req, res) => {
  try {
    const serviceId = req.params.id;
    const result = await deleteService(serviceId);
    successResponse(res, result, "Service deleted successfully");
  } catch (error) {
    errorResponse(res, error, "Error deleting service");
  }
});

module.exports = router;
