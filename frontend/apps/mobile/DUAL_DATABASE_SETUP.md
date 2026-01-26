# Dual Database Configuration - Mobile App

## 🗄️ Database Architecture Overview

The Serendipity mobile app is configured to work with a **dual database architecture** that separates customer and seller data for improved performance and scalability.

### **Main Database** (`supabase`)
- **Purpose**: Customer accounts, orders, shopping cart, addresses
- **URL**: Configured via `EXPO_PUBLIC_SUPABASE_URL`
- **Key**: Configured via `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- **Tables**: `users`, `orders`, `cart`, `addresses`, `payment_methods`

### **Seller Database** (`supabaseSeller`)
- **Purpose**: Seller profiles, products, seller-specific data
- **URL**: Configured via `EXPO_PUBLIC_SELLER_SUPABASE_URL`
- **Key**: Configured via `EXPO_PUBLIC_SELLER_SUPABASE_ANON_KEY`
- **Tables**: `seller_profiles`, `products`, `seller_orders`

## 🔧 Configuration

### **Environment Setup**
```env
# Main Database (Customers, Orders, Cart)
EXPO_PUBLIC_SUPABASE_URL=https://wosxyoivsiqzyufhcyhy.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_main_anon_key_here

# Seller Database (Seller Profiles, Products)
EXPO_PUBLIC_SELLER_SUPABASE_URL=https://kfyocccbvsanihtzrfmb.supabase.co
EXPO_PUBLIC_SELLER_SUPABASE_ANON_KEY=your_seller_anon_key_here

# Backend API
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

### **Mobile App Configuration**
The mobile app is pre-configured with the correct database URLs from the backend:

1. **Main Database**: Customer operations (login, cart, orders, profiles)
2. **Seller Database**: Seller operations (seller dashboard, inventory, analytics)

## 🔐 Authentication Flow

### **Customer Authentication**
1. **Login**: Validates against main database
2. **Profile**: Stored in main database
3. **Orders**: Stored in main database
4. **Cart**: Stored in main database

### **Seller Authentication**
1. **Login**: Validates against main database but checks seller status
2. **Profile**: Stored in main database, linked to seller profile in seller database
3. **Products**: Stored in seller database
4. **Analytics**: Queries seller database for performance metrics

## 🔄 Data Flow

### **Product Browsing**
```
Mobile App → Backend API → [Main DB + Seller DB] → Combined Product List
```
- Backend combines products from both databases
- Mobile app displays unified product catalog
- Products are tagged with seller information

### **Order Processing**
```
Customer Order → Main Database → Seller Notification → Order Fulfillment
```
- Orders stored in main database
- Sellers see orders in their dashboard
- Products may come from either database

### **Seller Operations**
```
Seller Actions → Seller Database → Backend API → Mobile Dashboard
```
- Product management in seller database
- Analytics from seller database
- Order processing across databases

## 📱 Mobile App Implementation

### **Dual Supabase Clients**
```typescript
// Main database client
export const supabase = createClient(mainUrl, mainKey);

// Seller database client
export const supabaseSeller = createClient(sellerUrl, sellerKey);
```

### **Service Layer**
- **API Service**: Handles backend communication
- **Auth Manager**: Manages dual database authentication
- **Data Mapping**: Transforms data between databases

### **Authentication Store**
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  sellerLogin: (email: string, password: string) => Promise<void>;
  registerAsSeller: (sellerData: SellerData) => Promise<void>;
  // ... other methods
}
```

## 🚀 Benefits of Dual Database Architecture

### **Performance**
- **Reduced Load**: Seller operations don't impact customer performance
- **Scalability**: Each database can scale independently
- **Faster Queries**: Smaller datasets for targeted operations

### **Security**
- **Data Isolation**: Seller data is separated from customer data
- **Access Control**: Different permissions for each database
- **Compliance**: Easier to meet data protection requirements

### **Maintenance**
- **Independent Updates**: Can update seller features without affecting customers
- **Backup Strategy**: Separate backup schedules for each database
- **Monitoring**: Independent performance monitoring

## 📊 Database Status

### **✅ Main Database**
- **URL**: `https://wosxyoivsiqzyufhcyhy.supabase.co`
- **Status**: Active and configured
- **Tables**: All customer-facing tables ready

### **✅ Seller Database**
- **URL**: `https://kfyocccbvsanihtzrfmb.supabase.co`
- **Status**: Active and configured
- **Tables**: All seller tables ready

## 🔍 Testing the Configuration

### **Customer Flow Test**
1. Register as customer → Should save to main database
2. Browse products → Should show products from both databases
3. Add to cart → Should save cart to main database
4. Place order → Should save order to main database

### **Seller Flow Test**
1. Register as seller → Should create profile in main database + seller profile in seller database
2. Login as seller → Should authenticate against main database
3. Add product → Should save to seller database
4. View dashboard → Should show analytics from seller database

## 🛠️ Troubleshooting

### **Common Issues**

#### "Authentication failed"
- ✅ Check main database credentials
- ✅ Verify user exists in main database
- ✅ Check seller status in main database

#### "Product not found"
- ✅ Check both databases for product existence
- ✅ Verify seller profile exists in seller database
- ✅ Check product permissions

#### "Order creation failed"
- ✅ Check main database connection
- ✅ Verify customer profile exists
- ✅ Check product stock in seller database

### **Debug Configuration**
```typescript
// Test database connections
console.log('Main DB URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('Seller DB URL:', process.env.EXPO_PUBLIC_SELLER_SUPABASE_URL);
console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);
```

## 🔄 Future Enhancements

### **Potential Improvements**
- **Database Replication**: For better performance and reliability
- **Read Replicas**: To handle high traffic scenarios
- **Database Sharding**: For horizontal scaling
- **Connection Pooling**: For better resource management

### **Monitoring & Analytics**
- **Performance Metrics**: Database query performance
- **Usage Analytics**: Database usage patterns
- **Error Tracking**: Database operation failures
- **Health Checks**: Database availability monitoring

This dual database configuration ensures optimal performance, security, and scalability for both customers and sellers using the Serendipity mobile app.