import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const { cartItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  // ✅ Calculate total price
  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // ✅ Razorpay Payment
  const handleRazorpayPayment = (orderData) => {
    if (!orderData || !orderData.razorpay_order_id) {
      alert("Razorpay order could not be created. Try again.");
      return;
    }

    const options = {
      key: "rzp_test_SbUyxJemL0Ydyh",
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.razorpay_order_id,

      // 🔥 FIXED HANDLER
      handler: async function (response) {
        try {
          const res = await axios.post(
            "http://127.0.0.1:8000/api/verify_payment/",
            {
              razorpay_order_id: orderData.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              address: address,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
console.log("FULL RESPONSE:", res);
console.log("DATA:", res.data);
          console.log("VERIFY RESPONSE:", res.data);

          const orderId = res.data.order_id;

          if (!orderId) {
            alert("Order ID missing from backend!");
            return;
          }

          alert("Payment Successful & Order Placed!");

          clearCart();

          // ✅ Navigate to track page
          navigate(`/track/${orderId}`);
        } catch (error) {
          console.error("Verification error:", error);
          alert("Payment verification failed!");
        }
      },

      prefill: {
        email: "customer@example.com",
        contact: "9999999999",
      },

      theme: {
        color: "#000000",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // ✅ Place Order API
  const placeOrder = async () => {
    if (!address.trim()) return alert("Please enter your address");
    if (cartItems.length === 0) return alert("Your cart is empty");

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const orderData = res.data;

      if (paymentMethod === "UPI") {
        handleRazorpayPayment(orderData);
      } else {
        alert("Order placed successfully (Cash on Delivery)");
        clearCart();
        navigate("/orders");
      }
    } catch (err) {
      console.error("Order API error:", err);

      if (err.response && err.response.data) {
        alert("Error: " + JSON.stringify(err.response.data));
      } else {
        alert("Failed to place order. Check console for details.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex justify-center items-center p-6">
      <div className="bg-white border border-black rounded-xl shadow-md p-8 w-full max-w-lg">

        <h1 className="text-3xl font-bold text-center mb-6">
          Checkout
        </h1>

        {/* Address */}
        <textarea
          placeholder="Enter your delivery address"
          className="w-full border border-black rounded-lg p-3 mb-5"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        {/* Payment Method */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Payment Method</h3>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={() => setPaymentMethod("COD")}
            />
            Cash on Delivery
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="UPI"
              checked={paymentMethod === "UPI"}
              onChange={() => setPaymentMethod("UPI")}
            />
            UPI / Google Pay
          </label>
        </div>

        {/* Cart Items */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Cart Items</h3>

          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b py-2"
              >
                <span>{item.name} × {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between text-xl font-semibold border-t pt-4 mb-6">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        {/* Button */}
        <button
          onClick={placeOrder}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg"
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>

      </div>
    </div>
  );
}

export default Checkout;