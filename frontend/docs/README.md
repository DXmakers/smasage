# Smasage Frontend Documentation

## Overview

This directory contains comprehensive documentation for the Smasage frontend application, including architecture decisions, design system guidelines, and development standards.

## Documentation Index

### Architecture & Structure

- **[UI Folder Structure](./UI_FOLDER_STRUCTURE.md)** - Scalable folder organization for components, hooks, and utilities
  - Component organization patterns
  - Import conventions
  - File naming standards
  - Migration plan

### Design System

- **[Design System](./DESIGN_SYSTEM.md)** - Complete design system documentation
  - Design tokens (colors, spacing, typography)
  - Primitive components (Button, Card, Modal, Tooltip)
  - Layout components
  - Motion conventions with Framer Motion
  - Accessibility guidelines

### Technical Decisions

- **[WebGL Evaluation](./WEBGL_EVALUATION.md)** - React Three Fiber assessment
  - Performance analysis
  - Value proposition evaluation
  - Accessibility considerations
  - Alternative recommendations
  - **Decision: Do NOT implement**

## Quick Start

### For New Developers

1. Read [UI Folder Structure](./UI_FOLDER_STRUCTURE.md) to understand where to add code
2. Review [Design System](./DESIGN_SYSTEM.md) to learn about available components
3. Follow the component templates and conventions

### For Designers

1. Review [Design System](./DESIGN_SYSTEM.md) for design tokens and component specs
2. Understand motion conventions and animation principles
3. Reference accessibility guidelines for new designs

### For Product Managers

1. Read [WebGL Evaluation](./WEBGL_EVALUATION.md) for technical decision context
2. Understand performance budgets and constraints
3. Review component capabilities in Design System

## Key Technologies

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** CSS Modules + Global CSS
- **Animation:** Framer Motion 11
- **Icons:** Lucide React
- **State Management:** React Hooks + Context

## Development Standards

### Component Guidelines

1. Use TypeScript with strict types
2. Follow accessibility best practices (WCAG 2.1)
3. Include JSDoc comments for public APIs
4. Use Framer Motion for animations
5. Respect `prefers-reduced-motion`

### Code Style

- Use named exports over default exports
- Prefer functional components with hooks
- Keep components focused and composable
- Extract reusable logic into custom hooks

### Performance

- Lazy load heavy components
- Optimize images and assets
- Monitor bundle size
- Use React.memo for expensive renders

### Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Screen reader testing
- Color contrast compliance

## Contributing

When adding new features:

1. **Plan:** Review existing patterns in documentation
2. **Design:** Follow design system tokens and components
3. **Implement:** Use appropriate folder structure
4. **Document:** Update relevant documentation
5. **Test:** Verify accessibility and performance

## Maintenance

### Documentation Updates

Keep documentation in sync with code:
- Update design system when adding components
- Document architectural decisions
- Maintain migration guides
- Add examples for complex patterns

### Review Schedule

- **Quarterly:** Review and update all documentation
- **Per Feature:** Update relevant docs with each feature
- **Per Issue:** Document decisions and trade-offs

## Related Resources

### External Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Internal Resources

- [Main README](../README.md) - Project setup and development
- [Package.json](../package.json) - Dependencies and scripts

## Support

For questions or clarifications:
1. Check this documentation first
2. Review code examples in the codebase
3. Consult with the frontend team
4. Update documentation with answers for future reference

---

**Last Updated:** 2026-06-01  
**Maintained By:** Frontend Team
