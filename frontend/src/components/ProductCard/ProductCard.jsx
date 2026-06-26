import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiStar } from "react-icons/fi";
import { useCart } from "../../context/CartContext.jsx";
import { formatPrice } from "../../utils/formatPrice.js";
import { getProductId } from "../../utils/productId.js";
import "./ProductCard.css";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const productId = getProductId(product);

  return (
    <article className="product-card">
      <Link to={`/products/${productId}`} className="product-img">
        <img src={product.image} alt={product.title} />
        <span className="discount">{product.discount}</span>
      </Link>

      <button className="wish-btn" aria-label="Add to wishlist">
        <FiHeart />
      </button>

      <div className="product-info">
        <p className="brand">{product.brand}</p>

        <Link to={`/products/${productId}`}>
          <h3>{product.title}</h3>
        </Link>

        <div className="rating">
          <FiStar />
          <span>{product.rating}</span>
        </div>

        <div className="price-row">
          <strong>{formatPrice(product.price)}</strong>
          <span>{formatPrice(product.oldPrice)}</span>
        </div>

        <button className="add-btn" onClick={() => addToCart(product)}> <FiShoppingCart /> Add to Cart </button>
      </div>
    </article>
  );
}

export default ProductCard;
