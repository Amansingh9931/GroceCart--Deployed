import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../../Context/ShopContext.jsx";
import axios from "axios";
import { FaRupeeSign, FaTruck, FaChartLine, FaWallet } from "react-icons/fa";

export default function Earnings() {
  const { backend_URL, token } = useContext(ShopContext);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await axios.get(`${backend_URL}/api/delivery/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setEarnings(response.data.earnings);
      }
    } catch (err) {
      console.error("Error fetching earnings:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">💰 Earnings Dashboard</h1>
          <p className="text-gray-600">Track your delivery earnings and commission</p>
        </div>

        {/* Main Earnings Card */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-2xl p-8 text-white mb-8 animate-slideInDown">
          <p className="text-green-100 text-sm font-semibold mb-2">TOTAL EARNINGS</p>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-6xl font-bold mb-2">
                ₹{earnings?.totalEarnings.toFixed(2) || "0.00"}
              </div>
              <p className="text-green-100">
                From {earnings?.totalDeliveries || 0} deliveries
              </p>
            </div>
            <FaWallet className="text-8xl opacity-30" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Total Deliveries */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow transform hover:scale-105 duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm font-semibold">TOTAL DELIVERIES</p>
                <h3 className="text-4xl font-bold text-blue-600 mt-2">
                  {earnings?.totalDeliveries || 0}
                </h3>
              </div>
              <FaTruck className="text-5xl text-blue-600 opacity-30" />
            </div>
            <p className="text-gray-600 text-sm">Orders successfully delivered</p>
          </div>

          {/* Average per Delivery */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow transform hover:scale-105 duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm font-semibold">AVG. PER DELIVERY</p>
                <h3 className="text-4xl font-bold text-purple-600 mt-2">
                  ₹
                  {earnings?.totalDeliveries > 0
                    ? (earnings.totalEarnings / earnings.totalDeliveries).toFixed(0)
                    : "0"}
                </h3>
              </div>
              <FaChartLine className="text-5xl text-purple-600 opacity-30" />
            </div>
            <p className="text-gray-600 text-sm">Average commission per order</p>
          </div>

          {/* Commission Rate */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow transform hover:scale-105 duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-sm font-semibold">COMMISSION RATE</p>
                <h3 className="text-4xl font-bold text-green-600 mt-2">
                  {earnings?.commissionRate || 5}%
                </h3>
              </div>
              <FaRupeeSign className="text-5xl text-green-600 opacity-30" />
            </div>
            <p className="text-gray-600 text-sm">Per order delivered</p>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Earnings Breakdown</h2>
          
          <div className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-700 font-semibold">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{earnings?.totalEarnings.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width:
                      earnings?.totalEarnings > 0
                        ? Math.min((earnings.totalEarnings / 5000) * 100, 100) + "%"
                        : "0%",
                  }}
                ></div>
              </div>
            </div>

            {/* Earnings per Delivery Range */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
                <p className="text-sm text-blue-700 font-semibold mb-1">MIN PER DELIVERY</p>
                <p className="text-2xl font-bold text-blue-600">₹0</p>
                <p className="text-xs text-blue-600 mt-1">Minimum commission</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600">
                <p className="text-sm text-purple-700 font-semibold mb-1">CURRENT AVG</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₹
                  {earnings?.totalDeliveries > 0
                    ? (earnings.totalEarnings / earnings.totalDeliveries).toFixed(0)
                    : "0"}
                </p>
                <p className="text-xs text-purple-600 mt-1">Based on completed orders</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
                <p className="text-sm text-green-700 font-semibold mb-1">POTENTIAL MAX</p>
                <p className="text-2xl font-bold text-green-600">₹500+</p>
                <p className="text-xs text-green-600 mt-1">From high-value orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Explained */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📖 How Commission Works</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Accept an Order</h3>
                <p className="text-gray-600 mt-1">
                  Browse available orders and accept the ones you want to deliver
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Complete Delivery</h3>
                <p className="text-gray-600 mt-1">
                  Mark the order as out for delivery, then mark as delivered when complete
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Earn Commission</h3>
                <p className="text-gray-600 mt-1">
                  Automatically earn 5% commission on every successful delivery
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">View History</h3>
                <p className="text-gray-600 mt-1">
                  Track all your deliveries and earnings in the history section
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/delivery/available"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105"
          >
            Accept More Orders
          </a>
          <a
            href="/delivery/history"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105"
          >
            View History
          </a>
        </div>
      </div>

      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideInDown {
          animation: slideInDown 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
