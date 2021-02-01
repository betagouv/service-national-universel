import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import styled from "styled-components";
import { Col, Row, Input } from "reactstrap";
import { useSelector } from "react-redux";
import api from "../../../services/api";
import { Formik, Field } from "formik";
import SelectStatusMission from "../../../components/selectStatusMission";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import Panel from "../../missions/panel";

import Details from "./details";
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
        return <div />;
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
      if (!ok) return toastr.error("Une erreur s'est produite :", code);
      toastr.success("Cette structure a été supprimée.");
      return history.push(`/structure`);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression de la structure :", e.code);
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

const Wrapper = styled.div`
  padding: 3rem;
`;

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-start;
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
  > label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    color: #6a6f85;
    display: block;
    margin-bottom: 10px;
    > span {
      color: red;
      font-size: 10px;
      margin-right: 5px;
    }
  }
  select,
  textarea,
  input {
    display: block;
    width: 100%;
    background-color: #fff;
    color: #606266;
    border: 0;
    outline: 0;
    padding: 11px 20px;
    border-radius: 6px;
    margin-right: 15px;
    border: 1px solid #dcdfe6;
    ::placeholder {
      color: #d6d6e1;
    }
    :focus {
      border: 1px solid #aaa;
    }
  }
`;

const Subtitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 400;
  text-transform: uppercase;
  font-size: 18px;
`;

const Legend = styled.div`
  color: rgb(38, 42, 62);
  margin-bottom: 20px;
  font-size: 20px;
`;

const ButtonContainer = styled.div`
  button {
    background-color: #5245cc;
    color: #fff;
    &.white-button {
      color: #000;
      background-color: #fff;
      :hover {
        background: #ddd;
      }
    }
    margin-left: 1rem;
    border: none;
    border-radius: 5px;
    padding: 7px 30px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    :hover {
      background: #372f78;
    }
  }
`;

const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  height: 100%;
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  border-radius: 8px;
`;

const BoxPlaces = styled(Box)`
  padding: 1rem;
  display: flex;
  align-items: center;
  h1 {
    font-size: 3rem;
    margin: 0;
  }
  p {
    margin-left: 1rem;
    font-size: 0.8rem;
    color: black;
    &.places {
      color: #777;
    }
  }
`;

const Logo = styled.h1`
  background: #372f78;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
  width: 250px;
  margin-bottom: 0;
  padding: 15px 20px 5px;
  a {
    display: inline-flex;
    align-items: center;
    color: #161e2e;
    font-size: 13px;
    font-weight: 500;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    text-decoration: none;
  }
  img {
    margin-right: 25px;
    vertical-align: top;
  }
`;

const Sidebar = styled.div`
  background-color: #372f78;
  width: 250px;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  ul {
    list-style: none;
    a {
      text-decoration: none;
      padding: 15px 20px;
      display: block;
      color: #fff;
      font-weight: 400;
      font-size: 16px;
      border-bottom: 1px solid rgba(82, 69, 204, 0.5);
      transition: 0.2s;
    }
    a.active {
      font-weight: 700;
      background: #5245cc;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
    }
    a:hover {
      background: #5245cc;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
    }
  }
  .has-child ul {
    display: none;
    a {
      padding-left: 40px;
    }
  }
  .has-child.open ul {
    display: block;
  }
`;

const Version = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 30px 20px 10px;
  width: 100%;
  background: linear-gradient(180deg, #261f5b 0%, #372f78 29.33%);
  box-shadow: 0px -1px 0px #0e308a;
  display: flex;
  flex-direction: column;
  .info {
    color: #fff;
    font-size: 16px;
    padding-left: 40px;
    margin-bottom: 15px;
    text-decoration: none;
    background-position: left center;
    background-size: 20px;
    background-repeat: no-repeat;
  }
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
