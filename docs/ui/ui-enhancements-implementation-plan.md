# Black Background Theme & Interaction Parity Implementation Plan

**Goal:** Deliver a **pixel-accurate dark theme** (Primary BG `#000000`, Text Primary `#FFFFFF`) **and interaction parity** with `https://hellochriscole.webflow.io`, including **page pre-load animation**, **scroll/parallax effects**, **menu hover micro-interactions** (e.g., star particles forming letter on `WORK`), and **background motion** — while preserving existing app functionality.

---

## Phase 0 — Reference Audit & Guardrails (Do First)

  1. **Audit the reference site (visual + motion):**

      - **Navigation**: top navigation with items `Work · About · Contact · Sketches`.
      - **Load experience**: a **loading** state appears prior to content (preloader).
      - **Aesthetic**: minimal, high-contrast, dark presentation; generous whitespace/leading.
      - **Sections**: hero intro, work grid/cards, and long-scroll content blocks.

  1. **Motion guardrails (to be matched globally):**

      - Subtle **page-load entrance** for hero/fold content.
      - **Scroll-linked reveals/parallax** on sections.
      - **Hover micro-interactions** on nav (e.g., star particle hover on `WORK`) and links.
      - Avoid jank; use `requestAnimationFrame` and GPU-friendly transforms for custom JS animation.

  1. **Dark theme baseline (global):**

      - **Primary Background**: `#000000`
      - **Primary Text**: `#FFFFFF`
      - **Secondary Text**: `#CCCCCC`
      - **Surfaces/Cards**: `#1A1A1A`
      - **Borders**: `#505050`
      - **Accents**: Gold `#FFD700`, Saffron `#FF9933` (for CTAs/hover)

---

## Phase 1 — Core Tokens & Base Scaffolding (Blocking)

### 1.1 Variables & Base

- **Files**:  
  - `client/src/styles/chris-cole-enhancements.css`  
  - `client/src/styles/vedic-design-system.css` 
  - `client/src/index.css`

- **Actions**:
  - Set/update CSS variables:
    ```css
      :root {
        --color-black:#000000; --color-dark-gray:#1A1A1A; --color-mid-gray:#505050;
        --color-light-gray:#CCCCCC; --color-white:#FFFFFF;
    
        --bg-primary:var(--color-black);
        --bg-surface:var(--color-dark-gray);
        --text-primary:var(--color-white);
        --text-secondary:var(--color-light-gray);
        --border-color:var(--color-mid-gray);
    
        --accent-gold:#FFD700;
        --accent-saffron:#FF9933;
      }
      html,body{background:var(--bg-primary);color:var(--text-primary);}
    ```

  - Update any legacy tokens (replace **all** occurrences): 
    - `--bg-primary:#FFFFFF → #000000`
    - `--text-primary:#1a1a1a → #FFFFFF`
    - `--text-secondary:#666666/#4B5563 → #CCCCCC`
    - `--bg-card/#FFFFFF → #1A1A1A`

  - **Scrollbar/selection** (dark):
    ```css
      ::selection{background:rgba(255,215,0,.25);color:#fff}
      ::-webkit-scrollbar{height:10px;width:10px}
      ::-webkit-scrollbar-thumb{background:#505050;border-radius:6px}
    ```


### 1.2 Accessibility & Reduced Motion

- Respect `prefers-reduced-motion`; gate nonessential animations:
  ```css
    @media (prefers-reduced-motion: reduce) {
     *{animation:none!important;transition:none!important;scroll-behavior:auto!important}
    }
  ```

- Maintain WCAG AA contrast targets on all states.

---

## Phase 2 — Navigation & Header (Exact Structure + Hover Micro-interaction)

### 2.1 Top Navigation

  - **Files**: `client/src/components/navigation/Header.jsx`, `header.css`
  - **Structure**:
    - Left: logotype/wordmark (or app title)
    - Right: nav list `Work · About · Contact · Sketches`
  - **Styles**:
    ```css
      .header{position:sticky;top:0;z-index:50;background:rgba(0,0,0,.6);backdrop-filter:saturate(120%) blur(6px)}
      .nav-link{color:#fff;opacity:.9;padding:.75rem 1rem;text-decoration:none;transition:opacity .2s ease}
      .nav-link:hover{opacity:1}
      .nav-link.is-active{color:var(--accent-gold)}
      .nav-spacer{gap:1rem;letter-spacing:.02em}
    ```

  - **Rationale**: Matches reference topology (top nav and items), not a sidebar.

### 2.2 **`WORK` Hover — “Star-to-Letter” Effect**

  - **Approach**: **PixiJS** particle field morphing to text outline on hover; fallback to CSS/SVG mask on reduced-motion.
  - **Files**:
   - `client/src/components/navigation/WorkParticles.tsx` (Pixi canvas mounted inside nav link)
   - `client/src/components/navigation/particles.ts` (emitter & layout utils)
   - `client/src/styles/particles.css`
  - **Key steps**:

    1. Render Pixi `ParticleContainer` for performance.
    2. Precompute target points from an offscreen `<canvas>` drawing “WORK” (bold sans) and sample alpha pixels.
    3. On `mouseenter`, tween particle positions to nearest target point cluster; on `mouseleave`, disperse to noise field.

  - **Notes**: Cap ~1.5–3k particles; throttle on low-end devices; pause under `prefers-reduced-motion`.
  - **Refs**: Pixi **ParticleContainer** for 1000s of particles; animate via `requestAnimationFrame`. 

---

## Phase 3 — Pre-loader & Page-Load Entrance

### 3.1 Pre-loader Overlay

  - **Files**: `client/src/components/system/Preloader.tsx`, `preloader.css`, `preloader.ts`
  - **Behavior**:
  - Show **black overlay** with small white “loading” label/spinner until fonts/first-view assets settle.
  - Fade overlay → reveal hero via GSAP timeline; prevent FOUC.
    ```js
      import { gsap } from 'gsap';
      // on window 'load' or when critical assets ready:
      const tl = gsap.timeline({ defaults:{ ease:'power2.out' }});
      tl.to('.preloader', { opacity:0, duration:.6, pointerEvents:'none' })
        .from('.hero h1,.hero p,.hero .cta',{ y:24, opacity:0, stagger:.08, duration:.9 }, '<.05');
    ```

  - **Refs**: Reference site exposes a “loading” state in markup; use GSAP timelines for reliable sequencing. 

---

## Phase 4 — Scroll/Parallax & Background Motion

### 4.1 Section Reveals & Pinning (GSAP + ScrollTrigger)

  - **Files**: `client/src/lib/scroll.ts`, per-page hooks
  - **Patterns**:
  - Fade/translate reveals for cards/sections
  - **Parallax**: slow-moving background layers (yPercent), pinned blocks for emphasis
    ```js
      import gsap from 'gsap';
      import { ScrollTrigger } from 'gsap/ScrollTrigger';
      gsap.registerPlugin(ScrollTrigger);
    
      gsap.utils.toArray('.reveal').forEach((el:any)=>{
        gsap.from(el, { opacity:0, y:40, duration:.8, scrollTrigger:{ trigger:el, start:'top 80%' }});
      });
    
      gsap.to('.parallax-bg',{ yPercent:-30, ease:'none',
        scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:1 }
      });
    ```

  - **Refs**: GSAP **ScrollTrigger** official docs and timeline integration.

### 4.2 Background Motion on Scroll

  - **Approach**:
  - Option A: CSS `background-position` parallax on fixed star/noise texture layers.
  - Option B (enhanced): Canvas starfield drifting subtly; intensity scales with scroll velocity.
  - **Perf**: Animate **transform/opacity** only; gate via `requestAnimationFrame`. 

---

## Phase 5 — Components on Dark

### 5.1 Cards

  ```css
    .card{background:#1A1A1A;border:1px solid #505050;border-radius:8px;padding:24px;transition:transform .2s ease,border-color .2s}
    .card:hover{transform:translateY(-4px);border-color:var(--accent-gold);box-shadow:0 12px 24px rgba(255,215,0,.10)}
    .card-title{color:#fff}
    .card-text{color:#CCCCCC}
  ```

### 5.2 Forms

  ```css
    .form-label{color:#FFFFFF}
    .form-input{background:#1A1A1A;color:#FFFFFF;border:2px solid #505050}
    .form-input::placeholder{color:#CCCCCC}
    .form-input:focus{border-color:#FFD700;box-shadow:0 0 12px rgba(255,215,0,.2)}
  ```

### 5.3 Buttons

  ```css
    .btn-primary{color:#000;background:linear-gradient(135deg,#FFD700 0%,#FF9933 100%);border:2px solid #FFD700}
    .btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 30px rgba(255,215,0,.6)}
  ```

---

## Phase 6 — Page-Level Passes

  - **HomePage (`client/src/pages/HomePage.jsx`)**
    - Apply **hero** dark gradient (`#000 → #1A1A1A`), text white/secondary gray.
    - Add `.parallax-bg` layer; register ScrollTrigger hooks
    - Wire pre-loader reveal to hero elements.

  - **ChartPage (`client/src/pages/ChartPage.jsx`)**
    - Dark containers; ensure charts adopt dark theme palettes.
    - Increase axis/grid contrast on black (use `#505050` grids, `#CCCCCC` labels).

  - **AnalysisPage (`client/src/pages/AnalysisPage.jsx`)**
    - Tabs/buttons adapted to dark; section reveals registered with `.reveal`.

- **ComprehensiveAnalysisPage / BirthTimeRectificationPage**
  - Forms/cards per Phase 5; keep long-scroll reveals and pinned headers consistent.

---

## Phase 7 — Performance, A11y & QA

  1. **Performance**

    - Use **GSAP** for scroll/entrances; avoid layout-thrashing properties.
    - Custom particle/canvas loops strictly via **`requestAnimationFrame`**; pause when tab hidden. 

  1. **Accessibility**

    - Contrast checks:
      - Keyboard focus rings visible on dark (e.g., `outline:2px solid #FFD700`).

  1. **Reduced Motion**

    - Disable parallax/particles on `prefers-reduced-motion`.

  1. **No FOUC / Theme Flash**

    - Inline a minimal critical CSS block with dark BG in HTML `<head>`.

---

## Phase 8 — Validation Workflow

  1. **Visual parity (side-by-side):**

    - Left: `https://hellochriscole.webflow.io`
    - Right: `http://localhost:3002`
    - Compare: **nav position/labels**, **hero spacing**, **card spacing**, **hover states**, **scroll reveals**, **pre-load timing**. 

  1. **Interaction checks:**

    - Preloader: fades once critical assets ready; no white flash.
    - Scroll: parallax/reveals fire at equivalent thresholds; no jank.
    - Nav hover: `WORK` triggers star-to-letter particles; no frame drops.

3. **Cross-browser**

  - Chrome, Safari, Firefox, Edge; desktop + mobile breakpoints.

---

## Implementation Order

  1. **Tokens & Base** (Phase 1)
  2. **Preloader** (Phase 3)
  3. **Header/Nav & `WORK` Particle Hover** (Phase 2)
  4. **Scroll/Parallax Hooks** (Phase 4)
  5. **Components on Dark** (Phase 5)
  6. **Page Passes** (Phase 6)
  7. **Perf/A11y/QA** (Phase 7–8)

---

## Files to Create/Modify

**Create**

- `client/src/components/navigation/Header.jsx`
- `client/src/components/navigation/WorkParticles.tsx`
- `client/src/components/navigation/particles.ts`
- `client/src/components/system/Preloader.tsx`
- `client/src/lib/scroll.ts`
- `client/src/styles/{header.css,particles.css,preloader.css}`

**Modify**

- `client/src/styles/chris-cole-enhancements.css`
- `client/src/styles/vedic-design-system.css`
- `client/src/index.css`
- Page components: `HomePage.jsx`, `ChartPage.jsx`, `AnalysisPage.jsx`, `ComprehensiveAnalysisPage.jsx`, `BirthTimeRectificationPage.jsx`

---

## Success Criteria (Must Pass)

- [ ] **Exact dark baseline**: BG `#000000`, text `#FFFFFF`; secondary `#CCCCCC`; surfaces `#1A1A1A`; borders `#505050`.
- [ ] **Top nav** with items `Work/About/Contact/Sketches`, hover micro-interactions; active state gold.
- [ ] **Pre-load** overlay + sequenced hero entrance (no theme flash).
- [ ] **Scroll/parallax** effects that mirror reference pacing.
- [ ] **`WORK` hover**: star particles morph to letter shape; performant and disabled under reduced motion.
- [ ] All forms, cards, charts legible on dark; focus rings visible.
- [ ] No regressions; Lighthouse perf ≥90; no console errors.

---