import express from "express";
import Auth from "../../Middleware/adminAuth.js";
import upload from "../../Middleware/multer.js";
import { addProduct, editProduct, deleteProduct, listProduct, singleProduct } from "../../Controllers/productController.js";

const adminProductRouter = express.Router();

// list all products
adminProductRouter.get("/", Auth, listProduct);

// get single product
adminProductRouter.get("/:id", Auth, singleProduct);

// add product (multiple named image fields)
adminProductRouter.post(
  "/add",
  Auth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addProduct
);

// edit product (supports additional images)
adminProductRouter.put("/edit/:id", Auth, upload.array("images", 5), editProduct);

// delete product by id
adminProductRouter.delete("/delete/:id", Auth, deleteProduct);

export default adminProductRouter;
