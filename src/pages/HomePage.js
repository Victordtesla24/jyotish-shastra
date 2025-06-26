import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, OmIcon, LotusIcon, MandalaIcon, StarIcon, SunIcon, MoonIcon } from '../components/ui';

const HomePage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [visibleCards, setVisibleCards] = useState(new Set());

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = entry.target.getAttribute('data-card-id');
            if (cardId) {
              setVisibleCards(prev => new Set([...prev, cardId]));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('[data-card-id]');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const zodiacSigns = [
    { name: 'Aries', sanskrit: 'मेष', symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire', lord: 'Mars', color: 'text-red-500' },
    { name: 'Taurus', sanskrit: 'वृषभ', symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth', lord: 'Venus', color: 'text-green-500' },
    { name: 'Gemini', sanskrit: 'मिथुन', symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air', lord: 'Mercury', color: 'text-yellow-500' },
    { name: 'Cancer', sanskrit: 'कर्क', symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water', lord: 'Moon', color: 'text-blue-400' },
    { name: 'Leo', sanskrit: 'सिंह', symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire', lord: 'Sun', color: 'text-orange-500' },
    { name: 'Virgo', sanskrit: 'कन्या', symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth', lord: 'Mercury', color: 'text-green-600' }
  ];

  const services = [
    {
      title: 'Birth Chart Analysis',
      sanskrit: 'जन्म कुंडली',
      description: 'Complete analysis of your birth chart with detailed planetary positions and interpretations.',
      icon: SunIcon,
      link: '/chart',
      gradient: 'from-orange-400 to-red-500'
    },
    {
      title: 'Comprehensive Report',
      sanskrit: 'विस्तृत रिपोर्ट',
      description: 'Detailed life predictions covering career, relationships, health, and spiritual growth.',
      icon: MandalaIcon,
      link: '/analysis',
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      title: 'Dasha Analysis',
      sanskrit: 'दशा विश्लेषण',
      description: 'Understand your current and upcoming planetary periods and their influences.',
      icon: MoonIcon,
      link: '/report',
      gradient: 'from-blue-400 to-purple-500'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Mumbai, India',
      text: 'The accuracy of predictions is remarkable. This platform helped me understand my life path better.',
      rating: 5,
      avatar: '👩🏻‍💼'
    },
    {
      name: 'Rajesh Kumar',
      location: 'Delhi, India',
      text: 'Authentic Vedic astrology with modern technology. Highly recommended for serious seekers.',
      rating: 5,
      avatar: '👨🏻‍💼'
    },
    {
      name: 'Anjali Patel',
      location: 'Ahmedabad, India',
      text: 'The detailed analysis helped me make important life decisions with confidence.',
      rating: 5,
      avatar: '👩🏻‍🎓'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Clients', icon: StarIcon },
    { number: '15+', label: 'Years Experience', icon: MandalaIcon },
    { number: '50,000+', label: 'Charts Generated', icon: SunIcon },
    { number: '98%', label: 'Accuracy Rate', icon: LotusIcon }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sacred-white via-gray-50 to-blue-50">
      {/* Enhanced Hero Section - Import and use the new HeroSection component */}
      {/* This will be replaced with the new HeroSection component */}
      <section className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-96 h-96 bg-gradient-to-br from-saffron/10 to-gold/10 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-gradient-to-tr from-cosmic-purple/10 to-stellar-blue/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
          <MandalaIcon size={200} className="absolute top-20 right-20 opacity-5 animate-mandala-rotate text-saffron" />
          <LotusIcon size={150} className="absolute bottom-20 left-20 opacity-5 animate-pulse-soft text-cosmic-purple" />
        </div>

        <div className="relative bg-gradient-to-br from-stellar-blue via-cosmic-purple to-navy">
          <div className="container-vedic py-20 md:py-32">
            <div className="text-center text-white">
              <div className="font-vedic text-2xl md:text-3xl mb-6 opacity-90">ज्योतिष शास्त्र</div>
              <h1 className="font-accent text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-gold via-saffron to-orange-300 bg-clip-text text-transparent">
                  Discover Your
                </span>
                <br />
                <span className="text-white">Cosmic Blueprint</span>
              </h1>
              <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-4xl mx-auto leading-relaxed">
                Experience authentic Vedic astrology analysis with our advanced AI-powered system.
                Get detailed birth chart analysis, predictions, and guidance based on thousands of years of ancient wisdom.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/chart">
                  <Button variant="golden" size="xl" className="w-full sm:w-auto group">
                    <SunIcon size={20} className="mr-3 group-hover:rotate-45 transition-transform duration-300" />
                    Generate Your Kundli
                  </Button>
                </Link>
                <Link to="/analysis">
                  <Button variant="secondary" size="xl" className="w-full sm:w-auto group">
                    <MandalaIcon size={20} className="mr-3 group-hover:scale-110 transition-transform duration-300" />
                    Get Analysis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats Section */}
      <section className="section-spacing">
        <div className="container-vedic">
          <Card variant="glassmorphic" className="backdrop-blur-xl border-white/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={index}
                    data-card-id={`stat-${index}`}
                    className={`text-center group transition-all duration-700 ${
                      visibleCards.has(`stat-${index}`) ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <IconComponent size={40} className="mx-auto mb-4 text-saffron group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                    <div className="text-3xl md:text-4xl font-bold text-earth-brown mb-2 font-accent">{stat.number}</div>
                    <div className="text-wisdom-gray font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-spacing bg-gradient-to-r from-sacred-white to-gray-100">
        <div className="container-vedic">
          <div className="text-center mb-16">
            <h2 className="text-responsive-4xl font-accent font-bold text-earth-brown mb-6">Our Sacred Services</h2>
            <div className="w-24 h-1 bg-gradient-vedic mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-wisdom-gray max-w-3xl mx-auto leading-relaxed">
              Discover the profound insights of Vedic astrology through our comprehensive services designed to illuminate your path.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card
                  key={index}
                  variant="default"
                  hover={true}
                  data-card-id={`service-${index}`}
                  className={`group cursor-pointer transition-all duration-700 ${
                    visibleCards.has(`service-${index}`) ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <Link to={service.link} className="block h-full">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${service.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent size={28} className="text-white" />
                    </div>
                    <h3 className="font-accent text-xl font-semibold text-earth-brown mb-2">{service.title}</h3>
                    <div className="font-vedic text-saffron mb-4 text-lg">{service.sanskrit}</div>
                    <p className="text-wisdom-gray leading-relaxed mb-6">{service.description}</p>
                    <div className="flex items-center text-saffron font-medium group-hover:translate-x-2 transition-transform duration-300">
                      Learn More
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Zodiac Preview Section */}
      <section className="section-spacing">
        <div className="container-vedic">
          <div className="text-center mb-16">
            <h2 className="text-responsive-4xl font-accent font-bold text-earth-brown mb-6">Zodiac Insights</h2>
            <div className="w-24 h-1 bg-gradient-cosmic mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-wisdom-gray max-w-3xl mx-auto leading-relaxed">
              Explore the twelve rashis and their profound influences on your life journey.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {zodiacSigns.map((sign, index) => (
              <Card
                key={index}
                variant="default"
                hover={true}
                data-card-id={`zodiac-${index}`}
                className={`group text-center transition-all duration-700 ${
                  visibleCards.has(`zodiac-${index}`) ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`text-6xl mb-4 group-hover:scale-110 transition-transform duration-300 ${sign.color}`}>
                  {sign.symbol}
                </div>
                <h3 className="font-accent text-xl font-semibold text-earth-brown mb-2">{sign.name}</h3>
                <div className="font-vedic text-saffron text-lg mb-3">{sign.sanskrit}</div>
                <div className="text-sm text-wisdom-gray mb-2">{sign.dates}</div>
                <div className="flex justify-center space-x-4 text-xs text-wisdom-gray">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">{sign.element}</span>
                  <span className="bg-saffron/10 text-saffron px-2 py-1 rounded-full">{sign.lord}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-spacing bg-gradient-to-r from-cosmic-purple to-stellar-blue">
        <div className="container-vedic">
          <div className="text-center mb-16">
            <h2 className="text-responsive-4xl font-accent font-bold text-white mb-6">Sacred Testimonials</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold to-saffron mx-auto mb-6 rounded-full"></div>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Hear from our satisfied clients who found clarity and guidance through our Vedic astrology services.
            </p>
          </div>
          <Card variant="glassmorphic" className="max-w-4xl mx-auto backdrop-blur-xl">
            <div className="text-center">
              <div className="text-6xl mb-6">{testimonials[currentTestimonial].avatar}</div>
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <StarIcon key={i} size={24} className="text-gold" />
                ))}
              </div>
              <blockquote className="text-xl text-white mb-6 italic leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </blockquote>
              <div className="text-white/80">
                <div className="font-semibold text-lg">{testimonials[currentTestimonial].name}</div>
                <div className="text-sm">{testimonials[currentTestimonial].location}</div>
              </div>
              <div className="flex justify-center space-x-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? 'bg-gold scale-125' : 'bg-white/30 hover:bg-white/50'
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-gradient-to-br from-sacred-white to-saffron/5">
        <div className="container-vedic">
          <Card variant="cosmic" className="text-center">
            <div className="relative">
              <MandalaIcon size={80} className="mx-auto mb-8 text-white/20 animate-spin-slow" />
              <h2 className="font-accent text-3xl md:text-4xl font-bold text-white mb-6">Begin Your Spiritual Journey</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Take the first step towards understanding your cosmic blueprint and unlocking the wisdom of the stars.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/chart">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">Start Free Analysis</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto text-white hover:bg-white/10">
                    Connect with Astrologer
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
