const express = require("express");
const bodyParser = require("body-parser");
const { notFoundResponse } = require("../utils/responseManager");
const cors = require("cors");

// Routes
const authRoutes = require("../routes/authRoutes");
const leadRoutes = require("../routes/leadRoutes");
const maintenanceRoutes = require("../routes/maintenanceRoutes");
const categoryRoutes = require("../routes/categoryRoutes");
const productRoutes = require("../routes/productRoutes");
const protectionRoutes = require("../routes/protectionRoutes");
const roleRoutes = require("../routes/roleRoutes")
const taskRoutes = require("../routes/taskRoutes")
const serviceHistoryRoutes = require("../routes/serviceHistoryRoutes")
const serviceRoutes = require("../routes/servicesRoutes")
const purchasedPlanRoutes = require("../routes/purchasedPlanRoutes")
const statRoutes = require("../routes/statRoutes")
const productPlanRoutes = require("../routes/productPlanRoutes")
const app = express();
const port = process.env.PORT || 3901;


app.use(cors({
  origin: ["http://localhost:5173", "https://comfort-way.vercel.app", "https://comfortway.in"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 600,
}));

// Middleware
app.use(bodyParser.json()); // to parse JSON request bodies


app.get("/", (req, res) => {
  res.send("Welcome to the comfort way ");
});

// User routes
app.use("/v1/auth", authRoutes);
app.use("/v1/leads", leadRoutes);
app.use("/v1/maintenances", maintenanceRoutes);
app.use("/v1/categories", categoryRoutes);
app.use("/v1/products", productRoutes);
app.use("/v1/protectionPlans", protectionRoutes);
app.use("/v1/tasks", taskRoutes);
app.use("/v1/roles", roleRoutes);
app.use("/v1/serviceHistory", serviceHistoryRoutes);
app.use("/v1/purchasedPlans", purchasedPlanRoutes);
app.use("/v1/stats", statRoutes);
app.use("/v1/services", serviceRoutes);
app.use("/v1/productPlans", productPlanRoutes);

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