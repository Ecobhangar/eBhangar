# eBhangar - Smart Scrap Collection Platform

## Overview

eBhangar is a web-based service platform designed to streamline scrap collection and recycling. It connects customers wishing to dispose of recyclable materials (electronics, metals, plastics, paper, etc.) with verified vendors for collection and payment. The platform facilitates real-time booking management, intelligent vendor assignment, and order tracking, all within an eco-friendly design aesthetic. The project aims to capitalize on the growing demand for convenient and sustainable waste management solutions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
-   **Technology Stack:** React with TypeScript (Vite), Wouter for routing, TanStack Query for state, Radix UI + shadcn/ui for components, Tailwind CSS for styling.
-   **Design System:** Hybrid approach combining Material Design with service platform patterns (e.g., Uber). Features an eco-friendly green theme (HSL colors), Inter and Poppins fonts, component-based architecture, and mobile-first responsive design.
-   **Key Patterns:** Context-based authentication, theme provider, protected routes, custom hooks, and data fetching with auth headers.

### Backend Architecture
-   **Technology Stack:** Node.js with Express.js, TypeScript (ES Modules), Drizzle ORM, PostgreSQL (Neon serverless), connect-pg-simple for sessions.
-   **API Structure:** RESTful APIs for users, categories, vendors, and bookings.
-   **Middleware:** Authentication (Firebase phone number validation), auto-user creation, role-based access control, request/response logging, and error handling.
-   **Data Access Layer:** Repository pattern (`IStorage` interface, `DbStorage` implementation with Drizzle ORM) supporting transactions.

### Database Schema
-   **Core Tables:** `users` (phone-based auth, role), `categories` (scrap types, pricing), `vendors` (linked to users, location, KYC), `bookings` (customer orders, denormalized customer data, status, vendor FK), `bookingItems` (items per booking).
-   **Design Decisions:** UUID primary keys, denormalization for historical accuracy, status-based workflow, decimal types for precision, timestamps for audit.

### Authentication & Authorization
-   **Authentication Flow:** Firebase Authentication for phone number + OTP on frontend, `x-user-phone` header for backend validation, auto-creates user on first login.
-   **Authorization Levels:** Customer (create/view own bookings), Vendor (view assigned, update status), Admin (manage all resources, assign vendors).
-   **Security:** Phone number as primary ID, session-based auth, role-based middleware, auto-provisioning.

### Feature Specifications
-   **Customer Features:** Profile management (saved address), simplified booking flow (auto-uses profile address), category selection, estimated value display, view booking history with status-based actions (edit/delete pending, cancel assigned, view completed), privacy protection (no vendor details for customers), live pickup tracking (Google Maps shows vendor location for assigned bookings), rating & review system (rate completed pickups 1-5 stars with optional text review).
-   **Admin Features:** View all bookings, smart vendor assignment (pin code-based, displays vendor name/phone), track statuses, manage vendor assignments, vendor onboarding system (form with validation for KYC, address, active status, auto-user creation), optional email notifications.
-   **Vendor Features:** View assigned pickups, mark pickups as completed, track active pickup count, live location sharing (geolocation API updates booking coordinates).
-   **Legal & Info Section:** Five legal pages (Terms & Conditions, Privacy Policy, Disclaimer, Vendor Onboarding Policy, Contact/Grievance) accessible from footer, consistent branding, responsive design.

## External Dependencies

### Third-Party Services
-   **Firebase:** Phone number-based OTP authentication.
-   **Neon:** Serverless PostgreSQL database hosting.
-   **Google Fonts:** Typography (Inter, Poppins).

### Key NPM Packages
-   **UI & Components:** `@radix-ui/*`, `shadcn/ui`, `tailwindcss`, `lucide-react`.
-   **Data & State:** `@tanstack/react-query`, `drizzle-orm`, `drizzle-zod`.
-   **Build & Development:** `vite`, `esbuild`, `typescript`.
-   **Session & Storage:** `express-session`, `connect-pg-simple`, `ws`.

### Environment Configuration
-   `DATABASE_URL` (PostgreSQL connection string)
-   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` (Firebase config)
-   `VITE_GOOGLE_MAPS_API_KEY` (Google Maps JavaScript API for live tracking)