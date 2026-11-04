import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getImageUrl } from "../../api/client";
import { productsApi } from "../../api/products.api";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../auth";
import { useCart, useCartActions } from "./hooks/useCart";
import type { CartItem } from "../../types";

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading, error } = useCart();
  const { updateItems, removeItem, clearCart } = useCartActions();

  const { data: products = [] } = useQuery({
    queryKey: ["products", "list"],
    queryFn: async () => {
      const response = await productsApi.list();
      return response.data.data ?? [];
    },
  });

  const items = cart?.items ?? [];

  const productById = (productId: string) => products.find((product) => product._id === productId);

  const handleQuantityChange = (item: CartItem, quantity: number) => {
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    updateItems.mutate(
      items.map((cartItem) =>
        cartItem.product === item.product ? { ...cartItem, quantity: safeQuantity } : cartItem
      )
    );
  };

  const handleRemove = (item: CartItem) => {
    removeItem.mutate(item.product);
  };

  const handleClear = () => {
    clearCart.mutate();
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (!isAuthenticated) {
    return <Alert variant="error">Debe iniciar sesión para ver su carrito de compras.</Alert>;
  }

  if (isLoading) {
    return <div className="loading-state">Cargando carrito...</div>;
  }

  if (error) {
    return <Alert variant="error">No se pudo cargar el carrito de compras.</Alert>;
  }

  const subtotal = items.reduce((acc, item) => {
    const product = productById(item.product);
    const unitPrice = product?.price ?? 0;
    return acc + unitPrice * (Number(item.quantity) || 0);
  }, 0);

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🛒</div>
        <h2 className="page-title">Tu carrito está vacío</h2>
        <p className="muted">Agrega productos desde el catálogo para comenzar.</p>
        <Button onClick={() => navigate("/")}>Ir al catálogo</Button>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">Carrito de compras</h1>
        <Button variant="secondary" size="sm" onClick={() => void handleClear()} disabled={clearCart.isPending}>
          Vaciar carrito
        </Button>
      </div>

      <Card>
        <CardHeader title={`${items.length} producto(s) en el carrito`} />
        <div className="stack">
          {items.map((item) => {
            const product = productById(item.product);
            const imageUrl = product ? getImageUrl(product.images?.[0]?.url ?? "") : "";
            const quantity = Number(item.quantity) || 0;
            const unitPrice = product?.price ?? 0;

            return (
              <div key={item.product} className="cart-item">
                {imageUrl ? (
                  <img src={imageUrl} alt={product?.name ?? "Producto"} className="cart-item-image" />
                ) : (
                  <div className="cart-item-image" />
                )}

                <div>
                  <h3 className="card-title mb-0">{product?.name ?? "Producto"}</h3>
                  <p className="small muted mb-0">Precio unitario: ${unitPrice.toFixed(2)}</p>
                  <div className="row mt-1">
                    <div className="qty-control">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item, quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <Input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(item, Number(e.target.value))}
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item, quantity + 1)}
                        disabled={Boolean(product && quantity >= product.stock)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="price">${(unitPrice * quantity).toFixed(2)}</div>
                  <Button size="sm" variant="danger" onClick={() => void handleRemove(item)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <hr className="divider" />
        <div className="row-between">
          <span className="total">
            Subtotal: <span className="price">${subtotal.toFixed(2)}</span>
          </span>
          <Button onClick={handleCheckout}>Ir a pagar</Button>
        </div>
      </Card>
    </div>
  );
}
