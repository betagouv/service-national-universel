import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Col, Container, CustomInput, Input, Row } from "reactstrap";
import { ReactiveBase, ReactiveList, DataSearch, SingleDropdownList } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";

import MissionCard from "./components/missionCard";

import { apiURL } from "../../config";

import api from "../../services/api";

const FILTERS = ["DOMAIN", "SEARCH"];

export default () => {
  const young = useSelector((state) => state.Auth.young);

  return (
    <div>
      <Missions>
        <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
          <Modifybutton to="/preferences">Modifier mes préférences</Modifybutton>
          <Heading>
            <p>TROUVEZ UNE MISSION DE BÉNÉVOLAT</p>
            <h1>Missions disponibles près de chez vous ou à distance</h1>
          </Heading>
          <Row style={{ marginBottom: 20 }}>
            <SearchBox>
              <DataSearch innerClass={{ input: "form-control" }} placeholder="Recherche..." autosuggest={false} componentId="SEARCH" dataField={["title", "organisation"]} />
            </SearchBox>
            <Col>
              <CustomInput type="select">
                <option value="null" disabled selected>
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
          <ReactiveList
            componentId="result"
            react={{ and: FILTERS }}
            pagination={true}
            size={25}
            showLoader={true}
            loader="Chargement..."
            innerClass={{ pagination: "pagination" }}
            dataField="created_at"
            defaultQuery={function (value, props) {
              if (!young.location || !young.location.lat || !young.location.lon) return { query: { match_all: {} } };
              return {
                query: { match_all: {} },
                sort: [
                  {
                    _geo_distance: {
                      location: [young.location.lon, young.location.lat],
                      order: "asc",
                      unit: "km",
                      mode: "min",
                    },
                  },
                ],
              };
            }}
            renderResultStats={({ numberOfResults, time }) => {
              return <div />;
              return <div className="results">{`${numberOfResults} résultats trouvés en ${time}ms`}</div>;
            }}
            render={({ data }) => {
              return data.map((e) => {
                const tags = [];
                tags.push(e.remote ? "À distance" : "En présentiel");
                e.city && tags.push(e.city);
                return <MissionCard title={e.domains[0]} image={require("../../assets/observe.svg")} subtitle={e.name} tags={tags} places={e.placesLeft} />;
              });
            }}
          />
        </ReactiveBase>
      </Missions>
    </div>
  );
};

const Missions = styled(Container)`
  padding: 20px 40px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
`;

const Heading = styled.div`
  margin-bottom: 40px;
  h1 {
    margin-top: 25px;
    color: #161e2e;
    font-size: 36px;
    font-weight: 700;
  }
  p {
    color: #42389d;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 5px;
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
  position: absolute;
  right: 40px;
  top: 20px;
  :hover {
    color: #333;
  }
`;

const SearchBox = styled(Col)`
  input {
    height: auto;
    background-color: transparent;
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
    height: auto;
    min-height: 0;
    padding: 8px 12px;
    font-size: 16px;
    font-weight: 400;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
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
