import PasswordValidator from "password-validator";

export const validatePassword = ({ value }) => {
  if (!value) return "Ce champ est obligatoire.";
  const schema = new PasswordValidator();
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

  if (!schema.validate(value)) {
    return "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole";
  }
};
