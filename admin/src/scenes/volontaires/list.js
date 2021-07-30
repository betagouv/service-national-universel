import React, { useEffect, useState } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";

import ReactiveListComponent from "../../components/ReactiveListComponent";
import ExportComponent from "../../components/ExportXlsx";

import api from "../../services/api";
import { apiURL, appURL } from "../../config";
import Panel from "./panel";
import Badge from "../../components/Badge";
import { translate, getFilterLabel, formatStringLongDate, YOUNG_STATUS_COLORS, isInRuralArea, formatLongDateFR, getAge, ES_NO_LIMIT, ROLES } from "../../utils";
import { Link } from "react-router-dom";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import Chevron from "../../components/Chevron";
import { Filter, FilterRow, ResultTable, Table, TopResultStats, BottomResultStats, ActionBox, Header, Title, MultiLine } from "../../components/list";

const FILTERS = [
  "SEARCH",
  "STATUS",
  "COHORT",
  "DEPARTMENT",
  "REGION",
  "STATUS_PHASE_1",
  "STATUS_PHASE_2",
  "STATUS_PHASE_3",
  "STATUS_APPLICATION",
  "LOCATION",
  "CONTRACT_STATUS",
  "MEDICAL_FILE_RECEIVED",
  "COHESION_PRESENCE",
  "MILITARY_PREPARATION_FILES_STATUS",
];

export default ({ setYoung }) => {
  const [volontaire, setVolontaire] = useState(null);
  const [centers, setCenters] = useState(null);
  const [meetingPoints, setMeetingPoints] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);

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
  }, []);
  const getDefaultQuery = () => ({
    query: { bool: { filter: { terms: { "status.keyword": ["VALIDATED", "WITHDRAWN", "WAITING_LIST"] } } } },
    sort: [{ "lastName.keyword": "asc" }],
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
              <ExportComponent
                title="Exporter les volontaires"
                defaultQuery={getExportQuery}
                collection="volontaire"
                react={{ and: FILTERS }}
                transform={(data) => {
                  let center = {};
                  if (data.cohesionCenterId && centers) {
                    center = centers.find((c) => c._id === data.cohesionCenterId);
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
                    "Date de naissance": formatLongDateUTC(data.birthdateAt),
                    Sexe: data.gender,
                    Email: data.email,
                    Téléphone: data.phone,
                    "Adresse postale": data.address,
                    "Code postal": data.zip,
                    Ville: data.city,
                    Département: data.department,
                    Région: data.region,
                    Situation: data.situation,
                    Niveau: data.grade,
                    "Type d'établissement": data.schoolType,
                    "Nom de l'établissement": data.schoolName,
                    "Code postal de l'établissement": data.schoolZip,
                    "Ville de l'établissement": data.schoolCity,
                    "Département de l'établissement": data.schoolDepartment,
                    "Quartier Prioritaire de la ville": data.qpv,
                    "Zone Rurale": isInRuralArea(data),
                    Handicap: data.handicap,
                    "Bénéficiaire d'un PPS": data.ppsBeneficiary,
                    "Bénéficiaire d'un PAI": data.paiBeneficiary,
                    "Structure médico-sociale": data.medicosocialStructure,
                    "Nom de la structure médico-sociale": data.medicosocialStructureName,
                    "Adresse de la structure médico-sociale": data.medicosocialStructureAddress,
                    "Code postal de la structure médico-sociale": data.medicosocialStructureZip,
                    "Ville de la structure médico-sociale": data.medicosocialStructureCity,
                    "Aménagement spécifique": data.specificAmenagment,
                    "Nature de l'aménagement spécifique": data.specificAmenagmentType,
                    "Activité de haut-niveau": data.highSkilledActivity,
                    "Nature de l'activité de haut-niveau": data.highSkilledActivityType,
                    "Document activité de haut-niveau ": data.highSkilledActivityProofFiles,
                    "Consentement des représentants légaux": data.parentConsentment,
                    "Droit à l'image": translate(data.imageRight),
                    "Autotest PCR": translate(data.autoTestPCR),
                    "fiche sanitaire réceptionnée": translate(data.cohesionStayMedicalFileReceived || "false"),
                    Présent: translate(data.cohesionStayPresence),
                    "Statut représentant légal 1": data.parent1Status,
                    "Prénom représentant légal 1": data.parent1FirstName,
                    "Nom représentant légal 1": data.parent1LastName,
                    "Email représentant légal 1": data.parent1Email,
                    "Téléphone représentant légal 1": data.parent1Phone,
                    "Adresse représentant légal 1": data.parent1Address,
                    "Code postal représentant légal 1": data.parent1Zip,
                    "Ville représentant légal 1": data.parent1City,
                    "Département représentant légal 1": data.parent1Department,
                    "Région représentant légal 1": data.parent1Region,
                    "Statut représentant légal 2": data.parent2Status,
                    "Prénom représentant légal 2": data.parent2FirstName,
                    "Nom représentant légal 2": data.parent2LastName,
                    "Email représentant légal 2": data.parent2Email,
                    "Téléphone représentant légal 2": data.parent2Phone,
                    "Adresse représentant légal 2": data.parent2Address,
                    "Code postal représentant légal 2": data.parent2Zip,
                    "Ville représentant légal 2": data.parent2City,
                    "Département représentant légal 2": data.parent2Department,
                    "Région représentant légal 2": data.parent2Region,
                    Motivation: data.motivations,
                    "Domaine 1": data.domains[0],
                    "Domaine 2": data.domains[1],
                    "Domaine 3": data.domains[2],
                    "Projet professionnel": data.professionnalProject,
                    "Information supplémentaire sur le projet professionnel": data.professionnalProjectPrecision,
                    "Période privilégiée pour réaliser des missions": data.period,
                    "Choix 1 période": data.periodRanking[0],
                    "Choix 2 période": data.periodRanking[1],
                    "Choix 3 période": data.periodRanking[2],
                    "Choix 4 période": data.periodRanking[3],
                    "Choix 5 période": data.periodRanking[4],
                    "Mobilité aux alentours de son établissement": data.mobilityNearSchool,
                    "Mobilité aux alentours de son domicile": data.mobilityNearHome,
                    "Mobilité aux alentours d'un de ses proches": data.mobilityNearRelative,
                    "Informations du proche":
                      data.mobilityNearRelative &&
                      data.mobilityNearRelativeName + " - " + data.mobilityNearRelativeAddress + " - " + data.mobilityNearRelativeZip + " - " + data.mobilityNearRelativeCity,
                    "Mode de transport": data.mobilityTransport?.map((t) => translate(t)),
                    "Autre mode de transport": data.mobilityTransportOther,
                    "Format de mission": data.missionFormat,
                    "Engagement dans une structure en dehors du SNU": data.engaged,
                    "Description engagement ": data.engagedDescription,
                    "Souhait MIG": data.desiredLocation,
                    Phase: data.phase,
                    "Créé lé": formatLongDateFR(data.createdAt),
                    "Mis à jour le": formatLongDateFR(data.updatedAt),
                    "Dernière connexion le": formatLongDateFR(data.lastLoginAt),
                    Statut: data.status,
                    "Statut Phase 1": data.statusPhase1,
                    "Statut Phase 2": data.statusPhase2,
                    "Statut Phase 3": data.statusPhase3,
                    "Dernier statut le": formatLongDateFR(data.lastStatusAt),
                    "Message de desistement": data.withdrawnMessage,
                    "ID centre": center._id || "",
                    "Code centre": center.code || "",
                    "Nom du centre": center.name || "",
                    "Ville du centre": data.cohesionCenterCity || "",
                    "Département du centre": center.department || "",
                    "Région du centre": center.region || "",
                    "Confirmation point de rassemblement": data.meetingPointId || data.deplacementPhase1Autonomous === "true" ? "Oui" : "Non",
                    "se rend au centre par ses propres moyens": data.deplacementPhase1Autonomous,
                    "Bus n˚": meetingPoint?.busExcelId,
                    "Adresse point de rassemblement": meetingPoint?.departureAddress,
                    "Date aller": meetingPoint?.departureAtString,
                    "Date retour": meetingPoint?.returnAtString,
                  };
                }}
              />
            </Header>
            <Filter>
              <FilterRow visible>
                <DataSearch
                  defaultQuery={getDefaultQuery}
                  showIcon={false}
                  placeholder="Rechercher par prénom, nom, email, ville, code postal..."
                  componentId="SEARCH"
                  dataField={["email.keyword", "firstName", "lastName", "city", "zip"]}
                  react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                  // fuzziness={2}
                  style={{ flex: 1, marginRight: "1rem" }}
                  innerClass={{ input: "searchbox" }}
                  autosuggest={false}
                  queryFormat="and"
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
                  renderLabel={(items) => getFilterLabel(items, "Statut")}
                />
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
                />
                <Chevron color="#444" style={{ cursor: "pointer", transform: filterVisible && "rotate(180deg)" }} onClick={handleShowFilter} />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
                <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="STATUS_PHASE_1"
                  dataField="statusPhase1.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "STATUS_PHASE_1") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut phase 1")}
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
                  renderLabel={(items) => getFilterLabel(items, "Participations au séjour de cohésion")}
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
                  renderLabel={(items) => getFilterLabel(items, "Fiches sanitaires")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="STATUS_PHASE_2"
                  dataField="statusPhase2.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "STATUS_PHASE_2") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut phase 2")}
                />
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
                  renderLabel={(items) => getFilterLabel(items, "Statut phase 3")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="STATUS_APPLICATION"
                  dataField="phase2ApplicationStatus.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "STATUS_APPLICATION") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut mission")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="CONTRACT_STATUS"
                  dataField="statusPhase2Contract.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "CONTRACT_STATUS") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut contrats")}
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
                  renderLabel={(items) => getFilterLabel(items, "Statut documents Préparation Militaire")}
                />
              </FilterRow>
            </Filter>
            <ResultTable>
              <ReactiveListComponent
                defaultQuery={getDefaultQuery}
                react={{ and: FILTERS }}
                dataField="lastName.keyword"
                sortBy="asc"
                render={({ data }) => (
                  <Table>
                    <thead>
                      <tr>
                        <th width="40%">Volontaire</th>
                        <th width="40%">Contextes</th>
                        <th width="40%">Dernière connexion</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit, i) => (
                        <Hit key={hit._id} hit={hit} onClick={() => setVolontaire(hit)} selected={volontaire?._id === hit._id} />
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </ResultTable>
          </div>
          <Panel
            value={volontaire}
            onChange={() => {
              setVolontaire(null);
            }}
          />
        </div>
      </ReactiveBase>
    </div>
  );
};

const Hit = ({ hit, onClick, selected }) => {
  return (
    <tr style={{ backgroundColor: (selected && "#e6ebfa") || (hit.status === "WITHDRAWN" && "#BE3B1211") }} onClick={onClick}>
      <td>
        <MultiLine>
          <h2>{`${hit.firstName} ${hit.lastName}`}</h2>
          <p>
            {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {`• ${hit.city || ""} (${hit.department || ""})`}
          </p>
        </MultiLine>
      </td>
      <td>
        <Badge text={`Cohorte ${hit.cohort}`} />
        <Badge text="Phase 1" tooltipText={translate(hit.statusPhase1)} color={YOUNG_STATUS_COLORS[hit.statusPhase1]} />
        <Badge text="Phase 2" tooltipText={translate(hit.statusPhase2)} color={YOUNG_STATUS_COLORS[hit.statusPhase2]} />
        <Badge text="Phase 3" tooltipText={translate(hit.statusPhase3)} color={YOUNG_STATUS_COLORS[hit.statusPhase3]} />
        {hit.status === "WITHDRAWN" ? <Badge text="Désisté" color={YOUNG_STATUS_COLORS.WITHDRAWN} /> : null}
      </td>
      <td>{formatStringLongDate(hit.lastLoginAt)}</td>
      <td onClick={(e) => e.stopPropagation()}>
        <Action hit={hit} />
      </td>
    </tr>
  );
};

const Action = ({ hit, color }) => {
  const user = useSelector((state) => state.Auth.user);

  return (
    <ActionBox color={"#444"}>
      <UncontrolledDropdown setActiveFromChild>
        <DropdownToggle tag="button">
          Choisissez&nbsp;une&nbsp;action
          <Chevron color="#444" />
        </DropdownToggle>
        <DropdownMenu>
          <Link to={`/volontaire/${hit._id}`}>
            <DropdownItem className="dropdown-item">Consulter le profil</DropdownItem>
          </Link>
          <Link to={`/volontaire/${hit._id}/edit`}>
            <DropdownItem className="dropdown-item">Modifier le profil</DropdownItem>
          </Link>
          {[ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) ? (
            <DropdownItem className="dropdown-item">
              <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${hit._id}`}>Prendre sa place</a>
            </DropdownItem>
          ) : null}
        </DropdownMenu>
      </UncontrolledDropdown>
    </ActionBox>
  );
};
