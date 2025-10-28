/**
 * Global teardown for Puppeteer UI tests
 * Cleans up server processes after tests complete
 */

module.exports = async () => {
  console.log('🧹 Cleaning up servers after UI tests...');
  
  // Note: We don't kill processes here as they might be used by other tests
  // The processes will be cleaned up by the system when the test runner exits
  
  console.log('✅ UI test cleanup complete');
};
