import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    return (
      <Navigate 
        to="/signin" 
        replace 
        state={{ from: location }} 
      />
    );
  }

  // Has role requirement - check if user has the required role
  if (role) {
    // Allow multiple roles if passed as array
    const allowedRoles = Array.isArray(role) ? role : [role];
    
    // Normalize roles for comparison (handle deliveryBoy vs delivery)
    const userRole = user.role?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
    
    if (!normalizedAllowedRoles.includes(userRole)) {
      console.log("Access Denied: User role", user.role, "not in allowed:", allowedRoles);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // All checks passed
  return children;
}
