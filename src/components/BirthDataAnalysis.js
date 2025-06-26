import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { Card, MandalaIcon, StarIcon, SunIcon, MoonIcon } from './ui';

const BirthDataAnalysis = ({ analysis }) => {
  const [expandedSections, setExpandedSections] = useState({
    birthDetails: true,
    chartGeneration: true,
    ascendant: false,
    planetaryPositions: false,
    mahadasha: false
  });

  if (!analysis) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <MandalaIcon size={64} className="mx-auto mb-4 text-cosmic-purple animate-spin-slow" />
          <p className="text-wisdom-gray text-lg">No analysis data available</p>
        </div>
      </div>
    );
  }

  const { section, timestamp, analyses, summary } = analysis;

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'complete':
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'partial':
      case 'incomplete':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'error':
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-cosmic-purple bg-purple-50 border-purple-200';
    }
  };

  const getPlanetIcon = (planet) => {
    const iconMap = {
      'sun': SunIcon,
      'moon': MoonIcon,
      'mars': StarIcon,
      'mercury': StarIcon,
      'jupiter': StarIcon,
      'venus': StarIcon,
      'saturn': StarIcon,
      'rahu': MandalaIcon,
      'ketu': MandalaIcon
    };
    return iconMap[planet.toLowerCase()] || StarIcon;
  };

  const renderAnalysisItem = (key, analysisItem, icon) => {
    const isExpanded = expandedSections[key];
    const IconComponent = icon || StarIcon;

    return (
      <Card key={key} variant="default" className="mb-6 overflow-hidden transition-all duration-300">
        <button
          onClick={() => toggleSection(key)}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-saffron focus:ring-inset transition-colors duration-200"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center space-x-3">
            <IconComponent size={24} className="text-saffron flex-shrink-0" />
            <h3 className="font-accent font-semibold text-earth-brown text-lg">
              {analysisItem.question}
            </h3>
          </div>
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5 text-wisdom-gray" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-wisdom-gray" />
          )}
        </button>

        <div className={`transition-all duration-300 ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 pb-6">
            <div className="prose prose-vedic max-w-none">
              <div className="text-wisdom-gray leading-relaxed mb-4">
                {analysisItem.answer}
              </div>

              {analysisItem.details && Object.keys(analysisItem.details).length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-earth-brown mb-3 flex items-center">
                    <MandalaIcon size={16} className="mr-2 text-cosmic-purple" />
                    Details
                  </h4>
                  <div className="bg-sacred-white rounded-lg p-4 border border-gray-200">
                    <dl className="space-y-2">
                      {Object.entries(analysisItem.details).map(([detailKey, detailValue]) => (
                        <div key={detailKey} className="flex flex-col sm:flex-row sm:items-center">
                          <dt className="font-medium text-earth-brown sm:w-1/3 mb-1 sm:mb-0">
                            {detailKey}:
                          </dt>
                          <dd className="text-wisdom-gray sm:w-2/3">
                            {typeof detailValue === 'object' ? JSON.stringify(detailValue) : detailValue}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}

              {analysisItem.planetaryPositions && Object.keys(analysisItem.planetaryPositions).length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-earth-brown mb-4 flex items-center">
                    <SunIcon size={16} className="mr-2 text-solar-orange" />
                    Planetary Positions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(analysisItem.planetaryPositions).map(([planet, position]) => {
                      const PlanetIcon = getPlanetIcon(planet);
                      return (
                        <div key={planet} className="planet-card group">
                          <div className="flex items-center space-x-3 mb-2">
                            <PlanetIcon size={20} className="text-saffron group-hover:scale-110 transition-transform duration-200" />
                            <h5 className="font-medium text-earth-brown capitalize">{planet}</h5>
                          </div>
                          <div className="space-y-1 text-sm text-wisdom-gray">
                            <div className="flex justify-between">
                              <span>Sign:</span>
                              <span className="font-medium">{position.sign}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Degree:</span>
                              <span className="font-medium">{position.degree.toFixed(2)}°</span>
                            </div>
                            <div className="flex justify-between">
                              <span>House:</span>
                              <span className="font-medium">{position.house}{getOrdinalSuffix(position.house)}</span>
                            </div>
                            {(position.isRetrograde || position.isCombust) && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {position.isRetrograde && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                    Retrograde
                                  </span>
                                )}
                                {position.isCombust && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                    Combust
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {analysisItem.dashaSequence && analysisItem.dashaSequence.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-earth-brown mb-4 flex items-center">
                    <MandalaIcon size={16} className="mr-2 text-cosmic-purple" />
                    Dasha Sequence
                  </h4>
                  <div className="dasha-timeline">
                    {analysisItem.dashaSequence.map((dasha, index) => (
                      <div key={index} className={`relative pl-8 pb-6 ${dasha.isCurrent ? 'current-dasha' : ''}`}>
                        <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-saffron border-2 border-white shadow-md"></div>
                        <div className={`p-4 rounded-lg border-l-4 ${
                          dasha.isCurrent
                            ? 'bg-saffron/5 border-saffron'
                            : 'bg-gray-50 border-gray-300'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                            <h5 className="font-semibold text-earth-brown text-lg">{dasha.planet} Dasha</h5>
                            {dasha.isCurrent && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-saffron text-white shadow-sm">
                                Current Period
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-wisdom-gray">
                            <div>
                              <span className="font-medium">Duration:</span> {dasha.period} years
                            </div>
                            <div>
                              <span className="font-medium">Age:</span> {dasha.startAge.toFixed(1)} - {dasha.endAge.toFixed(1)}
                            </div>
                            {dasha.remainingYears && (
                              <div className="sm:col-span-2">
                                <span className="font-medium">Remaining:</span> {dasha.remainingYears.toFixed(1)} years
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sacred-white to-gray-50">
      <div className="container-vedic py-8">
        {/* Header Section */}
        <Card variant="cosmic" className="mb-8">
          <div className="text-center">
            <MandalaIcon size={48} className="mx-auto mb-4 text-white animate-spin-slow" />
            <h1 className="font-accent text-3xl md:text-4xl font-bold text-white mb-2">
              {section}
            </h1>
            <p className="text-white/80 text-sm">
              Analysis performed: {new Date(timestamp).toLocaleString('en-IN', {
                dateStyle: 'full',
                timeStyle: 'short'
              })}
            </p>
          </div>
        </Card>

        {/* Summary Section */}
        <Card variant="elevated" className="mb-8">
          <Card.Header>
            <Card.Title className="flex items-center">
              <StarIcon size={24} className="mr-3 text-gold" />
              Analysis Summary
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div className="bg-sacred-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-wisdom-gray mb-1">Status</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(summary.status)}`}>
                  {summary.status}
                </div>
              </div>

              <div className="bg-sacred-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-wisdom-gray mb-1">Completeness</div>
                <div className="text-2xl font-bold text-earth-brown">
                  {summary.completeness}%
                </div>
              </div>

              <div className="bg-sacred-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-wisdom-gray mb-1">Charts Generated</div>
                <div className="text-2xl font-bold text-earth-brown">
                  {summary.chartsGenerated}
                </div>
              </div>

              <div className="bg-sacred-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-wisdom-gray mb-1">Planets Calculated</div>
                <div className="text-2xl font-bold text-earth-brown">
                  {summary.planetsCalculated}/9
                </div>
              </div>

              <div className="bg-sacred-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-wisdom-gray mb-1">Ascendant</div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  summary.ascendantCalculated
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {summary.ascendantCalculated ? 'Calculated' : 'Pending'}
                </div>
              </div>

              <div className="bg-sacred-white rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-wisdom-gray mb-1">Dasha</div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  summary.dashaCalculated
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {summary.dashaCalculated ? 'Calculated' : 'Pending'}
                </div>
              </div>

              <div className="bg-sacred-white rounded-lg p-4 border border-gray-200 sm:col-span-2 lg:col-span-1">
                <div className="text-sm text-wisdom-gray mb-1">Ready for Analysis</div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  summary.readyForAnalysis
                    ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {summary.readyForAnalysis ? 'Ready' : 'Pending'}
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Detailed Analysis Section */}
        <div className="mb-8">
          <h2 className="font-accent text-2xl font-bold text-earth-brown mb-6 flex items-center">
            <MandalaIcon size={28} className="mr-3 text-cosmic-purple" />
            Detailed Analysis
          </h2>

          {renderAnalysisItem('birthDetails', analyses.birthDetails, SunIcon)}
          {renderAnalysisItem('chartGeneration', analyses.chartGeneration, MandalaIcon)}
          {renderAnalysisItem('ascendant', analyses.ascendant, StarIcon)}
          {renderAnalysisItem('planetaryPositions', analyses.planetaryPositions, SunIcon)}
          {renderAnalysisItem('mahadasha', analyses.mahadasha, MandalaIcon)}
        </div>

        {/* Conclusion Section */}
        <Card variant="vedic" className="mb-8">
          <Card.Header>
            <Card.Title className="text-white flex items-center">
              <StarIcon size={24} className="mr-3 text-gold" />
              Conclusion
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <p className="text-white/90 leading-relaxed text-lg">
              {summary.readyForAnalysis
                ? "🎉 All requirements from Section 1 have been met. The birth data collection and chart casting is complete and ready for detailed astrological analysis."
                : "⚠️ Some requirements from Section 1 are incomplete. Please ensure all birth details are provided for accurate analysis."
              }
            </p>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default BirthDataAnalysis;
