import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Chart', href: '/chart' },
    { name: 'Analysis', href: '/analysis' },
    { name: 'Report', href: '/report' },
  ];

  const aboutLinks = [
    { name: 'About Vedic Astrology', href: '#' },
    { name: 'How it Works', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
  ];

  return (
    <footer className="bg-gradient-to-br from-earth-brown to-cosmic-purple text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-vedic-gold to-saffron-bright rounded-full flex items-center justify-center">
                <span className="text-2xl">🕉️</span>
              </div>
              <div>
                <h3 className="font-accent font-bold text-xl">Jyotish Shastra</h3>
                <p className="text-white/80 text-sm">Ancient Wisdom, Modern Insights</p>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Discover the profound wisdom of Vedic astrology through precise calculations and
              authentic interpretations. Our platform combines ancient traditions with modern
              technology to provide accurate and meaningful astrological insights.
            </p>
            <div className="flex space-x-4 text-2xl">
              <span>📿</span>
              <span>🌟</span>
              <span>🔮</span>
              <span>⭐</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-accent font-semibold text-lg mb-4 text-vedic-gold">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-white/80 hover:text-white hover:text-vedic-gold transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About & Legal */}
          <div>
            <h4 className="font-accent font-semibold text-lg mb-4 text-vedic-gold">About</h4>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-white hover:text-vedic-gold transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/80 text-sm mb-4 md:mb-0">
              <p>© {currentYear} Jyotish Shastra. All rights reserved.</p>
              <p className="text-xs mt-1">Built with reverence for ancient wisdom</p>
            </div>

            {/* Sacred Mantra */}
            <div className="text-center md:text-right">
              <p className="text-vedic-gold text-sm font-accent">
                सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः
              </p>
              <p className="text-white/60 text-xs mt-1">
                May all beings be happy and free from illness
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
