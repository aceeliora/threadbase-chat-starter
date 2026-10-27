import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { verifyToken } from "./middleware/auth.js";

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Demo users - log in as either to test chat in two windows.
const USERS = [
  { userId: 1, name: "Ada", email: "ada@threadbase.dev", password: "password" },
  { userId: 2, name: "Linus", email: "linus@threadbase.dev", password: "password" },
];

// POST /auth/login -> { accessToken, user }
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body ?? {};
  const found = USERS.find((u) => u.email === email && u.password === password);
  if (!found) return res.status(401).json({ error: "Invalid credentials" });

  const accessToken = jwt.sign(
    { userId: found.userId, name: found.name },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ accessToken, user: { userId: found.userId, name: found.name } });
});

// A normal protected route (unchanged, uses the HTTP verifyToken).
app.get("/api/me", verifyToken, (req, res) => res.json({ user: req.user }));

/* =====================================================================
   YOUR WORK (Tasks 1-2):
   1. npm install socket.io
   2. Wrap this Express app with an HTTP server and attach Socket.io:
        import { createServer } from "http";
        import { Server } from "socket.io";
        const httpServer = createServer(app);
        const io = new Server(httpServer, {
          cors: { origin: "http://localhost:5173", credentials: true },
        });
   3. (Task: auth) io.use((socket, next) => { ... }) verify the JWT from
      socket.handshake.auth.token, store the payload on socket.data.user.
   4. (Task: rooms) io.on("connection", (socket) => {
        socket.on("room:join", (roomId) => socket.join(roomId));
        socket.on("chat:message", ({ roomId, text }) => {
          io.to(roomId).emit("chat:message", { ...message... });
        });
      });
   5. Replace app.listen below with httpServer.listen so Socket.io actually starts.
   ===================================================================== */

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
  console.log("  POST /auth/login");
  console.log("  Socket.io: NOT set up yet - that is your job.");
});
