# eBhangar - Smart Scrap Collection Platform

## Overview

eBhangar is a web-based service platform for managing scrap collection and recycling services. The application connects customers who want to dispose of recyclable items (electronics, metals, plastics, paper, etc.) with verified vendors who collect and pay for these materials. The platform features real-time booking management, vendor assignment, and order tracking with an eco-friendly design theme.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React with TypeScript using Vite as the build tool
- **Routing:** Wouter (lightweight React router)
- **State Management:** TanStack Query (React Query) for server state
- **UI Components:** Radix UI primitives with shadcn/ui styling system
- **Styling:** Tailwind CSS with custom design tokens
- **Authentication:** Firebase Authentication (phone-based OTP)

**Design System:**
The application implements a hybrid design approach combining Material Design principles with service platform patterns (similar to Uber/Swiggy). Key design decisions include:
- Green eco-theme with HSL color values for consistency across light/dark modes
- Typography using Inter (UI/body) and Poppins (headers) from Google Fonts
- Component-based architecture with reusable UI elements
- Mobile-first responsive design
- Custom hover/active states using CSS elevation patterns

**Key Frontend Patterns:**
- Context-based authentication state management (AuthContext)
- Theme provider for light/dark mode switching
- Protected routes requiring authentication
- Custom hooks for responsive breakpoints and toast notifications
- Data fetching with automatic authentication headers

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript (ES Modules)
- **Database ORM:** Drizzle ORM
- **Database:** PostgreSQL (Neon serverless)
- **Session Management:** connect-pg-simple for PostgreSQL-backed sessions

**API Structure:**
RESTful API endpoints organized by resource type:
- User management (`/api/users/*`)
- Category operations (`/api/categories/*`)
- Vendor management (`/api/vendors/*`)
- Booking/order operations (`/api/bookings/*`)

**Middleware Architecture:**
- Authentication middleware validates Firebase phone numbers from request headers
- Auto-creates user records on first login
- Role-based access control (customer, vendor, admin)
- Request/response logging for API endpoints
- Error handling with appropriate HTTP status codes

**Data Access Layer:**
The storage pattern implements a repository/interface pattern:
- `IStorage` interface defines all data operations
- `DbStorage` class implements the interface using Drizzle ORM
- Supports transactions for complex operations (booking creation with items)
- Relational data fetching with joins

### Database Schema

**Core Tables:**
1. **users** - Stores user accounts with phone-based authentication
   - Fields: id (UUID), phoneNumber (unique), name, address, pinCode, district, state, role (customer/vendor/admin)
   - Auto-generated UUIDs for primary keys
   - Address fields (address, pinCode, district, state) are nullable and used for saved address feature

2. **categories** - Scrap item types with pricing
   - Fields: id, name (unique), unit (kg/unit), minRate, maxRate, icon
   - Supports dynamic pricing ranges

3. **vendors** - Vendor profiles linked to user accounts
   - Fields: id, userId (FK to users), location, pinCode, activePickups counter
   - One-to-one relationship with users
   - pinCode field enables location-based vendor assignment

4. **bookings** - Customer orders/pickup requests
   - Fields: id, customerId (FK), customer details (denormalized: name, phone, address, pinCode, district, state), totalValue, status, vendorId (FK)
   - Status workflow: pending → assigned → completed
   - Tracks timestamps for creation and completion
   - Location fields (pinCode, district, state) nullable for backward compatibility

5. **bookingItems** - Line items for each booking
   - Fields: id, bookingId (FK), categoryId (FK), categoryName (denormalized), quantity, estimatedValue
   - Supports multiple items per booking

**Design Decisions:**
- UUID primary keys for security and distributed ID generation
- Denormalized customer data in bookings for historical accuracy
- Status-based workflow for order lifecycle
- Decimal types for monetary values to maintain precision
- Timestamps for audit trails

### Authentication & Authorization

**Authentication Flow:**
1. Frontend uses Firebase Authentication for phone number verification
2. User enters phone number → receives OTP → verifies code
3. Firebase returns authenticated user with phone number
4. Phone number sent in `x-user-phone` header on all API requests
5. Backend validates and auto-creates user records on first login

**Authorization Levels:**
- **Customer:** Can create bookings, view own bookings
- **Vendor:** Can view assigned bookings, update booking status
- **Admin:** Can manage all resources, assign vendors, change user roles

**Security Considerations:**
- Phone number as primary identifier (no passwords)
- Session-based authentication with PostgreSQL backing
- Role-based middleware for protected routes
- Auto-provisioning reduces friction for new users

## External Dependencies

### Third-Party Services

**Firebase (Authentication):**
- Purpose: Phone number-based OTP authentication
- Configuration: Requires API key, auth domain, project ID in environment variables
- Implementation: Client-side Firebase SDK with reCAPTCHA verification

**Neon (PostgreSQL Database):**
- Purpose: Serverless PostgreSQL database hosting
- Configuration: CONNECTION_STRING via DATABASE_URL environment variable
- Features: WebSocket connections for serverless compatibility

**Google Fonts:**
- Purpose: Typography (Inter and Poppins font families)
- Implementation: Loaded via CDN in HTML head

### Key NPM Packages

**UI & Components:**
- @radix-ui/* - Accessible component primitives (dialogs, dropdowns, etc.)
- shadcn/ui - Pre-built component library built on Radix
- tailwindcss - Utility-first CSS framework
- lucide-react - Icon library

**Data & State:**
- @tanstack/react-query - Server state management and caching
- drizzle-orm - Type-safe SQL ORM
- drizzle-zod - Schema validation integration

**Build & Development:**
- vite - Fast build tool and dev server
- esbuild - Server-side bundling
- typescript - Type safety across stack

**Session & Storage:**
- express-session - Session middleware
- connect-pg-simple - PostgreSQL session store
- ws - WebSocket support for Neon

### Environment Configuration

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `VITE_FIREBASE_API_KEY` - Firebase project API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project identifier
- Additional Firebase config values for messaging and storage

**Important:** Firebase Phone Authentication must be enabled in your Firebase Console:
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Phone" provider
3. Configure authorized domains if needed
4. Ensure environment variables contain valid Firebase credentials

## Current Implementation Status

### ✅ Completed Features

**Core Functionality:**
- Landing page with hero section and category showcase
- Firebase phone authentication with OTP verification
- Role-based access control (Customer, Admin, Vendor)
- 9 scrap categories seeded (Old AC, Refrigerator, Washing Machine, Iron, Copper, Plastic, Paper, Books, Clothes)

**Customer Features:**
- **Profile Management:**
  - Dedicated Profile page to save address details (name, address, pin code, district, state)
  - Accessible via "Profile" button in dashboard header
  - Required before creating any booking
  - Backend validation ensures:
    - All fields are non-empty
    - Pin code is exactly 6 numeric digits (regex: `/^\d{6}$/`)
    - Data integrity across platform
- **Simplified Booking Flow:**
  - Automatically uses saved profile address for pickup
  - No repetitive address entry on booking page
  - If profile incomplete, redirects to Profile page with clear message
  - **Category Selection:** Dropdown with quantity input
  - Auto-calculated estimated value displayed before submission
  - "New Booking" button on customer dashboard
  - Can edit profile anytime via "Edit Profile" button on booking page
- View personal booking history
- **Status-based actions:**
  - **Pending bookings:** Edit and Delete options available
  - **Assigned bookings:** Cancel option available (returns to pending status)
  - **Completed bookings:** View only, no actions

**Admin Features:**
- View all bookings across platform
- **Smart Vendor Assignment:** 
  - Dropdown shows only vendors from same pin code as booking
  - **Displays vendor name AND phone number** in dropdown for easy identification
  - Filters vendors by location for better service matching
  - Assign vendors to pending bookings
- Track booking statuses (pending → assigned → completed)
- **Vendor Information Display:**
  - Assigned bookings show "Assigned to: [Vendor Name] • [Phone]"
  - Completed bookings show "Completed by: [Vendor Name] • [Phone]"
  - Backend automatically fetches vendor details with all bookings
- Manage vendor assignments
- **Email Notifications:** Automatic email alerts for new bookings (optional setup)
  - Admin WhatsApp: +919226255355 (displayed in emails)
  - Configure SMTP in Replit Secrets (see EMAIL_SETUP.md)

**Vendor Features:**
- View assigned pickups
- Mark bookings as completed
- Track active pickup count

**Technical Implementation:**
- PostgreSQL database with Drizzle ORM
- RESTful API with Express.js
- Authentication middleware with Firebase integration
- Auto-user creation on first login
- Transaction support for complex operations
- Responsive design with Tailwind CSS

### 🎯 How to Use the Application

1. **Login:** Navigate to `/login` and authenticate with phone number + OTP
2. **Setup Profile:** (First-time users) Go to `/profile` from dashboard and save your address details
3. **Create Booking:** Go to `/bookings/new` to schedule a pickup (uses saved profile address automatically)
4. **View Dashboard:** Access `/dashboard` for role-specific features
5. **Admin Actions:** Assign vendors to pending bookings based on pin code
6. **Vendor Actions:** Mark assigned pickups as completed

### 📧 Notification System

**In-App Notifications (Active):**
- Admin dashboard shows all new bookings in real-time
- Toast notifications for all booking actions
- Live status updates without page refresh

**Email Notifications (Optional):**
- Automatic email alerts to admin when customers create bookings
- Email includes: customer details, items, total value, booking ID
- Admin WhatsApp (+919226255355) displayed in all emails
- Configure SMTP credentials in Replit Secrets (see `EMAIL_SETUP.md`)
- Free setup with Gmail, Outlook, SendGrid, or Mailgun

### 🔄 Future Enhancements (Not Implemented)

- WhatsApp Business API integration (currently using email + in-app)
- SMS notifications via Twilio
- Real-time vendor location tracking
- Payment integration
- Rating and review system
- Analytics dashboard
- Push notifications