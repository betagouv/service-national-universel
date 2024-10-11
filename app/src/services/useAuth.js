import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { setYoung } from "../redux/auth/actions";
import { toastr } from "react-redux-toastr";
import { logoutYoung } from "./young.service";
import { YOUNG_SOURCE, YOUNG_STATUS } from "snu-lib";
import { cohortsInit } from "@/utils/cohorts";
import { INSCRIPTION_STEPS, REINSCRIPTION_STEPS, shouldForceRedirectToEmailValidation } from "@/utils/navigation";

const loginMessage = {
  PARENT: null,
  INSCRIPTION: {
    title: "Connexion réussie",
    message: "Vous pouvez reprendre votre inscription à l'étape où vous vous étiez arrêté.",
  },
  REINSCRIPTION: {
    title: "Connexion réussie",
    message: "Vous pouvez reprendre votre réinscription à l'étape où vous vous étiez arrêté.",
  },
  DEFAULT: {
    title: "Connexion réussie",
    message: "",
  },
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);

  const logout = async ({ redirect } = { redirect: true }) => {
    await logoutYoung();
    dispatch(setYoung(null));
    if (redirect) {
      toastr.info("Vous avez bien été déconnecté.", { timeOut: 10000 });
      return history.push("/auth");
    }
    return true;
  };

  const login = async (user) => {
    dispatch(setYoung(user));
    await cohortsInit();
    displayLoginToast(user);
    if (shouldForceRedirectToEmailValidation(user)) {
      history.push("/preinscription/email-validation");
    }
    return true;
  };

  const isLoggedIn = !!young;

  const loginOrLogout = () => (isLoggedIn ? logout() : login());

  const isCLEFromURL = new URLSearchParams(window.location.search).get("parcours")?.toUpperCase() === YOUNG_SOURCE.CLE;
  const isCLEFromDB = young?.source === YOUNG_SOURCE.CLE;
  const isCLE = isCLEFromURL || isCLEFromDB;

  return {
    young,
    logout,
    login,
    isLoggedIn,
    loginOrLogout,
    isCLE,
  };
};

function displayLoginToast(user) {
  const message = getLoginMessage(user);
  if (!message) return;
  toastr.success(message.title, message.message, { timeOut: 3 });
}

function getLoginMessage(user) {
  if (window.location.pathname.includes("/representants-legaux")) {
    return loginMessage.PARENT;
  }
  if (user.status === YOUNG_STATUS.IN_PROGRESS && user.inscriptionStep2023 !== INSCRIPTION_STEPS.EMAIL_WAITING_VALIDATION) {
    return loginMessage.INSCRIPTION;
  }
  if (user.status === YOUNG_STATUS.REINSCRIPTION && user.reInscriptionStep2023 !== REINSCRIPTION_STEPS.ELIGIBILITE) {
    return loginMessage.REINSCRIPTION;
  }
  return loginMessage.DEFAULT;
}

export default useAuth;
