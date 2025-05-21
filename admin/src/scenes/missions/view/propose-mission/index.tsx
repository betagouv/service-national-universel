import React from "react";
import { translateApplication, translatePhase2 } from "snu-lib";
import { Filters, ResultTable, Save, SelectedFilters } from "../../../../components/filters-system-v2";
import { orderCohort } from "../../../../components/filters-system-v2/components/filters/utils";
import MissionView from "../wrapper";
import { useQuery } from "@tanstack/react-query";
import YoungCard from "./YoungCard";
import { useHistory } from "react-router-dom";
import { getApplicationsByMissionId } from "../../../../services/applicationService";

export default function ProposeMission({ mission, updateMission }) {
  const history = useHistory();
  const [data, setData] = React.useState([]);
  const pageId = "propose-mission";
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const [paramData, setParamData] = React.useState({ page: 0 });
  const filterArray = [
    { title: "Cohorte", name: "cohort", missingLabel: "Non renseigné", sort: (e) => orderCohort(e) },
    {
      title: "Statut phase 2",
      name: "statusPhase2",
      missingLabel: "Non renseigné",
      translate: translatePhase2,
    },
    {
      title: "Statut mission (candidature)",
      name: "phase2ApplicationStatus",
      missingLabel: "Non renseigné",
      translate: translateApplication,
    },
  ];

  if (mission?.pendingApplications && mission?.placesLeft && mission.pendingApplications >= mission.placesLeft * 5) {
    history.push(`/mission/${mission._id}`);
  }

  return (
    <MissionView mission={mission} getMission={updateMission} tab="propose-mission">
      {mission.visibility === "HIDDEN" ? (
        <p>
          Cette mission est <strong>fermée</strong> aux candidatures.
        </p>
      ) : (
        <>
          <SearchBox
            pageId={pageId}
            setData={setData}
            filterArray={filterArray}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            paramData={paramData}
            setParamData={setParamData}
            mission={mission}
          />
          <ResultBox mission={mission} data={data} paramData={paramData} setParamData={setParamData} selectedFilters={selectedFilters} />
        </>
      )}
    </MissionView>
  );
}

const SearchBox = ({ pageId, setData, filterArray, selectedFilters, setSelectedFilters, paramData, setParamData, mission }) => {
  return (
    <div className="flex flex-col bg-white px-12 pt-12 pb-4">
      <div className="flex items-center justify-between rounded-lg">
        <Filters
          pageId={pageId}
          route={`/elasticsearch/young/propose-mission/${mission._id.toString()}/search`}
          setData={(value) => setData(value)}
          filters={filterArray}
          searchPlaceholder="Rechercher par prénom, nom, email, ville, code postal..."
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          paramData={paramData}
          setParamData={setParamData}
        />

        <div>
          <h3 className="text-gray-900 font-bold">Suggérez la mission à un volontaire</h3>
          <p className="text-gray-500">Un e-mail lui sera envoyé avec la présentation de la mission ainsi qu’un lien pour candidater.</p>
        </div>
      </div>
      <div className="mt-2 flex flex-row flex-wrap items-center">
        <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
        <SelectedFilters filterArray={filterArray} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} paramData={paramData} setParamData={setParamData} />
      </div>
    </div>
  );
};

const ResultBox = ({ mission, data, paramData, setParamData, selectedFilters }) => {
  const { data: applications } = useQuery({ queryKey: ["applicationsByMissionId", mission._id], queryFn: () => getApplicationsByMissionId(mission._id) });
  const hasSearch = selectedFilters?.searchbar?.filter[0]?.trim() === "" || !selectedFilters?.searchbar?.filter?.length;

  if (!data?.length) {
    return <p className="my-4 text-center w-full text-base font-medium text-gray-500">Aucun Résultat</p>;
  }

  return (
    <>
      {hasSearch ? (
        <p className="my-4 text-base font-medium text-gray-500">Recommandation de volontaires disponibles autour de la mission :</p>
      ) : (
        <p className="my-4 text-base font-medium text-gray-500">Résultat de la recherche :</p>
      )}
      <ResultTable
        paramData={paramData}
        setParamData={setParamData}
        currentEntryOnPage={data?.length}
        size={data?.length}
        setSize={(size) => setParamData({ ...paramData, size })}
        render={
          <div className="grid grid-cols-3 gap-4 mt-4">
            {data.map((hit) => (
              <YoungCard key={hit._id} young={hit} application={applications?.find((application) => application.youngId === hit._id)} mission={mission} />
            ))}
          </div>
        }
      />
    </>
  );
};
