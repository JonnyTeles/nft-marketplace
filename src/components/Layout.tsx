import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Search, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart, useSession } from "@/lib/hooks";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

export function Layout() {
  const { data: user } = useSession();
  const { data: cart = [] } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  async function logout() {
    await api.post("/auth/logout");
    queryClient.clear();
    setMenuOpen(false);
    await navigate({ to: "/" });
    window.location.reload();
  }
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="Forma NFT início">
            <span className="brand-word">KURIO</span>
          </Link>
          <nav
            className={`main-nav ${menuOpen ? "nav-open" : ""}`}
            aria-label="Navegação principal"
          >
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Início
            </Link>
            <a href="/#explore" onClick={() => setMenuOpen(false)}>
              Mercado
            </a>
            <Link to="/profile" onClick={() => setMenuOpen(false)}>
              Criadores
            </Link>
            <a href="/#collections" onClick={() => setMenuOpen(false)}>
              Aprenda
            </a>
          </nav>
          <div className="header-actions">
            <Link
              to="/"
              className="icon-button search-shortcut"
              aria-label="Buscar NFTs"
            >
              <Search size={19} />
            </Link>
            <Link
              to="/cart"
              className="icon-button cart-button"
              aria-label={`Carrinho com ${cart.length} tipos de itens`}
            >
              <ShoppingBag size={19} />
              {cart.length > 0 && (
                <span className="cart-count">{cart.length}</span>
              )}
            </Link>
            {user ? (
              <button
                className="avatar-button"
                onClick={() => navigate({ to: "/profile" })}
                aria-label={`Perfil de ${user.name}`}
              >
                <img src={user.avatar} alt="" />
              </button>
            ) : (
              <Link
                to="/login"
                search={{ redirect: "" }}
                className="button button-small"
              >
                Entrar
              </Link>
            )}
            <button
              className="mobile-menu icon-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <Link to="/" className="brand">
            <span className="brand-word">KURIO</span>
          </Link>
          <p>Arte digital para colecionar o futuro.</p>
          <span>© 2026 Forma Marketplace · Ambiente demonstrativo</span>
        </div>
      </footer>
      {user && (
        <button className="logout-floating" onClick={logout}>
          <LogOut size={15} /> Sair
        </button>
      )}
    </div>
  );
}
