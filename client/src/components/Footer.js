import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = {
    services: [
      { name: 'Birth Chart Analysis', path: '/chart' },
      { name: 'Daily Horoscope', path: '/horoscope' },
      { name: 'Marriage Compatibility', path: '/compatibility' },
      { name: 'Career Guidance', path: '/career' }
    ],
    learn: [
      { name: 'Vedic Astrology Basics', path: '/learn/basics' },
      { name: 'Planetary Meanings', path: '/learn/planets' },
      { name: 'House System', path: '/learn/houses' },
      { name: 'Yoga & Doshas', path: '/learn/yogas' }
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' }
    ]
  };

  return (
    <footer className="bg-gradient-to-br from-vedic-deep-blue to-cosmic-purple text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-vedic-gold to-solar-orange rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">ॐ</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-accent font-bold text-white">Jyotish Shastra</span>
                <span className="text-xs text-vedic-saffron font-devanagari">ज्योतिष शास्त्र</span>
              </div>
            </div>
            <p className="text-lunar-silver mb-6 leading-relaxed">
              Discover the profound wisdom of Vedic astrology. Get personalized insights,
              detailed birth chart analysis, and guidance for life's important decisions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-vedic-gold transition-colors duration-300">
                <span className="text-sm">📘</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-vedic-gold transition-colors duration-300">
                <span className="text-sm">🐦</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-vedic-gold transition-colors duration-300">
                <span className="text-sm">📷</span>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-vedic-gold transition-colors duration-300">
                <span className="text-sm">🎬</span>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold text-vedic-gold mb-6">Services</h3>
            <ul className="space-y-3">
              {footerSections.services.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="text-lunar-silver hover:text-vedic-saffron transition-colors duration-300 text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="text-lg font-bold text-vedic-gold mb-6">Learn</h3>
            <ul className="space-y-3">
              {footerSections.learn.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="text-lunar-silver hover:text-vedic-saffron transition-colors duration-300 text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-vedic-gold mb-6">Support</h3>
            <ul className="space-y-3">
              {footerSections.support.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="text-lunar-silver hover:text-vedic-saffron transition-colors duration-300 text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-vedic-gold/20">
              <h4 className="text-vedic-saffron font-semibold mb-2">24/7 Support</h4>
              <p className="text-lunar-silver text-sm">
                Need help? Our astrology experts are here to assist you.
              </p>
              <Link
                to="/contact"
                className="inline-block mt-3 text-vedic-gold hover:text-vedic-saffron text-sm font-medium"
              >
                Contact Now →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-lunar-silver text-sm mb-4 md:mb-0">
              © {currentYear} Jyotish Shastra. All rights reserved. Made with 🙏 for spreading Vedic wisdom.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/privacy" className="text-lunar-silver hover:text-vedic-saffron transition-colors duration-300">
                Privacy
              </Link>
              <Link to="/terms" className="text-lunar-silver hover:text-vedic-saffron transition-colors duration-300">
                Terms
              </Link>
              <Link to="/cookies" className="text-lunar-silver hover:text-vedic-saffron transition-colors duration-300">
                Cookies
              </Link>
              <div className="text-vedic-saffron font-devanagari text-lg">
                सत्यं शिवं सुन्दरम्
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
