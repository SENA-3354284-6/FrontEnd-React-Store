import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { categoriesApi } from "../../api/categories.api";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { useAuth } from "../../auth";

export function CategoryFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const isEdit = Boolean(id);

  const { data: category, isLoading, error: categoryError } = useQuery({
    queryKey: ["categories", "detail", id],
    queryFn: async () => {
      const response = await categoriesApi.getById(id as string);
      const categoryData = response.data.data;
      if (!categoryData) throw new Error(response.data?.msg ?? "No se pudo obtener la categoría");
      return categoryData;
    },
    enabled: isEdit,
  });

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name ?? "");
      setSlug(category.slug ?? "");
      setDescription(category.description ?? "");
      setStatus(category.status ?? true);
    }
  }, [category]);

  if (!isAdmin) {
    return <Alert variant="error">No tiene permisos para administrar categorías.</Alert>;
  }

  if (isEdit && isLoading) {
    return <Spinner label="Cargando categoría..." />;
  }

  if (isEdit && categoryError) {
    return <Alert variant="error">No se pudo cargar la categoría para editar.</Alert>;
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImageFile(event.target.files?.[0] ?? null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const finalSlug = slug.trim() || name.trim().toLowerCase().replace(/\s+/g, "-");

      if (isEdit) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("slug", finalSlug);
        formData.append("description", description);
        formData.append("status", String(status));
        if (imageFile) formData.append("urlImage", imageFile);

        await categoriesApi.update(id as string, formData);
        await queryClient.invalidateQueries({ queryKey: ["categories"] });
      } else {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("slug", finalSlug);
        formData.append("description", description);
        formData.append("status", String(status));
        if (imageFile) formData.append("urlImage", imageFile);

        await categoriesApi.create(formData);
        await queryClient.invalidateQueries({ queryKey: ["categories"] });
      }

      navigate("/admin/categories");
    } catch (err) {
      setError("No se pudo guardar la categoría. Verifique los datos e intente nuevamente.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && !category) {
    return <Alert variant="error">No se pudo encontrar la categoría para editar.</Alert>;
  }

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? "Editar categoría" : "Nueva categoría"}</h1>
        <Button variant="secondary" onClick={() => navigate("/admin/categories")}>
          Volver
        </Button>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card>
        <CardHeader title="Datos de la categoría" />
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Nombre</label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="slug">Slug</label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="description">Descripción</label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="status">Estado</label>
            <Select id="status" value={String(status)} onChange={(e) => setStatus(e.target.value === "true")}>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </Select>
          </div>

          <div className="field">
            <label htmlFor="image">Imagen</label>
            <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          <div className="row">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : isEdit ? "Actualizar categoría" : "Crear categoría"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate("/admin/categories")}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
