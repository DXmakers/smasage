# Smasage Design System

## Overview

This document describes the design system primitives, tokens, and motion conventions used in the Smasage frontend. The design system ensures consistency, accessibility, and maintainability across the application.

## Design Tokens

Design tokens are the visual design atoms of the design system. They are defined in `src/app/globals.css` as CSS custom properties.

### Color Tokens

```css
--bg-dark: #09090b              /* Main background */
--bg-card: rgba(24, 24, 27, 0.6) /* Card background */
--border: rgba(63, 63, 70, 0.4)  /* Border color */
--accent-primary: #8b5cf6        /* Primary accent (purple) */
--accent-secondary: #06b6d4      /* Secondary accent (cyan) */
--text-main: #f8fafc             /* Primary text */
--text-muted: #94a3b8            /* Secondary text */
--success: #10b981               /* Success state */
--glass-bg: rgba(24, 24, 27, 0.7) /* Glassmorphism background */
--glass-border: rgba(255, 255, 255, 0.08) /* Glassmorphism border */
```

### Usage

```typescript
// In components, reference tokens via CSS classes or inline styles
<div style={{ color: 'var(--text-main)' }}>Text</div>
```

### Spacing Scale

The application uses a consistent spacing scale based on rem units:

- `0.5rem` (8px) - Tight spacing
- `0.75rem` (12px) - Small spacing
- `1rem` (16px) - Base spacing
- `1.5rem` (24px) - Medium spacing
- `2rem` (32px) - Large spacing
- `2.5rem` (40px) - Extra large spacing

### Typography Scale

```css
/* Headings */
h1: 2.5rem (40px), weight: 700
h2: 1.5rem (24px), weight: 600
h3: 1.25rem (20px), weight: 600

/* Body */
body: 1rem (16px), weight: 400
small: 0.875rem (14px)
```

### Border Radius

- `4px` - Minimal radius (badges, small elements)
- `8px` - Small radius (inputs, small buttons)
- `12px` - Medium radius (buttons, cards)
- `16px` - Large radius (panels, modals)
- `24px` - Extra large radius (glass panels)
- `999px` - Pill shape (status indicators, input fields)

## Primitive Components

### Button

The Button component is the primary interactive element.

**Location:** `src/app/components/Button.tsx`

**Variants:**
- `primary` - Main call-to-action (gradient background)
- `secondary` - Secondary actions (transparent with border)

**Props:**
```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  loadingLabel?: string;
}
```

**Usage:**
```typescript
import { Button } from '@/app/components/Button';

// Primary button
<Button variant="primary" onClick={handleClick}>
  Connect Wallet
</Button>

// Secondary button
<Button variant="secondary">
  Cancel
</Button>

// Loading state
<Button isLoading loadingLabel="Connecting...">
  Connect
</Button>
```

**Accessibility:**
- Includes `aria-busy` when loading
- Proper focus-visible styles
- Minimum touch target size (44x44px on mobile)
- Disabled state properly communicated

**Motion:**
- Scale down on active (0.95)
- Smooth hover transitions (0.3s cubic-bezier)
- Loading spinner animation

### Card (GlassPanel)

The GlassPanel component provides a glassmorphism card container.

**Location:** `src/app/components/GlassPanel.tsx`

**Props:**
```typescript
interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}
```

**Usage:**
```typescript
import { GlassPanel } from '@/app/components/GlassPanel';

<GlassPanel>
  <h2>Portfolio Stats</h2>
  <p>Content goes here</p>
</GlassPanel>
```

**Visual Properties:**
- Backdrop blur: 16px
- Background: `rgba(24, 24, 27, 0.7)`
- Border: `1px solid rgba(255, 255, 255, 0.08)`
- Border radius: 24px
- Box shadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5)`

**Motion:**
- Hover: translateY(-2px) with enhanced shadow
- Transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1)

### Modal

Modal components provide focused interactions.

**Location:** `src/app/components/WalletModal.tsx` (example)

**Structure:**
```typescript
<div className="modal-overlay">
  <div className="modal-content">
    <button className="modal-close-icon">×</button>
    {/* Modal content */}
  </div>
</div>
```

**Accessibility:**
- Focus trap within modal
- Escape key to close
- Proper ARIA labels
- Focus management on open/close

**Motion:**
- Fade in overlay (0.3s)
- Slide up content (0.4s cubic-bezier)
- Scale animation on open

### Tooltip

Tooltips provide contextual information on hover.

**Implementation:** Currently using native `title` attributes. Future enhancement to use a dedicated Tooltip component.

**Planned Props:**
```typescript
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}
```

## Layout Components

### DashboardHeader

**Location:** `src/app/components/DashboardHeader.tsx`

Sticky header with brand, status indicator, and wallet connection.

**Props:**
```typescript
interface DashboardHeaderProps {
  wsConnected: boolean;
  children?: React.ReactNode;
}
```

### ErrorBoundary

**Location:** `src/app/components/ErrorBoundary.tsx`

Catches React errors and displays fallback UI.

**Props:**
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}
```

### SkeletonLoader

**Location:** `src/app/components/SkeletonLoader.tsx`

Loading placeholders for async content.

**Available Skeletons:**
- `PortfolioStatsSkeleton`
- `GoalTrackerSkeleton`
- `PortfolioChartSkeleton`

## Motion Conventions

The application uses Framer Motion for animations and transitions.

### Animation Principles

1. **Purposeful:** Animations should guide attention and provide feedback
2. **Fast:** Keep animations under 400ms for UI interactions
3. **Natural:** Use easing functions that feel organic
4. **Accessible:** Respect `prefers-reduced-motion`

### Common Easing Functions

```typescript
// Smooth ease
cubic-bezier(0.4, 0, 0.2, 1)

// Bouncy ease (for emphasis)
cubic-bezier(0.34, 1.56, 0.64, 1)

// Ease out (for exits)
cubic-bezier(0, 0, 0.2, 1)
```

### Motion Variants

#### Fade In
```typescript
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};
```

#### Slide Up
```typescript
const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
};
```

#### Scale
```typescript
const scale = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { duration: 0.2 }
};
```

#### Stagger Children
```typescript
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

### Usage with Framer Motion

```typescript
import { motion } from 'framer-motion';

// Basic animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Using variants
<motion.div
  variants={fadeIn}
  initial="initial"
  animate="animate"
  exit="exit"
>
  Content
</motion.div>

// Hover and tap animations
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

### Reduced Motion

Always respect user preferences:

```typescript
import { useReducedMotion } from 'framer-motion';

function MyComponent() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={{ x: shouldReduceMotion ? 0 : 100 }}
    >
      Content
    </motion.div>
  );
}
```

## Accessibility Guidelines

### Focus Management

- All interactive elements must have visible focus indicators
- Use `:focus-visible` for keyboard-only focus styles
- Maintain logical tab order

```css
:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 3px;
  border-radius: 4px;
}
```

### Screen Reader Support

- Use semantic HTML elements
- Provide `aria-label` for icon-only buttons
- Use `aria-live` regions for dynamic content
- Include `.sr-only` class for screen reader-only text

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Color Contrast

- Text on background: minimum 4.5:1 ratio
- Large text (18pt+): minimum 3:1 ratio
- Interactive elements: minimum 3:1 ratio

### Touch Targets

- Minimum size: 44x44px on mobile
- Adequate spacing between interactive elements

## Adding New Components

When adding a new component to the design system:

1. **Choose the right location:**
   - Primitives: Reusable, generic components
   - Layout: Structural components
   - Features: Domain-specific components

2. **Follow the component template:**
```typescript
import React from 'react';
import { motion } from 'framer-motion';

export interface MyComponentProps {
  // Props with JSDoc comments
  /** The variant style */
  variant?: 'default' | 'accent';
  children: React.ReactNode;
}

/**
 * MyComponent provides...
 * 
 * @example
 * <MyComponent variant="accent">Content</MyComponent>
 */
export function MyComponent({ 
  variant = 'default', 
  children 
}: MyComponentProps) {
  return (
    <motion.div
      className={`my-component my-component-${variant}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {children}
    </motion.div>
  );
}
```

3. **Add styles to globals.css** or create a module CSS file

4. **Export from appropriate index.ts**

5. **Document usage in this file**

6. **Add tests** (when test infrastructure is set up)

## Future Enhancements

- [ ] Dedicated Tooltip component
- [ ] Toast notification system (currently using react-hot-toast)
- [ ] Form input components (Input, Select, Checkbox, Radio)
- [ ] Data visualization components
- [ ] Animation presets library
- [ ] Dark/light theme toggle
- [ ] Component playground/Storybook

## Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Tailwind CSS (if adopted)](https://tailwindcss.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Inclusive Components](https://inclusive-components.design/)
