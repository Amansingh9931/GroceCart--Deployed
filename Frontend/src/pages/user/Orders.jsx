import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { ShopContext } from "../../Context/ShopContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../common/Title.jsx";
import {
  Package,
  MapPin,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  Truck,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ================= SKELETON ================= */
const OrderSkeleton = () => (
  <div className="bg-white rounded-2xl shadow p-6 animate-pulse">
    <div className="h-4 bg-gray-200 w-1/3 mb-3 rounded"></div>
    <div className="h-3 bg-gray-200 w-1/2 mb-6 rounded"></div>
    <div className="grid grid-cols-2 gap-4">
      <div className="h-20 bg-gray-200 rounded"></div>
      <div className="h-20 bg-gray-200 rounded"></div>
    </div>
  </div>
);

/* ================= STATUS MAP ================= */
const statusStyle = {
  Pending: "bg-yellow-100 text-yellow-700",
  "Order Placed": "bg-blue-100 text-blue-700",
  Confirmed: "bg-green-100 text-green-700",
  Delivered: "bg-emerald-100 text-emerald-700",
};

const statusIcon = {
  Pending: Clock,
  "Order Placed": Package,
  Confirmed: CheckCircle,
  Delivered: Truck,
};

/* ================= ORDER CARD ================= */
const OrderCard = React.memo(function OrderCard({
  order,
  currency,
  expanded,
  onToggle,
}) {
  const StatusIcon = statusIcon[order.status] || Package;

  const visibleItems = useMemo(() => {
    return expanded ? order.items : order.items.slice(0, 3);
  }, [expanded, order.items]);

  return (
    <div className="bg-white/90 rounded-3xl shadow border overflow-hidden">
      {/* HEADER */}
      <div className="p-6 flex justify-between">
        <div>
          <p className="text-xs text-gray-500">ORDER ID</p>
          <p className="font-mono text-sm font-semibold">{order._id}</p>
          <p className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {new Date(order.date).toDateString()}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xl font-bold">
            {currency}
            {order.amount.toFixed(2)}
          </p>
          <span
            className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusStyle[order.status]}`}
          >
            <StatusIcon className="w-4 h-4" />
            {order.status}
          </span>
        </div>
      </div>

      {/* ITEMS */}
      <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
        {visibleItems.map((item, i) => (
          <div key={i} className="flex gap-4 bg-gray-50 p-4 rounded-xl">
            <img
              src={item.image || "/placeholder.png"}
              alt={item.name}
              loading="lazy"
              width="80"
              height="80"
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <p className="font-semibold text-sm line-clamp-2">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">
                Qty: {item.quantity}
              </p>
              <p className="mt-2 font-semibold text-green-600">
                {currency}
                {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}

        {!expanded && order.items.length > 3 && (
          <p className="col-span-full text-sm text-gray-500">
            +{order.items.length - 3} more items
          </p>
        )}
      </div>

      {/* TOGGLE */}
      <button
        onClick={() => onToggle(order._id)}
        className="w-full px-6 py-4 flex justify-between text-green-600 font-semibold hover:bg-gray-50"
      >
        {expanded ? "Hide Details" : "View Details"}
        <ChevronDown
          className={`transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DETAILS */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-gray-50"
          >
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Payment</h4>
                <p className="text-sm text-gray-600">
                  Method: {order.paymentMethod}
                </p>
                <p className="mt-1 text-sm">
                  Status:{" "}
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                    {order.payment ? "Paid" : "Pending"}
                  </span>
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Delivery Address</h4>
                <p className="text-sm">{order.address?.firstName} {order.address?.lastName}</p>
                <p className="text-sm">{order.address?.street}, {order.address?.city}</p>
                <p className="text-sm">{order.address?.state} {order.address?.zipcode}</p>
                <p className="flex items-center gap-2 mt-2 text-sm">
                  <Phone className="w-4 h-4" />
                  {order.address?.phone}
                </p>
              </div>
            </div>

            <div className="p-6 border-t bg-white">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{currency}{(order.amount - 10).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Shipping</span>
                <span>{currency}10.00</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-3">
                <span>Total</span>
                <span>{currency}{order.amount.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/* ================= MAIN ================= */
export default function Orders() {
  const { backend_URL, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${backend_URL}/api/order/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setOrders(res.data.orders);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = useCallback((id) => {
    setExpanded((prev) => (prev === id ? null : id));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-10 grid gap-6">
        {[1, 2, 3].map((i) => (
          <OrderSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-12"
    >
      <div className="max-w-6xl mx-auto">
        <Title text1="MY" text2="ORDERS" />

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center mt-10">
            <Package className="w-20 h-20 mx-auto text-gray-300 mb-6" />
            <p className="text-xl text-gray-600 mb-6">
              You haven’t placed any orders yet
            </p>
            <a
              href="/products"
              className="inline-block bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-8 mt-10">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                currency={currency}
                expanded={expanded === order._id}
                onToggle={toggleExpand}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
