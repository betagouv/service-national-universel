import React from "react";
import { COHORT_TYPE, CohortDto } from "snu-lib";

import { CleSettings } from "./components/CleSettings";
import InfosGenerales from "./components/general/InfosGenerales";
import InfosInscriptions from "./components/phase0/InfosInscriptions";
import InfosPreparation from "./components/phase1/InfosPreparation";
import InfosAffectations from "./components/InfosAffectation";

interface GeneralTabProps {
  cohort: CohortDto;
  readOnly: boolean;
}

export default function GeneralTab({ cohort, readOnly }: GeneralTabProps) {
  return (
    <div className="flex w-full flex-col gap-8">
      <InfosGenerales cohort={cohort} readOnly={readOnly} />
      <InfosInscriptions cohort={cohort} readOnly={readOnly} />
      <InfosPreparation cohort={cohort} readOnly={readOnly} />
      <InfosAffectations cohort={cohort} readOnly={readOnly} />
      {cohort.type === COHORT_TYPE.CLE && <CleSettings cohort={cohort} readOnly={readOnly} />}
    </div>
  );
}
