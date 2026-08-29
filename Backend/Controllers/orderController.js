import orderModel from "../Models/OrderModel.js";
import userModel from "../Models/UserModel.js";
import AddressModel from "../Models/AddressModel.js";
import productModel from "../Models/ProductModel.js";

//placing order using cod method
const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, amount, addressId } = req.body;

    console.log("[PlaceOrder] Starting order creation:", { userId, addressId, itemCount: items?.length, amount });

    // Verify address belongs to user
    const address = await AddressModel.findOne({ _id: addressId, userId });
    if (!address) {
      console.log("[PlaceOrder] ❌ Address not found for user:", userId);
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    console.log("[PlaceOrder] ✅ Address verified:", { addressId: address._id, city: address.city });

    const orderData = {
      userId,
      items,
      amount,
      addressId,
      status: "Pending",  // CRITICAL: Explicitly set for delivery system
      paymentMethod: "COD",
      payment: false,
      deliveryAgentId: null,  // Ensure null for available orders
      date: new Date(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Verify order was saved with correct fields
    const savedOrder = await orderModel.findById(newOrder._id).populate("addressId");

    console.log("[PlaceOrder] ✅ Order created successfully:", {
      orderId: savedOrder._id,
      userId: savedOrder.userId,
      addressId: savedOrder.addressId?._id,
      status: savedOrder.status,
      deliveryAgentId: savedOrder.deliveryAgentId,
      amount: savedOrder.amount,
      hasAddress: !!savedOrder.addressId,
    });

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed", orderId: newOrder._id });
  } catch (err) {
    console.log("[PlaceOrder] ❌ Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

//placing order using stripe
const placeOrderStripe = async (req, res) => {};

//placing orders using razorpay method
const placeOrderRazorpay = async (req, res) => {};

// all order data for admin
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).populate("addressId");
    
    // Fetch product images for each item in orders
    const ordersWithImages = await Promise.all(
      orders.map(async (order) => {
        const orderObj = order.toObject();
        
        // Include address data explicitly
        if (order.addressId) {
          orderObj.address = order.addressId;
        }
        
        orderObj.items = await Promise.all(
          orderObj.items.map(async (item) => {
            try {
              const product = await productModel.findById(item._id || item.id);
              return {
                ...item,
                image: product?.imageUrl?.[0] || null,
              };
            } catch (err) {
              return item;
            }
          })
        );
        return orderObj;
      })
    );

    res.json({ success: true, orders: ordersWithImages });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// order data for frontend
const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderModel.find({ userId }).populate("addressId");

    // Fetch product images for each item in orders
    const ordersWithImages = await Promise.all(
      orders.map(async (order) => {
        const orderObj = order.toObject();
        
        // Include address data explicitly
        if (order.addressId) {
          orderObj.address = order.addressId;
        }
        
        orderObj.items = await Promise.all(
          orderObj.items.map(async (item) => {
            try {
              const product = await productModel.findById(item._id || item.id);
              return {
                ...item,
                image: product?.imageUrl?.[0] || null,
              };
            } catch (err) {
              return item;
            }
          })
        );
        return orderObj;
      })
    );

    res.json({ success: true, orders: ordersWithImages });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

//update order status from admin
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

export {
  placeOrder,
  placeOrderRazorpay,
  placeOrderStripe,
  allOrders,
  userOrders,
  updateStatus,
};
