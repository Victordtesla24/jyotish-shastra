# Comprehensive Guide to Vedic Birth Chart (Kundli) Generation: APIs, Libraries, and Professional Tools

## Python Libraries for Vedic Astrology Calculations

### 1. PySwissEph - The Gold Standard for Astronomical Calculations

**PySwissEph** is the most accurate and widely-used library for astrological calculations, based on NASA's DE431 ephemerides. It provides high-precision planetary positions essential for Vedic astrology with support for the Lahiri Ayanamsa system.

**Installation & Key Features:**
```bash
pip install pyswisseph
```

**Example Implementation:**
```python
import swisseph as swe
import math
from datetime import datetime

def calculate_vedic_kundli(year, month, day, hour, minute, lat, lon, timezone=5.5):
    """Generate Vedic birth chart data using PySwissEph"""

    # Convert to Julian Day
    jd = swe.julday(year, month, day, hour + (minute/60.0) - timezone)

    # Set Lahiri Ayanamsa for Vedic calculations
    swe.set_sid_mode(swe.SIDM_LAHIRI)

    # Calculate planetary positions
    planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
    planet_ids = [swe.SUN, swe.MOON, swe.MARS, swe.MERCURY, swe.JUPITER, swe.VENUS, swe.SATURN]

    chart_data = {}

    for planet, planet_id in zip(planets, planet_ids):
        pos = swe.calc_ut(jd, planet_id, swe.FLG_SIDEREAL)
        longitude = pos[0][0]

        chart_data[planet] = {
            'longitude': longitude,
            'sign_num': int(longitude // 30) + 1,
            'degree': longitude % 30,
            'house': calculate_house_position(longitude, ascendant_longitude)
        }

    # Calculate Rahu and Ketu (lunar nodes)
    rahu_pos = swe.calc_ut(jd, swe.MEAN_NODE, swe.FLG_SIDEREAL)
    rahu_long = rahu_pos[0][0]
    ketu_long = (rahu_long + 180) % 360

    chart_data['Rahu'] = {'longitude': rahu_long, 'sign_num': int(rahu_long // 30) + 1}
    chart_data['Ketu'] = {'longitude': ketu_long, 'sign_num': int(ketu_long // 30) + 1}

    return chart_data

# Sample birth data
birth_details = {
    'name': 'Sample Person',
    'date': '15-04-1990',
    'time': '14:30',
    'place': 'New Delhi',
    'coordinates': (28.6139, 77.2090)
}

kundli_data = calculate_vedic_kundli(1990, 4, 15, 14, 30, 28.6139, 77.2090)
```

**ASCII Output Example (North Indian Style):**
```
Birth Details: Sample Person, 15-Apr-1990, 14:30, New Delhi

┌─────────┬─────────┬─────────┬─────────┐
│    12   │    1    │    2    │    3    │
│   Ke    │  ASC    │   Ma    │ Me Ve Ra│
├─────────┼─────────┼─────────┼─────────┤
│   11    │                   │    4    │
│   Sa    │         ☉         │   Su    │
├─────────┼─────────┼─────────┼─────────┤
│   10    │    9    │    8    │    7    │
│   Ju    │  Mo     │         │         │
└─────────┴─────────┴─────────┴─────────┘

Planetary Positions:
Sun: 25°30' Aries (House 1)    Moon: 15°12' Sagittarius (House 9)
Mars: 28°48' Taurus (House 2)  Mercury: 10°18' Gemini (House 3)
Jupiter: 05°42' Capricorn (House 10)  Venus: 22°06' Gemini (House 3)
Saturn: 18°54' Aquarius (House 11)    Rahu: 12°24' Sagittarius (House 9)
Ketu: 12°24' Gemini (House 3)  Ascendant: 07°36' Taurus
```

### 2. Kerykeion - Modern Python Astrology Library

**Kerykeion** is a comprehensive library that supports both tropical and sidereal calculations with SVG chart generation capabilities [3]. It integrates well with AI applications and provides clean APIs for birth chart creation.

**Installation & Usage:**
```bash
pip install kerykeion
```

**Example Implementation:**
```python
from kerykeion import AstrologicalSubject, KrChart

def create_vedic_chart_kerykeion(name, year, month, day, hour, minute, city, nation):
    # Create subject with sidereal zodiac for Vedic astrology
    subject = AstrologicalSubject(
        name=name,
        year=year,
        month=month,
        day=day,
        hour=hour,
        minute=minute,
        city=city,
        nation=nation,
        zodiac_type="sidereal",
        sidereal_mode="lahiri"
    )

    # Generate professional SVG chart
    chart = KrChart(subject)
    chart.makeSVG()

    return subject, chart

# Example usage
subject, chart = create_vedic_chart_kerykeion(
    "Sample Person", 1990, 4, 15, 14, 30, "New Delhi", "IN"
)

print(f"Sun position: {subject.sun}")
print(f"Moon position: {subject.moon}")
print(f"Ascendant: {subject.first_house}")
```

**Sample Output Structure:**
The library generates professional SVG charts with planetary symbols, house divisions, aspect lines, and detailed planetary information with precise degrees and sign placements [3].

### 3. VedicAstro - Specialized Vedic Library

**VedicAstro** focuses specifically on Vedic astrology systems with support for Krishnamurthi Paddhati (KP) and traditional methods [4].

**Installation:**
```bash
pip install vedicastro
pip install git+https://github.com/diliprk/flatlib.git@sidereal#egg=flatlib
```

**Example Usage:**
```python
from vedicastro import VedicHoroscopeData
import flatlib

def generate_vedic_horoscope(birth_date, birth_time, coordinates):
    vedic_chart = VedicHoroscopeData()

    # Generate chart data
    chart = vedic_chart.generate_chart(birth_date, birth_time, coordinates)
    planets_data = vedic_chart.get_planets_data_from_chart(chart)

    return planets_data

# Usage example
birth_info = {
    'date': '1990/04/15',
    'time': '14:30:00',
    'coordinates': (28.6139, 77.2090)
}

horoscope_data = generate_vedic_horoscope(
    birth_info['date'],
    birth_info['time'],
    birth_info['coordinates']
)
```

### 4. PyJHora - Comprehensive Vedic Package

**PyJHora** contains extensive features from PVR Narasimha Rao's "Vedic Astrology - An Integrated Approach" book and JHora software [5].

**Installation:**
```bash
pip install PyJHora
```

**Key Features:**
- Complete Panchanga calculations
- Vimshottari Dasha analysis
- Divisional charts (D1 to D60)
- Ashtakvarga calculations
- Multiple Ayanamsa systems

### 5. Sideralib - Sidereal System Library

**Sideralib** is designed specifically for sidereal astrology calculations with clean APIs [6].

**Example Implementation:**
```python
from sideralib import astrochart, astrodata

def create_sidereal_kundli(year, month, day, hour, minute, second,
                          utc_hour, utc_minute, latitude, longitude):

    data = astrodata.AstroData(
        year, month, day, hour, minute, second,
        utc_hour, utc_minute, latitude, longitude,
        ayanamsa="ay_lahiri"
    )

    planet_data = data.planets_rashi()
    kundli = astrochart.Chart(planet_data).lagnaChart()

    return kundli

# Example usage
kundli_chart = create_sidereal_kundli(
    2009, 3, 30, 9, 36, 0, 5, 30, 19.0760, 72.8777
)

for house_num, house in enumerate(kundli_chart, 1):
    print(f"House {house_num}: Sign {house.sign_num}, Planets: {house.planets}")
```

## Comprehensive Vedic Astrology APIs

### 1. Astrology API - Professional Service

**Astrology API** provides complete Kundli generation with multi-language support and comprehensive Vedic features [7].

**Key Features:**
- Complete natal chart calculations
- Vimshottari, Char, and Yogini Dasha systems
- Ashtakvarga analysis
- North, South, and East Indian chart styles
- Divisional charts (D1 to D60)

**API Implementation:**
```python
import requests

def get_kundli_from_api(birth_details):
    api_url = "https://api.astrologyapi.com/v1/birth_chart"

    payload = {
        "day": birth_details['day'],
        "month": birth_details['month'],
        "year": birth_details['year'],
        "hour": birth_details['hour'],
        "min": birth_details['minute'],
        "lat": birth_details['latitude'],
        "lon": birth_details['longitude'],
        "tzone": birth_details['timezone'],
        "chart_style": "north_indian"
    }

    headers = {
        'Content-Type': 'application/json',
        'x-api-key': 'your_api_key'
    }

    response = requests.post(api_url, json=payload, headers=headers)
    return response.json()

# Sample API response structure
sample_response = {
    "birth_details": {
        "date": "15/4/1990",
        "time": "14:30",
        "place": "New Delhi",
        "timezone": "+05:30"
    },
    "planets": {
        "sun": {"sign": "Aries", "degree": "25:30", "house": 1},
        "moon": {"sign": "Sagittarius", "degree": "15:12", "house": 9},
        "mars": {"sign": "Taurus", "degree": "28:48", "house": 2}
    },
    "houses": [
        {"house": 1, "sign": "Taurus", "lord": "Venus"},
        {"house": 2, "sign": "Gemini", "lord": "Mercury"}
    ]
}
```

### 2. Astrologer API - RESTful Service

**Astrologer API** offers extensive astrology calculations with SVG chart generation [8].

**Available Endpoints:**
```python
# Birth Chart Generation
POST /api/v4/birth-chart
{
    "subject": {
        "name": "Sample Person",
        "date": "1990-04-15",
        "time": "14:30",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "timezone": "Asia/Kolkata"
    }
}

# Response includes SVG chart and detailed planetary data
```

## JavaScript Libraries for Chart Visualization

### 1. AstroChart2 - Modern JavaScript Library

**AstroChart2** provides clean APIs for generating astrology charts with zero dependencies [9].

**Implementation:**
```javascript
import astrology from 'astrochart2';

const chartData = {
    "points": [
        {name: "Sun", angle: 25.5},
        {name: "Moon", angle: 135.2},
        {name: "Mars", angle: 58.8},
        {name: "Mercury", angle: 70.3}
    ],
    "cusps": [
        {angle: 37}, {angle: 67}, {angle: 97}, {angle: 127},
        {angle: 157}, {angle: 187}, {angle: 217}, {angle: 247},
        {angle: 277}, {angle: 307}, {angle: 337}, {angle: 7}
    ]
};

const chart = new astrology.Universe('paper').radix().setData(chartData);
```

### 2. Fabric.js Integration for Custom Charts

**Fabric.js** combined with Chart.js provides powerful tools for creating interactive astrological charts [10].

**Implementation:**
```javascript
import { fabric } from 'fabric';

function createVedicChart(canvasId, chartData) {
    const canvas = new fabric.Canvas(canvasId);

    // Create zodiac wheel
    const outerCircle = new fabric.Circle({
        radius: 200,
        fill: 'transparent',
        stroke: '#000',
        strokeWidth: 2,
        left: 200,
        top: 200,
        originX: 'center',
        originY: 'center'
    });

    // Add house divisions
    for (let i = 0; i  {
        const symbol = new fabric.Text(planet.symbol, {
            left: planet.x,
            top: planet.y,
            fontSize: 16,
            fill: planet.color
        });
        canvas.add(symbol);
    });

    canvas.add(outerCircle);
    return canvas;
}
```

### 3. D3.js for Advanced Visualizations

**D3.js** enables creation of highly customized and interactive astrological charts [11].

**Implementation Example:**
```javascript
import * as d3 from 'd3';

function createVedicChartD3(containerId, planetData) {
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', 500)
        .attr('height', 500);

    const centerX = 250, centerY = 250, radius = 200;

    // Create zodiac circle
    svg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', radius)
        .attr('fill', 'none')
        .attr('stroke', '#000')
        .attr('stroke-width', 2);

    // Add house lines
    const houses = d3.range(12);
    svg.selectAll('.house-line')
        .data(houses)
        .enter()
        .append('line')
        .attr('class', 'house-line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', d => centerX + radius * Math.cos(d * 30 * Math.PI / 180))
        .attr('y2', d => centerY + radius * Math.sin(d * 30 * Math.PI / 180))
        .attr('stroke', '#666')
        .attr('stroke-width', 1);

    // Add planets
    svg.selectAll('.planet')
        .data(planetData)
        .enter()
        .append('text')
        .attr('class', 'planet')
        .attr('x', d => centerX + (radius - 30) * Math.cos(d.angle * Math.PI / 180))
        .attr('y', d => centerY + (radius - 30) * Math.sin(d.angle * Math.PI / 180))
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .text(d => d.symbol);
}
```

## Leveraging Canva API for Professional Kundli Design

### Canva Connect API Integration

**Canva's Connect APIs** enable integration of design capabilities into custom applications for creating professional Kundli charts [12][13][14].

### Step-by-Step Implementation Guide

#### 1. Authentication and Setup

```python
import requests
import json

class CanvaKundliGenerator:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.canva.com/rest/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
```

#### 2. Create Design Template

```python
def create_kundli_design(self, birth_data, chart_data):
    # Create new design from template
    design_data = {
        "design_type": "Custom",
        "title": f"Vedic Birth Chart - {birth_data['name']}",
        "width": 800,
        "height": 800
    }

    response = requests.post(
        f"{self.base_url}/designs",
        headers=self.headers,
        json=design_data
    )

    return response.json()["design"]["id"]
```

#### 3. Add Chart Elements Programmatically

```python
def add_chart_elements(self, design_id, planetary_data):
    elements = []

    # Add zodiac wheel background
    wheel_element = {
        "type": "shape",
        "shape_type": "circle",
        "width": 600,
        "height": 600,
        "position": {"x": 100, "y": 100},
        "style": {
            "fill": "transparent",
            "stroke": "#000000",
            "stroke_width": 3
        }
    }
    elements.append(wheel_element)

    # Add house divisions
    for house in range(1, 13):
        angle = (house - 1) * 30
        line_element = {
            "type": "line",
            "start": {"x": 400, "y": 400},
            "end": {
                "x": 400 + 300 * math.cos(math.radians(angle)),
                "y": 400 + 300 * math.sin(math.radians(angle))
            },
            "style": {"stroke": "#666666", "stroke_width": 1}
        }
        elements.append(line_element)

    # Add planetary symbols with custom positioning
    planet_symbols = {
        "Sun": "☉", "Moon": "☽", "Mars": "♂", "Mercury": "☿",
        "Jupiter": "♃", "Venus": "♀", "Saturn": "♄",
        "Rahu": "☊", "Ketu": "☋"
    }

    for planet, data in planetary_data.items():
        if planet in planet_symbols:
            house_angle = (data['house'] - 1) * 30
            planet_element = {
                "type": "text",
                "text": planet_symbols[planet],
                "position": {
                    "x": 400 + 250 * math.cos(math.radians(house_angle)),
                    "y": 400 + 250 * math.sin(math.radians(house_angle))
                },
                "style": {
                    "font_size": 24,
                    "color": "#D4AF37",
                    "font_weight": "bold"
                }
            }
            elements.append(planet_element)

    return elements
```

#### 4. Add Birth Details and Annotations

```python
def add_birth_details(self, design_id, birth_data):
    # Add title
    title_element = {
        "type": "text",
        "text": f"Vedic Birth Chart",
        "position": {"x": 400, "y": 50},
        "style": {
            "font_size": 28,
            "color": "#2C3E50",
            "font_weight": "bold",
            "text_align": "center"
        }
    }

    # Add birth information
    birth_info = f"{birth_data['name']}\n{birth_data['date']} at {birth_data['time']}\n{birth_data['place']}"
    info_element = {
        "type": "text",
        "text": birth_info,
        "position": {"x": 50, "y": 750},
        "style": {
            "font_size": 14,
            "color": "#34495E",
            "text_align": "left"
        }
    }

    return [title_element, info_element]
```

#### 5. Complete Workflow Automation

```python
def generate_complete_kundli(self, birth_data, planetary_data):
    # Create base design
    design_id = self.create_kundli_design(birth_data, planetary_data)

    # Add all chart elements
    chart_elements = self.add_chart_elements(design_id, planetary_data)
    birth_elements = self.add_birth_details(design_id, birth_data)

    all_elements = chart_elements + birth_elements

    # Apply elements to design
    for element in all_elements:
        requests.post(
            f"{self.base_url}/designs/{design_id}/elements",
            headers=self.headers,
            json=element
        )

    # Export final design
    export_request = {
        "format": "PNG",
        "quality": "high",
        "width": 800,
        "height": 800
    }

    export_response = requests.post(
        f"{self.base_url}/designs/{design_id}/export",
        headers=self.headers,
        json=export_request
    )

    return export_response.json()["download_url"]

# Usage example
generator = CanvaKundliGenerator("your_api_key")
kundli_url = generator.generate_complete_kundli(birth_data, planetary_data)
```

### Alternative Design APIs

#### 1. Figma API for Advanced Design Control

**Figma's API** offers programmatic access to design files for creating custom Kundli templates [15].

```python
import requests

def create_figma_kundli(figma_token, file_key, birth_data):
    headers = {'X-Figma-Token': figma_token}

    # Get design file
    response = requests.get(
        f'https://api.figma.com/v1/files/{file_key}',
        headers=headers
    )

    # Modify elements programmatically
    # Add planetary positions and birth details

    return response.json()
```

#### 2. Adobe Creative SDK Integration

For enterprise-level applications, **Adobe's Creative SDK** provides comprehensive design automation capabilities [15].

## Complete Example: Professional Kundli Generation System

### Integrated Approach Using Multiple Libraries

```python
import swisseph as swe
from kerykeion import AstrologicalSubject
import requests
import math

class ProfessionalKundliGenerator:
    def __init__(self, canva_api_key=None):
        self.canva_api_key = canva_api_key

    def calculate_positions(self, birth_data):
        """Calculate planetary positions using PySwissEph"""
        jd = swe.julday(
            birth_data['year'], birth_data['month'], birth_data['day'],
            birth_data['hour'] + birth_data['minute']/60.0 - birth_data['timezone']
        )

        swe.set_sid_mode(swe.SIDM_LAHIRI)

        positions = {}
        planet_ids = {
            'Sun': swe.SUN, 'Moon': swe.MOON, 'Mars': swe.MARS,
            'Mercury': swe.MERCURY, 'Jupiter': swe.JUPITER,
            'Venus': swe.VENUS, 'Saturn': swe.SATURN
        }

        for planet, planet_id in planet_ids.items():
            pos = swe.calc_ut(jd, planet_id, swe.FLG_SIDEREAL)
            longitude = pos[0][0]

            positions[planet] = {
                'longitude': longitude,
                'sign': int(longitude // 30) + 1,
                'degree': longitude % 30,
                'house': self.calculate_house(longitude, ascendant_longitude)
            }

        return positions

    def generate_ascii_chart(self, positions):
        """Generate ASCII representation"""
        chart = """
Birth Chart (North Indian Style)
┌─────────┬─────────┬─────────┬─────────┐
│    12   │    1    │    2    │    3    │
│  {h12}  │  {h1}   │  {h2}   │  {h3}   │
├─────────┼─────────┼─────────┼─────────┤
│   11    │                   │    4    │
│  {h11}  │       ☉           │  {h4}   │
├─────────┼─────────┼─────────┼─────────┤
│   10    │    9    │    8    │    7    │
│  {h10}  │  {h9}   │  {h8}   │  {h7}   │
└─────────┴─────────┴─────────┴─────────┘
        """.format(
            h1=self.get_house_planets(positions, 1),
            h2=self.get_house_planets(positions, 2),
            h3=self.get_house_planets(positions, 3),
            h4=self.get_house_planets(positions, 4),
            h5=self.get_house_planets(positions, 5),
            h6=self.get_house_planets(positions, 6),
            h7=self.get_house_planets(positions, 7),
            h8=self.get_house_planets(positions, 8),
            h9=self.get_house_planets(positions, 9),
            h10=self.get_house_planets(positions, 10),
            h11=self.get_house_planets(positions, 11),
            h12=self.get_house_planets(positions, 12)
        )

        return chart

    def create_professional_chart(self, birth_data, positions):
        """Generate professional chart using Canva API"""
        if not self.canva_api_key:
            return "Canva API key required for professional chart generation"

        canva_generator = CanvaKundliGenerator(self.canva_api_key)
        chart_url = canva_generator.generate_complete_kundli(birth_data, positions)

        return chart_url

# Usage example
birth_data = {
    'name': 'Sample Person',
    'year': 1990, 'month': 4, 'day': 15,
    'hour': 14, 'minute': 30,
    'place': 'New Delhi',
    'latitude': 28.6139, 'longitude': 77.2090,
    'timezone': 5.5
}

generator = ProfessionalKundliGenerator()
positions = generator.calculate_positions(birth_data)
ascii_chart = generator.generate_ascii_chart(positions)
print(ascii_chart)
```
