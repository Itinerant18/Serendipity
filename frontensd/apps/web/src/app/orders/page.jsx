"use client";

import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, Menu, X, Package, User } from "lucide-react";
import useAuth from "@/utils/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatCurrency } from "@/utils/format";

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const { user, token, isAuthenticated } = useAuth(); // Use useAuth instead of useUser

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !user) {
      // Wait for auth to initialize or redirect if definitely not logged in
      // For now, let's just wait for token
    }

    if (token) {
      fetchOrders();
    } else if (!loading && !isAuthenticated) {
      // Maybe redirect here?
      // window.location.href = "/account/signin?callbackUrl=/orders";
    }
  }, [token, isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/orders/history", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D97534]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartCount}
      />

      {/* Orders Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-[#8B4513] mb-8">
          Your Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <Package className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <p className="font-playfair text-2xl text-gray-500 mb-2">
              No orders yet
            </p>
            <p className="font-inter text-gray-400 mb-6">
              Start shopping to place your first order
            </p>
            <a
              href="/"
              className="inline-flex items-center px-8 py-4 bg-[#D97534] hover:bg-[#C86429] text-white font-inter font-semibold rounded-full transition-colors shadow-lg"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <p className="font-inter text-sm text-gray-600">
                      Order Number
                    </p>
                    <p className="font-inter font-bold text-lg text-[#8B4513]">
                      {order.order_number}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <p className="font-inter text-sm text-gray-600">
                      Order Date
                    </p>
                    <p className="font-inter font-semibold text-gray-800">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <p className="font-inter text-sm text-gray-600">Total</p>
                    <p className="font-playfair font-bold text-xl text-[#8B4513]">
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <span
                      className={`inline-block px-4 py-2 rounded-full font-inter text-sm font-semibold ${order.payment_status === "paid"
                        ? "bg-green-100 text-green-700"
                        : order.payment_status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {order.payment_status.charAt(0).toUpperCase() +
                        order.payment_status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image_url}
                          alt={item.product_title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-inter font-medium text-gray-800">
                          {item.product_title}
                        </p>
                        <p className="font-inter text-sm text-gray-600">
                          Quantity: {item.quantity} × {typeof item.price === "string" ? item.price : formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {order.shipping_name && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="font-inter text-sm text-gray-600 mb-2">
                      Shipping Address
                    </p>
                    <p className="font-inter text-gray-800">
                      {order.shipping_name}
                      <br />
                      {order.shipping_address}
                      <br />
                      {order.shipping_city}, {order.shipping_state}{" "}
                      {order.shipping_zip}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      <style jsx global>{`
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        .font-playfair {
          font-family: 'Playfair Display', serif;
        }
      `}</style>
    </div>
  );
}
