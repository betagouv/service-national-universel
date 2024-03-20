import React from "react";
import SNU from "@/assets/logo-snu.png";
import { Footer as DSFRFooter } from "@codegouvfr/react-dsfr/Footer";

export default function Footer() {
  return (
    <DSFRFooter
      accessibility="partially compliant"
      contentDescription="Le Service national universel s’adresse à tous les jeunes de 15 à 17 ans qui souhaitent vivre une belle expérience collective, se rendre utile aux autres, créer des liens
          forts et se découvrir un talent pour l’engagement !"
      operatorLogo={{
        alt: "Logo Service National Universel",
        imgUrl: `${SNU}`,
        orientation: "vertical",
      }}
    />
  );
}
