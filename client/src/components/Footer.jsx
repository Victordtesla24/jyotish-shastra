import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border mt-auto">
      <div className="container-vedic py-8">
        <div className="text-center">
          <p className="text-wisdom-gray dark:text-dark-text-secondary mb-2">
            © {currentYear} Jyotish Shastra. All rights reserved.
          </p>
          <p className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
            Ancient wisdom meets modern technology
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <span className="text-2xl">🔮</span>
            <span className="text-2xl">🌙</span>
            <span className="text-2xl">⭐</span>
            <span className="text-2xl">☀️</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
