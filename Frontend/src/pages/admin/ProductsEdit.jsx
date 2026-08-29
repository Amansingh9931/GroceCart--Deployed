import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../Api/axios.js";

export default function ProductsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", price: "", description: "", category: "", stock: 0 });
  const [existingImages, setExistingImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/admin/products/${id}`);
        if (res.data && res.data.success && res.data.product) {
          const p = res.data.product;
          setForm({ name: p.name || "", price: p.price || "", description: p.description || "", category: p.category || "", stock: p.stock || 0 });
          setExistingImages(p.imageUrl || []);
        } else {
          setMsg("Failed to load product");
        }
      } catch (err) {
        setMsg(err.message || "Error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  const handleFiles = (e) => setFiles(Array.from(e.target.files));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("Updating...");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("stock", form.stock);
      files.forEach((f) => fd.append("images", f));

      const res = await api.put(`/api/admin/products/edit/${id}`, fd);
      if (res.data && res.data.success) {
        setMsg("Updated");
        setTimeout(() => navigate("/admin/products"), 700);
      } else setMsg("Update failed");
    } catch (err) {
      setMsg(err.message || "Update failed");
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Edit Product</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          <input name="category" value={form.category} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          <input name="stock" type="number" value={form.stock} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full px-3 py-2 border rounded" />

          <div>
            <p className="mb-2 font-medium">Existing Images</p>
            <div className="flex gap-2">
              {existingImages.length === 0 && <div className="text-sm text-gray-500">No images</div>}
              {existingImages.map((src, i) => (
                <img key={i} src={src} alt={`img-${i}`} className="h-24 w-24 object-cover rounded" />
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-sm">Add images (optional)</span>
            <input type="file" multiple onChange={handleFiles} className="mt-1" />
          </label>

          <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">Save</button>
        </form>

        {msg && <p className="mt-3">{msg}</p>}
      </div>
    </div>
  );
}
