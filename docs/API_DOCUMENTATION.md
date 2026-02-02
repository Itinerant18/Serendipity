# Serendipity E-Commerce API Documentation

This document provides a detailed overview of the Serendipity REST API endpoints.

**Base URL**: `/api`

**Authentication**:
Most private routes are protected using a JWT Bearer token sent in the `Authorization` header.
`Authorization: Bearer <your_jwt_token>`

- **Public**: No authentication required.
- **Private**: Requires a valid user JWT.
- **Admin**: Requires a valid user JWT with admin privileges.
- **Seller**: Requires a valid user JWT with seller privileges.

---

## Table of Contents
1.  [Authentication](#authentication-api)
2.  [Products](#products-api)
3.  [Categories](#categories-api)
4.  [Orders](#orders-api)
5.  [Cart](#cart-api)
6.  [Wishlist](#wishlist-api)
7.  [User Profile](#user-profile-api)
8.  [Seller](#seller-api)
9.  [Uploads](#uploads-api)
10. [Payments](#payments-api)

---

## Authentication API
**Prefix**: `/api/auth`

### 1. User Login
- **Endpoint**: `POST /login`
- **Access**: Public
- **Description**: Authenticates a user and returns a session token.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "your_password"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "_id": "user-uuid",
    "name": "Test User",
    "email": "user@example.com",
    "mobile": "1234567890",
    "isAdmin": false,
    "isSeller": true,
    "sellerProfileId": "seller-profile-uuid",
    "avatar": "https://example.com/avatar.png",
    "token": "jwt_token_string"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If email or password are not provided.
  - `401 Unauthorized`: If credentials are invalid.

### 2. User Registration
- **Endpoint**: `POST /register`
- **Access**: Public
- **Description**: Creates a new user account.
- **Request Body**:
  ```json
  {
    "name": "New User",
    "email": "new@example.com",
    "password": "strong_password",
    "mobile": "9876543210"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "_id": "new-user-uuid",
    "name": "New User",
    "email": "new@example.com",
    "mobile": "9876543210",
    "isAdmin": false,
    "isSeller": false,
    "token": "jwt_token_string"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: For missing fields, invalid email, or weak password.
  - `400 Bad Request`: If a user with the email already exists.

### 3. Seller Login
- **Endpoint**: `POST /seller-login`
- **Access**: Public
- **Description**: Authenticates a user and verifies they are a registered seller.
- **Request Body**: Same as User Login.
- **Success Response (200 OK)**: Same as User Login, but `isSeller` will be `true`.
- **Error Responses**:
  - `401 Unauthorized`: Invalid credentials.
  - `403 Forbidden`: If the user is not a registered seller.

---

## Products API
**Prefix**: `/api/products`

### 1. Get All Products
- **Endpoint**: `GET /`
- **Access**: Public
- **Description**: Retrieves a paginated list of products. Supports filtering by keyword and category.
- **Query Parameters**:
  - `page` (number, optional): Page number.
  - `limit` (number, optional): Products per page.
  - `keyword` (string, optional): Search keyword for product names.
  - `category` (string, optional): Filter by category name.
- **Success Response (200 OK)**:
  ```json
  {
    "page": 1,
    "limit": 24,
    "total": 150,
    "products": [
      {
        "_id": "product-uuid",
        "name": "Sample Product",
        "price": 99.99,
        "image": "/images/sample.jpg",
        "brand": "Generic",
        "category": "Electronics",
        "count_in_stock": 10,
        "rating": 4.5,
        "num_reviews": 12
      }
    ]
  }
  ```

### 2. Get Product by ID
- **Endpoint**: `GET /:id`
- **Access**: Public
- **Description**: Retrieves a single product by its ID.
- **Success Response (200 OK)**:
  ```json
  {
    "_id": "product-uuid",
    "name": "Sample Product",
    "price": 99.99,
    "description": "This is a sample product description.",
    "image": "/images/sample.jpg",
    "images": ["/images/sample1.jpg", "/images/sample2.jpg"],
    "brand": "Generic",
    "category": "Electronics",
    "count_in_stock": 10,
    "rating": 4.5,
    "num_reviews": 12,
    "seller_store_name": "Awesome Seller Store",
    "seller_rating": 4.8
  }
  ```
- **Error Responses**:
  - `404 Not Found`: If the product with the given ID does not exist.

### 3. Create a Product
- **Endpoint**: `POST /`
- **Access**: Private (Admin or Seller)
- **Description**: Creates a new product. Admins create in the main DB, sellers create in the seller DB.
- **Request Body**: A JSON object with product details (e.g., `name`, `price`, `description`, `category`, etc.).
- **Success Response (201 Created)**: The newly created product object.
- **Error Responses**:
  - `403 Forbidden`: If the user is not an Admin or Seller.

### 4. Bulk Create Products
- **Endpoint**: `POST /bulk`
- **Access**: Private (Admin or Seller)
- **Description**: Creates multiple products from an array of product data.
- **Request Body**:
  ```json
  [
    { "name": "Product A", "price": 10, "category": "Electronics" },
    { "name": "Product B", "price": 20, "category": "Fashion" }
  ]
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "count": 2,
    "products": [ /* array of created products */ ]
  }
  ```

### 5. Update a Product
- **Endpoint**: `PUT /:id`
- **Access**: Private (Admin or Seller owner)
- **Description**: Updates an existing product.
- **Request Body**: A JSON object with the fields to update.
- **Success Response (200 OK)**: The updated product object.
- **Error Responses**:
  - `403 Forbidden`: If the user is not an Admin or the product owner.
  - `404 Not Found`: If the product does not exist.

### 6. Delete a Product
- **Endpoint**: `DELETE /:id`
- **Access**: Private (Admin or Seller owner)
- **Description**: Deletes a product.
- **Success Response (200 OK)**:
  ```json
  {
    "message": "Product removed"
  }
  ```
- **Error Responses**:
  - `403 Forbidden`: If the user is not an Admin or the product owner.
  - `404 Not Found`: If the product does not exist.

---

## Categories API
**Prefix**: `/api/categories`

### 1. Get All Unique Categories
- **Endpoint**: `GET /`
- **Access**: Public
- **Description**: Retrieves a list of all unique main categories.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "categories": ["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Books"],
    "fromDatabase": true
  }
  ```

### 2. Get Subcategories for a Category
- **Endpoint**: `GET /:category/subcategories`
- **Access**: Public
- **Description**: Retrieves subcategories for a given main category.
- **URL Parameters**:
  - `category` (string): The main category name (e.g., "Electronics").
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "category": "Electronics",
    "subcategories": ["Smartphones & Accessories", "Laptops & Computers", "..."],
    "fromDatabase": true
  }
  ```

### 3. Get All Categories with Subcategories
- **Endpoint**: `GET /with-subcategories`
- **Access**: Public
- **Description**: Retrieves all categories, each with a list of its subcategories.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "categories": [
      {
        "name": "Electronics",
        "subcategories": ["Smartphones & Accessories", "Laptops & Computers"]
      },
      {
        "name": "Fashion",
        "subcategories": ["Men's Clothing", "Women's Clothing"]
      }
    ]
  }
  ```

---

*This documentation will continue for all other endpoints in a similar fashion.*

- **Orders API (`/api/orders`)**: `POST /`, `GET /myorders`, `GET /:id`, `GET /admin/stats`
- **Cart API (`/api/cart`)**: `POST /sync`, `GET /`
- **Wishlist API (`/api/wishlist`)**: `GET /`, `POST /`, `DELETE /:productId`, `DELETE /clear`
- **User Profile API (`/api/profile`)**:
  - **Profile**: `GET /`, `PUT /`
  - **Addresses**: `GET /addresses`, `POST /addresses`, `PUT /addresses/:id`, `DELETE /addresses/:id`, `POST /addresses/:id/set-default`
  - **Payment Methods**: `GET /payment-methods`, `POST /payment-methods`, `DELETE /payment-methods/:id`, `POST /payment-methods/:id/set-default`
  - **Preferences**: `GET /preferences`, `PUT /preferences`
  - **Security**: `POST /security/change-password`
- **Seller API (`/api/seller`)**: `POST /register`, `POST /signup`, `GET /profile`, `PUT /profile`, `GET /stats`, `GET /products`, `GET /orders`, `GET /analytics/weekly`, `POST /sync-status`
- **Uploads API (`/api/upload`)**: `POST /product-media`, `POST /product-images`, `DELETE /product-media`, `POST /profile-image`
- **Payments API (`/api/payment`)**:
  - **Razorpay**: `POST /razorpay/order`, `POST /razorpay/verify`
  - **Stripe**: `POST /` (mounted at `/api/stripe-checkout`)

This provides a structured and detailed outline. A complete file would fill in the request/response details for every single endpoint listed above.
