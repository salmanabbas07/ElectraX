import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: String,
        image: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipcode: String,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

function normalizeOrder(doc) {
  const order = doc.toObject();
  return {
    ...order,
    _id: order._id.toString(),
    user: order.user?.toString(),
    products: order.products.map((p) => ({
      ...p,
      product: p.product?.toString(),
    })),
  };
}

export { normalizeOrder };
export default mongoose.model("Order", orderSchema);
