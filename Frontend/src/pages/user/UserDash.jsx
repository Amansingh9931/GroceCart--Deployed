import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";
import { useContext } from "react";
import { ShopContext } from "../../Context/ShopContext.jsx";
import { assets } from "../../assets/frontend_assets/assets.js";
import {
  FaShoppingCart,
  FaHeart,
  FaUserCircle,
  FaListAlt,
} from "react-icons/fa";

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    products,
    currency,
    addToCart,
    updateQuantity,
    cartItems,
  } = useContext(ShopContext);
  const size = "standard";

  const stats = {
    orders: 5,
    cart: 3,
    wishlist: 2,
  };

  const recentOrders = [
    { id: "ORD123", status: "Delivered", amount: 560 },
    { id: "ORD124", status: "Out for delivery", amount: 320 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* WELCOME */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Welcome back, {user.name}
        </h1>
        <p className="text-gray-500">
          Here's what's happening with your account
        </p>
      </div>

      {/* PRODUCTS */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Shop Products</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No products available.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => {
              const qty = cartItems?.[p._id]?.[size] || 0;

              return (
                <div
                  key={p._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-3 flex flex-col"
                >
                  {/* IMAGE */}
                  <div
                    onClick={() => navigate(`/products/${p._id}`)}
                    className="cursor-pointer flex justify-center"
                  >
                    <img
                      src={p.imageUrl?.[0] || assets.placeholder}
                      alt={p.name}
                      className="h-28 w-full object-contain transition-transform hover:scale-105"
                    />
                  </div>

                  {/* DELIVERY */}
                  <p onClick={() => navigate(`/products/${p._id}`)} className="text-[11px] text-gray-500 mt-2">
                    ⏱ 9 mins
                  </p>

                  {/* NAME */}
                  <h3 onClick={() => navigate(`/products/${p._id}`)} className="text-sm font-medium mt-1 line-clamp-2">
                    {p.name}
                  </h3>

                  {/* SIZE */}
                  <p onClick={() => navigate(`/products/${p._id}`)} className="text-xs text-gray-500 mt-1">
                    500 ml
                  </p>

                  {/* PRICE + CART CONTROL */}
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <span onClick={() => navigate(`/products/${p._id}`)} className="text-sm font-semibold">
                      {currency}
                      {p.price}
                    </span>

                    {/* ADD / QUANTITY */}
                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(p._id, size)}
                        className="border border-green-600 text-green-600 text-xs font-semibold px-4 py-1 rounded-md hover:bg-green-50 active:scale-95 transition"
                      >
                        ADD
                      </button>
                    ) : (
                      <div className="flex items-center border border-green-600 rounded-md overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(p._id, size, qty - 1)
                          }
                          className="px-3 py-1 text-green-600 font-bold hover:bg-green-50 active:scale-95 transition"
                        >
                          −
                        </button>

                        <span className="px-3 text-sm font-semibold transition-transform duration-150 scale-105">
                          {qty}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(p._id, size, qty + 1)
                          }
                          className="px-3 py-1 text-green-600 font-bold hover:bg-green-50 active:scale-95 transition"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ✅ DEFINE COMPONENTS BELOW */

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
    <div className={`text-white p-3 rounded-lg ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-xl font-bold">{value}</h3>
    </div>
  </div>
);

const ActionCard = ({ title, icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-lg transition"
  >
    <div className="text-indigo-600 text-2xl">{icon}</div>
    <p className="font-medium">{title}</p>
  </div>
);

export default UserDashboard;
