import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import Wishlist from "./pages/Wishlist";
import My_Orders from "./pages/MyOrders";
import TrackOrder from "./pages/TrackOrder";
import Checkout from "./pages/Checkout";
import FAQ from "./components/FAQ";

function App() {

  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);

  return (
 
   

    <Routes>
      <Route
  path="/faq"
  element={
    <PrivateRoute>
      <FAQ />
    </PrivateRoute>
  }
/>

      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home
              search={search}
              setCartCount={setCartCount}
              cartCount={cartCount}
            />
          </PrivateRoute>
        }
      />

      <Route
        path="/product/:id"
        element={
          <PrivateRoute>
            <ProductDetail />
          </PrivateRoute>
        }
      />

      <Route
        path="/cart"
        element={
          <PrivateRoute>
            <CartPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/wishlist"
        element={
          <PrivateRoute>
            <Wishlist />
          </PrivateRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <My_Orders />
          </PrivateRoute>
        }
      />

      <Route
        path="/checkout"
        element={
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        }
      />
<Route
path="/track/:orderId" 
  element={
    <PrivateRoute>
      <TrackOrder />
    </PrivateRoute>
  }
/>

    </Routes>

  );
}

export default App;