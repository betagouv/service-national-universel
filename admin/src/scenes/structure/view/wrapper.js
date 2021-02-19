import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Col, Row } from "reactstrap";

import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import { translate, STRUCTURE_STATUS_COLORS } from "../../../utils";
import api from "../../../services/api";

export default ({ children, structure, tab }) => {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  const isResponsible = user.role === "responsible";

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr(e) de vouloir supprimer cette structure ?")) return;
    try {
      const { ok, code } = await api.remove(`/structure/${structure._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Cette structure a été supprimée.");
      return history.push(`/structure`);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression de la structure :", translate(e.code));
    }
  };
  if (!structure) return null;
  return (
    <div style={{ flex: tab === "missions" ? "0%" : 2, position: "relative", padding: "3rem" }}>
      <Header>
        <div style={{ flex: 1 }}>
          <Title>
            {structure.name} <Tag color={STRUCTURE_STATUS_COLORS[structure.status]}>{translate(structure.status)}</Tag>
          </Title>

          <TabNavigationList>
            <TabItem isActive={tab === "details"} onClick={() => history.push(`/structure/${structure._id}`)}>
              Détails
            </TabItem>
            {!isResponsible && (
              <>
                <TabItem isActive={tab === "missions"} onClick={() => history.push(`/structure/${structure._id}/missions`)}>
                  Missions
                </TabItem>
                <TabItem isActive={tab === "historic"} onClick={() => history.push(`/structure/${structure._id}/historic`)}>
                  Historique
                </TabItem>
              </>
            )}
          </TabNavigationList>
        </div>
        <div style={{ display: "flex" }}>
          {!isResponsible && (
            <Link to={`/mission/create/${structure._id}`}>
              <Button className="btn-blue">Nouvelle mission</Button>
            </Link>
          )}
          <Link to={`/structure/${structure._id}/edit`}>
            <Button className="btn-blue">Modifier</Button>
          </Link>
          <Button style={{ marginLeft: "0.5rem" }} onClick={handleDelete} className="btn-red">
            Supprimer
          </Button>
        </div>
      </Header>
      {children}
    </div>
  );
};

const TabNavigationList = styled.ul`
  display: flex;
  list-style-type: none;
`;

const TabItem = styled.li`
  padding: 0.5rem 1rem;
  position: relative;
  font-size: 1rem;
  color: #979797;
  cursor: pointer;
  font-weight: 300;
  border-radius: 0.5rem;
  overflow: hidden;

  ${(props) =>
    props.isActive &&
    `
    color: #222;
    font-weight: 500;
    background-color:#fff;

    &:after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background-color: #5245CC;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
  `}
`;

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 10px;
`;

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-start;
`;

const Button = styled.button`
  margin: 0 0.5rem;
  align-self: flex-start;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  /* min-width: 100px; */
  /* width: 100%; */
  font-weight: 400;
  cursor: pointer;
  background-color: #fff;
  &.btn-blue {
    color: #646b7d;
    border: 1px solid #dcdfe6;
    :hover {
      color: rgb(49, 130, 206);
      border-color: rgb(193, 218, 240);
      background-color: rgb(234, 243, 250);
    }
  }
  &.btn-red {
    border: 1px solid #f6cccf;
    color: rgb(206, 90, 90);
    :hover {
      border-color: rgb(240, 218, 218);
      background-color: rgb(250, 230, 230);
    }
  }
`;

const Tag = styled.span`
  align-self: flex-start;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 13px;
  white-space: nowrap;
  font-weight: 400;
  cursor: pointer;
  margin-right: 5px;
  ${({ color }) => {
    return `
    color: ${color};
    background: ${color}22;
    border: 0.5px solid ${color};
    `;
  }}
`;
