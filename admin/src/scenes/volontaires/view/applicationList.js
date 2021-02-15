import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { ReactiveBase, ReactiveList, SingleList, MultiDropdownList, MultiList, DataSearch } from "@appbaseio/reactivesearch";

import { apiURL } from "../../../config";
import api from "../../../services/api";
import SelectStatusApplication from "../../../components/selectStatusApplication";
import { formatStringDate } from "../../../utils";
import { Link } from "react-router-dom";

export default ({ young }) => {
  const [applications, setApplications] = useState(null);

  useEffect(() => {
    (async () => {
      if (!young) return;
      const { ok, data, code } = await api.get(`/application/young/${young._id}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue", code);
      data.sort((a, b) => (parseInt(a.priority) > parseInt(b.priority) ? 1 : parseInt(b.priority) > parseInt(a.priority) ? -1 : 0));
      return setApplications(data);
    })();
  }, []);

  if (!applications) return <div>Chargement</div>;

  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Missions candidatées</th>
            <th style={{ width: "200px" }}>Dates</th>
            <th style={{ width: "90px" }}>Places</th>
            <th style={{ width: "250px" }}>Statut</th>
          </tr>
        </thead>
        <tbody>
          <>
            {applications.map((hit, i) => (
              <Hit key={i} hit={hit} index={i} />
            ))}
          </>
        </tbody>
      </Table>
      {applications.length ? null : <NoResult>Aucune candidature n'est liée à ce volontaire.</NoResult>}
      <Proposal />
    </>
  );
};

const Hit = ({ hit, index }) => {
  const [mission, setMission] = useState();
  useEffect(() => {
    (async () => {
      if (!hit.missionId) return;
      const { ok, data, code } = await api.get(`/mission/${hit.missionId}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue", code);
      return setMission(data);
    })();
  }, []);
  if (!mission) return <div>Chargement</div>;
  return (
    <tr>
      <td>
        <Mission to={`/mission/${hit.missionId}`}>
          <div>
            <h3>Choix {index + 1}</h3>
            <h2>{mission.name}</h2>
            <p>
              {mission.structureName} {`• ${mission.city} (${mission.department})`}
            </p>
          </div>
        </Mission>
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
          {mission.placesTaken} / {mission.placesTotal}
        </div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatusApplication hit={hit} />
      </td>
    </tr>
  );
};

const Proposal = ({}) => {
  const FILTERS = ["SEARCH"];
  const [value, setValue] = useState("");
  return (
    <ProposalContainer>
      <ProposalTitle>Proposer une mission au volontaire</ProposalTitle>
      <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
          <div style={{ flex: 2, position: "relative" }}>
            <Filter>
              <DataSearch
                showIcon={false}
                placeholder="Rechercher une mission par mots clés..."
                componentId="SEARCH"
                dataField={["name", "description", "justifications", "contraintes", "frequence", "period"]}
                fuzziness={1}
                style={{ flex: 2 }}
                innerClass={{ input: "searchbox" }}
                autosuggest={false}
                onValueChange={setValue}
              />
            </Filter>
            <ResultTable hide={!value}>
              <ReactiveList
                componentId="result"
                react={{ and: FILTERS }}
                pagination={true}
                paginationAt="bottom"
                innerClass={{ pagination: "pagination" }}
                size={3}
                showLoader={true}
                dataField="createdAt"
                sortBy="desc"
                loader={<div style={{ padding: "0 20px" }}>Chargement...</div>}
                renderNoResults={() => <div style={{ padding: "10px 25px" }}>Aucun Résultat.</div>}
                renderResultStats={(e) => {
                  return (
                    <div>
                      <BottomResultStats>
                        Affiche {e.displayedResults * e.currentPage + 1} à {e.displayedResults * (e.currentPage + 1)} résultats sur {e.numberOfResults} résultats
                      </BottomResultStats>
                    </div>
                  );
                }}
                render={({ data }) => (
                  <Table>
                    {/* <thead>
                      <tr>
                        <th>Mission</th>
                        <th style={{ width: "200px" }}>Dates</th>
                        <th style={{ width: "90px" }}>Places</th>
                        <th style={{ width: "250px" }}>Statut</th>
                      </tr>
                    </thead> */}
                    <tbody>
                      {data.map((hit, i) => (
                        <HitMission key={i} hit={hit} onClick={() => {}} />
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </ResultTable>
          </div>
        </div>
      </ReactiveBase>
    </ProposalContainer>
  );
};

const HitMission = ({ hit, onClick }) => {
  // console.log("h", hit);
  return (
    <tr onClick={onClick}>
      <td>
        <TeamMember to={`/mission/${hit._id}`}>
          <div>
            <h2>{hit.name}</h2>
            <p>
              {hit.structureName} {`• ${hit.city} (${hit.department})`}
            </p>
          </div>
        </TeamMember>
      </td>
      <td>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Du</span> {formatStringDate(hit.startAt)}
        </div>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Au</span> {formatStringDate(hit.endAt)}
        </div>
      </td>
      <td>
        {hit.placesTotal <= 1 ? `${hit.placesTotal} place` : `${hit.placesTotal} places`}
        <div style={{ fontSize: 12, color: "rgb(113,128,150)" }}>
          {hit.placesTaken} / {hit.placesTotal}
        </div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>Proposer cette mission</td>
    </tr>
  );
};

const ProposalContainer = styled.div`
  height: 150px;
  background-color: #372f78;
  padding: 1rem 3rem;
  border-radius: 0 0 8px 8px;
`;

const ProposalTitle = styled.div`
  color: #fff;
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: 500;
`;

const TeamMember = styled(Link)`
  h2 {
    color: #333;
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 5px;
  }
  p {
    color: #606266;
    font-size: 12px;
    margin: 0;
  }
`;

const Filter = styled.div`
  padding: 0;
  margin: 1rem 0 0.2rem 0;

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

const ResultTable = styled.div`
  ${({ hide }) => (hide ? "display: none;" : "")}
  background-color: #fff;
  position: relative;
  padding-bottom: 10px;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  .pagination {
    margin: 0;
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
      background-image: url(${require("../../../assets/left.svg")});
    }
    a:last-child {
      background-image: url(${require("../../../assets/right.svg")});
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

const NoResult = styled.div`
  text-align: center;
  font-style: italic;
  margin: 2rem;
`;
const Table = styled.table`
  width: 100%;
  color: #242526;
  margin-top: 10px;
  th {
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

const Mission = styled(Link)`
  h3 {
    color: #5245cc;
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 500;
  }
  h2 {
    color: #333;
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 5px;
  }
  p {
    color: #606266;
    font-size: 12px;
    margin: 0;
  }
`;
