# 🍔 ALTS FOOD spot - Full-Stack MERN Food Delivery App

> **Tagline:** *"Your cravings. Our mission."*  
> **Academic Project:** B.Tech Mini Project in Web Development / Full-Stack MERN Stack  
> **Brand:** **ALTS FOOD spot**

---

## 🌟 Project Overview

**ALTS FOOD spot** is an end-to-end food delivery web application built with the **MERN stack** (MongoDB, Express, React 18, Node.js). Designed to reflect modern industry standards, it features customer ordering with single-restaurant cart enforcement, server-side calculated pricing and coupons, simulated payments (UPI, Card, COD), an automated background order status progression engine, a complete live delivery tracking timeline, and an administrative portal with sales analytics and CRUD controls.

---

## ✨ Key Features

### 👤 Customer Experience
- **Interactive Home Page:**
  - Hero banner with quick action CTAs (*Order Now*, *Explore Restaurants*).
  - Live debounced search across restaurants, cuisines, and food items.
  - Trending cuisines carousel with 1-click filtering.
  - Top-rated restaurants showcase with delivery times and price indicators.
  - Popular dishes cards with dynamic quantity steppers (`[- / qty / +]`).
  - Deals & coupon codes with 1-click clipboard copy.
  - Three-step *"How ALTS FOOD spot Works"* explainer.
  - Verified foodie customer reviews.
  - Mobile app promotional banner with QR code preview.
- **Smart Cart & Pricing Engine:**
  - **Single-Restaurant Cart Invariant:** Prompts confirmation dialog if attempting to add items from another restaurant.
  - **Free Delivery Milestone Bar:** Dynamically shows progress towards the ₹499 free delivery threshold.
  - **Strict Server-Side Validation:** Delivery fee (₹40 / Free above ₹499), Platform fee (₹5), GST (5%), and coupon discounts are recalculate on the backend to prevent client tampering.
- **Simulated Multi-Method Checkout:**
  - Delivery address book (select saved addresses or add a new one with 10-digit mobile and 6-digit pincode validation).
  - Simulated payment options: **UPI** (VPA format check), **Card** (16-digit length & CVV check; no card numbers stored), and **Cash on Delivery**.
  - Animated *"Processing Payment..."* gateway dialog.
- **Real-Time Live Order Tracking:**
  - Multi-stage animated status timeline: `Placed` ➔ `Accepted` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`.
  - Auto-polling every 10 seconds to detect backend status advancements.
  - User order cancellation allowed during `Placed` and `Accepted` phases.
- **User Dashboard & Bookmarks:**
  - Order history with status tags and 1-click **Reorder** functionality.
  - Personal profile editor and address book management.
  - Optimistic heart toggle for saving favorite restaurants and dishes.

### 🛡️ Administrative Portal
- **KPI Metrics Cards:** Total Revenue, Total Orders, Active Kitchens, Registered Users, and Ongoing Deliveries.
- **Recharts Analytics:**
  - 7-Day Revenue Trend (Bar Chart).
  - 7-Day Order Volume (Line Chart).
  - Top 5 Best-Selling Food Items Breakdown.
- **Catalog Management (CRUD):**
  - Add, edit, and delete partner restaurants.
  - Add, edit, and delete dishes with category and veg/non-veg flags.
- **Live Order Control:**
  - Instant order status override dropdown to immediately advance or update any active order.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Axios, Context API (`Auth`, `Cart`, `Toast`), Plain Vanilla CSS with CSS custom variables, `react-icons`, `recharts` |
| **Backend** | Node.js, Express.js, Mongoose ODM, `bcryptjs`, `jsonwebtoken` (JWT), `cors`, `dotenv`, `morgan` |
| **Database** | MongoDB (Local at `mongodb://127.0.0.1:27017/food_spot` or MongoDB Atlas Cloud with automated in-memory fallback) |
| **Design Tokens** | Primary `#FF4D2E`, Accent `#FF8A00`, Dark Slate `#1F2937`, Soft Card Shadows, Google Fonts (`Inter`, `Poppins`) |

---

## 📋 Prerequisites

Before running the application, ensure you have installed:
1. **Node.js** (v18 or higher recommended, tested on Node v24)
2. **npm** (v9 or higher)
3. *(Optional)* **MongoDB Community Server** installed locally, OR a free **MongoDB Atlas URI**.  
   > *Note:* If local MongoDB is not running, the backend includes an automated fallback via `mongodb-memory-server` to ensure the project runs smoothly during viva demonstrations!

---

## 🚀 Installation & Setup

### 1. Clone or Extract the Repository
Navigate to the project root directory:
```bash
cd "online food delivery website mini"
```

### 2. Environment Variables Configuration

#### Backend `.env` (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/food_spot
JWT_SECRET=altsfoodspot_super_secure_college_mini_project_secret_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ORDER_PROGRESS_INTERVAL_SEC=30
```
*(To use MongoDB Atlas, replace `MONGODB_URI` with your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/food_spot?retryWrites=true&w=majority`)*

#### Frontend `.env` (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies

You can install all dependencies from the root directory:
```bash
npm run install-all
```
*Or individually:*
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## 📦 Database Seeding (`npm run seed`)

Populate the database with 10 restaurants, 80+ delicious dishes, users, promo coupons, and active demo orders:
```bash
cd backend
npm run seed
```

### 🔑 Pre-Seeded Credentials for Testing & Viva:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@gmail.com` | `Admin@123` | Full dashboard access, restaurant/dish CRUD, order status override |
| **Customer 1** | `rahul@altsfoodspot.com` | `User@123` | Ordering, saved addresses in Koramangala, active orders |
| **Customer 2** | `priya@altsfoodspot.com` | `User@123` | Ordering, Whitefield address |
| **Customer 3** | `arjun@altsfoodspot.com` | `User@123` | Ordering, HSR Layout address |

> 💡 **Tip:** On the Login page (`/login`), click the **"1-Click Demo Login"** buttons to log in instantly without typing!

### 🏷️ Active Promo Coupons:
- **`FIRST50`**: 50% OFF up to ₹120 on orders above ₹299 (Valid on 1st order).
- **`CRAVE10`**: 10% OFF up to ₹100 on orders above ₹199.
- **`FOOD20`**: 20% OFF up to ₹150 on orders above ₹399.
- **`FREEDEL`**: Free Delivery on orders above ₹249.

---

## 🏃 Starting the Application

Open two terminal windows:

### Terminal 1: Backend Server (Port 5000)
```bash
cd backend
npm run dev
```
Server runs at `http://localhost:5000`.  
Health check endpoint: `http://localhost:5000/api/health`.

### Terminal 2: Frontend Client (Port 5173)
```bash
cd frontend
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new customer account
- `POST /api/auth/login` - Authenticate user via password and issue JWT
- `POST /api/auth/send-otp` - Dispatch real 6-digit OTP to email (SMTP/Ethereal) or phone (Twilio/Fast2SMS)
- `POST /api/auth/verify-otp` - Verify 6-digit OTP, lookup/auto-register user, and issue JWT session
- `GET  /api/auth/me` - Get profile of currently logged-in user

### Restaurants (`/api/restaurants`)
- `GET    /api/restaurants?search=&cuisine=&veg=&sort=` - Fetch restaurants with filters
- `GET    /api/restaurants/:id` - Fetch restaurant details with categorized menu
- `POST   /api/restaurants` - *(Admin)* Create restaurant
- `PUT    /api/restaurants/:id` - *(Admin)* Update restaurant details
- `DELETE /api/restaurants/:id` - *(Admin)* Delete restaurant & dishes

### Food Catalog (`/api/foods`)
- `GET    /api/foods?restaurant=&category=&search=&veg=` - Query menu dishes
- `GET    /api/foods/:id` - Get dish details
- `POST   /api/foods` - *(Admin)* Add new dish
- `PUT    /api/foods/:id` - *(Admin)* Update dish
- `DELETE /api/foods/:id` - *(Admin)* Delete dish

### Global Search & Coupons
- `GET  /api/search?q=` - Search across dishes, cuisines, and restaurants
- `GET  /api/coupons` - List active promotional coupons
- `POST /api/coupons/validate` - Validate coupon eligibility and compute discount

### Orders & Tracking (`/api/orders`)
- `POST /api/orders` - Place new order with server recalculation
- `GET  /api/orders` - Get customer's orders (*Admin gets all orders*)
- `GET  /api/orders/:id` - Get order details and status timeline
- `PUT  /api/orders/:id/cancel` - Cancel order (*Permitted only when Placed or Accepted*)
- `PUT  /api/orders/:id/status` - *(Admin)* Override order status

### Users & Address Book (`/api/users`)
- `GET    /api/users/profile` - Get user profile
- `PUT    /api/users/profile` - Update profile name and mobile
- `GET    /api/users/addresses` - List saved delivery addresses
- `POST   /api/users/addresses` - Add new address
- `PUT    /api/users/addresses/:id` - Update address or set default
- `DELETE /api/users/addresses/:id` - Delete saved address

### Admin Analytics (`/api/admin`)
- `GET /api/admin/stats` - Total metrics, 7-day revenue/order trends, top 5 foods
- `GET /api/admin/users` - List all registered user accounts

---

## 🔒 Security & Best Practices
1. **Password Encryption:** Passwords are hashed using `bcryptjs` with salt rounds before storing in the database.
2. **JWT Authorization:** Protected endpoints require a valid Bearer token with 7-day expiration.
3. **Role-Based Access Control:** Admin endpoints strictly enforce `adminOnly` middleware checks.
4. **Server-Side Pricing Invariant:** Cart totals, taxes, and coupon discounts submitted by the client are ignored; the server retrieves verified prices from MongoDB and performs calculations before creating an order.

---

## 🎓 Academic Viva Questions Quick Reference
*(Refer to `VIVA_GUIDE.md` for in-depth diagrams, ER models, algorithms, and 20+ viva questions with model answers).*
