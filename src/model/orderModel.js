const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    amount: { type: String, required: true },
    orderBy: { type: String },
    orderItems: [],
    paid: { type: Boolean, default: false },
    total: Number,
    shippingCost: Number,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
