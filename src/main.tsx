import React from "react";
import ReactDOM from "react-dom/client";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { queryClient } from "@/lib/queryClient";
import { connectRealtime, disconnectRealtime } from "@/lib/realtime";
import { useSession } from "@/lib/hooks";
import {
  HomePage,
  DetailPage,
  CartPage,
  CheckoutPage,
  ConfirmationPage,
  LoginPage,
  RegisterPage,
  ProfilePage,
  WalletsPage,
  FavoritesPage,
  NotFoundPage,
} from "@/app/Pages";
import "./styles.css";

const rootRoute = createRootRoute({
  component: Layout,
  notFoundComponent: NotFoundPage,
});
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const detailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nft/$nftId",
  component: DetailPage,
});
const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});
const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  validateSearch: (search: Record<string, unknown>) => ({
    coupon: typeof search.coupon === "string" ? search.coupon : "",
  }),
  component: CheckoutPage,
});
const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/confirmation/$orderId",
  component: ConfirmationPage,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "",
  }),
  component: LoginPage,
});
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});
const walletsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallets",
  component: WalletsPage,
});
const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/favorites",
  component: FavoritesPage,
});
const routeTree = rootRoute.addChildren([
  homeRoute,
  detailRoute,
  cartRoute,
  checkoutRoute,
  confirmationRoute,
  loginRoute,
  registerRoute,
  profileRoute,
  walletsRoute,
  favoritesRoute,
]);
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function RealtimeSession() {
  const { data: user } = useSession();
  React.useEffect(() => {
    connectRealtime(user?.id ?? null);
    return () => disconnectRealtime();
  }, [user?.id]);
  React.useEffect(() => {
    const expire = () => {
      sessionStorage.removeItem("forma.session");
      sessionStorage.removeItem("forma.userId");
      queryClient.clear();
    };
    window.addEventListener("forma:session-expired", expire);
    return () => window.removeEventListener("forma:session-expired", expire);
  }, []);
  return null;
}

async function start() {
  if (import.meta.env.VITE_MOCKS !== "false") {
    const { worker } = await import("@/mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: { url: "/mockServiceWorker.js" },
    });
  }
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RealtimeSession />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}
start();
