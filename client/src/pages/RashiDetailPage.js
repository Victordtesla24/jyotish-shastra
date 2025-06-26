import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RashiDetailPage.css';

// Simplified Rashi data
const rashiData = {
  aries: {
    name: 'Aries', sanskrit: 'मेष', symbol: '♈', element: 'Fire', ruler: 'Mars',
    dates: 'March 21 - April 19', color: '#FF6B35', emoji: '🐏',
    description: 'The pioneer of the zodiac, representing new beginnings and leadership.',
    strengths: ['Natural leadership', 'Courage', 'High energy', 'Pioneer spirit'],
    weaknesses: ['Impatience', 'Quick temper', 'Impulsiveness', 'Lack of attention to detail'],
    career: ['Military & Defense', 'Entrepreneurship', 'Sports & Athletics', 'Engineering'],
    compatibility: { best: ['Leo', 'Sagittarius', 'Gemini'], challenging: ['Cancer', 'Capricorn'] }
  },
  taurus: {
    name: 'Taurus', sanskrit: 'वृष', symbol: '♉', element: 'Earth', ruler: 'Venus',
    dates: 'April 20 - May 20', color: '#8FBC8F', emoji: '🐂',
    description: 'The builder of the zodiac, representing stability and material comfort.',
    strengths: ['Reliability', 'Patience', 'Practical nature', 'Strong loyalty'],
    weaknesses: ['Stubbornness', 'Materialism', 'Resistance to change', 'Possessiveness'],
    career: ['Banking & Finance', 'Real Estate', 'Art & Design', 'Hospitality'],
    compatibility: { best: ['Virgo', 'Capricorn', 'Cancer'], challenging: ['Leo', 'Aquarius'] }
  },
  gemini: {
    name: 'Gemini', sanskrit: 'मिथुन', symbol: '♊', element: 'Air', ruler: 'Mercury',
    dates: 'May 21 - June 20', color: '#FFD700', emoji: '👯',
    description: 'The communicator of the zodiac, representing intellect and expression.',
    strengths: ['Versatility', 'Excellent communication', 'Intellectual curiosity', 'Adaptability'],
    weaknesses: ['Inconsistency', 'Superficiality', 'Indecisiveness', 'Nervous energy'],
    career: ['Journalism & Writing', 'Sales & Marketing', 'Teaching & Lecturing', 'Public Relations'],
    compatibility: { best: ['Libra', 'Aquarius', 'Aries'], challenging: ['Virgo', 'Pisces'] }
  },
  cancer: {
    name: 'Cancer', sanskrit: 'कर्क', symbol: '♋', element: 'Water', ruler: 'Moon',
    dates: 'June 21 - July 22', color: '#C0C0C0', emoji: '🦀',
    description: 'The nurturer of the zodiac, representing emotions and family.',
    strengths: ['Deep loyalty', 'Emotional intelligence', 'Nurturing nature', 'Strong intuition'],
    weaknesses: ['Moodiness', 'Over-sensitivity', 'Pessimism', 'Clinginess'],
    career: ['Healthcare & Nursing', 'Real Estate', 'Culinary Arts', 'Social Work'],
    compatibility: { best: ['Scorpio', 'Pisces', 'Taurus'], challenging: ['Aries', 'Libra'] }
  },
  leo: {
    name: 'Leo', sanskrit: 'सिंह', symbol: '♌', element: 'Fire', ruler: 'Sun',
    dates: 'July 23 - August 22', color: '#FFAC33', emoji: '🦁',
    description: 'The king of the zodiac, representing leadership and generosity.',
    strengths: ['Generosity', 'Natural leadership', 'Confidence', 'Warm-heartedness'],
    weaknesses: ['Arrogance', 'Stubbornness', 'Inflexibility', 'Need for attention'],
    career: ['Entertainment & Acting', 'Management & Leadership', 'Politics', 'Public Speaking'],
    compatibility: { best: ['Aries', 'Sagittarius', 'Gemini'], challenging: ['Taurus', 'Scorpio'] }
  },
  virgo: {
    name: 'Virgo', sanskrit: 'कन्या', symbol: '♍', element: 'Earth', ruler: 'Mercury',
    dates: 'August 23 - September 22', color: '#6B8E23', emoji: '👩',
    description: 'The analyst of the zodiac, representing precision and service.',
    strengths: ['Analytical skills', 'Practicality', 'Attention to detail', 'Hard-working nature'],
    weaknesses: ['Over-criticism', 'Worry', 'Shyness', 'Perfectionism'],
    career: ['Research & Analysis', 'Healthcare & Medicine', 'Accounting & Finance', 'Editing & Writing'],
    compatibility: { best: ['Taurus', 'Capricorn', 'Cancer'], challenging: ['Gemini', 'Sagittarius'] }
  },
  libra: {
    name: 'Libra', sanskrit: 'तुला', symbol: '♎', element: 'Air', ruler: 'Venus',
    dates: 'September 23 - October 22', color: '#FFC0CB', emoji: '⚖️',
    description: 'The diplomat of the zodiac, representing balance and harmony.',
    strengths: ['Diplomacy', 'Social grace', 'Fair-mindedness', 'Cooperative nature'],
    weaknesses: ['Indecisiveness', 'Avoids confrontation', 'Superficiality', 'Self-pity'],
    career: ['Law & Justice', 'Diplomacy & Politics', 'Art & Design', 'Counseling & Mediation'],
    compatibility: { best: ['Gemini', 'Aquarius', 'Leo'], challenging: ['Cancer', 'Capricorn'] }
  },
  scorpio: {
    name: 'Scorpio', sanskrit: 'वृश्चिक', symbol: '♏', element: 'Water', ruler: 'Mars/Pluto',
    dates: 'October 23 - November 21', color: '#800000', emoji: '🦂',
    description: 'The transformer of the zodiac, representing power and intensity.',
    strengths: ['Resourcefulness', 'Deep passion', 'Strong intuition', 'Determination'],
    weaknesses: ['Jealousy', 'Secretiveness', 'Distrusting nature', 'Vindictiveness'],
    career: ['Investigation & Detective work', 'Psychology & Psychiatry', 'Surgery & Medicine', 'Research'],
    compatibility: { best: ['Cancer', 'Pisces', 'Virgo'], challenging: ['Leo', 'Aquarius'] }
  },
  sagittarius: {
    name: 'Sagittarius', sanskrit: 'धनु', symbol: '♐', element: 'Fire', ruler: 'Jupiter',
    dates: 'November 22 - December 21', color: '#6A0DAD', emoji: '🏹',
    description: 'The adventurer of the zodiac, representing exploration and wisdom.',
    strengths: ['Optimism', 'Love of freedom', 'Generosity', 'Great sense of humor'],
    weaknesses: ['Impatience', 'Over-promising', 'Bluntness', 'Restlessness'],
    career: ['Travel & Tourism', 'Philosophy & Higher Education', 'Publishing & Media', 'Law'],
    compatibility: { best: ['Aries', 'Leo', 'Libra'], challenging: ['Virgo', 'Pisces'] }
  },
  capricorn: {
    name: 'Capricorn', sanskrit: 'मकर', symbol: '♑', element: 'Earth', ruler: 'Saturn',
    dates: 'December 22 - January 19', color: '#4682B4', emoji: '🐐',
    description: 'The strategist of the zodiac, representing ambition and discipline.',
    strengths: ['Discipline', 'Responsibility', 'Self-control', 'Excellent management'],
    weaknesses: ['Pessimism', 'Unforgiving nature', 'Condescension', 'Workaholism'],
    career: ['Management & Administration', 'Finance & Accounting', 'Engineering', 'Government'],
    compatibility: { best: ['Taurus', 'Virgo', 'Scorpio'], challenging: ['Aries', 'Libra'] }
  },
  aquarius: {
    name: 'Aquarius', sanskrit: 'कुम्भ', symbol: '♒', element: 'Air', ruler: 'Saturn/Uranus',
    dates: 'January 20 - February 18', color: '#00BFFF', emoji: '🏺',
    description: 'The visionary of the zodiac, representing innovation and humanity.',
    strengths: ['Progressive thinking', 'Humanitarianism', 'Independence', 'Originality'],
    weaknesses: ['Emotional detachment', 'Unpredictability', 'Stubbornness', 'Aloofness'],
    career: ['Science & Technology', 'Social Work & Activism', 'Astrology & Futurism', 'Aviation'],
    compatibility: { best: ['Gemini', 'Libra', 'Sagittarius'], challenging: ['Taurus', 'Scorpio'] }
  },
  pisces: {
    name: 'Pisces', sanskrit: 'मीन', symbol: '♓', element: 'Water', ruler: 'Jupiter/Neptune',
    dates: 'February 19 - March 20', color: '#7FFFD4', emoji: '🐟',
    description: 'The mystic of the zodiac, representing dreams and spirituality.',
    strengths: ['Compassion', 'Artistic talent', 'Strong intuition', 'Gentleness'],
    weaknesses: ['Escapism', 'Over-sensitivity', 'Victim mentality', 'Fearfulness'],
    career: ['Arts & Music', 'Healing Professions', 'Psychology & Counseling', 'Charitable Work'],
    compatibility: { best: ['Cancer', 'Scorpio', 'Taurus'], challenging: ['Gemini', 'Sagittarius'] }
  }
};

const RashiDetailPage = () => {
  const { rashiName } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personality');
  const [isLoading, setIsLoading] = useState(true);

  const rashi = rashiData[rashiName?.toLowerCase()];

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 800);
  }, [rashiName]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vedic-background flex items-center justify-center">
        <div className="card-celestial p-12 text-center">
          <div className="spinner-mandala mx-auto mb-6"></div>
          <h3 className="text-2xl font-cinzel font-semibold mb-4 text-vedic-text">
            Loading Rashi Details
          </h3>
        </div>
      </div>
    );
  }

  if (!rashi) {
    return (
      <div className="min-h-screen bg-vedic-background flex items-center justify-center">
        <div className="card-vedic p-12 text-center max-w-2xl mx-auto">
          <div className="text-6xl mb-6">🌟</div>
          <h2 className="text-3xl font-cinzel font-bold mb-4 text-vedic-text">
            Rashi Not Found
          </h2>
          <button onClick={() => navigate('/')} className="btn-primary">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'personality', label: 'Personality', icon: '👤' },
    { id: 'career', label: 'Career', icon: '💼' },
    { id: 'relationships', label: 'Love', icon: '💕' }
  ];

  return (
    <div className="min-h-screen bg-vedic-background">
      {/* Hero Section */}
      <section
        className="relative text-white py-20 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${rashi.color}dd 0%, ${rashi.color}aa 100%)` }}
      >
        <div className="vedic-container relative z-10 text-center">
          <div className="text-8xl mb-6 animate-celestial-glow">{rashi.symbol}</div>
          <div className="font-devanagari text-3xl md:text-4xl mb-4 text-gradient-accent">
            {rashi.sanskrit}
          </div>
          <h1 className="text-5xl md:text-7xl font-cinzel font-bold mb-6">
            {rashi.name}
            <span className="block text-2xl font-normal opacity-90 mt-2">
              {rashi.emoji} {rashi.element} Sign
            </span>
          </h1>
          <p className="text-lg max-w-4xl mx-auto mb-8">{rashi.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="backdrop-vedic p-4 rounded-xl">
              <div className="text-xs opacity-80 mb-1">Element</div>
              <div className="font-semibold">{rashi.element}</div>
            </div>
            <div className="backdrop-vedic p-4 rounded-xl">
              <div className="text-xs opacity-80 mb-1">Ruler</div>
              <div className="font-semibold">{rashi.ruler}</div>
            </div>
            <div className="backdrop-vedic p-4 rounded-xl">
              <div className="text-xs opacity-80 mb-1">Dates</div>
              <div className="font-semibold text-sm">{rashi.dates}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-vedic-surface border-b border-vedic-border sticky top-0 z-50">
        <div className="vedic-container">
          <div className="flex overflow-x-auto py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all mr-4 ${
                  activeTab === tab.id
                    ? 'bg-vedic-primary text-white shadow-lg'
                    : 'text-vedic-text hover:bg-vedic-background'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="vedic-container max-w-6xl mx-auto">
          {activeTab === 'personality' && (
            <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card-vedic p-8">
                <h3 className="text-2xl font-cinzel font-bold mb-6 text-vedic-text flex items-center gap-3">
                  <span className="text-3xl">💪</span>Strengths
                </h3>
                <div className="space-y-3">
                  {rashi.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <span className="text-green-600">✓</span>
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-vedic p-8">
                <h3 className="text-2xl font-cinzel font-bold mb-6 text-vedic-text flex items-center gap-3">
                  <span className="text-3xl">🌱</span>Growth Areas
                </h3>
                <div className="space-y-3">
                  {rashi.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                      <span className="text-orange-600">⚠</span>
                      <span>{weakness}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'career' && (
            <div className="animate-fadeIn">
              <div className="card-vedic p-8">
                <h3 className="text-2xl font-cinzel font-bold mb-6 text-vedic-text flex items-center gap-3">
                  <span className="text-3xl">🎯</span>Ideal Career Paths
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rashi.career.map((career, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-vedic-background rounded-xl">
                      <span className="text-2xl">💼</span>
                      <span className="font-medium">{career}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'relationships' && (
            <div className="animate-fadeIn">
              <div className="card-vedic p-8">
                <h3 className="text-2xl font-cinzel font-bold mb-6 text-vedic-text flex items-center gap-3">
                  <span className="text-3xl">💕</span>Compatibility
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3">Best Matches</h4>
                    <div className="flex flex-wrap gap-2">
                      {rashi.compatibility.best.map((sign, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {sign}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-3">Challenging Matches</h4>
                    <div className="flex flex-wrap gap-2">
                      {rashi.compatibility.challenging.map((sign, index) => (
                        <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                          {sign}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Rashis */}
      <section className="py-16 bg-vedic-surface">
        <div className="vedic-container">
          <h2 className="section-title-vedic">Explore Other Rashis</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {Object.entries(rashiData).map(([key, sign]) => (
              <button
                key={key}
                onClick={() => navigate(`/rashi/${key}`)}
                className={`card-vedic p-4 text-center hover-celestial ${
                  key === rashiName?.toLowerCase() ? 'ring-2 ring-vedic-primary' : ''
                }`}
              >
                <div className="text-3xl mb-2">{sign.symbol}</div>
                <div className="font-devanagari text-sm text-vedic-accent">{sign.sanskrit}</div>
                <div className="font-cinzel text-xs font-semibold">{sign.name}</div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default RashiDetailPage;
