import React from 'react';
import { motion } from 'framer-motion';

const SacredGeometry = ({
  pattern = 'mandala',
  size = 'large',
  opacity = 0.1,
  animated = true,
  color = 'currentColor'
}) => {
  const sizeMap = {
    small: 'w-24 h-24',
    medium: 'w-48 h-48',
    large: 'w-96 h-96',
    full: 'w-full h-full'
  };

  const PatternComponent = {
    mandala: MandalaPattern,
    yantra: YantraPattern,
    lotus: LotusPattern,
    omkara: OmkaraPattern,
    chakra: ChakraPattern,
    sri: SriYantraPattern
  }[pattern] || MandalaPattern;

  return (
    <div className={`${sizeMap[size]} relative`} style={{ opacity }}>
      <PatternComponent color={color} animated={animated} />
    </div>
  );
};

// Mandala Pattern
const MandalaPattern = ({ color, animated }) => (
  <motion.svg
    className="w-full h-full"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    animate={animated ? { rotate: 360 } : {}}
    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
  >
    {/* Outer Circle */}
    <circle cx="100" cy="100" r="90" stroke={color} strokeWidth="0.5" fill="none" />

    {/* Petal Pattern */}
    {[...Array(8)].map((_, i) => (
      <motion.g
        key={i}
        style={{ transformOrigin: '100px 100px' }}
        animate={animated ? { rotate: [0, 45, 0] } : {}}
        transition={{ duration: 8, repeat: Infinity, delay: i * 0.2 }}
      >
        <ellipse
          cx="100"
          cy="40"
          rx="8"
          ry="20"
          stroke={color}
          strokeWidth="0.3"
          fill="none"
          transform={`rotate(${i * 45} 100 100)`}
        />
      </motion.g>
    ))}

    {/* Inner Circles */}
    <circle cx="100" cy="100" r="60" stroke={color} strokeWidth="0.4" fill="none" />
    <circle cx="100" cy="100" r="30" stroke={color} strokeWidth="0.3" fill="none" />

    {/* Sacred Geometry Lines */}
    {[...Array(16)].map((_, i) => (
      <line
        key={i}
        x1="100"
        y1="100"
        x2={100 + 60 * Math.cos((i * 22.5 * Math.PI) / 180)}
        y2={100 + 60 * Math.sin((i * 22.5 * Math.PI) / 180)}
        stroke={color}
        strokeWidth="0.2"
        opacity="0.6"
      />
    ))}

    {/* Center Om Symbol */}
    <motion.text
      x="100"
      y="110"
      textAnchor="middle"
      fontSize="24"
      fill={color}
      fontFamily="Noto Sans Devanagari"
      animate={animated ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 3, repeat: Infinity }}
    >
      ॐ
    </motion.text>
  </motion.svg>
);

// Yantra Pattern
const YantraPattern = ({ color, animated }) => (
  <motion.svg
    className="w-full h-full"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    animate={animated ? { rotate: -360 } : {}}
    transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
  >
    {/* Outer Square */}
    <rect x="20" y="20" width="160" height="160" stroke={color} strokeWidth="0.8" fill="none" />

    {/* Inner Square rotated */}
    <rect
      x="40"
      y="40"
      width="120"
      height="120"
      stroke={color}
      strokeWidth="0.6"
      fill="none"
      transform="rotate(45 100 100)"
    />

    {/* Central Triangle (upward) */}
    <motion.polygon
      points="100,60 120,120 80,120"
      stroke={color}
      strokeWidth="0.8"
      fill="none"
      animate={animated ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    />

    {/* Central Triangle (downward) */}
    <motion.polygon
      points="100,140 80,80 120,80"
      stroke={color}
      strokeWidth="0.8"
      fill="none"
      animate={animated ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
    />

    {/* Corner decorations */}
    {[
      { x: 30, y: 30 }, { x: 170, y: 30 },
      { x: 170, y: 170 }, { x: 30, y: 170 }
    ].map((pos, i) => (
      <motion.circle
        key={i}
        cx={pos.x}
        cy={pos.y}
        r="3"
        fill={color}
        animate={animated ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
      />
    ))}

    {/* Center Bindu */}
    <motion.circle
      cx="100"
      cy="100"
      r="2"
      fill={color}
      animate={animated ? { scale: [1, 1.5, 1] } : {}}
      transition={{ duration: 1, repeat: Infinity }}
    />
  </motion.svg>
);

// Lotus Pattern
const LotusPattern = ({ color, animated }) => (
  <motion.svg
    className="w-full h-full"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Lotus Petals - Outer Layer */}
    {[...Array(8)].map((_, i) => (
      <motion.path
        key={`outer-${i}`}
        d={`M 100 100 Q ${100 + 40 * Math.cos((i * 45 * Math.PI) / 180)} ${100 + 40 * Math.sin((i * 45 * Math.PI) / 180)} 100 60`}
        stroke={color}
        strokeWidth="0.5"
        fill="none"
        animate={animated ? {
          pathLength: [0, 1, 0],
          opacity: [0.3, 0.8, 0.3]
        } : {}}
        transition={{ duration: 4, repeat: Infinity, delay: i * 0.2 }}
        transform={`rotate(${i * 45} 100 100)`}
      />
    ))}

    {/* Lotus Petals - Inner Layer */}
    {[...Array(6)].map((_, i) => (
      <motion.ellipse
        key={`inner-${i}`}
        cx="100"
        cy="75"
        rx="6"
        ry="15"
        stroke={color}
        strokeWidth="0.4"
        fill="none"
        transform={`rotate(${i * 60} 100 100)`}
        animate={animated ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 3, repeat: Infinity, delay: i * 0.1 }}
      />
    ))}

    {/* Center Circle */}
    <circle cx="100" cy="100" r="12" stroke={color} strokeWidth="0.6" fill="none" />

    {/* Sacred Symbol in Center */}
    <motion.text
      x="100"
      y="106"
      textAnchor="middle"
      fontSize="16"
      fill={color}
      fontFamily="Noto Sans Devanagari"
      animate={animated ? { opacity: [0.5, 1, 0.5] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      श्री
    </motion.text>
  </motion.svg>
);

// Omkara Pattern
const OmkaraPattern = ({ color, animated }) => (
  <motion.svg
    className="w-full h-full"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    animate={animated ? { rotate: 360 } : {}}
    transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
  >
    {/* Radiating Lines */}
    {[...Array(12)].map((_, i) => (
      <motion.line
        key={i}
        x1="100"
        y1="100"
        x2={100 + 80 * Math.cos((i * 30 * Math.PI) / 180)}
        y2={100 + 80 * Math.sin((i * 30 * Math.PI) / 180)}
        stroke={color}
        strokeWidth="0.3"
        opacity="0.4"
        animate={animated ? {
          strokeWidth: [0.3, 0.8, 0.3],
          opacity: [0.4, 0.8, 0.4]
        } : {}}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
      />
    ))}

    {/* Concentric Circles */}
    <circle cx="100" cy="100" r="70" stroke={color} strokeWidth="0.4" fill="none" />
    <circle cx="100" cy="100" r="50" stroke={color} strokeWidth="0.3" fill="none" />

    {/* Central Om */}
    <motion.text
      x="100"
      y="120"
      textAnchor="middle"
      fontSize="48"
      fill={color}
      fontFamily="Noto Sans Devanagari"
      animate={animated ? {
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7]
      } : {}}
      transition={{ duration: 3, repeat: Infinity }}
    >
      ॐ
    </motion.text>
  </motion.svg>
);

// Chakra Pattern
const ChakraPattern = ({ color, animated }) => (
  <motion.svg
    className="w-full h-full"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer Wheel */}
    <circle cx="100" cy="100" r="80" stroke={color} strokeWidth="1" fill="none" />

    {/* Spokes */}
    {[...Array(8)].map((_, i) => (
      <motion.line
        key={i}
        x1="100"
        y1="100"
        x2={100 + 70 * Math.cos((i * 45 * Math.PI) / 180)}
        y2={100 + 70 * Math.sin((i * 45 * Math.PI) / 180)}
        stroke={color}
        strokeWidth="0.5"
        animate={animated ? { opacity: [0.5, 1, 0.5] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
      />
    ))}

    {/* Inner Hub */}
    <motion.circle
      cx="100"
      cy="100"
      r="20"
      stroke={color}
      strokeWidth="0.8"
      fill="none"
      animate={animated ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    />

    {/* Decorative Elements */}
    {[...Array(8)].map((_, i) => (
      <motion.circle
        key={i}
        cx={100 + 60 * Math.cos((i * 45 * Math.PI) / 180)}
        cy={100 + 60 * Math.sin((i * 45 * Math.PI) / 180)}
        r="3"
        fill={color}
        animate={animated ? {
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6]
        } : {}}
        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </motion.svg>
);

// Sri Yantra Pattern (simplified)
const SriYantraPattern = ({ color, animated }) => (
  <motion.svg
    className="w-full h-full"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    animate={animated ? { rotate: 360 } : {}}
    transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
  >
    {/* Outer Frame */}
    <rect x="30" y="30" width="140" height="140" stroke={color} strokeWidth="0.6" fill="none" />

    {/* Multiple Triangles */}
    {[
      { points: "100,50 130,120 70,120", delay: 0 },
      { points: "100,150 70,80 130,80", delay: 0.5 },
      { points: "100,70 115,110 85,110", delay: 1 },
      { points: "100,130 85,90 115,90", delay: 1.5 }
    ].map((triangle, i) => (
      <motion.polygon
        key={i}
        points={triangle.points}
        stroke={color}
        strokeWidth="0.5"
        fill="none"
        animate={animated ? {
          strokeWidth: [0.5, 1, 0.5],
          opacity: [0.6, 1, 0.6]
        } : {}}
        transition={{ duration: 3, repeat: Infinity, delay: triangle.delay }}
      />
    ))}

    {/* Center Bindu */}
    <motion.circle
      cx="100"
      cy="100"
      r="2"
      fill={color}
      animate={animated ? {
        scale: [1, 2, 1],
        opacity: [0.5, 1, 0.5]
      } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    />

    {/* Corner Lotuses */}
    {[
      { x: 40, y: 40 }, { x: 160, y: 40 },
      { x: 160, y: 160 }, { x: 40, y: 160 }
    ].map((pos, i) => (
      <motion.g key={i}>
        <circle cx={pos.x} cy={pos.y} r="8" stroke={color} strokeWidth="0.3" fill="none" />
        {[...Array(6)].map((_, j) => (
          <line
            key={j}
            x1={pos.x}
            y1={pos.y}
            x2={pos.x + 6 * Math.cos((j * 60 * Math.PI) / 180)}
            y2={pos.y + 6 * Math.sin((j * 60 * Math.PI) / 180)}
            stroke={color}
            strokeWidth="0.2"
          />
        ))}
      </motion.g>
    ))}
  </motion.svg>
);

export default SacredGeometry;

// Named exports for individual patterns
export {
  MandalaPattern,
  YantraPattern,
  LotusPattern,
  OmkaraPattern,
  ChakraPattern,
  SriYantraPattern
};
