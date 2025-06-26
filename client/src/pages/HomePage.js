import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
  Card,
  CardContent,
  cn
} from '../components/ui';
import useCountUp from '../hooks/useCountUp';

const HomePage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const [analysisRef, analysisCount] = useCountUp(50000, 2000);
  const [accuracyRef, accuracyRate] = useCountUp(98, 1500);
  const [yearsRef, yearsOfTradition] = useCountUp(5000, 2500);

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Mumbai",
      text: "The accuracy of my Kundli analysis was astounding. It helped me understand my life path better.",
      rating: 5
    },
    {
      name: "Rajesh Kumar",
      location: "Delhi",
      text: "Professional and authentic Vedic astrology service. The detailed report exceeded my expectations.",
      rating: 5
    },
    {
      name: "Anita Patel",
      location: "Bangalore",
      text: "The insights provided were life-changing. I finally understand my true purpose.",
      rating: 5
    }
  ];

  const features = [
    {
      icon: "🌟",
      title: "Authentic Vedic Analysis",
      description: "Traditional calculations based on ancient scriptures"
    },
    {
      icon: "📊",
      title: "Detailed Charts",
      description: "Complete birth chart with all divisional charts"
    },
    {
      icon: "🔮",
      title: "Life Predictions",
      description: "Comprehensive predictions for all life aspects"
    },
    {
      icon: "📅",
      title: "Dasha Analysis",
      description: "Detailed planetary period analysis"
    },
    {
      icon: "💑",
      title: "Compatibility Matching",
      description: "Scientific matching for relationships"
    },
    {
      icon: "🛡️",
      title: "Remedial Measures",
      description: "Authentic Vedic remedies and solutions"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-vedic-background overflow-hidden">
      {/* Hero Section with Cosmic Background */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cosmic-purple/20 via-vedic-background to-vedic-background" />

          {/* Floating celestial orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-vedic-accent/20 rounded-full blur-3xl"
            animate={{
              x: mousePosition.x * 2,
              y: mousePosition.y * 2,
              scale: [1, 1.1, 1],
            }}
            transition={{
              x: { type: "spring", stiffness: 50 },
              y: { type: "spring", stiffness: 50 },
              scale: { duration: 4, repeat: Infinity }
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cosmic-purple/20 rounded-full blur-3xl"
            animate={{
              x: mousePosition.x * -3,
              y: mousePosition.y * -3,
              scale: [1, 1.2, 1],
            }}
            transition={{
              x: { type: "spring", stiffness: 30 },
              y: { type: "spring", stiffness: 30 },
              scale: { duration: 6, repeat: Infinity }
            }}
          />

          {/* Animated stars */}
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          {/* Sanskrit Mantra */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-vedic-accent text-lg mb-4 font-noto"
          >
            ॐ ज्योतिर्लिंगाय नमः
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-cinzel font-bold text-vedic-text mb-6"
          >
            Discover Your
            <span className="block bg-gradient-to-r from-vedic-primary via-vedic-accent to-gold-pure bg-clip-text text-transparent">
              Cosmic Blueprint
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl sm:text-2xl text-vedic-text-light mb-10 max-w-3xl mx-auto"
          >
            Unlock the ancient wisdom of Vedic astrology with authentic Kundli analysis
            based on 5000-year-old traditions
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link to="/chart">
              <Button size="lg" variant="accent" className="group">
                <span className="mr-2">Generate Your Kundli</span>
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>
            </Link>
            <Button size="lg" variant="secondary">
              Learn More About Jyotish
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            <div className="text-center" ref={analysisRef}>
              <div className="text-4xl font-bold text-vedic-accent">{analysisCount}+</div>
              <div className="text-vedic-text-light">Charts Analyzed</div>
            </div>
            <div className="text-center" ref={accuracyRef}>
              <div className="text-4xl font-bold text-vedic-accent">{accuracyRate}%</div>
              <div className="text-vedic-text-light">Accuracy Rate</div>
            </div>
            <div className="text-center" ref={yearsRef}>
              <div className="text-4xl font-bold text-vedic-accent">{yearsOfTradition}</div>
              <div className="text-vedic-text-light">Years of Tradition</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            opacity: { delay: 1.5 },
            y: { duration: 2, repeat: Infinity }
          }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-vedic-accent rounded-full p-1">
            <div className="w-1 h-3 bg-vedic-accent rounded-full mx-auto animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-vedic-background to-vedic-surface/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-cinzel font-bold text-vedic-text mb-4">
              Ancient Wisdom, Modern Precision
            </h2>
            <p className="text-xl text-vedic-text-light max-w-3xl mx-auto">
              Experience the most comprehensive Vedic astrology analysis with our advanced calculation engine
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  variant="default"
                  hover="lift"
                  className="h-full"
                  decorative
                >
                  <CardContent className="text-center p-8">
                    <motion.div
                      className="text-5xl mb-4"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-xl font-cinzel font-semibold text-vedic-text mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-vedic-text-light">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-cinzel font-bold text-vedic-text mb-4">
              Your Journey to Self-Discovery
            </h2>
            <p className="text-xl text-vedic-text-light">
              Three simple steps to unlock your cosmic potential
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Enter Birth Details",
                description: "Provide your exact birth time, date, and location",
                icon: "📝"
              },
              {
                step: "02",
                title: "Generate Kundli",
                description: "Our AI calculates your personalized birth chart",
                icon: "⚡"
              },
              {
                step: "03",
                title: "Receive Insights",
                description: "Get detailed analysis and life predictions",
                icon: "🎯"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Card variant="cosmic" className="text-center h-full">
                  <CardContent className="p-8">
                    <motion.div
                      className="text-6xl mb-4"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {item.icon}
                    </motion.div>
                    <div className="text-4xl font-cinzel text-vedic-accent mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-vedic-text-light">{item.description}</p>
                  </CardContent>
                </Card>
                {index < 2 && (
                  <motion.div
                    className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-4xl text-vedic-accent"
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-vedic-surface/50 to-vedic-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-cinzel font-bold text-vedic-text mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-vedic-text-light">
              Join thousands who have discovered their true path
            </p>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <Card variant="vedic" className="max-w-2xl mx-auto">
                  <CardContent className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <span key={i} className="text-2xl text-vedic-accent">⭐</span>
                      ))}
                    </div>
                    <p className="text-xl text-vedic-text mb-6 italic">
                      "{testimonials[currentTestimonial].text}"
                    </p>
                    <div>
                      <p className="font-semibold text-vedic-text">
                        {testimonials[currentTestimonial].name}
                      </p>
                      <p className="text-vedic-text-light">
                        {testimonials[currentTestimonial].location}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    currentTestimonial === index
                      ? "bg-vedic-accent w-8"
                      : "bg-vedic-border hover:bg-vedic-accent/50"
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <Card variant="cosmic" className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-vedic-primary/20 via-vedic-accent/20 to-gold-pure/20 animate-pulse" />
            <CardContent className="relative z-10 p-12">
              <h2 className="text-4xl sm:text-5xl font-cinzel font-bold text-vedic-text mb-6">
                Ready to Discover Your Destiny?
              </h2>
              <p className="text-xl text-vedic-text-light mb-8 max-w-2xl mx-auto">
                Your personalized Vedic birth chart is just a few clicks away. Start your journey of self-discovery today.
              </p>
              <Link to="/chart">
                <Button size="xl" variant="accent" className="group">
                  <span className="mr-2 text-lg">Create My Kundli Now</span>
                  <motion.span
                    className="inline-block text-xl"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
