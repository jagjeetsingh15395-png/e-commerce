const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const connectDB = require("./db/db");
const cookieParser = require("cookie-parser");

const adminLoginRoutes = require("./routes/admin.login.routes");
const adminProjectRoutes = require("./routes/admin.project.routes");
const adminBlogRoutes = require("./routes/admin.blog.routes");
const adminUpdateProfileRoutes = require("./routes/admin.updateprofile.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// Manual CORS middleware - handles preflight and credentials
// Allow common development ports (3000-3005, 5173 for Vite, etc.)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
  "http://127.0.0.1:5173",
  "http://192.168.1.10:3000",
];
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Set CORS headers for all responses
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else if (!origin) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  // Always set these headers
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Expose-Headers", "Content-Type, Authorization");

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
connectDB();

app.use("/api/admin", adminLoginRoutes);
app.use("/api/admin", adminProjectRoutes);
app.use("/api/admin", adminBlogRoutes);
app.use("/api/admin", adminUpdateProfileRoutes);
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

const PORT = process.env.PORT || 6000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
