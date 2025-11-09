import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VedicChartDisplay from '../components/charts/VedicChartDisplay.jsx';
import { useChart } from '../contexts/ChartContext.js';
import UIDataSaver from '../components/forms/UIDataSaver.js';
import NotificationToast from '../components/ui/NotificationToast.jsx';
import HeroSection from '../components/ui/HeroSection.jsx';
import { initScrollReveals, cleanupScrollTriggers } from '../lib/scroll.js';

const ChartPage = () => {
  const navigate = useNavigate();
  const { currentChart, isLoading, error } = useChart();
  const [chartData, setChartData] = useState(null);
  const [redirectToast, setRedirectToast] = useState(null);
  const [showRedirectFallback, setShowRedirectFallback] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const message = sessionStorage.getItem('analysisRedirectMessage');
    if (message) {
      setRedirectToast(message);
      sessionStorage.removeItem('analysisRedirectMessage');
      if (!currentChart) {
        setShowRedirectFallback(true);
      }
    }
  }, [currentChart]);

  useEffect(() => {
    initScrollReveals();
    
    return () => {
      cleanupScrollTriggers();
    };
  }, []);

  useEffect(() => {
    if (!currentChart) {
      if (!showRedirectFallback) {
        navigate('/');
      }
      return;
    }

    setShowRedirectFallback(false);

    const apiResponse = currentChart.chartData;

    if (!currentChart || !currentChart.chartData) {
      navigate('/');
      return;
    }

    if (apiResponse && apiResponse.success) {
      const chartData = apiResponse.data || apiResponse;
      
      if (chartData) {
        const rasiChart = chartData.rasiChart || chartData.chart?.rasiChart || chartData.chart;
        const navamsaChart = chartData.navamsaChart || chartData.chart?.navamsaChart || chartData.navamsa;
        const analysis = chartData.analysis || chartData.chart?.analysis;

        if (!rasiChart) {
          throw new Error('Chart data is incomplete. RasiChart is missing from API response.');
        }

        UIDataSaver.saveApiResponse({
          chart: rasiChart,
          navamsa: navamsaChart,
          analysis: analysis,
          metadata: apiResponse.metadata || chartData.metadata,
          success: apiResponse.success,
          originalResponse: apiResponse
        });

        const resolvedChartId = chartData?.chartId || chartData?.data?.chartId || currentChart.id;
        UIDataSaver.setLastChart(resolvedChartId, chartData?.birthData || chartData?.data?.birthData || null);

        setChartData({
          ...chartData,
          rasiChart,
          navamsaChart,
          analysis
        });
      } else {
        throw new Error('Invalid API response format. Chart data is missing from response.');
      }
    } else {
      const errorMsg = apiResponse?.error?.message || 
                       apiResponse?.message || 
                       'Invalid API response format. Expected response.success and response.data structure with rasiChart property.';
      throw new Error(errorMsg);
    }
  }, [currentChart, navigate, showRedirectFallback]);

  const toastNode = redirectToast ? (
    <NotificationToast
      type="info"
      message={redirectToast}
      onClose={() => setRedirectToast(null)}
    />
  ) : null;

  if (!currentChart && showRedirectFallback) {
    return (
      <HeroSection title="Fresh Chart Required" subtitle="Please regenerate your birth chart">
        {toastNode}
        <div className="chris-cole-page-content">
          <div className="chris-cole-card">
            <p className="chris-cole-text">
              We could not find a recent chart in this browser session. Please regenerate your birth chart to explore the analysis features.
            </p>
            <button
              onClick={() => navigate('/')}
              className="chris-cole-button"
            >
              Go to Birth Data Form
            </button>
          </div>
        </div>
      </HeroSection>
    );
  }

  if (isLoading) {
    return (
      <HeroSection title="Loading Chart" subtitle="Please wait...">
        {toastNode}
        <div className="chris-cole-page-content">
          <div className="chris-cole-loading">
            <div className="chris-cole-spinner"></div>
          </div>
        </div>
      </HeroSection>
    );
  }

  if (error) {
    return (
      <HeroSection title="Error" subtitle="Something went wrong">
        {toastNode}
        <div className="chris-cole-page-content">
          <div className="chris-cole-card">
            <p className="chris-cole-text">{error.message || error}</p>
            <button
              onClick={() => navigate('/')}
              className="chris-cole-button"
            >
              Go Back
            </button>
          </div>
        </div>
      </HeroSection>
    );
  }

  return (
    <HeroSection title="Your Birth Chart" subtitle="Vedic astrology chart revealing your celestial destiny">
      {toastNode}
      <div className="chris-cole-page-content">
        {/* Action Buttons */}
        <div className="chris-cole-actions">
          <button
            onClick={() => navigate('/')}
            className="chris-cole-button chris-cole-button-secondary"
          >
            New Chart
          </button>
          <button
            onClick={() => navigate('/analysis')}
            className="chris-cole-button"
          >
            View Analysis
          </button>
          <button
            onClick={() => {
              try {
                const birthDataForBTR = {
                  name: chartData?.birthData?.name || 'User',
                  dateOfBirth: chartData?.birthData?.dateOfBirth,
                  timeOfBirth: chartData?.birthData?.timeOfBirth,
                  placeOfBirth: chartData?.birthData?.geocodingInfo?.formattedAddress || 'Unknown',
                  latitude: chartData?.birthData?.latitude,
                  longitude: chartData?.birthData?.longitude,
                  timezone: chartData?.birthData?.timezone,
                  chartId: chartData?.chartId
                };
                sessionStorage.setItem('birthDataForBTR', JSON.stringify(birthDataForBTR));
                navigate('/birth-time-rectification');
              } catch (error) {
                navigate('/birth-time-rectification');
              }
            }}
            className="chris-cole-button"
          >
            BTR Analysis
          </button>
        </div>

        {/* Chart Display Grid */}
        <div className="chris-cole-grid">
          {/* Main Rasi Chart */}
          <div className="chris-cole-card">
            <h2 className="chris-cole-heading">Rasi Chart (D1)</h2>
            <p className="chris-cole-text-secondary">Primary birth chart showing planetary positions</p>
            <div className="chris-cole-chart-container">
              <VedicChartDisplay
                chartData={chartData?.rasiChart || chartData}
                chartType="rasi"
                showDetails={true}
                useBackendRendering={true}
                birthData={chartData?.birthData || null}
              />
            </div>
          </div>

          {/* Navamsa Chart */}
          {chartData?.navamsaChart && (
            <div className="chris-cole-card">
              <h2 className="chris-cole-heading">Navamsa Chart (D9)</h2>
              <p className="chris-cole-text-secondary">Marriage and spiritual destiny chart</p>
              <div className="chris-cole-chart-container">
                <VedicChartDisplay
                  chartData={chartData.navamsaChart}
                  chartType="navamsa"
                  showDetails={true}
                  useBackendRendering={true}
                  birthData={chartData?.birthData || null}
                />
              </div>
            </div>
          )}
        </div>

        {/* Birth Details */}
        <div className="chris-cole-card">
          <h3 className="chris-cole-heading">Birth Details</h3>
          <div className="chris-cole-details-grid">
            <div className="chris-cole-detail-item">
              <span className="chris-cole-label">Name:</span>
              <span className="chris-cole-value">{chartData?.birthData?.name || 'N/A'}</span>
            </div>
            <div className="chris-cole-detail-item">
              <span className="chris-cole-label">Date:</span>
              <span className="chris-cole-value">
                {chartData?.birthData?.dateOfBirth ?
                  new Date(chartData.birthData.dateOfBirth).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="chris-cole-detail-item">
              <span className="chris-cole-label">Time:</span>
              <span className="chris-cole-value">{chartData?.birthData?.timeOfBirth || 'N/A'}</span>
            </div>
            <div className="chris-cole-detail-item">
              <span className="chris-cole-label">Place:</span>
              <span className="chris-cole-value">
                {chartData?.birthData?.geocodingInfo?.formattedAddress ||
                 `${chartData?.birthData?.latitude?.toFixed(4) || 'N/A'}, ${chartData?.birthData?.longitude?.toFixed(4) || 'N/A'}`}
              </span>
            </div>
            <div className="chris-cole-detail-item">
              <span className="chris-cole-label">Coordinates:</span>
              <span className="chris-cole-value">
                {chartData?.birthData?.latitude?.toFixed(4) || 'N/A'}° N, {chartData?.birthData?.longitude?.toFixed(4) || 'N/A'}° E
              </span>
            </div>
          </div>
        </div>

        {/* Dasha Information */}
        {chartData?.dashaInfo && (
          <div className="chris-cole-card">
            <h3 className="chris-cole-heading">Dasha Information</h3>
            <div className="chris-cole-details-grid">
              <div className="chris-cole-detail-item">
                <span className="chris-cole-label">Birth Dasha:</span>
                <span className="chris-cole-value">{chartData.dashaInfo.birthDasha}</span>
              </div>
              {chartData.dashaInfo.currentDasha && (
                <div className="chris-cole-detail-item">
                  <span className="chris-cole-label">Current Dasha:</span>
                  <span className="chris-cole-value">
                    {chartData.dashaInfo.currentDasha.planet}
                    {chartData.dashaInfo.currentDasha.remainingYears && 
                      ` (${chartData.dashaInfo.currentDasha.remainingYears.toFixed(1)} years remaining)`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </HeroSection>
  );
};

export default ChartPage;
