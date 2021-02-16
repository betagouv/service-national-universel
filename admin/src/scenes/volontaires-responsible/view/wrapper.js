import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import api from "../../../services/api";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { translate, YOUNG_STATUS } from "../../../utils";
import SelectStatus from "../../../components/selectStatus";

export default ({ children, young, tab }) => {
  const history = useHistory();

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr(e) de vouloir supprimer ce volontaire ?")) return;
    try {
      const { ok, code } = await api.remove(`/young/${young._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Ce volontaire a été supprimé.");
      return history.push(`/volontaire`);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du volontaire :", translate(e.code));
    }
  };
  if (!young) return null;
  return (
    <div style={{ flex: tab === "missions" ? "0%" : 2, position: "relative", padding: "3rem" }}>
      <Header>
        <div style={{ flex: 1 }}>
          <Title>
            {young.firstName} {young.lastName} <Badge>Cohorte {young.cohort}</Badge>
          </Title>
          <TabNavigationList>
            <TabItem isActive={tab === "details"} onClick={() => history.push(`/volontaire/${young._id}`)}>
              Détails
            </TabItem>
          </TabNavigationList>
        </div>
      </Header>
      {children}
    </div>
  );
};

const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 1rem;
  margin: 0 0.25rem;
  border-radius: 99999px;
  font-size: 0.8rem;
  font-weight: 500;
  margin: 1rem;
  color: #9a9a9a;
  background-color: #f6f6f6;
  border: 1px solid #cecece;
  ${({ color }) => `
    color: ${color};
    background-color: ${color}33;
    border: 1px solid ${color};
  `};
`;

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
  ${(props) =>
    props.disabled &&
    `
    color: #bbb;
    cursor: not-allowed;
  `}
`;

const Title = styled.div`
  display: flex;
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 10px;
  align-items: center;
`;

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-start;
`;

const Button = styled.button`
  /* margin: 0 0.5rem; */
  align-self: flex-start;
  border-radius: 4px;
  padding: 5px;
  font-size: 12px;
  /* min-width: 100px; */
  width: 100%;
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
