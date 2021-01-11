import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Col, Label, Pagination, PaginationItem, PaginationLink, Row } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";

import { translate } from "../../utils";

export default () => {
  const { structure } = useSelector((state) => state.Auth);

  if (!structure) return <div>No structure...</div>;

  return (
    <div>
      <div style={{ padding: "30px 50px 0" }}>
        <div style={{ display: "flex", width: "100%", height: "100%" }}>
          <div style={{ flexGrow: 1 }}>
            <Header>
              <div>
                <Subtitle>STRUCTURE</Subtitle>
                <Title>
                  {structure.name}
                  <Tag color="green">{translate(structure.status)}</Tag>
                  {/* <Tag color="yellow">56 - Morbihan  // TODO</Tag>
                  <Tag>CEU  // TODO</Tag>
                  <Tag>1 mission  // TODO</Tag> */}
                </Title>
              </div>
              <Link to="/structure/edit">
                <Button>Modifier la fiche</Button>
              </Link>
            </Header>
            <Legend>Informations</Legend>
            <Details>
              <div className="detail-title">Statut</div>
              <div className="detail-text">{translate(structure.status)}</div>
            </Details>
            <Details>
              <div className="detail-title">Statut juridique</div>
              <div className="detail-text">{translate(structure.statutJuridique)}</div>
            </Details>
            <Details>
              <div className="detail-title">Type</div>
              <div className="detail-text">Service de l'Etat // TODO</div>
            </Details>
            <Details>
              <div className="detail-title">Corps</div>
              <div className="detail-text">Gendarmerie // TODO</div>
            </Details>
            <Details>
              <div className="detail-title">Adresse</div>
              <div className="detail-text">Mauron, 56430 Mauron // TODO</div>
            </Details>
            <br />
            <hr />
            <Legend>Équipe</Legend>
            <Link to="/team">
              <Button>Gérer l'équipe</Button>
            </Link>
            <br />
            <hr />
            <Legend>Missions</Legend>
            <Link to="/mission">
              <Button>Gérer les missions</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const Subtitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 400;
  text-transform: uppercase;
  font-size: 18px;
`;

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  background-color: #fff;
  border: 1px solid #dcdfe6;
  align-self: flex-start;
  border-radius: 4px;
  padding: 8px;
  font-size: 13px;
  width: 140px;
  font-weight: 400;
  color: #646b7d;
  cursor: pointer;
  :hover {
    color: rgb(49, 130, 206);
    border-color: rgb(193, 218, 240);
    background-color: rgb(234, 243, 250);
  }
`;

const Legend = styled.div`
  color: rgb(38, 42, 62);
  margin-top: 30px;
  margin-bottom: 20px;
  font-size: 20px;
`;

const FilterRow = styled(Row)`
  padding: 30px 0;

  input {
    display: block;
    width: 100%;
    border: 1px solid rgb(220, 223, 230);
    background-color: #ffffff;
    color: #606266;
    outline: 0;
    padding: 11px 20px;
    border-radius: 6px;
    margin-right: 15px;
    ::placeholder {
      color: #d6d6e1;
    }
    :focus {
      border: 1px solid #dcdfe6;
    }
  }
  label {
    color: rgb(106, 111, 133);
    font-size: 13px;
    font-weight: 500;
  }
`;

const TeamMember = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  img {
    width: 35px;
    height: 35px;
    background-color: #aaa;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 20px;
  }
  h2 {
    color: #333;
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 5px;
  }
  p {
    text-transform: uppercase;
    color: #606266;
    font-size: 12px;
    margin: 0;
  }
`;

const Table = styled.table`
  width: 100%;
  color: #60626f;
  th {
    border-top: 1px solid rgb(235, 238, 245);
    border-bottom: 1px solid rgb(235, 238, 245);
    padding: 15px;
    font-weight: 400;
  }
  td {
    padding: 15px;
  }
  th:first-child {
    padding-left: 70px;
  }
  tbody tr {
    border-bottom: 1px solid rgb(235, 238, 245);
    :hover {
      background-color: rgb(250, 250, 252);
    }
  }
  button {
    background-color: #fff;
    border: 1px solid #dcdfe6;
    align-self: flex-start;
    border-radius: 4px;
    padding: 5px;
    font-size: 12px;
    width: 80px;
    font-weight: 400;
    color: #646b7d;
    cursor: pointer;
    :hover {
      color: rgb(49, 130, 206);
      border-color: rgb(193, 218, 240);
      background-color: rgb(234, 243, 250);
    }
  }
`;

const Tag = styled.span`
  background-color: rgb(244, 244, 245);
  border: 1px solid rgb(233, 233, 235);
  color: rgb(144, 147, 153);

  ${({ color }) =>
    color === "green" &&
    `
    background-color: rgb(240, 249, 235);
    border: 1px solid rgb(225, 243, 216);
    color: rgb(103, 194, 58);`}
  ${({ color }) =>
    color === "yellow" &&
    `
    background-color: rgb(253, 246, 236);
    border: 1px solid rgb(250, 236, 216);
    color: rgb(230, 162, 60);
  `}
  align-self: flex-start;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  margin-left: 10px;
`;

const TableActions = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  button {
    background-color: #fff;
    border: 1px solid #dcdfe6;
    align-self: flex-start;
    border-radius: 4px;
    padding: 7px;
    font-size: 13px;
    width: 80px;
    font-weight: 400;
    color: #646b7d;
    cursor: pointer;
    :hover {
      color: rgb(49, 130, 206);
      border-color: rgb(193, 218, 240);
      background-color: rgb(234, 243, 250);
    }
  }
`;

const Details = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 0;
  font-size: 12px;
  text-align: left;
  .detail-title {
    min-width: 90px;
    width: 90px;
    color: #798399;
  }
  .detail-text {
    color: rgba(26, 32, 44);
  }
`;
