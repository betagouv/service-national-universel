import React, { useState, useEffect } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import SelectStatusApplication from "../../components/selectStatusApplication";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import ExportComponent from "../../components/ExportXlsx";
import Loader from "../../components/Loader";
import { translate, getFilterLabel, formatStringLongDate, formatStringDate, getAge, ES_NO_LIMIT } from "../../utils";
import ReactiveListComponent from "../../components/ReactiveListComponent";

const FILTERS = ["SEARCH", "STATUS", "PHASE", "COHORT", "MISSIONS", "TUTOR"];

export default () => {
  const user = useSelector((state) => state.Auth.user);
  const [missions, setMissions] = useState([]);
  const [panel, setPanel] = useState(null);
  const getDefaultQuery = () => ({ query: { bool: { filter: { terms: { "missionId.keyword": missions.map((e) => e._id) } } } }, sort: [{ "youngLastName.keyword": "asc" }] });
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  async function appendMissions(structure) {
    const missionsResponse = await api.get(`/mission/structure/${structure}`);
    if (!missionsResponse.ok) {
      toastr.error("Oups, une erreur est survenue lors de la récuperation des missions", translate(missionsResponse.code));
      return history.push("/");
    }
    return missionsResponse.data;
  }

  async function initMissions(structure) {
    const m = await appendMissions(structure);
    if (user.role === "supervisor") {
      const subStructures = await api.get(`/structure/network/${structure}`);
      if (!subStructures.ok) {
        toastr.error("Oups, une erreur est survenue lors de la récuperation des missions des antennes", translate(subStructures.code));
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

  if (!missions.length) return <Loader />;
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
                collection="volontaire"
                react={{ and: FILTERS }}
                transformAll={async (data) => {
                  const youngIds = [...new Set(data.map((item) => item.youngId))];
                  if (youngIds?.length) {
                    const { responses } = await api.esQuery([
                      { index: "young", type: "_doc" },
                      { size: ES_NO_LIMIT, query: { ids: { type: "_doc", values: youngIds } } },
                    ]);
                    const youngs = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
                    return data.map((item) => ({ ...item, young: youngs.find((e) => e._id === item.youngId) }));
                  }
                  return data;
                }}
                transform={(data) => {
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
                    "Nom de la mission": data.missionName,
                    "Département de la mission": data.missionDepartment,
                    "Régino de la mission": data.missionRegion,
                    "Candidature créée lé": data.createdAt,
                    "Candidature mise à jour le": data.updatedAt,
                    "Statut de la candidature": data.status,
                    Tuteur: data.tutorName,
                  };
                }}
              />
            </Header>
            <Filter>
              <DataSearch
                showIcon={false}
                placeholder="Rechercher par mots clés, mission ou volontaire..."
                componentId="SEARCH"
                dataField={["youngFirstName", "youngLastName", "youngEmail", "missionName"]}
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
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Du</span> {formatStringDate(mission.startAt)}
        </div>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Au</span> {formatStringDate(mission.endAt)}
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

  .dropdown-filter {
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
  }
`;

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

const Table = styled.table`
  width: 100%;
  color: #242526;
  margin-top: 10px;
  background-color: #fff;
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

const ContractLink = styled.div`
  font-weight: 500;
  font-size: 0.8rem;
  text-align: center;
  margin-top: 0.5rem;
  :hover {
    text-decoration: underline;
  }
`;
