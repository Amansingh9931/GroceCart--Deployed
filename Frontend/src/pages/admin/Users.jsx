import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Api/axios.js";
import { toast } from "react-toastify";
import { Users, Mail, Phone, Calendar, Ban, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/users/user");
      if (res.data && res.data.success) {
        setUsers(res.data.users || []);
      } else {
        setError("Failed to load users");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch users");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const changeUserStatus = async (userId, newStatus) => {
    try {
      setStatusUpdating(prev => ({ ...prev, [userId]: true }));
      const res = await api.post("/api/admin/users/status", {
        userId,
        status: newStatus,
      });

      if (res.data.success) {
        toast.success(`User status changed to ${newStatus}`);
        // Update local state
        setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
      } else {
        toast.error(res.data.message || "Failed to change status");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error changing status");
      console.error("Error:", err);
    } finally {
      setStatusUpdating(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border border-green-300";
      case "inactive":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "banned":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle size={16} className="text-green-600" />;
      case "inactive":
        return <AlertCircle size={16} className="text-yellow-600" />;
      case "banned":
        return <Ban size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg border border-red-300">
            {error}
          </div>
          <button
            onClick={fetchUsers}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 text-gray-900">
              <Users className="text-blue-600" size={36} />
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage customer accounts and status ({users.length} total)</p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            Back to Admin
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Active Users</p>
            <p className="text-2xl font-bold text-green-600">{users.filter(u => u.status === "active").length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm">Inactive Users</p>
            <p className="text-2xl font-bold text-yellow-600">{users.filter(u => u.status === "inactive").length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm">Banned Users</p>
            <p className="text-2xl font-bold text-red-600">{users.filter(u => u.status === "banned").length}</p>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 text-lg">No customers found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-200 border-b">
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Mobile</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Joined</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                        <Mail size={16} className="text-blue-500" />
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.mobile ? (
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-green-500" />
                            <span>{user.mobile}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not provided</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                        <Calendar size={16} className="text-purple-500" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm ${getStatusColor(user.status)}`}>
                          {getStatusIcon(user.status)}
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.status || "active"}
                          onChange={(e) => changeUserStatus(user._id, e.target.value)}
                          disabled={statusUpdating[user._id]}
                          className={`px-3 py-1 rounded text-sm font-semibold border transition cursor-pointer ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                              : user.status === "inactive"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
                              : "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
                          } disabled:opacity-50`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="banned">Banned</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
