import { useEffect, useState } from "react";
import Hero from "../../components/Hero/Hero.jsx";
import CategoryCard from "../../components/CategoryCard/CategoryCard.jsx";
import ProductCard from "../../components/ProductCard/ProductCard.jsx";
import { categories } from "../../data/categories.js";
import { fetchProducts } from "../../services/api.js";
import { getProductId } from "../../utils/productId.js";
import "./Home.css";

function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const featuredProducts = products.slice(0, 8);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("Products load nahi ho pa rahe. Backend server check karo."));
  }, []);

  return (
    <>
      <Hero />

      <section className="home-section">

        <div className="container">

          <div className="section-head">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-text">Find the right upgrade for work, play, home and travel.</p>
            </div>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <CategoryCard key={category} name={category} />
            )
            )}
          </div>

        </div>

      </section>

      <section className="home-section" id="featured">

        <div className="container">

          <div className="section-head">
            <div>
              <h2 className="section-title">Featured Deals</h2>
              <p className="section-text">Premium picks with sharp prices and clean performance.</p>
            </div>
          </div>

          <div className="product-grid featured-grid">
            {error && <p className="section-text">{error}</p>}

            {!error && featuredProducts.map((product) => (
              <ProductCard key={getProductId(product)} product={product} />
            )
            )}
          </div>

        </div>

      </section>

      <section className="promo-strip">

        <div className="container promo-inner">

          <div>
            <span>ElectraX Care+</span>
            <h2>Free express delivery and 2-year device protection.</h2>
          </div>

          <a className="primary-btn" href="/products">Explore Tech</a>
        </div>

      </section>
    </>
  );
}

export default Home;
