import api from "@/services/api";
import store from "@/redux/store";
import { setUser } from "@/redux/auth/actions";
import { getImpersonationChannel } from "@/utils/broadcastChannel";

export const signinAs = async (type: "referent" | "young", userId: string) => {
  // Le jeton du compte emprunté est posé en cookie httpOnly par l'API, jamais renvoyé au JavaScript (FM16).
  const { ok, data } = await api.post(`/referent/signin_as/${type}/${userId}`);
  if (!ok) throw new Error("Une erreur est survenue lors de la connexion");
  if (!data) throw new Error("Erreur : aucune données d'utilisateur");
  if (type === "referent") {
    getImpersonationChannel().postMessage({ action: "impersonation_started" });
  }

  return data;
};

export const restorePreviousSignin = async () => {
  try {
    const { ok, data } = await api.get("/referent/restore_signin");
    if (!ok || !data) throw new Error("Une erreur est survenue lors de la reconnexion");

    store.dispatch(setUser(data));
    getImpersonationChannel().postMessage({ action: "impersonation_stopped" });
  } catch (e) {
    console.log(e);
  }
};
