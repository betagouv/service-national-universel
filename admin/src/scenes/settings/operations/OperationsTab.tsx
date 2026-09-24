import React from "react";
import { useHistory, useLocation } from "react-router";
import { HiOutlineDocumentDownload, HiOutlineDocumentReport } from "react-icons/hi";

import { Container, NavbarControlled } from "@snu/ds/admin";

import SimulationsSubTab from "./simulations/SimulationsSubTab";
import TraitementsSubTab from "./traitements/TraitementsSubTab";
import { CohortDto } from "snu-lib";

interface OperationTabProps {
  session: CohortDto;
}

export default function OperationsTab({ session }: OperationTabProps) {
  const history = useHistory();
  const { search } = useLocation();

  // Les actions (lancement de simulations et de traitements) ont été supprimées : seul l'historique reste consultable.
  const currentTab = (new URLSearchParams(search).get("tab") || "simulations") as "simulations" | "traitements";

  const tabs: Array<{
    id: typeof currentTab;
    title: string;
    leftIcon: React.ReactNode;
    content?: React.ReactNode;
  }> = [
    {
      id: "simulations" as const,
      title: "Historique des simulations",
      leftIcon: <HiOutlineDocumentDownload size={20} className="mt-0.5" />,
      content: <SimulationsSubTab session={session} />,
    },
    {
      id: "traitements" as const,
      title: "Historique des traitements",
      leftIcon: <HiOutlineDocumentReport size={20} className="mt-0.5" />,
      content: <TraitementsSubTab session={session} />,
    },
  ];

  return (
    <Container>
      <NavbarControlled tabs={tabs} active={currentTab} onTabChange={(id: typeof currentTab) => history.push(`?tab=${id}&cohort=${session.name}`)} className="!mb-6 !pt-0" />
      {tabs.find((tab) => tab.id === currentTab)?.content}
    </Container>
  );
}
