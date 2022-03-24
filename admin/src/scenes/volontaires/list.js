import React, { useEffect, useState } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { ReactiveBase, MultiDropdownList, DataSearch, SelectedFilters } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";
import { useHistory, Link } from "react-router-dom";

import ReactiveListComponent from "../../components/ReactiveListComponent";
import ExportComponent from "../../components/ExportXlsx";
import { HiAdjustments } from "react-icons/hi";

import LockedSvg from "../../assets/lock.svg";
import UnlockedSvg from "../../assets/lock-open.svg";
import api from "../../services/api";
import { apiURL, appURL, supportURL } from "../../config";
import Panel from "./panel";
import Badge from "../../components/Badge";
import {
  translate,
  translatePhase1,
  getFilterLabel,
  YOUNG_STATUS_COLORS,
  isInRuralArea,
  formatLongDateFR,
  getAge,
  ES_NO_LIMIT,
  ROLES,
  formatDateFRTimezoneUTC,
  colors,
  getLabelWithdrawnReason,
  departmentLookUp,
  YOUNG_STATUS,
  translatePhase2,
  translateApplication,
  translateEngagement,
} from "../../utils";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import Chevron from "../../components/Chevron";
import { Filter, FilterRow, ResultTable, Table, ActionBox, Header, Title, MultiLine, Help, LockIcon, HelpText } from "../../components/list";
import plausibleEvent from "../../services/pausible";
import DeletedVolontairePanel from "./deletedPanel";
import DeleteFilters from "../../components/buttons/DeleteFilters";

const FILTERS = [
  "SEARCH",
  "STATUS",
  "COHORT",
  "DEPARTMENT",
  "REGION",
  "STATUS_PHASE_1",
  "STATUS_PHASE_2",
  "STATUS_PHASE_3",
  "APPLICATION_STATUS",
  "LOCATION",
  "CONTRACT_STATUS",
  "MEDICAL_FILE_RECEIVED",
  "COHESION_PRESENCE",
  "MILITARY_PREPARATION_FILES_STATUS",
  "PPS",
  "PAI",
  "QPV",
  "HANDICAP",
  "ZRR",
  "GRADE",
  "PMR",
  "IMAGE_RIGHT",
  "RULES",
  "AUTOTEST",
  "SPECIFIC_AMENAGEMENT",
  "SAME_DEPARTMENT",
];

export default function VolontaireList() {
  const user = useSelector((state) => state.Auth.user);

  const [volontaire, setVolontaire] = useState(null);
  const [centers, setCenters] = useState(null);
  const [sessionsPhase1, setSessionsPhase1] = useState(null);
  const [meetingPoints, setMeetingPoints] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);

  const [infosHover, setInfosHover] = useState(false);
  const [infosClick, setInfosClick] = useState(false);
  const toggleInfos = () => {
    setInfosClick(!infosClick);
  };

  const handleShowFilter = () => setFilterVisible(!filterVisible);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/cohesion-center");
      setCenters(data);
    })();
    (async () => {
      const { data } = await api.get("/meeting-point/all");
      setMeetingPoints(data);
    })();
    (async () => {
      const { data } = await api.get("/session-phase1/");
      setSessionsPhase1(data);
    })();
  }, []);
  const getDefaultQuery = () => ({
    query: { bool: { filter: { terms: { "status.keyword": ["VALIDATED", "WITHDRAWN", "WAITING_LIST", "DELETED"] } } } },
    sort: [{ "lastName.keyword": "asc" }],
    track_total_hits: true,
  });
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });
  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="young" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <div>
                <Title>Volontaires</Title>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".25rem", justifyContent: "flex-end" }}>
                <ExportComponent
                  handleClick={() => plausibleEvent("Volontaires/CTA - Exporter volontaires")}
                  title="Exporter les volontaires"
                  defaultQuery={getExportQuery}
                  exportTitle="Volontaires"
                  index="young"
                  react={{ and: FILTERS }}
                  transform={async (data) => {
                    let all = data;
                    const schoolsId = [...new Set(data.map((item) => item.schoolId).filter((e) => e))];
                    if (schoolsId?.length) {
                      const { responses } = await api.esQuery("school", {
                        query: { bool: { must: { ids: { values: schoolsId } } } },
                        size: ES_NO_LIMIT,
                      });
                      if (responses.length) {
                        const schools = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
                        all = data.map((item) => ({ ...item, esSchool: schools?.find((e) => e._id === item.schoolId) }));
                      }
                    }
                    return all.map((data) => {
                      let center = {};
                      if (data.sessionPhase1Id && centers && sessionsPhase1) {
                        center = centers.find((c) => sessionsPhase1.find((sessionPhase1) => sessionPhase1._id === data.sessionPhase1Id)?.cohesionCenterId === c._id);
                        if (!center) center = {};
                      }
                      let meetingPoint = {};
                      if (data.meetingPointId && meetingPoints) {
                        meetingPoint = meetingPoints.find((mp) => mp._id === data.meetingPointId);
                        if (!meetingPoint) meetingPoint = {};
                      }
                      return {
                        _id: data._id,
                        Cohorte: data.cohort,
                        Prénom: data.firstName,
                        Nom: data.lastName,
                        "Date de naissance": formatDateFRTimezoneUTC(data.birthdateAt),
                        "Pays de naissance": data.birthCountry || "France",
                        "Ville de naissance": data.birthCity,
                        "Code postal de naissance": data.birthCityZip,
                        Sexe: translate(data.gender),
                        Email: data.email,
                        Téléphone: data.phone,
                        "Adresse postale": data.address,
                        "Code postal": data.zip,
                        Ville: data.city,
                        Département: data.department,
                        Région: data.region,
                        Académie: data.academy,
                        Pays: data.country,
                        "Nom de l'hébergeur": data.hostLastName,
                        "Prénom de l'hébergeur": data.hostFirstName,
                        "Lien avec l'hébergeur": data.hostRelationship,
                        "Adresse - étranger": data.foreignAddress,
                        "Code postal - étranger": data.foreignZip,
                        "Ville - étranger": data.foreignCity,
                        "Pays - étranger": data.foreignCountry,
                        Situation: translate(data.situation),
                        Niveau: translate(data.grade),
                        "Type d'établissement": translate(data.esSchool?.type || data.schoolType),
                        "Nom de l'établissement": data.esSchool?.fullName || data.schoolName,
                        "Code postal de l'établissement": data.esSchool?.postcode || data.schoolZip,
                        "Ville de l'établissement": data.esSchool?.city || data.schoolCity,
                        "Département de l'établissement": departmentLookUp[data.esSchool?.department] || data.schoolDepartment,
                        "UAI de l'établissement": data.esSchool?.uai,
                        "Quartier Prioritaire de la ville": translate(data.qpv),
                        "Zone Rurale": translate(isInRuralArea(data)),
                        Handicap: translate(data.handicap),
                        "Bénéficiaire d'un PPS": translate(data.ppsBeneficiary),
                        "Bénéficiaire d'un PAI": translate(data.paiBeneficiary),
                        "Structure médico-sociale": translate(data.medicosocialStructure),
                        "Nom de la structure médico-sociale": data.medicosocialStructureName,
                        "Adresse de la structure médico-sociale": data.medicosocialStructureAddress,
                        "Code postal de la structure médico-sociale": data.medicosocialStructureZip,
                        "Ville de la structure médico-sociale": data.medicosocialStructureCity,
                        "Aménagement spécifique": translate(data.specificAmenagment),
                        "Nature de l'aménagement spécifique": translate(data.specificAmenagmentType),
                        "Aménagement pour mobilité réduite": translate(data.reducedMobilityAccess),
                        "Besoin d'être affecté(e) dans le département de résidence": translate(data.handicapInSameDepartment),
                        "Allergies ou intolérances alimentaires": translate(data.allergies),
                        "Activité de haut-niveau": translate(data.highSkilledActivity),
                        "Nature de l'activité de haut-niveau": data.highSkilledActivityType,
                        "Activités de haut niveau nécessitant d'être affecté dans le département de résidence": translate(data.highSkilledActivityInSameDepartment),
                        "Document activité de haut-niveau ": data.highSkilledActivityProofFiles,
                        "Consentement des représentants légaux": translate(data.parentConsentment),
                        "Droit à l'image": translate(data.imageRight),
                        "Autotest PCR": translate(data.autoTestPCR),
                        "Règlement intérieur": translate(data.rulesYoung),
                        "Fiche sanitaire réceptionnée": translate(data.cohesionStayMedicalFileReceived || "false"),
                        "Présent au séjour de cohésion": translate(data.cohesionStayPresence),
                        "Statut représentant légal 1": translate(data.parent1Status),
                        "Prénom représentant légal 1": data.parent1FirstName,
                        "Nom représentant légal 1": data.parent1LastName,
                        "Email représentant légal 1": data.parent1Email,
                        "Téléphone représentant légal 1": data.parent1Phone,
                        "Adresse représentant légal 1": data.parent1Address,
                        "Code postal représentant légal 1": data.parent1Zip,
                        "Ville représentant légal 1": data.parent1City,
                        "Département représentant légal 1": data.parent1Department,
                        "Région représentant légal 1": data.parent1Region,
                        "Statut représentant légal 2": translate(data.parent2Status),
                        "Prénom représentant légal 2": data.parent2FirstName,
                        "Nom représentant légal 2": data.parent2LastName,
                        "Email représentant légal 2": data.parent2Email,
                        "Téléphone représentant légal 2": data.parent2Phone,
                        "Adresse représentant légal 2": data.parent2Address,
                        "Code postal représentant légal 2": data.parent2Zip,
                        "Ville représentant légal 2": data.parent2City,
                        "Département représentant légal 2": data.parent2Department,
                        "Région représentant légal 2": data.parent2Region,
                        "Motivations à participer au SNU": data.motivations,
                        "Domaine de MIG 1": data.domains[0],
                        "Domaine de MIG 2": data.domains[1],
                        "Domaine de MIG 3": data.domains[2],
                        "Projet professionnel": translate(data.professionnalProject),
                        "Information supplémentaire sur le projet professionnel": data.professionnalProjectPrecision,
                        "Période privilégiée pour réaliser des missions": data.period,
                        "Choix 1 période": translate(data.periodRanking[0]),
                        "Choix 2 période": translate(data.periodRanking[1]),
                        "Choix 3 période": translate(data.periodRanking[2]),
                        "Choix 4 période": translate(data.periodRanking[3]),
                        "Choix 5 période": translate(data.periodRanking[4]),
                        "Mobilité aux alentours de son établissement": translate(data.mobilityNearSchool),
                        "Mobilité aux alentours de son domicile": translate(data.mobilityNearHome),
                        "Mobilité aux alentours d'un de ses proches": translate(data.mobilityNearRelative),
                        "Informations du proche":
                          data.mobilityNearRelative &&
                          [data.mobilityNearRelativeName, data.mobilityNearRelativeAddress, data.mobilityNearRelativeZip, data.mobilityNearRelativeCity]
                            .filter((e) => e)
                            ?.join(", "),
                        "Mode de transport": data.mobilityTransport?.map((t) => translate(t)).join(", "),
                        "Autre mode de transport": data.mobilityTransportOther,
                        "Format de mission": translate(data.missionFormat),
                        "Engagement dans une structure en dehors du SNU": translate(data.engaged),
                        "Description engagement ": data.engagedDescription,
                        "Souhait MIG": data.desiredLocation,
                        Phase: translate(data.phase),
                        "Créé lé": formatLongDateFR(data.createdAt),
                        "Mis à jour le": formatLongDateFR(data.updatedAt),
                        "Dernière connexion le": formatLongDateFR(data.lastLoginAt),
                        Statut: translate(data.status),
                        "Statut Phase 1": translatePhase1(data.statusPhase1),
                        "Statut Phase 2": translatePhase2(data.statusPhase2),
                        "Statut Phase 3": translate(data.statusPhase3),
                        "Dernier statut le": formatLongDateFR(data.lastStatusAt),
                        "Raison du desistement": getLabelWithdrawnReason(data.withdrawnReason),
                        "Message de desistement": data.withdrawnMessage,
                        "ID centre": center._id || "",
                        "Code centre (2021)": center.code || "",
                        "Code centre (2022)": center.code2022 || "",
                        "Nom du centre": center.name || "",
                        "Ville du centre": center.city || "",
                        "Département du centre": center.department || "",
                        "Région du centre": center.region || "",
                        "Confirmation point de rassemblement": data.meetingPointId || data.deplacementPhase1Autonomous === "true" ? "Oui" : "Non",
                        "Se rend au centre par ses propres moyens": translate(data.deplacementPhase1Autonomous),
                        "Bus n˚": meetingPoint?.busExcelId,
                        "Adresse point de rassemblement": meetingPoint?.departureAddress,
                        "Date aller": meetingPoint?.departureAtString,
                        "Date retour": meetingPoint?.returnAtString,
                      };
                    });
                  }}
                />
                {user.role === ROLES.REFERENT_DEPARTMENT && (
                  <ExportComponent
                    title="Exporter les volontaires scolarisés dans le département"
                    defaultQuery={getExportQuery}
                    exportTitle="Volontaires"
                    index="young-having-school-in-department"
                    react={{ and: FILTERS }}
                    transform={async (data) => {
                      let all = data;
                      const schoolsId = [...new Set(data.map((item) => item.schoolId).filter((e) => e))];
                      if (schoolsId?.length) {
                        const { responses } = await api.esQuery("school", {
                          query: { bool: { must: { ids: { values: schoolsId } } } },
                          size: ES_NO_LIMIT,
                        });
                        if (responses.length) {
                          const schools = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
                          all = data.map((item) => ({ ...item, esSchool: schools?.find((e) => e._id === item.schoolId) }));
                        }
                      }
                      return all.map((data) => {
                        return {
                          _id: data._id,
                          Cohorte: data.cohort,
                          Prénom: data.firstName,
                          Nom: data.lastName,
                          Département: data.department,
                          Situation: translate(data.situation),
                          Niveau: translate(data.grade),
                          "Type d'établissement": translate(data.esSchool?.type || data.schoolType),
                          "Nom de l'établissement": data.esSchool?.fullName || data.schoolName,
                          "Code postal de l'établissement": data.esSchool?.postcode || data.schoolZip,
                          "Ville de l'établissement": data.esSchool?.city || data.schoolCity,
                          "Département de l'établissement": departmentLookUp[data.esSchool?.department] || data.schoolDepartment,
                          "UAI de l'établissement": data.esSchool?.uai,
                          Statut: translate(data.status),
                          "Statut Phase 1": translate(data.statusPhase1),
                        };
                      });
                    }}
                  />
                )}
              </div>
            </Header>
            <Filter>
              <FilterRow visible>
                <DataSearch
                  defaultQuery={getDefaultQuery}
                  showIcon={false}
                  placeholder="Rechercher par prénom, nom, email, ville, code postal..."
                  componentId="SEARCH"
                  dataField={["email.keyword", "firstName.folded", "lastName.folded", "city.folded", "zip"]}
                  react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                  // fuzziness={2}
                  style={{ flex: 1, marginRight: "1rem" }}
                  innerClass={{ input: "searchbox" }}
                  autosuggest={false}
                  URLParams={true}
                  queryFormat="and"
                />
                <HiAdjustments onClick={handleShowFilter} className="text-xl text-coolGray-700 cursor-pointer hover:scale-105" />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <div className="uppercase text-xs text-snu-purple-800">Général</div>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Cohorte"
                  componentId="COHORT"
                  dataField="cohort.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "COHORT") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Cohorte", "Cohorte")}
                />
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
                  renderLabel={(items) => getFilterLabel(items, "Statut", "Statut")}
                  defaultValue={[YOUNG_STATUS.VALIDATED]}
                />

                <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} renderLabel={(items) => getFilterLabel(items, "Région", "Région")} />
                <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} renderLabel={(items) => getFilterLabel(items, "Département", "Département")} />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <div className="uppercase text-xs text-snu-purple-800">Dossier</div>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Classe"
                  componentId="GRADE"
                  dataField="grade.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "GRADE") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Classe", "Classe")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="PPS"
                  componentId="PPS"
                  dataField="ppsBeneficiary.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "PPS") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "PPS", "PPS")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="PAI"
                  componentId="PAI"
                  dataField="paiBeneficiary.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "PAI") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "PAI", "PAI")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="QPV"
                  componentId="QPV"
                  dataField="qpv.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "QPV") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "QPV", "QPV")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="HANDICAP"
                  componentId="HANDICAP"
                  dataField="handicap.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "HANDICAP") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Handicap", "Handicap")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Aménagement spécifique"
                  componentId="SPECIFIC_AMENAGEMENT"
                  dataField="specificAmenagment.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "SPECIFIC_AMENAGEMENT") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Aménagement spécifique", "Aménagement spécifique")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="PMR"
                  componentId="PMR"
                  dataField="reducedMobilityAccess.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "PMR") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Aménagement PMR", "Aménagement PMR")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Droit à l'image"
                  componentId="IMAGE_RIGHT"
                  dataField="imageRight.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "IMAGE_RIGHT") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Droit à l'image", "Droit à l'image")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Règlement intérieur"
                  componentId="RULES"
                  dataField="rulesYoung.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "RULES") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Règlement intérieur", "Règlement intérieur")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Utilisation d’autotest"
                  componentId="AUTOTEST"
                  dataField="autoTestPCR.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "AUTOTEST") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Utilisation d’autotest", "Utilisation d’autotest")}
                />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <div className="uppercase text-xs text-snu-purple-800">Phase 1</div>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="STATUS_PHASE_1"
                  dataField="statusPhase1.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "STATUS_PHASE_1") }}
                  renderItem={(e, count) => {
                    return `${translatePhase1(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut phase 1", "Statut phase 1")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Affectation dans son département"
                  componentId="SAME_DEPARTMENT"
                  dataField="handicapInSameDepartment.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "SAME_DEPARTMENT") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Affectation dans son département", "Affectation dans son département")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="COHESION_PRESENCE"
                  dataField="cohesionStayPresence.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "COHESION_PRESENCE") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Participations au séjour de cohésion", "Participations au séjour de cohésion")}
                  showMissing
                  missingLabel="Non renseigné"
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="MEDICAL_FILE_RECEIVED"
                  dataField="cohesionStayMedicalFileReceived.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "MEDICAL_FILE_RECEIVED") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Fiches sanitaires", "Fiches sanitaires")}
                  showMissing
                  missingLabel="Non renseigné"
                />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <div className="uppercase text-xs text-snu-purple-800">Phase 2</div>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="STATUS_PHASE_2"
                  dataField="statusPhase2.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "STATUS_PHASE_2") }}
                  renderItem={(e, count) => {
                    return `${translatePhase2(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut phase 2", "Statut phase 2")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="APPLICATION_STATUS"
                  dataField="phase2ApplicationStatus.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "APPLICATION_STATUS") }}
                  renderItem={(e, count) => {
                    return `${translateApplication(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut mission (candidature)", "Statut mission (candidature)")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="CONTRACT_STATUS"
                  dataField="statusPhase2Contract.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "CONTRACT_STATUS") }}
                  renderItem={(e, count) => {
                    return `${translateEngagement(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut contrats", "Statut contrats")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="MILITARY_PREPARATION_FILES_STATUS"
                  dataField="statusMilitaryPreparationFiles.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "MILITARY_PREPARATION_FILES_STATUS") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut documents Préparation Militaire", "Statut documents Préparation Militaire")}
                />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <div className="uppercase text-xs text-snu-purple-800">Phase 3</div>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="STATUS_PHASE_3"
                  dataField="statusPhase3.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "STATUS_PHASE_3") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut phase 3", "Statut phase 3")}
                />
                <Help onClick={toggleInfos} onMouseEnter={() => setInfosHover(true)} onMouseLeave={() => setInfosHover(false)}>
                  {infosClick ? <LockIcon src={LockedSvg} /> : <LockIcon src={UnlockedSvg} />}
                  Aide
                </Help>
              </FilterRow>
              <FilterRow className="flex justify-center" visible={filterVisible}>
                <DeleteFilters />
              </FilterRow>
            </Filter>
            {infosHover || infosClick ? (
              <HelpText>
                <div>
                  Pour filtrer les volontaires, cliquez sur les éléments ci-dessus.
                  <div style={{ height: "0.5rem" }} />
                  <div>
                    <span className="title">Statut :</span>statut du parcours SNU du volontaire
                  </div>
                  <div>
                    <span className="title">Cohorte :</span>année d&apos;inscription
                  </div>
                  <div>
                    <span className="title">Régions et Départements :</span>origine du volontaire
                  </div>
                  <div>
                    <span className="title">Statut de phase :</span>pour en savoir plus consultez la{" "}
                    <a href={`${supportURL}/base-de-connaissance/les-phases-du-snu-1`} target="_blank" rel="noreferrer">
                      base de connaissance
                    </a>
                  </div>
                  <div>
                    <span className="title">Participations au séjour de cohésion :</span> présent ou absent (phase 1)
                  </div>
                  <div>
                    <span className="title">Fiche sanitaire :</span> reçue (Oui ou Non) (phase 1)
                  </div>
                  <div>
                    <span className="title">Statut de mission :</span> s&apos;active dès la 1ère candidature et concerne le statut de sa candidature. Pour en savoir plus sur les
                    statuts, consultez la{" "}
                    <a href={`${supportURL}/base-de-connaissance/phase-2-le-parcours-dune-mig`} target="_blank" rel="noreferrer">
                      base de connaissance
                    </a>
                  </div>
                  <div>
                    <span className="title">Statut documents Préparation Militaire :</span>s&apos;active dès la 1ère candidature à une Préparation Militaire. Pour en savoir plus
                    sur les statuts de ce filtre consultez la{" "}
                    <a href={`${supportURL}/base-de-connaissance/je-consulte-les-pieces-justificatives-pour-une-pm`} target="_blank" rel="noreferrer">
                      base de connaissance
                    </a>{" "}
                    (phase 2)
                  </div>
                  <div>
                    <span className="title">Statut contrats :</span>Lorsque la candidature de mission est validée par la structure, le contrat généré est en{" "}
                    <strong>Brouillon</strong>. Il est ensuite rempli et envoyé par la structure aux parties-prenantes via la plateforme, son statut devient{" "}
                    <strong>Envoyée</strong> . Lorsque toutes les parties-prenantes l&apos;ont validé, son statut passe en <strong>Validée</strong>.
                  </div>
                </div>
              </HelpText>
            ) : null}
            <ResultTable>
              <ReactiveListComponent
                defaultQuery={getDefaultQuery}
                react={{ and: FILTERS }}
                sortOptions={[
                  { label: "Nom (A > Z)", dataField: "lastName.keyword", sortBy: "asc" },
                  { label: "Nom (Z > A)", dataField: "lastName.keyword", sortBy: "desc" },
                  { label: "Prénom (A > Z)", dataField: "firstName.keyword", sortBy: "asc" },
                  { label: "Prénom (Z > A)", dataField: "firstName.keyword", sortBy: "desc" },
                  { label: "Date de création (récent > ancien)", dataField: "createdAt", sortBy: "desc" },
                  { label: "Date de création (ancien > récent)", dataField: "createdAt", sortBy: "asc" },
                ]}
                defaultSortOption="Nom (A > Z)"
                render={({ data }) => (
                  <Table>
                    <thead>
                      <tr>
                        <th width="25%">Volontaire</th>
                        <th>Contextes</th>
                        <th width="10%">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit) => (
                        <Hit key={hit._id} hit={hit} onClick={() => setVolontaire(hit)} selected={volontaire?._id === hit._id} />
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </ResultTable>
          </div>
          {volontaire !== null && volontaire.status === YOUNG_STATUS.DELETED ? (
            <DeletedVolontairePanel
              value={volontaire}
              onChange={() => {
                setVolontaire(null);
              }}
            />
          ) : (
            <Panel
              value={volontaire}
              onChange={() => {
                setVolontaire(null);
              }}
            />
          )}
        </div>
      </ReactiveBase>
    </div>
  );
}

const Hit = ({ hit, onClick, selected }) => {
  const getBackgroundColor = () => {
    if (selected) return colors.lightBlueGrey;
    if (hit.status === "WITHDRAWN" || hit.status === YOUNG_STATUS.DELETED) return colors.extraLightGrey;
  };

  if (hit.status === YOUNG_STATUS.DELETED) {
    return (
      <tr style={{ backgroundColor: getBackgroundColor() }} onClick={onClick}>
        <td>
          <MultiLine>
            <span className="font-bold text-black">Compte supprimé</span>
            <p>{hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null}</p>
          </MultiLine>
        </td>
        <td>
          <Badge minify text={hit.cohort} tooltipText={`Cohorte ${hit.cohort}`} style={{ cursor: "default" }} />
          <Badge minify text="Supprimé" color={YOUNG_STATUS_COLORS.DELETED} tooltipText={translate(hit.status)} />

          <BadgePhase text="Phase 1" value={hit.statusPhase1} redirect={`/volontaire/${hit._id}/phase1`} style={"opacity-50"} />
          <BadgePhase text="Phase 2" value={hit.statusPhase2} redirect={`/volontaire/${hit._id}/phase2`} style={"opacity-50"} />
          <BadgePhase text="Phase 3" value={hit.statusPhase3} redirect={`/volontaire/${hit._id}/phase3`} style={"opacity-50"} />
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <Action hit={hit} />
        </td>
      </tr>
    );
  } else {
    return (
      <tr style={{ backgroundColor: getBackgroundColor() }} onClick={onClick}>
        <td>
          <MultiLine>
            <span className="font-bold text-black">{`${hit.firstName} ${hit.lastName}`}</span>
            <p>
              {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {`• ${hit.city || ""} (${hit.department || ""})`}
            </p>
          </MultiLine>
        </td>
        <td>
          <Badge minify text={hit.cohort} tooltipText={`Cohorte ${hit.cohort}`} style={{ cursor: "default" }} />
          {hit.status === "WITHDRAWN" && <Badge minify text="Désisté" color={YOUNG_STATUS_COLORS.WITHDRAWN} tooltipText={translate(hit.status)} />}

          <BadgePhase text="Phase 1" value={hit.statusPhase1} redirect={`/volontaire/${hit._id}/phase1`} />
          <BadgePhase text="Phase 2" value={hit.statusPhase2} redirect={`/volontaire/${hit._id}/phase2`} />
          <BadgePhase text="Phase 3" value={hit.statusPhase3} redirect={`/volontaire/${hit._id}/phase3`} />
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <Action hit={hit} />
        </td>
      </tr>
    );
  }
};

const BadgePhase = ({ text, value, redirect, style }) => {
  const history = useHistory();

  return (
    <Badge
      onClick={() => history.push(redirect)}
      minify
      text={text}
      tooltipText={translate(value)}
      minTooltipText={`${text}: ${translate(value)}`}
      color={YOUNG_STATUS_COLORS[value]}
      className={style}
    />
  );
};

const Action = ({ hit }) => {
  const user = useSelector((state) => state.Auth.user);

  return (
    <ActionBox color={"#444"}>
      <UncontrolledDropdown setActiveFromChild>
        <DropdownToggle tag="button">
          Choisissez&nbsp;une&nbsp;action
          <Chevron color="#444" />
        </DropdownToggle>
        <DropdownMenu>
          <Link to={`/volontaire/${hit._id}`} onClick={() => plausibleEvent("Volontaires/CTA - Consulter profil volontaire")}>
            <DropdownItem className="dropdown-item">Consulter le profil</DropdownItem>
          </Link>
          {hit.status !== YOUNG_STATUS.DELETED ? (
            <Link to={`/volontaire/${hit._id}/edit`} onClick={() => plausibleEvent("Volontaires/CTA - Modifier profil volontaire")}>
              <DropdownItem className="dropdown-item">Modifier le profil</DropdownItem>
            </Link>
          ) : null}
          {[ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && hit.status !== YOUNG_STATUS.DELETED ? (
            <DropdownItem className="dropdown-item" onClick={() => plausibleEvent("Volontaires/CTA - Prendre sa place")}>
              <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${hit._id}`}>Prendre sa place</a>
            </DropdownItem>
          ) : null}
        </DropdownMenu>
      </UncontrolledDropdown>
    </ActionBox>
  );
};
