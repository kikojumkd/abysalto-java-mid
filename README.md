# Abysalto Mid Developer – Technical Task

A full-stack e-commerce application with user management, product browsing (via DummyJSON API), shopping cart, and favorites – built with **Spring Boot 3** and **React**.

## Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.4.3**
- **Spring Security** with JWT authentication + optional TOTP-based 2FA
- **Spring Data JDBC** with **H2** in-memory database
- **Spring WebFlux** (`WebClient`) for DummyJSON API integration
- **Caffeine Cache** for product data caching
- **SpringDoc OpenAPI** (Swagger UI)
- **Lombok** for boilerplate reduction
- **Bean Validation** for request validation

### Frontend
- **React 18** with Vite
- **React Router v6** for SPA routing
- **Axios** with JWT interceptor
- **Lucide React** for icons
- Context API for global state (Auth, Cart, Toast)

## Features

### Core
- User registration and login with JWT tokens
- Two-factor authentication (TOTP) – setup, verify, enable/disable
- Retrieve current user profile
- Browse all products (from DummyJSON API)
- View single product details
- Add/remove products to/from favorites
- Add products to cart with quantity management
- Remove products from cart
- View current cart with price calculations
- **Pagination and Sorting** – products support limit, skip, sortBy, order parameters
- **Data Caching** – Caffeine cache on DummyJSON API calls (10-min TTL, up to 500 entries)

## How to Run

### Prerequisites
- **Java 17+** (JDK)
- **Maven 3.8+** (or use the included `mvnw` wrapper)
- **Node.js 18+** and **npm** (for the frontend)

### Backend

```bash
# From project root
./mvnw spring-boot:run
```

The backend starts on **http://localhost:8080**.

- Swagger UI: http://localhost:8080/swagger-ui/index.html
- H2 Console: http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:abysaltodb)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:5173** and proxies API calls to the backend.

## Quick Test Flow

1. Register: POST /api/auth/register with username, email, password, firstName, lastName
2. Login: POST /api/auth/login with username, password → returns JWT
3. Browse: GET /api/products?limit=10&skip=0&sortBy=price&order=asc with Authorization: Bearer token
4. Add to cart: POST /api/cart/items with { "productId": 1, "quantity": 2 }
5. View cart: GET /api/cart
