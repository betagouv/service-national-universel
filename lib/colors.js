const colors = {
  purple: "#5145cd",
  blue: "#2563EB",
  transPurple: "#5145cd66",
  darkPurple: "#382F79",
  green: "#6CC763",
  darkGreen: "#1C7713",
  red: "#BE3B12",
  lightOrange: "#ffa987",
  orange: "#FE7B52",
  yellow: "#FEB951",
  pink: "#F8A9AD",
  lightGold: "#d9bb71",
  extraLightGrey: "#fafafa",
  lightGrey: "#d7d7d7",
  grey: "#6e757c",
  lightBlueGrey: "#e6ebfa",
  darkBlue: "#00008b",
  black: "#111111",
};

const PHASE_STATUS_COLOR = {
  VALIDATED: colors.green,
  DONE: colors.green,
  CANCEL: colors.orange,
  EXEMPTED: colors.orange,
  IN_PROGRESS: colors.purple,
  AFFECTED: colors.purple,
  WITHDRAWN: colors.red,
  WAITING_ACCEPTATION: colors.yellow,
};

const APPLICATION_STATUS_COLORS = {
  WAITING_VALIDATION: colors.orange,
  WAITING_VERIFICATION: colors.orange,
  WAITING_ACCEPTATION: colors.yellow,
  VALIDATED: colors.green,
  DONE: colors.darkGreen,
  REFUSED: colors.pink,
  CANCEL: colors.lightOrange,
  IN_PROGRESS: colors.darkPurple,
  ABANDON: colors.red,
};
const EQUIVALENCE_STATUS_COLORS = {
  WAITING_VERIFICATION: colors.orange,
  WAITING_CORRECTION: colors.yellow,
  VALIDATED: colors.green,
  REFUSED: colors.pink,
};

const YOUNG_STATUS_COLORS = {
  WAITING_VALIDATION: colors.orange,
  WAITING_CORRECTION: colors.yellow,
  VALIDATED: colors.green,
  REFUSED: colors.pink,
  IN_PROGRESS: colors.darkPurple,
  WITHDRAWN: colors.lightGrey,
  WAITING_REALISATION: colors.orange,
  AFFECTED: colors.darkPurple,
  WAITING_AFFECTATION: colors.yellow,
  WAITING_ACCEPTATION: colors.yellow,
  NOT_ELIGIBLE: colors.orange,
  CANCEL: colors.orange,
  EXEMPTED: colors.orange,
  DONE: colors.green,
  NOT_DONE: colors.red,
  WAITING_LIST: colors.lightOrange,
  DELETED: colors.lightGrey,
  ABANDONED: colors.red,
  NOT_AUTORISED: colors.black,
};

const MISSION_STATUS_COLORS = {
  WAITING_VALIDATION: colors.orange,
  WAITING_CORRECTION: colors.yellow,
  VALIDATED: colors.green,
  DRAFT: colors.lightGold,
  REFUSED: colors.pink,
  CANCEL: colors.lightOrange,
  ARCHIVED: colors.lightGrey,
};

const STRUCTURE_STATUS_COLORS = {
  WAITING_VALIDATION: colors.orange,
  WAITING_CORRECTION: colors.yellow,
  VALIDATED: colors.green,
  DRAFT: colors.lightGold,
};

const CONTRACT_STATUS_COLORS = {
  DRAFT: colors.yellow,
  SENT: colors.orange,
  VALIDATED: colors.green,
};

module.exports = {
  PHASE_STATUS_COLOR,
  APPLICATION_STATUS_COLORS,
  EQUIVALENCE_STATUS_COLORS,
  YOUNG_STATUS_COLORS,
  MISSION_STATUS_COLORS,
  STRUCTURE_STATUS_COLORS,
  CONTRACT_STATUS_COLORS,
  colors,
};
