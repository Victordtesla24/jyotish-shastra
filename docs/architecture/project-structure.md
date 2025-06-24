# Project Structure & Architecture

## Overview

The Jyotish Shastra project follows a modular, scalable architecture designed to support the comprehensive Vedic astrology analysis workflow outlined in the requirements document.

## Directory Structure

### Root Level
```
jyotish-shastra/
├── docs/                    # Project documentation
├── src/                     # Backend source code
├── client/                  # Frontend React application
├── tests/                   # Test suites
├── scripts/                 # Build and deployment scripts
├── package.json            # Backend dependencies
├── README.md               # Project overview
└── .env                    # Environment configuration
```

### Backend Architecture (`src/`)

#### API Layer (`src/api/`)
- **controllers/**: HTTP request handlers for different endpoints
- **middleware/**: Authentication, validation, logging middleware
- **routes/**: Route definitions and API organization
- **validators/**: Input validation schemas using Joi

#### Core Logic (`src/core/`)
- **calculations/**: Astronomical and astrological calculations
  - `chart-casting/`: Birth chart generation logic
  - `planetary/`: Planetary position calculations
  - `houses/`: House cusp calculations
  - `aspects/`: Planetary aspect calculations
- **analysis/**: Astrological interpretation logic
  - `lagna/`: Ascendant analysis
  - `houses/`: House-by-house analysis
  - `yogas/`: Yoga detection and interpretation
  - `dashas/`: Dasha timeline calculations
  - `divisional/`: Navamsa and other divisional charts
- **reports/**: Report generation and formatting
  - `synthesis/`: Analysis synthesis logic
  - `templates/`: Report templates
  - `formatters/`: Output formatting utilities

#### Data Layer (`src/data/`)
- **models/**: Data models and schemas
- **repositories/**: Data access layer
- **migrations/**: Database migration scripts

#### Services (`src/services/`)
- **chart/**: Chart-related business logic
- **analysis/**: Analysis orchestration services
- **user/**: User management services
- **report/**: Report generation services

#### Utilities (`src/utils/`)
- **constants/**: Astrological constants and configurations
- **helpers/**: Shared utility functions
- **validators/**: Common validation utilities

#### Configuration (`src/config/`)
- **astro-config.js**: Astrological constants and settings
- **database.js**: Database configuration
- **server.js**: Server configuration

### Frontend Architecture (`client/`)

#### Public Assets (`client/public/`)
- Static files, images, and HTML template

#### Source Code (`client/src/`)
- **components/**: Reusable UI components
  - `charts/`: Chart visualization components
  - `forms/`: Input form components
  - `reports/`: Report display components
- **pages/**: Page-level components
- **services/**: API client services
- **hooks/**: Custom React hooks
- **utils/**: Client-side utilities

## Architecture Principles

### 1. Separation of Concerns
- **API Layer**: Handles HTTP requests/responses
- **Core Logic**: Pure astrological calculations
- **Services**: Business logic orchestration
- **Data Layer**: Data persistence and access

### 2. Modularity
- Each directory has a single, clear responsibility
- Easy to test, maintain, and extend
- Clear interfaces between modules

### 3. Scalability
- Horizontal scaling through stateless services
- Caching strategies for expensive calculations
- Database optimization for large datasets

### 4. Maintainability
- Consistent coding standards
- Comprehensive testing
- Clear documentation
- Error handling and logging

## Data Flow

### Chart Generation Flow
1. **Input Validation** (`src/api/validators/`)
2. **Chart Calculation** (`src/core/calculations/`)
3. **Analysis Processing** (`src/core/analysis/`)
4. **Report Generation** (`src/core/reports/`)
5. **Response Formatting** (`src/api/controllers/`)

### Analysis Workflow
1. **Birth Data** → Chart Casting
2. **Chart Data** → House Analysis
3. **House Data** → Yoga Detection
4. **Yoga Data** → Dasha Calculation
5. **All Data** → Report Synthesis

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Validation**: Joi
- **Astronomy**: Swiss Ephemeris
- **Testing**: Jest
- **Linting**: ESLint

### Frontend
- **Framework**: React 18
- **Routing**: React Router
- **State Management**: React Query
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Testing**: React Testing Library

### Development Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Code Quality**: ESLint, Prettier
- **Documentation**: Markdown

## Configuration Management

### Environment Variables
- **Development**: `.env` file
- **Production**: Environment variables
- **Testing**: Separate test configuration

### Astrological Settings
- **Ayanamsa**: Lahiri (23.85°)
- **House System**: Placidus
- **Dasha System**: Vimshottari
- **Aspects**: Parashari system

## Security Considerations

### API Security
- **Authentication**: JWT tokens
- **Authorization**: Role-based access
- **Input Validation**: Comprehensive validation
- **Rate Limiting**: API rate limiting
- **CORS**: Configured for frontend

### Data Security
- **Encryption**: Sensitive data encryption
- **Validation**: Input sanitization
- **Logging**: Security event logging
- **Monitoring**: Security monitoring

## Performance Optimization

### Caching Strategy
- **Chart Calculations**: Redis caching
- **Report Generation**: File-based caching
- **API Responses**: Response caching

### Database Optimization
- **Indexing**: Strategic database indexing
- **Query Optimization**: Efficient queries
- **Connection Pooling**: Database connection management

## Testing Strategy

### Test Types
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **End-to-End Tests**: Full workflow testing

### Test Coverage
- **Core Logic**: 90%+ coverage
- **API Endpoints**: 100% coverage
- **Critical Paths**: Full coverage

## Deployment Strategy

### Development
- **Local Development**: Docker Compose
- **Hot Reloading**: Nodemon for backend
- **Frontend**: React development server

### Production
- **Containerization**: Docker
- **Orchestration**: Kubernetes (optional)
- **CI/CD**: GitHub Actions
- **Monitoring**: Application monitoring

## Future Considerations

### Scalability
- **Microservices**: Potential service decomposition
- **Event-Driven**: Event sourcing for analysis
- **Caching**: Distributed caching
- **Load Balancing**: Horizontal scaling

### Features
- **Real-time**: WebSocket support
- **Mobile**: React Native app
- **AI Integration**: Machine learning for predictions
- **Multi-language**: Internationalization support

This architecture provides a solid foundation for building a comprehensive Vedic astrology analysis system while maintaining flexibility for future enhancements and scalability requirements.
