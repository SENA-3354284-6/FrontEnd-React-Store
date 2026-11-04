import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { productsApi } from "../../api/products.api";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { getImageUrl } from "../../api/client";
import { Spinner } from "../../components/ui/Spinner";
import { useAuth } from "../../auth";
import type { Product } from "../../types";

export function ProductListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const {
    data: products = [],
    isLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products", "list"],
    queryFn: async () => {
      const response = await productsApi.list();
      return response.data.data ?? [];
    },
  });

  if (!isAdmin) {
    return <Alert variant="error">No tiene permisos para administrar productos.</Alert>;
  }

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`¿Eliminar el producto "${product.name}"?`);
    if (!confirmed) return;

    try {
      await productsApi.remove(product._id);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">Productos</h1>
        <Button onClick={() => navigate("/admin/products/new")}>Nuevo producto</Button>
      </div>

      {productsError ? <Alert variant="error">No se pudo cargar el listado de productos.</Alert> : null}

      {isLoading ? (
        <Spinner label="Cargando productos..." />
      ) : (
        <div className="grid grid-products">
          {products.map((product) => (
            <Card key={product._id}>
              <div className="row" style={{ alignItems: "flex-start" }}>
                <img
                  src={getImageUrl(product.images?.[0]?.url ?? "")}
                  alt={product.name}
                  style={{ width: 96, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }}
                />
                <div style={{ flex: 1 }}>
                  <h3 className="card-title mb-0">{product.name}</h3>
                  <p className="small muted mb-0">{product.referenceCode}</p>
                </div>
                <Badge tone={product.status ? "success" : "danger"}>{product.status ? "Activo" : "Inactivo"}</Badge>
              </div>

              <div className="row-between mt-2">
                <span className="price">${Number(product.price ?? 0).toFixed(2)}</span>
                <Badge tone={product.stock > 0 ? "info" : "danger"}>Stock: {product.stock ?? 0}</Badge>
              </div>

              <div className="row mt-2">
                <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/products/${product._id}/edit`)}>
                  Editar
                </Button>
                <Button size="sm" variant="danger" onClick={() => void handleDelete(product)}>
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
