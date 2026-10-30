# 🎓 ALTS FOOD spot: Comprehensive Project & Viva Examination Guide

> **Project Title:** ALTS FOOD spot - Full-Stack MERN Food Delivery App  
> **Tagline:** *"Your cravings. Our mission."*  
> **Degree Program:** B.Tech / B.E. in Computer Science & Engineering / Information Technology  
> **Course:** Web Technologies / Full-Stack Development Mini Project

---

## 1. Project Explanation & Objectives

### 1.1 Problem Statement
In urban environments, hungry customers often face delayed meal deliveries, non-transparent delivery pricing, and complex user interfaces. Conversely, independent food businesses struggle to find lightweight, transparent digital platforms to showcase their menus. **ALTS FOOD spot** resolves these issues by offering a fast, responsive, transparent, and aesthetically appealing hyper-local food delivery platform.

### 1.2 Core Objectives
1. **Full-Stack MERN Architecture:** Build a decoupled application using React 18 on the frontend and Node.js/Express with MongoDB on the backend.
2. **Strict Server-Side Validation:** Recompute all pricing, fees, and promotional discounts on the server to prevent malicious client tampering.
3. **Single-Restaurant Cart Invariant:** Prevent logistical delivery conflicts by ensuring each order originates from a single restaurant kitchen.
4. **Live Order Progression Simulation:** Simulate the real-world lifecycle of food preparation and delivery via a background progression engine.
5. **Business Intelligence & Administration:** Offer restaurant owners and store administrators actionable revenue charts and catalog management tools.

---

## 2. Technology Stack & Justification

| Technology | Role | Why Chosen over Alternatives? |
| :--- | :--- | :--- |
| **React 18 (Vite)** | Frontend Framework | Fast Virtual DOM reconciliation, modular component hierarchy, and instant Vite hot-module replacement (HMR) compared to slower Webpack bundlers. |
| **React Context API** | State Management | Lightweight and built natively into React; eliminates bulky external Redux/MobX boilerplate for small-to-mid size projects (`AuthContext`, `CartContext`, `ToastContext`). |
| **Node.js & Express.js** | Backend Runtime & Framework | Non-blocking, event-driven asynchronous I/O model ideal for concurrent API requests and polling operations. |
| **MongoDB & Mongoose** | NoSQL Database & ODM | Schema flexibility for storing hierarchical snapshots of food items and delivery addresses inside orders without complex SQL joins. |
| **JWT (JSON Web Tokens)** | Stateless Auth | Eliminates server-side session memory consumption; token payload carries user ID and role with cryptographic signature. |
| **Vanilla CSS (Design Tokens)** | Styling System | Full design flexibility using native CSS custom properties without Tailwind build bloat or UI kit lock-in. |
| **Recharts** | Analytics Charts | Declarative React charting library built on SVG for crisp, responsive administrative visualizations. |

---

## 3. System Architecture Diagram

```mermaid
graph TD
    subgraph Client["Frontend Client (Port 5173)"]
        UI["React 18 + Vite SPA"]
        Router["React Router v6"]
        Context["Context API (Auth, Cart, Toast)"]
        Axios["Axios Client (Bearer Interceptor)"]
        UI --> Router
        UI --> Context
        Context --> Axios
    end

    subgraph Server["Backend Server (Port 5000)"]
        Express["Express.js Server"]
        AuthMid["JWT Auth Middleware"]
        Controllers["Controllers (Order, Restaurant, Auth, etc.)"]
        Scheduler["Background Progression Daemon (30s)"]
        Express --> AuthMid
        AuthMid --> Controllers
        Scheduler --> Controllers
    end

    subgraph Database["Database Tier"]
        Mongo[("MongoDB Database\nCollections: Users, Restaurants, Foods, Orders, etc.")]
        Controllers --> Mongo
    end

    Axios -->|REST API over HTTP| Express
```

---

## 4. Entity-Relationship (ER) & Data Model Diagram

```mermaid
erDiagram
    USER ||--o{ ADDRESS : "saves"
    USER ||--o{ ORDER : "places"
    USER ||--o{ FAVORITE : "bookmarks"
    RESTAURANT ||--|{ FOOD : "offers"
    RESTAURANT ||--o{ ORDER : "receives"
    ORDER ||--|{ ORDER_ITEM : "contains snapshot of"
    COUPON ||--o{ ORDER : "applied to"

    USER {
        ObjectId _id
        string name
        string email
        string mobile
        string passwordHash
        string role
        string avatar
    }

    ADDRESS {
        ObjectId _id
        ObjectId user
        string fullName
        string mobile
        string houseNo
        string street
        string city
        string pincode
        boolean isDefault
    }

    RESTAURANT {
        ObjectId _id
        string name
        string image
        string cuisines
        number rating
        number deliveryTimeMins
        string priceRange
        boolean isPureVeg
    }

    FOOD {
        ObjectId _id
        ObjectId restaurant
        string name
        number price
        string category
        boolean isVeg
        boolean isPopular
    }

    ORDER {
        ObjectId _id
        ObjectId user
        ObjectId restaurant
        number subtotal
        number deliveryFee
        number platformFee
        number tax
        number discount
        number total
        string paymentMethod
        string status
        Date estimatedDeliveryAt
    }

    COUPON {
        ObjectId _id
        string code
        string type
        number value
        number minOrder
        number maxDiscount
    }
```

---

## 5. Key Request & Logic Flows

### 5.1 Authentication Flow
```mermaid
sequenceDiagram
    autonumber
    actor Customer as User / Client
    participant Client as React SPA (AuthContext)
    participant API as Express Auth Endpoint
    participant DB as MongoDB (User Model)

    Customer->>Client: Enters Email & Password
    Client->>API: POST /api/auth/login {email, password}
    API->>DB: User.findOne({email}).select('+passwordHash')
    DB-->>API: Returns user document with hash
    API->>API: bcrypt.compare(password, passwordHash)
    alt Password Matches
        API->>API: Sign JWT with user ID & role (7-day expiry)
        API-->>Client: HTTP 200 {success: true, token, user}
        Client->>Client: Save token to localStorage & state
    else Password Invalid
        API-->>Client: HTTP 401 {success: false, message: "Invalid credentials"}
    end
```

### 5.2 Order Placement & Server-Side Pricing Verification Flow
```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer
    participant Cart as CartContext
    participant Checkout as CheckoutPage
    participant API as POST /api/orders
    participant DB as MongoDB

    Customer->>Checkout: Selects Address & Payment Method, clicks "Pay & Place Order"
    Checkout->>API: POST /api/orders (restaurantId, itemIds, address, couponCode)
    API->>DB: Query authoritative food prices for itemIds
    API->>API: Compute subtotal = sum(dbPrice * qty)
    API->>API: Calculate deliveryFee (0 if subtotal >= 499 else 40)
    API->>API: Add platformFee (5) and GST (5% of subtotal)
    API->>DB: Verify couponCode eligibility & discount
    API->>API: Final Total = subtotal + fees + tax - discount
    API->>DB: Create Order document with items & address snapshot
    DB-->>API: Returns saved order
    API-->>Checkout: HTTP 201 {success: true, data: order}
    Checkout->>Cart: clearCart()
    Checkout-->>Customer: Redirect to /orders/:id (Live Tracking)
```

---

## 6. Top Viva Questions & Answers

### Q1: Why did you choose MERN instead of PHP/MySQL or Django?
**Answer:** The MERN stack uses a unified language (JavaScript) across the frontend and backend. Node.js provides high throughput through asynchronous, non-blocking I/O. MongoDB's JSON-like document format maps directly to JavaScript objects, allowing us to store complete address and food snapshots within orders without multi-table SQL join overhead.

### Q2: Why do you calculate the order total on the backend instead of accepting the client's total?
**Answer:** The client side can be easily tampered with using browser developer tools or HTTP clients like Postman. If we trusted client totals, a malicious actor could edit the price of a ₹400 biryani to ₹1. The backend always queries the database for authoritative unit prices, applies verified business rules, and computes the canonical total before storing the order.

### Q3: How is authentication handled securely?
**Answer:**
1. Passwords are never stored in plain text; they are hashed using **`bcryptjs`** with 10 salt rounds before database insertion.
2. The user model explicitly sets `select: false` on `passwordHash` so it is not returned in standard queries.
3. Upon login, a cryptographically signed **JWT (JSON Web Token)** is issued. Protected routes inspect the token in the `Authorization: Bearer <token>` header using middleware before fulfilling the request.

### Q4: How does the single-restaurant cart rule work?
**Answer:** In `CartContext`, before an item is added, the code checks whether `cartState.restaurant` is already set. If it belongs to a different restaurant ID and the cart is non-empty, a conflict dialog is shown asking the user whether to discard the current cart and start a new order.

### Q5: How is live order tracking implemented?
**Answer:** The tracking page (`OrderDetailPage.jsx`) mounts an interval that polls `GET /api/orders/:id` every 10 seconds. Meanwhile, the backend runs a lightweight scheduler (`setInterval`) that checks active demo orders and auto-advances their status from `Placed` $\to$ `Accepted` $\to$ `Preparing` $\to$ `Out for Delivery` $\to$ `Delivered` every 30 seconds. Administrators can also manually override the status at any time.

### Q6: What is an address snapshot and why is it used?
**Answer:** Instead of only saving a reference to the user's address ID, the order stores a frozen **snapshot** of the address at the moment of checkout. If the user later edits or deletes their address in their profile, historical delivery records remain accurate and unchanged.

### Q7: What are the HTTP status codes used in your REST API?
**Answer:**
- `200 OK`: Request succeeded (e.g. data retrieved).
- `201 Created`: Resource successfully created (e.g. registration, order created).
- `400 Bad Request`: Validation failure or invalid parameters.
- `401 Unauthorized`: Missing or expired authentication token.
- `403 Forbidden`: Insufficient permissions (e.g. regular user accessing admin routes).
- `404 Not Found`: Requested restaurant, dish, or order does not exist.
- `500 Internal Server Error`: Unhandled server exception.

---

## 7. Limitations & Scope for Future Enhancements

### Current Limitations
1. **Simulated Payments:** Transactions are currently simulated rather than integrated with a live banking merchant gateway (Razorpay / Stripe).
2. **Polling vs WebSockets:** Order updates use 10-second polling rather than bidirectional WebSockets (Socket.IO).
3. **Mock Map Coordinates:** Real-time driver GPS tracking on a map is represented as status stages rather than live geospatial coordinates.

### Future Enhancements Roadmap
1. **Live Payment Gateway:** Integration with Razorpay / Stripe Webhooks for instant UPI QR and card payments.
2. **WebSocket Live Tracking:** Real-time push updates via Socket.IO for sub-second status changes and rider location tracking.
3. **Live GPS Map Tracking:** Integration with Google Maps API or Leaflet.js to display moving delivery rider markers.
4. **Multi-Role Portals:** Separate mobile apps / portals for Delivery Partners (accept/reject deliveries) and Restaurant Kitchens (KDS - Kitchen Display System).
5. **AI Recommendation Engine:** Personalized dish recommendations based on past order history and collaborative filtering.
6. **Customer Ratings & Photo Reviews:** Permitting customers to post verified star ratings and food photos after delivery.
