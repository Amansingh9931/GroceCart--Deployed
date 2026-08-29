import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../Api/axios.js";
import { ArrowLeft, Mail, Phone, Calendar, User } from "lucide-react";

export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/user/${userId}`);
      if (res.data && res.data.success) {
        setUser(res.data.user);
      } else {
        setError("Failed to load user details");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch user details");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error || "User not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/admin/users")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Customers
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-gray-600">Customer Account</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="text-blue-500" size={24} />
              <div>
                <p className="text-xs text-gray-500 uppercase">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
            </div>

            {user.mobile ? (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="text-green-500" size={24} />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Mobile</p>
                  <p className="font-semibold">{user.mobile}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="text-gray-400" size={24} />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Mobile</p>
                  <p className="text-gray-400">Not provided</p>
                </div>
              </div>
            )}

            {user.address ? (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Address</p>
                  <p className="font-semibold">{user.address}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Address</p>
                  <p className="text-gray-400">Not provided</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="text-purple-500" size={24} />
              <div>
                <p className="text-xs text-gray-500 uppercase">Member Since</p>
                <p className="font-semibold">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Account Status:</strong> Active
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Auth Provider:</strong>{" "}
                {user.authProvider === "google" ? "Google Sign-In" : "Email & Password"}
              </p>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">Coming Soon</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• View past orders</li>
                <li>• View order history</li>
                <li>• View shipping addresses</li>
                <li>• Account activity logs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
