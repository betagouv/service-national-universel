import React, { useState, useEffect } from "react";
import styled from "styled-components";
import api from "../../../services/api";
import StructureView from "./wrapper";
import Panel from "../../missions/panel";

import { formatStringDateTimezoneUTC } from "../../../utils";
import SelectStatusMission from "../../../components/selectStatusMission";
import Loader from "../../../components/Loader";

export default ({ structure }) => {
  const [data, setData] = useState([]);
  const [mission, setMission] = useState();

  useEffect(() => {
    (async () => {
      if (!structure) return;
      const { ok, data } = await api.get(`/structure/${structure._id}/mission`);
      if (ok) setData(data);
    })();
  }, [structure]);

  const handleClick = async (mission) => {
    const { ok, data } = await api.get(`/mission/${mission._id}`);
    if (ok) setMission(data);
  };

  if (!structure) return <Loader />;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <StructureView structure={structure} tab="missions">
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
          <div style={{ flex: 2, position: "relative" }}>
            <Table>
              <thead>
                <tr>
                  <th width="40%">Volontaire</th>
                  <th>Dates</th>
                  <th>Places</th>
                  <th width="20%">Statut pour la mission</th>
                </tr>
              </thead>
              <tbody>
                {data.map((hit) => (
                  <Hit key={hit._id} hit={hit} onClick={() => handleClick(hit)} />
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </StructureView>
      <Panel
        mission={mission}
        onChange={() => {
          setMission(null);
        }}
      />
    </div>
  );
};

const Hit = ({ hit, onClick }) => {
  return (
    <tr onClick={onClick}>
      <td>
        <TeamMember>
          <div>
            <h2>{`${hit.name}`}</h2>
            <p>
              {hit.structureName} {`• ${hit.city || ""} (${hit.department || ""})`}
            </p>
          </div>
        </TeamMember>
      </td>
      <td>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Du</span> {formatStringDateTimezoneUTC(hit.startAt)}
        </div>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Au</span> {formatStringDateTimezoneUTC(hit.endAt)}
        </div>
      </td>
      <td>
        {hit.placesTotal <= 1 ? `${hit.placesTotal} place` : `${hit.placesTotal} places`}
        <div style={{ fontSize: 12, color: "rgb(113,128,150)" }}>
          {hit.placesTotal - hit.placesLeft} / {hit.placesTotal}
        </div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatusMission hit={hit} />
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
