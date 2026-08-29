import React, { useContext, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext.jsx";
import { assets } from "../../assets/frontend_assets/assets.js";
import { toast } from "react-toastify";

export default function ProductDetail() {
  const { id } = useParams();

  const {
    products,
    currency,
    addToCart,
    updateQuantity,
    cartItems,
  } = useContext(ShopContext);

  const product = products.find((p) => p._id === id);

  const size = "standard";
  const quantity = cartItems?.[id]?.[size] || 0;

  const [activeImg, setActiveImg] = useState(
    product?.imageUrl?.[0]
  );

  const [animateQty, setAnimateQty] = useState(false);

  // update active image when product loads
  useEffect(() => {
    if (product?.imageUrl?.length) {
      setActiveImg(product.imageUrl[0]);
    }
  }, [product]);

  // trigger animation on quantity change
  useEffect(() => {
    if (quantity > 0) {
      setAnimateQty(true);
      const t = setTimeout(() => setAnimateQty(false), 200);
      return () => clearTimeout(t);
    }
  }, [quantity]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
        Product not found
      </div>
    );
  }

  const handleAdd = () => {
    addToCart(product._id, size);
    toast.success("Added to cart", {
      position: "bottom-center",
      autoClose: 1200,
      hideProgressBar: true,
    });
  };

  return (
    <div className="min-h-screen bg-white px-4 sm:px-10 py-6">
      {/* BREADCRUMB */}
      <p className="text-sm text-gray-500 mb-4">
        <Link to="/user" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <span className="capitalize">
          {product.category || "Products"}
        </span>{" "}
        /{" "}
        <span className="text-gray-800 font-medium">
          {product.name}
        </span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT: IMAGE GALLERY */}
        <div>
          <div className="border rounded-xl p-6 flex justify-center">
            <img
              src={activeImg || assets.placeholder}
              alt={product.name}
              className="h-80 object-contain"
            />
          </div>

          {product.imageUrl?.length > 1 && (
            <div className="flex gap-3 mt-4">
              {product.imageUrl.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(img)}
                  className={`border rounded-lg p-2 transition ${
                    activeImg === img
                      ? "border-green-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img}
                    alt="thumb"
                    className="h-16 w-16 object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: PRODUCT INFO */}
        <div>
          <h1 className="text-2xl font-semibold">
            {product.name}
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            500 ml
          </p>

          <div className="mt-4">
            <span className="text-2xl font-bold">
              {currency}
              {product.price}
            </span>
            <p className="text-xs text-gray-500">
              (Inclusive of all taxes)
            </p>
          </div>

          {/* ADD / QUANTITY SELECTOR */}
          <div className="mt-6">
            {quantity === 0 ? (
              <button
                onClick={handleAdd}
                className="bg-green-600 hover:bg-green-700 active:scale-95 transition text-white px-8 py-3 rounded-lg font-semibold"
              >
                Add to cart
              </button>
            ) : (
              <div className="flex items-center border border-green-600 rounded-lg w-fit overflow-hidden">
                <button
                  onClick={() =>
                    updateQuantity(
                      product._id,
                      size,
                      quantity - 1
                    )
                  }
                  className="px-4 py-2 text-lg font-bold text-green-600 hover:bg-green-50 active:scale-95 transition"
                >
                  −
                </button>

                <span
                  className={`px-6 font-semibold transition-transform ${
                    animateQty ? "scale-125" : "scale-100"
                  }`}
                >
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    updateQuantity(
                      product._id,
                      size,
                      quantity + 1
                    )
                  }
                  className="px-4 py-2 text-lg font-bold text-green-600 hover:bg-green-50 active:scale-95 transition"
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* WHY SHOP */}
          <div className="mt-8">
            <h3 className="font-semibold mb-4">
              Why shop from GroceCart?
            </h3>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex gap-3">
                <span>🚚</span>
                <p>Fast delivery from nearby stores</p>
              </div>
              <div className="flex gap-3">
                <span>💰</span>
                <p>Best prices & exclusive offers</p>
              </div>
              <div className="flex gap-3">
                <span>🛒</span>
                <p>Wide assortment of daily essentials</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="mt-14 border-t pt-8">
        <h3 className="text-lg font-semibold mb-4">
          Product Details
        </h3>

        <p className="text-sm text-gray-600 leading-relaxed">
          {product.description ||
            "High-quality product sourced from trusted brands. Stored and delivered with care to ensure freshness and quality."}
        </p>
      </div>
    </div>
  );
}
