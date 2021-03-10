import React, { useState, useEffect } from "react";
import styled from "styled-components";
import api from "../../../services/api";
import StructureView from "./wrapper";
import Panel from "../../missions/panel";

import { formatStringDate } from "../../../utils";
import SelectStatusMission from "../../../components/selectStatusMission";

export default ({ structure }) => {
  const [data, setData] = useState([]);
  const [mission, setMission] = useState();

  useEffect(() => {
    (async () => {
      if (!structure) return;
      const { ok, data } = await api.get(`/mission/structure/${structure._id}`);
      if (ok) setData(data);
    })();
  }, [structure]);

  const handleClick = async (mission) => {
    const { ok, data } = await api.get(`/mission/${mission._id}`);
    if (ok) setMission(data);
  };

  if (!structure) return <div>Chargement...</div>;

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
                {data.map((hit, i) => (
                  <Hit key={i} hit={hit} onClick={() => handleClick(hit)} />
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

const Tag = styled.span`
  background-color: rgb(253, 246, 236);
  border: 1px solid rgb(250, 236, 216);
  color: rgb(230, 162, 60);
  align-self: flex-start;
  border-radius: 4px;
  padding: 8px 15px;
  font-size: 13px;
  white-space: nowrap;
  font-weight: 400;
  cursor: pointer;
  margin-right: 5px;
`;

const ButtonContainer = styled.div`
  button {
    background-color: #5245cc;
    margin-left: 1rem;
    border: none;
    border-radius: 5px;
    padding: 7px 30px;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    :hover {
      background: #372f78;
    }
  }
`;

const ActionBox = styled.div`
  .dropdown-menu {
    min-width: 0;
    a,
    div {
      white-space: nowrap;
      font-size: 14px;
      padding: 5px 15px;
    }
  }
  button {
    background-color: #feb951;
    border: 1px solid #feb951;
    display: inline-flex;
    align-items: center;
    text-align: left;
    border-radius: 4px;
    padding: 0 0 0 12px;
    font-size: 12px;
    min-width: 130px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    outline: 0;
    .edit-icon {
      height: 17px;
      margin-right: 10px;
      path {
        fill: #fff;
      }
    }
    .down-icon {
      margin-left: auto;
      padding: 7px 15px;
      border-left: 2px solid #fbd392;
      margin-left: 15px;
      svg {
        height: 10px;
      }
      svg polygon {
        fill: #fff;
      }
    }
  }
  ${({ color }) =>
    color === "green" &&
    `
    button {
      background-color: transparent;
      border: 1px solid #6BC763;
      color: #6BC763;
      .edit-icon {
        path {
          fill: #6BC763;
        }
      }
      .down-icon {
        border-left: 1px solid #6BC763;
        svg polygon {
          fill: #6BC763;
        }
      }
    }  
  `}
  ${({ color }) =>
    color === "red" &&
    `
    button {
      background-color: transparent;
      border: 1px solid #F1545B;
      color: #F1545B;
      .edit-icon {
        path {
          fill: #F1545B;
        }
      }
      .down-icon {
        border-left: 1px solid #F1545B;
        svg polygon {
          fill: #F1545B;
        }
      }
    }  
  `}
`;
