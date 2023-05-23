import React, { useEffect, useState } from "react";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import DashboardContainer from "../../../components/DashboardContainer";
import api from "../../../../../services/api";

export default function Analytics() {
  const [stats, setStats] = useState({});
  useEffect(function getStatsEffect() {
    async function getStats() {
      const allValidated = await api.post(`/analytics/young-status/count`, {
        status: "VALIDATED",
        startDate: "2021-01-01",
        endDate: "2023-12-31",
      });

      const occitanie = await api.post(`/analytics/young-status/count`, {
        status: "WITHDRAWN",
        region: ["Occitanie"],
        startDate: "2022-05-01",
        endDate: "2022-12-01",
      });

      const cohort = await api.post(`/analytics/young-cohort/count`, {
        department: ["Paris"],
        startDate: "2022-01-01",
        endDate: "2022-12-01",
      });

      setStats({
        allValidated: allValidated.data,
        occitanie: occitanie.data,
        cohort: cohort.data,
      });
    }
    getStats();
  }, []);
  console.log(stats);
  return (
    <DashboardContainer availableTab={["general", "engagement", "sejour", "inscription", "analytics"]} active="analytics" navChildren={<></>}>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-white p-4 shadow-lg">
          Tous les jeunes VALIDATED 2021-2023
          <div className="text-2xl font-bold">{stats.allValidated?.count}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-lg">
          Occitanie WITHDRAWN 2022-05 à 2022-12
          <div className="text-2xl font-bold">{stats.occitanie?.count}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-lg">
          Paris chgt de Cohort 2022
          <div className="text-2xl font-bold">{stats.cohort?.count}</div>
        </div>
      </div>
    </DashboardContainer>
  );
}
