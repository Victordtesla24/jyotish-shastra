/**
 * Yoga Detection Service
 * Detects and analyzes classical Vedic yogas according to Brihat Parashara Hora Shastra
 * Implements comprehensive yoga detection for accurate astrological analysis
 */

import RajaYogaCalculator from '../../core/analysis/yogas/RajaYogaCalculator.js';
import DhanaYogaCalculator from '../../core/analysis/yogas/DhanaYogaCalculator.js';
import GajaKesariYogaCalculator from '../../core/analysis/yogas/GajaKesariYogaCalculator.js';
import ViparitaRajaYogaCalculator from '../../core/analysis/yogas/ViparitaRajaYogaCalculator.js';
import PanchMahapurushaYogaCalculator from '../../core/analysis/yogas/PanchMahapurushaYogaCalculator.js';
import NeechaBhangaYogaCalculator from '../../core/analysis/yogas/NeechaBhangaYogaCalculator.js';

class YogaDetectionService {
  constructor() {
    this.rajaYogaCalculator = new RajaYogaCalculator();
    this.dhanaYogaCalculator = new DhanaYogaCalculator();
    this.gajaKesariYogaCalculator = new GajaKesariYogaCalculator();
    this.viparitaRajaYogaCalculator = new ViparitaRajaYogaCalculator();
    this.panchMahapurushaYogaCalculator = new PanchMahapurushaYogaCalculator();
    this.neechaBhangaYogaCalculator = new NeechaBhangaYogaCalculator();
  }

  /**
   * Detect all yogas in the chart - Architecture compliant method
   * @param {Object} chart - Complete birth chart data
   * @returns {Object} All detected yogas
   */
  detectAllYogas(chart) {
    try {
      const rajaYogas = this.rajaYogaCalculator.detectRajaYogas(chart);
      const dhanaYogas = this.dhanaYogaCalculator.detectDhanaYogas(chart);
      const gajaKesariYoga = this.gajaKesariYogaCalculator.detectGajaKesariYoga(chart);
      const viparitaRajaYogas = this.viparitaRajaYogaCalculator.detectViparitaRajaYogas(chart);
      const panchMahapurushaYogas = this.panchMahapurushaYogaCalculator.detectPanchMahapurushaYogas(chart);
      const neechaBhangaYogas = this.neechaBhangaYogaCalculator.detectNeechaBhangaYogas(chart);

      return {
        rajaYogas,
        dhanaYogas,
        gajaKesariYoga,
        viparitaRajaYogas,
        panchMahapurushaYogas,
        neechaBhangaYogas,
        summary: this.generateYogaSummary({
          rajaYogas,
          dhanaYogas,
          gajaKesariYoga,
          viparitaRajaYogas,
          panchMahapurushaYogas,
          neechaBhangaYogas
        })
      };
    } catch (error) {
      console.error('Error detecting yogas:', error);
      return {
        rajaYogas: { hasRajaYoga: false, yogas: [], error: error.message },
        dhanaYogas: { hasDhanaYoga: false, yogas: [], error: error.message },
        gajaKesariYoga: { hasGajaKesariYoga: false, error: error.message },
        viparitaRajaYogas: { hasViparitaRajaYoga: false, yogas: [], error: error.message },
        panchMahapurushaYogas: { hasPanchMahapurushaYoga: false, yogas: [], error: error.message },
        neechaBhangaYogas: { hasNeechaBhangaYoga: false, yogas: [], error: error.message },
        summary: { totalYogas: 0, error: error.message }
      };
    }
  }

  /**
   * Generate comprehensive yoga summary
   * @param {Object} allYogas - All detected yogas
   * @returns {Object} Yoga summary
   */
  generateYogaSummary(allYogas) {
    const summary = {
      totalYogas: 0,
      beneficYogas: 0,
      challengingYogas: 0,
      overallStrength: 'None',
      keyFindings: [],
      predominantPattern: 'Balanced'
    };

    try {
      if (allYogas.rajaYogas?.hasRajaYoga) {
        summary.totalYogas += allYogas.rajaYogas.totalCount || 0;
        summary.beneficYogas += allYogas.rajaYogas.totalCount || 0;
      }

      if (allYogas.dhanaYogas?.hasDhanaYoga) {
        summary.totalYogas += allYogas.dhanaYogas.totalCount || 0;
        summary.beneficYogas += allYogas.dhanaYogas.totalCount || 0;
      }

      if (allYogas.gajaKesariYoga?.hasGajaKesariYoga) {
        summary.totalYogas += 1;
        summary.beneficYogas += 1;
      }

      if (allYogas.viparitaRajaYogas?.hasViparitaRajaYoga) {
        summary.totalYogas += allYogas.viparitaRajaYogas.totalCount || 0;
        summary.beneficYogas += allYogas.viparitaRajaYogas.totalCount || 0;
      }

      if (allYogas.panchMahapurushaYogas?.hasPanchMahapurushaYoga) {
        summary.totalYogas += allYogas.panchMahapurushaYogas.totalCount || 0;
        summary.beneficYogas += allYogas.panchMahapurushaYogas.totalCount || 0;
      }

      if (allYogas.neechaBhangaYogas?.hasNeechaBhangaYoga) {
        summary.totalYogas += allYogas.neechaBhangaYogas.yogas?.length || 0;
        summary.beneficYogas += allYogas.neechaBhangaYogas.yogas?.length || 0;
      }

      if (summary.beneficYogas >= 5) summary.overallStrength = 'Excellent';
      else if (summary.beneficYogas >= 3) summary.overallStrength = 'Very Good';
      else if (summary.beneficYogas >= 2) summary.overallStrength = 'Good';
      else if (summary.beneficYogas >= 1) summary.overallStrength = 'Average';

      if (allYogas.rajaYogas?.hasRajaYoga) {
        summary.keyFindings.push('Raja Yogas indicate potential for authority and high status');
      }
      if (allYogas.dhanaYogas?.hasDhanaYoga) {
        summary.keyFindings.push('Dhana Yogas show strong wealth accumulation potential');
      }
      if (allYogas.gajaKesariYoga?.hasGajaKesariYoga) {
        summary.keyFindings.push('Gaja Kesari Yoga confers wisdom, fame and prosperity');
      }
      if (allYogas.panchMahapurushaYogas?.hasPanchMahapurushaYoga) {
        summary.keyFindings.push('Panch Mahapurusha Yogas indicate exceptional personality traits');
      }
      if (allYogas.neechaBhangaYogas?.hasNeechaBhangaYoga) {
        summary.keyFindings.push('Neecha Bhanga Yogas transform weakness into strength');
      }

      if ((allYogas.rajaYogas?.totalCount || 0) >= 2) summary.predominantPattern = 'Raja Yoga Dominant';
      else if ((allYogas.dhanaYogas?.totalCount || 0) >= 2) summary.predominantPattern = 'Wealth Yoga Dominant';
      else if (allYogas.panchMahapurushaYogas?.hasPanchMahapurushaYoga) summary.predominantPattern = 'Mahapurusha Yoga Present';
      else if (allYogas.gajaKesariYoga?.hasGajaKesariYoga) summary.predominantPattern = 'Gaja Kesari Yoga Present';

      return summary;
    } catch (error) {
      console.error('Error generating yoga summary:', error);
      return { ...summary, error: error.message };
    }
  }
}

export default YogaDetectionService;
