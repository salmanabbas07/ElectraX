import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./EditProduct.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    specs: "",
    reviews: "",
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products/${id}`);
      const product = response.data;
      setForm({
        title: product.title || "",
        brand: product.brand || "",
        category: product.category || "",
        price: product.price || "",
        oldPrice: product.oldPrice || "",
        discount: product.discount || "",
        stock: product.stock || "",
        image: product.image || "",
        gallery: product.gallery ? product.gallery.join(", ") : "",
        rating: product.rating || "",
        description: product.description || "",
        specs: product.specs ? product.specs.join("\n") : "",
        reviews: product.reviews
          ? product.reviews.map(r =>
              typeof r === "object"
                ? `${r.name} | ${r.rating} | ${r.comment}`
                : r
            ).join("\n")
          : "",
      });
    } catch (error) {
      console.error("Failed to fetch product:", error);
      alert("Failed to load product");
      navigate("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const parsedSpecs = form.specs
        ? form.specs.split("\n").map(s => s.trim()).filter(Boolean)
        : [];

      let parsedReviews = [];
      if (form.reviews.trim()) {
        parsedReviews = form.reviews.split("\n").map(line => {
          const parts = line.split("|").map(p => p.trim());
          return {
            name: parts[0] || "Anonymous",
            rating: parts[1] ? Number(parts[1]) : 4,
            comment: parts[2] || parts[0] || "",
            date: new Date().toISOString().split("T")[0],
          };
        }).filter(r => r.comment);
      }

      const productData = {
        ...form,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        rating: form.rating ? Number(form.rating) : undefined,
        stock: Number(form.stock),
        gallery: form.gallery ? form.gallery.split(",").map(url => url.trim()) : [],
        specs: parsedSpecs,
        reviews: parsedReviews,
      };

      await axios.put(`${API_BASE_URL}/api/products/${id}`, productData, {
        withCredentials: true,
      });

      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("Failed to update product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container page-pad">Loading product...</div>;
  }

  return (
    <section className="page-pad edit-product">
      <div className="container">
        <h1 className="section-title">Edit Product</h1>
        <p className="section-text">Update product information.</p>

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
              rows={3}
              required
            />
          </label>

          <label> Specifications (one per line)
            <textarea
              value={form.specs}
              onChange={(e) => setForm({ ...form, specs: e.target.value })}
              placeholder={"Display: 6.7 inch Super AMOLED\nRAM: 8GB\nStorage: 128GB\nBattery: 5000mAh"}
              rows={5}
            />
          </label>

          <label> Reviews (one per line: Name | Rating | Comment)
            <textarea
              value={form.reviews}
              onChange={(e) => setForm({ ...form, reviews: e.target.value })}
              placeholder={"John D | 4.5 | Amazing product, highly recommend!\nSarah M | 5 | Best purchase I've made this year"}
              rows={4}
            />
          </label>

          <div className="form-actions">
            <button type="button" className="secondary-btn" onClick={() => navigate("/admin/dashboard")}>
              Cancel
            </button>
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? "Updating Product..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default EditProduct;
