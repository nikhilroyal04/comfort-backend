const express = require("express");
const { 
  createCategory, 
  getCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory 
} = require("../services/categoryServices");
const { successResponse, errorResponse } = require("../utils/responseManager");
const { uploadFile, upload } = require("../controllers/imageController");

const router = express.Router();

// Create a new category
router.post("/newCategory", upload.single('media'), async (req, res) => {
  try {
    const categoryData = req.body;

    // If a media file is uploaded, handle the file upload via uploadFile
    if (req.file) {
      const uploadedMedia = await uploadFile(req.file);
      if (uploadedMedia.categoryImage) {
        categoryData.categoryImage = uploadedMedia.categoryImage; // Image URL
      }
    }

    const newCategory = await createCategory(categoryData);
    successResponse(res, newCategory, "Category created successfully", 201);
  } catch (error) {
    errorResponse(res, error, "Error creating category");
  }
});

// Get all categories
router.get("/getAllCategories", async (req, res) => {
  try {
    const categories = await getCategories();
    successResponse(res, categories, "Categories fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Error fetching categories");
  }
});

// Get a single category by ID
router.get("/getCategoryById/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await getCategoryById(categoryId);
    successResponse(res, category, "Category fetched successfully");
  } catch (error) {
    errorResponse(res, error, "Category not found", 404);
  }
});

// Update category data
router.put("/updateCategory/:id", upload.single('media'), async (req, res) => {
  try {
    const categoryId = req.params.id;
    const categoryData = req.body;

    // If a new media file is uploaded, handle the file upload via uploadFile
    if (req.file) {
      const uploadedMedia = await uploadFile(req.file);
      if (uploadedMedia.categoryImage) {
        categoryData.categoryImage = uploadedMedia.categoryImage; // Image URL
      }
    }

    const updatedCategory = await updateCategory(categoryId, categoryData);
    successResponse(res, updatedCategory, "Category updated successfully");
  } catch (error) {
    errorResponse(res, error, "Error updating category");
  }
});

// Delete a category
router.delete("/deleteCategory/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;
    const result = await deleteCategory(categoryId);
    successResponse(res, result, "Category deleted successfully");
  } catch (error) {
    errorResponse(res, error, "Error deleting category");
  }
});

module.exports = router;
