import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, cn } from '../ui';

const EnhancedPersonalityProfile = ({ analysisData, isLoading = false }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    lagna: false,
    moon: false,
    sun: false,
    arudha: false,
    integration: false,
    recommendations: false
  });
  const [hoveredTrait, setHoveredTrait] = useState(null);
  const [currentMantra, setCurrentMantra] = useState(0);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  // Sacred mantras for different sections
  const sectionMantras = {
    overview: "ॐ गणेशाय नमः",
    lagna: "ॐ लग्नाधिपतये नमः",
    moon: "ॐ चन्द्राय नमः",
    sun: "ॐ सूर्याय नमः",
    arudha: "ॐ आरूढाय नमः",
    integration: "ॐ सर्वग्रहेभ्यो नमः",
    recommendations: "ॐ शान्तिकराय नमः"
  };

  // Rotate mantras periodically
  useEffect(() => {
    const mantras = Object.values(sectionMantras);
    const interval = setInterval(() => {
      setCurrentMantra((prev) => (prev + 1) % mantras.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sectionMantras]);

  if (isLoading) {
    return <PersonalityLoadingSkeleton />;
  }

  if (!analysisData) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔮</div>
        <h3 className="text-xl font-cinzel text-vedic-text mb-2">No Analysis Data</h3>
        <p className="text-vedic-text-light">Please generate your birth chart first.</p>
      </div>
    );
  }

  const sections = [
    { id: 'overview', title: 'Overview', icon: '🌟', color: 'from-vedic-primary to-vedic-secondary' },
    { id: 'lagna', title: 'Ascendant', icon: '🏛️', color: 'from-cosmic-purple to-stellar-blue' },
    { id: 'moon', title: 'Moon', icon: '🌙', color: 'from-lunar-silver to-stellar-blue' },
    { id: 'sun', title: 'Sun', icon: '☀️', color: 'from-solar-orange to-vedic-gold' },
    { id: 'arudha', title: 'Arudha', icon: '👑', color: 'from-vedic-accent to-gold-pure' },
    { id: 'integration', title: 'Integration', icon: '🕉️', color: 'from-cosmic-purple to-vedic-primary' },
    { id: 'recommendations', title: 'Remedies', icon: '💎', color: 'from-vedic-gold to-vedic-accent' }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getAnalysisForSection = (sectionId) => {
    switch (sectionId) {
      case 'lagna': return analysisData.lagnaAnalysis;
      case 'moon': return analysisData.moonAnalysis;
      case 'sun': return analysisData.sunAnalysis;
      case 'arudha': return analysisData.arudhaAnalysis;
      case 'integration': return analysisData.integratedProfile;
      case 'recommendations': return analysisData.recommendations;
      default: return analysisData.personalityTraits;
    }
  };

  return (
    <div ref={ref} className="enhanced-personality-profile space-y-8">
      {/* Sacred Header with Floating Mantra */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="relative text-center py-12 bg-gradient-to-r from-cosmic-purple/10 via-vedic-primary/10 to-vedic-accent/10 rounded-3xl overflow-hidden"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <motion.circle
              cx="20" cy="20" r="1"
              fill="currentColor"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.circle
              cx="80" cy="30" r="1.5"
              fill="currentColor"
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
            <motion.circle
              cx="50" cy="70" r="1.2"
              fill="currentColor"
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, delay: 2 }}
            />
          </svg>
        </div>

        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-vedic-accent text-lg mb-4 font-noto"
        >
          {Object.values(sectionMantras)[currentMantra]}
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-gradient-vedic mb-4">
          Personality Illumination
        </h1>
        <p className="text-xl text-vedic-text-light max-w-2xl mx-auto">
          Sacred insights into your cosmic personality through ancient Vedic wisdom
        </p>

        {/* Floating Sacred Symbols */}
        <motion.div
          className="absolute top-8 left-8 text-4xl opacity-30"
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        >
          🕉️
        </motion.div>
        <motion.div
          className="absolute bottom-8 right-8 text-3xl opacity-30"
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity }}
        >
          ☸️
        </motion.div>
      </motion.div>

      {/* Navigation Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-wrap gap-3 justify-center bg-vedic-surface/50 p-6 rounded-2xl"
      >
        {sections.map((section, index) => (
          <motion.button
            key={section.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setActiveSection(section.id);
              toggleSection(section.id);
            }}
            className={cn(
              "relative px-6 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden",
              activeSection === section.id
                ? `bg-gradient-to-r ${section.color} text-white shadow-cosmic`
                : "bg-white/80 text-vedic-text hover:bg-white hover:shadow-medium"
            )}
          >
            {/* Shimmer effect for active section */}
            {activeSection === section.id && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
            )}

            <span className="relative flex items-center gap-2">
              <span className="text-lg">{section.icon}</span>
              {section.title}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Analysis Sections */}
      <div className="grid gap-8">
        <AnimatePresence mode="wait">
          {sections.map((section) => (
            expandedSections[section.id] && (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative"
              >
                <SectionRenderer
                  section={section}
                  analysisData={getAnalysisForSection(section.id)}
                  hoveredTrait={hoveredTrait}
                  setHoveredTrait={setHoveredTrait}
                />
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* Sacred Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-center py-8 border-t border-vedic-border"
      >
        <div className="text-vedic-accent font-noto mb-2">
          सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः
        </div>
        <p className="text-vedic-text-light text-sm">
          May all beings be happy, may all beings be healthy
        </p>
      </motion.div>
    </div>
  );
};

// Section Renderer Component
const SectionRenderer = ({ section, analysisData, hoveredTrait, setHoveredTrait }) => {
  if (!analysisData) {
    return (
      <Card variant="vedic" className="h-32 flex items-center justify-center">
        <p className="text-vedic-text-light">No data available for this section</p>
      </Card>
    );
  }

  switch (section.id) {
    case 'overview':
      return <OverviewSection data={analysisData} hoveredTrait={hoveredTrait} setHoveredTrait={setHoveredTrait} />;
    case 'lagna':
      return <LagnaSection data={analysisData} section={section} />;
    case 'moon':
      return <MoonSection data={analysisData} section={section} />;
    case 'sun':
      return <SunSection data={analysisData} section={section} />;
    case 'arudha':
      return <ArudhaSection data={analysisData} section={section} />;
    case 'integration':
      return <IntegrationSection data={analysisData} section={section} />;
    case 'recommendations':
      return <RecommendationsSection data={analysisData} section={section} />;
    default:
      return <DefaultSection data={analysisData} section={section} />;
  }
};

// Overview Section
const OverviewSection = ({ data, hoveredTrait, setHoveredTrait }) => {
  const traits = Array.isArray(data) ? data : data?.traits || [];

  return (
    <Card variant="cosmic" decorative className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span className="text-3xl">🌟</span>
          Core Personality Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {traits.slice(0, 9).map((trait, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onMouseEnter={() => setHoveredTrait(trait)}
              onMouseLeave={() => setHoveredTrait(null)}
              className={cn(
                "p-4 rounded-xl transition-all duration-300 cursor-pointer",
                hoveredTrait === trait
                  ? "bg-gradient-to-r from-vedic-accent/20 to-gold-pure/20 border-vedic-accent shadow-cosmic"
                  : "bg-vedic-background border border-vedic-border hover:border-vedic-accent/50"
              )}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={hoveredTrait === trait ? { rotate: 360 } : {}}
                  transition={{ duration: 0.5 }}
                  className="w-8 h-8 bg-gradient-to-r from-vedic-primary to-vedic-accent rounded-full flex items-center justify-center text-white text-sm font-bold"
                >
                  {index + 1}
                </motion.div>
                <p className="text-sm font-medium text-vedic-text">{trait}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Personality Strength Meter */}
        <div className="mt-8 p-6 bg-gradient-to-r from-vedic-background to-saffron-subtle rounded-xl">
          <h4 className="font-cinzel font-bold text-vedic-text mb-4">Personality Strength Analysis</h4>
          <div className="space-y-3">
            {['Leadership', 'Creativity', 'Intuition', 'Communication', 'Spirituality'].map((aspect, index) => (
              <div key={aspect} className="flex items-center gap-4">
                <span className="w-24 text-sm text-vedic-text-light">{aspect}</span>
                <div className="flex-1 h-2 bg-vedic-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-vedic-primary to-vedic-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.random() * 40 + 60}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Lagna Section
const LagnaSection = ({ data, section }) => (
  <Card variant="celestial" decorative className="overflow-hidden">
    <CardHeader>
      <CardTitle className={`flex items-center gap-3 text-gradient-cosmic`}>
        <span className="text-3xl">{section.icon}</span>
        Ascendant (Lagna) Analysis
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard title="Lagna Sign" value={data?.sign || 'Unknown'} icon="♈" />
        <InfoCard title="Lagna Lord" value={data?.lord || 'Unknown'} icon="👑" />
        <InfoCard
          title="Strength"
          value={`${data?.strength?.grade || 'Unknown'} (${data?.strength?.score || 0}/100)`}
          icon="💪"
        />
      </div>

      <div className="p-6 bg-gradient-to-r from-cosmic-purple/10 to-stellar-blue/10 rounded-xl">
        <h4 className="font-cinzel font-bold text-vedic-text mb-3">Core Identity Description</h4>
        <p className="text-vedic-text-light leading-relaxed">
          {data?.description || 'Detailed ascendant analysis will appear here based on your birth chart calculations.'}
        </p>
      </div>

      {data?.traits && <TraitsList traits={data.traits} title="Ascendant Traits" />}
    </CardContent>
  </Card>
);

// Moon Section
const MoonSection = ({ data, section }) => (
  <Card variant="vedic" decorative className="overflow-hidden">
    <CardHeader>
      <CardTitle className={`flex items-center gap-3`}>
        <span className="text-3xl">{section.icon}</span>
        Moon (Mind & Emotions) Analysis
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InfoCard title="Moon Sign" value={data?.sign || 'Unknown'} icon="🌙" />
        <InfoCard title="House" value={`${data?.house || 'Unknown'}th House`} icon="🏠" />
        <InfoCard title="Nakshatra" value={data?.nakshatra || 'Unknown'} icon="⭐" />
        <InfoCard title="Emotional Strength" value={data?.strength?.grade || 'Unknown'} icon="💝" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gradient-to-br from-lunar-silver/10 to-stellar-blue/10 rounded-xl">
          <h4 className="font-cinzel font-bold text-vedic-text mb-3 flex items-center gap-2">
            🧠 Mental Nature
          </h4>
          <p className="text-vedic-text-light text-sm leading-relaxed">
            {data?.description || 'Mental and emotional characteristics will be detailed here.'}
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-vedic-background to-saffron-subtle rounded-xl">
          <h4 className="font-cinzel font-bold text-vedic-text mb-3 flex items-center gap-2">
            💭 Thought Patterns
          </h4>
          {data?.mentalCharacteristics && (
            <TraitsList traits={data.mentalCharacteristics.slice(0, 3)} compact />
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Sun Section
const SunSection = ({ data, section }) => (
  <Card variant="cosmic" decorative className="overflow-hidden">
    <CardHeader>
      <CardTitle className={`flex items-center gap-3 text-gradient-accent`}>
        <span className="text-3xl">{section.icon}</span>
        Sun (Soul & Purpose) Analysis
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard title="Sun Sign" value={data?.sign || 'Unknown'} icon="☀️" />
        <InfoCard title="House Position" value={`${data?.house || 'Unknown'}th House`} icon="🏛️" />
        <InfoCard title="Soul Strength" value={data?.strength?.grade || 'Unknown'} icon="✨" />
      </div>

      <div className="p-6 bg-gradient-to-r from-solar-orange/10 to-vedic-gold/10 rounded-xl">
        <h4 className="font-cinzel font-bold text-vedic-text mb-3 flex items-center gap-2">
          🎯 Life Purpose & Identity
        </h4>
        <p className="text-vedic-text-light leading-relaxed">
          {data?.description || 'Your core identity and life purpose analysis will be revealed here.'}
        </p>
      </div>

      {data?.lifePurpose && <TraitsList traits={data.lifePurpose} title="Life Purpose Indicators" />}
    </CardContent>
  </Card>
);

// Arudha Section
const ArudhaSection = ({ data, section }) => (
  <Card variant="vedic" decorative className="overflow-hidden">
    <CardHeader>
      <CardTitle className={`flex items-center gap-3`}>
        <span className="text-3xl">{section.icon}</span>
        Arudha Lagna (Public Image) Analysis
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard title="Arudha Lagna" value={data?.sign || 'Unknown'} icon="👑" />
        <InfoCard title="Image Strength" value={data?.strength?.grade || 'Unknown'} icon="🌟" />
      </div>

      <div className="p-6 bg-gradient-to-r from-vedic-accent/10 to-gold-pure/10 rounded-xl">
        <h4 className="font-cinzel font-bold text-vedic-text mb-3">Public Perception</h4>
        <p className="text-vedic-text-light leading-relaxed">
          {data?.description || 'How the world perceives you and your public image analysis.'}
        </p>
      </div>

      {data?.publicImage && <TraitsList traits={data.publicImage} title="How Others See You" />}
    </CardContent>
  </Card>
);

// Integration Section
const IntegrationSection = ({ data, section }) => (
  <Card variant="cosmic" decorative className="overflow-hidden">
    <CardHeader>
      <CardTitle className={`flex items-center gap-3 text-gradient-vedic`}>
        <span className="text-3xl">{section.icon}</span>
        Integrated Personality Profile
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="p-6 bg-gradient-to-r from-cosmic-purple/10 via-vedic-primary/10 to-vedic-accent/10 rounded-xl">
        <h4 className="font-cinzel font-bold text-vedic-text mb-3">Complete Personality Portrait</h4>
        <p className="text-vedic-text-light leading-relaxed">
          {data?.summary || 'A comprehensive integration of all personality aspects will be presented here.'}
        </p>
      </div>

      {data?.layers && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <LayerCard title="Body/Physical" description={data.layers.body} icon="🏛️" />
          <LayerCard title="Mind/Emotions" description={data.layers.mind} icon="🌙" />
          <LayerCard title="Soul/Purpose" description={data.layers.soul} icon="☀️" />
          <LayerCard title="Public Image" description={data.layers.image} icon="👑" />
        </div>
      )}
    </CardContent>
  </Card>
);

// Recommendations Section
const RecommendationsSection = ({ data, section }) => (
  <Card variant="vedic" decorative className="overflow-hidden">
    <CardHeader>
      <CardTitle className={`flex items-center gap-3`}>
        <span className="text-3xl">{section.icon}</span>
        Sacred Remedies & Recommendations
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(data) ? data : data?.recommendations || []).map((rec, index) => (
          <RecommendationCard key={index} recommendation={rec} index={index} />
        ))}
      </div>
    </CardContent>
  </Card>
);

// Helper Components
const InfoCard = ({ title, value, icon }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className="p-4 bg-vedic-background rounded-xl border border-vedic-border hover:border-vedic-accent/50 transition-all duration-300"
  >
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs text-vedic-text-muted uppercase tracking-wide">{title}</p>
        <p className="font-semibold text-vedic-text">{value}</p>
      </div>
    </div>
  </motion.div>
);

const TraitsList = ({ traits, title, compact = false }) => (
  <div className={`${compact ? 'space-y-2' : 'space-y-3'}`}>
    {title && <h4 className="font-cinzel font-bold text-vedic-text mb-3">{title}</h4>}
    <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
      {traits.map((trait, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={`flex items-center gap-2 ${compact ? 'text-sm' : ''}`}
        >
          <span className="w-2 h-2 bg-vedic-accent rounded-full flex-shrink-0"></span>
          <span className="text-vedic-text-light">{trait}</span>
        </motion.div>
      ))}
    </div>
  </div>
);

const LayerCard = ({ title, description, icon }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className="p-4 bg-vedic-background rounded-xl border border-vedic-border hover:border-vedic-accent/50 transition-all duration-300"
  >
    <div className="text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <h5 className="font-cinzel font-bold text-vedic-text mb-2">{title}</h5>
      <p className="text-sm text-vedic-text-light">{description}</p>
    </div>
  </motion.div>
);

const RecommendationCard = ({ recommendation, index }) => {
  const getRecommendationIcon = (type) => {
    const icons = {
      gemstone: '💎',
      mantra: '🕉️',
      lifestyle: '🌱',
      spiritual: '🙏',
      general: '💡',
      yantra: '⚡',
      charity: '🤲',
      fasting: '🌙'
    };
    return icons[type] || '💡';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -3 }}
      className="p-6 bg-gradient-to-br from-vedic-background to-saffron-subtle rounded-xl border border-vedic-border hover:border-vedic-accent hover:shadow-cosmic transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="text-3xl"
        >
          {getRecommendationIcon(recommendation.type)}
        </motion.div>
        <div className="flex-1">
          <h5 className="font-cinzel font-bold text-vedic-text mb-2">
            {recommendation.title || 'Recommendation'}
          </h5>
          <p className="text-sm text-vedic-text-light mb-3">
            {recommendation.description || 'Beneficial practice for your spiritual growth'}
          </p>
          {recommendation.details && (
            <div className="flex flex-wrap gap-2">
              {recommendation.details.slice(0, 3).map((detail, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-vedic-accent/20 text-vedic-accent text-xs rounded-lg"
                >
                  {detail}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const DefaultSection = ({ data, section }) => (
  <Card variant="vedic" decorative>
    <CardHeader>
      <CardTitle className="flex items-center gap-3">
        <span className="text-3xl">{section.icon}</span>
        {section.title} Analysis
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-vedic-text-light">
        Detailed {section.title.toLowerCase()} analysis will be displayed here.
      </p>
    </CardContent>
  </Card>
);

// Loading Skeleton Component
const PersonalityLoadingSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-48 bg-vedic-background rounded-3xl"></div>
    <div className="flex gap-3 justify-center">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="h-12 w-24 bg-vedic-background rounded-xl"></div>
      ))}
    </div>
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-64 bg-vedic-background rounded-2xl"></div>
      ))}
    </div>
  </div>
);

export default EnhancedPersonalityProfile;
