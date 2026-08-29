import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../../Context/ShopContext.jsx";
import axios from "axios";
import {
  FaBox,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";

export default function DeliveryHistory() {
  const { backend_URL, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    fetchDeliveryHistory();
  }, []);

  const fetchDeliveryHistory = async () => {
    try {
      const response = await axios.get(`${backend_URL}/api/delivery/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrders(response.data.orders);
        
        // Calculate total earnings
        const total = response.data.orders.reduce(
          (sum, order) => sum + (order.commission || 0),
          0
        );
        setTotalEarnings(total);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading delivery history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📋 Delivery History</h1>
          <p className="text-gray-600">Your past deliveries and earnings</p>
        </div>

        {/* Earnings Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">
                {orders.length}
              </div>
              <p className="text-gray-600 font-semibold">Total Deliveries</p>
            </div>
            <div className="text-center border-l border-r border-gray-200 md:border-l md:border-r">
              <div className="text-5xl font-bold text-green-600 mb-2">
                ₹{totalEarnings.toFixed(2)}
              </div>
              <p className="text-gray-600 font-semibold">Total Earnings</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {orders.length > 0 ? (totalEarnings / orders.length).toFixed(0) : 0}
              </div>
              <p className="text-gray-600 font-semibold">Avg. per delivery</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No Deliveries Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start accepting orders to see your delivery history here
            </p>
            <a
              href="/delivery/available"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105"
            >
              View Available Orders
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden animate-fadeInUp"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: "fadeInUp 0.5s ease-out forwards",
                }}
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaCheckCircle className="text-xl" />
                      <div>
                        <p className="text-sm opacity-90">Order ID</p>
                        <p className="font-mono font-bold">{order._id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-90">Commission Earned</p>
                      <p className="text-2xl font-bold">
                        ₹{(order.commission || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs font-semibold mb-1">CUSTOMER</p>
                      <p className="font-semibold text-gray-800">{order.userName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-semibold mb-1">DELIVERED AT</p>
                      <p className="font-semibold text-gray-800 flex items-center gap-2">
                        <FaCalendarAlt className="text-purple-600" />
                        {new Date(order.deliveredAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {new Date(order.deliveredAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-semibold mb-1">ORDER AMOUNT</p>
                      <p className="font-semibold text-gray-800">₹{order.amount}</p>
                    </div>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Items ({order.items.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="bg-gray-100 rounded px-3 py-1 text-sm">
                        {item.productName || item.name} x{item.quantity}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="bg-gray-100 rounded px-3 py-1 text-sm text-gray-600">
                        +{order.items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Expandable Details */}
                <button
                  onClick={() => toggleExpandOrder(order._id)}
                  className="w-full px-6 py-3 text-left text-purple-600 font-semibold hover:bg-purple-50 transition flex items-center justify-between"
                >
                  <span>
                    {expandedOrders[order._id] ? "Hide Details" : "View Details"}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      expandedOrders[order._id] ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {/* Detailed View */}
                {expandedOrders[order._id] && (
                  <div className="px-6 py-6 bg-gray-50 border-t border-gray-200 space-y-6 animate-fadeIn">
                    {/* Delivery Address */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-red-600" />
                        Delivery Address
                      </h4>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="font-semibold text-gray-900 mb-2">
                          {order.address?.firstName} {order.address?.lastName}
                        </p>
                        <p className="text-gray-600 text-sm">{order.address?.street}</p>
                        <p className="text-gray-600 text-sm">
                          {order.address?.city}, {order.address?.state}{" "}
                          {order.address?.zipcode}
                        </p>
                      </div>
                    </div>

                    {/* All Items */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">All Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between"
                          >
                            <div>
                              <p className="font-semibold text-gray-800">
                                {item.productName || item.name}
                              </p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-gray-800">₹{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Amount:</span>
                          <span className="font-semibold text-gray-800">
                            ₹{order.amount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Commission (5%):</span>
                          <span className="font-semibold text-green-600">
                            ₹{(order.commission || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-gray-900">
                        <span>You Earned:</span>
                        <span className="text-green-600">
                          ₹{(order.commission || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
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
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
