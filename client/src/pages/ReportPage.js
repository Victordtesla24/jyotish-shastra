import React from 'react';
import './ReportPage.css';

const ReportPage = () => {
  return (
    <div className="report-page">
      <div className="container">
        <div className="page-header">
          <h1>Detailed Reports</h1>
          <p>Comprehensive life predictions and guidance</p>
        </div>

        <div className="report-content">
          <div className="card">
            <div className="card-header">
              <h2>Report Sections</h2>
            </div>
            <div className="card-body">
              <p>Detailed astrological reports will be generated here.</p>
              <p>This will include:</p>
              <ul>
                <li>Personality and Character Profile</li>
                <li>Health and Wellness Analysis</li>
                <li>Education and Career Analysis</li>
                <li>Financial Prospects</li>
                <li>Relationships and Marriage</li>
                <li>General Life Predictions</li>
                <li>Notable Periods and Timeline</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
