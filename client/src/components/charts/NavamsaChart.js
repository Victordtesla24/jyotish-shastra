import React from 'react';
import './NavamsaChart.css';

const NavamsaChart = ({ navamsaData, style = 'south-indian' }) => {
  if (!navamsaData || !navamsaData.houses) {
    return <div className="chart-error">Navamsa data not available</div>;
  }

  const renderNavamsaGrid = () => {
    const houses = navamsaData.houses;
    const planets = navamsaData.planets || {};

    return (
      <div className="navamsa-chart south-indian">
        <div className="chart-grid">
          {[...Array(12)].map((_, index) => {
            const houseNumber = index + 1;
            const housePlanets = Object.entries(planets)
              .filter(([_, planet]) => planet.navamsaHouse === houseNumber)
              .map(([name]) => name);

            return (
              <div key={houseNumber} className={`house house-${houseNumber}`}>
                <div className="house-number">D9-{houseNumber}</div>
                <div className="house-sign">{houses[houseNumber]?.navamsaSign || ''}</div>
                <div className="house-planets">
                  {housePlanets.map(planet => (
                    <span key={planet} className={`planet ${planet.toLowerCase()}`}>
                      {planet}
                    </span>
                  ))}
                </div>
                <div className="navamsa-lord">
                  {houses[houseNumber]?.navamsaLord || ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="navamsa-chart-container">
      <h3>Navamsa Chart (D9)</h3>
      <div className="chart-description">
        Marriage and spiritual development analysis
      </div>
      {renderNavamsaGrid()}
      <div className="navamsa-insights">
        <h4>Key Insights:</h4>
        <ul>
          <li>7th house: {navamsaData.seventhHouse?.analysis || 'Marriage prospects'}</li>
          <li>Venus position: {navamsaData.venus?.navamsaAnalysis || 'Relationship harmony'}</li>
          <li>Jupiter position: {navamsaData.jupiter?.navamsaAnalysis || 'Wisdom in partnerships'}</li>
        </ul>
      </div>
    </div>
  );
};

export default NavamsaChart;
