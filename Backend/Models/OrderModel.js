import mongoose, { mongo } from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // ← FIXED: Use ObjectId reference instead of String
    ref: "user",
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "address",
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Pending",
    enum: ["Pending", "Accepted", "Out for Delivery", "Delivered", "Cancelled"],
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  payment: {
    type: Boolean,
    required: true,
    default: false,
  },
  deliveryAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: null,
  },
  deliveryAgentName: {
    type: String,
    default: null,
  },
  acceptedAt: {
    type: Date,
    default: null,
  },
  deliveredAt: {
    type: Date,
    default: null,
  },
  commission: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

const OrderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);
export default OrderModel;
