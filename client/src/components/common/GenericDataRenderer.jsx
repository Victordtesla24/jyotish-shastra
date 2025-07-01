import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/cards/Card';

const formatKey = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const GenericDataRenderer = ({ data }) => {
  if (data === null || data === undefined) {
    return <span className="text-gray-500">N/A</span>;
  }

  if (Array.isArray(data)) {
    return (
      <div className="space-y-2 pl-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-start">
            <span className="text-gray-500 mr-2">-</span>
            <GenericDataRenderer data={item} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof data === 'object') {
    return (
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
            <strong className="text-sm font-semibold text-vedic-text-muted capitalize md:col-span-1">{formatKey(key)}:</strong>
            <div className="md:col-span-2">
              <GenericDataRenderer data={value} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-vedic-text-light">{String(data)}</span>;
};

const GenericSection = ({ data, section }) => (
  <Card variant="vedic">
    <CardHeader>
      <CardTitle className="flex items-center gap-3">
        <span className="text-3xl">{section.icon}</span>
        {section.title} Analysis
      </CardTitle>
    </CardHeader>
    <CardContent>
      <GenericDataRenderer data={data} />
    </CardContent>
  </Card>
);

export default GenericSection;
