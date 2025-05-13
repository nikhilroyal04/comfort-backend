const express = require("express");
const {
  createPurchasedPlan,
  getPurchasedPlans,
  getPurchasedPlanById,
  updatePurchasedPlan,
  deletePurchasedPlan,
} = require("../services/purchasedPlanServices");
const { successResponse, errorResponse } = require("../utils/responseManager");

const router = express.Router();

// Create a new purchased plan
router.post("/newPurchasedPlan", async (req, res) => {
  try {
    const purchasedPlanData = req.body;
    const newPurchasedPlan = await createPurchasedPlan(purchasedPlanData);
    successResponse(res, newPurchasedPlan, "Purchased plan created successfully", 201);
  } catch (error) {
    errorResponse(res, error, "Error creating purchased plan");
  }
});

// Get all purchased plans
router.get("/getAllPurchasedPlans", async (req, res) => {
  try {
    const purchasedPlans = await getPurchasedPlans();
    successResponse(res, purchasedPlans, "Purchased plans fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Error fetching purchased plans");
  }
});

// Get a single purchased plan by ID
router.get("/getPurchasedPlanById/:id", async (req, res) => {
  try {
    const purchasedPlanId = req.params.id;
    const purchasedPlan = await getPurchasedPlanById(purchasedPlanId);
    successResponse(res, purchasedPlan, "Purchased plan fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Purchased plan not found", 404);
  }
});

// Update purchased plan data
router.put("/updatePurchasedPlan/:id", async (req, res) => {
  try {
    const purchasedPlanId = req.params.id;
    const purchasedPlanData = req.body;
    const updatedPurchasedPlan = await updatePurchasedPlan(purchasedPlanId, purchasedPlanData);
    successResponse(res, updatedPurchasedPlan, "Purchased plan updated successfully");
  } catch (error) {
    errorResponse(res, error, "Error updating purchased plan");
  }
});

// Delete a purchased plan
router.delete("/deletePurchasedPlan/:id", async (req, res) => {
  try {
    const purchasedPlanId = req.params.id;
    const result = await deletePurchasedPlan(purchasedPlanId);
    successResponse(res, result, "Purchased plan deleted successfully");
  } catch (error) {
    errorResponse(res, error, "Error deleting purchased plan");
  }
});


module.exports = router;
