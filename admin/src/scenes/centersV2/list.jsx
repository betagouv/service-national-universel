import React, { useState } from "react";
import { BsDownload } from "react-icons/bs";
import { useSelector } from "react-redux";

import { ROLES, formatLongDateFR, getDepartmentNumber, translate, translateDomainCenter, translateTypologieCenter } from "snu-lib";
import Menu from "../../assets/icons/Menu";
import { Badge, TabItem } from "./components/commons";
import { orderCohort } from "../../components/filters-system-v2/components/filters/utils";
import { Header, Page } from "@snu/ds/admin";

import { useHistory, useParams } from "react-router-dom";

import ModalRattacherCentre from "./components/ModalRattacherCentre";

import { ExportComponent, Filters, ResultTable, Save, SelectedFilters } from "../../components/filters-system-v2";
import { getCohortGroups } from "@/services/cohort.service";
import { getDefaultCohort } from "@/utils/session";

export default function List() {
  const user = useSelector((state) => state.Auth.user);
  const cohorts = useSelector((state) => state.Cohorts);

  const history = useHistory();
  const { currentTab } = useParams();

  const [modalVisible, setModalVisible] = useState(false);

  React.useEffect(() => {
    const listTab = ["liste-centre"];
    if (!currentTab || !listTab.includes(currentTab)) return history.replace(`/centre/liste/liste-centre`);
  }, [currentTab]);

  const firstSession = getDefaultCohort(cohorts);

  return (
    <Page>
      <Header title="Centres" breadcrumb={[{ title: "Séjours" }, { title: "Centres" }]} actions={[].filter(Boolean)} />

      <div>
        <div className="flex flex-1">
          <TabItem icon={<Menu />} title="Liste des centres" onClick={() => history.replace(`/centre/liste/liste-centre`)} active={currentTab === "liste-centre"} />
        </div>
        <div className={`relative mb-8 items-start rounded-b-lg rounded-tr-lg bg-white`}>
          <div className="flex w-full flex-col pt-4">{currentTab === "liste-centre" && <ListCenter firstSession={firstSession} />}</div>
        </div>
      </div>
      <ModalRattacherCentre isOpen={modalVisible} onCancel={() => setModalVisible(false)} user={user} />
    </Page>
  );
}

const ListCenter = ({ firstSession }) => {
  const user = useSelector((state) => state.Auth.user);

  const [data, setData] = React.useState([]);
  const pageId = "centreList";
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const [paramData, setParamData] = React.useState({
    page: 0,
  });
  const [size, setSize] = useState(10);
  const filterArray = [
    { title: "Matricule", name: "matricule", missingLabel: "Non renseigné" },
    { title: "Cohorte", name: "cohorts", missingLabel: "Non renseignée", sort: (e) => orderCohort(e) },
    {
      title: "Région",
      name: "region",
      missingLabel: "Non renseignée",
      defaultValue: user.role === ROLES.REFERENT_REGION ? [user.region] : [],
    },
    {
      title: "Département",
      name: "department",
      missingLabel: "Non renseignée",
      translate: (e) => getDepartmentNumber(e) + " - " + e,
      defaultValue: user.role === ROLES.REFERENT_DEPARTMENT ? user.department : [],
    },
    {
      title: "Typologie",
      name: "typology",
      missingLabel: "Non renseignée",
      translate: (e) => translateTypologieCenter(e),
    },
    {
      title: "Domaine",
      name: "domain",
      missingLabel: "Non renseignée",
      translate: (e) => translateDomainCenter(e),
    },
  ];

  const history = useHistory();

  if (!firstSession) return <div></div>;
  return (
    <div className="flex-column flex-1 flex-wrap bg-white rounded-xl mb-4">
      <div className="mx-4">
        <div className="flex w-full flex-row justify-between">
          <Filters
            pageId={pageId}
            route="/elasticsearch/cohesioncenter/search?needSessionPhase1Info=true"
            setData={(value) => setData(value)}
            filters={filterArray}
            searchPlaceholder="Rechercher par mots clés, ville, code postal..."
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            paramData={paramData}
            setParamData={setParamData}
            size={size}
            intermediateFilters={[getCohortGroups("cohorts")]}
          />
          <ExportComponent
            title="Exporter"
            filters={filterArray}
            exportTitle="Centres_de_cohesion"
            route="/elasticsearch/cohesioncenter/export"
            transform={(all) => {
              return all?.map((data) => {
                return {
                  Matricule: data?.matricule,
                  Nom: data?.name,
                  "Désignation du centre": data?.centerDesignation,
                  "Cohorte(s)": data?.cohorts
                    ?.sort((a, b) => a.startDate - b.startDate)
                    .map((e) => e.cohort)
                    .join(", "),
                  "Accessibilité aux personnes à mobilité réduite": translate(data?.pmr),
                  "Capacité maximale d'accueil": data?.placesTotal,
                  Typologie: translateTypologieCenter(data?.typology),
                  Domaine: translateDomainCenter(data?.domain),
                  "Gestionnaire ou propriétaire": data?.complement,
                  Adresse: data?.address,
                  Ville: data?.city,
                  "Code postal": data?.zip,
                  Département: data?.department,
                  Académie: data?.academy,
                  Région: data?.region,
                  "Créé lé": formatLongDateFR(data.createdAt),
                  "Mis à jour le": formatLongDateFR(data.updatedAt),
                };
              });
            }}
            selectedFilters={selectedFilters}
            searchPlaceholder="Rechercher par mots clés, ville, code postal..."
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
          <SelectedFilters filterArray={filterArray} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} paramData={paramData} setParamData={setParamData} />
        </div>
      </div>

      <ResultTable
        paramData={paramData}
        setParamData={setParamData}
        currentEntryOnPage={data?.length}
        size={size}
        setSize={setSize}
        render={
          <div className="mt-6 mb-2 flex w-full flex-col gap-1">
            <hr />
            <div className="flex items-center py-3 px-4 text-xs uppercase text-gray-400">
              <div className="w-[40%]">Centre</div>
              <div className="w-[60%]">Cohortes à venir</div>
            </div>
            {data.map((hit) => (
              <Hit key={hit._id} hit={hit} history={history} onClick={() => history.push(`/centre/${hit._id}`)} />
            ))}
            <hr />
          </div>
        }
      />
    </div>
  );
};
const Hit = ({ hit, onClick, history }) => {
  const orderedSession = hit.sessionsPhase1.sort((a, b) => a.startDate - b.startDate);
  return (
    <>
      <hr />
      <div onClick={onClick} className="flex cursor-pointer items-center py-3 px-4 hover:bg-gray-50">
        <div className="flex w-[40%] flex-col gap-1">
          <div className="font-bold leading-6 text-gray-900">{hit?.name}</div>
          <div className="text-sm font-normal leading-4 text-gray-500">{`${hit?.city || ""} • ${hit?.department || ""}`}</div>
        </div>
        <div className="flex w-[60%] flex-wrap items-center">
          {orderedSession.map((sessionPhase1) => (
            <div className="p-1" key={sessionPhase1._id}>
              <div className="flex items-center">
                <Badge
                  onClick={(e) => {
                    e.stopPropagation();
                    history.push(`/centre/${sessionPhase1.cohesionCenterId}?cohorte=${sessionPhase1.cohort}`);
                  }}
                  cohort={sessionPhase1}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
