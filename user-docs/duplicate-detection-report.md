# Duplicate Detection Report

**Generated:** 2025-07-01T17:24:55.216Z  
**Project:** Jyotish Shastra  
**Scanned Directories:** src, client/src  

## Executive Summary

| Metric | Count |
|--------|-------|
| Files Scanned | 175 |
| Exact Duplicates | 0 |
| Functional Duplicates | 0 |
| Similar Files | 136 |
| Mock Code Files | 5 |
| Placeholder Code Files | 7 |
| Non-Production Code Files | 48 |

---

## 🟢 Exact Duplicates

✅ **No exact duplicates found.**

---

## 🟢 Functional Duplicates

✅ **No functional duplicates found.**

---

## 🟠 Similar Files (Naming Patterns)

Found **14** groups of similar files affecting **136** files.

### Pattern: `*Controller`

| File Path | Relative Path |
|-----------|---------------|
| `/workspace/src/api/controllers/ChartController.js` | `src/api/controllers/ChartController.js` |
| `/workspace/src/api/controllers/GeocodingController.js` | `src/api/controllers/GeocodingController.js` |

### Pattern: `error*`

| File Path | Relative Path |
|-----------|---------------|
| `/workspace/src/api/middleware/errorHandling.js` | `src/api/middleware/errorHandling.js` |
| `/workspace/client/src/utils/errorLogger.js` | `client/src/utils/errorLogger.js` |

### Pattern: `*Analysis`

| File Path | Relative Path |
|-----------|---------------|
| `/workspace/src/api/routes/comprehensiveAnalysis.js` | `src/api/routes/comprehensiveAnalysis.js` |
| `/workspace/client/src/components/BirthDataAnalysis.js` | `client/src/components/BirthDataAnalysis.js` |

### Pattern: `***`

| File Path | Relative Path |
|-----------|---------------|
| `/workspace/src/core/analysis/accuracy/PredictiveAccuracyScorer.js` | `src/core/analysis/accuracy/PredictiveAccuracyScorer.js` |
| `/workspace/src/core/analysis/integration/TransitDashaIntegrator.js` | `src/core/analysis/integration/TransitDashaIntegrator.js` |
| `/workspace/src/core/analysis/lagna/FunctionalNatureDeterminer.js` | `src/core/analysis/lagna/FunctionalNatureDeterminer.js` |
| `/workspace/src/core/analysis/timing/TimingPrecisionEnhancer.js` | `src/core/analysis/timing/TimingPrecisionEnhancer.js` |
| `/workspace/src/core/analysis/timing/TransitEventPredictor.js` | `src/core/analysis/timing/TransitEventPredictor.js` |
| `/workspace/src/core/analysis/verification/ChartVerificationEngine.js` | `src/core/analysis/verification/ChartVerificationEngine.js` |
| `/workspace/src/core/reports/synthesis/QualityAssuranceEngine.js` | `src/core/reports/synthesis/QualityAssuranceEngine.js` |
| `/workspace/src/core/reports/synthesis/ReportSynthesisEngine.js` | `src/core/reports/synthesis/ReportSynthesisEngine.js` |
| `/workspace/src/data/repositories/ActivityLogRepository.js` | `src/data/repositories/ActivityLogRepository.js` |
| `/workspace/src/services/analysis/MasterAnalysisOrchestrator.js` | `src/services/analysis/MasterAnalysisOrchestrator.js` |
| `/workspace/client/src/components/charts/VedicChartDisplay.jsx` | `client/src/components/charts/VedicChartDisplay.jsx` |
| `/workspace/client/src/components/charts/VedicRechartsWrapper.jsx` | `client/src/components/charts/VedicRechartsWrapper.jsx` |
| `/workspace/client/src/components/common/GenericDataRenderer.jsx` | `client/src/components/common/GenericDataRenderer.jsx` |
| `/workspace/client/src/components/forms/BirthDataForm.js` | `client/src/components/forms/BirthDataForm.js` |
| `/workspace/client/src/components/interactive/BirthChartWizard.jsx` | `client/src/components/interactive/BirthChartWizard.jsx` |
| `/workspace/client/src/components/interactive/DailyHoroscopeWidget.jsx` | `client/src/components/interactive/DailyHoroscopeWidget.jsx` |
| `/workspace/client/src/components/reports/BasicAnalysisDisplay.js` | `client/src/components/reports/BasicAnalysisDisplay.js` |
| `/workspace/client/src/components/reports/ComprehensiveAnalysisDisplay.js` | `client/src/components/reports/ComprehensiveAnalysisDisplay.js` |
| `/workspace/client/src/components/reports/EnhancedPersonalityProfile.jsx` | `client/src/components/reports/EnhancedPersonalityProfile.jsx` |
| `/workspace/client/src/components/reports/sections/ArudhaLagnaSection.jsx` | `client/src/components/reports/sections/ArudhaLagnaSection.jsx` |
| `/workspace/client/src/components/reports/sections/HouseAnalysisSection.jsx` | `client/src/components/reports/sections/HouseAnalysisSection.jsx` |
| `/workspace/client/src/components/reports/sections/LagnaLuminariesSection.jsx` | `client/src/components/reports/sections/LagnaLuminariesSection.jsx` |
| `/workspace/client/src/components/reports/sections/NavamsaAnalysisSection.jsx` | `client/src/components/reports/sections/NavamsaAnalysisSection.jsx` |
| `/workspace/client/src/components/reports/sections/PlanetaryAspectsSection.jsx` | `client/src/components/reports/sections/PlanetaryAspectsSection.jsx` |
| `/workspace/client/src/components/ui/loading/VedicLoadingSpinner.jsx` | `client/src/components/ui/loading/VedicLoadingSpinner.jsx` |
| `/workspace/client/src/pages/EnhancedAnalysisPage.jsx` | `client/src/pages/EnhancedAnalysisPage.jsx` |
| `/workspace/client/src/pages/PersonalityAnalysisPage.jsx` | `client/src/pages/PersonalityAnalysisPage.jsx` |
| `/workspace/client/src/pages/RashiDetailPage.css` | `client/src/pages/RashiDetailPage.css` |
| `/workspace/client/src/pages/RashiDetailPage.js` | `client/src/pages/RashiDetailPage.js` |

### Pattern: `*Service`

| File Path | Relative Path |
|-----------|---------------|
| `/workspace/src/core/analysis/aspects/AspectAnalysisService.js` | `src/core/analysis/aspects/AspectAnalysisService.js` |
| `/workspace/src/core/analysis/divisional/NavamsaAnalysisService.js` | `src/core/analysis/divisional/NavamsaAnalysisService.js` |
| `/workspace/src/core/analysis/houses/HouseAnalysisService.js` | `src/core/analysis/houses/HouseAnalysisService.js` |
| `/workspace/src/services/analysis/ArudhaAnalysisService.js` | `src/services/analysis/ArudhaAnalysisService.js` |
| `/workspace/src/services/analysis/BirthDataAnalysisService.js` | `src/services/analysis/BirthDataAnalysisService.js` |
| `/workspace/src/services/analysis/DetailedDashaAnalysisService.js` | `src/services/analysis/DetailedDashaAnalysisService.js` |
| `/workspace/src/services/analysis/LagnaAnalysisService.js` | `src/services/analysis/LagnaAnalysisService.js` |
| `/workspace/src/services/analysis/LuminariesAnalysisService.js` | `src/services/analysis/LuminariesAnalysisService.js` |
| `/workspace/src/services/analysis/YogaDetectionService.js` | `src/services/analysis/YogaDetectionService.js` |
| `/workspace/src/services/chart/ChartGenerationService.js` | `src/services/chart/ChartGenerationService.js` |
| `/workspace/src/services/geocoding/GeocodingService.js` | `src/services/geocoding/GeocodingService.js` |
| `/workspace/src/services/report/ComprehensiveReportService.js` | `src/services/report/ComprehensiveReportService.js` |
| `/workspace/src/services/reportService.js` | `src/services/reportService.js` |
| `/workspace/src/services/user/UserAuthenticationService.js` | `src/services/user/UserAuthenticationService.js` |
| `/workspace/src/services/user/UserChartService.js` | `src/services/user/UserChartService.js` |
| `/workspace/src/services/user/UserProfileService.js` | `src/services/user/UserProfileService.js` |
| `/workspace/src/services/user/UserReportService.js` | `src/services/user/UserReportService.js` |
| `/workspace/client/src/services/analysisService.js` | `client/src/services/analysisService.js` |
| `/workspace/client/src/services/chartService.js` | `client/src/services/chartService.js` |
| `/workspace/client/src/services/geocodingService.js` | `client/src/services/geocodingService.js` |

### Pattern: `*Calculator`

| File Path | Relative Path |
|-----------|---------------|
| `/workspace/src/core/analysis/dashas/AntardashaCalculator.js` | `src/core/analysis/dashas/AntardashaCalculator.js` |
| `/workspace/src/core/analysis/dashas/PratyanardashaCalculator.js` | `src/core/analysis/dashas/PratyanardashaCalculator.js` |
| `/workspace/src/core/analysis/divisional/DivisionalStrengthCalculator.js` | `src/core/analysis/divisional/DivisionalStrengthCalculator.js` |
| `/workspace/src/core/analysis/lagna/LagnaStrengthCalculator.js` | `src/core/analysis/lagna/LagnaStrengthCalculator.js` |
| `/workspace/src/core/analysis/yogas/DhanaYogaCalculator.js` | `src/core/analysis/yogas/DhanaYogaCalculator.js` |
| `/workspace/src/core/analysis/yogas/GajaKesariYogaCalculator.js` | `src/core/analysis/yogas/GajaKesariYogaCalculator.js` |
| `/workspace/src/core/analysis/yogas/NeechaBhangaYogaCalculator.js` | `src/core/analysis/yogas/NeechaBhangaYogaCalculator.js` |
| `/workspace/src/core/analysis/yogas/PanchMahapurushaYogaCalculator.js` | `src/core/analysis/yogas/PanchMahapurushaYogaCalculator.js` |
| `/workspace/src/core/analysis/yogas/RajaYogaCalculator.js` | `src/core/analysis/yogas/RajaYogaCalculator.js` |
| `/workspace/src/core/analysis/yogas/ViparitaRajaYogaCalculator.js` | `src/core/analysis/yogas/ViparitaRajaYogaCalculator.js` |
| `/workspace/src/core/calculations/aspects/AspectStrengthCalculator.js` | `src/core/calculations/aspects/AspectStrengthCalculator.js` |
| `/workspace/src/core/calculations/aspects/GrahaDrishtiCalculator.js` | `src/core/calculations/aspects/GrahaDrishtiCalculator.js` |
| `/workspace/src/core/calculations/chart-casting/AscendantCalculator.js` | `src/core/calculations/chart-casting/AscendantCalculator.js` |
| `/workspace/src/core/calculations/houses/HouseLordCalculator.js` | `src/core/calculations/houses/HouseLordCalculator.js` |
| `/workspace/src/core/calculations/planetary/ExaltationDebilitationCalculator.js` | `src/core/calculations/planetary/ExaltationDebilitationCalculator.js` |
| `/workspace/src/core/calculations/planetary/PlanetaryStrengthCalculator.js` | `src/core/calculations/planetary/PlanetaryStrengthCalculator.js` |
| `/workspace/src/core/calculations/transits/SadeSatiCalculator.js` | `src/core/calculations/transits/SadeSatiCalculator.js` |
| `/workspace/src/core/calculations/transits/TransitCalculator.js` | `src/core/calculations/transits/TransitCalculator.js` |
| `/workspace/client/src/components/interactive/DashaCalculator.jsx` | `client/src/components/interactive/DashaCalculator.jsx` |

### Pattern: `*Analyzer`

| File Path | Relative Path |
|-----------|---------------|
| `/workspace/src/core/analysis/divisional/DashamsaAnalyzer.js` | `src/core/analysis/divisional/DashamsaAnalyzer.js` |
| `/workspace/src/core/analysis/divisional/DwadasamsaAnalyzer.js` | `src/core/analysis/divisional/DwadasamsaAnalyzer.js` |
| `/workspace/src/core/analysis/divisional/NavamsaAnalyzer.js` | `src/core/analysis/divisional/NavamsaAnalyzer.js` |
| `/workspace/src/core/analysis/divisional/SaptamsaAnalyzer.js` | `src/core/analysis/divisional/SaptamsaAnalyzer.js` |
| `/workspace/src/core/analysis/houses/DetailedHouseAnalyzer.js` | `src/core/analysis/houses/DetailedHouseAnalyzer.js` |
| `/workspace/src/core/analysis/houses/TwelveHouseAnalyzer.js` | `src/core/analysis/houses/TwelveHouseAnalyzer.js` |
| `/workspace/src/core/analysis/lagna/ExaltationDebilityAnalyzer.js` | `src/core/analysis/lagna/ExaltationDebilityAnalyzer.js` |
| `/workspace/src/core/analysis/lagna/HouseClusteringAnalyzer.js` | `src/core/analysis/lagna/HouseClusteringAnalyzer.js` |
| `/workspace/src/core/analysis/lagna/LagnaLordAnalyzer.js` | `src/core/analysis/lagna/LagnaLordAnalyzer.js` |

### Pattern: `**`

| File Path | Relative Path |
|-----------|---------------|
| `/workspace/src/core/analysis/divisional/VargottamaDetector.js` | `src/core/analysis/divisional/VargottamaDetector.js` |
| `/workspace/src/core/analysis/lagna/StelliumDetector.js` | `src/core/analysis/lagna/StelliumDetector.js` |
| `/workspace/src/core/reports/synthesis/AnalysisSynthesizer.js` | `src/core/reports/synthesis/AnalysisSynthesizer.js` |
| `/workspace/src/core/reports/synthesis/ContradictionResolver.js` | `src/core/reports/synthesis/ContradictionResolver.js` |
| `/workspace/src/core/reports/synthesis/PriorityRanker.js` | `src/core/reports/synthesis/PriorityRanker.js` |
| `/workspace/src/core/reports/synthesis/TimelineIntegrator.js` | `src/core/reports/synthesis/TimelineIntegrator.js` |
| `/workspace/src/data/models/EphemerisData.js` | `src/data/models/EphemerisData.js` |
| `/workspace/src/data/repositories/ChartRepository.js` | `src/data/repositories/ChartRepository.js` |
| `/workspace/src/data/repositories/UserRepository.js` | `src/data/repositories/UserRepository.js` |
| `/workspace/client/src/components/animations/VedicAnimations.jsx` | `client/src/components/animations/VedicAnimations.jsx` |
| `/workspace/client/src/components/charts/ChartComparison.js` | `client/src/components/charts/ChartComparison.js` |
| `/workspace/client/src/components/charts/ChartDisplay.js` | `client/src/components/charts/ChartDisplay.js` |
| `/workspace/client/src/components/common/ErrorMessage.js` | `client/src/components/common/ErrorMessage.js` |
| `/workspace/client/src/components/common/LoadingSpinner.js` | `client/src/components/common/LoadingSpinner.js` |
| `/workspace/client/src/components/enhanced/HeroSection.jsx` | `client/src/components/enhanced/HeroSection.jsx` |
| `/workspace/client/src/components/forms/AnalysisSelector.js` | `client/src/components/forms/AnalysisSelector.js` |
| `/workspace/client/src/components/interactive/CompatibilityChecker.jsx` | `client/src/components/interactive/CompatibilityChecker.jsx` |
| `/workspace/client/src/components/interactive/ZodiacWheel.jsx` | `client/src/components/interactive/ZodiacWheel.jsx` |
| `/workspace/client/src/components/patterns/SacredGeometry.jsx` | `client/src/components/patterns/SacredGeometry.jsx` |
| `/workspace/client/src/components/reports/PersonalityProfile.css` | `client/src/components/reports/PersonalityProfile.css` |
| `/workspace/client/src/components/reports/PersonalityProfile.js` | `client/src/components/reports/PersonalityProfile.js` |
| `/workspace/client/src/components/reports/sections/SynthesisSection.jsx` | `client/src/components/reports/sections/SynthesisSection.jsx` |
| `/workspace/client/src/components/ui/ThemeToggle.jsx` | `client/src/components/ui/ThemeToggle.jsx` |
| `/workspace/client/src/components/ui/VedicIcons.js` | `client/src/components/ui/VedicIcons.js` |
| `/workspace/client/src/components/ui/VedicIcons.jsx` | `client/src/components/ui/VedicIcons.jsx` |
| `/workspace/client/src/components/ui/typography/VedicTypography.jsx` | `client/src/components/ui/typography/VedicTypography.jsx` |
| `/workspace/client/src/contexts/ThemeContext.js` | `client/src/contexts/ThemeContext.js` |
| `/workspace/client/src/pages/AnalysisPage.js` | `client/src/pages/AnalysisPage.js` |
| `/workspace/client/src/pages/ChartPage.js` | `client/src/pages/ChartPage.js` |
| `/workspace/client/src/pages/HomePage.js` | `client/src/pages/HomePage.js` |
| `/workspace/client/src/pages/ReportPage.js` | `client/src/pages/ReportPage.js` |
| `/workspace/client/src/pages/vedic-details/MeshaPage.js` | `client/src/pages/vedic-details/MeshaPage.js` |

### Pattern: `*Formatter`

| File Path | Relative Path |
|-----------|---------------|
| `/workspace/src/core/reports/formatters/CareerFormatter.js` | `src/core/reports/formatters/CareerFormatter.js` |
| `/workspace/src/core/reports/formatters/FinancialFormatter.js` | `src/core/reports/formatters/FinancialFormatter.js` |
| `/workspace/src/core/reports/formatters/HealthFormatter.js` | `src/core/reports/formatters/HealthFormatter.js` |
| `/workspace/src/core/reports/formatters/LifePredictionFormatter.js` | `src/core/reports/formatters/LifePredictionFormatter.js` |
| `/workspace/src/core/reports/formatters/PersonalityFormatter.js` | `src/core/reports/formatters/PersonalityFormatter.js` |
| `/workspace/src/core/reports/formatters/RelationshipFormatter.js` | `src/core/reports/formatters/RelationshipFormatter.js` |

### Pattern: `*Template`

| File Path | Relative Path |
|-----------|---------------|
| `/workspace/src/core/reports/templates/CareerTemplate.js` | `src/core/reports/templates/CareerTemplate.js` |
| `/workspace/src/core/reports/templates/FinancialTemplate.js` | `src/core/reports/templates/FinancialTemplate.js` |
| `/workspace/src/core/reports/templates/HealthTemplate.js` | `src/core/reports/templates/HealthTemplate.js` |
| `/workspace/src/core/reports/templates/LifePredictionTemplate.js` | `src/core/reports/templates/LifePredictionTemplate.js` |
| `/workspace/src/core/reports/templates/PersonalityTemplate.js` | `src/core/reports/templates/PersonalityTemplate.js` |
| `/workspace/src/core/reports/templates/RelationshipTemplate.js` | `src/core/reports/templates/RelationshipTemplate.js` |


*... and 4 more pattern groups*

---

## 🔍 Code Quality Analysis

### Mock/Test Code Detection

#### 🧪 Mock Code (5 files)

**File:** `client/src/__mocks__/framer-motion.js`

- **Line 22:** MOCK
  ```javascript
  const createMockMotionComponent = (Component) => {
  ```

- **Line 22:** MOCK
  ```javascript
  const createMockMotionComponent = (Component) => {
  ```

- **Line 40:** MOCK
  ```javascript
  div: createMockMotionComponent('div'),
  ```

- **Line 41:** MOCK
  ```javascript
  h1: createMockMotionComponent('h1'),
  ```

- **Line 42:** MOCK
  ```javascript
  h2: createMockMotionComponent('h2'),
  ```

- **Line 43:** MOCK
  ```javascript
  h3: createMockMotionComponent('h3'),
  ```

- **Line 44:** MOCK
  ```javascript
  p: createMockMotionComponent('p'),
  ```

- **Line 45:** MOCK
  ```javascript
  button: createMockMotionComponent('button'),
  ```

**File:** `client/src/components/common/GenericDataRenderer.test.jsx`

- **Line 11:** MOCK
  ```javascript
  const mockSection = {
  ```

**File:** `client/src/components/forms/BirthDataForm.test.js`

- **Line 8:** MOCK
  ```javascript
  jest.mock('../../services/geocodingService', () => ({
  ```

- **Line 13:** MOCK
  ```javascript
  jest.mock('framer-motion', () => {
  ```

- **Line 58:** MOCK
  ```javascript
  const mockSubmit = jest.fn();
  ```

- **Line 59:** MOCK
  ```javascript
  geocodingService.geocodeLocation.mockResolvedValue({
  ```

**File:** `client/src/components/interactive/BirthChartWizard.jsx`

- **Line 116:** MOCK
  ```javascript
  const mockSuggestions = [
  ```

**File:** `client/src/components/reports/EnhancedPersonalityProfile.test.jsx`

- **Line 12:** MOCK
  ```javascript
  jest.mock('../ui/loading/VedicLoadingSpinner', () => () => <div data-testid="loading-spinner">Loading...</div>);
  ```

#### 🚧 Placeholder Code (7 files)

**File:** `src/core/reports/synthesis/ReportSynthesisEngine.js`

- **Line 295:** PLACEHOLDER
  ```javascript
  return { synthesis: 'Rule not implemented', confidence: 0.5 };
  ```

**File:** `client/src/components/Header.js`

- **Line 127:** PLACEHOLDER
  ```javascript
  placeholder="Search..."
  ```

**File:** `client/src/components/forms/BirthDataForm.js`

- **Line 99:** PLACEHOLDER
  ```javascript
  placeholder="Enter your full name"
  ```

- **Line 173:** PLACEHOLDER
  ```javascript
  placeholder="e.g., Mumbai, Maharashtra, India"
  ```

**File:** `client/src/components/interactive/BirthChartWizard.jsx`

- **Line 180:** PLACEHOLDER
  ```javascript
  placeholder="Enter your full name"
  ```

- **Line 283:** PLACEHOLDER
  ```javascript
  placeholder="Start typing your birth city..."
  ```

- **Line 317:** PLACEHOLDER
  ```javascript
  placeholder="e.g., 28.6139"
  ```

- **Line 324:** PLACEHOLDER
  ```javascript
  placeholder="e.g., 77.2090"
  ```

- **Line 331:** PLACEHOLDER
  ```javascript
  placeholder="e.g., +05:30"
  ```

**File:** `client/src/components/interactive/CompatibilityChecker.jsx`

- **Line 290:** PLACEHOLDER
  ```javascript
  placeholder="Enter name"
  ```

- **Line 334:** PLACEHOLDER
  ```javascript
  placeholder="Enter name"
  ```

**File:** `client/src/components/ui/inputs/Input.jsx`

- **Line 7:** PLACEHOLDER
  ```javascript
  'w-full rounded-xl border bg-vedic-surface text-vedic-text transition-all duration-300 placeholder:text-vedic-text-muted focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  ```

**File:** `client/src/components/ui/inputs/Select.jsx`

- **Line 11:** PLACEHOLDER
  ```javascript
  placeholder = 'Select an option...',
  ```

- **Line 28:** PLACEHOLDER
  ```javascript
  placeholder: 'text-sm',
  ```

- **Line 37:** PLACEHOLDER
  ```javascript
  placeholder: 'text-base',
  ```

- **Line 46:** PLACEHOLDER
  ```javascript
  placeholder: 'text-lg',
  ```

- **Line 100:** PLACEHOLDER
  ```javascript
  placeholder: (provided) => ({
  ```

- **Line 194:** PLACEHOLDER
  ```javascript
  placeholder: () => cn(currentSize.placeholder, 'text-vedic-text-muted'),
  ```

- **Line 226:** PLACEHOLDER
  ```javascript
  placeholder={placeholder}
  ```

#### ⚠️ Non-Production Code (48 files)

**File:** `src/api/controllers/ChartController.js`

- **Line 558:** NON-PRODUCTION
  ```javascript
  lifeFocus: 'Career and personal development will be primary life themes.',
  ```

**File:** `src/api/middleware/logging.js`

- **Line 6:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

- **Line 7:** NON-PRODUCTION
  ```javascript
  console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  ```

**File:** `src/api/routes/comprehensiveAnalysis.js`

- **Line 75:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

- **Line 76:** NON-PRODUCTION
  ```javascript
  console.log('Starting comprehensive analysis...');
  ```

- **Line 154:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

- **Line 155:** NON-PRODUCTION
  ```javascript
  console.log('Analysis completed successfully');
  ```

- **Line 201:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

**File:** `src/core/analysis/dashas/AntardashaCalculator.js`

- **Line 232:** NON-PRODUCTION
  ```javascript
  description: `Significant career developments under ${ad.lord} influence`
  ```

- **Line 301:** NON-PRODUCTION
  ```javascript
  events = ['Harmonious developments', 'Supportive circumstances'];
  ```

- **Line 315:** NON-PRODUCTION
  ```javascript
  events = ['Positive developments', 'Growth opportunities'];
  ```

- **Line 340:** NON-PRODUCTION
  ```javascript
  'Mercury': ['Communication and learning', 'Business opportunities', 'Travel and networking', 'Skill development'],
  ```

**File:** `src/core/analysis/dashas/PratyanardashaCalculator.js`

- **Line 248:** NON-PRODUCTION
  ```javascript
  'Focus on education and skill development',
  ```

- **Line 277:** NON-PRODUCTION
  ```javascript
  'Focus on inner development',
  ```

**File:** `src/core/analysis/divisional/NavamsaAnalysisService.js`

- **Line 566:** NON-PRODUCTION
  ```javascript
  evolutionPath: 'Steady spiritual development',
  ```

- **Line 756:** NON-PRODUCTION
  ```javascript
  return significance[planetName] || 'Spiritual development';
  ```

- **Line 2550:** NON-PRODUCTION
  ```javascript
  1: 'Personal spiritual development and self-realization',
  ```

- **Line 2582:** NON-PRODUCTION
  ```javascript
  1: 'Past life focus on personal identity and ego development',
  ```

- **Line 2653:** NON-PRODUCTION
  ```javascript
  return growthAreas[house] || 'General material and spiritual development';
  ```

- **Line 2682:** NON-PRODUCTION
  ```javascript
  return 'Current life emphasizes spiritual development and inner growth';
  ```

- **Line 2684:** NON-PRODUCTION
  ```javascript
  return 'Balanced approach between material and spiritual development';
  ```

- **Line 2710:** NON-PRODUCTION
  ```javascript
  'Debilitated': 'Limited guidance capacity - focus on personal development first'
  ```

- **Line 2759:** NON-PRODUCTION
  ```javascript
  potential.keyFactors.push('Past life spiritual development supports current growth');
  ```

**File:** `src/core/analysis/divisional/NavamsaAnalyzer.js`

- **Line 547:** NON-PRODUCTION
  ```javascript
  implications.push('Inner strength and spiritual development supported');
  ```

- **Line 551:** NON-PRODUCTION
  ```javascript
  implications.push('Requires spiritual development for improvement');
  ```

- **Line 571:** NON-PRODUCTION
  ```javascript
  judgment.push('Strong start but may face challenges - needs spiritual development');
  ```

- **Line 1253:** NON-PRODUCTION
  ```javascript
  return paths.length > 0 ? paths : ['General spiritual development'];
  ```

- **Line 1324:** NON-PRODUCTION
  ```javascript
  return { theme: `${atmakaraka} development`, significance: 'Soul purpose' };
  ```

- **Line 1327:** NON-PRODUCTION
  ```javascript
  return { theme: 'Self-development', significance: 'General growth' };
  ```

- **Line 1376:** NON-PRODUCTION
  ```javascript
  return 'Focused development path';
  ```

- **Line 2146:** NON-PRODUCTION
  ```javascript
  'Focus on self-development and spiritual growth for relationship success',
  ```

- **Line 2454:** NON-PRODUCTION
  ```javascript
  'Professional expertise and skill development'
  ```

- **Line 2608:** NON-PRODUCTION
  ```javascript
  'Inner development and spiritual evolution',
  ```

- **Line 2638:** NON-PRODUCTION
  ```javascript
  developmentAreas: []
  ```

- **Line 2688:** NON-PRODUCTION
  ```javascript
  personality.developmentAreas = this.identifyDevelopmentAreas(lagnaSign, planetsInLagna);
  ```

- **Line 2703:** NON-PRODUCTION
  ```javascript
  developmentAreas: ['Self-reflection and spiritual practice recommended']
  ```

- **Line 2927:** NON-PRODUCTION
  ```javascript
  if (score >= 40) return 'Requires Development';
  ```

- **Line 2937:** NON-PRODUCTION
  ```javascript
  static identifyDevelopmentAreas(lagnaSign, planetsInLagna) {
  ```

- **Line 3027:** NON-PRODUCTION
  ```javascript
  overallTheme: 'Balanced Development',
  ```

- **Line 3084:** NON-PRODUCTION
  ```javascript
  recommendations: ['Focus on inner development and dharmic pursuits']
  ```

- **Line 3279:** NON-PRODUCTION
  ```javascript
  influence.influence = 'Very positive influence on second half development';
  ```

- **Line 3289:** NON-PRODUCTION
  ```javascript
  influence.effect = 'Development through service and overcoming obstacles';
  ```

- **Line 3322:** NON-PRODUCTION
  ```javascript
  analysis.spiritualEvolution.push('Accelerated spiritual development expected');
  ```

- **Line 3349:** NON-PRODUCTION
  ```javascript
  items.push('Favorable opportunities for personal development');
  ```

- **Line 3615:** NON-PRODUCTION
  ```javascript
  analysis.indications.push('12th lord supports spiritual development');
  ```

- **Line 3984:** NON-PRODUCTION
  ```javascript
  'Education and youth development'
  ```

- **Line 4134:** NON-PRODUCTION
  ```javascript
  'Community development and group leadership'
  ```

- **Line 4263:** NON-PRODUCTION
  ```javascript
  suitability: 'Universal approach for balanced development'
  ```

- **Line 4274:** NON-PRODUCTION
  ```javascript
  description: 'General spiritual development suitable for all',
  ```

- **Line 4456:** NON-PRODUCTION
  ```javascript
  'Development of willpower and discipline',
  ```

- **Line 4863:** NON-PRODUCTION
  ```javascript
  analysis.challenges.push('Spiritual development through overcoming obstacles and challenges');
  ```

- **Line 4866:** NON-PRODUCTION
  ```javascript
  analysis.challenges.push('Material focus may distract from spiritual development');
  ```

- **Line 5205:** NON-PRODUCTION
  ```javascript
  return 'Very Good - Solid spiritual inclination with good prospects for spiritual development';
  ```

- **Line 5209:** NON-PRODUCTION
  ```javascript
  return 'Moderate - Balanced spiritual nature requiring focused development';
  ```

- **Line 5215:** NON-PRODUCTION
  ```javascript
  return 'Potential - Spiritual capacity exists but requires significant development';
  ```

- **Line 5927:** NON-PRODUCTION
  ```javascript
  recommendations.push('Focus on skill development during establishment phase');
  ```

- **Line 5963:** NON-PRODUCTION
  ```javascript
  development: { range: '42-54', likelihood: 'Moderate', factors: [] },
  ```

- **Line 6026:** NON-PRODUCTION
  ```javascript
  development: { range: '42-54', likelihood: 'Variable', factors: ['Individual assessment needed'] },
  ```

- **Line 6085:** NON-PRODUCTION
  ```javascript
  analysis.factors.push('9th lord well-placed supports spiritual development');
  ```

- **Line 6147:** NON-PRODUCTION
  ```javascript
  analysis.factors.push('Jupiter excellently placed for spiritual development');
  ```

- **Line 6265:** NON-PRODUCTION
  ```javascript
  spiritualPhases.development.likelihood = 'Good';
  ```

- **Line 6290:** NON-PRODUCTION
  ```javascript
  spiritualPhases.development.likelihood = 'Good';
  ```

- **Line 6292:** NON-PRODUCTION
  ```javascript
  spiritualPhases.development.factors.push('Strong Jupiter supports wisdom development');
  ```

- **Line 6440:** NON-PRODUCTION
  ```javascript
  recommendations: ['Prepare for inner nature emergence after age 35', 'Focus on spiritual development'],
  ```

- **Line 6674:** NON-PRODUCTION
  ```javascript
  recommendations.push('Balance outer achievements with inner development');
  ```

- **Line 6676:** NON-PRODUCTION
  ```javascript
  recommendations.push('Consider marriage and spiritual development as activation catalysts');
  ```

- **Line 6716:** NON-PRODUCTION
  ```javascript
  overallGuidance: 'Balanced Development'
  ```

- **Line 6754:** NON-PRODUCTION
  ```javascript
  early: { range: '18-35', priority: ['Education and skill development'], recommendations: ['Focus on learning and foundation building'] },
  ```

- **Line 6756:** NON-PRODUCTION
  ```javascript
  mature: { range: '50-65', priority: ['Spiritual development and wisdom'], recommendations: ['Prepare for later life transitions'] },
  ```

- **Line 6760:** NON-PRODUCTION
  ```javascript
  'Honor the natural cycles of life development',
  ```

- **Line 6790:** NON-PRODUCTION
  ```javascript
  if (spiritualTiming.spiritualPhases.development && spiritualTiming.spiritualPhases.development.likelihood === 'Good') {
  ```

- **Line 6791:** NON-PRODUCTION
  ```javascript
  guidance.lifePhases.middle.priority.push('Spiritual development');
  ```

- **Line 6816:** NON-PRODUCTION
  ```javascript
  guidance.lifePhases.early.priority.push('Relationship development');
  ```

- **Line 6823:** NON-PRODUCTION
  ```javascript
  guidance.lifePhases.middle.recommendations.push('Focus on marriage happiness and family development');
  ```

- **Line 6846:** NON-PRODUCTION
  ```javascript
  guidance.lifePhases.middle.recommendations.push('Focus on career growth and leadership development');
  ```

- **Line 6892:** NON-PRODUCTION
  ```javascript
  'Balance outer achievements with inner development',
  ```

- **Line 6978:** NON-PRODUCTION
  ```javascript
  return 'Comprehensive Life Development';
  ```

- **Line 6980:** NON-PRODUCTION
  ```javascript
  return 'Focused Life Development';
  ```

- **Line 6982:** NON-PRODUCTION
  ```javascript
  return 'Selective Life Development';
  ```

- **Line 7105:** NON-PRODUCTION
  ```javascript
  'Spiritual development potential confirmed'
  ```

- **Line 8034:** NON-PRODUCTION
  ```javascript
  'Focus on self-development and understanding relationship needs',
  ```

**File:** `src/core/analysis/houses/DetailedHouseAnalyzer.js`

- **Line 474:** NON-PRODUCTION
  ```javascript
  ['Focus on skill development and service attitude']
  ```

- **Line 505:** NON-PRODUCTION
  ```javascript
  ['Gradual spiritual development possible']
  ```

- **Line 1071:** NON-PRODUCTION
  ```javascript
  10: ['Career development', 'Authority respect', 'Professional ethics'],
  ```

**File:** `src/core/analysis/houses/TwelveHouseAnalyzer.js`

- **Line 1283:** NON-PRODUCTION
  ```javascript
  remedies.push('Self-development and confidence building');
  ```

**File:** `src/core/analysis/lagna/LagnaLordAnalyzer.js`

- **Line 635:** NON-PRODUCTION
  ```javascript
  opportunities: ['Personal growth', 'Achievement in key areas', 'Spiritual development'],
  ```

**File:** `src/core/analysis/lagna/LagnaStrengthCalculator.js`

- **Line 676:** NON-PRODUCTION
  ```javascript
  1: ['Self-focused life path', 'Personal development important'],
  ```

**File:** `src/core/analysis/timing/TransitEventPredictor.js`

- **Line 2056:** NON-PRODUCTION
  ```javascript
  recommendations.push('Focus on inner development');
  ```

**File:** `src/core/calculations/chart-casting/AscendantCalculator.js`

- **Line 45:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

- **Line 138:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

- **Line 149:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

**File:** `src/core/calculations/houses/HouseLordCalculator.js`

- **Line 391:** NON-PRODUCTION
  ```javascript
  5: { type: 'Creative expression', strength: 80, description: 'Creative and intellectual development' },
  ```

**File:** `src/core/reports/synthesis/TimelineIntegrator.js`

- **Line 121:** NON-PRODUCTION
  ```javascript
  if (effects.includes('spiritual')) return 'Spiritual development';
  ```

**File:** `src/data/migrations/001_create_users_table.js`

- **Line 19:** NON-PRODUCTION
  ```javascript
  console.log('Creating users table...');
  ```

- **Line 421:** NON-PRODUCTION
  ```javascript
  console.log('Users table created successfully with all indexes');
  ```

- **Line 433:** NON-PRODUCTION
  ```javascript
  console.log('Dropping users table...');
  ```

- **Line 437:** NON-PRODUCTION
  ```javascript
  console.log('Users table dropped successfully');
  ```

- **Line 440:** NON-PRODUCTION
  ```javascript
  console.log('Users table already doesn\'t exist');
  ```

- **Line 459:** NON-PRODUCTION
  ```javascript
  console.log('Default admin user already exists');
  ```

- **Line 530:** NON-PRODUCTION
  ```javascript
  console.log(`Default admin user created with email: ${adminEmail}`);
  ```

- **Line 531:** NON-PRODUCTION
  ```javascript
  console.log('Please change the default password after first login');
  ```

- **Line 569:** NON-PRODUCTION
  ```javascript
  console.log('Users table migration validation passed');
  ```

**File:** `src/data/repositories/ActivityLogRepository.js`

- **Line 202:** NON-PRODUCTION
  ```javascript
  environment: process.env.NODE_ENV || 'development'
  ```

**File:** `src/services/analysis/ArudhaAnalysisService.js`

- **Line 471:** NON-PRODUCTION
  ```javascript
  earlyLife: this.analyzeEarlyLifeImageDevelopment(arudhaLagna, chart),
  ```

- **Line 1366:** NON-PRODUCTION
  ```javascript
  analyzeEarlyLifeImageDevelopment(arudhaLagna, chart) { return { development: 'Early development' }; }
  ```

**File:** `src/services/analysis/DetailedDashaAnalysisService.js`

- **Line 176:** NON-PRODUCTION
  ```javascript
  description: `Marriage or significant relationship development during ${dashaLord}-${antardashLord} period`
  ```

**File:** `src/services/analysis/LuminariesAnalysisService.js`

- **Line 363:** NON-PRODUCTION
  ```javascript
  developmentPath: this.getPersonalityDevelopmentPath(sunAnalysis, moonAnalysis, relationship)
  ```

- **Line 441:** NON-PRODUCTION
  ```javascript
  1: 'Through personal leadership and self-development',
  ```

- **Line 443:** NON-PRODUCTION
  ```javascript
  3: 'Through communication and skill development',
  ```

- **Line 1190:** NON-PRODUCTION
  ```javascript
  getPersonalityDevelopmentPath(sunAnalysis, moonAnalysis, relationship) {
  ```

**File:** `src/services/analysis/MasterAnalysisOrchestrator.js`

- **Line 355:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

- **Line 356:** NON-PRODUCTION
  ```javascript
  console.log('🔸 Generating Section 6: Navamsa Analysis (D9)');
  ```

- **Line 406:** NON-PRODUCTION
  ```javascript
  "This section focuses on marriage, spiritual development, and soul-level analysis.",
  ```

- **Line 1142:** NON-PRODUCTION
  ```javascript
  const formatted = ['**Spiritual Development Indicators:**'];
  ```

**File:** `src/services/chart/ChartGenerationService.js`

- **Line 424:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

- **Line 879:** NON-PRODUCTION
  ```javascript
  if (timeZone && /^[+-]\d{2}:\d{2}$/.test(timeZone)) {
  ```

**File:** `src/services/geocoding/GeocodingService.js`

- **Line 32:** NON-PRODUCTION
  ```javascript
  console.log('🌍 Geocoding request for:', query);
  ```

- **Line 36:** NON-PRODUCTION
  ```javascript
  console.log('⚠️ No geocoding API key available, using fallback coordinates for Pune');
  ```

- **Line 62:** NON-PRODUCTION
  ```javascript
  console.log('🔄 Geocoding failed, using fallback:', error.message);
  ```

- **Line 69:** NON-PRODUCTION
  ```javascript
  console.log('🔍 Calling OpenCage API...');
  ```

- **Line 72:** NON-PRODUCTION
  ```javascript
  console.log('📡 OpenCage API response structure:', {
  ```

- **Line 83:** NON-PRODUCTION
  ```javascript
  console.log('✅ Geocoding successful:', { lat, lng, timezone, formatted });
  ```

- **Line 94:** NON-PRODUCTION
  ```javascript
  console.log('⚠️ No results from geocoding API, using fallback');
  ```

- **Line 101:** NON-PRODUCTION
  ```javascript
  console.log('🔑 API key issue, using fallback coordinates');
  ```

- **Line 104:** NON-PRODUCTION
  ```javascript
  console.log('⏱️ Rate limit exceeded, using fallback coordinates');
  ```

- **Line 107:** NON-PRODUCTION
  ```javascript
  console.log('🔄 General geocoding error, using fallback coordinates');
  ```

**File:** `src/services/report/ComprehensiveReportService.js`

- **Line 207:** NON-PRODUCTION
  ```javascript
  implications: ['requires development'],
  ```

- **Line 253:** NON-PRODUCTION
  ```javascript
  implications: comparison.implications || ['requires development'],
  ```

- **Line 894:** NON-PRODUCTION
  ```javascript
  'Debilitated': 'emotionally sensitive requiring conscious development'
  ```

- **Line 952:** NON-PRODUCTION
  ```javascript
  return 'ego development needed, potential confidence issues';
  ```

- **Line 1001:** NON-PRODUCTION
  ```javascript
  effects.push('Need for spiritual development in relationships');
  ```

- **Line 1317:** NON-PRODUCTION
  ```javascript
  factors.push('Emotional sensitivity requiring conscious development');
  ```

**File:** `src/services/reportService.js`

- **Line 2:** NON-PRODUCTION
  ```javascript
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
  ```

**File:** `src/services/user/UserAuthenticationService.js`

- **Line 368:** NON-PRODUCTION
  ```javascript
  if (!/(?=.*[a-z])/.test(password)) {
  ```

- **Line 372:** NON-PRODUCTION
  ```javascript
  if (!/(?=.*[A-Z])/.test(password)) {
  ```

- **Line 376:** NON-PRODUCTION
  ```javascript
  if (!/(?=.*\d)/.test(password)) {
  ```

- **Line 380:** NON-PRODUCTION
  ```javascript
  if (!/(?=.*[@$!%*?&])/.test(password)) {
  ```

- **Line 707:** NON-PRODUCTION
  ```javascript
  return process.env.REQUEST_IP_ADDRESS || '127.0.0.1';
  ```

- **Line 809:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

- **Line 810:** NON-PRODUCTION
  ```javascript
  console.log(logEntry);
  ```

- **Line 838:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

- **Line 839:** NON-PRODUCTION
  ```javascript
  console.log('Token blacklisted:', blacklistEntry.token.slice(0, 20) + '...');
  ```

- **Line 850:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

- **Line 851:** NON-PRODUCTION
  ```javascript
  console.log(`Cleared active sessions for user: ${userId}`);
  ```

- **Line 862:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

- **Line 863:** NON-PRODUCTION
  ```javascript
  console.log(`Invalidated refresh tokens for user: ${userId}`);
  ```

- **Line 1053:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

- **Line 1054:** NON-PRODUCTION
  ```javascript
  console.log(`Account locked for user ${userId}, reason: ${reason}`);
  ```

- **Line 1061:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

- **Line 1062:** NON-PRODUCTION
  ```javascript
  console.log(`Suspicious activity flagged: ${type} for user ${userId} from IP ${ipAddress}`);
  ```

- **Line 1098:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

- **Line 1099:** NON-PRODUCTION
  ```javascript
  console.log(`Updated activity metrics for user: ${userId}`);
  ```

**File:** `src/services/user/UserChartService.js`

- **Line 237:** NON-PRODUCTION
  ```javascript
  shareUrl: `${process.env.APP_URL || 'http://localhost:3000'}/shared/chart/${shareToken}`,
  ```

**File:** `src/services/user/UserProfileService.js`

- **Line 295:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

- **Line 296:** NON-PRODUCTION
  ```javascript
  console.log(`Account deactivated: User ${userId}, Reason: ${reason}, Time: ${new Date()}`);
  ```

- **Line 323:** NON-PRODUCTION
  ```javascript
  if (process.env.NODE_ENV === 'development') {
  ```

- **Line 324:** NON-PRODUCTION
  ```javascript
  console.log(`Account reactivated: User ${userId}, Time: ${new Date()}`);
  ```

- **Line 371:** NON-PRODUCTION
  ```javascript
  if (data.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(data.phoneNumber)) {
  ```

**File:** `src/services/user/UserReportService.js`

- **Line 328:** NON-PRODUCTION
  ```javascript
  shareUrl: `${process.env.APP_URL || 'http://localhost:3000'}/shared/report/${shareToken}`,
  ```

**File:** `client/src/components/charts/ChartDisplay.js`

- **Line 12:** NON-PRODUCTION
  ```javascript
  console.log('Planet selected:', planet, 'in house:', house);
  ```

- **Line 16:** NON-PRODUCTION
  ```javascript
  console.log('House selected:', house);
  ```

- **Line 62:** NON-PRODUCTION
  ```javascript
  console.log('ChartDisplay received data:', {
  ```

**File:** `client/src/components/charts/NavamsaChart.js`

- **Line 48:** NON-PRODUCTION
  ```javascript
  Marriage and spiritual development analysis
  ```

**File:** `client/src/components/charts/VedicChartDisplay.jsx`

- **Line 19:** NON-PRODUCTION
  ```javascript
  console.log('🎯 VedicChartDisplay received chart data:', chartData);
  ```

- **Line 26:** NON-PRODUCTION
  ```javascript
  console.log('📊 VedicChart - Analysis sections:', Object.keys(sections));
  ```

- **Line 94:** NON-PRODUCTION
  ```javascript
  console.log('✅ VedicChart - Transformed data from API:', transformedData);
  ```

- **Line 98:** NON-PRODUCTION
  ```javascript
  console.log('⚠️ VedicChart - No questions found in section1, using fallback');
  ```

**File:** `client/src/components/interactive/CompatibilityChecker.jsx`

- **Line 162:** NON-PRODUCTION
  ```javascript
  alert('Please enter names for both people');
  ```

**File:** `client/src/components/reports/ComprehensiveAnalysisDisplay.js`

- **Line 31:** NON-PRODUCTION
  ```javascript
  console.log('🔍 Raw API Response:', data);
  ```

- **Line 38:** NON-PRODUCTION
  ```javascript
  console.log('📊 Analysis sections:', Object.keys(sections));
  ```

- **Line 166:** NON-PRODUCTION
  ```javascript
  console.log('✅ Processed chart data:', safeRasiChart);
  ```

- **Line 167:** NON-PRODUCTION
  ```javascript
  console.log('✅ Processed dasha info:', safeDashaInfo);
  ```

- **Line 168:** NON-PRODUCTION
  ```javascript
  console.log('✅ Planetary positions found:', Object.keys(planetaryPositions));
  ```

**File:** `client/src/components/reports/PersonalityProfile.js`

- **Line 421:** NON-PRODUCTION
  ```javascript
  <h3>Personality Development Recommendations</h3>
  ```

**File:** `client/src/components/reports/sections/LagnaLuminariesSection.jsx`

- **Line 256:** NON-PRODUCTION
  ```javascript
  <strong className="text-amber-700">Development Path:</strong>
  ```

- **Line 258:** NON-PRODUCTION
  ```javascript
  {overallPersonality.developmentPath?.map((path, index) => (
  ```

**File:** `client/src/components/reports/sections/NavamsaAnalysisSection.jsx`

- **Line 352:** NON-PRODUCTION
  ```javascript
  <CardTitle className="text-lg text-amber-800">Spiritual Development Path</CardTitle>
  ```

**File:** `client/src/hooks/usePWA.js`

- **Line 29:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Back online');
  ```

- **Line 34:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Gone offline');
  ```

- **Line 73:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Background sync completed:', data);
  ```

- **Line 79:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Cache updated');
  ```

- **Line 83:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Serving offline fallback');
  ```

- **Line 87:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Unknown message from SW:', type, data);
  ```

- **Line 109:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Registering service worker...');
  ```

- **Line 117:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Service worker registered successfully');
  ```

- **Line 121:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Update found');
  ```

- **Line 127:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Update available');
  ```

- **Line 169:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Install prompt available');
  ```

- **Line 177:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] App installed successfully');
  ```

- **Line 201:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Showing install prompt');
  ```

- **Line 205:** NON-PRODUCTION
  ```javascript
  const result = await prompt.prompt();
  ```

- **Line 206:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Install prompt result:', result.outcome);
  ```

- **Line 231:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Applying update...');
  ```

- **Line 306:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Birth data queued for background sync');
  ```

- **Line 324:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Analysis request queued for background sync');
  ```

- **Line 353:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Push subscription created');
  ```

- **Line 371:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] Cache cleanup requested');
  ```

- **Line 390:** NON-PRODUCTION
  ```javascript
  console.log('[PWA] URLs queued for caching:', urls);
  ```

**File:** `client/src/pages/ChartPage.js`

- **Line 19:** NON-PRODUCTION
  ```javascript
  console.log('🔮 Generating chart with data:', birthData);
  ```

- **Line 25:** NON-PRODUCTION
  ```javascript
  console.log('📊 Chart generation result:', data);
  ```

- **Line 28:** NON-PRODUCTION
  ```javascript
  console.log('✅ Chart generation successful, setting chart data:', data.data);
  ```

- **Line 34:** NON-PRODUCTION
  ```javascript
  console.log('💾 Chart data set and stored successfully');
  ```

**File:** `client/src/pages/EnhancedAnalysisPage.jsx`

- **Line 59:** NON-PRODUCTION
  ```javascript
  { period: "2026-2028", focus: "Spiritual Development", description: "Deep inner transformation period" },
  ```

**File:** `client/src/pages/ReportPage.js`

- **Line 78:** NON-PRODUCTION
  ```javascript
  alert('Error fetching report: ' + error.message);
  ```

- **Line 93:** NON-PRODUCTION
  ```javascript
  alert('Please generate a birth chart first by visiting the Chart page to provide your birth details.');
  ```

- **Line 98:** NON-PRODUCTION
  ```javascript
  console.log(`Generating ${type} report with birth data:`, birthData);
  ```

- **Line 102:** NON-PRODUCTION
  ```javascript
  console.log('Report generation result:', result);
  ```

- **Line 106:** NON-PRODUCTION
  ```javascript
  console.log('Report data set successfully');
  ```

- **Line 109:** NON-PRODUCTION
  ```javascript
  alert('Failed to generate report: ' + (result.error || 'Unknown error'));
  ```

- **Line 113:** NON-PRODUCTION
  ```javascript
  alert('Error generating report: ' + error.message);
  ```

- **Line 121:** NON-PRODUCTION
  ```javascript
  alert('No report data available to download');
  ```

- **Line 142:** NON-PRODUCTION
  ```javascript
  alert('Report downloaded successfully! You can print this HTML file as PDF from your browser.');
  ```

- **Line 159:** NON-PRODUCTION
  ```javascript
  alert('Error downloading report. Please try again.');
  ```

**File:** `client/src/services/analysisService.js`

- **Line 6:** NON-PRODUCTION
  ```javascript
  : 'http://localhost:3001/api'
  ```

**File:** `client/src/services/chartService.js`

- **Line 7:** NON-PRODUCTION
  ```javascript
  : 'http://localhost:3001/api'
  ```

- **Line 27:** NON-PRODUCTION
  ```javascript
  console.log('Chart API Response:', response.status, response.data);
  ```

- **Line 48:** NON-PRODUCTION
  ```javascript
  console.log(`Chart API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
  ```

- **Line 68:** NON-PRODUCTION
  ```javascript
  console.log('Generating chart with validated data:', birthData);
  ```

- **Line 76:** NON-PRODUCTION
  ```javascript
  console.log('Chart generated successfully:', response.data);
  ```

- **Line 126:** NON-PRODUCTION
  ```javascript
  if (!timePattern.test(birthData.timeOfBirth)) {
  ```

- **Line 130:** NON-PRODUCTION
  ```javascript
  console.log('Birth data validation passed');
  ```

- **Line 249:** NON-PRODUCTION
  ```javascript
  console.log('Chart Service Configuration:', chartService.getConfig());
  ```

**File:** `client/src/services/geocodingService.js`

- **Line 7:** NON-PRODUCTION
  ```javascript
  : 'http://localhost:3001/api'
  ```

- **Line 43:** NON-PRODUCTION
  ```javascript
  console.log('🔍 Testing geocoding API connectivity...');
  ```

- **Line 46:** NON-PRODUCTION
  ```javascript
  console.log('✅ Geocoding API connection successful');
  ```

- **Line 56:** NON-PRODUCTION
  ```javascript
  console.log('✅ Fallback API connection successful');
  ```

- **Line 97:** NON-PRODUCTION
  ```javascript
  console.log(`🌍 Geocoding attempt ${attempt}: "${trimmedPlace}"`);
  ```

- **Line 113:** NON-PRODUCTION
  ```javascript
  console.log(`✅ Geocoding successful: ${formatted_address} (${latitude}, ${longitude})`);
  ```

- **Line 129:** NON-PRODUCTION
  ```javascript
  console.log(`🔄 Retrying geocoding (${attempt + 1}/${this.maxRetries})...`);
  ```

**File:** `client/src/utils/chartDataManager.js`

- **Line 17:** NON-PRODUCTION
  ```javascript
  console.log('Chart data stored successfully');
  ```

- **Line 44:** NON-PRODUCTION
  ```javascript
  console.log('Birth data stored successfully');
  ```

- **Line 71:** NON-PRODUCTION
  ```javascript
  console.log('Chart data cleared successfully');
  ```

**File:** `client/src/utils/dateUtils.js`

- **Line 130:** NON-PRODUCTION
  ```javascript
  if (!timeRegex.test(timeString)) {
  ```

**File:** `client/src/utils/errorLogger.js`

- **Line 2:** NON-PRODUCTION
  ```javascript
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  ```

- **Line 27:** NON-PRODUCTION
  ```javascript
  console.log('🚨 Global error captured:', event);
  ```

- **Line 39:** NON-PRODUCTION
  ```javascript
  console.log('🚨 Promise rejection captured:', event);
  ```

- **Line 49:** NON-PRODUCTION
  ```javascript
  console.log('🚨 Resource error captured:', event);
  ```

- **Line 67:** NON-PRODUCTION
  ```javascript
  console.log('🚨 Console error captured:', errorMessage);
  ```

**File:** `client/src/utils/performance.js`

- **Line 40:** NON-PRODUCTION
  ```javascript
  console.log(`Image optimization params: ${width}x${height}, quality: ${quality}, format: ${format}`);
  ```

- **Line 79:** NON-PRODUCTION
  ```javascript
  console.log(`Performance: ${name} took ${end - start} milliseconds`);
  ```

- **Line 153:** NON-PRODUCTION
  ```javascript
  console.log('Service Worker registered successfully:', registration);
  ```

- **Line 276:** NON-PRODUCTION
  ```javascript
  console.log('FID:', fid);
  ```

- **Line 294:** NON-PRODUCTION
  ```javascript
  console.log('LCP:', lcp);
  ```

- **Line 310:** NON-PRODUCTION
  ```javascript
  console.log('FCP:', fcp);
  ```

- **Line 326:** NON-PRODUCTION
  ```javascript
  console.log('TTFB:', ttfb);
  ```

- **Line 345:** NON-PRODUCTION
  ```javascript
  console.log('Chart render time:', measure.duration);
  ```

- **Line 516:** NON-PRODUCTION
  ```javascript
  console.log(`Vedic chart generated in ${measure.duration.toFixed(2)}ms`);
  ```

- **Line 532:** NON-PRODUCTION
  ```javascript
  console.log(`Vedic analysis completed in ${measure.duration.toFixed(2)}ms`);
  ```

- **Line 888:** NON-PRODUCTION
  ```javascript
  console.log('Service Worker registered:', registration);
  ```

---

## 💡 Recommendations

### Immediate Actions

1. 📋 **Review similar files** for consolidation opportunities
2. 🧪 **Review mock code** - ensure it's in appropriate test files
3. 🚧 **Complete placeholder implementations** or remove TODO items
4. ⚠️ **Remove non-production code** (console.log, debugger, etc.)

### Commands

```bash
# Auto-remove exact duplicates
npm run detect-duplicates remove

# Generate fresh report
npm run detect-duplicates scan

# Interactive review mode
npm run detect-duplicates interactive

# Detailed analysis
npm run detect-duplicates analyze
```

### Safety Notes

- ✅ Exact duplicates are safe to remove automatically
- ⚠️ Functional duplicates require manual review
- 📋 Similar files may need refactoring consideration
- 🧪 Mock code should be in test files only
- 🚧 Placeholder code needs completion
- ⚠️ Non-production code should be removed

---

*Report generated by Jyotish Shastra Duplicate Detector v1.0*
