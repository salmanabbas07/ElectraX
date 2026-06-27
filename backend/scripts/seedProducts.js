import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";

dotenv.config();

const EXPECTED_PRODUCT_COUNT = 200;

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is missing. Add it in backend/.env");
}

function addImageSignature(url, productId, slot) {
  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}electrax=${productId}-${slot}`;
}

async function isWorkingImage(url) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(9000),
    });
    const contentType = response.headers.get("content-type") || "";

    return response.ok && contentType.startsWith("image/");
  } catch {
    return false;
  }
}

async function buildVerifiedCategoryPools(products) {
  const pools = new Map();
  const checkedUrls = new Map();

  for (const product of products) {
    const urls = [product.image, ...(product.gallery || [])].filter(Boolean);

    for (const url of urls) {
      if (!checkedUrls.has(url)) {
        checkedUrls.set(url, await isWorkingImage(url));
      }

      if (checkedUrls.get(url)) {
        const categoryPool = pools.get(product.category) || [];

        if (!categoryPool.includes(url)) {
          categoryPool.push(url);
        }

        pools.set(product.category, categoryPool);
      }
    }
  }

  return pools;
}

function pickCategoryImage(pool, productIndex, slot) {
  const poolIndex = (productIndex * 4 + slot) % pool.length;

  return pool[poolIndex];
}

async function updateProductImages() {
  await mongoose.connect(process.env.MONGO_URI);

  const products = await Product.find().sort({ id: 1 });

  if (products.length !== EXPECTED_PRODUCT_COUNT) {
    throw new Error(`Expected ${EXPECTED_PRODUCT_COUNT} products, found ${products.length}. Aborting image update.`);
  }

  const pools = await buildVerifiedCategoryPools(products);
  const categoryPositions = new Map();
  const operations = [];

  for (const product of products) {
    const pool = pools.get(product.category) || [];

    if (pool.length < 4) {
      throw new Error(`Not enough verified images for category "${product.category}". Found ${pool.length}.`);
    }

    const categoryPosition = categoryPositions.get(product.category) || 0;
    const image = addImageSignature(pickCategoryImage(pool, categoryPosition, 0), product.id, "main");
    const gallery = [1, 2, 3].map((slot) => (
      addImageSignature(pickCategoryImage(pool, categoryPosition, slot), product.id, slot)
    ));

    operations.push({
      updateOne: {
        filter: { _id: product._id },
        update: { $set: { image, gallery } },
      },
    });
    categoryPositions.set(product.category, categoryPosition + 1);
  }

  const result = await Product.bulkWrite(operations);

  console.log(
    `Image update complete. Products: ${products.length}, updated: ${result.modifiedCount}`,
  );

  await mongoose.disconnect();
}

updateProductImages().catch(async (error) => {
  console.error("Product image update failed:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
