const express = require("express");
const { 
  createLead, 
  getLeads, 
  getLeadById, 
  updateLead, 
  deleteLead,
  getLeadsByUserId
} = require("../services/leadServices");
const { successResponse, errorResponse } = require("../utils/responseManager");

const router = express.Router();

// Create a new lead
router.post("/newLead", async (req, res) => {
  try {
    const leadData = req.body;
    const newLead = await createLead(leadData);
    successResponse(res, newLead, "Lead created successfully", 201);
  } catch (error) {
    errorResponse(res, error, "Error creating lead");
  }
});

// Get all leads
router.get("/getAllLeads", async (req, res) => {
  try {
    const leads = await getLeads();
    successResponse(res, leads, "Leads fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Error fetching leads");
  }
});

// Get a single lead by ID
router.get("/getLeadById/:id", async (req, res) => {
  try {
    const leadId = req.params.id;
    const lead = await getLeadById(leadId);
    successResponse(res, lead, "Lead fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Lead not found", 404);
  }
});

// Get leads by user ID
router.get("/getLeadsByUserId/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const leads = await getLeadsByUserId(userId); 
    successResponse(res, leads, "Leads fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Error fetching leads");
  }
});

// Update lead data
router.put("/updateLead/:id", async (req, res) => {
  try {
    const leadId = req.params.id;
    const leadData = req.body;
    const updatedLead = await updateLead(leadId, leadData);
    successResponse(res, updatedLead, "Lead updated successfully");
  } catch (error) {
    errorResponse(res, error, "Error updating lead");
  }
});

// Delete a lead
router.delete("/deleteLead/:id", async (req, res) => {
  try {
    const leadId = req.params.id;
    const result = await deleteLead(leadId);
    successResponse(res, result, "Lead deleted successfully");
  } catch (error) {
    errorResponse(res, error, "Error deleting lead");
  }
});

module.exports = router;
