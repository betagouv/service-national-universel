import React, { useState, useEffect } from "react";
import { ReactiveBase, ReactiveList, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";

import { apiURL } from "../../../config";
import SelectStatus from "../../../components/selectStatus";
import api from "../../../services/api";
import CenterView from "./wrapper";
import Panel from "../../volontaires/panel";

import { getFilterLabel, YOUNG_STATUS_PHASE1, translate, formatDateFR, isInRuralArea, formatLongDateFR, getAge, ES_NO_LIMIT } from "../../../utils";
import Loader from "../../../components/Loader";
import ExportComponent from "../../../components/ExportXlsx";
import { Filter, FilterRow, ResultTable, Table, TopResultStats, BottomResultStats, MultiLine } from "../../../components/list";
const FILTERS = ["SEARCH", "STATUS", "COHORT", "DEPARTMENT", "REGION", "STATUS_PHASE_1", "STATUS_PHASE_2", "STATUS_PHASE_3", "STATUS_APPLICATION", "LOCATION"];

export default ({ center, updateCenter }) => {
  const [young, setYoung] = useState();
  const [meetingPoints, setMeetingPoints] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/meeting-point/all");
      setMeetingPoints(data);
    })();
  }, []);
  const getDefaultQuery = () => ({
    query: {
      bool: {
        filter: [{ terms: { "status.keyword": ["VALIDATED", "WITHDRAWN"] } }, { term: { cohesionCenterId: center._id } }],
        must_not: [{ term: { "statusPhase1.keyword": "WAITING_LIST" } }],
      },
    },
  });
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  const handleClick = async (young) => {
    const { ok, data } = await api.get(`/referent/young/${young._id}`);
    if (ok) setYoung(data);
  };

  if (!center) return <Loader />;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <CenterView center={center} tab="volontaires">
        <div>
          <ReactiveBase url={`${apiURL}/es`} app="cohesionyoung" headers={{ Authorization: `JWT ${api.getToken()}` }}>
            <div style={{ float: "right", marginBottom: "1.5rem", marginRight: "1.5rem" }}>
              <ExportComponent
                title="Exporter les volontaires"
                defaultQuery={getExportQuery}
                collection="volontaire"
                react={{ and: FILTERS }}
                transform={(data) => {
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
                      data.mobilityNearRelative && data.mobilityNearRelativeName + " - " + data.mobilityNearRelativeAddress + " - " + data.mobilityNearRelativeZip,
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
                    Adresse: center.address || "",
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
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Filter>
                  <DataSearch
                    defaultQuery={getDefaultQuery}
                    showIcon={false}
                    placeholder="Rechercher par prénom, nom, email, ville, code postal..."
                    componentId="SEARCH"
                    dataField={["email.keyword", "firstName", "lastName", "city", "zip"]}
                    react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
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
                            <th width="70%">Volontaire</th>
                            <th>Affectation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((hit) => (
                            <Hit key={hit._id} hit={hit} onClick={() => handleClick(hit)} selected={young?._id === hit._id} onChangeYoung={updateCenter} />
                          ))}
                        </tbody>
                      </Table>
                    )}
                  />
                </ResultTable>
              </div>
            </div>
          </ReactiveBase>
        </div>
      </CenterView>
      <Panel
        value={young}
        onChange={() => {
          setYoung(null);
        }}
      />
    </div>
  );
};

const Hit = ({ hit, onClick, selected, onChangeYoung }) => {
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
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatus
          disabled
          hit={hit}
          callback={onChangeYoung}
          options={Object.keys(YOUNG_STATUS_PHASE1).filter((e) => e !== "WAITING_LIST")}
          statusName="statusPhase1"
          phase="COHESION_STAY"
        />
      </td>
    </tr>
  );
};
