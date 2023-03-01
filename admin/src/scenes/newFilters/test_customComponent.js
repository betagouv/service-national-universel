import { DataSearch, MultiDropdownList, ReactiveBase, ReactiveComponent } from "@appbaseio/reactivesearch";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { HiOutlineLockClosed } from "react-icons/hi";
import { formatLongDateUTC, missionCandidatureExportFields, missionExportFields, translateApplication, translateMission, translatePhase2 } from "snu-lib";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loader from "../../components/Loader";
import api from "../../services/api";
import { ES_NO_LIMIT, formatDateFRTimezoneUTC, formatLongDateFR, formatStringDateTimezoneUTC, ROLES, translate, translateVisibilty } from "../../utils";
import SelectStatusMissionV2 from "../missions/components/SelectStatusMissionV2";

import ListFiltersPopOver from "./filters/ListFiltersPopOver";
import ResultTable from "./ResultTable";
import DatePickerWrapper from "../../components/filters/DatePickerWrapper";

const FILTERS = [
  "DOMAIN",
  "SEARCH",
  "STATUS",
  "PLACES",
  "LOCATION",
  "TUTOR",
  "REGION",
  "DEPARTMENT",
  "STRUCTURE",
  "MILITARY_PREPARATION",
  "DATE",
  "SOURCE",
  "VISIBILITY",
  "HEBERGEMENT",
  "HEBERGEMENT_PAYANT",
  "PLACESTATUS",
  "APPLICATIONSTATUS",
];

const optionsType = ["contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles"];

export default function List() {
  const [mission, setMission] = useState(null);
  const [structure, setStructure] = useState();
  const [structureIds, setStructureIds] = useState();
  const [filterVisible, setFilterVisible] = useState(false);
  const user = useSelector((state) => state.Auth.user);
  const [infosHover, setInfosHover] = useState(false);
  const [infosClick, setInfosClick] = useState(false);
  const toggleInfos = () => {
    setInfosClick(!infosClick);
  };
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExportCandidatureOpen, setIsExportCandidatureOpen] = useState(false);
  const [applicationStatusFilter, setApplicationStatusFilter] = useState([]);
  const history = useHistory();

  // States for filters
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = React.useState({});

  // filtre non obligatoire
  const [selectedSort, setSelectedSort] = React.useState({});
  const size = 20;

  const searchBarObject = {
    placeholder: "Rechercher une ligne (numéro, ville, region)",
    datafield: ["name.folded", "structureName.folded", "city.folded", "zip"],
  };
  const filterArray = [
    { title: "Statut", name: "statut", datafield: "status.keyword", parentGroup: "Ligne de Bus", missingLabel: "Non renseignée", translate: translate },
    { title: "Date", name: "date", datafield: "", parentGroup: "Ligne de Bus", missingLabel: "Non renseignée", customComponent: "dateRange" },
  ];

  const handleShowFilter = () => setFilterVisible(!filterVisible);
  const getDefaultQuery = () => {
    if (user.role === ROLES.SUPERVISOR)
      return {
        query: {
          bool: { filter: { terms: { "structureId.keyword": structureIds } }, must: [] },
        },
        track_total_hits: true,
      };
    return { query: { bool: { must: [{ match_all: {} }], filter: [] } }, track_total_hits: true };
  };
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  useEffect(() => {
    if (user.role !== ROLES.SUPERVISOR) return;
    (async () => {
      if (!user.structureId) return;
      const { data } = await api.get(`/structure/${user.structureId}/children`);
      const ids = data.map((s) => s._id);
      setStructureIds([...ids, user.structureId]);
    })();
    return;
  }, []);
  useEffect(() => {
    (async () => {
      if (!user.structureId) return;
      const { data } = await api.get(`/structure/${user.structureId}`);
      setStructure(data);
    })();
    return;
  }, []);
  if (user.role === ROLES.SUPERVISOR && !structureIds) return <Loader />;

  const getExportsFields = () => {
    let filtered = missionCandidatureExportFields;
    if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role)) {
      const filterAdress = missionCandidatureExportFields.find((e) => e.id === "address");
      filterAdress.desc = filterAdress.desc.filter((e) => e !== "Issu de QPV");
      filtered = filtered.map((e) => (e.id !== "address" ? e : filterAdress));
    }
    return filtered;
  };

  async function transform(data, selectedFields) {
    let all = data;
    if (selectedFields.includes("tutor")) {
      const tutorIds = [...new Set(data.map((item) => item.tutorId).filter((e) => e))];
      if (tutorIds?.length) {
        const { responses } = await api.esQuery("referent", { size: ES_NO_LIMIT, query: { ids: { type: "_doc", values: tutorIds } } });
        if (responses.length) {
          const tutors = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
          all = data.map((item) => ({ ...item, tutor: tutors?.find((e) => e._id === item.tutorId) }));
        }
      }
    }
    if (["structureInfo", "structureLocation"].some((e) => selectedFields.includes(e))) {
      const structureIds = [...new Set(data.map((item) => item.structureId).filter((e) => e))];
      const { responses } = await api.esQuery("structure", { size: ES_NO_LIMIT, query: { ids: { type: "_doc", values: structureIds } } });
      if (responses?.length) {
        const structures = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
        all = all.map((item) => ({ ...item, structure: structures?.find((e) => e._id === item.structureId) }));
      }
    }
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

      let fields = { _id: data._id };
      for (const element of selectedFields) {
        let key;
        for (key in allFields[element]) fields[key] = allFields[element][key];
      }
      return fields;
    });
  }

  async function transformCandidature(data, selectedFields) {
    let all = data;

    // Add tutor info
    if (selectedFields.includes("missionTutor")) {
      const tutorIds = [...new Set(data.map((item) => item.tutorId).filter((e) => e))];
      if (tutorIds?.length) {
        const queryTutor = {
          query: { ids: { type: "_doc", values: tutorIds } },
          track_total_hits: true,
          size: ES_NO_LIMIT,
        };
        const resultTutor = await api.post(`/es/referent/export`, {
          ...queryTutor,
          fieldsToExport: missionCandidatureExportFields.find((f) => f.id === "missionTutor")?.fields,
        });
        if (resultTutor?.data?.length) {
          all = data.map((item) => ({ ...item, tutor: resultTutor?.data?.find((e) => e._id === item.tutorId) }));
        }
      }
    }

    // Add structure info
    let structureCategorie = ["structureInfo", "structureLocation"];
    if (structureCategorie.some((e) => selectedFields.includes(e))) {
      const structureIds = [...new Set(data.map((item) => item.structureId).filter((e) => e))];
      const queryStructure = {
        query: { ids: { type: "_doc", values: structureIds } },
        track_total_hits: true,
        size: ES_NO_LIMIT,
      };

      let fieldsToExportsStructure = [];

      selectedFields.forEach((selected) => {
        if (structureCategorie.includes(selected)) {
          let fields = missionCandidatureExportFields.find((f) => f.id === selected)?.fields;
          fieldsToExportsStructure = [...fieldsToExportsStructure, ...fields];
        }
      });

      const resultStructure = await api.post(`/es/structure/export`, {
        ...queryStructure,
        fieldsToExport: fieldsToExportsStructure,
      });

      if (resultStructure?.data?.length) {
        all = all.map((item) => ({ ...item, structure: resultStructure?.data?.find((e) => e._id === item.structureId) }));
      }
    }

    let youngCategorie = ["representative2", "representative1", "location", "address", "imageRight", "contact", "identity", "status"];
    let fieldsToExportsYoung = [];

    selectedFields.forEach((selected) => {
      if (youngCategorie.includes(selected)) {
        let fields = missionCandidatureExportFields.find((f) => f.id === selected)?.fields;
        fieldsToExportsYoung = [...fieldsToExportsYoung, ...fields];
      }
    });

    //If we want to export young info or application
    if ([...youngCategorie, "application"].some((e) => selectedFields.includes(e))) {
      // Add applications info
      const missionIds = [...new Set(data.map((item) => item._id.toString()).filter((e) => e))];
      const queryApplication = {
        query: { bool: { filter: [{ terms: { "missionId.keyword": missionIds } }, { terms: { "status.keyword": applicationStatusFilter } }] } },
        track_total_hits: true,
        size: ES_NO_LIMIT,
      };

      const resultApplications = await api.post(`/es/application/export`, {
        ...queryApplication,
        fieldsToExport: missionCandidatureExportFields.find((f) => f.id === "application")?.fields,
      });
      if (resultApplications?.data?.length) {
        all = all.map((item) => ({ ...item, candidatures: resultApplications?.data?.filter((e) => e.missionId === item._id.toString()) }));
      } else {
        all = all.map((item) => ({ ...item, candidatures: [] }));
      }

      let youngIds = [];
      all.forEach((item) => {
        if (item.candidatures?.length) {
          youngIds = [...youngIds, ...item.candidatures.map((e) => e.youngId)];
        }
      });
      youngIds = [...new Set(youngIds.filter((e) => e))];

      const queryYoung = {
        query: { ids: { type: "_doc", values: youngIds } },
        track_total_hits: true,
        size: ES_NO_LIMIT,
      };

      const resultYoungs = await api.post(`/es/young/export`, {
        ...queryYoung,
        fieldsToExports: [...fieldsToExportsYoung, "statusMilitaryPreparationFiles"],
      });
      if (resultYoungs?.data?.length) {
        all = all.map((item) => {
          if (item.candidatures?.length) {
            item.candidatures = item.candidatures.map((e) => ({ ...e, young: resultYoungs?.data?.find((y) => y._id === e.youngId) }));
          }
          return item;
        });
      }
    }
    all = all.filter((data) => data.candidatures.length);

    let result = [];

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
        let fields = {};
        for (const element of selectedFields) {
          let key;
          for (key in allFields[element]) fields[key] = allFields[element][key];
        }
        result = [...result, fields];
      });
    });
    return result;
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Missions" }]} />
      <div className="flex flex-row mb-8" style={{ fontFamily: "Marianne" }}>
        <div className="flex flex-1 flex-col w-full px-8">
          <div className="text-2xl font-bold text-[#242526] leading-7">Missions</div>
          <ListFiltersPopOver
            pageId="mission"
            esId="mission"
            defaultQuery={getDefaultQuery()}
            filters={filterArray}
            getCount={setCount}
            setData={(value) => setData(value)}
            searchBarObject={searchBarObject}
            page={page}
            size={size}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            setPage={setPage}
          />
          <div className="reactive-result">
            <ResultTable
              setPage={setPage}
              count={count}
              currentEntryOnPage={data?.length}
              size={size}
              page={page}
              render={
                <div className="flex w-full flex-col mt-6 mb-2 divide-y divide-gray-100 border-y-[1px] border-gray-100">
                  <div className="flex py-3 items-center text-xs uppercase text-gray-400 px-4 ">
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

const Hit = ({ hit, callback }) => {
  const history = useHistory();
  const onChangeStatus = (e) => {
    callback(e);
  };
  return (
    <>
      <div className="flex py-3 items-center px-4 hover:bg-gray-50">
        <div className="flex items-center gap-4 w-[40%] cursor-pointer " onClick={() => history.push(`/mission/${hit._id}`)}>
          {hit.isJvaMission === "true" ? (
            <img src={require("../../assets/JVA_round.png")} className="h-7 w-7 group-hover:scale-105 mx-auto" />
          ) : (
            <img src={require("../../assets/logo-snu.png")} className="h-7 w-7 group-hover:scale-105 mx-auto" />
          )}
          <div className="flex flex-col gap-1 w-full">
            <p className="font-bold leading-6 text-gray-900 truncate w-10/12">{hit.name}</p>
            <p className="font-normal text-sm leading-4 text-gray-500">
              {hit.address} • {hit.city} ({hit.department})
            </p>
          </div>
        </div>
        <div className="w-[5%]">
          {hit?.visibility === "HIDDEN" && (
            <div className="group relative cursor-pointer">
              <HiOutlineLockClosed size={20} className="text-gray-400" />
              <div className="hidden group-hover:block absolute bottom-[calc(100%+15px)] left-[50%] bg-white rounded-xl translate-x-[-58%] px-3 py-2.5 text-gray-600 text-xs leading-5 drop-shadow-xl z-10 min-w-[275px] text-center">
                <div className="absolute left-[50%] translate-x-[-50%] bg-white w-[15px] h-[15px] rotate-45 bottom-[-5px]"></div>
                La mission est <strong>fermée</strong> aux candidatures
              </div>
            </div>
          )}
        </div>

        <div className="w-[15%] flex flex-col gap-2">
          <p className="text-sm leading-none font-normal text-gray-900">{hit.placesLeft} places(s)</p>
          <p className="text-sm leading-none font-normal text-gray-500">
            sur <span className="text-gray-900">{hit.placesTotal}</span>
          </p>
        </div>
        <div className="flex flex-col gap-2 w-[20%] text-sm leading-none font-normal text-gray-500">
          <p>
            Du <span className="text-gray-900">{formatStringDateTimezoneUTC(hit.startAt)}</span>
          </p>
          <p>
            Au <span className="text-gray-900">{formatStringDateTimezoneUTC(hit.endAt)}</span>
          </p>
        </div>
        <div className="w-[20%]">
          <SelectStatusMissionV2 hit={hit} callback={onChangeStatus} />
        </div>
      </div>
    </>
  );
};
