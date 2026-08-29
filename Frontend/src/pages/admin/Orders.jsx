import React, { useEffect, useState } from "react";
import api from "../../Api/axios.js";
import { toast } from "react-toastify";
import { ChevronDown, MapPin, Phone, Mail, Package, CreditCard, User, Calendar } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const response = await api.get("/api/admin/orders");
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message || "Failed to load orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error(err.response?.data?.message || "Error loading orders");
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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await api.post("/api/admin/orders/update-status", {
        orderId,
        status: newStatus,
      });

      if (response.data.success) {
        toast.success("Order status updated");
        fetchAllOrders();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating order:", err);
      toast.error(err.response?.data?.message || "Error updating order");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Order Placed": "bg-blue-50 border-blue-200 text-blue-700",
      "Confirmed": "bg-green-50 border-green-200 text-green-700",
      "Pending": "bg-yellow-50 border-yellow-200 text-yellow-700",
      "Delivered": "bg-emerald-50 border-emerald-200 text-emerald-700",
    };
    return colors[status] || "bg-gray-50 border-gray-200 text-gray-700";
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      "Order Placed": "bg-blue-100 text-blue-800",
      "Confirmed": "bg-green-100 text-green-800",
      "Pending": "bg-yellow-100 text-yellow-800",
      "Delivered": "bg-emerald-100 text-emerald-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const statuses = ["Order Placed", "Confirmed", "Pending", "Delivered"];

  const filteredOrders = filter === "All" ? orders : orders.filter(o => o.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📦 Order Management</h1>
          <p className="text-gray-600">Monitor and manage all customer orders</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {["All", ...statuses].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-green-500"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === "Delivered").length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.status === "Pending").length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-purple-600">₹{orders.reduce((sum, o) => sum + o.amount, 0).toFixed(0)}</p>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 transition hover:shadow-lg ${getStatusColor(order.status).split(" ")[0]}`}
              >
                {/* Order Summary Header */}
                <div
                  onClick={() => toggleExpandOrder(order._id)}
                  className={`p-6 cursor-pointer hover:bg-gray-50 transition flex justify-between items-center border-b ${getStatusColor(order.status).includes("bg-") ? "" : ""}`}
                >
                  <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order ID</p>
                        <p className="font-bold text-gray-900 truncate">#{order._id.slice(-8).toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</p>
                        <p className="font-semibold text-gray-800">
                          {order.addressId?.firstName || "N/A"} {order.addressId?.lastName || ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</p>
                        <p className="font-bold text-green-600">₹{order.amount.toFixed(2)}</p>
                      </div>
                      <div className="flex items-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronDown
                    size={24}
                    className={`text-gray-400 transition transform ml-4 flex-shrink-0 ${
                      expandedOrders[order._id] ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Expanded Order Details */}
                {expandedOrders[order._id] && (
                  <div className="p-6 bg-gray-50 border-t grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Customer Details */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-4 border-b pb-3">
                        <User size={18} className="text-blue-600" />
                        <h4 className="font-bold text-gray-800">Customer Details</h4>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Name</p>
                          <p className="text-gray-800 font-medium">{order.addressId?.firstName} {order.addressId?.lastName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-green-600" />
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase">Phone</p>
                            <p className="text-gray-800">{order.addressId?.phone || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Mail size={14} className="text-blue-600 mt-1" />
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase">Email</p>
                            <p className="text-gray-800 break-all">{order.addressId?.email || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-4 border-b pb-3">
                        <MapPin size={18} className="text-red-600" />
                        <h4 className="font-bold text-gray-800">Delivery Address</h4>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase">Street</p>
                          <p className="text-gray-800">{order.addressId?.street || "N/A"}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase">City</p>
                            <p className="text-gray-800">{order.addressId?.city || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase">State</p>
                            <p className="text-gray-800">{order.addressId?.state || "N/A"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase">Zipcode</p>
                            <p className="text-gray-800">{order.addressId?.zipcode || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase">Country</p>
                            <p className="text-gray-800">{order.addressId?.country || "N/A"}</p>
                          </div>
                        </div>
                        {order.addressId?.mapDetails?.landmark && (
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase">Landmark</p>
                            <p className="text-gray-800">📍 {order.addressId.mapDetails.landmark}</p>
                          </div>
                        )}
                        {order.addressId?.mapDetails?.instructions && (
                          <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase">Instructions</p>
                            <p className="text-gray-800">📝 {order.addressId.mapDetails.instructions}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items & Status */}
                    <div className="space-y-4">
                      {/* Order Items */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-4 border-b pb-3">
                          <Package size={18} className="text-purple-600" />
                          <h4 className="font-bold text-gray-800">Order Items ({order.items?.length || 0})</h4>
                        </div>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex gap-4 bg-gray-50 p-3 rounded border border-gray-200"
                              >
                                {/* Product Image */}
                                <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <Package className="w-6 h-6 text-white" />
                                  )}
                                  {item.image && (
                                    <div className="hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                                      <Package className="w-6 h-6 text-white" />
                                    </div>
                                  )}
                                </div>

                                {/* Item Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                  <div>
                                    <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Qty: {item.quantity} {item.size && `(${item.size})`}
                                    </p>
                                  </div>
                                  <p className="font-bold text-green-600 text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">No items in order</p>
                          )}
                        </div>
                      </div>

                      {/* Payment & Status */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-4 border-b pb-3">
                          <CreditCard size={18} className="text-orange-600" />
                          <h4 className="font-bold text-gray-800">Payment & Status</h4>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="font-semibold text-gray-900">{order.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className={`font-semibold ${order.payment ? "text-green-600" : "text-red-600"}`}>
                              {order.payment ? "✓ Paid" : "⏳ Pending"}
                            </span>
                          </div>
                          <div className="border-t pt-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Update Order Status</p>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              className={`w-full border-2 rounded-lg p-2 text-sm font-semibold focus:outline-none transition ${getStatusColor(order.status)}`}
                            >
                              {statuses.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
