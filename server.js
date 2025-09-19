const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const connectDB = require("./db");
const User = require("./models/User");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to the database immediately
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
const machineRoutes = require("./routes/machineRoutes");
app.use("/api/machines", machineRoutes);

// Login route
app.post("/api/login", async (req, res) => {
  const { username, password, role } = req.body;
  console.log("Login attempt:", { username, password, role });

  const user = await User.findOne({ username });
  if (!user) {
    console.log("❌ User not found");
    return res.status(401).send({ message: "Invalid credentials" });
  }

  if (user.role.toLowerCase() !== role.toLowerCase()) {
    console.log("❌ Role mismatch");
    return res.status(401).send({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log("❌ Invalid password");
    return res.status(401).send({ message: "Invalid credentials" });
  }

  console.log("✅ Login successful");
  res.send({ message: "Login successful", role: user.role });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
//final fix 