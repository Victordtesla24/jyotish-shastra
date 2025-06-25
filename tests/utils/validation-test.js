/**
 * Direct Chart Generation Test for PDF Validation
 * Tests the ChartGenerationService directly to get system data
 */

const ChartGenerationService = require('../../src/services/chart/ChartGenerationService');

async function testChartGeneration() {
  try {
    console.log('🚀 Starting Chart Generation Test for PDF Validation');

    const chartService = new ChartGenerationService();

    // PDF Reference Data
    const birthData = {
      dateOfBirth: "1985-10-24",
      timeOfBirth: "14:30:00",
      latitude: 18.52,
      longitude: 73.85,
      timeZone: "Asia/Kolkata",
      placeOfBirth: {
        name: "Pune, Maharashtra, India",
        latitude: 18.52,
        longitude: 73.85,
        timezone: "Asia/Kolkata"
      }
    };

    console.log('\n📊 Birth Data:', JSON.stringify(birthData, null, 2));

    // Generate Rasi Chart
    console.log('\n🔮 Generating Rasi Chart...');
    const rasiChart = await chartService.generateRasiChart(birthData);

    console.log('\n📋 SYSTEM GENERATED DATA:');
    console.log('='.repeat(80));

    // Ascendant
    console.log('\n🌅 ASCENDANT:');
    console.log(`Longitude: ${rasiChart.ascendant.longitude}°`);
    console.log(`Sign: ${rasiChart.ascendant.sign}`);
    console.log(`Degree in Sign: ${rasiChart.ascendant.degree}°`);

    // Planetary Positions
    console.log('\n🪐 PLANETARY POSITIONS:');
    const planets = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

    for (const planet of planets) {
      const position = rasiChart.planetaryPositions[planet];
      if (position) {
        console.log(`${planet.toUpperCase()}: ${position.longitude.toFixed(2)}° ${position.sign} (${position.degree.toFixed(2)}° in sign)`);
      }
    }

    // Nakshatra
    console.log('\n⭐ NAKSHATRA:');
    console.log(`Moon Nakshatra: ${rasiChart.nakshatra.name}`);
    console.log(`Pada: ${rasiChart.nakshatra.pada}`);

    console.log('\n✅ Chart generation completed successfully');

    // Print comparison format
    console.log('\n' + '='.repeat(120));
    console.log('COMPARISON TABLE FORMAT (PDF vs SYSTEM):');
    console.log('='.repeat(120));

    // PDF Reference Data
    const pdfData = {
      sun: { degree: 7.24, sign: 'Libra', longitude: 187.24, nakshatra: 'Swati', pada: 1, house: 9 },
      moon: { degree: 19.11, sign: 'Aquarius', longitude: 319.11, nakshatra: 'Shatabhisha', pada: 4, house: 1 },
      mars: { degree: 4.30, sign: 'Virgo', longitude: 154.30, nakshatra: 'Uttara Phalguni', pada: 3, house: 8 },
      mercury: { degree: 26.52, sign: 'Libra', longitude: 206.52, nakshatra: 'Vishakha', pada: 2, house: 9 },
      jupiter: { degree: 14.18, sign: 'Capricorn', longitude: 284.18, nakshatra: 'Shravana', pada: 2, house: 12 },
      venus: { degree: 16.07, sign: 'Virgo', longitude: 166.07, nakshatra: 'Hasta', pada: 2, house: 8 },
      saturn: { degree: 3.60, sign: 'Scorpio', longitude: 213.60, nakshatra: 'Anuradha', pada: 1, house: 10 },
      rahu: { degree: 15.82, sign: 'Aries', longitude: 15.82, nakshatra: 'Bharani', pada: 1, house: 3 },
      ketu: { degree: 15.82, sign: 'Libra', longitude: 195.82, nakshatra: 'Swati', pada: 3, house: 9 },
      ascendant: { degree: 1.08, sign: 'Aquarius', longitude: 301.08, nakshatra: 'Dhanishta', pada: 3 }
    };

    console.log('|-----------|---------------|---------------|---------------|---------------|---------------|---------------|-------------|');
    console.log('| Planet    | PDF Degree    | System Degree | PDF Sign      | System Sign   | PDF Nakshatra | Sys Nakshatra | House Match |');
    console.log('|-----------|---------------|---------------|---------------|---------------|---------------|---------------|-------------|');

    for (const planet of planets) {
      const pdfPlanet = pdfData[planet];
      const sysPlanet = rasiChart.planetaryPositions[planet];

      if (pdfPlanet && sysPlanet) {
        const pdfDeg = `${pdfPlanet.degree}° ${pdfPlanet.sign}`;
        const sysDeg = `${sysPlanet.degree.toFixed(2)}° ${sysPlanet.sign}`;
        const pdfSign = pdfPlanet.sign;
        const sysSign = sysPlanet.sign;
        const pdfNak = pdfPlanet.nakshatra + '-' + pdfPlanet.pada;
        const sysNak = 'TBD'; // Will calculate nakshatra later
        const houseMatch = `H${pdfPlanet.house}/SYS`;

        console.log(`| ${planet.padEnd(9)} | ${pdfDeg.padEnd(13)} | ${sysDeg.padEnd(13)} | ${pdfSign.padEnd(13)} | ${sysSign.padEnd(13)} | ${pdfNak.padEnd(13)} | ${sysNak.padEnd(13)} | ${houseMatch.padEnd(11)} |`);
      }
    }
    console.log('|-----------|---------------|---------------|---------------|---------------|---------------|---------------|-------------|');

    return rasiChart;

  } catch (error) {
    console.error('❌ Error in chart generation test:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testChartGeneration()
    .then(() => {
      console.log('\n🎉 Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testChartGeneration };
