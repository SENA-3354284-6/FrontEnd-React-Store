import { useQuery } from "@tanstack/react-query";

import { rolesApi } from "../../api/roles.api";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { Card, CardHeader } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

export function RolesPage() {
  const {
    data: roles = [],
    isLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ["roles", "list"],
    queryFn: async () => {
      const response = await rolesApi.list();
      return response.data.data ?? [];
    },
  });

  if (isLoading) {
    return <Spinner label="Cargando roles..." />;
  }

  if (rolesError) {
    return <Alert variant="error">No se pudo cargar el listado de roles.</Alert>;
  }

  return (
    <div className="stack">
      <h1 className="page-title">Roles</h1>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader
              title={role.name}
              actions={<Badge tone="primary">{role.id}</Badge>}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
