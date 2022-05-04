import React from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { colors, ROLES } from "../../../utils";
import { Filter } from "../../../components/list";
import TabList from "../../../components/views/TabList";

export default function Nav({ center, tab, onChangeTab, focusedSession, user, cohorts }) {
  const history = useHistory();

  if (!center || !focusedSession) return null;
  return (
    <Header>
      <div style={{ flex: 1, display: "flex" }}>
        <TabList style={{ width: "100%" }}>
          <Tab
            isActive={tab === "equipe"}
            first
            onClick={() => {
              onChangeTab("equipe");
              history.push(`/centre/${center._id}`);
            }}
            style={{ borderRadius: "0.5rem 0 0 0.5rem" }}>
            Équipe
          </Tab>
          {[ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) ? (
            <Tab
              isActive={tab === "volontaires"}
              middle
              onClick={() => {
                onChangeTab("volontaires");
                history.push(`/centre/${center._id}/volontaires`);
              }}
              style={{ borderLeft: "1px solid rgba(0,0,0,0.1)", borderRight: "1px solid rgba(0,0,0,0.1)", minWidth: "110px" }}>
              Volontaires
            </Tab>
          ) : null}
          {/* {canAssignCohesionCenter(user) ? (
            <Tab
              isActive={tab === "affectation"}
              last
              onClick={() => {
                onChangeTab("affectation");
                history.push(`/centre/${center._id}/affectation`);
              }}
              style={{ borderRadius: "0 0.5rem 0.5rem 0", minWidth: "168px" }}>
              Affectation manuelle
            </Tab>
          ) : null} */}
        </TabList>
      </div>

      <BoxPlaces style={{ borderRight: "1px solid rgba(0,0,0,0.2)", borderRadius: "0" }}>
        <DetailCardTitle>Taux d&apos;occupation</DetailCardTitle>
        <DetailCardContent>{`${
          focusedSession.placesTotal ? (((focusedSession.placesTotal - focusedSession.placesLeft) * 100) / focusedSession.placesTotal).toFixed(2) : 0
        } %`}</DetailCardContent>
      </BoxPlaces>
      <BoxPlaces>
        <DetailCardTitle>{Math.max(0, focusedSession.placesLeft)} places restantes</DetailCardTitle>
        <DetailCardContent>
          {focusedSession.placesTotal - focusedSession.placesLeft} / {focusedSession.placesTotal}
        </DetailCardContent>
      </BoxPlaces>
    </Header>
  );
}

const Header = styled.div`
  display: flex;
  margin: 2rem 0 1rem 0;
  align-items: flex-start;
`;

const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  height: 100%;
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  border-radius: 8px;
`;

const BoxPlaces = styled(Box)`
  max-width: 200px;
  background: none;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
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

const DetailCardTitle = styled.div`
  color: #7c7c7c;
`;
const DetailCardContent = styled.div`
  color: #000;
  font-size: 1.5rem;
  font-weight: 600;
`;

const Tab = styled.li`
  width: 100%;
  max-width: 300px;
  height: 40px;
  overflow: hidden;
  background-color: #fff;
  text-align: center;
  padding: 0.5rem 1rem;
  position: relative;
  font-size: 0.86rem;
  color: #979797;
  cursor: pointer;
  font-weight: 300;
  :hover {
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.16);
  }

  ${({ isActive }) =>
    isActive &&
    `
    color: #222;
    font-weight: 500;
    &:after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 1px;
      right: 0;
      height: 4px;
      background-color: ${colors.purple};
    }
  `}
  ${({ disabled }) => disabled && "color: #bbb;cursor: not-allowed;"}
  ${({ first }) =>
    first &&
    `
    &:after {
      border-bottom-left-radius: 4px;
    }
  `}
  ${({ middle }) =>
    middle &&
    `
    &:after {
      border-radius: 0;
      left: -0.5px;
      right: -0.5px
    }
  `}
  ${({ last }) =>
    last &&
    `
    &:after {
      border-bottom-right-radius: 4px;
      left: -0.5px;
    }
  `}
`;
