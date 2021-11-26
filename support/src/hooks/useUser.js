import { useEffect } from "react";
import { useRouter } from "next/router";
import useSWR, { useSWRConfig } from "swr";
import API from "../services/api";

const useUser = ({ redirectOnLoggedOut = "", redirectOnLoggedIn } = {}) => {
  const { cache } = useSWRConfig();
  const { data, mutate, error } = useSWR(API.getUrl({ path: "/referent/signin_token" }));
  const router = useRouter();

  const isLoading = !error && !data;
  const user = data && data.ok ? { ...data.user, isLoggedIn: true } : { isLoggedIn: false };

  useEffect(() => {
    if (redirectOnLoggedOut && !isLoading && !user.isLoggedIn) {
      router.push(redirectOnLoggedOut);
    }
    if (redirectOnLoggedIn && !isLoading && !!user.isLoggedIn) {
      cache.clear();
      router.push(redirectOnLoggedIn);
    }
  }, [isLoading, error, redirectOnLoggedOut, redirectOnLoggedIn]);

  return {
    user,
    isLoading: !error && !user,
    isError: error,
    mutate,
  };
};

export default useUser;
