import { Server } from "socket.io";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // Join order room
    socket.on("joinOrderRoom", (orderId) => {
      if (!orderId) return;

      socket.join(orderId);
      socket.currentOrderRoom = orderId;

      console.log(`📦 Socket ${socket.id} joined room ${orderId}`);
    });

    // Receive delivery boy live GPS
    socket.on("deliveryLocation", ({ orderId, lat, lng }) => {
      if (!orderId || !lat || !lng) return;

      io.to(orderId).emit("locationUpdate", { lat, lng });
    });

    // Stop tracking (called when delivered)
    socket.on("stopTracking", (orderId) => {
      if (!orderId) return;

      io.to(orderId).emit("trackingStopped");
      socket.leave(orderId);

      console.log(`🛑 Tracking stopped for order ${orderId}`);
    });

    // Cleanup on disconnect
    socket.on("disconnect", () => {
      if (socket.currentOrderRoom) {
        socket.leave(socket.currentOrderRoom);
        console.log(
          `❌ Socket ${socket.id} left room ${socket.currentOrderRoom}`
        );
      }

      console.log("🔌 Socket disconnected:", socket.id);
    });
  });
};
