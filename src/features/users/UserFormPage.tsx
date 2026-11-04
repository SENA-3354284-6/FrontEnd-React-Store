import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { usersApi } from "../../api/users.api";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { useAuth } from "../../auth";
import { ROLE_LABELS } from "../../types";

const ALL_ROLES = [
  "super administrador",
  "administrator",
  "editor",
  "author",
  "contributor",
  "subscriber",
];

export function UserFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const isEdit = Boolean(id);

  const { data: user, isLoading, error: userError } = useQuery({
    queryKey: ["users", "detail", id],
    queryFn: async () => {
      const response = await usersApi.getById(id as string);
      const userData = response.data.data;
      if (!userData) throw new Error(response.data?.msg ?? "No se pudo obtener el usuario");
      return userData;
    },
    enabled: isEdit,
  });

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("subscriber");
  const [status, setStatus] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setNickname(user.nickname ?? "");
      setEmail(user.email ?? "");
      setPassword("");
      setRole(user.role ?? "subscriber");
      setStatus(user.status ?? true);
    }
  }, [user]);

  if (!isAdmin) {
    return <Alert variant="error">No tiene permisos para administrar usuarios.</Alert>;
  }

  if (isEdit && isLoading) {
    return <Spinner label="Cargando usuario..." />;
  }

  if (isEdit && userError) {
    return <Alert variant="error">No se pudo cargar el usuario para editar.</Alert>;
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAvatarFile(event.target.files?.[0] ?? null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isEdit) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("nickname", nickname);
        formData.append("email", email);
        formData.append("status", String(status));
        if (password) formData.append("password", password);
        formData.append("role", role);

        if (avatarFile) {
          formData.append("avatarUrl", avatarFile);
        }

        await usersApi.update(id as string, formData);
        await queryClient.invalidateQueries({ queryKey: ["users"] });
        navigate("/admin/users");
        return;
      }

      const createFormData = new FormData();
      createFormData.append("name", name);
      createFormData.append("nickname", nickname);
      createFormData.append("email", email);
      createFormData.append("password", password);
      createFormData.append("status", String(status));
      createFormData.append("role", role);
      if (avatarFile) createFormData.append("avatarUrl", avatarFile);

      await usersApi.create(createFormData);
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate("/admin/users");
    } catch (err) {
      setError("No se pudo guardar el usuario. Verifique los datos e intente nuevamente.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && !user) {
    return <Alert variant="error">No se pudo encontrar el usuario para editar.</Alert>;
  }

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? "Editar usuario" : "Crear usuario"}</h1>
        <Button variant="secondary" onClick={() => navigate("/admin/users")}>
          Volver
        </Button>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card>
        <CardHeader title="Datos del usuario" />
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="name">Nombre</label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="field">
              <label htmlFor="nickname">Nickname</label>
              <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} required />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isEdit}
                minLength={6}
              />
            </div>

            <div className="field">
              <label htmlFor="role">Rol</label>
              <Select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                {ALL_ROLES.map((roleValue) => (
                  <option key={roleValue} value={roleValue}>
                    {ROLE_LABELS[roleValue] ?? roleValue}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="status">Estado</label>
            <Select id="status" value={String(status)} onChange={(e) => setStatus(e.target.value === "true")}>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </Select>
          </div>

          <div className="field">
            <label htmlFor="avatar">Avatar</label>
            <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} />
          </div>

          <div className="row">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : isEdit ? "Actualizar usuario" : "Crear usuario"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate("/admin/users")}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
