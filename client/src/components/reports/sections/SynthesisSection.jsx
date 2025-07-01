import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui';

const SynthesisSection = ({ data }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!data) {
    return (
      <Card className="p-6">
        <CardContent>
          <p className="text-center text-gray-600">No Synthesis & Recommendations data available</p>
        </CardContent>
      </Card>
    );
  }

  const { overview, keyThemes, lifePhases, remedies, actionPlan } = data;

  const renderOverview = () => {
    if (!overview) {
      return <p>No overview data available</p>;
    }

    const { chartStrengths, primaryChallenges, dominantInfluences, lifePurpose } = overview;

    return (
      <div className="space-y-6">
        {/* Chart Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Chart Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartStrengths?.planetary && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Planetary Strengths</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {chartStrengths.planetary.map((strength, index) => (
                      <li key={index} className="text-sm text-green-700">{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {chartStrengths?.yogas && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Beneficial Yogas</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {chartStrengths.yogas.map((yoga, index) => (
                      <li key={index} className="text-sm text-green-700">{yoga}</li>
                    ))}
                  </ul>
                </div>
              )}

              {chartStrengths?.aspects && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Favorable Aspects</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {chartStrengths.aspects.map((aspect, index) => (
                      <li key={index} className="text-sm text-green-700">{aspect}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Primary Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Primary Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {primaryChallenges?.planetary && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Planetary Challenges</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {primaryChallenges.planetary.map((challenge, index) => (
                      <li key={index} className="text-sm text-red-700">{challenge}</li>
                    ))}
                  </ul>
                </div>
              )}

              {primaryChallenges?.doshas && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Doshas & Afflictions</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {primaryChallenges.doshas.map((dosha, index) => (
                      <li key={index} className="text-sm text-red-700">{dosha}</li>
                    ))}
                  </ul>
                </div>
              )}

              {primaryChallenges?.karmic && (
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Karmic Lessons</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {primaryChallenges.karmic.map((lesson, index) => (
                      <li key={index} className="text-sm text-red-700">{lesson}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dominant Influences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Dominant Influences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Strongest Planets</h4>
                <div className="space-y-2">
                  {dominantInfluences?.strongestPlanets?.map((planet, index) => (
                    <div key={index} className="bg-amber-50 p-3 rounded">
                      <div className="font-medium text-amber-800">{planet.planet}</div>
                      <div className="text-sm text-gray-600">Strength: {planet.strength}/10</div>
                      <div className="text-xs text-gray-600">{planet.influence}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Key Elements</h4>
                <div className="space-y-2">
                  {dominantInfluences?.elements?.map((element, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded">
                      <div className="font-medium text-blue-800">{element.element}</div>
                      <div className="text-sm text-gray-600">Percentage: {element.percentage}%</div>
                      <div className="text-xs text-gray-600">{element.characteristics}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Life Purpose */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Life Purpose & Dharma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Primary Purpose</h4>
                <p className="text-gray-700">{lifePurpose?.primary}</p>
              </div>
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Soul Mission</h4>
                <p className="text-gray-700">{lifePurpose?.soulMission}</p>
              </div>
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">Key Lessons</h4>
                <ul className="list-disc list-inside space-y-1">
                  {lifePurpose?.keyLessons?.map((lesson, index) => (
                    <li key={index} className="text-sm text-blue-700">{lesson}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderKeyThemes = () => {
    if (!keyThemes) {
      return <p>No key themes data available</p>;
    }

    return (
      <div className="space-y-6">
        {keyThemes.map((theme, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">{theme.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Description</h4>
                  <p className="text-gray-700">{theme.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Key Points</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {theme.keyPoints?.map((point, idx) => (
                      <li key={idx} className="text-sm">{point}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Impact</h4>
                  <p className="text-sm text-gray-600">{theme.impact}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderLifePhases = () => {
    if (!lifePhases) {
      return <p>No life phases data available</p>;
    }

    return (
      <div className="space-y-6">
        {lifePhases.map((phase, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">
                {phase.name} ({phase.ageRange})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Overview</h4>
                  <p className="text-gray-700">{phase.overview}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Opportunities</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {phase.opportunities?.map((opp, idx) => (
                        <li key={idx} className="text-green-600">{opp}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">Challenges</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {phase.challenges?.map((challenge, idx) => (
                        <li key={idx} className="text-red-600">{challenge}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-amber-700 mb-2">Key Focus Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {phase.keyFocus?.map((focus, idx) => (
                      <span key={idx} className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm">
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderRemedies = () => {
    if (!remedies) {
      return <p>No remedies data available</p>;
    }

    const { gems, mantras, rituals, lifestyle, charitable } = remedies;

    return (
      <div className="space-y-6">
        {/* Gems & Stones */}
        {gems && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Gems & Stones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {gems.map((gem, index) => (
                  <div key={index} className="p-4 border rounded">
                    <div className="font-semibold text-amber-700">{gem.stone}</div>
                    <div className="text-sm space-y-1 mt-2">
                      <div><strong>For:</strong> {gem.planet}</div>
                      <div><strong>Weight:</strong> {gem.weight}</div>
                      <div><strong>Day to wear:</strong> {gem.dayToWear}</div>
                      <div><strong>Finger:</strong> {gem.finger}</div>
                      <div><strong>Benefits:</strong> {gem.benefits}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mantras */}
        {mantras && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Mantras & Chanting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mantras.map((mantra, index) => (
                  <div key={index} className="p-4 bg-amber-50 rounded">
                    <div className="font-semibold text-amber-700">{mantra.name}</div>
                    <div className="text-sm space-y-1 mt-2">
                      <div><strong>For:</strong> {mantra.purpose}</div>
                      <div><strong>Repetitions:</strong> {mantra.repetitions}</div>
                      <div><strong>Best time:</strong> {mantra.timing}</div>
                      <div className="font-mono text-xs bg-white p-2 rounded border">
                        {mantra.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rituals */}
        {rituals && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Rituals & Pujas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rituals.map((ritual, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="font-semibold text-amber-700">{ritual.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{ritual.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      <strong>Frequency:</strong> {ritual.frequency}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lifestyle */}
        {lifestyle && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Lifestyle Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lifestyle.map((recommendation, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded">
                    <div className="font-semibold text-blue-700">{recommendation.category}</div>
                    <div className="text-sm text-gray-700 mt-1">{recommendation.advice}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charitable Activities */}
        {charitable && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Charitable Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {charitable.map((activity, index) => (
                  <div key={index} className="p-3 bg-green-50 rounded">
                    <div className="font-semibold text-green-700">{activity.type}</div>
                    <div className="text-sm text-gray-700 mt-1">{activity.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      <strong>Best days:</strong> {activity.bestDays}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderActionPlan = () => {
    if (!actionPlan) {
      return <p>No action plan data available</p>;
    }

    const { immediate, shortTerm, longTerm, priorities } = actionPlan;

    return (
      <div className="space-y-6">
        {/* Priorities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-amber-800">Priority Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorities?.map((priority, index) => (
                <div key={index} className={`p-4 rounded border-l-4 ${
                  priority.level === 'High' ? 'border-red-400 bg-red-50' :
                  priority.level === 'Medium' ? 'border-yellow-400 bg-yellow-50' :
                  'border-green-400 bg-green-50'
                }`}>
                  <div className="font-semibold text-gray-800">{priority.action}</div>
                  <div className="text-sm text-gray-600 mt-1">{priority.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Priority: {priority.level} | Timeline: {priority.timeline}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time-based Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Immediate (0-3 months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm space-y-1">
                {immediate?.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Short Term (3-12 months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm space-y-1">
                {shortTerm?.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Long Term (1+ years)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm space-y-1">
                {longTerm?.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'overview'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'themes'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveTab('themes')}
        >
          Key Themes
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'phases'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveTab('phases')}
        >
          Life Phases
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'remedies'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveTab('remedies')}
        >
          Remedies
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'action'
              ? 'border-b-2 border-amber-500 text-amber-600'
              : 'text-gray-500 hover:text-amber-600'
          }`}
          onClick={() => setActiveTab('action')}
        >
          Action Plan
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'themes' && renderKeyThemes()}
        {activeTab === 'phases' && renderLifePhases()}
        {activeTab === 'remedies' && renderRemedies()}
        {activeTab === 'action' && renderActionPlan()}
      </div>
    </div>
  );
};

export default SynthesisSection;
