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
    loadData();
  }, [filters]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const result = await api.post(`/dashboard/engagement/structures`, { filters });
      if (result.ok) {
        let total = 0;
        let national = 0;
        let byStatus = {};

        for (const structure of result.data) {
          if (byStatus[structure._id.legalStatus] === undefined) {
            byStatus[structure._id.legalStatus] = {
              _id: structure._id.legalStatus,
              total: 0,
              national: 0,
              types: [],
            };
          }
          byStatus[structure._id.legalStatus].total += structure.total;
          byStatus[structure._id.legalStatus].national += structure.national;
          byStatus[structure._id.legalStatus].types.push({
            _id: structure._id.type,
            total: structure.total,
            national: structure.national,
          });

          total += structure.total;
          national += structure.national;
        }

        setTotalStructures(total);
        setNationalStructures(national);

        setStructures(
          Object.values(byStatus).map((structure) => ({
            _id: structure._id,
            label: translate(structure._id),
            total: structure.total,
            national: structure.national,
            info: getInfoPanel(structure),
          })),
        );
      } else {
        console.log("error : ", result);
        setError("Erreur: impossible de charger les données.");
      }
    } catch (err) {
      console.log("Error loading structures data", err);
      setError("Erreur: impossible de charger les données.");
    }
    setLoading(false);
  }

  function getInfoPanel(structure) {
    const total = structure.types ? structure.types.reduce((acc, type) => acc + type.total, 0) : 0;

    switch (structure._id) {
      case "PRIVATE":
      case "PUBLIC":
        return (
          <div className="p-8">
            <div className="mb-4 text-base font-bold text-gray-900">{translate(structure._id)}</div>
            <FullDoughnut
              legendSide="right"
              maxLegends={3}
              labels={structure.types.map((type) => translate(type._id))}
              values={structure.types.map((type) => Math.round((type.total / total) * 100))}
              legendUrls={structure.types.map((type) => `/structure?LEGAL_STATUS=%5B"${structure._id}"%5D&TYPE=%5B"${type._id}"%5D`)}
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
            <div className="mb-4 text-base font-bold text-gray-900">{translate(structure._id)}</div>
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
