import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui';

const LagnaLuminariesSection = ({ data }) => {
  const [activeSubTab, setActiveSubTab] = useState('lagna');

  if (!data) {
    return (
      <Card className="p-6">
        <CardContent>
          <p className="text-center text-gray-600">No Lagna & Luminaries analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  const { lagna, luminaries } = data.analyses || {};

  const renderLagnaAnalysis = () => {
    if (!lagna) return <p>No Lagna analysis available</p>;

    const { lagnaSign, lagnaLord, overallStrength, summary } = lagna;

    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Lagna Sign Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <strong className="text-amber-700">Sign:</strong> {lagnaSign?.sign}
                </div>
                <div>
                  <strong className="text-amber-700">Element:</strong> {lagnaSign?.element}
                </div>
                <div>
                  <strong className="text-amber-700">Quality:</strong> {lagnaSign?.quality}
                </div>
                <div>
                  <strong className="text-amber-700">Ruler:</strong> {lagnaSign?.ruler}
                </div>
                <div>
                  <strong className="text-amber-700">Nature:</strong> {lagnaSign?.nature}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Lagna Lord</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <strong className="text-amber-700">Planet:</strong> {lagnaLord?.planet}
                </div>
                <div>
                  <strong className="text-amber-700">Position:</strong> {lagnaLord?.sign} (House {lagnaLord?.house})
                </div>
                <div>
                  <strong className="text-amber-700">Dignity:</strong> {lagnaLord?.dignity}
                </div>
                <div>
                  <strong className="text-amber-700">Strength:</strong> {lagnaLord?.strength}/10
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Personality Characteristics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Strengths</h4>
                <ul className="list-disc list-inside space-y-1">
                  {lagnaSign?.strengths?.map((strength, index) => (
                    <li key={index} className="text-sm">{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Challenges</h4>
                <ul className="list-disc list-inside space-y-1">
                  {lagnaSign?.challenges?.map((challenge, index) => (
                    <li key={index} className="text-sm">{challenge}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold text-amber-700 mb-2">Physical Traits</h4>
              <div className="grid md:grid-cols-2 gap-2">
                {lagnaSign?.physicalTraits?.map((trait, index) => (
                  <span key={index} className="text-sm bg-amber-50 px-2 py-1 rounded">{trait}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Overall Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <strong className="text-amber-700">Overall Strength:</strong> {overallStrength}/10
              </div>
              <div>
                <strong className="text-amber-700">Summary:</strong>
                <p className="mt-1 text-gray-700">{summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderLuminariesAnalysis = () => {
    if (!luminaries) return <p>No Luminaries analysis available</p>;

    const { sunAnalysis, moonAnalysis, luminariesRelationship, overallPersonality } = luminaries;

    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Sun Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Sun Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <strong className="text-amber-700">Position:</strong> {sunAnalysis?.position?.sign} (House {sunAnalysis?.position?.house})
                </div>
                <div>
                  <strong className="text-amber-700">Degree:</strong> {sunAnalysis?.position?.degree?.toFixed(2)}°
                </div>
                <div>
                  <strong className="text-amber-700">Nakshatra:</strong> {sunAnalysis?.position?.nakshatra}
                </div>
                <div>
                  <strong className="text-amber-700">Dignity:</strong> {sunAnalysis?.dignity?.dignity}
                </div>
                <div>
                  <strong className="text-amber-700">Strength:</strong> {sunAnalysis?.strength?.overallStrength}/10
                </div>
                <div>
                  <strong className="text-amber-700">Interpretation:</strong> {sunAnalysis?.strength?.interpretation}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Moon Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Moon Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <strong className="text-amber-700">Position:</strong> {moonAnalysis?.position?.sign} (House {moonAnalysis?.position?.house})
                </div>
                <div>
                  <strong className="text-amber-700">Degree:</strong> {moonAnalysis?.position?.degree?.toFixed(2)}°
                </div>
                <div>
                  <strong className="text-amber-700">Nakshatra:</strong> {moonAnalysis?.position?.nakshatra}
                </div>
                <div>
                  <strong className="text-amber-700">Dignity:</strong> {moonAnalysis?.dignity?.dignity}
                </div>
                <div>
                  <strong className="text-amber-700">Strength:</strong> {moonAnalysis?.strength?.overallStrength}/10
                </div>
                <div>
                  <strong className="text-amber-700">Interpretation:</strong> {moonAnalysis?.strength?.interpretation}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Luminaries Relationship */}
        {luminariesRelationship && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Sun-Moon Relationship</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <strong className="text-amber-700">Lunar Phase:</strong> {luminariesRelationship.lunarPhase?.phase}
                </div>
                <div>
                  <strong className="text-amber-700">Separation:</strong> {luminariesRelationship.separation?.degrees?.toFixed(1)}°
                </div>
                <div>
                  <strong className="text-amber-700">Integration:</strong> {luminariesRelationship.personalityIntegration?.integration}
                </div>
                <div>
                  <strong className="text-amber-700">Balance:</strong> {luminariesRelationship.egoMindBalance?.balance}
                </div>
                {luminariesRelationship.recommendations && (
                  <div>
                    <strong className="text-amber-700">Recommendations:</strong>
                    <ul className="list-disc list-inside mt-2">
                      {luminariesRelationship.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Personality */}
        {overallPersonality && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Overall Personality Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <strong className="text-amber-700">Core Personality:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {overallPersonality.corePersonality?.map((trait, index) => (
                      <li key={index} className="text-sm">{trait}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong className="text-amber-700">Main Challenges:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {overallPersonality.mainChallenges?.map((challenge, index) => (
                      <li key={index} className="text-sm">{challenge}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong className="text-amber-700">Development Path:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {overallPersonality.developmentPath?.map((path, index) => (
                      <li key={index} className="text-sm">{path}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium ${
            activeSubTab === 'lagna'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveSubTab('lagna')}
        >
          Lagna Analysis
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeSubTab === 'luminaries'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveSubTab('luminaries')}
        >
          Sun & Moon Analysis
        </button>
      </div>

      {/* Content */}
      <div>
        {activeSubTab === 'lagna' && renderLagnaAnalysis()}
        {activeSubTab === 'luminaries' && renderLuminariesAnalysis()}
      </div>
    </div>
  );
};

export default LagnaLuminariesSection;
