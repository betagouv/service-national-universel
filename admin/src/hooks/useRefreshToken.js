import { setUser } from "@/redux/auth/actions";
import api from "@/services/api";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

// const ONE_MIN = 1000 * 60;
// const TWO_MIN = 1000 * 60 * 2;
const ONE_MIN = 1000 * 30;
const TWO_MIN = 1000 * 30 * 2;

export default function useRefreshToken() {
  const [interval, setIntervalState] = useState(undefined);
  const [timeout, setTimeoutState] = useState(undefined);

  const history = useHistory();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);

  const startInterval = () => {
    const int = setInterval(async () => {
      console.log(`🐞 - startInterval user`, user);

      if (user) {
        const res = await api.checkToken(true);
        if (!res.ok || !res.user) return logout();
        if (res.token) api.setToken(res.token);
      }
    }, ONE_MIN);
    setIntervalState(int);
  };

  // If idle after 2 minutes of inactivity, we logout the user
  const startTimeout = () => {
    const to = setTimeout(() => logout(), TWO_MIN);
    setTimeoutState(to);
  };

  const resetTimeout = () => {
    clearTimeout(timeout);
    startTimeout();
  };

  const logout = async () => {
    try {
      console.log(`🐞 - logout`);

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
    window.addEventListener("mousemove", resetTimeout);
    window.addEventListener("keydown", resetTimeout);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimeout);
      window.removeEventListener("keydown", resetTimeout);
    };
  }, []);
}
