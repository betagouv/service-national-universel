import React from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiOutlineAdjustments } from "react-icons/hi";
import { LuArrowRightCircle, LuArrowLeftCircle, LuHistory } from "react-icons/lu";
import { GoPlus } from "react-icons/go";

import { ROLES, isSuperAdmin } from "snu-lib";
import { AuthState } from "@/redux/auth/reducer";
import { CohortState } from "@/redux/cohorts/reducer";
import { Button, Header, Navbar } from "@snu/ds/admin";
import plausibleEvent from "@/services/plausible";
import SelectCohort from "@/components/cohorts/SelectCohort";

import DeletePDTButton from "../DeletePDTButton";
import SyncPlacesPDTButton from "../SyncPlacesPDTButton";
import HeaderExport from "./ButtonExport";

interface Props {
  cohort: string;
  setCohort: (cohort: string) => void;
  getPlanDetransport: () => void;
  hasValue: boolean;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedFilters: any;
  children?: React.ReactNode;
}

export default function HeaderPDT({ cohort, setCohort, getPlanDetransport, hasValue, currentTab, setCurrentTab, selectedFilters }: Props) {
  const history = useHistory();
  const { user } = useSelector((state: AuthState) => state.Auth);
  const cohorts = useSelector((state: CohortState) => state.Cohorts);
  const cohortDto = cohorts?.find((c) => c.name === cohort);
  return (
    <>
      <Header
        title="Plan de transport"
        breadcrumb={[{ title: "Séjours" }, { title: "Plan de transport" }]}
        actions={[
          <SelectCohort
            key="select-cohort"
            cohort={cohort}
            onChange={(cohortName) => {
              setCohort(cohortName);
              history.replace({ search: `?cohort=${cohortName}` });
            }}
          />,
        ]}
      />
      <div className="flex gap-2 items-center">
        {isSuperAdmin(user) && cohortDto && <DeletePDTButton cohort={cohortDto} onChange={getPlanDetransport} disabled={!hasValue} className="mb-4" />}
        {isSuperAdmin(user) && cohortDto && <SyncPlacesPDTButton cohort={cohortDto} onChange={getPlanDetransport} disabled={!hasValue} className="mb-4" />}
      </div>
      {hasValue && (
        <Navbar
          tab={[
            {
              title: "Aller",
              leftIcon: <LuArrowRightCircle size={20} className="mt-0.5 ml-2.5" />,
              isActive: currentTab === "aller",
              onClick: () => {
                history.push(`/ligne-de-bus?cohort=${cohort}&page=1`);
                setCurrentTab("aller");
              },
            },
            {
              title: "Retour",
              leftIcon: <LuArrowLeftCircle size={20} className="mt-0.5 ml-2.5" />,
              isActive: currentTab === "retour",
              onClick: () => {
                history.push(`/ligne-de-bus?cohort=${cohort}&page=1`);
                setCurrentTab("retour");
              },
            },
            ...(user.role !== ROLES.HEAD_CENTER
              ? [
                  {
                    title: "Historique",
                    leftIcon: <LuHistory size={20} className="mt-0.5 ml-2.5" />,
                    isActive: currentTab === "historique",
                    onClick: () => {
                      history.push(`/ligne-de-bus/historique?cohort=${cohort}`);
                      setCurrentTab("historique");
                      plausibleEvent(`Historique du PDT - ${cohort}`);
                    },
                  },
                  {
                    title: "Demande de modification",
                    leftIcon: <HiOutlineAdjustments size={22} className="mt-0.5 ml-2.5" />,
                    isActive: currentTab === "modification",
                    onClick: () => {
                      history.push(`/ligne-de-bus/demande-de-modification?cohort=${cohort}`);
                      setCurrentTab("modification");
                      plausibleEvent(`Demande de modifications du PDT - ${cohort}`);
                    },
                  },
                ]
              : []),
          ]}
          button={[
            <Button
              title="Importer des lignes supplémentaires"
              leftIcon={<GoPlus size={20} className="mt-0.5" />}
              key={"btn-2"}
              type="wired"
              onClick={() => history.push(`/ligne-de-bus/import?cohort=${cohort}&add=true`)}
            />,
            <HeaderExport cohort={cohort} key="export" selectedFilters={selectedFilters} user={user} />,
          ]}
        />
      )}
    </>
  );
}
