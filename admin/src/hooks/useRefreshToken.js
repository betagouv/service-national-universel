import { setUser } from "@/redux/auth/actions";
import api from "@/services/api";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

const PING_INTERVAL = 1000 * 60; // Every minute
const INACTIVITY_DURATION = 1000 * 60 * 30; // 30 minutes

export default function useRefreshToken() {
  let interval = undefined;
  let timeout = undefined;

  const history = useHistory();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);

  const startInterval = () => {
    const int = setInterval(async () => {
      if (user) {
        const res = await api.checkToken(true);
        if (!res.ok || !res.user) return logout();
        if (res.token) api.setToken(res.token);
      }
    }, PING_INTERVAL);
    interval = int;
  };

  // If idle after X minutes of inactivity, we logout the user
  const startTimeout = () => {
    const to = setTimeout(() => logout(), INACTIVITY_DURATION);
    timeout = to;
  };

  const resetTimeout = () => {
    clearTimeout(timeout);
    startTimeout();
  };

  const logout = async () => {
    try {
      await api.post(`/referent/logout`);
      api.setToken(null);
      dispatch(setUser(null));
      toastr.info("Vous avez bien été déconnecté dû a une trop longue inactivité.", { timeOut: 10000 });
      history.push("/auth?disconnected=1");
    } catch (e) {
      toastr.error("Oups une erreur est survenue lors de la déconnexion", { timeOut: 10000 });
    }
  };

  useEffect(() => {
    startInterval();
    startTimeout();
    window.addEventListener("click", resetTimeout);
    window.addEventListener("keydown", resetTimeout);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      window.removeEventListener("click", resetTimeout);
      window.removeEventListener("keydown", resetTimeout);
    };
  }, []);
}
