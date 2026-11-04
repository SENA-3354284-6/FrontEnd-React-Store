import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cartApi } from "../../../api/cart.api";
import { useAuth } from "../../../auth";
import type { Cart, CartItem } from "../../../types";

export const cartQueryKey = ["cart"] as const;

export function useCart() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: cartQueryKey,
    queryFn: async (): Promise<Cart> => {
      const response = await cartApi.get();
      return response.data.data ?? { items: [] };
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });
}

export function useCartActions() {
  const queryClient = useQueryClient();

  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: cartQueryKey });

  const addItem = useMutation({
    mutationFn: async (item: CartItem) => {
      const response = await cartApi.sync([item]);
      return response.data.data ?? { items: [] };
    },
    onSuccess: () => {
      void invalidateCart();
    },
  });

  const updateItems = useMutation({
    mutationFn: async (items: CartItem[]) => {
      const response = await cartApi.update(items);
      return response.data.data ?? { items: [] };
    },
    onSuccess: () => {
      void invalidateCart();
    },
  });

  const removeItem = useMutation({
    mutationFn: async (productId: string) => {
      const response = await cartApi.removeItem(productId);
      return response.data.data ?? { items: [] };
    },
    onSuccess: () => {
      void invalidateCart();
    },
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      const response = await cartApi.clear();
      return response.data.data ?? { items: [] };
    },
    onSuccess: () => {
      void invalidateCart();
    },
  });

  return { addItem, updateItems, removeItem, clearCart };
}

export function useCartItemCount(): number {
  const { data } = useCart();
  return data?.items?.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0) ?? 0;
}
