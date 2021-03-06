import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { ReactiveBase, ReactiveList, DataSearch, SingleDropdownList } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";

import MissionCard from "./components/missionCard";
import ReactiveFilter from "../../components/ReactiveFilter";
import { apiURL } from "../../config";
import { translate, getLimitDateForPhase2 } from "../../utils";
import api from "../../services/api";
import Loader from "../../components/Loader";
import FilterGeoloc from "./components/FilterGeoloc";

const FILTERS = ["DOMAIN", "SEARCH", "STATUS", "GEOLOC", "DATE", "PERIOD", "RELATIVE"];

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [targetLocation, setTargetLocation] = useState("");
  const [showAlert, setShowAlert] = useState(true);
  const [applications, setApplications] = useState();
  const getDefaultQuery = () => {
    let query = {
      query: {
        bool: {
          filter: [
            {
              range: {
                endAt: {
                  gt: "now",
                },
              },
            },
            { term: { "status.keyword": "VALIDATED" } },
            {
              range: {
                placesLeft: {
                  gt: 0,
                },
              },
            },
          ],
        },
      },
    };
    if (young.cohort === "2021") {
      query.query.bool.filter.push({
        range: {
          startAt: {
            gte: "2021-07-02",
          },
        },
      });
    }
    if (young.location && !targetLocation)
      query.sort = [
        {
          _geo_distance: {
            location: [young.location.lon, young.location.lat],
            order: "asc",
            unit: "km",
            mode: "min",
          },
        },
      ];
    return query;
  };

  useEffect(() => {
    (async () => {
      if (!young) return setApplications(null);
      const { data } = await api.get(`/application/young/${young._id}`);
      const app = data?.reduce((acc, a) => {
        acc.push(a.missionId);
        return acc;
      }, []);
      return setApplications(app);
    })();
  }, []);

  const handleChangeTargetLocation = (e) => setTargetLocation(e.target.value);

  if (!applications) return <Loader />;

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
            <SearchBox md={12}>
              <DataSearch
                innerClass={{ input: "form-control" }}
                placeholder="Recherche par mots clés..."
                autosuggest={false}
                componentId="SEARCH"
                dataField={["name^10", "structureName", "description", "actions", "city"]}
                queryFormat="and"
              />
            </SearchBox>
            <DomainsFilter md={6}>
              <select id="tl" className="form-control" value={targetLocation} onChange={handleChangeTargetLocation}>
                <option value="">A proximité de mon domicile ({young.city})</option>
                {young.mobilityNearRelativeZip && (
                  <option value="relative">
                    A proximité d'un proche ({young.mobilityNearRelativeName} - {young.mobilityNearRelativeZip})
                  </option>
                )}
              </select>
            </DomainsFilter>
            <Col md={6}>
              <FilterGeoloc young={young} targetLocation={targetLocation} componentId="GEOLOC" />
            </Col>
            <DomainsFilter md={6}>
              <SingleDropdownList
                defaultQuery={getDefaultQuery}
                selectAllLabel="Tous les domaines"
                URLParams={true}
                componentId="DOMAIN"
                dataField="domains.keyword"
                react={{ and: FILTERS.filter((e) => e !== "DOMAIN") }}
                renderItem={(e, count) => {
                  return `${translate(e)} ${count ? `(${count})` : ""}`;
                }}
                renderLabel={(item) => translate(item) || "Filtrer par domaine"}
                showSearch={false}
              />
            </DomainsFilter>
            <DomainsFilter md={6}>
              <SingleDropdownList
                defaultQuery={getDefaultQuery}
                selectAllLabel="Toutes les périodes"
                URLParams={true}
                componentId="PERIOD"
                dataField="period.keyword"
                react={{ and: FILTERS.filter((e) => e !== "PERIOD") }}
                renderItem={(e, count) => {
                  return `${translate(e)} ${count ? `(${count})` : ""}`;
                }}
                renderLabel={(item) => translate(item) || "Filtrer par période"}
                showSearch={false}
              />
            </DomainsFilter>
          </Row>
        </Filters>
        <Missions>
          <ReactiveFilter componentId="STATUS" query={{ query: { bool: { filter: { term: { "status.keyword": "VALIDATED" } } } }, value: "" }} />
          <ReactiveList
            defaultQuery={getDefaultQuery}
            componentId="result"
            react={{ and: FILTERS }}
            pagination={true}
            paginationAt="bottom"
            size={25}
            showLoader={true}
            loader="Chargement..."
            innerClass={{ pagination: "pagination" }}
            dataField="created_at"
            renderResultStats={({ numberOfResults }) => {
              return <div className="info">{`${numberOfResults} mission${numberOfResults > 1 ? "s" : ""} trouvée${numberOfResults > 1 ? "s" : ""}`}</div>;
            }}
            render={({ data }) => {
              return data.map((e) => {
                const tags = [];
                e.city && tags.push(e.city + (e.zip ? ` - ${e.zip}` : ""));
                // tags.push(e.remote ? "À distance" : "En présentiel");
                e.domains.forEach((d) => tags.push(translate(d)));
                return (
                  <MissionCard
                    applied={applications && applications.includes(e._id)}
                    key={e._id}
                    id={e._id}
                    title={e.structureName}
                    image={require("../../assets/observe.svg")}
                    subtitle={e.name}
                    tags={tags}
                    places={e.placesLeft}
                  />
                );
              });
            }}
            renderNoResults={() => <div className="info">Aucune mission ne correspond à votre recherche</div>}
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
    margin: 0.5rem 0;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border: 0;
  }
`;

const AlertBox = ({ onClose }) => {
  const young = useSelector((state) => state.Auth.young);
  return (
    <Alert>
      <img src={require("../../assets/information.svg")} height={15} />
      <div className="text">
        <strong>Vous pourrez faire une mission jusqu’au {getLimitDateForPhase2(young.cohort)}.</strong>
        <p>Des missions supplémentaires seront proposées tout au long de l’année. Vous serez informé par e-mail dès qu’une mission répondant à vos préférences sera publiée.</p>
      </div>
      <img src={require("../../assets/close.svg")} height={15} onClick={onClose} style={{ cursor: "pointer" }} />
    </Alert>
  );
};

const Missions = styled(Container)`
  padding: 20px 40px;
  border-radius: 6px;
  margin-bottom: 2rem;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  @media (max-width: 768px) {
    font-size: 1.5rem;
    padding: 10px 15px;
  }
  .info {
    flex: 1;
    text-align: center;
    font-size: 0.8rem;
    color: #767a83;
  }
  .pagination {
    display: flex;
    justify-content: flex-end;
    padding: 10px 25px;
    margin: 0;
    background: #fff;
    a {
      background: #f7fafc;
      color: #242526;
      padding: 3px 10px;
      font-size: 12px;
      margin: 0 5px;
    }
    a.active {
      font-weight: 700;
      /* background: #5245cc;
      color: #fff; */
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

const Heading = styled(Container)`
  margin-bottom: 40px;
  h1 {
    color: #161e2e;
    font-size: 3rem;
    font-weight: 700;
    @media (max-width: 768px) {
      font-size: 1.3rem;
    }
  }
  p {
    color: #42389d;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 5px;
    text-transform: uppercase;
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
  @media (max-width: 768px) {
    border-radius: 0;
  }
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
