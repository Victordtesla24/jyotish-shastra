import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/cards/Card';

const DashaAnalysisSection = ({ data }) => {
  // Extract dasha data from the API response
  const dashaData = data?.dashaAnalysis || data || {};

  // Safe extraction with fallbacks
  const currentDasha = dashaData?.current_dasha || dashaData?.currentDasha || {};
  const dashaSequence = dashaData?.dasha_sequence || dashaData?.dashaSequence || [];
  const significantPeriods = dashaData?.significant_periods || dashaData?.significantPeriods || [];
  const antardashas = dashaData?.antardashas || dashaData?.antardashas || [];

  // Default dasha sequence if not provided
  const defaultDashaSequence = [
    { planet: 'Sun', years: 6, Sanskrit: 'सूर्य', description: 'Leadership, authority, health, career' },
    { planet: 'Moon', years: 10, Sanskrit: 'चन्द्र', description: 'Emotions, mind, mother, travels' },
    { planet: 'Mars', years: 7, Sanskrit: 'मंगल', description: 'Energy, conflicts, property, siblings' },
    { planet: 'Rahu', years: 18, Sanskrit: 'राहु', description: 'Ambition, foreign connections, technology' },
    { planet: 'Jupiter', years: 16, Sanskrit: 'गुरु', description: 'Wisdom, prosperity, spirituality, children' },
    { planet: 'Saturn', years: 19, Sanskrit: 'शनि', description: 'Discipline, delays, hard work, service' },
    { planet: 'Mercury', years: 17, Sanskrit: 'बुध', description: 'Communication, business, education, skills' },
    { planet: 'Ketu', years: 7, Sanskrit: 'केतु', description: 'Spirituality, detachment, past karma' },
    { planet: 'Venus', years: 20, Sanskrit: 'शुक्र', description: 'Love, creativity, luxury, relationships' }
  ];

  const dashaInfo = dashaSequence.length > 0 ? dashaSequence : defaultDashaSequence;

  return (
    <motion.div
      className="dasha-analysis-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Section Header */}
      <Card className="mb-6 shadow-vedic-medium border border-cosmic-purple/20">
        <CardHeader className="bg-gradient-to-r from-cosmic-purple/10 to-stellar-blue/10">
          <CardTitle className="font-serif text-vedic-gradient flex items-center gap-2">
            <span className="text-2xl animate-pulse">⏰</span>
            Dasha Analysis - Timeline of Life Events
            <span className="text-lg">दशा विश्लेषण</span>
          </CardTitle>
          <p className="text-wisdom-gray font-medium mt-2">
            Explore the planetary periods that influence your life journey and timing of events
          </p>
        </CardHeader>
      </Card>

      {/* Current Dasha Information */}
      <Card className="mb-6 shadow-vedic-medium border border-vedic-gold/20">
        <CardHeader className="bg-gradient-to-r from-vedic-gold/10 to-vedic-saffron/10">
          <CardTitle className="font-serif text-vedic-gradient flex items-center gap-2">
            <span className="text-xl">🌟</span>
            Current Dasha Period
            <span className="text-base">वर्तमान दशा</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-br from-sacred-white to-vedic-gold/5">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-vedic-gold/10 p-4 rounded-lg border border-vedic-gold/20">
                <h4 className="font-serif font-bold text-earth-brown text-lg mb-2">
                  Active Dasha: {currentDasha.planet || 'Not specified'}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-vedic-saffron font-medium">Remaining Period:</span>
                    <span className="text-earth-brown font-semibold">
                      {currentDasha.remainingYears || 'N/A'} years
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-vedic-saffron font-medium">Age Range:</span>
                    <span className="text-earth-brown font-semibold">
                      {currentDasha.startAge || 'N/A'} - {currentDasha.endAge || 'N/A'} years
                    </span>
                  </div>
                </div>
              </div>

              {currentDasha.description && (
                <div className="bg-cosmic-purple/10 p-4 rounded-lg border border-cosmic-purple/20">
                  <h5 className="font-serif font-semibold text-cosmic-purple mb-2">
                    Dasha Influence
                  </h5>
                  <p className="text-wisdom-gray leading-relaxed">
                    {currentDasha.description}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-lunar-silver/10 p-4 rounded-lg border border-lunar-silver/20">
                <h5 className="font-serif font-semibold text-cosmic-purple mb-3">
                  Planetary Significance
                </h5>
                <div className="text-sm space-y-1">
                  {currentDasha.planet && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-vedic-gold rounded-full"></span>
                      <span className="text-wisdom-gray">
                        {currentDasha.planet} dasha brings focus on {
                          currentDasha.planet === 'Sun' ? 'leadership, authority, and career' :
                          currentDasha.planet === 'Moon' ? 'emotions, mind, and maternal influences' :
                          currentDasha.planet === 'Mars' ? 'energy, action, and property matters' :
                          currentDasha.planet === 'Mercury' ? 'communication, business, and learning' :
                          currentDasha.planet === 'Jupiter' ? 'wisdom, prosperity, and spirituality' :
                          currentDasha.planet === 'Venus' ? 'love, creativity, and luxury' :
                          currentDasha.planet === 'Saturn' ? 'discipline, hard work, and service' :
                          currentDasha.planet === 'Rahu' ? 'ambition, foreign connections, and innovation' :
                          currentDasha.planet === 'Ketu' ? 'spirituality, detachment, and past karma' :
                          'personal growth and development'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {currentDasha.remedies && (
                <div className="bg-vedic-lotus/10 p-4 rounded-lg border border-vedic-lotus/20">
                  <h5 className="font-serif font-semibold text-cosmic-purple mb-2">
                    Recommended Remedies
                  </h5>
                  <ul className="text-sm space-y-1">
                    {currentDasha.remedies.map((remedy, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-vedic-lotus mt-1">•</span>
                        <span className="text-wisdom-gray">{remedy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Dasha Sequence */}
      <Card className="mb-6 shadow-vedic-medium border border-stellar-blue/20">
        <CardHeader className="bg-gradient-to-r from-stellar-blue/10 to-cosmic-purple/10">
          <CardTitle className="font-serif text-vedic-gradient flex items-center gap-2">
            <span className="text-xl">📅</span>
            Complete Dasha Sequence
            <span className="text-base">दशा क्रम</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-br from-sacred-white to-stellar-blue/5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashaInfo.map((dasha, index) => {
              const isActive = currentDasha.planet === dasha.planet;
              return (
                <motion.div
                  key={dasha.planet}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    isActive
                      ? 'bg-vedic-gold/20 border-vedic-gold border-2 shadow-vedic-medium'
                      : 'bg-gradient-to-br from-sacred-white to-vedic-background border-vedic-saffron/20 hover:shadow-vedic-soft'
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center font-bold text-white ${
                      isActive ? 'bg-vedic-gold animate-pulse' : 'bg-cosmic-purple'
                    }`}>
                      {dasha.planet === 'Sun' ? '☉' :
                       dasha.planet === 'Moon' ? '☽' :
                       dasha.planet === 'Mars' ? '♂' :
                       dasha.planet === 'Mercury' ? '☿' :
                       dasha.planet === 'Jupiter' ? '♃' :
                       dasha.planet === 'Venus' ? '♀' :
                       dasha.planet === 'Saturn' ? '♄' :
                       dasha.planet === 'Rahu' ? '☊' :
                       dasha.planet === 'Ketu' ? '☋' :
                       dasha.planet.charAt(0)}
                    </div>
                    <h4 className={`font-serif font-bold text-lg mb-1 ${
                      isActive ? 'text-vedic-gold' : 'text-earth-brown'
                    }`}>
                      {dasha.planet}
                    </h4>
                    <div className="text-xs text-wisdom-gray mb-2">
                      {dasha.Sanskrit}
                    </div>
                    <div className={`text-sm font-medium mb-3 ${
                      isActive ? 'text-vedic-gold' : 'text-cosmic-purple'
                    }`}>
                      {dasha.years} years
                    </div>
                    <div className="text-xs text-wisdom-gray leading-relaxed">
                      {dasha.description}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Antardasha Periods */}
      {antardashas.length > 0 && (
        <Card className="mb-6 shadow-vedic-medium border border-vedic-lotus/20">
          <CardHeader className="bg-gradient-to-r from-vedic-lotus/10 to-lunar-silver/10">
            <CardTitle className="font-serif text-vedic-gradient flex items-center gap-2">
              <span className="text-xl">🔄</span>
              Antardasha Periods
              <span className="text-base">अन्तर्दशा</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-gradient-to-br from-sacred-white to-vedic-lotus/5">
            <div className="space-y-4">
              {antardashas.map((antardasha, index) => (
                <div key={index} className="bg-lunar-silver/10 p-4 rounded-lg border border-lunar-silver/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-serif font-semibold text-cosmic-purple">
                        {antardasha.planet} Antardasha
                      </h5>
                      <div className="text-sm text-wisdom-gray">
                        {antardasha.startDate} - {antardasha.endDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-earth-brown">
                        {antardasha.duration}
                      </div>
                    </div>
                  </div>
                  {antardasha.description && (
                    <p className="text-sm text-wisdom-gray mt-2 leading-relaxed">
                      {antardasha.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Significant Periods */}
      {significantPeriods.length > 0 && (
        <Card className="mb-6 shadow-vedic-medium border border-earth-brown/20">
          <CardHeader className="bg-gradient-to-r from-earth-brown/10 to-wisdom-gray/10">
            <CardTitle className="font-serif text-vedic-gradient flex items-center gap-2">
              <span className="text-xl">⭐</span>
              Significant Life Periods
              <span className="text-base">महत्वपूर्ण काल</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-gradient-to-br from-sacred-white to-earth-brown/5">
            <div className="space-y-4">
              {significantPeriods.map((period, index) => (
                <div key={index} className="bg-earth-brown/10 p-4 rounded-lg border border-earth-brown/20">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-serif font-semibold text-earth-brown text-lg mb-2">
                        {period.title}
                      </h5>
                      <div className="text-sm text-wisdom-gray mb-2">
                        Age: {period.ageRange} | Period: {period.period}
                      </div>
                      <p className="text-sm text-wisdom-gray leading-relaxed">
                        {period.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <div className={`w-4 h-4 rounded-full ${
                        period.importance === 'high' ? 'bg-red-500' :
                        period.importance === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dasha Remedies and Guidance */}
      <Card className="mb-6 shadow-vedic-medium border border-vedic-lotus/20">
        <CardHeader className="bg-gradient-to-r from-vedic-lotus/10 to-vedic-saffron/10">
          <CardTitle className="font-serif text-vedic-gradient flex items-center gap-2">
            <span className="text-xl">🙏</span>
            Dasha Remedies & Guidance
            <span className="text-base">उपाय और मार्गदर्शन</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-br from-sacred-white to-vedic-lotus/5">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-serif font-semibold text-cosmic-purple mb-4">
                General Recommendations
              </h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-vedic-lotus mt-1">•</span>
                  <span className="text-wisdom-gray">
                    Understand that each dasha brings different life themes and opportunities
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-vedic-lotus mt-1">•</span>
                  <span className="text-wisdom-gray">
                    Align your actions with the planetary influence of the current dasha
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-vedic-lotus mt-1">•</span>
                  <span className="text-wisdom-gray">
                    Use favorable dasha periods for major life decisions and initiatives
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-vedic-lotus mt-1">•</span>
                  <span className="text-wisdom-gray">
                    Practice patience and spiritual growth during challenging dasha periods
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-serif font-semibold text-cosmic-purple mb-4">
                Spiritual Practices
              </h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-vedic-lotus mt-1">•</span>
                  <span className="text-wisdom-gray">
                    Regular meditation and spiritual practices for mental clarity
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-vedic-lotus mt-1">•</span>
                  <span className="text-wisdom-gray">
                    Chanting mantras specific to the ruling dasha planet
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-vedic-lotus mt-1">•</span>
                  <span className="text-wisdom-gray">
                    Charitable activities and service to others during difficult periods
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-vedic-lotus mt-1">•</span>
                  <span className="text-wisdom-gray">
                    Studying sacred texts and seeking guidance from learned teachers
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashaAnalysisSection;
