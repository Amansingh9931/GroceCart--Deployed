import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../../Context/ShopContext.jsx";
import Title from "../common/Title.jsx";
import CartTotal from "../common/CartTotal";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const { products, currency, cartItems, updateQuantity } =
    useContext(ShopContext);

  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const temp = [];
      for (const productId in cartItems) {
        for (const size in cartItems[productId]) {
          const qty = cartItems[productId][size];
          if (qty > 0) {
            temp.push({ _id: productId, size, quantity: qty });
          }
        }
      }
      setCartData(temp);
    }
  }, [cartItems, products]);

  /* ================= EMPTY CART ================= */
  if (cartData.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">
            Looks like you haven’t added anything yet. Let’s fix that.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="mt-8 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Start Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-16 px-4 sm:px-10 pb-20">
      <div className="mb-10">
        <Title text1="YOUR" text2="CART" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ================= CART ITEMS ================= */}
        <div className="lg:col-span-2 space-y-5">
          <AnimatePresence>
            {cartData.map((item) => {
              const product = products.find((p) => p._id === item._id);
              if (!product) return null;

              return (
                <motion.div
                  key={`${item._id}-${item.size}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-md p-5 flex justify-between items-center"
                >
                  {/* PRODUCT INFO */}
                  <div className="flex items-center gap-5">
                    <img
                      src={product.imageUrl?.[0]}
                      alt={product.name}
                      className="w-20 h-20 rounded-xl object-cover border"
                    />

                    <div>
                      <p className="font-semibold text-gray-900">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span>
                          {currency}
                          {product.price}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                          {item.size}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-5">
                    {/* QUANTITY */}
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center bg-gray-100 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          updateQuantity(
                            item._id,
                            item.size,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="px-3 py-2 hover:bg-gray-200"
                      >
                        <Minus size={16} />
                      </button>

                      <motion.span
                        key={item.quantity}
                        initial={{ scale: 0.7 }}
                        animate={{ scale: 1 }}
                        className="px-4 font-semibold"
                      >
                        {item.quantity}
                      </motion.span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item._id,
                            item.size,
                            item.quantity + 1
                          )
                        }
                        className="px-3 py-2 hover:bg-gray-200"
                      >
                        <Plus size={16} />
                      </button>
                    </motion.div>

                    {/* REMOVE */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        updateQuantity(item._id, item.size, 0)
                      }
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ================= SUMMARY ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:sticky lg:top-28 h-fit"
        >
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <CartTotal />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/place-order")}
              className="w-full bg-green-600 text-white py-4 mt-6 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Proceed to Checkout
            </motion.button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              🚚 Free delivery on orders above ₹499
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;
