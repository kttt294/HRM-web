const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler.js");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 5001;
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const { apiLimiter } = require("./middleware/rateLimiter");

// Middleware
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "30kb" }));

app.use("/api", apiLimiter); // Áp dụng rate limit cho toàn bộ API

morgan.token("date", (req, res, tz) => {
  const date = new Date();
  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false
  });
});
const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const accessLogStream = fs.createWriteStream(path.join(logDirectory, "access.log"), { flags: "a" });
app.use(morgan(':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', { stream: accessLogStream }));
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

// Import routes
const authRoutes = require("./routes/auth.routes.js");
const employeeRoutes = require("./routes/employee.routes.js");
const salaryRoutes = require("./routes/salary.routes.js");
const vacancyRoutes = require("./routes/vacancy.routes.js");
const candidateRoutes = require("./routes/candidate.routes.js");
const interviewRoutes = require("./routes/interview.routes.js");
const leaveRoutes = require("./routes/leave.routes.js");
const departmentRoutes = require("./routes/department.routes.js");
const userRoutes = require("./routes/user.routes.js");
const jobTitleRoutes = require("./routes/jobTitle.routes.js");
const chatbotRoutes = require("./routes/chatbot.routes.js");

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
app.use("/api/job-titles", jobTitleRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`---->>> Server đang chạy tại http://localhost:${PORT}`);
});
