import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RashiDetailPage.css';

// Comprehensive Vedic Rashi Data - Authentic Jyotish Shastra Implementation
const rashiData = {
  aries: {
    name: 'Aries',
    sanskrit: 'मेष',
    symbol: '♈',
    vedicElement: 'Agni (Fire)',
    ruler: 'Mars (Mangal)',
    nature: 'Moveable (Chara)',
    gender: 'Male',
    bodyParts: ['Head', 'Brain', 'Face'],
    direction: 'East',
    season: 'Spring',
    color: '#FF4500',
    gemstone: 'Red Coral',
    deity: 'Agni (Fire God)',
    mantra: 'ॐ अं अङ्गारकाय नमः',
    nakshatras: ['Ashwini', 'Bharani', 'Krittika (1st pada)'],
    emoji: '🐏',
    description: 'Mesha Rashi represents the divine fire of creation and leadership. Ruled by Mars, it embodies courage, initiative, and the pioneering spirit essential for spiritual and material progress.',
    vedicStrengths: ['Leadership and command', 'Courage in adversity', 'Initiative and enterprise', 'Quick decision-making', 'Spiritual warrior nature', 'Independence and self-reliance'],
    vedicWeaknesses: ['Impatience and haste', 'Anger and aggression', 'Lack of diplomacy', 'Impulsive actions', 'Ego and pride', 'Difficulty in cooperation'],
    vedicCareer: ['Military and defense services', 'Engineering and technology', 'Sports and athletics', 'Entrepreneurship and business', 'Surgery and medicine', 'Fire-related professions'],
    vedicCompatibility: {
      best: ['Leo (Simha)', 'Sagittarius (Dhanu)', 'Gemini (Mithuna)'],
      challenging: ['Cancer (Karka)', 'Capricorn (Makara)', 'Libra (Tula)']
    },
    remedies: [
      'Recite Mars mantras on Tuesdays',
      'Wear red coral (Moonga) in gold',
      'Donate red items to temples',
      'Practice physical exercises regularly',
      'Meditate facing east during sunrise'
    ],
    yogas: ['Mangal Yoga', 'Ruchaka Yoga (if Mars is exalted)'],
    exaltation: 'Exalted in Capricorn at 28°',
    debilitation: 'Debilitated in Cancer at 28°',
    vedicDates: 'Sidereal: Approximately April 14 - May 14 (varies by year)'
  },
  taurus: {
    name: 'Taurus',
    sanskrit: 'वृष',
    symbol: '♉',
    vedicElement: 'Prithvi (Earth)',
    ruler: 'Venus (Shukra)',
    nature: 'Fixed (Sthira)',
    gender: 'Female',
    bodyParts: ['Neck', 'Throat', 'Shoulders'],
    direction: 'South',
    season: 'Late Spring',
    color: '#228B22',
    gemstone: 'Diamond',
    deity: 'Lakshmi (Goddess of Wealth)',
    mantra: 'ॐ शं शुक्राय नमः',
    nakshatras: ['Krittika (2nd-4th pada)', 'Rohini', 'Mrigashira (1st-2nd pada)'],
    emoji: '🐂',
    description: 'Vrishabha Rashi represents stability, beauty, and material prosperity. Ruled by Venus, it embodies the divine principle of creation through patience, perseverance, and appreciation of natural beauty.',
    vedicStrengths: ['Stability and reliability', 'Artistic and aesthetic sense', 'Patience and perseverance', 'Material prosperity', 'Devotion and loyalty', 'Connection to nature'],
    vedicWeaknesses: ['Stubbornness and rigidity', 'Materialistic tendencies', 'Resistance to change', 'Possessiveness', 'Indulgence in pleasures', 'Laziness'],
    vedicCareer: ['Agriculture and farming', 'Banking and finance', 'Arts and crafts', 'Real estate', 'Hospitality and food', 'Beauty and fashion'],
    vedicCompatibility: {
      best: ['Virgo (Kanya)', 'Capricorn (Makara)', 'Cancer (Karka)'],
      challenging: ['Leo (Simha)', 'Aquarius (Kumbha)', 'Scorpio (Vrishchika)']
    },
    remedies: [
      'Worship Goddess Lakshmi on Fridays',
      'Wear diamond or white sapphire',
      'Donate white items and sweets',
      'Practice gratitude and charity',
      'Maintain cleanliness and beauty'
    ],
    yogas: ['Malavya Yoga (if Venus is exalted)', 'Dhana Yoga'],
    exaltation: 'Venus exalted in Pisces at 27°',
    debilitation: 'Venus debilitated in Virgo at 27°',
    vedicDates: 'Sidereal: Approximately May 15 - June 14 (varies by year)'
  },
  gemini: {
    name: 'Gemini',
    sanskrit: 'मिथुन',
    symbol: '♊',
    vedicElement: 'Vayu (Air)',
    ruler: 'Mercury (Budh)',
    nature: 'Dual (Dwiswabhava)',
    gender: 'Male',
    bodyParts: ['Arms', 'Hands', 'Lungs'],
    direction: 'West',
    season: 'Early Summer',
    color: '#FFD700',
    gemstone: 'Emerald',
    deity: 'Saraswati (Goddess of Knowledge)',
    mantra: 'ॐ बुं बुधाय नमः',
    nakshatras: ['Mrigashira (3rd-4th pada)', 'Ardra', 'Punarvasu (1st-3rd pada)'],
    emoji: '👯',
    description: 'Mithuna Rashi represents communication, learning, and adaptability. Ruled by Mercury, it embodies the divine principle of knowledge exchange and intellectual versatility.',
    vedicStrengths: ['Communication and expression', 'Learning and curiosity', 'Adaptability and flexibility', 'Intellectual prowess', 'Networking abilities', 'Youthful energy'],
    vedicWeaknesses: ['Inconsistency and fickleness', 'Superficiality', 'Nervousness and anxiety', 'Indecisiveness', 'Restlessness', 'Scattered focus'],
    vedicCareer: ['Teaching and education', 'Writing and journalism', 'Trading and commerce', 'Technology and communication', 'Travel and transport', 'Media and publishing'],
    vedicCompatibility: {
      best: ['Libra (Tula)', 'Aquarius (Kumbha)', 'Aries (Mesha)'],
      challenging: ['Virgo (Kanya)', 'Pisces (Meena)', 'Sagittarius (Dhanu)']
    },
    remedies: [
      'Chant Saraswati mantras on Wednesdays',
      'Wear emerald in gold',
      'Donate green items and books',
      'Practice pranayama and meditation',
      'Study sacred texts regularly'
    ],
    yogas: ['Bhadra Yoga (if Mercury is exalted)', 'Saraswati Yoga'],
    exaltation: 'Mercury exalted in Virgo at 15°',
    debilitation: 'Mercury debilitated in Pisces at 15°',
    vedicDates: 'Sidereal: Approximately June 15 - July 14 (varies by year)'
  },
  cancer: {
    name: 'Cancer',
    sanskrit: 'कर्क',
    symbol: '♋',
    vedicElement: 'Jal (Water)',
    ruler: 'Moon (Chandra)',
    nature: 'Moveable (Chara)',
    gender: 'Female',
    bodyParts: ['Chest', 'Breasts', 'Stomach'],
    direction: 'North',
    season: 'Monsoon',
    color: '#C0C0C0',
    gemstone: 'Pearl',
    deity: 'Gouri (Divine Mother)',
    mantra: 'ॐ सोम सोमाय नमः',
    nakshatras: ['Punarvasu (4th pada)', 'Pushya', 'Ashlesha'],
    emoji: '🦀',
    description: 'Karka Rashi represents nurturing, emotions, and intuition. Ruled by the Moon, it embodies the divine maternal principle and deep emotional intelligence.',
    vedicStrengths: ['Nurturing and caring nature', 'Emotional intelligence', 'Intuition and psychic abilities', 'Devotion and loyalty', 'Memory and retention', 'Protective instincts'],
    vedicWeaknesses: ['Emotional volatility', 'Mood swings', 'Over-sensitivity', 'Attachment and possessiveness', 'Pessimism', 'Clinging behavior'],
    vedicCareer: ['Healthcare and nursing', 'Hospitality and food service', 'Real estate', 'Psychology and counseling', 'Water-related professions', 'Childcare and education'],
    vedicCompatibility: {
      best: ['Scorpio (Vrishchika)', 'Pisces (Meena)', 'Taurus (Vrishabha)'],
      challenging: ['Aries (Mesha)', 'Libra (Tula)', 'Capricorn (Makara)']
    },
    remedies: [
      'Worship Divine Mother on Mondays',
      'Wear pearl in silver',
      'Donate white items and milk',
      'Practice moon meditation',
      'Maintain emotional balance through yoga'
    ],
    yogas: ['Gajakesari Yoga (Moon-Jupiter conjunction)', 'Chandra Yoga'],
    exaltation: 'Moon exalted in Taurus at 3°',
    debilitation: 'Moon debilitated in Scorpio at 3°',
    vedicDates: 'Sidereal: Approximately July 15 - August 14 (varies by year)'
  },
  leo: {
    name: 'Leo',
    sanskrit: 'सिंह',
    symbol: '♌',
    vedicElement: 'Agni (Fire)',
    ruler: 'Sun (Surya)',
    nature: 'Fixed (Sthira)',
    gender: 'Male',
    bodyParts: ['Heart', 'Back', 'Spine'],
    direction: 'East',
    season: 'Peak Summer',
    color: '#FF8C00',
    gemstone: 'Ruby',
    deity: 'Surya (Sun God)',
    mantra: 'ॐ ह्रीं ह्रौं सूर्याय नमः',
    nakshatras: ['Magha', 'Purva Phalguni', 'Uttara Phalguni (1st pada)'],
    emoji: '🦁',
    description: 'Simha Rashi represents divine authority, leadership, and self-expression. Ruled by the Sun, it embodies the soul\'s desire for recognition and the noble qualities of kingship.',
    vedicStrengths: ['Natural leadership', 'Noble and generous nature', 'Confidence and dignity', 'Creative expression', 'Loyalty and honor', 'Inspiring others'],
    vedicWeaknesses: ['Pride and arrogance', 'Dominating behavior', 'Inflexibility', 'Need for attention', 'Extravagance', 'Intolerance of criticism'],
    vedicCareer: ['Government and administration', 'Entertainment and arts', 'Leadership roles', 'Politics', 'Fashion and luxury', 'Solar energy'],
    vedicCompatibility: {
      best: ['Aries (Mesha)', 'Sagittarius (Dhanu)', 'Gemini (Mithuna)'],
      challenging: ['Taurus (Vrishabha)', 'Scorpio (Vrishchika)', 'Aquarius (Kumbha)']
    },
    remedies: [
      'Perform Surya Namaskar at sunrise',
      'Wear ruby in gold',
      'Donate gold and saffron items',
      'Practice heart-opening yoga',
      'Serve father figures and authorities'
    ],
    yogas: ['Raj Yoga (Sun in own sign)', 'Surya Yoga'],
    exaltation: 'Sun exalted in Aries at 10°',
    debilitation: 'Sun debilitated in Libra at 10°',
    vedicDates: 'Sidereal: Approximately August 15 - September 14 (varies by year)'
  },
  virgo: {
    name: 'Virgo',
    sanskrit: 'कन्या',
    symbol: '♍',
    vedicElement: 'Prithvi (Earth)',
    ruler: 'Mercury (Budh)',
    nature: 'Dual (Dwiswabhava)',
    gender: 'Female',
    bodyParts: ['Intestines', 'Digestive system'],
    direction: 'South',
    season: 'Late Summer',
    color: '#228B22',
    gemstone: 'Emerald',
    deity: 'Kanya Kumari (Divine Virgin)',
    mantra: 'ॐ बुं बुधाय नमः',
    nakshatras: ['Uttara Phalguni (2nd-4th pada)', 'Hasta', 'Chitra (1st-2nd pada)'],
    emoji: '👩',
    description: 'Kanya Rashi represents purity, service, and analytical perfection. Ruled by Mercury, it embodies the divine principle of discrimination and selfless service.',
    vedicStrengths: ['Analytical and discriminating mind', 'Service-oriented nature', 'Attention to detail', 'Practical wisdom', 'Healing abilities', 'Purity and cleanliness'],
    vedicWeaknesses: ['Over-criticism and perfectionism', 'Worry and anxiety', 'Shyness and reserve', 'Hypochondria', 'Rigid thinking', 'Self-doubt'],
    vedicCareer: ['Healthcare and medicine', 'Research and analysis', 'Accounting and auditing', 'Agriculture and nutrition', 'Teaching and editing', 'Quality control'],
    vedicCompatibility: {
      best: ['Taurus (Vrishabha)', 'Capricorn (Makara)', 'Cancer (Karka)'],
      challenging: ['Gemini (Mithuna)', 'Sagittarius (Dhanu)', 'Pisces (Meena)']
    },
    remedies: [
      'Worship Goddess Durga on Wednesdays',
      'Wear emerald in gold',
      'Donate green items and herbs',
      'Practice digestive yoga',
      'Serve the sick and needy'
    ],
    yogas: ['Bhadra Yoga (Mercury exalted)', 'Parivartana Yoga'],
    exaltation: 'Mercury exalted in Virgo at 15°',
    debilitation: 'Mercury debilitated in Pisces at 15°',
    vedicDates: 'Sidereal: Approximately September 15 - October 14 (varies by year)'
  },
  libra: {
    name: 'Libra',
    sanskrit: 'तुला',
    symbol: '♎',
    vedicElement: 'Vayu (Air)',
    ruler: 'Venus (Shukra)',
    nature: 'Moveable (Chara)',
    gender: 'Male',
    bodyParts: ['Kidneys', 'Lower back', 'Bladder'],
    direction: 'West',
    season: 'Autumn',
    color: '#FFB6C1',
    gemstone: 'Diamond',
    deity: 'Vishnu (Preserver)',
    mantra: 'ॐ शं शुक्राय नमः',
    nakshatras: ['Chitra (3rd-4th pada)', 'Swati', 'Vishakha (1st-3rd pada)'],
    emoji: '⚖️',
    description: 'Tula Rashi represents balance, harmony, and justice. Ruled by Venus, it embodies the divine principle of equilibrium and the search for perfect relationships.',
    vedicStrengths: ['Diplomatic and balanced approach', 'Artistic and aesthetic sense', 'Fair-minded and just', 'Cooperative nature', 'Social grace', 'Peacemaking abilities'],
    vedicWeaknesses: ['Indecisiveness', 'Avoidance of conflict', 'Superficiality', 'Dependency on others', 'Vanity', 'Procrastination'],
    vedicCareer: ['Law and justice', 'Arts and design', 'Diplomacy and foreign service', 'Fashion and beauty', 'Marriage counseling', 'Luxury goods'],
    vedicCompatibility: {
      best: ['Gemini (Mithuna)', 'Aquarius (Kumbha)', 'Leo (Simha)'],
      challenging: ['Cancer (Karka)', 'Capricorn (Makara)', 'Aries (Mesha)']
    },
    remedies: [
      'Worship Lord Vishnu on Fridays',
      'Wear diamond or white sapphire',
      'Donate white items and flowers',
      'Practice balance yoga',
      'Maintain harmony in relationships'
    ],
    yogas: ['Malavya Yoga (Venus exalted)', 'Shukra Yoga'],
    exaltation: 'Saturn exalted in Libra at 20°',
    debilitation: 'Sun debilitated in Libra at 10°',
    vedicDates: 'Sidereal: Approximately October 15 - November 14 (varies by year)'
  },
  scorpio: {
    name: 'Scorpio',
    sanskrit: 'वृश्चिक',
    symbol: '♏',
    vedicElement: 'Jal (Water)',
    ruler: 'Mars (Mangal)',
    nature: 'Fixed (Sthira)',
    gender: 'Female',
    bodyParts: ['Reproductive organs', 'Pelvis'],
    direction: 'North',
    season: 'Late Autumn',
    color: '#8B0000',
    gemstone: 'Red Coral',
    deity: 'Ganesha (Remover of Obstacles)',
    mantra: 'ॐ अं अङ्गारकाय नमः',
    nakshatras: ['Vishakha (4th pada)', 'Anuradha', 'Jyeshtha'],
    emoji: '🦂',
    description: 'Vrishchika Rashi represents transformation, intensity, and hidden knowledge. Ruled by Mars, it embodies the divine principle of regeneration and spiritual transformation.',
    vedicStrengths: ['Intense and passionate nature', 'Transformative abilities', 'Research and investigation', 'Psychic and intuitive powers', 'Determination and willpower', 'Healing abilities'],
    vedicWeaknesses: ['Jealousy and possessiveness', 'Secretiveness', 'Vengeful nature', 'Extremism', 'Obsessive tendencies', 'Destructive impulses'],
    vedicCareer: ['Medical and surgical fields', 'Research and investigation', 'Psychology and psychiatry', 'Occult sciences', 'Mining and oil', 'Transformation industries'],
    vedicCompatibility: {
      best: ['Cancer (Karka)', 'Pisces (Meena)', 'Virgo (Kanya)'],
      challenging: ['Leo (Simha)', 'Aquarius (Kumbha)', 'Taurus (Vrishabha)']
    },
    remedies: [
      'Worship Lord Ganesha on Tuesdays',
      'Wear red coral in gold',
      'Donate red items and jaggery',
      'Practice Kundalini yoga',
      'Engage in spiritual transformation'
    ],
    yogas: ['Mangal Yoga', 'Ruchaka Yoga (Mars exalted)'],
    exaltation: 'Moon exalted in Taurus (opposing sign)',
    debilitation: 'Moon debilitated in Scorpio at 3°',
    vedicDates: 'Sidereal: Approximately November 15 - December 14 (varies by year)'
  },
  sagittarius: {
    name: 'Sagittarius',
    sanskrit: 'धनु',
    symbol: '♐',
    vedicElement: 'Agni (Fire)',
    ruler: 'Jupiter (Guru)',
    nature: 'Dual (Dwiswabhava)',
    gender: 'Male',
    bodyParts: ['Thighs', 'Hips', 'Liver'],
    direction: 'Northeast',
    season: 'Early Winter',
    color: '#4B0082',
    gemstone: 'Yellow Sapphire',
    deity: 'Brihaspati (Divine Guru)',
    mantra: 'ॐ गुं गुरवे नमः',
    nakshatras: ['Mula', 'Purva Ashadha', 'Uttara Ashadha (1st pada)'],
    emoji: '🏹',
    description: 'Dhanu Rashi represents wisdom, philosophy, and higher learning. Ruled by Jupiter, it embodies the divine principle of expansion and the quest for truth.',
    vedicStrengths: ['Philosophical and wise nature', 'Optimism and enthusiasm', 'Teaching and guidance', 'Spiritual seeking', 'Adventurous spirit', 'Moral and ethical values'],
    vedicWeaknesses: ['Over-optimism', 'Preaching tendency', 'Impatience with details', 'Restlessness', 'Exaggeration', 'Dogmatism'],
    vedicCareer: ['Teaching and education', 'Philosophy and religion', 'Law and justice', 'Publishing and media', 'Foreign trade', 'Spiritual guidance'],
    vedicCompatibility: {
      best: ['Aries (Mesha)', 'Leo (Simha)', 'Libra (Tula)'],
      challenging: ['Virgo (Kanya)', 'Pisces (Meena)', 'Gemini (Mithuna)']
    },
    remedies: [
      'Worship Lord Vishnu on Thursdays',
      'Wear yellow sapphire in gold',
      'Donate yellow items and books',
      'Practice dharmic living',
      'Study sacred scriptures'
    ],
    yogas: ['Hamsa Yoga (Jupiter exalted)', 'Guru Yoga'],
    exaltation: 'Jupiter exalted in Cancer at 5°',
    debilitation: 'Jupiter debilitated in Capricorn at 5°',
    vedicDates: 'Sidereal: Approximately December 15 - January 14 (varies by year)'
  },
  capricorn: {
    name: 'Capricorn',
    sanskrit: 'मकर',
    symbol: '♑',
    vedicElement: 'Prithvi (Earth)',
    ruler: 'Saturn (Shani)',
    nature: 'Moveable (Chara)',
    gender: 'Female',
    bodyParts: ['Knees', 'Bones', 'Skin'],
    direction: 'South',
    season: 'Peak Winter',
    color: '#2F4F4F',
    gemstone: 'Blue Sapphire',
    deity: 'Brahma (Creator)',
    mantra: 'ॐ शं शनैश्चराय नमः',
    nakshatras: ['Uttara Ashadha (2nd-4th pada)', 'Shravana', 'Dhanishta (1st-2nd pada)'],
    emoji: '🐐',
    description: 'Makara Rashi represents ambition, discipline, and material achievement. Ruled by Saturn, it embodies the divine principle of karma and the rewards of perseverance.',
    vedicStrengths: ['Discipline and perseverance', 'Ambition and goal-orientation', 'Practical and realistic', 'Responsibility and duty', 'Organizational abilities', 'Patience and endurance'],
    vedicWeaknesses: ['Pessimism and depression', 'Rigidity and conservatism', 'Materialism', 'Coldness and detachment', 'Workaholism', 'Authoritarian tendencies'],
    vedicCareer: ['Government and administration', 'Business and industry', 'Engineering and construction', 'Mining and earth sciences', 'Time-based professions', 'Elderly care'],
    vedicCompatibility: {
      best: ['Taurus (Vrishabha)', 'Virgo (Kanya)', 'Scorpio (Vrishchika)'],
      challenging: ['Aries (Mesha)', 'Libra (Tula)', 'Cancer (Karka)']
    },
    remedies: [
      'Worship Lord Shiva on Saturdays',
      'Wear blue sapphire with caution',
      'Donate black items and iron',
      'Practice patience and humility',
      'Serve the elderly and poor'
    ],
    yogas: ['Shasha Yoga (Saturn exalted)', 'Shani Yoga'],
    exaltation: 'Mars exalted in Capricorn at 28°',
    debilitation: 'Jupiter debilitated in Capricorn at 5°',
    vedicDates: 'Sidereal: Approximately January 15 - February 14 (varies by year)'
  },
  aquarius: {
    name: 'Aquarius',
    sanskrit: 'कुम्भ',
    symbol: '♒',
    vedicElement: 'Vayu (Air)',
    ruler: 'Saturn (Shani)',
    nature: 'Fixed (Sthira)',
    gender: 'Male',
    bodyParts: ['Ankles', 'Circulatory system'],
    direction: 'West',
    season: 'Late Winter',
    color: '#00CED1',
    gemstone: 'Blue Sapphire',
    deity: 'Varuna (Water God)',
    mantra: 'ॐ शं शनैश्चराय नमः',
    nakshatras: ['Dhanishta (3rd-4th pada)', 'Shatabhisha', 'Purva Bhadrapada (1st-3rd pada)'],
    emoji: '🏺',
    description: 'Kumbha Rashi represents humanitarian ideals, innovation, and collective consciousness. Ruled by Saturn, it embodies the divine principle of service to humanity.',
    vedicStrengths: ['Humanitarian and altruistic', 'Innovative and progressive', 'Independent thinking', 'Scientific and logical', 'Group consciousness', 'Visionary abilities'],
    vedicWeaknesses: ['Emotional detachment', 'Rebellious nature', 'Unpredictability', 'Stubbornness', 'Aloofness', 'Eccentric behavior'],
    vedicCareer: ['Science and technology', 'Social reform', 'Astrology and metaphysics', 'Group activities', 'Aviation and space', 'Humanitarian work'],
    vedicCompatibility: {
      best: ['Gemini (Mithuna)', 'Libra (Tula)', 'Sagittarius (Dhanu)'],
      challenging: ['Taurus (Vrishabha)', 'Scorpio (Vrishchika)', 'Leo (Simha)']
    },
    remedies: [
      'Worship Lord Shiva on Saturdays',
      'Wear blue sapphire with caution',
      'Donate to humanitarian causes',
      'Practice group meditation',
      'Serve society and humanity'
    ],
    yogas: ['Shasha Yoga (Saturn exalted)', 'Kumbha Yoga'],
    exaltation: 'Saturn exalted in Libra (9th house)',
    debilitation: 'Sun debilitated in Libra (9th house)',
    vedicDates: 'Sidereal: Approximately February 15 - March 14 (varies by year)'
  },
  pisces: {
    name: 'Pisces',
    sanskrit: 'मीन',
    symbol: '♓',
    vedicElement: 'Jal (Water)',
    ruler: 'Jupiter (Guru)',
    nature: 'Dual (Dwiswabhava)',
    gender: 'Female',
    bodyParts: ['Feet', 'Lymphatic system'],
    direction: 'North',
    season: 'Spring onset',
    color: '#9370DB',
    gemstone: 'Yellow Sapphire',
    deity: 'Vishnu (Preserver)',
    mantra: 'ॐ गुं गुरवे नमः',
    nakshatras: ['Purva Bhadrapada (4th pada)', 'Uttara Bhadrapada', 'Revati'],
    emoji: '🐟',
    description: 'Meena Rashi represents spiritual realization, compassion, and divine connection. Ruled by Jupiter, it embodies the divine principle of moksha and universal love.',
    vedicStrengths: ['Spiritual and intuitive', 'Compassionate and empathetic', 'Artistic and creative', 'Healing abilities', 'Psychic sensitivity', 'Devotional nature'],
    vedicWeaknesses: ['Escapism and delusion', 'Over-sensitivity', 'Victim mentality', 'Lack of boundaries', 'Confusion and indecision', 'Addiction tendencies'],
    vedicCareer: ['Spiritual and religious work', 'Healing and therapy', 'Arts and music', 'Photography and film', 'Marine biology', 'Charitable organizations'],
    vedicCompatibility: {
      best: ['Cancer (Karka)', 'Scorpio (Vrishchika)', 'Taurus (Vrishabha)'],
      challenging: ['Gemini (Mithuna)', 'Sagittarius (Dhanu)', 'Virgo (Kanya)']
    },
    remedies: [
      'Worship Lord Vishnu on Thursdays',
      'Wear yellow sapphire in gold',
      'Donate yellow items and fish',
      'Practice meditation and yoga',
      'Serve water to plants and animals'
    ],
    yogas: ['Hamsa Yoga (Jupiter exalted)', 'Meena Yoga'],
    exaltation: 'Venus exalted in Pisces at 27°',
    debilitation: 'Mercury debilitated in Pisces at 15°',
    vedicDates: 'Sidereal: Approximately March 15 - April 13 (varies by year)'
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
              {rashi.emoji} {rashi.vedicElement} Sign
            </span>
          </h1>
          <p className="text-lg max-w-4xl mx-auto mb-8">{rashi.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="backdrop-vedic p-4 rounded-xl">
              <div className="text-xs opacity-80 mb-1">Element</div>
              <div className="font-semibold">{rashi.vedicElement}</div>
            </div>
            <div className="backdrop-vedic p-4 rounded-xl">
              <div className="text-xs opacity-80 mb-1">Ruler</div>
              <div className="font-semibold">{rashi.ruler}</div>
            </div>
            <div className="backdrop-vedic p-4 rounded-xl">
              <div className="text-xs opacity-80 mb-1">Nature</div>
              <div className="font-semibold">{rashi.nature}</div>
            </div>
            <div className="backdrop-vedic p-4 rounded-xl">
              <div className="text-xs opacity-80 mb-1">Gemstone</div>
              <div className="font-semibold">{rashi.gemstone}</div>
            </div>
            <div className="backdrop-vedic p-4 rounded-xl">
              <div className="text-xs opacity-80 mb-1">Deity</div>
              <div className="font-semibold">{rashi.deity}</div>
            </div>
            <div className="backdrop-vedic p-4 rounded-xl">
              <div className="text-xs opacity-80 mb-1">Direction</div>
              <div className="font-semibold">{rashi.direction}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-vedic-surface border-b border-vedic-border sticky top-0 z-50">
        <div className="vedic-container">
          <div className="flex overflow-x-auto py-4">
            {[
              { id: 'personality', label: 'Personality', icon: '👤' },
              { id: 'career', label: 'Career', icon: '💼' },
              { id: 'relationships', label: 'Compatibility', icon: '💕' },
              { id: 'spiritual', label: 'Spiritual', icon: '🕉️' },
              { id: 'remedies', label: 'Remedies', icon: '💎' }
            ].map((tab) => (
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
            <div className="animate-fadeIn space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-vedic p-8">
                  <h3 className="text-2xl font-cinzel font-bold mb-6 text-vedic-text flex items-center gap-3">
                    <span className="text-3xl">💪</span>Vedic Strengths
                  </h3>
                  <div className="space-y-3">
                    {rashi.vedicStrengths.map((strength, index) => (
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
                    {rashi.vedicWeaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                        <span className="text-orange-600">⚠</span>
                        <span>{weakness}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Vedic Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card-vedic p-8">
                  <h3 className="text-2xl font-cinzel font-bold mb-6 text-vedic-text flex items-center gap-3">
                    <span className="text-3xl">🌟</span>Associated Nakshatras
                  </h3>
                  <div className="space-y-2">
                    {rashi.nakshatras.map((nakshatra, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                        <span className="text-blue-600">⭐</span>
                        <span className="font-medium">{nakshatra}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-vedic p-8">
                  <h3 className="text-2xl font-cinzel font-bold mb-6 text-vedic-text flex items-center gap-3">
                    <span className="text-3xl">🏛️</span>Vedic Attributes
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-vedic-background rounded-xl">
                      <span className="font-medium">Body Parts:</span>
                      <span>{rashi.bodyParts.join(', ')}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-vedic-background rounded-xl">
                      <span className="font-medium">Season:</span>
                      <span>{rashi.season}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-vedic-background rounded-xl">
                      <span className="font-medium">Gender:</span>
                      <span>{rashi.gender}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'career' && (
            <div className="animate-fadeIn">
              <div className="card-vedic p-8">
                <h3 className="text-2xl font-cinzel font-bold mb-6 text-vedic-text flex items-center gap-3">
                  <span className="text-3xl">🎯</span>Vedic Career Paths
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rashi.vedicCareer.map((career, index) => (
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
                  <span className="text-3xl">💕</span>Vedic Compatibility
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3">Best Matches</h4>
                    <div className="flex flex-wrap gap-2">
                      {rashi.vedicCompatibility.best.map((sign, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {sign}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-3">Challenging Matches</h4>
                    <div className="flex flex-wrap gap-2">
                      {rashi.vedicCompatibility.challenging.map((sign, index) => (
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

          {activeTab === 'spiritual' && (
            <div className="animate-fadeIn space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card-vedic p-8">
                  <h3 className="text-2xl font-cinzel font-bold mb-6 text-vedic-text flex items-center gap-3">
                    <span className="text-3xl">🕉️</span>Sacred Mantra
                  </h3>
                  <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
                    <div className="font-devanagari text-2xl mb-4 text-vedic-primary">
                      {rashi.mantra}
                    </div>
                    <p className="text-sm text-vedic-text">
                      Chant this mantra for spiritual connection and planetary harmony
                    </p>
                  </div>
                </div>
                <div className="card-vedic p-8">
                  <h3 className="text-2xl font-cinzel font-bold mb-6 text-vedic-text flex items-center gap-3">
                    <span className="text-3xl">⚡</span>Planetary Dignities
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-xl">
                      <h4 className="font-semibold text-green-700 mb-2">Exaltation</h4>
                      <p className="text-sm">{rashi.exaltation}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl">
                      <h4 className="font-semibold text-red-700 mb-2">Debilitation</h4>
                      <p className="text-sm">{rashi.debilitation}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-vedic p-8">
                <h3 className="text-2xl font-cinzel font-bold mb-6 text-vedic-text flex items-center gap-3">
                  <span className="text-3xl">🌟</span>Vedic Yogas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rashi.yogas.map((yoga, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                      <span className="text-purple-600">🔮</span>
                      <span className="font-medium">{yoga}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'remedies' && (
            <div className="animate-fadeIn space-y-8">
              <div className="card-vedic p-8">
                <h3 className="text-2xl font-cinzel font-bold mb-6 text-vedic-text flex items-center gap-3">
                  <span className="text-3xl">💎</span>Vedic Remedies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rashi.remedies.map((remedy, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                      <span className="text-blue-600 mt-1">🔹</span>
                      <span className="font-medium">{remedy}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card-vedic p-8">
                  <h3 className="text-2xl font-cinzel font-bold mb-6 text-vedic-text flex items-center gap-3">
                    <span className="text-3xl">💍</span>Sacred Gemstone
                  </h3>
                  <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                    <div className="text-3xl mb-4">💎</div>
                    <div className="font-semibold text-xl mb-2">{rashi.gemstone}</div>
                    <p className="text-sm text-vedic-text">
                      Wear this gemstone for enhanced planetary influence and protection
                    </p>
                  </div>
                </div>
                <div className="card-vedic p-8">
                  <h3 className="text-2xl font-cinzel font-bold mb-6 text-vedic-text flex items-center gap-3">
                    <span className="text-3xl">🏛️</span>Ruling Deity
                  </h3>
                  <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                    <div className="text-3xl mb-4">🙏</div>
                    <div className="font-semibold text-xl mb-2">{rashi.deity}</div>
                    <p className="text-sm text-vedic-text">
                      Worship this deity for blessings and spiritual guidance
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-vedic p-8 bg-gradient-to-r from-yellow-50 to-orange-50">
                <h3 className="text-2xl font-cinzel font-bold mb-6 text-vedic-text flex items-center gap-3">
                  <span className="text-3xl">📅</span>Sidereal Dates
                </h3>
                <div className="text-center">
                  <p className="text-lg font-medium text-vedic-primary mb-2">
                    {rashi.vedicDates}
                  </p>
                  <p className="text-sm text-vedic-text">
                    Note: Vedic astrology uses sidereal calculations which differ from tropical Western dates
                  </p>
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
