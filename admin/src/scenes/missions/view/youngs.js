import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Col, DropdownItem, DropdownMenu, DropdownToggle, Label, Pagination, PaginationItem, PaginationLink, Row, UncontrolledDropdown } from "reactstrap";
import { ReactiveBase, ReactiveList, SingleList, MultiDropdownList, MultiList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";

import api from "../../../services/api";
import { apiURL } from "../../../config";

import { formatStringLongDate } from "../../../utils";

const FILTERS = ["DOMAIN", "SEARCH", "STATUS", "PLACES", "LOCATION", "REGION", "DEPARTMENT"];

export default ({ mission, setYoung }) => {
  const [data, setData] = useState();

  useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/application/mission/${mission._id}`);
      if (ok) setData(data);
    })();
  }, []);

  const handleClick = async (application) => {
    const { ok, data } = await api.get(`/referent/young/${application.youngId}`);
    if (ok) setYoung(data);
  };

  if (!data) return <div />;

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
          <div style={{ flex: 2, position: "relative" }}>
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
                  <Hit key={i} hit={hit} onClick={() => handleClick(hit)} />
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </ReactiveBase>
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
              {getAge(hit.youngBirthdateAt)} ans {`• ${hit.youngCity} (${hit.youngDepartment})`}
            </p>
          </div>
        </TeamMember>
      </td>
      <td>
        <div>{formatStringLongDate(hit.createdAt)}</div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>{hit.status}</td>
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
