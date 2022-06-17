import React, { useEffect, useState } from "react";
import { ReactiveBase, ReactiveList, DataSearch, MultiDropdownList } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";

import CardMission from "./components/CardMission";
import { apiURL } from "../../config";
import { translate, getLimitDateForPhase2, getFilterLabel, ENABLE_PM, ES_NO_LIMIT } from "../../utils";
import api from "../../services/api";
import Loader from "../../components/Loader";
import FilterGeoloc from "./components/FilterGeoloc";
import AlertBox from "../../components/AlertBox";
import MilitaryPreparationCard from "./components/MilitaryPreparationCard";
import Sante from "../../assets/mission-domaines/sante";
import Solidarite from "../../assets/mission-domaines/solidarite";
import Citoyennete from "../../assets/mission-domaines/citoyennete";
import Education from "../../assets/mission-domaines/education";
import Sport from "../../assets/mission-domaines/sport";
import DefenseEtMemoire from "../../assets/mission-domaines/defense-et-memoire";
import Environment from "../../assets/mission-domaines/environment";
import Securite from "../../assets/mission-domaines/securite";
import Culture from "../../assets/mission-domaines/culture";
import PreparationMilitaire from "../../assets/mission-domaines/preparation-militaire";
import { Link } from "react-router-dom";
import { HiOutlineAdjustments } from "react-icons/hi";

const FILTERS = ["DOMAINS", "SEARCH", "STATUS", "GEOLOC", "DATE", "PERIOD", "RELATIVE", "MILITARY_PREPARATION"];

export default function List() {
  const young = useSelector((state) => state.Auth.young);
  const [filter, setFilter] = React.useState();
  const [bufferText, setBufferText] = React.useState();

  const getDefaultQuery = () => {
    let body = {
      query: {
        bool: {
          must: [],
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

    if (filter?.DOMAINS?.length) body.query.bool.filter.push({ terms: { "domains.keyword": filter.DOMAINS } });
    if (filter?.MILITARY_PREPARATION) body.query.bool.filter.push({ term: { "isMilitaryPreparation.keyword": filter?.MILITARY_PREPARATION } });
    return body;
  };

  const handleToggleChangeDomain = (domain) => {
    setFilter((prev) => {
      const newFilter = { ...prev };
      if (newFilter?.DOMAINS?.includes(domain)) {
        newFilter.DOMAINS = newFilter.DOMAINS.filter((d) => d !== domain);
      } else {
        newFilter.DOMAINS = [...(newFilter.DOMAINS || []), domain];
      }
      return newFilter;
    });
  };

  const search = (e) => {
    e.preventDefault();
    setFilter((prev) => {
      const newFilter = { ...prev };
      newFilter.SEARCH = bufferText;
      return newFilter;
    });
  };

  return (
    <div className="bg-white mx-4 pb-12 my-4 rounded-lg p-14">
      {/* BEGIN HEADER */}
      <div className="flex justify-between mb-4">
        <div>
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
        <Link to="/preferences">
          <div className="group flex gap-1 rounded-[10px] border-[1px] border-blue-700 py-2.5 px-3 items-center hover:bg-blue-700 hover:text-[#ffffff]">
            <HiOutlineAdjustments className="text-blue-700 group-hover:text-[#ffffff]" />
            <div className="text-blue-700 group-hover:text-[#ffffff] text-sm flex-1">Renseigner mes préférences</div>
          </div>
        </Link>
      </div>
      {/* END HEADER */}

      {/* BEGIN CONTROL */}
      <form onSubmit={search} className="bg-gray-50 p-10 rounded-lg space-y-4">
        {/* search bar recherche */}
        <div>
          <div className="flex bg-white border-[1px] border-gray-300 rounded-full overflow-hidden p-2 divide-x divide-gray-300">
            <input
              value={bufferText}
              onChange={(e) => setBufferText(e.target.value)}
              className="flex-1 p-1 px-3 w-full placeholder:text-gray-400 text-gray-700 text-sm"
              type="text"
              placeholder="Rechercher une mission..."
            />
          </div>
        </div>
        <div className="flex justify-between gap-2 flex-wrap">
          <DomainFilter Icon={Sante} name="HEALTH" label="Santé" onClick={handleToggleChangeDomain} active={(filter?.DOMAINS || []).includes("HEALTH")} />
          <DomainFilter Icon={Solidarite} name="SOLIDARITY" label="Solidarité" onClick={handleToggleChangeDomain} active={(filter?.DOMAINS || []).includes("SOLIDARITY")} />
          <DomainFilter Icon={Citoyennete} name="CITIZENSHIP" label="Citoyenneté" onClick={handleToggleChangeDomain} active={(filter?.DOMAINS || []).includes("CITIZENSHIP")} />
          <DomainFilter Icon={Education} name="EDUCATION" label="Éducation" onClick={handleToggleChangeDomain} active={(filter?.DOMAINS || []).includes("EDUCATION")} />
          <DomainFilter Icon={Sport} name="SPORT" label="Sport" onClick={handleToggleChangeDomain} active={(filter?.DOMAINS || []).includes("SPORT")} />
          <DomainFilter Icon={DefenseEtMemoire} name="DEFENSE" label="Défense et mémoire" onClick={handleToggleChangeDomain} active={(filter?.DOMAINS || []).includes("DEFENSE")} />
          <DomainFilter Icon={Environment} name="ENVIRONMENT" label="Environment" onClick={handleToggleChangeDomain} active={(filter?.DOMAINS || []).includes("ENVIRONMENT")} />
          <DomainFilter Icon={Securite} name="SECURITY" label="Sécurité" onClick={handleToggleChangeDomain} active={(filter?.DOMAINS || []).includes("SECURITY")} />
          <DomainFilter Icon={Culture} name="CULTURE" label="Culture" onClick={handleToggleChangeDomain} active={(filter?.DOMAINS || []).includes("CULTURE")} />
          <DomainFilter
            Icon={PreparationMilitaire}
            label="Préparations militaires"
            active={filter?.MILITARY_PREPARATION === "true"}
            onClick={() =>
              setFilter((prev) => {
                const newFilter = { ...prev };
                if (newFilter?.MILITARY_PREPARATION === "true") newFilter.MILITARY_PREPARATION = "false";
                else newFilter.MILITARY_PREPARATION = "true";
                return newFilter;
              })
            }
          />
        </div>
      </form>
      {/* END CONTROL */}

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
              return <div className="text-gray-700 my-3 text-sm">{`${numberOfResults} mission${numberOfResults > 1 ? "s" : ""}`}</div>;
            }}
            render={({ data }) => {
              return data.map((e) => {
                const tags = [];
                e.city && tags.push(e.city + (e.zip ? ` - ${e.zip}` : ""));
                // tags.push(e.remote ? "À distance" : "En présentiel");
                e.domains.forEach((d) => tags.push(translate(d)));
                return <CardMission key={e._id} mission={e} />;
              });
            }}
            renderNoResults={() => <div className="text-gray-700 mb-3 text-sm">Aucune mission ne correspond à votre recherche</div>}
          />
        </Missions>
      </ReactiveBase>
    </div>
  );
}
const DomainFilter = ({ Icon, name, label, onClick, active }) => {
  return (
    <div className="group flex flex-1 flex-col items-center justify-start space-y-2 cursor-pointer" onClick={() => onClick(name)}>
      <div className={`${active ? "bg-[#212B44]" : "bg-gray-200"} w-9 h-9 flex justify-center items-center rounded-xl group-hover:-translate-y-1 transition duration-200 ease-in`}>
        <Icon className="text-white" />
      </div>
      <div className="text-xs text-gray-700 text-center">{label}</div>
    </div>
  );
};

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
