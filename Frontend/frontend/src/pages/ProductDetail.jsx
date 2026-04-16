import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

function ProductDetail() {

  const { id } = useParams();

  const BASEURL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔥 NEW STATES (for reviews)
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // 🔹 Fetch product
  useEffect(() => {
    fetch(`${BASEURL}/api/products/${id}/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch product");
        }
        return res.json();
      })
      .then((data) => {
        setProduct(data);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // 🔥 NEW: Fetch reviews
  useEffect(() => {
    fetch(`${BASEURL}/api/reviews/${id}/`)
      .then(res => res.json())
      .then(data => setReviews(data));
  }, [id]);

  // 🔥 NEW: Submit review
  const submitReview = async () => {
    const token = localStorage.getItem("access");

    await fetch(`${BASEURL}/api/reviews/add/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: id,
        rating,
        comment,
      }),
    });

    alert("Review added!");

    // 🔄 Refresh reviews
    fetch(`${BASEURL}/api/reviews/${id}/`)
      .then(res => res.json())
      .then(data => setReviews(data));
  };

  if (loading) return <p>Loading product...</p>;
  if (error) return <p>Error loading product</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className="p-10">

      <img
        src={`${product.image}`}
        alt={product.name}
        className="w-full max-h-72 object-contain"
      />

      <h1 className="text-3xl font-bold mt-5">
        {product.name}
      </h1>

      <p className="mt-3">
        {product.description}
      </p>

      <p className="text-2xl text-green-600 mt-3">
        ₹{product.price}
      </p>

      {/* 🔥 ADD REVIEW SECTION */}
      <div className="mt-10">

        <h2 className="text-xl font-bold mb-3">Add Review</h2>

        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="border p-2 mr-2"
        />

        <input
          type="text"
          placeholder="Write your review"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border p-2 mr-2"
        />

        <button
          onClick={submitReview}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>

      </div>

      {/* 🔥 SHOW REVIEWS */}
      <div className="mt-10">

        <h2 className="text-xl font-bold mb-3">Reviews</h2>

        {reviews.length === 0 ? (
          <p>No reviews yet</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border p-3 mb-3 rounded">

              <p><strong>{review.user}</strong></p>
              <p>⭐ {review.rating}</p>
              <p>{review.comment}</p>

            </div>
          ))
        )}

      </div>

      <Link
        to="/home"
        className="bg-green-500 text-white px-6 py-3 rounded mt-5 inline-block"
      >
        Back to Home
      </Link>

    </div>
  );
}

export default ProductDetail;