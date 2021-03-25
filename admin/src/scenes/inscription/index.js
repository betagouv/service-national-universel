import React, { useState } from "react";
import { ReactiveBase, ReactiveList, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import VioletHeaderButton from "../../components/buttons/VioletHeaderButton";

import ExportComponent from "../../components/ExportXlsx";
import SelectStatus from "../../components/selectStatus";
import api from "../../services/api";
import { apiURL, appURL } from "../../config";
import Panel from "./panel";
import { translate, getFilterLabel, formatStringLongDate, YOUNG_STATUS } from "../../utils";

const FILTERS = ["SEARCH", "STATUS", "REGION", "DEPARTMENT", "REMOVEINPROGRESS"];

export default () => {
  const [young, setYoung] = useState(null);
  const DEFAULT_QUERY = () => ({ query: { bool: { filter: { term: { "phase.keyword": "INSCRIPTION" } } } } });

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="young" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <Title>Inscriptions</Title>
              <div style={{ display: "flex" }}>
                <Link to="/volontaire/create">
                  <VioletHeaderButton>
                    <p>Nouvelle inscription</p>
                  </VioletHeaderButton>
                </Link>
                <VioletHeaderButton>
                  <ExportComponent
                    title="Exporter les inscriptions"
                    collection="candidature"
                    react={{ and: FILTERS }}
                    transform={(data) => {
                      return {
                        _id: data._id,
                        Cohorte: data.cohort,
                        Prénom: data.firstName,
                        Nom: data.lastName,
                        "Date de naissance": data.birthdateAt,
                        Sexe: translate(data.gender),
                        Email: data.email,
                        Téléphone: data.phone,
                        "Adresse postale": data.address,
                        "Code postal": data.zip,
                        Ville: data.city,
                        Département: data.department,
                        Région: data.region,
                        Situation: translate(data.situation),
                        "Type d'établissement": data.schoolType,
                        "Nom de l'établissement": data.schoolName,
                        "Code postal de l'établissement": data.schoolZip,
                        "Ville de l'établissement": data.schoolCity,
                        "Département de l'établissement": data.schoolDepartment,
                        Handicap: translate(data.handicap),
                        "Bénéficiaire d'un PPS": translate(data.ppsBeneficiary),
                        "Bénéficiaire d'un PAI": translate(data.paiBeneficiary),
                        "Structure médico-sociale": data.medicosocialStructure,
                        "Nom de la structure médico-sociale": data.medicosocialStructureName,
                        "Adresse de la structure médico-sociale": data.medicosocialStructureAddress,
                        "Code postal de la structure médico-sociale": data.medicosocialStructureZip,
                        "Ville de la structure médico-sociale": data.medicosocialStructureCity,
                        "Aménagement spécifique": translate(data.specificAmenagment),
                        "Nature de l'aménagement spécifique": data.specificAmenagmentType,
                        "Activité de haut-niveau": translate(data.highSkilledActivity),
                        "Nature de l'activité de haut-niveau": data.highSkilledActivityType,
                        "Document activité de haut-niveau ": data.highSkilledActivityProofFiles,
                        "Consentement des représentants légaux": translate(data.parentConsentment),
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
                        "Créé lé": data.createdAt,
                        "Mis à jour le": data.updatedAt,
                        "Dernière connexion le": data.lastLoginAt,
                        Statut: translate(data.status),
                        "Dernier statut le": data.lastStatusAt,
                      };
                    }}
                  />
                </VioletHeaderButton>
              </div>
            </Header>
            <Filter>
              <DataSearch
                showIcon={false}
                placeholder="Rechercher une inscription..."
                componentId="SEARCH"
                dataField={["email.keyword", "firstName", "lastName", "phone"]}
                react={{ and: FILTERS }}
                // fuzziness={2}
                style={{ flex: 2 }}
                innerClass={{ input: "searchbox" }}
                autosuggest={false}
              />
              <FilterRow>
                <MultiDropdownList
                  defaultQuery={DEFAULT_QUERY}
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
                <MultiDropdownList
                  defaultQuery={DEFAULT_QUERY}
                  className="dropdown-filter"
                  placeholder="Régions"
                  componentId="REGION"
                  dataField="region.keyword"
                  title=""
                  react={{ and: FILTERS.filter((e) => e !== "REGION") }}
                  URLParams={true}
                  showSearch={false}
                  sortBy="asc"
                />
                <MultiDropdownList
                  defaultQuery={DEFAULT_QUERY}
                  className="dropdown-filter"
                  placeholder="Départements"
                  componentId="DEPARTMENT"
                  dataField="department.keyword"
                  title=""
                  react={{ and: FILTERS.filter((e) => e !== "DEPARTMENT") }}
                  URLParams={true}
                  showSearch={false}
                  sortBy="asc"
                />
              </FilterRow>
            </Filter>
            <ResultTable>
              <ReactiveList
                defaultQuery={DEFAULT_QUERY}
                componentId="result"
                react={{ and: FILTERS }}
                pagination={true}
                paginationAt="both"
                innerClass={{ pagination: "pagination" }}
                // renderPagination={(e) => <ResultFooter {...e} />}
                size={30}
                showLoader={true}
                sortBy="desc"
                dataField="lastStatusAt"
                loader={<div style={{ padding: "0 20px" }}>Chargement...</div>}
                innerClass={{ pagination: "pagination" }}
                renderNoResults={() => <div />}
                onError={() => {
                  window.location.href = "/auth?unauthorized=1";
                }}
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
                            key={i}
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
};

const Hit = ({ hit, index, onClick, selected }) => {
  dayjs.extend(relativeTime).locale("fr");
  const diff = dayjs(new Date(hit.lastStatusAt)).fromNow();
  const user = useSelector((state) => state.Auth.user);

  let STATUS = [YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.VALIDATED, YOUNG_STATUS.REFUSED];
  if (user.role === "admin") STATUS.push(YOUNG_STATUS.WAITING_VALIDATION);

  return (
    <tr style={{ backgroundColor: selected ? "#f1f1f1" : "transparent" }} onClick={onClick} key={hit._id}>
      <td>{index + 1}</td>
      <td>
        <strong>
          {hit.firstName} {hit.lastName}
        </strong>
        <div>{`Statut mis à jour ${diff} • ${formatStringLongDate(hit.lastStatusAt)}`}</div>
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
          <div className="down-icon">
            <svg viewBox="0 0 407.437 407.437">
              <polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 " />
            </svg>
          </div>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem className="dropdown-item">
            <Link to={`/volontaire/${hit._id}/edit`}>Modifier le profil</Link>
          </DropdownItem>
          <DropdownItem className="dropdown-item">
            <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${hit._id}`}>Prendre sa place</a>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </ActionBox>
  );
};

const Header = styled.div`
  padding: 0 25px 20px;
  display: flex;
  margin-top: 20px;
  align-items: flex-start;
  justify-content: space-between;
`;

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
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
