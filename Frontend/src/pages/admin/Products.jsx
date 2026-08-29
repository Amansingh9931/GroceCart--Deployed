import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Api/axios.js";
import { Upload, ImagePlus } from "lucide-react";

const STORAGE_KEY = "admin:add-product:draft";
const EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes

export default function AdminProducts() {
  const navigate = useNavigate();

  /* 🔐 ADMIN CHECK */
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = storedUser?.role === "admin";

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
  });
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🚫 BLOCK NON-ADMIN */
  useEffect(() => {
    if (!isAdmin) {
      sessionStorage.removeItem(STORAGE_KEY);
      navigate("/");
    }
  }, [isAdmin, navigate]);

  /* 📥 LOAD DRAFT (ADMIN + NOT EXPIRED) */
  useEffect(() => {
    if (!isAdmin) return;

    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      const isExpired =
        Date.now() - parsed.savedAt > EXPIRY_TIME;

      if (isExpired) {
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        setForm(parsed.data);
      }
    } catch (err) {
      console.error("Failed to load admin draft", err);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [isAdmin]);

  /* 💾 SAVE DRAFT (ADMIN ONLY) */
  useEffect(() => {
    if (!isAdmin) return;

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        data: form,
        savedAt: Date.now(),
      })
    );
  }, [form, isAdmin]);

  /* INPUT HANDLERS */
  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleFiles = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* 🚀 SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.price) {
      setMsg("Please fill all required fields");
      return;
    }

    if (files.length === 0) {
      setMsg("Please select at least one image");
      return;
    }

    if (files.length > 4) {
      setMsg("Maximum 4 images allowed");
      return;
    }

    setLoading(true);
    setMsg("Uploading...");

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("description", form.description);
      fd.append("category", form.category);

      files.forEach((file, i) => {
        fd.append(`image${i + 1}`, file);
      });

      const res = await api.post("/api/admin/products/add", fd);

      if (res.data?.success) {
        setMsg("Product added successfully!");
        setForm({
          name: "",
          price: "",
          description: "",
          category: "",
        });
        setFiles([]);
        sessionStorage.removeItem(STORAGE_KEY);
        setTimeout(() => navigate("/admin"), 1000);
      } else {
        setMsg(res.data?.message || "Failed to add product");
      }
    } catch (err) {
      setMsg(
        err.response?.data?.message ||
          err.message ||
          "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* UI */
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <ImagePlus className="text-green-600" />
          Add New Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />

          <input
            name="price"
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg"
          />

          {/* IMAGE UPLOAD */}
          <label className="flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed rounded-lg p-4 hover:bg-gray-50">
            <Upload />
            <span>Select Images</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
          </label>

          {files.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {files.map((file, i) => (
                <div key={i} className="relative h-24 rounded-md overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    className="h-full w-full object-cover"
                    alt="preview"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white ${
              loading
                ? "bg-gray-400"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Uploading..." : "Add Product"}
          </button>
        </form>

        {msg && <p className="mt-4 text-center">{msg}</p>}
      </div>
    </div>
  );
}
