import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { categoriesApi } from "../../api/categories.api";
import { productsApi } from "../../api/products.api";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { useAuth } from "../../auth";
import type { ProductImage } from "../../types";
export function ProductFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const isEdit = Boolean(id);

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
    enabled: isEdit,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "list"],
    queryFn: async () => {
      const response = await categoriesApi.list();
      return response.data.data ?? [];
    },
  });

  const [form, setForm] = useState({
    referenceCode: "",
    name: "",
    description: "",
    price: "0",
    stock: "1",
    status: true,
    category: "",
  });
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deleteAllImages, setDeleteAllImages] = useState(false);
  const [deleteImageUrl, setDeleteImageUrl] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        referenceCode: product.referenceCode ?? "",
        name: product.name ?? "",
        description: product.description ?? "",
        price: String(product.price ?? 0),
        stock: String(product.stock ?? 1),
        status: product.status ?? true,
        category: typeof product.category === "string" ? product.category : String(product.category ?? ""),
      });
      setImages(product.images ?? []);
      setDeleteAllImages(false);
      setDeleteImageUrl("");
      setMainImageUrl("");
      setNewFiles([]);
    }
  }, [product]);

  if (!isAdmin) {
    return <Alert variant="error">No tiene permisos para administrar productos.</Alert>;
  }

  if (isEdit && isLoading) {
    return <Spinner label="Cargando producto..." />;
  }

  if (isEdit && productError) {
    return <Alert variant="error">No se pudo cargar el producto para editar.</Alert>;
  }

  const setField = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setNewFiles((prev) => [...prev, ...files].slice(0, 9));
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((image) => image.url !== url));
    setDeleteImageUrl(url);
    setDeleteAllImages(false);
    setMainImageUrl((prev) => (prev === url ? "" : prev));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      status: Boolean(form.status),
      category: form.category,
    };

    try {
      if (isEdit) {
        const hasImageActions = deleteAllImages || deleteImageUrl || mainImageUrl || newFiles.length > 0;

        if (!hasImageActions) {
          await productsApi.updateJson(id as string, {
            ...payload,
            ...(form.referenceCode ? { referenceCode: form.referenceCode } : {}),
            ...(deleteAllImages ? { deleteAllImages: true } : {}),
            ...(deleteImageUrl ? { deleteImageUrl } : {}),
            ...(mainImageUrl ? { mainImageUrl } : {}),
          });
          await queryClient.invalidateQueries({ queryKey: ["products"] });
          navigate("/admin/products");
          return;
        }

        const formData = new FormData();
        Object.entries({
          name: String(payload.name),
          description: String(payload.description),
          price: String(payload.price),
          stock: String(payload.stock),
          status: String(payload.status),
          category: String(payload.category),
        }).forEach(([key, value]) => formData.append(key, value));
        if (form.referenceCode) formData.append("referenceCode", form.referenceCode);
        if (deleteAllImages) formData.append("deleteAllImages", "true");
        if (deleteImageUrl) formData.append("deleteImageUrl", deleteImageUrl);
        if (mainImageUrl) formData.append("mainImageUrl", mainImageUrl);
        newFiles.forEach((file) => formData.append("images", file));

        await productsApi.update(id as string, formData);
        await queryClient.invalidateQueries({ queryKey: ["products"] });
        navigate("/admin/products");
        return;
      }

      if (newFiles.length === 0) {
        setError("El producto debe incluir al menos una imagen.");
        return;
      }

      const formData = new FormData();
      Object.entries({
        name: String(payload.name),
        description: String(payload.description),
        price: String(payload.price),
        stock: String(payload.stock),
        status: String(payload.status),
        category: String(payload.category),
      }).forEach(([key, value]) => formData.append(key, value));
      if (form.referenceCode) formData.append("referenceCode", form.referenceCode);
      newFiles.forEach((file) => formData.append("images", file));

      await productsApi.create(formData);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/admin/products");
    } catch (err) {
      setError("No se pudo guardar el producto. Verifique los datos e intente nuevamente.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && !product) {
    return <Alert variant="error">No se pudo encontrar el producto para editar.</Alert>;
  }

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? "Editar producto" : "Crear producto"}</h1>
        <Button variant="secondary" onClick={() => navigate("/admin/products")}>
          Volver
        </Button>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="card">
        <h3 className="card-title">Datos del producto</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="referenceCode">Referencia</label>
              <Input
                id="referenceCode"
                value={form.referenceCode}
                onChange={(e) => setField("referenceCode", e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="name">Nombre</label>
              <Input id="name" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="description">Descripción</label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="price">Precio</label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="stock">Stock</label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setField("stock", e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="category">Categoría</label>
              <Select id="category" value={form.category} onChange={(e) => setField("category", e.target.value)} required>
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="field">
              <label htmlFor="status">Estado</label>
              <Select
                id="status"
                value={String(form.status)}
                onChange={(e) => setField("status", e.target.value === "true")}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </Select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="images">Imágenes (máximo 9)</label>
            <Input id="images" type="file" accept="image/*" multiple onChange={handleFilesChange} />
          </div>

          {isEdit && images.length > 0 ? (
            <div className="field">
              <label>Imágenes actuales</label>
              <div className="image-preview-grid">
                {images.map((image) => (
                  <div key={image.url} className="image-preview">
                    <img src={image.url} alt={form.name} />
                    <span className="image-preview-main-tag">{image.isMain ? "Principal" : "Imagen"}</span>
                    <button
                      type="button"
                      className="image-preview-remove"
                      onClick={() => removeImage(image.url)}
                      aria-label="Eliminar imagen"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="row">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : isEdit ? "Actualizar producto" : "Crear producto"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate("/admin/products")}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
