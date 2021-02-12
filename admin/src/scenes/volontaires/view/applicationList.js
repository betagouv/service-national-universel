import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";

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
          {applications.map((hit, i) => (
            <Hit key={i} hit={hit} index={i} />
          ))}
        </tbody>
      </Table>
      {applications.length ? null : <NoResult>Aucune candidature n'est liée à ce volontaire.</NoResult>}
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
