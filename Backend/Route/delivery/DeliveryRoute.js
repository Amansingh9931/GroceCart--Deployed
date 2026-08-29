import express from "express";
import {
  getAvailableOrders,
  acceptOrder,
  getActiveDelivery,
  markOutForDelivery,
  markDelivered,
  getDeliveryHistory,
  getEarnings,
  rejectOrder,
} from "../../Controllers/deliveryController.js";
import { userAuth } from "../../Middleware/Auth.js";

const router = express.Router();

// Delivery routes (all require authentication)
router.get("/available-orders", userAuth, getAvailableOrders);
router.post("/accept-order", userAuth, acceptOrder);
router.post("/reject-order", userAuth, rejectOrder);
router.get("/active-delivery", userAuth, getActiveDelivery);
router.post("/mark-out-for-delivery", userAuth, markOutForDelivery);
router.post("/mark-delivered", userAuth, markDelivered);
router.get("/history", userAuth, getDeliveryHistory);
router.get("/earnings", userAuth, getEarnings);

export default router;
