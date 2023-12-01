import { useDispatch, useSelector } from "react-redux";
import { useLocation, useHistory } from "react-router-dom";
import { setYoung } from "../redux/auth/actions";
import { toastr } from "react-redux-toastr";
import { logoutYoung } from "./young.service";
import { YOUNG_SOURCE } from "snu-lib";

export const useAuth = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);
  const { pathname } = useLocation();

  const logout = async () => {
    const isLogout = await logoutYoung();
    if (isLogout) {
      dispatch(setYoung(null));
      toastr.info("Vous avez bien été déconnecté.", { timeOut: 10000 });
      return history.push("/auth");
    }
    return true;
  };

  const login = () => {
    history.push("/auth?redirect=" + pathname);
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

export default useAuth;
