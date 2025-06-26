import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto pt-12 pb-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="footer-section">
            <h3 className="text-lg font-bold text-indigo-400 mb-4">Jyotish Shastra</h3>
            <p className="text-gray-400">Expert-level Vedic Astrology Analysis System</p>
          </div>
          <div className="footer-section">
            <h4 className="text-md font-semibold text-indigo-400 mb-4">Features</h4>
            <ul className="list-none p-0">
              <li className="mb-2 text-gray-400 hover:text-indigo-400 cursor-pointer">Birth Chart Generation</li>
              <li className="mb-2 text-gray-400 hover:text-indigo-400 cursor-pointer">Comprehensive Analysis</li>
              <li className="mb-2 text-gray-400 hover:text-indigo-400 cursor-pointer">Life Predictions</li>
              <li className="mb-2 text-gray-400 hover:text-indigo-400 cursor-pointer">Detailed Reports</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="text-md font-semibold text-indigo-400 mb-4">Resources</h4>
            <ul className="list-none p-0">
              <li className="mb-2 text-gray-400 hover:text-indigo-400 cursor-pointer">Documentation</li>
              <li className="mb-2 text-gray-400 hover:text-indigo-400 cursor-pointer">API Reference</li>
              <li className="mb-2 text-gray-400 hover:text-indigo-400 cursor-pointer">User Guide</li>
              <li className="mb-2 text-gray-400 hover:text-indigo-400 cursor-pointer">Support</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4 text-center text-gray-500">
          <p>&copy; 2024 Jyotish Shastra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
