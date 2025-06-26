import React from 'react';

const RasiChart = ({ chartData, style = 'south-indian' }) => {
  if (!chartData || !chartData.houses) {
    return <div className="chart-error">Chart data not available</div>;
  }

  const renderSouthIndianChart = () => {
    const houses = chartData.houses;
    const planets = chartData.planets || {};

    return (
      <div className="rasi-chart south-indian">
        <div className="chart-grid">
          {[...Array(12)].map((_, index) => {
            const houseNumber = index + 1;
            const housePlanets = Object.entries(planets)
              .filter(([_, planet]) => planet.house === houseNumber)
              .map(([name]) => name);

            return (
              <div key={houseNumber} className={`house house-${houseNumber}`}>
                <div className="house-number">{houseNumber}</div>
                <div className="house-sign">{houses[houseNumber]?.sign || ''}</div>
                <div className="house-planets">
                  {housePlanets.map(planet => (
                    <span key={planet} className={`planet ${planet.toLowerCase()}`}>
                      {planet}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderNorthIndianChart = () => {
    // North Indian chart layout implementation
    return (
      <div className="rasi-chart north-indian">
        <div className="chart-diamond">
          {/* Diamond layout for North Indian style */}
          <div className="chart-center">Rasi</div>
        </div>
      </div>
    );
  };

  return (
    <div className="rasi-chart-container">
      <h3>Rasi Chart (D1)</h3>
      {style === 'south-indian' ? renderSouthIndianChart() : renderNorthIndianChart()}
    </div>
  );
};

export default RasiChart;
