import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/cards/Card';

const LagnaLuminariesSection = ({ data }) => {
  const [activeSubTab, setActiveSubTab] = useState('lagna');

  if (!data || !data.analyses) {
    return (
      <Card className="p-6">
        <CardContent>
          <p className="text-center text-gray-600">No Lagna & Luminaries analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  const { lagna, luminaries } = data.analyses;

    return (
    <div className="lagna-luminaries-section">
      <Card className="mb-6">
            <CardHeader>
          <CardTitle className="text-xl text-amber-800">Section 2: Lagna & Luminaries Analysis</CardTitle>
            </CardHeader>
            <CardContent>
          {/* Sub-navigation */}
          <div className="flex space-x-4 mb-6 border-b">
            <button
              onClick={() => setActiveSubTab('lagna')}
              className={`pb-2 px-4 ${activeSubTab === 'lagna' ? 'border-b-2 border-amber-600 text-amber-800' : 'text-gray-600'}`}
            >
              Lagna Analysis
            </button>
            <button
              onClick={() => setActiveSubTab('luminaries')}
              className={`pb-2 px-4 ${activeSubTab === 'luminaries' ? 'border-b-2 border-amber-600 text-amber-800' : 'text-gray-600'}`}
            >
              Luminaries (Sun & Moon)
            </button>
                </div>

          {/* Lagna Analysis Tab */}
          {activeSubTab === 'lagna' && lagna && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="font-semibold text-amber-800 mb-2">Lagna (Ascendant)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p><strong>Sign:</strong> {lagna.lagnaSign?.sign}</p>
                    <p><strong>Degree:</strong> {lagna.lagnaSign?.degree}°</p>
                    <p><strong>Nakshatra:</strong> {lagna.lagnaSign?.nakshatra}</p>
                </div>
                <div>
                    <p><strong>Ruler:</strong> {lagna.lagnaSign?.ruler}</p>
                    <p><strong>Element:</strong> {lagna.lagnaSign?.element}</p>
                    <p><strong>Quality:</strong> {lagna.lagnaSign?.quality}</p>
                </div>
                </div>
              </div>

              {lagna.lagnaLord && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Lagna Lord</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <p><strong>Planet:</strong> {lagna.lagnaLord.planet}</p>
                      <p><strong>Position:</strong> {lagna.lagnaLord.position}</p>
                      <p><strong>House:</strong> {lagna.lagnaLord.house}</p>
                </div>
                <div>
                      <p><strong>Strength:</strong> {lagna.lagnaLord.strength}</p>
                      <p><strong>Dignity:</strong> {lagna.lagnaLord.dignity}</p>
                    </div>
                </div>
                </div>
              )}

              {lagna.interpretation && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Interpretation</h3>
                  <p className="text-gray-700">{lagna.interpretation}</p>
                </div>
              )}
            </div>
          )}

          {/* Luminaries Analysis Tab */}
          {activeSubTab === 'luminaries' && luminaries && (
            <div className="space-y-4">
              {luminaries.sun && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Sun Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                      <p><strong>Sign:</strong> {luminaries.sun.sign}</p>
                      <p><strong>Degree:</strong> {luminaries.sun.degree}°</p>
                      <p><strong>House:</strong> {luminaries.sun.house}</p>
              </div>
              <div>
                      <p><strong>Strength:</strong> {luminaries.sun.strength}</p>
                      <p><strong>Dignity:</strong> {luminaries.sun.dignity}</p>
              </div>
            </div>
                  {luminaries.sun.interpretation && (
                    <div className="mt-3">
                      <p className="text-gray-700">{luminaries.sun.interpretation}</p>
      </div>
                  )}
                </div>
              )}

              {luminaries.moon && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Moon Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <p><strong>Sign:</strong> {luminaries.moon.sign}</p>
                      <p><strong>Degree:</strong> {luminaries.moon.degree}°</p>
                      <p><strong>House:</strong> {luminaries.moon.house}</p>
                </div>
                <div>
                      <p><strong>Strength:</strong> {luminaries.moon.strength}</p>
                      <p><strong>Nakshatra:</strong> {luminaries.moon.nakshatra}</p>
                </div>
                  </div>
                  {luminaries.moon.interpretation && (
                    <div className="mt-3">
                      <p className="text-gray-700">{luminaries.moon.interpretation}</p>
              </div>
                  )}
                </div>
              )}
                </div>
          )}
            </CardContent>
          </Card>
    </div>
  );
};

export default LagnaLuminariesSection;
