// German number formatting function with scientific notation for large numbers
export const formatNumberGerman = (num: number, decimalPlaces?: number): string => {
  // Ab 100 Millionen: Wissenschaftliche Notation
  if (num >= 100_000_000) {
    return num.toExponential(2).replace('.', ',');
  }
  
  // Unter 100 Millionen: Normale deutsche Formatierung mit Punkten
  return num.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces ?? (num >= 1000 ? 0 : 2)
  });
};