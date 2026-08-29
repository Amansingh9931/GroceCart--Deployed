import express from "express";
import Auth from "../../Middleware/Auth.js";
import { addToCart, updateCart, getUserCart, setCart } from "../../Controllers/cartController.js";

const router = express.Router();

router.post("/add", Auth, addToCart);
router.post("/update", Auth, updateCart);
router.post("/get", Auth, getUserCart);
router.post("/set", Auth, setCart);

export default router;
