import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui';

const ArudhaLagnaSection = ({ data }) => {
  const [activeTab, setActiveTab] = useState('arudha');

  if (!data) {
    return (
      <Card className="p-6">
        <CardContent>
          <p className="text-center text-gray-600">No Arudha Lagna analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  const { arudhaLagna, arudhaHouses, interpretation } = data;

  const renderArudhaLagna = () => {
    if (!arudhaLagna) {
      return <p>No Arudha Lagna data available</p>;
    }

    const { position, analysis, publicImage, materialManifestations } = arudhaLagna;

    return (
      <div className="space-y-6">
        {/* Position Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Arudha Lagna Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Position Details</h4>
                <div className="space-y-2">
                  <div><strong>Sign:</strong> {position?.sign}</div>
                  <div><strong>House:</strong> {position?.house}</div>
                  <div><strong>Degree:</strong> {position?.degree?.toFixed(2)}°</div>
                  <div><strong>Lord:</strong> {position?.lord}</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Calculation Method</h4>
                <div className="space-y-2">
                  <div><strong>From Lagna:</strong> {position?.fromLagna}</div>
                  <div><strong>From Lagna Lord:</strong> {position?.fromLagnaLord}</div>
                  <div><strong>Distance:</strong> {position?.distance} houses</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Public Image Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Public Image & Perception</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {publicImage?.characteristics && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Public Characteristics</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {publicImage.characteristics.map((char, index) => (
                      <div key={index} className="bg-amber-50 p-3 rounded">
                        <div className="font-medium text-amber-800">{char.trait}</div>
                        <div className="text-sm text-gray-600">{char.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {publicImage?.reputation && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Reputation Factors</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {publicImage.reputation.map((rep, index) => (
                      <li key={index} className="text-sm">{rep}</li>
                    ))}
                  </ul>
                </div>
              )}

              {publicImage?.socialStanding && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Social Standing</h4>
                  <p className="text-gray-700">{publicImage.socialStanding}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Material Manifestations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Material Manifestations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {materialManifestations?.wealth && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Wealth Indicators</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Potential Level:</span> {materialManifestations.wealth.level}
                    </div>
                    <div>
                      <span className="font-medium">Sources:</span> {materialManifestations.wealth.sources?.join(', ')}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{materialManifestations.wealth.description}</p>
                </div>
              )}

              {materialManifestations?.career && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Career Manifestation</h4>
                  <div className="space-y-2">
                    <div><strong>Public Recognition:</strong> {materialManifestations.career.recognition}</div>
                    <div><strong>Leadership Potential:</strong> {materialManifestations.career.leadership}</div>
                    <div><strong>Career Fields:</strong> {materialManifestations.career.fields?.join(', ')}</div>
                  </div>
                </div>
              )}

              {materialManifestations?.lifestyle && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Lifestyle Patterns</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {materialManifestations.lifestyle.map((lifestyle, index) => (
                      <li key={index} className="text-sm">{lifestyle}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Overall Assessment</h4>
                <p className="text-gray-700">{analysis?.summary}</p>
              </div>

              {analysis?.strengths && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Strengths</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-green-700">{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis?.challenges && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Challenges</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.challenges.map((challenge, index) => (
                      <li key={index} className="text-sm text-red-700">{challenge}</li>
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

  const renderArudhaHouses = () => {
    if (!arudhaHouses) {
      return <p>No Arudha Houses data available</p>;
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Arudha Houses Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Arudha houses represent the materialistic manifestation of each house's significations in your life.
            </p>
            <div className="grid gap-4">
              {Object.entries(arudhaHouses).map(([house, data]) => {
                if (house === 'summary') return null;

                const houseNum = house.replace('A', '');
                return (
                  <div key={house} className="p-4 border rounded">
                    <div className="font-semibold text-amber-700 mb-2">
                      A{houseNum} - {data.name} Arudha
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Position:</span> {data.position?.sign} (House {data.position?.house})
                      </div>
                      <div>
                        <span className="font-medium">Lord:</span> {data.position?.lord}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {data.interpretation}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {arudhaHouses.summary && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Arudha Houses Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <strong className="text-amber-700">Key Patterns:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {arudhaHouses.summary.patterns?.map((pattern, index) => (
                      <li key={index} className="text-sm">{pattern}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong className="text-amber-700">Overall Implications:</strong>
                  <p className="mt-1 text-gray-700">{arudhaHouses.summary.implications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderInterpretation = () => {
    if (!interpretation) {
      return <p>No interpretation data available</p>;
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Life Path Interpretation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interpretation.lifePath && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Life Path & Destiny</h4>
                  <p className="text-gray-700">{interpretation.lifePath}</p>
                </div>
              )}

              {interpretation.publicRole && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Public Role & Responsibility</h4>
                  <p className="text-gray-700">{interpretation.publicRole}</p>
                </div>
              )}

              {interpretation.materialSuccess && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Material Success Indicators</h4>
                  <div className="space-y-2">
                    <div><strong>Timing:</strong> {interpretation.materialSuccess.timing}</div>
                    <div><strong>Nature:</strong> {interpretation.materialSuccess.nature}</div>
                    <div><strong>Sustainability:</strong> {interpretation.materialSuccess.sustainability}</div>
                  </div>
                </div>
              )}

              {interpretation.recommendations && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {interpretation.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-blue-700">{rec}</li>
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
            activeTab === 'arudha'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveTab('arudha')}
        >
          Arudha Lagna
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'houses'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveTab('houses')}
        >
          Arudha Houses
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'interpretation'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveTab('interpretation')}
        >
          Life Interpretation
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'arudha' && renderArudhaLagna()}
        {activeTab === 'houses' && renderArudhaHouses()}
        {activeTab === 'interpretation' && renderInterpretation()}
      </div>
    </div>
  );
};

export default ArudhaLagnaSection;
