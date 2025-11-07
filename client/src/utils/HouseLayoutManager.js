/**
 * HouseLayoutManager.js - Advanced Layout Management for Vedic Charts
 * 
 * Features:
 * - South Indian and North Indian chart layouts
 * - Responsive positioning calculations
 * - Multiple chart size configurations
 * - Grid-based and absolute positioning
 * - Template-exact house arrangements
 * - Aspect line calculations
 * - Responsive breakpoint handling
 * - Export-optimized layouts
 */

class HouseLayoutManager {
  constructor(options = {}) {
    this.chartType = options.chartType || 'south-indian';
    this.size = options.size || 'medium';
    this.responsive = options.responsive !== false;
    this.aspectLines = options.aspectLines || false;
    this.customDimensions = options.customDimensions || null;

    // Layout configurations
    this.layouts = this.initializeLayouts();
    this.sizeConfigurations = this.initializeSizeConfigurations();
    this.responsiveBreakpoints = this.initializeResponsiveBreakpoints();
  }

  /**
   * Initialize different chart layout configurations
   */
  initializeLayouts() {
    return {
      'south-indian': {
        type: 'grid',
        gridSize: { rows: 4, cols: 4 },
        houses: {
          1: { gridArea: '3/3', position: 'bottom-right', label: 'Lagna' },
          2: { gridArea: '3/2', position: 'bottom-center', label: 'Dhana' },
          3: { gridArea: '3/1', position: 'bottom-left', label: 'Sahaja' },
          4: { gridArea: '2/1', position: 'middle-left', label: 'Sukha' },
          5: { gridArea: '1/1', position: 'top-left', label: 'Putra' },
          6: { gridArea: '1/2', position: 'top-center', label: 'Ari' },
          7: { gridArea: '1/3', position: 'top-right', label: 'Kalatra' },
          8: { gridArea: '2/3', position: 'middle-right', label: 'Ayur' },
          9: { gridArea: '2/4', position: 'center-right', label: 'Bhagya' },
          10: { gridArea: '1/4', position: 'top-far-right', label: 'Karma' },
          11: { gridArea: '3/4', position: 'bottom-far-right', label: 'Labha' },
          12: { gridArea: '4/2', position: 'center-bottom', label: 'Vyaya' }
        },
        center: { gridArea: '2/2', label: 'Center' },
        aspectLines: this.getSouthIndianAspectLines()
      },

      'north-indian': {
        type: 'diamond',
        houses: {
          1: { position: 'center-bottom', angle: 0, label: 'Lagna' },
          2: { position: 'bottom-left', angle: 30, label: 'Dhana' },
          3: { position: 'left-bottom', angle: 60, label: 'Sahaja' },
          4: { position: 'left-center', angle: 90, label: 'Sukha' },
          5: { position: 'left-top', angle: 120, label: 'Putra' },
          6: { position: 'top-left', angle: 150, label: 'Ari' },
          7: { position: 'center-top', angle: 180, label: 'Kalatra' },
          8: { position: 'top-right', angle: 210, label: 'Ayur' },
          9: { position: 'right-top', angle: 240, label: 'Bhagya' },
          10: { position: 'right-center', angle: 270, label: 'Karma' },
          11: { position: 'right-bottom', angle: 300, label: 'Labha' },
          12: { position: 'bottom-right', angle: 330, label: 'Vyaya' }
        },
        center: { position: 'center', label: 'Center' },
        aspectLines: this.getNorthIndianAspectLines()
      },

      'eastern-indian': {
        type: 'rectangular',
        houses: {
          1: { position: 'row-3-col-4', label: 'Lagna' },
          2: { position: 'row-4-col-4', label: 'Dhana' },
          3: { position: 'row-4-col-3', label: 'Sahaja' },
          4: { position: 'row-4-col-2', label: 'Sukha' },
          5: { position: 'row-4-col-1', label: 'Putra' },
          6: { position: 'row-3-col-1', label: 'Ari' },
          7: { position: 'row-2-col-1', label: 'Kalatra' },
          8: { position: 'row-1-col-1', label: 'Ayur' },
          9: { position: 'row-1-col-2', label: 'Bhagya' },
          10: { position: 'row-1-col-3', label: 'Karma' },
          11: { position: 'row-1-col-4', label: 'Labha' },
          12: { position: 'row-2-col-4', label: 'Vyaya' }
        },
        center: { position: 'center-area', label: 'Center' }
      }
    };
  }

  /**
   * Initialize size configurations for different chart dimensions
   */
  initializeSizeConfigurations() {
    return {
      'small': {
        chartSize: 320,
        houseSize: 60,
        fontSize: 10,
        padding: 4,
        gap: 2,
        borderWidth: 1
      },
      'medium': {
        chartSize: 480,
        houseSize: 90,
        fontSize: 12,
        padding: 6,
        gap: 3,
        borderWidth: 1.5
      },
      'large': {
        chartSize: 640,
        houseSize: 120,
        fontSize: 14,
        padding: 8,
        gap: 4,
        borderWidth: 2
      },
      'xlarge': {
        chartSize: 800,
        houseSize: 150,
        fontSize: 16,
        padding: 10,
        gap: 5,
        borderWidth: 2.5
      },
      'print': {
        chartSize: 960,
        houseSize: 180,
        fontSize: 18,
        padding: 12,
        gap: 6,
        borderWidth: 3
      }
    };
  }

  /**
   * Initialize responsive breakpoints
   */
  initializeResponsiveBreakpoints() {
    return {
      mobile: { maxWidth: 768, recommendedSize: 'small' },
      tablet: { maxWidth: 1024, recommendedSize: 'medium' },
      desktop: { maxWidth: 1440, recommendedSize: 'large' },
      large: { maxWidth: Infinity, recommendedSize: 'xlarge' }
    };
  }

  /**
   * Get layout configuration for current chart type
   */
  getLayout() {
    return this.layouts[this.chartType] || this.layouts['south-indian'];
  }

  /**
   * Get size configuration for current size
   */
  getSizeConfig() {
    if (this.customDimensions) {
      return {
        ...this.sizeConfigurations.medium,
        ...this.customDimensions
      };
    }
    return this.sizeConfigurations[this.size] || this.sizeConfigurations.medium;
  }

  /**
   * Calculate house positions based on layout type
   */
  calculateHousePositions(containerWidth, containerHeight) {
    const layout = this.getLayout();
    const sizeConfig = this.getSizeConfig();

    switch (layout.type) {
      case 'grid':
        return this.calculateGridPositions(layout, sizeConfig, containerWidth, containerHeight);
      case 'diamond':
        return this.calculateDiamondPositions(layout, sizeConfig, containerWidth, containerHeight);
      case 'rectangular':
        return this.calculateRectangularPositions(layout, sizeConfig, containerWidth, containerHeight);
      default:
        return this.calculateGridPositions(layout, sizeConfig, containerWidth, containerHeight);
    }
  }

  /**
   * Calculate grid-based positions (South Indian style)
   */
  calculateGridPositions(layout, sizeConfig, containerWidth, containerHeight) {
    const positions = {};
    const { gap, padding } = sizeConfig;
    const { gridSize } = layout;

    const cellWidth = (containerWidth - (gridSize.cols - 1) * gap - 2 * padding) / gridSize.cols;
    const cellHeight = (containerHeight - (gridSize.rows - 1) * gap - 2 * padding) / gridSize.rows;

    Object.entries(layout.houses).forEach(([houseNum, houseConfig]) => {
      const [row, col] = this.parseGridArea(houseConfig.gridArea);

      positions[houseNum] = {
        x: padding + (col - 1) * (cellWidth + gap),
        y: padding + (row - 1) * (cellHeight + gap),
        width: cellWidth,
        height: cellHeight,
        centerX: padding + (col - 1) * (cellWidth + gap) + cellWidth / 2,
        centerY: padding + (row - 1) * (cellHeight + gap) + cellHeight / 2,
        gridArea: houseConfig.gridArea,
        position: houseConfig.position,
        label: houseConfig.label
      };
    });

    // Calculate center position
    if (layout.center) {
      const [row, col] = this.parseGridArea(layout.center.gridArea);
      positions.center = {
        x: padding + (col - 1) * (cellWidth + gap),
        y: padding + (row - 1) * (cellHeight + gap),
        width: cellWidth,
        height: cellHeight,
        centerX: padding + (col - 1) * (cellWidth + gap) + cellWidth / 2,
        centerY: padding + (row - 1) * (cellHeight + gap) + cellHeight / 2,
        label: layout.center.label
      };
    }

    return positions;
  }

  /**
   * Calculate diamond-based positions (North Indian style)
   */
  calculateDiamondPositions(layout, sizeConfig, containerWidth, containerHeight) {
    const positions = {};
    const { houseSize } = sizeConfig;

    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const radius = Math.min(containerWidth, containerHeight) * 0.35;

    Object.entries(layout.houses).forEach(([houseNum, houseConfig]) => {
      const angle = (houseConfig.angle - 90) * (Math.PI / 180); // Convert to radians, offset by 90°

      positions[houseNum] = {
        x: centerX + radius * Math.cos(angle) - houseSize / 2,
        y: centerY + radius * Math.sin(angle) - houseSize / 2,
        width: houseSize,
        height: houseSize,
        centerX: centerX + radius * Math.cos(angle),
        centerY: centerY + radius * Math.sin(angle),
        angle: houseConfig.angle,
        position: houseConfig.position,
        label: houseConfig.label
      };
    });

    // Center position
    positions.center = {
      x: centerX - houseSize / 2,
      y: centerY - houseSize / 2,
      width: houseSize,
      height: houseSize,
      centerX: centerX,
      centerY: centerY,
      label: layout.center.label
    };

    return positions;
  }

  /**
   * Calculate rectangular positions (Eastern Indian style)
   */
  calculateRectangularPositions(layout, sizeConfig, containerWidth, containerHeight) {
    const positions = {};
    const { gap, padding } = sizeConfig;

    const cols = 4;
    const rows = 4;
    const cellWidth = (containerWidth - (cols - 1) * gap - 2 * padding) / cols;
    const cellHeight = (containerHeight - (rows - 1) * gap - 2 * padding) / rows;

    Object.entries(layout.houses).forEach(([houseNum, houseConfig]) => {
      const [row, col] = this.parseRectangularPosition(houseConfig.position);

      positions[houseNum] = {
        x: padding + (col - 1) * (cellWidth + gap),
        y: padding + (row - 1) * (cellHeight + gap),
        width: cellWidth,
        height: cellHeight,
        centerX: padding + (col - 1) * (cellWidth + gap) + cellWidth / 2,
        centerY: padding + (row - 1) * (cellHeight + gap) + cellHeight / 2,
        position: houseConfig.position,
        label: houseConfig.label
      };
    });

    return positions;
  }

  /**
   * Parse grid area string (e.g., "3/2" -> [3, 2])
   */
  parseGridArea(gridArea) {
    const [row, col] = gridArea.split('/').map(Number);
    return [row, col];
  }

  /**
   * Parse rectangular position string
   */
  parseRectangularPosition(position) {
    if (!position || typeof position !== 'string') {
      throw new Error('Invalid position format. Expected string like "row-1-col-1"');
    }
    
    const match = position.match(/row-(\d+)-col-(\d+)/);
    if (!match) {
      throw new Error(`Invalid position format: "${position}". Expected format: "row-X-col-Y" where X and Y are numbers.`);
    }
    
    const row = parseInt(match[1], 10);
    const col = parseInt(match[2], 10);
    
    if (isNaN(row) || isNaN(col)) {
      throw new Error(`Invalid position values. Row: ${match[1]}, Col: ${match[2]}. Expected numeric values.`);
    }
    
    return [row, col];
  }

  /**
   * Get aspect lines for South Indian chart
   */
  getSouthIndianAspectLines() {
    return [
      // Opposition aspects (7th house aspects)
      { from: 1, to: 7, type: 'opposition', strength: 'full' },
      { from: 2, to: 8, type: 'opposition', strength: 'full' },
      { from: 3, to: 9, type: 'opposition', strength: 'full' },
      { from: 4, to: 10, type: 'opposition', strength: 'full' },
      { from: 5, to: 11, type: 'opposition', strength: 'full' },
      { from: 6, to: 12, type: 'opposition', strength: 'full' },

      // Trine aspects (5th and 9th house aspects)
      { from: 1, to: 5, type: 'trine', strength: 'full' },
      { from: 1, to: 9, type: 'trine', strength: 'full' },
      { from: 5, to: 9, type: 'trine', strength: 'full' },

      // Square aspects (4th and 10th house aspects)
      { from: 1, to: 4, type: 'square', strength: 'partial' },
      { from: 1, to: 10, type: 'square', strength: 'partial' },
      { from: 4, to: 7, type: 'square', strength: 'partial' },
      { from: 7, to: 10, type: 'square', strength: 'partial' }
    ];
  }

  /**
   * Get aspect lines for North Indian chart
   */
  getNorthIndianAspectLines() {
    return [
      // Similar aspects but calculated for diamond layout
      { from: 1, to: 7, type: 'opposition', strength: 'full' },
      { from: 1, to: 5, type: 'trine', strength: 'full' },
      { from: 1, to: 9, type: 'trine', strength: 'full' }
    ];
  }

  /**
   * Calculate aspect line coordinates
   */
  calculateAspectLines(positions) {
    const layout = this.getLayout();
    const aspectLines = [];

    if (layout.aspectLines && this.aspectLines) {
      layout.aspectLines.forEach(aspect => {
        const fromPos = positions[aspect.from];
        const toPos = positions[aspect.to];

        if (fromPos && toPos) {
          aspectLines.push({
            x1: fromPos.centerX,
            y1: fromPos.centerY,
            x2: toPos.centerX,
            y2: toPos.centerY,
            type: aspect.type,
            strength: aspect.strength,
            from: aspect.from,
            to: aspect.to
          });
        }
      });
    }

    return aspectLines;
  }

  /**
   * Get responsive size based on container dimensions
   */
  getResponsiveSize(containerWidth) {
    if (!this.responsive) return this.size;

    for (const [, config] of Object.entries(this.responsiveBreakpoints)) {
      if (containerWidth <= config.maxWidth) {
        return config.recommendedSize;
      }
    }

    return 'large'; // Default for very large screens
  }

  /**
   * Calculate optimal chart dimensions
   */
  calculateOptimalDimensions(containerWidth, containerHeight, aspectRatio = 1) {
    const sizeConfig = this.getSizeConfig();
    let optimalWidth = Math.min(containerWidth * 0.95, sizeConfig.chartSize);
    let optimalHeight = optimalWidth / aspectRatio;

    if (optimalHeight > containerHeight * 0.95) {
      optimalHeight = containerHeight * 0.95;
      optimalWidth = optimalHeight * aspectRatio;
    }

    return {
      width: optimalWidth,
      height: optimalHeight,
      scale: optimalWidth / sizeConfig.chartSize
    };
  }

  /**
   * Generate CSS styles for chart layout
   */
  generateLayoutStyles() {
    this.getLayout();
    const sizeConfig = this.getSizeConfig();

    const styles = {
      container: {
        position: 'relative',
        width: `${sizeConfig.chartSize}px`,
        height: `${sizeConfig.chartSize}px`,
        fontFamily: 'var(--font-english, Inter, Roboto, sans-serif)',
        fontSize: `${sizeConfig.fontSize}px`
      },

      house: {
        position: 'absolute',
        border: `${sizeConfig.borderWidth}px solid #333`,
        backgroundColor: '#ffffff',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${sizeConfig.padding}px`,
        boxSizing: 'border-box',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      },

      houseHover: {
        backgroundColor: '#f0f8ff',
        transform: 'scale(1.05)',
        zIndex: 10,
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
      },

      aspectLine: {
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 1
      },

      center: {
        position: 'absolute',
        backgroundColor: '#fff9c4',
        border: `${sizeConfig.borderWidth * 2}px solid #fbbf24`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: '#92400e'
      }
    };

    return styles;
  }

  /**
   * Generate grid CSS for South Indian layout
   */
  generateGridCSS() {
    const layout = this.getLayout();
    const sizeConfig = this.getSizeConfig();

    if (layout.type !== 'grid') return '';

    return `
      .south-indian-chart {
        display: grid;
        grid-template-columns: repeat(${layout.gridSize.cols}, 1fr);
        grid-template-rows: repeat(${layout.gridSize.rows}, 1fr);
        gap: ${sizeConfig.gap}px;
        width: ${sizeConfig.chartSize}px;
        height: ${sizeConfig.chartSize}px;
        padding: ${sizeConfig.padding}px;
        box-sizing: border-box;
      }

      .house-container {
        border: ${sizeConfig.borderWidth}px solid #333;
        background-color: #ffffff;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: ${sizeConfig.padding}px;
        cursor: pointer;
        transition: all 0.2s ease;
        min-height: ${sizeConfig.houseSize}px;
      }

      .house-container:hover {
        background-color: #f0f8ff;
        transform: scale(1.02);
        z-index: 10;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }

      .chart-center {
        background-color: #fff9c4;
        border: ${sizeConfig.borderWidth * 2}px solid #fbbf24;
        border-radius: 8px;
        font-weight: bold;
        color: #92400e;
      }
    `;
  }

  /**
   * Update layout configuration
   */
  updateLayout(newChartType, newSize = null) {
    this.chartType = newChartType;
    if (newSize) {
      this.size = newSize;
    }
    return this.getLayout();
  }

  /**
   * Export layout configuration for external use
   */
  exportConfiguration() {
    return {
      chartType: this.chartType,
      size: this.size,
      layout: this.getLayout(),
      sizeConfig: this.getSizeConfig(),
      responsive: this.responsive,
      aspectLines: this.aspectLines
    };
  }

  /**
   * Validate house positions
   */
  validatePositions(positions) {
    const requiredHouses = Array.from({ length: 12 }, (_, i) => String(i + 1));
    const providedHouses = Object.keys(positions).filter(key => key !== 'center');

    const missing = requiredHouses.filter(house => !providedHouses.includes(house));
    const extra = providedHouses.filter(house => !requiredHouses.includes(house));

    return {
      isValid: missing.length === 0,
      missing: missing,
      extra: extra,
      total: providedHouses.length
    };
  }
}

export default HouseLayoutManager;

// Utility functions for external use
export const LayoutUtils = {
  /**
   * Convert pixel coordinates to percentage
   */
  pixelsToPercentage: (pixels, containerSize) => {
    return (pixels / containerSize) * 100;
  },

  /**
   * Convert percentage coordinates to pixels
   */
  percentageToPixels: (percentage, containerSize) => {
    return (percentage / 100) * containerSize;
  },

  /**
   * Calculate distance between two points
   */
  calculateDistance: (point1, point2) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Calculate angle between two points
   */
  calculateAngle: (point1, point2) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  },

  /**
   * Check if point is inside rectangle
   */
  isPointInRect: (point, rect) => {
    return point.x >= rect.x && 
           point.x <= rect.x + rect.width &&
           point.y >= rect.y && 
           point.y <= rect.y + rect.height;
  },

  /**
   * Generate unique layout ID
   */
  generateLayoutId: (chartType, size) => {
    return `${chartType}-${size}-${Date.now()}`;
  }
};

// Export additional layout configurations
export const LAYOUT_PRESETS = {
  COMPACT_MOBILE: {
    chartType: 'south-indian',
    size: 'small',
    responsive: true,
    aspectLines: false
  },

  STANDARD_DESKTOP: {
    chartType: 'south-indian',
    size: 'large',
    responsive: true,
    aspectLines: true
  },

  PRINT_QUALITY: {
    chartType: 'south-indian',
    size: 'print',
    responsive: false,
    aspectLines: true
  },

  INTERACTIVE_TABLET: {
    chartType: 'north-indian',
    size: 'medium',
    responsive: true,
    aspectLines: false
  }
};
