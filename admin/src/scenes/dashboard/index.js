import React, { useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";

import Inscription from "./inscription";
import Volontaire from "./volontaire";
import Structure from "./structure";
import Mission from "./missions";
import Center from "./centers";
import VioletButton from "../../components/buttons/VioletButton";
import ExportAll from "./inscription/ExportAll";
import { ROLES } from "../../utils";

export default () => {
  const [currentTab, setCurrentTab] = useState("inscriptions");
  const user = useSelector((state) => state.Auth.user);

  return (
    <>
      <TabNavigation>
        <TabNavigationList>
          <TabItem onClick={() => setCurrentTab("inscriptions")} isActive={currentTab === "inscriptions"}>
            Inscriptions
          </TabItem>
          <TabItem onClick={() => setCurrentTab("volontaires")} isActive={currentTab === "volontaires"}>
            Volontaires
          </TabItem>
          <TabItem onClick={() => setCurrentTab("structures")} isActive={currentTab === "structures"}>
            Structures
          </TabItem>
          <TabItem onClick={() => setCurrentTab("missions")} isActive={currentTab === "missions"}>
            Missions
          </TabItem>
          <TabItem onClick={() => setCurrentTab("centers")} isActive={currentTab === "centers"}>
            Centres
          </TabItem>
        </TabNavigationList>
        <div style={{ display: "flex", marginTop: "1rem" }}>
          {user.role === ROLES.ADMIN && currentTab === "inscriptions" ? <ExportAll /> : null}
          <VioletButton onClick={() => print()}>
            <p>Exporter les statistiques</p>
          </VioletButton>
        </div>
      </TabNavigation>
      <Wrapper>
        {currentTab === "inscriptions" && <Inscription />}
        {currentTab === "volontaires" && <Volontaire />}
        {currentTab === "structures" && <Structure />}
        {currentTab === "missions" && <Mission />}
        {currentTab === "centers" && <Center />}
      </Wrapper>
    </>
  );
};

const Wrapper = styled.div`
  padding: 1.5rem;
  @media print {
    background-color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 2rem;
    z-index: 999;
  }
`;
const TabNavigation = styled.nav`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;
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
  :hover {
    color: #aaa;
    &:after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background-color: #aaa;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
  }

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
