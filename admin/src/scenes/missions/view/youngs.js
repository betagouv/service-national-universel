import React, { useState } from "react";
import styled from "styled-components";

import SelectStatusApplication from "../../../components/selectStatusApplication";
import api from "../../../services/api";
import MissionView from "./wrapper";
import Panel from "../../volontaires/panel";
import { formatStringLongDate } from "../../../utils";

export default ({ mission, applications }) => {
  const [missionTemp, setMissionTemp] = useState(mission);
  const data = applications;
  const [young, setYoung] = useState();
  const handleClick = async (application) => {
    const { ok, data } = await api.get(`/referent/young/${application.youngId}`);
    if (ok) setYoung(data);
  };

  const updateMission = async () => {
    const { data, ok } = await api.get(`/mission/${mission._id}`);
    if (ok) setMissionTemp(data);
  };

  if (!data) return <div>Chargement...</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
        <MissionView mission={missionTemp} tab="youngs">
          <Table>
            <thead>
              <tr>
                <th width="40%">Volontaire</th>
                <th>Date</th>
                <th width="20%">Statut pour la mission</th>
              </tr>
            </thead>
            <tbody>
              {data.map((hit, i) => (
                <Hit key={i} hit={hit} onClick={() => handleClick(hit)} onChangeApplication={updateMission} />
              ))}
            </tbody>
          </Table>
        </MissionView>
        <Panel
          value={young}
          onChange={() => {
            setYoung(null);
          }}
        />
      </div>
    </div>
  );
};

const Hit = ({ hit, onClick, onChangeApplication }) => {
  const getAge = (d) => {
    const now = new Date();
    const date = new Date(d);
    const diffTime = Math.abs(date - now);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  };
  return (
    <tr onClick={onClick}>
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
        <div>{formatStringLongDate(hit.createdAt)}</div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatusApplication hit={hit} callback={onChangeApplication} />
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
