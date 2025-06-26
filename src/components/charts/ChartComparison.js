import React from 'react';
import RasiChart from './RasiChart';
import NavamsaChart from './NavamsaChart';
import './ChartComparison.css';

const ChartComparison = ({ rasiChart, navamsaChart, onPlanetClick }) => {
  return (
    <div className="chart-comparison">
      <h2>Chart Comparison</h2>
      <div className="comparison-container">
        <div className="chart-section">
          <RasiChart chartData={rasiChart} onPlanetClick={onPlanetClick} />
        </div>
        <div className="chart-section">
          <NavamsaChart chartData={navamsaChart} onPlanetClick={onPlanetClick} />
        </div>
      </div>
      <div className="comparison-notes">
        <h4>Key Differences:</h4>
        <ul>
          <li>Rasi Chart (D1): Birth chart showing planetary positions at birth</li>
          <li>Navamsa Chart (D9): 9th divisional chart for marriage and destiny analysis</li>
        </ul>
      </div>
    </div>
  );
};

export default ChartComparison;
