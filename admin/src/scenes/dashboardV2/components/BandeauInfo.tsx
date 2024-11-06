import React from "react";
import InfoMessage from "./ui/InfoMessage";

export default function BandeauInfo() {
  return (
    <InfoMessage
      title="Vous constatez une différence entre les résultats ?"
      message="Les jeunes scolarisés dans votre département sont comptabilisés dans les données du Tableau de Bord. La disparité entre les chiffres affichés et la liste que vous obtenez
  en cliquant provient des jeunes scolarisés dans votre département mais domiciliés dans un autre département."
      className="mb-6"
    />
  );
}
