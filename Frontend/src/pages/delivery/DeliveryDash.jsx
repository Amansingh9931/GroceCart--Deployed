import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBox,
  FaHistory,
  FaMoneyBillWave,
  FaTruck,
} from "react-icons/fa";

const DeliveryDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🚚 Delivery Dashboard</h1>
          <p className="text-gray-600">Welcome to your delivery management hub</p>
        </div>

        {/* Main Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Available Orders Card */}
          <div
            onClick={() => navigate("/delivery/available")}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer p-8 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-100 rounded-lg p-4 group-hover:bg-blue-200 transition">
                <FaBox className="text-3xl text-blue-600" />
              </div>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                NEW
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Available Orders</h3>
            <p className="text-gray-600 mb-4">Browse and accept new delivery orders</p>
            <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
              View Orders <span>→</span>
            </div>
          </div>

          {/* Active Delivery Card */}
          <div
            onClick={() => navigate("/delivery/active-delivery")}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer p-8 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-green-100 rounded-lg p-4 group-hover:bg-green-200 transition">
                <FaTruck className="text-3xl text-green-600" />
              </div>
              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold">
                ACTIVE
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Active Delivery</h3>
            <p className="text-gray-600 mb-4">Track your current delivery in progress</p>
            <div className="flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
              View Delivery <span>→</span>
            </div>
          </div>

          {/* Delivery History Card */}
          <div
            onClick={() => navigate("/delivery/history")}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer p-8 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-100 rounded-lg p-4 group-hover:bg-purple-200 transition">
                <FaHistory className="text-3xl text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Delivery History</h3>
            <p className="text-gray-600 mb-4">View all your completed deliveries</p>
            <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
              View History <span>→</span>
            </div>
          </div>

          {/* Earnings Card */}
          <div
            onClick={() => navigate("/delivery/earnings")}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer p-8 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-green-100 rounded-lg p-4 group-hover:bg-green-200 transition">
                <FaMoneyBillWave className="text-3xl text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Earnings</h3>
            <p className="text-gray-600 mb-4">Track your total earnings and commission</p>
            <div className="flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
              View Earnings <span>→</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">💡 How It Works</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-4xl mb-3">📦</div>
              <h4 className="font-bold mb-2">1. Accept Orders</h4>
              <p className="text-indigo-100 text-sm">
                Browse available orders in real-time and accept the ones you want
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">🚚</div>
              <h4 className="font-bold mb-2">2. Deliver</h4>
              <p className="text-indigo-100 text-sm">
                Navigate to the delivery location and complete the delivery
              </p>
            </div>
            <div>
              <div className="text-4xl mb-3">💰</div>
              <h4 className="font-bold mb-2">3. Earn</h4>
              <p className="text-indigo-100 text-sm">
                Earn 5% commission on every successful delivery automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
