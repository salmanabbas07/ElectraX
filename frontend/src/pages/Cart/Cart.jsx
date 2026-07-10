import { useState } from "react";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatPrice } from "../../utils/formatPrice.js";
import { getProductId } from "../../utils/productId.js";
import axios from "axios";
import "./Cart.css";

const API_BASE_URL = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) ? "http://localhost:5000" : "";

function Cart() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const shipping = cartItems.length ? 99 : 0;
  const finalTotal = cartTotal + shipping;

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        products: cartItems.map((item) => ({
          product: item._id || item.id,
          title: item.title,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: user.address,
        totalAmount: finalTotal,
      };

      await axios.post(`${API_BASE_URL}/api/orders`, orderData, {
        withCredentials: true,
      });

      clearCart();
      navigate("/my-account");
    } catch (error) {
      console.error("Checkout failed:", error.response || error);
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      alert(`Failed to place order. Reason: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-pad cart-page">
      <div className="container">
        <h1 className="section-title">Your Cart</h1>
        <p className="section-text">Review your devices before checkout.</p>

        {cartItems.length === 0 ? (

          <div className="empty-cart">
            <h2>Your cart is waiting for its first upgrade.</h2>
            <Link className="primary-btn" to="/products">Shop Products</Link>
          </div>

        ) : (

          <div className="cart-layout">
            <div className="cart-items">
              {cartItems.map((item) => (

                <article className="cart-item" key={getProductId(item)}>
                  <img src={item.image} alt={item.title} />

                  <div>
                    <h3>{item.title}</h3>
                    <p>{formatPrice(item.price)}</p>

                    <div className="qty-row">
                      <button onClick={() => updateQuantity(getProductId(item), "decrease")}> <FiMinus /> </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(getProductId(item), "increase")}> <FiPlus /> </button>
                    </div>

                  </div>

                  <button className="remove-btn" onClick={() => removeFromCart(getProductId(item))}><FiTrash2 /></button>
                </article>

              )
              )}
            </div>

            <aside className="summary">
              <h2>Order Summary</h2>
              <p><span>Subtotal</span><strong>{formatPrice(cartTotal)}</strong></p>
              <p><span>Shipping</span><strong>{formatPrice(shipping)}</strong></p>
              <p className="total"><span>Total</span><strong>{formatPrice(finalTotal)}</strong></p>
              <button className="primary-btn" onClick={handleCheckout} disabled={loading}>
                {loading ? "Processing..." : "Checkout"}
              </button>
            </aside>

          </div>
        )}
      </div>
    </section>
  );
}

export default Cart;
