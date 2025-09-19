const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const connectDB = require("./db");
const User = require("./models/User");
const path = require("path");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

// Middleware
// Middleware
app.use(cors({
  origin: "https://monish-parmar10.github.io",  // allow your GitHub Pages site
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
const machineRoutes = require("./routes/machineRoutes");
app.use("/api/machines", machineRoutes);

// Login route
app.post("/api/login", async (req, res) => {
  const { username, password, role } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).send({ message: "Invalid credentials" });
  }

  if (user.role.toLowerCase() !== role.toLowerCase()) {
    return res.status(401).send({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).send({ message: "Invalid credentials" });
  }

  res.send({ message: "Login successful", role: user.role });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});