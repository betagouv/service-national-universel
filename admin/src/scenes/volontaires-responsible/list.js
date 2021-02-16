import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DropdownItem, DropdownMenu, DropdownToggle, Label, Pagination, PaginationItem, PaginationLink, Row, UncontrolledDropdown } from "reactstrap";
import { ReactiveBase } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";

import SelectStatusApplication from "../../components/selectStatusApplication";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";

import { formatStringLongDate, formatStringDate } from "../../utils";

export default () => {
  const user = useSelector((state) => state.Auth.user);
  const [missions, setMissions] = useState([]);
  const [applications, setApplications] = useState([]);
  const structureId = user.structureId;
  const [panelYoung, setPanelYoung] = useState(null);
  const [panelApplication, setPanelApplication] = useState(null);

  async function initMissions() {
    const missionsResponse = await api.get(`/mission/structure/${structureId}`);
    if (!missionsResponse.ok) {
      toastr.error("Oups, une erreur est survenue lors de la récuperation des missions", translate(missionsResponse.code));
      history.push("/");
    } else {
      setMissions(missionsResponse.data);
    }
  }

  async function initApplications() {
    const applicationsPromises = missions.map((mission) => api.get(`/application/mission/${mission._id}`));
    const applications = await Promise.all(applicationsPromises);
    setApplications(
      applications
        .filter((a) => a.ok)
        .map((a) => a.data)
        // Get all application from all missions as a flat array
        .reduce((acc, current) => [...acc, ...current], [])
    );
  }

  // Get all missions from structure then get all applications int order to display the volontaires' list.
  useEffect(() => {
    initMissions();
  }, [structureId, user]);
  useEffect(() => {
    initApplications();
  }, [missions]);

  const handleClick = async (application) => {
    const { ok, data } = await api.get(`/referent/young/${application.youngId}`);
    if (ok) {
      setPanelYoung(data);
      setPanelApplication(application);
    }
  };

  if (!applications) return <div />;
  console.log(applications);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Header>
            <div style={{ flex: 1 }}>
              <Title>Volontaires</Title>
            </div>
          </Header>
          <Table>
            <thead>
              <tr>
                <th width="25%">Volontaire</th>
                <th width="25%">Mission candidatée</th>
                <th>Dates</th>
                <th>Places</th>
                <th width="20%">Statut de la mission</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((hit, i) => (
                <Hit key={i} hit={hit} onClick={() => handleClick(hit)} />
              ))}
            </tbody>
          </Table>
        </div>
        <Panel
          value={panelYoung}
          application={panelApplication}
          onChange={() => {
            setPanelYoung(null);
          }}
        />
      </div>
    </div>
  );
};

const Hit = ({ hit, onClick }) => {
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
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Du</span> {formatStringDate(hit.mission.startAt)}
        </div>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Au</span> {formatStringDate(hit.mission.endAt)}
        </div>
      </td>
      <td>
        {hit.mission.placesTotal <= 1 ? `${hit.mission.placesTotal} place` : `${hit.mission.placesTotal} places`}
        <div style={{ fontSize: 12, color: "rgb(113,128,150)" }}>
          {hit.mission.placesTaken} / {hit.mission.placesTotal}
        </div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatusApplication hit={hit} />
      </td>
    </tr>
  );
};

const Action = ({ hit, color }) => {
  return (
    <ActionBox color={color}>
      <UncontrolledDropdown setActiveFromChild>
        <DropdownToggle tag="button">
          En attente de validation
          <div className="down-icon">
            <svg viewBox="0 0 407.437 407.437">
              <polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 " />
            </svg>
          </div>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem tag={Link} to={"#"}>
            Voir
          </DropdownItem>
          <DropdownItem tag="div">Dupliquer</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </ActionBox>
  );
};

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin-top: 25px;
  align-items: flex-start;
  /* justify-content: space-between; */
`;

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 30px;
`;

const Button = styled.div`
  background-color: #3182ce;
  color: #fff;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  :hover {
    background-color: #5a9bd8;
  }
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

const ResultStats = styled.div`
  color: #242526;
  font-size: 12px;
  padding-left: 25px;
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
