export const PHASE_INSCRIPTION = "INSCRIPTION";
export const PHASE_1 = "PHASE_1";
export const PHASE_2 = "PHASE_2";
export const PHASE_3 = "PHASE_3";

export const phaseOptions = [
  { value: PHASE_INSCRIPTION, label: "Inscription" },
  { value: PHASE_1, label: "Phase 1" },
  { value: PHASE_2, label: "Phase 2" },
  { value: PHASE_3, label: "Phase 3" },
  { value: "", label: "Note interne générale" },
];

export const getPhaseLabel = (phase) => {
  return phaseOptions.find((option) => option.value === phase)?.label;
};
