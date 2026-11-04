import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { usersApi } from "../../api/users.api";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader } from "../../components/ui/Card";
import { getImageUrl } from "../../api/client";
import { Spinner } from "../../components/ui/Spinner";
import { useAuth } from "../../auth";
import type { User } from "../../types";

export function UsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const {
    data: users = [],
    isLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users", "list"],
    queryFn: async () => {
      const response = await usersApi.getAll();
      return response.data.data ?? [];
    },
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return <Alert variant="error">No tiene permisos para administrar usuarios.</Alert>;
  }

  const handleDelete = async (user: User) => {
    const confirmed = window.confirm(`¿Eliminar al usuario "${user.email}"?`);
    if (!confirmed) return;

    try {
      await usersApi.remove(user._id ?? "");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">Usuarios</h1>
        <Button onClick={() => navigate("/admin/users/new")}>Nuevo usuario</Button>
      </div>

      {usersError ? <Alert variant="error">No se pudo cargar la lista de usuarios.</Alert> : null}

      {isLoading ? (
        <Spinner label="Cargando usuarios..." />
      ) : (
        <Card>
          <CardHeader title="Listado de usuarios" />
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Nickname</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="row">
                        <img
                          src={getImageUrl(user.avatarUrl ?? user.avatar)}
                          alt={user.name}
                          className="navbar-avatar"
                          style={{ width: 28, height: 28 }}
                        />
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.nickname}</td>
                    <td>{user.email}</td>
                    <td>
                      <Badge tone="primary">{user.role}</Badge>
                    </td>
                    <td>
                      <Badge tone={user.status ? "success" : "danger"}>{user.status ? "Activo" : "Inactivo"}</Badge>
                    </td>
                    <td>
                      <div className="row">
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/users/${user._id}/edit`)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => void handleDelete(user)}>
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
