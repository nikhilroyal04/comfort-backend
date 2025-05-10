const express = require("express");
const {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole
} = require("../services/roleServices");
const { successResponse, errorResponse } = require("../utils/responseManager");

const router = express.Router();

// Create a new role
router.post("/newRole", async (req, res) => {
  try {
    const roleData = req.body;
    const newRole = await createRole(roleData);
    successResponse(res, newRole, "Role created successfully", 201);
  } catch (error) {
    errorResponse(res, error, "Error creating role");
  }
});

// Get all roles
router.get("/getAllRoles", async (req, res) => {
  try {
    const roles = await getRoles();
    successResponse(res, roles, "Roles fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Error fetching roles");
  }
});

// Get a single role by ID
router.get("/getRoleById/:id", async (req, res) => {
  try {
    const roleId = req.params.id;
    const role = await getRoleById(roleId);
    successResponse(res, role, "Role fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Role not found", 404);
  }
});

// Update role data
router.put("/updateRole/:id", async (req, res) => {
  try {
    const roleId = req.params.id;
    const roleData = req.body;
    const updatedRole = await updateRole(roleId, roleData);
    successResponse(res, updatedRole, "Role updated successfully");
  } catch (error) {
    errorResponse(res, error, "Error updating role");
  }
});

// Delete a role
router.delete("/deleteRole/:id", async (req, res) => {
  try {
    const roleId = req.params.id;
    const result = await deleteRole(roleId);
    successResponse(res, result, "Role deleted successfully");
  } catch (error) {
    errorResponse(res, error, "Error deleting role");
  }
});

module.exports = router;
