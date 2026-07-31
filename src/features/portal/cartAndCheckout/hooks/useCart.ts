import { useState, useEffect, useMemo } from "react";
import { fetchCartApi, saveCartApi, clearCartApi } from "../api";
import { CartItem } from "../types";
import { BackendPart } from "../../partsStore/types";

export function useCartState() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial load: Fetch cart from Redis backend
  useEffect(() => {
    fetchCartApi()
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Sync cart changes to Redis backend
  const updateItemsAndSync = (newItems: CartItem[]) => {
    setItems(newItems);
    saveCartApi(newItems);
  };

  const addItem = (part: BackendPart, quantity = 1) => {
    const partId = part.partId || part.partNumber;
    const existingIndex = items.findIndex((i) => (i.part.partId || i.part.partNumber) === partId);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [...items, { part, quantity }];
    }
    updateItemsAndSync(updated);
  };

  const updateQuantity = (partId: string, delta: number) => {
    const updated = items
      .map((item) => {
        const id = item.part.partId || item.part.partNumber;
        if (id === partId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    updateItemsAndSync(updated);
  };

  const removeItem = (partId: string) => {
    const updated = items.filter((i) => (i.part.partId || i.part.partNumber) !== partId);
    updateItemsAndSync(updated);
  };

  const clearCart = () => {
    setItems([]);
    clearCartApi();
  };

  const totalCount = useMemo(() => {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => {
      const price = typeof i.part.mrp === "string" ? parseFloat(i.part.mrp) : i.part.mrp || 0;
      return sum + price * i.quantity;
    }, 0);
  }, [items]);

  const gstTax = subtotal * 0.18;
  const totalAmount = subtotal + gstTax;

  return {
    items,
    loading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalCount,
    subtotal,
    gstTax,
    totalAmount,
  };
}
