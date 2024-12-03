import { useCallback, useMemo } from "react";
import { CohortDto } from "snu-lib";
import { getManualInscriptionTogglesByCohortType } from "./getManualInscriptionTogglesByCohortType";
import ReactTooltip from "react-tooltip";
import React from "react";
import { MdInfoOutline } from "react-icons/md";

interface ManualInscriptionSettingsProps {
  cohort: CohortDto;
  setCohort: React.Dispatch<React.SetStateAction<CohortDto>>;
  isLoading: boolean;
  readOnly: boolean;
}

export const ManualInscriptionSettings: React.FC<ManualInscriptionSettingsProps> = ({ cohort, setCohort, isLoading, readOnly }) => {
  const handleToggleChange = useCallback(
    (field: keyof CohortDto) => {
      setCohort((prev) => ({ ...prev, [field]: !prev[field] }));
    },
    [setCohort],
  );

  const renderedManualInscriptionTogglesByCohortType = useMemo(
    () => getManualInscriptionTogglesByCohortType({ cohort, handleToggleChange, isLoading, readOnly }),
    // Disabled exhaustive-deps because we don't want to re-render the component when the all props data changes only specific fields should trigger a re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      cohort.type,
      cohort.inscriptionOpenForReferentRegion,
      cohort.inscriptionOpenForReferentDepartment,
      cohort.inscriptionOpenForReferentClasse,
      cohort.inscriptionOpenForAdministrateurCle,
      handleToggleChange,
      isLoading,
      readOnly,
    ],
  );

  // If no rendered toggles according to the cohort type, we don't display anything
  if (!renderedManualInscriptionTogglesByCohortType) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <p className="text-gray-900  text-xs font-medium">Inscriptions manuelles</p>
        <MdInfoOutline data-tip data-for="inscriptions" className="text-gray-400 h-5 w-5 cursor-pointer" />
        <ReactTooltip id="inscriptions" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md rounded-[6px]">
          <p className=" text-left text-gray-600 text-xs w-[275px] !px-2 !py-1.5 list-outside">
            Ouverture et fermeture pour les utilisateurs de la possibilité d’inscrire manuellement des jeunes.
          </p>
        </ReactTooltip>
      </div>
      {renderedManualInscriptionTogglesByCohortType}
    </div>
  );
};
