import React from "react";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { CiSettings } from "react-icons/ci";
import { HiOutlineMail } from "react-icons/hi";
import { useQueryClient } from "@tanstack/react-query";

import { isSuperAdmin, ROLES } from "snu-lib";
import { NavbarControlled } from "@snu/ds/admin";

import api from "@/services/api";
import { AuthState } from "@/redux/auth/reducer";
import { CohortState } from "@/redux/cohorts/reducer";

import logo from "@/assets/logo-snu.png";

import Breadcrumbs from "@/components/Breadcrumbs";
import SelectCohort from "@/components/cohorts/SelectCohort";
import Loader from "@/components/Loader";
import GeneralTab from "./general/GeneralTab";
import MarketingTab from "./marketing/MarketingTab";

import { useQuery } from "@tanstack/react-query";

export default function Settings() {
  const history = useHistory();
  const { tab } = useParams<{ tab: string }>();
  const { user } = useSelector((state: AuthState) => state.Auth);
  const cohorts = useSelector((state: CohortState) => state.Cohorts);
  const queryClient = useQueryClient();
  const currentTab = (tab || "general") as "general" | "eligibility" | "operations" | "marketing";

  const urlParams = new URLSearchParams(window.location.search);
  const currentCohortName = urlParams.get("cohort") ? decodeURIComponent(urlParams.get("cohort") || "") : cohorts[0].name;

  const hasSuperAdminAccess = isSuperAdmin(user);
  const isReadOnly = !hasSuperAdminAccess;

  const { data: cohort, isLoading } = useQuery({
    queryKey: ["cohort", currentCohortName],
    queryFn: async () => {
      const { data } = await api.get(`/cohort/${encodeURIComponent(currentCohortName)}`);
      return data;
    },
    enabled: !!currentCohortName,
  });

  const onCohortChange = (cohortName: string) => {
    queryClient.removeQueries({ queryKey: ["cohort", currentCohortName] });

    history.replace({ search: `?cohort=${encodeURIComponent(cohortName)}` });

    queryClient.prefetchQuery({
      queryKey: ["cohort", cohortName],
      queryFn: async () => {
        const { data } = await api.get(`/cohort/${encodeURIComponent(cohortName)}`);
        return data;
      },
    });
  };

  if (!cohort) return <Loader />;

  if (user.role !== ROLES.ADMIN) {
    return (
      <div className="h-100 m-6 flex flex-col items-center justify-center">
        <img src={logo} alt="logo" className="w-56 pb-8" />
        <div className="pb-4 text-center text-3xl">Vous n&apos;avez pas les droits d&apos;accès à cette page !</div>
        <div className="mt-4 text-center text-lg text-gray-500">
          Besoin d&apos;aide ?{" "}
          <a rel="noreferrer" href="/public-besoin-d-aide" target="_blank" className="scale-105 cursor-pointer hover:underline">
            Cliquez ici
          </a>
        </div>
      </div>
    );
  }

  const tabs: Array<{
    id: typeof currentTab;
    title: string;
    leftIcon: React.ReactNode;
    content?: React.ReactNode;
  }> = [
    {
      id: "general",
      title: "Général",
      leftIcon: <CiSettings size={20} className="mt-0.5" />,
      content: <GeneralTab cohort={cohort} readOnly={isReadOnly} />,
    },
    ...(hasSuperAdminAccess
      ? [
          {
            id: "marketing" as const,
            title: "Marketing",
            leftIcon: <HiOutlineMail size={20} className="mt-0.5" />,
            content: <MarketingTab session={cohort} />,
          },
        ]
      : []),
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: "Paramétrages dynamiques" }]} />
      <div className="flex w-full flex-col px-8 pb-8">
        <div className="flex items-center justify-between py-8">
          <div className="text-2xl font-bold leading-7 text-gray-900">Paramétrages dynamiques</div>
          <div className="flex items-center">
            <SelectCohort cohort={currentCohortName} onChange={onCohortChange} showArchived />
          </div>
        </div>
        <NavbarControlled tabs={tabs} active={currentTab} onTabChange={(id: typeof currentTab) => history.push(`/settings/${id}?cohort=${currentCohortName}`)} />

        {isLoading && (
          <div className="flex items-center justify-center h-screen-1/4">
            <Loader />
          </div>
        )}
        {!isLoading && tabs.find((tab) => tab.id === currentTab)?.content}
      </div>
    </>
  );
}
