import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiShoppingCart, FiStar, FiZap } from "react-icons/fi";
import { useCart } from "../../context/CartContext.jsx";
import { fetchProductById } from "../../services/api.js";
import { formatPrice } from "../../utils/formatPrice.js";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProductById(id)
      .then((data) => {
        setProduct(data);
        setActiveImage(data.gallery?.[0] || data.image);
      })
      .catch(() => setError("Product nahi mila. Backend server ya product id check karo."));
  }, [id]);

  if (error) {
    return (
      <section className="page-pad">
        <div className="container">
          <h1>{error}</h1>
          <Link className="primary-btn" to="/products">Back to products</Link>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="page-pad">
        <div className="container">
          <h1>Loading product...</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="page-pad details-page">
      <div className="container details-grid">
        <div className="gallery">
          <div className="main-image">
            <img src={activeImage} alt={product.title} />
          </div>
          <div className="thumbs">
            {(product.gallery || [product.image]).map((image) => (
              <button key={image} className={activeImage === image ? "active" : ""} onClick={() => setActiveImage(image)}>
                <img src={image} alt={product.title} />
              </button>
            ))}
          </div>
        </div>

        <div className="details-info">
          <span className="details-brand">{product.brand}</span>
          <h1>{product.title}</h1>

          <div className="details-rating">
            <FiStar /> {product.rating} rating
          </div>

          <div className="details-price">
            <strong>{formatPrice(product.price)}</strong>
            <span>{formatPrice(product.oldPrice)}</span>
            <em>{product.discount}</em>
          </div>

          <p>Designed for people who want speed, premium materials and a sharper everyday tech experience without extra fuss.</p>

          <div className="details-actions">

            <button className="primary-btn" onClick={() => addToCart(product)}> <FiShoppingCart /> Add to Cart </button>

            <button className="secondary-btn"> <FiZap /> Buy Now </button>

          </div>

          <div className="spec-box">
            <h3>Specifications</h3>
            <ul>
              {(product.specs || []).map((spec) => (
                <li key={spec}>{spec}</li>
              )
              )}
            </ul>
          </div>

          <div className="reviews">
            <h3>Reviews</h3>
            {(product.reviews || []).map((review) => (
              <p key={review}>"{review}"</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetails;
