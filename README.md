# Project Context
Last Updated: 2024-12-19T14:41:30Z

## Project Overview
- Name: Jyotish Shastra - Vedic Astrology Analysis System
- Purpose: Enterprise-grade birth chart generation and comprehensive analysis platform
- Stage: Production (100% verified implementation with 5,740+ lines of production-ready tests)

## Scope & Constraints
- In Scope: Birth chart generation, comprehensive analysis, API integration, UI testing
- Out of Scope: Mock/fake implementations, non-production code patterns, user authentication
- Critical Constraints: Production-only code, no duplication, Memory Bank protocol compliance

## Technology Stack
- Languages: JavaScript (Node.js 18+), React 18+, HTML5, CSS3
- Frameworks: Express.js 4.18+, React Router, Puppeteer (testing)
- Dependencies: Swiss Ephemeris (astronomical calculations), Axios (HTTP), Tailwind CSS
- Development Environment: macOS 24.6.0, Node.js, npm, Cursor IDE

## Quality Standards
- Code Style: ESLint, Prettier, JSDoc documentation
- Testing Requirements: 3-category structure (Unit/Integration/E2E), 100% production code
- Performance Targets: <3s page load, <5s API response, <8s chart rendering

## Active Protocols
- Memory Bank Protocol: .cursor/memory-bank/memory-bank-protocols.md
- Directory Management: .cursor/rules/001-directory-management-protocols.mdc
- Error Fixing: .cursor/rules/002-error-fixing-protocols.mdc
