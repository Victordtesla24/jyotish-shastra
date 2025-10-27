import React, { useState } from 'react';
import VedicLoadingSpinner from './loading/VedicLoadingSpinner';
import ErrorMessage from './ErrorMessage';

/**
 * Vedic Design System Showcase Component
 * Demonstrates all consistent UI elements, colors, symbols, and design patterns
 * Used for testing and documentation of the unified design system
 */
const VedicDesignShowcase = () => {
  const [selectedSection, setSelectedSection] = useState('colors');
  const [showError, setShowError] = useState(false);
  const [loadingType, setLoadingType] = useState('mandala');

  const sections = [
    { id: 'colors', name: 'Color Palette', icon: '🎨' },
    { id: 'symbols', name: 'Vedic Symbols', icon: '🕉️' },
    { id: 'buttons', name: 'Buttons', icon: '🔘' },
    { id: 'cards', name: 'Cards & Layouts', icon: '🃏' },
    { id: 'forms', name: 'Form Elements', icon: '📝' },
    { id: 'navigation', name: 'Navigation', icon: '🧭' },
    { id: 'feedback', name: 'Loading & Feedback', icon: '💬' },
    { id: 'badges', name: 'Badges & Status', icon: '🏷️' }
  ];

  const renderColorPalette = () => (
    <div className="space-vedic">
      <h3 className="text-2xl font-bold text-saffron mb-6">Vedic Color Palette</h3>

      {/* Primary Colors */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-secondary mb-4">Primary Sacred Colors</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="card-vedic">
            <div className="w-full h-20 bg-saffron rounded-lg mb-3"></div>
            <p className="text-sm font-medium">Vedic Saffron</p>
            <p className="text-xs text-muted font-mono">#FF9933</p>
          </div>
          <div className="card-vedic">
            <div className="w-full h-20 bg-gold rounded-lg mb-3"></div>
            <p className="text-sm font-medium">Sacred Gold</p>
            <p className="text-xs text-muted font-mono">#FFD700</p>
          </div>
          <div className="card-vedic">
            <div className="w-full h-20 bg-maroon rounded-lg mb-3" style={{backgroundColor: 'var(--vedic-maroon)'}}></div>
            <p className="text-sm font-medium">Deep Maroon</p>
            <p className="text-xs text-muted font-mono">#8B0000</p>
          </div>
        </div>
      </div>

      {/* Planetary Colors */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-secondary mb-4">Planetary Colors (Graha)</h4>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { name: 'Sun', color: 'var(--sun-color)', symbol: '☀' },
            { name: 'Moon', color: 'var(--moon-color)', symbol: '☽' },
            { name: 'Mars', color: 'var(--mars-color)', symbol: '♂' },
            { name: 'Mercury', color: 'var(--mercury-color)', symbol: '☿' },
            { name: 'Jupiter', color: 'var(--jupiter-color)', symbol: '♃' },
            { name: 'Venus', color: 'var(--venus-color)', symbol: '♀' },
            { name: 'Saturn', color: 'var(--saturn-color)', symbol: '♄' },
            { name: 'Rahu', color: 'var(--rahu-color)', symbol: '☊' },
            { name: 'Ketu', color: 'var(--ketu-color)', symbol: '☋' }
          ].map(planet => (
            <div key={planet.name} className="card-vedic text-center">
              <div
                className="w-full h-12 rounded-lg mb-2 flex items-center justify-center text-white text-xl"
                style={{backgroundColor: planet.color}}
              >
                {planet.symbol}
              </div>
              <p className="text-xs font-medium">{planet.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status Colors */}
      <div>
        <h4 className="text-lg font-semibold text-secondary mb-4">Dignity & Status Colors</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: 'Exalted', class: 'bg-exalted', desc: 'Strong position' },
            { name: 'Debilitated', class: 'bg-debilitated', desc: 'Weak position' },
            { name: 'Friendly', class: 'bg-friendly', desc: 'Harmonious' },
            { name: 'Enemy', class: 'bg-enemy', desc: 'Challenging' },
            { name: 'Neutral', class: 'bg-neutral', desc: 'Balanced' },
            { name: 'Own Sign', class: 'bg-own-sign', desc: 'Natural strength' }
          ].map(status => (
            <div key={status.name} className="card-vedic">
              <div className={`w-full h-12 ${status.class} rounded-lg mb-3`}></div>
              <p className="text-sm font-medium">{status.name}</p>
              <p className="text-xs text-muted">{status.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSymbols = () => (
    <div className="space-vedic">
      <h3 className="text-2xl font-bold text-saffron mb-6">Vedic Symbols</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { symbol: 'symbol-om', name: 'Om (ॐ)', desc: 'Sacred sound' },
          { symbol: 'symbol-sun', name: 'Sun (☀)', desc: 'Solar energy' },
          { symbol: 'symbol-moon', name: 'Moon (☽)', desc: 'Lunar energy' },
          { symbol: 'symbol-mars', name: 'Mars (♂)', desc: 'Warrior planet' },
          { symbol: 'symbol-mercury', name: 'Mercury (☿)', desc: 'Communication' },
          { symbol: 'symbol-jupiter', name: 'Jupiter (♃)', desc: 'Wisdom' },
          { symbol: 'symbol-venus', name: 'Venus (♀)', desc: 'Beauty & love' },
          { symbol: 'symbol-saturn', name: 'Saturn (♄)', desc: 'Discipline' },
          { symbol: 'symbol-lotus', name: 'Lotus (🪷)', desc: 'Purity' },
          { symbol: 'symbol-mandala', name: 'Mandala (🕉)', desc: 'Cosmic order' },
          { symbol: 'symbol-chakra', name: 'Chakra (⚛)', desc: 'Energy center' },
          { symbol: 'symbol-fire', name: 'Fire (🔥)', desc: 'Agni element' }
        ].map(item => (
          <div key={item.symbol} className="card-vedic text-center group hover:shadow-lg transition-all">
            <div className={`vedic-symbol ${item.symbol} text-4xl mb-3 group-hover:scale-110 transition-transform`}></div>
            <h4 className="font-semibold text-primary">{item.name}</h4>
            <p className="text-sm text-muted">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderButtons = () => (
    <div className="space-vedic">
      <h3 className="text-2xl font-bold text-saffron mb-6">Button System</h3>

      <div className="space-y-8">
        {/* Button Variants */}
        <div>
          <h4 className="text-lg font-semibold text-secondary mb-4">Button Variants</h4>
          <div className="flex flex-wrap gap-4">
            <button className="btn-vedic btn-primary">
              <span className="vedic-symbol symbol-om"></span>
              Primary Button
            </button>
            <button className="btn-vedic btn-secondary">
              <span className="vedic-symbol symbol-gold"></span>
              Secondary Button
            </button>
            <button className="btn-vedic btn-outline">
              <span className="vedic-symbol">✨</span>
              Outline Button
            </button>
            <button className="btn-vedic btn-ghost">
              <span className="vedic-symbol">👻</span>
              Ghost Button
            </button>
          </div>
        </div>

        {/* Button Sizes */}
        <div>
          <h4 className="text-lg font-semibold text-secondary mb-4">Button Sizes</h4>
          <div className="flex flex-wrap items-center gap-4">
            <button className="btn-vedic btn-primary btn-sm">Small</button>
            <button className="btn-vedic btn-primary">Medium (Default)</button>
            <button className="btn-vedic btn-primary btn-lg">Large</button>
            <button className="btn-vedic btn-primary btn-xl">Extra Large</button>
          </div>
        </div>

        {/* Button States */}
        <div>
          <h4 className="text-lg font-semibold text-secondary mb-4">Button States</h4>
          <div className="flex flex-wrap gap-4">
            <button className="btn-vedic btn-primary">Normal</button>
            <button className="btn-vedic btn-primary" disabled>Disabled</button>
            <button className="btn-vedic btn-primary">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Loading
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="space-vedic">
      <h3 className="text-2xl font-bold text-saffron mb-6">Cards & Layouts</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card-vedic">
          <h4 className="text-lg font-semibold text-primary mb-3">Standard Card</h4>
          <p className="text-secondary">Basic card with hover effects and consistent styling.</p>
        </div>

        <div className="card-sacred">
          <h4 className="text-lg font-semibold text-primary mb-3">Sacred Card</h4>
          <p className="text-secondary">Enhanced card with sacred gradient background and golden glow.</p>
        </div>

        <div className="card-cosmic">
          <h4 className="text-lg font-semibold text-primary mb-3">Cosmic Card</h4>
          <p className="text-secondary">Mystical card with cosmic gradients and ethereal shadows.</p>
        </div>
      </div>
    </div>
  );

  const renderForms = () => (
    <div className="space-vedic">
      <h3 className="text-2xl font-bold text-saffron mb-6">Form Elements</h3>

      <div className="max-w-md space-y-6">
        <div>
          <label className="label-vedic">Name</label>
          <input
            type="text"
            className="input-vedic"
            placeholder="Enter your name"
            defaultValue="Sample Input"
          />
        </div>

        <div>
          <label className="label-vedic">Date of Birth</label>
          <input
            type="date"
            className="input-vedic"
          />
        </div>

        <div>
          <label className="label-vedic">Gender</label>
          <select className="input-vedic">
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="label-vedic">Birth Place</label>
          <input
            type="text"
            className="input-vedic"
            placeholder="City, Country"
          />
        </div>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="space-vedic">
      <h3 className="text-2xl font-bold text-saffron mb-6">Navigation System</h3>

      <div className="space-y-8">
        <div>
          <h4 className="text-lg font-semibold text-secondary mb-4">Tab Navigation</h4>
          <div className="tabs-vedic">
            <button className="tab-vedic active">Birth Chart</button>
            <button className="tab-vedic">Analysis</button>
            <button className="tab-vedic">Comprehensive</button>
            <button className="tab-vedic">Reports</button>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-secondary mb-4">Navigation Items</h4>
          <div className="flex flex-wrap gap-2">
            <a href="#" className="nav-item active">Home</a>
            <a href="#" className="nav-item">Chart</a>
            <a href="#" className="nav-item">Analysis</a>
            <a href="#" className="nav-item">Reports</a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="space-vedic">
      <h3 className="text-2xl font-bold text-saffron mb-6">Loading & Feedback</h3>

      <div className="space-y-8">
        <div>
          <h4 className="text-lg font-semibold text-secondary mb-4">Loading Spinners</h4>
          <div className="flex flex-wrap gap-8 items-center">
            <VedicLoadingSpinner type="mandala" text="Mandala Spinner" />
            <VedicLoadingSpinner type="chakra" text="Chakra Spinner" />
            <VedicLoadingSpinner type="lotus" text="Lotus Spinner" />
            <VedicLoadingSpinner type="om" text="Om Spinner" />
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-secondary mb-4">Progress Indicators</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-secondary mb-2">
                <span>Chart Generation</span>
                <span>75%</span>
              </div>
              <div className="progress-vedic">
                <div className="progress-bar-vedic" style={{width: '75%'}}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-secondary mb-2">
                <span>Analysis Complete</span>
                <span>6/8 sections</span>
              </div>
              <div className="strength-meter">
                <div className="strength-dots">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`strength-dot ${i < 6 ? 'active' : ''}`}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-secondary mb-4">Alert Messages</h4>
          <div className="space-y-4">
            <div className="alert-vedic alert-success">
              <span className="text-2xl">✅</span>
              <div>
                <h5 className="font-semibold">Success!</h5>
                <p>Your birth chart has been generated successfully.</p>
              </div>
            </div>

            <div className="alert-vedic alert-warning">
              <span className="text-2xl">⚠️</span>
              <div>
                <h5 className="font-semibold">Warning</h5>
                <p>Some birth details are missing. Analysis may be incomplete.</p>
              </div>
            </div>

            <div className="alert-vedic alert-error">
              <span className="text-2xl">❌</span>
              <div>
                <h5 className="font-semibold">Error</h5>
                <p>Unable to generate chart. Please check your input data.</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-secondary mb-4">Error Message Component</h4>
          <button
            className="btn-vedic btn-secondary mb-4"
            onClick={() => setShowError(!showError)}
          >
            {showError ? 'Hide' : 'Show'} Error Message
          </button>

          {showError && (
            <ErrorMessage
              error={{
                message: 'This is a sample error message to demonstrate the consistent error handling design.',
                code: 'DEMO_ERROR',
                details: { timestamp: new Date().toISOString() },
                recoverySuggestions: 'Try refreshing the page or checking your input data.'
              }}
              title="Sample Error"
              type="error"
              showRetry={true}
              onRetry={() => setShowError(false)}
            />
          )}
        </div>
      </div>
    </div>
  );

  const renderBadges = () => (
    <div className="space-vedic">
      <h3 className="text-2xl font-bold text-saffron mb-6">Badges & Status Indicators</h3>

      <div className="space-y-8">
        <div>
          <h4 className="text-lg font-semibold text-secondary mb-4">Planetary Dignities</h4>
          <div className="flex flex-wrap gap-3">
            <span className="badge-vedic badge-exalted">Exalted</span>
            <span className="badge-vedic badge-own-sign">Own Sign</span>
            <span className="badge-vedic badge-friendly">Friendly</span>
            <span className="badge-vedic badge-neutral">Neutral</span>
            <span className="badge-vedic badge-enemy">Enemy</span>
            <span className="badge-vedic badge-debilitated">Debilitated</span>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-secondary mb-4">Status Badges</h4>
          <div className="flex flex-wrap gap-3">
            <span className="badge-vedic badge-complete">Complete</span>
            <span className="badge-vedic badge-pending">Pending</span>
            <span className="badge-vedic badge-error">Error</span>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-secondary mb-4">Custom Badges</h4>
          <div className="flex flex-wrap gap-3">
            <span className="badge-vedic bg-sun/20 text-sun">☀ Solar</span>
            <span className="badge-vedic bg-moon/20 text-moon">☽ Lunar</span>
            <span className="badge-vedic bg-mars/20 text-mars">♂ Martial</span>
            <span className="badge-vedic bg-venus/20 text-venus">♀ Venusian</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (selectedSection) {
      case 'colors': return renderColorPalette();
      case 'symbols': return renderSymbols();
      case 'buttons': return renderButtons();
      case 'cards': return renderCards();
      case 'forms': return renderForms();
      case 'navigation': return renderNavigation();
      case 'feedback': return renderFeedback();
      case 'badges': return renderBadges();
      default: return renderColorPalette();
    }
  };

  return (
    <div className="min-h-screen bg-sacred">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4 flex items-center justify-center gap-3">
            <span className="vedic-symbol symbol-om text-5xl"></span>
            Vedic Design System
          </h1>
          <p className="text-lg text-secondary">
            Consistent colors, symbols, and UI elements across the Jyotish Shastra platform
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <div className="tabs-vedic">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`tab-vedic ${selectedSection === section.id ? 'active' : ''}`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="card-vedic">
          {renderSection()}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-muted">
          <p>Built with love and cosmic energy ✨</p>
          <p className="text-sm mt-2">Jyotish Shastra Design System v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default VedicDesignShowcase;
