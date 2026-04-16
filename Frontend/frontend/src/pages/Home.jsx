// src/pages/Home.jsx

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ProductList from "./ProductList";
import { Link } from "react-router-dom";
import ChatWidget from "../components/ChatWidget";

function Home({ cartCount, setCartCount }) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);

  // Fetch all products
  const fetchAllProducts = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/products/");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Fetch by category
  const fetchProducts = async (categorySlug) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/products/category/${categorySlug}/`
      );
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* Navbar */}
      <Navbar cartCount={cartCount} onSearch={setSearch} />

     

      {/* HERO SECTION (makes it feel like ecommerce) */}
      <section className="max-w-7xl mx-auto px-6 mt-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-10 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold">Welcome to My Store</h1>
          <p className="mt-2">Find the best products at the best prices</p>
        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section className="max-w-7xl mx-auto px-6 mt-10">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <button onClick={fetchAllProducts} className="bg-white p-6 rounded shadow hover:shadow-lg">
            All
          </button>

          <button onClick={() => fetchProducts("fashion")} className="bg-white p-6 rounded shadow hover:shadow-lg">
            Fashion
          </button>

          <button onClick={() => fetchProducts("electronics")} className="bg-white p-6 rounded shadow hover:shadow-lg">
            Electronics
          </button>

          <button onClick={() => fetchProducts("shoes")} className="bg-white p-6 rounded shadow hover:shadow-lg">
            Shoes
          </button>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="max-w-7xl mx-auto px-6 mt-10">
        <h2 className="text-2xl font-bold mb-6">Products</h2>

        <ProductList
          products={products}
          search={search}
          setCartCount={setCartCount}
        />
      </section>

      {/* CHAT WIDGET (floating assistant style) */}
      <ChatWidget />
    </div>
  );
}

export default Home;