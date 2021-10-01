import React, { useState, useEffect } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";

import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import styled from "styled-components";

import api from "../../services/api";
import { apiURL } from "../../config";
import { translate, corpsEnUniforme, formatLongDateFR, ES_NO_LIMIT, ROLES, getFilterLabel, colors } from "../../utils";
import VioletButton from "../../components/buttons/VioletButton";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import { Filter, FilterRow, ResultTable, Table, Header, Title, MultiLine } from "../../components/list";
import Badge from "../../components/Badge";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import Chevron from "../../components/Chevron";
import Association from "./components/Association";

// const FILTERS = ["SEARCH", "LEGAL_STATUS", "STATUS", "DEPARTMENT", "REGION", "CORPS", "WITH_NETWORK", "LOCATION", "MILITARY_PREPARATION"];
const FILTERS = ["SEARCH", "REGION", "DEPARTMENT"];

export default () => {
  const [structure, setStructure] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const handleShowFilter = () => setFilterVisible(!filterVisible);
  const user = useSelector((state) => state.Auth.user);
  /*
  const getDefaultQuery = () =>
    user.role === ROLES.SUPERVISOR ? { query: { bool: { filter: { term: { "networkId.keyword": user.structureId } } } } } : { query: { match_all: {} } };
*/
  const getDefaultQuery = () => ({
    query: {
      bool: {
        must: {
          match_all: {},
        },
        should: ["url", "linkedin", "facebook", "twitter", "donation", "coordonnees_courriel", "coordonnees_telephone"].map((e) => ({
          exists: {
            field: e,
            boost: 2,
          },
        })),
      },
    },
  });

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="association" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <div>
                <Title>Annuaire des associations</Title>
              </div>
            </Header>
            <Filter>
              <FilterRow visible>
                <DataSearch
                  showIcon={false}
                  defaultQuery={getDefaultQuery}
                  placeholder="Rechercher par mots clés, ville, code postal..."
                  componentId="SEARCH"
                  dataField={["identite_nom"]}
                  react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                  style={{ flex: 1, marginRight: "1rem" }}
                  innerClass={{ input: "searchbox" }}
                  autosuggest={false}
                  URLParams={true}
                  queryFormat="and"
                />
                <RegionFilter dataField={"coordonnees_adresse_region.keyword"} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_REGION ? [user.region] : []} />
                <DepartmentFilter
                  dataField={"coordonnees_adresse_departement.keyword"}
                  filters={FILTERS}
                  defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? [user.department] : []}
                />
                <Chevron color="#444" style={{ cursor: "pointer", transform: filterVisible && "rotate(180deg)" }} onClick={handleShowFilter} />
              </FilterRow>
            </Filter>
            <ResultWrapper>
              <ReactiveListComponent
                react={{ and: FILTERS }}
                paginationAt="bottom"
                defaultQuery={getDefaultQuery}
                renderResultStats={(e) => {
                  return (
                    <StatsResult>
                      <b>{e.numberOfResults >= ES_NO_LIMIT ? `Plus de ${ES_NO_LIMIT.toLocaleString()}` : Number(e.numberOfResults).toLocaleString()} associations</b> correspondent
                      à vos critères
                    </StatsResult>
                  );
                }}
                onData={({ rawData }) => {
                  // if (rawData?.hits?.hits) setStructureIds(rawData.hits.hits.map((e) => e._id));
                }}
                dataField={undefined}
                sortBy={undefined}
                render={({ data }) => {
                  return data.map((hit) => <Association hit={hit} key={hit._id} onClick={() => setStructure(hit)} selected={structure?._id === hit._id} />);
                }}
              />
            </ResultWrapper>
          </div>
        </div>
      </ReactiveBase>
    </div>
  );
};

const StatsResult = styled.div`
  font-style: normal;
  font-size: 20px;
  line-height: 140%;
  color: #696974;
  margin-bottom: 2rem;
`;
const ResultWrapper = styled.div`
  padding: 0.5rem 25px 1rem 25px;
  .pagination {
    display: flex;
    justify-content: flex-end;
    padding: 10px 25px;
    margin: 0;
    a {
      background: #f7fafc;
      color: #242526;
      padding: 3px 10px;
      font-size: 12px;
      margin: 0 5px;
    }
    a.active {
      font-weight: 700;
    }
    a:first-child {
      background-image: url(${require("../../assets/left.svg")});
    }
    a:last-child {
      background-image: url(${require("../../assets/right.svg")});
    }
    a:first-child,
    a:last-child {
      font-size: 0;
      height: 24px;
      width: 30px;
      background-position: center;
      background-repeat: no-repeat;
      background-size: 8px;
    }
  }
`;
