
# Tube Journey Status App — High Barnet to Chancery Lane

## Built with https://replit.com/ 

A modern web application for real-time status of journeys on the London Underground, focusing on the High Barnet to Chancery Lane route. Built with a full stack TypeScript architecture and designed to comply with Transport for London (TfL) standards for accessibility, design, and API usage.

## Table of Contents
- [Features](#features)
- [System Architecture](#system-architecture)
  - [Frontend](#frontend-architecture)
  - [Backend](#backend-architecture)
  - [Data Storage](#data-storage-solutions)
  - [External Dependencies](#external-dependencies)
- [Design System](#design-system)
- [Codebase Overview](#codebase-overview)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Real-time journey planner and disruption alerts using TfL APIs
- Mobile-first, responsive UI modeled on official London Underground styles
- Accessible dialogs, dropdowns, and alerts with Radix UI primitives
- Info- and security-tiered disruption severity mapping
- Built for rapid development and deployment (Replit, Vite, ESBuild)

---

## System Architecture

### Frontend Architecture

- **Framework:** React 18 + TypeScript for safe, scalable component development
- **Build Tool:** Vite for HMR (hot module replacement) and optimized static builds
- **Routing:** Wouter for minimal, SPA-style navigation
- **Component Libraries:** [shadcn/ui](https://ui.shadcn.com/), Radix UI, Lucide React icons
- **Styling:** TailwindCSS with custom tokens for colors, spacing, and TfL branding ([see Fonts](client/index.html))
- **State Management:** TanStack Query manages data fetching, caching, rate limiting, and auto-refresh logic

```ts
// Example of a query fetching journey data
const { data, isLoading } = useQuery({
  queryKey: ["/api/journeys", from, to],
  queryFn: async () => { ... },
  refetchInterval: 120000, // every 2 minutes
});
```

UI components are organized as examples (`client/src/components/examples/`) and production modules, with clear separation of responsibilities. Utility libraries and shared schema definitions live in the `client/src/lib` and `shared/` directories.

### Backend Architecture

- **Server:** Express.js, TypeScript
- **API:** Single REST endpoint: `GET /api/journeys?from={station}&to={station}`
- **Modes:** Two entry points—development (`index-dev.ts` with Vite middleware), production (`index-prod.ts` serving static assets)
- **Logging:** Custom Express middleware tracks request durations and outcomes

#### Data Transformation

- TfL's nested JSON is mapped to simplified domain models:
  - `Journey`, `JourneyLeg`, and `Disruption` types
  - TfL service status mapped to an info/warning/severe system for clarity
  - Automatic calculation of stops, leg durations, and disruption levels

### Data Storage Solutions

- **Current:** In-memory storage for user session data (`MemStorage`)
- **PostgreSQL (Neon):** User/authentication schema prepared for future expansion (via Drizzle ORM), but journey data is fetched on-the-fly and not persisted
- **Rationale:** Journeys are transient; caching may be added later for efficiency and personalization

### External Dependencies

- **TfL API:** Public route planner endpoint for journey data
- **Drizzle ORM:** Database schema
- **Radix UI:** Accessible components
- **Lucide React:** Iconography
- **date-fns:** Timestamp formatting
- **Replit Plugins:** Runtime overlays, dev banners, cartographer for developer productivity

---

## Design System

- **Colors:** Custom Tailwind palettes for London Underground lines and status badges
- **Spacing:** Adopted TfL’s own rhythm—scales of 2, 3, 4, 6, and 8 units
- **Components:** Library for cards, alerts, dialogs, forms and navigation, built to ensure accessibility and mobile responsiveness
- **Typography:** Preloaded [TfL-recommended fonts](client/index.html), style guidelines in `design_guidelines.md`

---

## Codebase Overview

```
client/                  # React frontend (components, pages, assets)
  └── src/
      ├── components/    # UI and example components
      ├── lib/           # Utility libraries (queryClient, hooks, etc.)
      ├── pages/         # Main SPA pages (home, error)
  ├── index.html         # Entry point and font includes

shared/                  # Schemas and types shared between client and server

server/                  # Express.js backend, entry points, and middleware

attached_assets/         # Custom icons and assets

design_guidelines.md     # TfL-aligned design documentation
```

**Best Practices Used:**
- Type-safe interfaces shared between front- and back-end
- Clear separation of client/server concerns and module boundaries
- Accessible UI primitives
- Mobile-first responsive design
- Minimal use of persistent storage; code structured for easy extension

---

## Contributing

All code is open source under the MIT License. Please refer to [design_guidelines.md](design_guidelines.md) for component and style conventions. PRs and issues welcome!

## License

This project is licensed under the [MIT License](LICENSE).

---

For more details, see [replit.md](replit.md) and [design_guidelines.md](design_guidelines.md).

