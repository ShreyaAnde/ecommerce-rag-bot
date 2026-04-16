// src/pages/ProductList.jsx

import ProductCard from "../components/ProductCard";

function ProductList({ products, search, setCartCount }) {

  // 🔹 Search filter
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (filteredProducts.length === 0) {
    return (
      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Product not found
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", padding: "20px" }}>
      {filteredProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          setCartCount={setCartCount}
        />
      ))}
    </div>
  );
}

export default ProductList;