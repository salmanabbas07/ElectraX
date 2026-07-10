import { useState, useEffect, useMemo, useRef } from "react";
import { FiBox, FiShoppingBag, FiTrendingUp, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import { formatPrice } from "../../utils/formatPrice.js";
import "./AdminDashboard.css";

const API_BASE_URL = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) ? "http://localhost:5000" : "";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsTopRef = useRef(null);
  const productsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "products") {
        const response = await axios.get(`${API_BASE_URL}/api/products`);
        setProducts(response.data);
      } else if (activeTab === "orders") {
        const response = await axios.get(`${API_BASE_URL}/api/orders`, {
          withCredentials: true,
        });
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
        withCredentials: true,
      });
      const updatedProducts = products.filter((p) => p._id !== id && p.id !== id);
      setProducts(updatedProducts);
      const newTotalPages = Math.max(1, Math.ceil(updatedProducts.length / productsPerPage));
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/orders/${orderId}/status`,
        { status },
        { withCredentials: true }
      );
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status");
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const totalPages = Math.max(1, Math.ceil(products.length / productsPerPage));
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + productsPerPage);
  const pageNumbers = useMemo(
    () => [1, currentPage - 1, currentPage, currentPage + 1, totalPages]
      .filter((page, index, pages) => page >= 1 && page <= totalPages && pages.indexOf(page) === index),
    [currentPage, totalPages]
  );

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    setTimeout(() => {
      productsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <section className="page-pad admin-dashboard">
      <div className="container">
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="section-text">Manage your store from one place.</p>

        <div className="dashboard-tabs">
          <button
            className={activeTab === "products" ? "active" : ""}
            onClick={() => setActiveTab("products")}
          >
            <FiBox /> Products
          </button>
          <button
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            <FiShoppingBag /> Orders
          </button>
          <button
            className={activeTab === "analytics" ? "active" : ""}
            onClick={() => setActiveTab("analytics")}
          >
            <FiTrendingUp /> Analytics
          </button>
        </div>

        {activeTab === "products" && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>All Products</h2>
              <Link to="/admin/add-product" className="primary-btn">
                <FiPlus /> Add Product
              </Link>
            </div>

            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <>
              <div className="products-grid" ref={productsTopRef} key={currentPage}>
                {currentProducts.map((product) => (
                  <div key={product._id || product.id} className="product-card">
                    <img src={product.image} alt={product.title} />
                    <div className="product-info">
                      <h3>{product.title}</h3>
                      <p>{formatPrice(product.price)}</p>
                      <div className="product-actions">
                        <Link
                          to={`/admin/edit-product/${product._id || product.id}`}
                          className="icon-btn"
                        >
                          <FiEdit2 />
                        </Link>
                        <button
                          className="icon-btn delete"
                          onClick={() => deleteProduct(product._id || product.id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {products.length > productsPerPage && (
                <div className="pagination">
                  <button className="page-btn" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>Previous</button>

                  {pageNumbers.map((pageNumber) => (
                    <button key={pageNumber} className={currentPage === pageNumber ? "page-btn active" : "page-btn"} onClick={() => goToPage(pageNumber)}>{pageNumber}</button>
                  ))}

                  <button className="page-btn" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>Next</button>
                </div>
              )}
              </>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>All Orders</h2>
            </div>

            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <div>
                        <h3>Order #{order._id.slice(-8)}</h3>
                        <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="order-items">
                      {order.products.map((item, index) => (
                        <div key={index} className="order-item">
                          <img src={item.image} alt={item.title} />
                          <div>
                            <p>{item.title}</p>
                            <small>Qty: {item.quantity}</small>
                          </div>
                          <p>{formatPrice(item.price)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <p><strong>Total:</strong> {formatPrice(order.totalAmount)}</p>
                      <p><strong>Payment:</strong> {order.paymentStatus}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>Analytics</h2>
            </div>

            <div className="analytics-grid">
              <div className="stat-card">
                <h3>Total Revenue</h3>
                <p className="stat-value">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="stat-card">
                <h3>Total Orders</h3>
                <p className="stat-value">{totalOrders}</p>
              </div>
              <div className="stat-card">
                <h3>Pending Orders</h3>
                <p className="stat-value">{pendingOrders}</p>
              </div>
              <div className="stat-card">
                <h3>Total Products</h3>
                <p className="stat-value">{products.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminDashboard;
