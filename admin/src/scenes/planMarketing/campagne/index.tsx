import Breadcrumbs from "@/components/Breadcrumbs";
import { NavbarControlled } from "@snu/ds/admin";
import React from "react";
import { useHistory, useParams } from "react-router-dom";
import CampagnesGeneriques from "./CampagnesGeneriques";

const tabs = [
  { id: "campagnes-generiques", title: "Campagnes Génériques" },
  { id: "listes-diffusion", title: "Listes de Diffusion" },
];

export default function MarketingCampaign() {
  const history = useHistory();
  const { tab = "active" } = useParams<{ tab: string }>();

  const renderTabContent = () => {
    switch (tab) {
      case "campagnes-generiques":
        return <CampagnesGeneriques />;
      case "listes-diffusion":
        return <div>Listes de Diffusion</div>;
      default:
        return <CampagnesGeneriques />;
    }
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Marketing" }]} />
      <div className="flex w-full flex-col px-8">
        <div className="flex items-center justify-between py-2">
          <div className="text-2xl font-bold leading-7 text-gray-900">Marketing</div>
        </div>
        <NavbarControlled tabs={tabs} active={tab} onTabChange={(tabId) => history.push(`/plan-marketing/${tabId}`)} />
      </div>
      <div className="px-8">{renderTabContent()}</div>
    </>
  );
}
