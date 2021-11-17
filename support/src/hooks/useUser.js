import { useEffect } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import API from "../services/api";

const useUser = ({ redirectTo = "" } = {}) => {
  const response = useSWR(API.getUrl("/referent/signin_token"));
  const { data: user, mutate, error } = response;
  const router = useRouter();

  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || !user) return;

    if (redirectTo && !user?.isLoggedIn) router.push(redirectTo);
  }, [user, redirectTo]);

  return {
    user,
    isLoading: !error && !user,
    isError: error,
    mutate,
  };
};

export default useUser;
