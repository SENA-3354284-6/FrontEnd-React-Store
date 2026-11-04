import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "../components/layout/AppLayout";
import { RequireAdmin, RequireAuth } from "../components/layout/Guards";
import { HomePage } from "../features/catalog/HomePage";
import { ProductDetailPage } from "../features/catalog/ProductDetailPage";
import { ProductFormPage } from "../features/catalog/ProductFormPage";
import { ProductListPage } from "../features/catalog/ProductListPage";
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterPage } from "../features/auth/RegisterPage";
import { CartPage } from "../features/cart/CartPage";
import { CheckoutPage } from "../features/orders/CheckoutPage";
import { OrderDetailPage } from "../features/orders/OrderDetailPage";
import { OrdersPage } from "../features/orders/OrdersPage";
import { CategoriesPage } from "../features/categories/CategoriesPage";
import { CategoryFormPage } from "../features/categories/CategoryFormPage";
import { RolesPage } from "../features/roles/RolesPage";
import { UserFormPage } from "../features/users/UserFormPage";
import { UsersPage } from "../features/users/UsersPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products/:id", element: <ProductDetailPage /> },
      { path: "cart", element: <RequireAuth><CartPage /></RequireAuth> },
      { path: "checkout", element: <RequireAuth><CheckoutPage /></RequireAuth> },
      { path: "orders", element: <RequireAuth><OrdersPage /></RequireAuth> },
      { path: "orders/:id", element: <RequireAuth><OrderDetailPage /></RequireAuth> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },

      { path: "admin/users", element: <RequireAdmin><UsersPage /></RequireAdmin> },
      { path: "admin/users/new", element: <RequireAdmin><UserFormPage /></RequireAdmin> },
      { path: "admin/users/:id/edit", element: <RequireAdmin><UserFormPage /></RequireAdmin> },

      { path: "admin/products", element: <RequireAdmin><ProductListPage /></RequireAdmin> },
      { path: "admin/products/new", element: <RequireAdmin><ProductFormPage /></RequireAdmin> },
      { path: "admin/products/:id/edit", element: <RequireAdmin><ProductFormPage /></RequireAdmin> },

      { path: "admin/categories", element: <RequireAdmin><CategoriesPage /></RequireAdmin> },
      { path: "admin/categories/new", element: <RequireAdmin><CategoryFormPage /></RequireAdmin> },
      { path: "admin/categories/:id/edit", element: <RequireAdmin><CategoryFormPage /></RequireAdmin> },

      { path: "admin/roles", element: <RequireAdmin><RolesPage /></RequireAdmin> },

      { path: "not-found", element: <NotFoundPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
