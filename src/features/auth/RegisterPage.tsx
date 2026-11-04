import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../auth";
import { getApiErrorMessage } from "../../utils/apiError";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({ name, nickname, email, password, avatarUrl: avatarUrl || undefined });
      navigate("/", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo registrar el usuario"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card wide">
      <Card>
        <CardHeader title="Crear cuenta" />
        {error ? <Alert variant="error">{error}</Alert> : null}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="name">Nombre</label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </div>

            <div className="field">
              <label htmlFor="nickname">Nickname</label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                minLength={3}
                maxLength={20}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label htmlFor="avatarUrl">Avatar (ruta o URL)</label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="uploads/avatars/default-avatar.png"
            />
          </div>

          <Button type="submit" className="btn-block" disabled={isSubmitting}>
            {isSubmitting ? "Creando cuenta..." : "Registrarse"}
          </Button>
        </form>

        <hr className="divider" />

        <p className="mb-0 small muted">
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </Card>
    </div>
  );
}
