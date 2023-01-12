import { DataSearch, MultiDropdownList, ReactiveBase, ReactiveComponent } from "@appbaseio/reactivesearch";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { HiAdjustments, HiOutlineLockClosed } from "react-icons/hi";
import { formatLongDateUTC, missionCandidatureExportFields, missionExportFields, translateApplication, translateMission, translatePhase2 } from "snu-lib";
import UnlockedSvg from "../../assets/lock-open.svg";
import LockedSvg from "../../assets/lock.svg";
import Breadcrumbs from "../../components/Breadcrumbs";
import DeleteFilters from "../../components/buttons/DeleteFilters";
import VioletButton from "../../components/buttons/VioletButton";
import { DepartmentFilter, RegionFilter } from "../../components/filters";
import DatePickerWrapper from "../../components/filters/DatePickerWrapper";
import { Filter, FilterRow, Header, Help, HelpText, LockIcon, MultiLine, ResultTable, Table, Title } from "../../components/list";
import Loader from "../../components/Loader";
import ModalExport from "../../components/modals/ModalExport";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import SelectAction from "../../components/SelectAction";
import SelectStatusMission from "../../components/selectStatusMission";
import { apiURL, supportURL } from "../../config";
import api from "../../services/api";
import { ES_NO_LIMIT, formatDateFRTimezoneUTC, formatLongDateFR, formatStringDateTimezoneUTC, getFilterLabel, ROLES, translate, translateVisibilty } from "../../utils";
import Panel from "./panel";

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

  const handleShowFilter = () => setFilterVisible(!filterVisible);
  const getDefaultQuery = () => {
    if (user.role === ROLES.SUPERVISOR) return { query: { bool: { filter: { terms: { "structureId.keyword": structureIds } } } }, track_total_hits: true };
    return { query: { match_all: {} }, track_total_hits: true };
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
        query: { bool: { filter: [{ terms: { "missionId.keyword": missionIds } }] } },
        track_total_hits: true,
        size: ES_NO_LIMIT,
      };

      const resultApplications = await api.post(`/es/application/export`, {
        ...queryApplication,
        fieldsToExport: missionCandidatureExportFields.find((f) => f.id === "application")?.fields,
      });
      if (resultApplications?.data?.length) {
        all = all.map((item) => ({ ...item, candidatures: resultApplications?.data?.filter((e) => e.missionId === item._id.toString()) }));
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
            "Adresse postale": application?.young?.address,
            "Code postal": application?.young?.zip,
            Ville: application?.young?.city,
            Pays: application?.young?.country,
          },
          location: {
            Département: application?.young?.department,
            Académie: application?.young?.academy,
            Région: application?.young?.region,
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
    <div>
      <Breadcrumbs items={[{ label: "Missions" }]} />
      <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
          <div style={{ flex: 2, position: "relative" }}>
            <Header>
              <div style={{ flex: 1 }}>
                <Title>Missions</Title>
              </div>
              {user.role === ROLES.RESPONSIBLE && user.structureId && structure && structure.status !== "DRAFT" ? (
                <Link to={`/mission/create/${user.structureId}`}>
                  <VioletButton>
                    <p>Nouvelle mission</p>
                  </VioletButton>
                </Link>
              ) : null}

              <SelectAction
                title="Exporter"
                alignItems="right"
                buttonClassNames="cursor-pointer text-white bg-blue-600"
                textClassNames="text-sm"
                rightIconClassNames="text-white opacity-70"
                optionsGroup={[
                  {
                    items: [
                      {
                        action: () => {
                          setIsExportOpen(true);
                        },
                        render: <div className="p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer text-sm">Informations de missions</div>,
                      },
                      {
                        action: () => {
                          setIsExportCandidatureOpen(true);
                        },
                        render: <div className="p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer text-sm">Informations de candidatures</div>,
                      },
                    ],
                  },
                ]}
              />
              <ModalExport
                isOpen={isExportCandidatureOpen}
                setIsOpen={setIsExportCandidatureOpen}
                index="mission"
                transform={transformCandidature}
                exportFields={missionCandidatureExportFields}
                filters={FILTERS}
                getExportQuery={getExportQuery}
              />
              <ModalExport
                isOpen={isExportOpen}
                setIsOpen={setIsExportOpen}
                index="mission"
                transform={transform}
                exportFields={user.role === ROLES.RESPONSIBLE ? missionExportFields.filter((e) => !e.title.includes("structure")) : missionExportFields}
                filters={FILTERS}
                getExportQuery={getExportQuery}
              />
            </Header>
            <Filter>
              <FilterRow visible>
                <DataSearch
                  defaultQuery={getDefaultQuery}
                  showIcon={false}
                  placeholder="Rechercher par mots clés, ville, code postal..."
                  componentId="SEARCH"
                  dataField={["name.folded", "structureName.folded", "city.folded", "zip"]}
                  react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                  // fuzziness={1}
                  style={{ flex: 1, marginRight: "1rem" }}
                  innerClass={{ input: "searchbox" }}
                  URLParams={true}
                  queryFormat="and"
                  autosuggest={false}
                />
                <HiAdjustments onClick={handleShowFilter} className="text-xl text-coolGray-700 cursor-pointer hover:scale-105" />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <div className="uppercase text-xs text-snu-purple-800">Général</div>
                <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_REGION ? [user.region] : []} />
                <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? user.department : []} />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="STATUS"
                  dataField="status.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "STATUS") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Source"
                  componentId="SOURCE"
                  dataField="isJvaMission.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "SOURCE") }}
                  renderItem={(e, count) => {
                    const text = e === "true" ? "JVA" : "SNU";
                    return `${text} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => {
                    if (Object.keys(items).length === 0) return "Source";
                    const translated = Object.keys(items).map((item) => {
                      return item === "true" ? "JVA" : "SNU";
                    });
                    let value = translated.join(", ");
                    return value;
                  }}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Visibilité"
                  componentId="VISIBILITY"
                  dataField="visibility.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "VISIBILITY") }}
                  renderItem={(e, count) => {
                    return `${translateVisibilty(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Visibilité", "Visibilité")}
                />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <div className="uppercase text-xs text-snu-purple-800">Modalités</div>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Domaine"
                  componentId="DOMAIN"
                  dataField="mainDomain.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "DOMAIN") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Domaine d'action principal", "Domaine d'action principal")}
                  showMissing
                  missingLabel="Non renseigné"
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Places restantes"
                  componentId="PLACES"
                  dataField="placesLeft"
                  react={{ and: FILTERS.filter((e) => e !== "PLACES") }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  sortBy="asc"
                  selectAllLabel="Tout sélectionner"
                  renderLabel={(items) => getFilterLabel(items, "Places restantes", "Places restantes")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Tuteur"
                  componentId="TUTOR"
                  dataField="tutorName.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "TUTOR") }}
                  title=""
                  URLParams={true}
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Préparation Militaire"
                  componentId="MILITARY_PREPARATION"
                  dataField="isMilitaryPreparation.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "MILITARY_PREPARATION") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Préparation Militaire")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Préparation Militaire"
                  componentId="HEBERGEMENT"
                  dataField="hebergement.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "HEBERGEMENT") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Hébergement")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Préparation Militaire"
                  componentId="HEBERGEMENT_PAYANT"
                  dataField="hebergementPayant.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "HEBERGEMENT_PAYANT") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Hébergement Payant")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Place occupées"
                  componentId="PLACESTATUS"
                  dataField="placesStatus.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "PLACESTATUS") }}
                  renderItem={(e, count) => {
                    return `${translateMission(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Place occupées", "Place occupées")}
                  showMissing
                  missingLabel="Non renseigné"
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Place occupées"
                  componentId="APPLICATIONSTATUS"
                  dataField="applicationStatus.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "APPLICATIONSTATUS") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut de candidature", "Statut de candidature")}
                  showMissing
                  missingLabel="Non renseigné"
                />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <div className="uppercase text-xs text-snu-purple-800">Dates</div>
                <ReactiveComponent
                  componentId="DATE"
                  URLParams={true}
                  defaultValue={[]}
                  render={(props) => {
                    return <DatePickerWrapper setQuery={props.setQuery} value={props.value} />;
                  }}
                />
                <Help onClick={toggleInfos} onMouseEnter={() => setInfosHover(true)} onMouseLeave={() => setInfosHover(false)}>
                  {infosClick ? <LockIcon src={LockedSvg} /> : <LockIcon src={UnlockedSvg} />}
                  Aide
                </Help>
              </FilterRow>
              <FilterRow visible={filterVisible}>
                {user.role === ROLES.SUPERVISOR ? (
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Structure"
                    componentId="STRUCTURE"
                    dataField="structureName.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "STRUCTURE") }}
                    title=""
                    URLParams={true}
                    showSearch={false}
                    sortBy="asc"
                  />
                ) : null}
                <DeleteFilters />
              </FilterRow>
            </Filter>
            {infosHover || infosClick ? (
              <HelpText>
                <div>
                  <div style={{ height: "0.5rem" }} />
                  <div>
                    <span className="title">Général :</span>concerne toutes les informations générales de la mission . <strong>La source </strong>
                    correspond à la plateforme sur laquelle a été déposée la mission
                    <a href={`${supportURL}/base-de-connaissance/missions-de-la-plateforme-jeveuxaidergouvfr`} target="_blank" rel="noreferrer">
                      JVA & SNU
                    </a>
                  </div>
                  <div>
                    <span className="title">Modalités :</span>concerne toutes les condtions de réalisation de la mission.
                  </div>
                  <div>
                    <span className="title">Dates :</span>permettent de filtrer les missions dont les dates de début et de fin sont inclues dans la borne temporelle. Attention les
                    missions dont seulement 1 jour est inclus seront également affichées.
                  </div>
                </div>
              </HelpText>
            ) : null}
            <ResultTable>
              <ReactiveListComponent
                defaultQuery={getDefaultQuery}
                react={{ and: FILTERS }}
                sortOptions={[
                  { label: "Date de création (récent > ancien)", dataField: "createdAt", sortBy: "desc" },
                  { label: "Date de création (ancien > récent)", dataField: "createdAt", sortBy: "asc" },
                  { label: "Nombre de place (croissant)", dataField: "placesLeft", sortBy: "asc" },
                  { label: "Nombre de place (décroissant)", dataField: "placesLeft", sortBy: "desc" },
                  { label: "Nom de la mission (A > Z)", dataField: "name.keyword", sortBy: "asc" },
                  { label: "Nom de la mission (Z > A)", dataField: "name.keyword", sortBy: "desc" },
                ]}
                render={({ data }) => (
                  <Table>
                    <thead>
                      <tr>
                        <th>Mission</th>
                        <th style={{ width: "45px" }}></th>
                        <th style={{ width: "90px" }}>Places</th>
                        <th style={{ width: "150px" }}>Dates</th>
                        <th style={{ width: "250px" }}>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit) => (
                        <Hit
                          key={hit._id}
                          hit={hit}
                          onClick={(m) => setMission(m)}
                          selected={mission?._id === hit._id}
                          callback={(e) => {
                            if (e._id === mission?._id) setMission(e);
                          }}
                        />
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </ResultTable>
          </div>
          <Panel mission={mission} onChange={() => setMission(null)} />
        </div>
      </ReactiveBase>
    </div>
  );
}

const Hit = ({ hit, onClick, selected, callback }) => {
  const [value, setValue] = useState(null);

  const onChangeStatus = (e) => {
    setValue(e);
    callback(e);
  };

  useEffect(() => {
    setValue(hit);
  }, [hit._id]);

  if (!value) return <></>;
  return (
    <tr style={{ backgroundColor: selected && "#e6ebfa" }} onClick={() => onClick(value)}>
      <td>
        <div className="flex space-x-2">
          <span className="w-1/12  ">
            {value.isJvaMission === "true" ? (
              <img src={require("../../assets/JVA_round.png")} className="h-9 w-9 group-hover:scale-105 mx-auto" />
            ) : (
              <img src={require("../../assets/logo-snu.png")} className="h-9 w-9 group-hover:scale-105 mx-auto" />
            )}
          </span>
          <MultiLine className="w-11/12 ">
            <span className="font-bold text-black">{value.name}</span>
            <p>
              {value.structureName} {`• ${value.city} (${value.department})`}
            </p>
          </MultiLine>
        </div>
      </td>
      <td>{value?.visibility === "HIDDEN" && <HiOutlineLockClosed size={20} className="text-gray-400" />}</td>
      <td>
        {value.placesTotal <= 1 ? `${value.placesTotal} place` : `${value.placesTotal} places`}
        <div style={{ fontSize: 12, color: "rgb(113,128,150)" }}>
          {value.placesTotal - value.placesLeft} / {value.placesTotal}
        </div>
      </td>
      <td>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Du</span> {formatStringDateTimezoneUTC(value.startAt)}
        </div>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Au</span> {formatStringDateTimezoneUTC(value.endAt)}
        </div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatusMission hit={value} callback={onChangeStatus} />
      </td>
    </tr>
  );
};
