import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Col, Container, CustomInput, Input, Row } from "reactstrap";
import { ReactiveBase, ReactiveList, SingleList, MultiList, DataSearch, SingleDropdownList } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";

import Application from "./components/application";
import ReactiveFilter from "../../components/ReactiveFilter";
import { apiURL } from "../../config";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";

const FILTERS = ["DOMAIN", "SEARCH", "STATUS"];

export default () => {
  const [applications, setApplications] = useState([]);
  const young = useSelector((state) => state.Auth.young);

  useEffect(() => {
    (async () => {
      if (!young) return;
      const { ok, data, code } = await api.get(`/application/young/${young._id}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue", code);
      return setApplications(data);
    })();
  }, []);

  return (
    <div>
      <Heading>
        <p>Phase 2</p>
        <h1>Suivez vos candidatures aux missions d'intérêt général</h1>
      </Heading>
      <Container>
        {applications.map((e, i) => {
          console.log(e);
          // const tags = [];
          // e.city && tags.push(e.city + (e.zip ? ` - ${e.zip}` : ""));
          // e.domains.forEach((d) => tags.push(d));
          return <Application key={i} rank={i + 1} id={e._id} missionId={e.missionId} status={e.status} />;
          return <MissionCard id={e._id} title={e.structureName} image={require("../../assets/observe.svg")} subtitle={e.name} tags={tags} places={e.placesLeft} />;
        })}
      </Container>
    </div>
  );
};

const Hit = ({ missionId }) => {
  return <div>{missionId}</div>;
};

const Filters = styled(Container)`
  margin-bottom: 1.5rem;
  input,
  button,
  select {
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border: 0;
  }
`;

const AlertBox = ({ onClose }) => (
  <Alert>
    <img src={require("../../assets/information.svg")} height={15} />
    <div className="text">
      <strong>Vous pourrez faire une mission jusqu’en juin 2022.</strong>
      <p>Des missions supplémentaires seront proposées tout au long de l’année. Vous serez informé par e-mail dès qu’une mission répondant à vos préférences sera publiée.</p>
    </div>
    <img src={require("../../assets/close.svg")} height={15} onClick={onClose} style={{ cursor: "pointer" }} />
  </Alert>
);

const Missions = styled(Container)`
  padding: 20px 0;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
`;

const Heading = styled(Container)`
  margin-bottom: 40px;
  h1 {
    color: #161e2e;
    font-size: 2rem;
    font-weight: 700;
  }
  p {
    color: #42389d;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 5px;
    text-transform: uppercase;
  }
`;

const Modifybutton = styled(Link)`
  border: 1px solid #d2d6dc;
  padding: 10px 15px 10px 30px;
  color: #3d4151;
  font-size: 12px;
  border-radius: 4px;
  background: url(${require("../../assets/pen.svg")}) left 5px center no-repeat;
  background-size: 18px;
  height: fit-content;
  /* position: absolute;
  right: 40px;
  top: 20px; */
  :hover {
    color: #333;
  }
`;

const SearchBox = styled(Col)`
  input {
    height: auto;
    background-color: white;
  }
  .search-icon {
    position: relative;
    top: -7px;
    height: 14px;
    path {
      fill: #767a83;
    }
  }
`;

const DomainsFilter = styled(Col)`
  button {
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: 8px 12px;
    font-size: 16px;
    font-weight: 400;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    /* transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; */
  }
`;

const Alert = styled(Container)`
  border-radius: 8px;
  display: flex;
  align-items: center;
  background-color: #5949d0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  padding: 10px 20px;
  .text {
    margin-left: 20px;
    margin-right: auto;
    color: #fff;
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
