import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import api from "../../../services/api";
import { translate, canAssignCohesionCenter } from "../../../utils";
import TabList from "../../../components/views/TabList";
import Tab from "../../../components/views/Tab";

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
    <div style={{ flex: tab === "missions" ? "0%" : 2, position: "relative", padding: "3rem" }}>
      <Header>
        <div style={{ flex: 1 }}>
          <TabList>
            <Tab isActive={tab === "equipe"} onClick={() => history.push(`/centre/${center._id}`)}>
              Équipe
            </Tab>
            <Tab isActive={tab === "volontaires"} onClick={() => history.push(`/centre/${center._id}/volontaires`)}>
              Volontaires
            </Tab>
            <Tab isActive={tab === "waiting_list"} onClick={() => history.push(`/centre/${center._id}/liste-attente`)}>
              Liste d&apos;attente
            </Tab>
            {canAssignCohesionCenter(user) ? (
              <Tab isActive={tab === "affectation"} onClick={() => history.push(`/centre/${center._id}/affectation`)}>
                Affectation manuelle
              </Tab>
            ) : null}
          </TabList>
        </div>
        <BoxPlaces>
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
    </div>
  );
}

const Header = styled.div`
  padding: 0 25px 0;
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
  min-height: 5rem;
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
