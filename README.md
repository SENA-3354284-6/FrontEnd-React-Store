# React-Store (Frontend)

Frontend de la tienda construido con **React 19**, **React Router 7**, **TypeScript**, **Vite 6**, **Axios** y **TanStack Query**.

Consume la API REST del proyecto `Python-API-Store` (Flask + MongoDB).

## Requisitos

- Node.js 18+ (recomendado 20+)
- npm 9+
- Backend de la API corriendo en `http://localhost:3001`

## Levantar el proyecto

```bash
npm install
npm run dev
```

El servidor de desarrollo queda en `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3001
```

## Stack y librerías

| Librería | Uso |
| --- | --- |
| `react` / `react-dom` v19 | UI y renderizado |
| `react-router-dom` v7 | Routing (data router con `createBrowserRouter`) |
| `@tanstack/react-query` v5 | Estado del servidor / fetching de datos |
| `axios` | Cliente HTTP con interceptores (header `X-Token`) |
| `vite` + `@vitejs/plugin-react` | Build y tooling |
| `typescript` | Tipado estático |

## Arquitectura de archivos

```
React-Store/
├── index.html
├── vite.config.ts
└── src/
    ├── api/            # Cliente axios + endpoints por entidad
    ├── auth/           # AuthContext, sesión, token (renovación)
    ├── components/
    │   ├── layout/     # AppLayout, Navbar, Footer, guards
    │   └── ui/         # Componentes base (Button, Input, Card, Alert, Spinner, Badge)
    ├── features/       # Módulos por funcionalidad
    │   ├── auth/       # Login / Register
    │   ├── catalog/    # Home, detalle de producto, list/form admin
    │   ├── cart/       # Carrito + hooks
    │   ├── categories/ # Categorías admin
    │   ├── orders/     # Checkout, pedidos, detalle
    │   ├── roles/      # Roles
    │   └── users/      # Usuarios admin
    ├── pages/          # Páginas transversales (404)
    ├── routes/         # Definición del router
    ├── styles/         # Estilos globales
    ├── types/          # Modelos de la API
    └── utils/          # Helpers (errores, cn)
```

## Rutas implementadas

| Ruta | Descripción |
| --- | --- |
| `/` | Catálogo de productos con filtro por categoría |
| `/products/:id` | Detalle de producto |
| `/cart` | Carrito de compras (protegido) |
| `/checkout` | Finalizar compra / crear orden (protegido) |
| `/orders` | Historial de pedidos (protegido) |
| `/orders/:id` | Detalle de orden (protegido) |
| `/login` | Iniciar sesión |
| `/register` | Registrarse |
| `/admin/users` | Gestión de usuarios (rol admin) |
| `/admin/users/new` | Crear usuario (rol admin) |
| `/admin/users/:id/edit` | Editar usuario (rol admin) |
| `/admin/products` | Listado de productos (rol admin) |
| `/admin/products/new` | Crear producto (rol admin) |
| `/admin/products/:id/edit` | Editar producto (rol admin) |
| `/admin/categories` | Gestión de categorías (rol admin) |
| `/admin/categories/new` | Crear categoría (rol admin) |
| `/admin/categories/:id/edit` | Editar categoría (rol admin) |
| `/admin/roles` | Listado de roles (rol admin) |
| `/not-found` | Página 404 |

## Convenciones

- El token JWT se guarda en `localStorage` bajo la clave `token` e se envía en el header `X-Token`.
- Las respuestas de error de la API se leen de `response.data.msg`.
- Los datos del servidor se cachean con TanStack Query (query keys por recurso).
