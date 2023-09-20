import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import React from "react";
import { useSelector } from "react-redux";
import { translateCohort } from "snu-lib";

export default function InscriptionClosed() {
  const young = useSelector((state) => state.Auth.young);
  return (
    <DSFRLayout title="Inscription au séjour de cohésion">
      <DSFRContainer title="Vous n'avez pas complété votre dossier d'inscription à temps.">
        <p className="mb-16">Les inscriptions pour le séjour {translateCohort(young?.cohort)} sont clôturées. Vous ne pourrez donc pas participer au séjour.</p>
      </DSFRContainer>
    </DSFRLayout>
  );
}
