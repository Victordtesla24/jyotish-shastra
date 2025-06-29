import React from 'react';

const MeshaPage = () => {
  return (
    <div className="bg-sacred-white dark:bg-dark-bg-primary text-earth-brown dark:text-dark-text-primary p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-accent font-bold text-vedic-saffron mb-4">Mesha (Aries)</h1>
        <p className="text-lg text-wisdom-gray mb-6">
          Mesha, or Aries, is the first sign of the zodiac. It is a fire sign ruled by Mars, and it represents new beginnings, courage, and leadership.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-accent font-bold mb-2">Key Characteristics</h2>
            <ul className="list-disc list-inside text-wisdom-gray">
              <li>Symbol: The Ram</li>
              <li>Element: Fire</li>
              <li>Ruling Planet: Mars</li>
              <li>Quality: Cardinal</li>
              <li>Color: Red</li>
              <li>Lucky Day: Tuesday</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-accent font-bold mb-2">Personality Traits</h2>
            <p className="text-wisdom-gray">
              Individuals born under Mesha are known for their pioneering spirit and independent nature. They are energetic, assertive, and not afraid to take risks. Their competitive drive and ambition make them natural leaders, but they can also be impulsive and impatient.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeshaPage;
