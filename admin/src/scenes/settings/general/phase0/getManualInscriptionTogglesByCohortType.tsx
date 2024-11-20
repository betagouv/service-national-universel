import React from "react";
import { CohortDto, COHORT_TYPE } from "snu-lib";
import SimpleToggle from "@/components/ui/forms/dateForm/SimpleToggle";

type ToggleItem = {
  label: string;
  value: boolean;
  field: keyof CohortDto;
};

interface ManualInscriptionCLETogglesProps {
  cohort: CohortDto;
  handleToggleChange: (field: keyof CohortDto) => void;
  isLoading: boolean;
  readOnly: boolean;
}

const renderManualInscriptionCLEToggles = ({ cohort, handleToggleChange, isLoading, readOnly }: ManualInscriptionCLETogglesProps) => {
  const toggles: ToggleItem[] = [
    {
      label: "Référents régionaux",
      value: cohort.inscriptionOpenForReferentRegion ?? false,
      field: "inscriptionOpenForReferentRegion" as keyof CohortDto,
    },
    {
      label: "Référents départementaux",
      value: cohort.inscriptionOpenForReferentDepartment ?? false,
      field: "inscriptionOpenForReferentDepartment" as keyof CohortDto,
    },
    {
      label: "Référents de classe",
      value: cohort.inscriptionOpenForReferentClasse ?? false,
      field: "inscriptionOpenForReferentClasse" as keyof CohortDto,
    },
    {
      label: "Administrateurs CLE",
      value: cohort.inscriptionOpenForAdministrateurCle ?? false,
      field: "inscriptionOpenForAdministrateurCle" as keyof CohortDto,
    },
  ];

  return (
    <>
      {toggles.map((toggle) => (
        <SimpleToggle key={toggle.field} label={toggle.label} value={toggle.value} disabled={isLoading || readOnly} onChange={() => handleToggleChange(toggle.field)} />
      ))}
    </>
  );
};

export const getManualInscriptionTogglesByCohortType = ({ cohort, handleToggleChange, isLoading, readOnly }: ManualInscriptionCLETogglesProps) => {
  const cohortType = cohort.type as (typeof COHORT_TYPE)[keyof typeof COHORT_TYPE];
  switch (cohortType) {
    case COHORT_TYPE.CLE:
      return renderManualInscriptionCLEToggles({ cohort, handleToggleChange, isLoading, readOnly });
    default:
      return null;
  }
};
