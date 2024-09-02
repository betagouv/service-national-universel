import React, { useState } from "react";
import { BsDownload } from "react-icons/bs";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { COHORTS_WITH_JDM_COUNT, getDepartmentNumber, ROLES, translateInscriptionStatus, translatePhase1, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { ExportComponent, Filters, ResultTable, Save, SelectedFilters } from "../../components/filters-system-v2";
import { Title } from "./components/commons";

export default function ListPresence() {
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();

  const [data, setData] = React.useState([]);
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const [paramData, setParamData] = React.useState({ page: 0 });
  const [size, setSize] = useState(10);

  const pageId = "centrePresence";
  const selectedCohorts = selectedFilters?.cohorts?.filter;

  const filterArray = [
    { title: "Cohorte", name: "cohorts", missingLabel: "Non renseignée", parentGroup: "Centre" },
    ![ROLES.REFERENT_DEPARTMENT].includes(user.role)
      ? {
          title: "Région",
          name: "region",
          missingLabel: "Non renseignée",
          defaultValue: user.role === ROLES.REFERENT_REGION ? [user.region] : [],
          parentGroup: "Centre",
        }
      : null,
    {
      title: "Département",
      name: "department",
      missingLabel: "Non renseignée",
      translate: (e) => getDepartmentNumber(e) + " - " + e,
      defaultValue: user.role === ROLES.REFERENT_DEPARTMENT ? user.department : [],
      parentGroup: "Centre",
    },
    ![ROLES.REFERENT_DEPARTMENT].includes(user.role)
      ? {
          title: "Académie",
          name: "academy",
          missingLabel: "Non renseignée",
          parentGroup: "Centre",
        }
      : null,
    {
      name: "status",
      title: "Statut d’inscription",
      fullValue: "Tous",
      options: Object.values(YOUNG_STATUS).map((status) => ({ key: status })),
      translate: translateInscriptionStatus,
      disabledBaseQuery: true,
      parentGroup: "Volontaire",
    },
    {
      name: "statusPhase1",
      title: "Statut de phase 1",
      fullValue: "Tous",
      options: Object.keys(YOUNG_STATUS_PHASE1)
        .filter((s) => ![YOUNG_STATUS_PHASE1.WAITING_LIST, YOUNG_STATUS_PHASE1.WITHDRAWN].includes(s))
        .map((status) => ({ key: status })),
      translate: translatePhase1,
      disabledBaseQuery: true,
      parentGroup: "Volontaire",
    },
    user.role === ROLES.ADMIN ? { title: "Code", name: "code2022", missingLabel: "Non renseignée", parentGroup: "Centre" } : null,
  ].filter((e) => e);

  return (
    <div className="flex w-full flex-1 flex-col gap-8 p-8">
      <Title>Centres</Title>
      <div className="flex-column flex-1 flex-wrap rounded-lg bg-white py-4">
        <div className="mx-4">
          <div className="flex w-full flex-row justify-between">
            <Filters
              pageId={pageId}
              route="/elasticsearch/cohesioncenter/presence/search"
              setData={(value) => setData(value)}
              filters={filterArray}
              searchPlaceholder="Rechercher par mots clés, ville, code postal..."
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              paramData={paramData}
              setParamData={setParamData}
              size={size}
            />
            <ExportComponent
              title="Exporter"
              route="/elasticsearch/cohesioncenter/presence/export"
              filters={filterArray}
              exportTitle="Centres_de_cohesion"
              transform={async (all) => {
                return all?.map((data) => {
                  return {
                    Id: data._id.toString(),
                    "Code du centre": data.code2022,
                    Nom: data.name,
                    "Présence JDM - Présent": data.presenceJDMOui || 0,
                    "Présence JDM - Absent": data.presenceJDMNon || 0,
                    "Présence JDM - Non renseigné": data.presenceJDMNR || 0,
                    "Présence JDM - Non renseigné (%)": (Math.round((data.presenceJDMNR / data.total) * 100) || 0) + "%",
                    "Présence à l’arrivée - Présent": data.presenceOui || 0,
                    "Présence à l’arrivée - Absent": data.presenceNon || 0,
                    "Présence à l’arrivée - Non renseigné": data.presenceNR || 0,
                    "Présence à l’arrivée - Non renseigné (%)": (Math.round((data.presenceNR / data.total) * 100) || 0) + "%",
                    Départ: data.departOui || 0,
                    "Fiche sanitaire - Renseignée": data.sanitaryFieldOui || 0,
                    "Fiche sanitaire - Non renseignée": data.sanitaryFieldNon + data.sanitaryFieldNR || 0,
                    "Fiche sanitaire - Non renseignée (%)": (Math.round(((data.sanitaryFieldNon + data.sanitaryFieldNR) / data.total) * 100) || 0) + "%",
                    "Total des jeunes": data.total || 0,
                  };
                });
              }}
              selectedFilters={selectedFilters}
              icon={<BsDownload className="text-gray-400" />}
              customCss={{
                override: true,
                button: `text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
                loadingButton: `text-grey-700 bg-white  border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
              }}
            />
          </div>
          <div className="mt-2 flex flex-row flex-wrap items-center">
            <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
            <SelectedFilters
              filterArray={filterArray}
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              paramData={paramData}
              setParamData={setParamData}
            />
          </div>
        </div>
        <ResultTable
          paramData={paramData}
          setParamData={setParamData}
          currentEntryOnPage={data?.length}
          size={size}
          setSize={setSize}
          render={
            <div className="mt-6 mb-2 flex w-full flex-col border-y-[1px] border-gray-100">
              <div className="flex items-center py-3 px-4 text-xs uppercase text-gray-400">
                <div className="w-[30%] uppercase">Centre</div>
                {selectedCohorts?.length && selectedCohorts?.every((value) => !COHORTS_WITH_JDM_COUNT.includes(value)) ? null : (
                  <div className="w-[20%] uppercase">présence JDM</div>
                )}
                <div className="w-[20%] uppercase">présence à l’arrivée</div>
                <div className="w-[10%] uppercase">départ</div>
                <div className="w-[20%] uppercase">FICHE SANITAIRE</div>
              </div>
              {data.map((hit) => (
                <Hit key={hit._id} hit={hit} selectedCohorts={selectedCohorts} onClick={() => history.push(`/centre/${hit._id}`)} />
              ))}
            </div>
          }
        />
      </div>
    </div>
  );
}

const Hit = ({ hit, selectedCohorts, onClick }) => {
  if (!hit) return <div></div>;
  return (
    <div onClick={onClick} className="flex cursor-pointer items-center border-t-[1px] border-gray-100 py-3 px-4 hover:bg-gray-50">
      <div className="flex w-[30%] flex-col gap-1">
        <div className="truncate font-bold leading-6 text-gray-900">{hit.name}</div>
        <div className="text-xs font-normal leading-4 text-gray-500">{`${hit.city || ""} • ${hit.department || ""}`}</div>
      </div>
      {selectedCohorts.length && selectedCohorts?.every((value) => !COHORTS_WITH_JDM_COUNT.includes(value)) ? null : (
        <div className="flex w-[20%] flex-col gap-2">
          {hit.cohorts?.every((value) => !COHORTS_WITH_JDM_COUNT.includes(value)) ? (
            <span className="text-xs font-normal uppercase leading-none text-gray-500">non renseigné</span>
          ) : (
            <>
              <span className="text-sm font-normal leading-none text-gray-900">
                <strong>{hit.presenceJDMOui || 0}</strong> Présents <strong>{hit.presenceJDMNon || 0}</strong> Absents
              </span>
              <span className="text-xs font-normal uppercase leading-none text-gray-500">
                <strong>{hit.presenceJDMNR || 0}</strong> non renseignés ({Math.round((hit.presenceJDMNR / hit.total) * 100) || 0}%)
              </span>
            </>
          )}
        </div>
      )}
      <div className="flex w-[20%] flex-col gap-2">
        <>
          <span className="text-sm font-normal leading-none text-gray-900">
            <strong>{hit.presenceOui || 0}</strong> Présents <strong>{hit.presenceNon || 0}</strong> Absents
          </span>
          <span className="text-xs font-normal uppercase leading-none text-gray-500">
            <strong>{hit.presenceNR || 0}</strong> non renseignés ({Math.round((hit.presenceNR / hit.total) * 100) || 0}%)
          </span>
        </>
      </div>
      <div className="flex w-[10%] items-center text-sm font-normal leading-none text-gray-900">
        <strong>{hit.departOui || 0}</strong>
      </div>
      <div className="flex w-[20%] flex-col gap-2">
        <>
          <span className="text-sm font-normal leading-none text-gray-900">
            <strong>{hit.sanitaryFieldOui || 0}</strong> Renseignées ({Math.round((hit.sanitaryFieldOui / hit.total) * 100) || 0}%)
          </span>
          <span className="text-sm font-normal leading-none text-gray-900">
            <strong>{hit.sanitaryFieldNR + hit.sanitaryFieldNon || 0}</strong> Non renseignées ({Math.round(((hit.sanitaryFieldNR + hit.sanitaryFieldNon) / hit.total) * 100) || 0}
            %)
          </span>
        </>
      </div>
    </div>
  );
};
