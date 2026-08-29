import express from "express";
import Auth from "../../Middleware/Auth.js";
import { placeOrder, userOrders } from "../../Controllers/orderController.js";

const router = express.Router();

router.post("/place", Auth, placeOrder);
router.get("/me", Auth, userOrders);

export default router;
