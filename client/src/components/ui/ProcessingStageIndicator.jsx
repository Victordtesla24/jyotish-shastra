import React from 'react';

/**
 * ProcessingStageIndicator - Shows real-time API processing stages
 * @param {Object} props - Component props
 * @param {Array} props.stages - Array of stage objects with id, label, status
 * @param {string} props.currentStage - Current active stage ID
 * @param {string} props.error - Error message if any
 * @returns {JSX.Element} Processing stage indicator
 */
export const ProcessingStageIndicator = ({ stages, currentStage, error }) => {
  const getStageIcon = (stage) => {
    if (stage.status === 'completed') return '✅';
    if (stage.status === 'processing') return '⏳';
    if (stage.status === 'error') return '❌';
    if (stage.status === 'pending') return '⚪';
    return '⚪';
  };

  const getStageClass = (stage) => {
    const base = 'flex items-center space-x-2 p-2 rounded transition-all duration-300';

    if (stage.status === 'completed') return `${base} bg-green-100 text-green-800`;
    if (stage.status === 'processing') return `${base} bg-blue-100 text-blue-800 animate-pulse`;
    if (stage.status === 'error') return `${base} bg-red-100 text-red-800`;
    return `${base} bg-gray-100 text-gray-600`;
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700">Processing Status</h4>

      <div className="space-y-1">
        {stages.map((stage, index) => (
          <div key={stage.id} className={getStageClass(stage)}>
            <span className="text-lg">{getStageIcon(stage)}</span>
            <span className="text-sm font-medium flex-1">{stage.label}</span>
            {stage.status === 'processing' && (
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
            {stage.duration && stage.status === 'completed' && (
              <span className="text-xs text-gray-500">{stage.duration}ms</span>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">
            <span className="font-medium">Error:</span> {error}
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${(stages.filter(s => s.status === 'completed').length / stages.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProcessingStageIndicator;
