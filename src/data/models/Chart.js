const mongoose = require('mongoose');

const planetaryPositionSchema = new mongoose.Schema({
  planet: {
    type: String,
    required: true,
    enum: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
  },
  sign: {
    type: String,
    required: true,
    enum: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
           'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
  },
  house: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  degree: {
    type: Number,
    required: true,
    min: 0,
    max: 360
  },
  minutes: {
    type: Number,
    required: true,
    min: 0,
    max: 59
  },
  seconds: {
    type: Number,
    required: true,
    min: 0,
    max: 59
  },
  isRetrograde: {
    type: Boolean,
    default: false
  },
  isCombust: {
    type: Boolean,
    default: false
  },
  nakshatra: {
    name: {
      type: String,
      enum: ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra',
             'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
             'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
             'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
             'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati']
    },
    pada: {
      type: Number,
      min: 1,
      max: 4
    },
    lord: {
      type: String,
      enum: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
    }
  },
  dignity: {
    type: String,
    enum: ['exalted', 'own_sign', 'moolatrikona', 'friend', 'neutral', 'enemy', 'debilitated']
  },
  strength: {
    shad_bala: Number,
    ashtakavarga: Number,
    vimsopaka_bala: Number
  }
}, { _id: false });

const houseSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  sign: {
    type: String,
    required: true,
    enum: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
           'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
  },
  lord: {
    type: String,
    required: true,
    enum: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
  },
  cusp: {
    degree: Number,
    minutes: Number,
    seconds: Number
  },
  planets: [{
    type: String,
    enum: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
  }],
  strength: {
    type: Number,
    min: 0,
    max: 100
  }
}, { _id: false });

const divisionalChartSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60']
  },
  name: {
    type: String,
    required: true
  },
  planets: [planetaryPositionSchema],
  houses: [houseSchema],
  ascendant: {
    sign: String,
    degree: Number,
    minutes: Number,
    seconds: Number
  }
}, { _id: false });

const dashaSchema = new mongoose.Schema({
  system: {
    type: String,
    default: 'Vimshottari',
    enum: ['Vimshottari', 'Ashtottari', 'Yogini', 'Char', 'Kalachakra']
  },
  currentMahadasha: {
    planet: {
      type: String,
      enum: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
    },
    startDate: Date,
    endDate: Date,
    remainingYears: Number,
    remainingMonths: Number,
    remainingDays: Number
  },
  currentAntardasha: {
    planet: {
      type: String,
      enum: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
    },
    startDate: Date,
    endDate: Date,
    remainingMonths: Number,
    remainingDays: Number
  },
  currentPratyantardasha: {
    planet: {
      type: String,
      enum: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
    },
    startDate: Date,
    endDate: Date,
    remainingDays: Number
  },
  timeline: [{
    level: {
      type: String,
      enum: ['mahadasha', 'antardasha', 'pratyantardasha']
    },
    planet: {
      type: String,
      enum: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
    },
    startDate: Date,
    endDate: Date,
    duration: {
      years: Number,
      months: Number,
      days: Number
    }
  }]
}, { _id: false });

const chartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  birthData: {
    dateOfBirth: {
      type: Date,
      required: true
    },
    timeOfBirth: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
    },
    placeOfBirth: {
      name: {
        type: String,
        required: true
      },
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      },
      timezone: {
        type: String,
        required: true
      },
      country: String,
      state: String
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    }
  },
  calculationSettings: {
    ayanamsa: {
      type: String,
      default: 'lahiri',
      enum: ['lahiri', 'raman', 'krishnamurti', 'yukteshwar', 'fagan_bradley']
    },
    houseSystem: {
      type: String,
      default: 'placidus',
      enum: ['placidus', 'koch', 'equal', 'whole_sign', 'campanus', 'regiomontanus']
    },
    coordinateSystem: {
      type: String,
      default: 'tropical',
      enum: ['tropical', 'sidereal']
    }
  },
  rasiChart: {
    ascendant: {
      sign: {
        type: String,
        required: true,
        enum: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
               'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
      },
      degree: {
        type: Number,
        required: true
      },
      minutes: {
        type: Number,
        required: true
      },
      seconds: {
        type: Number,
        required: true
      }
    },
    planets: [planetaryPositionSchema],
    houses: [houseSchema]
  },
  divisionalCharts: [divisionalChartSchema],
  dasha: dashaSchema,
  yogas: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['raja', 'dhana', 'viparita_raja', 'gaja_kesari', 'panch_mahapurusha', 'neecha_bhanga', 'other']
    },
    description: String,
    planets: [String],
    houses: [Number],
    strength: {
      type: Number,
      min: 0,
      max: 100
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  aspects: [{
    aspectingPlanet: {
      type: String,
      enum: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
    },
    aspectedPlanet: {
      type: String,
      enum: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
    },
    aspectedHouse: {
      type: Number,
      min: 1,
      max: 12
    },
    aspectType: {
      type: String,
      enum: ['conjunction', 'opposition', 'trine', 'square', 'sextile', 'special']
    },
    orb: Number,
    strength: {
      type: Number,
      min: 0,
      max: 100
    },
    nature: {
      type: String,
      enum: ['benefic', 'malefic', 'neutral']
    }
  }],
  analysis: {
    lagnaAnalysis: {
      strength: Number,
      lordPlacement: String,
      lordStrength: Number,
      functionalNature: String
    },
    planetaryStrengths: [{
      planet: String,
      shadbala: Number,
      ashtakavarga: Number,
      vimsopaka: Number,
      overall: Number
    }],
    houseStrengths: [{
      house: Number,
      strength: Number,
      lordStrength: Number,
      occupantStrength: Number
    }],
    specialFeatures: [{
      type: String,
      description: String,
      significance: String
    }]
  },
  metadata: {
    calculatedAt: {
      type: Date,
      default: Date.now
    },
    calculationVersion: {
      type: String,
      default: '1.0.0'
    },
    ephemerisVersion: String,
    isPublic: {
      type: Boolean,
      default: false
    },
    tags: [String],
    notes: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
chartSchema.index({ userId: 1, createdAt: -1 });
chartSchema.index({ 'birthData.dateOfBirth': 1 });
chartSchema.index({ 'birthData.placeOfBirth.name': 1 });
chartSchema.index({ 'metadata.isPublic': 1 });
chartSchema.index({ 'metadata.tags': 1 });

// Virtual for age calculation
chartSchema.virtual('age').get(function() {
  if (!this.birthData.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.birthData.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
});

// Virtual for chart summary
chartSchema.virtual('summary').get(function() {
  return {
    name: this.name,
    ascendant: this.rasiChart.ascendant.sign,
    sunSign: this.rasiChart.planets.find(p => p.planet === 'Sun')?.sign,
    moonSign: this.rasiChart.planets.find(p => p.planet === 'Moon')?.sign,
    currentMahadasha: this.dasha?.currentMahadasha?.planet,
    totalYogas: this.yogas?.length || 0
  };
});

// Method to get planet position
chartSchema.methods.getPlanetPosition = function(planetName) {
  return this.rasiChart.planets.find(p => p.planet === planetName);
};

// Method to get house information
chartSchema.methods.getHouseInfo = function(houseNumber) {
  return this.rasiChart.houses.find(h => h.number === houseNumber);
};

// Method to get planets in house
chartSchema.methods.getPlanetsInHouse = function(houseNumber) {
  return this.rasiChart.planets.filter(p => p.house === houseNumber);
};

// Method to get divisional chart
chartSchema.methods.getDivisionalChart = function(chartType) {
  return this.divisionalCharts.find(dc => dc.type === chartType);
};

// Method to check if planet is exalted
chartSchema.methods.isPlanetExalted = function(planetName) {
  const planet = this.getPlanetPosition(planetName);
  return planet?.dignity === 'exalted';
};

// Method to check if planet is debilitated
chartSchema.methods.isPlanetDebilitated = function(planetName) {
  const planet = this.getPlanetPosition(planetName);
  return planet?.dignity === 'debilitated';
};

// Method to get yoga by name
chartSchema.methods.getYoga = function(yogaName) {
  return this.yogas.find(y => y.name === yogaName);
};

// Method to get active yogas
chartSchema.methods.getActiveYogas = function() {
  return this.yogas.filter(y => y.isActive);
};

// Static method to find charts by location
chartSchema.statics.findByLocation = function(latitude, longitude, radius = 50) {
  return this.find({
    'birthData.placeOfBirth.latitude': {
      $gte: latitude - radius / 111,
      $lte: latitude + radius / 111
    },
    'birthData.placeOfBirth.longitude': {
      $gte: longitude - radius / (111 * Math.cos(latitude * Math.PI / 180)),
      $lte: longitude + radius / (111 * Math.cos(latitude * Math.PI / 180))
    }
  });
};

// Static method to find charts by date range
chartSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    'birthData.dateOfBirth': {
      $gte: startDate,
      $lte: endDate
    }
  });
};

module.exports = mongoose.model('Chart', chartSchema);
