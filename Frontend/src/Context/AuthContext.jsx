import { createContext, useContext, useEffect, useState } from "react";
import { ShopContext } from "./ShopContext.jsx";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const shop = useContext(ShopContext);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
    // inform ShopContext about new token and merge any guest cart
    if (shop?.setToken) shop.setToken(tokenData);
    if (shop?.mergeGuestCart) shop.mergeGuestCart(tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // clear UI cart but do not delete server cart so user can get it back on next login
    if (shop?.setToken) shop.setToken("");
    if (shop?.setCartItems) shop.setCartItems({});
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser)); // ✅ SAFE
        setToken(storedToken);
      }
    } catch (err) {
      console.error("Auth parse error:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
