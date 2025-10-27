const fs = require('fs');
const path = require('path');

// Load the test data
const testDataPath = path.join(__dirname, '../test-data/analysis-comprehensive-response.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

console.log('🔍 Test Data Structure Analysis');
console.log('================================\n');

// Check the main structure
console.log('1. Main structure:');
console.log('   - success:', testData.success);
console.log('   - Top level keys:', Object.keys(testData));
console.log('   - Has analysis:', !!testData.analysis);
console.log('   - Has sections:', !!testData.analysis?.sections);

// Check section structure
console.log('\n2. Section structure:');
const sections = testData.analysis?.sections || {};
console.log('   - Section keys:', Object.keys(sections));

// Check each section's structure
console.log('\n3. Individual section structure:');
Object.keys(sections).forEach(sectionKey => {
  const section = sections[sectionKey];
  console.log(`\n   ${sectionKey}:`);
  console.log(`   - name: ${section.name}`);
  console.log(`   - keys: ${Object.keys(section).join(', ')}`);
  console.log(`   - has questions: ${!!section.questions} (${section.questions?.length || 0} questions)`);
  console.log(`   - has analyses: ${!!section.analyses}`);
  console.log(`   - has summary: ${!!section.summary}`);
});

// Simulate the data flow in the UI
console.log('\n4. Simulating UI data flow:');

// Step 1: API response processing (like ResponseDataToUIDisplayAnalyser)
const apiResponse = testData;
const data = apiResponse.data || apiResponse.analysis || apiResponse;
console.log('   - Extracted data has sections:', !!data.sections);

// Step 2: Processing comprehensive analysis
if (data.sections) {
  const processedSections = {};
  Object.keys(data.sections).forEach(sectionKey => {
    processedSections[sectionKey] = data.sections[sectionKey];
  });

  const displayData = {
    sections: processedSections,
    synthesis: data.synthesis || null,
    recommendations: data.recommendations || null
  };

  console.log('   - Processed sections:', Object.keys(displayData.sections));
  console.log('   - Display data structure correct:', !!displayData.sections);
}

// Step 3: Component rendering (like ComprehensiveAnalysisDisplay)
const culturalAnalysisData = {
  sections: data.sections,
  analysis: data.sections,
  originalData: apiResponse
};

console.log('\n5. Component data access simulation:');
const testSectionId = 'section1';
let sectionData = null;

if (culturalAnalysisData?.sections?.[testSectionId]) {
  sectionData = culturalAnalysisData.sections[testSectionId];
  console.log(`   ✅ Found section data for ${testSectionId}`);
} else {
  console.log(`   ❌ Section data NOT found for ${testSectionId}`);
}

if (sectionData) {
  console.log(`   - Section name: ${sectionData.name}`);
  console.log(`   - Has questions: ${!!sectionData.questions}`);
  console.log(`   - First question: ${sectionData.questions?.[0]?.question?.substring(0, 50)}...`);
}

console.log('\n✅ Test complete!');
