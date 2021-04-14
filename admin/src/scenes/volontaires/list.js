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
import { translate, getFilterLabel, formatStringLongDate, YOUNG_STATUS_COLORS } from "../../utils";
import { Link } from "react-router-dom";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import Chevron from "../../components/Chevron";

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
                    "Date de naissance": data.birthdateAt,
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
                    "Créé lé": data.createdAt,
                    "Mis à jour le": data.updatedAt,
                    "Dernière connexion le": data.lastLoginAt,
                    Statut: data.status,
                    "Statut Phase 1": data.statusPhase1,
                    "Statut Phase 2": data.statusPhase2,
                    "Statut Phase 3": data.statusPhase3,
                    "Dernier statut le": data.lastStatusAt,
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
                        <th width="40%">Email</th>
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
    <tr style={{ backgroundColor: selected ? "#f1f1f1" : "transparent" }} onClick={onClick}>
      <td>
        <div className="name">{`${hit.firstName} ${hit.lastName}`}</div>
        <div className="email">
          {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {`• ${hit.city || ""} (${hit.department || ""})`}
        </div>
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

const Header = styled.div`
  padding: 0 40px 0;
  display: flex;
  align-items: flex-start;
  margin-top: 20px;
  justify-content: space-between;
`;

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 30px;
`;

const Filter = styled.div`
  padding: 0 25px;
  margin-bottom: 20px;

  .searchbox {
    display: block;
    width: 100%;
    background-color: #fff;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
    color: #767676;
    border: 0;
    outline: 0;
    padding: 15px 20px;
    height: auto;
    border-radius: 6px;
    margin-right: 15px;
    ::placeholder {
      color: #767676;
    }
  }
`;

const FilterRow = styled.div`
  padding: 15px 0 0;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  .dropdown-filter {
    margin-right: 15px;
    margin-bottom: 15px;
  }
  .searchbox-city {
    min-width: 165px;
    max-width: 165px;
    margin-right: 15px;
    margin-bottom: 15px;
    input {
      padding: 10.5px 12px;
    }
  }
  button {
    background-color: #fff;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
    border: 0;
    border-radius: 6px;
    padding: 10px 20px;
    font-size: 14px;
    color: #242526;
    min-width: 150px;
    margin-right: 15px;
    cursor: pointer;
    div {
      width: 100%;
      overflow: visible;
    }
  }
`;

const ResultTable = styled.div`
  background-color: #fff;
  position: relative;
  margin: 20px 0;
  padding-bottom: 10px;
  .pagination {
    display: flex;
    justify-content: flex-end;
    padding: 10px 25px;
    background: #fff;
    a {
      background: #f7fafc;
      color: #242526;
      padding: 3px 10px;
      font-size: 12px;
      margin: 0 5px;
    }
    a.active {
      font-weight: 700;
      /* background: #5245cc;
      color: #fff; */
    }
    a:first-child {
      background-image: url(${require("../../assets/left.svg")});
    }
    a:last-child {
      background-image: url(${require("../../assets/right.svg")});
    }
    a:first-child,
    a:last-child {
      font-size: 0;
      height: 24px;
      width: 30px;
      background-position: center;
      background-repeat: no-repeat;
      background-size: 8px;
    }
  }
`;

const ResultStats = styled.div`
  color: #242526;
  font-size: 12px;
  padding-left: 25px;
`;

const TopResultStats = styled(ResultStats)`
  position: absolute;
  top: 25px;
  left: 0;
`;
const BottomResultStats = styled(ResultStats)`
  position: absolute;
  top: calc(100% - 50px);
  left: 0;
`;

const Table = styled.table`
  width: 100%;
  color: #242526;
  margin-top: 10px;
  th {
    border-top: 1px solid #f4f5f7;
    border-bottom: 1px solid #f4f5f7;
    padding: 15px;
    font-weight: 400;
    font-size: 14px;
    text-transform: uppercase;
  }
  td {
    padding: 15px;
    font-size: 14px;
    font-weight: 300;
    strong {
      font-weight: 700;
      margin-bottom: 5px;
      display: block;
    }
  }
  td:first-child,
  th:first-child {
    padding-left: 25px;
  }
  tbody tr {
    border-bottom: 1px solid #f4f5f7;
    :hover {
      background-color: #e6ebfa;
    }
    .name {
      color: black;
      font-weight: 600;
    }
    .email {
      font-size: 0.8rem;
    }
  }
`;

const ActionBox = styled.div`
  .dropdown-menu {
    min-width: 0;
    width: 200px;
    a,
    div {
      white-space: nowrap;
      font-size: 14px;
      :hover {
        color: inherit;
      }
    }
  }
  button {
    ${({ color }) => `
      background-color: ${color}15;
      border: 1px solid ${color};
      color: ${color};
    `}
    display: inline-flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    border-radius: 0.5rem;
    padding: 0 0 0 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    outline: 0;
    width: 100%;
    max-width: 250px;
    .edit-icon {
      height: 17px;
      margin-right: 10px;
      path {
        fill: ${({ color }) => `${color}`};
      }
    }
    .down-icon {
      margin-left: auto;
      padding: 7px 15px;
      /* border-left: 1px solid ${({ color }) => `${color}`}; */
      margin-left: 15px;
      svg {
        height: 10px;
      }
      svg polygon {
        fill: ${({ color }) => `${color}`};
      }
    }
  }
  .dropdown-item {
    border-radius: 0;
    background-color: transparent;
    border: none;
    color: #767676;
    white-space: nowrap;
    font-size: 14px;
    padding: 5px 15px;
    font-weight: 400;
    :hover {
      background-color: #f3f3f3;
    }
  }
`;
