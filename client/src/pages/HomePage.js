import React from 'react';
import { Link } from 'react-router-dom';
import { Button, LotusIcon, SunIcon, MoonIcon, StarIcon } from '../components/ui';

const HomePage = () => {
  const features = [
    {
      icon: <SunIcon className="w-12 h-12 text-vedic-saffron" />,
      title: 'Janma Kundli (जन्म कुंडली)',
      subtitle: 'Birth Chart Generation',
      description: 'Generate precise Vedic birth charts using Swiss Ephemeris calculations with authentic Parashari principles.',
      link: '/chart',
      benefits: ['Swiss Ephemeris calculations', 'Authentic Parashari methods', 'Precise planetary positions']
    },
    {
      icon: <MoonIcon className="w-12 h-12 text-cosmic-purple" />,
      title: 'Graha Phala (ग्रह फल)',
      subtitle: 'Comprehensive Analysis',
      description: 'Deep astrological insights covering personality, career, relationships, and spiritual path through traditional Vedic methods.',
      link: '/analysis',
      benefits: ['8-section analysis', 'Traditional interpretations', 'Life guidance insights']
    },
    {
      icon: <LotusIcon className="w-12 h-12 text-vedic-gold" />,
      title: 'Jyotish Phalita (ज्योतिष फलित)',
      subtitle: 'Detailed Reports',
      description: 'Professional astrological reports with authentic remedies and recommendations from classical texts.',
      link: '/report',
      benefits: ['Comprehensive reports', 'Vedic remedies', 'Classical methodology']
    }
  ];

  return (
    <div className="bg-sacred-white dark:bg-dark-bg-primary text-earth-brown dark:text-sacred-white min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-bg-primary via-cosmic-purple to-stellar-blue"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <div className="text-lg md:text-xl text-vedic-gold font-serif mb-4">
            ॐ ज्योतिषे प्रकाशते यत्र
          </div>

          <h1 className="text-5xl md:text-7xl font-accent font-bold text-vedic-gradient mb-6 leading-tight">
            Jyotish Shastra
            <span className="block text-cosmic-gradient">Vedic Astrology</span>
          </h1>

          <p className="text-xl md:text-2xl text-sacred-white mb-8 max-w-3xl mx-auto leading-relaxed">
            Ancient Vedic wisdom meets Swiss Ephemeris precision
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/chart">
              <Button size="lg" className="btn-vedic-primary">
                🌟 Generate Birth Chart
              </Button>
            </Link>
            <Link to="/analysis">
              <Button size="lg" variant="secondary" className="btn-cosmic backdrop-vedic">
                📜 View Analysis
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-sacred-white/80">
            <div className="flex items-center gap-2">
              <StarIcon className="w-4 h-4 text-vedic-gold" />
              <span>Swiss Ephemeris Precision</span>
            </div>
            <div className="flex items-center gap-2">
              <SunIcon className="w-4 h-4 text-vedic-saffron" />
              <span>Authentic Parashari Methods</span>
            </div>
            <div className="flex items-center gap-2">
              <MoonIcon className="w-4 h-4 text-lunar-silver" />
              <span>Traditional Vedic Wisdom</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-sacred-white to-vedic-background dark:from-dark-bg-primary dark:to-dark-surface">
        <div className="container-vedic">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-accent font-bold text-vedic-gradient mb-4">
              Core Features
            </h2>
            <p className="text-lg text-wisdom-gray max-w-3xl mx-auto leading-relaxed">
              Authentic Vedic astrology tools powered by Swiss Ephemeris calculations and traditional Parashari principles.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="card-sacred h-full transition-all duration-300 group-hover:shadow-cosmic">
                  <div className="text-center p-8">
                    <div className="flex justify-center mb-6">
                      {feature.icon}
                    </div>

                    <h3 className="text-xl font-serif font-bold text-vedic-saffron mb-2">
                      {feature.title}
                    </h3>

                    <h4 className="text-lg font-accent font-semibold text-earth-brown dark:text-dark-text-primary mb-4">
                      {feature.subtitle}
                    </h4>

                    <p className="text-wisdom-gray mb-6 leading-relaxed">
                      {feature.description}
                    </p>

                    <div className="mb-6">
                      <ul className="text-sm text-wisdom-gray space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <StarIcon className="w-3 h-3 text-vedic-gold flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link to={feature.link}>
                      <Button variant="secondary" className="w-full">
                        Explore Feature
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vedic Principles Section */}
      <section className="py-16 bg-vedic-background dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-accent font-bold">Ancient Wisdom, Modern Precision</h2>
          <p className="text-lg text-wisdom-gray mt-2 max-w-3xl mx-auto">
            Our platform combines traditional Vedic principles with Swiss Ephemeris astronomical calculations.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-vedic-saffron">12</div>
              <div className="text-lg text-wisdom-gray">Houses</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-vedic-saffron">9</div>
              <div className="text-lg text-wisdom-gray">Planets</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-vedic-saffron">27</div>
              <div className="text-lg text-wisdom-gray">Nakshatras</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-vedic-saffron">8</div>
              <div className="text-lg text-wisdom-gray">Analysis Sections</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-cosmic-purple text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-accent font-bold">Begin Your Vedic Journey</h2>
          <p className="text-lg mt-2 max-w-3xl mx-auto">
            Discover your cosmic blueprint through authentic Vedic astrology calculations.
          </p>
          <Link to="/chart" className="mt-8 inline-block">
            <Button size="lg" variant="secondary">Generate Birth Chart</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
