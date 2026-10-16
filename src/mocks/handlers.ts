import { http, HttpResponse, delay } from "msw";
import type { User, Wallet, Order, CartItem } from "@/types";
import {
  getNFTs,
  saveNFTs,
  readStore,
  writeStore,
  initialUsers,
  initialWallets,
} from "./data";
import { multiplyEth, fromUnits, toUnits } from "@/lib/money";

type DemoUser = User & { password?: string; passwordHash?: string };
const hashPassword = async (password: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password)),
    ),
  )
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
const currentUser = (): DemoUser | null => {
  const id = sessionStorage.getItem("forma.userId");
  const users = readStore<DemoUser[]>("users", initialUsers);
  return users.find((u) => u.id === id) ?? null;
};
const requireUser = () => currentUser();
const cartKey = () => `cart:${currentUser()?.id ?? "guest"}`;
const getCart = (): CartItem[] => readStore<CartItem[]>(cartKey(), []);
const saveCart = (items: CartItem[]) => writeStore(cartKey(), items);
const getUserOrders = () =>
  readStore<Order[]>(`orders:${currentUser()?.id ?? "guest"}`, []);
const saveUserOrders = (orders: Order[]) =>
  writeStore(`orders:${currentUser()?.id ?? "guest"}`, orders);
const walletsKey = () => `wallets:${currentUser()?.id ?? "guest"}`;
const mergeGuestCart = (userId: string) => {
  const guest = readStore<CartItem[]>("cart:guest", []);
  const saved = readStore<CartItem[]>(`cart:${userId}`, []);
  const merged = [...saved];
  for (const item of guest) {
    const existing = merged.find((i) => i.nftId === item.nftId);
    if (existing) existing.quantity += item.quantity;
    else merged.push(item);
  }
  const stock = getNFTs();
  writeStore(
    `cart:${userId}`,
    merged.map((item) => ({
      ...item,
      quantity: Math.min(
        item.quantity,
        stock.find((n) => n.id === item.nftId)?.available ?? 1,
      ),
    })),
  );
  writeStore("cart:guest", []);
};
const privateUser = (u: DemoUser): User => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatar: u.avatar,
});
const error = (
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
) => HttpResponse.json({ code, message, fields }, { status });

export const handlers = [
  http.get("/api/session", async () => {
    await delay(180);
    const user = requireUser();
    return user
      ? HttpResponse.json({ user: privateUser(user) })
      : error(401, "SESSION_INVALID", "Sua sessão expirou. Entre novamente.");
  }),
  http.post("/api/auth/register", async ({ request }) => {
    await delay(250);
    const body = (await request.json()) as {
      name: string;
      email: string;
      password: string;
    };
    if (
      initialUsers.some(
        (u) => u.email.toLowerCase() === body.email.toLowerCase(),
      )
    )
      return error(409, "EMAIL_CONFLICT", "Este e-mail já está cadastrado.", {
        email: "E-mail já utilizado.",
      });
    if (body.password.length < 8)
      return error(422, "VALIDATION_ERROR", "Confira os campos.", {
        password: "Use ao menos 8 caracteres.",
      });
    const user: DemoUser = {
      id: `user-${Date.now()}`,
      name: body.name,
      email: body.email,
      passwordHash: await hashPassword(body.password),
      avatar: "/avatars/default.svg",
    };
    const users = readStore<DemoUser[]>("users", initialUsers);
    users.push(user);
    writeStore("users", users);
    mergeGuestCart(user.id);
    sessionStorage.setItem("forma.userId", user.id);
    sessionStorage.setItem("forma.session", `mock-${user.id}`);
    return HttpResponse.json({ user: privateUser(user) }, { status: 201 });
  }),
  http.post("/api/auth/login", async ({ request }) => {
    await delay(250);
    const body = (await request.json()) as { email: string; password: string };
    const users = readStore<DemoUser[]>("users", initialUsers);
    const passwordHash = await hashPassword(body.password);
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === body.email.toLowerCase() &&
        (u.passwordHash === passwordHash || u.password === body.password),
    );
    if (!user)
      return error(401, "INVALID_CREDENTIALS", "E-mail ou senha inválidos.");
    mergeGuestCart(user.id);
    sessionStorage.setItem("forma.userId", user.id);
    sessionStorage.setItem("forma.session", `mock-${user.id}`);
    return HttpResponse.json({ user: privateUser(user) });
  }),
  http.post("/api/auth/logout", () => {
    sessionStorage.removeItem("forma.userId");
    sessionStorage.removeItem("forma.session");
    return HttpResponse.json({ ok: true });
  }),
  http.get("/api/nfts", async ({ request }) => {
    const url = new URL(request.url);
    await delay(
      Number(
        url.searchParams.get("slow") === "1"
          ? 1500
          : url.searchParams.get("timeout") === "1"
            ? 9500
            : 220,
      ),
    );
    if (url.searchParams.get("fail") === "500")
      return error(500, "MOCK_SERVER_ERROR", "Falha simulada do servidor.");
    let items = getNFTs();
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const category = url.searchParams.get("category") ?? "Todas";
    const sort = url.searchParams.get("sort") ?? "featured";
    if (q)
      items = items.filter((n) =>
        `${n.name} ${n.artist} ${n.collection}`.toLowerCase().includes(q),
      );
    if (category !== "Todas")
      items = items.filter((n) => n.category === category);
    if (sort === "price-asc")
      items = [...items].sort((a, b) =>
        toUnits(a.price) < toUnits(b.price) ? -1 : 1,
      );
    if (sort === "price-desc")
      items = [...items].sort((a, b) =>
        toUnits(a.price) > toUnits(b.price) ? -1 : 1,
      );
    if (url.searchParams.get("empty") === "1") items = [];
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = 6;
    const total = items.length;
    return HttpResponse.json({
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total,
      page,
      pageSize,
    });
  }),
  http.get("/api/nfts/:id", async ({ params }) => {
    await delay(160);
    const nft = getNFTs().find((n) => n.id === params.id);
    return nft
      ? HttpResponse.json({ nft })
      : error(404, "NFT_NOT_FOUND", "Este NFT não foi encontrado.");
  }),
  http.get("/api/favorites", () => {
    const user = requireUser();
    if (!user)
      return error(401, "UNAUTHORIZED", "Entre para ver seus favoritos.");
    return HttpResponse.json({
      ids: readStore<string[]>(`favorites:${user.id}`, []),
    });
  }),
  http.post("/api/favorites/:id", ({ params }) => {
    const user = requireUser();
    if (!user)
      return error(401, "UNAUTHORIZED", "Entre para salvar favoritos.");
    const key = `favorites:${user.id}`;
    const ids = readStore<string[]>(key, []);
    const id = String(params.id);
    const next = ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id];
    writeStore(key, next);
    return HttpResponse.json({ ids: next });
  }),
  http.get("/api/cart", () => {
    const items = getCart()
      .map((item) => ({
        ...item,
        nft: getNFTs().find((n) => n.id === item.nftId),
      }))
      .filter((i) => i.nft);
    return HttpResponse.json({ items });
  }),
  http.post("/api/cart/items", async ({ request }) => {
    const body = (await request.json()) as CartItem;
    const nft = getNFTs().find((n) => n.id === body.nftId);
    if (!nft) return error(404, "NFT_NOT_FOUND", "NFT não encontrado.");
    const items = getCart();
    const existing = items.find((i) => i.nftId === body.nftId);
    const quantity = (existing?.quantity ?? 0) + body.quantity;
    if (quantity > nft.available)
      return error(
        409,
        "INSUFFICIENT_STOCK",
        `Há apenas ${nft.available} unidades disponíveis.`,
      );
    saveCart(
      existing
        ? items.map((i) => (i.nftId === body.nftId ? { ...i, quantity } : i))
        : [...items, body],
    );
    return HttpResponse.json({ items: getCart() }, { status: 201 });
  }),
  http.patch("/api/cart/items/:id", async ({ params, request }) => {
    const { quantity } = (await request.json()) as { quantity: number };
    const nft = getNFTs().find((n) => n.id === params.id);
    if (!nft || quantity > nft.available)
      return error(409, "INSUFFICIENT_STOCK", "Quantidade indisponível.");
    saveCart(
      getCart().map((i) =>
        i.nftId === params.id ? { ...i, quantity: Math.max(1, quantity) } : i,
      ),
    );
    return HttpResponse.json({ items: getCart() });
  }),
  http.delete("/api/cart/items/:id", ({ params }) => {
    saveCart(getCart().filter((i) => i.nftId !== params.id));
    return HttpResponse.json({ items: getCart() });
  }),
  http.post("/api/quote", async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as {
      coupon?: string;
      items?: CartItem[];
    };
    const cart = body.items ?? getCart();
    const nfts = getNFTs();
    let subtotal = 0n;
    for (const item of cart) {
      const nft = nfts.find((n) => n.id === item.nftId);
      if (!nft || item.quantity > nft.available)
        return error(
          409,
          "STOCK_CHANGED",
          "Preço ou disponibilidade mudou. Revise seu carrinho.",
        );
      subtotal += toUnits(multiplyEth(nft.price, item.quantity));
    }
    let discount = 0n;
    if (body.coupon) {
      if (body.coupon.toUpperCase() !== "FORMA10")
        return error(422, "INVALID_COUPON", "Cupom inválido ou expirado.");
      discount = subtotal / 10n;
    }
    const fee = subtotal / 100n;
    const total = subtotal - discount + fee;
    return HttpResponse.json({
      subtotal: fromUnits(subtotal),
      discount: fromUnits(discount),
      fee: fromUnits(fee),
      total: fromUnits(total),
      validUntil: Date.now() + 30_000,
    });
  }),
  http.get("/api/profile", () => {
    const user = requireUser();
    return user
      ? HttpResponse.json({ user: privateUser(user) })
      : error(401, "UNAUTHORIZED", "Entre para continuar.");
  }),
  http.patch("/api/profile", async ({ request }) => {
    const user = requireUser();
    if (!user) return error(401, "UNAUTHORIZED", "Entre para continuar.");
    const body = (await request.json()) as { name: string; avatar: string };
    const users = readStore<DemoUser[]>("users", initialUsers);
    const updated = users.map((u) =>
      u.id === user.id ? { ...u, ...body } : u,
    );
    writeStore("users", updated);
    return HttpResponse.json({
      user: privateUser(updated.find((u) => u.id === user.id)!),
    });
  }),
  http.patch("/api/profile/password", async ({ request }) => {
    const user = requireUser();
    if (!user) return error(401, "UNAUTHORIZED", "Entre para continuar.");
    const body = (await request.json()) as {
      currentPassword: string;
      newPassword: string;
    };
    const currentHash = await hashPassword(body.currentPassword);
    if (
      user.passwordHash
        ? user.passwordHash !== currentHash
        : user.password !== body.currentPassword
    )
      return error(
        422,
        "INVALID_CURRENT_PASSWORD",
        "A senha atual não confere.",
        { currentPassword: "Confira sua senha atual." },
      );
    if (body.newPassword.length < 8)
      return error(
        422,
        "VALIDATION_ERROR",
        "A nova senha deve ter pelo menos 8 caracteres.",
        { newPassword: "Use ao menos 8 caracteres." },
      );
    const users = readStore<DemoUser[]>("users", initialUsers);
    const nextHash = await hashPassword(body.newPassword);
    writeStore(
      "users",
      users.map((item) => {
        if (item.id !== user.id) return item;
        const updated: DemoUser = { ...item, passwordHash: nextHash };
        delete updated.password;
        return updated;
      }),
    );
    return HttpResponse.json({ ok: true });
  }),
  http.get("/api/wallets", () => {
    if (!requireUser())
      return error(401, "UNAUTHORIZED", "Entre para ver suas carteiras.");
    return HttpResponse.json({
      wallets: readStore<Wallet[]>(walletsKey(), initialWallets),
    });
  }),
  http.put("/api/wallets", async ({ request }) => {
    if (!requireUser())
      return error(401, "UNAUTHORIZED", "Entre para continuar.");
    const wallets = (await request.json()) as Wallet[];
    writeStore(walletsKey(), wallets);
    return HttpResponse.json({ wallets });
  }),
  http.post("/api/orders", async ({ request }) => {
    if (!requireUser())
      return error(401, "UNAUTHORIZED", "Entre para finalizar a compra.");
    const key = request.headers.get("Idempotency-Key");
    if (!key)
      return error(
        400,
        "IDEMPOTENCY_KEY_REQUIRED",
        "Chave de idempotência obrigatória.",
      );
    const body = (await request.json()) as {
      coupon?: string;
      paymentResult?: "confirmed" | "rejected" | "pending";
      expectedTotal?: string;
    };
    const orders = getUserOrders();
    const cart = getCart();
    const fingerprint = JSON.stringify({
      cart,
      coupon: body.coupon?.toUpperCase() ?? "",
      paymentResult: body.paymentResult ?? "confirmed",
      expectedTotal: body.expectedTotal ?? "",
    });
    const idempotencyKey = `idempotency:${currentUser()!.id}:${key}`;
    const previousAttempt = readStore<{
      fingerprint: string;
      order: Order;
    } | null>(idempotencyKey, null);
    if (previousAttempt)
      return previousAttempt.fingerprint === fingerprint
        ? HttpResponse.json({ order: previousAttempt.order })
        : error(
            409,
            "IDEMPOTENCY_CONFLICT",
            "Esta chave já foi utilizada com outro conteúdo.",
          );
    const prior = orders.find((o) => o.id === key);
    if (prior) return HttpResponse.json({ order: prior });
    if (!cart.length)
      return error(422, "EMPTY_CART", "Seu carrinho está vazio.");
    const nfts = getNFTs();
    let subtotal = 0n;
    const orderItems = [] as Order["items"];
    for (const item of cart) {
      const nft = nfts.find((n) => n.id === item.nftId);
      if (!nft || item.quantity > nft.available)
        return error(
          409,
          "STOCK_CHANGED",
          "A disponibilidade mudou. Revise o carrinho.",
        );
      subtotal += toUnits(multiplyEth(nft.price, item.quantity));
      orderItems.push({
        nft: { ...nft },
        quantity: item.quantity,
        unitPrice: nft.price,
      });
    }
    const discount =
      body.coupon?.toUpperCase() === "FORMA10" ? subtotal / 10n : 0n;
    const fee = subtotal / 100n;
    const calculatedTotal = fromUnits(subtotal - discount + fee);
    if (body.expectedTotal && body.expectedTotal !== calculatedTotal)
      return error(
        409,
        "QUOTE_CHANGED",
        "O preço ou as taxas mudaram. Revise o total e confirme novamente.",
      );
    if (body.coupon && body.coupon.toUpperCase() !== "FORMA10")
      return error(422, "INVALID_COUPON", "Cupom inválido ou expirado.");
    const status = body.paymentResult ?? "confirmed";
    const order: Order = {
      id: key,
      transactionId: `0x${crypto.randomUUID().replaceAll("-", "")}`,
      status,
      items: orderItems,
      subtotal: fromUnits(subtotal - discount),
      fee: fromUnits(fee),
      total: fromUnits(subtotal - discount + fee),
      createdAt: new Date().toISOString(),
      version: 1,
    };
    saveUserOrders([...orders, order]);
    writeStore(idempotencyKey, { fingerprint, order });
    if (status === "confirmed") {
      const remaining = cart.map((item) => ({
        ...item,
        quantity: item.quantity,
      }));
      saveCart(
        remaining.filter(
          (item) =>
            !cart.some(
              (c) => c.nftId === item.nftId && c.quantity === item.quantity,
            ),
        ),
      );
    }
    return HttpResponse.json({ order }, { status: 201 });
  }),
  http.get("/api/orders/:id", ({ params }) => {
    if (!requireUser())
      return error(401, "UNAUTHORIZED", "Entre para continuar.");
    const order = getUserOrders().find((o) => o.id === params.id);
    return order
      ? HttpResponse.json({ order })
      : error(404, "ORDER_NOT_FOUND", "Pedido não encontrado.");
  }),
  http.post("/api/dev/order-update", async ({ request }) => {
    const body = (await request.json()) as {
      orderId: string;
      status: "confirmed" | "rejected";
    };
    if (!requireUser())
      return error(401, "UNAUTHORIZED", "Entre para continuar.");
    const orders = getUserOrders();
    const order = orders.find((item) => item.id === body.orderId);
    if (!order) return error(404, "ORDER_NOT_FOUND", "Pedido não encontrado.");
    if (order.status !== "pending") return HttpResponse.json({ order });
    const updated: Order = {
      ...order,
      status: body.status,
      version: order.version + 1,
    };
    saveUserOrders(
      orders.map((item) => (item.id === order.id ? updated : item)),
    );
    if (updated.status === "confirmed") {
      const purchased = new Map(
        updated.items.map((item) => [item.nft.id, item.quantity]),
      );
      saveCart(
        getCart().flatMap((item) => {
          const bought = purchased.get(item.nftId) ?? 0;
          const left = item.quantity - bought;
          return left > 0 ? [{ ...item, quantity: left }] : [];
        }),
      );
    }
    return HttpResponse.json({ order: updated });
  }),
  http.post("/api/dev/reset", () => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("forma."))
      .forEach((key) => localStorage.removeItem(key));
    sessionStorage.clear();
    return HttpResponse.json({ ok: true });
  }),
  http.post("/api/dev/session-expire", () => {
    sessionStorage.removeItem("forma.session");
    sessionStorage.removeItem("forma.userId");
    return error(
      401,
      "SESSION_EXPIRED",
      "Sessão expirada por cenário de teste.",
    );
  }),
  http.post("/api/dev/nft-update", async ({ request }) => {
    const body = (await request.json()) as {
      id: string;
      price?: string;
      available?: number;
    };
    const nfts = getNFTs().map((n) =>
      n.id === body.id ? { ...n, ...body, version: n.version + 1 } : n,
    );
    saveNFTs(nfts);
    return HttpResponse.json({ nft: nfts.find((n) => n.id === body.id) });
  }),
];
