import { Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import LayoutAdmin from "./pages/admin/LayoutAdmin.jsx";
import LayoutDelivery from "./pages/delivery/LayoutDelivery.jsx";
import LayoutUser from "./pages/user/LayoutUser.jsx";
import AdminDash from "./pages/admin/AdminDash.jsx";
import AdminProducts from "./pages/admin/Products.jsx";
import ProductsList from "./pages/admin/ProductsList.jsx";
import ProductsEdit from "./pages/admin/ProductsEdit.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminDeliveryAgents from "./pages/admin/DeliveryAgents.jsx";
import UserDetails from "./pages/admin/UserDetails.jsx";
import AgentDetails from "./pages/admin/AgentDetails.jsx";
import DeliveryDash from "./pages/delivery/DeliveryDash.jsx";
import AvailableOrders from "./pages/delivery/AvailableOrders.jsx";
import ActiveDelivery from "./pages/delivery/ActiveDelivery.jsx";
import DeliveryHistory from "./pages/delivery/DeliveryHistory.jsx";
import Earnings from "./pages/delivery/Earnings.jsx";
import UserDash from "./pages/user/UserDash.jsx";
import Profile from "./pages/common/Profile.jsx";
import EditProfile from "./pages/common/EditProfile.jsx";
import Navbar from "./pages/common/Navbar.jsx";
import Cart from "./pages/common/Cart.jsx";
import Products from "./pages/user/Products.jsx";
import ProductDetails from "./pages/user/ProductDetails.jsx";
import Orders from "./pages/user/Orders.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";
import PlaceOrder from "./pages/user/placeOrder.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route
          path="/place-order"
          element={
            <ProtectedRoute role="user">
              <PlaceOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute role="user">
              <Orders />
            </ProtectedRoute>
          }
        />
        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <LayoutAdmin />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDash />} />
          <Route path="products" element={<ProductsList />} />
          <Route path="products/add" element={<AdminProducts />} />
          <Route path="products/edit/:id" element={<ProductsEdit />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="user/:userId" element={<UserDetails />} />
          <Route path="delivery-agents" element={<AdminDeliveryAgents />} />
          <Route path="agent/:agentId" element={<AgentDetails />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        {/* USER */}
        <Route
          path="/user"
          element={
            <ProtectedRoute role="user">
              <LayoutUser />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDash />} />
        </Route>

        {/* DELIVERY */}
        <Route
          path="/delivery"
          element={
            <ProtectedRoute role={["deliveryBoy", "delivery"]}>
              <LayoutDelivery />
            </ProtectedRoute>
          }
        >
          <Route index element={<DeliveryDash />} />
          <Route path="active-delivery" element={<ActiveDelivery />} />
          <Route path="available" element={<AvailableOrders />} />
          <Route path="history" element={<DeliveryHistory />} />
          <Route path="earnings" element={<Earnings />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
}

export default App;
