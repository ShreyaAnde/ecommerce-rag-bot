// src/pages/CartPage.jsx

import { useCart } from "../context/CartContext";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const { cartItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const placeOrder = async () => {
    if (!address) return alert("Please enter your address");
    if (cartItems.length === 0) return alert("Cart is empty");

    setLoading(true);

    try {
      const items = cartItems.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      }));

      const res = await axios.post(
        "http://127.0.0.1:8000/api/create_order/",
        {
          address,
          payment_method: paymentMethod,
          items,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (paymentMethod === "UPI") {
        window.location.href = res.data.payment_url;
      } else {
        alert("Order placed successfully!");
        clearCart();
        navigate("/orders");
      }
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Order failed");
    }

    setLoading(false);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-10">

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-center mb-10">
        Shopping Cart
      </h1>

      <div className="grid md:grid-cols-3 gap-8">

        {/* LEFT SIDE - CART ITEMS */}
        <div className="md:col-span-2 bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-semibold mb-6">
            Cart Items
          </h2>

          {cartItems.length === 0 && (
            <p className="text-gray-500">
              Your cart is empty
            </p>
          )}

          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b py-4"
            >

              {/* Product Info */}
              <div className="flex items-center gap-4">

                <img
                  src={item.image || "https://via.placeholder.com/80"}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />

                <div>
                  <p className="font-semibold">
                    {item.name}
                  </p>

                  <p className="text-gray-500 text-sm">
                    Quantity: {item.quantity}
                  </p>

                  <button className="text-blue-600 text-sm hover:underline">
                    Remove
                  </button>
                </div>

              </div>

              {/* Price */}
              <div className="font-semibold text-lg">
                ₹{item.price * item.quantity}
              </div>

            </div>
          ))}

        </div>

        {/* RIGHT SIDE - ORDER SUMMARY */}
        <div className="bg-white rounded-xl shadow p-6 h-fit">

          <h2 className="text-xl font-semibold mb-6">
            Order Summary
          </h2>

          {/* Address */}
          <textarea
            placeholder="Enter delivery address"
            className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          {/* Payment Method */}
          <div className="mb-6">

            <p className="font-semibold mb-2">
              Payment Method
            </p>

            <label className="block mb-2">
              <input
                type="radio"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />{" "}
              Cash on Delivery
            </label>

            <label className="block">
              <input
                type="radio"
                value="UPI"
                checked={paymentMethod === "UPI"}
                onChange={() => setPaymentMethod("UPI")}
              />{" "}
              UPI Payment
            </label>

          </div>

          {/* Total */}
          <div className="flex justify-between text-lg font-semibold mb-6">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          {/* Place Order Button */}
          <button
            onClick={placeOrder}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default CartPage;