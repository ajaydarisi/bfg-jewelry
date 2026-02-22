"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./use-auth";

interface WishlistContextType {
  items: string[]; // product IDs
  isLoading: boolean;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const WishlistContext = createContext<WishlistContextType | null>(null);

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

const supabase = createClient();

export function useWishlistProvider(): WishlistContextType {
  const [items, setItems] = useState<string[]>([]);
  const [fetchCount, setFetchCount] = useState(0);
  const { user, isLoading: authLoading } = useAuth();
  const prevUserIdRef = useRef<string | undefined>(undefined);

  // Derive loading: still loading until at least one fetch cycle completes
  const isLoading = authLoading || fetchCount === 0;

  useEffect(() => {
    if (authLoading) return;

    const userId = user?.id;
    if (userId === prevUserIdRef.current) return;
    prevUserIdRef.current = userId;

    if (!userId) {
      // Resolve immediately via microtask so setState is in a callback, not synchronous
      Promise.resolve().then(() => {
        setItems([]);
        setFetchCount((c) => c + 1);
      });
      return;
    }

    let cancelled = false;

    supabase
      .from("wishlist_items")
      .select("product_id")
      .eq("user_id", userId)
      .then(({ data }: { data: { product_id: string }[] | null }) => {
        if (cancelled) return;
        setItems(data?.map((i) => i.product_id) || []);
        setFetchCount((c) => c + 1);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  const addItem = useCallback(
    async (productId: string) => {
      if (!user) return;
      setItems((prev) => [...prev, productId]);
      await supabase
        .from("wishlist_items")
        .insert({ user_id: user.id, product_id: productId });
    },
    [user]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (!user) return;
      setItems((prev) => prev.filter((id) => id !== productId));
      await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
    },
    [user]
  );

  const isInWishlist = useCallback(
    (productId: string) => items.includes(productId),
    [items]
  );

  return { items, isLoading, addItem, removeItem, isInWishlist };
}
