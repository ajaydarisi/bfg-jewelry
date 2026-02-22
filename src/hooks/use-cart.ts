"use client";

import { createClient } from "@/lib/supabase/client";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./use-auth";

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CART_STORAGE_KEY = "bhagylakshmi-future-gold-cart";

export const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

function getLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setLocalCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

const supabase = createClient();

export function useCartProvider(): CartContextType {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const prevUserIdRef = useRef<string | null>(null);
  // Use ref for stable access to items in callbacks without re-creating them
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const fetchCartFromDB = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("cart_items")
      .select("id, quantity, product_id, product:products(*)")
      .eq("user_id", userId);

    if (data) {
      const cartItems: CartItem[] = (data as { id: string; quantity: number; product_id: string; product: unknown }[])
        .filter((item) => item.product)
        .map((item) => ({
          id: item.id,
          product: item.product as Product,
          quantity: item.quantity,
        }));
      setItems(cartItems);
    }
  }, []);

  const mergeLocalCartToDB = useCallback(async (userId: string) => {
    const localItems = getLocalCart();
    if (localItems.length === 0) return;

    const upsertItems = localItems.map((item) => ({
      user_id: userId,
      product_id: item.product.id,
      quantity: item.quantity,
    }));
    await supabase
      .from("cart_items")
      .upsert(upsertItems, { onConflict: "user_id,product_id" });

    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  // Initialize cart
  useEffect(() => {
    if (authLoading) return;

    const userId = user?.id ?? null;
    if (userId === prevUserIdRef.current) return;
    prevUserIdRef.current = userId;

    if (userId) {
      mergeLocalCartToDB(userId)
        .then(() => fetchCartFromDB(userId))
        .finally(() => setIsLoading(false));
    } else {
      Promise.resolve().then(() => {
        setItems(getLocalCart());
        setIsLoading(false);
      });
    }
  }, [user?.id, authLoading, fetchCartFromDB, mergeLocalCartToDB]);

  const addItem = useCallback(
    async (product: Product, quantity = 1) => {
      const currentItems = itemsRef.current;
      const existing = currentItems.find((i) => i.product.id === product.id);

      // Optimistic update — apply immediately
      if (existing) {
        setItems(
          currentItems.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          ),
        );
      } else {
        setItems([...currentItems, { id: crypto.randomUUID(), product, quantity }]);
      }

      if (user) {
        if (existing) {
          await supabase
            .from("cart_items")
            .update({ quantity: existing.quantity + quantity })
            .eq("user_id", user.id)
            .eq("product_id", product.id);
        } else {
          await supabase
            .from("cart_items")
            .insert({ user_id: user.id, product_id: product.id, quantity });
        }
      } else {
        setLocalCart(itemsRef.current);
      }
    },
    [user],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      const currentItems = itemsRef.current;

      // Optimistic update
      const newItems = currentItems.filter((i) => i.product.id !== productId);
      setItems(newItems);

      if (user) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
      } else {
        setLocalCart(newItems);
      }
    },
    [user],
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeItem(productId);
        return;
      }

      const currentItems = itemsRef.current;

      // Optimistic update
      const newItems = currentItems.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i,
      );
      setItems(newItems);

      if (user) {
        await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("user_id", user.id)
          .eq("product_id", productId);
      } else {
        setLocalCart(newItems);
      }
    },
    [user, removeItem],
  );

  const clearCart = useCallback(async () => {
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
      setItems([]);
    } else {
      setItems([]);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [user]);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, i) =>
          sum + (i.product.discount_price || i.product.price) * i.quantity,
        0,
      ),
    [items],
  );

  return {
    items,
    isLoading,
    itemCount,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
