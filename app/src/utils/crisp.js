import { adminURL } from "../config";
import { translate } from "../utils";

export function setCrispUserData(young) {
  if (!young) return;
  // feed crisp chat with useful user's info
  window.$crisp.push(["set", "session:data", ["cohorte", young.cohort]]);
  window.$crisp.push(["set", "session:data", ["departement", young.department]]);
  window.$crisp.push(["set", "session:data", ["region", young.region]]);
  window.$crisp.push(["set", "session:data", ["profil", `${adminURL}/volontaire/${young._id}`]]);
  window.$crisp.push(["set", "session:data", ["statut_general", translate(young.status)]]);
  window.$crisp.push(["set", "session:data", ["statut_phase_1", translate(young.statusPhase1)]]);
  window.$crisp.push(["set", "session:data", ["statut_phase_2", translate(young.statusPhase2)]]);
  window.$crisp.push(["set", "session:data", ["statut_phase_3", translate(young.statusPhase3)]]);
}
