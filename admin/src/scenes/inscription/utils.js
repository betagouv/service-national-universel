export const translate = (value) => {
  switch (value) {
    case "male":
      return "Homme";
    case "female":
      return "Femme";
    case "true":
      return "Oui";
    case "false":
      return "Non";
    case "father":
      return "Père";
    case "mother":
      return "Mère";
    case "representant":
      return "Représentant légal";

    default:
      return "";
  }
};
