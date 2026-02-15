const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();
const app = express();
const PORT = process.env.SERVER_PORT;
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

// Middleware
app.use(helmet());

// Tạo thư mục logs nếu chưa tồn tại
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Tạo token date theo giờ Việt Nam
morgan.token("date", (req, res, tz) => {
  const date = new Date();
  // Sửa lại format để hiển thị giờ địa phương (dễ đọc hơn)
  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false
  });
});

// Ghi log vào file access.log
const accessLogStream = fs.createWriteStream(path.join(logsDir, "access.log"), { flags: "a" });
// Sử dụng format custom thay vì 'combined' mặc định để dùng token date mới
app.use(morgan(':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', { stream: accessLogStream }));
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  }),
);
app.use(express.json());

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
