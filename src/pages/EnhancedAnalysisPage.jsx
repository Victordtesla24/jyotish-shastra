import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Enhanced Components
import {
  VedicPageTransition,
  VedicFloatingButton,
  VedicLoadingOverlay,
  VedicHoverCard,
  VedicRevealOnScroll,
  VedicStaggeredList,
  SacredCounter
} from '../components/animations/VedicAnimations';

import {
  SacredText,
  MantraWheel,
  VedicQuote,
  VedicHeading,
  BreathingText
} from '../components/ui/typography/VedicTypography';

import SacredGeometry from '../components/patterns/SacredGeometry';

// Existing Components
import { Card, CardContent, Button } from '../components/ui';

const EnhancedAnalysisPage = ({ analysisData }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [showMeditation, setShowMeditation] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Sample analysis data structure
  const sampleAnalysisData = {
    overview: {
      coreTraits: [
        "Natural born leader with strong Jupiter influence",
        "Creative and artistic tendencies from Venus placement",
        "Deep spiritual inclination through Ketu positioning",
        "Strong communication skills via Mercury conjunction",
        "Emotional intelligence from well-placed Moon"
      ],
      strengths: ["Leadership", "Creativity", "Spirituality", "Communication"],
      challenges: ["Impatience", "Overthinking", "Material attachment"]
    },
    planetary: {
      sun: { sign: "Leo", house: 1, strength: "Strong", influence: "Leadership and authority" },
      moon: { sign: "Cancer", house: 10, strength: "Excellent", influence: "Public image and career" },
      jupiter: { sign: "Sagittarius", house: 5, strength: "Exalted", influence: "Wisdom and knowledge" }
    },
    predictions: [
      { period: "2024-2026", focus: "Career Growth", description: "Significant professional advancement expected" },
      { period: "2026-2028", focus: "Spiritual Development", description: "Deep inner transformation period" },
      { period: "2028-2030", focus: "Relationships", description: "Important partnerships and unions" }
    ]
  };

  const sections = [
    { id: 'overview', title: 'Overview', icon: '🌟', mantra: 'ॐ गणेशाय नमः' },
    { id: 'planetary', title: 'Planetary Analysis', icon: '🪐', mantra: 'ॐ नवग्रहाय नमः' },
    { id: 'predictions', title: 'Life Predictions', icon: '🔮', mantra: 'ॐ कालाय नमः' },
    { id: 'remedies', title: 'Sacred Remedies', icon: '💎', mantra: 'ॐ शान्तिकराय नमः' }
  ];

  return (
    <VedicPageTransition direction="cosmic">
      {/* Loading Overlay */}
      <VedicLoadingOverlay
        isVisible={isLoading}
        message="Consulting the cosmic wisdom of ancient sages..."
      />

      {/* Background Sacred Geometry */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10">
          <SacredGeometry pattern="mandala" size="medium" opacity={0.05} animated />
        </div>
        <div className="absolute bottom-10 right-10">
          <SacredGeometry pattern="lotus" size="medium" opacity={0.05} animated />
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <SacredGeometry pattern="omkara" size="large" opacity={0.03} animated />
        </div>
      </div>

      <div className="relative min-h-screen bg-vedic-background">
        <div className="vedic-container py-12">

          {/* Sacred Header */}
          <VedicRevealOnScroll direction="up">
            <div className="text-center mb-16">
              <SacredText
                sanskrit="ज्योतिषं विद्या परमा"
                transliteration="Jyotisham Vidya Parama"
                translation="Astrology is the supreme knowledge"
                size="large"
                className="mb-8"
              />

              <VedicHeading
                title="Sacred Analysis Illumination"
                sanskrit="पवित्र विश्लेषण प्रकाश"
                level={1}
                decoration={true}
              />

              <div className="mt-8">
                <MantraWheel mantras={sections.map(s => ({
                  sanskrit: s.mantra,
                  transliteration: s.title,
                  meaning: `Guidance for ${s.title}`
                }))} />
              </div>
            </div>
          </VedicRevealOnScroll>

          {/* Navigation */}
          <VedicRevealOnScroll direction="up" delay={0.2}>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {sections.map((section, index) => (
                <VedicHoverCard key={section.id} className="cursor-pointer">
                  <motion.button
                    onClick={() => setActiveSection(section.id)}
                    className={`px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-vedic-primary to-vedic-secondary text-white shadow-cosmic'
                        : 'bg-vedic-surface text-vedic-text hover:bg-vedic-primary/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-2xl mr-3">{section.icon}</span>
                    {section.title}
                  </motion.button>
                </VedicHoverCard>
              ))}
            </div>
          </VedicRevealOnScroll>

          {/* Main Content */}
          <div className="space-y-8">

            {/* Overview Section */}
            {activeSection === 'overview' && (
              <VedicRevealOnScroll direction="up" delay={0.3}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* Core Traits */}
                  <div className="lg:col-span-2">
                    <VedicHoverCard>
                      <Card variant="cosmic" decorative>
                        <CardContent className="p-8">
                          <h3 className="text-2xl font-cinzel font-bold text-vedic-text mb-6 flex items-center gap-3">
                            <span className="text-3xl">✨</span>
                            Core Personality Traits
                          </h3>

                          <VedicStaggeredList stagger={0.2}>
                            {sampleAnalysisData.overview.coreTraits.map((trait, index) => (
                              <motion.div
                                key={index}
                                className="flex items-start gap-4 p-4 rounded-xl bg-vedic-background/50 mb-3"
                                whileHover={{ scale: 1.02, x: 10 }}
                              >
                                <div className="w-8 h-8 bg-gradient-to-r from-vedic-accent to-gold-pure rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {index + 1}
                                </div>
                                <p className="text-vedic-text flex-1">{trait}</p>
                              </motion.div>
                            ))}
                          </VedicStaggeredList>

                          {/* Strength Meters */}
                          <div className="mt-8 p-6 bg-gradient-to-r from-vedic-background to-saffron-subtle rounded-xl">
                            <h4 className="font-cinzel font-bold text-vedic-text mb-6">Cosmic Strength Analysis</h4>
                            <div className="space-y-4">
                              {sampleAnalysisData.overview.strengths.map((strength, index) => (
                                <div key={strength} className="flex items-center gap-4">
                                  <span className="w-24 text-sm text-vedic-text-light font-medium">{strength}</span>
                                  <div className="flex-1 h-3 bg-vedic-border rounded-full overflow-hidden">
                                    <motion.div
                                      className="h-full bg-gradient-to-r from-vedic-primary to-vedic-accent rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${Math.random() * 30 + 70}%` }}
                                      transition={{ duration: 1, delay: index * 0.2 }}
                                    />
                                  </div>
                                  <span className="text-sm text-vedic-accent font-bold">
                                    <SacredCounter end={Math.floor(Math.random() * 30 + 70)} suffix="%" />
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </VedicHoverCard>
                  </div>

                  {/* Sacred Insights */}
                  <div className="space-y-6">
                    <VedicHoverCard>
                      <Card variant="vedic" decorative>
                        <CardContent className="p-6 text-center">
                          <div className="mb-4">
                            <SacredGeometry pattern="yantra" size="medium" opacity={0.3} animated />
                          </div>
                          <h4 className="font-cinzel font-bold text-vedic-text mb-4">Sacred Numbers</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-vedic-accent mb-1">
                                <SacredCounter end={7} />
                              </div>
                              <div className="text-sm text-vedic-text-light">Life Path</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-vedic-accent mb-1">
                                <SacredCounter end={3} />
                              </div>
                              <div className="text-sm text-vedic-text-light">Soul Number</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </VedicHoverCard>

                    <VedicQuote
                      sanskrit="सत्यं वद धर्मं चर"
                      quote="Speak the truth, practice righteousness"
                      author="Taittiriya Upanishad"
                      className="text-sm"
                    />
                  </div>
                </div>
              </VedicRevealOnScroll>
            )}

            {/* Planetary Section */}
            {activeSection === 'planetary' && (
              <VedicRevealOnScroll direction="up" delay={0.3}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(sampleAnalysisData.planetary).map(([planet, data], index) => (
                    <VedicHoverCard key={planet}>
                      <Card variant="celestial" decorative>
                        <CardContent className="p-6 text-center">
                          <motion.div
                            className="text-4xl mb-4"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10 + index * 2, repeat: Infinity, ease: "linear" }}
                          >
                            {planet === 'sun' ? '☀️' : planet === 'moon' ? '🌙' : '♃'}
                          </motion.div>
                          <h3 className="text-xl font-cinzel font-bold text-vedic-text mb-4 capitalize">
                            {planet}
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-vedic-text-light">Sign:</span>
                              <span className="text-vedic-text font-medium">{data.sign}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-vedic-text-light">House:</span>
                              <span className="text-vedic-text font-medium">{data.house}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-vedic-text-light">Strength:</span>
                              <span className="text-vedic-accent font-bold">{data.strength}</span>
                            </div>
                          </div>
                          <p className="text-xs text-vedic-text-light mt-4 leading-relaxed">
                            {data.influence}
                          </p>
                        </CardContent>
                      </Card>
                    </VedicHoverCard>
                  ))}
                </div>
              </VedicRevealOnScroll>
            )}

            {/* Predictions Section */}
            {activeSection === 'predictions' && (
              <VedicRevealOnScroll direction="up" delay={0.3}>
                <div className="space-y-6">
                  {sampleAnalysisData.predictions.map((prediction, index) => (
                    <VedicHoverCard key={index}>
                      <Card variant="cosmic" decorative>
                        <CardContent className="p-8">
                          <div className="flex items-start gap-6">
                            <motion.div
                              className="text-4xl"
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                            >
                              🔮
                            </motion.div>
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-4">
                                <h3 className="text-xl font-cinzel font-bold text-vedic-text">
                                  {prediction.period}
                                </h3>
                                <span className="px-3 py-1 bg-vedic-accent/20 text-vedic-accent rounded-full text-sm font-medium">
                                  {prediction.focus}
                                </span>
                              </div>
                              <p className="text-vedic-text-light leading-relaxed">
                                {prediction.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </VedicHoverCard>
                  ))}
                </div>
              </VedicRevealOnScroll>
            )}

            {/* Remedies Section */}
            {activeSection === 'remedies' && (
              <VedicRevealOnScroll direction="up" delay={0.3}>
                <div className="text-center">
                  <BreathingText
                    text="Sacred Remedies & Meditation"
                    breatheIn="Inhale Peace"
                    breatheOut="Exhale Gratitude"
                    className="mb-12"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { type: 'Gemstone', item: 'Yellow Sapphire', benefit: 'Enhances Jupiter\'s blessing' },
                      { type: 'Mantra', item: 'ॐ गुरवे नमः', benefit: 'Spiritual growth and wisdom' },
                      { type: 'Yantra', item: 'Sri Yantra', benefit: 'Prosperity and abundance' },
                      { type: 'Charity', item: 'Feed the Hungry', benefit: 'Karmic purification' },
                      { type: 'Meditation', item: 'Daily Pranayama', benefit: 'Mental clarity and peace' },
                      { type: 'Ritual', item: 'Ganga Aarti', benefit: 'Spiritual purification' }
                    ].map((remedy, index) => (
                      <VedicHoverCard key={index}>
                        <Card variant="vedic" decorative>
                          <CardContent className="p-6 text-center">
                            <motion.div
                              className="text-3xl mb-4"
                              whileHover={{ scale: 1.2, rotate: 10 }}
                            >
                              💎
                            </motion.div>
                            <h4 className="font-cinzel font-bold text-vedic-text mb-2">
                              {remedy.type}
                            </h4>
                            <p className="text-vedic-accent font-medium mb-3">
                              {remedy.item}
                            </p>
                            <p className="text-sm text-vedic-text-light leading-relaxed">
                              {remedy.benefit}
                            </p>
                          </CardContent>
                        </Card>
                      </VedicHoverCard>
                    ))}
                  </div>
                </div>
              </VedicRevealOnScroll>
            )}

          </div>

          {/* Sacred Footer */}
          <VedicRevealOnScroll direction="up" delay={0.5}>
            <div className="text-center mt-16 py-8 border-t border-vedic-border">
              <SacredText
                sanskrit="सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः"
                transliteration="Sarve Bhavantu Sukhinah Sarve Santu Niramayah"
                translation="May all beings be happy, may all beings be healthy"
                size="medium"
              />
            </div>
          </VedicRevealOnScroll>
        </div>

        {/* Floating Action Button */}
        <VedicFloatingButton
          icon="🧘‍♂️"
          tooltip="Sacred Meditation"
          variant="sacred"
          onClick={() => setShowMeditation(true)}
          mantras={["ॐ शान्ति शान्ति शान्तिः", "ॐ सर्वे भवन्तु सुखिनः"]}
        />

        {/* Meditation Modal */}
        {showMeditation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowMeditation(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-vedic-surface rounded-3xl p-8 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <BreathingText
                text="ॐ शान्ति शान्ति शान्तिः"
                breatheIn="Inhale Divine Light"
                breatheOut="Exhale All Worries"
                duration={5000}
              />
              <Button
                onClick={() => setShowMeditation(false)}
                variant="accent"
                className="mt-8 w-full"
              >
                Complete Meditation
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </VedicPageTransition>
  );
};

export default EnhancedAnalysisPage;
