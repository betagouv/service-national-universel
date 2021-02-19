import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Col, Container, Row } from "reactstrap";
import { Link } from "react-router-dom";

import Volontaires from "./volontaires";
import Missions from "./missions";
import { useSelector } from "react-redux";
import { apiURL } from "../../config";
import api from "../../services/api";
import { DEFAULT_STRUCTURE_NAME } from "../../utils";

export default () => {
  const [currentTab, setCurrentTab] = useState("volontaires");
  const [showAlert, setShowAlert] = useState(false);
  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    (async () => {
      const { ok, data } = await api.get("/structure");
      if (ok) setShowAlert(data.name.toUpperCase() === DEFAULT_STRUCTURE_NAME.toUpperCase());
    })();
  }, []);

  return (
    <>
      {showAlert ? <AlertBox onClose={() => setShowAlert(false)} /> : null}
      <TabNavigation>
        <TabNavigationList>
          <TabItem onClick={() => setCurrentTab("volontaires")} isActive={currentTab === "volontaires"}>
            Volontaires
          </TabItem>
          <TabItem onClick={() => setCurrentTab("missions")} isActive={currentTab === "missions"}>
            Missions
          </TabItem>
        </TabNavigationList>
      </TabNavigation>
      <Wrapper>
        {currentTab === "volontaires" && <Volontaires />}
        {currentTab === "missions" && <Missions />}
      </Wrapper>
    </>
  );
};

const AlertBox = ({ onClose }) => {
  const user = useSelector((state) => state.Auth.user);
  return (
    <Link to={`/structure/${user.structureId}/edit`}>
      <Alert>
        <img src={require("../../assets/information.svg")} height={15} />
        <div className="text">
          <strong>Vous n'avez pas terminé l'inscription de votre structure !</strong>
          <p>Cliquez ici pour renseigner toutes ses informations.</p>
        </div>
        {/* <img src={require("../../assets/close.svg")} height={15} onClick={onClose} style={{ cursor: "pointer" }}/> */}
      </Alert>
    </Link>
  );
};

const Wrapper = styled.div`
  padding: 20px 40px;
`;
const TabNavigation = styled.nav``;
const TabNavigationList = styled.ul`
  padding-left: 30px;
  display: flex;
  list-style-type: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.09);
`;
const TabItem = styled.li`
  padding: 16px;
  position: relative;
  font-size: 16px;
  color: #979797;
  cursor: pointer;

  ${(props) =>
    props.isActive &&
    `
    color: #5245CC;
    font-weight: bold;

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

const Alert = styled(Container)`
  border-radius: 8px;
  display: flex;
  align-items: center;
  background-color: #5949d0;
  margin: 2rem;
  padding: 10px 20px;
  color: #fff;
  a:hover {
    color: #fff;
  }
  .text {
    margin-left: 20px;
    margin-right: auto;
    strong {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 3px;
    }
    p {
      margin-bottom: 0;
      font-size: 12px;
      font-weight: 500;
    }
  }
`;
