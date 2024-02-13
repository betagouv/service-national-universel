import api from "@/services/api";
import store from "@/redux/store";
import { setUser, setPreviousSignin } from "@/redux/auth/actions";

const signinAs = async (type, userId) => {
  const { ok, data, token } = await api.post(`/referent/signin_as/${type}/${userId}`);
  if (!ok) throw new Error("Une erreur est survenue lors de la connexion");
  if (!data) throw new Error("Erreur : aucune données d'utilisateur");
  if (!token) throw new Error("Erreur : aucun token");

  const previousToken = api.getToken();
  store.dispatch(setPreviousSignin(previousToken));
  api.setToken(token);

  return data;
};

const restorePreviousSignin = async () => {
  const { previousSigninToken } = store.getState().Auth;
  if (!previousSigninToken) throw new Error("Aucune connexion précédente");

  try {
    const { ok, data, token } = await api.post("/referent/restore_signin", { jwt: previousSigninToken });
    if (!ok || !data || !token) throw new Error("Une erreur est survenue lors de la reconnexion");

    api.setToken(token);
    store.dispatch(setPreviousSignin(null));
    store.dispatch(setUser(data));
  } catch (e) {
    console.log(e);
  }
};

export { signinAs, restorePreviousSignin };
