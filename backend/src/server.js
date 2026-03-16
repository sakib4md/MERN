require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const loggerMiddleware = require("./middleware/loggerMiddleware");
const errorHandler = require("./middleware/errorMiddleware");
const userRoutes = require("./routes/userRoutes");
const morgan = require("morgan");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

app.use(morgan("dev"));

// ================= DATABASE =================
connectDB();

// ================= ROUTES =================
app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 API is running..." });
});

app.use("/api/users", userRoutes);

// ================= GLOBAL ERROR HANDLER =================
// Must be AFTER all routes
app.use(errorHandler);

// ================= SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
