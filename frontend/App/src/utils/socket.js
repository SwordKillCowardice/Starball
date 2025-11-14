// src/utils/socket.js
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL; // ✅ 使用 Vite 环境变量
export const socket = io(backendUrl, {
    transports: ["websocket"],
});
