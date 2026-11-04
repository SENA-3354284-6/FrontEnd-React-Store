import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { ordersApi } from "../../api/orders.api";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { Card, CardHeader } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { useAuth } from "../../auth";

export function OrdersPage() {
  const { isAuthenticated } = useAuth();

  const {
    data: orders = [],
    isLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["orders", "list"],
    queryFn: async () => {
      const response = await ordersApi.getAll();
      return response.data.data ?? [];
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <Alert variant="error">Debe iniciar sesión para ver sus pedidos.</Alert>;
  }

  if (isLoading) {
    return <Spinner label="Cargando pedidos..." />;
  }

  if (ordersError) {
    return <Alert variant="error">No se pudo cargar el historial de pedidos.</Alert>;
  }

  return (
    <div className="stack">
      <h1 className="page-title">Mis pedidos</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <p className="mb-0">Aún no tiene pedidos registrados.</p>
        </div>
      ) : (
        orders.map((order) => (
          <Card key={order._id}>
            <CardHeader
              title={
                <span className="mono">
                  {order._id}
                </span>
              }
              actions={
                <Badge tone={order.status === "PENDING" ? "warning" : "info"}>{order.status}</Badge>
              }
            />
            <p className="mb-1">Total: <span className="price">${Number(order.totalAmount ?? 0).toFixed(2)}</span></p>
            <p className="small muted mb-0">
              {order.items?.length ?? 0} producto(s) · Método de pago: {order.paymentMethod}
            </p>
            <hr className="divider" />
            <Link to={`/orders/${order._id}`}>Ver detalle</Link>
          </Card>
        ))
      )}
    </div>
  );
}
