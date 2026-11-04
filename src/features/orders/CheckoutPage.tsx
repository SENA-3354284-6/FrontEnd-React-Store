import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { ordersApi } from "../../api/orders.api";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Input";
import { useAuth } from "../../auth";
import { useCart } from "../cart/hooks/useCart";
import type { ShippingAddress } from "../../types";

const PAYMENT_METHODS = [
  { value: "MOCK_CARD", label: "Tarjeta de crédito/débito (mock)" },
  { value: "CASH_ON_DELIVERY", label: "Pago contra entrega" },
  { value: "WOMPI", label: "Wompi" },
  { value: "PAYPAL", label: "PayPal" },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading } = useCart();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address: "",
    city: "",
    phone: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("MOCK_CARD");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrder = useMutation({
    mutationFn: async (payload: {
      shippingAddress: ShippingAddress;
      paymentMethod: string;
      items?: { product: string; quantity: number }[];
    }) => {
      const response = await ordersApi.create(payload);
      return response;
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const items = (cart?.items ?? []).map((item) => ({
      product: item.product,
      quantity: Number(item.quantity) || 1,
    }));

    if (items.length === 0) {
      setError("No puede realizar una orden con un carrito vacío.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createOrder.mutateAsync({
        shippingAddress,
        paymentMethod,
        items,
      });

      const order = response.data.data;
      if (order?._id) {
        navigate(`/orders/${order._id}`, { replace: true });
      }    } catch (err) {
      setError("No se pudo procesar la orden de compra.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <Alert variant="error">Debe iniciar sesión para finalizar la compra.</Alert>;
  }

  if (isLoading) {
    return <div className="loading-state">Cargando carrito para el checkout...</div>;
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return <Alert variant="error">Su carrito está vacío. Agregue productos antes de comprar.</Alert>;
  }

  return (
    <div className="stack">
      <h1 className="page-title">Finalizar compra</h1>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card>
        <CardHeader title="Dirección de envío" />
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="address">Dirección</label>
            <Input
              id="address"
              value={shippingAddress.address}
              onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
              required
            />
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="city">Ciudad</label>
              <Input
                id="city"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="phone">Teléfono</label>
              <Input
                id="phone"
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="notes">Notas de entrega (opcional)</label>
            <Textarea
              id="notes"
              value={shippingAddress.notes}
              onChange={(e) => setShippingAddress({ ...shippingAddress, notes: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="paymentMethod">Método de pago</label>
            <Select id="paymentMethod" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </Select>
          </div>

          <Button type="submit" disabled={isSubmitting || createOrder.isPending}>
            {isSubmitting || createOrder.isPending ? "Procesando..." : "Crear orden"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
