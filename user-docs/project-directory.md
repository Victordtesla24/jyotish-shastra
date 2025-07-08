# Jyotish Shastra - Project Directory Structure

Generated on: $(date)

## Directory Organization

```
.
|-- client                    # 🎨 Frontend Implementation Directory (React, UI, API consumption)
|   |-- .env.local
|   |-- package-lock.json
|   |-- package.json
|   |-- postcss.config.js
|   |-- src                       # ⚙️  Backend Implementation Directory (Node.js, APIs, business logic)
|   |   |-- __mocks__
|   |   |   `-- framer-motion.js
|   |   |-- App.js
|   |   |-- components
|   |   |   |-- animations
|   |   |   |   `-- VedicAnimations.jsx
|   |   |   |-- BirthDataAnalysis.js
|   |   |   |-- charts
|   |   |   |   |-- ChartComparison.js
|   |   |   |   |-- ChartDisplay.js
|   |   |   |   |-- InteractiveVedicChart.jsx
|   |   |   |   |-- NavamsaChart.js
|   |   |   |   |-- RasiChart.js
|   |   |   |   |-- VedicChartDisplay.jsx
|   |   |   |   `-- VedicRechartsWrapper.jsx
|   |   |   |-- common
|   |   |   |   |-- ErrorMessage.js
|   |   |   |   |-- GenericDataRenderer.jsx
|   |   |   |   |-- GenericDataRenderer.test.jsx
|   |   |   |   `-- LoadingSpinner.js
|   |   |   |-- enhanced
|   |   |   |   |-- HeroSection.jsx
|   |   |   |   `-- MobileOptimizedChart.jsx
|   |   |   |-- Footer.js
|   |   |   |-- forms
|   |   |   |   |-- AnalysisSelector.js
|   |   |   |   |-- BirthDataForm.js
|   |   |   |   `-- BirthDataForm.test.js
|   |   |   |-- Header.js
|   |   |   |-- interactive
|   |   |   |   |-- BirthChartWizard.jsx
|   |   |   |   |-- CompatibilityChecker.jsx
|   |   |   |   |-- DailyHoroscopeWidget.jsx
|   |   |   |   |-- DashaCalculator.jsx
|   |   |   |   `-- ZodiacWheel.jsx
|   |   |   |-- patterns
|   |   |   |   `-- SacredGeometry.jsx
|   |   |   |-- reports
|   |   |   |   |-- BasicAnalysisDisplay.js
|   |   |   |   |-- ComprehensiveAnalysisDisplay.js
|   |   |   |   |-- EnhancedPersonalityProfile.jsx
|   |   |   |   |-- EnhancedPersonalityProfile.test.jsx
|   |   |   |   |-- PersonalityProfile.css
|   |   |   |   |-- PersonalityProfile.js
|   |   |   |   `-- sections
|   |   |   |       |-- ArudhaLagnaSection.jsx
|   |   |   |       |-- HouseAnalysisSection.jsx
|   |   |   |       |-- LagnaLuminariesSection.jsx
|   |   |   |       |-- NavamsaAnalysisSection.jsx
|   |   |   |       |-- PlanetaryAspectsSection.jsx
|   |   |   |       `-- SynthesisSection.jsx
|   |   |   `-- ui
|   |   |       |-- buttons
|   |   |       |   `-- Button.jsx
|   |   |       |-- cards
|   |   |       |   `-- Card.jsx
|   |   |       |-- index.js
|   |   |       |-- inputs
|   |   |       |   |-- Input.jsx
|   |   |       |   `-- Select.jsx
|   |   |       |-- loading
|   |   |       |   |-- Skeleton.jsx
|   |   |       |   `-- VedicLoadingSpinner.jsx
|   |   |       |-- modals
|   |   |       |   `-- Modal.jsx
|   |   |       |-- ThemeToggle.jsx
|   |   |       |-- typography
|   |   |       |   `-- VedicTypography.jsx
|   |   |       |-- VedicIcons.js
|   |   |       `-- VedicIcons.jsx
|   |   |-- contexts
|   |   |   `-- ThemeContext.js
|   |   |-- hooks
|   |   |   |-- useAnalysisResults.js
|   |   |   |-- useChartData.js
|   |   |   |-- useChartGeneration.js
|   |   |   |-- useCountUp.js
|   |   |   `-- usePWA.js
|   |   |-- index.css
|   |   |-- index.js
|   |   |-- lib
|   |   |   `-- utils.js
|   |   |-- pages
|   |   |   |-- AnalysisPage.js
|   |   |   |-- ChartPage.js
|   |   |   |-- EnhancedAnalysisPage.jsx
|   |   |   |-- HomePage.js
|   |   |   |-- KundliGeometryTest.jsx
|   |   |   |-- PersonalityAnalysisPage.jsx
|   |   |   |-- RashiDetailPage.css
|   |   |   |-- RashiDetailPage.js
|   |   |   |-- ReportPage.js
|   |   |   `-- vedic-details
|   |   |       `-- MeshaPage.js
|   |   |-- services
|   |   |   |-- analysisService.js
|   |   |   |-- chartService.js
|   |   |   `-- geocodingService.js
|   |   |-- setupTests.js
|   |   |-- styles
|   |   |   |-- vedic-chart-enhancements.css
|   |   |   `-- vedic-design-system.css
|   |   `-- utils
|   |       |-- chartDataManager.js
|   |       |-- dateUtils.js
|   |       |-- errorLogger.js
|   |       |-- performance.js
|   |       `-- polyfills.js
|   `-- tailwind.config.js
|-- package-lock.json
|-- package.json
|-- scripts                   # 🔧 Utility Scripts Directory
|   |-- count-directory-files-by-filetypes.sh
|   |-- duplicate-detector.js
|   |-- fake-code-detection-system.sh
|   |-- github-restore-script.sh
|   |-- README-duplicate-detector.md
|   |-- setup.sh
|   `-- test-chart-flow.sh
|-- src                       # ⚙️  Backend Implementation Directory (Node.js, APIs, business logic)
|   |-- api
|   |   |-- controllers
|   |   |   |-- ChartController.js
|   |   |   `-- GeocodingController.js
|   |   |-- middleware
|   |   |   |-- authentication.js
|   |   |   |-- cors.js
|   |   |   |-- errorHandling.js
|   |   |   |-- logging.js
|   |   |   |-- rateLimiting.js
|   |   |   `-- validation.js
|   |   |-- routes
|   |   |   |-- chart.js
|   |   |   |-- clientErrorLog.js
|   |   |   |-- comprehensiveAnalysis.js
|   |   |   |-- geocoding.js
|   |   |   `-- index.js
|   |   `-- validators
|   |       `-- birthDataValidator.js
|   |-- config
|   |   `-- astro-config.js
|   |-- core
|   |   |-- analysis
|   |   |   |-- accuracy
|   |   |   |   `-- PredictiveAccuracyScorer.js
|   |   |   |-- aspects
|   |   |   |   `-- AspectAnalysisService.js
|   |   |   |-- dashas
|   |   |   |   |-- AntardashaCalculator.js
|   |   |   |   |-- DashaEventTimingEngine.js
|   |   |   |   `-- PratyanardashaCalculator.js
|   |   |   |-- divisional
|   |   |   |   |-- DashamsaAnalyzer.js
|   |   |   |   |-- DivisionalStrengthCalculator.js
|   |   |   |   |-- DwadasamsaAnalyzer.js
|   |   |   |   |-- NavamsaAnalysisService.js
|   |   |   |   |-- NavamsaAnalyzer.js
|   |   |   |   |-- SaptamsaAnalyzer.js
|   |   |   |   `-- VargottamaDetector.js
|   |   |   |-- houses
|   |   |   |   |-- DetailedHouseAnalyzer.js
|   |   |   |   |-- HouseAnalysisService.js
|   |   |   |   `-- TwelveHouseAnalyzer.js
|   |   |   |-- integration
|   |   |   |   `-- TransitDashaIntegrator.js
|   |   |   |-- lagna
|   |   |   |   |-- ExaltationDebilityAnalyzer.js
|   |   |   |   |-- FunctionalNatureDeterminer.js
|   |   |   |   |-- HouseClusteringAnalyzer.js
|   |   |   |   |-- LagnaLordAnalyzer.js
|   |   |   |   |-- LagnaStrengthCalculator.js
|   |   |   |   `-- StelliumDetector.js
|   |   |   |-- timing
|   |   |   |   |-- TimingPrecisionEnhancer.js
|   |   |   |   `-- TransitEventPredictor.js
|   |   |   |-- verification
|   |   |   |   `-- ChartVerificationEngine.js
|   |   |   `-- yogas
|   |   |       |-- DhanaYogaCalculator.js
|   |   |       |-- GajaKesariYogaCalculator.js
|   |   |       |-- NeechaBhangaYogaCalculator.js
|   |   |       |-- PanchMahapurushaYogaCalculator.js
|   |   |       |-- RajaYogaCalculator.js
|   |   |       `-- ViparitaRajaYogaCalculator.js
|   |   |-- calculations
|   |   |   |-- aspects
|   |   |   |   |-- AspectStrengthCalculator.js
|   |   |   |   `-- GrahaDrishtiCalculator.js
|   |   |   |-- chart-casting
|   |   |   |   `-- AscendantCalculator.js
|   |   |   |-- houses
|   |   |   |   `-- HouseLordCalculator.js
|   |   |   |-- planetary
|   |   |   |   |-- ExaltationDebilitationCalculator.js
|   |   |   |   `-- PlanetaryStrengthCalculator.js
|   |   |   `-- transits
|   |   |       |-- SadeSatiCalculator.js
|   |   |       `-- TransitCalculator.js
|   |   `-- reports
|   |       |-- formatters
|   |       |   |-- CareerFormatter.js
|   |       |   |-- FinancialFormatter.js
|   |       |   |-- HealthFormatter.js
|   |       |   |-- LifePredictionFormatter.js
|   |       |   |-- PersonalityFormatter.js
|   |       |   `-- RelationshipFormatter.js
|   |       |-- synthesis
|   |       |   |-- AnalysisSynthesizer.js
|   |       |   |-- ContradictionResolver.js
|   |       |   |-- PriorityRanker.js
|   |       |   |-- QualityAssuranceEngine.js
|   |       |   |-- ReportSynthesisEngine.js
|   |       |   `-- TimelineIntegrator.js
|   |       `-- templates
|   |           |-- CareerTemplate.js
|   |           |-- FinancialTemplate.js
|   |           |-- HealthTemplate.js
|   |           |-- LifePredictionTemplate.js
|   |           |-- PersonalityTemplate.js
|   |           `-- RelationshipTemplate.js
|   |-- data
|   |   |-- migrations
|   |   |   `-- 001_create_users_table.js
|   |   |-- models
|   |   |   |-- Analysis.js
|   |   |   |-- Chart.js
|   |   |   |-- EphemerisData.js
|   |   |   |-- Report.js
|   |   |   `-- User.js
|   |   `-- repositories
|   |       |-- ActivityLogRepository.js
|   |       |-- ChartRepository.js
|   |       `-- UserRepository.js
|   |-- index.js
|   |-- services
|   |   |-- analysis
|   |   |   |-- ArudhaAnalysisService.js
|   |   |   |-- BirthDataAnalysisService.js
|   |   |   |-- DetailedDashaAnalysisService.js
|   |   |   |-- LagnaAnalysisService.js
|   |   |   |-- LuminariesAnalysisService.js
|   |   |   |-- MasterAnalysisOrchestrator.js
|   |   |   `-- YogaDetectionService.js
|   |   |-- chart
|   |   |   `-- ChartGenerationService.js
|   |   |-- geocoding
|   |   |   `-- GeocodingService.js
|   |   |-- report
|   |   |   `-- ComprehensiveReportService.js
|   |   |-- reportService.js
|   |   `-- user
|   |       |-- index.js
|   |       |-- UserAuthenticationService.js
|   |       |-- UserChartService.js
|   |       |-- UserProfileService.js
|   |       `-- UserReportService.js
|   `-- utils
|       |-- constants
|       |   `-- astronomicalConstants.js
|       `-- helpers
|           |-- astrologyHelpers.js
|           |-- dateTimeHelpers.js
|           `-- performanceMonitoring.js
|-- tests                     # 🧪 Test Suite Directory
|   |-- e2e
|   |   `-- api_workflow.test.js
|   |-- integration
|   |   |-- api
|   |   |   |-- analysis_api.test.js
|   |   |   |-- analysis.validation.test.js
|   |   |   |-- chart_api.test.js
|   |   |   `-- validation_standardization.test.js
|   |   `-- services
|   |       `-- master_orchestrator.test.js
|   |-- setup.js
|   |-- system
|   |   |-- chart_and_analysis_pipeline.test.js
|   |   `-- report_generation.test.js
|   |-- test-data
|   |   |-- api_response_structure.json
|   |   |-- comprehensive_analysis_response.json
|   |   |-- generate_chart_api_response_data.json
|   |   |-- pdf-reference-data.json
|   |   |-- sample-birth-data.json
|   |   |-- sample-chart-data.js
|   |   `-- system-comprehensive-output.json
|   |-- unit
|   |   |-- api
|   |   |   |-- ChartController.test.js
|   |   |   `-- ComprehensiveAnalysisController.test.js
|   |   |-- calculations
|   |   |   |-- AscendantCalculator.test.js
|   |   |   |-- aspects
|   |   |   |   `-- GrahaDrishtiCalculator.test.js
|   |   |   |-- ExaltationDebilitationCalculator.test.js
|   |   |   |-- HouseLordCalculator.test.js
|   |   |   |-- TransitCalculator.test.js
|   |   |   `-- transits
|   |   |       `-- SadeSatiCalculator.test.js
|   |   |-- core
|   |   |   `-- analysis
|   |   |       |-- aspects
|   |   |       |   `-- AspectAnalysisService.test.js
|   |   |       |-- dashas
|   |   |       |   `-- DashaAnalysisService.test.js
|   |   |       |-- divisional
|   |   |       |   |-- NavamsaAnalysisService.test.js
|   |   |       |   `-- VargottamaDetector.test.js
|   |   |       |-- houses
|   |   |       |   `-- HouseAnalysisService.test.js
|   |   |       |-- lagna
|   |   |       |   `-- LagnaAnalysisService.test.js
|   |   |       `-- yogas
|   |   |           |-- DhanaYogaCalculator.test.js
|   |   |           |-- GajaKesariYogaCalculator.test.js
|   |   |           |-- NeechaBhangaYogaCalculator.test.js
|   |   |           |-- PanchMahapurushaYogaCalculator.test.js
|   |   |           |-- RajaYogaCalculator.test.js
|   |   |           |-- ViparitaRajaYogaCalculator.test.js
|   |   |           `-- YogaDetectionService.test.js
|   |   |-- LagnaLordAnalyzer.test.js
|   |   |-- PlanetaryStrengthCalculator.test.js
|   |   |-- reports
|   |   |   `-- synthesis
|   |   |       `-- AnalysisSynthesizer.test.js
|   |   `-- services
|   |       |-- analysis
|   |       |   |-- ArudhaAnalysisService.test.js
|   |       |   |-- BirthDataAnalysisService.test.js
|   |       |   |-- DetailedDashaAnalysisService.test.js
|   |       |   `-- LuminariesAnalysisService.test.js
|   |       |-- ChartGenerationService.test.js
|   |       |-- ComprehensiveReportService.test.js
|   |       `-- geocoding
|   |           `-- GeocodingService.test.js
|   `-- utils
|       |-- test-chart-generation.js
|       |-- TestChartFactory.js
|       `-- validation-test.js
`-- user-docs                 # 📚 Documentation Directory
    |-- api-response-mapping.md
    |-- chart-generation-requirements.md
    |-- cURL-data-testing.md
    |-- current-ui-state-assessment.md
    |-- error-trail-analysis.md
    |-- geocode-generation-requirements.md
    |-- identified-requirements-gaps.md
    |-- implementation-plan-integration.md
    |-- implementation-plan-UI.md
    |-- kundli-for-testing.pdf
    |-- project-directory.md
    |-- prompts.md
    |-- requirements-analysis-questions.md
    |-- updated-implementation-prompt.md
    `-- vedic-kundli-birth-chart-template.png

99 directories, 263 files
```

## Key Directory Descriptions

- **client/**: Frontend React application with UI components and API consumption
- **src/**: Backend Node.js implementation with APIs and business logic
- **tests/**: Comprehensive test suite including unit, integration, and e2e tests
- **scripts/**: Utility scripts for development and deployment
- **user-docs/**: Project documentation and guides
