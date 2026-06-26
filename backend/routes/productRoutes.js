import express from "express";
import mongoose from "mongoose";
import Product, { normalizeProduct } from "../models/Product.js";

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

export default router;
