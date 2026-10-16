import { io, type Socket } from "socket.io-client";
import { queryClient } from "./queryClient";

let socket: Socket | undefined;
let activeUser: string | null = null;
export function connectRealtime(userId: string | null) {
  if (activeUser === userId && socket) return socket;
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }
  activeUser = userId;

  const endpoint = import.meta.env.VITE_SOCKET_URL || window.location.origin;
  socket = io(endpoint, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    transports: ["websocket"],
    auth: { userId },
  });
  socket.on(
    "nft.updated",
    (event: { nft: { id: string; version?: number }; version: number }) => {
      const current = queryClient.getQueryData<{ version: number }>([
        "nft",
        event.nft.id,
      ]);
      if (!current || event.version > current.version) {
        queryClient.invalidateQueries({ queryKey: ["nfts"] });
        queryClient.invalidateQueries({ queryKey: ["nft", event.nft.id] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["quote"] });
        queryClient.invalidateQueries({ queryKey: ["checkout-quote"] });
      }
    },
  );
  socket.on("order.updated", (event: { orderId: string; version: number }) => {
    const current = queryClient.getQueryData<{ version: number }>([
      "order",
      event.orderId,
    ]);
    if (!current || event.version > current.version)
      queryClient.invalidateQueries({ queryKey: ["order", event.orderId] });
  });
  socket.on("connect", () => {
    queryClient.invalidateQueries({ queryKey: ["cart"] });
    queryClient.invalidateQueries({ queryKey: ["nfts"] });
    queryClient.invalidateQueries({ queryKey: ["order"] });
  });
  return socket;
}
export function simulateNftUpdate(nftId: string) {
  socket?.emit("demo.request-update", { nftId });
}
export function simulateOrderUpdate(
  orderId: string,
  status: "confirmed" | "rejected",
) {
  socket?.emit("demo.request-order-update", { orderId, status });
}
export function disconnectRealtime() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = undefined;
  }
  activeUser = null;
}
