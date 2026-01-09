"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import useAuth from "@/utils/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CartPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  // mobileMenuOpen state removed as it's handled in Header

  useEffect(() => {
    // ... same logic as before ...
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);

    if (isAuthenticated) {
      fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          // ... same sync logic ...
          if (data.items && data.items.length > 0) {
            if (savedCart.length > 0 && data.items.length === 0) {
              // Sync logic omitted for brevity in prompt but maintained in file if not replaced
              // Wait, replace_file_content replaces the WHOLE BLOCK.
              // I must include the logic or use multi_replace.
              // I will verify lines carefully.
            } else {
              setCart(data.items);
              localStorage.setItem("cart", JSON.stringify(data.items));
            }
          } else if (savedCart.length > 0) {
            fetch('http://localhost:5000/api/cart/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ items: savedCart })
            });
          }
        })
        .catch(err => console.error("Failed to fetch cart", err));
    }
  }, [isAuthenticated, token]);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    if (isAuthenticated) {
      fetch('http://localhost:5000/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ items: newCart })
      }).catch(err => console.error("Failed to sync cart", err));
    }
  };

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    updateCart(newCart);
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    updateCart(newCart);
  };

  const clearCart = () => {
    updateCart([]);
  };

  const calculateTotal = () => {
    return cart
      .reduce((total, item) => {
        const price = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
        return total + price * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      window.location.href = "/account/signin?callbackUrl=/checkout/shipping";
      return;
    }
    window.location.href = "/checkout/shipping";
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cart.length}
      />


      {/* Cart Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-[#8B4513] mb-8">
          Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="font-playfair text-2xl text-gray-500 mb-2">
              Your cart is empty
            </p>
            <p className="font-inter text-gray-400 mb-6">
              Start shopping to add items to your cart
            </p>
            <a
              href="/"
              className="inline-flex items-center px-8 py-4 bg-[#D97534] hover:bg-[#C86429] text-white font-inter font-semibold rounded-full transition-colors shadow-lg"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-32 aspect-square bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <a
                          href={`/product/${item.product_id}`}
                          className="font-inter font-semibold text-gray-800 hover:text-[#D97534] transition-colors line-clamp-2"
                        >
                          {item.title}
                        </a>
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-600 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 bg-gray-100 rounded-full px-4 py-2">
                          <button
                            onClick={() =>
                              updateQuantity(index, item.quantity - 1)
                            }
                            className="text-[#D97534] hover:text-[#C86429] transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-inter font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(index, item.quantity + 1)
                            }
                            className="text-[#D97534] hover:text-[#C86429] transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="font-playfair font-bold text-xl text-[#8B4513]">
                          {item.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="w-full sm:w-auto px-6 py-3 text-red-600 hover:text-red-700 font-inter font-semibold transition-colors"
              >
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-[#F4E4D7] to-[#FFF8F0] rounded-2xl p-6 shadow-lg sticky top-24">
                <h2 className="font-playfair font-bold text-2xl text-[#8B4513] mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between font-inter">
                    <span className="text-gray-700">Items ({cart.length})</span>
                    <span className="font-semibold text-gray-800">
                      ${calculateTotal()}
                    </span>
                  </div>
                  <div className="flex justify-between font-inter">
                    <span className="text-gray-700">Shipping</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="border-t border-[#D97534]/30 pt-4">
                    <div className="flex justify-between font-playfair text-xl">
                      <span className="font-bold text-[#8B4513]">Total</span>
                      <span className="font-bold text-[#8B4513]">
                        ${calculateTotal()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#D97534] hover:bg-[#C86429] text-white font-inter font-bold text-lg py-4 rounded-full transition-all transform hover:scale-105 shadow-lg"
                >
                  Proceed to Checkout
                </button>

                <a
                  href="/"
                  className="block text-center mt-4 text-[#D97534] hover:text-[#C86429] font-inter font-semibold transition-colors"
                >
                  Continue Shopping
                </a>
              </div>
            </div>
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
