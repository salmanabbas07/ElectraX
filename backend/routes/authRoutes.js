import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User, { normalizeUser } from "../models/User.js";
import { error } from "console";

const router = express.Router();


let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "electrax_secret_key", {
    expiresIn: "30d",
  });
};

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone, street, city, state, zipcode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address: { street, city, state, zipcode },
    });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: normalizeUser(user),
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: normalizeUser(user),
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none"

  });
  res.json({ message: "Logged out successfully" });
});



// forget password request
router.post("/forget-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist." });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    // 15 min limit
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const mailOption = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset Request - ElectraX",
      html: ` 
        <p>You requested a password reset from ElectraX.</p>
        <p>Please click on the following link to reset your password (valid for 15 minutes):</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>If you did not request this, please ignore this email.</p>
      `
    };

    await getTransporter().sendMail(mailOption);

    res.json({ message: "Email sent successfully with reset link." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Something went wrong. Try again.", error: err.message });
  }
});

// Reset password action
router.put("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful. You can log in now." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Failed to reset password. Try again.", error: err.message });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "electrax_secret_key");
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: normalizeUser(user) });
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
});

export default router;
