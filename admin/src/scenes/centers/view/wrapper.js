import React, { useState } from "react";
import { MultiDropdownList, ReactiveBase } from "@appbaseio/reactivesearch";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import api from "../../../services/api";
import { apiURL } from "../../../config";
import { translate, canAssignCohesionCenter, colors } from "../../../utils";
import { Filter } from "../../../components/list";
import TabList from "../../../components/views/TabList";

const FILTERS = ["SEARCH", "STATUS", "COHORT", "DEPARTMENT", "REGION", "STATUS_PHASE_1", "STATUS_PHASE_2", "STATUS_PHASE_3", "STATUS_APPLICATION", "LOCATION"];

export default function Wrapper({ center: centerDefault, tab, children }) {
  const history = useHistory();
  const [center, setCenter] = useState(centerDefault);
  const user = useSelector((state) => state.Auth.user);

  const up = async () => {
    if (!center) return;
    const centerResponse = await api.post(`/cohesion-center/refresh/${center._id}`);
    if (!centerResponse.ok) return toastr.error("Oups, une erreur est survenue lors de la mise a jour des places", translate(centerResponse.code));
    setCenter(centerResponse.data);
  };

  if (!center) return null;
  return (
    <div style={{ flex: 2, position: "relative", padding: "3rem" }}>
      <ReactiveBase url={`${apiURL}/es`} app="young" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <Header>
          <div style={{ flex: 1, display: "flex" }}>
            {/* TODO : connect center sessions */}
            <Filter style={{ padding: "0 1rem 0 0" }}>
              <MultiDropdownList
                className="dropdown-filter"
                placeholder="Séjour"
                componentId="COHORT"
                dataField="cohort.keyword"
                react={{ and: FILTERS.filter((e) => e !== "COHORT") }}
                renderItem={(e, count) => {
                  return `${translate(e)} (${count})`;
                }}
                title=""
                URLParams={true}
                showSearch={false}
              />
            </Filter>
            <TabList style={{ width: "100%" }}>
              <Tab isActive={tab === "equipe"} first onClick={() => history.push(`/centre/${center._id}`)} style={{ borderRadius: "0.5rem 0 0 0.5rem" }}>
                Équipe
              </Tab>
              {canAssignCohesionCenter(user) ? (
                <>
                  <Tab
                    isActive={tab === "volontaires"}
                    middle
                    onClick={() => history.push(`/centre/${center._id}/volontaires`)}
                    style={{ borderLeft: "1px solid rgba(0,0,0,0.1)", borderRight: "1px solid rgba(0,0,0,0.1)", minWidth: "110px" }}>
                    Volontaires
                  </Tab>
                  <Tab
                    isActive={tab === "affectation"}
                    last
                    onClick={() => history.push(`/centre/${center._id}/affectation`)}
                    style={{ borderRadius: "0 0.5rem 0.5rem 0", minWidth: "168px" }}>
                    Affectation manuelle
                  </Tab>
                </>
              ) : (
                <Tab
                  isActive={tab === "volontaires"}
                  last
                  onClick={() => history.push(`/centre/${center._id}/volontaires`)}
                  style={{ borderLeft: "1px solid rgba(0,0,0,0.1)", borderRadius: "0 0.5rem 0.5rem 0" }}>
                  Volontaires
                </Tab>
              )}
            </TabList>
          </div>
          <BoxPlaces style={{ borderRight: "1px solid rgba(0,0,0,0.2)", borderRadius: "0" }}>
            <DetailCardTitle>Taux d&apos;occupation</DetailCardTitle>
            <DetailCardContent>{`${center.placesTotal ? (((center.placesTotal - center.placesLeft) * 100) / center.placesTotal).toFixed(2) : 0} %`}</DetailCardContent>
          </BoxPlaces>
          <BoxPlaces onClick={up}>
            <DetailCardTitle>{Math.max(0, center.placesLeft)} places restantes</DetailCardTitle>
            <DetailCardContent>
              {center.placesTotal - center.placesLeft} / {center.placesTotal}
            </DetailCardContent>
          </BoxPlaces>
        </Header>
        {children}
      </ReactiveBase>
    </div>
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
