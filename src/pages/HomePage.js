import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, OmIcon, LotusIcon, MandalaIcon, StarIcon } from '../components/ui';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sacred-white to-gray-50">
      <div className="container-vedic">
        {/* Enhanced Hero Section */}
        <section className="hero-vedic mb-16 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <MandalaIcon
              size={200}
              className="absolute top-10 right-10 opacity-10 animate-mandala-rotate"
              color="white"
            />
            <LotusIcon
              size={150}
              className="absolute bottom-10 left-10 opacity-10 animate-pulse-soft"
              color="white"
            />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <OmIcon size={48} className="mr-4 animate-pulse-soft" color="#FFD700" />
              <div className="font-vedic text-3xl md:text-4xl font-semibold text-vedic-gold">
                ज्योतिष शास्त्र
              </div>
              <OmIcon size={48} className="ml-4 animate-pulse-soft" color="#FFD700" />
            </div>

            <h1 className="text-responsive-3xl mb-6 font-bold leading-tight font-accent text-center animate-fade-in">
              Discover Your Cosmic Blueprint
            </h1>

            <p className="text-xl mb-12 opacity-90 leading-relaxed text-center max-w-3xl mx-auto animate-slide-up">
              Unveil your destiny through comprehensive Vedic astrology. Get detailed insights into your personality, career, relationships, and life path, all written in the stars with ancient wisdom and modern AI precision.
            </p>

            <div className="flex gap-6 justify-center flex-wrap">
              <Button
                variant="golden"
                size="lg"
                className="transform hover:scale-110 shadow-golden"
                onClick={() => window.location.href = '/chart'}
              >
                <StarIcon size={20} className="mr-2" />
                Discover Your Cosmic Blueprint
              </Button>

              <Button
                variant="secondary"
                size="lg"
                className="transform hover:scale-110"
                onClick={() => window.location.href = '/analysis'}
              >
                <MandalaIcon size={20} className="mr-2" />
                Unlock Ancient Wisdom
              </Button>
            </div>
          </div>
        </section>

        {/* Welcome Section with Enhanced Typography */}
        <section className="section-spacing text-center animate-fade-in">
          <h2 className="text-responsive-2xl mb-8 text-earth-brown font-accent">
            Welcome to Jyotish Shastra
          </h2>
          <p className="text-vedic-lg text-wisdom-gray max-w-3xl mx-auto leading-relaxed">
            Experience authentic Vedic astrology analysis with our advanced AI-powered system.
            Get detailed birth chart analysis, predictions, and guidance based on thousands of years of ancient wisdom.
          </p>
        </section>

        {/* Enhanced Stats Section */}
        <section className="section-spacing">
          <Card variant="glassmorphic" className="mb-8 backdrop-blur-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="text-5xl font-bold text-solar-orange mb-2 transform group-hover:scale-110 transition-transform duration-300">
                  5000+
                </div>
                <div className="text-wisdom-gray font-medium">Happy Clients</div>
                <StarIcon size={24} className="mx-auto mt-2 text-gold animate-pulse-soft" />
              </div>

              <div className="text-center group">
                <div className="text-5xl font-bold text-solar-orange mb-2 transform group-hover:scale-110 transition-transform duration-300">
                  15+
                </div>
                <div className="text-wisdom-gray font-medium">Years Experience</div>
                <MandalaIcon size={24} className="mx-auto mt-2 text-cosmic-purple animate-spin-slow" />
              </div>

              <div className="text-center group">
                <div className="text-5xl font-bold text-solar-orange mb-2 transform group-hover:scale-110 transition-transform duration-300">
                  25+
                </div>
                <div className="text-wisdom-gray font-medium">Expert Astrologers</div>
                <LotusIcon size={24} className="mx-auto mt-2 text-lotus animate-pulse-soft" />
              </div>

              <div className="text-center group">
                <div className="text-5xl font-bold text-solar-orange mb-2 transform group-hover:scale-110 transition-transform duration-300">
                  98%
                </div>
                <div className="text-wisdom-gray font-medium">Accuracy Rate</div>
                <OmIcon size={24} className="mx-auto mt-2 text-saffron animate-pulse-soft" />
              </div>
            </div>
          </Card>
        </section>

        {/* Services Preview Section */}
        <section className="section-spacing">
          <h2 className="text-responsive-2xl mb-12 text-earth-brown font-accent text-center">
            Our Sacred Services
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card variant="default" className="group">
              <Card.Header>
                <div className="flex items-center mb-4">
                  <StarIcon size={32} className="text-gold mr-3" />
                  <Card.Title size="md">Birth Chart Analysis</Card.Title>
                </div>
              </Card.Header>
              <Card.Content>
                Comprehensive analysis of your birth chart revealing personality traits,
                strengths, challenges, and life purpose based on planetary positions.
              </Card.Content>
              <Card.Footer>
                <Link to="/chart">
                  <Button variant="outline" size="sm" className="w-full">
                    Generate Chart
                  </Button>
                </Link>
              </Card.Footer>
            </Card>

            <Card variant="default" className="group">
              <Card.Header>
                <div className="flex items-center mb-4">
                  <MandalaIcon size={32} className="text-cosmic-purple mr-3" />
                  <Card.Title size="md">Detailed Analysis</Card.Title>
                </div>
              </Card.Header>
              <Card.Content>
                In-depth interpretation of yogas, dashas, and planetary influences
                affecting your career, relationships, health, and spiritual growth.
              </Card.Content>
              <Card.Footer>
                <Link to="/analysis">
                  <Button variant="outline" size="sm" className="w-full">
                    Get Analysis
                  </Button>
                </Link>
              </Card.Footer>
            </Card>

            <Card variant="default" className="group md:col-span-2 lg:col-span-1">
              <Card.Header>
                <div className="flex items-center mb-4">
                  <LotusIcon size={32} className="text-lotus mr-3" />
                  <Card.Title size="md">Comprehensive Reports</Card.Title>
                </div>
              </Card.Header>
              <Card.Content>
                Detailed written reports covering all aspects of your astrological profile
                with remedies, predictions, and guidance for your life journey.
              </Card.Content>
              <Card.Footer>
                <Link to="/report">
                  <Button variant="outline" size="sm" className="w-full">
                    View Reports
                  </Button>
                </Link>
              </Card.Footer>
            </Card>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="section-spacing text-center">
          <Card variant="cosmic" className="transform hover:scale-105 transition-transform duration-300">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 font-accent">
                Begin Your Cosmic Journey Today
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Join thousands of seekers who have discovered their true path through the wisdom of Vedic astrology.
              </p>
              <Button variant="golden" size="lg" className="shadow-xl">
                <OmIcon size={20} className="mr-2" />
                Start Your Reading
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
