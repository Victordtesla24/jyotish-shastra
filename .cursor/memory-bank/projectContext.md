# Project Context
Last Updated: 2025-01-08T03:08:00Z

## Project Overview
- Name: Jyotish Shastra - Vedic Astrology Platform
- Purpose: Comprehensive Vedic astrology chart generation and analysis web application
- Stage: Production Enhancement - Chris Cole UI/UX Implementation
- Version: v2.0 (Chris Cole Enhancement Phase)

## Scope & Constraints
### In Scope
- Pure CSS/styling enhancements matching Chris Cole aesthetic (https://hellochriscole.webflow.io/)
- Black background (#000000) with white text (#FFFFFF) theme
- Enhance existing components without changing functionality
- Maintain 100% backward compatibility with all existing features
- Responsive design optimization (mobile, tablet, desktop)
- Accessibility compliance (WCAG AA)

### Out of Scope
- Backend API modifications
- Chart calculation algorithm changes
- New feature development beyond UI/UX
- Database schema changes
- Authentication/authorization changes

### Critical Constraints
- **ZERO functionality changes** - All chart generation, validation, API calls must work identically
- **NO modifications to** VedicChartDisplay.jsx (559 lines) or any core calculation files
- **Preserve all existing tests** - Must pass without modification
- **CSS-only changes** - No new React components unless purely presentational
- **Performance targets**: Lighthouse ≥90, <3s page load, 60fps animations

## Technology Stack
### Languages
- JavaScript (ES6+)
- JSX (React 18.2.0)
- CSS3 (with CSS Variables)

### Frameworks & Libraries
- **Frontend**: React 18.2.0, React Router DOM 6.x
- **State Management**: React Query 4.x, Context API
- **Styling**: CSS3, Tailwind CSS 3.4.17
- **Animations**: Framer Motion 12.23.9, GSAP 3.13.0
- **Charts**: Custom SVG-based Vedic chart rendering
- **Backend**: Node.js/Express (untouched in this implementation)

### Dependencies (Critical)
- framer-motion: ^12.23.9 (installed)
- gsap: ^3.13.0 (installed)
- pixi.js: ^8.14.0 (for particles, installed)
- react: ^18.2.0
- react-router-dom: ^6.x

### Development Environment
- Node.js: v18+ recommended
- Package Manager: npm
- Dev Server: Frontend (3000), Backend (3001)
- Build Tool: CRACO (Create React App Configuration Override)

## Quality Standards
### Code Style
- ESLint configuration (strict)
- Prettier formatting
- camelCase for variables/functions
- PascalCase for components
- kebab-case for CSS files
- Roboto font family throughout

### Testing Requirements
- Unit test coverage: >90% (Jest)
- UI component tests: React Testing Library
- E2E tests: Cypress
- Manual testing: All user workflows
- Cross-browser: Chrome, Firefox, Safari, Edge

### Performance Targets
- Lighthouse Performance: ≥90
- First Contentful Paint: <2s
- Time to Interactive: <3s
- Cumulative Layout Shift: <0.1
- Animation FPS: 60fps consistent

### Accessibility Standards
- WCAG 2.1 AA compliance mandatory
- Keyboard navigation fully functional
- Screen reader compatible
- Color contrast: 4.5:1 minimum (text)
- Focus indicators visible
- Reduced motion support

## Active Protocols
- Memory Bank Protocols (.clinerules/001-memory-bank-protocols.md)
- Directory Management Protocol (.clinerules/002-directory-management-protocols.md)
- Error Fixing Protocol (.clinerules/003-error-fixing-protocols.md)
- Production Grade Rules (.cursor/rules/production-grade-rules.mdc)
- Jyotish Shastra Project Rules (.cursor/rules/jyotish-shastra-project-rules.mdc)

## Current Implementation Status
### Completed (Previous Phase)
- ✅ Chris Cole color tokens (#000000, #FFFFFF, #CCCCCC, #1A1A1A, #505050)
- ✅ FOUC prevention (inline critical CSS in index.html)
- ✅ PreLoader component (exact Chris Cole match - "loading" text only)
- ✅ TopNav structure (Work · About · Contact · Sketches)
- ✅ GSAP ScrollTrigger library implemented
- ✅ chris-cole-enhancements.css (3035 lines, target: 3500 lines)

### In Progress (Current Phase)
- → Extending chris-cole-enhancements.css with enhanced tokens
- → BirthDataForm focus effects and styling
- → ChartPage minimal card enhancements
- → Analysis pages UI refinements
- → Responsive design optimization

### Not Started
- [ ] ComprehensiveAnalysisPage enhancements
- [ ] BirthTimeRectificationPage styling
- [ ] Full cross-browser testing suite
- [ ] Production deployment preparation
- [ ] Documentation and style guide

## Project File Structure
```
jjyotish-shastra/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── forms/              # BirthDataForm, LocationAutoComplete
│   │   │   ├── navigation/         # TopNav, WorkParticles
│   │   │   ├── ui/                 # HeroSection, PreLoader, PlanetaryAnimations
│   │   │   └── reports/            # ComprehensiveAnalysisDisplay
│   │   ├── pages/                  # HomePage, ChartPage, AnalysisPage, etc.
│   │   ├── styles/                 # CSS files
│   │   │   ├── chris-cole-enhancements.css (3035 lines)
│   │   │   ├── vedic-design-system.css
│   │   │   └── vedic-chart-enhancements.css
│   │   ├── lib/                    # scroll.js (GSAP integration)
│   │   └── utils/                  # Helper utilities
│   ├── public/
│   │   └── index.html              # Has inline critical CSS
│   └── tests/                      # Test files
├── src/                             # Backend (untouched)
│   ├── api/                        # Express routes
│   ├── core/                       # Vedic astrology calculations
│   ├── services/                   # Business logic
│   └── utils/                      # Backend utilities
├── .cursor/
│   ├── memory-bank/                # Memory Bank files
│   └── rules/                      # Project-specific rules
└── tests/                          # Integration tests
```

## Known Issues & Risks
### Current Challenges
- chris-cole-enhancements.css needs 500 more lines to reach target
- Runtime testing needed for all implemented components
- WORK particle hover effect not tested
- Scroll effects performance needs validation
- Cross-browser compatibility pending verification

### Risk Mitigation
- Incremental implementation with testing after each phase
- Version control checkpoints before major changes
- Backup existing functionality before modifications
- Performance monitoring throughout implementation
- Fallbacks for older browsers

## Success Criteria
- [ ] All existing tests pass without modification
- [ ] Zero functional regressions
- [ ] Lighthouse score ≥90
- [ ] WCAG AA compliance verified
- [ ] Cross-browser compatibility confirmed
- [ ] Responsive design working (320px-1920px+)
- [ ] Production deployment successful
- [ ] User acceptance testing passed
