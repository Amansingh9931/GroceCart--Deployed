import orderModel from "../Models/OrderModel.js";
import userModel from "../Models/UserModel.js";
import AddressModel from "../Models/AddressModel.js";
import productModel from "../Models/ProductModel.js";

// GET ALL AVAILABLE ORDERS (delivery pool)
const getAvailableOrders = async (req, res) => {
  try {
    const deliveryAgentId = req.user.id;

    console.log("[Delivery] 🚀 Fetching available orders for agent:", deliveryAgentId);

    // Get delivery agent's current active order
    const activeOrder = await orderModel.findOne({
      deliveryAgentId,
      status: { $in: ["Accepted", "Out for Delivery"] },
    });

    console.log("[Delivery] Agent active order:", activeOrder?._id || "none");

    // If agent has active order, can't see available orders
    if (activeOrder) {
      return res.json({
        success: true,
        orders: [],
        activeOrder: activeOrder._id,
        message: "Complete current delivery first",
      });
    }

    // Get all pending orders with address details and product images
    const orders = await orderModel
      .find({ status: "Pending", deliveryAgentId: null })
      .populate("addressId")  // Populate address details
      .populate("userId", "name email mobile")  // Populate user name
      .sort({ date: -1 });

    console.log("[Delivery] ✅ Found pending orders:", orders.length);

    // Add product images
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const orderObj = order.toObject();

        // Use populated user data instead of querying again
        orderObj.userName = orderObj.userId?.name || "Unknown";

        // Verify address is populated
        if (!orderObj.addressId) {
          console.log("[Delivery] ⚠️ Order missing address:", order._id);
          return null;
        }

        // Get product images
        orderObj.items = await Promise.all(
          orderObj.items.map(async (item) => {
            try {
              const product = await productModel.findById(item._id || item.id);
              return {
                ...item,
                image: product?.imageUrl?.[0] || null,
                productName: product?.name || item.name,
              };
            } catch (err) {
              return item;
            }
          })
        );

        return orderObj;
      })
    );

    // Filter out null orders (missing address)
    const validOrders = ordersWithDetails.filter(o => o !== null);

    console.log("[Delivery] ✅ Returning orders with details:", validOrders.length);
    res.json({ success: true, orders: validOrders });
  } catch (err) {
    console.log("[Delivery] ❌ Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ACCEPT ORDER (delivery agent takes order)
const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const deliveryAgentId = req.user.id;

    console.log("[AcceptOrder] 🔄 Agent accepting order:", { agentId: deliveryAgentId, orderId });

    // Check if agent already has active delivery
    const activeOrder = await orderModel.findOne({
      deliveryAgentId,
      status: { $in: ["Accepted", "Out for Delivery"] },
    });

    if (activeOrder) {
      console.log("[AcceptOrder] ❌ Agent already has active order:", activeOrder._id);
      return res.status(400).json({
        success: false,
        message: "Complete current delivery first",
      });
    }

    // Get order and agent details
    const order = await orderModel.findById(orderId);
    const agent = await userModel.findById(deliveryAgentId);

    if (!order) {
      console.log("[AcceptOrder] ❌ Order not found:", orderId);
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.deliveryAgentId) {
      console.log("[AcceptOrder] ❌ Order already taken:", { orderId, agentId: order.deliveryAgentId });
      return res.status(400).json({
        success: false,
        message: "Order already accepted by another agent",
      });
    }

    if (order.status !== "Pending") {
      console.log("[AcceptOrder] ❌ Order not pending:", { orderId, status: order.status });
      return res.status(400).json({
        success: false,
        message: "Order is no longer available",
      });
    }

    // Update order
    order.deliveryAgentId = deliveryAgentId;
    order.deliveryAgentName = agent?.name || "Delivery Agent";
    order.status = "Accepted";
    order.acceptedAt = new Date();
    await order.save();

    console.log("[AcceptOrder] ✅ Order accepted successfully:", { orderId, agentName: order.deliveryAgentName });

    res.json({
      success: true,
      message: "Order accepted successfully",
      order: order._id,
    });
  } catch (err) {
    console.log("[AcceptOrder] ❌ Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ACTIVE DELIVERY FOR AGENT
const getActiveDelivery = async (req, res) => {
  try {
    const deliveryAgentId = req.user.id;

    const order = await orderModel
      .findOne({
        deliveryAgentId,
        status: { $in: ["Accepted", "Out for Delivery"] },
      })
      .populate("addressId")
      .populate("userId", "name email mobile");  // Populate user data

    if (!order) {
      return res.json({ success: true, order: null });
    }

    // ❗ Check mapDetails
    if (
      !order.addressId ||
      !order.addressId.mapDetails ||
      !order.addressId.mapDetails.latitude ||
      !order.addressId.mapDetails.longitude
    ) {
      return res.json({
        success: false,
        message: "Address location not available",
      });
    }

    const orderObj = order.toObject();

    // Use populated user data
    orderObj.user = {
      name: orderObj.userId?.name,
      email: orderObj.userId?.email,
      phone: orderObj.userId?.mobile,
    };

    // Get product details with images
    orderObj.items = await Promise.all(
      orderObj.items.map(async (item) => {
        try {
          const product = await productModel.findById(item._id || item.id);
          return {
            ...item,
            image: product?.imageUrl?.[0] || null,
            productName: product?.name || item.name,
          };
        } catch (err) {
          return item;
        }
      })
    );

    res.json({ success: true, order: orderObj });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// MARK ORDER AS OUT FOR DELIVERY
const markOutForDelivery = async (req, res) => {
  try {
    const { orderId } = req.body;
    const deliveryAgentId = req.user.id;

    const order = await orderModel.findById(orderId);

    if (!order || order.deliveryAgentId.toString() !== deliveryAgentId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    order.status = "Out for Delivery";
    await order.save();

    res.json({
      success: true,
      message: "Marked as out for delivery",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// MARK ORDER AS DELIVERED
const markDelivered = async (req, res) => {
  try {
    const { orderId } = req.body;
    const deliveryAgentId = req.user.id;

    const order = await orderModel.findById(orderId);

    if (!order || order.deliveryAgentId.toString() !== deliveryAgentId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Calculate commission (5% of order amount)
    const commission = (order.amount * 5) / 100;

    order.status = "Delivered";
    order.deliveredAt = new Date();
    order.commission = commission;
    await order.save();

    // Add earnings to delivery agent
    const agent = await userModel.findById(deliveryAgentId);
    agent.totalEarnings = (agent.totalEarnings || 0) + commission;
    agent.totalDeliveries = (agent.totalDeliveries || 0) + 1;
    await agent.save();

    res.json({
      success: true,
      message: "Order delivered successfully",
      commission,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET DELIVERY HISTORY
const getDeliveryHistory = async (req, res) => {
  try {
    const deliveryAgentId = req.user.id;

    const orders = await orderModel
      .find({
        deliveryAgentId,
        status: "Delivered",
      })
      .populate("addressId")
      .populate("userId", "name email mobile")
      .sort({ deliveredAt: -1 });

    // Add product images
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const orderObj = order.toObject();

        // Use populated user data
        orderObj.userName = orderObj.userId?.name || "Unknown";

        // Get product images
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

    res.json({ success: true, orders: ordersWithDetails });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// GET DELIVERY AGENT EARNINGS
const getEarnings = async (req, res) => {
  try {
    const deliveryAgentId = req.user.id;

    const agent = await userModel.findById(deliveryAgentId).select(
      "name email totalEarnings totalDeliveries"
    );

    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    const deliveredOrders = await orderModel.countDocuments({
      deliveryAgentId,
      status: "Delivered",
    });

    res.json({
      success: true,
      earnings: {
        totalEarnings: agent.totalEarnings || 0,
        totalDeliveries: agent.totalDeliveries || 0,
        commissionRate: 5,
      },
    });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

// REJECT ORDER
const rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const deliveryAgentId = req.user.id;

    const order = await orderModel.findById(orderId);

    if (!order || order.deliveryAgentId?.toString() !== deliveryAgentId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (order.status !== "Accepted") {
      return res.status(400).json({
        success: false,
        message: "Can only reject accepted orders",
      });
    }

    order.deliveryAgentId = null;
    order.deliveryAgentName = null;
    order.status = "Pending";
    order.acceptedAt = null;
    await order.save();

    res.json({
      success: true,
      message: "Order rejected",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export {
  getAvailableOrders,
  acceptOrder,
  getActiveDelivery,
  markOutForDelivery,
  markDelivered,
  getDeliveryHistory,
  getEarnings,
  rejectOrder,
};
