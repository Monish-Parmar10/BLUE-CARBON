const User = require("./models/User");
const connectDB = require("./db");
connectDB();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt"); 
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

 app.use(express.static("public"));

const machineRoutes = require("./routes/machineRoutes");
app.use("/api/machines", machineRoutes);



/// ✅ Login route (move this OUTSIDE app.listen)
// ... (all your other code)

app.post("/api/login", async (req, res) => {
  const { username, password, role } = req.body;
  console.log("Login attempt:", { username, password, role });

  // ✅ Find the user by username ONLY
  const user = await User.findOne({ username });
  if (!user) {
    console.log("❌ User not found");
    return res.status(401).send({ message: "Invalid credentials" });
  }

  // ✅ Check if the provided role matches the user's role in the database
  if (user.role.toLowerCase() !== role.toLowerCase()) {
    console.log("❌ Role mismatch");
    return res.status(401).send({ message: "Invalid credentials" });
  }

  // ✅ Now, compare the password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log("❌ Invalid password");
    return res.status(401).send({ message: "Invalid credentials" });
  }

  console.log("✅ Login successful");
  res.send({ message: "Login successful", role: user.role });
});

// ... (rest of the code)
// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
