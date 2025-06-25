# System Architecture for Expert-Level Vedic Kundli Analysis

## Overview
This document outlines the comprehensive system architecture for the Vedic astrology analysis platform, designed to handle complex astronomical calculations, multiple analysis layers, and generate expert-level reports.

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  React Frontend                                                             │
│  ├── Birth Data Collection Forms                                            │
│  ├── Chart Visualization Components                                         │
│  ├── Analysis Display Components                                            │
│  └── Report Generation Interface                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Express.js Server                                                          │
│  ├── Authentication & Authorization                                         │
│  ├── Request Validation & Rate Limiting                                     │
│  ├── CORS & Security Headers                                                │
│  └── Request Routing & Load Balancing                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Internal API Calls
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Core Analysis Services                                                     │
│  ├── ChartGenerationService                                                 │
│  ├── GeocodingService                                                       │
│  ├── LagnaAnalysisService                                                   │
│  ├── HouseAnalysisService                                                   │
│  ├── AspectAnalysisService                                                  │
│  ├── NavamsaAnalysisService                                                 │
│  ├── DashaAnalysisService                                                   │
│  └── ReportGenerationService                                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Data Access
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Data Sources                                                               │
│  ├── Swiss Ephemeris (Astronomical Calculations)                            │
│  ├── MongoDB (User Data & Charts)                                           │
│  ├── Redis (Calculation Cache)                                              │
│  └── File System (Ephemeris Data)                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Data Flow Architecture

```
┌─────────────┐    ┌────────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Birth     │    │   Geocoding    │    │   Chart     │    │  Analysis   │    │   Report    │
│   Data      │───▶│    Service     │───▶│ Generation  │───▶│   Engine    │───▶│ Generation  │
│  Collection │    │ (Optional)     │    │   Engine    │    │             │    │   Engine    │
└─────────────┘    └────────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Validation  │    │ External API│    │ Swiss       │    │ Rule        │    │ Template    │
│ & Storage   │    │   (e.g.      │    │ Ephemeris   │    │ Engine      │    │ Engine      │
│             │    │  Google Maps)│    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Database    │    │ Coordinates │    │ Calculations│    │ Analysis    │    │ PDF/HTML    │
│ (User Data) │    │ (Lat/Lon)   │    │ (Planetary  │    │ Results     │    │ Output      │
│             │    │             │    │ Positions)  │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 3. Service Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CONTROLLER LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  API Controllers                                                            │
│  ├── ChartController                                                        │
│  │   ├── POST /api/chart/generate                                           │
│  │   ├── GET /api/chart/:id                                                 │
│  │   └── GET /api/chart/:id/navamsa                                         │
│  ├── AnalysisController                                                     │
│  │   ├── POST /api/analysis/lagna                                           │
│  │   ├── POST /api/analysis/houses                                          │
│  │   ├── POST /api/analysis/aspects                                         │
│  │   └── POST /api/analysis/dasha                                           │
│  ├── ReportController                                                       │
│  │   ├── POST /api/report/generate                                          │
│  │   ├── GET /api/report/:id                                                │
│  │   └── GET /api/report/:id/download                                       │
│  └── UserController                                                         │
│      ├── POST /api/user/register                                            │
│      ├── POST /api/user/login                                               │
│      └── GET /api/user/profile                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Service Calls
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Core Services                                                              │
│  ├── ChartGenerationService                                                 │
│  │   ├── generateComprehensiveChart(birthData)                              │
│  │   ├── generateRasiChart(birthData)                                       │
│  │   ├── generateNavamsaChart(birthData)                                    │
│  │   ├── calculateAscendant(jd, place)                                      │
│  │   └── getPlanetaryPositions(jd)                                          │
│  ├── GeocodingService                                                       │
│  │   └── geocodeLocation(locationData)                                      │
│  ├── LagnaAnalysisService                                                   │
│  │   ├── analyzeLagnaSign(lagnaSign)                                        │
│  │   ├── analyzeLagnaLord(lagnaLord, placement)                             │
│  │   └── determineFunctionalNature(lagnaSign, planets)                      │
│  ├── HouseAnalysisService                                                   │
│  │   ├── analyzeHouse(houseNumber, chart)                                   │
│  │   ├── analyzeHouseLord(houseNumber, chart)                               │
│  │   └── analyzeHouseOccupants(houseNumber, chart)                          │
│  ├── AspectAnalysisService                                                  │
│  │   ├── calculatePlanetaryAspects(chart)                                   │
│  │   └── analyzeAspectEffects(aspectingPlanet, aspectedHouse)               │
│  ├── DashaAnalysisService                                                   │
│  │   ├── calculateVimshottariDasha(birthData)                               │
│  │   └── determineCurrentDasha(birthData, currentDate)                      │
│  └── ReportGenerationService                                                │
│      ├── generatePersonalityProfile(analysis)                               │
│      └── generateLifePredictions(analysis)                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4. Database Schema Architecture (MongoDB)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Users Collection                                                           │
│  ├── _id (ObjectId, Primary Key)                                            │
│  ├── email (String, Unique, Required)                                       │
│  ├── password (String, Required)                                            │
│  ├── name (String)                                                          │
│  └── createdAt, updatedAt (Date)                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Charts Collection                                                          │
│  ├── _id (ObjectId, Primary Key)                                            │
│  ├── userId (ObjectId, Ref: 'User')                                         │
│  ├── name (String)                                                          │
│  ├── birthData                                                              │
│  │   ├── dateOfBirth (String, 'YYYY-MM-DD')                                 │
│  │   ├── timeOfBirth (String, 'HH:MM:SS')                                   │
│  │   ├── placeOfBirth (String)                                              │
│  │   ├── latitude (Number)                                                  │
│  │   ├── longitude (Number)                                                 │
│  │   └── timezone (String)                                                  │
│  ├── rasiChart                                                              │
│  │   ├── ascendant (Object)                                                 │
│  │   ├── planetaryPositions (Object)                                        │
│  │   └── housePositions (Array)                                             │
│  ├── navamsaChart (Object)                                                  │
│  ├── analysis (Object)                                                      │
│  └── createdAt, updatedAt (Date)                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Reports Collection                                                         │
│  ├── _id (ObjectId, Primary Key)                                            │
│  ├── chartId (ObjectId, Ref: 'Chart')                                       │
│  ├── userId (ObjectId, Ref: 'User')                                         │
│  ├── reportType (String)                                                    │
│  ├── content (String)                                                       │
│  └── generatedAt (Date)                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5. Analysis Engine Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ANALYSIS ENGINE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Input: Rasi & Navamsa Chart Data                                           │
│  └── Planetary Positions, Houses, Aspects, Dignities                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Analysis Pipeline                                                          │
│  ├── Phase 1: Foundational Analysis                                         │
│  │   ├── Lagna & Lagna Lord Analysis                                        │
│  │   ├── Sun & Moon Analysis (Luminaries)                                   │
│  │   └── Planetary Dignity (Exaltation, Debilitation, etc.)                 │
│  ├── Phase 2: House-by-House Analysis                                       │
│  │   ├── Examination of each of the 12 houses                               │
│  │   ├── House Lord Placement & Condition                                   │
│  │   └── Planets Occupying each House                                       │
│  ├── Phase 3: Aspect Analysis                                               │
│  │   ├── Conjunctions, Oppositions, Trines, Squares                         │
│  │   └── Special Aspects (Mars, Jupiter, Saturn)                            │
│  ├── Phase 4: Divisional Chart Analysis                                     │
│  │   ├── Navamsa (D9) for marriage and inner strength                       │
│  │   └── Other divisional charts (D10 for career, etc.)                     │
│  └── Phase 5: Timing & Prediction                                           │
│      ├── Vimshottari Dasha Calculations                                     │
│      ├── Antardasha & Pratyantardasha                                       │
│      └── Transit Analysis (Gochar)                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Output: Structured JSON with comprehensive analysis                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 6. Swiss Ephemeris Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SWISS EPHEMERIS INTEGRATION                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Node.js `swisseph` Library Wrapper                                         │
│  ├── Planetary Position Calculations (swe_calc_ut)                          │
│  │   ├── Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn                   │
│  │   ├── Mean Node (Rahu), True Node                                        │
│  │   └── Ketu calculated as 180° opposite Rahu                              │
│  ├── Ascendant & House Cusp Calculations (swe_houses)                       │
│  │   ├── Sidereal Time Calculation                                          │
│  │   ├── Ayanamsa: Lahiri (SE_SIDM_LAHIRI)                                  │
│  │   └── House System: Placidus ('P') or Whole Sign as fallback             │
│  ├── Nakshatra & Dasha Calculations                                         │
│  │   ├── Based on Moon's longitude                                          │
│  │   └── Vimshottari Dasha system                                           │
│  └── Configuration                                                          │
│      ├── Ephemeris file path set via `swe_set_ephe_path`                     │
│      └── Sidereal mode set via `swe_set_sid_mode`                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Ephemeris Data Management                                                  │
│  ├── Local ephemeris files stored in `/ephemeris` directory                 │
│  ├── Data files are loaded on service initialization                        │
│  └── Caching of calculations managed by Redis                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 7. Report Generation Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REPORT GENERATION                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Analysis Data Input (Structured JSON)                                      │
│  ├── Personality, Career, Health, Finance, Relationship analysis            │
│  ├── Dasha predictions and timelines                                        │
│  └── Yoga analysis and interpretations                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Report Generation Pipeline                                                 │
│  ├── Template Engine (e.g., EJS or Handlebars if generating HTML)           │
│  │   ├── Dynamic templates for different report sections                    │
│  │   └── Placeholders for analysis data                                     │
│  ├── Content Synthesis                                                      │
│  │   ├── Aggregates analysis data into narrative text                       │
│  │   └── Prioritizes key findings                                           │
│  └── Output Generation                                                      │
│      ├── JSON API Response (Primary)                                        │
│      ├── PDF Report (Using a library like PDFKit or Puppeteer)              │
│      └── HTML Report for web view                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 8. Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYERS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Application Security (via Express Middleware)                              │
│  ├── Input Validation (Joi)                                                 │
│  ├── SQL/NoSQL Injection Prevention (Mongoose validation)                   │
│  ├── XSS Protection (Helmet)                                                │
│  └── CSRF Protection (if using sessions)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Authentication & Authorization                                             │
│  ├── JWT for stateless authentication                                       │
│  ├── Password Hashing (bcryptjs)                                            │
│  ├── Role-Based Access Control (RBAC) middleware                            │
│  └── Secure token storage (HTTP-only cookies or secure storage)             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Infrastructure Security                                                    │
│  ├── HTTPS/TLS for data in transit                                          │
│  ├── Rate Limiting (express-rate-limit)                                     │
│  ├── CORS Configuration (cors middleware)                                   │
│  └── Security Headers (Helmet)                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 9. Performance Optimization Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PERFORMANCE OPTIMIZATION                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Caching Strategy                                                           │
│  ├── Redis Cache Layer                                                      │
│  │   ├── Caching of expensive calculations (chart generation)               │
│  │   ├── Session storage (if applicable)                                    │
│  │   └── Caching API responses for identical requests                       │
│  ├── In-Memory Cache (Node.js)                                              │
│  │   ├── Caching configuration data                                         │
│  │   └── Caching ephemeris data pointers                                    │
│  └── CDN for Frontend Assets (e.g., Cloudflare, AWS CloudFront)             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Database Optimization (MongoDB)                                            │
│  ├── Indexing on frequently queried fields (e.g., `userId`, `email`)        │
│  ├── Query optimization and projection                                      │
│  ├── Connection Pooling (managed by Mongoose)                               │
│  └── Read Replicas for scaling read operations                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Application Optimization                                                   │
│  ├── Asynchronous operations for all I/O tasks (DB, file system)            │
│  ├── Use of Node.js cluster module for multi-core processing                │
│  └── Code Splitting and Lazy Loading on the frontend                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 10. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEPLOYMENT ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Production Environment (e.g., AWS, GCP, Vercel)                            │
│  ├── Load Balancer (e.g., Nginx, ELB)                                       │
│  ├── Application Servers (Node.js in Docker containers)                     │
│  ├── Database Cluster (MongoDB Atlas, self-hosted replica set)              │
│  ├── Cache Layer (Redis ElastiCache, Upstash)                               │
│  ├── File Storage (AWS S3 for reports/assets)                               │
│  └── CDN (CloudFront/Cloudflare)                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Development Environment                                                    │
│  ├── `nodemon` for local development with hot-reloading                     │
│  ├── Docker Compose for containerized services (DB, Redis)                  │
│  ├── Local MongoDB instance                                                 │
│  └── Local file system for ephemeris data                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  CI/CD Pipeline (e.g., GitHub Actions, Jenkins)                             │
│  ├── Git Repository (GitHub, GitLab)                                        │
│  ├── Automated Testing (Jest, Cypress) on each push/PR                      │
│  ├── Linting and Code Formatting checks                                     │
│  ├── Docker image build and push to registry                                │
│  └── Automated deployment to staging and production environments            │
└─────────────────────────────────────────────────────────────────────────────┘
```

This architecture provides a scalable, maintainable, and secure foundation for the expert-level Vedic astrology analysis system.
