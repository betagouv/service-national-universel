import { useDispatch, useSelector } from "react-redux";
import { useLocation, useHistory } from "react-router-dom";
import { setYoung } from "../redux/auth/actions";
import { toastr } from "react-redux-toastr";
import { logoutYoung } from "./young.service";

export const useAuth = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);
  const { pathname } = useLocation();

  const logout = async () => {
    await logoutYoung();
    dispatch(setYoung(null));
    toastr.info("Vous avez bien été déconnecté.", { timeOut: 10000 });
    return history.push("/auth");
  };

  const login = () => {
    history.push("/auth?redirect=" + pathname);
  };

  const isLoggedIn = !!young;

  const loginOrLogout = () => (isLoggedIn ? logout() : login());

  return {
    young,
    logout,
    login,
    isLoggedIn,
    loginOrLogout,
  };
};

export default useAuth;
