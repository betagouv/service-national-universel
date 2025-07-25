import api, { setJwtToken } from "@/services/api";
import plausibleEvent from "@/services/plausible";
import store from "@/redux/store";
import { setUser } from "@/redux/auth/actions";
import { getImpersonationChannel } from "@/utils/broadcastChannel";

export const signinAs = async (type: "referent" | "young", userId: string) => {
  const { ok, data, token } = await api.post(`/referent/signin_as/${type}/${userId}`);
  if (!ok) throw new Error("Une erreur est survenue lors de la connexion");
  if (!data) throw new Error("Erreur : aucune données d'utilisateur");
  if (!token) throw new Error("Erreur : aucun token");
  if (type === "referent") {
    setJwtToken(token);
    getImpersonationChannel().postMessage({ action: "impersonation_started" });
  }

  return data;
};

export const restorePreviousSignin = async () => {
  try {
    const { ok, data, token } = await api.get("/referent/restore_signin");
    if (!ok || !data || !token) throw new Error("Une erreur est survenue lors de la reconnexion");

    setJwtToken(token);
    store.dispatch(setUser(data));
    getImpersonationChannel().postMessage({ action: "impersonation_stopped" });
    plausibleEvent("Admin - Reprendre sa place");
  } catch (e) {
    console.log(e);
  }
};
