import { useEffect } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import API from "../services/api";

const useUser = ({ redirectOnLoggedOut = "/base-de-connaissance" } = {}) => {
  const { data, mutate, error } = useSWR(API.getUrl({ path: "/signin/token" }));
  const router = useRouter();

  const isLoading = !error && !data;
  const user = data && data.ok ? { ...data.user, isLoggedIn: true } : { restriction: "public", isLoggedIn: false };

  useEffect(() => {
    if (redirectOnLoggedOut && !isLoading && !user.isLoggedIn) {
      router.push(redirectOnLoggedOut);
    }
  }, [isLoading, error, redirectOnLoggedOut]);

  return {
    user,
    isLoading,
    isError: error,
    mutate,
  };
};

export default useUser;
