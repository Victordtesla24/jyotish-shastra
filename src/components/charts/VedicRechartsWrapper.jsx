import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Vedic color palette for charts
const VEDIC_COLORS = {
  primary: '#FF9933',    // Saffron
  secondary: '#FFD700',  // Gold
  accent: '#800000',     // Maroon
  cosmic: '#6B46C1',     // Cosmic Purple
  stellar: '#1E40AF',    // Stellar Blue
  lunar: '#C0C0C0',      // Lunar Silver
  solar: '#F97316',      // Solar Orange
  earth: '#92400E',      // Earth Brown
  success: '#059669',    // Green
  warning: '#D97706',    // Orange
  error: '#DC2626'       // Red
};

const VEDIC_CHART_PALETTE = [
  VEDIC_COLORS.primary,
  VEDIC_COLORS.secondary,
  VEDIC_COLORS.cosmic,
  VEDIC_COLORS.stellar,
  VEDIC_COLORS.solar,
  VEDIC_COLORS.lunar,
  VEDIC_COLORS.earth,
  VEDIC_COLORS.accent
];

// Custom Tooltip Component
const VedicTooltip = ({ active, payload, label, labelFormatter, formatter }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-vedic-border rounded-xl p-4 shadow-cosmic">
      <div className="text-vedic-text font-cinzel font-semibold mb-2">
        {labelFormatter ? labelFormatter(label) : label}
      </div>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center space-x-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-vedic-text-light">
            {entry.name}: <span className="font-semibold text-vedic-text">
              {formatter ? formatter(entry.value, entry.name) : entry.value}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
};

// Planetary Strength Pie Chart
export const PlanetaryStrengthChart = ({ data, title = "Planetary Strengths" }) => {
  const enhancedData = data?.map((item, index) => ({
    ...item,
    color: VEDIC_CHART_PALETTE[index % VEDIC_CHART_PALETTE.length]
  }));

  return (
    <div className="w-full h-80">
      <div className="text-center mb-4">
        <h3 className="text-xl font-cinzel font-bold text-vedic-text">{title}</h3>
        <p className="text-sm text-vedic-text-light">Planetary influence distribution</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={enhancedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            stroke="#fff"
            strokeWidth={2}
          >
            {enhancedData?.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip content={<VedicTooltip />} />
          <Legend
            wrapperStyle={{
              fontSize: '14px',
              fontFamily: 'Cinzel, serif'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// House Strength Bar Chart
export const HouseStrengthChart = ({ data, title = "House Strengths" }) => {
  return (
    <div className="w-full h-80">
      <div className="text-center mb-4">
        <h3 className="text-xl font-cinzel font-bold text-vedic-text">{title}</h3>
        <p className="text-sm text-vedic-text-light">Strength across the 12 houses</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={{ stroke: '#9CA3AF' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={{ stroke: '#9CA3AF' }}
          />
          <Tooltip content={<VedicTooltip />} />
          <Bar
            dataKey="strength"
            fill={VEDIC_COLORS.primary}
            radius={[4, 4, 0, 0]}
            className="hover:opacity-80 transition-opacity"
          >
            {data?.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={VEDIC_CHART_PALETTE[index % VEDIC_CHART_PALETTE.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Dasha Timeline Chart
export const DashaTimelineChart = ({ data, title = "Dasha Periods" }) => {
  return (
    <div className="w-full h-80">
      <div className="text-center mb-4">
        <h3 className="text-xl font-cinzel font-bold text-vedic-text">{title}</h3>
        <p className="text-sm text-vedic-text-light">Planetary periods over time</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(value) => `${value}y`}
          />
          <YAxis
            type="category"
            dataKey="planet"
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <Tooltip
            content={<VedicTooltip
              formatter={(value) => [`${value} years`, 'Duration']}
            />}
          />
          <Bar
            dataKey="duration"
            fill={VEDIC_COLORS.cosmic}
            radius={[0, 4, 4, 0]}
          >
            {data?.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={VEDIC_CHART_PALETTE[index % VEDIC_CHART_PALETTE.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Ashtakavarga Radar Chart
export const AshtakavargaChart = ({ data, title = "Ashtakavarga Analysis" }) => {
  return (
    <div className="w-full h-80">
      <div className="text-center mb-4">
        <h3 className="text-xl font-cinzel font-bold text-vedic-text">{title}</h3>
        <p className="text-sm text-vedic-text-light">Planetary score distribution</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            className="font-devanagari"
          />
          <PolarRadiusAxis
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            tickCount={6}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke={VEDIC_COLORS.primary}
            fill={VEDIC_COLORS.primary}
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip content={<VedicTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Compatibility Chart
export const CompatibilityChart = ({ data, title = "Compatibility Analysis" }) => {
  const compatibilityData = data?.map((item, index) => ({
    ...item,
    color: item.score > 75 ? VEDIC_COLORS.success :
           item.score > 50 ? VEDIC_COLORS.warning : VEDIC_COLORS.error
  }));

  return (
    <div className="w-full h-80">
      <div className="text-center mb-4">
        <h3 className="text-xl font-cinzel font-bold text-vedic-text">{title}</h3>
        <p className="text-sm text-vedic-text-light">Relationship compatibility factors</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={compatibilityData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="aspect"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6B7280' }}
            domain={[0, 100]}
          />
          <Tooltip
            content={<VedicTooltip
              formatter={(value) => [`${value}%`, 'Compatibility']}
            />}
          />
          <Bar
            dataKey="score"
            radius={[4, 4, 0, 0]}
          >
            {compatibilityData?.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Generic Wrapper for custom charts
export const VedicChartWrapper = ({
  children,
  title,
  subtitle,
  className = "",
  height = 400
}) => {
  return (
    <div className={`card-vedic p-6 ${className}`}>
      {title && (
        <div className="text-center mb-6">
          <h3 className="text-xl font-cinzel font-bold text-vedic-text mb-2">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-vedic-text-light">{subtitle}</p>
          )}
        </div>
      )}
      <div style={{ width: '100%', height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default {
  PlanetaryStrengthChart,
  HouseStrengthChart,
  DashaTimelineChart,
  AshtakavargaChart,
  CompatibilityChart,
  VedicChartWrapper,
  VEDIC_COLORS,
  VEDIC_CHART_PALETTE
};
