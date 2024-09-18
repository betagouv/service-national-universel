import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { isSuperAdmin, ROLES } from "snu-lib";

import api from "@/services/api";

import logo from "@/assets/logo-snu.png";
import { capture } from "@/sentry";

import Breadcrumbs from "@/components/Breadcrumbs";
import SelectCohort from "@/components/cohorts/SelectCohort";

import { Navbar } from "@snu/ds/admin";
import { CiSettings } from "react-icons/ci";
import { MdOutlinePlace } from "react-icons/md";
import EligibilityTab from "./tabs/EligibilityTab";
import GeneralTab from "./tabs/GeneralTab";
import { settings, uselessSettings } from "./utils";

export default function Settings() {
  const { user } = useSelector((state) => state.Auth);
  const eligibilityTabAccess = isSuperAdmin(user);

  const urlParams = new URLSearchParams(window.location.search);
  const cohort = urlParams.get("cohort") ? decodeURIComponent(urlParams.get("cohort")) : "Février 2024 - C";

  const [isActive, setIsActive] = useState({
    tab1: true,
    tab2: false,
    tab3: false,
    tab4: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const readOnly = !isSuperAdmin(user);
  const [noChange, setNoChange] = useState(true);
  const history = useHistory();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState({
    ...settings,
    ...uselessSettings,
  });

  const getCohort = async () => {
    try {
      const { ok, data: reponseCohort } = await api.get("/cohort/" + encodeURIComponent(cohort));
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération du séjour");
      }
      delete reponseCohort.dsnjExportDates;
      const { uselessInformation, ...base } = reponseCohort;

      setData({
        ...settings,
        ...base,
        uselessInformation: {
          ...uselessSettings,
          ...uselessInformation,
        },
      });

      setIsLoading(false);
      setMounted(true);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du séjour");
    }
  };

  useEffect(() => {
    if (!cohort) return;
    setIsLoading(true);
    getCohort();
  }, [cohort]);

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

  return (
    <>
      <Breadcrumbs items={[{ label: "Paramétrage dynamique" }]} />
      <div className="flex w-full flex-col px-8 pb-8">
        <div className="flex items-center justify-between py-8">
          <div className="text-2xl font-bold leading-7 text-gray-900">Paramétrages dynamiques</div>
          <SelectCohort cohort={cohort} onChange={(cohortName) => history.replace({ search: `?cohort=${encodeURIComponent(cohortName)}` })} />
        </div>
        <Navbar
          tab={[
            {
              title: "Général",
              leftIcon: <CiSettings size={20} className="mt-0.5" />,
              isActive: isActive.tab1,
              onClick: () => setIsActive({ tab1: true, tab2: false }),
            },
            eligibilityTabAccess
              ? {
                  title: "Éligibilités",
                  isActive: isActive.tab2,
                  leftIcon: <MdOutlinePlace size={20} className="mt-0.5" />,
                  onClick: () => setIsActive({ tab1: false, tab2: true }),
                }
              : null,
          ].filter(Boolean)}
        />
        {/* Informations générales */}
        {isActive.tab1 && (
          <GeneralTab
            data={data}
            setData={setData}
            cohort={cohort}
            getCohort={getCohort}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            noChange={noChange}
            readOnly={readOnly}
            setNoChange={setNoChange}
            mounted={mounted}
          />
        )}
        {/* Eligibilité */}
        {isActive.tab2 && eligibilityTabAccess && <EligibilityTab cohort={data} readOnly={readOnly} getCohort={getCohort} />}
      </div>
    </>
  );
}
