import React from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiOutlineAdjustments } from "react-icons/hi";
import { LuArrowRightCircle, LuArrowLeftCircle, LuHistory } from "react-icons/lu";

import { AuthState } from "@/redux/auth/reducer";
import { Header, Navbar } from "@snu/ds/admin";
import plausibleEvent from "@/services/plausible";
import SelectCohort from "@/components/cohorts/SelectCohort";

import HeaderExport from "./ButtonExport";
import { isResponsableDeCentre } from "snu-lib";

interface Props {
  cohort: string;
  setCohort: (cohort: string) => void;
  hasValue: boolean;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedFilters: any;
  children?: React.ReactNode;
}

export default function HeaderPDT({ cohort, setCohort, hasValue, currentTab, setCurrentTab, selectedFilters }: Props) {
  const history = useHistory();
  const { user } = useSelector((state: AuthState) => state.Auth);

  const isResonsableDeCentre = isResponsableDeCentre(user);

  const getActions = () => {
    const buttons: JSX.Element[] = [];

    buttons.push(<HeaderExport cohort={cohort} key="export" selectedFilters={selectedFilters} user={user} />);
    return buttons;
  };

  return (
    <>
      <Header
        title="Plan de transport"
        breadcrumb={[{ title: "Séjours" }, { title: "Plan de transport" }]}
        actions={
          !isResonsableDeCentre
            ? [
                <SelectCohort
                  key="select-cohort"
                  cohort={cohort}
                  onChange={(cohortName) => {
                    setCohort(cohortName);
                    history.replace({ search: `?cohort=${cohortName}` });
                  }}
                />,
              ]
            : []
        }
      />
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
            ...(!isResonsableDeCentre
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
          button={getActions()}
        />
      )}
    </>
  );
}
