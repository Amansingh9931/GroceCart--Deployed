import express from "express";
import { listProduct, singleProduct } from "../../Controllers/productController.js";

const router = express.Router();

// Public product listing used by frontend
router.get("/list", listProduct);

// Single product by id
router.get("/:id", singleProduct);

export default router;
