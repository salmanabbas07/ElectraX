import { useState, useEffect } from "react";
import { FiUser, FiMapPin, FiShoppingBag, FiLogOut, FiEdit2 } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatPrice } from "../../utils/formatPrice.js";
import axios from "axios";
import "./MyAccount.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "");

function MyAccount() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zipcode: user.address?.zipcode || "",
      });
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/my`, {
        withCredentials: true,
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        formData,
        { withCredentials: true }
      );
      setEditing(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return <div className="container page-pad">Loading...</div>;
  }

  return (
    <section className="page-pad my-account">
      <div className="container">
        <h1 className="section-title">My Account</h1>
        <p className="section-text">Manage your profile and view your orders.</p>

        <div className="account-grid">
          <div className="profile-section">
            <div className="section-header">
              <h2><FiUser /> Profile Information</h2>
              {!editing && (
                <button className="icon-btn" onClick={() => setEditing(true)}>
                  <FiEdit2 />
                </button>
              )}
            </div>

            {editing ? (
              <form className="profile-form" onSubmit={handleUpdateProfile}>
                <label> Full Name
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </label>

                <label> Email
                  <input type="email" value={user.email} disabled />
                </label>

                <label> Phone
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </label>

                <div className="address-title"><FiMapPin /> Address</div>

                <label> Street
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  />
                </label>

                <div className="form-row">
                  <label> City
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </label>

                  <label> State
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </label>
                </div>

                <label> Zipcode
                  <input
                    type="text"
                    value={formData.zipcode}
                    onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                  />
                </label>

                <div className="form-actions">
                  <button type="button" className="secondary-btn" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">Save Changes</button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-row">
                  <span>Name:</span>
                  <strong>{user.name}</strong>
                </div>
                <div className="info-row">
                  <span>Email:</span>
                  <strong>{user.email}</strong>
                </div>
                <div className="info-row">
                  <span>Phone:</span>
                  <strong>{user.phone || "Not provided"}</strong>
                </div>
                <div className="info-row">
                  <span>Member Since:</span>
                  <strong>{new Date(user.createdAt).toLocaleDateString()}</strong>
                </div>

                <div className="address-title"><FiMapPin /> Shipping Address</div>
                <div className="address-info">
                  <p>{user.address?.street || "Not provided"}</p>
                  <p>{user.address?.city && user.address?.state ? `${user.address.city}, ${user.address.state}` : "Not provided"}</p>
                  <p>{user.address?.zipcode || "Not provided"}</p>
                </div>

                <button className="logout-btn" onClick={handleLogout}>
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>

          <div className="orders-section">
            <div className="section-header">
              <h2><FiShoppingBag /> Order History</h2>
            </div>

            {loading ? (
              <div className="loading">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="empty-orders">
                <p>No orders yet.</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <div>
                        <h3>Order #{order._id.slice(-8)}</h3>
                        <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`status status-${order.status}`}>
                        {order.status}
                      </span>
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
        </div>
      </div>
    </section>
  );
}

export default MyAccount;
