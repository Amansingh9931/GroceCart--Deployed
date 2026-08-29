import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../../Context/ShopContext.jsx";
import Title from "../common/Title.jsx";

const CartTotal = () => {
  const { currency, delivery_fee, getCartAmount } =
    useContext(ShopContext);

  const cartAmount = getCartAmount();
  const finalTotal = cartAmount + delivery_fee;
  const freeShippingLimit = 499;

  const [animatedSubtotal, setAnimatedSubtotal] = useState(0);
  const [animatedTotal, setAnimatedTotal] = useState(0);

  useEffect(() => {
    animateValue(cartAmount, setAnimatedSubtotal);
    animateValue(finalTotal, setAnimatedTotal);
  }, [cartAmount, finalTotal]);

  const animateValue = (value, setter) => {
    let start = 0;
    let duration = 300;
    let startTime = null;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      setter(Math.round(start + (value - start) * progress));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  return (
    <div>
      <div className="text-xl font-semibold mb-4">
        <Title text1="CART" text2="TOTALS" />
      </div>

      <div className="flex flex-col gap-4 text-sm text-gray-700">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">
            {currency} {animatedSubtotal}.00
          </span>
        </div>

        <div className="h-px bg-gray-200" />

        <div className="flex justify-between">
          <span className="text-gray-500">Shipping Fee</span>
          <span className="font-medium">
            {currency} {delivery_fee}
          </span>
        </div>

        {/* FREE SHIPPING */}
        {cartAmount < freeShippingLimit ? (
          <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
            Add{" "}
            <span className="font-medium text-gray-800">
              {currency} {freeShippingLimit - cartAmount}
            </span>{" "}
            more to get <span className="font-medium">FREE SHIPPING</span> 🚚
          </p>
        ) : (
          <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded">
            🎉 You’ve unlocked <span className="font-medium">FREE SHIPPING</span>
          </p>
        )}

        <div className="h-px bg-gray-200" />

        <div className="flex justify-between text-base font-semibold text-gray-900 pt-2">
          <span>Total</span>
          <span>
            {currency} {animatedTotal}.00
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
