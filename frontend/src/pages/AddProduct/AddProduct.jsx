import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddProduct.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    brand: "",
    category: "",
    price: "",
    oldPrice: "",
    discount: "",
    stock: "",
    image: "",
    gallery: "",
    rating: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...form,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        rating: form.rating ? Number(form.rating) : undefined,
        stock: Number(form.stock),
        gallery: form.gallery ? form.gallery.split(",").map(url => url.trim()) : [],
      };

      await axios.post(`${API_BASE_URL}/api/products`, productData, {
        withCredentials: true,
      });

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Failed to create product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-pad add-product">
      <div className="container">
        <h1 className="section-title">Add New Product</h1>
        <p className="section-text">Add a new product to your store.</p>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label> Product Title
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Wireless Headphones"
                required
              />
            </label>

            <label> Brand
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g., Sony"
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label> Category
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g., Audio"
                required
              />
            </label>

            <label> Price (₹)
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g., 9999"
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label> Old Price (₹)
              <input
                type="number"
                value={form.oldPrice}
                onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                placeholder="e.g., 12999"
              />
            </label>

            <label> Discount
              <input
                type="text"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                placeholder="e.g., 20% OFF"
              />
            </label>
          </div>

          <div className="form-row">
            <label> Stock
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="e.g., 50"
                required
              />
            </label>

            <label> Rating (0-5)
              <input
                type="number"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                placeholder="e.g., 4.5"
                min="0"
                max="5"
                step="0.1"
              />
            </label>
          </div>

          <label> Main Image URL
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              required
            />
          </label>

          <label> Gallery Images (comma-separated URLs)
            <input
              type="text"
              value={form.gallery}
              onChange={(e) => setForm({ ...form, gallery: e.target.value })}
              placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
            />
          </label>

          <label> Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Product description..."
              rows={5}
              required
            />
          </label>

          <div className="form-actions">
            <button type="button" className="secondary-btn" onClick={() => navigate("/admin/dashboard")}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Adding Product..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default AddProduct;
