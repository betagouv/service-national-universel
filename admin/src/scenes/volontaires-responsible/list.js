import React, { useState, useEffect } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import SelectStatusApplication from "../../components/selectStatusApplication";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import ExportComponent from "../../components/ExportXlsx";
import Loader from "../../components/Loader";
import Chevron from "../../components/Chevron";
import ContractLink from "../../components/ContractLink";
import { Filter, FilterRow, ResultTable, Table, Header, Title } from "../../components/list";
import { translate, getFilterLabel, formatStringLongDate, formatStringDateTimezoneUTC, getAge, ES_NO_LIMIT, ROLES } from "../../utils";
import ReactiveListComponent from "../../components/ReactiveListComponent";

const FILTERS = ["SEARCH", "STATUS", "PHASE", "COHORT", "MISSIONS", "TUTOR"];

export default () => {
  const user = useSelector((state) => state.Auth.user);
  const [missions, setMissions] = useState();
  const [panel, setPanel] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const history = useHistory();
  const handleShowFilter = () => setFilterVisible(!filterVisible);
  const getDefaultQuery = () => ({ query: { bool: { filter: { terms: { "missionId.keyword": missions.map((e) => e._id) } } } }, sort: [{ "youngLastName.keyword": "asc" }] });
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  async function appendMissions(structure) {
    const missionsResponse = await api.get(`/structure/${structure}/mission`);
    if (!missionsResponse.ok) {
      toastr.error("Oups, une erreur est survenue lors de la récupération des missions", translate(missionsResponse.code));
      return history.push("/");
    }
    return missionsResponse.data;
  }

  async function initMissions(structure) {
    const m = await appendMissions(structure);
    if (user.role === ROLES.SUPERVISOR) {
      const subStructures = await api.get(`/structure/${structure}/children`);
      if (!subStructures.ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération des missions des antennes", translate(subStructures.code));
        return history.push("/");
      }
      for (let i = 0; i < subStructures.data.length; i++) {
        const subStructure = subStructures.data[i];
        const tempMissions = await appendMissions(subStructure._id);
        m.push(...tempMissions);
      }
    }
    setMissions(m);
  }

  // Get all missions from structure then get all applications int order to display the volontaires' list.
  useEffect(() => {
    initMissions(user.structureId);
  }, []);

  const handleClick = async (application) => {
    const { ok, data } = await api.get(`/referent/young/${application.youngId}`);
    if (ok) setPanel({ application, young: data });
  };

  if (!missions) return <Loader />;
  console.log(filterVisible);
  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="application" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <div>
                <Title>Volontaires</Title>
              </div>
              <ExportComponent
                defaultQuery={getExportQuery}
                title="Exporter les volontaires"
                exportTitle="Volontaire"
                index="application"
                react={{ and: FILTERS }}
                transform={async (data) => {
                  let all = data;
                  const youngIds = [...new Set(data.map((item) => item.youngId))];
                  if (youngIds?.length) {
                    const { responses } = await api.esQuery("young", { size: ES_NO_LIMIT, query: { ids: { type: "_doc", values: youngIds } } });
                    if (responses.length) {
                      const youngs = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
                      all = data.map((item) => ({ ...item, young: youngs.find((e) => e._id === item.youngId) || {} }));
                    }
                  }
                  return all.map((data) => {
                    return {
                      _id: data._id,
                      Cohorte: data.youngCohort,
                      Prénom: data.youngFirstName,
                      Nom: data.youngLastName,
                      "Date de naissance": data.youngBirthdateAt,
                      Email: data.youngEmail,
                      Téléphone: data.young.phone,
                      "Adresse du volontaire": data.young.address,
                      "Code postal du volontaire": data.young.zip,
                      "Ville du volontaire": data.young.city,
                      "Département du volontaire": data.young.department,
                      "Prénom représentant légal 1": data.young.parent1FirstName,
                      "Nom représentant légal 1": data.young.parent1LastName,
                      "Email représentant légal 1": data.young.parent1Email,
                      "Téléphone représentant légal 1": data.young.parent1Phone,
                      "Prénom représentant légal 2": data.young.parent2LastName,
                      "Nom représentant légal 2": data.young.parent2LastName,
                      "Email représentant légal 2": data.young.parent2Email,
                      "Téléphone représentant légal 2": data.young.parent2Phone,
                      "Choix - Ordre de la candidature": data.priority,
                      "Nom de la mission": data.missionName,
                      "Département de la mission": data.missionDepartment,
                      "Région de la mission": data.missionRegion,
                      "Candidature créée lé": data.createdAt,
                      "Candidature mise à jour le": data.updatedAt,
                      "Statut de la candidature": translate(data.status),
                      Tuteur: data.tutorName,
                    };
                  });
                }}
              />
            </Header>
            <Filter>
              <FilterRow visible>
                <DataSearch
                  showIcon={false}
                  placeholder="Rechercher par mots clés, mission ou volontaire..."
                  componentId="SEARCH"
                  dataField={["youngFirstName", "youngLastName", "youngEmail", "missionName"]}
                  react={{ and: FILTERS }}
                  // fuzziness={2}
                  style={{ flex: 1, marginRight: "1rem" }}
                  innerClass={{ input: "searchbox" }}
                  autosuggest={false}
                  URLParams={true}
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
                <Chevron color="#444" style={{ cursor: "pointer", transform: filterVisible && "rotate(180deg)" }} onClick={handleShowFilter} />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Tuteur"
                  componentId="TUTOR"
                  dataField="tutorName.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "TUTOR") }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                />
              </FilterRow>
            </Filter>
            <ResultTable>
              <ReactiveListComponent
                react={{ and: FILTERS }}
                defaultQuery={getDefaultQuery}
                render={({ data }) => (
                  <Table>
                    <thead>
                      <tr>
                        <th width="25%">Volontaire</th>
                        <th width="25%">Mission candidatée</th>
                        <th>Dates</th>
                        <th>Places</th>
                        <th width="20%">Statut de la candidature</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit) => (
                        <Hit
                          key={hit._id}
                          hit={hit}
                          onClick={() => handleClick(hit)}
                          selected={panel?.application?._id === hit._id}
                          mission={missions.find((m) => m._id === hit.missionId)}
                        />
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </ResultTable>
          </div>
          <Panel
            value={panel?.young}
            application={panel?.application}
            onChange={() => {
              setPanel(null);
            }}
          />
        </div>
      </ReactiveBase>
    </div>
  );
};

const Hit = ({ hit, onClick, selected, mission }) => {
  const history = useHistory();
  return (
    <tr style={{ backgroundColor: selected ? "#f1f1f1" : "transparent" }} onClick={onClick}>
      <td>
        <TeamMember>
          <div>
            <h2>{`${hit.youngFirstName} ${hit.youngLastName}`}</h2>
            <p>
              {hit.youngBirthdateAt ? `${getAge(hit.youngBirthdateAt)} ans` : null} {`• ${hit.youngCity || ""} (${hit.youngDepartment || ""})`}
            </p>
          </div>
        </TeamMember>
      </td>
      <td>
        <TeamMember>
          <div>
            <h2>
              <span>CHOIX {hit.priority}</span> : {hit.missionName}
            </h2>
            <p>{formatStringLongDate(hit.createdAt)}</p>
          </div>
        </TeamMember>
      </td>
      <td>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Du</span> {formatStringDateTimezoneUTC(mission.startAt)}
        </div>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Au</span> {formatStringDateTimezoneUTC(mission.endAt)}
        </div>
      </td>
      <td>
        {mission.placesTotal <= 1 ? `${mission.placesTotal} place` : `${mission.placesTotal} places`}
        <div style={{ fontSize: 12, color: "rgb(113,128,150)" }}>
          {mission.placesTotal - mission.placesLeft} / {mission.placesTotal}
        </div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatusApplication
          hit={hit}
          callback={(status) => {
            if (status === "VALIDATED") {
              history.push(`/volontaire/${hit.youngId}/phase2/application/${hit._id}/contrat`);
            }
          }}
        />
        {hit.status === "VALIDATED" || hit.status === "IN_PROGRESS" || hit.status === "DONE" || hit.status === "ABANDON" ? (
          <ContractLink
            onClick={() => {
              history.push(`/volontaire/${hit.youngId}/phase2/application/${hit._id}/contrat`);
            }}
          >
            Contrat d'engagement &gt;
          </ContractLink>
        ) : null}
      </td>
    </tr>
  );
};

const TeamMember = styled.div`
  h2 {
    color: #333;
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 5px;
    span {
      color: #5245cc;
      font-size: 12px;
    }
  }
  p {
    color: #606266;
    font-size: 12px;
    margin: 0;
  }
`;
