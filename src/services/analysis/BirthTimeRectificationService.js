/**
 * Birth Time Rectification Service
 * Implements BPHS (Brihat Parashara Hora Shastra) based Birth Time Rectification
 * Following the mathematical approach using Praanapada, Moon, and Gulika methods
 */

import ChartGenerationService from '../chart/ChartGenerationService.js';
import DetailedDashaAnalysisService from './DetailedDashaAnalysisService.js';

class BirthTimeRectificationService {
  constructor() {
    this.chartService = new ChartGenerationService();
    this.dashaService = new DetailedDashaAnalysisService();
    
    // BPHS constants for calculations
    this.BPHS_CONSTANTS = {
      PALA_PER_HOUR: 2.5, // 1 hour = 2.5 palas
      PADA_PER_PALA: 60,   // 1 pala = 60 padas (vikalas)
      DEGREES_PER_PADA: 6,  // 1 degree = 10 padas (vikalas)
      SUNRISE_OFFSET: 6     // Hours from midnight to sunrise (approximate)
    };
  }

  /**
   * Main BTR Analysis Method
   * Performs comprehensive birth time rectification using multiple BPHS methods
   */
  async performBirthTimeRectification(birthData, options = {}) {
    const analysis = {
      originalData: birthData,
      methods: {},
      recommendations: [],
      confidence: 0,
      rectifiedTime: null,
      analysisLog: []
    };

    try {
      analysis.analysisLog.push('Starting BPHS Birth Time Rectification analysis');

      // Step 1: Validate input data
      this.validateBirthData(birthData, analysis);

      // Step 2: Generate time range candidates (±2 hours from estimated time)
      const timeCandidates = this.generateTimeCandidates(birthData, analysis);

      // Step 3: Praanapada Method Analysis
      analysis.methods.praanapada = await this.performPraanapadaAnalysis(
        birthData, 
        timeCandidates, 
        analysis
      );

      // Step 4: Moon Position Method Analysis  
      analysis.methods.moon = await this.performMoonAnalysis(
        birthData,
        timeCandidates,
        analysis
      );

      // Step 5: Gulika Position Method Analysis
      analysis.methods.gulika = await this.performGulikaAnalysis(
        birthData,
        timeCandidates, 
        analysis
      );

      // Step 6: Event Correlation (if life events provided)
      if (options.lifeEvents && options.lifeEvents.length > 0) {
        analysis.methods.events = await this.performEventCorrelation(
          birthData,
          timeCandidates,
          options.lifeEvents,
          analysis
        );
      }

      // Step 7: Synthesize results and determine confidence
      const synthesis = this.synthesizeResults(analysis);
      analysis.rectifiedTime = synthesis.rectifiedTime;
      analysis.confidence = synthesis.confidence;
      analysis.recommendations = synthesis.recommendations;

      analysis.analysisLog.push('BTR analysis completed successfully');
      return analysis;

    } catch (error) {
      analysis.error = error.message;
      analysis.analysisLog.push(`BTR analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate input birth data
   */
  validateBirthData(birthData, analysis) {
    if (!birthData.dateOfBirth) {
      throw new Error('Date of birth is required for birth time rectification');
    }
    
    if (!birthData.placeOfBirth) {
      throw new Error('Place of birth is required for birth time rectification');
    }

    if (!birthData.latitude || !birthData.longitude) {
      analysis.analysisLog.push('Coordinates missing - will attempt geocoding');
    }

    // Log validation
    analysis.analysisLog.push(`Birth data validation: ${birthData.dateOfBirth}, ${birthData.placeOfBirth}`);
  }

  /**
   * Generate time candidates around estimated birth time
   * Creates a range of possible birth times to analyze
   */
  generateTimeCandidates(birthData, analysis) {
    const candidates = [];
    const estimatedTime = birthData.timeOfBirth || '12:00'; // Default to noon if not provided
    const [hours, minutes] = estimatedTime.split(':').map(Number);
    const baseMinutes = hours * 60 + minutes;
    
    // Generate candidates from -120 to +120 minutes in 5-minute intervals
    for (let offset = -120; offset <= 120; offset += 5) {
      const candidateMinutes = baseMinutes + offset;
      const candidateHours = Math.floor(candidateMinutes / 60) % 24;
      const candidateMins = candidateMinutes % 60;
      
      candidates.push({
        time: `${candidateHours.toString().padStart(2, '0')}:${candidateMins.toString().padStart(2, '0')}`,
        offset: offset,
        score: 0,
        analyses: {}
      });
    }

    analysis.analysisLog.push(`Generated ${candidates.length} time candidates for analysis`);
    return candidates;
  }

  /**
   * Praanapada Analysis Method
   * Based on BPHS principles for aligning ascendant with breath
   */
  async performPraanapadaAnalysis(birthData, timeCandidates, analysis) {
    analysis.analysisLog.push('Starting Praanapada method analysis');
    
    const results = {
      method: 'Praanapada',
      candidates: [],
      bestCandidate: null
    };

    for (const candidate of timeCandidates) {
      try {
        // Generate chart for this time candidate
        const candidateData = { ...birthData, timeOfBirth: candidate.time };
        const chart = await this.chartService.generateRasiChart(candidateData);

        if (!chart) {
          analysis.analysisLog.push(`Failed to generate chart for ${candidate.time}`);
          continue;
        }

        // Calculate Praanapada for this candidate
        const praanapada = this.calculatePraanapada(candidate, chart);
        candidate.analyses.praanapada = praanapada;

        // Calculate alignment score with ascendant
        const alignmentScore = this.calculateAscendantAlignment(
          chart.ascendant, 
          praanapada
        );
        
        candidate.score += alignmentScore * 0.4; // Praanapada has 40% weight

        results.candidates.push({
          time: candidate.time,
          praanapada: praanapada,
          ascendant: chart.ascendant,
          alignmentScore: alignmentScore,
          weightedScore: alignmentScore * 0.4
        });

      } catch (error) {
        analysis.analysisLog.push(`Error analyzing ${candidate.time}: ${error.message}`);
      }
    }

    // Find best candidate
    results.bestCandidate = this.findBestCandidate(results.candidates, 'alignmentScore');
    analysis.analysisLog.push(`Praanapada analysis: best candidate ${results.bestCandidate?.time} with score ${results.bestCandidate?.alignmentScore}`);

    return results;
  }

  /**
   * Moon Position Analysis Method
   * Uses Moon sign conjunction with ascendant for verification
   */
  async performMoonAnalysis(birthData, timeCandidates, analysis) {
    analysis.analysisLog.push('Starting Moon position method analysis');
    
    const results = {
      method: 'Moon',
      candidates: [],
      bestCandidate: null
    };

    for (const candidate of timeCandidates) {
      try {
        const candidateData = { ...birthData, timeOfBirth: candidate.time };
        const chart = await this.chartService.generateRasiChart(candidateData);

        if (!chart) continue;

        // Get Moon position and sign
        const moon = chart.planetaryPositions?.moon;
        if (!moon) continue;

        const moonAnalysis = {
          sign: moon.sign,
          degree: moon.longitude || 0,
          nakshatra: moon.nakshatra || 'Unknown',
          pada: moon.pada || 1
        };

        candidate.analyses.moon = moonAnalysis;

        // Calculate Moon-Ascendant relationship score
        const moonScore = this.calculateMoonAscendantRelationship(
          chart.ascendant,
          moonAnalysis
        );
        
        candidate.score += moonScore * 0.3; // Moon has 30% weight

        results.candidates.push({
          time: candidate.time,
          moon: moonAnalysis,
          ascendant: chart.ascendant,
          moonScore: moonScore,
          weightedScore: moonScore * 0.3
        });

      } catch (error) {
        analysis.analysisLog.push(`Error in Moon analysis for ${candidate.time}: ${error.message}`);
      }
    }

    results.bestCandidate = this.findBestCandidate(results.candidates, 'moonScore');
    analysis.analysisLog.push(`Moon analysis: best candidate ${results.bestCandidate?.time} with score ${results.bestCandidate?.moonScore}`);

    return results;
  }

  /**
   * Gulika Position Analysis Method  
   * Uses Gulika (son of Saturn) position for time verification
   */
  async performGulikaAnalysis(birthData, timeCandidates, analysis) {
    analysis.analysisLog.push('Starting Gulika position method analysis');
    
    const results = {
      method: 'Gulika',
      candidates: [], 
      bestCandidate: null
    };

    for (const candidate of timeCandidates) {
      try {
        const candidateData = { ...birthData, timeOfBirth: candidate.time };
        const chart = await this.chartService.generateRasiChart(candidateData);

        if (!chart) continue;

        // Calculate Gulika position (simplified calculation)
        const gulikaPosition = this.calculateGulikaPosition(candidate, chart);
        candidate.analyses.gulika = gulikaPosition;

        // Calculate Gulika relationship score
        const gulikaScore = this.calculateGulikaRelationship(
          chart.ascendant,
          gulikaPosition
        );
        
        candidate.score += gulikaScore * 0.2; // Gulika has 20% weight

        results.candidates.push({
          time: candidate.time,
          gulika: gulikaPosition,
          ascendant: chart.ascendant,
          gulikaScore: gulikaScore,
          weightedScore: gulikaScore * 0.2
        });

      } catch (error) {
        analysis.analysisLog.push(`Error in Gulika analysis for ${candidate.time}: ${error.message}`);
      }
    }

    results.bestCandidate = this.findBestCandidate(results.candidates, 'gulikaScore');
    analysis.analysisLog.push(`Gulika analysis: best candidate ${results.bestCandidate?.time} with score ${results.bestCandidate?.gulikaScore}`);

    return results;
  }

  /**
   * Event Correlation Method
   * Correlates life events with dasha periods for time verification
   */
  async performEventCorrelation(birthData, timeCandidates, lifeEvents, analysis) {
    analysis.analysisLog.push('Starting event correlation analysis');
    
    const results = {
      method: 'Event Correlation',
      candidates: [],
      bestCandidate: null
    };

    for (const candidate of timeCandidates) {
      try {
        const candidateData = { ...birthData, timeOfBirth: candidate.time };
        
        // Generate charts and dasha analysis
        const chart = await this.chartService.generateRasiChart(candidateData);
        if (!chart) continue;

        const dashaAnalysis = this.dashaService.analyzeAllDashas(chart);
        if (!dashaAnalysis) continue;

        // Calculate event correlation score
        const eventScore = this.calculateEventCorrelationScore(
          dashaAnalysis,
          lifeEvents,
          candidateData.dateOfBirth
        );

        candidate.score += eventScore * 0.1; // Events have 10% weight (optional)

        results.candidates.push({
          time: candidate.time,
          eventScore: eventScore,
          weightedScore: eventScore * 0.1,
          correlatedEvents: this.getCorrelatedEvents(dashaAnalysis, lifeEvents)
        });

      } catch (error) {
        analysis.analysisLog.push(`Error in event correlation for ${candidate.time}: ${error.message}`);
      }
    }

    results.bestCandidate = this.findBestCandidate(results.candidates, 'eventScore');
    analysis.analysisLog.push(`Event correlation: best candidate ${results.bestCandidate?.time} with score ${results.bestCandidate?.eventScore}`);

    return results;
  }

  /**
   * Calculate Praanapada position based on BPHS
   * Praanapada = Sun's position at birth + Birth time in palas
   */
  calculatePraanapada(candidate, chart) {
    try {
      // Get Sun's position
      const sunPosition = chart.planetaryPositions?.sun;
      if (!sunPosition || !sunPosition.longitude) {
        throw new Error('Sun position not available for Praanapada calculation');
      }

      // Convert birth time to palas
      const [hours, minutes] = candidate.time.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      const palas = totalMinutes / this.BPHS_CONSTANTS.PALA_PER_HOUR;

      // Calculate Praanapada (Sun's longitude + time in palas)
      const praanapadaLongitude = (sunPosition.longitude + palas) % 360;
      const praanapadaSign = this.longitudeToSign(praanapadaLongitude);
      const praanapadaDegree = praanapadaLongitude % 30;

      return {
        longitude: praanapadaLongitude,
        sign: praanapadaSign,
        degree: praanapadaDegree,
        palas: palas,
        calculation: `Sun ${sunPosition.longitude.toFixed(2)}° + ${palas.toFixed(2)} palas = ${praanapadaLongitude.toFixed(2)}°`
      };

    } catch (error) {
      throw new Error(`Praanapada calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate alignment score between ascendant and Praanapada
   */
  calculateAscendantAlignment(ascendant, praanapada) {
    if (!ascendant || !praanapada) return 0;

    // Calculate angular distance
    let ascLong = ascendant.longitude || 0;
    let praanLong = praanapada.longitude || 0;
    
    let distance = Math.abs(ascLong - praanLong);
    if (distance > 180) distance = 360 - distance;

    // Scoring: closer alignment = higher score
    let score = 100;
    if (distance > 10) score -= (distance - 10) * 0.5; // Deduction for angular distance
    if (score < 0) score = 0;

    // Bonus for same sign
    if (ascendant.sign === praanapada.sign) {
      score += 20;
    }

    return Math.round(score);
  }

  /**
   * Calculate Moon-Ascendant relationship score
   */
  calculateMoonAscendantRelationship(ascendant, moonAnalysis) {
    if (!ascendant || !moonAnalysis) return 0;

    let score = 50; // Base score

    // Moon in trine to ascendant (good relationship)
    if (this.isTrine(ascendant.sign, moonAnalysis.sign)) {
      score += 30;
    }

    // Moon in quadrant to ascendant (moderate relationship)  
    if (this.isQuadrant(ascendant.sign, moonAnalysis.sign)) {
      score += 20;
    }

    // Moon and ascendant in same sign (very good)
    if (ascendant.sign === moonAnalysis.sign) {
      score += 25;
    }

    // Moon in 12th from ascendant (challenging)
    if (this.isTwelfthy(ascendant.sign, moonAnalysis.sign)) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate Gulika position (simplified BPHS method)
   */
  calculateGulikaPosition(candidate, chart) {
    try {
      // Simplified Gulika calculation
      // In reality, this is complex and depends on day of week, sunrise, etc.
      
      const [hours, minutes] = candidate.time.split(':').map(Number);
      const dayOfWeek = new Date(candidate.dateOfBirth).getDay(); // 0 = Sunday
      
      // Get Saturn's position as reference
      const saturn = chart.planetaryPositions?.saturn;
      if (!saturn || !saturn.longitude) {
        throw new Error('Saturn position not available for Gulika calculation');
      }

      // Simplified Gulika calculation (placeholder for full BPHS calculation)
      const gulikaOffset = (dayOfWeek * 30 + hours * 1.25) % 360;
      const gulikaLongitude = (saturn.longitude + gulikaOffset) % 360;
      const gulikaSign = this.longitudeToSign(gulikaLongitude);

      return {
        longitude: gulikaLongitude,
        sign: gulikaSign,
        degree: gulikaLongitude % 30,
        dayOfWeek: dayOfWeek,
        calculation: `Saturn ${saturn.longitude.toFixed(2)}° + offset = ${gulikaLongitude.toFixed(2)}°`
      };

    } catch (error) {
      throw new Error(`Gulika calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate Gulika relationship score
   */
  calculateGulikaRelationship(ascendant, gulikaPosition) {
    if (!ascendant || !gulikaPosition) return 0;

    let score = 50; // Base score

    // Gulika in trine or quadrant to lagna is generally considered challenging
    // So we score opposite to Moon analysis
    if (this.isTrine(ascendant.sign, gulikaPosition.sign)) {
      score -= 20;
    }

    if (this.isQuadrant(ascendant.sign, gulikaPosition.sign)) {
      score -= 10;
    }

    if (ascendant.sign === gulikaPosition.sign) {
      score -= 25; // Gulika in lagna is considered challenging
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate event correlation score
   */
  calculateEventCorrelationScore(dashaAnalysis, lifeEvents, birthDate) {
    if (!dashaAnalysis || !lifeEvents || lifeEvents.length === 0) return 0;

    let score = 0;
    let matchedEvents = 0;

    for (const event of lifeEvents) {
      if (!event.date || !event.description) continue;

      try {
        const eventDate = new Date(event.date);
        const eventYear = eventDate.getFullYear();
        
        // Find dasha period for this year
        const dashaAtEvent = this.findDashaAtYear(dashaAnalysis, eventYear);
        
        if (dashaAtEvent) {
          // Check if event matches dasha significations
          const matchScore = this.calculateEventDashaMatch(event, dashaAtEvent);
          score += matchScore;
          matchedEvents++;
        }
      } catch (error) {
        // Skip invalid dates
        continue;
      }
    }

    return matchedEvents > 0 ? (score / matchedEvents) : 0;
  }

  /**
   * Synthesize all analysis results
   */
  synthesizeResults(analysis) {
    const candidates = this.combineAllCandidates(analysis.methods);
    
    if (candidates.length === 0) {
      return {
        rectifiedTime: analysis.originalData.timeOfBirth,
        confidence: 0,
        recommendations: ['Unable to rectify birth time with given data']
      };
    }

    // Sort candidates by total score
    candidates.sort((a, b) => b.totalScore - a.totalScore);
    
    const bestCandidate = candidates[0];
    const confidence = this.calculateOverallConfidence(bestCandidate, analysis);
    
    return {
      rectifiedTime: bestCandidate.time,
      confidence: confidence,
      recommendations: this.generateRecommendations(bestCandidate, confidence, analysis),
      analysis: {
        bestCandidate: bestCandidate,
        allCandidates: candidates.slice(0, 5), // Top 5 candidates
        methodBreakdown: this.getMethodBreakdown(analysis.methods)
      }
    };
  }

  /**
   * Helper methods
   */
  longitudeToSign(longitude) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const signIndex = Math.floor(longitude / 30) % 12;
    return signs[signIndex];
  }

  isTrine(sign1, sign2) {
    const sign1Index = this.getSignIndex(sign1);
    const sign2Index = this.getSignIndex(sign2);
    const difference = Math.abs(sign1Index - sign2Index) % 12;
    return difference === 4 || difference === 8; // 5th or 9th house
  }

  isQuadrant(sign1, sign2) {
    const sign1Index = this.getSignIndex(sign1);
    const sign2Index = this.getSignIndex(sign2);
    const difference = Math.abs(sign1Index - sign2Index) % 12;
    return difference === 3 || difference === 6 || difference === 9; // 4th, 7th, or 10th house
  }

  isTwelfthy(sign1, sign2) {
    const sign1Index = this.getSignIndex(sign1);
    const sign2Index = this.getSignIndex(sign2);
    return Math.abs(sign1Index - sign2Index) === 11; // 12th house
  }

  getSignIndex(sign) {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs.indexOf(sign);
  }

  findBestCandidate(candidates, scoreField) {
    if (!candidates || candidates.length === 0) return null;
    return candidates.reduce((best, current) => 
      current[scoreField] > best[scoreField] ? current : best
    );
  }

  combineAllCandidates(methods) {
    const candidateMap = new Map();

    // Combine candidates from all methods
    Object.values(methods).forEach(method => {
      if (method.candidates) {
        method.candidates.forEach(candidate => {
          if (candidateMap.has(candidate.time)) {
            const existing = candidateMap.get(candidate.time);
            existing.totalScore += candidate.weightedScore || 0;
            existing.methods.push(method.method);
          } else {
            candidateMap.set(candidate.time, {
              ...candidate,
              totalScore: candidate.weightedScore || 0,
              methods: [method.method]
            });
          }
        });
      }
    });

    return Array.from(candidateMap.values());
  }

  calculateOverallConfidence(bestCandidate, analysis) {
    let confidence = 30; // Base confidence

    // Add confidence based on total score
    confidence += Math.min(bestCandidate.totalScore * 0.5, 40);

    // Add confidence for multiple method agreement
    confidence += Math.min(bestCandidate.methods.length * 10, 20);

    // Check consistency across methods
    if (this.checkMethodConsistency(analysis.methods)) {
      confidence += 10;
    }

    return Math.min(confidence, 100);
  }

  checkMethodConsistency(methods) {
    const methodResults = Object.values(methods)
      .filter(method => method.bestCandidate && method.bestCandidate.time);

    if (methodResults.length < 2) return false;

    // Check if best candidates from different methods are close in time
    const firstTime = methodResults[0].bestCandidate.time;
    return methodResults.every(method => {
      const timeDifference = this.getTimeDifference(firstTime, method.bestCandidate.time);
      return timeDifference <= 30; // Within 30 minutes
    });
  }

  getTimeDifference(time1, time2) {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return Math.abs((h1 * 60 + m1) - (h2 * 60 + m2));
  }

  generateRecommendations(bestCandidate, confidence, analysis) {
    const recommendations = [];

    if (confidence >= 80) {
      recommendations.push(`High confidence (${confidence}%) in rectified birth time: ${bestCandidate.time}`);
      recommendations.push('This time shows strong alignment across BPHS rectification methods');
    } else if (confidence >= 60) {
      recommendations.push(`Moderate confidence (${confidence}%) in rectified birth time: ${bestCandidate.time}`); 
      recommendations.push('Consider providing additional life events for improved accuracy');
    } else {
      recommendations.push(`Low confidence (${confidence}%) in rectification results`);
      recommendations.push('Original birth time may be more accurate than rectification');
      recommendations.push('Consult experienced astrologer for deeper analysis');
    }

    // Method-specific recommendations
    if (analysis.methods.praanapada?.bestCandidate?.time === bestCandidate.time) {
      recommendations.push('Praanapada method strongly supports this birth time');
    }

    if (analysis.methods.moon?.bestCandidate?.time === bestCandidate.time) {
      recommendations.push('Moon position method confirms this birth time');
    }

    return recommendations;
  }

  getMethodBreakdown(methods) {
    return {
      praanapada: methods.praanapada ? 'Completed' : 'Not available',
      moon: methods.moon ? 'Completed' : 'Not available',
      gulika: methods.gulika ? 'Completed' : 'Not available',
      events: methods.events ? 'Completed' : 'Not provided'
    };
  }

  findDashaAtYear(dashaAnalysis, year) {
    // Simplified method to find dasha at given year
    // In production, this would use actual dasha calculations
    if (dashaAnalysis?.timeline) {
      return dashaAnalysis.timeline.find(dasha => 
        year >= dasha.startYear && year <= dasha.endYear
      );
    }
    return null;
  }

  calculateEventDashaMatch(event, dasha) {
    // Simplified event matching (would be more sophisticated in production)
    let score = 50;

    const eventLower = event.description.toLowerCase();
    const dashaLower = dasha.dashaLord?.toLowerCase() || '';

    // Career events
    if (eventLower.includes('job') || eventLower.includes('career') || eventLower.includes('work')) {
      if (dashaLower.includes('saturn') || dashaLower.includes('mercury')) {
        score += 30;
      }
    }

    // Marriage events
    if (eventLower.includes('marriage') || eventLower.includes('wedding')) {
      if (dashaLower.includes('venus') || dashaLower.includes('jupiter')) {
        score += 30;
      }
    }

    // Education events
    if (eventLower.includes('education') || eventLower.includes('study') || eventLower.includes('graduation')) {
      if (dashaLower.includes('jupiter') || dashaLower.includes('mercury')) {
        score += 30;
      }
    }

    return score;
  }

  getCorrelatedEvents(dashaAnalysis, lifeEvents) {
    // Return events that correlate well with dasha periods
    return lifeEvents.map(event => ({
      ...event,
      correlation: this.calculateEventDashaMatch(event, dashaAnalysis)
    }));
  }

  /**
   * Generate quick recommendations for single time validation
   */
  generateQuickRecommendations(proposedTime, score, chart) {
    const recommendations = [];

    if (score >= 80) {
      recommendations.push(`Excellent alignment (score: ${score}%) for birth time ${proposedTime}`);
      recommendations.push('This time shows strong Praanapada and Moon alignment');
    } else if (score >= 60) {
      recommendations.push(`Good alignment (score: ${score}%) for birth time ${proposedTime}`);
      recommendations.push('This time is reasonably aligned but could be improved');
    } else if (score >= 40) {
      recommendations.push(`Moderate alignment (score: ${score}%) for birth time ${proposedTime}`);
      recommendations.push('Consider more accurate birth if possible');
    } else {
      recommendations.push(`Poor alignment (score: ${score}%) for birth time ${proposedTime}`);
      recommendations.push('This time may not be accurate - consider rectification');
    }

    // Add specific insights
    if (chart.ascendant && chart.ascendant.sign) {
      recommendations.push(`Ascendant detected as ${chart.ascendant.sign} for this time`);
    }

    if (chart.moon && chart.moon.sign) {
      recommendations.push(`Moon in ${chart.moon.sign} sign at birth`);
    }

    return recommendations;
  }
}

export default BirthTimeRectificationService;
