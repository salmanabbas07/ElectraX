import express from "express";
import User, { normalizeUser } from "../models/User.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users.map(normalizeUser));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(normalizeUser(user));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

router.put("/profile", protect, async (req, res) => {
  try {
    const { name, phone, street, city, state, zipcode } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        phone,
        address: { street, city, state, zipcode },
      },
      { new: true },
    );

    res.json(normalizeUser(user));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update profile", error: error.message });
  }
});

export default router;
