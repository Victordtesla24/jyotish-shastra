# Technical Architecture
Last Updated: 2025-01-08T03:10:00Z

## System Overview
```
┌─────────────────────────────────────────────────────────────┐
│                    Jyotish Shastra Platform                  │
│              Vedic Astrology Web Application                 │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
         ┌──────▼──────┐            ┌──────▼──────┐
         │   Frontend   │            │   Backend   │
         │  React 18.2  │◄──────────►│  Node.js    │
         │  Port: 3000  │    REST    │  Port: 3001 │
         └──────┬───────┘   API      └──────┬──────┘
                │                           │
         ┌──────▼──────────────────────────▼──────┐
         │         Chris Cole UI/UX Layer          │
         │    (Pure CSS Enhancement - No Logic)    │
         └─────────────────────────────────────────┘
```

## Directory Structure

### Frontend Architecture
```
client/
├── public/
│   └── index.html                          # FOUC prevention CSS inline
│
├── src/
│   ├── components/
│   │   ├── forms/                          # User input forms
│   │   │   ├── BirthDataForm.js           # Main birth data input (800 lines)
│   │   │   ├── BirthDataForm.css          # Form styling (400 lines → 500)
│   │   │   └── LocationAutoComplete.jsx   # Place search component
│   │   │
│   │   ├── navigation/                     # Site navigation
│   │   │   ├── TopNav.jsx                 # Top navigation bar (80 lines → 90)
│   │   │   ├── header.css                 # Nav styling (350 lines → 400)
│   │   │   ├── WorkParticles.jsx          # Particle animation (200 lines → 220)
│   │   │   └── particles.css              # Particle styling (200 lines → 250)
│   │   │
│   │   ├── ui/                            # UI components
│   │   │   ├── HeroSection.jsx            # Hero section (150 lines → 160)
│   │   │   ├── PlanetaryAnimations.jsx    # Planet animations (150 lines → 170)
│   │   │   └── PreLoader.jsx              # Loading screen (150 lines → 170)
│   │   │
│   │   ├── reports/                       # Analysis displays
│   │   │   └── ComprehensiveAnalysisDisplay.js  # Full analysis (700 lines → 750)
│   │   │   └── ComprehensiveAnalysisDisplay.css # Report styling (400 lines → 450)
│   │   │
│   │   ├── Footer.jsx                     # Site footer (100 lines → 120)
│   │   └── BirthTimeRectification.css     # BTR styling (300 lines → 350)
│   │
│   ├── pages/                             # Route components
│   │   ├── HomePage.jsx                   # Landing page (200 lines → 210)
│   │   ├── ChartPage.jsx                  # Chart display (500 lines → 550)
│   │   ├── AnalysisPage.jsx               # Analysis tabs (600 lines → 650)
│   │   ├── ComprehensiveAnalysisPage.jsx  # Full analysis (700 lines → 750)
│   │   └── BirthTimeRectificationPage.jsx # BTR page (500 lines → 550)
│   │
│   ├── styles/                            # CSS files
│   │   ├── chris-cole-enhancements.css    # Chris Cole styles (3035 lines → 3500)
│   │   ├── vedic-design-system.css        # Base design system
│   │   ├── vedic-chart-enhancements.css   # Chart-specific styles
│   │   └── vedic-cultural-design-system.css # Vedic theming
│   │
│   ├── lib/                               # Libraries
│   │   └── scroll.js                      # GSAP scroll effects
│   │
│   ├── utils/                             # Utilities
│   │   └── (various helper files)
│   │
│   ├── index.css                          # Global styles (150 lines → 180)
│   └── App.css                            # App container (100 lines → 120)
│
└── tests/                                 # Frontend tests
    └── ui/                                # UI component tests
```

### Backend Architecture (Untouched)
```
src/
├── api/                                   # Express API routes
│   ├── controllers/                       # Request handlers
│   ├── middleware/                        # Auth, validation, logging
│   ├── routes/                            # Route definitions
│   └── validators/                        # Joi schemas
│
├── core/                                  # Vedic calculations (PROTECTED)
│   ├── calculations/                      # Swiss Ephemeris integration
│   ├── analysis/                          # Yoga, dasha analysis
│   └── charts/                            # Chart generation algorithms
│
├── services/                              # Business logic
│   └── (various service files)
│
├── data/                                  # Data access
│   └── repositories/                      # MongoDB repositories
│
├── utils/                                 # Backend utilities
│   └── (various helper files)
│
└── config/                                # Configuration
    └── (config files)
```

## API Architecture

### Endpoint Structure (Unchanged - Backend Untouched)
| Endpoint                              | Method | Purpose                  | Status  |
|---------------------------------------|--------|--------------------------|---------|
| /api/health                           | GET    | Health check             | Active  |
| /api/v1/chart/generate                | POST   | Generate Vedic chart     | Active  |
| /api/v1/geocoding/location            | POST   | Location to coordinates  | Active  |
| /api/v1/analysis/comprehensive        | POST   | Full astrological report | Active  |

## Data Flow

### Chart Generation Flow (Functionality Preserved)
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ BirthData    │────►│ Geocoding    │────►│ Chart        │────►│ Chart        │
│ Form         │     │ Service      │     │ Generation   │     │ Display      │
│ (Enhanced)   │     │ (Unchanged)  │     │ (Unchanged)  │     │ (Enhanced)   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
     CSS Only             Backend             Backend            CSS Only
```

### UI Enhancement Layer (New - CSS Only)
```
┌────────────────────────────────────────────────────────────┐
│              Chris Cole Enhancement Layer                   │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  chris-cole-enhancements.css (3500 lines)                  │
│  ├── Color Tokens (#000, #FFF, #CCC, #1A1A1A, #505050)   │
│  ├── Typography (Roboto 100, 300, 400, 500, 700)          │
│  ├── Shadow System (96+ element shadows)                   │
│  ├── Form Enhancements (focus effects, validation)         │
│  ├── Card Styles (minimal, 3D transforms)                  │
│  ├── Animation Utilities (subtle, 60fps)                   │
│  └── Responsive Breakpoints (320px, 768px, 1024px, 1920px)│
│                                                             │
└────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌─────────────────┐             ┌─────────────────┐
│ Component .jsx  │             │ Component .css  │
│ Files           │             │ Files           │
│ (Minor classes) │             │ (Major styling) │
└─────────────────┘             └─────────────────┘
```

## Key Patterns

### Pattern 1: CSS Variable System
- **Usage**: Consistent theming across all components
- **Implementation**: :root CSS variables in chris-cole-enhancements.css
```css
:root {
  --bg-primary: #000000;
  --text-primary: #FFFFFF;
  --divine-gold: #FFD700;
  --shadow-subtle: 0 1px 3px rgba(0,0,0,0.08);
}
```

### Pattern 2: Component Enhancement Strategy
- **Usage**: Add Chris Cole styling without breaking existing functionality
- **Implementation**:
  1. Add CSS classes to chris-cole-enhancements.css
  2. Apply classes to existing components (minimal JSX changes)
  3. Test functionality preservation
  4. Verify visual match to Chris Cole reference

### Pattern 3: Responsive Design System
- **Usage**: Mobile-first responsive layouts
- **Implementation**: Breakpoints at 768px, 1024px with mobile base
```css
/* Mobile: 320px-767px (base styles) */
.card-cosmic { padding: 1rem; }

/* Tablet: 768px-1023px */
@media (min-width: 768px) {
  .card-cosmic { padding: 1.5rem; }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .card-cosmic { padding: 2rem; }
}
```

### Pattern 4: Animation Performance Optimization
- **Usage**: Smooth 60fps animations throughout
- **Implementation**: GPU acceleration, will-change, requestAnimationFrame
```css
.parallax-element {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

### Pattern 5: Accessibility First
- **Usage**: WCAG AA compliance mandatory
- **Implementation**:
  - Color contrast ≥4.5:1
  - Keyboard navigation support
  - Focus indicators visible
  - Reduced motion support
  - Screen reader compatibility

## Integration Points

### GSAP ScrollTrigger Integration
- **Service**: GSAP 3.13.0 for scroll-triggered animations
- **Purpose**: Parallax effects, scroll reveals, smooth scrolling
- **Configuration**: Configured in client/src/lib/scroll.js
- **Status**: Implemented, needs runtime testing

### Framer Motion Integration
- **Service**: Framer Motion 12.23.9 for React animations
- **Purpose**: Component transitions, page animations, PreLoader
- **Configuration**: Imported per-component as needed
- **Status**: Implemented, actively used

### PixiJS Particle System
- **Service**: PixiJS 8.14.0 for canvas-based animations
- **Purpose**: WorkParticles hover effect, starfield backgrounds
- **Configuration**: Canvas-based rendering in navigation components
- **Status**: Implemented, needs performance validation

### Roboto Font Family
- **Service**: Google Fonts CDN
- **Purpose**: Typography system matching Chris Cole
- **Configuration**: Loaded in client/public/index.html
- **Required Weights**: 100, 300, 400, 500, 700 (regular and condensed)
- **Status**: Needs verification

## Performance Considerations

### Critical Rendering Path Optimization
1. **Inline Critical CSS**: FOUC prevention in index.html
2. **Font Preloading**: Roboto fonts preloaded for faster rendering
3. **Code Splitting**: React lazy loading for route-based splitting
4. **Image Optimization**: Minimal images used (SVG charts primarily)

### Animation Performance Targets
- **Target**: 60fps consistent across all animations
- **Strategy**:
  - GPU acceleration (transform, opacity only)
  - RequestAnimationFrame for smooth updates
  - Reduced motion queries for accessibility
  - Performance monitoring in DevTools

### Bundle Size Management
- **Current**: CSS additions minimal impact (<50KB gzipped)
- **Target**: Keep total bundle increase <10%
- **Strategy**: CSS tree-shaking, unused style removal

## Security Considerations

### Frontend Security (Maintained)
- **XSS Prevention**: React's built-in escaping
- **Input Validation**: Client-side + server-side validation
- **No Sensitive Data**: No auth tokens in localStorage
- **HTTPS Only**: Production deployment over HTTPS

### Backend Security (Unchanged)
- API security measures remain completely intact
- No modifications to authentication/authorization
- Input validation schemas unchanged

## Deployment Architecture

### Vercel Deployment (Target Platform)
```
┌──────────────────────────────────────────┐
│           Vercel Edge Network             │
├──────────────────────────────────────────┤
│  Static Assets (CSS, Images)             │
│  ├── chris-cole-enhancements.css         │
│  ├── Other CSS files                     │
│  └── SVG chart components                │
├──────────────────────────────────────────┤
│  Serverless Functions (Backend API)      │
│  └── /api/* routes                       │
└──────────────────────────────────────────┘
```

## Technology Stack Summary

### Frontend Stack (Enhanced)
- React 18.2.0 (component framework)
- React Router DOM 6.x (routing)
- React Query 4.x (server state)
- Framer Motion 12.23.9 (animations)
- GSAP 3.13.0 (scroll effects)
- PixiJS 8.14.0 (particles)
- Tailwind CSS 3.4.17 (utilities)
- Custom CSS (chris-cole-enhancements.css)

### Backend Stack (Untouched)
- Node.js/Express (API server)
- Swiss Ephemeris (astronomical calculations)
- MongoDB (data storage)
- OpenCage API (geocoding)

### Development Stack
- CRACO (build configuration)
- Jest (unit testing)
- React Testing Library (component testing)
- Cypress (E2E testing)
- ESLint (code quality)
- Prettier (code formatting)

## Version Control Strategy

### Git Workflow
1. Feature branch: `feature/chris-cole-ui-enhancement`
2. Atomic commits per phase
3. Comprehensive commit messages
4. Memory Bank updates committed separately

### Rollback Safety
- Git checkpoints before each phase
- Production backup before deployment
- Quick rollback plan if issues arise
- Vercel automatic deployments with rollback capability
