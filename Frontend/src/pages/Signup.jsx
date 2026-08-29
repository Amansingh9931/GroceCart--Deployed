import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";
import Login from "./Login.jsx";

const Signup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to appropriate dashboard
  React.useEffect(() => {
    if (!user) return;

    if (user.role === "admin") navigate("/admin", { replace: true });
    else if (user.role === "deliveryBoy") navigate("/delivery", { replace: true });
    else navigate("/user", { replace: true });
  }, [user, navigate]);

  // Pass mode="signup" to Login component
  return <Login initialMode="signup" />;
};

export default Signup;
