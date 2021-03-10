import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { ReactiveBase, ReactiveList, SingleList, MultiDropdownList, MultiList, DataSearch } from "@appbaseio/reactivesearch";

import { apiURL } from "../../../config";
import api from "../../../services/api";
import SelectStatusApplication from "../../../components/selectStatusApplication";
import { APPLICATION_STATUS, formatStringDate } from "../../../utils";
import { Link } from "react-router-dom";

export default ({ young }) => {
  const [applications, setApplications] = useState(null);

  useEffect(() => {
    getApplications();
  }, []);

  const getApplications = async () => {
    if (!young) return;
    const { ok, data, code } = await api.get(`/application/young/${young._id}`);
    if (!ok) return toastr.error("Oups, une erreur est survenue", code);
    data.sort((a, b) => (parseInt(a.priority) > parseInt(b.priority) ? 1 : parseInt(b.priority) > parseInt(a.priority) ? -1 : 0));
    return setApplications(data);
  };

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
      <Proposal young={young} onSend={getApplications} />
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
  if (!mission) return null;
  return (
    <tr>
      <td>
        <Mission to={`/mission/${hit.missionId}`}>
          <div>
            <h3>{hit.status === APPLICATION_STATUS.WAITING_ACCEPTATION ? "Mission proposée au volontaire" : `Choix ${index + 1}`}</h3>
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
          {mission.placesTotal - mission.placesLeft} / {mission.placesTotal}
        </div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatusApplication hit={hit} />
      </td>
    </tr>
  );
};

const Proposal = ({ young, onSend }) => {
  const FILTERS = ["SEARCH"];
  const [searchedValue, setSearchedValue] = useState("");

  const handleProposal = async (mission) => {
    const application = {
      youngId: young._id,
      youngFirstName: young.firstName,
      youngLastName: young.lastName,
      youngEmail: young.email,
      youngBirthdateAt: young.birthdateAt,
      youngCity: young.city,
      youngDepartment: young.department,
      youngCohort: young.cohort,
      missionId: mission._id,
      missionName: mission.name,
      missionDepartment: mission.department,
      missionRegion: mission.region,
      status: APPLICATION_STATUS.WAITING_ACCEPTATION,
    };
    const { ok, code } = await api.post(`/application`, application);
    if (!ok) return toastr.error("Oups, une erreur est survenue lors de la candidature", code);

    //send mail
    const { ok: okMail, code: codeMail } = await api.post(`/referent/email/apply/${young._id}`, { missionName: mission.name, structureName: mission.structureName });
    if (!okMail) return toastr.error("Oups, une erreur est survenue lors de l'envoi du mail", codeMail);
    toastr.success("Email envoyé !");
    return onSend();
  };

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
                dataField={["name^10", "description", "justifications", "contraintes", "frequence", "period"]}
                fuzziness={1}
                style={{ flex: 2 }}
                innerClass={{ input: "searchbox" }}
                autosuggest={false}
                onValueChange={setSearchedValue}
                queryFormat="and"
              />
            </Filter>
            <ResultTable hide={!searchedValue}>
              <ReactiveList
                componentId="result"
                scrollOnChange={false}
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
                        <HitMission key={i} hit={hit} onSend={() => handleProposal(hit)} />
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

const HitMission = ({ hit, onSend }) => {
  // console.log("h", hit);
  return (
    <tr>
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
          {hit.placesTotal - hit.placesLeft} / {hit.placesTotal}
        </div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <Button className="btn-blue" onClick={onSend}>
          Proposer cette mission
        </Button>
      </td>
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

const Button = styled.button`
  /* margin: 0 0.5rem; */
  align-self: flex-start;
  border-radius: 0.5rem;
  padding: 5px;
  font-size: 0.9rem;
  /* min-width: 100px; */
  width: 100%;
  font-weight: 500;
  cursor: pointer;
  background-color: #fff;
  color: #242526;
  border: 1px solid #dcdfe6;
  :hover {
    color: rgb(49, 130, 206);
    border-color: rgb(193, 218, 240);
    background-color: rgb(234, 243, 250);
  }
`;
