import express from "express";
import Order, { normalizeOrder } from "../models/Order.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { products, shippingAddress, totalAmount } = req.body;

    const order = await Order.create({
      user: req.user._id,
      products,
      shippingAddress,
      totalAmount,
      paymentStatus: "paid",
    });

    res.status(201).json(normalizeOrder(order));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create order", error: error.message });
  }
});

router.get("/", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders.map(normalizeOrder));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders.map(normalizeOrder));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user.role !== "admin" && order.user.toString() !== req.user._id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(normalizeOrder(order));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

router.put("/:id/status", protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(normalizeOrder(order));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update order status", error: error.message });
  }
});

export default router;
