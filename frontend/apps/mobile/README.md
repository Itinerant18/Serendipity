# Serendipity Mobile App

A full-featured React Native e-commerce mobile application built with Expo that provides complete shopping functionality matching the web application.

## 🚀 Features

### **Customer Features**

- 🔐 Secure authentication with role-based access
- 📱 Product browsing with search and filters
- 🛒 Shopping cart with persistent storage
- 💳 Multi-step checkout process
- 👤 User profile management
- 📦 Order history and tracking
- 📍 Multiple shipping addresses
- 💳 Payment method management

### **Seller Features**

- 📊 Sales dashboard with analytics
- 📦 Inventory management
- 🛍️ Order processing and management
- 📈 Performance insights
- ⚙️ Store configuration

## 🏗️ Architecture

### **Technology Stack**

- **Framework**: Expo React Native with TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand with persistence
- **API Communication**: Axios with interceptors
- **Backend**: Node.js/Express with Supabase
- **Authentication**: JWT tokens with secure storage

### **Project Structure**

```
frontensd/apps/mobile/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Main tab navigation
│   ├── auth/                     # Authentication screens
│   ├── seller/                   # Seller dashboard
│   ├── products/                 # Product details
│   ├── checkout.tsx             # Checkout process
│   ├── profile/                 # Profile management
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable components
├── services/                     # Business logic
├── stores/                      # State management
└── config/                     # Configuration files
```

## 📦 Dependencies

### **Core Dependencies**

- `expo`: ~54.0.32 - React Native framework
- `expo-router`: ~6.0.22 - File-based routing
- `react-native`: 0.81.5 - React Native core
- `typescript`: ~5.9.2 - Type safety

### **State & API**

- `zustand`: ^5.0.3 - State management
- `axios`: ^1.6.0 - HTTP client
- `@supabase/supabase-js`: ^2.39.0 - Database client

### **UI & Navigation**

- `@react-navigation/native`: ^7.1.8 - Navigation
- `@react-navigation/stack`: ^7.2.2 - Stack navigation
- `expo-linear-gradient`: ~14.0.1 - Gradient backgrounds
- `expo-image`: ~3.0.11 - Image components

### **Storage & Security**

- `@react-native-async-storage/async-storage`: 1.23.1 - Local storage
- `expo-secure-store`: ~14.0.0 - Secure storage

## 🚀 Getting Started

### **Prerequisites**

- Node.js (v16+)
- Expo Go or Expo CLI
- Backend server running on port 5000
- Supabase project configured

### **Installation**

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the app**

   ```bash
   npx expo start / npx expo start --tunnel -c
   ```

4. **Run on device/simulator**
   - Scan QR code with Expo Go app
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

### **Environment Variables**

```env
# Main Database Configuration (Customers, Orders, Cart)
EXPO_PUBLIC_SUPABASE_URL=your_main_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_main_supabase_anon_key_here

# Seller Database Configuration (Seller Profiles, Products)
EXPO_PUBLIC_SELLER_SUPABASE_URL=your_seller_supabase_url_here
EXPO_PUBLIC_SELLER_SUPABASE_ANON_KEY=your_seller_supabase_anon_key_here

# Backend API Configuration
EXPO_PUBLIC_API_URL=http://localhost:5000/api

# Optional: Payment Gateway Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key_here
EXPO_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_here
```

## 📱 Features Overview

### **Authentication**

- Customer and seller login
- User registration
- Role-based access control
- Secure token storage
- Session persistence

### **Product Catalog**

- Browse products by category
- Search with real-time filtering
- Product detail pages with image galleries
- Stock availability indicators
- Add to cart functionality

### **Shopping Cart**

- Add/remove items with quantity controls
- Persistent cart across app sessions
- Real-time price calculations
- Stock validation
- Quick checkout access

### **Checkout Process**

- Multi-step checkout flow
- Address selection and management
- Payment method selection
- Order summary and confirmation
- Order creation with backend integration

### **User Profile**

- Personal information management
- Address book (add/edit/delete)
- Order history with status tracking
- Payment method management
- Settings and preferences

### **Seller Dashboard**

- Sales analytics and metrics
- Order management and fulfillment
- Product inventory management
- Performance insights
- Store configuration

## 🔧 Development

### **Build Instructions**

- **Development**: `expo start`
- **Android**: `expo start --android`
- **iOS**: `expo start --ios`
- **Web**: `expo start --web`
- **Build APK**: `expo build:android`
- **Build IPA**: `expo build:ios`

### **Code Structure**

- **Services**: API integration and business logic
- **Stores**: State management with Zustand
- **Components**: Reusable UI components
- **Screens**: Individual page implementations
- **Config**: Environment and app configuration

### **State Management**

- **Auth Store**: User authentication and role management
- **Cart Store**: Shopping cart with persistence
- **Product Store**: Product filtering and search state

## 🎨 UI/UX

### **Design System**

- **Primary Color**: `#D97534` (Orange)
- **Secondary Color**: `#8B4513` (Brown)
- **Background Colors**: `#F3F3F3`, `#FFF8F0`
- **Typography**: Consistent font hierarchy
- **Spacing**: Standardized margins and padding

### **Mobile Optimization**

- Touch-friendly interactions
- Responsive layouts
- Gesture-based navigation
- Performance optimizations
- Platform-specific design patterns

## 📋 Backend Integration

### **API Endpoints**

- **Authentication**: `/api/auth/*`
- **Products**: `/api/products/*`
- **Cart**: `/api/cart/*`
- **Orders**: `/api/orders/*`
- **Profile**: `/api/profile/*`
- **Seller**: `/api/seller/*`

### **Database**

- **Dual Supabase Architecture**:
  - Main Database: Customer accounts, orders, cart, profiles
  - Seller Database: Seller profiles, products, seller-specific data
- **PostgreSQL**: Primary database technology
- **Redis**: Caching layer
- **File Storage**: Product images and assets

## 🔮 Future Enhancements

- **Payment Integration**: Stripe and Razorpay mobile SDKs
- **Real-time Features**: Socket.io for live updates
- **Push Notifications**: Order status and promotions
- **Advanced Search**: Filters, sorting, and recommendations
- **Social Features**: Reviews, ratings, and sharing
- **Analytics**: User behavior tracking and insights

## 📱 Platform Support

### **iOS**

- iOS 12.0+
- Optimized for iPhone and iPad
- Face ID/Touch ID support
- Apple Pay integration ready

### **Android**

- Android API 21+ (Android 5.0+)
- Material Design adaptations
- Google Pay integration ready
- Biometric authentication support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and code comments
- **Issues**: Report bugs and feature requests via GitHub
- **Discord**: Join our development community
- **Email**: Contact support for enterprise solutions

---

Built with ❤️ using Expo React Native
