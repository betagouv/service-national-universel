import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";

import { AffectationRoutes } from "snu-lib";
import { Button } from "@snu/ds/admin";

import Loader from "@/components/Loader";
import { CohortState } from "@/redux/cohorts/reducer";
import { AffectationService } from "@/services/affectationService";

import NoticeSection from "./partials/NoticeSection";
import SummarySection from "./partials/SummarySection";
import DetailCentre from "./partials/DetailCentre";
import DetailLigneDeBus from "./partials/DetailLigneDeBus";
import DetailNonAffectes from "./partials/NonAffectesSection";

export default function RapportPdfPage() {
  const { id } = useParams<{ id: string }>();
  const cohorts = useSelector((state: CohortState) => state.Cohorts);

  const {
    isFetching: isLoading,
    error,
    data: analytics,
  } = useQuery<AffectationRoutes["GetSimulationAnalytics"]["response"]>({
    queryKey: ["phase-simulations"],
    queryFn: async () => AffectationService.getSimulationAnalytics(id),
  });

  useEffect(() => {
    if (analytics?.sessionId) {
      const cohortName = cohorts.find((cohort) => cohort._id === analytics.sessionId)?.name?.replaceAll(" ", "");
      const rapportDate = analytics.createdAt?.replaceAll(":", "-")?.replace(".", "-");
      document.title = `rapport_${cohortName}_${rapportDate}`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analytics?.sessionId]);

  return (
    <div className="p-12">
      {isLoading && (
        <div className="flex items-center justify-center h-screen-1/4">
          <Loader />
        </div>
      )}
      {error && "Une erreur est survenue"}
      {!isLoading && !error && analytics && (
        <div>
          <Button title="Imprimer le rapport" onClick={() => window.print()} className="fixed top-4 right-4 print:hidden" />
          <SummarySection analytics={analytics} />
          <NoticeSection />
          {analytics?.regions &&
            Object.keys(analytics.regions).map((region) => (
              <section key={region} className="break-after-page p-8">
                <h2 className="text-4xl font-bold mb-16 uppercase">{region}</h2>
                {analytics.regions[region].map((centre) => (
                  <section key={centre.id} className="break-after-page">
                    <DetailCentre centre={centre} />
                    <DetailLigneDeBus centre={centre} />
                  </section>
                ))}
              </section>
            ))}
          <DetailNonAffectes analytics={analytics} />
        </div>
      )}
    </div>
  );
}
