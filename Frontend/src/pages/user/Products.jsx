import React, { useContext } from "react";
import { ShopContext } from "../../Context/ShopContext.jsx";
import { assets } from "../../assets/frontend_assets/assets.js";
import { useNavigate } from "react-router-dom";

export default function Products() {
  const {
    products,
    currency,
    addToCart,
    updateQuantity,
    cartItems,
  } = useContext(ShopContext);

  const navigate = useNavigate();
  const size = "standard";

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-8 py-6">
      <h2 className="text-xl font-semibold mb-6">All Products</h2>

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
                  onClick={() => navigate(`/products/${p._id}`)} // ✅ FIXED
                  className="cursor-pointer flex justify-center"
                >
                  <img
                    src={p.imageUrl?.[0] || assets.placeholder}
                    alt={p.name}
                    className="h-28 w-full object-contain transition-transform hover:scale-105"
                  />
                </div>

                {/* DELIVERY */}
                <p className="text-[11px] text-gray-500 mt-2">
                  ⏱ 9 mins
                </p>

                {/* NAME */}
                <h3 className="text-sm font-medium mt-1 line-clamp-2">
                  {p.name}
                </h3>

                {/* SIZE */}
                <p className="text-xs text-gray-500 mt-1">
                  500 ml
                </p>

                {/* PRICE + CART CONTROL */}
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">
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
  );
}


