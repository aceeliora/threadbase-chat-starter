import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { io } from "socket.io-client";

export function useSocket(roomId) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) {
      setMessages([]);
      setSocket(null);
      return undefined;
    }

    setMessages([]);
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ??
      import.meta.env.VITE_API_BASE_URL ??
      "http://localhost:3001";
    const connection = io(socketUrl, { auth: { token } });
    setSocket(connection);

    const onMessage = (message) => {
      setMessages((currentMessages) => [...currentMessages, message]);
    };
    connection.on("chat:message", onMessage);
    connection.emit("room:join", roomId);

    return () => {
      connection.off("chat:message", onMessage);
      connection.disconnect();
    };
  }, [token, roomId]);

  const sendMessage = useCallback(
    (text) => {
      if (typeof text === "string" && text.trim()) {
        socket?.emit("chat:message", { roomId, text: text.trim() });
      }
    },
    [socket, roomId]
  );

  return { messages, sendMessage };
}
