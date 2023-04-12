import React, { useEffect, useState } from "react";
import DashboardBox from "../../../../components/ui/DashboardBox";
import { FullDoughnut } from "../../../../components/graphs";
import Section from "../../../../components/ui/Section";
import api from "../../../../../../services/api";
import { translate } from "snu-lib/translation";
import Loader from "../../../../../../components/Loader";

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
        for (const structure of result.data) {
          total += structure.total;
          national += structure.national;
        }
        setTotalStructures(total);
        setNationalStructures(national);
        setStructures(
          result.data.map((structure) => ({
            _id: translate(structure._id),
            total: structure.total,
            national: structure.national,
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

  return (
    <Section title="Structures">
      {error ? (
        <div className="flex justify-center items-center text-center text-sm text-red-600 font-medium p-8">{error}</div>
      ) : loading ? (
        <div className="flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <div className="flex">
          <div className="flex flex-col flex-[0_0_332px] mr-4">
            <DashboardBox title="Structures" className="grow">
              <div className="text-2xl font-bold">{totalStructures}</div>
            </DashboardBox>
            <DashboardBox title="Affiliées à un réseau national" className="grow">
              <div className="text-2xl font-bold">{nationalStructures}</div>
            </DashboardBox>
          </div>
          <DashboardBox title="Catégories" subtitle="Sélectionnez une catégorie pour voir ses sous-catégories." className="grow">
            <FullDoughnut
              legendSide="left"
              maxLegends={2}
              labels={structures.map((structure) => structure._id)}
              values={structures.map((structure) => structure.total)}
              tooltipsPercent
            />
          </DashboardBox>
        </div>
      )}
    </Section>
  );
}
