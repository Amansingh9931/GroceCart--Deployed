import { useAuth } from "../../Context/AuthContext.jsx";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../Api/axios.js";
import { Package, Users, Truck, BarChart3, LayoutDashboard } from "lucide-react";

export default function AdminDash() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeliveryBoys: 0,
    totalAdmins: 0,
    totalAccounts: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/admin/stats");
      if (res.data && res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Main */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-500">Welcome, {user?.name}</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Customers" value={stats.totalUsers} icon={<Users />} color="bg-purple-500" />
          <StatCard title="Delivery Agents" value={stats.totalDeliveryBoys} icon={<Truck />} color="bg-blue-500" />
          <StatCard title="Total Accounts" value={stats.totalAccounts} icon={<BarChart3 />} color="bg-green-500" />
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            title="Manage Products"
            desc="Add, edit and remove products"
            icon={<Package />}
            link="/admin/products"
          />
          <DashboardCard
            title="Manage Customers"
            desc="View customer information"
            icon={<Users />}
            link="/admin/users"
          />
          <DashboardCard
            title="Delivery Agents"
            desc="Manage delivery staff"
            icon={<Truck />}
            link="/admin/delivery-agents"
          />
        </div>

        {/* Coming Soon */}
        <div className="mt-10 bg-white rounded-xl p-6 shadow">
          <h3 className="font-bold mb-3">Coming Soon</h3>
          <ul className="text-gray-600 space-y-1">
            <li>• Orders & Analytics</li>
            <li>• Revenue reports</li>
            <li>• Feedback system</li>
            <li>• Performance charts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* Reusable Components */

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
    <div className={`${color} p-3 rounded-lg text-white`}>
      {icon}
    </div>
  </div>
);

const DashboardCard = ({ title, desc, icon, link }) => (
  <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6">
    <div className="flex items-center gap-3 mb-3 text-indigo-600">
      {icon}
      <h3 className="font-bold text-lg">{title}</h3>
    </div>
    <p className="text-gray-500 mb-4">{desc}</p>
    <Link
      to={link}
      className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
    >
      Open
    </Link>
  </div>
);
