const passwordValidator = require("password-validator");

// Même politique que l'API v1 (`api/src/utils/index.ts`) : 6 caractères sans complexité ne protégeaient pas
// les comptes agents, qui lisent les données des volontaires (L52).
function validatePassword(password) {
  const schema = new passwordValidator();
  schema
    .is()
    .min(12) // Minimum length 12
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .digits() // Must have digits
    .has()
    .symbols(); // Must have symbols
  return schema.validate(password);
}

module.exports = { validatePassword };
