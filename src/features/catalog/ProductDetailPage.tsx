import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getImageUrl } from "../../api/client";
import { productsApi } from "../../api/products.api";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { useAuth } from "../../auth";
import { useCartActions } from "../cart/hooks/useCart";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCartActions();

  const {
    data: product,
    isLoading,
    error: productError,
  } = useQuery({
    queryKey: ["products", "detail", id],
    queryFn: async () => {
      const response = await productsApi.getById(id as string);
      const productData = response.data.data;
      if (!productData) {
        throw new Error(response.data?.msg ?? "No se pudo obtener el producto");
      }
      return productData;
    },
    enabled: Boolean(id),
  });

  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      const main = product.images?.find((image) => image.isMain)?.url ?? product.images?.[0]?.url ?? "";
      setSelectedImageUrl(main);
    }
  }, [product]);

  const mainImage = selectedImageUrl ?? product?.images?.find((image) => image.isMain)?.url ?? product?.images?.[0]?.url ?? "";
  const imageUrl = getImageUrl(mainImage);
  const outOfStock = (product?.stock ?? 0) <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await addItem.mutateAsync({ product: product?._id ?? id as string, quantity: 1 });
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await addItem.mutateAsync({ product: product?._id ?? id as string, quantity: 1 });
    navigate("/checkout");
  };

  if (isLoading) {
    return <Spinner label="Cargando producto..." />;
  }

  if (productError || !product) {
    return (
      <Alert variant="error">
        No se pudo cargar el producto.{" "}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>
          Volver al inicio
        </button>
      </Alert>
    );
  }

  const images = product.images ?? [];

  return (
    <div className="product-detail">
      <div className="product-gallery">
        <div className="product-gallery-main">
          {imageUrl ? <img src={imageUrl} alt={product.name} /> : <span className="muted">Sin imagen</span>}
        </div>

        {images.length > 1 ? (
          <div className="product-gallery-thumbs">
            {images.map((image) => (
              <button
                key={image.url}
                type="button"
                className={`product-gallery-thumb ${image.url === mainImage ? "active" : ""}`}
                onClick={() => setSelectedImageUrl(image.url)}
              >
                <img src={getImageUrl(image.url)} alt={product.name} />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <h1 className="page-title">{product.name}</h1>
        <p className="muted">{product.description}</p>

        <div className="row mb-2">
          <span className="price" style={{ fontSize: "1.6rem" }}>
            ${Number(product.price ?? 0).toFixed(2)}
          </span>
          {outOfStock ? <span className="badge badge-danger">Agotado</span> : null}
          <span className="badge badge-info">Stock: {product.stock ?? 0}</span>
        </div>

        <div className="row">
          <Button onClick={() => void handleAddToCart()} disabled={outOfStock || addItem.isPending}>
            {addItem.isPending ? "Agregando..." : "Agregar al carrito"}
          </Button>
          <Button variant="secondary" onClick={() => void handleBuyNow()} disabled={outOfStock || addItem.isPending}>
            Comprar ahora
          </Button>
        </div>
      </div>
    </div>
  );
}
