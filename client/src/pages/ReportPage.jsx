import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { Button, Card, VedicLoadingSpinner } from '../components/ui';
import ComprehensiveAnalysisDisplay from '../components/reports/ComprehensiveAnalysisDisplay';

const ReportPage = () => {
  const navigate = useNavigate();
  const componentRef = useRef();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        // First try to get comprehensive analysis from session storage
        const comprehensiveAnalysisStr = sessionStorage.getItem('comprehensiveAnalysis');
        if (comprehensiveAnalysisStr) {
          const data = JSON.parse(comprehensiveAnalysisStr);
          setReportData(data);
          setLoading(false);
          return;
        }

        // If not in session storage, get birth data and fetch from API
        const birthDataStr = sessionStorage.getItem('birthData');
        if (!birthDataStr) {
          navigate('/');
          return;
        }

        const birthData = JSON.parse(birthDataStr);

        // Call comprehensive analysis API with correct v1 endpoint
        const response = await fetch('/api/v1/analysis/comprehensive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(birthData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Store for future use
        sessionStorage.setItem('comprehensiveAnalysis', JSON.stringify(data));

        setReportData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchReportData();
  }, [navigate]);

    const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Vedic_Astrology_Report',
    onBeforeGetContent: () => {
      setGenerating(true);
    },
    onAfterPrint: () => {
      setGenerating(false);
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
        .print-break {
          page-break-before: always;
        }
        h1, h2, h3 {
          page-break-after: avoid;
        }
        .card-vedic {
          break-inside: avoid;
        }
      }
    `
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <VedicLoadingSpinner text="Preparing your report..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-wisdom-gray dark:text-dark-text-secondary mb-4">{error}</p>
          <Button onClick={() => navigate('/comprehensive-analysis')} variant="primary">
            Back to Analysis
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-vedic max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="font-accent text-3xl text-earth-brown dark:text-dark-text-primary mb-2">
            Your Vedic Astrology Report
          </h1>
          <p className="text-wisdom-gray dark:text-dark-text-secondary">
            Complete analysis ready for download
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-xl font-bold text-earth-brown dark:text-dark-text-primary mb-4">
              Your Comprehensive Report is Ready
            </h2>
            <p className="text-wisdom-gray dark:text-dark-text-secondary mb-6 max-w-md mx-auto">
              Download your complete Vedic astrology analysis including birth chart,
              planetary positions, dasha periods, and personalized predictions.
            </p>
                        <div className="space-x-4">
              <Button
                onClick={handlePrint}
                variant="primary"
                size="lg"
                disabled={generating}
              >
                {generating ? 'Generating PDF...' : 'Download PDF Report'}
              </Button>
              <Button
                onClick={() => navigate('/comprehensive-analysis')}
                variant="ghost"
              >
                View Online
              </Button>
            </div>
          </div>
        </Card>

        {/* Preview Section */}
        <div ref={componentRef} className="bg-white">
          <div className="print-only text-center mb-8 hidden">
            <h1 className="text-3xl font-bold mb-2">Vedic Astrology Report</h1>
            <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
            <hr className="my-4" />
          </div>

          <div className="print-only mb-8 hidden">
            <h2 className="text-2xl font-bold mb-4">Birth Details</h2>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="font-semibold py-1">Name:</td>
                  <td>{reportData?.birthData?.name || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="font-semibold py-1">Date of Birth:</td>
                  <td>{reportData?.birthData?.dateOfBirth ? new Date(reportData.birthData.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
                </tr>
                <tr>
                  <td className="font-semibold py-1">Time of Birth:</td>
                  <td>{reportData?.birthData?.timeOfBirth || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="font-semibold py-1">Place of Birth:</td>
                  <td>{reportData?.birthData?.placeOfBirth || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="font-semibold py-1">Latitude:</td>
                  <td>{reportData?.birthData?.latitude?.toFixed(4) || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="font-semibold py-1">Longitude:</td>
                  <td>{reportData?.birthData?.longitude?.toFixed(4) || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Card className="p-6 print:shadow-none print:border-0">
            <h3 className="text-lg font-bold text-earth-brown dark:text-dark-text-primary mb-4 print:hidden">
              Report Preview
            </h3>
            <div className="max-h-96 overflow-y-auto print:max-h-none print:overflow-visible">
              {reportData && (
                <ComprehensiveAnalysisDisplay
                  analysisData={reportData}
                  showNavigation={false}
                  showProgress={false}
                />
              )}
            </div>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-wisdom-gray dark:text-dark-text-secondary">
            Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
