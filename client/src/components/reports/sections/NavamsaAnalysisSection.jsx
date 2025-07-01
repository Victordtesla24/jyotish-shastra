import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui';

const NavamsaAnalysisSection = ({ data }) => {
  const [activeTab, setActiveTab] = useState('chart');

  if (!data) {
    return (
      <Card className="p-6">
        <CardContent>
          <p className="text-center text-gray-600">No Navamsa Chart analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  const { chartData, planetaryStrengths, relationshipAnalysis, spiritualInsights } = data;

  const renderChartData = () => {
    if (!chartData) {
      return <p>No chart data available</p>;
    }

    const { navamsaLagna, planetaryPositions, houseOccupation } = chartData;

    return (
      <div className="space-y-6">
        {/* Navamsa Lagna */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Navamsa Lagna</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Lagna Details</h4>
                <div className="space-y-2">
                  <div><strong>Sign:</strong> {navamsaLagna?.sign}</div>
                  <div><strong>Degree:</strong> {navamsaLagna?.degree?.toFixed(2)}°</div>
                  <div><strong>Lord:</strong> {navamsaLagna?.lord}</div>
                  <div><strong>Element:</strong> {navamsaLagna?.element}</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Significance</h4>
                <p className="text-sm text-gray-700">{navamsaLagna?.significance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Planetary Positions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Planetary Positions in Navamsa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {planetaryPositions?.map((planet, index) => (
                <div key={index} className="p-3 border rounded">
                  <div className="grid md:grid-cols-4 gap-4 items-center">
                    <div className="font-semibold text-amber-700">{planet.planet}</div>
                    <div className="text-sm">
                      <span className="font-medium">Sign:</span> {planet.sign}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">House:</span> {planet.house}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Degree:</span> {planet.degree?.toFixed(2)}°
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Dignity:</span> {planet.dignity} |
                    <span className="font-medium ml-2">Varga Strength:</span> {planet.vargaStrength}/10
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* House Occupation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">House Occupation Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {Array.from({length: 12}, (_, i) => i + 1).map(house => {
                const houseData = houseOccupation?.[`house${house}`];
                return (
                  <div key={house} className="p-2 border rounded text-center">
                    <div className="font-semibold text-amber-700">H{house}</div>
                    <div className="text-xs text-gray-600">
                      {houseData?.planets?.map(p => p.planet).join(', ') || 'Empty'}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPlanetaryStrengths = () => {
    if (!planetaryStrengths) {
      return <p>No planetary strengths data available</p>;
    }

    const { strengthComparison, vargottamaPlanets, exaltationDebilitation } = planetaryStrengths;

    return (
      <div className="space-y-6">
        {/* Strength Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Rashi vs Navamsa Strength</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strengthComparison?.map((planet, index) => (
                <div key={index} className="p-3 border rounded">
                  <div className="font-semibold text-amber-700 mb-2">{planet.planet}</div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Rashi Strength:</span> {planet.rashiStrength}/10
                    </div>
                    <div>
                      <span className="font-medium">Navamsa Strength:</span> {planet.navamsaStrength}/10
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Strength Change:</span>
                    <span className={`ml-1 ${
                      planet.strengthChange > 0 ? 'text-green-600' :
                      planet.strengthChange < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {planet.strengthChange > 0 ? '+' : ''}{planet.strengthChange}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">{planet.interpretation}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vargottama Planets */}
        {vargottamaPlanets && vargottamaPlanets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Vargottama Planets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vargottamaPlanets.map((planet, index) => (
                  <div key={index} className="p-3 bg-amber-50 border-l-4 border-amber-400">
                    <div className="font-semibold text-amber-700">{planet.planet}</div>
                    <div className="text-sm text-gray-700 mt-1">
                      Same sign in both Rashi and Navamsa: {planet.sign}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{planet.significance}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exaltation/Debilitation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Exaltation & Debilitation in Navamsa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Exalted Planets</h4>
                {exaltationDebilitation?.exalted?.length > 0 ? (
                  <div className="space-y-2">
                    {exaltationDebilitation.exalted.map((planet, index) => (
                      <div key={index} className="p-2 bg-green-50 rounded">
                        <div className="font-medium text-green-800">{planet.planet}</div>
                        <div className="text-sm text-green-700">in {planet.sign}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No exalted planets in Navamsa</p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-2">Debilitated Planets</h4>
                {exaltationDebilitation?.debilitated?.length > 0 ? (
                  <div className="space-y-2">
                    {exaltationDebilitation.debilitated.map((planet, index) => (
                      <div key={index} className="p-2 bg-red-50 rounded">
                        <div className="font-medium text-red-800">{planet.planet}</div>
                        <div className="text-sm text-red-700">in {planet.sign}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No debilitated planets in Navamsa</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRelationshipAnalysis = () => {
    if (!relationshipAnalysis) {
      return <p>No relationship analysis data available</p>;
    }

    const { seventhHouse, seventhLord, venusAnalysis, marsAnalysis, compatibility } = relationshipAnalysis;

    return (
      <div className="space-y-6">
        {/* 7th House Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">7th House in Navamsa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">House Details</h4>
                <div className="space-y-2">
                  <div><strong>Sign:</strong> {seventhHouse?.sign}</div>
                  <div><strong>Lord:</strong> {seventhHouse?.lord}</div>
                  <div><strong>Occupants:</strong> {seventhHouse?.occupants?.join(', ') || 'None'}</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Marriage Indications</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {seventhHouse?.marriageIndications?.map((indication, index) => (
                    <li key={index}>{indication}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7th Lord Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">7th Lord in Navamsa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <strong className="text-amber-700">Position:</strong> {seventhLord?.sign} (House {seventhLord?.house})
              </div>
              <div>
                <strong className="text-amber-700">Strength:</strong> {seventhLord?.strength}/10
              </div>
              <div>
                <strong className="text-amber-700">Analysis:</strong>
                <p className="mt-1 text-gray-700">{seventhLord?.analysis}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Venus & Mars Analysis */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Venus in Navamsa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><strong>Position:</strong> {venusAnalysis?.position}</div>
                <div><strong>Dignity:</strong> {venusAnalysis?.dignity}</div>
                <div><strong>Relationship Quality:</strong> {venusAnalysis?.relationshipQuality}</div>
                <div className="text-sm text-gray-600">{venusAnalysis?.interpretation}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Mars in Navamsa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><strong>Position:</strong> {marsAnalysis?.position}</div>
                <div><strong>Dignity:</strong> {marsAnalysis?.dignity}</div>
                <div><strong>Manglik Status:</strong> {marsAnalysis?.manglikStatus}</div>
                <div className="text-sm text-gray-600">{marsAnalysis?.interpretation}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compatibility Factors */}
        {compatibility && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Marriage Compatibility Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Favorable Factors</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {compatibility.favorable?.map((factor, index) => (
                      <li key={index} className="text-green-700">{factor}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Challenging Factors</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {compatibility.challenging?.map((factor, index) => (
                      <li key={index} className="text-red-700">{factor}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Overall Assessment</h4>
                  <p className="text-gray-700">{compatibility.overall}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderSpiritualInsights = () => {
    if (!spiritualInsights) {
      return <p>No spiritual insights data available</p>;
    }

    const { ninthHouse, jupiterAnalysis, ketu, dharmaPath } = spiritualInsights;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Spiritual Development Path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ninthHouse && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">9th House (Dharma)</h4>
                  <div className="space-y-2">
                    <div><strong>Sign:</strong> {ninthHouse.sign}</div>
                    <div><strong>Lord:</strong> {ninthHouse.lord}</div>
                    <div><strong>Occupants:</strong> {ninthHouse.occupants?.join(', ') || 'None'}</div>
                    <div className="text-sm text-gray-600">{ninthHouse.interpretation}</div>
                  </div>
                </div>
              )}

              {jupiterAnalysis && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Jupiter (Guru) Analysis</h4>
                  <div className="space-y-2">
                    <div><strong>Position:</strong> {jupiterAnalysis.position}</div>
                    <div><strong>Strength:</strong> {jupiterAnalysis.strength}/10</div>
                    <div><strong>Spiritual Capacity:</strong> {jupiterAnalysis.spiritualCapacity}</div>
                    <div className="text-sm text-gray-600">{jupiterAnalysis.interpretation}</div>
                  </div>
                </div>
              )}

              {ketu && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Ketu (Past Life Karma)</h4>
                  <div className="space-y-2">
                    <div><strong>Position:</strong> {ketu.position}</div>
                    <div><strong>Karmic Lessons:</strong> {ketu.karmicLessons}</div>
                    <div className="text-sm text-gray-600">{ketu.interpretation}</div>
                  </div>
                </div>
              )}

              {dharmaPath && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Dharma Path Recommendations</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {dharmaPath.map((path, index) => (
                      <li key={index} className="text-blue-700">{path}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'chart'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveTab('chart')}
        >
          Chart Data
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'strengths'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveTab('strengths')}
        >
          Planetary Strengths
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'relationships'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveTab('relationships')}
        >
          Marriage & Relationships
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'spiritual'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveTab('spiritual')}
        >
          Spiritual Insights
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'chart' && renderChartData()}
        {activeTab === 'strengths' && renderPlanetaryStrengths()}
        {activeTab === 'relationships' && renderRelationshipAnalysis()}
        {activeTab === 'spiritual' && renderSpiritualInsights()}
      </div>
    </div>
  );
};

export default NavamsaAnalysisSection;
