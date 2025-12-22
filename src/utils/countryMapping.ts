// Country mapping utility
// Maps between country codes (used in database) and full names (used in UI)

export const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  "BR": "Brazil",
  "RU": "Russia",
  "IN": "India",
  "CN": "China",
  "ZA": "South Africa",
  "EG": "Egypt",
  "ET": "Ethiopia",
  "IR": "Iran",
  "AE": "UAE",
  "US": "USA",
  "GB": "UK",
  "DE": "Germany",
  "FR": "France",
  "JP": "Japan",
  "CA": "Canada",
  "AU": "Australia",
};

export const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "Brazil": "BR",
  "Russia": "RU",
  "India": "IN",
  "China": "CN",
  "South Africa": "ZA",
  "Egypt": "EG",
  "Ethiopia": "ET",
  "Iran": "IR",
  "UAE": "AE",
  "USA": "US",
  "UK": "GB",
  "Germany": "DE",
  "France": "FR",
  "Japan": "JP",
  "Canada": "CA",
  "Australia": "AU",
};

/**
 * Convert country names to codes for database queries
 */
export function countryNamesToCodes(countryNames: string[]): string[] {
  return countryNames.map(name => COUNTRY_NAME_TO_CODE[name] || name).filter(Boolean);
}

/**
 * Convert country codes to names for display
 */
export function countryCodesToNames(countryCodes: string[]): string[] {
  return countryCodes.map(code => COUNTRY_CODE_TO_NAME[code] || code).filter(Boolean);
}

/**
 * Get all possible country values (both code and name) for a given country name
 */
export function getCountryVariants(countryName: string): string[] {
  const code = COUNTRY_NAME_TO_CODE[countryName];
  return code ? [countryName, code] : [countryName];
}

/**
 * Get all possible country values for multiple country names
 */
export function getAllCountryVariants(countryNames: string[]): string[] {
  const variants = new Set<string>();
  countryNames.forEach(name => {
    getCountryVariants(name).forEach(variant => variants.add(variant));
  });
  return Array.from(variants);
}





