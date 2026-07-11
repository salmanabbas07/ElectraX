import express from "express";
import mongoose from "mongoose";
import Product, { normalizeProduct } from "../models/Product.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().lean(false);
    res.json(products.map(normalizeProduct));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { id: Number(id) };

    const product = await Product.findOne(query);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(normalizeProduct(product));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

router.post("/", protect, admin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(normalizeProduct(product));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create product", error: error.message });
  }
});

router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { id: Number(id) };

    const product = await Product.findOneAndUpdate(query, req.body, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(normalizeProduct(product));
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update product", error: error.message });
  }
});

router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { id: Number(id) };

    const product = await Product.findOneAndDelete(query);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
});

export default router;
