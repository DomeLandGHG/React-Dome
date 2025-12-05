// American number formatting function with scientific notation for large numbers
export const formatNumberGerman = (num: number, decimalPlaces?: number): string => {
  // Above 100 million: Scientific notation
  if (num >= 100_000_000) {
    return num.toExponential(2); // e.g., 1.23e+8
  }
  
  // Below 100 million: American formatting with commas
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces ?? (num >= 1000 ? 0 : 2)
  });
};