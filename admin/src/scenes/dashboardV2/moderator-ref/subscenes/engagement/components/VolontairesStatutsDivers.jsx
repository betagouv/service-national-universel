import React, { useEffect, useState } from "react";
import DashboardBox from "../../../../components/ui/DashboardBox";
import api from "@/services/api";
import { translate, translateApplication } from "snu-lib";
import Tabs from "../../../../../phase0/components/Tabs";
import StatusTable from "../../../../components/ui/StatusTable";
import { getNewLink } from "@/utils";
import queryString from "query-string";

export default function VolontairesStatutsDivers({ filters, className = "" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("phase2");
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    loadData();
  }, [filters]);

  const tabs = [
    { value: "phase2", label: "Mission de phase 2" },
    { value: "contract", label: "Contrats d'engagement" },
  ];

  async function loadData() {
    setError(null);
    setLoading(true);
    try {
      const result = await api.post(`/dashboard/engagement/volontaires-statuts-divers`, { filters });
      if (result.ok) {
        let statuses = {};

        for (let status of result.data) {
          if (statuses[status.category] === undefined) {
            statuses[status.category] = [];
          }
          let url = "";
          switch (status.category) {
            case "phase2":
              url += getNewLink(
                {
                  base: `/volontaire`,
                  filter: filters,
                  filtersUrl: [queryString.stringify({ phase2ApplicationStatus: encodeURIComponent(status.status) })],
                },
                "session",
              );
              break;
            case "contract":
              url += getNewLink(
                {
                  base: `/volontaire`,
                  filter: filters,
                  filtersUrl: [queryString.stringify({ statusPhase2Contract: encodeURIComponent(status.status) })],
                },
                "session",
              );
              break;
          }

          statuses[status.category].push({
            status: status.category === "phase2" ? translateApplication(status.status) : translate(status.status),
            nb: status.value,
            percentage: Math.round(status.percentage * 100),
            url,
          });
        }
        setStatuses(statuses);
      } else {
        console.log("error : ", result);
        setError("Erreur: impossible de charger les données.");
      }
    } catch (err) {
      console.log("unable to load volontaires statuts divers: ", err);
      setError("Erreur: impossible de charger les données.");
    }
    setLoading(false);
  }

  return (
    <DashboardBox title="Statuts divers" className={`flex flex-col ${className}`} childrenClassName="grow flex flex-col">
      {error ? (
        <div className="flex items-center justify-center p-8 text-center text-sm font-medium text-red-600">{error}</div>
      ) : (
        <>
          <Tabs selected={selectedTab} tabs={tabs} onChange={setSelectedTab} className="my-6" />
          <StatusTable className="grow" statuses={statuses[selectedTab]} loading={loading} nocols={selectedTab !== "phase2"} />
        </>
      )}
    </DashboardBox>
  );
}
