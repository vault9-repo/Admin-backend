// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// ===== Load Environment Variables =====
dotenv.config(); // Make sure you have a .env file with MONGO_URI

// ===== Initialize Express App =====
const app = express();
app.use(cors());
app.use(express.json());

// ===== MongoDB Connection =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== Mongoose Schema =====
const predictionSchema = new mongoose.Schema({
  date: String,
  time: String,
  match: String,
  prediction: String,
  odds: String,
}, { timestamps: true });

const Prediction = mongoose.model("Prediction", predictionSchema);

// ===== Admin Password =====
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"; // Set in .env

// ===== Routes =====

// Admin Login
app.post("/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, message: "Login successful" });
  } else {
    return res.json({ success: false, message: "Invalid password" });
  }
});

// Get all predictions
app.get("/predictions", async (req, res) => {
  try {
    const bets = await Prediction.find().sort({ createdAt: -1 });
    res.json(bets);
  } catch (err) {
    console.error("❌ Error fetching predictions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a new prediction
app.post("/predictions", async (req, res) => {
  const { date, time, match, prediction, odds } = req.body;
  if (!date || !time || !match || !prediction || !odds) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newPrediction = new Prediction({ date, time, match, prediction, odds });
    await newPrediction.save();
    res.status(201).json({ message: "Prediction added", prediction: newPrediction });
  } catch (err) {
    console.error("❌ Error adding prediction:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a prediction
app.delete("/predictions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Prediction.findByIdAndDelete(id);
    res.json({ message: "Prediction deleted" });
  } catch (err) {
    console.error("❌ Error deleting prediction:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
