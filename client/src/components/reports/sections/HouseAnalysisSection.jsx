import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui';

const HouseAnalysisSection = ({ data }) => {
  const [selectedHouse, setSelectedHouse] = useState(1);

  if (!data || !data.houses) {
    return (
      <Card className="p-6">
        <CardContent>
          <p className="text-center text-gray-600">No House-by-House analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  const { houses, patterns } = data;

  const houseNumbers = Object.keys(houses).map(key => parseInt(key.replace('house', '')));

  const renderHouseSelector = () => {
    return (
      <div className="grid grid-cols-6 md:grid-cols-12 gap-2 mb-6">
        {houseNumbers.map(houseNum => (
          <button
            key={houseNum}
            className={`p-2 rounded border text-sm font-medium ${
              selectedHouse === houseNum
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-amber-50'
            }`}
            onClick={() => setSelectedHouse(houseNum)}
          >
            H{houseNum}
          </button>
        ))}
      </div>
    );
  };

  const renderHouseAnalysis = (houseNum) => {
    const houseKey = `house${houseNum}`;
    const houseData = houses[houseKey];

    if (!houseData) {
      return <p>No data available for House {houseNum}</p>;
    }

    const { houseData: houseInfo, sign, lord, occupants, aspects, analysis } = houseData;

    return (
      <div className="space-y-6">
        {/* House Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-amber-800">
              House {houseNum} - {houseInfo?.name} ({sign})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">House Significations</h4>
                <div className="flex flex-wrap gap-2">
                  {houseInfo?.significations?.map((sig, index) => (
                    <span key={index} className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm">
                      {sig}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">House Properties</h4>
                <div className="space-y-1">
                  <div><strong>Nature:</strong> {houseInfo?.nature}</div>
                  <div><strong>Category:</strong> {houseInfo?.category}</div>
                  <div><strong>Sign:</strong> {sign}</div>
                  <div><strong>Lord:</strong> {lord?.planet}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* House Lord Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">House Lord Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <strong className="text-amber-700">Lord:</strong> {lord?.planet}
              </div>
              <div>
                <strong className="text-amber-700">Position:</strong> {lord?.sign} (House {lord?.house})
              </div>
              <div>
                <strong className="text-amber-700">Analysis:</strong> {lord?.analysis}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Occupying Planets */}
        {occupants && occupants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Occupying Planets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {occupants.map((planet, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="font-semibold text-amber-700">{planet.planet}</div>
                    <div className="text-sm text-gray-600 mt-1">{planet.analysis}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aspects */}
        {aspects && aspects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Planetary Aspects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aspects.map((aspect, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="font-semibold text-amber-700">{aspect.from} → House {houseNum}</div>
                    <div className="text-sm">
                      <span className="font-medium">Type:</span> {aspect.type}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{aspect.analysis}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* House Analysis Summary */}
        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <strong className="text-amber-700">Summary:</strong>
                  <p className="mt-1 text-gray-700">{analysis.summary}</p>
                </div>

                {analysis.strengths && analysis.strengths.length > 0 && (
                  <div>
                    <strong className="text-amber-700">Strengths:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-green-700">{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.challenges && analysis.challenges.length > 0 && (
                  <div>
                    <strong className="text-amber-700">Challenges:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {analysis.challenges.map((challenge, index) => (
                        <li key={index} className="text-sm text-red-700">{challenge}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div>
                    <strong className="text-amber-700">Recommendations:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-blue-700">{rec}</li>
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

  const renderPatterns = () => {
    if (!patterns) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg text-amber-800">House Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {patterns.emptyHouses && patterns.emptyHouses.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Empty Houses</h4>
                <div className="flex flex-wrap gap-2">
                  {patterns.emptyHouses.map(house => (
                    <span key={house} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      House {house}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patterns.heavilyOccupiedHouses && patterns.heavilyOccupiedHouses.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Heavily Occupied Houses</h4>
                <div className="space-y-1">
                  {patterns.heavilyOccupiedHouses.map((house, index) => (
                    <div key={index} className="text-sm">
                      House {house.house}: {house.count} planets
                    </div>
                  ))}
                </div>
              </div>
            )}

            {patterns.stelliums && patterns.stelliums.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Stelliums</h4>
                <div className="space-y-2">
                  {patterns.stelliums.map((stellium, index) => (
                    <div key={index} className="p-2 border rounded">
                      <div className="font-medium">House {stellium.house}</div>
                      <div className="text-sm text-gray-600">
                        {stellium.planets?.map(p => p.planet).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {renderPatterns()}
      {renderHouseSelector()}
      {renderHouseAnalysis(selectedHouse)}
    </div>
  );
};

export default HouseAnalysisSection;
