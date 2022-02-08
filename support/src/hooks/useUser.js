import { useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import API from "../services/api";
import SeeAsContext from "./useSeeAs";

const useUser = ({ redirectOnLoggedOut = "/base-de-connaissance" } = {}) => {
  const { data, mutate, error } = useSWR(API.getUrl({ path: "/signin/token" }));
  const router = useRouter();
  const { seeAs } = useContext(SeeAsContext);

  const isLoading = !error && !data;
  const user = data && data.ok ? { ...data.user, isLoggedIn: true } : { restriction: "public", isLoggedIn: false };

  useEffect(() => {
    if (redirectOnLoggedOut && !isLoading && !user.isLoggedIn && user.restriction !== "public") {
      router.push(redirectOnLoggedOut);
    }
  }, [isLoading, error, redirectOnLoggedOut]);

  const restriction = useMemo(() => {
    if (user.role !== "admin") return user.restriction;
    if (seeAs) return seeAs;
    return user.restriction;
  }, [user.role, seeAs]);

  return {
    user,
    isLoading,
    isError: error,
    mutate,
    restriction,
  };
};

export default useUser;
