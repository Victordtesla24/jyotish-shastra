/**
 * Sample chart data for testing
 * Based on sample-birth-data.json
 */

const sampleBirthData = {
  name: 'Farhan',
  dateOfBirth: '1997-12-18',
  timeOfBirth: '02:30',
  latitude: 32.4935378,
  longitude: 74.5411575,
  timezone: 'Asia/Karachi',
  gender: 'male',
  placeOfBirth: 'Sialkot, Pakistan'
};

const testCases = [
  {
    birthData: {
      name: 'Farhan - Sialkot',
      dateOfBirth: '1997-12-18',
      timeOfBirth: '00:00',
      latitude: 32.4935378,
      longitude: 74.5411575,
      timezone: 'Asia/Karachi',
      gender: 'male',
      placeOfBirth: {
        name: 'Sialkot, Pakistan',
        timezone: 'Asia/Karachi',
        latitude: 32.4935378,
        longitude: 74.5411575
      }
    }
  },
  {
    birthData: {
      name: 'Test Case 2 - Delhi',
      dateOfBirth: '1985-07-22',
      timeOfBirth: '06:45',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 'Asia/Kolkata',
      gender: 'male',
      placeOfBirth: {
        name: 'Delhi, India',
        timezone: 'Asia/Kolkata',
        latitude: 28.6139,
        longitude: 77.2090
      }
    }
  },
  {
    birthData: {
      name: 'Test Case 3 - Mumbai',
      dateOfBirth: '1990-06-15',
      timeOfBirth: '08:15',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 'Asia/Kolkata',
      gender: 'female',
      placeOfBirth: {
        name: 'Mumbai, India',
        timezone: 'Asia/Kolkata'
      }
    }
  },
  {
    birthData: {
      name: 'Test Case 4 - Chennai',
      dateOfBirth: '1988-03-10',
      timeOfBirth: '18:20',
      latitude: 13.0827,
      longitude: 80.2707,
      timezone: 'Asia/Kolkata',
      gender: 'male',
      placeOfBirth: {
        name: 'Chennai, India',
        timezone: 'Asia/Kolkata'
      }
    }
  },
  {
    birthData: {
      name: 'Test Case 5 - Bangalore',
      dateOfBirth: '1992-11-28',
      timeOfBirth: '10:45',
      latitude: 12.9716,
      longitude: 77.5946,
      timezone: 'Asia/Kolkata',
      gender: 'female',
      placeOfBirth: {
        name: 'Bangalore, India',
        timezone: 'Asia/Kolkata'
      }
    }
  },
  {
    birthData: {
      name: 'Test Case 6 - New York',
      dateOfBirth: '1995-09-05',
      timeOfBirth: '15:30',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
      gender: 'male',
      placeOfBirth: {
        name: 'New York, USA',
        timezone: 'America/New_York',
        latitude: 40.7128,
        longitude: -74.0060
      }
    }
  }
];

// Attach testCases to sampleBirthData for backward compatibility
sampleBirthData.testCases = testCases;

export { sampleBirthData, testCases };
module.exports = { sampleBirthData, testCases };

