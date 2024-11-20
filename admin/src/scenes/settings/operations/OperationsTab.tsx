import React from "react";
import { useHistory, useLocation } from "react-router";
import { HiOutlineDocumentDownload, HiOutlineDocumentReport, HiOutlineDocumentText } from "react-icons/hi";

import { Container, NavbarControlled } from "@snu/ds/admin";

import ActionsSubTab from "./actions/ActionsSubTab";
import SimulationsSubTab from "./simulations/SimulationsSubTab";
import TraitementsSubTab from "./traitements/TraitementsSubTab";

interface OperationTabProps {
  cohortId: string;
  cohortName: string;
}

export default function OperationTab({ cohortId, cohortName }: OperationTabProps) {
  const history = useHistory();
  const { search } = useLocation();

  const currentTab = (new URLSearchParams(search).get("tab") || "actions") as "actions" | "simulations" | "traitements";

  const tabs: Array<{
    id: typeof currentTab;
    title: string;
    leftIcon: React.ReactNode;
    content?: React.ReactNode;
  }> = [
    {
      id: "actions",
      title: "Actions des opérations",
      leftIcon: <HiOutlineDocumentText size={20} className="mt-0.5" />,
      content: <ActionsSubTab cohortId={cohortId} cohortName={cohortName} />,
    },

    {
      id: "simulations" as const,
      title: "Historique des simulations",
      leftIcon: <HiOutlineDocumentDownload size={20} className="mt-0.5" />,
      content: <SimulationsSubTab cohortId={cohortId} />,
    },
    {
      id: "traitements" as const,
      title: "Historique des traitements",
      leftIcon: <HiOutlineDocumentReport size={20} className="mt-0.5" />,
      content: <TraitementsSubTab cohortId={cohortId} />,
    },
  ];

  return (
    <Container>
      <NavbarControlled tabs={tabs} active={currentTab} onTabChange={(id: typeof currentTab) => history.push(`?tab=${id}&cohort=${cohortName}`)} className="!mb-6 !pt-0" />
      {tabs.find((tab) => tab.id === currentTab)?.content}
    </Container>
  );
}
