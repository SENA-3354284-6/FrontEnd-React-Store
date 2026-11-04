import { Link, useNavigate } from "react-router-dom";

import { getImageUrl } from "../../../api/client";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../../auth";
import { useCartActions } from "../../cart/hooks/useCart";
import type { Product } from "../../../types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCartActions();
  const navigate = useNavigate();

  const mainImage =
    product.images?.find((image) => image.isMain)?.url ?? product.images?.[0]?.url ?? "";
  const imageUrl = getImageUrl(mainImage);
  const outOfStock = (product.stock ?? 0) <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await addItem.mutateAsync({ product: product._id, quantity: 1 });
  };

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <span className="muted">Sin imagen</span>
        )}
      </Link>

      <div className="product-card-body">
        <span className="product-card-name">
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </span>

        <div className="row">
          <span className="price">${Number(product.price ?? 0).toFixed(2)}</span>
          {outOfStock ? <Badge tone="danger">Agotado</Badge> : <Badge tone="success">Disponible</Badge>}
        </div>

        <div className="product-card-footer">
          <Button
            size="sm"
            onClick={() => void handleAddToCart()}
            disabled={outOfStock || addItem.isPending}
          >
            {addItem.isPending ? "Agregando..." : "Agregar al carrito"}
          </Button>
          <Link to={`/products/${product._id}`} className="small">
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  );
}
