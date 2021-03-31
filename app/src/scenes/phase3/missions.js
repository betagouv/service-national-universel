import React from "react";
import { Link } from "react-router-dom";
import { Col, Container, CustomInput, Row } from "reactstrap";
import { ReactiveBase, ReactiveList, DataSearch, SingleDropdownList } from "@appbaseio/reactivesearch";
import styled from "styled-components";

import MissionCard from "./components/missionCard";

import { apiURL } from "../../config";

import api from "../../services/api";

const FILTERS = ["DOMAIN", "SEARCH"];

export default () => {
  return (
    <div>
      <Missions>
        <ReactiveBase url={`${apiURL}/es`} app="missionapi" headers={{ Authorization: `JWT ${api.getToken()}` }}>
          {/* <Modifybutton to="/preferences">Modifier mes préférences</Modifybutton> */}
          <Heading>
            <p>TROUVEZ UNE MISSION DE BÉNÉVOLAT</p>
            <h1>Missions disponibles près de chez vous ou à distance</h1>
          </Heading>
          <Filters style={{ marginBottom: 20 }}>
            <SearchBox md={4}>
              <DataSearch innerClass={{ input: "form-control" }} placeholder="Recherche..." autosuggest={false} componentId="SEARCH" dataField={["title", "organisation"]} />
            </SearchBox>
            <Col md={4}>
              <CustomInput type="select" id="dist" defaultValue="">
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
            <DomainsFilter md={4}>
              <SingleDropdownList
                selectAllLabel="Tous les domaines"
                URLParams={true}
                componentId="DOMAIN"
                placeholder="Filtrer par domaines"
                dataField="domain.keyword"
                react={{ and: FILTERS.filter((e) => e !== "DOMAIN") }}
                showSearch={false}
              />
            </DomainsFilter>
          </Filters>
          <ReactiveList
            componentId="result"
            react={{ and: FILTERS }}
            pagination={true}
            size={25}
            showLoader={true}
            loader="Chargement..."
            innerClass={{ pagination: "pagination" }}
            dataField="created_at"
            // defaultQuery={function (value, props) {
            //   if (!young.location || !young.location.lat || !young.location.lon) return { query: { match_all: {} } };
            //   return {
            //     query: { match_all: {} },
            //     sort: [
            //       {
            //         _geo_distance: {
            //           location: [young.location.lon, young.location.lat],
            //           order: "asc",
            //           unit: "km",
            //           mode: "min",
            //         },
            //       },
            //     ],
            //   };
            // }}
            renderResultStats={({ numberOfResults, time }) => {
              return <div />;
              // return <div className="results">{`${numberOfResults} résultats trouvés en ${time}ms`}</div>;
            }}
            render={({ data }) => {
              return data.map((e, i) => <MissionCard mission={e} key={i} image={require("../../assets/observe.svg")} />);
            }}
          />
        </ReactiveBase>
      </Missions>
    </div>
  );
};

const Filters = styled(Row)`
  > * {
    margin-bottom: 0.5rem;
  }
`;

const Missions = styled(Container)`
  padding: 20px 40px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  @media (max-width: 768px) {
    font-size: 1.5rem;
    padding: 10px 15px;
  }
`;

const Heading = styled.div`
  margin-bottom: 40px;
  h1 {
    margin-top: 25px;
    color: #161e2e;
    font-size: 2.5rem;
    font-weight: 700;
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }
  p {
    color: #42389d;
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 5px;
    @media (max-width: 768px) {
      font-size: 0.8rem;
    }
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
