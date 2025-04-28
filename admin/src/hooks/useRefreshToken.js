import { setUser } from "@/redux/auth/actions";
import { capture } from "@/sentry";
import api from "@/services/api";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useInterval, useTimeoutFn } from "react-use";

const PING_INTERVAL = 1000 * 60 * 15; // Every 15 minutes
const INACTIVITY_DURATION = 1000 * 60 * 60 * 2; // 2 hours

export default function useRefreshToken() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);

  useInterval(async () => {
    if (user) {
      const res = await api.checkToken(true);
      if (!res.ok || !res.user) return logout();
      if (res.token) api.setToken(res.token);
    }
  }, PING_INTERVAL);

  // If idle after X minutes of inactivity, we logout the user
  const [isTimeoutReady, cancelTimeout, resetTimeout] = useTimeoutFn(() => logout(), INACTIVITY_DURATION);

  const logout = async () => {
    try {
      await api.post(`/referent/logout`);
      api.setToken(null);
      dispatch(setUser(null));
      toastr.info("Vous avez bien été déconnecté dû a une trop longue inactivité.", { timeOut: 10000 });
      window.location.href = "/auth?disconnected=1";
    } catch (e) {
      capture(e);
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", resetTimeout);
    window.addEventListener("keydown", resetTimeout);

    return () => {
      window.removeEventListener("mousedown", resetTimeout);
      window.removeEventListener("keydown", resetTimeout);
    };
  }, []);
}
