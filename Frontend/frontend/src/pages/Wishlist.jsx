import { useEffect, useState } from "react";
import axios from "axios";

function Wishlist() {

  const [wishlist, setWishlist] = useState([]);

  const BASEURL = "http://127.0.0.1:8000/api";

  useEffect(() => {

    const fetchWishlist = async () => {

      const token = localStorage.getItem("access");

      try {

        const res = await axios.get(
          `${BASEURL}/wishlist/`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setWishlist(res.data);

      } catch (error) {

        console.error(error);

      }

    };

    fetchWishlist();

  }, []);

  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        My Wishlist ❤️
      </h1>

      <div className="grid grid-cols-3 gap-4">

        {wishlist.map((item) => (

          <div key={item.id} className="border p-4 rounded shadow">

            <img
              src={`http://127.0.0.1:8000${item.product.image}`}
              alt={item.product.name}
              className="w-full h-40 object-cover"
            />

            <h2 className="text-lg font-semibold mt-2">
              {item.product.name}
            </h2>

            <p className="text-gray-600">
              ₹{item.product.price}
            </p>

          </div>

        ))}

      </div>

    </div>

  );

}

export default Wishlist;