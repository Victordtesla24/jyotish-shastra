import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Button, LotusIcon, SunIcon, MoonIcon, StarIcon } from '../components/ui';
import { motion } from 'framer-motion';

const HomePage = () => {
  const [currentMantra, setCurrentMantra] = useState(0);

  const vedicMantras = [
    "ॐ गं गणपतये नमः",
    "ॐ सूर्याय नमः",
    "ॐ चन्द्राय नमः",
    "ॐ मंगलाय नमः"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMantra((prev) => (prev + 1) % vedicMantras.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [vedicMantras.length]);

  const features = [
    {
      icon: <SunIcon className="w-12 h-12 text-vedic-saffron" />,
      title: 'Janma Kundli (जन्म कुंडली)',
      subtitle: 'Birth Chart Generation',
      description: 'Generate precise Vedic birth charts using Swiss Ephemeris calculations with authentic Parashari principles and Ashtakavarga system.',
      link: '/chart',
      benefits: ['Accurate planetary positions', 'Divisional charts (D1-D60)', 'Ashtakavarga scoring', 'Yoga calculations']
    },
    {
      icon: <MoonIcon className="w-12 h-12 text-cosmic-purple" />,
      title: 'Graha Phala (ग्रह फल)',
      subtitle: 'Comprehensive Analysis',
      description: 'Deep astrological insights covering personality, career, relationships, health, and spiritual path through traditional Vedic methods.',
      link: '/analysis',
      benefits: ['Personality analysis', 'Career guidance', 'Relationship compatibility', 'Health insights']
    },
    {
      icon: <LotusIcon className="w-12 h-12 text-vedic-gold" />,
      title: 'Jyotish Phalita (ज्योतिष फलित)',
      subtitle: 'Detailed Reports',
      description: 'Professional astrological reports with authentic remedies, gemstone recommendations, and mantras from classical texts.',
      link: '/report',
      benefits: ['Detailed predictions', 'Vedic remedies', 'Gemstone guidance', 'Mantra recommendations']
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
    <div className="bg-sacred-white dark:bg-dark-bg-primary text-earth-brown dark:text-sacred-white min-h-screen">
      {/* Enhanced Hero Section with Parallax */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="relative h-screen flex items-center justify-center text-center overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-bg-primary via-cosmic-purple to-stellar-blue"></div>

        {/* Animated Stars */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Floating Om Symbol */}
        <motion.div
          className="absolute top-20 left-1/4 text-6xl text-vedic-gold opacity-20"
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ॐ
        </motion.div>

        {/* Floating Lotus */}
        <motion.div
          className="absolute bottom-32 right-1/4 text-4xl text-vedic-lotus-pink opacity-30"
          animate={{
            y: [10, -10, 10],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          🪷
        </motion.div>

        {/* Main Hero Content */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-10 max-w-5xl mx-auto px-4"
        >
          {/* Sanskrit Mantra */}
          <motion.div
            key={currentMantra}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="text-lg md:text-xl text-vedic-gold font-serif mb-4"
          >
            {vedicMantras[currentMantra]}
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-accent font-bold text-vedic-gradient mb-6 leading-tight"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Discover Your
            <span className="block text-cosmic-gradient">Cosmic Blueprint</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-sacred-white mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            "ज्योतिषे प्रकाशते यत्र" - Where Jyotish illuminates your path
            <span className="block mt-2 text-lg opacity-80">
              Ancient Vedic wisdom meets modern precision
            </span>
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/chart">
              <Button size="lg" className="btn-vedic-primary animate-sacred-pulse">
                🌟 Begin Your Journey
              </Button>
            </Link>
            <Link to="/analysis">
              <Button size="lg" variant="secondary" className="btn-cosmic backdrop-vedic">
                📜 Explore Features
              </Button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-sacred-white/80"
          >
            <div className="flex items-center gap-2">
              <StarIcon className="w-4 h-4 text-vedic-gold" />
              <span>5000+ Years of Tradition</span>
            </div>
            <div className="flex items-center gap-2">
              <SunIcon className="w-4 h-4 text-vedic-saffron" />
              <span>Swiss Ephemeris Precision</span>
            </div>
            <div className="flex items-center gap-2">
              <MoonIcon className="w-4 h-4 text-lunar-silver" />
              <span>Authentic Parashari Methods</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-vedic-gold rounded-full flex justify-center">
            <div className="w-1 h-3 bg-vedic-gold rounded-full mt-2"></div>
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gradient-to-br from-sacred-white to-vedic-background dark:from-dark-bg-primary dark:to-dark-surface">
        <div className="container-vedic">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-accent font-bold text-vedic-gradient mb-4">
              Sacred Features
              <span className="block text-2xl text-wisdom-gray font-normal mt-2">
                विशेष सुविधाएं
              </span>
            </h2>
            <p className="text-lg text-wisdom-gray max-w-3xl mx-auto leading-relaxed">
              Authentic Vedic astrology tools designed with deep respect for ancient traditions,
              powered by modern astronomical precision and time-tested Parashari principles.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="card-sacred h-full transition-all duration-300 group-hover:shadow-cosmic group-hover:scale-105">
                  <div className="text-center p-8">
                    {/* Icon with animation */}
                    <motion.div
                      className="flex justify-center mb-6"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {feature.icon}
                    </motion.div>

                    {/* Sanskrit Title */}
                    <h3 className="text-xl font-serif font-bold text-vedic-saffron mb-2">
                      {feature.title}
                    </h3>

                    {/* English Subtitle */}
                    <h4 className="text-lg font-accent font-semibold text-earth-brown dark:text-dark-text-primary mb-4">
                      {feature.subtitle}
                    </h4>

                    {/* Description */}
                    <p className="text-wisdom-gray mb-6 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Benefits List */}
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

                    {/* CTA Button */}
                    <Link to={feature.link}>
                      <Button
                        variant="secondary"
                        className="w-full group-hover:btn-vedic-primary transition-all duration-300"
                      >
                        <span className="flex items-center justify-center gap-2">
                          ✨ Explore Feature
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-vedic-background dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-accent font-bold">Ancient Wisdom, Modern Precision</h2>
          <p className="text-lg text-wisdom-gray mt-2 max-w-3xl mx-auto">Our platform combines time-tested principles with advanced astronomical calculations to provide accurate and meaningful insights.</p>
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
              <div className="text-4xl font-bold text-vedic-saffron">∞</div>
              <div className="text-lg text-wisdom-gray">Insights</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-accent font-bold">What Our Users Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <p className="italic">"{testimonial.text}"</p>
                    <p className="mt-4 font-bold text-right">- {testimonial.author}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-cosmic-purple text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-accent font-bold">Begin Your Sacred Journey</h2>
          <p className="text-lg mt-2 max-w-3xl mx-auto">Unlock the mysteries of your cosmic blueprint. Your journey to self-discovery starts here.</p>
          <Link to="/chart" className="mt-8 inline-block">
            <Button size="lg" variant="secondary">Start Your Reading</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
