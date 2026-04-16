// src/components/Navbar.jsx

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";

function Navbar({ onSearch }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { cartItems } = useCart();

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (onSearch) onSearch(value);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.logo}>MyStore</Link>

      {/* Search */}
      <input
        type="text"
        placeholder="Search for products..."
        value={search}
        onChange={handleSearch}
        style={styles.search}
      />

      <div style={styles.rightSection}>

        {/* Wishlist */}
        <Link to="/wishlist" style={styles.link}>
          ❤️ Wishlist
        </Link>

        {/* Orders */}
        <Link to="/orders" style={styles.link}>
          📦 Orders
        </Link>

        {/* Cart */}
        <Link to="/cart" style={styles.cart}>
          🛒 Cart
          <span style={styles.badge}>{cartCount}</span>
        </Link>

        {!token ? (
          <>
            <Link to="/login" style={styles.button}>Logout</Link>
     
          </>
        ) : (
          <button onClick={handleLogout} style={styles.button}>Logout</button>
        )}

      </div>
    </nav>
  );
}

export default Navbar;

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 40px",
    background: "#1f2937",
    color: "white",
  },
  logo: {
    color: "white",
    fontSize: "22px",
    textDecoration: "none",
    fontWeight: "bold",
  },
  search: {
    width: "40%",
    padding: "8px",
    borderRadius: "6px",
    border: "none",
    outline: "none",
    color: "white",
    background: "#374151",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  cart: {
    color: "white",
    textDecoration: "none",
    position: "relative",
    fontSize: "18px",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
  },
  badge: {
    position: "absolute",
    top: "-8px",
    right: "-12px",
    background: "red",
    color: "white",
    borderRadius: "50%",
    padding: "2px 7px",
    fontSize: "12px",
  },
  button: {
    padding: "6px 12px",
    background: "#2563eb",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    textDecoration: "none",
  },
};