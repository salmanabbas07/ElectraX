import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { formatPrice } from "../../utils/formatPrice.js";
import { getProductId } from "../../utils/productId.js";
import "./Cart.css";

function Cart() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
  const shipping = cartItems.length ? 99 : 0;
  const finalTotal = cartTotal + shipping;

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
              <button className="primary-btn">Checkout</button>
            </aside>

          </div>
        )}
      </div>
    </section>
  );
}

export default Cart;
