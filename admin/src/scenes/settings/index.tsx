import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory, useParams } from "react-router-dom";
import { CiSettings } from "react-icons/ci";
import { MdOutlinePlace } from "react-icons/md";
import { HiOutlineLightningBolt } from "react-icons/hi";

import { CohortDto, isSuperAdmin, ROLES } from "snu-lib";
import { NavbarControlled } from "@snu/ds/admin";

import api from "@/services/api";
import { capture } from "@/sentry";
import { AuthState } from "@/redux/auth/reducer";
import { CohortState } from "@/redux/cohorts/reducer";

import logo from "@/assets/logo-snu.png";

import Breadcrumbs from "@/components/Breadcrumbs";
import SelectCohort from "@/components/cohorts/SelectCohort";
import Loader from "@/components/Loader";

import EligibilityTab from "./eligibility/EligibilityTab";
import GeneralTab from "./general/GeneralTab";
import OperationsTab from "./operations/OperationsTab";
import MarketingTab from "./marketing/MarketingTab";

export default function Settings() {
  const history = useHistory();
  const { tab } = useParams<{ tab: string }>();
  const { user } = useSelector((state: AuthState) => state.Auth);
  const cohorts = useSelector((state: CohortState) => state.Cohorts);

  const currentTab = (tab || "general") as "general" | "eligibility" | "operations" | "marketing";

  const [cohort, setCohort] = useState<CohortDto>();
  const [isLoading, setIsLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const currentCohortName = urlParams.get("cohort") ? decodeURIComponent(urlParams.get("cohort") || "") : cohorts[0].name;

  const hasSuperAdminAccess = isSuperAdmin(user);
  const isReadOnly = !hasSuperAdminAccess;

  const getCohort = async () => {
    try {
      const { ok, data: reponseCohort } = await api.get("/cohort/" + encodeURIComponent(currentCohortName));
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération du séjour", "");
      }

      setCohort(reponseCohort);

      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du séjour", "");
    }
  };

  useEffect(() => {
    if (!currentCohortName) return;
    setIsLoading(true);
    getCohort();
  }, [currentCohortName]);

  if (!cohort) return null;

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
      content: <GeneralTab cohort={cohort} onCohortChange={setCohort} getCohort={getCohort} isLoading={isLoading} onLoadingChange={setIsLoading} readOnly={isReadOnly} />,
    },
    ...(hasSuperAdminAccess
      ? [
          {
            id: "eligibility" as const,
            title: "Éligibilités",
            leftIcon: <MdOutlinePlace size={20} className="mt-0.5" />,
            content: <EligibilityTab cohort={cohort} getCohort={getCohort} />,
          },
          {
            id: "operations" as const,
            title: "Opérations",
            leftIcon: <HiOutlineLightningBolt size={20} className="mt-0.5" />,
            content: <OperationsTab session={cohort} />,
          },
          {
            id: "marketing" as const,
            title: "Marketing",
            leftIcon: <HiOutlineLightningBolt size={20} className="mt-0.5" />,
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
          <SelectCohort cohort={currentCohortName} onChange={(cohortName) => history.replace({ search: `?cohort=${encodeURIComponent(cohortName)}` })} />
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
