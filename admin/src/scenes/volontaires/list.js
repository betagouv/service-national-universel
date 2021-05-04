import React, { useState } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { ReactiveBase, ReactiveList, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";
import VioletHeaderButton from "../../components/buttons/VioletHeaderButton";

import ExportComponent from "../../components/ExportXlsx";

import api from "../../services/api";
import { apiURL, appURL } from "../../config";
import Panel from "./panel";
import Badge from "../../components/Badge";
import { translate, getFilterLabel, formatStringLongDate, YOUNG_STATUS_COLORS, isInRuralArea, formatDateFR, formatLongDateFR } from "../../utils";
import { Link } from "react-router-dom";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import Chevron from "../../components/Chevron";
import { Filter, FilterRow, ResultTable, Table, TopResultStats, BottomResultStats, ActionBox, Header, Title, MultiLine } from "../../components/list";

const FILTERS = ["SEARCH", "STATUS", "COHORT", "DEPARTMENT", "REGION", "STATUS_PHASE_1", "STATUS_PHASE_2", "STATUS_PHASE_3", "STATUS_APPLICATION", "LOCATION"];

export default ({ setYoung }) => {
  const [volontaire, setVolontaire] = useState(null);
  const getDefaultQuery = () => ({ query: { bool: { filter: { terms: { "status.keyword": ["VALIDATED", "WITHDRAWN"] } } } } });
  const getExportQuery = () => ({ ...getDefaultQuery(), size: 10000 });
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
                  return {
                    _id: data._id,
                    Cohorte: data.cohort,
                    Prénom: data.firstName,
                    Nom: data.lastName,
                    "Date de naissance": formatDateFR(data.birthdateAt),
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
                    "fiche sanitaire réceptionnée": translate(data.cohesionStayMedicalFileReceived || "false"),
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
                  };
                }}
              />
            </Header>
            <Filter>
              <DataSearch
                showIcon={false}
                placeholder="Rechercher par prénom, nom, email..."
                componentId="SEARCH"
                dataField={["email.keyword", "firstName", "lastName"]}
                react={{ and: FILTERS }}
                // fuzziness={2}
                style={{ flex: 2 }}
                innerClass={{ input: "searchbox" }}
                autosuggest={false}
                queryFormat="and"
              />
              <FilterRow>
                <DataSearch
                  defaultQuery={getDefaultQuery}
                  showIcon={false}
                  placeholder="Ville ou code postal"
                  componentId="LOCATION"
                  dataField={["city", "zip"]}
                  react={{ and: FILTERS.filter((e) => e !== "LOCATION") }}
                  style={{ flex: 2 }}
                  innerClass={{ input: "searchbox" }}
                  className="searchbox-city"
                  autosuggest={false}
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
                <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
                <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
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
              </FilterRow>
            </Filter>
            <ResultTable>
              <ReactiveList
                defaultQuery={getDefaultQuery}
                componentId="result"
                react={{ and: FILTERS }}
                pagination={true}
                paginationAt="both"
                innerClass={{ pagination: "pagination" }}
                size={30}
                showLoader={true}
                dataField="lastName.keyword"
                sortBy="asc"
                loader={<div style={{ padding: "0 20px" }}>Chargement...</div>}
                innerClass={{ pagination: "pagination" }}
                renderNoResults={() => <div style={{ padding: "10px 25px" }}>Aucun résultat.</div>}
                renderResultStats={(e) => {
                  return (
                    <>
                      <TopResultStats>
                        Affiche {e.displayedResults * e.currentPage + 1} à {e.displayedResults * (e.currentPage + 1)} résultats sur {e.numberOfResults} résultats
                      </TopResultStats>
                      <BottomResultStats>
                        Affiche {e.displayedResults * e.currentPage + 1} à {e.displayedResults * (e.currentPage + 1)} résultats sur {e.numberOfResults} résultats
                      </BottomResultStats>
                    </>
                  );
                }}
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
                        <Hit key={i} hit={hit} onClick={() => setVolontaire(hit)} selected={volontaire?._id === hit._id} />
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
            setYoung={setYoung}
          />
        </div>
      </ReactiveBase>
    </div>
  );
};

const Hit = ({ hit, onClick, selected }) => {
  const getAge = (d) => {
    const now = new Date();
    const date = new Date(d);
    const diffTime = Math.abs(date - now);
    const age = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    if (!age || isNaN(age)) return "?";
    return age;
  };

  return (
    <tr style={{ backgroundColor: selected && "#e6ebfa" }} onClick={onClick}>
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
          {["admin", "referent_department", "referent_region"].includes(user.role) ? (
            <DropdownItem className="dropdown-item">
              <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${hit._id}`}>Prendre sa place</a>
            </DropdownItem>
          ) : null}
        </DropdownMenu>
      </UncontrolledDropdown>
    </ActionBox>
  );
};
