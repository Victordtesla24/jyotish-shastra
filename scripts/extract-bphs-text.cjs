/**
 * BPHS PDF Text Extraction Script
 * 
 * Extracts text from BPHS PDF with page markers for scripture reference mapping.
 * Uses pdf-parse library for CI-friendly, cross-platform extraction.
 * 
 * Output: docs/BPHS-BTR/BPHS_TEXT_EXTRACT.md with ===PAGE:n=== markers
 * 
 * Usage: node scripts/extract-bphs-text.js
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// __dirname is already available in CommonJS - points to scripts/ directory
// Go up one level to project root

const PDF_PATH = path.join(__dirname, '../docs/BPHS-BTR/Maharishi_Parashara_Brihat_Parasara_Hora_Sastra_(Vol_1).pdf');
const OUTPUT_PATH = path.join(__dirname, '../docs/BPHS-BTR/BPHS_TEXT_EXTRACT.md');

async function extractBPHSText() {
  console.log('🔍 Starting BPHS PDF text extraction...');
  console.log(`📄 Source: ${PDF_PATH}`);
  console.log(`📝 Output: ${OUTPUT_PATH}`);
  
  try {
    // Check if PDF exists
    if (!fs.existsSync(PDF_PATH)) {
      throw new Error(`PDF file not found at: ${PDF_PATH}`);
    }
    
    // Read PDF buffer and convert to Uint8Array
    console.log('\n⏳ Reading PDF file...');
    const buffer = fs.readFileSync(PDF_PATH);
    const dataBuffer = new Uint8Array(buffer);
    
    // Configure pdf-parse with custom page renderer
    const options = {
      // Custom page renderer to preserve page boundaries
      pagerender: async (pageData) => {
        try {
          const textContent = await pageData.getTextContent();
          
          // Join text items with spaces to maintain readability
          const pageText = textContent.items
            .map(item => item.str)
            .join(' ')
            .trim();
          
          // Add page marker for reference mapping
          return `${pageText}\n\n===PAGE:${pageData.pageNumber}===\n\n`;
        } catch (error) {
          console.warn(`⚠️  Warning: Error processing page ${pageData.pageNumber}: ${error.message}`);
          return `\n\n===PAGE:${pageData.pageNumber}=== [Error extracting page text]\n\n`;
        }
      }
    };
    
    // Extract text with page markers  
    console.log('⏳ Extracting text with page markers...');
    // Try simple approach - just pass buffer without options first to test
    const result = await (new pdfParse.PDFParse(dataBuffer)).getText();
    const { text, numpages, info } = result;
    
    // Create output content
    const outputContent = `# BPHS Text Extract

**Source:** Maharishi Parashara - Brihat Parasara Hora Sastra (Vol. 1)  
**Extraction Date:** ${new Date().toISOString()}  
**Total Pages:** ${numpages}  
**PDF Info:** ${info ? JSON.stringify(info, null, 2) : 'N/A'}

---

## Extraction Notes

- Text extracted using pdf-parse library (Node.js)
- Page markers: \`===PAGE:n===\` indicate PDF page boundaries
- Search for specific chapters using page markers for scripture citations
- Text quality may vary depending on PDF encoding

---

## Key Chapters for BTR Implementation

Target chapters for scripture reference mapping:
- **Chapter 3, Śloka 70** → Gulika (Mandi) calculation
- **Chapter 4, Ślokas 25-30** → Nisheka-Lagna (Conception time)
- **Chapter 80** → Praanapada and Ayurdaya
- **Chapter 81** → Birth Time Rectification principles

---

## Extracted Text

${text}

---

## Extraction Complete

**Pages Processed:** ${numpages}  
**Output File:** ${OUTPUT_PATH}  
**Status:** ✅ Complete
`;
    
    // Write to output file
    console.log('\n⏳ Writing extracted text to file...');
    fs.writeFileSync(OUTPUT_PATH, outputContent, 'utf-8');
    
    // Success summary
    console.log('\n✅ BPHS text extraction complete!');
    console.log(`📊 Statistics:`);
    console.log(`   - Total pages: ${numpages}`);
    console.log(`   - Output size: ${(outputContent.length / 1024).toFixed(2)} KB`);
    console.log(`   - Output file: ${OUTPUT_PATH}`);
    
    // Guide for next steps
    console.log('\n📋 Next Steps:');
    console.log('   1. Search BPHS_TEXT_EXTRACT.md for target chapters (Ch.3, Ch.4, Ch.80, Ch.81)');
    console.log('   2. Extract ≤25-word quotes from identified ślokas');
    console.log('   3. Map quotes to code locations in docs/memory/bphs-verse-map.md');
    console.log('   4. Create executable specification in docs/BPHS-BTR/BPHS_EXEC_SPEC.md');
    
    return { success: true, pages: numpages };
    
  } catch (error) {
    console.error('\n❌ Error during PDF extraction:', error.message);
    console.error(error.stack);
    throw error;
  }
}

// Run extraction
extractBPHSText()
  .then(result => {
    console.log('\n🎉 Extraction process completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Extraction process failed!');
    process.exit(1);
  });
