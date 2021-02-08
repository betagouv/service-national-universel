import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import styled from "styled-components";
import { Col, Row, Input } from "reactstrap";
import { useSelector } from "react-redux";
import api from "../../../services/api";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import Panel from "../../missions/panel";

import Details from "./details";
import { translate } from "../../../utils";
import Missions from "./missions";

const TABS = { DETAILS: "DETAILS", MISSIONS: "MISSIONS", HISTORIC: "HISTORIC" };

export default (props) => {
  const [structure, setStructure] = useState();
  const user = useSelector((state) => state.Auth.user);
  const [tab, setTab] = useState("DETAILS");
  const history = useHistory();
  const [mission, setMission] = useState();

  const renderTab = () => {
    switch (tab) {
      case TABS.DETAILS:
        return <Details structure={structure} />;
      case TABS.MISSIONS:
        return <Missions structure={structure} setMission={setMission} />;
      case TABS.HISTORIC:
        console.log("HIST");
        return <div />;
      default:
        return <div />;
    }
  };

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      const { data } = await api.get(`/structure/${id}`);
      setStructure(data);
    })();
  }, []);

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

  if (!structure) return <div />;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <div style={{ flex: 2, position: "relative", padding: "3rem" }}>
        <Header>
          <div style={{ flex: 1 }}>
            <Title>{structure.name}</Title>

            <TabNavigationList>
              <TabItem isActive={tab === TABS.DETAILS} onClick={() => setTab(TABS.DETAILS)}>
                Détails
              </TabItem>
              <TabItem isActive={tab === TABS.MISSIONS} onClick={() => setTab(TABS.MISSIONS)}>
                Missions
              </TabItem>
              <TabItem isActive={tab === TABS.HISTORIC} onClick={() => setTab(TABS.HISTORIC)}>
                Historique
              </TabItem>
            </TabNavigationList>
          </div>
          <Row style={{ minWidth: "20%" }}>
            <Col md={6}>
              <Link to={`/structure/${structure._id}/edit`}>
                <Button className="btn-blue">Modifier</Button>
              </Link>
            </Col>
            <Col md={6}>
              <Button onClick={handleDelete} className="btn-red">
                Supprimer
              </Button>
            </Col>
          </Row>
        </Header>
        {renderTab()}
      </div>
      <Panel
        mission={mission}
        onClose={() => {
          setMission(null);
        }}
      />
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
