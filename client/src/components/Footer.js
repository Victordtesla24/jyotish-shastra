import React from 'react';
import { Link } from 'react-router-dom';
import { OmIcon, LotusIcon, StarIcon, MandalaIcon } from './ui';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: 'Birth Chart', href: '/chart' },
      { name: 'Analysis', href: '/analysis' },
      { name: 'Reports', href: '/report' },
      { name: 'Predictions', href: '/predictions' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Astrologers', href: '/astrologers' },
      { name: 'Testimonials', href: '/testimonials' },
      { name: 'Contact', href: '/contact' },
    ],
    resources: [
      { name: 'Learning Center', href: '/learn' },
      { name: 'Vedic Calendar', href: '/calendar' },
      { name: 'Blog', href: '/blog' },
      { name: 'FAQ', href: '/faq' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Disclaimer', href: '/disclaimer' },
      { name: 'Refund Policy', href: '/refund' },
    ],
  };

  return (
    <footer className="bg-gradient-to-br from-earth-brown via-maroon to-navy text-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-5">
        <MandalaIcon size={300} className="absolute top-10 right-10 animate-mandala-rotate" />
        <LotusIcon size={200} className="absolute bottom-10 left-10 animate-pulse-soft" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container-vedic section-spacing">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <OmIcon size={40} className="text-gold animate-pulse-soft" />
                <div>
                  <h3 className="text-2xl font-bold font-accent text-white">
                    Jyotish Shastra
                  </h3>
                  <p className="text-gold/80 font-vedic text-sm">
                    ज्योतिष शास्त्र
                  </p>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed max-w-md">
                Discover your cosmic blueprint through authentic Vedic astrology.
                Our AI-powered system combines ancient wisdom with modern precision
                to guide you on your spiritual journey.
              </p>

              <div className="flex items-center space-x-4">
                <StarIcon size={20} className="text-gold" />
                <span className="text-sm text-gray-300">
                  Trusted by 5000+ seekers worldwide
                </span>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gold font-accent">
                Services
              </h4>
              <ul className="space-y-2">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-gold transition-colors duration-300 hover:underline text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gold font-accent">
                Company
              </h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-gold transition-colors duration-300 hover:underline text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources & Legal */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gold font-accent">
                  Resources
                </h4>
                <ul className="space-y-2">
                  {footerLinks.resources.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-gray-300 hover:text-gold transition-colors duration-300 hover:underline text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gold font-accent">
                  Legal
                </h4>
                <ul className="space-y-2">
                  {footerLinks.legal.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-gray-300 hover:text-gold transition-colors duration-300 hover:underline text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20">
          <div className="container-vedic py-6">
            {/* Bottom Section */}
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Copyright */}
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>© {currentYear} Jyotish Shastra.</span>
                <span>All rights reserved.</span>
              </div>

              {/* Sacred Elements */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <LotusIcon size={16} className="text-lotus" />
                  <span>Made with ancient wisdom</span>
                  <StarIcon size={16} className="text-gold animate-pulse" />
                </div>
              </div>

              {/* Social Links Placeholder */}
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-500">Connect with us:</span>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-300 cursor-pointer">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-300 cursor-pointer">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-300 cursor-pointer">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.219-.359-1.219c0-1.142.662-1.995 1.488-1.995.219 0 .406.041.406.406 0 .406-.219 1.006-.406 1.565-.219.937.469 1.684 1.406 1.684 1.684 0 2.979-1.781 2.979-4.344 0-2.271-1.633-3.858-3.968-3.858-2.704 0-4.289 2.027-4.289 4.121 0 .822.314 1.684.717 2.158.079.094.094.178.069.275-.076.314-.248 1.006-.281 1.145-.041.188-.135.229-.314.135-1.25-.583-2.027-2.417-2.027-3.886 0-2.99 2.172-5.734 6.26-5.734 3.286 0 5.844 2.342 5.844 5.471 0 3.267-2.058 5.891-4.916 5.891-.959 0-1.864-.499-2.173-1.098l-.59 2.25c-.213.828-.789 1.864-1.175 2.497C9.23 23.806 10.58 24.029 12.017 24.029c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Border */}
        <div className="h-1 bg-gradient-to-r from-gold via-saffron to-gold"></div>
      </div>
    </footer>
  );
};

export default Footer;
