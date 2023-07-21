import Img3 from "../../../../assets/left.svg";
import Img2 from "../../../../assets/right.svg";
import React, { useState } from "react";
import { ReactiveBase, ReactiveList } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import CardMission from "./components/CardMission";
import { apiURL } from "../../../../config";
import api from "../../../../services/api";
import MissionSearchForm from "./components/MissionSearchForm";

const FILTERS = ["DOMAINS", "SEARCH", "STATUS", "GEOLOC", "DATE", "PERIOD", "RELATIVE", "MILITARY_PREPARATION", "HEBERGEMENT"];

export default function List() {
  const [filter, setFilter] = useState({ DOMAINS: [], DISTANCE: 50 });
  const [hebergement, setHebergement] = useState(false);

  const getDefaultQuery = () => {
    let body = {
      query: {
        bool: {
          must: [
            {
              script: {
                script: "doc['pendingApplications'].value < doc['placesLeft'].value * 5",
              },
            },
          ],
          filter: [
            {
              range: {
                endAt: {
                  gte: "now",
                },
              },
            },
            { term: { "status.keyword": "VALIDATED" } },
            { term: { "visibility.keyword": "VISIBLE" } },
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
      sort: [],
      track_total_hits: true,
      size: 20,
    };

    if (filter?.SEARCH) {
      body.query.bool.must.push({
        bool: {
          should: [
            {
              multi_match: {
                query: filter?.SEARCH,
                fields: ["name^10", "structureName^5", "description", "actions", "city"],
                type: "cross_fields",
                operator: "and",
              },
            },
            {
              multi_match: {
                query: filter?.SEARCH,
                fields: ["name^10", "structureName^5", "description", "actions", "city"],
                type: "phrase",
                operator: "and",
              },
            },
            {
              multi_match: {
                query: filter?.SEARCH,
                fields: ["name^10", "structureName^5", "description", "actions", "city"],
                type: "phrase_prefix",
                operator: "and",
              },
            },
          ],
          minimum_should_match: "1",
        },
      });
    }

    if (filter?.DISTANCE && filter?.LOCATION) {
      if (hebergement) {
        body.query.bool.filter.push({
          bool: {
            should: [
              {
                geo_distance: {
                  distance: `${filter?.DISTANCE}km`,
                  location: filter?.LOCATION,
                },
              },
              { term: { "hebergement.keyword": "true" } },
            ],
            minimum_should_match: "1",
          },
        });
      } else {
        body.query.bool.filter.push({
          geo_distance: {
            distance: `${filter?.DISTANCE}km`,
            location: filter?.LOCATION,
          },
        });
      }

      body.sort.push({
        _geo_distance: {
          location: filter?.LOCATION,
          order: "asc",
          unit: "km",
          mode: "min",
        },
      });
    }

    if (filter?.DOMAINS?.length) body.query.bool.filter.push({ terms: { "domains.keyword": filter.DOMAINS } });
    if (filter?.PERIOD?.length) body.query.bool.filter.push({ terms: { "period.keyword": filter.PERIOD } });
    if (filter?.MILITARY_PREPARATION) body.query.bool.filter.push({ term: { "isMilitaryPreparation.keyword": filter?.MILITARY_PREPARATION } });
    if (filter?.START_DATE && Object.keys(filter?.START_DATE).length) {
      body.query.bool.filter?.push({ range: { startAt: filter.START_DATE } });
    }
    if (filter?.END_DATE && Object.keys(filter?.END_DATE).length) {
      body.query.bool.filter.push({ range: { endAt: filter.END_DATE } });
    }
    return body;
  };

  React.useEffect(() => {
    let range;
    const fromDate = filter?.FROM;
    const toDate = filter?.TO;
    //If just the from date is filled
    if (fromDate && !toDate) {
      range = {
        startDate: {
          gte: fromDate,
        },
        endDate: {
          gte: fromDate,
        },
      };
      //If just the to date is filled
    } else if (!fromDate && toDate) {
      range = {
        startDate: {
          lte: toDate,
        },
        endDate: {
          lte: toDate,
        },
      };
      //If both date are filled
    } else if (fromDate && toDate) {
      range = {
        startDate: {
          lte: toDate,
        },
        endDate: {
          gte: fromDate,
        },
      };
      //If none of the dates is filled, reset filter
    } else {
      range = { startDate: {}, endDate: {} };
    }
    setFilter((prev) => ({ ...prev, START_DATE: range.startDate, END_DATE: range.endDate }));
  }, [filter?.FROM, filter?.TO]);

  return (
    <div className="flex">
      <div className="w-full rounded-lg bg-white pb-12">
        {/* BEGIN HEADER */}
        <div className="flex justify-between p-3">
          <div>
            <h1 className="mb-3 text-2xl font-bold text-gray-800">Trouvez une mission d&apos;intérêt général</h1>
            <div className="text-sm font-normal text-gray-700">
              Vous devez réaliser vos 84 heures de mission dans l&apos;année qui suit votre séjour de cohésion.{" "}
              <a
                className="font-medium underline hover:text-gray-700 hover:underline"
                href="https://support.snu.gouv.fr/base-de-connaissance/de-combien-de-temps-je-dispose-pour-realiser-ma-mig"
                target="_blank"
                rel="noreferrer">
                En savoir plus
              </a>
              .
              <br />
              Astuce : si les missions proposées ne correspondent pas à votre zone géographique, pensez à{" "}
              <a className="font-medium underline hover:text-gray-700 hover:underline" href="/account" target="_blank" rel="noreferrer">
                vérifier votre adresse
              </a>
              .
            </div>
          </div>
        </div>
        {/* END HEADER */}

        <MissionSearchForm filter={filter} setFilter={setFilter} hebergement={hebergement} setHebergement={setHebergement} />

        <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
          <Missions>
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
                return <div className="my-3 w-28 basis-3/4 text-sm text-gray-700">{`${numberOfResults} mission${numberOfResults > 1 ? "s" : ""}`}</div>;
              }}
              sortOptions={[
                { label: "La plus récente", dataField: "createdAt.keyword", sortBy: "asc" },
                { label: "La plus proche", dataField: "sort.keyword", sortBy: "asc" },
                { label: "La plus longue", dataField: "duration.keyword", sortBy: "desc" },
                { label: "La plus courte", dataField: "duration.keyword", sortBy: "asc" },
              ]}
              defaultSortOption="La plus proche"
              render={({ data }) => {
                return data.map((e) => <CardMission key={e._id} mission={e} youngLocation={filter.LOCATION} />);
              }}
              renderNoResults={() => (
                <div className="my-3 p-2 text-sm text-gray-700">
                  Aucune mission ne correspond à votre recherche. Merci de{" "}
                  <a className="font-medium underline hover:text-gray-700 hover:underline" href="/account" target="_blank" rel="noreferrer">
                    vérifier votre adresse
                  </a>
                  .
                </div>
              )}
            />
          </Missions>
        </ReactiveBase>
      </div>
    </div>
  );
}

const Missions = styled.div`
  font-family: "Marianne";
  padding: 0.5rem;
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
      background-image: url(${Img3});
    }
    a:last-child {
      background-image: url(${Img2});
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
  .sortOptions {
    font-family: "Marianne";
    outline: 0;
    color: #374151;
    font-weight: 400;
    font-size: 12px;
    margin-left: 60%;
  }
`;
