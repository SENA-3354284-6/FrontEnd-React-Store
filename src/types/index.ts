export const ROLES = {
  SUPER_ADMIN: "super administrador",
  ADMIN: "administrator",
  EDITOR: "editor",
  AUTHOR: "author",
  CONTRIBUTOR: "contributor",
  SUBSCRIBER: "subscriber",
} as const;

export type RoleValue = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<string, string> = {
  [ROLES.SUPER_ADMIN]: "Super Administrador",
  [ROLES.ADMIN]: "Administrador",
  [ROLES.EDITOR]: "Editor",
  [ROLES.AUTHOR]: "Autor",
  [ROLES.CONTRIBUTOR]: "Contribuidor",
  [ROLES.SUBSCRIBER]: "Subscriptor",
};

export const ADMIN_ROLES: string[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

export interface User {
  _id?: string;
  id?: string;
  name: string;
  nickname: string;
  email: string;
  password?: string;
  role: string;
  status: boolean;
  avatarUrl?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  url: string;
  isMain: boolean;
}

export interface Product {
  _id: string;
  referenceCode: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  status: boolean;
  category?: string;
  images: ProductImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  urlImage: string;
  status: boolean;
}

export interface CartItem {
  product: string;
  quantity: number;
}

export interface Cart {
  _id?: string;
  user?: string;
  items: CartItem[];
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  address: string;
  city: string;
  phone: string;
  notes?: string;
}

export interface Order {
  _id: string;
  user?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  transactionId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface ApiResponse<T = unknown> {
  msg?: string;
  data?: T;
  errors?: Record<string, unknown> | string[];
}
