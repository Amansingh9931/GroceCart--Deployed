import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../Api/axios.js";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/products");
      if (res.data && res.data.success) setProducts(res.data.products || []);
      else setError("Failed to load products");
    } catch (err) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/api/admin/products/delete/${id}`);
      setProducts((p) => p.filter((x) => x._id !== id));
    } catch{
      alert("Delete failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link to="add" className="bg-green-600 text-white px-4 py-2 rounded">Add Product</Link>
      </div>

      {products.length === 0 ? (
        <div>No products found</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p._id} className="bg-white p-3 rounded shadow">
              {p.imageUrl && p.imageUrl[0] && (
                <img src={p.imageUrl[0]} alt={p.name} className="h-40 w-full object-cover rounded mb-2" />
              )}
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-gray-600">{p.category}</p>
              <p className="mt-2 font-bold">₹{p.price}</p>
              <div className="flex gap-2 mt-3">
                <Link to={`edit/${p._id}`} className="text-sm px-3 py-1 bg-blue-500 text-white rounded">Edit</Link>
                <button onClick={() => handleDelete(p._id)} className="text-sm px-3 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
