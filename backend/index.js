const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();
const PORT = process.env.SERVER_PORT;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "HRM Backend API đang chạy" });
});

// Import routes
const authRoutes = require("./routes/auth.routes");
const employeeRoutes = require("./routes/employee.routes");
const salaryRoutes = require("./routes/salary");
const vacancyRoutes = require("./routes/vacancy");
const candidateRoutes = require("./routes/candidate");
const interviewRoutes = require("./routes/interview");
const leaveRoutes = require("./routes/leave");
const departmentRoutes = require("./routes/department");
const userRoutes = require("./routes/user");

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/recruitment/vacancies", vacancyRoutes);
app.use("/api/recruitment/candidates", candidateRoutes);
app.use("/api/recruitment/interviews", interviewRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/users", userRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`---->>> Server đang chạy tại http://localhost:${PORT}`);
});
