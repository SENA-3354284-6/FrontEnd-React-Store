import { NavLink, Link } from "react-router-dom";

import { useAuth } from "../../auth";
import { useCartItemCount } from "../../features/cart/hooks/useCart";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const itemCount = useCartItemCount();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-badge">S</span>
          React Store
        </Link>

        <nav className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}>
            Inicio
          </NavLink>
          {isAuthenticated ? (
            <NavLink
              to="/orders"
              className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}
            >
              Mis pedidos
            </NavLink>
          ) : null}
          {isAdmin ? (
            <NavLink
              to="/admin/products"
              className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}
            >
              Administración
            </NavLink>
          ) : null}
        </nav>

        <div className="navbar-actions">
          <Link to="/cart" className="navbar-link navbar-cart-link">
            🛒 Carrito
            {itemCount > 0 ? <span className="cart-badge">{itemCount}</span> : null}
          </Link>

          {isAuthenticated && user ? (
            <div className="navbar-user">
              <img
                src={user.avatarUrl ?? user.avatar ?? ""}
                alt={user.name}
                className="navbar-avatar"
              />
              <span className="small">{user.nickname}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  logout();
                  void window.location.assign("/");
                }}
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="row">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Iniciar sesión
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
