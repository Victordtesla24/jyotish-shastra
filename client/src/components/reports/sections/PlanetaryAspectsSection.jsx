import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui';

const PlanetaryAspectsSection = ({ data }) => {
  const [activeTab, setActiveTab] = useState('aspects');

  if (!data) {
    return (
      <Card className="p-6">
        <CardContent>
          <p className="text-center text-gray-600">No Planetary Aspects analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  const { aspects, patterns, yogas } = data;

  const renderAspectsList = () => {
    if (!aspects || !aspects.allAspects) {
      return <p>No aspects data available</p>;
    }

    const { allAspects, significantAspects, summary } = aspects;

    return (
      <div className="space-y-6">
        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Aspects Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{summary?.totalAspects || 0}</div>
                <div className="text-sm text-gray-600">Total Aspects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary?.byNature?.benefic || 0}</div>
                <div className="text-sm text-gray-600">Benefic Aspects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summary?.byNature?.malefic || 0}</div>
                <div className="text-sm text-gray-600">Malefic Aspects</div>
              </div>
            </div>
            <div className="mt-4">
              <strong className="text-amber-700">Average Strength:</strong> {summary?.averageStrength}/10
            </div>
          </CardContent>
        </Card>

        {/* Aspects by Type */}
        {summary?.byType && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Aspects by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(summary.byType).map(([type, count]) => (
                  <div key={type} className="text-center p-3 border rounded">
                    <div className="text-xl font-bold text-amber-600">{count}</div>
                    <div className="text-sm text-gray-600">{type} Aspects</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Significant Aspects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Significant Aspects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {significantAspects?.map((aspect, index) => (
                <div key={index} className="p-4 border rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-amber-700">
                      {aspect.source} → {aspect.target?.planet} (House {aspect.target?.house})
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      aspect.nature === 'benefic' ? 'bg-green-100 text-green-800' :
                      aspect.nature === 'malefic' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {aspect.nature}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {aspect.type}
                    </div>
                    <div>
                      <span className="font-medium">Strength:</span> {aspect.strength}/10
                    </div>
                    <div>
                      <span className="font-medium">House Distance:</span> {aspect.houseDistance}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {aspect.description}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Aspects (if different from significant) */}
        {allAspects && allAspects.length > significantAspects?.length && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">All Aspects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allAspects.map((aspect, index) => (
                  <div key={index} className="p-2 border rounded text-sm">
                    <span className="font-medium">{aspect.source}</span> →
                    <span className="ml-1">{aspect.target?.planet}</span>
                    <span className="ml-2 text-gray-600">({aspect.type}, Strength: {aspect.strength})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderPatterns = () => {
    if (!patterns) {
      return <p>No patterns data available</p>;
    }

    return (
      <div className="space-y-6">
        {patterns.trines && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Trine Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns.trines.dharmaTriangle && (
                  <div>
                    <strong className="text-amber-700">Dharma Triangle:</strong>
                    <p className="mt-1 text-gray-700">{patterns.trines.dharmaTriangle}</p>
                  </div>
                )}
                {patterns.trines.kendraTrikonaYogas && patterns.trines.kendraTrikonaYogas.length > 0 && (
                  <div>
                    <strong className="text-amber-700">Kendra-Trikona Yogas:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {patterns.trines.kendraTrikonaYogas.map((yoga, index) => (
                        <li key={index} className="text-sm">{yoga}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {patterns.combined && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Combined Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns.combined.planetaryYutas && patterns.combined.planetaryYutas.length > 0 && (
                  <div>
                    <strong className="text-amber-700">Planetary Yutas:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {patterns.combined.planetaryYutas.map((yuta, index) => (
                        <li key={index} className="text-sm">{yuta}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {patterns.combined.aspectPatterns && patterns.combined.aspectPatterns.length > 0 && (
                  <div>
                    <strong className="text-amber-700">Aspect Patterns:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {patterns.combined.aspectPatterns.map((pattern, index) => (
                        <li key={index} className="text-sm">{pattern}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderYogas = () => {
    if (!yogas) {
      return <p>No yogas data available</p>;
    }

    return (
      <div className="space-y-6">
        {yogas.wealth && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Wealth Yogas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {yogas.wealth.dhanaYogas && yogas.wealth.dhanaYogas.length > 0 ? (
                  <div>
                    <strong className="text-amber-700">Dhana Yogas:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {yogas.wealth.dhanaYogas.map((yoga, index) => (
                        <li key={index} className="text-sm">{yoga}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-600">No significant Dhana Yogas found</p>
                )}

                {yogas.wealth.wealthFactors && yogas.wealth.wealthFactors.length > 0 && (
                  <div>
                    <strong className="text-amber-700">Wealth Factors:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {yogas.wealth.wealthFactors.map((factor, index) => (
                        <li key={index} className="text-sm">{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'aspects'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveTab('aspects')}
        >
          Planetary Aspects
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'patterns'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveTab('patterns')}
        >
          Aspect Patterns
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'yogas'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveTab('yogas')}
        >
          Related Yogas
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'aspects' && renderAspectsList()}
        {activeTab === 'patterns' && renderPatterns()}
        {activeTab === 'yogas' && renderYogas()}
      </div>
    </div>
  );
};

export default PlanetaryAspectsSection;
