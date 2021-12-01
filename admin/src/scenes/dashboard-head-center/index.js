import React, { useEffect } from "react";
import styled from "styled-components";
import { useHistory, useParams } from "react-router-dom";

import Volontaires from "./volontaires";
import Center from "./center";

export default () => {
  const history = useHistory();
  const { currentTab } = useParams();

  useEffect(() => {
    const listTab = ["center", "volontaires"];
    if (!listTab.includes(currentTab)) history.push(`/dashboard/volontaires`);
  }, [currentTab]);

  return (
    <>
      <TabNavigation>
        <TabNavigationList>
          <TabItem onClick={() => history.push(`/dashboard/volontaires`)} isActive={currentTab === "volontaires"}>
            Volontaires
          </TabItem>
          <TabItem onClick={() => history.push(`/dashboard/center`)} isActive={currentTab === "center"}>
            Centre
          </TabItem>
        </TabNavigationList>
      </TabNavigation>
      <Wrapper>{currentTab === "volontaires" && <Volontaires />}</Wrapper>
      <Wrapper>{currentTab === "center" && <Center />}</Wrapper>
    </>
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
