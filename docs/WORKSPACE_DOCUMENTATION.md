# Workspace Documentation

This document provides a comprehensive overview of the Serendipity project structure, with a detailed description of each file and folder.

## Project Structure

```
Serendipity/
├── .gitignore
├── LICENSE
├── README.md
├── setup-env.ps1
├── backend/
│   ├── config/
│   │   ├── redis.js
│   │   ├── supabase.js
│   │   └── supabaseSeller.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── sellerMiddleware.js
│   ├── migrations/
│   │   ├── add_images_column.sql
│   │   ├── add_mobile_to_users.sql
│   │   ├── createSellerDatabaseSchema.sql
│   │   ├── expand_product_schema.sql
│   │   ├── migrateSellerData.js
│   │   ├── populateCategories.js
│   │   ├── README_MIGRATION.md
│   │   ├── recreateSellerSchema.sql
│   │   ├── refreshSchemaCache.sql
│   │   ├── setupSellerDatabase.js
│   │   └── verifyDatabases.js
│   ├── models/
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── addressRoutes.js
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentMethodRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── productRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── sellerRoutes.js
│   │   ├── stripeRoutes.js
│   │   └── uploadRoutes.js
│   ├── scripts/
│   │   ├── checkCasing.js
│   │   ├── fixSellerDatabaseSchema.js
│   │   ├── inspectCategories.js
│   │   ├── testSellerDatabase.js
│   │   └── updateSellerSchema.js
│   ├── utils/
│   │   ├── cache.js
│   │   ├── categories.js
│   │   └── generateToken.js
│   ├── .env.example
│   ├── backend_error.log
│   ├── package.json
│   ├── seed_products.js
│   └── server.js
└── frontend/
    └── apps/
        └── web/
            ├── __create/
            │   ├── @auth/
            │   │   └── create.js
            │   ├── adapter.ts
            │   ├── dev-error-overlay.js
            │   ├── favicon.png
            │   ├── fetch.ts
            │   ├── hmr-sandbox-store.ts
            │   ├── HotReload.tsx
            │   ├── PolymorphicComponent.tsx
            │   ├── stripe.ts
            │   ├── useDevServerHeartbeat.ts
            │   └── index.ts
            ├── .react-router/
            ├── plugins/
            │   ├── addRenderIds.ts
            │   ├── aliases.ts
            │   ├── console-to-parent.ts
            │   ├── layouts.ts
            │   ├── loadFontsFromTailwindSource.ts
            │   ├── nextPublicProcessEnv.ts
            │   ├── restart.ts
            │   └── restartEnvFileChange.ts
            ├── public/
            │   └── icons8-book-ink-96.png
            ├── src/
            │   ├── __create/
            │   │   └── @auth/
            │   │       └── create.js
            │   ├── app/
            │   │   ├── __create/
            │   │   │   └── not-found.tsx
            │   │   ├── account/
            │   │   │   ├── logout/
            │   │   │   │   └── page.jsx
            │   │   │   ├── signin/
            │   │   │   │   └── page.jsx
            │   │   │   └── signup/
            │   │   │       └── page.jsx
            │   │   ├── admin/
            │   │   │   ├── products/
            │   │   │   │   ├── [id]/
            │   │   │   │   │   └── edit/
            │   │   │   │   │       └── page.jsx
            │   │   │   │   └── page.jsx
            │   │   │   └── page.jsx
            │   │   ├── api/
            │   │   │   ├── ai-search/
            │   │   │   │   └── route.js
            │   │   │   ├── auth/
            │   │   │   │   ├── expo-web-success/
            │   │   │   │   │   └── route.js
            │   │   │   │   └── token/
            │   │   │   │       └── route.js
            │   │   │   ├── cart/
            │   │   │   │   └── sync/
            │   │   │   │       └── route.js
            │   │   │   ├── orders/
            │   │   │   │   ├── create/
            │   │   │   │   │   └── route.js
            │   │   │   │   └── history/
            │   │   │   │       └── route.js
            │   │   │   ├── recommendations/
            │   │   │   │   └── route.js
            │   │   │   ├── seller/
            │   │   │   │   └── signup/
            │   │   │   │       └── route.js
            │   │   │   ├── stripe-checkout/
            │   │   │   │   └── route.js
            │   │   │   ├── utils/
            │   │   │   │   ├── sql.js
            │   │   │   │   └── upload.js
            │   │   │   └── vitest.config.ts
            │   │   ├── auth/
            │   │   │   └── callback/
            │   │   │       └── page.jsx
            │   │   ├── cart/
            │   │   │   └── page.jsx
            │   │   ├── category/
            │   │   │   └── [id]/
            │   │   │       └── page.jsx
            │   │   ├── checkout/
            │   │   │   ├── shipping/
            │   │   │   │   └── page.jsx
            │   │   │   └── success/
            │   │   │       └── page.jsx
            │   │   ├── orders/
            │   │   │   └── page.jsx
            │   │   ├── product/
            │   │   │   └── [id]/
            │   │   │       └── page.jsx
            │   │   ├── products/
            │   │   │   └── page.jsx
            │   │   ├── profile/
            │   │   │   ├── addresses/
            │   │   │   │   └── page.jsx
            │   │   │   ├── edit/
            │   │   │   │   └── page.jsx
            │   │   │   ├── orders/
            │   │   │   │   └── page.jsx
            │   │   │   ├── payment-methods/
            │   │   │   │   └── page.jsx
            │   │   │   ├── security/
            │   │   │   │   └── page.jsx
            │   │   │   ├── settings/
            │   │   │   │   └── page.jsx
            │   │   │   ├── layout.jsx
            │   │   │   └── page.jsx
            │   │   ├── search/
            │   │   │   └── page.jsx
            │   │   └── seller/
            │   │       ├── inventory/
            │   │       │   ├── edit/
            │   │       │   │   └── [id]/
            │   │       │   │       └── page.jsx
            │   │       │   ├── new/
            │   │       │   │   └── page.jsx
            │   │       │   ├── page.jsx
            │   │       │   └── ProductForm.jsx
            │   │       ├── login/
            │   │       │   └── page.jsx
            │   │       ├── orders/
            │   │       │   └── page.jsx
            │   │       ├── settings/
            │   │       │   └── page.jsx
            │   │       ├── signup/
            │   │       │   └── page.jsx
            │   │       ├── layout.jsx
            │   │       └── page.jsx
            │   ├── auth.js
            │   ├── client.d.ts
            │   ├── global.d.ts
            │   ├── index.css
            │   ├── vite-env.d.ts
            │   ├── components/
            │   │   ├── ui/
            │   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sign-up.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── textarea.tsx
│   │   ├── CategoryCard.jsx
│   │   ├── ecommerce-hero.tsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── HeroSection.jsx
│   │   ├── monochromatic-categories.tsx
│   │   ├── OrderCard.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProductCardSkeleton.jsx
│   │   ├── ProfileSidebar.jsx
│   │   ├── QuickActionCard.jsx
│   │   ├── RecentOrdersCard.jsx
│   │   ├── SalesChart.jsx
│   │   ├── StatCard.jsx
│   │   └── Toast.jsx
│   ├── lib/
│   │   ├── supabase.js
│   │   └── utils.ts
│   └── utils/
│       ├── authStore.js
│       ├── cartStore.js
│       ├── categories.js
│       ├── format.js
│       ├── generateToken.js
│       ├── useAuth.js
│       ├── useHandleStreamResponse.js
│       ├── useSocket.js
│       ├── useUpload.js
│       └── useUser.js
└── test/
    └── setupTests.ts
```

## File and Folder Descriptions

### Root Directory

| File / Folder | Description |
| :--- | :--- |
| `.gitignore` | Specifies the files and folders that should be ignored by Git. This includes `node_modules`, `.env` files, and build artifacts. |
| `LICENSE` | Contains the MIT License for this project, which is a permissive open-source license. |
| `README.md` | Provides an overview of the project, including instructions on how to set it up, run it, and troubleshoot common issues. |
| `setup-env.ps1` | A PowerShell script that automates the creation of `.env` files for both the backend and frontend, making the initial project setup easier. |
| `backend/` | Contains the Node.js/Express backend server for the application. |
| `frontend/` | Contains the frontend application code. |

### `backend/` Directory

| File / Folder | Description |
| :--- | :--- |
| `config/` | Contains configuration files for external services like databases and caching. |
| `middleware/` | Contains custom middleware for handling requests, responses, and errors in the Express application. |
| `migrations/` | Contains scripts for database schema migrations and data population. |
| `models/` | Contains the data models for the application. It appears the project is migrating from a MERN stack (MongoDB) to Supabase (PostgreSQL), as these models use Mongoose. |
| `routes/` | Contains the API route definitions for the Express application. |
| `scripts/` | Contains various scripts for development and maintenance tasks. |
| `utils/` | Contains utility functions used across the backend. |
| `.env.example` | An example file showing the required environment variables for the backend. |
| `backend_error.log` | A log file that contains error messages from the backend. The log shows a `TypeError` related to `asyncHandler` in `authRoutes.js`. |
| `package.json` | Defines the backend's dependencies, scripts, and other metadata. |
| `seed_products.js` | A script to populate the database with initial product data. |
| `server.js` | The main entry point for the backend server. It sets up the Express application, middleware, routes, and Socket.io. |

### `backend/config/` Directory

| File / Folder | Description |
| :--- | :--- |
| `redis.js` | Configures the Redis client for caching and other purposes. |
| `supabase.js` | Configures the main Supabase client for interacting with the primary database. |
| `supabaseSeller.js`| Configures a separate Supabase client for the seller-specific database. |

### `backend/middleware/` Directory

| File / Folder | Description |
| :--- | :--- |
| `authMiddleware.js` | Contains middleware for protecting routes by verifying JWT tokens and checking for admin privileges. |
| `errorMiddleware.js` | Contains middleware for handling 404 Not Found errors and other general errors. |
| `sellerMiddleware.js` | Contains middleware to protect seller-specific routes by verifying the user's seller profile. |

### `backend/migrations/` Directory

| File / Folder | Description |
| :--- | :--- |
| `add_images_column.sql` | Adds an `images` column to the `products` table to support multiple images. |
| `add_mobile_to_users.sql` | Adds a `mobile` column to the `users` table to store user phone numbers. |
| `createSellerDatabaseSchema.sql` | Creates the entire schema for the seller database, including tables, indexes, RLS policies, and triggers. |
| `expand_product_schema.sql` | Expands the `products` table with new columns to support more advanced product features. |
| `migrateSellerData.js` | The main script for migrating seller data from the main database to the seller database. |
| `populateCategories.js` | Populates the database with sample products to establish a set of categories and subcategories. |
| `README_MIGRATION.md` | A detailed guide on how to migrate seller data from the main database to the seller database. |
| `recreateSellerSchema.sql` | An idempotent script to recreate the seller database schema, ensuring a clean and consistent state. |
| `refreshSchemaCache.sql` | A script to refresh the PostgREST schema cache, useful for troubleshooting. |
| `setupSellerDatabase.js` | A utility script to check the setup of the seller database and provide setup instructions. |
| `verifyDatabases.js` | A comprehensive utility for verifying the configuration and health of both the main and seller databases. |

### `backend/models/` Directory

| File / Folder | Description |
| :--- | :--- |
| `Order.js` | Defines the Mongoose schema for the `Order` model. This is likely a remnant of a previous MERN stack implementation. |
| `Product.js` | Defines the Mongoose schema for the `Product` model. This is likely a remnant of a previous MERN stack implementation. |
| `User.js` | Defines the Mongoose schema for the `User` model, including password hashing. This is likely a remnant of a previous MERN stack implementation. |

### `backend/routes/` Directory

| File / Folder | Description |
| :--- | :--- |
| `addressRoutes.js` | Defines the API routes for managing user addresses. |
| `authRoutes.js` | Defines the API routes for user authentication, including login, registration, and seller login. |
| `cartRoutes.js` | Defines the API routes for managing the user's shopping cart. |
| `categoryRoutes.js` | Defines the API routes for getting categories and subcategories. |
| `orderRoutes.js` | Defines the API routes for managing orders. |
| `paymentMethodRoutes.js`| Defines the API routes for managing user payment methods. |
| `paymentRoutes.js` | Defines the API routes for handling Razorpay payments. |
| `productRoutes.js` | Defines the API routes for managing products, handling logic for both main and seller databases. |
| `profileRoutes.js` | Defines the API routes for managing user profiles and preferences. |
| `sellerRoutes.js` | Defines the API routes for seller-specific actions, such as registration and dashboard data. |
| `stripeRoutes.js` | Defines the API route for creating a Stripe checkout session. |
| `uploadRoutes.js` | Defines the API routes for uploading files, using `multer` and Supabase Storage. |

### `backend/scripts/` Directory

| File / Folder | Description |
| :--- | :--- |
| `checkCasing.js` | A diagnostic script to check for case sensitivity issues in the file system. |
| `fixSellerDatabaseSchema.js` | A diagnostic script to help fix issues with the seller database schema, particularly the `PGRST205` error. |
| `inspectCategories.js` | A script to inspect the categories and subcategories from both the main and seller databases. |
| `testSellerDatabase.js` | A script to test the connection to the seller database and verify that the tables are set up correctly. |
| `updateSellerSchema.js` | A script to automatically update the seller database schema by executing the `expand_product_schema.sql` file. |

### `backend/utils/` Directory

| File / Folder | Description |
| :--- | :--- |
| `cache.js` | A caching utility that uses Redis as a backend with an in-memory fallback. |
| `categories.js` | Defines a hardcoded list of main categories and subcategories. |
| `generateToken.js` | A utility for generating a JWT token. |

### `frontend/apps/web/` Directory

| File / Folder | Description |
| :--- | :--- |
| `__create/` | Contains files related to the creation and setup of the application, likely part of a framework or scaffolding tool. It includes the main Hono server entry point, an auth adapter, and an API route builder. |
| `.react-router/` | A directory generated by React Router for its internal workings, including type definitions. This directory appears to be empty. |
| `plugins/` | Contains custom Vite plugins to extend the build process with additional functionality. |
| `public/` | Contains static assets that are publicly accessible, such as images and icons. |
| `src/` | The main source code directory for the frontend application. |
| `test/` | Contains test files and setup for the frontend application. |
| `.env.example` | An example file showing the required environment variables for the frontend. |
| `.gitignore` | Specifies files and folders to be ignored by Git within the frontend project. |
| `package.json` | Defines the frontend's dependencies, scripts, and other metadata. |
| `react-router.config.ts` | The configuration file for React Router, specifying app directory, SSR, and pre-rendering settings. |
| `tailwind.config.js`| The configuration file for Tailwind CSS, including a very large list of custom fonts. |
| `tsconfig.json` | The configuration file for the TypeScript compiler. |
| `vite.config.ts` | The configuration file for Vite, the frontend build tool. |
| `vitest.config.ts` | The configuration file for Vitest, the testing framework. |

### `frontend/apps/web/__create/` Directory

| File / Folder | Description |
| :--- | :--- |
| `@auth/` | A directory containing authentication-related files. |
| `dev-error-overlay.js` | A script that creates a custom error overlay in development. |
| `favicon.png` | The favicon for the application. |
| `fetch.ts` | A wrapper around the native `fetch` function that adds custom headers and logging. |
| `hmr-sandbox-store.ts` | A Zustand store for managing the state of the hot-module-reloading (HMR) sandbox. |
| `HotReload.tsx` | A React component that provides visual feedback for the HMR process. |
| `PolymorphicComponent.tsx` | A polymorphic React component that can render any HTML element and adds fallback logic for images. |
| `stripe.ts` | A wrapper around the Stripe API that makes requests to a protected endpoint. |
| `useDevServerHeartbeat.ts` | A React hook that sends a heartbeat request to the development server to keep it alive. |
| `index.ts` | The main entry point for the Hono server, setting up middleware, error handling, auth, and API routes. |
| `is-auth-action.ts` | A utility function to check if a given path is an authentication-related action. |
| `route-builder.ts` | A script that automatically discovers and registers API routes for the Hono server. |

### `frontend/apps/web/__create/@auth/` Directory

| File / Folder | Description |
| :--- | :--- |
| `create.js` | A function that returns an `auth` object with a function to get the current user's session from a JWT token. |

### `frontend/apps/web/plugins/` Directory

| File / Folder | Description |
| :--- | :--- |
| `addRenderIds.ts` | A Vite plugin that adds a unique `renderId` prop to each HTML element for debugging purposes. |
| `aliases.ts` | A Vite plugin that sets up aliases for the `@/` import path to resolve to the `src` directory. |
| `console-to-parent.ts` | A Vite plugin that forwards console messages from the app to the parent window for debugging. |
| `layouts.ts` | A Vite plugin that implements a hierarchical layout system. |
| `loadFontsFromTailwindSource.ts`| A Vite plugin that automatically loads fonts from Google Fonts based the Tailwind CSS classes. |
| `nextPublicProcessEnv.ts` | A Vite plugin that makes `process.env` safe on the client by only exposing variables with the `NEXT_PUBLIC_` prefix. |
| `restart.ts` | A Vite plugin that restarts the development server when certain files are changed. |
| `restartEnvFileChange.ts` | A Vite plugin that watches for changes to `.env` files and restarts the development server. |

### `frontend/apps/web/public/` Directory

| File / Folder | Description |
| :--- | :--- |
| `icons8-book-ink-96.png` | An icon image file. |

### `frontend/apps/web/src/` Directory

| File / Folder | Description |
| :--- | :--- |
| `__create/` | Contains files related to the creation and setup of the application within the app directory. |
| `app/` | The main application directory, containing the routes and pages of the application. |
| `components/` | Contains reusable React components. |
| `lib/` | Contains library code and helper functions. |
| `utils/` | Contains utility functions used across the frontend. |
| `auth.js` | An internal file for configuring the authentication providers. |
| `client.d.ts` | A TypeScript declaration file that includes the Vite client types. |
| `global.d.ts` | A TypeScript declaration file that defines global types and module declarations. |
| `index.css` | The main CSS file for the application, defining themes, animations, and utility classes. |
| `vite-env.d.ts` | A TypeScript declaration file that defines the shape of the environment variables exposed to the Vite client. |

### `frontend/apps/web/src/__create/` Directory

| File / Folder | Description |
| :--- | :--- |
| `@auth/` | A directory containing authentication-related files. |
| `dev-error-overlay.js` | A script that creates a custom error overlay in development. |
| `favicon.png` | The favicon for the application. |
| `fetch.ts` | A wrapper around the native `fetch` function that adds custom headers and logging. |
| `hmr-sandbox-store.ts` | A Zustand store for managing the state of the hot-module-reloading (HMR) sandbox. |
| `HotReload.tsx` | A React component that provides visual feedback for the HMR process. |
| `PolymorphicComponent.tsx` | A polymorphic React component that can render any HTML element and adds fallback logic for images. |
| `stripe.ts` | A wrapper around the Stripe API that makes requests to a protected endpoint. |
| `useDevServerHeartbeat.ts` | A React hook that sends a heartbeat request to the development server to keep it alive. |

### `frontend/apps/web/src/__create/@auth/` Directory

| File / Folder | Description |
| :--- | :--- |
| `create.js` | A function that returns an `auth` object with the functionality to retrieve the current user's session from a JWT token, used server-side. |

### `frontend/apps/web/src/app/` Directory

| File / Folder | Description |
| :--- | :--- |
| `__create/` | Contains files related to the creation and setup of the application within the app directory, specifically for routes like `not-found.tsx`. |
| `account/` | Contains files related to user account management (e.g., login, signup, logout). |
| `admin/` | Contains files related to the admin dashboard and functionalities. |
| `api/` | Contains API routes that are part of the frontend Hono server. |
| `auth/` | Contains authentication-related pages or components. |
| `cart/` | Contains files related to the shopping cart functionality. |
| `category/` | Contains pages for displaying products by category. |
| `checkout/` | Contains pages related to the checkout process. |
| `orders/` | Contains pages for displaying user orders. |
| `product/` | Contains pages for displaying individual product details. |
| `products/` | Contains pages for displaying a list of products. |
| `profile/` | Contains pages for managing user profiles, addresses, and payment methods. |
| `search/` | Contains pages for product search functionality. |
| `seller/` | Contains pages and components specific to seller functionalities. |
| `global.css` | The global CSS file for the frontend application, defining themes, animations, and utility classes. |
| `layout.jsx` | The root layout component for the frontend application, handling global structure, authentication, and data fetching. |
| `page.jsx` | The main home page component for the frontend application. |
| `root.tsx` | The root component for the entire React application, setting up basic HTML structure, HMR, and sandbox interaction. |
| `routes.ts` | A script that dynamically generates React Router routes based the file system structure. |

### `frontend/apps/web/src/app/__create/` Directory

| File / Folder | Description |
| :--- | :--- |
| `not-found.tsx` | The component for handling 404 Not Found pages. |

### `frontend/apps/web/src/app/account/` Directory

| File / Folder | Description |
| :--- | :--- |
| `logout/` | Contains the `page.jsx` component for logging out a user. |
| `signin/` | Contains the `page.jsx` component for user sign-in. |
| `signup/` | Contains the `page.jsx` component for user registration. |

### `frontend/apps/web/src/app/admin/` Directory

| File / Folder | Description |
| :--- | :--- |
| `products/` | Contains pages for managing products in the admin panel. |
| `page.jsx` | The Admin Dashboard page component, displaying statistics, recent orders, and quick actions, with access control. |

### `frontend/apps/web/src/app/admin/products/` Directory

| File / Folder | Description |
| :--- | :--- |
| `[id]/` | Contains pages for managing a specific product by its ID. |
| `page.jsx` | The Admin Product List page component, displaying a table of products with search, filter, edit, delete, and create options. |

### `frontend/apps/web/src/app/admin/products/[id]/` Directory

| File / Folder | Description |
| :--- | :--- |
| `edit/` | Contains pages for editing a specific product. |

### `frontend/apps/web/src/app/admin/products/[id]/edit/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The Product Edit page component for admins, allowing them to view and update product details. |

### `frontend/apps/web/src/app/api/` Directory

| File / Folder | Description |
| :--- | :--- |
| `ai-search/` | Contains the API endpoint for AI-powered product search. |
| `auth/` | Contains API endpoints related to authentication. |
| `cart/` | Contains API endpoints for managing the user's shopping cart. |
| `orders/` | Contains API endpoints for managing orders. |
| `recommendations/` | Contains API endpoints for product recommendations. |
| `seller/` | Contains API endpoints for seller-specific actions. |
| `stripe-checkout/` | Contains the API endpoint for creating a Stripe checkout session. |
| `utils/` | Contains utility functions for API routes. |
| `vitest.config.ts` | The Vitest configuration file for API tests. |

### `frontend/apps/web/src/app/api/ai-search/` Directory

| File / Folder | Description |
| :--- | :--- |
| `route.js` | Defines an AI search API endpoint that uses the Gemini API to understand user intent, generate search queries, and fetch relevant products. |

### `frontend/apps/web/src/app/api/auth/` Directory

| File / Folder | Description |
| :--- | :--- |
| `expo-web-success/` | Contains an API route that handles successful authentication callbacks for Expo web. |
| `token/` | Contains an API route that retrieves the JWT token and user information. |

### `frontend/apps/web/src/app/api/cart/` Directory

| File / Folder | Description |
| :--- | :--- |
| `sync/` | Contains the API route for syncing and retrieving the user's shopping cart. |

### `frontend/apps/web/src/app/api/orders/` Directory

| File / Folder | Description |
| :--- | --- |
| `create/` | Contains the API route for creating a new order. |
| `history/` | Contains the API route for retrieving a user's order history. |

### `frontend/apps/web/src/app/api/recommendations/` Directory

| File / Folder | Description |
| :--- | :--- |
| `route.js` | Defines an API route for generating product recommendations using ChatGPT and then fetching actual products based on those recommendations. |

### `frontend/apps/web/src/app/api/seller/` Directory

| File / Folder | Description |
| :--- | :--- |
| `signup/` | Contains an API route that acts as a proxy for the seller signup endpoint in the backend. |

### `frontend/apps/web/src/app/api/stripe-checkout/` Directory

| File / Folder | Description |
| :--- | :--- |
| `route.js` | Defines an API route for creating a Stripe checkout session. |

### `frontend/apps/web/src/app/api/utils/` Directory

| File / Folder | Description |
| :--- | :--- |
| `sql.js` | Configures a serverless Neon database client for direct SQL execution. |
| `upload.js` | A utility function for uploading files to a specified URL. |

### `frontend/apps/web/src/app/auth/` Directory

| File / Folder | Description |
| :--- | :--- |
| `callback/` | Contains the `page.jsx` component that handles the authentication callback from Supabase. |

### `frontend/apps/web/src/app/cart/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The Shopping Cart page component, which displays the items in the user's cart, allows updating quantities, removing items, and proceeding to checkout. |

### `frontend/apps/web/src/app/category/` Directory

| File / Folder | Description |
| :--- | :--- |
| `[id]/` | Contains pages for displaying products by a specific category ID. |
| `page.jsx` | The Category Page component, displaying products, filtering, sorting, and pagination for a specific category. |

### `frontend/apps/web/src/app/checkout/` Directory

| File / Folder | Description |
| :--- | :--- |
| `shipping/` | Contains the `page.jsx` component for the shipping address and payment processing. |
| `success/` | Contains the `page.jsx` component for displaying order success messages. |

### `frontend/apps/web/src/app/orders/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The Orders Page component for the current user's order history. |

### `frontend/apps/web/src/app/product/` Directory

| File / Folder | Description |
| :--- | :--- |
| `[id]/` | Contains pages for displaying detailed information about a product by its ID. |
| `page.jsx` | The Product Details page component, which displays detailed information about a single product. |

### `frontend/apps/web/src/app/products/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The All Products Page component, displaying a comprehensive list of products with filtering, sorting, and pagination. |

### `frontend/apps/web/src/app/profile/` Directory

| File / Folder | Description |
| :--- | :--- |
| `addresses/` | Contains pages for managing user addresses. |
| `edit/` | Contains pages for editing the user's profile. |
| `orders/` | Contains pages for displaying the user's order history within the profile section. |
| `payment-methods/` | Contains pages for managing user payment methods. |
| `security/` | Contains pages for managing user account security settings. |
| `settings/` | Contains pages for managing user preferences and privacy settings. |
| `layout.jsx` | The layout component for the user profile pages. |
| `page.jsx` | The Profile Overview Page component, displaying a summary of the user's account. |

### `frontend/apps/web/src/app/profile/addresses/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The Addresses Page component, which allows users to view, add, edit, delete, and set default shipping addresses. |

### `frontend/apps/web/src/app/profile/edit/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The Edit Profile Page component, allowing users to update their personal information and avatar. |

### `frontend/apps/web/src/app/profile/orders/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The Orders Page component within the user's profile section, displaying a filtered list of the current user's past orders. |

### `frontend/apps/web/src/app/profile/payment-methods/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The Payment Methods Page component, which allows users to view, add, delete, and set default payment methods. |

### `frontend/apps/web/src/app/profile/security/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The Security Page component, allowing users to change their password and includes placeholders for two-factor authentication and account deletion. |

### `frontend/apps/web/src/app/profile/settings/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The Settings Page component, which allows users to manage their notification preferences, display preferences (language, currency, theme), and privacy settings. |

### `frontend/apps/web/src/app/search/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The Search Page component, which displays search results for products, with filtering and sorting options. |

### `frontend/apps/web/src/app/seller/` Directory

| File / Folder | Description |
| :--- | :--- |
| `inventory/` | Contains pages for managing a seller's product inventory. |
| `login/` | Contains pages for seller login. |
| `orders/` | Contains pages for managing seller-specific orders. |
| `settings/` | Contains pages for managing seller profile settings. |
| `signup/` | Contains pages for seller registration. |
| `layout.jsx` | The layout component for seller-specific pages, handling authentication and navigation. |
| `page.jsx` | The Seller Dashboard page component, displaying statistics, quick actions, and sales charts. |

### `frontend/apps/web/src/app/seller/inventory/` Directory

| File / Folder | Description |
| :--- | :--- |
| `edit/` | Contains pages for editing existing products in the seller's inventory. |
| `new/` | Contains the `page.jsx` component for adding new products to the seller's inventory. |
| `page.jsx` | The Seller Inventory Page component, which allows sellers to view, search, filter, and manage their product listings. |
| `ProductForm.jsx` | A reusable React component that provides a form for the creation and editing of product details. |

### `frontend/apps/web/src/app/seller/inventory/edit/[id]/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The Product Edit Page component for sellers, allowing them to view and update comprehensive product details. |

### `frontend/apps/web/src/app/seller/inventory/new/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The "Add New Product" page component for sellers, featuring a multi-tabbed form for product details, media uploads, and validation. |

### `frontend/apps/web/src/app/seller/login/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The Seller Login Page component, which allows sellers to log in. |

### `frontend/apps/web/src/app/seller/orders/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The Seller Orders Page component, which displays a real-time feed of seller-specific orders, including filtering by status. |

### `frontend/apps/web/src/app/seller/settings/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The Seller Settings Page component, which allows sellers to manage their store information. |

### `frontend/apps/web/src/app/seller/signup/` Directory

| File / Folder | Description |
| :--- | :--- |
| `page.jsx` | The Seller Signup Page component, which guides users through a multi-step process to register as a seller. |

### `frontend/apps/web/src/components/` Directory

| File / Folder | Description |
| :--- | :--- |
| `ui/` | Contains a collection of reusable UI components. |
| `CategoryCard.jsx` | A reusable React component for displaying a category card, including icons/images and navigation links. |
| `ecommerce-hero.tsx` | A React component that implements an e-commerce hero carousel, supporting images and videos, autoplay, and promotional information. |
| `Footer.jsx` | A React component that renders the application's footer section with navigation links and contact information. |
| `Header.jsx` | A React component that renders the application's header, including logo, search bar, navigation, cart, and user menu. |
| `HeroSection.jsx` | A React component that renders a customizable hero section with title, subtitle, CTAs, and statistics. |
| `monochromatic-categories.tsx` | A React component for displaying monochromatic category cards with hover effects, supporting image and video media. |
| `OrderCard.jsx` | A React component that displays a single order's information, including order number, total amount, status, and creation time. |
| `ProductCard.jsx` | A React component that displays a product card with image, title, price, rating, and add to cart functionality. |
| `ProductCardSkeleton.jsx` | A React component that displays a loading skeleton for a product card. |
| `ProfileSidebar.jsx` | A React component that renders the sidebar for the user profile section, displaying user information and navigation links. |
| `QuickActionCard.jsx` | A reusable React component for displaying quick action cards in dashboards. |
| `RecentOrdersCard.jsx` | A React component that displays a list of recent orders in a compact card format, with real-time updates. |
| `SalesChart.jsx` | A React component that renders an SVG-based bar chart for visualizing sales data. |
| `StatCard.jsx` | A React component that displays a statistical card with a title, value, icon, and optional trend indicator. |
| `Toast.jsx` | A React component that displays a dismissible toast notification. |

### `frontend/apps/web/src/components/ui/` Directory

| File / Folder | Description |
| :--- | :--- |
| `badge.tsx` | A React component for rendering badges with different visual variants. |
| `button.tsx` | A React component for rendering buttons with different visual variants and sizes. |
| `card.tsx` | A React component that provides a flexible card structure with various sub-components. |
| `carousel.tsx` | A React component that implements a carousel with navigation, autoplay, and accessibility features. |
| `dialog.tsx` | A React component that implements a dialog (modal) with various sub-components. |
| `input.tsx` | A React component that renders an HTML `input` element with consistent styling. |
| `label.tsx` | A React component that renders a stylized HTML `label` element. |
| `scroll-area.tsx` | A React component that implements a customizable scrollable area. |
| `separator.tsx` | A React component that renders a horizontal or vertical separator. |
| `sign-up.tsx` | A reusable React component for handling user authentication (login/signup). |
| `table.tsx` | A React component for rendering tables with consistent styling. |
| `tabs.tsx` | A React component that implements a tabbed interface. |
| `textarea.tsx` | A React component that renders an HTML `textarea` element with consistent styling. |

### `frontend/apps/web/src/lib/` Directory

| File / Folder | Description |
| :--- | :--- |
| `supabase.js` | Initializes the Supabase client for the frontend. |
| `utils.ts` | A utility file for conditionally combining Tailwind CSS classes. |

### `frontend/apps/web/src/utils/` Directory

| File / Folder | Description |
| :--- | :--- |
| `authStore.js` | A Zustand store for managing authentication state. |
| `cartStore.js` | A Zustand store for managing the shopping cart state. |
| `categories.js` | Defines a comprehensive structure for product categories and subcategories, and provides utility functions for working with them. |
| `format.js` | Provides utility functions for formatting numbers as Indian currency and for compacting large numbers. |
| `useAuth.js` | A React hook that centralizes authentication logic for the frontend. |
| `useHandleStreamResponse.js` | A React hook that handles streaming responses, typically from an API. |
| `useSocket.js` | A React hook that manages a WebSocket connection to a Socket.IO server for real-time updates. |
| `useUpload.js` | A React hook that provides a function for uploading files to a generic API endpoint. |
| `useUser.js` | A React hook that provides access to the user's authentication data. |

### `frontend/apps/web/test/` Directory

| File / Folder | Description |
| :--- | :--- |
| `setupTests.ts` | A test setup file that extends Jest matchers with custom DOM element matchers. |
