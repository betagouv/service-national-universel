import React, { useEffect, useState } from "react";
import { translateEquivalenceStatus } from "snu-lib";
import queryString from "query-string";
import api from "@/services/api";
import DashboardBox from "@/scenes/dashboardV2/components/ui/DashboardBox";
import StatusTable from "@/scenes/dashboardV2/components/ui/StatusTable";
import { FullDoughnut } from "@/scenes/dashboardV2/components/graphs";
import { LoadingDoughnut } from "@/scenes/dashboardV2/components/ui/loading";

export default function VolontairesEquivalenceMig({ filters }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statuses, setStatuses] = useState(null);
  const [types, setTypes] = useState(null);
  const [selected, setSelected] = useState("ALL");
  const filtered = getFiltered();

  const filterBase = {
    status: filters?.status?.join("~") || [],
    cohort: filters?.cohorts?.join("~") || [],
    region: filters?.region?.join("~") || [],
    department: filters.department?.join("~") || [],
    academy: filters?.academy?.join("~") || [],
  };

  async function loadData() {
    setError(null);
    setLoading(true);
    try {
      const newFilters = { ...filters, cohort: filters.cohorts };
      delete newFilters.cohorts;
      const result = await api.post(`/dashboard/engagement/volontaires-equivalence-mig`, {
        filters: newFilters,
      });
      if (result.ok) {
        setStatuses(
          result.data.statuses.map((status) => ({
            label: translateEquivalenceStatus(status.status),
            status: status.status,
            nb: status.value,
            percentage: Math.round(status.percentage * 100),
            url: `/volontaire?${queryString.stringify({
              ...filterBase,
              status_equivalence: status.status,
            })}`,
          })),
        );
        setTypes(result.data.types || []);
      } else {
        console.log("error : ", result);
        setError("Erreur: impossible de charger les données.");
      }
    } catch (err) {
      console.log("unable to load volontaires equivalence mig: ", err);
      setError("Erreur: impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filters]);

  function getFiltered() {
    if (!statuses || !types) return null;
    const status = statuses.find((s) => s.status === selected);

    return {
      options: [{ label: "Tous", value: "ALL" }, ...statuses.map((s) => ({ label: s.label, value: s.status }))],
      types:
        selected === "ALL"
          ? types
          : types
              .filter((t) => !!t.statuses[selected])
              .map((t) => ({
                ...t,
                value: t.statuses[selected],
                percentage: t.statuses[selected] / status.nb,
                subTypes: t.subTypes
                  .filter((st) => !!st.statuses[selected])
                  .map((st) => ({
                    ...st,
                    value: st.statuses[selected],
                    percentage: st.statuses[selected] / status.nb,
                  })),
              })),
    };
  }

  const getInfo = (type) => {
    if (!type.subTypes?.length) return null;

    return (
      <div className="p-8">
        <div className="mb-4 text-base font-bold text-gray-900">{type.label}</div>
        <StatusTable className="grow" statuses={type.subTypes.map((t) => ({ ...t, status: t.label, nb: t.value, percentage: Math.round(t.percentage * 100) }))} nocols />
      </div>
    );
  };

  return (
    <DashboardBox
      title="Demandes d'équivalence de MIG"
      headerChildren={
        filtered &&
        selected && (
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {filtered.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )
      }
      childrenClassName="pt-4">
      {loading && (
        <div className="flex items-stretch justify-center">
          <StatusTable loading={loading} nocols colWidth="w-100" className="basis-2/4" />
          <div className="mx-6 flex items-stretch basis-1/4 ">
            <div className="w-[1px] bg-gray-300"></div>
          </div>
          <div className="flex basis-1/4">
            <LoadingDoughnut />
          </div>
        </div>
      )}
      {error && <div className="flex items-center justify-center p-8 text-center text-sm font-medium text-red-600">{error}</div>}
      {!loading && !error && filtered && (
        <div className="flex items-stretch justify-stretch">
          <StatusTable className="grow" statuses={statuses.map((s) => ({ ...s, status: s.label }))} loading={loading} nocols colWidth="w-100" />
          <div className="mx-12 shrink-0 flex items-stretch">
            <div className="w-[1px] bg-gray-300"></div>
          </div>
          <div>
            <FullDoughnut
              legendSide="right"
              maxLegends={3}
              labels={filtered.types.map((type) => type.label)}
              values={filtered.types.map((type) => Math.round(type.percentage * 100))}
              valueSuffix="%"
              legendUrls={filtered.types.map((type) => type.url)}
              tooltips={filtered.types.map((type) => type.value)}
              className="justify-center"
              legendInfoPanels={filtered?.types.map(getInfo)}
            />
          </div>
        </div>
      )}
    </DashboardBox>
  );
}
