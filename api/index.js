const express = require("express");
const bodyParser = require("body-parser");
const { notFoundResponse } = require("../utils/responseManager");
const cors = require("cors");

// Routes
const leadRoutes = require("../routes/leadRoutes");
const maintenanceRoutes = require("../routes/maintenanceRoutes");
const categoryRoutes = require("../routes/categoryRoutes");
const productRoutes = require("../routes/productRoutes");

const app = express();
const port = process.env.PORT || 3901;

app.get("/", (req, res) => {
  res.send("Welcome to the comfort way ");
});

app.use(cors());

// Middleware
app.use(bodyParser.json()); // to parse JSON request bodies


// User routes
app.use("/v1/leads", leadRoutes);
app.use("/v1/maintenances", maintenanceRoutes);
app.use("/v1/categories", categoryRoutes);
app.use("/v1/products", productRoutes);

// Catch all route for 404 (route not found)
app.use((req, res) => {
  notFoundResponse(res, "Route not found");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Export the serverless function
module.exports = app;