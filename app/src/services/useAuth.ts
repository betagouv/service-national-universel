import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { setYoung } from "../redux/auth/actions";
import { toastr } from "react-redux-toastr";
import { logoutYoung } from "./young.service";
import { YOUNG_SOURCE, YoungType } from "snu-lib";
import { displaySignupToast } from "@/utils";
import { AuthState } from "@/redux/auth/reducer";

export const useAuth = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const young = useSelector((state: AuthState) => state.Auth.young);

  const logout = async ({ redirect } = { redirect: true }) => {
    await logoutYoung();
    dispatch(setYoung(undefined));
    if (redirect) {
      toastr.info("Vous avez bien été déconnecté.", "");
      return history.push("/auth");
    }
    return true;
  };

  const login = async (user?: YoungType) => {
    if (!user) return history.push("/auth");
    await dispatch(setYoung(user));
    displaySignupToast(user);
  };

  const isLoggedIn = !!young;

  const loginOrLogout = () => (isLoggedIn ? logout() : login());

  const isCLEFromURL = new URLSearchParams(window.location.search).get("parcours")?.toUpperCase() === YOUNG_SOURCE.CLE;
  const isCLEFromDB = young?.source === YOUNG_SOURCE.CLE;
  const isCLE = isCLEFromURL || isCLEFromDB;
  const isHTS = young?.source === YOUNG_SOURCE.VOLONTAIRE;

  return {
    young,
    logout,
    login,
    isLoggedIn,
    loginOrLogout,
    isCLE,
    isHTS,
  };
};

export default useAuth;
