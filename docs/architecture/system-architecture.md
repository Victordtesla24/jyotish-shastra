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
│  ├── LagnaAnalysisService                                                   │
│  ├── HouseAnalysisService                                                   │
│  ├── AspectAnalysisService                                                  │
│  ├── ArudhaAnalysisService                                                  │
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
│  ├── PostgreSQL/MongoDB (User Data & Charts)                                │
│  ├── Redis (Calculation Cache)                                              │
│  └── File System (Ephemeris Data)                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Data Flow Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Birth     │    │   Chart     │    │  Analysis   │    │   Report    │
│   Data      │───▶│ Generation  │───▶│   Engine    │───▶│ Generation  │
│  Collection │    │   Engine    │    │             │    │   Engine    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Validation  │    │ Swiss       │    │ Rule        │    │ Template    │
│ & Storage   │    │ Ephemeris   │    │ Engine      │    │ Engine      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Database    │    │ Calculations│    │ Analysis    │    │ PDF/HTML    │
│ (User Data) │    │ (Planetary  │    │ Results     │    │ Output      │
│             │    │ Positions)  │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
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
│  │   ├── generateRasiChart(birthData)                                       │
│  │   ├── generateNavamsaChart(birthData)                                    │
│  │   ├── calculateAscendant(birthData)                                      │
│  │   └── getPlanetaryPositions(birthData)                                   │
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
│  │   ├── analyzeAspectEffects(aspectingPlanet, aspectedHouse)               │
│  │   └── detectMutualAspects(chart)                                         │
│  ├── ArudhaAnalysisService                                                  │
│  │   ├── calculateArudhaLagna(lagna, lagnaLord)                             │
│  │   └── analyzeArudhaInfluence(arudhaSign)                                 │
│  ├── NavamsaAnalysisService                                                 │
│  │   ├── generateNavamsaChart(birthData)                                    │
│  │   ├── comparePlanetaryStrength(d1Chart, d9Chart)                         │
│  │   └── analyzeMarriageIndications(d9Chart)                                │
│  ├── DashaAnalysisService                                                   │
│  │   ├── calculateVimshottariDasha(birthData)                               │
│  │   ├── determineCurrentDasha(birthData, currentDate)                      │
│  │   └── generateDashaTimeline(birthData)                                   │
│  └── ReportGenerationService                                                │
│      ├── generatePersonalityProfile(analysis)                               │
│      ├── generateHealthAnalysis(analysis)                                   │
│      ├── generateCareerAnalysis(analysis)                                   │
│      ├── generateFinancialAnalysis(analysis)                                │
│      ├── generateRelationshipAnalysis(analysis)                             │
│      └── generateLifePredictions(analysis)                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4. Database Schema Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Users Collection/Table                                                     │
│  ├── _id (Primary Key)                                                      │
│  ├── email (Unique)                                                         │
│  ├── password (Hashed)                                                      │
│  ├── name                                                                   │
│  ├── createdAt                                                              │
│  └── updatedAt                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Charts Collection/Table                                                    │
│  ├── _id (Primary Key)                                                      │
│  ├── userId (Foreign Key)                                                   │
│  ├── name                                                                   │
│  ├── birthData                                                              │
│  │   ├── dateOfBirth                                                        │
│  │   ├── timeOfBirth                                                        │
│  │   ├── placeOfBirth                                                       │
│  │   └── gender                                                             │
│  ├── rasiChart                                                              │
│  │   ├── ascendant                                                          │
│  │   ├── planetaryPositions                                                 │
│  │   └── housePositions                                                     │
│  ├── navamsaChart                                                           │
│  ├── analysis                                                               │
│  └── createdAt                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Reports Collection/Table                                                   │
│  ├── _id (Primary Key)                                                      │
│  ├── chartId (Foreign Key)                                                  │
│  ├── userId (Foreign Key)                                                   │
│  ├── reportType                                                             │
│  ├── content                                                                │
│  ├── generatedAt                                                            │
│  └── expiresAt                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5. Analysis Engine Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ANALYSIS ENGINE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Input: Birth Chart Data                                                    │
│  └── Planetary Positions, Houses, Aspects                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Analysis Pipeline                                                          │
│  ├── Phase 1: Basic Analysis                                                │
│  │   ├── Lagna Analysis                                                     │
│  │   ├── Luminary Analysis                                                  │
│  │   └── Planetary Dignity Analysis                                         │
│  ├── Phase 2: House Analysis                                                │
│  │   ├── House-by-House Examination                                         │
│  │   ├── House Lord Analysis                                                │
│  │   └── House Occupant Analysis                                            │
│  ├── Phase 3: Aspect Analysis                                               │
│  │   ├── Planetary Aspects                                                  │
│  │   ├── Special Aspects                                                    │
│  │   └── Mutual Aspects                                                     │
│  ├── Phase 4: Advanced Analysis                                             │
│  │   ├── Yoga Detection                                                     │
│  │   ├── Arudha Lagna                                                       │
│  │   └── Navamsa Analysis                                                   │
│  └── Phase 5: Timing Analysis                                               │
│      ├── Dasha Calculations                                                 │
│      ├── Antardasha Calculations                                            │
│      └── Transit Analysis                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Output: Comprehensive Analysis Results                                     │
│  └── Structured data for report generation                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 6. Swiss Ephemeris Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SWISS EPHEMERIS INTEGRATION                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Node.js Swiss Ephemeris Wrapper                                            │
│  ├── Planetary Position Calculations                                        │
│  │   ├── Sun, Moon, Mercury, Venus, Mars                                    │
│  │   ├── Jupiter, Saturn, Rahu, Ketu                                        │
│  │   └── Retrograde and Combust Detection                                   │
│  ├── Ascendant Calculations                                                 │
│  │   ├── Sidereal Time Calculation                                          │
│  │   ├── Ayanamsa Adjustment                                                │
│  │   └── House Cusp Calculations                                            │
│  ├── Nakshatra Calculations                                                 │
│  │   ├── Lunar Position in Nakshatra                                        │
│  │   ├── Nakshatra Lord Determination                                       │
│  │   └── Pada Calculations                                                  │
│  └── Divisional Chart Calculations                                          │
│      ├── Navamsa (D9)                                                       │
│      ├── Saptamsa (D7)                                                      │
│      └── Dashamsa (D10)                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Ephemeris Data Management                                                  │
│  ├── Local Ephemeris Files                                                  │
│  ├── Data Validation                                                        │
│  └── Cache Management                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 7. Report Generation Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REPORT GENERATION                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Analysis Data Input                                                        │
│  ├── Lagna Analysis Results                                                 │
│  ├── House Analysis Results                                                 │
│  ├── Aspect Analysis Results                                                │
│  ├── Dasha Analysis Results                                                 │
│  └── Advanced Analysis Results                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Report Generation Pipeline                                                 │
│  ├── Template Engine                                                        │
│  │   ├── Personality Profile Template                                       │
│  │   ├── Health Analysis Template                                           │
│  │   ├── Career Analysis Template                                           │
│  │   ├── Financial Analysis Template                                        │
│  │   ├── Relationship Analysis Template                                     │
│  │   └── Life Predictions Template                                          │
│  ├── Content Synthesis                                                      │
│  │   ├── Data Aggregation                                                   │
│  │   ├── Content Prioritization                                             │
│  │   └── Consistency Checking                                               │
│  └── Output Generation                                                      │
│      ├── HTML Report                                                        │
│      ├── PDF Report                                                         │
│      └── JSON API Response                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 8. Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYERS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  Application Security                                                       │
│  ├── Input Validation & Sanitization                                        │
│  ├── SQL Injection Prevention                                               │
│  ├── XSS Protection                                                         │
│  └── CSRF Protection                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Authentication & Authorization                                             │
│  ├── JWT Token Management                                                   │
│  ├── Password Hashing (bcrypt)                                              │
│  ├── Role-Based Access Control                                              │
│  └── Session Management                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Infrastructure Security                                                    │
│  ├── HTTPS/TLS Encryption                                                   │
│  ├── Rate Limiting                                                          │
│  ├── CORS Configuration                                                     │
│  └── Security Headers                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 9. Performance Optimization Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PERFORMANCE OPTIMIZATION                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Caching Strategy                                                           │
│  ├── Redis Cache Layer                                                      │
│  │   ├── Chart Calculation Results                                          │
│  │   ├── Analysis Results                                                   │
│  │   └── Report Templates                                                   │
│  ├── Memory Cache                                                           │
│  │   ├── Configuration Data                                                 │
│  │   └── Frequently Used Calculations                                       │
│  └── CDN for Static Assets                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Database Optimization                                                      │
│  ├── Indexing Strategy                                                      │
│  ├── Query Optimization                                                     │
│  ├── Connection Pooling                                                     │
│  └── Read Replicas                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Application Optimization                                                   │
│  ├── Async Processing                                                       │
│  ├── Batch Processing                                                       │
│  ├── Lazy Loading                                                           │
│  └── Code Splitting                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 10. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEPLOYMENT ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Production Environment                                                     │
│  ├── Load Balancer (Nginx)                                                  │
│  ├── Application Servers (Node.js)                                          │
│  ├── Database Cluster (PostgreSQL/MongoDB)                                  │
│  ├── Cache Layer (Redis)                                                    │
│  ├── File Storage (AWS S3/Google Cloud Storage)                             │
│  └── CDN (CloudFront/Cloud CDN)                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Development Environment                                                    │
│  ├── Local Development Server                                               │
│  ├── Docker Containers                                                      │
│  ├── Local Database                                                         │
│  └── Hot Reloading                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  CI/CD Pipeline                                                             │
│  ├── Code Repository (Git)                                                  │
│  ├── Automated Testing                                                      │
│  ├── Build Process                                                          │
│  └── Deployment Automation                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation Guidelines

### Phase 1: Core Infrastructure
1. Set up Swiss Ephemeris integration
2. Implement basic chart generation
3. Create database schema
4. Set up authentication system

### Phase 2: Analysis Services
1. Implement Lagna analysis service
2. Implement house analysis service
3. Implement aspect analysis service
4. Implement dasha calculation service

### Phase 3: Advanced Features
1. Implement Navamsa analysis
2. Implement Arudha Lagna analysis
3. Implement yoga detection
4. Implement comprehensive report generation

### Phase 4: Optimization
1. Implement caching strategy
2. Optimize database queries
3. Implement performance monitoring
4. Set up production deployment

This architecture provides a scalable, maintainable, and secure foundation for the expert-level Vedic astrology analysis system.
