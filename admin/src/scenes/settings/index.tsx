import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { CohortDto, isSuperAdmin, ROLES } from "snu-lib";

import api from "@/services/api";

import logo from "@/assets/logo-snu.png";
import { capture } from "@/sentry";

import Breadcrumbs from "@/components/Breadcrumbs";
import SelectCohort from "@/components/cohorts/SelectCohort";

import Loader from "@/components/Loader";
import { AuthState } from "@/redux/auth/reducer";
import { Navbar } from "@snu/ds/admin";
import { CiSettings } from "react-icons/ci";
import { MdOutlinePlace } from "react-icons/md";
import EligibilityTab from "./tabs/EligibilityTab";
import GeneralTab from "./tabs/GeneralTab";
import { CohortState } from "@/redux/cohorts/reducer";

export default function Settings() {
  const { user } = useSelector((state: AuthState) => state.Auth);
  const cohorts = useSelector((state: CohortState) => state.Cohorts);

  const hasSuperAdminAccess = isSuperAdmin(user);
  const isReadOnly = !hasSuperAdminAccess;
  const [isLoading, setIsLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const currentCohortName = urlParams.get("cohort") ? decodeURIComponent(urlParams.get("cohort") || "") : cohorts[0].name;

  const [currentTab, setCurrentTab] = useState<"general" | "eligibility">("general");
  const [cohort, setCohort] = useState<CohortDto>();

  const history = useHistory();

  const generalTabActive = !isLoading && currentTab === "general";
  const eligibilityTabActive = !isLoading && hasSuperAdminAccess && currentTab === "eligibility";

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

  if (user.role !== ROLES.ADMIN)
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

  const tabs = [
    {
      title: "Général",
      leftIcon: <CiSettings size={20} className="mt-0.5" />,
      isActive: currentTab === "general",
      onClick: () => setCurrentTab("general"),
    },
    ...(hasSuperAdminAccess
      ? [
          {
            title: "Éligibilités",
            isActive: currentTab === "eligibility",
            leftIcon: <MdOutlinePlace size={20} className="mt-0.5" />,
            onClick: () => setCurrentTab("eligibility"),
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
        <Navbar tab={tabs} />

        {isLoading && (
          <div className="flex items-center justify-center h-screen-1/4">
            <Loader />
          </div>
        )}
        {/* Informations générales */}
        {generalTabActive && (
          <GeneralTab data={cohort} setData={setCohort} cohort={currentCohortName} getCohort={getCohort} isLoading={isLoading} setIsLoading={setIsLoading} readOnly={isReadOnly} />
        )}
        {/* Eligibilité */}
        {eligibilityTabActive && <EligibilityTab cohort={cohort} readOnly={isReadOnly} getCohort={getCohort} />}
      </div>
    </>
  );
}
