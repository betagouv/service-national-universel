import React, { useEffect, useState } from "react";
import DashboardBox from "../../../../components/ui/DashboardBox";
import { FullDoughnut } from "../../../../components/graphs";
import Section from "../../../../components/ui/Section";
import api from "../../../../../../services/api";
import { translate } from "snu-lib/translation";
import StatusTable from "../../../../components/ui/StatusTable";
import { LoadingDoughnut } from "../../../../components/ui/loading";

export default function SectionStructures({ filters }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalStructures, setTotalStructures] = useState(0);
  const [nationalStructures, setNationalStructures] = useState(0);
  const [structures, setStructures] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await api.post("/elasticsearch/dashboard/engagement/structures", {
        filters: Object.fromEntries(Object.entries(filters)),
      });

      setTotalStructures(res.hits?.total?.value);
      setNationalStructures(res.aggregations?.total_with_network_name?.doc_count);
      setStructures(
        res.aggregations?.by_legal_status?.buckets.map((structure) => {
          structure.types = structure.by_type.buckets.map((type) => {
            return {
              _id: type.key,
              total: type.doc_count,
            };
          });
          return {
            _id: structure.key,
            label: translate(structure.key),
            total: structure.doc_count,
            info: getInfoPanel(structure),
          };
        }),
      );
    })();
  }, [filters]);

  function getInfoPanel(structure) {
    const total = structure.types ? structure.types.reduce((acc, type) => acc + type.total, 0) : 0;

    switch (structure.key) {
      case "PRIVATE":
      case "PUBLIC":
        return (
          <div className="p-8">
            <div className="mb-4 text-base font-bold text-gray-900">{translate(structure.key)}</div>
            <FullDoughnut
              legendSide="right"
              maxLegends={3}
              labels={structure.types.map((type) => translate(type._id))}
              values={structure.types.map((type) => Math.round((type.total / total) * 100))}
              legendUrls={structure.types.map((type) => `/structure?LEGAL_STATUS=%5B"${structure.key}"%5D&TYPE=%5B"${type._id}"%5D`)}
              valueSuffix="%"
              tooltips={structure.types.map((type) => type.total)}
            />
          </div>
        );
      case "ASSOCIATION": {
        const statuses = structure.types.map((type) => {
          return {
            status: translate(type._id),
            nb: type.total,
            percentage: Math.round((type.total / total) * 100),
            url: `/structure?LEGAL_STATUS=%5B"ASSOCIATION"%5D&TYPE=%5B"${type._id}"%5D`,
          };
        });
        return (
          <div className="p-8">
            <div className="mb-4 text-base font-bold text-gray-900">{translate(structure.key)}</div>
            <StatusTable statuses={statuses} />
          </div>
        );
      }
      default:
        return null;
    }
  }

  return (
    <Section title="Structures">
      {error ? (
        <div className="flex items-center justify-center p-8 text-center text-sm font-medium text-red-600">{error}</div>
      ) : (
        <div className="flex">
          <div className="mr-4 flex flex-[0_0_332px] flex-col">
            <DashboardBox title="Structures" className="grow" to="/structure">
              {loading ? <LoadingDoughnut /> : <div className="text-2xl font-bold hover:text-gray-900">{totalStructures}</div>}
            </DashboardBox>
            <DashboardBox title="Affiliées à un réseau national" className="grow" to="/structure">
              {loading ? <LoadingDoughnut /> : <div className="text-2xl font-bold">{nationalStructures}</div>}
            </DashboardBox>
          </div>
          <DashboardBox title="Catégories" subtitle="Sélectionnez une catégorie pour voir ses sous-catégories." className="flex grow flex-col" childrenClassName="grow">
            {loading ? (
              <div className="h-100 flex items-center justify-center">
                <LoadingDoughnut />
              </div>
            ) : (
              <FullDoughnut
                legendSide="left"
                maxLegends={2}
                labels={structures.map((structure) => structure.label)}
                values={structures.map((structure) => structure.total)}
                legendUrls={structures.map((structure) => `/structure?LEGAL_STATUS=%5B"${structure._id}"%5D`)}
                tooltipsPercent
                className="justify-center"
                legendInfoPanels={structures.map((structure) => structure.info)}
              />
            )}
          </DashboardBox>
        </div>
      )}
    </Section>
  );
}
