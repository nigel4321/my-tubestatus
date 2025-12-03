# Testing Guide

This project includes comprehensive unit tests for both frontend and backend components.

## Test Stack

- **Vitest** - Fast test runner compatible with Vite
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom DOM matchers
- **jsdom** - DOM environment for Node.js

## Running Tests

### Run all tests
```bash
npx vitest run
```

### Run tests in watch mode (for development)
```bash
npx vitest
```

### Run tests with verbose output
```bash
npx vitest run --reporter=verbose
```

### Run tests with coverage report
```bash
npx vitest run --coverage
```

### Run specific test file
```bash
npx vitest run tests/server/utils.test.ts
```

### Run tests matching a pattern
```bash
npx vitest run --testNamePattern="LineBadge"
```

## Test Structure

```
tests/
├── setup.ts                    # Test setup and global mocks
├── client/                     # Frontend component tests
│   ├── DisruptionAlert.test.tsx
│   ├── JourneyHeader.test.tsx
│   ├── JourneyLeg.test.tsx
│   ├── LineBadge.test.tsx
│   ├── LineSummary.test.tsx
│   └── RouteCard.test.tsx
├── server/                     # Backend tests
│   ├── api.test.ts             # API endpoint tests
│   └── utils.test.ts           # Utility function tests
└── shared/                     # Shared schema tests
    └── schema.test.ts          # Zod schema validation tests
```

## Test Coverage Summary

### Backend Tests (server/utils.test.ts)
- `mapTflMode()` - Mode mapping from TfL to internal format
- `extractLineName()` - Line name extraction from TfL responses
- `extractDirection()` - Direction extraction from TfL responses
- `mapDisruptionSeverity()` - Severity level mapping
- `transformTflJourney()` - Full journey transformation
- `resolveStationToId()` - Station name to ICS code resolution
- Station cache functionality
- Seed map lookups

### Schema Tests (shared/schema.test.ts)
- Journey leg schema validation
- Disruption schema validation
- Journey schema validation
- Required field validation
- Enum value validation

### Frontend Component Tests

#### LineBadge.test.tsx
- Renders line names correctly
- Applies TfL line colors (Northern, Central, Victoria, etc.)
- Falls back to default color for unknown lines
- Supports custom line colors

#### JourneyHeader.test.tsx
- Displays from/to stations
- Swap direction button functionality
- Refresh button functionality
- Rate limiting (disabled state)
- Loading animation

#### RouteCard.test.tsx
- Duration, departure/arrival time display
- Fastest route badge
- Expandable journey details
- Line summary badges
- Disruption alerts

#### JourneyLeg.test.tsx
- Tube leg rendering (line, direction, stops)
- Walking leg rendering (distance)
- From/to station display
- Duration display

#### LineSummary.test.tsx
- Single/multiple line display
- Arrow icons between lines
- Empty state handling

#### DisruptionAlert.test.tsx
- Info/warning/severe severity styling
- Message display
- Icon rendering

## Adding New Tests

1. Create a new test file in the appropriate directory
2. Import testing utilities:
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
```

3. Write your tests:
```typescript
describe('ComponentName', () => {
  it('should do something', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Mocking

The test setup (`tests/setup.ts`) provides:
- Global `fetch` mock
- Jest-DOM matchers

To mock fetch in individual tests:
```typescript
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: 'value' }),
});
```

## Configuration

Test configuration is in `vitest.config.ts`:
- Environment: jsdom
- Path aliases match the main app (@, @shared)
- Coverage provider: v8
