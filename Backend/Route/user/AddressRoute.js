import express from "express";
import Auth from "../../Middleware/Auth.js";
import {
  addAddress,
  getUserAddresses,
  getDefaultAddress,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../Controllers/addressController.js";

const router = express.Router();

// CREATE new address
router.post("/add", Auth, addAddress);

// GET all addresses for user
router.get("/all", Auth, getUserAddresses);

// GET default address
router.get("/default", Auth, getDefaultAddress);

// GET specific address by ID
router.get("/:addressId", Auth, getAddressById);

// UPDATE address
router.put("/:addressId", Auth, updateAddress);

// DELETE address
router.delete("/:addressId", Auth, deleteAddress);

// SET as default address
router.post("/:addressId/set-default", Auth, setDefaultAddress);

export default router;
