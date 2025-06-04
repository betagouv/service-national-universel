export const validateNoSpecialChars = (value: string) => {
  const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ1-9 \-']+$/;
  return regex.test(value);
};
