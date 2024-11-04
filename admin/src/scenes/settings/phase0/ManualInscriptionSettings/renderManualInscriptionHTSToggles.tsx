import React from "react";
import { CohortDto, ROLES } from "snu-lib";
import { Select } from "@snu/ds/admin";
import SimpleToggle from "@/components/ui/forms/dateForm/SimpleToggle";
import { RenderManualInscriptionHTSTogglesProps } from "./getManualInscriptionTogglesByCohortType";

import dayjs from "@/utils/dayjs.utils";

interface HTSInscriptionDates {
  startDate: string;
  endDate: string;
}

export function calculateHTSInscriptionDates(cohort: CohortDto, role: string): HTSInscriptionDates | null {
  const inscriptionStartDate = dayjs.utc(cohort.inscriptionStartDate);
  const instructionEndDate = dayjs.utc(cohort.instructionEndDate);

  const calculateDates = (startOffset: number = 0, endOffset: number = 0): HTSInscriptionDates => ({
    startDate: inscriptionStartDate.add(startOffset, "day").format("DD/MM/YYYY HH:mm"),
    endDate: instructionEndDate.add(endOffset, "day").format("DD/MM/YYYY HH:mm"),
  });

  if (role === ROLES.REFERENT_REGION) {
    return calculateDates(cohort.inscriptionHTSStartOffsetForReferentRegion, cohort.inscriptionHTSEndOffsetForReferentRegion);
  } else if (role === ROLES.REFERENT_DEPARTMENT) {
    return calculateDates(cohort.inscriptionHTSStartOffsetForReferentDepartment, cohort.inscriptionHTSEndOffsetForReferentDepartment);
  }

  return null;
}

export const getInscriptionHTSOffsetsByUserRole = (role: string, cohort: CohortDto): { startOffset: number | null; endOffset: number | null } => {
  switch (role) {
    case ROLES.REFERENT_REGION:
      return {
        startOffset: cohort.inscriptionHTSStartOffsetForReferentRegion ?? 0,
        endOffset: cohort.inscriptionHTSEndOffsetForReferentRegion ?? 0,
      };
    case ROLES.REFERENT_DEPARTMENT:
      return {
        startOffset: cohort.inscriptionHTSStartOffsetForReferentDepartment ?? 0,
        endOffset: cohort.inscriptionHTSEndOffsetForReferentDepartment ?? 0,
      };
    default:
      return {
        startOffset: null,
        endOffset: null,
      };
  }
};

const getOffsetFieldNames = (role: string): { startField: keyof CohortDto; endField: keyof CohortDto } => {
  const roleType = role === ROLES.REFERENT_REGION ? "ReferentRegion" : "ReferentDepartment";
  return {
    startField: `inscriptionHTSStartOffsetFor${roleType}` as keyof CohortDto,
    endField: `inscriptionHTSEndOffsetFor${roleType}` as keyof CohortDto,
  };
};

export const renderManualInscriptionHTSToggles = ({ cohort, handleToggleChange, handleOffsetChange, isLoading, readOnly, toggles }: RenderManualInscriptionHTSTogglesProps) => {
  const dateOffsetOptions = Array.from({ length: 21 }, (_, i) => ({ value: i - 5, label: `${i - 5}` }));

  return (
    <>
      {toggles.map((toggle) => {
        const field = toggle.field as keyof CohortDto;
        const toggleValue = cohort[field] as boolean;
        const { startOffset, endOffset } = getInscriptionHTSOffsetsByUserRole(toggle.role as string, cohort);
        const htsInscriptionDatesCalculation = calculateHTSInscriptionDates(cohort, toggle.role as string);
        const { startField: inscriptionHTSStartOffsetField, endField: inscriptionHTSEndOffsetField } = getOffsetFieldNames(toggle.role);
        return (
          <div key={field} className="flex flex-col gap-2 rounded-lg bg-gray-100">
            <SimpleToggle label={toggle.label} value={toggleValue ?? false} disabled={isLoading || readOnly} onChange={() => handleToggleChange(field)} />
            {toggleValue && (
              <div className="flex w-full gap-4 px-3 pb-3">
                <div className="flex flex-col gap-2 w-full">
                  <Select
                    label="Ouverture des inscriptions"
                    options={dateOffsetOptions}
                    value={(startOffset ?? 0).toString()}
                    onChange={({ value }) => handleOffsetChange(inscriptionHTSStartOffsetField, value)}
                    disabled={isLoading || readOnly}
                    isClearable={false}
                    isSearchable={false}
                    closeMenuOnSelect
                    hideSelectedOptions
                    placeholder={`J${(startOffset ?? 0) >= 0 ? "+" : ""}${startOffset ?? 0}`}
                  />
                  {htsInscriptionDatesCalculation && <span className="text-gray-500">Début: {htsInscriptionDatesCalculation.startDate}</span>}
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <Select
                    label="Fermeture des instructions"
                    options={dateOffsetOptions}
                    value={(endOffset ?? 0).toString()}
                    onChange={({ value }) => handleOffsetChange(inscriptionHTSEndOffsetField, value)}
                    disabled={isLoading || readOnly}
                    isClearable={false}
                    isSearchable={false}
                    isMulti={false}
                    closeMenuOnSelect
                    hideSelectedOptions
                    placeholder={`J${(endOffset ?? 0) >= 0 ? "+" : ""}${endOffset ?? 0}`}
                  />
                  {htsInscriptionDatesCalculation && <span className="text-gray-500">Fin: {htsInscriptionDatesCalculation.endDate}</span>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};
