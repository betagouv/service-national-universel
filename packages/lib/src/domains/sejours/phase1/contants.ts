const TRANSPORT_MODES = {
  TRAIN: "train",
  BUS: "bus",
  FUSEE: "fusée",
  AVION: "avion",
} as const;

const TRANSPORT_CONVOCATION_SUBTRACT_MINUTES_DEFAULT = 30;
const TRANSPORT_CONVOCATION_SUBTRACT_MINUTES = {
  [TRANSPORT_MODES.TRAIN]: 90,
  [TRANSPORT_MODES.BUS]: TRANSPORT_CONVOCATION_SUBTRACT_MINUTES_DEFAULT,
  [TRANSPORT_MODES.FUSEE]: TRANSPORT_CONVOCATION_SUBTRACT_MINUTES_DEFAULT,
  [TRANSPORT_MODES.AVION]: TRANSPORT_CONVOCATION_SUBTRACT_MINUTES_DEFAULT,
} as const;

const TRANSPORT_MODES_LIST = Object.values(TRANSPORT_MODES);

const DEPART_SEJOUR_MOTIFS = {
  EXCLUSION: "Exclusion",
  FORCE_MAJEURE: "Cas de force majeure pour le volontaire",
  FORCE_MAJEURE_OTHER: "Cas de force majeure (Fermeture du centre, éviction pour raison sanitaitre, rapatriement médical, convocation judiciaire, etc.)",
  ANNULATION: "Annulation du séjour ou mesure d’éviction sanitaire",
  AUTRE: "Autre",
} as const;

const DEPART_SEJOUR_MOTIFS_LIST = Object.values(DEPART_SEJOUR_MOTIFS);
const DEPART_SEJOUR_MOTIFS_NOT_DONE = [DEPART_SEJOUR_MOTIFS.EXCLUSION, DEPART_SEJOUR_MOTIFS.FORCE_MAJEURE, DEPART_SEJOUR_MOTIFS.FORCE_MAJEURE_OTHER, DEPART_SEJOUR_MOTIFS.AUTRE];
export type DepartSejourMotif = typeof DEPART_SEJOUR_MOTIFS_LIST[number];

export { TRANSPORT_MODES_LIST, TRANSPORT_MODES, TRANSPORT_CONVOCATION_SUBTRACT_MINUTES_DEFAULT, TRANSPORT_CONVOCATION_SUBTRACT_MINUTES, DEPART_SEJOUR_MOTIFS, DEPART_SEJOUR_MOTIFS_LIST, DEPART_SEJOUR_MOTIFS_NOT_DONE };
