# High Barnet to Chancery Lane Journey Status App

## Overview

A real-time London Underground journey planning application that displays multiple route options between High Barnet and Chancery Lane stations. The app integrates with Transport for London's (TfL) public API to provide live journey information, disruption alerts, and route comparisons with an authentic Underground visual identity.

**Core Purpose:** Provide commuters with instant, scannable route comparisons and real-time service status for a specific journey, optimized for mobile-first, on-the-go usage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, providing fast HMR and optimized production builds
- **Wouter** for lightweight client-side routing (single-page application with home and 404 routes)

**UI Component Strategy:**
- **shadcn/ui** component library with Radix UI primitives for accessible, composable components
- **Tailwind CSS** for utility-first styling with custom design tokens
- Custom component architecture following Transport for London's design system (see `design_guidelines.md`)
- Mobile-first responsive design with focus on information hierarchy and scannability

**State Management:**
- **TanStack Query (React Query)** for server state management, caching, and automatic refetching
- Built-in rate limiting with 30-second refresh cooldown to prevent API abuse
- Auto-refresh every 2 minutes for real-time journey updates
- Local component state for UI interactions (expand/collapse, direction swapping)

**Key Design Decisions:**
- Single-column layout for easy vertical scanning of route cards
- Expandable route cards to show detailed leg-by-leg journey breakdowns
- Color-coded disruption alerts (info/warning/severe) using TfL-inspired visual language
- Line badge components matching official Underground line colors
- Johnston font (TfL typeface) with system sans-serif fallback

### Backend Architecture

**Server Framework:**
- **Express.js** running on Node.js with TypeScript
- Dual entry points: development mode (`index-dev.ts`) with Vite middleware, production mode (`index-prod.ts`) serving static assets
- Custom logging middleware tracking API request duration and response status

**API Design:**
- RESTful endpoint: `GET /api/journeys?from={station}&to={station}`
- Server-side transformation of TfL API responses into simplified domain models
- Rate limiting considerations built into frontend to respect TfL API usage policies

**Data Transformation Layer:**
- Maps TfL's complex journey response format to simplified `Journey`, `JourneyLeg`, and `Disruption` types
- Extracts line names, directions, and service status from nested TfL data structures
- Severity mapping: TfL status codes converted to three-level system (info/warning/severe)
- Duration calculations and stop counting for journey comparison

**Development vs Production:**
- Development: Vite middleware integration for HMR and instant updates
- Production: Pre-built static assets served from `dist/public`
- Build process: `vite build` for frontend, `esbuild` for backend bundling

### Data Storage Solutions

**Current Implementation:**
- **In-Memory Storage** (`MemStorage` class) for user data
- User schema defined with Drizzle ORM but not actively used for journey data
- PostgreSQL schema defined but database primarily reserved for future authentication/user preferences

**Rationale:**
- Journey data is transient and fetched fresh from TfL API on each request
- No persistent storage required for core journey planning functionality
- User storage prepared for future features (saved routes, preferences, authentication)

**Future Considerations:**
- Database could cache TfL responses to reduce API calls
- User preferences (favorite routes, notification settings) when authentication is added

### External Dependencies

**Transport for London (TfL) API:**
- **Base URL:** `https://api.tfl.gov.uk`
- **Primary Endpoint:** Journey planner API for route calculations
- **Data Retrieved:** Journey legs, departure/arrival times, line information, disruption status, walking distances
- **Response Format:** Complex nested JSON transformed server-side into simplified models
- **No Authentication Required:** Public API (rate limits apply)

**Key Integration Points:**
1. Mode mapping: TfL's mode identifiers converted to `tube` or `walking`
2. Line extraction: Route options parsed to identify specific Underground lines
3. Direction determination: Train direction extracted from route metadata
4. Disruption severity: TfL status severity codes (1-20 scale) mapped to three-tier system
5. Stop counting: Path stop points enumerated for journey comparison

**Database (Prepared but Minimal Usage):**
- **Neon Database** (serverless PostgreSQL) via `@neondatabase/serverless`
- **Drizzle ORM** for schema definition and migrations
- Connection configured via `DATABASE_URL` environment variable
- Schema includes user authentication table (username/password) but journey data not persisted

**UI Component Libraries:**
- **Radix UI** primitives for accessibility-compliant components (dialogs, dropdowns, alerts, etc.)
- **Lucide React** for consistent iconography (train, walking, arrows, alerts)
- **date-fns** for timestamp formatting (last updated times)

**Development Tools:**
- **Replit-specific plugins:** Runtime error overlay, cartographer (dev mode), dev banner
- **TypeScript** for type safety across shared schemas between client and server
- **ESBuild** for fast production bundling of server code

**Design System:**
- Custom Tailwind configuration extending shadcn/ui neutral theme
- Transport for London color palette for line badges
- Custom spacing scale matching TfL's visual rhythm (2, 3, 4, 6, 8 units)