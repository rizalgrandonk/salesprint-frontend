import { Product } from "@/types/Product";
import { ProductVariant } from "@/types/Variant";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type CartItem = {
  product: Product;
  productVariant: ProductVariant;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, productVariantId: string) => void;
  updateItem: (
    productId: string,
    productVariantId: string,
    newItem: CartItem
  ) => void;
  updateItemQuantity: (
    productId: string,
    productVariantId: string,
    quantity: number
  ) => void;
  totalItems: number;
  cartTotal: number;
  inCart: (productId: string, productVariantId: string) => boolean;
  emptyCart: () => void;
  isEmpty: boolean;
  isLoading: boolean;
};

const defaultValue: CartContextValue = {
  items: [],
  addItem: () => undefined,
  removeItem: () => undefined,
  updateItem: () => undefined,
  updateItemQuantity: () => undefined,
  totalItems: 0,
  cartTotal: 0,
  inCart: () => false,
  emptyCart: () => undefined,
  isEmpty: true,
  isLoading: true,
};

export const CartContext = createContext<CartContextValue>(defaultValue);

export function useCart() {
  return useContext(CartContext);
}

export const CartProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const JSONLocalCart = localStorage.getItem("cart");
    if (JSONLocalCart) {
      const localCart: CartItem[] = JSON.parse(JSONLocalCart);
      setItems(localCart);
    }

    setIsLoading(false);
  }, []);

  const addItem: CartContextValue["addItem"] = (item) => {
    const existingItem = items.find(
      (itm) =>
        itm.product.id === item.product.id &&
        itm.productVariant.id === item.productVariant.id
    );

    const updated = !!existingItem
      ? [
          {
            ...existingItem,
            quantity: existingItem.quantity + item.quantity,
          },
          ...items.filter(
            (itm) =>
              itm.product.id !== item.product.id &&
              itm.productVariant.id !== item.productVariant.id
          ),
        ]
      : [item, ...items];

    setItems(updated);

    let stringCart = JSON.stringify(updated);
    localStorage.setItem("cart", stringCart);
  };

  const removeItem: CartContextValue["removeItem"] = (
    productId,
    productVariantId
  ) => {
    const filtered = items.filter(
      (item) =>
        item.product.id !== productId &&
        item.productVariant.id !== productVariantId
    );
    setItems(filtered);

    let stringCart = JSON.stringify(filtered);
    localStorage.setItem("cart", stringCart);
  };

  const updateItemQuantity: CartContextValue["updateItemQuantity"] = (
    productId,
    productVariantId,
    quantity
  ) => {
    const updated = items.map((item) => {
      if (
        item.product.id === productId &&
        item.productVariant.id === productVariantId
      ) {
        return { ...item, quantity };
      }
      return item;
    });

    setItems(updated);

    let stringCart = JSON.stringify(updated);
    localStorage.setItem("cart", stringCart);
  };

  const updateItem: CartContextValue["updateItem"] = (
    productId,
    productVariantId,
    newItem
  ) => {
    const updated = items.map((item) => {
      if (
        item.product.id === productId &&
        item.productVariant.id === productVariantId
      ) {
        return newItem;
      }
      return item;
    });

    setItems(updated);

    let stringCart = JSON.stringify(updated);
    localStorage.setItem("cart", stringCart);
  };

  const inCart: CartContextValue["inCart"] = (productId, productVariantId) => {
    return items.some(
      (item) =>
        item.product.id === productId &&
        item.productVariant.id === productVariantId
    );
  };

  const emptyCart = () => {
    setItems([]);
    localStorage.removeItem("cart");
  };

  const totalItems = items.length;

  const cartTotal = items.reduce(
    (prev, curr) => curr.quantity * curr.productVariant.price + prev,
    0
  );

  const isEmpty = items.length <= 0;

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateItem,
    updateItemQuantity,
    totalItems,
    cartTotal,
    inCart,
    emptyCart,
    isEmpty,
    isLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
