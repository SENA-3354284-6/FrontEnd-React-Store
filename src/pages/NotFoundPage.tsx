import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="empty-state">
      <div className="empty-icon">🧭</div>
      <h1 className="page-title">Página no encontrada</h1>
      <p className="muted">La ruta que buscas no existe en el servidor.</p>
      <Link to="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
}
