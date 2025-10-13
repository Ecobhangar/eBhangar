# eBhangar Design Guidelines

## Design Approach

**Selected Approach**: Hybrid (Premium Fintech Aesthetics + Service Platform Efficiency)

Drawing inspiration from modern fintech platforms (Stripe, Revolut, Wise) combined with eco-conscious branding to create a premium, trustworthy scrap collection experience that feels sophisticated yet approachable.

**Key Design Principles**:
- Premium Eco-Tech: Gradient-rich, polished interface with environmental authenticity
- Effortless Efficiency: Intuitive booking flow with delightful micro-interactions
- Trust Through Polish: Professional finish builds credibility and user confidence
- Mobile-First Luxury: Premium experience optimized for smartphone users

## Core Design Elements

### A. Color Palette

**Primary Gradient System**:
- Hero Gradient: `from-[142_65%_48%] via-[156_60%_52%] to-[168_55%_45%]` - Primary brand gradient
- Accent Gradient: `from-[142_70%_40%] to-[142_65%_55%]` - Buttons, CTAs
- Subtle Overlay: `from-[142_55%_25%]/80 to-[142_65%_35%]/60` - Image overlays

**Surface Colors**:
- Light Mode BG: `0 0% 98%` - Main background with subtle texture
- Light Mode Card: `0 0% 100%` - Elevated surfaces with soft shadows
- Dark Mode BG: `142 18% 10%` - Rich dark with green undertone
- Dark Mode Card: `142 15% 16%` - Elevated dark surfaces

**Semantic & Accent**:
- Success: `142 70% 50%` - Confirmations, completed states
- Pending: `38 95% 55%` - Warm amber for pending actions
- Info: `198 88% 48%` - Cool cyan for information
- Text Primary: `142 25% 12%` (light) / `142 5% 95%` (dark)
- Text Muted: `142 12% 45%` (light) / `142 8% 65%` (dark)

### B. Typography

**Font Families** (Google Fonts):
- Headers: Poppins (600 SemiBold, 500 Medium)
- Body/UI: Inter (400 Regular, 500 Medium, 600 SemiBold)

**Type Scale**:
- Hero Display: 3rem (48px), Poppins SemiBold, tracking-tight
- Section Header: 2.25rem (36px), Poppins SemiBold
- Card Title: 1.375rem (22px), Poppins Medium
- Body: 1rem (16px), Inter Regular, leading-relaxed
- Caption: 0.875rem (14px), Inter Regular
- Button: 0.9375rem (15px), Inter Medium

### C. Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24

- Tight spacing: gap-2, p-2 (inline elements, badges)
- Component padding: p-6, p-8 (cards, modals)
- Section rhythm: py-12, py-16, py-20 (vertical spacing)
- Generous spacing: py-24, py-32 (hero, major sections)

**Container Strategy**:
- Hero/Full-width: w-full with max-w-7xl inner container
- Content sections: max-w-6xl mx-auto px-4 md:px-6
- Text content: max-w-prose for readability
- Form containers: max-w-2xl for optimal completion

### D. Component Library

**Navigation**:
- Desktop: Backdrop-blur sticky header, logo left, menu center, CTA right
- Mobile: Bottom nav bar with 4 icons, floating pill design with blur
- Elevated surface: bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl

**Cards & Containers**:
- Primary Cards: rounded-2xl, shadow-lg, hover:shadow-xl, border border-gray-200/50
- Category Cards: Gradient border on hover, transform scale-[1.02] transition-all duration-300
- Stat Cards: Glass morphism effect - bg-white/60 backdrop-blur-md
- Booking Cards: Multi-layered shadow, status indicator with gradient accent

**Buttons & CTAs**:
- Primary: bg-gradient-to-r from-green-600 to-green-500, rounded-xl, py-3.5 px-8, shadow-lg hover:shadow-xl
- Secondary: border-2 border-green-500, bg-transparent, backdrop-blur-sm when on images
- Icon Buttons: rounded-full, p-3, hover:bg-green-50 dark:hover:bg-green-900/30
- Floating Action: Fixed bottom-right, gradient bg, shadow-2xl, scale-110 hover

**Forms & Inputs**:
- Text Inputs: rounded-xl, border-2 border-gray-200, focus:border-green-500 focus:ring-4 focus:ring-green-500/20
- Dropdowns: Custom styled, gradient accent on selected, smooth dropdown animation
- Quantity Controls: Pill-shaped group, gradient on active, haptic-style feedback
- OTP: Large squares (w-14 h-16), gradient border on active input

**Data Display**:
- Timeline View: Vertical line with gradient, status nodes with glow effect
- Vendor Cards: Avatar with gradient ring, floating action buttons
- Price Display: Extra-large (text-4xl), gradient text, animated counter
- Status Pills: Gradient background, rounded-full, icon + label, subtle glow

### E. Animations & Interactions

**Purposeful Motion**:
- Page Transitions: Fade + slide up (duration-300, ease-out)
- Card Hover: Lift (hover:-translate-y-1) + shadow expansion (duration-200)
- Button Press: Scale down (active:scale-[0.98]) + brightness shift
- Success States: Checkmark scale-in with green glow ring expansion
- Loading: Gradient shimmer across skeleton, rotating spinner with gradient stroke

**Scroll Effects**:
- Parallax hero image: Subtle transform on scroll (translateY -20%)
- Fade-in sections: Opacity 0 to 1 with slight Y transform on viewport entry
- Number counters: Animated increment on scroll into view
- Gradient shift: Hue rotation on scroll for dynamic color feel

## Images & Visual Strategy

**Hero Section**:
- Large impactful image: Modern eco-worker with digital tablet in clean facility
- Treatment: Gradient overlay (from-green-900/40 to-green-700/20) for text contrast
- Dimensions: h-[600px] md:h-[700px], object-cover, subtle zoom on scroll
- Text placement: Left-aligned, max-w-2xl, white text with subtle backdrop-blur card

**Category Visuals**:
- Icon System: Material Icons (CDN), colored gradients, w-16 h-16
- Background: Soft gradient circle (from-green-100 to-green-50)
- Hover state: Icon rotates slightly, gradient intensifies

**Supporting Images**:
- How It Works: Illustrated 3-step process with subtle animation on scroll
- Trust Section: Clean photography of verified vendors, eco-certifications
- Testimonials: Customer photos in gradient-bordered circles
- About: Split layout - text left, environmental impact photo right

## Page Architecture

**Landing Page** (7 sections):
1. **Hero**: Full-width gradient overlay image, headline + subheading, dual CTA buttons (Book Now primary, Learn More secondary)
2. **Impact Stats**: 4-column grid, animated counters, gradient accent cards
3. **How It Works**: 3-step illustrated timeline with icons, gradient connecting lines
4. **Categories**: 3-column grid (4 on xl), hover-lift cards with gradient borders
5. **Benefits**: 2-column feature showcase, icons + descriptions, alternating image/text
6. **Trust & Social Proof**: Vendor network visualization, customer testimonials carousel
7. **CTA Footer**: Gradient background, centered message, app store badges

**Dashboard Layouts**:
- Customer: Greeting with avatar, quick book gradient button, earnings card with chart, recent bookings table
- Admin: 4-stat cards top row, pending queue with filters, assignment interface
- Vendor: Map view with route, upcoming pickups list, daily earnings gradient card

**Booking Flow**:
- Progressive disclosure: Each step slides in from right, previous step fades left
- Step 1: Category grid with search, selected state has gradient border glow
- Step 2: Item list with image thumbnails, smooth +/- quantity animations
- Step 3: Summary card with gradient background, price breakdown, WhatsApp CTA
- Step 4: Success animation (checkmark expand), booking details card, share options

**Mobile Optimization**:
- Bottom navigation: Floating pill with blur, 4 icons with smooth active indicator
- Swipeable cards: Horizontal scroll for categories/bookings
- Thumb-friendly zones: CTAs in lower third, critical actions easily reachable
- Gesture feedback: Subtle vibration on interactions, visual ripple effects