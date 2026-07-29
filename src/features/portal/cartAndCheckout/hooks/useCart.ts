import { useState } from "react";
import { CartItem } from "../types";

export function useCartState() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (part: any) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.part.id === part.id);
      if (existing) {
        return prev.map((i) => (i.part.id === part.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { part, qty: 1 }];
    });
  };

  const removeItem = (partId: string) => {
    setItems((prev) => prev.filter((i) => i.part.id !== partId));
  };

  const clearCart = () => setItems([]);

  return { items, addItem, removeItem, clearCart };
}
