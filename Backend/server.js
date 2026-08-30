import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./Config/db.js";
import http from "http";
import { setupSocket } from "./socketServer.js";
import userRouter from "./Route/UserRoute.js";
import adminRouter from "./Route/admin/AdminRoute.js";
// import productRouter from "./Route/user/UserProductRoute.js";
import cartRouter from "./Route/user/CartRoute.js";
import UserProductRouter from "./Route/user/UserProductRoute.js";
import orderRouter from "./Route/user/OrderRoute.js";
import addressRouter from "./Route/user/AddressRoute.js";
import deliveryRouter from "./Route/delivery/DeliveryRoute.js";

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

//connect to database
await connectDB();
//setup socket
setupSocket(server);


//middleware
app.use(cors({
  origin: "http://localhost:5173", // your frontend URL
  credentials: true
}));
app.use(express.json());


//routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/cart", cartRouter);
app.use("/api/products", UserProductRouter);
app.use("/api/order", orderRouter);
app.use("/api/address", addressRouter);
app.use("/api/delivery", deliveryRouter);


// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "GroceryCart Backend"
  });
});

//test route
// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

server.listen(PORT, "0.0.0.0" ,() => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
});

