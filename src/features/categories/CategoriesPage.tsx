import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { categoriesApi } from "../../api/categories.api";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { getImageUrl } from "../../api/client";
import { Spinner } from "../../components/ui/Spinner";
import { useAuth } from "../../auth";
import type { Category } from "../../types";

export function CategoriesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const {
    data: categories = [],
    isLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories", "list"],
    queryFn: async () => {
      const response = await categoriesApi.list();
      return response.data.data ?? [];
    },
  });

  if (!isAdmin) {
    return <Alert variant="error">No tiene permisos para administrar categorías.</Alert>;
  }

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(`¿Eliminar la categoría "${category.name}"?`);
    if (!confirmed) return;

    try {
      await categoriesApi.remove(category._id);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">Categorías</h1>
        <Button onClick={() => navigate("/admin/categories/new")}>Nueva categoría</Button>
      </div>

      {categoriesError ? <Alert variant="error">No se pudo cargar las categorías.</Alert> : null}

      {isLoading ? (
        <Spinner label="Cargando categorías..." />
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {categories.map((category) => (
            <Card key={category._id}>
              <div className="row" style={{ alignItems: "flex-start" }}>
                <img
                  src={getImageUrl(category.urlImage)}
                  alt={category.name}
                  style={{ width: 72, height: 56, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }}
                />
                <div style={{ flex: 1 }}>
                  <h3 className="card-title mb-0">{category.name}</h3>
                  <p className="small muted mb-0">/{category.slug}</p>
                </div>
                <Badge tone={category.status ? "success" : "danger"}>{category.status ? "Activa" : "Inactiva"}</Badge>
              </div>
              <hr className="divider" />
              <div className="row">
                <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/categories/${category._id}/edit`)}>
                  Editar
                </Button>
                <Button size="sm" variant="danger" onClick={() => void handleDelete(category)}>
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
