import React, { useEffect, useState } from "react";
import { HiOutlineLockClosed } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import cx from "classnames";
import {
  formatDateFR,
  formatDateFRTimezoneUTC,
  formatLongDateFR,
  formatLongDateUTC,
  getDepartmentNumber,
  isCreateAuthorized,
  missionCandidatureExportFields,
  missionExportFields,
  MissionType,
  PERMISSION_RESOURCES,
  StructureType,
  translateApplication,
  translateMission,
  translatePhase2,
  translateSource,
} from "snu-lib";
import Img4 from "@/assets/JVA_round.png";
import Img3 from "@/assets/logo-snu.png";
import Breadcrumbs from "@/components/Breadcrumbs";
import SelectAction from "@/components/SelectAction";
import { Filters, ModalExport, ResultTable, Save, SelectedFilters, SortOption } from "@/components/filters-system-v2";
import DateFilter from "@/components/filters-system-v2/components/customComponent/DateFilter";
import api from "@/services/api";
import { ROLES, formatStringDateTimezoneUTC, translate, translateVisibilty } from "@/utils";
import SelectStatusMissionV2 from "./components/SelectStatusMissionV2";
import { AuthState } from "@/redux/auth/reducer";
import ExportCandidaturesModal, { getExportsFields as getExportsFieldsCandidatures } from "./components/ExportCandidaturesModal";
import { Filter } from "@/components/filters-system-v2/components/Filters";
import ExportMissionsModal from "./components/ExportMissionsModal";
import { Tooltip } from "@snu/ds/admin";

export const MAX_EXPORT_MISSIONS_SYNC = 5000;
export const MAX_EXPORT_CANDIDATURES_SYNC = 700;
export const MAX_EXPORT_CANDIDATURES = 5000;

interface MissionDto extends MissionType {
  structure: any;
}

async function transform(data, selectedFields) {
  const all = data;
  return all.map((data) => {
    if (!data.domains) data.domains = [];
    if (!data.structure) {
      data.structure = {};
      data.structure.types = [];
    }
    const allFields = {
      missionInfo: {
        "Titre de la mission": data.name,
        "Date du début": formatDateFRTimezoneUTC(data.startAt),
        "Date de fin": formatDateFRTimezoneUTC(data.endAt),
        "Nombre de volontaires recherchés": data.placesTotal,
        "Places restantes sur la mission": data.placesLeft,
        "Visibilité de la mission": translateVisibilty(data.visibility),
        "Source de la mission": data.isJvaMission === "true" ? "JVA" : "SNU",
      },
      status: {
        "Statut de la mission": translate(data.status),
        "Créée le": formatLongDateFR(data.createdAt),
        "Mise à jour le": formatLongDateFR(data.updatedAt),
        "Commentaire sur le statut": data.statusComment,
      },
      missionType: {
        "Domaine principal de la mission": translate(data.mainDomain) || "Non renseigné",
        "Domaine(s) secondaire(s) de la mission": data.mainDomain ? data.domains.filter((d) => d !== data.mainDomain)?.map(translate) : data.domains?.map(translate),
        Format: translate(data.format),
        "Préparation militaire": translate(data.isMilitaryPreparation),
      },
      missionDetails: {
        "Objectifs de la mission": data.description,
        "Actions concrètes": data.actions,
        Contraintes: data.contraintes,
        Durée: data.duration,
        "Fréquence estimée": data.frequence,
        "Période de réalisation": data.period?.map(translate)?.join(", "),
        "Hébergement proposé": translate(data.hebergement),
        "Hébergement payant": translate(data.hebergementPayant),
      },
      tutor: {
        "Id du tuteur": data.tutorId || "La mission n'a pas de tuteur",
        "Nom du tuteur": data.tutor?.lastName,
        "Prénom du tuteur": data.tutor?.firstName,
        "Email du tuteur": data.tutor?.email,
        "Portable du tuteur": data.tutor?.mobile,
        "Téléphone du tuteur": data.tutor?.phone,
      },
      location: {
        Adresse: data.address,
        "Code postal": data.zip,
        Ville: data.city,
        Département: data.department,
        Région: data.region,
      },
      structureInfo: {
        "Id de la structure": data.structureId,
        "Nom de la structure": data.structure.name,
        "Statut juridique de la structure": data.structure.legalStatus,
        "Type(s) de structure": data.structure.types.toString(),
        "Sous-type de structure": data.structure.sousType,
        "Présentation de la structure": data.structure.description,
      },
      structureLocation: {
        "Adresse de la structure": data.structure.address,
        "Code postal de la structure": data.structure.zip,
        "Ville de la structure": data.structure.city,
        "Département de la structure": data.structure.department,
        "Région de la structure": data.structure.region,
      },
    };

    const fields = { _id: data._id };
    for (const element of selectedFields) {
      let key;
      for (key in allFields[element]) fields[key] = allFields[element][key];
    }
    return fields;
  });
}

const optionsType = ["application", "contract", "militaryPreparation", "candidature", "engagement"];

async function transformCandidature(data, selectedFields, selectedFilters, user) {
  let all = data;

  const youngCategorie = ["representative2", "representative1", "location", "address", "imageRight", "contact", "identity", "status"];
  let fieldsToExportsYoung: any[] = [];

  selectedFields.forEach((selected) => {
    if (youngCategorie.includes(selected)) {
      const fields = missionCandidatureExportFields.find((f) => f.id === selected)?.fields || [];
      fieldsToExportsYoung = [...fieldsToExportsYoung, ...fields];
    }
  });

  //We want to export young info or application
  if ([...youngCategorie, "application"].some((e) => selectedFields.includes(e))) {
    // Add applications info
    const missionIds = [...new Set(data.map((item) => item._id.toString()).filter((e) => e))];
    const resultApplications = await api.post(`/elasticsearch/application/export`, {
      filters: { missionId: missionIds, status: selectedFilters.applicationStatus.filter },
      exportFields: missionCandidatureExportFields.find((f) => f.id === "application")?.fields,
    });
    if (resultApplications?.data?.length) {
      all = all.map((item) => ({ ...item, candidatures: resultApplications?.data?.filter((e) => e.missionId === item._id.toString()) }));
    } else {
      all = all.map((item) => ({ ...item, candidatures: [] }));
    }

    if (resultApplications?.data?.length) {
      // filter young on resultApplications response
      const youngsData = resultApplications.data.map((app) => app.young).filter((young) => young);
      // Add young info
      all = all.map((item) => {
        if (item.candidatures?.length) {
          item.candidatures = item.candidatures.map((candidature) => {
            const youngDetails = youngsData.find((young) => young._id === candidature.youngId);
            return { ...candidature, young: youngDetails };
          });
        }
        return item;
      });
    }
  }
  all = all.filter((data) => data.candidatures.length);

  let result: any[] = [];

  all.forEach((data) => {
    if (!data.structure) {
      data.structure = {};
      data.structure.types = [];
    }
    return data?.candidatures?.map((application) => {
      const allFields = {
        identity: {
          ID: application?.young?._id?.toString(),
          Prénom: application?.young?.firstName,
          Nom: application?.young?.lastName,
          Sexe: translate(application?.young?.gender),
          Cohorte: application?.young?.cohort,
          "Date de naissance": formatDateFRTimezoneUTC(application?.young?.birthdateAt),
        },
        contact: {
          Email: application?.young?.email,
          Téléphone: application?.young?.phone,
        },
        imageRight: {
          "Droit à l’image": translate(application?.young?.imageRight),
        },
        address: {
          "Issu de QPV": translate(application?.young?.qpv),
          "Adresse postale du volontaire": application?.young?.address,
          "Code postal du volontaire": application?.young?.zip,
          "Ville du volontaire": application?.young?.city,
          "Pays du volontaire": application?.young?.country,
        },
        location: {
          "Département du volontaire": application?.young?.department,
          "Académie du volontaire": application?.young?.academy,
          "Région du volontaire": application?.young?.region,
        },
        application: {
          "Statut de la candidature": translateApplication(application?.status),
          "Choix - Ordre de la candidature": application?.priority,
          "Candidature créée le": formatLongDateUTC(application?.createdAt),
          "Candidature mise à jour le": formatLongDateUTC(application?.updatedAt),
          "Statut du contrat d'engagement": translate(application?.contractStatus),
          "Pièces jointes à l’engagement": translate(`${optionsType.reduce((sum, option) => sum + application[option]?.length, 0) !== 0}`),
          "Statut du dossier d'éligibilité PM": translate(application?.young?.statusMilitaryPreparationFiles),
        },
        missionInfo: {
          "ID de la mission": data._id.toString(),
          "Titre de la mission": data.name,
          "Date du début": formatDateFRTimezoneUTC(data.startAt),
          "Date de fin": formatDateFRTimezoneUTC(data.endAt),
          "Domaine d'action principal": translate(data.mainDomain),
          "Préparation militaire": translate(data.isMilitaryPreparation),
        },
        missionTutor: {
          "Id du tuteur": data.tutorId || "La mission n'a pas de tuteur",
          "Nom du tuteur": data.tutor?.lastName,
          "Prénom du tuteur": data.tutor?.firstName,
          "Email du tuteur": data.tutor?.email,
          "Portable du tuteur": data.tutor?.mobile,
          "Téléphone du tuteur": data.tutor?.phone,
        },
        missionlocation: {
          "Adresse de la mission": data.address,
          "Code postal de la mission": data.zip,
          "Ville de la mission": data.city,
          "Département de la mission": data.department,
          "Région de la mission": data.region,
        },
        structureInfo: {
          "Id de la structure": data.structureId,
          "Nom de la structure": data.structure.name,
          "Statut juridique de la structure": data.structure.legalStatus,
          "Type de structure": data.structure.types.toString(),
          "Sous-type de structure": data.structure.sousType,
          "Présentation de la structure": data.structure.description,
        },
        structureLocation: {
          "Adresse de la structure": data.structure.address,
          "Code postal de la structure": data.structure.zip,
          "Ville de la structure": data.structure.city,
          "Département de la structure": data.structure.department,
          "Région de la structure": data.structure.region,
        },
        status: {
          "Statut général": translate(application?.young?.status),
          "Statut Phase 2": translatePhase2(application?.young?.statusPhase2),
          "Dernier statut le": formatLongDateFR(application?.young?.lastStatusAt),
        },
        representative1: {
          "Statut représentant légal 1": translate(application?.young?.parent1Status),
          "Prénom représentant légal 1": application?.young?.parent1FirstName,
          "Nom représentant légal 1": application?.young?.parent1LastName,
          "Email représentant légal 1": application?.young?.parent1Email,
          "Téléphone représentant légal 1": application?.young?.parent1Phone,
          "Adresse représentant légal 1": application?.young?.parent1Address,
          "Code postal représentant légal 1": application?.young?.parent1Zip,
          "Ville représentant légal 1": application?.young?.parent1City,
          "Département représentant légal 1": application?.young?.parent1Department,
          "Région représentant légal 1": application?.young?.parent1Region,
        },
        representative2: {
          "Statut représentant légal 2": translate(application?.young?.parent2Status),
          "Prénom représentant légal 2": application?.young?.parent2FirstName,
          "Nom représentant légal 2": application?.young?.parent2LastName,
          "Email représentant légal 2": application?.young?.parent2Email,
          "Téléphone représentant légal 2": application?.young?.parent2Phone,
          "Adresse représentant légal 2": application?.young?.parent2Address,
          "Code postal représentant légal 2": application?.young?.parent2Zip,
          "Ville représentant légal 2": application?.young?.parent2City,
          "Département représentant légal 2": application?.young?.parent2Department,
          "Région représentant légal 2": application?.young?.parent2Region,
        },
      };
      if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role)) {
        delete allFields.address["Issu de QPV"];
      }
      const fields: any = {};
      for (const element of selectedFields) {
        let key;
        for (key in allFields[element]) fields[key] = allFields[element][key];
      }
      result = [...result, fields];
    });
  });
  return result;
}

export default function List() {
  const [mission, setMission] = useState<MissionType | null>(null);
  const [structure, setStructure] = useState<StructureType>();
  const user = useSelector((state: AuthState) => state.Auth.user);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExportCandidatureOpen, setIsExportCandidatureOpen] = useState(false);
  const history = useHistory();

  //List state
  const [data, setData] = useState<MissionDto[]>([]);
  const pageId = "missions-list";
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [paramData, setParamData] = useState<{
    page: number;
    count?: number;
  }>({
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

  //Filters
  const filterArray: Filter[] = [
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
    ...(user.role === ROLES.SUPERVISOR
      ? [
          {
            title: "Structure",
            name: "structureName",
            parentGroup: "Structure",
          },
        ]
      : []),
  ];

  return (
    <>
      <Breadcrumbs items={[{ title: "Engagement" }, { label: "Missions" }]} />
      <div className="mb-8 flex w-full flex-row" style={{ fontFamily: "Marianne" }}>
        <div className="flex w-full flex-1 flex-col px-8">
          <div className="flex items-center justify-between py-8">
            <div className="text-2xl font-bold leading-7 text-[#242526]">Missions</div>
            <div className="flex flex-row items-center gap-3 text-sm">
              {structure &&
                structure.status !== "DRAFT" &&
                isCreateAuthorized({ user, resource: PERMISSION_RESOURCES.MISSION, context: { structure: { _id: structure._id, networkId: structure.networkId! } } }) && (
                  <button className="cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-white" onClick={() => history.push(`/mission/create/${user.structureId}`)}>
                    Nouvelle mission
                  </button>
                )}
              <SelectAction
                title="Exporter"
                alignItems="right"
                buttonClassNames="cursor-pointer text-white bg-blue-600"
                textClassNames="text-sm"
                rightIconClassNames="text-white opacity-70"
                optionsGroup={[
                  {
                    key: "export",
                    items: [
                      {
                        key: "exportMission",
                        // @ts-ignore
                        action: () => {
                          if (paramData?.count) {
                            setIsExportOpen(true);
                          }
                        },
                        render: (
                          <div className={cx("cursor-pointer p-2 px-3 text-sm text-gray-700 hover:bg-gray-50", !paramData?.count ? "opacity-50" : "")}>
                            Informations de missions
                          </div>
                        ),
                      },
                      {
                        key: "exportCandidature",
                        // @ts-ignore
                        action: () => {
                          if (paramData?.count && paramData?.count <= MAX_EXPORT_CANDIDATURES) {
                            setIsExportCandidatureOpen(true);
                          }
                        },
                        render: (
                          <Tooltip
                            title={`Vous ne pouvez pas exporter les candidatures pour plus de ${MAX_EXPORT_CANDIDATURES} missions à la fois.
                          Modifiez les filtres pour réduire le nombre de missions à exporter.`}
                            disabled={!paramData?.count || paramData?.count <= MAX_EXPORT_CANDIDATURES}>
                            <div
                              className={cx(
                                "cursor-pointer p-2 px-3 text-sm text-gray-700 hover:bg-gray-50",
                                !paramData?.count || paramData?.count > MAX_EXPORT_CANDIDATURES ? "opacity-50" : "",
                              )}>
                              Informations de candidatures
                            </div>
                          </Tooltip>
                        ),
                      },
                    ],
                  },
                ]}
              />
            </div>
            {paramData?.count && paramData?.count <= MAX_EXPORT_MISSIONS_SYNC && (
              <ModalExport
                isOpen={isExportOpen}
                setIsOpen={setIsExportOpen}
                route="/elasticsearch/mission/export"
                transform={transform}
                exportFields={user.role === ROLES.RESPONSIBLE ? missionExportFields.filter((e) => !e.title.includes("structure")) : missionExportFields}
                exportTitle="missions"
                totalHits
                selectedFilters={selectedFilters}
              />
            )}
            {paramData?.count && paramData?.count > MAX_EXPORT_MISSIONS_SYNC && (
              <ExportMissionsModal user={user} selectedFilters={selectedFilters} onClose={() => setIsExportOpen(false)} isOpen={isExportOpen} />
            )}
            {paramData?.count && paramData?.count <= MAX_EXPORT_CANDIDATURES_SYNC && (
              <ModalExport
                isOpen={isExportCandidatureOpen}
                setIsOpen={setIsExportCandidatureOpen}
                route="/elasticsearch/mission/export"
                transform={(data, selectedFields) => transformCandidature(data, selectedFields, selectedFilters, user)}
                exportFields={getExportsFieldsCandidatures(user)}
                exportTitle="candidatures"
                totalHits={false}
                selectedFilters={selectedFilters}
              />
            )}
            {paramData?.count && paramData?.count > MAX_EXPORT_CANDIDATURES_SYNC && (
              <ExportCandidaturesModal user={user} selectedFilters={selectedFilters} onClose={() => setIsExportCandidatureOpen(false)} isOpen={isExportCandidatureOpen} />
            )}
          </div>
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
                pagination={paramData}
                onPaginationChange={setParamData}
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
                  <div className="flex items-center py-3 px-4 text-xs uppercase text-gray-400 ">
                    <div className="w-[40%]">Mission</div>
                    <div className="w-[5%]"></div>
                    <div className="w-[15%]">Places</div>
                    <div className="w-[20%]">Dates</div>
                    <div className="w-[20%]">Statut</div>
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
                </div>
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}

interface HitProps {
  hit: MissionDto;
  callback: (mission: MissionDto) => void;
}

const Hit = ({ hit, callback }: HitProps) => {
  const onChangeStatus = (e: MissionDto) => {
    callback(e);
  };
  return (
    <>
      <div className="flex items-center py-3 px-4 hover:bg-gray-50">
        <Link to={`/mission/${hit._id}`} className="flex w-[40%] cursor-pointer items-center gap-4 ">
          {hit.isJvaMission === "true" ? (
            <img src={Img4} className="mx-auto h-8 w-8 group-hover:scale-105" />
          ) : (
            <img src={Img3} className="mx-auto h-8 w-8 group-hover:scale-105" />
          )}
          <div className="flex w-full flex-col justify-center">
            <div className="m-0 table w-full table-fixed border-collapse">
              <div className="table-cell truncate font-bold text-gray-900">{hit.name}</div>
            </div>
            <div className="m-0 mt-1 table w-full table-fixed border-collapse">
              <div className="table-cel truncate text-sm font-normal leading-4 text-gray-600 ">
                {hit.address} • {hit.city} ({hit.department})
              </div>
            </div>
            <div className="m-0 mt-1 table w-full table-fixed border-collapse">
              <div className="table-cel truncate text-sm leading-4 text-gray-500 font-bold">{hit.structureName}</div>
            </div>
          </div>
        </Link>
        <Link to={`/mission/${hit._id}`} className="w-[5%]">
          {hit?.visibility === "HIDDEN" && (
            <div className="group relative cursor-pointer">
              <HiOutlineLockClosed size={20} className="text-gray-400" />
              <div className="absolute bottom-[calc(100%+15px)] left-[50%] z-10 hidden min-w-[275px] translate-x-[-58%] rounded-xl bg-white px-3 py-2.5 text-center text-xs leading-5 text-gray-600 drop-shadow-xl group-hover:block">
                <div className="absolute left-[50%] bottom-[-5px] h-[15px] w-[15px] translate-x-[-50%] rotate-45 bg-white"></div>
                La mission est <strong>fermée</strong> aux candidatures
              </div>
            </div>
          )}
        </Link>

        <Link to={`/mission/${hit._id}`} className="flex w-[15%] flex-col gap-2">
          <p className="text-sm font-normal leading-none text-gray-900">{hit.placesLeft} places(s)</p>
          <p className="text-sm font-normal leading-none text-gray-500">
            sur <span className="text-gray-900">{hit.placesTotal}</span>
          </p>
        </Link>
        <Link to={`/mission/${hit._id}`} className="flex w-[20%] flex-col gap-2 text-sm font-normal leading-none text-gray-500">
          <p>
            Du <span className="text-gray-900">{formatStringDateTimezoneUTC(hit.startAt)}</span>
          </p>
          <p>
            Au <span className="text-gray-900">{formatStringDateTimezoneUTC(hit.endAt)}</span>
          </p>
        </Link>
        <div className="w-[20%]">
          {/* @ts-ignore */}
          <SelectStatusMissionV2 hit={hit} callback={onChangeStatus} />
        </div>
      </div>
    </>
  );
};
