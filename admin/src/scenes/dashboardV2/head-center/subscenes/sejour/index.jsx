import React from "react";
import queryString from "query-string";
import { useSelector } from "react-redux";
import { HiOutlineChartSquareBar } from "react-icons/hi";

import api from "@/services/api";
import { getNewLink } from "@/utils";
import { Page, Header } from "@snu/ds/admin";

import DashboardContainer from "../../../components/DashboardContainer";
import BoxWithPercentage from "../../../components/sejour/BoxWithPercentage";
import Details from "@/scenes/dashboardV2/components/inscription/Details";
import Presences from "../../../components/sejour/Presences";
import StatusPhase1 from "../../../components/sejour/StatusPhase1";
import { useAsync } from "react-use";

export default function Index() {
  const { user, sessionPhase1 } = useSelector((state) => state.Auth);
  const cohort = sessionPhase1?.cohort;
  const sessionId = sessionPhase1?._id;
  const centerId = sessionPhase1?.cohesionCenterId;

  const selectedFilters = {
    cohort: [cohort],
  };

  const { value: data } = useAsync(async () => {
    const response = await api.post("/elasticsearch/dashboard/sejour/head-center", {
      filters: Object.fromEntries(Object.entries(selectedFilters)),
    });
    return response.resultYoung;
  }, []);

  return (
    <Page>
      <Header title="Tableau de bord" breadcrumb={[{ title: <HiOutlineChartSquareBar size={20} /> }, { title: "Tableau de bord" }]} />
      <DashboardContainer active="sejour" availableTab={["general", "sejour"]}>
        <div className="flex flex-col gap-8">
          <h1 className="text-[28px] font-bold leading-8 text-gray-900">Général</h1>
          <div className="flex items-stretch gap-4 ">
            <div className="flex w-[30%] flex-col gap-4">
              <BoxWithPercentage
                total={data?.sanitaryTotal || 0}
                number={data?.sanitary?.false || 0}
                title="Fiches Sanitaires"
                subLabel="non receptionnées"
                redirect={getNewLink({
                  base: `/centre/${centerId}/${sessionId}/fiche-sanitaire`,
                  filter: selectedFilters,
                  filtersUrl: [queryString.stringify({ cohesionStayMedicalFileReceived: "false" })],
                })}
              />
              <BoxWithPercentage
                total={data?.participationTotal || 0}
                number={data?.participation?.false || 0}
                title="Participation"
                subLabel="restants à confirmer"
                redirect={getNewLink({
                  base: `/centre/${centerId}/${sessionId}/general`,
                  filter: selectedFilters,
                  filtersUrl: [queryString.stringify({ youngPhase1Agreement: "false" })],
                })}
              />
            </div>
            <StatusPhase1 statusPhase1={data?.statusPhase1} total={data?.statusPhase1Total} filter={selectedFilters} role={user.role} sessionId={sessionId} centerId={centerId} />
          </div>
          <Presences
            presence={data?.presence}
            JDM={data?.JDM}
            depart={data?.depart}
            departTotal={data?.departTotal}
            departMotif={data?.departMotif}
            filter={selectedFilters}
            role={user.role}
            sessionId={sessionId}
            centerId={centerId}
            cohortHeadCenter={cohort}
          />
          <Details selectedFilters={selectedFilters} role={user.role} sessionId={sessionId} centerId={centerId} />
        </div>
      </DashboardContainer>
    </Page>
  );
}
