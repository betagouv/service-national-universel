import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import { getCohort } from "@/utils/cohorts";
import React from "react";
import { YOUNG_STATUS } from "snu-lib";
import { getCohortPeriod } from "snu-lib";

export default function InscriptionClosed({ young, isCLE }) {
  const statusWording = (young, isCLE) => {
    if (isCLE) {
      if (young.status === YOUNG_STATUS.IN_PROGRESS) {
        return "Votre inscription n'a pas été complétée à temps.";
      }
    } else if (!isCLE && young.status === YOUNG_STATUS.IN_PROGRESS) {
      return "Vous n'avez pas complété votre dossier d'inscription à temps.";
    }
  };

  const statusTitle = (isCLE) => {
    if (isCLE) {
      return "Inscription de l’élève";
    } else {
      return "Inscription au séjour de cohésion";
    }
  };
  console.log(statusTitle(isCLE), statusWording(young, isCLE));
  return (
    <DSFRLayout title={statusTitle(isCLE)}>
      <DSFRContainer title={statusWording(young, isCLE)}>
        {!isCLE ? (
          <p className="mb-16">Les inscriptions pour le séjour {getCohortPeriod(getCohort(young?.cohort))} sont clôturées. Vous ne pourrez donc pas participer au séjour.</p>
        ) : (
          <p>Les inscriptions dans le cadre des classes engagées ont été clôturées pour l'année scolaire 2023-2024.</p>
        )}
      </DSFRContainer>
    </DSFRLayout>
  );
}
