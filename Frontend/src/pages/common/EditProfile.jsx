import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function EditProfile() {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/profile";

  const [name, setName] = useState(user?.name || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [address, setAddress] = useState(user?.address || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/user/profile`,
        { name, mobile, address },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🔥 Update AuthContext with new user data
      login(res.data.user, token);
      toast.success("Profile updated successfully");
      
      // Redirect to the path specified in query params or back to profile
      navigate(redirectPath);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded shadow p-6 w-full max-w-md">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-gray-600 hover:underline"
        >
          ← Back
        </button>
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NAME */}
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          {/* MOBILE */}
          <div>
            <label className="block text-sm font-medium">Mobile</label>
            <input
              type="number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          {/* EMAIL (READ ONLY) */}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full border px-3 py-2 rounded mt-1 bg-gray-100 cursor-not-allowed"
            />
          </div>

          

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
