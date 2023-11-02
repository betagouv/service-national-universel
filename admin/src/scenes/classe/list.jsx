import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Page, Header, Container, Button, Badge } from "@snu/ds/admin";
import { HiPlus } from "react-icons/hi";
import ClasseIcon from "@/components/drawer/icons/Classe";
import { useHistory } from "react-router-dom";
import { Filters, ResultTable, Save, SelectedFilters, SortOption } from "../../components/filters-system-v2";
import { useSelector } from "react-redux";
import api from "../../services/api";
import { ROLES, translate, translateVisibilty } from "../../utils";
import DateFilter from "../../components/filters-system-v2/components/customComponent/DateFilter";
import { formatDateFR, getDepartmentNumber, translateApplication, translateMission, translateSource, MISSION_STATUS } from "snu-lib";
import { HiUsers } from "react-icons/hi";

export default function list() {
  const [classes, setClasses] = useState(true);

  //ICI ON PREND LEXEMPLE DES MISSIONS POUR LA DEMO, A SUPPRIMER ENSUITE
  const [mission, setMission] = useState(null);
  const [structure, setStructure] = useState();
  const user = useSelector((state) => state.Auth.user);
  const [data, setData] = useState([
    {
      _id: "653b6c145b79ba06a96c0e3c",
      name: "CLASS NAME",
      placeLeft: "10",
      placeTotal: "20",
      status: "DRAFT",
    },
    {
      _id: "65367584dc601b0685cf91f5",
      name: "CLASS NAME",
      placeLeft: "10",
      placeTotal: "20",
      status: "CANCEL",
    },
    {
      _id: "65254df5b8d07a068ee9328c",
      name: "CLASS NAME",
      placeLeft: "10",
      placeTotal: "20",
      status: "VALIDATED",
    },
    {
      _id: "65254d27b8d07a068ee93225",
      name: "CLASS NAME",
      placeLeft: "10",
      placeTotal: "20",
      status: "WAITING_VALIDATION",
    },
    {
      _id: "6524fc56d4c5ff068945e7cb",
      name: "CLASS NAME",
      placeLeft: "10",
      placeTotal: "20",
      status: "WAITING_CORRECTION",
    },
    {
      _id: "650dab3b4d1fa106860fba66",
      name: "CLASS NAME",
      placeLeft: "10",
      placeTotal: "20",
      status: "REFUSED",
    },
    {
      _id: "650da840eef483e2f104f095",
      name: "CLASS NAME",
      placeLeft: "10",
      placeTotal: "20",
      status: "DRAFT",
    },
    {
      _id: "650da6f34d1fa106860fb93e",
      name: "CLASS NAME",
      placeLeft: "10",
      placeTotal: "20",
      status: "WAITING_VALIDATION",
    },
    {
      _id: "650da6d04d1fa106860fb8d7",
      name: "CLASS NAME",
      placeLeft: "10",
      placeTotal: "20",
      status: "VALIDATED",
    },
    {
      _id: "650da6d04d1fa106860fb8d7",
      name: "CLASS NAME",
      placeLeft: "10",
      placeTotal: "20",
      status: "ARCHIVED",
    },
  ]);
  const pageId = "missions-list";
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({
    page: 0,
  });
  const [size, setSize] = useState(10);

  useEffect(() => {
    (async () => {
      if (!user.structureId) return;
      const { data } = await api.get(`/structure/${user.structureId}`);
      setStructure(data);
    })();
    return;
  }, []);

  const filterArray = [
    { title: "Région", name: "region", parentGroup: "Général", defaultValue: user.role === ROLES.REFERENT_REGION ? [user.region] : [] },
    {
      title: "Département",
      name: "department",
      parentGroup: "Général",
      missingLabel: "Non renseigné",
      defaultValue: user.role === ROLES.REFERENT_DEPARTMENT ? user.department : [],
      translate: (e) => getDepartmentNumber(e) + " - " + e,
    },
    {
      title: "Statut",
      name: "status",
      parentGroup: "Général",
      translate: (e) => translate(e),
    },
    {
      title: "Source",
      name: "isJvaMission",
      parentGroup: "Général",
      translate: (value) => translateSource(value),
    },
    {
      title: "Visibilité",
      name: "visibility",
      parentGroup: "Général",
      translate: (value) => translateVisibilty(value),
    },
    {
      title: "Domaine d'action principal",
      name: "mainDomain",
      parentGroup: "Modalités",
      translate: (value) => translate(value),
      missingLabel: "Non renseigné",
    },
    {
      title: "Places restantes",
      name: "placesLeft",
      parentGroup: "Modalités",
    },
    {
      title: "Tuteur",
      name: "tutorName",
      parentGroup: "Modalités",
    },
    {
      title: "Préparation Militaire",
      name: "isMilitaryPreparation",
      parentGroup: "Modalités",
      translate: (value) => translate(value),
    },
    {
      title: "Hébergement",
      name: "hebergement",
      parentGroup: "Modalités",
      translate: (value) => translate(value),
      missingLabel: "Non renseigné",
    },
    {
      title: "Hébergement Payant",
      name: "hebergementPayant",
      parentGroup: "Modalités",
      translate: (value) => translate(value),
      missingLabel: "Non renseigné",
    },
    {
      title: "Place occupées",
      name: "placesStatus",
      parentGroup: "Modalités",
      translate: (value) => translateMission(value),
      missingLabel: "Non renseigné",
    },
    {
      title: "Statut de candidature",
      name: "applicationStatus",
      parentGroup: "Modalités",
      missingLabel: "Aucune candidature ni proposition",
      translate: (value) => translateApplication(value),
    },
    {
      title: "Date de début",
      name: "fromDate",
      parentGroup: "Dates",
      customComponent: (setFilter, filter) => <DateFilter setValue={setFilter} value={filter} />,
      translate: formatDateFR,
    },
    {
      title: "Date de fin",
      name: "toDate",
      parentGroup: "Dates",
      customComponent: (setFilter, filter) => <DateFilter setValue={setFilter} value={filter} />,
      translate: formatDateFR,
    },
    user.role === ROLES.SUPERVISOR
      ? {
          title: "Structure",
          name: "structureName",
          parentGroup: "Structure",
        }
      : null,
  ].filter(Boolean);
  //FIN DE LA ZONE A SUPPRIMER

  return (
    <Page>
      <Header
        title="Liste de mes classes"
        breadcrumb={[{ title: <ClasseIcon className="scale-[65%]" /> }, { title: "Mes classes" }]}
        actions={[
          <Button key="empty" title={`(Voir template ${classes ? "vide" : "liste"})`} type="secondary" onClick={() => setClasses(classes ? undefined : [])} />,
          <Link key="view" to="/mes-classes/1" className="ml-2">
            <Button title="Vue classe" type="secondary" />
          </Link>,
          <Link key="list" to="/mes-classes/create" className="ml-2">
            <Button leftIcon={<ClasseIcon />} title="Créer une classe" />
          </Link>,
        ]}
      />
      {!classes && (
        <Container className="!p-8">
          <div className="py-6 bg-gray-50">
            <div className="flex items-center justify-center h-[136px] mb-4 text-lg text-gray-500 text-center">Vous n’avez pas encore créé de classe engagée</div>
            <div className="flex items-start justify-center h-[136px]">
              <Button type="wired" leftIcon={<HiPlus />} title="Créer une première classe engagée" />
            </div>
          </div>
        </Container>
      )}
      {classes && (
        <Container className="!p-3">
          <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
            <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
              <Filters
                pageId={pageId}
                route="/elasticsearch/mission/search"
                setData={(value) => setData(value)}
                filters={filterArray}
                searchPlaceholder="Rechercher par mots clés, ville, code postal..."
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                paramData={paramData}
                setParamData={setParamData}
                size={size}
              />
              <SortOption
                sortOptions={[
                  { label: "Date de création (récent > ancien)", field: "createdAt", order: "desc" },
                  { label: "Date de création (ancien > récent)", field: "createdAt", order: "asc" },
                  { label: "Nombre de place (croissant)", field: "placesLeft", order: "asc" },
                  { label: "Nombre de place (décroissant)", field: "placesLeft", order: "desc" },
                  { label: "Nom de la mission (A > Z)", field: "name.keyword", order: "asc" },
                  { label: "Nom de la mission (Z > A)", field: "name.keyword", order: "desc" },
                ]}
                selectedFilters={selectedFilters}
                paramData={paramData}
                setParamData={setParamData}
              />
            </div>
            <div className="mt-2 flex flex-row flex-wrap items-center px-4">
              <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
              <SelectedFilters
                filterArray={filterArray}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                paramData={paramData}
                setParamData={setParamData}
              />
            </div>

            <ResultTable
              paramData={paramData}
              setParamData={setParamData}
              currentEntryOnPage={data?.length}
              size={size}
              setSize={setSize}
              render={
                <div className="mt-6 mb-2 flex w-full flex-col divide-y divide-gray-100 border-y-[1px] border-gray-100">
                  <div className="flex items-center py-3 px-4 text-xs leading-5 font-[500] uppercase text-gray-500 ">
                    <div className="w-[40%]">Classes</div>
                    <div className="w-[20%]">Cohortes</div>
                    <div className="w-[20%]">Élèves</div>
                    <div className="w-[20%]">Statuts</div>
                  </div>
                  {data.map((hit) => (
                    <Hit
                      key={hit._id}
                      hit={hit}
                      callback={(e) => {
                        if (e._id === mission?._id) setMission(e);
                      }}
                    />
                  ))}
                  <div className="flex items-center py-3 px-4 text-xs uppercase text-gray-400 ">
                    <div className="w-[40%]">Classes</div>
                    <div className="w-[20%]">Cohortes</div>
                    <div className="w-[20%]">Élèves</div>
                    <div className="w-[20%]">Statuts</div>
                  </div>
                </div>
              }
            />
          </div>
        </Container>
      )}
    </Page>
  );
}

const Hit = ({ hit }) => {
  const history = useHistory();

  return (
    <>
      <div className="flex items-center py-3 px-4 hover:bg-gray-50">
        <div className="flex w-[40%] cursor-pointer items-center gap-4 " onClick={() => history.push(`/mission/${hit._id}`)}>
          <div className="flex w-full flex-col justify-center">
            <div className="m-0 table w-full table-fixed border-collapse">
              <div className="table-cell truncate font-bold text-gray-900">{hit.name}</div>
            </div>
            <div className="m-0 mt-1 table w-full table-fixed border-collapse">
              <div className="table-cel truncate text-xs font-[500] leading-5 text-gray-500 ">id: {hit._id}</div>
            </div>
          </div>
        </div>
        <div className="flex w-[20%] flex-col gap-2">
          <Badge title={"CLE 23-24"} leftIcon={<HiUsers color="#EC4899" size={20} />} />
        </div>
        <div className="flex w-[20%] flex-col gap-2">
          <Badge title={hit.placeLeft + "/" + hit.placeTotal} />
        </div>
        <div className="w-[20%]">
          <Badge title={translate(MISSION_STATUS[hit.status])} status={hit.status} />
        </div>
      </div>
    </>
  );
};
