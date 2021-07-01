import React, { useState } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";
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
import { apiURL, appURL, environment } from "../../config";
import Panel from "./panel";
import { translate, getFilterLabel, formatStringLongDate, YOUNG_STATUS, getDepartmentNumber, isInRuralArea, formatDateFR, formatLongDateFR, ES_NO_LIMIT } from "../../utils";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import Chevron from "../../components/Chevron";
const FILTERS = ["SEARCH", "STATUS", "REGION", "DEPARTMENT", "SCHOOL"];
import { Filter, FilterRow, ResultTable, Table, ActionBox, Header, Title, MultiLine } from "../../components/list";
import ReactiveListComponent from "../../components/ReactiveListComponent";

export default () => {
  const [young, setYoung] = useState(null);
  const getDefaultQuery = () => ({ query: { bool: { filter: { term: { "phase.keyword": "INSCRIPTION" } } } } });
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="young" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <Title>Inscriptions</Title>
              <div style={{ display: "flex" }}>
                <Link to="/volontaire/create">
                  <VioletButton>
                    <p>Nouvelle inscription</p>
                  </VioletButton>
                </Link>
                <ExportComponent
                  title="Exporter les inscriptions"
                  defaultQuery={getExportQuery}
                  collection="candidature"
                  react={{ and: FILTERS }}
                  transform={(data) => {
                    return {
                      _id: data._id,
                      Cohorte: data.cohort,
                      Prénom: data.firstName,
                      Nom: data.lastName,
                      "Date de naissance": formatDateFR(data.birthdateAt),
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
                      Niveau: data.grade,
                      "Code postal de l'établissement": data.schoolZip,
                      "Ville de l'établissement": data.schoolCity,
                      "Département de l'établissement": data.schoolDepartment,
                      "Quartier Prioritaire de la ville": data.qpv,
                      "Zone Rurale": isInRuralArea(data),
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
                      "Droit à l'image": translate(data.imageRight),
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
                  }}
                />
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
                <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
                <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
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
};

const Hit = ({ hit, index, onClick, selected }) => {
  dayjs.extend(relativeTime).locale("fr");
  const diff = dayjs(new Date(hit.lastStatusAt)).fromNow();
  const user = useSelector((state) => state.Auth.user);

  let STATUS = [YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.VALIDATED, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WAITING_LIST];
  if (user.role === "admin") STATUS.push(YOUNG_STATUS.WAITING_VALIDATION);

  return (
    <tr style={{ backgroundColor: (selected && "#e6ebfa") || (hit.status === "WITHDRAWN" && "#BE3B1211") }} onClick={onClick} key={hit._id}>
      <td>{index + 1}</td>
      <td>
        <MultiLine>
          <h2>
            {hit.firstName} {hit.lastName}
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
