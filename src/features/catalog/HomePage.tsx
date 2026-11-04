import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { categoriesApi } from "../../api/categories.api";
import { productsApi } from "../../api/products.api";
import { Alert } from "../../components/ui/Alert";
import { Spinner } from "../../components/ui/Spinner";
import { ProductCard } from "../catalog/components/ProductCard";

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get("category") ?? undefined;

  const {
    data: products = [],
    isLoading: areProductsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products", "list"],
    queryFn: async () => {
      const response = await productsApi.list();
      return response.data.data ?? [];
    },
  });

  const {
    data: categories = [],
    isLoading: areCategoriesLoading,
  } = useQuery({
    queryKey: ["categories", "list"],
    queryFn: async () => {
      const response = await categoriesApi.list();
      return response.data.data ?? [];
    },
  });

  const visibleProducts = useMemo(() => {
    if (!categoryId) return products;
    return products.filter((product) => product.category === categoryId);
  }, [products, categoryId]);

  const handleSelectCategory = (id: string | undefined) => {
    if (id) {
      setSearchParams({ category: id });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div>
      <section className="hero">
        <h1>Descubre productos increíbles</h1>
        <p>
          Una tienda moderna construida con React 19, consumiendo una API REST con Flask y MongoDB.
        </p>
      </section>

      {!areCategoriesLoading && categories.length > 0 ? (
        <div className="row row-wrap" style={{ marginBottom: "1.5rem" }}>
          <button
            type="button"
            className={`btn btn-sm ${!categoryId ? "btn-primary" : "btn-secondary"}`}
            onClick={() => handleSelectCategory(undefined)}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              className={`btn btn-sm ${categoryId === category._id ? "btn-primary" : "btn-secondary"}`}
              onClick={() => handleSelectCategory(category._id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      ) : null}

      {areProductsLoading ? (
        <Spinner label="Cargando productos..." />
      ) : productsError ? (
        <Alert variant="error">No se pudo cargar el catálogo de productos.</Alert>
      ) : visibleProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <p className="mb-0">No hay productos para la categoría seleccionada.</p>
        </div>
      ) : (
        <div className="grid grid-products">
          {visibleProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
