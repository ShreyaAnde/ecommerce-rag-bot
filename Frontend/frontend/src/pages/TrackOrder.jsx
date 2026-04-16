import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function TrackOrder() {

  const { orderId } = useParams();
  const token = localStorage.getItem("access");

  const [order, setOrder] = useState(null);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/track_order/${orderId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrder(res.data))
      .catch((err) => console.log(err));
  }, [orderId, token]);

  if (!order)
    return (
      <div className="text-center p-10 text-lg font-semibold">
        Loading Order Details...
      </div>
    );

  return (
    <div className="bg-gray-100 min-h-screen p-10">

      <h1 className="text-3xl font-bold mb-6">
        Track Order #{order.id}
      </h1>

      <div className="bg-white p-6 rounded-xl shadow">

        {/* Order Info */}
        <div className="border-b pb-4 mb-4">

          <p className="text-gray-700">
            <span className="font-semibold">Delivery Address:</span>{" "}
            {order.address}
          </p>

          <p className="text-gray-700">
            <span className="font-semibold">Payment:</span>{" "}
            {order.payment_method} ({order.payment_status})
          </p>

          <p className="text-gray-700">
            <span className="font-semibold">Status:</span>{" "}
            <span className="text-blue-600 font-semibold">
              {order.order_status}
            </span>
          </p>

        </div>

        {/* Delivery Progress */}
        <div className="mb-6">

          <h2 className="text-xl font-semibold mb-3">
            Order Progress
          </h2>

          <div className="flex justify-between text-center">

            <div>
              <div className="text-green-600 font-bold">✔</div>
              <p className="text-sm">Order Placed</p>
            </div>

            <div>
              <div className="text-green-600 font-bold">✔</div>
              <p className="text-sm">Packed</p>
            </div>

            <div>
              <div className="text-blue-600 font-bold">🚚</div>
              <p className="text-sm">Shipped</p>
            </div>

            <div>
              <div className="text-gray-400 font-bold">•</div>
              <p className="text-sm">Out for Delivery</p>
            </div>

            <div>
              <div className="text-gray-400 font-bold">•</div>
              <p className="text-sm">Delivered</p>
            </div>

          </div>

        </div>

        {/* Order Items */}
        <div>

          <h2 className="text-xl font-semibold mb-3">
            Order Items
          </h2>

          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between border-b py-2"
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

        {/* Total */}
        <div className="mt-4 text-right">

          <h3 className="text-xl font-bold">
            Total: ₹{order.total_price}
          </h3>

        </div>

      </div>

    </div>
  );
}

export default TrackOrder;