import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Col, Container, CustomInput, Input, Row } from "reactstrap";
import { ReactiveBase, ReactiveList, SingleList, MultiList, DataSearch, SingleDropdownList } from "@appbaseio/reactivesearch";
import styled from "styled-components";

import MissionCard from "./components/missionCard";
import ReactiveFilter from "../../components/ReactiveFilter";
import { apiURL } from "../../config";
import api from "../../services/api";

const FILTERS = ["DOMAIN", "SEARCH", "STATUS"];

export default () => {
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div>
      {showAlert ? <AlertBox onClose={() => setShowAlert(false)} /> : null}
      <Heading>
        <p>Phase 2</p>
        <h1>Trouvez une mission d'intérêt général</h1>
      </Heading>
      <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <Filters>
          <Row>
            <SearchBox>
              <DataSearch
                innerClass={{ input: "form-control" }}
                placeholder="Recherche..."
                autosuggest={false}
                componentId="SEARCH"
                dataField={["name", "structureName", "description", "actions", "city"]}
              />
            </SearchBox>
            <Col>
              <CustomInput id="DISTANCE" type="select" defaultValue="null">
                <option value="null" disabled>
                  Rayon de recherche maximum
                </option>
                <option value="2">Distance max. 2km</option>
                <option value="5">Distance max. 5km</option>
                <option value="20">Distance max. 20km</option>
                <option value="10">Distance max. 10km</option>
                <option value="50">Distance max. 50km</option>
                <option value="100">Distance max. 100km</option>
                {/* <option value="-1">France entière : préparations militaires uniquement</option> */}
              </CustomInput>
            </Col>
            <DomainsFilter>
              <SingleDropdownList
                selectAllLabel="Tous les domaines"
                URLParams={true}
                componentId="DOMAIN"
                placeholder="Filtrer par domaines"
                dataField="domains.keyword"
                react={{ and: FILTERS.filter((e) => e !== "DOMAIN") }}
                showSearch={false}
              />
            </DomainsFilter>
          </Row>
        </Filters>
        <Missions>
          <ReactiveFilter componentId="STATUS" query={{ query: { bool: { filter: { term: { "status.keyword": "VALIDATED" } } } }, value: "" }} />
          <ReactiveList
            componentId="result"
            react={{ and: FILTERS }}
            pagination={true}
            size={25}
            showLoader={true}
            loader="Chargement..."
            innerClass={{ pagination: "pagination" }}
            dataField="created_at"
            renderResultStats={({ numberOfResults, time }) => {
              // return <div />;
              return <div className="results">{`${numberOfResults} résultats trouvés en ${time}ms`}</div>;
            }}
            render={({ data }) => {
              return data.map((e) => {
                const tags = [];
                e.city && tags.push(e.city + (e.zip ? ` - ${e.zip}` : ""));
                // tags.push(e.remote ? "À distance" : "En présentiel");
                e.domains.forEach((d) => tags.push(d));
                return <MissionCard id={e._id} title={e.structureName} image={require("../../assets/observe.svg")} subtitle={e.name} tags={tags} places={e.placesLeft} />;
              });
            }}
          />
        </Missions>
      </ReactiveBase>
    </div>
  );
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
    font-size: 3rem;
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
