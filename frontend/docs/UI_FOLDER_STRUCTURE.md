# Frontend UI Folder Structure

## Overview

This document defines the scalable folder structure for the Smasage frontend application. The structure follows Next.js App Router conventions while organizing UI components, hooks, utilities, and domain logic in a maintainable way.

## Proposed Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (routes)/                 # Route groups
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   └── globals.css               # Global styles
│   │
│   ├── components/                   # Shared UI components
│   │   ├── primitives/               # Base design system components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── GlassPanel.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── feedback/                 # User feedback components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── SkeletonLoader.tsx
│   │   │   ├── WsStatusIndicator.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── features/                 # Feature-specific components
│   │       ├── wallet/
│   │       │   ├── ConnectWalletButton.tsx
│   │       │   ├── WalletModal.tsx
│   │       │   └── index.ts
│   │       ├── chat/
│   │       │   ├── ChatInterface.tsx
│   │       │   └── index.ts
│   │       ├── portfolio/
│   │       │   ├── PortfolioChart.tsx
│   │       │   ├── PortfolioStats.tsx
│   │       │   ├── GoalTracker.tsx
│   │       │   └── index.ts
│   │       └── index.ts
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useFreighter.ts
│   │   ├── useNotifications.ts
│   │   └── index.ts
│   │
│   ├── utils/                        # Utility functions
│   │   ├── allocationParser.ts
│   │   ├── chartUtils.ts
│   │   ├── goalProjection.ts
│   │   ├── suggestionHandler.ts
│   │   └── index.ts
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── freighter.d.ts
│   │   ├── websocket.ts
│   │   ├── portfolio.ts
│   │   └── index.ts
│   │
│   ├── config/                       # Configuration files
│   │   ├── constants.ts
│   │   ├── mockData.ts
│   │   └── index.ts
│   │
│   └── styles/                       # Additional styles (if needed)
│       └── tokens.css                # Design tokens
│
├── public/                           # Static assets
├── docs/                             # Documentation
│   ├── UI_FOLDER_STRUCTURE.md
│   └── DESIGN_SYSTEM.md
└── package.json
```

## Migration Plan

### Phase 1: Create New Structure (Current)
- Create `components/` directory with subdirectories
- Document the structure (this file)
- No file moves yet to avoid breaking changes

### Phase 2: Gradual Migration (Future)
- Move components from `app/components/` to appropriate folders
- Update imports across the application
- Ensure all tests pass after each move

### Phase 3: Cleanup (Future)
- Remove old `app/components/` directory
- Update documentation
- Verify all imports are correct

## Folder Descriptions

### `components/primitives/`
Base design system components that are reusable across the application. These should be:
- Highly composable
- Accept standard HTML props
- Follow accessibility best practices
- Include motion variants where appropriate

**Examples:** Button, Card, Modal, Tooltip, Input, Badge

### `components/layout/`
Components that define page structure and layout patterns.

**Examples:** DashboardHeader, Sidebar, Footer, GlassPanel, Container

### `components/feedback/`
Components that provide user feedback and loading states.

**Examples:** ErrorBoundary, SkeletonLoader, Toast, Spinner, ProgressBar

### `components/features/`
Feature-specific components organized by domain. These are composed of primitives and contain business logic.

**Examples:** 
- `wallet/` - Wallet connection and management
- `chat/` - Chat interface components
- `portfolio/` - Portfolio visualization and tracking

### `hooks/`
Custom React hooks for shared logic and state management.

**Examples:** useFreighter, useNotifications, useWebSocket, usePortfolio

### `utils/`
Pure utility functions and helpers.

**Examples:** formatters, parsers, calculators, validators

### `types/`
TypeScript type definitions and interfaces.

**Examples:** Domain models, API types, component prop types

### `config/`
Application configuration and constants.

**Examples:** API endpoints, feature flags, mock data, theme tokens

## Import Conventions

### Absolute Imports
Use the `@/` alias for all imports:

```typescript
// Good
import { Button } from '@/components/primitives';
import { useFreighter } from '@/hooks';
import { formatCurrency } from '@/utils';

// Avoid
import { Button } from '../../../components/primitives/Button';
```

### Index Files
Each directory should export its public API through an `index.ts` file:

```typescript
// components/primitives/index.ts
export { Button } from './Button';
export { Card } from './Card';
export { Modal } from './Modal';
export { Tooltip } from './Tooltip';
```

### Named Exports
Prefer named exports over default exports for better refactoring support:

```typescript
// Good
export function Button({ ... }) { ... }

// Avoid
export default function Button({ ... }) { ... }
```

## File Naming Conventions

- **Components:** PascalCase (e.g., `Button.tsx`, `ChatInterface.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useFreighter.ts`)
- **Utils:** camelCase (e.g., `allocationParser.ts`)
- **Types:** camelCase (e.g., `websocket.ts`)
- **Tests:** Same as source with `.test.ts(x)` suffix (e.g., `Button.test.tsx`)

## Component Organization

Each component file should follow this structure:

```typescript
// 1. Imports
import React from 'react';
import { motion } from 'framer-motion';

// 2. Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

// 3. Constants (if needed)
const ANIMATION_VARIANTS = { ... };

// 4. Component
export function Button({ variant = 'primary', children }: ButtonProps) {
  return (
    <motion.button
      variants={ANIMATION_VARIANTS}
      className={`btn btn-${variant}`}
    >
      {children}
    </motion.button>
  );
}

// 5. Sub-components (if needed)
Button.Icon = function ButtonIcon({ ... }) { ... };
```

## Benefits

1. **Scalability:** Clear separation of concerns makes it easy to add new features
2. **Discoverability:** Developers know exactly where to find and add components
3. **Maintainability:** Related code is grouped together
4. **Reusability:** Primitives can be composed into features
5. **Type Safety:** Centralized types improve consistency
6. **Testing:** Easier to test isolated components

## Next Steps

1. Review and approve this structure
2. Create the directory structure
3. Begin gradual migration of components
4. Update import paths
5. Document design system components
