import userModel from "../Models/UserModel.js";

const addToCart = async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const userId = req.user.id;

    // Skip cart for admin users
    if (userId === "admin") {
      return res.json({ success: true, message: "Added to cart" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};

    if (!cartData[itemId]) cartData[itemId] = {};
    cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;

    await userModel.findByIdAndUpdate(userId, { cartData });
    return res.json({ success: true, message: "Added to cart" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const { itemId, size, quantity } = req.body;
    const userId = req.user.id;

    // Skip cart for admin users
    if (userId === "admin") {
      return res.json({ success: true, cartData: {}, message: "Updated cart" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let cartData = userData.cartData || {};
    if (!cartData[itemId]) cartData[itemId] = {};
    cartData[itemId][size] = quantity;

    await userModel.findByIdAndUpdate(userId, { cartData });
    return res.json({ success: true, cartData, message: "Updated cart" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Skip cart for admin users
    if (userId === "admin") {
      return res.json({ success: true, cartData: {} });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const cartData = userData.cartData || {};
    return res.json({ success: true, cartData });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const setCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartData } = req.body;

    if (!cartData || typeof cartData !== "object") {
      return res.status(400).json({ success: false, message: "Invalid cart data" });
    }

    // Skip cart for admin users
    if (userId === "admin") {
      return res.json({ success: true, message: "Cart saved", cartData });
    }

    await userModel.findByIdAndUpdate(userId, { cartData });
    return res.json({ success: true, message: "Cart saved", cartData });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export { addToCart, updateCart, getUserCart, setCart };
