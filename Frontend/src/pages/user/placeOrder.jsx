import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../../Context/ShopContext.jsx";
import { useAuth } from "../../Context/AuthContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import CartTotal from "../common/CartTotal";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { FaLocationArrow } from "react-icons/fa";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const PlaceOrder = () => {
  const {
    token,
    backend_URL,
    cartItems,
    products,
    navigate,
    setCartItems,
    delivery_fee,
    getCartAmount,
  } = useContext(ShopContext);

  const { user } = useAuth();

  const [placing, setPlacing] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    mapDetails: {
      latitude: null,
      longitude: null,
      landmark: "",
      instructions: "",
    },
  });

  // ✅ Prefill user info
  useEffect(() => {
    if (user) {
      const parts = user.name?.split(" ") || [];
      setFormData((prev) => ({
        ...prev,
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        email: user.email || "",
        phone: user.mobile || "",
        street: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipcode: user.zipcode || "",
        country: user.country || "India",
      }));
    }
  }, [user]);

  // 📍 Live location button
  const getLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          mapDetails: {
            ...prev.mapDetails,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
        }));
        toast.success("Live location selected 📍");
        setLocationLoading(false);
      },
      () => {
        toast.error("Please allow location access");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // 📌 Drag pin
  const handleMarkerDrag = (e) => {
    const { lat, lng } = e.target.getLatLng();
    setFormData((prev) => ({
      ...prev,
      mapDetails: { ...prev.mapDetails, latitude: lat, longitude: lng },
    }));
  };

  const onChangeHandler = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onMapDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({
      ...p,
      mapDetails: { ...p.mapDetails, [name]: value },
    }));
  };

  // 🛒 Build cart items
  const buildOrderItems = () => {
    const items = [];
    for (const pid in cartItems) {
      for (const size in cartItems[pid]) {
        if (cartItems[pid][size] > 0) {
          const product = products.find((p) => p._id === pid);
          if (product) {
            items.push({
              ...product,
              size,
              quantity: cartItems[pid][size],
            });
          }
        }
      }
    }
    return items;
  };

  // ✅ Place order
  const saveAndPlaceOrder = async (e) => {
    e.preventDefault();

    const {
      firstName,
      lastName,
      email,
      phone,
      street,
      city,
      state,
      zipcode,
      country,
    } = formData;

    // Backend validation fix
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !street ||
      !city ||
      !state ||
      !zipcode ||
      !country
    ) {
      toast.error("Please fill all required address fields");
      return;
    }

    if (!formData.mapDetails.latitude || !formData.mapDetails.longitude) {
      toast.error("Please select your location on map");
      return;
    }

    setPlacing(true);

    try {
      // 1️⃣ Save address
      const addressRes = await axios.post(
        `${backend_URL}/api/address/add`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const addressId = addressRes.data.address._id;

      // 2️⃣ Build order
      const orderItems = buildOrderItems();

      await axios.post(
        `${backend_URL}/api/order/place`,
        {
          addressId,
          items: orderItems,
          amount: getCartAmount() + delivery_fee,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Order placed successfully 🎉");
      setCartItems({});
      navigate("/orders");
    } catch (err) {
      console.log(err);
      toast.error("Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const { latitude, longitude } = formData.mapDetails;

  return (
    <form
      onSubmit={saveAndPlaceOrder}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6"
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">

        {/* LEFT CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold mb-2">📦 Delivery Address</h2>

          <div className="grid grid-cols-2 gap-3">
            <input className="input" name="firstName" placeholder="First Name" value={formData.firstName} onChange={onChangeHandler} />
            <input className="input" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={onChangeHandler} />
          </div>

          <input className="input" name="email" placeholder="Email" value={formData.email} onChange={onChangeHandler} />
          <input className="input" name="phone" placeholder="Phone" value={formData.phone} onChange={onChangeHandler} />
          <input className="input" name="street" placeholder="Street Address" value={formData.street} onChange={onChangeHandler} />

          <div className="grid grid-cols-2 gap-3">
            <input className="input" name="city" placeholder="City" value={formData.city} onChange={onChangeHandler} />
            <input className="input" name="state" placeholder="State" value={formData.state} onChange={onChangeHandler} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input className="input" name="zipcode" placeholder="Zipcode" value={formData.zipcode} onChange={onChangeHandler} />
            <input className="input" name="country" placeholder="Country" value={formData.country} onChange={onChangeHandler} />
          </div>

          {/* MAP SECTION */}
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold">📍 Select Location</h3>
              <button
                type="button"
                onClick={getLiveLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <FaLocationArrow />
                {locationLoading ? "Locating..." : "Use Live Location"}
              </button>
            </div>

            {latitude && longitude && (
              <MapContainer
                center={[latitude, longitude]}
                zoom={15}
                style={{ height: "250px", borderRadius: "12px" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[latitude, longitude]}
                  draggable
                  icon={markerIcon}
                  eventHandlers={{ dragend: handleMarkerDrag }}
                />
              </MapContainer>
            )}

            <input
              className="input mt-3"
              name="landmark"
              placeholder="Nearby Landmark"
              value={formData.mapDetails.landmark}
              onChange={onMapDetailsChange}
            />

            <textarea
              className="input mt-2 resize-none"
              rows="2"
              name="instructions"
              placeholder="Delivery Instructions"
              value={formData.mapDetails.instructions}
              onChange={onMapDetailsChange}
            />
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-4">🛒 Your Order</h2>

          {/* PRODUCT LIST */}
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {buildOrderItems().map((item, i) => (
              <div key={i} className="flex justify-between bg-gray-50 p-3 rounded-lg">
                <div>
                  <p className="font-semibold">{item.productName || item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold">₹{item.price}</p>
              </div>
            ))}
          </div>

          <CartTotal />

          <button
            type="submit"
            disabled={placing}
            className="w-full mt-6 bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-semibold transition"
          >
            {placing ? "Placing Order..." : "PLACE ORDER"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
