// server.js (ESM version)
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// ===== Load Environment Variables =====
dotenv.config();

// ===== Initialize Express App =====
const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== MongoDB Connection =====
// Make sure you have MONGO_URI in your .env file like:
// MONGO_URI="mongodb+srv://<username>:<password>@primepicks254.ra2oejf.mongodb.net/database-primepicks?retryWrites=true&w=majority"
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== Prediction Schema =====
const predictionSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    time: { type: String, required: true },
    match: { type: String, required: true },
    prediction: { type: String, required: true },
    odds: { type: String, required: true },
  },
  { timestamps: true }
);

// The model automatically maps to the 'predictions' collection in your database
const Prediction = mongoose.model("Prediction", predictionSchema, "predictions");

// ===== Root Route (Health Check) =====
app.get("/", (req, res) => {
  res.send("✅ Admin backend is running! Use /predictions or /admin/login");
});

// ===== Admin Login =====
app.post("/admin/login", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res
      .status(400)
      .json({ success: false, message: "Password required" });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    return res.json({ success: true });
  } else {
    return res.json({ success: false, message: "Incorrect password" });
  }
});

// ===== CRUD Endpoints =====

// Get all predictions
app.get("/predictions", async (req, res) => {
  try {
    const bets = await Prediction.find().sort({ createdAt: -1 });
    res.json(bets);
  } catch (err) {
    console.error("❌ Error fetching predictions:", err);
    res.status(500).json({ message: "Server error fetching predictions" });
  }
});

// Add a new prediction
app.post("/predictions", async (req, res) => {
  try {
    const { date, time, match, prediction, odds } = req.body;

    if (!date || !time || !match || !prediction || !odds) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newBet = new Prediction({ date, time, match, prediction, odds });
    await newBet.save();

    res.json({ message: "Prediction added successfully", newBet });
  } catch (err) {
    console.error("❌ Error adding prediction:", err);
    res.status(500).json({ message: "Server error adding prediction" });
  }
});

// Delete a prediction
app.delete("/predictions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Prediction.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Prediction not found" });
    }

    res.json({ message: "Prediction deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting prediction:", err);
    res.status(500).json({ message: "Server error deleting prediction" });
  }
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
