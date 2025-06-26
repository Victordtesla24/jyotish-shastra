import React from 'react';

const AnalysisSelector = ({ analysisType, setAnalysisType, useComprehensive, setUseComprehensive }) => {
  return (
    <>
      <div className="form-group">
        <label htmlFor="analysisType">Analysis Type:</label>
        <select
          id="analysisType"
          name="analysisType"
          value={analysisType}
          onChange={(e) => setAnalysisType(e.target.value)}
        >
          <option value="comprehensive">Comprehensive Analysis</option>
          <option value="birth-data">Birth Data Analysis (Section 1 Questions)</option>
        </select>
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={useComprehensive}
            onChange={(e) => setUseComprehensive(e.target.checked)}
          />
          Use Comprehensive Analysis (includes geocoding and detailed analysis)
        </label>
      </div>
    </>
  );
};

export default AnalysisSelector;
