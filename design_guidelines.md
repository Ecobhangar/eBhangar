# eBhangar Design Guidelines

## Design Approach

**Selected Approach**: Hybrid (Material Design System + Service Platform References)

Drawing inspiration from utility-focused service platforms (Uber, Swiggy, UrbanClap) combined with Material Design principles to create a trustworthy, efficient booking experience with strong environmental identity.

**Key Design Principles**:
- Trust & Transparency: Clear pricing, status tracking, and vendor information
- Efficiency First: Quick booking flow with minimal steps
- Environmental Identity: Green theme without compromising functionality
- Mobile-First: Optimized for smartphone users booking on-the-go

## Core Design Elements

### A. Color Palette

**Primary Colors (Eco-Green Theme)**:
- Primary Green (Dark): `142 70% 35%` - Headers, primary buttons, key actions
- Primary Green (Light): `142 65% 45%` - Interactive elements, hover states
- Success Green: `140 75% 50%` - Completed bookings, success states

**Neutral & Background**:
- Light Mode BG: `0 0% 98%` - Main background
- Light Mode Surface: `0 0% 100%` - Cards, forms
- Dark Mode BG: `142 15% 12%` - Main background  
- Dark Mode Surface: `142 12% 18%` - Cards, elevated surfaces

**Semantic Colors**:
- Warning/Pending: `38 92% 50%` - Pending bookings
- Info/Assigned: `217 91% 60%` - Assigned status
- Text Primary: `142 20% 15%` (light) / `0 0% 95%` (dark)
- Text Secondary: `142 10% 40%` (light) / `0 0% 70%` (dark)

### B. Typography

**Font Families**:
- Primary: Inter (Google Fonts) - UI, body text, forms
- Accent: Poppins (Google Fonts) - Headers, CTAs, category names

**Type Scale**:
- H1/Hero: 2.5rem (40px), Poppins SemiBold
- H2/Section: 2rem (32px), Poppins SemiBold  
- H3/Card Title: 1.5rem (24px), Poppins Medium
- Body: 1rem (16px), Inter Regular
- Small/Meta: 0.875rem (14px), Inter Regular
- Button/CTA: 1rem (16px), Inter Medium

### C. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16 for consistent rhythm
- Micro spacing: p-2, gap-2 (buttons, inline elements)
- Component padding: p-4, p-6 (cards, containers)
- Section spacing: py-8, py-12, py-16 (vertical sections)
- Container margins: mx-4, mx-6, mx-auto

**Grid System**:
- Mobile: Single column, max-w-full px-4
- Tablet: 2 columns for categories/bookings, max-w-5xl
- Desktop: 3-4 columns for category grid, max-w-7xl

### D. Component Library

**Navigation**:
- Top Nav: Sticky header with logo, role-based menu items, profile/logout
- Mobile: Bottom navigation bar with icons (Home, Categories, Bookings, Profile)
- Admin/Vendor: Additional sidebar for management functions

**Cards & Containers**:
- Category Cards: Rounded-2xl, shadow-md, hover:shadow-lg transition
- Booking Cards: Border-l-4 with status color, rounded-lg, p-6
- Info Cards: Light green tint background, rounded-xl, icon + text layout

**Forms & Inputs**:
- Input Fields: Rounded-lg, border-2, focus:border-green-500, p-3
- Dropdown/Select: Custom styled with green accent, rounded-lg
- OTP Input: Individual digit boxes, square, text-2xl, monospace
- Quantity Selector: +/- buttons with number display, green accent

**Buttons**:
- Primary CTA: bg-green-600, rounded-lg, py-3 px-6, font-medium
- Secondary: variant="outline", border-green-600, bg-transparent
- Icon Buttons: Circular, p-3, hover:bg-green-50
- On Images: Blurred background (backdrop-blur-md), semi-transparent

**Data Display**:
- Booking List: Timeline view with status indicators
- Vendor Cards: Avatar, name, location pin, contact button
- Price Display: Large green text for estimates, bold font
- Status Badges: Rounded-full pills with color coding

### E. Animations

**Minimal & Purposeful**:
- Page Transitions: Subtle fade-in (200ms)
- Button Feedback: Scale on tap (active:scale-95)
- Card Hover: Gentle lift (hover:translate-y-[-2px])
- Loading States: Spinner with green accent, no skeleton screens
- Status Updates: Color fade transition (300ms)

Avoid: Scroll animations, parallax effects, decorative animations

## Images & Visual Assets

**Hero Section**:
- Large hero image: Environmental worker collecting recyclables in urban setting
- Image treatment: Subtle green overlay (bg-green-900/20)
- Placement: Full-width, h-96 on mobile, h-[500px] on desktop
- Text overlay: White text with backdrop-blur on bottom-left

**Category Icons**:
- Use Material Icons or Heroicons via CDN
- Icons: AC (air-conditioner), refrigerator, washing-machine, iron, etc.
- Size: w-12 h-12 for category cards
- Color: Green-600 with light green background circle

**Supporting Images**:
- About/How It Works: 2-column layout with images showing pickup process
- Trust Indicators: Small icons for verified vendors, eco-certified
- Profile Avatars: Circular, bordered with green ring for active users

**Image Strategy**:
- Hero: Yes, impactful environmental image establishing purpose
- Categories: Icon-based, no photos (faster loading)
- Vendor Profiles: Profile photos in circles
- Booking Confirmation: Success illustration (can be SVG)

## Page-Specific Layouts

**Landing Page** (5-6 sections):
1. Hero with image + CTA "Book Pickup Now"
2. How It Works - 3 steps timeline
3. Categories grid - 3 cols desktop, 2 cols tablet
4. Benefits - Why choose eBhangar (eco-friendly stats)
5. Vendor network map/illustration
6. Footer with quick links

**Dashboard** (Role-based):
- Customer: Greeting, quick book button, recent bookings, earnings summary
- Admin: Stats cards (total bookings, pending, completed), assignment queue
- Vendor: Assigned pickups list, navigation map, earnings

**Booking Flow**:
- Step 1: Category selection (grid cards)
- Step 2: Quantity input (item-by-item with +/- controls)
- Step 3: Review & estimate (summary card with green price highlight)
- Step 4: Confirmation with WhatsApp link button

**Category Selection**:
- 3-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Each card: Icon, name, base rate, "Select" button
- Selected state: Green border-2, checkmark icon