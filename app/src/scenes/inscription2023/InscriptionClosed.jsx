import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import useCohort from "@/services/useCohort";
import { SignupButtons } from "@snu/ds/dsfr";
import React from "react";
import { useHistory } from "react-router-dom";
import { YOUNG_STATUS } from "snu-lib";

export default function InscriptionClosed({ young, isCLE }) {
  const history = useHistory();
  const { cohortDateString } = useCohort();
  const statusWording = (young, isCLE) => {
    if (isCLE) {
      if ([YOUNG_STATUS.REINSCRIPTION, YOUNG_STATUS.IN_PROGRESS].includes(young.status)) {
        return "Votre inscription n'a pas été complétée à temps";
      }
    } else if (!isCLE && [YOUNG_STATUS.REINSCRIPTION, YOUNG_STATUS.IN_PROGRESS].includes(young.status)) {
      return "Vous n'avez pas complété votre dossier d'inscription à temps";
    }
  };

  const statusTitle = (isCLE) => {
    if (isCLE) {
      return "Inscription de l’élève";
    } else {
      return "Inscription au séjour de cohésion";
    }
  };
  return (
    <DSFRLayout title={statusTitle(isCLE)}>
      <DSFRContainer title={statusWording(young, isCLE)}>
        {!isCLE ? (
          <p>Les inscriptions pour le séjour {cohortDateString} sont clôturées. Vous ne pourrez donc pas participer au séjour.</p>
        ) : (
          <p>Les inscriptions dans le cadre des classes engagées ont été clôturées.</p>
        )}
        <p>
          Si vous restez éligible, <strong>vous serez basculé(e) automatiquement sur le prochain séjour</strong> ou vous pouvez en choisir un dès maintenant.
        </p>
        <SignupButtons onClickNext={() => history.push("/changer-de-sejour")} labelNext="Choisir un nouveau séjour" />
      </DSFRContainer>
    </DSFRLayout>
  );
}
