import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { getProductId } from "../utils/productId.js";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("electrax_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.warn("localStorage is not accessible:", e);
      return [];
    }
  });
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("electrax_cart", JSON.stringify(cartItems));
    } catch (e) {
      console.warn("localStorage is not accessible:", e);
    }
  }, [cartItems]);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 1800);
  };

  const addToCart = (product) => {
    setCartItems((items) => {
      const productId = getProductId(product);
      const foundItem = items.find((item) => getProductId(item) === productId);

      if (foundItem) {
        return items.map((item) =>
          getProductId(item) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...items, { ...product, quantity: 1 }];
    });
    showToast(`${product.title} added to cart`);
  };

  const updateQuantity = (id, type) => {
    setCartItems((items) =>
      items
        .map((item) => {
          if (getProductId(item) !== id) return item;
          const quantity =
            type === "increase" ? item.quantity + 1 : item.quantity - 1;
          return { ...item, quantity };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (id) => {
    setCartItems((items) => items.filter((item) => getProductId(item) !== id));
    showToast("Item removed from cart");
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const value = useMemo(
    () => ({
      cartItems,
      toast,
      cartCount,
      cartTotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [cartItems, toast, cartCount, cartTotal],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && <div className="toast">{toast}</div>}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
