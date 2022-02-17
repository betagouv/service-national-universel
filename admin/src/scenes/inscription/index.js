import React, { useState } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import VioletButton from "../../components/buttons/VioletButton";
import ExportComponent from "../../components/ExportXlsx";
import SelectStatus from "../../components/selectStatus";
import api from "../../services/api";
import { apiURL, appURL } from "../../config";
import Panel from "./panel";
import {
  translate,
  getFilterLabel,
  formatStringLongDate,
  YOUNG_STATUS,
  isInRuralArea,
  formatDateFRTimezoneUTC,
  formatLongDateFR,
  ES_NO_LIMIT,
  ROLES,
  colors,
  departmentLookUp,
} from "../../utils";
import { RegionFilter, DepartmentFilter, AcademyFilter } from "../../components/filters";
import Chevron from "../../components/Chevron";
const FILTERS = ["SEARCH", "STATUS", "REGION", "DEPARTMENT", "SCHOOL", "COHORT", "PPS", "PAI", "QPV", "HANDICAP", "ZRR", "GRADE", "ACADEMY", "COUNTRY"];
import { Filter, FilterRow, ResultTable, Table, ActionBox, Header, Title, MultiLine } from "../../components/list";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import Badge from "../../components/Badge";
import plausibleEvent from "../../services/pausible";

export default function Inscription() {
  const [young, setYoung] = useState(null);
  const getDefaultQuery = () => ({ query: { bool: { filter: { term: { "phase.keyword": "INSCRIPTION" } } } }, track_total_hits: true });
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });
  const [filterVisible, setFilterVisible] = useState(false);
  const handleShowFilter = () => setFilterVisible(!filterVisible);

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="young" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <Title>Inscriptions</Title>
              <div style={{ display: "flex" }}>
                <Link to="/volontaire/create">
                  <VioletButton onClick={() => plausibleEvent("Inscriptions/CTA - Nouvelle inscription")}>
                    <p>Nouvelle inscription</p>
                  </VioletButton>
                </Link>
                <ExportComponent
                  handleClick={() => plausibleEvent("Inscriptions/CTA - Exporter inscriptions")}
                  title="Exporter les inscriptions"
                  defaultQuery={getExportQuery}
                  exportTitle="Candidatures"
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
                        Niveau: data.grade,
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
                        "Nature de l'aménagement spécifique": data.specificAmenagmentType,
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
                        "fiche sanitaire réceptionnée": translate(data.cohesionStayMedicalFileReceived || "false"),
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
                        Motivation: data.motivations,
                        Phase: translate(data.phase),
                        "Créé lé": formatLongDateFR(data.createdAt),
                        "Mis à jour le": formatLongDateFR(data.updatedAt),
                        "Dernière connexion le": formatLongDateFR(data.lastLoginAt),
                        Statut: translate(data.status),
                        "Dernier statut le": formatLongDateFR(data.lastStatusAt),
                      };
                    });
                  }}
                />
              </div>
            </Header>
            <Filter>
              <FilterRow visible>
                <DataSearch
                  showIcon={false}
                  placeholder="Rechercher une inscription..."
                  componentId="SEARCH"
                  dataField={["email.keyword", "firstName.folded", "lastName.folded", "phone"]}
                  react={{ and: FILTERS }}
                  // fuzziness={2}
                  style={{ flex: 1, marginRight: "1rem" }}
                  innerClass={{ input: "searchbox" }}
                  URLParams={true}
                  autosuggest={false}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  componentId="STATUS"
                  dataField="status.keyword"
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  react={{ and: FILTERS.filter((e) => e !== "STATUS") }}
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Statut")}
                />
                <Chevron color="#444" style={{ cursor: "pointer", transform: filterVisible && "rotate(180deg)" }} onClick={handleShowFilter} />
              </FilterRow>

              <FilterRow visible={filterVisible}>
                <AcademyFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Pays"
                  componentId="COUNTRY"
                  dataField="country.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "COUNTRY") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                />
                <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
                <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
                <MultiDropdownList
                  style={{ display: "none" }}
                  defaultQuery={getDefaultQuery}
                  componentId="SCHOOL"
                  dataField="schoolName.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "SCHOOL") }}
                  URLParams={true}
                />
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
              </FilterRow>
            </Filter>
            <ResultTable>
              <ReactiveListComponent
                defaultQuery={getDefaultQuery}
                react={{ and: FILTERS }}
                sortBy="desc"
                dataField="lastStatusAt"
                render={({ data, resultStats }) => {
                  return (
                    <Table>
                      <thead>
                        <tr>
                          <th width="10%" style={{ fontSize: 18 }}>
                            #
                          </th>
                          <th width="50%">Volontaire</th>
                          <th style={{ textAlign: "center" }}>Statut</th>
                          <th style={{ textAlign: "center" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((hit, i) => (
                          <Hit
                            key={hit._id}
                            hit={hit}
                            index={i + resultStats.currentPage * resultStats.displayedResults}
                            onClick={() => setYoung(hit)}
                            selected={young?._id === hit._id}
                          />
                        ))}
                      </tbody>
                    </Table>
                  );
                }}
              />
            </ResultTable>
          </div>
          <Panel value={young} onChange={() => setYoung(null)} />
        </div>
      </ReactiveBase>
    </div>
  );
}

const Hit = ({ hit, index, onClick, selected }) => {
  dayjs.extend(relativeTime).locale("fr");
  const diff = dayjs(new Date(hit.lastStatusAt)).fromNow();
  const user = useSelector((state) => state.Auth.user);

  let STATUS = [YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.VALIDATED, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WAITING_LIST];
  if (user.role === ROLES.ADMIN) STATUS.push(YOUNG_STATUS.WAITING_VALIDATION);

  return (
    <tr style={{ backgroundColor: (selected && "#e6ebfa") || (hit.status === "WITHDRAWN" && colors.extraLightGrey) }} onClick={onClick} key={hit._id}>
      <td>{index + 1}</td>
      <td>
        <MultiLine>
          <h2>
            {hit.firstName} {hit.lastName} <Badge text={hit.cohort} />
          </h2>
          <p>{`Statut mis à jour ${diff} • ${formatStringLongDate(hit.lastStatusAt)}`}</p>
        </MultiLine>
      </td>
      <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
        <SelectStatus hit={hit} options={STATUS} />
      </td>
      <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
        <Action hit={hit} />
      </td>
    </tr>
  );
};

const Action = ({ hit }) => {
  return (
    <ActionBox color={"#444"}>
      <UncontrolledDropdown setActiveFromChild>
        <DropdownToggle tag="button">
          Choisissez une action
          <Chevron color="#444" />
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem className="dropdown-item">
            <Link to={`/volontaire/${hit._id}`} onClick={() => plausibleEvent("Inscriptions/CTA - Consulter profil jeune")}>
              Consulter le profil
            </Link>
          </DropdownItem>
          <DropdownItem className="dropdown-item" onClick={() => plausibleEvent("Inscriptions/CTA - Modifier profil jeune")}>
            <Link to={`/volontaire/${hit._id}/edit`}>Modifier le profil</Link>
          </DropdownItem>
          <DropdownItem className="dropdown-item">
            <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${hit._id}`} onClick={() => plausibleEvent("Inscriptions/CTA - Prendre sa place")}>
              Prendre sa place
            </a>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </ActionBox>
  );
};
