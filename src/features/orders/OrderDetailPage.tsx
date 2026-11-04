import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { ordersApi } from "../../api/orders.api";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { Card, CardHeader } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { useAuth } from "../../auth";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  const {
    data: order,
    isLoading,
    error: orderError,
  } = useQuery({
    queryKey: ["orders", "detail", id],
    queryFn: async () => {
      const response = await ordersApi.getById(id as string);
      const orderData = response.data.data;
      if (!orderData) throw new Error(response.data?.msg ?? "No se pudo obtener la orden");
      return orderData;
    },
    enabled: isAuthenticated && Boolean(id),
  });

  if (!isAuthenticated) {
    return <Alert variant="error">Debe iniciar sesión para ver el detalle de la orden.</Alert>;
  }

  if (isLoading) {
    return <Spinner label="Cargando orden..." />;
  }

  if (orderError || !order) {
    return <Alert variant="error">No se pudo cargar el detalle de la orden.</Alert>;
  }

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">Orden {order._id}</h1>
        <Badge tone={order.status === "PENDING" ? "warning" : "info"}>{order.status}</Badge>
      </div>

      <Card>
        <CardHeader title="Items" />
        {order.items?.map((item) => (
          <div key={item.product} className="row-between" style={{ padding: "0.35rem 0" }}>
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>${Number(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </Card>

      <Card>
        <CardHeader title="Dirección de envío" />
        <p className="mb-0">
          {order.shippingAddress?.address}, {order.shippingAddress?.city} — {order.shippingAddress?.phone}
        </p>
        {order.shippingAddress?.notes ? <p className="small muted mb-0">Notas: {order.shippingAddress.notes}</p> : null}
      </Card>

      <Card>
        <CardHeader title="Pago" />
        <p className="mb-0">
          Método: {order.paymentMethod} · Transacción: <span className="mono">{order.transactionId}</span>
        </p>
        <p className="mt-1 mb-0">
          Total: <span className="price">${Number(order.totalAmount ?? 0).toFixed(2)}</span>
        </p>
      </Card>
    </div>
  );
}
