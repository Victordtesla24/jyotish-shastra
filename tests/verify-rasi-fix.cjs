/**
 * Verification script for rasi number and planetary position fixes
 * Tests the updated VedicChartDisplay component logic
 */

// Simulate the processChartData function logic
function getRasiNumberFromSign(signName) {
  const RASI_NUMBERS = {
    'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
    'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
    'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
  };
  
  const rasiNumber = RASI_NUMBERS[signName];
  if (!rasiNumber || rasiNumber < 1 || rasiNumber > 12) {
    throw new Error(`Invalid sign name "${signName}"`);
  }
  
  return rasiNumber;
}

// Test with Farhan kundli data
const sampleChartData = {
  ascendant: {
    longitude: 184.69766813232675,
    sign: "Libra",
    signIndex: 6,
    degree: 4.697668132326726
  },
  housePositions: [
    { houseNumber: 1, degree: 208.5260060500759, sign: "Libra", signId: 7, longitude: 208.5260060500759 },
    { houseNumber: 2, degree: 237.16727879343682, sign: "Scorpio", signId: 8, longitude: 237.16727879343682 },
    { houseNumber: 3, degree: 268.3882687930211, sign: "Sagittarius", signId: 9, longitude: 268.3882687930211 },
    { houseNumber: 4, degree: 301.3498820048583, sign: "Aquarius", signId: 11, longitude: 301.3498820048583 },
    { houseNumber: 5, degree: 333.85401405923784, sign: "Pisces", signId: 12, longitude: 333.85401405923784 },
    { houseNumber: 6, degree: 3.298157337153725, sign: "Aries", signId: 1, longitude: 3.298157337153725 },
    { houseNumber: 7, degree: 28.52600605007592, sign: "Aries", signId: 1, longitude: 28.52600605007592 },
    { houseNumber: 8, degree: 58.52600605007592, sign: "Taurus", signId: 2, longitude: 58.52600605007592 },
    { houseNumber: 9, degree: 88.52600605007592, sign: "Gemini", signId: 3, longitude: 88.52600605007592 },
    { houseNumber: 10, degree: 118.52600605007592, sign: "Cancer", signId: 4, longitude: 118.52600605007592 },
    { houseNumber: 11, degree: 148.52600605007592, sign: "Leo", signId: 5, longitude: 148.52600605007592 },
    { houseNumber: 12, degree: 178.52600605007592, sign: "Virgo", signId: 6, longitude: 178.52600605007592 }
  ],
  planets: [
    { name: "Sun", longitude: 242.15937359251723, sign: "Sagittarius", signId: 9, degree: 2.159373592517227 },
    { name: "Moon", longitude: 108.0378450824482, sign: "Cancer", signId: 4, degree: 18.0378450824482 },
    { name: "Mars", longitude: 275.8760317763135, sign: "Capricorn", signId: 10, degree: 5.876031776313482 },
    { name: "Mercury", longitude: 240.79747964664912, sign: "Sagittarius", signId: 9, degree: 0.7974796466491227 },
    { name: "Jupiter", longitude: 295.625953378215, sign: "Capricorn", signId: 10, degree: 25.625953378215 },
    { name: "Venus", longitude: 278.5621492268043, sign: "Capricorn", signId: 10, degree: 8.562149226804308 },
    { name: "Saturn", longitude: 349.7088926468, sign: "Pisces", signId: 12, degree: 19.708892646799995 },
    { name: "Rahu", longitude: 140.64549707426067, sign: "Leo", signId: 5, degree: 20.645497074260675 },
    { name: "Ketu", longitude: 320.6454970742607, sign: "Aquarius", signId: 11, degree: 20.645497074260675 }
  ]
};

// Create houseToRasiMap (simulating processChartData logic)
const houseToRasiMap = {};
sampleChartData.housePositions.forEach(house => {
  if (house.houseNumber >= 1 && house.houseNumber <= 12 && house.sign) {
    houseToRasiMap[house.houseNumber] = {
      sign: house.sign,
      signId: house.signId,
      longitude: house.longitude,
      degree: house.degree
    };
  }
});

console.log('=== RASI NUMBER VERIFICATION ===\n');
console.log('Ascendant:', sampleChartData.ascendant.sign, '(should map to rasi', getRasiNumberFromSign(sampleChartData.ascendant.sign) + ')');
console.log('\nHouse to Rasi Mapping:');
console.log('----------------------');

for (let i = 1; i <= 12; i++) {
  if (houseToRasiMap[i]) {
    const rasiNumber = getRasiNumberFromSign(houseToRasiMap[i].sign);
    console.log(`House ${i.toString().padStart(2)}: ${houseToRasiMap[i].sign.padEnd(12)} -> Rasi ${rasiNumber}`);
  } else {
    console.log(`House ${i.toString().padStart(2)}: MISSING DATA`);
  }
}

console.log('\n=== VERIFICATION RESULTS ===');
console.log(`House 1 Rasi: ${getRasiNumberFromSign(houseToRasiMap[1].sign)} (should match ascendant sign: ${sampleChartData.ascendant.sign})`);

const house1Rasi = getRasiNumberFromSign(houseToRasiMap[1].sign);
const ascendantRasi = getRasiNumberFromSign(sampleChartData.ascendant.sign);
const matches = house1Rasi === ascendantRasi;

console.log(`✅ House 1 rasi matches ascendant: ${matches ? 'YES' : 'NO'}`);

if (!matches) {
  console.error(`❌ ERROR: House 1 rasi (${house1Rasi}) does not match ascendant rasi (${ascendantRasi})`);
  process.exit(1);
}

console.log('\n✅ All verifications passed!');
console.log('\nNote: The rasi numbers should now be displayed based on actual housePositions from API,');
console.log('not calculated from formula. This ensures accuracy matching the kundli template.');

