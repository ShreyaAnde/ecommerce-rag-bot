

import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { useState } from "react";
import "../style/buttons.css";

function ProductCard({ product }) {

  const { addToCart, cartItems } = useCart();
  const BASEURL = "http://127.0.0.1:8000/api";

  const [orderId, setOrderId] = useState(null);

  const cartItem = cartItems.find((item) => item.id === product.id);

  // -------------------------
  // ADD TO WISHLIST
  // -------------------------
  const addToWishlist = async () => {

    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {

      const res = await axios.post(
        `${BASEURL}/wishlist/add/`,
        { product: product.id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(res.data);
      alert("Added to wishlist ❤️");

    } catch (error) {

      console.error(error.response?.data);
      alert("Wishlist failed");

    }
  };

  // -------------------------
  // CREATE ORDER
  // -------------------------
  const createOrder = async () => {

    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {

      const res = await axios.post(
        `${BASEURL}/create_order/`,
        {
          product: product.id,
          quantity: 1
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setOrderId(res.data.order_id);

      alert("Order created successfully");

    } catch (error) {

      console.error(error.response?.data);
      alert("Order failed");

    }
  };

  // -------------------------
  // UI
  // -------------------------
  return (

    <div className="card shadow-sm p-3" style={{ width: "16rem" }}>

      <img
        src={`http://127.0.0.1:8000${product.image}`}
        alt={product.name}
        className="card-img-top mb-2"
        style={{ height: "160px", objectFit: "cover" }}
      />

      <h5 className="card-title">{product.name}</h5>

      <p className="card-text fw-bold">
        ₹{product.price}
      </p>

      {/* 3 Buttons Row */}
      <div className="d-flex gap-2">

        <Link
          to={`/product/${product.id}`}
          className="theme-btn flex-fill text-center text-decoration-none"
        >
          View
        </Link>

        <button
          onClick={() => addToCart(product)}
          className="theme-btn flex-fill"
        >
          {cartItem ? "In Cart" : "Add Cart"}
        </button>

        <button
          onClick={addToWishlist}
          className="theme-btn flex-fill"
        >
          Wishlist
        </button>

      </div>

     

    </div>

  );
}

export default ProductCard;

