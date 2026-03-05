import { useState } from "react";
import HomePage from "./pages/home";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/auth/register";
import Login from "./pages/auth/login";
import AdminLayout from "./pages/admin/adminLayout";
import AdminDashboard from "./pages/admin/adminDashboard";
import ProductsManagement from "./pages/admin/productsManagement";
import ProductForm from "./pages/admin/productForm";
import CategoriesManagement from "./pages/admin/categoriesManagement";
import UsersManagement from "./pages/admin/usersManagement";
import AdminOrdersPage from "./pages/admin/adminOrders";
import { ProductsPage } from "./pages/product/productsPage";
import { ProductDetailPage } from "./pages/product/productsDetailPage";
import CartPage from "./pages/cart";
import CheckoutPage from "./pages/order/checkout";
import OrdersPage from "./pages/order/orders";
import OrderDetailPage from "./pages/order/orderDetails";

function App() {
  return (
    <Router>
      <Routes>
        {/* ── PUBLIC ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        {/* ── USER (authenticated) ── */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} /> {/* NEW */}
        <Route path="/orders" element={<OrdersPage />} /> {/* NEW */}
        <Route path="/orders/:id" element={<OrderDetailPage />} /> {/* NEW */}
        {/* ── ADMIN ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductsManagement />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="categories" element={<CategoriesManagement />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="orders" element={<AdminOrdersPage />} /> {/* NEW */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
