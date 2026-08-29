import { useState, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext.jsx";
import { navbarConfig } from "../../Config/navbarConfig.js";
import { ShopContext } from "../../Context/ShopContext.jsx";
import { assets } from "../../assets/frontend_assets/assets.js";


export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { setShowSearch, getCartCount, token, setToken, setCartItems } =
    useContext(ShopContext);
  const [open, setOpen] = useState(false);
  const closeTimeout = useRef(null);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const menuItems = user ? navbarConfig[user.role] || [] : [];

  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setOpen(false);
    }, 400); // ⏱️ delay in ms (change to 300/500 if you want)
  };

  return (
    <nav className="flex items-center px-6 py-4 bg-white shadow relative">
  {/* LEFT — LOGO */}
  <div className="flex items-center">
    <Link to="/" className="text-2xl font-bold text-green-600">
      🛒 GroceCart
    </Link>
  </div>

  {/* CENTER — MAIN NAV LINKS */}
  <div className="flex-1 flex justify-center gap-6">
    {user && menuItems.map((item) => (
      <Link
        key={item.path}
        to={item.path}
        className="text-sm text-gray-600 hover:text-black font-medium"
      >
        {item.label}
      </Link>
    ))}
  </div>

  {/* RIGHT — CART + USER */}
  <div className="flex items-center gap-4">
    {/* CART ICON - ONLY FOR USER ROLE */}
    {user?.role === "user" && (
      <Link to="/cart" className="relative">
        <img className="w-5 min-w-5" src={assets.cart_icon} alt="cart" />
        <p className="absolute -right-2 -bottom-2 w-4 text-center leading-4 bg-black text-white rounded-full text-[10px]">
          {getCartCount()}
        </p>
      </Link>
    )}

    {/* USER ICON / LOGIN */}
    {user ? (
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="text-gray-700 hover:text-black"
        >
          <FaUserCircle size={26} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow z-50">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              View Profile
            </Link>

            <Link
              to="/profile/edit"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              Edit Profile
            </Link>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    ) : (
      <button
        onClick={() => navigate("/signin")}
        className="rounded bg-green-600 px-3 py-1 text-white"
      >
        Login
      </button>
    )}
  </div>
</nav>

  );
}
