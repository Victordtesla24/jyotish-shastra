import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Button } from '../components/ui';
import HeroSection from '../components/enhanced/HeroSection';

const HomePage = () => {
  const features = [
    {
      icon: '📊',
      title: 'Birth Chart Generation',
      description: 'Generate accurate Vedic birth charts with precise planetary positions and house calculations.',
      link: '/chart'
    },
    {
      icon: '🔮',
      title: 'Comprehensive Analysis',
      description: 'Deep astrological insights covering personality, career, relationships, and life predictions.',
      link: '/analysis'
    },
    {
      icon: '📜',
      title: 'Detailed Reports',
      description: 'Professional astrological reports with remedies and recommendations.',
      link: '/report'
    }
  ];

  const testimonials = [
    {
      text: "The accuracy of the predictions is remarkable. This platform truly understands Vedic astrology.",
      author: "Priya S.",
      role: "Software Engineer"
    },
    {
      text: "Finally, a platform that respects the authentic traditions while being user-friendly.",
      author: "Dr. Rajesh K.",
      role: "Astrology Researcher"
    },
    {
      text: "The detailed analysis helped me understand my life path better. Highly recommended!",
      author: "Arun M.",
      role: "Business Owner"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sacred-white to-gray-50">
      {/* Enhanced Hero Section with animations and interactivity */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-accent text-3xl md:text-4xl font-bold text-earth-brown mb-4">
              Sacred Features
            </h2>
            <p className="text-lg text-wisdom-gray max-w-2xl mx-auto">
              Authentic Vedic astrology tools designed with respect for ancient traditions
              and modern precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} variant="elevated" className="group hover:shadow-cosmic transition-all duration-300">
                <CardContent className="text-center p-8">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-accent text-xl font-bold text-earth-brown mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-wisdom-gray mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <Link to={feature.link}>
                    <Button variant="outline" className="border-cosmic-purple text-cosmic-purple hover:bg-cosmic-purple hover:text-white">
                      Learn More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sacred Geometry Section */}
      <section className="py-20 bg-gradient-to-br from-vedic-background to-saffron-subtle">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-accent text-3xl md:text-4xl font-bold text-earth-brown mb-6">
              Ancient Wisdom, Modern Precision
            </h2>
            <p className="text-lg text-wisdom-gray mb-8 leading-relaxed">
              Our platform combines the time-tested principles of Vedic astrology with
              advanced astronomical calculations to provide you with the most accurate
              and meaningful insights into your cosmic blueprint.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl mb-2">🌟</div>
                <div className="font-accent font-bold text-earth-brown text-xl">12</div>
                <div className="text-sm text-wisdom-gray">Houses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🪐</div>
                <div className="font-accent font-bold text-earth-brown text-xl">9</div>
                <div className="text-sm text-wisdom-gray">Planets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⭐</div>
                <div className="font-accent font-bold text-earth-brown text-xl">27</div>
                <div className="text-sm text-wisdom-gray">Nakshatras</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔮</div>
                <div className="font-accent font-bold text-earth-brown text-xl">∞</div>
                <div className="text-sm text-wisdom-gray">Insights</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-accent text-3xl md:text-4xl font-bold text-earth-brown mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-wisdom-gray max-w-2xl mx-auto">
              Discover how Vedic astrology has transformed lives and provided clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} variant="vedic" className="text-center">
                <CardContent className="p-8">
                  <div className="text-2xl text-vedic-gold mb-4">⭐</div>
                  <p className="text-white/90 mb-6 italic leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <div className="font-accent font-bold text-white">
                      {testimonial.author}
                    </div>
                    <div className="text-white/70 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-cosmic-purple to-vedic-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-accent text-3xl md:text-4xl font-bold text-white mb-6">
            Begin Your Sacred Journey
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Unlock the mysteries of your cosmic blueprint with authentic Vedic astrology.
            Your journey to self-discovery starts here.
          </p>
          <Link to="/chart">
            <Button size="lg" variant="secondary" className="bg-white text-cosmic-purple hover:bg-vedic-gold hover:text-white">
              Start Your Reading
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
