import { normalizeDegrees } from '../astronomy/sunrise.js';

const PALA_PER_HOUR = 2.5; // BPHS: 1 hour = 2.5 palas

export function computePraanapadaLongitude({
  sunLongitudeDeg,
  birthDateLocal,
  sunriseLocal
}) {
  if (typeof sunLongitudeDeg !== 'number') {
    throw new Error('Sun longitude is required for Praanapada calculation');
  }
  if (!birthDateLocal || !sunriseLocal) {
    throw new Error('Birth time and sunrise time are required for Praanapada calculation');
  }

  const minutesFromSunrise = (birthDateLocal.getTime() - sunriseLocal.getTime()) / (60 * 1000);
  const palas = (minutesFromSunrise / 60) * PALA_PER_HOUR;

  // Add palas directly in degrees as per BPHS convention (1 pala = 24 minutes = 0.4 hours => here consistent with PALA_PER_HOUR)
  const praanapadaLongitude = normalizeDegrees(sunLongitudeDeg + palas);
  const degreeInSign = praanapadaLongitude % 30;

  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const signIndex = Math.floor(praanapadaLongitude / 30) % 12;

  return {
    longitude: praanapadaLongitude,
    sign: signs[signIndex],
    degree: degreeInSign,
    palas
  };
}


