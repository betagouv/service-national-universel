import React, { useMemo } from "react";
import { MdInfoOutline } from "react-icons/md";

import { COHORT_TYPE, CohortDto, FeatureFlagName } from "snu-lib";
import { Tooltip } from "@snu/ds/admin";

import { getManualInscriptionTogglesByCohortType } from "./getManualInscriptionTogglesByCohortType";
import { useSelector } from "react-redux";
import { AuthState } from "@/redux/auth/reducer";

interface ManualInscriptionSettingsProps {
  cohort: CohortDto;
  control: any;
  isLoading: boolean;
  readOnly: boolean;
}

export const ManualInscriptionSettings: React.FC<ManualInscriptionSettingsProps> = ({ cohort, control, isLoading, readOnly }) => {
  const user = useSelector((state: AuthState) => state.Auth.user);

  const renderedManualInscriptionTogglesByCohortType = useMemo(
    () => getManualInscriptionTogglesByCohortType({ cohort, control, isLoading, readOnly, user }),
    // Disabled exhaustive-deps because we don't want to re-render the component when the all props data changes only specific fields should trigger a re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      cohort.type,
      cohort.inscriptionOpenForReferentRegion,
      cohort.inscriptionOpenForReferentDepartment,
      cohort.inscriptionOpenForReferentClasse,
      cohort.inscriptionOpenForAdministrateurCle,
      user.featureFlags?.[FeatureFlagName.INSCRIPTION_EN_MASSE_CLASSE],
      isLoading,
      readOnly,
    ],
  );

  // If no rendered toggles according to the cohort type, we don't display anything
  if (!renderedManualInscriptionTogglesByCohortType) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <p className="text-gray-900  text-xs font-medium">
          {cohort.type === COHORT_TYPE.CLE ? "Inscriptions manuelles" : "Inscriptions manuelles après la fermeture des inscriptions des volontaires"}
        </p>
        <Tooltip title="Ouverture et fermeture pour les utilisateurs de la possibilité d’inscrire manuellement des jeunes">
          <MdInfoOutline size={20} className="text-gray-400" />
        </Tooltip>
      </div>
      {renderedManualInscriptionTogglesByCohortType}
    </div>
  );
};
