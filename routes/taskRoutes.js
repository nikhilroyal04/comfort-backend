const express = require("express");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  bulkAssignTasks,
  getTasksByUserId
} = require("../services/taskServices");
const { successResponse, errorResponse } = require("../utils/responseManager");

const router = express.Router();

// Create a new task
router.post("/newTask", async (req, res) => {
  try {
    const taskData = req.body;
    const newTask = await createTask(taskData);
    successResponse(res, newTask, "Task created successfully", 201);
  } catch (error) {
    errorResponse(res, error, "Error creating task");
  }
});

// Get all tasks
router.get("/getAllTasks", async (req, res) => {
  try {
    const tasks = await getTasks();
    successResponse(res, tasks, "Tasks fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Error fetching tasks");
  }
});

// Get a single task by ID
router.get("/getTaskById/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await getTaskById(taskId);
    successResponse(res, task, "Task fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Task not found", 404);
  }
});

// Get tasks by user ID
router.get("/getTasksByUserId/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const tasks = await getTasksByUserId(userId);
    successResponse(res, tasks, "Tasks fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Error fetching tasks");
  }
});



// Update task data
router.put("/updateTask/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const taskData = req.body;
    const updatedTask = await updateTask(taskId, taskData);
    successResponse(res, updatedTask, "Task updated successfully");
  } catch (error) {
    errorResponse(res, error, "Error updating task");
  }
});

// Delete a task
router.delete("/deleteTask/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const result = await deleteTask(taskId);
    successResponse(res, result, "Task deleted successfully");
  } catch (error) {
    errorResponse(res, error, "Error deleting task");
  }
});

// Assign a task to a user
router.post("/assignTask", async (req, res) => {
  try {
    const { taskId, userId } = req.body;
    const result = await assignTask(taskId, userId);
    successResponse(res, result, "Task assigned successfully");
  } catch (error) {
    errorResponse(res, error, "Error assigning task");
  }
});

// Bulk assign tasks to a user
router.post("/bulkAssignTasks", async (req, res) => {
  try {
    const { taskIds, userId } = req.body;
    const result = await bulkAssignTasks(taskIds, userId);
    successResponse(res, result, "Tasks bulk assigned successfully");
  } catch (error) {
    errorResponse(res, error, "Error bulk assigning tasks");
  }
});

module.exports = router;
