import React, { useEffect, useState } from "react";
import { ReactiveBase, ReactiveList, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";

import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import ExportComponent from "../../components/ExportXlsx";
import { translate, getFilterLabel, YOUNG_STATUS_COLORS, formatDateFR, formatLongDateFR, isInRuralArea } from "../../utils";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import Badge from "../../components/Badge";
import { ResultTable, Filter, Table, FilterRow, TopResultStats, BottomResultStats } from "../../components/list";
import ToggleSwitch from "../../components/ToogleSwitch";
import { toastr } from "react-redux-toastr";

const FILTERS = ["SEARCH", "STATUS", "PHASE", "COHORT", "MISSIONS", "TUTOR", "STATUS_PHASE_1"];

export default () => {
  const user = useSelector((state) => state.Auth.user);
  const [volontaire, setVolontaire] = useState(null);
  const getDefaultQuery = () => ({ query: { bool: { filter: { term: { "cohesionCenterId.keyword": user.cohesionCenterId } } } } });
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
                defaultQuery={getExportQuery}
                title="Exporter les volontaires"
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
                    "Autotest PCR": translate(data.autoTestPCR),
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
                placeholder="Rechercher par prénom, nom, email, ville, code postal..."
                componentId="SEARCH"
                dataField={["email.keyword", "firstName", "lastName", "city", "zip"]}
                react={{ and: FILTERS }}
                // fuzziness={2}
                style={{ flex: 2 }}
                innerClass={{ input: "searchbox" }}
                autosuggest={false}
                queryFormat="and"
              />
              <FilterRow>
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
                        <th width="30%">Volontaire</th>
                        <th width="30%">Contextes</th>
                        <th width="20%">Présence au séjour</th>
                        <th width="20%">Fiche sanitaire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit, i) => (
                        <Hit
                          key={i}
                          hit={hit}
                          callback={(e) => {
                            if (e._id === volontaire?._id) setVolontaire(e);
                          }}
                          onClick={() => setVolontaire(hit)}
                          selected={volontaire?._id === hit._id}
                        />
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </ResultTable>{" "}
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

const Hit = ({ hit, onClick, selected, callback }) => {
  const [cohesionStayPresenceChecked, setCohesionStayPresenceChecked] = useState();
  const [cohesionStayMedicalFileReceivedChecked, setCohesionStayMedicalFileReceivedChecked] = useState();

  useEffect(() => {
    !cohesionStayPresenceChecked && setCohesionStayPresenceChecked(hit.cohesionStayPresence);
    !cohesionStayMedicalFileReceivedChecked && setCohesionStayMedicalFileReceivedChecked(hit.cohesionStayMedicalFileReceived);
  }, [hit]);

  const getAge = (d) => {
    const now = new Date();
    const date = new Date(d);
    const diffTime = Math.abs(date - now);
    const age = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    if (!age || isNaN(age)) return "?";
    return age;
  };

  const updateYoung = async (v) => {
    const { data, ok, code } = await api.put(`/referent/young/${hit._id}`, v);
    if (!ok) return toastr.error("Oups, une erreur s'est produite", translate(code));
    data.cohesionStayPresence !== cohesionStayPresenceChecked && setCohesionStayPresenceChecked(data.cohesionStayPresence);
    data.cohesionStayMedicalFileReceived !== cohesionStayMedicalFileReceivedChecked && setCohesionStayMedicalFileReceivedChecked(data.cohesionStayMedicalFileReceived);
    callback(data);
  };

  return (
    <tr style={{ backgroundColor: selected && "#e6ebfa" }}>
      <td onClick={onClick}>
        <div className="name">{`${hit.firstName} ${hit.lastName}`}</div>
        <div className="email">
          {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {`• ${hit.city || ""} (${hit.department || ""})`}
        </div>
      </td>
      <td onClick={onClick}>
        <Badge text={`Cohorte ${hit.cohort}`} />
        {hit.status === "WITHDRAWN" ? <Badge text="Désisté" color={YOUNG_STATUS_COLORS.WITHDRAWN} /> : null}
      </td>
      <td>
        <ToggleSwitch
          id={`cohesionStayPresence${hit._id}`}
          optionLabels={["Présent", "Absent"]}
          checked={cohesionStayPresenceChecked === "true"}
          onChange={(checked) => {
            updateYoung({ cohesionStayPresence: checked });
          }}
        />
      </td>
      <td>
        <ToggleSwitch
          id={`cohesionStayMedicalFileReceived${hit._id}`}
          optionLabels={["Réceptionné", "Non réceptionné"]}
          checked={cohesionStayMedicalFileReceivedChecked === "true"}
          onChange={(checked) => {
            updateYoung({ cohesionStayMedicalFileReceived: checked });
          }}
        />
      </td>
    </tr>
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
