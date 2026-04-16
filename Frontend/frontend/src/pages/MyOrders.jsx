import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/my_orders/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrders(res.data))
      .catch((err) => console.log(err));
  }, [token]);

  return (
    <div className="bg-gray-100 min-h-screen p-10">
      
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 && (
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-gray-600">No orders found.</p>
        </div>
      )}

      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white p-6 mb-6 rounded-xl shadow hover:shadow-lg transition"
        >
          
          {/* Order Header */}
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-xl font-semibold">Order #{order.id}</h2>
              <p className="text-gray-500 text-sm">{order.address}</p>
            </div>

            <div>
              <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
                {order.order_status}
              </span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-4 text-gray-700">
            <p>
              Payment: <span className="font-semibold">{order.payment_method}</span>
            </p>
            <p>
              Payment Status:{" "}
              <span className="font-semibold text-green-600">
                {order.payment_status}
              </span>
            </p>
          </div>

          {/* Order Items */}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Items</h3>

            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between border-b py-2 text-gray-700"
              >
                <span>
                  {item.product_name} × {item.quantity}
                </span>

                <span className="font-medium">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Order Footer */}
          <div className="flex justify-between items-center mt-4">

            <h3 className="font-bold text-lg">
              Total: ₹{order.total_price}
            </h3>

            <button
              onClick={() => navigate(`/track-order/${order.id}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition"
            >
              Track Order
            </button>

          </div>
        </div>
      ))}
    </div>
  );
}

export default MyOrders;