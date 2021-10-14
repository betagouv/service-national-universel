import React, { useState } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";

import { useSelector } from "react-redux";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";

import api from "../../services/api";
import { apiURL } from "../../config";
import { translate, ES_NO_LIMIT, ROLES, getFilterLabel } from "../../utils";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import { Filter, FilterRow, Header, Title } from "../../components/list";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import Association from "./components/Association";

const FILTERS = ["SEARCH", "REGION", "DEPARTMENT", "DOMAIN"];

export default () => {
  const [structure, setStructure] = useState(null);
  const [missionsInfo, setMissionsInfo] = useState({});

  const user = useSelector((state) => state.Auth.user);
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

  const getMissionsInfo = async (association) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: association._source.id_rna,
                fields: ["associationRna", "organizationRNA"],
              },
            },
            {
              match: {
                deleted: "no",
              },
            },
          ],
        },
      },
    });

    try {
      const res = await fetch("https://api.api-engagement.beta.gouv.fr/v0/mission/search", {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      }).then((response) => response.json());

      if (res.hits.hits.length > 0) {
        return {
          [association._id]: {
            countMissions: res.hits.hits.length,
            countPlaces: res.hits.hits.reduce((prev, curr) => (curr._source.places ? prev + curr._source.places : 0), 0),
            missions: res.hits.hits.map((el) => ({ id: el._id, ...el._source })),
          },
        };
      }
    } catch (err) {
      console.log(err);
      toastr.error("Erreur lors de la récupération des missions");
      return {};
    }
  };

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
                  placeholder="Rechercher par mots clés, nom, ville, description…"
                  componentId="SEARCH"
                  dataField={[
                    "identite_nom^10",
                    "identite_sigle^5",
                    "coordonnees_adresse_commune^4",
                    "description^4",
                    "coordonnees_adresse_region^3",
                    "activites_objet^2",
                    "activites_lib_famille1^2",
                    "coordonnees_adresse_departement^1",
                  ]}
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
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Domaine"
                  componentId="DOMAIN"
                  dataField="activites_lib_theme1.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "DOMAIN") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Domaine")}
                />
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
                onData={async ({ rawData }) => {
                  // if (rawData?.hits?.hits) setStructureIds(rawData.hits.hits.map((e) => e._id));
                  if (rawData?.hits?.hits) {
                    rawData.hits.hits.forEach(async (association) => {
                      const associationMissions = await getMissionsInfo(association);
                      setMissionsInfo((prevState) => ({ ...prevState, ...associationMissions }));
                    });
                  }
                }}
                dataField={undefined}
                sortBy={undefined}
                render={({ data }) => {
                  return data.map((hit) => (
                    <Association
                      hit={hit}
                      missionsInfo={
                        missionsInfo[hit._id] || {
                          countMissions: 0,
                          countPlaces: 0,
                          missions: [],
                        }
                      }
                      key={hit._id}
                      onClick={() => setStructure(hit)}
                      selected={structure?._id === hit._id}
                    />
                  ));
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
