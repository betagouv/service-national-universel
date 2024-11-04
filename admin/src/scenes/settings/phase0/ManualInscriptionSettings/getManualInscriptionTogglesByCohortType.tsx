import { CohortDto, COHORT_TYPE, ROLES } from "snu-lib";

import { renderManualInscriptionCLEToggles } from "./renderManualInscriptionCLEToggles";
import { renderManualInscriptionHTSToggles } from "./renderManualInscriptionHTSToggles";

type ToggleItem = {
  label: string;
  field: keyof CohortDto;
  role: string;
};

interface BaseProps {
  cohort: CohortDto;
  handleToggleChange: (field: keyof CohortDto) => void;
  isLoading: boolean;
  readOnly: boolean;
}

export interface RenderManualInscriptionTogglesProps extends BaseProps {
  toggles: ToggleItem[];
}

export interface RenderManualInscriptionHTSTogglesProps extends RenderManualInscriptionTogglesProps {
  handleOffsetChange: (field: keyof CohortDto, value: number) => void;
}

type CLEProps = BaseProps & { cohort: CohortDto & { type: typeof COHORT_TYPE.CLE } };
type HTSProps = BaseProps & {
  cohort: CohortDto & { type: typeof COHORT_TYPE.VOLONTAIRE };
  handleOffsetChange: (field: keyof CohortDto, value: number) => void;
};

export type ManualInscriptionTogglesByCohortTypeProps = CLEProps | HTSProps;

const togglesCommon: ToggleItem[] = [
  {
    label: "Référents régionaux",
    field: "inscriptionOpenForReferentRegion",
    role: ROLES.REFERENT_REGION,
  },
  {
    label: "Référents départementaux",
    field: "inscriptionOpenForReferentDepartment",
    role: ROLES.REFERENT_DEPARTMENT,
  },
];

const togglesCLE: ToggleItem[] = [
  {
    label: "Référents de classe",
    field: "inscriptionOpenForReferentClasse",
    role: ROLES.REFERENT_CLASSE,
  },
  {
    label: "Administrateurs CLE",
    field: "inscriptionOpenForAdministrateurCle",
    role: ROLES.ADMINISTRATEUR_CLE,
  },
];

export const getManualInscriptionTogglesByCohortType = (props: ManualInscriptionTogglesByCohortTypeProps) => {
  switch (props.cohort.type) {
    case COHORT_TYPE.CLE:
      return renderManualInscriptionCLEToggles({
        ...props,
        toggles: [...togglesCLE, ...togglesCommon],
      });
    case COHORT_TYPE.VOLONTAIRE:
      return renderManualInscriptionHTSToggles({
        ...(props as HTSProps),
        toggles: togglesCommon,
      });
    default:
      return null;
  }
};
