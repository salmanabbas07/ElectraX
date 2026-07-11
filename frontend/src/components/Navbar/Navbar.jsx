import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FiMenu,
  FiMoon,
  FiSearch,
  FiShoppingCart,
  FiSun,
  FiX,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { useCart } from "../../context/CartContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Navbar.css";

function Navbar({ theme, toggleTheme, searchTerm, onSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, logout } = useAuth();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    closeMenu();
  };

  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link to="/" className="logo" onClick={closeMenu}>
          {" "}
          ElectraX{" "}
        </Link>

        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search gadgets, brands..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <NavLink to="/" onClick={closeMenu}>
            {" "}
            Home{" "}
          </NavLink>
          <NavLink to="/products" onClick={closeMenu}>
            {" "}
            Products{" "}
          </NavLink>
          {user ? (
            <>
              <NavLink to="/my-account" onClick={closeMenu}>
                {" "}
                My Account{" "}
              </NavLink>
              {user.role === "admin" && (
                <NavLink to="/admin/dashboard" onClick={closeMenu}>
                  {" "}
                  Admin Dashboard{" "}
                </NavLink>
              )}
              <button className="nav-logout" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={closeMenu}>
                {" "}
                Login{" "}
              </NavLink>
              <NavLink to="/signup" onClick={closeMenu}>
                {" "}
                Signup{" "}
              </NavLink>
            </>
          )}
        </nav>

        <div className="nav-actions">
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {" "}
            {theme === "dark" ? <FiSun /> : <FiMoon />}{" "}
          </button>

          <Link to="/cart" className="cart-link" aria-label="Cart">
            <FiShoppingCart />
            <span>{cartCount}</span>
          </Link>

          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {" "}
            {menuOpen ? <FiX /> : <FiMenu />}{" "}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
