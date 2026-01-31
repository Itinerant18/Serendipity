# Buyer Profile - Complete Feature Specification

## 🎯 Feature Overview

A comprehensive buyer profile system that allows customers to manage their personal information, addresses, payment methods, order history, and preferences.

---

## 📊 Database Schema

### 1. Update Users Table
```sql
-- Add profile fields to existing users table
ALTER TABLE users 
ADD COLUMN phone VARCHAR(20),
ADD COLUMN avatar_url TEXT,
ADD COLUMN date_of_birth DATE,
ADD COLUMN gender VARCHAR(20),
ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
```

### 2. Create Addresses Table
```sql
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  address_type VARCHAR(20) DEFAULT 'shipping', -- 'shipping' or 'billing'
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_is_default ON addresses(user_id, is_default);
```

### 3. Create Payment Methods Table
```sql
CREATE TABLE payment_methods (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  method_type VARCHAR(20) NOT NULL, -- 'card', 'upi', 'wallet'
  
  -- Card details (encrypted in production)
  card_last4 VARCHAR(4),
  card_brand VARCHAR(20), -- 'Visa', 'Mastercard', 'Amex'
  card_expiry_month INTEGER,
  card_expiry_year INTEGER,
  cardholder_name VARCHAR(100),
  
  -- UPI details
  upi_id VARCHAR(100),
  
  -- Wallet details
  wallet_provider VARCHAR(50), -- 'Paytm', 'PhonePe', 'GooglePay'
  wallet_phone VARCHAR(20),
  
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
```

### 4. Create User Preferences Table
```sql
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Notification preferences
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  order_updates BOOLEAN DEFAULT true,
  promotional_emails BOOLEAN DEFAULT true,
  
  -- Display preferences
  language VARCHAR(10) DEFAULT 'en',
  currency VARCHAR(10) DEFAULT 'INR',
  theme VARCHAR(20) DEFAULT 'light', -- 'light' or 'dark'
  
  -- Privacy settings
  show_profile_public BOOLEAN DEFAULT false,
  show_order_history BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 UI/UX Design

### Profile Navigation Structure
```
/profile
├── /profile/overview          (Dashboard)
├── /profile/edit              (Edit personal info)
├── /profile/addresses         (Manage addresses)
├── /profile/payment-methods   (Manage payments)
├── /profile/orders            (Order history)
├── /profile/wishlist          (Saved items)
├── /profile/reviews           (My reviews)
├── /profile/settings          (Preferences)
└── /profile/security          (Password, 2FA)
```

---

## 🖼️ Page Designs

### 1. Profile Overview (`/profile`)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  [Search Bar]                    [Cart] [Profile▼]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┬──────────────────────────────────────────┐│
│  │              │  My Account                              ││
│  │   [Avatar]   │  ─────────────────────────────────────── ││
│  │              │                                          ││
│  │  John Doe    │  Quick Stats                            ││
│  │  ⭐⭐⭐⭐⭐     │  ┌────────┐ ┌────────┐ ┌────────┐      ││
│  │              │  │Orders  │ │Wishlist│ │Reviews │      ││
│  │ [Edit]       │  │  24    │ │   8    │ │   12   │      ││
│  │              │  └────────┘ └────────┘ └────────┘      ││
│  ├──────────────┤                                          ││
│  │              │  Personal Information                    ││
│  │ 📋 Overview  │  ┌──────────────────────────────────────┐││
│  │ ✏️ Edit Info │  │ Email: john@example.com              │││
│  │ 📍 Addresses │  │ Phone: +91 98765 43210               │││
│  │ 💳 Payments  │  │ Joined: Jan 2024                     │││
│  │ 📦 Orders    │  │ Member Since: 6 months               │││
│  │ ❤️ Wishlist  │  └──────────────────────────────────────┘││
│  │ ⭐ Reviews   │                                          ││
│  │ ⚙️ Settings  │  Recent Orders                          ││
│  │ 🔒 Security  │  ┌──────────────────────────────────────┐││
│  │              │  │ ORD-123  $199.99  Delivered          │││
│  │              │  │ ORD-122  $299.99  In Transit         │││
│  │              │  │ ORD-121  $99.99   Delivered          │││
│  │              │  │ [View All Orders →]                  │││
│  │              │  └──────────────────────────────────────┘││
│  └──────────────┴──────────────────────────────────────────┘│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Edit Profile (`/profile/edit`)

```
┌─────────────────────────────────────────────────────────────┐
│  My Account > Edit Profile                                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Profile Picture                                              │
│  ┌──────────────┐                                            │
│  │              │                                            │
│  │   [Avatar]   │  [Upload New Photo]  [Remove]             │
│  │              │                                            │
│  └──────────────┘                                            │
│                                                               │
│  Personal Information                                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Full Name                                               ││
│  │ [John Doe_______________________________________]       ││
│  │                                                         ││
│  │ Email Address                                           ││
│  │ [john@example.com_______________________________] ✓     ││
│  │                                                         ││
│  │ Phone Number                                            ││
│  │ [+91 98765 43210________________________________]       ││
│  │                                                         ││
│  │ Date of Birth                                           ││
│  │ [DD] / [MM] / [YYYY]                                   ││
│  │                                                         ││
│  │ Gender                                                  ││
│  │ ○ Male    ○ Female    ○ Other    ○ Prefer not to say  ││
│  │                                                         ││
│  │ [Cancel]                          [Save Changes]       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. Manage Addresses (`/profile/addresses`)

```
┌─────────────────────────────────────────────────────────────┐
│  My Account > Addresses                    [+ Add Address]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Saved Addresses                                              │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🏠 Home (Default)                    [Edit] [Delete]    ││
│  │ ───────────────────────────────────────────────────────│││
│  │ John Doe                                                ││
│  │ 123 Main Street, Apartment 4B                           ││
│  │ New York, NY 10001                                      ││
│  │ United States                                           ││
│  │ Phone: +1 555-123-4567                                  ││
│  │ ✓ Default Shipping Address                              ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🏢 Office                            [Edit] [Delete]    ││
│  │ ───────────────────────────────────────────────────────│││
│  │ John Doe                                                ││
│  │ 456 Business Ave, Suite 200                             ││
│  │ New York, NY 10002                                      ││
│  │ United States                                           ││
│  │ Phone: +1 555-987-6543                                  ││
│  │ [Set as Default]                                        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### Add/Edit Address Modal
```
┌───────────────────────────────────────┐
│ Add New Address                  [×]  │
├───────────────────────────────────────┤
│                                       │
│ Address Label                         │
│ [Home_____________________________]   │
│                                       │
│ Full Name                             │
│ [_________________________________]   │
│                                       │
│ Phone Number                          │
│ [_________________________________]   │
│                                       │
│ Address Line 1                        │
│ [_________________________________]   │
│                                       │
│ Address Line 2 (Optional)             │
│ [_________________________________]   │
│                                       │
│ City                State             │
│ [_______________] [_______________]   │
│                                       │
│ Postal Code       Country             │
│ [_______________] [India__________▼]  │
│                                       │
│ ☐ Set as default address              │
│                                       │
│ [Cancel]                    [Save]    │
└───────────────────────────────────────┘
```

---

### 4. Payment Methods (`/profile/payment-methods`)

```
┌─────────────────────────────────────────────────────────────┐
│  My Account > Payment Methods          [+ Add Payment]      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Saved Payment Methods                                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 💳 Visa ending in 4242 (Default)     [Edit] [Delete]   ││
│  │ ───────────────────────────────────────────────────────│││
│  │ Expires: 12/2025                                        ││
│  │ John Doe                                                ││
│  │ ✓ Default Payment Method                                ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 💳 Mastercard ending in 5555         [Edit] [Delete]   ││
│  │ ───────────────────────────────────────────────────────│││
│  │ Expires: 08/2026                                        ││
│  │ John Doe                                                ││
│  │ [Set as Default]                                        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📱 UPI: john@paytm                   [Edit] [Delete]   ││
│  │ ───────────────────────────────────────────────────────│││
│  │ Verified                                                ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. Order History (`/profile/orders`)

```
┌─────────────────────────────────────────────────────────────┐
│  My Account > Orders                                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [All] [Processing] [Shipped] [Delivered] [Cancelled]        │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Order #ORD-123456789                Jan 10, 2026        ││
│  │ ───────────────────────────────────────────────────────│││
│  │ [Product Image] Premium Wireless Headphones             ││
│  │                 Qty: 1 × $199.99                        ││
│  │                                                         ││
│  │ Status: 🚚 In Transit                                   ││
│  │ Expected Delivery: Jan 15, 2026                         ││
│  │                                                         ││
│  │ Total: $199.99                                          ││
│  │                                                         ││
│  │ [Track Order] [View Details] [Download Invoice]        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Order #ORD-123456788                Jan 5, 2026         ││
│  │ ───────────────────────────────────────────────────────│││
│  │ [Product Image] Smartphone Case                         ││
│  │                 Qty: 2 × $29.99                         ││
│  │                                                         ││
│  │ Status: ✅ Delivered on Jan 8, 2026                     ││
│  │                                                         ││
│  │ Total: $59.98                                           ││
│  │                                                         ││
│  │ [View Details] [Write Review] [Buy Again]              ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  [← Previous] Page 1 of 5 [Next →]                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. Settings & Preferences (`/profile/settings`)

```
┌─────────────────────────────────────────────────────────────┐
│  My Account > Settings                                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Notification Preferences                                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Email Notifications                                     ││
│  │ ☑ Order updates and shipping information                ││
│  │ ☑ Promotional offers and deals                          ││
│  │ ☐ Product recommendations                               ││
│  │ ☐ Newsletter subscription                               ││
│  │                                                         ││
│  │ SMS Notifications                                       ││
│  │ ☑ Order delivery updates                                ││
│  │ ☐ Promotional messages                                  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  Display Preferences                                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Language                                                ││
│  │ [English ▼]                                             ││
│  │                                                         ││
│  │ Currency                                                ││
│  │ [INR - ₹ ▼]                                             ││
│  │                                                         ││
│  │ Theme                                                   ││
│  │ ○ Light    ● Dark    ○ System Default                  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  Privacy Settings                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ☐ Make my profile public                                ││
│  │ ☐ Show my order history to others                       ││
│  │ ☐ Allow personalized recommendations                    ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  [Cancel]                              [Save Preferences]    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

### 7. Security Settings (`/profile/security`)

```
┌─────────────────────────────────────────────────────────────┐
│  My Account > Security                                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Password                                                     │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Current Password                                        ││
│  │ [_________________________________] 👁️                  ││
│  │                                                         ││
│  │ New Password                                            ││
│  │ [_________________________________] 👁️                  ││
│  │ Password Strength: [████████░░] Strong                  ││
│  │                                                         ││
│  │ Confirm New Password                                    ││
│  │ [_________________________________] 👁️                  ││
│  │                                                         ││
│  │ [Change Password]                                       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  Two-Factor Authentication (2FA)                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🔒 Not Enabled                                          ││
│  │                                                         ││
│  │ Add an extra layer of security to your account          ││
│  │                                                         ││
│  │ [Enable 2FA]                                            ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  Active Sessions                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 💻 Chrome on Windows (Current)                          ││
│  │    New York, US · Jan 12, 2026 at 10:30 AM             ││
│  │                                                         ││
│  │ 📱 Mobile App on iPhone                  [Sign Out]    ││
│  │    New York, US · Jan 12, 2026 at 9:15 AM              ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  Danger Zone                                                  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [Delete Account]                                        ││
│  │ Permanently delete your account and all data            ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 API Endpoints

### Profile Management
```javascript
// Get user profile
GET /api/profile
Response: { user, stats: { orders, wishlist, reviews } }

// Update user profile
PUT /api/profile
Body: { name, phone, date_of_birth, gender, avatar_url }
Response: { success: true, user }

// Upload avatar
POST /api/profile/avatar
Body: FormData (multipart/form-data)
Response: { success: true, avatar_url }

// Delete avatar
DELETE /api/profile/avatar
Response: { success: true }
```

### Address Management
```javascript
// Get all addresses
GET /api/profile/addresses
Response: { addresses: [] }

// Add new address
POST /api/profile/addresses
Body: { full_name, phone, address_line1, city, state, postal_code, country, is_default }
Response: { success: true, address }

// Update address
PUT /api/profile/addresses/:id
Body: { ...address fields }
Response: { success: true, address }

// Delete address
DELETE /api/profile/addresses/:id
Response: { success: true }

// Set default address
POST /api/profile/addresses/:id/set-default
Response: { success: true }
```

### Payment Methods
```javascript
// Get payment methods
GET /api/profile/payment-methods
Response: { payment_methods: [] }

// Add payment method
POST /api/profile/payment-methods
Body: { method_type, card_details/upi_id/wallet_info }
Response: { success: true, payment_method }

// Delete payment method
DELETE /api/profile/payment-methods/:id
Response: { success: true }

// Set default payment
POST /api/profile/payment-methods/:id/set-default
Response: { success: true }
```

### Preferences
```javascript
// Get preferences
GET /api/profile/preferences
Response: { preferences }

// Update preferences
PUT /api/profile/preferences
Body: { email_notifications, sms_notifications, language, currency, theme }
Response: { success: true, preferences }
```

### Security
```javascript
// Change password
POST /api/profile/security/change-password
Body: { current_password, new_password }
Response: { success: true }

// Get active sessions
GET /api/profile/security/sessions
Response: { sessions: [] }

// Revoke session
DELETE /api/profile/security/sessions/:id
Response: { success: true }

// Enable 2FA
POST /api/profile/security/2fa/enable
Response: { qr_code, secret }

// Verify 2FA
POST /api/profile/security/2fa/verify
Body: { code }
Response: { success: true }
```

---

## 💻 Implementation Code Examples

### 1. Profile Overview Page Component
```typescript
// app/profile/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/account/signin');
  }

  // Fetch user data and stats
  const userData = await fetch(`${process.env.API_URL}/api/profile`, {
    headers: { Authorization: `Bearer ${session.accessToken}` }
  }).then(res => res.json());

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <ProfileSidebar user={userData.user} />
        
        {/* Main Content */}
        <div className="md:col-span-3">
          <ProfileOverview user={userData.user} stats={userData.stats} />
        </div>
      </div>
    </div>
  );
}
```

### 2. Profile Sidebar Component
```typescript
// components/profile/ProfileSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Edit, MapPin, CreditCard, Package, Heart, Star, Settings, Shield } from 'lucide-react';

const menuItems = [
  { icon: User, label: 'Overview', href: '/profile' },
  { icon: Edit, label: 'Edit Info', href: '/profile/edit' },
  { icon: MapPin, label: 'Addresses', href: '/profile/addresses' },
  { icon: CreditCard, label: 'Payments', href: '/profile/payment-methods' },
  { icon: Package, label: 'Orders', href: '/profile/orders' },
  { icon: Heart, label: 'Wishlist', href: '/profile/wishlist' },
  { icon: Star, label: 'Reviews', href: '/profile/reviews' },
  { icon: Settings, label: 'Settings', href: '/profile/settings' },
  { icon: Shield, label: 'Security', href: '/profile/security' },
];

export function ProfileSidebar({ user }: { user: any }) {
  const pathname = usePathname();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* User Avatar & Info */}
      <div className="text-center mb-6">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <User size={40} className="text-gray-400" />
          )}
        </div>
        <h3 className="font-semibold text-lg">{user.name}</h3>
        <p className="text-sm text-gray-500">{user.email}</p>
        <Link href="/profile/edit" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          Edit Profile
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

### 3. Address Management Component
```typescript
// app/profile/addresses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Home, Building } from 'lucide-react';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const res = await fetch('/api/profile/addresses');
    const data = await res.json();
    setAddresses(data.addresses);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this address?')) {
      await fetch(`/api/profile/addresses/${id}`, { method: 'DELETE' });
      fetchAddresses();
    }
  };

  const handleSetDefault = async (id: number) => {
    await fetch(`/api/profile/addresses/${id}/set-default`, { method: 'POST' });
    fetchAddresses();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saved Addresses</h1>
        <button
          onClick={() => {
            setEditingAddress(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
        >
          <Plus size={20} />
          Add Address
        </button>
      </div>

      <div className="space-y-4">
        {addresses.map((address: any) => (
          <div key={address.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                {address.address_type === 'home' ? (
                  <Home className="text-gray-400" size={20} />
                ) : (
                  <Building className="text-gray-400" size={20} />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{address.full_name}</h3>
                    {address.is_default && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {address.address_line1}
                    {address.address_line2 && `, ${address.address_line2}`}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p className="text-gray-600 text-sm">{address.country}</p>
                  <p className="text-gray-600 text-sm mt-2">Phone: {address.phone}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingAddress(address);
                    setIsModalOpen(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 p-2"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="text-red-600 hover:text-red-700 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            {!address.is_default && (
              <button
                onClick={() => handleSetDefault(address.id)}
                className="mt-4 text-sm text-blue-600 hover:underline"
              >
                Set as Default
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Address Modal */}
      {isModalOpen && (
        <AddressModal
          address={editingAddress}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setIsModalOpen(false);
            fetchAddresses();
          }}
        />
      )}
    </div>
  );
}
```

### 4. API Route - Profile
```typescript
// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get stats
  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: wishlistCount } = await supabase
    .from('wishlist')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: reviewsCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return NextResponse.json({
    user: profile,
    stats: {
      orders: ordersCount || 0,
      wishlist: wishlistCount || 0,
      reviews: reviewsCount || 0,
    }
  });
}

export async function PUT(req: NextRequest) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, phone, date_of_birth, gender } = body;

  const { data, error } = await supabase
    .from('users')
    .update({
      name,
      phone,
      date_of_birth,
      gender,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, user: data });
}
```

### 5. API Route - Addresses
```typescript
// app/api/profile/addresses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  return NextResponse.json({ addresses: addresses || [] });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // If setting as default, unset other defaults
  if (body.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: user.id,
      ...body,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, address: data });
}
```

---

## 🎯 Implementation Checklist

### Phase 1: Database Setup (Day 1)
- [ ] Run SQL migrations for new tables
- [ ] Update users table with profile fields
- [ ] Create addresses table
- [ ] Create payment_methods table
- [ ] Create user_preferences table
- [ ] Test database connections

### Phase 2: API Development (Day 2-3)
- [ ] Create profile API routes (GET, PUT)
- [ ] Create addresses API routes (CRUD)
- [ ] Create payment methods API routes
- [ ] Create preferences API routes
- [ ] Create security API routes
- [ ] Test all API endpoints with Postman

### Phase 3: UI Components (Day 4-6)
- [ ] Create ProfileSidebar component
- [ ] Create ProfileOverview page
- [ ] Create EditProfile page
- [ ] Create Addresses management page
- [ ] Create Payment methods page
- [ ] Create Settings page
- [ ] Create Security page
- [ ] Add address modal
- [ ] Add payment method modal

### Phase 4: Features & Integration (Day 7-8)
- [ ] Integrate avatar upload (Cloudinary/Supabase Storage)
- [ ] Add form validation
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success notifications
- [ ] Test on mobile devices
- [ ] Add accessibility features

### Phase 5: Polish & Testing (Day 9-10)
- [ ] Add animations and transitions
- [ ] Optimize images
- [ ] Test all user flows
- [ ] Fix bugs
- [ ] Add empty states
- [ ] Update navigation to include profile link
- [ ] Documentation

---

## 🚀 Quick Start Implementation

### Step 1: Database Migration
```bash
# Run in Supabase SQL Editor
-- Copy and paste all SQL from "Database Schema" section
```

### Step 2: Create Basic Structure
```bash
# Create folder structure
mkdir -p app/profile/{edit,addresses,payment-methods,orders,settings,security}
mkdir -p components/profile
mkdir -p app/api/profile/{addresses,payment-methods,preferences,security}
```

### Step 3: Install Dependencies
```bash
npm install lucide-react  # Icons
npm install react-hook-form  # Form handling
npm install zod  # Validation
npm install @hookform/resolvers
```

### Step 4: Add to Header Navigation
```typescript
// In your header component
{user && (
  <Link href="/profile" className="flex items-center gap-2">
    <User size={20} />
    <span>Profile</span>
  </Link>
)}
```

---

## 💡 Best Practices

1. **Security**
   - Never store plain text passwords
   - Encrypt sensitive payment data
   - Use HTTPS only
   - Implement CSRF protection
   - Validate all inputs server-side

2. **UX**
   - Auto-save preferences
   - Inline validation on forms
   - Clear error messages
   - Loading indicators
   - Confirmation dialogs for destructive actions

3. **Performance**
   - Lazy load profile sections
   - Cache user data
   - Optimize images
   - Paginate order history

4. **Mobile**
   - Stack sidebar on mobile
   - Touch-friendly buttons (min 44px)
   - Responsive forms
   - Bottom sheet modals

---

## ✅ Testing Checklist

- [ ] User can view profile
- [ ] User can edit personal info
- [ ] Avatar upload works
- [ ] Can add/edit/delete addresses
- [ ] Can set default address
- [ ] Can add payment methods
- [ ] Can update preferences
- [ ] Can change password
- [ ] All forms validate correctly
- [ ] Mobile responsive
- [ ] No console errors

---

**Estimated Time: 7-10 days for complete implementation**

This feature will significantly improve user experience and is essential for a complete e-commerce platform!
                  