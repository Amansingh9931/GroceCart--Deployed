import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../../Context/ShopContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRupeeSign,
  FaBox,
} from "react-icons/fa";

export default function AvailableOrders() {
  const { backend_URL, token } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);

  useEffect(() => {
    fetchAvailableOrders();
    const interval = setInterval(fetchAvailableOrders, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAvailableOrders = async () => {
    try {
      const url = `${backend_URL}/api/delivery/available-orders`;
      console.log("[AvailableOrders] Fetching from:", url);
    //   console.log("[AvailableOrders] Token exists:", !!token);
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      console.log("[AvailableOrders] Response status:", response.status);
      console.log("[AvailableOrders] Response data:", response.data);
      
      if (response.data && response.data.success) {
        console.log("[AvailableOrders] Orders count:", response.data.orders?.length);
        console.log("[AvailableOrders] Orders:", JSON.stringify(response.data.orders, null, 2));
        setOrders(response.data.orders || []);
        setHasActiveOrder(!!response.data.activeOrder);
      } else {
        console.error("[AvailableOrders] API returned success: false");
        console.error("[AvailableOrders] Message:", response.data?.message);
        toast.error(response.data?.message || "Failed to fetch orders");
        setOrders([]);
      }
    } catch (err) {
      console.error("[AvailableOrders] Error:", err);
      console.error("[AvailableOrders] Response data:", err.response?.data);
      console.error("[AvailableOrders] Status:", err.response?.status);
      console.error("[AvailableOrders] Message:", err.message);
      
      let errorMsg = "Failed to load orders";
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      toast.error(errorMsg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      setAcceptingId(orderId);
      const response = await axios.post(
        `${backend_URL}/api/delivery/accept-order`,
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Order accepted! Head to active delivery", {
          autoClose: 2000,
        });
        setOrders(orders.filter((o) => o._id !== orderId));
        setHasActiveOrder(true);
      } else {
        toast.error(response.data.message || "Failed to accept order");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error accepting order");
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading available orders...</p>
        </div>
      </div>
    );
  }

  if (hasActiveOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-pulse">
            <div className="text-6xl mb-4">🚚</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              You have an active delivery
            </h2>
            <p className="text-gray-600 mb-6">
              Complete your current delivery before accepting a new order
            </p>
            <a
              href="/delivery"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105"
            >
              View Active Delivery
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📦 Available Orders</h1>
          <p className="text-gray-600">
            {orders.length > 0
              ? `${orders.length} order${orders.length > 1 ? "s" : ""} waiting for delivery`
              : "No orders available right now"}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4 opacity-50">�</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No Orders Available Right Now
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              New orders appear here automatically when customers place them. Keep checking back for new opportunities!
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={fetchAvailableOrders}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 active:scale-95"
              >
                🔄 Refresh Now
              </button>
              <a
                href="/delivery/history"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 active:scale-95"
              >
                📋 View History
              </a>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
              <p>💡 Tip: Orders refresh every 5 seconds automatically</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order, index) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden animate-fadeInUp"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.5s ease-out forwards",
                }}
              >
                {/* Header with Order ID and Amount */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaBox className="text-xl" />
                      <div>
                        <p className="text-sm opacity-90">Order ID</p>
                        <p className="font-mono font-bold text-lg">{order._id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-90">Total Amount</p>
                      <p className="text-2xl font-bold flex items-center gap-1">
                        <FaRupeeSign className="text-lg" />
                        {order.amount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer & Location Details */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Customer Info */}
                    <div>
                      <p className="text-sm text-gray-500 mb-1 font-semibold">CUSTOMER</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {order.userName}
                      </p>
                      <div className="flex items-center gap-2 text-gray-600 mt-2">
                        <FaPhoneAlt className="text-green-600" />
                        <a
                          href={`tel:${order.address?.phone}`}
                          className="hover:text-green-600 font-medium"
                        >
                          {order.address?.phone}
                        </a>
                      </div>
                    </div>

                    {/* Location Info */}
                    <div>
                      <p className="text-sm text-gray-500 mb-1 font-semibold">DELIVERY ADDRESS</p>
                      <div className="flex items-start gap-2">
                        <FaMapMarkerAlt className="text-red-600 mt-1 flex-shrink-0" />
                        <div className="text-gray-800">
                          <p className="font-semibold">
                            {order.address?.firstName} {order.address?.lastName}
                          </p>
                          <p className="text-sm">{order.address?.street}</p>
                          <p className="text-sm">
                            {order.address?.city}, {order.address?.state}{" "}
                            {order.address?.zipcode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-700 mb-3">ITEMS ({order.items.length})</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-2 text-center">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="h-12 w-full object-contain mb-1"
                          />
                        )}
                        <p className="text-xs font-medium text-gray-700 line-clamp-1">
                          {item.productName || item.name}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment & Time Info */}
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Payment Method</p>
                      <p className="font-semibold text-gray-800">{order.paymentMethod}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaClock />
                      <div>
                        <p className="text-xs text-gray-500">Placed</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(order.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Accept Button */}
                  <button
                    onClick={() => handleAcceptOrder(order._id)}
                    disabled={acceptingId === order._id}
                    className={`px-8 py-3 rounded-lg font-bold text-white transition-all transform hover:scale-105 disabled:opacity-50 ${
                      acceptingId === order._id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg"
                    }`}
                  >
                    {acceptingId === order._id ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⚙️</span> Accepting...
                      </span>
                    ) : (
                      "Accept Order"
                    )}
                  </button>
                </div>

                {/* Commission Info */}
                <div className="px-6 py-3 bg-blue-50 border-t border-blue-200 flex items-center gap-2">
                  <span className="text-sm text-blue-600 font-semibold">💰 You'll earn:</span>
                  <span className="text-lg font-bold text-blue-700">
                    ₹{(order.amount * 0.05).toFixed(2)} (5% commission)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
