/**
 * Vargottama Detector
 * Detects planets that are Vargottama (in the same sign in D1 and D9 charts),
 * which gives them special strength and prominence.
 */
class VargottamaDetector {
  /**
   * Detects all Vargottama planets in a chart.
   * @param {Object} rasiChart - The Rasi (D1) chart.
   * @param {Object} navamsaChart - The Navamsa (D9) chart.
   * @returns {Array<string>} An array of Vargottama planets.
   */
  detectVargottamaPlanets(rasiChart, navamsaChart) {
    const vargottamaPlanets = [];
    if (!rasiChart?.planetaryPositions || !navamsaChart?.planetaryPositions) {
      return vargottamaPlanets;
    }

    for (const planetName in rasiChart.planetaryPositions) {
      const rasiPlanet = rasiChart.planetaryPositions[planetName];
      const navamsaPlanet = navamsaChart.planetaryPositions[planetName];

      if (rasiPlanet && navamsaPlanet && rasiPlanet.sign === navamsaPlanet.sign) {
        vargottamaPlanets.push(planetName);
      }
    }

    return vargottamaPlanets;
  }
}

export default VargottamaDetector;
