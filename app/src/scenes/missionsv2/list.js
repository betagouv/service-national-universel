import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { ReactiveBase, ReactiveList, DataSearch, MultiDropdownList } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";

import MissionCard from "./components/missionCard";
import ReactiveFilter from "../../components/ReactiveFilter";
import { apiURL } from "../../config";
import { translate, getLimitDateForPhase2, getFilterLabel, ENABLE_PM } from "../../utils";
import api from "../../services/api";
import Loader from "../../components/Loader";
import FilterGeoloc from "./components/FilterGeoloc";
import AlertBox from "../../components/AlertBox";
import MilitaryPreparationCard from "./components/MilitaryPreparationCard";

const FILTERS = ["DOMAIN", "SEARCH", "STATUS", "GEOLOC", "DATE", "PERIOD", "RELATIVE", "MILITARY_PREPARATION"];

export default function List() {
  const young = useSelector((state) => state.Auth.young);
  const [targetLocation, setTargetLocation] = useState("");
  const [referentManagerPhase2, setReferentManagerPhase2] = useState();
  const [showAlertLimitDate, setShowAlertLimitDate] = useState(true);
  const [showAlertMilitaryPreparation, setShowAlertMilitaryPreparation] = useState(true);
  const [showAlert100km, setShowAlert100km] = useState(true);
  const [applications, setApplications] = useState();
  const getDefaultQuery = () => {
    let query = {
      query: {
        bool: {
          filter: [
            {
              range: {
                endAt: {
                  gte: "now",
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
      const { data } = await api.get(`/young/${young._id}/application`);
      const app = data?.reduce((acc, a) => {
        acc.push(a.missionId);
        return acc;
      }, []);
      return setApplications(app);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/referent/manager_phase2/${young.department}`);
      if (ok) return setReferentManagerPhase2(data);
    })();
  }, []);

  const handleChangeTargetLocation = (e) => setTargetLocation(e.target.value);

  if (!applications) return <Loader />;

  return (
    <div className="bg-white mx-4 pb-12 my-4 rounded-lg p-14">
      {/* BEGIN HEADER */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Trouvez une mission d&apos;intérêt général</h1>
        <div className="text-sm font-normal text-gray-700">
          Vous devez réaliser vos 84 heures de mission dans l&apos;année qui suit votre séjour de cohésion.
          <br />
          Pour plus d&apos;informations,{" "}
          <a
            className="underline hover:underline font-medium hover:text-gray-700"
            href="https://support.snu.gouv.fr/base-de-connaissance/de-combien-de-temps-je-dispose-pour-realiser-ma-mig"
            target="_blank"
            rel="noreferrer">
            cliquez-ici
          </a>
          .
        </div>
      </div>
      {/* END HEADER */}

      {/* BEGIN CONTROL */}
      <div className="bg-gray-50 rounded-lg">CONTROL</div>
      {/* END CONTROL */}
      <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
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
              return <div className="text-gray-700 mb-3 text-sm">{`${numberOfResults} mission${numberOfResults > 1 ? "s" : ""}`}</div>;
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
                    structureName={e.structureName}
                    missionName={e.name}
                    tags={tags}
                    places={e.placesLeft}
                    isMilitaryPreparation={e.isMilitaryPreparation}
                    domain={e.domains[0]}
                  />
                );
              });
            }}
            renderNoResults={() => <div className="text-gray-700 mb-3 text-sm">Aucune mission ne correspond à votre recherche</div>}
          />
        </Missions>
      </ReactiveBase>
    </div>
  );
}

const Missions = styled.div`
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
