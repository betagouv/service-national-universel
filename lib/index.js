export * from './date';
export * from './constants';

export const isInRuralArea = (v) => {
  if (!v.populationDensity) return null;
  return ['PEU DENSE', 'TRES PEU DENSE'].includes(v.populationDensity)
    ? 'true'
    : 'false';
};
