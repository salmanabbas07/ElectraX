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

function buildBrandImagePools(products) {
  const brandPools = new Map();
  const categoryPools = new Map();
  const allImages = new Set();

  for (const product of products) {
    const urls = [product.image, ...(product.gallery || [])].filter(Boolean);
    urls.forEach((url) => {
      const baseUrl = url.split("?")[0];
      allImages.add(baseUrl);

      if (!brandPools.has(product.brand)) {
        brandPools.set(product.brand, new Set());
      }
      brandPools.get(product.brand).add(baseUrl);

      if (!categoryPools.has(product.category)) {
        categoryPools.set(product.category, new Set());
      }
      categoryPools.get(product.category).add(baseUrl);
    });
  }

  const toArray = (map) => {
    const result = new Map();
    map.forEach((imageSet, key) => {
      result.set(key, Array.from(imageSet));
    });
    return result;
  };

  return {
    brandPools: toArray(brandPools),
    categoryPools: toArray(categoryPools),
    allImages: Array.from(allImages),
  };
}

function pickImageForProduct(
  brandPools,
  categoryPools,
  allImages,
  product,
  slot,
) {
  const brandPool = brandPools.get(product.brand);
  const categoryPool = categoryPools.get(product.category);

  const hash = (product.id * 31 + slot * 17) % 2147483647;

  if (brandPool && brandPool.length > 0) {
    const index = Math.abs(hash) % brandPool.length;
    return brandPool[index];
  }

  if (categoryPool && categoryPool.length > 0) {
    const index = Math.abs(hash) % categoryPool.length;
    return categoryPool[index];
  }

  const index = Math.abs(hash) % allImages.length;
  return allImages[index];
}

async function updateProductImages() {
  await mongoose.connect(process.env.MONGO_URI);

  const products = await Product.find().sort({ id: 1 });

  if (products.length !== EXPECTED_PRODUCT_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_PRODUCT_COUNT} products, found ${products.length}. Aborting image update.`,
    );
  }

  const { brandPools, categoryPools, allImages } =
    buildBrandImagePools(products);
  const operations = [];

  for (const product of products) {
    const image = pickImageForProduct(
      brandPools,
      categoryPools,
      allImages,
      product,
      0,
    );
    const signedImage = addImageSignature(image, product.id, "main");

    const gallery = [1, 2, 3].map((slot) =>
      addImageSignature(
        pickImageForProduct(
          brandPools,
          categoryPools,
          allImages,
          product,
          slot,
        ),
        product.id,
        slot,
      ),
    );

    operations.push({
      updateOne: {
        filter: { _id: product._id },
        update: { $set: { image: signedImage, gallery } },
      },
    });
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
