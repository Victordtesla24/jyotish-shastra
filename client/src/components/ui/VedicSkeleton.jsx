import React from 'react';

// Individual skeleton components for different content types
export const SkeletonText = ({ lines = 1, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 bg-gray-200 rounded animate-pulse"
        style={{ width: `${Math.max(60, 100 - i * 10)}%` }}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
    <div className="h-6 bg-gray-200 rounded animate-pulse mb-3 w-1/3" />
    <SkeletonText lines={3} />
    <div className="mt-4 flex space-x-2">
      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
);

export const SkeletonAnalysisSection = ({ title, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
    <div className="flex items-center space-x-3 mb-4">
      <div className="h-6 w-6 bg-vedic-saffron/20 rounded animate-pulse" />
      <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
    </div>
    <div className="space-y-3">
      <SkeletonText lines={2} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <div className="h-16 bg-gray-50 rounded border animate-pulse" />
        <div className="h-16 bg-gray-50 rounded border animate-pulse" />
      </div>
      <SkeletonText lines={1} className="mt-3" />
    </div>
  </div>
);

export const SkeletonTabNavigation = ({ tabCount = 6 }) => (
  <div className="border-b border-gray-200 mb-6">
    <nav className="-mb-px flex space-x-8">
      {Array.from({ length: tabCount }).map((_, i) => (
        <div
          key={i}
          className="py-2 px-1 border-b-2 border-transparent"
        >
          <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
        </div>
      ))}
    </nav>
  </div>
);

// Progressive loading skeleton for the entire analysis page
export const AnalysisPageSkeleton = ({ loadingStages = {} }) => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2 w-80" />
          <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-96" />
        </div>

        {/* Progressive Loading Status */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-vedic-saffron border-t-transparent" />
            <span className="text-sm font-medium text-gray-700">
              Loading Analysis...
            </span>
          </div>
          <div className="space-y-2">
            {Object.entries(loadingStages).map(([stage, status]) => (
              <div key={stage} className="flex items-center space-x-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${
                  status === 'completed' ? 'bg-green-500' :
                  status === 'loading' ? 'bg-vedic-saffron animate-pulse' :
                  'bg-gray-300'
                }`} />
                <span className={
                  status === 'completed' ? 'text-green-700' :
                  status === 'loading' ? 'text-vedic-saffron' :
                  'text-gray-500'
                }>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)} Analysis
                  {status === 'loading' && '...'}
                  {status === 'completed' && ' ✓'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation Skeleton */}
        <SkeletonTabNavigation />

        {/* Content Area */}
        <div className="space-y-6">
          <SkeletonAnalysisSection title="Primary Analysis" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonAnalysisSection title="Secondary Analysis" />
            <SkeletonAnalysisSection title="Tertiary Analysis" />
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="mt-8 flex justify-center space-x-4">
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-vedic-saffron/20 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

// Optimistic loading state for individual sections
export const SectionLoadingSkeleton = ({ sectionName, isLoading, hasError, hasData }) => {
  if (hasData && !isLoading) return null;

  const getStatusInfo = () => {
    if (hasError) {
      return {
        icon: '⚠️',
        text: `Failed to load ${sectionName}`,
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        borderColor: 'border-red-200'
      };
    }
    if (isLoading) {
      return {
        icon: '⏳',
        text: `Loading ${sectionName}...`,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-200'
      };
    }
    return {
      icon: '📊',
      text: `Preparing ${sectionName}`,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-200'
    };
  };

  const status = getStatusInfo();

  return (
    <div className={`${status.bgColor} ${status.borderColor} border rounded-lg p-4`}>
      <div className="flex items-center space-x-3">
        <span className="text-xl">{status.icon}</span>
        <div className="flex-1">
          <div className={`${status.textColor} font-medium text-sm`}>
            {status.text}
          </div>
          {isLoading && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div className="bg-vedic-saffron h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default {
  SkeletonText,
  SkeletonCard,
  SkeletonAnalysisSection,
  SkeletonTabNavigation,
  AnalysisPageSkeleton,
  SectionLoadingSkeleton
};
