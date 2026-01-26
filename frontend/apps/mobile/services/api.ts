import { API_BASE_URL } from '../config/supabase';
import { authManager } from './auth';
import { supabase, supabaseSeller } from '../config/supabase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  images: string[];
  stock: number;
  seller_profile_id?: string;
  user_id?: string; // For main database products
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  subcategories: string[];
}

export interface SellerProfile {
  id: string;
  user_id: string;
  store_name: string;
  store_description: string;
  logo?: string;
  banner?: string;
  created_at: string;
  updated_at: string;
}

class ApiService {
  private getAuthHeaders() {
    const token = authManager.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Products (combines both databases)
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    subcategory?: string;
    search?: string;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/products?${searchParams.toString()}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    return response.json();
  }

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    return response.json();
  }

  // Seller Product Management
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error('Failed to create product');
    }

    return response.json();
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error('Failed to update product');
    }

    return response.json();
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
  }

  async getMyProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products/my-products`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch seller products');
    }

    return response.json();
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  }

  // Cart
  async getCart(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }

    return response.json();
  }

  async addToCart(productId: string, quantity: number = 1): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to add to cart');
    }

    return response.json();
  }

  async updateCartItem(itemId: string, quantity: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/cart/update`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ itemId, quantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to update cart item');
    }

    return response.json();
  }

  async removeFromCart(itemId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/cart/remove`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ itemId }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove from cart');
    }

    return response.json();
  }

  // Orders
  async getOrders(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return response.json();
  }

  async getOrder(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    return response.json();
  }

  async createOrder(orderData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    return response.json();
  }

  // Seller Orders
  async getSellerOrders(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/seller/orders`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch seller orders');
    }

    return response.json();
  }

  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/seller/orders/${orderId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    return response.json();
  }

  // Search
  async searchProducts(query: string): Promise<Product[]> {
    const response = await fetch(
      `${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search products');
    }

    return response.json();
  }

  // User Profile
  async getProfile(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  }

  async updateProfile(profileData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  }

  // Seller Profile
  async getSellerProfile(): Promise<SellerProfile> {
    const response = await fetch(`${API_BASE_URL}/seller/profile`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch seller profile');
    }

    return response.json();
  }

  async updateSellerProfile(profileData: Partial<SellerProfile>): Promise<SellerProfile> {
    const response = await fetch(`${API_BASE_URL}/seller/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error('Failed to update seller profile');
    }

    return response.json();
  }

  // Addresses
  async getAddresses(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/profile/addresses`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch addresses');
    }

    return response.json();
  }

  async addAddress(addressData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/profile/addresses`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      throw new Error('Failed to add address');
    }

    return response.json();
  }

  async updateAddress(id: string, addressData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/profile/addresses/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      throw new Error('Failed to update address');
    }

    return response.json();
  }

  async deleteAddress(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/profile/addresses/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete address');
    }
  }

  async setDefaultAddress(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/profile/addresses/${id}/default`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to set default address');
    }
  }

  // Payment Methods
  async getPaymentMethods(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/profile/payment-methods`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment methods');
    }

    return response.json();
  }

  async addPaymentMethod(paymentData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/profile/payment-methods`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error('Failed to add payment method');
    }

    return response.json();
  }

  // Dashboard Analytics
  async getSellerDashboard(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/seller/dashboard`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    return response.json();
  }
}

export const apiService = new ApiService();