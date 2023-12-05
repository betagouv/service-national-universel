import { useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import API from "../services/api";
import { snuApiUrl } from "../config";
import SeeAsContext from "../contexts/seeAs";

const useUser = ({ redirectOnLoggedOut = "/base-de-connaissance" } = {}) => {
  const { data, mutate, error } = useSWR(API.getUrl({ origin: snuApiUrl, path: "/signin/token" }));
  const router = useRouter();
  const { seeAs } = useContext(SeeAsContext);

  const isLoading = !error && !data;
  const user = data && data?.ok ? { ...data.user, isLoggedIn: true } : { restriction: "public", isLoggedIn: false };

  useEffect(() => {
    if (redirectOnLoggedOut && !isLoading && !user.isLoggedIn && user.restriction !== "public") {
      router.push(redirectOnLoggedOut);
    }
  }, [isLoading, error, redirectOnLoggedOut]);

  const restriction = useMemo(() => {
    if (!user) return "public";
    if (!["admin", "referent_region", "referent_department"].includes(user.role)) return user.allowedRole || "public";
    if (seeAs) return seeAs;
    return user.allowedRole || "public";
  }, [user?.allowedRole, seeAs]);

  return {
    user,
    isLoading,
    isError: error,
    mutate,
    restriction,
  };
};

export default useUser;
