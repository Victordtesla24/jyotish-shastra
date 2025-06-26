import React from 'react';
import PropTypes from 'prop-types';

const IconBase = ({ children, size = 24, className = '', color = 'currentColor', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
    {...props}
  >
    {children}
  </svg>
);

// Om Symbol (ॐ)
export const OmIcon = ({ size, className, color = '#FF9933', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M12 2C10.5 2 9.2 2.8 8.5 4C7.8 3.2 6.9 2.8 6 3.2C5.1 3.6 4.5 4.5 4.5 5.5C4.5 6.5 5.1 7.4 6 7.8C6.9 8.2 7.8 7.8 8.5 7C8.8 7.5 9.3 7.8 9.8 7.9C10.3 8 10.8 7.9 11.2 7.6C11.6 7.3 11.8 6.9 11.8 6.4C11.8 5.9 11.6 5.5 11.2 5.2C11.5 4.8 12 4.6 12.5 4.6C13 4.6 13.5 4.8 13.8 5.2C13.4 5.5 13.2 5.9 13.2 6.4C13.2 6.9 13.4 7.3 13.8 7.6C14.2 7.9 14.7 8 15.2 7.9C15.7 7.8 16.2 7.5 16.5 7C17.2 7.8 18.1 8.2 19 7.8C19.9 7.4 20.5 6.5 20.5 5.5C20.5 4.5 19.9 3.6 19 3.2C18.1 2.8 17.2 3.2 16.5 4C15.8 2.8 14.5 2 13 2H12Z"
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
    />
    <path
      d="M12 10C11.4 10 10.8 10.2 10.4 10.6C10 11 9.8 11.6 9.8 12.2C9.8 12.8 10 13.4 10.4 13.8C10.8 14.2 11.4 14.4 12 14.4C12.6 14.4 13.2 14.2 13.6 13.8C14 13.4 14.2 12.8 14.2 12.2C14.2 11.6 14 11 13.6 10.6C13.2 10.2 12.6 10 12 10Z"
      fill={color}
    />
    <path
      d="M7 15C6.4 15 5.8 15.2 5.4 15.6C5 16 4.8 16.6 4.8 17.2C4.8 17.8 5 18.4 5.4 18.8C5.8 19.2 6.4 19.4 7 19.4C7.6 19.4 8.2 19.2 8.6 18.8C9 18.4 9.2 17.8 9.2 17.2C9.2 16.6 9 16 8.6 15.6C8.2 15.2 7.6 15 7 15Z"
      fill={color}
    />
    <path
      d="M17 15C16.4 15 15.8 15.2 15.4 15.6C15 16 14.8 16.6 14.8 17.2C14.8 17.8 15 18.4 15.4 18.8C15.8 19.2 16.4 19.4 17 19.4C17.6 19.4 18.2 19.2 18.6 18.8C19 18.4 19.2 17.8 19.2 17.2C19.2 16.6 19 16 18.6 15.6C18.2 15.2 17.6 15 17 15Z"
      fill={color}
    />
  </IconBase>
);

// Lotus Symbol
export const LotusIcon = ({ size, className, color = '#FFC0CB', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M12 22C12.5 21.5 13.5 20.5 14.5 19C15.5 17.5 16.5 15.5 16.5 13C16.5 10.5 15 8.5 12 8.5C9 8.5 7.5 10.5 7.5 13C7.5 15.5 8.5 17.5 9.5 19C10.5 20.5 11.5 21.5 12 22Z"
      fill={color}
      opacity="0.8"
    />
    <path
      d="M12 20C12.3 19.7 13.2 18.8 14 17.5C14.8 16.2 15.5 14.5 15.5 13C15.5 11.5 14.3 10.5 12 10.5C9.7 10.5 8.5 11.5 8.5 13C8.5 14.5 9.2 16.2 10 17.5C10.8 18.8 11.7 19.7 12 20Z"
      fill={color}
    />
    <path
      d="M12 18C12.2 17.8 12.8 17.2 13.3 16.2C13.8 15.2 14.2 14 14.2 13C14.2 12 13.5 11.5 12 11.5C10.5 11.5 9.8 12 9.8 13C9.8 14 10.2 15.2 10.7 16.2C11.2 17.2 11.8 17.8 12 18Z"
      fill="white"
    />
    <circle cx="12" cy="13" r="1.5" fill={color} />
  </IconBase>
);

// Mandala Symbol
export const MandalaIcon = ({ size, className, color = '#6B46C1', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
    <circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
    <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1" fill="none" opacity="0.7" />
    <circle cx="12" cy="12" r="2" fill={color} />
    <g transform="rotate(0 12 12)">
      <path d="M12 2 L12.5 4 L12 6 L11.5 4 Z" fill={color} opacity="0.6" />
      <path d="M12 18 L12.5 20 L12 22 L11.5 20 Z" fill={color} opacity="0.6" />
      <path d="M2 12 L4 12.5 L6 12 L4 11.5 Z" fill={color} opacity="0.6" />
      <path d="M18 12 L20 12.5 L22 12 L20 11.5 Z" fill={color} opacity="0.6" />
    </g>
    <g transform="rotate(45 12 12)">
      <path d="M12 2 L12.3 4 L12 6 L11.7 4 Z" fill={color} opacity="0.4" />
      <path d="M12 18 L12.3 20 L12 22 L11.7 20 Z" fill={color} opacity="0.4" />
      <path d="M2 12 L4 12.3 L6 12 L4 11.7 Z" fill={color} opacity="0.4" />
      <path d="M18 12 L20 12.3 L22 12 L20 11.7 Z" fill={color} opacity="0.4" />
    </g>
  </IconBase>
);

// Sun Symbol (Surya)
export const SunIcon = ({ size, className, color = '#F97316', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <circle cx="12" cy="12" r="4" fill={color} />
    <g stroke={color} strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </g>
  </IconBase>
);

// Moon Symbol (Chandra)
export const MoonIcon = ({ size, className, color = '#C0C0C0', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      fill={color}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// Star Symbol
export const StarIcon = ({ size, className, color = '#FFD700', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <polygon
      points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
      fill={color}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// Trishul (Trident) Symbol
export const TrishulIcon = ({ size, className, color = '#800000', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M12 2V22M8 6L12 2L16 6M10 8L12 6L14 8M12 18H8M12 18H16M12 20H10M12 20H14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </IconBase>
);

// Yantra Symbol
export const YantraIcon = ({ size, className, color = '#FF9933', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <polygon
      points="12,2 20,8 20,16 12,22 4,16 4,8"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <polygon
      points="12,6 16,9 16,15 12,18 8,15 8,9"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
      opacity="0.7"
    />
    <polygon
      points="12,8 14,10 14,14 12,16 10,14 10,10"
      fill={color}
      opacity="0.5"
    />
    <circle cx="12" cy="12" r="1" fill={color} />
  </IconBase>
);

// Chakra Symbol
export const ChakraIcon = ({ size, className, color = '#6B46C1', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none" />
    <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.5" fill="none" opacity="0.7" />
    <circle cx="12" cy="12" r="3" fill={color} opacity="0.5" />
    <g transform="rotate(0 12 12)">
      <line x1="12" y1="2" x2="12" y2="4" stroke={color} strokeWidth="2" />
      <line x1="12" y1="20" x2="12" y2="22" stroke={color} strokeWidth="2" />
    </g>
    <g transform="rotate(60 12 12)">
      <line x1="12" y1="2" x2="12" y2="4" stroke={color} strokeWidth="2" />
      <line x1="12" y1="20" x2="12" y2="22" stroke={color} strokeWidth="2" />
    </g>
    <g transform="rotate(120 12 12)">
      <line x1="12" y1="2" x2="12" y2="4" stroke={color} strokeWidth="2" />
      <line x1="12" y1="20" x2="12" y2="22" stroke={color} strokeWidth="2" />
    </g>
  </IconBase>
);

// Export object with all icons for easy import
const VedicIcons = {
  Om: OmIcon,
  Lotus: LotusIcon,
  Mandala: MandalaIcon,
  Sun: SunIcon,
  Moon: MoonIcon,
  Star: StarIcon,
  Trishul: TrishulIcon,
  Yantra: YantraIcon,
  Chakra: ChakraIcon,
};

// PropTypes for all icons
const iconPropTypes = {
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  color: PropTypes.string,
};

OmIcon.propTypes = iconPropTypes;
LotusIcon.propTypes = iconPropTypes;
MandalaIcon.propTypes = iconPropTypes;
SunIcon.propTypes = iconPropTypes;
MoonIcon.propTypes = iconPropTypes;
StarIcon.propTypes = iconPropTypes;
TrishulIcon.propTypes = iconPropTypes;
YantraIcon.propTypes = iconPropTypes;
ChakraIcon.propTypes = iconPropTypes;

export default VedicIcons;
