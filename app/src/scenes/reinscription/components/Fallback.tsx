import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import React from "react";
import { Link } from "react-router-dom";

export default function Fallback() {
  return (
    <DSFRLayout title="Reinscription du volontaire">
      <DSFRContainer title="Réinscription indisponible">
        <p>Vous n'avez actuellement pas accès à la réinscription.</p>
        <p>
          Pas de panique, <Link to="/">cliquez ici pour reprendre votre parcours</Link>.
        </p>
        <br />
      </DSFRContainer>
    </DSFRLayout>
  );
}
