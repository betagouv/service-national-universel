import React from "react";
import { Controller } from "react-hook-form";
import { CohortDto, COHORT_TYPE, FeatureFlagName } from "snu-lib";
import SimpleToggle from "@/components/ui/forms/dateForm/SimpleToggle";
type ToggleItem = {
  label: string;
  value: boolean;
  field: keyof CohortDto;
};

interface ManualInscriptionCLETogglesProps {
  cohort: CohortDto;
  control: any;
  isLoading: boolean;
  readOnly: boolean;
  user: any;
}

const renderManualInscriptionCLEToggles = ({ cohort, control, isLoading, readOnly, user }: ManualInscriptionCLETogglesProps) => {
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
  ];

  if (!user.featureFlags?.[FeatureFlagName.INSCRIPTION_EN_MASSE_CLASSE]) {
    toggles.push(
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
    );
  }

  return (
    <>
      {toggles.map((toggle) => (
        <Controller
          name={toggle.field}
          key={toggle.field}
          control={control}
          render={({ field }) => <SimpleToggle label={toggle.label} value={field.value} disabled={isLoading || readOnly} onChange={(value) => field.onChange(value)} />}
        />
      ))}
    </>
  );
};

const renderManualInscriptionHTSToggles = ({ cohort, control, isLoading, readOnly }: ManualInscriptionCLETogglesProps) => {
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
  ];
  return (
    <>
      {toggles.map((toggle) => (
        <Controller
          name={toggle.field}
          key={toggle.field}
          control={control}
          render={({ field }) => <SimpleToggle label={toggle.label} value={field.value} disabled={isLoading || readOnly} onChange={(value) => field.onChange(value)} />}
        />
      ))}
    </>
  );
};

export const getManualInscriptionTogglesByCohortType = ({ cohort, control, isLoading, readOnly, user }: ManualInscriptionCLETogglesProps) => {
  const cohortType = cohort.type as (typeof COHORT_TYPE)[keyof typeof COHORT_TYPE];
  switch (cohortType) {
    case COHORT_TYPE.CLE:
      return renderManualInscriptionCLEToggles({ cohort, control, isLoading, readOnly, user });
    case COHORT_TYPE.VOLONTAIRE:
      return renderManualInscriptionHTSToggles({ cohort, control, isLoading, readOnly, user });
    default:
      return null;
  }
};
