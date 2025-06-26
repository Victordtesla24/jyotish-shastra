const mongoose = require('mongoose');

const ephemerisDataSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  julianDay: {
    type: Number,
    required: true,
    index: true
  },
  planetaryPositions: [{
    planet: {
      type: String,
      required: true,
      enum: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto']
    },
    longitude: {
      type: Number,
      required: true,
      min: 0,
      max: 360
    },
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    distance: Number, // in AU
    speed: Number, // degrees per day
    isRetrograde: {
      type: Boolean,
      default: false
    }
  }],
  nakshatraData: [{
    planet: {
      type: String,
      enum: ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
    },
    nakshatra: {
      name: String,
      number: {
        type: Number,
        min: 1,
        max: 27
      },
      pada: {
        type: Number,
        min: 1,
        max: 4
      },
      lord: String
    }
  }],
  ayanamsa: {
    lahiri: Number,
    raman: Number,
    krishnamurti: Number,
    yukteshwar: Number
  },
  sunrise: Date,
  sunset: Date,
  moonPhase: {
    phase: {
      type: String,
      enum: ['new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent']
    },
    illumination: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  specialEvents: [{
    type: {
      type: String,
      enum: ['eclipse', 'conjunction', 'opposition', 'retrograde_start', 'retrograde_end', 'festival']
    },
    description: String,
    planets: [String],
    time: Date
  }],
  metadata: {
    ephemerisVersion: String,
    calculationAccuracy: String,
    dataSource: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
ephemerisDataSchema.index({ date: 1, julianDay: 1 });
ephemerisDataSchema.index({ 'planetaryPositions.planet': 1, date: 1 });
ephemerisDataSchema.index({ 'specialEvents.type': 1, date: 1 });

// Static method to find data by date range
ephemerisDataSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

// Static method to find planet position on specific date
ephemerisDataSchema.statics.getPlanetPosition = function(planet, date) {
  return this.findOne(
    {
      date: { $lte: date },
      'planetaryPositions.planet': planet
    },
    {
      'planetaryPositions.$': 1,
      date: 1
    }
  ).sort({ date: -1 });
};

// Static method to find eclipses in date range
ephemerisDataSchema.statics.findEclipses = function(startDate, endDate) {
  return this.find({
    date: { $gte: startDate, $lte: endDate },
    'specialEvents.type': 'eclipse'
  }).sort({ date: 1 });
};

module.exports = mongoose.model('EphemerisData', ephemerisDataSchema);
