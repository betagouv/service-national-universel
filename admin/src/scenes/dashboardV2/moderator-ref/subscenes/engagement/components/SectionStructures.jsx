import React, { useEffect, useState } from "react";
import DashboardBox from "../../../../components/ui/DashboardBox";
import { FullDoughnut } from "../../../../components/graphs";
import Section from "../../../../components/ui/Section";
import api from "../../../../../../services/api";
import { translate } from "snu-lib";
import StatusTable from "../../../../components/ui/StatusTable";
import { LoadingDoughnut } from "../../../../components/ui/loading";
import { getNewLink } from "@/utils";
import queryString from "query-string";

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
      setLoading(false);
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
              legendUrls={structure.types.map((type) =>
                getNewLink({
                  base: `/structure`,
                  filter: filters,
                  filtersUrl: [queryString.stringify({ legalStatus: structure.key, types: type._id })],
                }),
              )}
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
            url: getNewLink({
              base: `/structure`,
              filter: filters,
              filtersUrl: [queryString.stringify({ legalStatus: "ASSOCIATION", types: type._id })],
            }),
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
            <DashboardBox title="Structures" className="grow" to={getNewLink({ base: `/structure`, filter: filters })}>
              {loading ? <LoadingDoughnut /> : <div className="text-2xl font-bold hover:text-gray-900">{totalStructures}</div>}
            </DashboardBox>
            <DashboardBox
              title="Affiliées à un réseau national"
              className="grow"
              to={getNewLink({ base: `/structure`, filter: filters, filtersUrl: [queryString.stringify({ networkExist: true })] })}>
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
                legendUrls={structures.map((structure) =>
                  getNewLink({
                    base: `/structure`,
                    filter: filters,
                    filtersUrl: [queryString.stringify({ legalStatus: structure._id })],
                  }),
                )}
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
