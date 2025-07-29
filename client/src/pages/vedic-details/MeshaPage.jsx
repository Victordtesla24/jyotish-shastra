import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/ui';

const MeshaPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-8">
      <div className="container-vedic max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            ← Back
          </Button>

          <h1 className="font-accent text-4xl text-earth-brown dark:text-dark-text-primary mb-2">
            मेष राशि (Mesha Rashi)
          </h1>
          <p className="text-lg text-wisdom-gray dark:text-dark-text-secondary">
            Aries - The Ram (March 21 - April 19)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-bold text-earth-brown dark:text-dark-text-primary mb-4">
                About Mesha Rashi
              </h2>
              <div className="prose prose-sm text-wisdom-gray dark:text-dark-text-secondary">
                <p className="mb-4">
                  Mesha (Aries) is the first sign of the zodiac, ruled by Mars (Mangal).
                  It represents new beginnings, leadership, and pioneering spirit. Those born
                  under this sign are known for their courage, enthusiasm, and determination.
                </p>
                <p className="mb-4">
                  As a cardinal fire sign, Mesha natives are natural leaders who prefer to
                  initiate rather than follow. They possess an abundance of energy and are
                  always ready to take on new challenges.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-earth-brown dark:text-dark-text-primary mb-4">
                Personality Traits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-earth-brown dark:text-dark-text-primary mb-2">
                    Strengths
                  </h4>
                  <ul className="list-disc list-inside text-sm text-wisdom-gray dark:text-dark-text-secondary space-y-1">
                    <li>Courageous and confident</li>
                    <li>Natural leadership abilities</li>
                    <li>Enthusiastic and optimistic</li>
                    <li>Independent and self-reliant</li>
                    <li>Honest and direct</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-earth-brown dark:text-dark-text-primary mb-2">
                    Challenges
                  </h4>
                  <ul className="list-disc list-inside text-sm text-wisdom-gray dark:text-dark-text-secondary space-y-1">
                    <li>Can be impulsive</li>
                    <li>Sometimes impatient</li>
                    <li>May appear aggressive</li>
                    <li>Tendency to be self-centered</li>
                    <li>Quick to anger</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 mb-6">
              <h3 className="text-xl font-bold text-earth-brown dark:text-dark-text-primary mb-4">
                Quick Facts
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-wisdom-gray dark:text-dark-text-secondary">Element:</span>
                  <span className="font-semibold">Fire (अग्नि)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wisdom-gray dark:text-dark-text-secondary">Quality:</span>
                  <span className="font-semibold">Cardinal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wisdom-gray dark:text-dark-text-secondary">Ruling Planet:</span>
                  <span className="font-semibold">Mars (मंगल)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wisdom-gray dark:text-dark-text-secondary">Symbol:</span>
                  <span className="font-semibold">Ram</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wisdom-gray dark:text-dark-text-secondary">Lucky Color:</span>
                  <span className="font-semibold">Red</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wisdom-gray dark:text-dark-text-secondary">Lucky Day:</span>
                  <span className="font-semibold">Tuesday</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-wisdom-gray dark:text-dark-text-secondary">Lucky Numbers:</span>
                  <span className="font-semibold">1, 8, 17</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-earth-brown dark:text-dark-text-primary mb-4">
                Compatibility
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-wisdom-gray dark:text-dark-text-secondary">Most Compatible:</span>
                  <p className="font-semibold">Leo, Sagittarius, Gemini</p>
                </div>
                <div>
                  <span className="text-wisdom-gray dark:text-dark-text-secondary">Least Compatible:</span>
                  <p className="font-semibold">Cancer, Capricorn</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeshaPage;
