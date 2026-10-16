import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
  Wallet as WalletIcon,
  AlertCircle,
  RefreshCw,
  Heart,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, errorMessage } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { simulateNftUpdate, simulateOrderUpdate } from "@/lib/realtime";
import {
  useAddCart,
  useCart,
  useCartQuantity,
  useFavorites,
  useNFT,
  useNFTs,
  useOrder,
  useProfileUpdate,
  useRegister,
  useRemoveCart,
  useSession,
  useLogin,
  useWallets,
} from "@/lib/hooks";
import { formatEth, multiplyEth } from "@/lib/money";
import type { Order, Wallet } from "@/types";
import { NFTCard } from "@/components/NFTCard";
import { Button } from "@/components/ui/button";

function ErrorNotice({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-notice" role="alert">
      <AlertCircle size={18} />
      <span>{message}</span>
      {onRetry && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="text-button"
        >
          <RefreshCw size={14} /> Tentar novamente
        </Button>
      )}
    </div>
  );
}
function LoadingGrid() {
  return (
    <div className="nft-grid">
      {Array.from({ length: 6 }, (_, i) => (
        <div className="nft-skeleton" key={i}>
          <div className="skeleton skeleton-art" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </div>
      ))}
    </div>
  );
}

export function HomePage() {
  const url = new URL(window.location.href);
  const [q, setQ] = useState(url.searchParams.get("q") ?? "");
  const [category, setCategory] = useState(
    url.searchParams.get("category") ?? "Todas",
  );
  const [sort, setSort] = useState(url.searchParams.get("sort") ?? "featured");
  const [page, setPage] = useState(Number(url.searchParams.get("page") ?? 1));
  const params = useMemo(
    () => ({ q, category, sort, page }),
    [q, category, sort, page],
  );
  const query = useNFTs(params);
  function update(next: Partial<typeof params>) {
    const values = {
      ...params,
      ...next,
      page:
        next.page ??
        (next.q !== undefined ||
        next.category !== undefined ||
        next.sort !== undefined
          ? 1
          : params.page),
    };
    const search = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (
        value &&
        !(key === "category" && value === "Todas") &&
        !(key === "sort" && value === "featured") &&
        !(key === "page" && value === 1)
      )
        search.set(key, String(value));
    });
    const nextUrl = `${window.location.pathname}${search.size ? `?${search.toString()}` : ""}`;
    window.history[next.q !== undefined ? "replaceState" : "pushState"](
      {},
      "",
      nextUrl,
    );
    setQ(values.q);
    setCategory(values.category);
    setSort(values.sort);
    setPage(values.page);
  }
  useEffect(() => {
    const restore = () => {
      const u = new URL(window.location.href);
      setQ(u.searchParams.get("q") ?? "");
      setCategory(u.searchParams.get("category") ?? "Todas");
      setSort(u.searchParams.get("sort") ?? "featured");
      setPage(Number(u.searchParams.get("page") ?? 1));
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  const featured = query.data?.items[0];
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span className="live-dot" /> O futuro é colecionável
          </span>
          <h1>
            Arte que existe
            <br />
            além do <em>visível.</em>
          </h1>
          <p>
            Descubra peças digitais únicas, criadas por artistas que estão
            redefinindo os limites da imaginação.
          </p>
          <a className="button" href="#explore">
            Explorar coleção <ArrowRight size={17} />
          </a>
          <div className="hero-stats">
            <div>
              <strong>
                2.4k<span>+</span>
              </strong>
              <small>Obras digitais</small>
            </div>
            <div>
              <strong>860</strong>
              <small>Artistas</small>
            </div>
            <div>
              <strong>18k</strong>
              <small>Colecionadores</small>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-image-card">
            <img
              src={featured?.image ?? "/artworks/aurora.svg"}
              alt="Arte abstrata em destaque"
            />
            <div className="hero-art-tag">
              <span className="tag-pulse" /> PEÇA EM DESTAQUE
            </div>
            <div className="hero-art-caption">
              <div>
                <span>COLEÇÃO DO MÊS</span>
                <strong>{featured?.name ?? "Aurora Fragment #08"}</strong>
                <small>por {featured?.artist ?? "Lia Monteiro"}</small>
              </div>
              <span className="hero-art-price">
                {formatEth(featured?.price ?? "0.82")}
              </span>
            </div>
          </div>
          <div className="floating-note">
            <span className="note-icon">
              <SparkleIcon />
            </span>
            <span>
              <strong>Curadoria independente</strong>
              <small>Feito para descobrir</small>
            </span>
          </div>
        </div>
      </section>
      <section className="trust-strip">
        <span>
          <ShieldCheck size={16} /> Coleções selecionadas
        </span>
        <span>
          <CheckCircle2 size={16} /> Compra simulada e segura
        </span>
        <span>
          <WalletIcon size={16} /> Carteiras digitais
        </span>
        <span>
          <SparkleIcon /> Novos artistas toda semana
        </span>
      </section>
      <section className="catalog-section section-wrap" id="explore">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A GALERIA DIGITAL</span>
            <h2>Explore as obras</h2>
            <p>Peças que merecem um lugar na sua coleção.</p>
          </div>
          <span className="result-count">
            {query.data?.total ?? "—"} obras encontradas
          </span>
        </div>
        <div className="catalog-toolbar">
          <label className="search-field">
            <SearchIcon />
            <input
              aria-label="Buscar NFTs"
              placeholder="Buscar obra, artista ou coleção..."
              value={q}
              onChange={(e) => update({ q: e.target.value })}
            />
            {q && (
              <button
                aria-label="Limpar busca"
                onClick={() => update({ q: "" })}
              >
                ×
              </button>
            )}
          </label>
          <div className="filter-row">
            <div className="category-tabs" aria-label="Filtrar por categoria">
              {["Todas", "Arte", "3D", "Colecionáveis"].map((item) => (
                <button
                  key={item}
                  className={
                    category === item ? "category-tab active" : "category-tab"
                  }
                  onClick={() => update({ category: item })}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="sort-select">
              <span>Ordenar</span>
              <select
                aria-label="Ordenar obras"
                value={sort}
                onChange={(e) => update({ sort: e.target.value })}
              >
                <option value="featured">Em destaque</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
        </div>
        {query.isLoading ? (
          <LoadingGrid />
        ) : query.isError ? (
          <ErrorNotice
            message={errorMessage(query.error)}
            onRetry={() => query.refetch()}
          />
        ) : query.data?.items.length ? (
          <div className="nft-grid">
            {query.data.items.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">
              <SearchIcon />
            </span>
            <h3>Nenhuma obra encontrada</h3>
            <p>Tente mudar os termos da busca ou os filtros selecionados.</p>
            <button
              className="button button-outline"
              onClick={() =>
                update({ q: "", category: "Todas", sort: "featured" })
              }
            >
              Limpar filtros
            </button>
          </div>
        )}
        {query.data && query.data.total > query.data.pageSize && (
          <div className="pagination">
            <span>
              Página {page} de{" "}
              {Math.ceil(query.data.total / query.data.pageSize)}
            </span>
            <div>
              <button
                className="icon-button"
                disabled={page <= 1}
                onClick={() => update({ page: page - 1 })}
                aria-label="Página anterior"
              >
                <ArrowLeft size={17} />
              </button>
              <button
                className="icon-button"
                disabled={
                  page >= Math.ceil(query.data.total / query.data.pageSize)
                }
                onClick={() => update({ page: page + 1 })}
                aria-label="Próxima página"
              >
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}
      </section>
      <section className="artist-cta section-wrap" id="collections">
        <div>
          <span className="eyebrow">PARA QUEM CRIA</span>
          <h2>Seu próximo artista favorito está aqui.</h2>
          <p>
            Descubra novas perspectivas, apoie criadores independentes e monte
            uma coleção com a sua identidade.
          </p>
        </div>
        <a className="button button-light" href="#explore">
          Conhecer artistas <ArrowRight size={17} />
        </a>
      </section>
    </>
  );
}
function SparkleIcon() {
  return (
    <span className="sparkle-glyph" aria-hidden="true">
      ✳
    </span>
  );
}
function SearchIcon() {
  return (
    <span className="search-glyph" aria-hidden="true">
      ⌕
    </span>
  );
}

export function DetailPage() {
  const { nftId } = useParams({ from: "/nft/$nftId" });
  const query = useNFT(nftId);
  const add = useAddCart();
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");
  const nft = query.data;
  if (query.isLoading)
    return (
      <div className="section-wrap detail-loading">
        <div className="skeleton skeleton-detail" />
        <div>
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
        </div>
      </div>
    );
  if (query.isError || !nft)
    return (
      <div className="section-wrap">
        <ErrorNotice
          message={errorMessage(query.error)}
          onRetry={() => query.refetch()}
        />
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Voltar ao catálogo
        </Link>
      </div>
    );
  return (
    <section className="section-wrap detail-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Voltar para explorar
      </Link>
      <div className="detail-layout">
        <div className="detail-image-frame">
          <img src={nft.image} alt={`Arte digital ${nft.name}`} />
          <span className="image-index">01 / 01</span>
        </div>
        <div className="detail-info">
          <span className="eyebrow">{nft.collection.toUpperCase()}</span>
          <h1>{nft.name}</h1>
          <p className="detail-artist">
            Criado por <strong>{nft.artist}</strong>
          </p>
          <p className="detail-description">{nft.description}</p>
          <div className="detail-metadata">
            <div>
              <span>Edição total</span>
              <strong>{nft.edition} unidades</strong>
            </div>
            <div>
              <span>Disponibilidade</span>
              <strong>{nft.available} restantes</strong>
            </div>
            <div>
              <span>Categoria</span>
              <strong>{nft.category}</strong>
            </div>
          </div>
          <div className="purchase-box">
            <span>Preço por unidade</span>
            <strong className="detail-price">{formatEth(nft.price)}</strong>
            <div className="purchase-controls">
              <div className="quantity-control">
                <button
                  aria-label="Diminuir quantidade"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((v) => v - 1)}
                >
                  <Minus size={15} />
                </button>
                <span>{quantity}</span>
                <button
                  aria-label="Aumentar quantidade"
                  disabled={quantity >= nft.available}
                  onClick={() => setQuantity((v) => v + 1)}
                >
                  <Plus size={15} />
                </button>
              </div>
              <span className="stock-label">Máx. {nft.available}</span>
            </div>
            <button
              className="button button-full"
              disabled={add.isPending || nft.available < 1}
              onClick={() =>
                add.mutate(
                  { nftId: nft.id, quantity },
                  {
                    onSuccess: () => setNotice("Obra adicionada ao carrinho."),
                    onError: (e) => setNotice(errorMessage(e)),
                  },
                )
              }
            >
              {add.isPending ? "Adicionando..." : "Adicionar ao carrinho"}{" "}
              <ArrowRight size={17} />
            </button>
            {notice && (
              <p
                className={add.isError ? "inline-error" : "inline-success"}
                role="status"
              >
                {notice}
              </p>
            )}
            <button
              type="button"
              className="text-button simulate-update"
              onClick={() => simulateNftUpdate(nft.id)}
            >
              Simular alteração de preço / estoque
            </button>
            <p className="purchase-note">
              <ShieldCheck size={14} /> Transação demonstrativa. Nenhuma
              criptomoeda real será cobrada.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CartPage() {
  const { data: items = [], isLoading, isError, refetch } = useCart();
  const update = useCartQuantity();
  const remove = useRemoveCart();
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [discount, setDiscount] = useState("0");
  const quote = useQuery({
    queryKey: [
      "quote",
      coupon,
      items.map((i) => `${i.nftId}:${i.quantity}`).join(","),
    ],
    queryFn: async () =>
      (
        await api.post("/quote", {
          coupon: coupon || undefined,
          items: items.map(({ nftId, quantity }) => ({ nftId, quantity })),
        })
      ).data as {
        subtotal: string;
        discount: string;
        fee: string;
        total: string;
      },
    enabled: items.length > 0,
    retry: false,
  });
  useEffect(() => {
    if (quote.data) setDiscount(quote.data.discount);
  }, [quote.data]);
  async function applyCoupon() {
    setCouponError("");
    try {
      await api.post("/quote", {
        coupon: couponInput,
        items: items.map(({ nftId, quantity }) => ({ nftId, quantity })),
      });
      setCoupon(couponInput.toUpperCase());
    } catch (e) {
      setCouponError(errorMessage(e));
      setCoupon("");
    }
  }
  if (isLoading)
    return (
      <div className="section-wrap">
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-detail" />
      </div>
    );
  if (isError)
    return (
      <div className="section-wrap">
        <ErrorNotice
          message="Não foi possível carregar seu carrinho."
          onRetry={() => refetch()}
        />
      </div>
    );
  const subtotal = quote.data?.subtotal ?? "0";
  const fee = quote.data?.fee ?? "0";
  const total = quote.data?.total ?? "0";
  return (
    <section className="section-wrap cart-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">SUA SELEÇÃO</span>
          <h1>
            Carrinho <span className="title-muted">({items.length})</span>
          </h1>
          <p>Revise suas obras antes de continuar.</p>
        </div>
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Continuar explorando
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="empty-state cart-empty">
          <span className="empty-icon">
            <ShoppingBagIcon />
          </span>
          <h2>Seu carrinho está vazio</h2>
          <p>Encontre uma obra que tenha a sua cara.</p>
          <Link to="/" className="button">
            Explorar obras <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map(({ nft, nftId, quantity }) => (
              <article className="cart-item" key={nftId}>
                <Link to="/nft/$nftId" params={{ nftId }}>
                  <img src={nft.image} alt={nft.name} />
                </Link>
                <div className="cart-item-main">
                  <span className="eyebrow">{nft.collection}</span>
                  <Link
                    to="/nft/$nftId"
                    params={{ nftId }}
                    className="cart-item-title"
                  >
                    {nft.name}
                  </Link>
                  <span className="artist-line">por {nft.artist}</span>
                  <div className="cart-mobile-price">
                    {formatEth(multiplyEth(nft.price, quantity))}
                  </div>
                  <div className="quantity-control">
                    <button
                      aria-label={`Diminuir quantidade de ${nft.name}`}
                      disabled={quantity <= 1 || update.isPending}
                      onClick={() =>
                        update.mutate({ id: nftId, quantity: quantity - 1 })
                      }
                    >
                      <Minus size={14} />
                    </button>
                    <span>{quantity}</span>
                    <button
                      aria-label={`Aumentar quantidade de ${nft.name}`}
                      disabled={quantity >= nft.available || update.isPending}
                      onClick={() =>
                        update.mutate({ id: nftId, quantity: quantity + 1 })
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="cart-item-end">
                  <strong>{formatEth(multiplyEth(nft.price, quantity))}</strong>
                  <span>{formatEth(nft.price)} cada</span>
                  <button
                    className="remove-button"
                    onClick={() => remove.mutate(nftId)}
                    aria-label={`Remover ${nft.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
            <div className="coupon-box">
              <div>
                <strong>Tem um cupom?</strong>
                <span>Experimente FORMA10 para 10% de desconto.</span>
              </div>
              <div className="coupon-form">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Código do cupom"
                  aria-label="Código do cupom"
                />
                <button
                  className="button button-outline button-small"
                  onClick={applyCoupon}
                >
                  Aplicar
                </button>
              </div>
              {coupon && (
                <p className="inline-success" role="status">
                  Cupom {coupon} aplicado.
                </p>
              )}
              {couponError && (
                <p className="inline-error" role="alert">
                  {couponError}
                </p>
              )}
            </div>
          </div>
          <aside className="order-summary">
            <h2>Resumo do pedido</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatEth(subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Desconto</span>
              <strong className="discount-value">
                − {formatEth(discount)}
              </strong>
            </div>
            <div className="summary-row">
              <span>Taxa de rede estimada</span>
              <strong>{formatEth(fee)}</strong>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>Total</span>
              <strong>{formatEth(total)}</strong>
            </div>
            {quote.isError && (
              <ErrorNotice message={errorMessage(quote.error)} />
            )}
            <Link
              to="/checkout"
              search={{ coupon }}
              className="button button-full"
            >
              Ir para pagamento <ArrowRight size={17} />
            </Link>
            <p className="secure-note">
              <ShieldCheck size={15} /> Checkout protegido por simulação
            </p>
            <div className="accepted-payments">
              <span>FORMAS DE PAGAMENTO</span>
              <div>
                <WalletIcon size={17} /> Carteira digital{" "}
                <CreditCard size={17} /> ETH simulado
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
function ShoppingBagIcon() {
  return <span aria-hidden="true">♧</span>;
}

export function CheckoutPage() {
  const { data: user, isLoading: sessionLoading } = useSession();
  const { data: cart = [], isLoading: cartLoading } = useCart();
  const { data: wallets = [] } = useWallets();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [walletId, setWalletId] = useState("");
  const [network, setNetwork] = useState("Ethereum");
  const [paymentResult, setPaymentResult] = useState<
    "confirmed" | "rejected" | "pending"
  >("confirmed");
  const [coupon, setCoupon] = useState(
    new URLSearchParams(window.location.search).get("coupon") ?? "",
  );
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);
  useEffect(() => {
    if (wallets.length && !walletId)
      setWalletId(wallets.find((w) => w.primary)?.id ?? wallets[0].id);
  }, [wallets, walletId]);
  const quote = useQuery({
    queryKey: [
      "checkout-quote",
      coupon,
      cart.map((i) => `${i.nftId}:${i.quantity}`).join(","),
    ],
    queryFn: async () =>
      (
        await api.post("/quote", {
          coupon: coupon || undefined,
          items: cart.map(({ nftId, quantity }) => ({ nftId, quantity })),
        })
      ).data as {
        subtotal: string;
        discount: string;
        fee: string;
        total: string;
        validUntil: number;
      },
    enabled: cart.length > 0,
    retry: false,
  });
  const order = useMutation({
    mutationFn: async () => {
      const key =
        sessionStorage.getItem("forma.pendingOrderKey") ?? crypto.randomUUID();
      sessionStorage.setItem("forma.pendingOrderKey", key);
      return (
        await api.post(
          "/orders",
          {
            coupon: coupon || undefined,
            paymentResult,
            expectedTotal: quote.data?.total,
          },
          { headers: { "Idempotency-Key": key } },
        )
      ).data.order as Order;
    },
    onSuccess: async (result) => {
      sessionStorage.removeItem("forma.pendingOrderKey");
      await qc.invalidateQueries({ queryKey: ["cart"] });
      await qc.invalidateQueries({ queryKey: ["nfts"] });
      navigate({
        to: "/confirmation/$orderId",
        params: { orderId: result.id },
      });
    },
    onError: (e) => {
      setError(errorMessage(e));
      quote.refetch();
    },
  });
  if (sessionLoading || cartLoading)
    return (
      <div className="section-wrap">
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-detail" />
      </div>
    );
  if (!user)
    return (
      <div className="section-wrap empty-state">
        <h2>Entre para finalizar sua compra</h2>
        <p>Seu carrinho será preservado enquanto você entra.</p>
        <Link to="/login" search={{ redirect: "/checkout" }} className="button">
          Entrar para continuar
        </Link>
      </div>
    );
  if (!cart.length)
    return (
      <div className="section-wrap empty-state">
        <h2>Não há itens para pagar</h2>
        <p>Adicione uma obra ao carrinho antes de seguir.</p>
        <Link to="/" className="button">
          Explorar obras
        </Link>
      </div>
    );
  return (
    <section className="section-wrap checkout-page">
      <Link to="/cart" className="back-link">
        <ArrowLeft size={16} /> Voltar ao carrinho
      </Link>
      <div className="page-title-row">
        <div>
          <span className="eyebrow">QUASE LÁ</span>
          <h1>Finalizar compra</h1>
          <p>Confira seus dados e revise o pedido.</p>
        </div>
        <div className="checkout-step">
          <span className="step-done">
            <Check size={14} />
          </span>
          <span className="step-current">02</span>
          <span>Pagamento</span>
        </div>
      </div>
      <div className="checkout-layout">
        <div className="checkout-main">
          <form
            className="checkout-panel"
            onSubmit={(e) => {
              e.preventDefault();
              setError("");
              if (!name.trim() || !email.includes("@") || !walletId) {
                setError("Preencha todos os campos obrigatórios.");
                return;
              }
              order.mutate();
            }}
          >
            <div className="panel-heading">
              <span className="panel-number">01</span>
              <div>
                <h2>Dados do colecionador</h2>
                <p>As informações para registrar sua compra.</p>
              </div>
            </div>
            <div className="form-grid">
              <label className="field full-field">
                Nome completo
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </label>
              <label className="field full-field">
                E-mail
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </label>
            </div>
            <div className="panel-heading panel-heading-spaced">
              <span className="panel-number">02</span>
              <div>
                <h2>Carteira digital</h2>
                <p>Escolha uma carteira simulada para esta compra.</p>
              </div>
              <Link to="/wallets" className="text-button">
                Gerenciar
              </Link>
            </div>
            {wallets.length ? (
              <div className="wallet-options">
                {wallets.map((wallet) => (
                  <label
                    className={`wallet-option ${walletId === wallet.id ? "selected" : ""}`}
                    key={wallet.id}
                  >
                    <input
                      type="radio"
                      name="wallet"
                      value={wallet.id}
                      checked={walletId === wallet.id}
                      onChange={() => {
                        setWalletId(wallet.id);
                        setNetwork(wallet.network);
                      }}
                    />
                    <span className="wallet-symbol">
                      <WalletIcon size={19} />
                    </span>
                    <span className="wallet-details">
                      <strong>
                        {wallet.name}
                        {wallet.primary && <em>Principal</em>}
                      </strong>
                      <small>
                        {wallet.address.slice(0, 8)}...
                        {wallet.address.slice(-6)}
                      </small>
                    </span>
                    <span className="radio-indicator" />
                  </label>
                ))}
              </div>
            ) : (
              <p className="muted-box">
                Você ainda não cadastrou uma carteira.{" "}
                <Link to="/wallets">Adicionar carteira</Link>
              </p>
            )}
            <div className="form-grid network-row">
              <label className="field">
                Rede blockchain
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                >
                  <option>Ethereum</option>
                  <option>Polygon</option>
                  <option>Sepolia (teste)</option>
                </select>
              </label>
              <label className="field">
                Cupom de desconto
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="FORMA10"
                />
              </label>
            </div>
            <div className="simulation-box">
              <span className="simulation-icon">
                <RefreshCw size={18} />
              </span>
              <div>
                <strong>Simulação de pagamento</strong>
                <p>
                  Escolha o resultado para testar o fluxo. Nenhuma transação
                  real será enviada.
                </p>
                <div className="simulation-options">
                  <label>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentResult === "confirmed"}
                      onChange={() => setPaymentResult("confirmed")}
                    />{" "}
                    Confirmar pagamento
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentResult === "rejected"}
                      onChange={() => setPaymentResult("rejected")}
                    />{" "}
                    Recusar pagamento
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentResult === "pending"}
                      onChange={() => setPaymentResult("pending")}
                    />{" "}
                    Deixar pendente
                  </label>
                </div>
              </div>
            </div>
            {error && <ErrorNotice message={error} />}
            <button
              type="submit"
              className="button button-full"
              disabled={order.isPending || !walletId || quote.isLoading}
            >
              {order.isPending
                ? "Processando pedido..."
                : `Confirmar compra · ${formatEth(quote.data?.total ?? "0")}`}{" "}
              <ArrowRight size={17} />
            </button>
            <p className="secure-note">
              <ShieldCheck size={15} /> Ao confirmar, você concorda com os
              termos da demonstração.
            </p>
          </form>
        </div>
        <aside className="order-summary checkout-summary">
          <h2>Seu pedido</h2>
          {cart.map(({ nft, nftId, quantity }) => (
            <div className="checkout-item" key={nftId}>
              <img src={nft.image} alt="" />
              <div>
                <strong>{nft.name}</strong>
                <span>
                  {quantity} × {formatEth(nft.price)}
                </span>
              </div>
              <b>{formatEth(multiplyEth(nft.price, quantity))}</b>
            </div>
          ))}
          <div className="summary-divider" />
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatEth(quote.data?.subtotal ?? "0")}</strong>
          </div>
          <div className="summary-row">
            <span>Desconto</span>
            <strong className="discount-value">
              − {formatEth(quote.data?.discount ?? "0")}
            </strong>
          </div>
          <div className="summary-row">
            <span>Taxa de rede</span>
            <strong>{formatEth(quote.data?.fee ?? "0")}</strong>
          </div>
          <div className="summary-divider" />
          <div className="summary-row summary-total">
            <span>Total</span>
            <strong>{formatEth(quote.data?.total ?? "0")}</strong>
          </div>
          {quote.isError && (
            <ErrorNotice
              message={errorMessage(quote.error)}
              onRetry={() => quote.refetch()}
            />
          )}
          <p className="secure-note">
            <ShieldCheck size={15} /> O preço será revalidado ao confirmar.
          </p>
        </aside>
      </div>
    </section>
  );
}

export function ConfirmationPage() {
  const { orderId } = useParams({ from: "/confirmation/$orderId" });
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);
  if (isLoading)
    return (
      <div className="section-wrap">
        <div className="skeleton skeleton-detail" />
      </div>
    );
  if (isError || !order)
    return (
      <div className="section-wrap">
        <ErrorNotice
          message="Não foi possível recuperar este pedido."
          onRetry={() => refetch()}
        />
        <Link to="/" className="button">
          Voltar ao início
        </Link>
      </div>
    );
  const confirmed = order.status === "confirmed";
  const pending = order.status === "pending";
  return (
    <section className="section-wrap confirmation-page">
      <div
        className={`confirmation-icon ${confirmed ? "confirmed" : pending ? "pending" : "rejected"}`}
      >
        {confirmed ? <CheckCircle2 size={35} /> : <AlertCircle size={35} />}
      </div>
      <span className="eyebrow">
        PEDIDO #{order.id.slice(0, 8).toUpperCase()}
      </span>
      <h1>
        {confirmed
          ? "Sua obra já é sua."
          : pending
            ? "Pagamento em processamento"
            : "Pagamento não aprovado"}
      </h1>
      <p className="confirmation-subtitle">
        {confirmed
          ? "A compra foi confirmada na simulação. Seu recibo está pronto."
          : pending
            ? "O pedido continua pendente. Você pode simular a confirmação ou a recusa para testar a recuperação do estado."
            : "A simulação recusou o pagamento. Seus itens continuam no carrinho para você tentar novamente."}
      </p>
      <div className="receipt-card">
        <div className="receipt-header">
          <div>
            <span>RECIBO DIGITAL</span>
            <strong>{new Date(order.createdAt).toLocaleString("pt-BR")}</strong>
          </div>
          <span
            className={`status-pill ${confirmed ? "status-success" : "status-failed"}`}
          >
            {confirmed ? "Confirmado" : pending ? "Pendente" : "Recusado"}
          </span>
        </div>
        <div className="receipt-items">
          {order.items.map(({ nft, quantity, unitPrice }) => (
            <div className="receipt-item" key={nft.id}>
              <img src={nft.image} alt="" />
              <div>
                <strong>{nft.name}</strong>
                <span>
                  {quantity} unidade(s) · {formatEth(unitPrice)}
                </span>
              </div>
              <b>{formatEth(multiplyEth(unitPrice, quantity))}</b>
            </div>
          ))}
        </div>
        <div className="summary-row">
          <span>Subtotal após desconto</span>
          <strong>{formatEth(order.subtotal)}</strong>
        </div>
        <div className="summary-row">
          <span>Taxa de rede</span>
          <strong>{formatEth(order.fee)}</strong>
        </div>
        <div className="summary-divider" />
        <div className="summary-row summary-total">
          <span>Total</span>
          <strong>{formatEth(order.total)}</strong>
        </div>
        <div className="transaction-row">
          <div>
            <span>IDENTIFICADOR DA TRANSAÇÃO</span>
            <code>{order.transactionId}</code>
          </div>
          <button
            className="icon-button"
            aria-label="Copiar identificador"
            onClick={() => navigator.clipboard?.writeText(order.transactionId)}
          >
            <Copy size={16} />
          </button>
        </div>
        <p className="receipt-disclaimer">
          Este recibo e o identificador são simulados para fins de avaliação.
          Nenhuma operação ocorreu em uma blockchain real.
        </p>
      </div>
      <div className="confirmation-actions">
        {pending && (
          <>
            <button
              className="button"
              onClick={() => simulateOrderUpdate(order.id, "confirmed")}
            >
              Simular confirmação
            </button>
            <button
              className="button button-outline"
              onClick={() => simulateOrderUpdate(order.id, "rejected")}
            >
              Simular recusa
            </button>
          </>
        )}
        <Link to="/" className="button button-outline">
          Voltar para explorar
        </Link>
        {!confirmed && (
          <Link to="/cart" className="button button-outline">
            Voltar ao carrinho
          </Link>
        )}
      </div>
    </section>
  );
}

function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="auth-page section-wrap">
      <div className="auth-decoration">
        <div className="auth-art">
          <img src="/artworks/aurora.svg" alt="Arte abstrata" />
        </div>
        <span className="eyebrow">ARTE SEM FRONTEIRAS</span>
        <h2>
          Uma nova forma
          <br />
          de colecionar.
        </h2>
        <p>
          Descubra artistas, encontre peças únicas e construa uma coleção que
          conta a sua história.
        </p>
      </div>
      <div className="auth-form-wrap">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Voltar ao início
        </Link>
        <div className="auth-form">
          <span className="eyebrow">BEM-VINDO À FORMA</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          {children}
        </div>
      </div>
    </section>
  );
}
export function LoginPage() {
  const login = useLogin();
  const navigate = useNavigate();
  const [email, setEmail] = useState("jonny@demo.com");
  const [password, setPassword] = useState("Demo123!");
  const [error, setError] = useState("");
  return (
    <AuthShell
      title="Entre na sua conta"
      subtitle="Continue de onde sua próxima coleção começa."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          login.mutate(
            { email, password },
            {
              onSuccess: () => {
                if (
                  new URLSearchParams(window.location.search).get(
                    "redirect",
                  ) === "/checkout"
                )
                  window.location.assign("/checkout");
                else navigate({ to: "/profile" });
              },
              onError: (err) => setError(errorMessage(err)),
            },
          );
        }}
      >
        <label className="field">
          E-mail
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          Senha
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <ErrorNotice message={error} />}
        <button
          className="button button-full"
          type="submit"
          disabled={login.isPending}
        >
          {login.isPending ? "Entrando..." : "Entrar"} <ArrowRight size={17} />
        </button>
        <div className="demo-credentials">
          <strong>Conta de demonstração</strong>
          <span>E-mail: jonny@demo.com</span>
          <span>Senha: Demo123!</span>
        </div>
        <p className="auth-switch">
          Ainda não tem uma conta? <Link to="/register">Criar conta</Link>
        </p>
      </form>
    </AuthShell>
  );
}
export function RegisterPage() {
  const register = useRegister();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  return (
    <AuthShell
      title="Crie sua conta"
      subtitle="Um universo de arte digital espera por você."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          register.mutate(
            { name, email, password },
            {
              onSuccess: () => navigate({ to: "/profile" }),
              onError: (err) => setError(errorMessage(err)),
            },
          );
        }}
      >
        <label className="field">
          Nome completo
          <input
            required
            minLength={2}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="field">
          E-mail
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          Senha
          <input
            required
            type="password"
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <small>Use pelo menos 8 caracteres.</small>
        </label>
        {error && <ErrorNotice message={error} />}
        <button
          className="button button-full"
          type="submit"
          disabled={register.isPending}
        >
          {register.isPending ? "Criando conta..." : "Criar conta"}{" "}
          <ArrowRight size={17} />
        </button>
        <p className="auth-switch">
          Já tem uma conta? <Link search={{ redirect: "" }} to="/login">Entrar</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function ProfilePage() {
  const { data: user, isLoading, isError } = useSession();
  const update = useProfileUpdate();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [notice, setNotice] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const navigate = useNavigate();
  const passwordChange = useMutation({
    mutationFn: () =>
      api.patch("/profile/password", { currentPassword, newPassword }),
    onSuccess: () => {
      setPasswordNotice("Senha alterada com sucesso.");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (e) => setPasswordNotice(errorMessage(e)),
  });
  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatar(user.avatar);
    }
  }, [user]);
  if (isLoading)
    return (
      <div className="section-wrap">
        <div className="skeleton skeleton-detail" />
      </div>
    );
  if (isError || !user)
    return (
      <div className="section-wrap empty-state">
        <h2>Entre para acessar sua conta</h2>
        <p>Seu perfil, carteiras e favoritos ficam disponíveis após o login.</p>
        <Link to="/login" search={{ redirect: "" }} className="button">
          Entrar
        </Link>
      </div>
    );
  return (
    <section className="section-wrap account-page">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">ESPAÇO DO COLECIONADOR</span>
          <h1>Minha conta</h1>
          <p>Gerencie seus dados e suas preferências.</p>
        </div>
      </div>
      <div className="account-layout">
        <aside className="account-nav">
          <div className="account-user">
            <img src={user.avatar} alt="" />
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <a className="account-nav-link active" href="#profile">
            Meu perfil
          </a>
          <Link className="account-nav-link" to="/wallets">
            Minhas carteiras <ArrowRight size={15} />
          </Link>
          <Link className="account-nav-link" to="/favorites">
            Obras favoritas <ArrowRight size={15} />
          </Link>
          <button
            className="account-nav-link"
            onClick={async () => {
              await api.post("/auth/logout");
              sessionStorage.clear();
              queryClient.clear();
              navigate({ to: "/" });
            }}
          >
            Sair da conta
          </button>
        </aside>
        <div className="account-content">
          <div className="account-panel" id="profile">
            <div className="panel-heading">
              <span className="panel-number">01</span>
              <div>
                <h2>Informações pessoais</h2>
                <p>Atualize os dados associados à sua conta.</p>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setNotice("");
                update.mutate(
                  { name, avatar },
                  {
                    onSuccess: () =>
                      setNotice("Perfil atualizado com sucesso."),
                    onError: (e) => setNotice(errorMessage(e)),
                  },
                );
              }}
            >
              <div className="avatar-edit">
                <img src={avatar} alt="Prévia do avatar" />
                <label className="field">
                  URL do avatar
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                  />
                </label>
              </div>
              <label className="field">
                Nome completo
                <input
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="field">
                E-mail
                <input disabled value={user.email} />
                <small>
                  O e-mail não pode ser alterado nesta demonstração.
                </small>
              </label>
              {notice && (
                <p
                  className={update.isError ? "inline-error" : "inline-success"}
                  role="status"
                >
                  {notice}
                </p>
              )}
              <button className="button" disabled={update.isPending}>
                {update.isPending ? "Salvando..." : "Salvar alterações"}
              </button>
            </form>
          </div>
          <div className="account-panel">
            <div className="panel-heading">
              <span className="panel-number">02</span>
              <div>
                <h2>Segurança</h2>
                <p>Gerencie o acesso à sua conta.</p>
              </div>
            </div>
            <p className="security-info">
              <ShieldCheck size={18} /> Sua conta usa credenciais fictícias do
              ambiente de demonstração.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPasswordNotice("");
                passwordChange.mutate();
              }}
            >
              <label className="field">
                Senha atual
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </label>
              <label className="field">
                Nova senha
                <input
                  required
                  minLength={8}
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <small>Use pelo menos 8 caracteres.</small>
              </label>
              {passwordNotice && (
                <p
                  className={
                    passwordChange.isError ? "inline-error" : "inline-success"
                  }
                  role="status"
                >
                  {passwordNotice}
                </p>
              )}
              <button
                className="button button-outline"
                disabled={passwordChange.isPending}
              >
                {passwordChange.isPending ? "Atualizando..." : "Alterar senha"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WalletsPage() {
  const { data: user, isLoading: sessionLoading } = useSession();
  const { data: wallets = [], isLoading, isError, refetch } = useWallets();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("Ethereum");
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const save = useMutation({
    mutationFn: async (next: Wallet[]) =>
      (await api.put("/wallets", next)).data.wallets as Wallet[],
    onSuccess: (next) => {
      qc.setQueryData(["wallets"], next);
      setEditing(null);
      setName("");
      setAddress("");
      setNotice("Carteiras atualizadas.");
    },
  });
  if (sessionLoading || isLoading)
    return (
      <div className="section-wrap">
        <div className="skeleton skeleton-detail" />
      </div>
    );
  if (!user)
    return (
      <div className="section-wrap empty-state">
        <h2>Entre para gerenciar suas carteiras</h2>
        <Link to="/login" search={{ redirect: "" }} className="button">
          Entrar
        </Link>
      </div>
    );
  function submit(e: FormEvent) {
    e.preventDefault();
    const next = editing
      ? wallets.map((w) =>
          w.id === editing ? { ...w, name, address, network } : w,
        )
      : [
          ...wallets,
          {
            id: crypto.randomUUID(),
            name,
            address,
            network,
            primary: wallets.length === 0,
          },
        ];
    save.mutate(next);
  }
  return (
    <section className="section-wrap account-page">
      <Link to="/profile" className="back-link">
        <ArrowLeft size={16} /> Minha conta
      </Link>
      <div className="page-title-row">
        <div>
          <span className="eyebrow">PAGAMENTO</span>
          <h1>Minhas carteiras</h1>
          <p>Cadastre carteiras para usar no checkout simulado.</p>
        </div>
      </div>
      {isError && (
        <ErrorNotice
          message="Não foi possível carregar suas carteiras."
          onRetry={() => refetch()}
        />
      )}
      <div className="wallets-layout">
        <div className="wallet-list">
          {wallets.map((wallet) => (
            <article className="saved-wallet" key={wallet.id}>
              <div className="wallet-symbol">
                <WalletIcon size={21} />
              </div>
              <div className="saved-wallet-info">
                <strong>
                  {wallet.name} {wallet.primary && <em>Principal</em>}
                </strong>
                <span>{wallet.network}</span>
                <code>{wallet.address}</code>
              </div>
              <button
                className="button button-outline button-small"
                onClick={() => {
                  setEditing(wallet.id);
                  setName(wallet.name);
                  setAddress(wallet.address);
                  setNetwork(wallet.network);
                  setNotice("");
                }}
              >
                Editar
              </button>
            </article>
          ))}
          {wallets.length > 1 && (
            <button
              className="text-button"
              onClick={() =>
                save.mutate(
                  wallets.map((w) => ({
                    ...w,
                    primary: w.id === wallets.find((x) => !x.primary)?.id,
                  })),
                )
              }
            >
              Definir outra como principal
            </button>
          )}
        </div>
        <form className="account-panel wallet-form" onSubmit={submit}>
          <div className="panel-heading">
            <span className="panel-number">{editing ? "02" : "01"}</span>
            <div>
              <h2>{editing ? "Editar carteira" : "Adicionar carteira"}</h2>
              <p>Use endereços fictícios para a demonstração.</p>
            </div>
          </div>
          <label className="field">
            Nome da carteira
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Minha carteira"
            />
          </label>
          <label className="field">
            Endereço público
            <input
              required
              minLength={10}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
            />
          </label>
          <label className="field">
            Rede
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
            >
              <option>Ethereum</option>
              <option>Polygon</option>
              <option>Sepolia (teste)</option>
            </select>
          </label>
          {notice && (
            <p className="inline-success" role="status">
              {notice}
            </p>
          )}
          <button className="button button-full" disabled={save.isPending}>
            {save.isPending
              ? "Salvando..."
              : editing
                ? "Salvar carteira"
                : "Adicionar carteira"}
          </button>
          {editing && (
            <button
              type="button"
              className="text-button cancel-edit"
              onClick={() => {
                setEditing(null);
                setName("");
                setAddress("");
              }}
            >
              Cancelar edição
            </button>
          )}
        </form>
      </div>
    </section>
  );
}

export function FavoritesPage() {
  const { data: user, isLoading: sessionLoading } = useSession();
  const { data: ids = [], isLoading, isError, refetch } = useFavorites();
  const nfts = useNFTs({ q: "", category: "Todas", sort: "featured", page: 1 });
  if (sessionLoading || isLoading || nfts.isLoading)
    return (
      <div className="section-wrap">
        <LoadingGrid />
      </div>
    );
  if (!user)
    return (
      <div className="section-wrap empty-state">
        <Heart size={30} />
        <h2>Entre para ver seus favoritos</h2>
        <Link to="/login" search={{ redirect: "" }} className="button">
          Entrar
        </Link>
      </div>
    );
  const favorites = nfts.data?.items.filter((n) => ids.includes(n.id)) ?? [];
  return (
    <section className="section-wrap catalog-section">
      <Link to="/profile" className="back-link">
        <ArrowLeft size={16} /> Minha conta
      </Link>
      <div className="section-heading">
        <div>
          <span className="eyebrow">SUA CURADORIA</span>
          <h1>Obras favoritas</h1>
          <p>As peças que você guardou para depois.</p>
        </div>
      </div>
      {isError && (
        <ErrorNotice
          message="Não foi possível carregar os favoritos."
          onRetry={() => refetch()}
        />
      )}
      {favorites.length ? (
        <div className="nft-grid">
          {favorites.map((n) => (
            <NFTCard nft={n} key={n.id} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Heart size={30} />
          <h2>Você ainda não salvou obras</h2>
          <p>Use o coração nas obras para montar sua lista.</p>
          <Link to="/" className="button">
            Explorar obras
          </Link>
        </div>
      )}
    </section>
  );
}
export function NotFoundPage() {
  return (
    <div className="section-wrap empty-state not-found">
      <span className="eyebrow">ERRO 404</span>
      <h1>Essa página saiu da galeria.</h1>
      <p>O endereço pode estar incorreto ou a obra não existe mais.</p>
      <Link to="/" className="button">
        Voltar para o início <ArrowRight size={17} />
      </Link>
    </div>
  );
}
