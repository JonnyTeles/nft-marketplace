import { ws } from "msw";
import { toSocketIo } from "@mswjs/socket.io-binding";

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
export const socketLink = ws.link(
  `${protocol}//${window.location.host}/socket.io/`,
);

export const socketHandlers = [
  socketLink.addEventListener("connection", (connection) => {
    const io = toSocketIo(connection);
    io.client.emit("demo.ready", {
      connected: true,
      transport: "msw-socket.io-binding",
    });
    io.client.emit("nft.updated", {
      nft: { id: "nft-aurora" },
      version: Date.now(),
      reason: "initial-sync",
    });
    io.client.on(
      "demo.request-order-update",
      (
        _event,
        payload: { orderId: string; status: "confirmed" | "rejected" },
      ) => {
        fetch("/api/dev/order-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then((response) => response.json())
          .then(
            (data: {
              order: { id: string; version: number; status: string };
            }) =>
              io.client.emit("order.updated", {
                orderId: data.order.id,
                version: data.order.version,
                status: data.order.status,
              }),
          )
          .catch(() => undefined);
      },
    );
    io.client.on(
      "demo.request-update",
      (_event, payload: { nftId?: string }) => {
        const nftId = payload?.nftId ?? "nft-aurora";
        fetch("/api/dev/nft-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: nftId, price: "0.91", available: 5 }),
        })
          .then((response) => response.json())
          .then(
            (data: {
              nft: {
                id: string;
                version: number;
                price: string;
                available: number;
              };
            }) =>
              io.client.emit("nft.updated", {
                nft: data.nft,
                version: data.nft.version,
                reason: "mock-event",
              }),
          )
          .catch(() =>
            io.client.emit("nft.updated", {
              nft: { id: nftId },
              version: Date.now(),
              reason: "mock-event",
            }),
          );
      },
    );
  }),
];
