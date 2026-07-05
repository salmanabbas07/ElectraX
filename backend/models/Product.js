import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: Number,
    title: String,
    brand: String,
    category: String,
    description: String,
    price: Number,
    oldPrice: Number,
    rating: Number,
    discount: String,
    image: String,
    gallery: [String],
    specs: [String],
    reviews: [mongoose.Schema.Types.Mixed],
  },
  {
    strict: false,
    timestamps: true,
    versionKey: false,
  },
);

function normalizeProduct(doc) {
  const product = doc.toObject({ virtuals: false });

  return {
    ...product,
    _id: product._id.toString(),
    id: product.id ?? product._id.toString(),
  };
}

export { normalizeProduct };
export default mongoose.model("Product", productSchema);
