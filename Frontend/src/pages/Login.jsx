import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../Context/AuthContext.jsx";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Login = ({ initialMode = "login" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  /* 🧠 Remember last mode */
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("authMode") || initialMode;
  });

  useEffect(() => {
    localStorage.setItem("authMode", mode);
  }, [mode]);

  /* Redirect if already logged in */
  useEffect(() => {
    if (!user) return;
    const from = location.state?.from?.pathname;

    if (from) navigate(from, { replace: true });
    else if (user.role === "admin") navigate("/admin", { replace: true });
    else if (user.role === "deliveryBoy") navigate("/delivery", { replace: true });
    else navigate("/user", { replace: true });
  }, [user, location]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showBannedAlert, setShowBannedAlert] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === "signup") navigate("/signup");
    else navigate("/signin");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  /* LOGIN / SIGNUP */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      let url = "";
      let payload = {};

      if (mode === "signup") {
        url = `${BACKEND_URL}/api/user/signup`;
        payload = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        };
      } else {
        url = `${BACKEND_URL}/api/user/signin`;
        payload = {
          email: form.email,
          password: form.password,
        };
      }

      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (mode === "login" && res.data.success) {
        const { user, token } = res.data;
        login(user, token);

        const from = location.state?.from?.pathname;
        if (from) navigate(from, { replace: true });
        else if (user.role === "admin") navigate("/admin");
        else if (user.role === "deliveryBoy") navigate("/delivery");
        else navigate("/user");
      }

      if (mode === "signup" && res.data.success) {
        setErrorMessage("✓ Registration successful. Please login.");

        const signupEmail = form.email;
        const signupPassword = form.password;
        const signupRole = form.role;

        setForm({
          name: "",
          email: signupEmail,
          password: signupPassword,
          role: signupRole,
        });

        handleModeChange("login");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Something went wrong";
      const status = err.response?.data?.status;

      if (status === "banned") {
        setShowBannedAlert(true);
        setErrorMessage("🚫 Your account has been banned. You cannot login.");
      } else if (status === "inactive") {
        setErrorMessage("⚠️ Your account is inactive. Please contact support.");
      } else {
        setErrorMessage(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  /* GOOGLE LOGIN */
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/user/google-signin`,
        { credential: credentialResponse.credential },
        { headers: { "Content-Type": "application/json" } }
      );

      const { user, token } = res.data;
      login(user, token);

      const from = location.state?.from?.pathname;
      if (from) navigate(from, { replace: true });
      else if (user.role === "admin") navigate("/admin");
      else if (user.role === "deliveryBoy") navigate("/delivery");
      else navigate("/user");
    } catch (error) {
      alert(error.response?.data?.message || "Google login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-black px-4">

      {/* BANNED MODAL */}
      {showBannedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl"
          >
            <div className="text-3xl mb-3">🚫</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Account Banned
            </h2>
            <p className="text-gray-600 mb-6">
              Your account has been banned due to policy violations.
            </p>
            <button
              onClick={() => setShowBannedAlert(false)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      <div className="relative w-full max-w-5xl h-[600px] bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">

        <div className="absolute inset-0 flex flex-col md:flex-row">

          {/* LOGIN */}
          <motion.div
            animate={{ x: mode === "login" ? "0%" : "-100%" }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-1/2 p-10 flex flex-col justify-center text-white"
          >
            <h2 className="text-3xl font-bold mb-2">Sign In</h2>

            {errorMessage && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                errorMessage.includes("✓")
                  ? "bg-green-500/20 text-green-300"
                  : errorMessage.includes("🚫")
                  ? "bg-red-500/20 text-red-300"
                  : errorMessage.includes("⚠️")
                  ? "bg-yellow-500/20 text-yellow-300"
                  : "bg-red-500/20 text-red-300"
              }`}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="input" required />
              <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="input" required />

              <button className="btn-primary">
                {loading ? "Please wait..." : "Sign In"}
              </button>
            </form>

            <div className="mt-4">
              <GoogleLogin onSuccess={handleGoogleLogin} />
            </div>
          </motion.div>

          {/* SIGNUP */}
          <motion.div
            animate={{ x: mode === "signup" ? "0%" : "100%" }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-1/2 p-10 flex flex-col justify-center text-white"
          >
            <h2 className="text-3xl font-bold mb-2">Create Account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="input" required />
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="input" required />
              <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="input" required />

              {/* PREMIUM SELECT */}
              <div className="relative">
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="premium-select"
                >
                  <option value="user">Customer</option>
                  <option value="deliveryBoy">Delivery Agent</option>
                </select>
                <span className="select-arrow">▼</span>
              </div>

              <button className="btn-secondary">
                {loading ? "Please wait..." : "Sign Up"}
              </button>
            </form>
          </motion.div>
        </div>

        {/* SLIDING PANEL */}
        <motion.div
          animate={{ x: mode === "login" ? "100%" : "0%" }}
          transition={{ duration: 0.6 }}
          className="hidden md:flex absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex-col justify-center items-center text-center px-10"
        >
          {mode === "login" ? (
            <>
              <h2 className="text-4xl font-bold mb-3">Hello, Friend!</h2>
              <p className="mb-6">Enter your details and start your journey</p>
              <button onClick={() => handleModeChange("signup")} className="btn-outline">
                Sign Up
              </button>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold mb-3">Welcome Back!</h2>
              <p className="mb-6">Login to continue</p>
              <button onClick={() => handleModeChange("login")} className="btn-outline">
                Sign In
              </button>
            </>
          )}
        </motion.div>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255,255,255,0.15);
          color: white;
          outline: none;
        }

        .premium-select {
          width: 100%;
          padding: 12px 42px 12px 16px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08));
          backdrop-filter: blur(10px);
          color: white;
          border: 1px solid rgba(255,255,255,0.25);
          outline: none;
          appearance: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .premium-select:hover {
          border-color: rgba(255,255,255,0.5);
          box-shadow: 0 0 0 2px rgba(139,92,246,0.25);
        }

        .premium-select:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139,92,246,0.4);
        }

        .premium-select option {
          color: #111;
          background: #fff;
        }

        .select-arrow {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: rgba(255,255,255,0.7);
          font-size: 12px;
        }

        .btn-primary {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: linear-gradient(to right,#6366f1,#8b5cf6);
          font-weight: 600;
        }

        .btn-secondary {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: linear-gradient(to right,#8b5cf6,#a855f7);
          font-weight: 600;
        }

        .btn-outline {
          border: 1px solid white;
          padding: 10px 28px;
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
};

export default Login;
