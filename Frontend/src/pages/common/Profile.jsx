import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";
import { FaEdit, FaSave } from "react-icons/fa";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import axios from "axios";

const Profile = () => {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user.name || "",
    mobile: user.mobile || "",
    address: user.address || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      // 🔌 Backend API (you will implement this)
      const res = await axios.put(
        `${BACKEND_URL}/api/user/profile`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🔄 Update auth context + localStorage
      login(res.data.user, token);

      setEditMode(false);
    } catch (err) {
      console.error("Profile update failed", err);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center pt-10">
      <div className="bg-white w-full max-w-xl rounded-xl shadow p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-gray-600 hover:underline"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold mb-6">My Profile</h2>

        {/* NAME */}
        <div className="mb-4">
          <label className="text-gray-600 text-sm">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full mt-1 px-3 py-2 border rounded ${
              editMode ? "bg-white" : "bg-gray-100"
            }`}
          />
        </div>

        {/* EMAIL (READ ONLY) */}
        <div className="mb-4">
          <label className="text-gray-600 text-sm">Email</label>
          <input
            value={user.email}
            disabled
            className="w-full mt-1 px-3 py-2 border rounded bg-gray-100"
          />
        </div>

        {/* MOBILE */}
        <div className="mb-4">
          <label className="text-gray-600 text-sm">Mobile</label>
          <input
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full mt-1 px-3 py-2 border rounded ${
              editMode ? "bg-white" : "bg-gray-100"
            }`}
          />
        </div>

        {/* ADDRESS */}
        <div className="mb-4">
          <label className="text-gray-600 text-sm">Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            disabled={!editMode}
            className={`w-full mt-1 px-3 py-2 border rounded ${
              editMode ? "bg-white" : "bg-gray-100"
            }`}
          />
        </div>

        

        {/* ACTION BUTTON */}
        {editMode ? (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded"
          >
            <FaSave /> Save Changes
          </button>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded"
          >
            <FaEdit /> Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
