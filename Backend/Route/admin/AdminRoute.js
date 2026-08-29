import express from "express";
import adminProductRouter from "./AdminProductRoute.js";
import Auth from "../../Middleware/adminAuth.js";
import { getUsersByRole, getUserDetails, getAdminStats, changeUserStatus } from "../../Controllers/userController.js";
import { allOrders, updateStatus } from "../../Controllers/orderController.js";
import orderModel from "../../Models/OrderModel.js";
import AddressModel from "../../Models/AddressModel.js";
import mongoose from "mongoose";

const adminRouter = express.Router();

// Mount admin product routes under /products
adminRouter.use("/products", adminProductRouter);

// User Management Routes
adminRouter.get("/stats", Auth, getAdminStats);
adminRouter.get("/users/:role", Auth, getUsersByRole);
adminRouter.get("/user/:userId", Auth, getUserDetails);
adminRouter.post("/users/status", Auth, changeUserStatus);

// Order Management Routes
adminRouter.get("/orders", Auth, allOrders);
adminRouter.post("/orders/update-status", Auth, updateStatus);

// Debug endpoint to check all orders
adminRouter.get("/debug/orders", Auth, async (req, res) => {
  try {
    const allOrdersData = await orderModel.find({}).populate("addressId");
    console.log("[DEBUG] Total orders in DB:", allOrdersData.length);
    console.log("[DEBUG] Orders by status:", {
      pending: allOrdersData.filter(o => o.status === "Pending").length,
      accepted: allOrdersData.filter(o => o.status === "Accepted").length,
      outForDelivery: allOrdersData.filter(o => o.status === "Out for Delivery").length,
      delivered: allOrdersData.filter(o => o.status === "Delivered").length,
    });
    
    res.json({
      success: true,
      totalOrders: allOrdersData.length,
      orders: allOrdersData.map(o => ({
        id: o._id,
        status: o.status,
        amount: o.amount,
        deliveryAgent: o.deliveryAgentName || "Unassigned",
        date: o.date,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Test endpoint to create sample order for delivery testing
adminRouter.post("/test/create-sample-order", Auth, async (req, res) => {
  try {
    // Create a test address
    const testAddress = new AddressModel({
      userId: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"), // Sample user ID
      street: "123 Test Street",
      city: "Test City",
      state: "Test State",
      pinCode: "123456",
      phone: "9999999999",
      firstName: "Test",
      lastName: "User",
    });
    
    await testAddress.save();

    // Create a test order
    const testOrder = new orderModel({
      userId: new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"),
      items: [
        { _id: new mongoose.Types.ObjectId("507f1f77bcf86cd799439012"), name: "Test Product", price: 100, qty: 2 }
      ],
      amount: 200,
      addressId: testAddress._id,
      status: "Pending", // CRITICAL: Must be Pending for available orders
      paymentMethod: "COD",
      payment: false,
      deliveryAgentId: null,
      date: new Date(),
    });

    await testOrder.save();

    res.json({
      success: true,
      message: "Test order created successfully",
      order: {
        id: testOrder._id,
        status: testOrder.status,
        amount: testOrder.amount,
        address: testAddress,
      },
    });
  } catch (err) {
    console.error("[TEST] Error creating sample order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default adminRouter;
