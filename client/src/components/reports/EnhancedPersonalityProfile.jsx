import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/cards/Card';
import { Button } from '../ui/buttons/Button';
import Skeleton from '../ui/loading/Skeleton';
import VedicLoadingSpinner from '../ui/loading/VedicLoadingSpinner';
import GenericSection from '../common/GenericDataRenderer';

const EnhancedPersonalityProfile = ({ analysisData: rawAnalysisData, isLoading = false }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const analysisData = React.useMemo(() => transformApiData(rawAnalysisData), [rawAnalysisData]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!analysisData) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-500">No analysis data available</p>
        <p className="text-gray-400">Please provide valid birth data to generate a personality profile.</p>
      </div>
    );
  }

  const sections = [
    { id: 'overview', title: 'Overview', icon: '🌟' },
    { id: 'lagna', title: 'Ascendant', icon: '🏛️' },
    { id: 'moon', title: 'Moon', icon: '🌙' },
    { id: 'sun', title: 'Sun', icon: '☀️' },
    { id: 'arudha', title: 'Arudha', icon: '👑' },
    { id: 'integration', title: 'Integration', icon: '🕉️' },
    { id: 'recommendations', title: 'Remedies', icon: '💎' },
  ];

  const getAnalysisForSection = (sectionId) => {
    if (!analysisData) return null;
    switch (sectionId) {
      case 'overview':
        return analysisData.integratedProfile;
      case 'lagna':
        return analysisData.lagnaAnalysis;
      case 'moon':
        return analysisData.moonAnalysis;
      case 'sun':
        return analysisData.sunAnalysis;
      case 'arudha':
        return analysisData.arudhaAnalysis;
      case 'integration':
        return analysisData.integratedProfile;
      case 'recommendations':
        return analysisData.recommendations;
      default:
        return null;
    }
  };

  return (
    <div className="enhanced-personality-profile space-y-8">
      <div
        className="relative text-center py-12 bg-gradient-to-r from-cosmic-purple/10 via-vedic-primary/10 to-vedic-accent/10 rounded-3xl overflow-hidden"
      >
        <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-gradient-vedic mb-4">
          Personality Illumination
        </h1>
        <p className="text-xl text-vedic-text-light max-w-2xl mx-auto">
          Sacred insights into your cosmic personality through ancient Vedic wisdom
        </p>
      </div>

      <div
        className="flex flex-wrap gap-3 justify-center bg-vedic-surface/50 p-6 rounded-2xl"
      >
        {sections.map((section) => (
          <div
            key={section.id}
          >
            <Button
              variant={activeSection === section.id ? 'cosmic' : 'glass'}
              onClick={() => setActiveSection(section.id)}
              className="flex items-center gap-2"
            >
              <span className="text-lg">{section.icon}</span>
              {section.title}
            </Button>
          </div>
        ))}
      </div>

      <div className="grid gap-8">
            <div>
              <SectionRenderer
                section={sections.find(s => s.id === activeSection)}
                analysisData={getAnalysisForSection(activeSection)}
              />
            </div>
      </div>

      <Footer />
    </div>
  );
};


// Loading Skeleton
const LoadingSkeleton = () => (
    <div data-testid="skeleton-profile" className="space-y-8">
      <Skeleton className="h-48 w-full" />
      <div className="flex justify-center gap-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-24" />)}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
);

const SectionRenderer = ({ section, analysisData }) => {
  if (!analysisData) {
    return (
      <Card variant="vedic" className="h-32 flex items-center justify-center">
        <VedicLoadingSpinner message={`Illuminating ${section.title}...`} />
      </Card>
    );
  }

  switch (section.id) {
    case 'overview':
      return <OverviewSection data={analysisData} />;
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
      return <GenericSection data={analysisData} section={section} />;
  }
};


const OverviewSection = ({ data }) => (
    <Card variant="vedic-alt" className="p-8">
        <CardTitle className="text-gradient-vedic mb-6">Your Cosmic Blueprint</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="font-cinzel text-xl mb-4 text-vedic-text">Core Personality Traits</h3>
            </div>
            <div>
                <h3 className="font-cinzel text-xl mb-4 text-vedic-text">Life Themes</h3>
            </div>
        </div>
    </Card>
);

const LagnaSection = ({ data, section }) => (
  <Card variant="vedic" decorative>
    <CardHeader>
      <CardTitle className="flex items-center gap-3">
        <span className="text-3xl">{section.icon}</span>
        {data.lagnaSign.sign} Ascendant
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-lg text-vedic-text-light">{data.lagnaSign.description}</p>
      <div className="grid grid-cols-2 gap-4">
        <InfoCard title="Ruler" value={data.lagnaLord.planet} icon="👑" />
        <InfoCard title="Element" value={data.lagnaSign.element} icon="🌬️" />
        <InfoCard title="Quality" value={data.lagnaSign.quality} icon="⚖️" />
        <InfoCard title="Strength" value={`${data.overallStrength}/10`} icon="💪" />
      </div>
    </CardContent>
  </Card>
);

const MoonSection = ({ data, section }) => (
  <Card variant="vedic" decorative>
    <CardHeader>
      <CardTitle className="flex items-center gap-3">
        <span className="text-3xl">{section.icon}</span>
        Mind & Emotions: {data.moonSign.sign} Moon
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
       <p className="text-lg text-vedic-text-light">{data.moonSign.description}</p>
      <div className="grid grid-cols-2 gap-4">
        <InfoCard title="Nakshatra" value={data.nakshatra.name} icon="⭐" description={data.nakshatra.ruler} />
        <InfoCard title="Tithi" value={data.tithi.name} icon="🗓️" description={data.tithi.phase} />
        <InfoCard title="Emotional Nature" value={data.emotionalNature.type} icon="💖" />
        <InfoCard title="Mental State" value={data.mentalState.state} icon="🧠" />
      </div>
    </CardContent>
  </Card>
);

const SunSection = ({ data, section }) => (
  <Card variant="vedic" decorative>
    <CardHeader>
      <CardTitle className="flex items-center gap-3">
        <span className="text-3xl">{section.icon}</span>
        Soul & Ego: {data.sunSign.sign} Sun
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-lg text-vedic-text-light">{data.sunSign.description}</p>
      <div className="grid grid-cols-2 gap-4">
        <InfoCard title="Soul's Purpose" value={data.soulPurpose} icon="🎯" />
        <InfoCard title="Ego Expression" value={data.egoExpression} icon="👤" />
        <InfoCard title="Confidence Level" value={data.confidence} icon="🔥" />
        <InfoCard title="Leadership Style" value={data.leadershipQualities} icon="🎖️" />
      </div>
    </CardContent>
  </Card>
);

const ArudhaSection = ({ data, section }) => (
    <Card variant="vedic">
        <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <span className="text-3xl">{section.icon}</span>
                Public Image: Arudha Lagna in {data.arudhaLagna.sign}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-lg text-vedic-text-light">{data.publicImage.description}</p>
            <div className="grid grid-cols-2 gap-4">
                <InfoCard title="Perceived As" value={data.publicImage.keywords.join(', ')} icon="🎭" />
                <InfoCard title="Image Strength" value={data.imageStrength} icon="📊" />
            </div>
        </CardContent>
    </Card>
);

const IntegrationSection = ({ data, section }) => (
    <Card variant="vedic-alt">
        <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <span className="text-3xl">{section.icon}</span>
                Synthesis & Integration
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-lg text-vedic-text-light">{data.synthesisSummary}</p>
            <div className="space-y-2">
                <h4 className="font-semibold">Key Life Patterns:</h4>
                <ul className="list-disc list-inside text-vedic-text-light">
                    {data.keyPatterns.map((pattern, i) => <li key={i}>{pattern}</li>)}
                </ul>
            </div>
             <div className="space-y-2">
                <h4 className="font-semibold">Areas for Growth:</h4>
                <ul className="list-disc list-inside text-vedic-text-light">
                    {data.growthAreas.map((area, i) => <li key={i}>{area}</li>)}
                </ul>
            </div>
        </CardContent>
    </Card>
);

// Recommendations Section
const RecommendationsSection = ({ data, section }) => (
    <Card variant="vedic-alt">
        <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <span className="text-3xl">{section.icon}</span>
                Sacred Remedies & Recommendations
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((rec, index) => (
                    <RecommendationCard key={index} recommendation={rec} index={index}/>
                ))}
            </div>
        </CardContent>
    </Card>
);

// Helper Components
const InfoCard = ({ title, value, icon, description }) => (
    <div
        className="p-4 bg-vedic-surface/50 rounded-2xl border border-vedic-border/20 hover:bg-vedic-surface transition-colors"
    >
        <div className="flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <div>
                <p className="text-sm text-vedic-text-muted">{title}</p>
                <p className="font-bold text-lg text-vedic-accent">{value || 'N/A'}</p>
            </div>
        </div>
        {description && <p className="text-xs text-vedic-text-muted mt-2 pl-12">{description}</p>}
    </div>
);

const RecommendationCard = ({ recommendation }) => {
    const getRecommendationIcon = (type) => {
        const icons = {
            spiritual: '🕉️',
            gemstone: '💎',
            mantra: '🗣️',
            yantra: '☸️',
            lifestyle: '🌿',
            default: '💡'
        };
        return icons[type] || icons.default;
    };

    return (
        <div
            className="p-6 bg-gradient-to-br from-vedic-background to-saffron-subtle rounded-xl border border-vedic-border hover:border-vedic-accent hover:shadow-cosmic transition-all duration-300"
        >
            <div className="flex items-start gap-4">
                <div
                    className="text-3xl"
                >
                    {getRecommendationIcon(recommendation.type)}
                </div>
                <div className="flex-1">
                    <h5 className="font-cinzel font-bold text-vedic-text mb-2">{recommendation.title || 'Recommendation'}</h5>
                    <p className="text-sm text-vedic-text-light mb-3">{recommendation.description}</p>
                </div>
            </div>
        </div>
    );
};

const Footer = () => (
    <div
        className="text-center py-8 border-t border-vedic-border"
    >
        <div className="text-vedic-accent font-noto mb-2">सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः</div>
        <p className="text-vedic-text-light text-sm">May all beings be happy, may all beings be healthy</p>
    </div>
);

const transformApiData = (apiData) => {
  if (!apiData?.success || !apiData.analysis?.sections) {
    return null;
  }

  const sections = apiData.analysis.sections;
  const analyses = sections.section2?.analyses;

  if (!analyses) return null;

  const lagnaAnalysis = analyses.lagna;
  const sunAnalysisData = analyses.luminaries?.sunAnalysis;
  const moonAnalysisData = analyses.luminaries?.moonAnalysis;
  const arudhaAnalysisData = sections.section5?.arudhaAnalysis;
  const integratedProfileData = analyses.luminaries?.overallPersonality;
  const rawRemedies = sections.section5?.arudhaAnalysis?.recommendations?.remedialMeasures;

  const transformed = {
    lagnaAnalysis: {
      lagnaSign: lagnaAnalysis?.lagnaSign,
      lagnaLord: lagnaAnalysis?.lagnaLord,
      overallStrength: lagnaAnalysis?.overallStrength
    },
    moonAnalysis: {
        moonSign: moonAnalysisData?.position,
        nakshatra: moonAnalysisData?.position?.nakshatra ? { name: moonAnalysisData.position.nakshatra, ruler: 'Unknown' } : {},
        tithi: moonAnalysisData?.waxingWaning,
        emotionalNature: { type: moonAnalysisData?.emotionalCharacter?.[0] || 'Unknown' },
        mentalState: { state: moonAnalysisData?.mindCharacteristics?.[0] || 'Unknown' },
    },
    sunAnalysis: {
        sunSign: sunAnalysisData?.position,
        soulPurpose: sunAnalysisData?.spiritualPath?.path,
        egoExpression: sunAnalysisData?.egoCharacteristics?.[0],
        confidence: sunAnalysisData?.strength?.interpretation,
        leadershipQualities: sunAnalysisData?.careerIndications?.[0],
    },
    arudhaAnalysis: {
      arudhaLagna: arudhaAnalysisData?.arudhaLagna,
      publicImage: arudhaAnalysisData?.publicImageAnalysis,
      imageStrength: arudhaAnalysisData?.publicImageAnalysis?.reputationFactors?.overall,
    },
    integratedProfile: {
        synthesisSummary: integratedProfileData?.overallPattern,
        keyPatterns: [integratedProfileData?.primaryStrengths, integratedProfileData?.mainChallenges].flat().filter(Boolean)
    },
    recommendations: Array.isArray(rawRemedies) ? rawRemedies.map(rec => ({ name: rec, description: 'Consult a qualified astrologer for details.' })) : []
  };

  return transformed;
};

export default EnhancedPersonalityProfile;
