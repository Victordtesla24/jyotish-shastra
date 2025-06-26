import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-stellar-blue to-cosmic-purple text-white p-12 md:p-20 text-center mb-16 rounded-2xl">
          <div className="max-w-4xl mx-auto">
            <div className="font-vedic text-3xl mb-6 font-semibold text-vedic-gold">
              ज्योतिष शास्त्र
            </div>
            <h1 className="text-5xl mb-6 font-bold leading-tight font-accent">
              Discover Your Cosmic Blueprint
            </h1>
            <p className="text-xl mb-12 opacity-90 leading-relaxed">
              Unveil your destiny through comprehensive Vedic astrology. Get detailed insights into your personality, career, relationships, and life path, all written in the stars.
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link to="/chart" className="py-3 px-8 rounded-full font-semibold bg-vedic-gold text-vedic-maroon shadow-lg transform hover:scale-105 transition-transform duration-300">
                Discover Your Cosmic Blueprint
              </Link>
              <Link to="/analysis" className="py-3 px-8 rounded-full font-semibold bg-transparent text-white border-2 border-white hover:bg-white hover:text-vedic-deep-blue transition-colors duration-300">
                Unlock Ancient Wisdom
              </Link>
            </div>
          </div>
        </section>

        {/* Simple Content Section */}
        <section className="py-12 text-center">
          <h2 className="text-4xl mb-8 text-earth-brown font-accent">
            Welcome to Jyotish Shastra
          </h2>
          <p className="text-lg text-wisdom-gray max-w-2xl mx-auto leading-relaxed">
            Experience authentic Vedic astrology analysis with our advanced AI-powered system.
            Get detailed birth chart analysis, predictions, and guidance based on ancient wisdom.
          </p>
        </section>

        {/* Simple Stats */}
        <section className="py-12 bg-gray-50 rounded-2xl my-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-solar-orange">5000+</div>
              <div className="text-wisdom-gray">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-solar-orange">15+</div>
              <div className="text-wisdom-gray">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-solar-orange">25+</div>
              <div className="text-wisdom-gray">Expert Astrologers</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-solar-orange">98%</div>
              <div className="text-wisdom-gray">Accuracy Rate</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
