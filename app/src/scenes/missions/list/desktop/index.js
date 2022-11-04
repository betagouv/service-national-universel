import React, { useEffect, useState } from "react";
import { ReactiveBase, ReactiveList } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";

import CardMission from "./components/CardMission";
import { apiURL } from "../../../../config";
import { translate, MISSION_PERIOD_DURING_HOLIDAYS, MISSION_PERIOD_DURING_SCHOOL } from "../../../../utils";
import api from "../../../../services/api";
import Sante from "../../../../assets/mission-domaines/sante";
import Solidarite from "../../../../assets/mission-domaines/solidarite";
import Citoyennete from "../../../../assets/mission-domaines/citoyennete";
import Education from "../../../../assets/mission-domaines/education";
import Sport from "../../../../assets/mission-domaines/sport";
import DefenseEtMemoire from "../../../../assets/mission-domaines/defense-et-memoire";
import Environment from "../../../../assets/mission-domaines/environment";
import Securite from "../../../../assets/mission-domaines/securite";
import Culture from "../../../../assets/mission-domaines/culture";
import PreparationMilitaire from "../../../../assets/mission-domaines/preparation-militaire";
import AcademicCap from "../../../../assets/icons/AcademicCap";
import Sun from "../../../../assets/icons/Sun";
import Calendar from "../../../../assets/icons/Calendar";
import Search from "../../../../assets/icons/Search";
import { Link } from "react-router-dom";
import { HiOutlineAdjustments } from "react-icons/hi";
import PietonSvg from "../../assets/Pieton";
import VeloSvg from "../../assets/Velo";
import VoitureSvg from "../../assets/Voiture";
import TrainSvg from "../../assets/Train";
import FuseeSvg from "../../assets/Fusee";
import ReactTooltip from "react-tooltip";
import { toastr } from "react-redux-toastr";
import { capture } from "../../../../../src/sentry";
import InfobulleIcon from "../../../../assets/infobulleIcon.svg";
import RadioInput from "../../../../assets/radioInput.svg";
import RadioUnchecked from "../../../../assets/radioUnchecked.svg";

const FILTERS = ["DOMAINS", "SEARCH", "STATUS", "GEOLOC", "DATE", "PERIOD", "RELATIVE", "MILITARY_PREPARATION"];
const DISTANCE_MAX = 100;

export default function List() {
  const young = useSelector((state) => state.Auth.young);
  const [filter, setFilter] = React.useState({ DOMAINS: [], DISTANCE: 50 });
  const [dropdownControlDistanceOpen, setDropdownControlDistanceOpen] = React.useState(false);
  const [dropdownControlWhenOpen, setDropdownControlWhenOpen] = React.useState(false);
  const [focusedAddress, setFocusedAddress] = React.useState({ address: young?.address, zip: young?.zip });
  const refDropdownControlDistance = React.useRef(null);
  const refDropdownControlWhen = React.useRef(null);
  const [marginDistance, setMarginDistance] = useState();
  const [referentManagerPhase2, setReferentManagerPhase2] = useState();

  const callSingleAddressAPI = async (params) => {
    try {
      const url = `https://api-adresse.data.gouv.fr/search/?q=${params}&limit=1`;
      const res = await fetch(url).then((response) => response.json());
      return res?.features[0];
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const getCoordinates = async ({ q, postcode }) => {
    try {
      let adresse = await callSingleAddressAPI(`${q}+${postcode}`);
      if (!adresse) {
        console.warn("Utilisation du zip code seul");
        adresse = await callSingleAddressAPI(postcode);
        if (!adresse) throw "Erreur en utilisant l'api d'adresse";
      }
      const coordinates = adresse?.geometry?.coordinates;
      return { lat: coordinates[1], lon: coordinates[0] };
    } catch (e) {
      console.error(e);
      return null;
    }
  };

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
      body.query.bool.filter.push({
        geo_distance: {
          distance: `${filter?.DISTANCE}km`,
          location: filter?.LOCATION,
        },
      });
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

  const handleToggleChangePeriod = (period) => {
    setFilter((prev) => {
      const newFilter = { ...prev };
      if (newFilter?.PERIOD?.includes(period)) {
        newFilter.PERIOD = newFilter.PERIOD.filter((d) => d !== period);
      } else {
        newFilter.PERIOD = [...(newFilter.PERIOD || []), period];
      }
      return newFilter;
    });
  };

  const getLabelWhen = (when) => {
    switch (when) {
      case "SCOLAIRE":
        return "Période scolaire";
      case "VACANCES":
        return "Pendant les vacances";
      case "CUSTOM":
        return "Choisir une période";
      default:
        return "N'importe quand";
    }
  };

  useEffect(() => {
    (async () => {
      if (!young) return;
      const filterLocation = young?.location || (await getCoordinates({ q: young?.address, postcode: young?.zip }));

      setFilter({ ...filter, LOCATION: filterLocation });
    })();

    const getManagerPhase2 = async () => {
      try {
        if (!young) return;
        const { ok, data } = await api.get(`/referent/manager_phase2/${young.department}`);

        if (!ok) return toastr.error("Aucun référent n'a été trouvé");
        setReferentManagerPhase2(data);
      } catch (e) {
        capture(e);
      }
    };
    getManagerPhase2();
  }, [young]);

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

  React.useEffect(() => {
    if (!focusedAddress) return;
    (async () => {
      let location;
      location = await getCoordinates({ q: focusedAddress.address, postcode: focusedAddress.zip });
      setFilter((prev) => ({ ...prev, LOCATION: location }));
    })();
  }, [focusedAddress]);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const MILITARY_PREPARATION = urlParams.get("MILITARY_PREPARATION");
    if (MILITARY_PREPARATION === "true") setFilter((prev) => ({ ...prev, MILITARY_PREPARATION: "true" }));
  }, []);

  React.useEffect(() => {
    if (!refDropdownControlDistance) return;
    const handleClickOutside = (event) => {
      if (refDropdownControlDistance?.current && !refDropdownControlDistance.current.contains(event.target)) {
        setDropdownControlDistanceOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);
  React.useEffect(() => {
    if (!refDropdownControlWhen) return;
    const handleClickOutside = (event) => {
      if (refDropdownControlWhen?.current && !refDropdownControlWhen.current.contains(event.target)) {
        setDropdownControlWhenOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const marginLeftDistance = (ele) => {
    if (ele) {
      return Number(ele.scrollWidth + ((filter?.DISTANCE - DISTANCE_MAX) * ele.scrollWidth) / DISTANCE_MAX) * 0.96;
    }
    return false;
  };

  useEffect(() => {
    const ele = document.querySelector(".distanceKm");
    if (ele) {
      setMarginDistance(marginLeftDistance(ele));
    }
  }, [filter?.DISTANCE]);

  return (
    <div className="flex">
      <div className="bg-white mx-4 pb-12 my-4 rounded-lg p-14 w-full">
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
        <div className="bg-gray-50 p-10 rounded-lg space-y-6 mb-4">
          {/* search bar recherche */}
          <div className="relative flex justify-center">
            <div className="flex bg-white border-[1px] border-gray-300 rounded-full overflow-hidden p-1.5 items-center  w-9/12">
              <input
                value={filter?.SEARCH}
                onChange={(e) => {
                  e.persist();
                  setFilter((prev) => ({ ...prev, SEARCH: e.target.value }));
                }}
                className="flex-1 p-1 px-3 w-full placeholder:text-gray-400 text-gray-700 text-sm"
                type="text"
                placeholder="Rechercher une mission..."
              />
              <div
                className="flex items-center flex-1 p-1 px-3 w-full placeholder:text-gray-400 text-gray-700 text-sm cursor-pointer border-l-[1px] border-gray-300"
                onClick={() => setDropdownControlDistanceOpen((e) => !e)}>
                Distance max. {filter?.DISTANCE}km
              </div>
              <div
                className="flex items-center flex-1 p-1 px-3 w-full placeholder:text-gray-400 text-gray-700 text-sm cursor-pointer border-l-[1px] border-gray-300"
                onClick={() => setDropdownControlWhenOpen((e) => !e)}>
                {getLabelWhen(filter?.PERIOD_PARENT)}
              </div>
              <div className="w-[34px] h-[34px] rounded-full bg-blue-600 flex justify-center items-center cursor-pointer hover:bg-blue-500">
                <Search className="text-white" />
              </div>
            </div>
            {/* BEGIN MODAL CONTROL DISTANCE */}
            <div
              ref={refDropdownControlDistance}
              className={`${
                dropdownControlDistanceOpen ? "block" : "hidden"
              } w-full rounded-lg bg-white transition absolute top-[calc(100%+8px)] left-0 shadow overflow-hidden p-3 z-20`}>
              <div className="flex justify-center items-center">
                <div className="font-bold text-sm text-gray-00 mr-1"> Distance maximum </div>
                <div>
                  <img src={InfobulleIcon} data-tip data-for="info" />
                  <ReactTooltip delayHide={3000} clickable={true} id="info" className="w-[527px] bg-white opacity-100 shadow-xl" arrowColor="white">
                    <div className="text-[#414458] text-[15px] text-left mb-2">Visibilité des missions</div>
                    <div className="text-[#83869A] text-[12px] text-left">
                      Vous ne voyez que les missions proposées à moins de 100 km du domicile que vous avez déclaré. Il existe des offres de missions accessibles pour vous sous
                      conditions partout en France, notamment certaines préparations militaires. Si vous souhaitez connaître ces offres et y accéder, contactez tout de suite votre
                      référent phase 2 : <a href={`mailto:${referentManagerPhase2?.email}`}>{referentManagerPhase2?.email}</a>
                    </div>
                  </ReactTooltip>
                </div>
              </div>

              <div className="flex w-full flex-col space-y-2 py-2 px-4">
                <div className="flex justify-around my-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="main-address"
                      name="main-address"
                      type="radio"
                      checked={focusedAddress?.address !== young?.mobilityNearRelativeAddress}
                      onChange={() => setFocusedAddress({ address: young?.address, zip: young?.zip })}
                      className="hidden"
                    />
                    <label htmlFor="main-address" className="mr-2">
                      {focusedAddress?.address === young.address ? <img src={RadioInput} /> : <img src={RadioUnchecked} />}
                    </label>
                    <label htmlFor="main-address" className="cursor-pointer">
                      <span className="text-[13px] text-gray-700">Autour de mon adresse principale</span>
                      <br />
                      <span className="text-[15px] text-gray-700">{young.city}</span>
                    </label>
                  </div>
                  {young?.mobilityNearRelativeCity ? (
                    <div className="flex items-center gap-2">
                      <input
                        id="second-address"
                        name="address"
                        type="radio"
                        checked={focusedAddress?.address === young?.mobilityNearRelativeAddress}
                        onChange={() => setFocusedAddress({ address: young?.mobilityNearRelativeAddress, zip: young?.mobilityNearRelativeZip })}
                        className="hidden"
                      />
                      <label htmlFor="second-address" className="mr-2">
                        {focusedAddress?.address === young.mobilityNearRelativeAddress ? <img src={RadioInput} /> : <img src={RadioUnchecked} />}
                      </label>
                      <label htmlFor="second-address" className="cursor-pointer">
                        <span className="text-[13px] text-gray-700">Autour de l&apos;adresse de mon proche</span>
                        <br />
                        <span className="text-[15px] text-gray-700">{young?.mobilityNearRelativeCity}</span>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input id="second-address" name="address" type="radio" value={young.city} disabled />
                      <label htmlFor="second-address">
                        <span className="text-[13px] text-gray-400">Autour de l&apos;adresse de mon proche</span>
                        <br />
                        <Link to="/preferences" className="text-[15px] text-blue-600 underline hover:underline">
                          Renseigner une adresse
                        </Link>
                      </label>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <input
                    list="distance-list"
                    type="range"
                    className="w-full distanceKm appearance-none h-2 bg-gray-200 items-center  rounded-full cursor-pointer"
                    min="1"
                    max={DISTANCE_MAX}
                    step="1"
                    onChange={(e) => {
                      e.persist();
                      setFilter((prev) => ({ ...prev, DISTANCE: e.target.value }));
                    }}
                  />
                  <div className={`absolute -ml-2 -mt-10 font-bold w-full ${!marginDistance && " flex justify-center ml-1"} `} style={{ left: `${marginDistance}px` }}>
                    {filter?.DISTANCE}km
                  </div>
                </div>
                <div className="flex justify-between w-full mt-4 px-[10px] text-gray-200 items-center">
                  <PietonSvg />
                  <VeloSvg />
                  <VoitureSvg />
                  <TrainSvg />
                  <FuseeSvg />
                </div>
              </div>
            </div>
            {/* END MODAL CONTROL DISTANCE */}

            {/* BEGIN MODAL CONTROL WHEN */}
            <div
              ref={refDropdownControlWhen}
              className={`${
                dropdownControlWhenOpen ? "block" : "hidden"
              } w-full rounded-lg bg-white transition absolute top-[calc(100%+8px)] left-0 shadow overflow-hidden p-3 z-20`}>
              <div className="font-bold text-sm text-gray-00 text-center">Période de réalisation de la mission</div>
              <div className="flex w-full flex-col py-2 px-4">
                <div className="flex justify-between w-full mt-4 px-[10px] font-medium text-gray-700 text-sm gap-2">
                  <PeriodeTab label={getLabelWhen("")} active={!filter?.PERIOD_PARENT} name="" onClick={() => setFilter((prev) => ({ ...prev, PERIOD_PARENT: undefined }))} />
                  <PeriodeTab
                    Icon={AcademicCap}
                    label={getLabelWhen("SCOLAIRE")}
                    active={filter?.PERIOD_PARENT === "SCOLAIRE"}
                    name="SCOLAIRE"
                    onClick={() => setFilter((prev) => ({ ...prev, PERIOD_PARENT: "SCOLAIRE" }))}
                  />
                  <PeriodeTab
                    Icon={Sun}
                    label={getLabelWhen("VACANCES")}
                    active={filter?.PERIOD_PARENT === "VACANCES"}
                    name="VACANCES"
                    onClick={() => setFilter((prev) => ({ ...prev, PERIOD_PARENT: "VACANCES" }))}
                  />
                  <PeriodeTab
                    Icon={Calendar}
                    label={getLabelWhen("CUSTOM")}
                    active={filter?.PERIOD_PARENT === "CUSTOM"}
                    name="CUSTOM"
                    onClick={() => setFilter((prev) => ({ ...prev, PERIOD_PARENT: "CUSTOM" }))}
                  />
                </div>
                {filter?.PERIOD_PARENT === "SCOLAIRE" ? (
                  <div className="flex flex-col gap-2 justify-center items-center mt-6">
                    <div className="flex flex-wrap gap-2 justify-center items-center">
                      <PeriodeItem
                        name={MISSION_PERIOD_DURING_SCHOOL.EVENING}
                        onClick={handleToggleChangePeriod}
                        active={(filter?.PERIOD || []).includes(MISSION_PERIOD_DURING_SCHOOL.EVENING)}
                      />
                      <PeriodeItem
                        name={MISSION_PERIOD_DURING_SCHOOL.END_DAY}
                        onClick={handleToggleChangePeriod}
                        active={(filter?.PERIOD || []).includes(MISSION_PERIOD_DURING_SCHOOL.END_DAY)}
                      />
                      <PeriodeItem
                        name={MISSION_PERIOD_DURING_SCHOOL.WEEKEND}
                        onClick={handleToggleChangePeriod}
                        active={(filter?.PERIOD || []).includes(MISSION_PERIOD_DURING_SCHOOL.WEEKEND)}
                      />
                    </div>
                    {filter?.PERIOD?.length ? (
                      <div className="text-xs text-gray-600 cursor-pointer hover:underline" onClick={() => setFilter((prev) => ({ ...prev, PERIOD: [] }))}>
                        Effacer
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {filter?.PERIOD_PARENT === "VACANCES" ? (
                  <div className="flex flex-col gap-2 justify-center items-center mt-6">
                    <div className="flex flex-wrap gap-2 justify-center items-center">
                      <PeriodeItem
                        name={MISSION_PERIOD_DURING_HOLIDAYS.SUMMER}
                        onClick={handleToggleChangePeriod}
                        active={(filter?.PERIOD || []).includes(MISSION_PERIOD_DURING_HOLIDAYS.SUMMER)}
                      />
                      <PeriodeItem
                        name={MISSION_PERIOD_DURING_HOLIDAYS.AUTUMN}
                        onClick={handleToggleChangePeriod}
                        active={(filter?.PERIOD || []).includes(MISSION_PERIOD_DURING_HOLIDAYS.AUTUMN)}
                      />
                      <PeriodeItem
                        name={MISSION_PERIOD_DURING_HOLIDAYS.DECEMBER}
                        onClick={handleToggleChangePeriod}
                        active={(filter?.PERIOD || []).includes(MISSION_PERIOD_DURING_HOLIDAYS.DECEMBER)}
                      />
                      <PeriodeItem
                        name={MISSION_PERIOD_DURING_HOLIDAYS.WINTER}
                        onClick={handleToggleChangePeriod}
                        active={(filter?.PERIOD || []).includes(MISSION_PERIOD_DURING_HOLIDAYS.WINTER)}
                      />
                      <PeriodeItem
                        name={MISSION_PERIOD_DURING_HOLIDAYS.SPRING}
                        onClick={handleToggleChangePeriod}
                        active={(filter?.PERIOD || []).includes(MISSION_PERIOD_DURING_HOLIDAYS.SPRING)}
                      />
                    </div>
                    {filter?.PERIOD?.length ? (
                      <div className="text-xs text-gray-600 cursor-pointer hover:underline" onClick={() => setFilter((prev) => ({ ...prev, PERIOD: [] }))}>
                        Effacer
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {filter?.PERIOD_PARENT === "CUSTOM" ? (
                  <div className="flex flex-col gap-2 justify-center items-center mt-6">
                    <div className="flex flex-wrap gap-2 justify-center items-center">
                      <div className="flex items-center gap-2 border-[1px] rounded-lg  py-1 px-2">
                        <label className="text-left text-gray-500 w-full m-0">Du</label>
                        <input
                          required
                          type="date"
                          className="w-full bg-inherit cursor-pointer disabled:cursor-not-allowed"
                          value={filter?.FROM}
                          onChange={(e) => {
                            e.persist();
                            setFilter((prev) => ({ ...prev, FROM: e.target.value }));
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2 border-[1px] rounded-lg  py-1 px-2">
                        <label className="text-left text-gray-500 w-full m-0">Au</label>
                        <input
                          required
                          type="date"
                          className="w-full bg-inherit cursor-pointer disabled:cursor-not-allowed"
                          value={filter?.TO}
                          onChange={(e) => {
                            e.persist();
                            setFilter((prev) => ({ ...prev, TO: e.target.value }));
                          }}
                        />
                      </div>
                    </div>
                    {filter?.FROM || filter?.TO ? (
                      <div className="text-xs text-gray-600 cursor-pointer hover:underline" onClick={() => setFilter((prev) => ({ ...prev, TO: "", FROM: "" }))}>
                        Effacer
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
            {/* END MODAL CONTROL WHEN */}
          </div>
          <div className="flex justify-between gap-2 flex-wrap">
            <DomainFilter Icon={Sante} name="HEALTH" label="Santé" onClick={handleToggleChangeDomain} active={(filter?.DOMAINS || []).includes("HEALTH")} />
            <DomainFilter Icon={Solidarite} name="SOLIDARITY" label="Solidarité" onClick={handleToggleChangeDomain} active={(filter?.DOMAINS || []).includes("SOLIDARITY")} />
            <DomainFilter Icon={Citoyennete} name="CITIZENSHIP" label="Citoyenneté" onClick={handleToggleChangeDomain} active={(filter?.DOMAINS || []).includes("CITIZENSHIP")} />
            <DomainFilter Icon={Education} name="EDUCATION" label="Éducation" onClick={handleToggleChangeDomain} active={(filter?.DOMAINS || []).includes("EDUCATION")} />
            <DomainFilter Icon={Sport} name="SPORT" label="Sport" onClick={handleToggleChangeDomain} active={(filter?.DOMAINS || []).includes("SPORT")} />
            <DomainFilter
              Icon={DefenseEtMemoire}
              name="DEFENSE"
              label="Défense et mémoire"
              onClick={handleToggleChangeDomain}
              active={(filter?.DOMAINS || []).includes("DEFENSE")}
            />
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
        </div>
        {/* END CONTROL */}

        {filter?.LOCATION && (
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
                innerClass={{ pagination: "pagination", sortOptions: "sortOptions" }}
                dataField="created_at"
                renderResultStats={({ numberOfResults }) => {
                  return <div className="text-gray-700 my-3 text-sm w-28 basis-3/4">{`${numberOfResults} mission${numberOfResults > 1 ? "s" : ""}`}</div>;
                }}
                sortOptions={[
                  { label: "La plus récente", dataField: "createdAt.keyword", sortBy: "asc" },
                  { label: "La plus proche", dataField: "sort.keyword", sortBy: "asc" },
                  { label: "La plus longue", dataField: "duration.keyword", sortBy: "desc" },
                  { label: "La plus courte", dataField: "duration.keyword", sortBy: "asc" },
                ]}
                defaultSortOption="La plus proche"
                render={({ data }) => {
                  return data.map((e) => {
                    const tags = [];
                    e.city && tags.push(e.city + (e.zip ? ` - ${e.zip}` : ""));
                    // tags.push(e.remote ? "À distance" : "En présentiel");
                    e.domains.forEach((d) => tags.push(translate(d)));
                    return <CardMission key={e._id} mission={e} youngLocation={filter.LOCATION} />;
                  });
                }}
                renderNoResults={() => <div className="text-gray-700 mb-3 text-sm">Aucune mission ne correspond à votre recherche</div>}
              />
            </Missions>
          </ReactiveBase>
        )}
      </div>
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

const PeriodeTab = ({ Icon, name, label, onClick, active }) => {
  return (
    <div className="group flex flex-1 flex-col items-center justify-start space-y-2 cursor-pointer" onClick={() => onClick(name)}>
      {active ? (
        <div className="flex border-b-2 border-blue-600 pb-2 font-bold gap-2 items-center">
          {label}
          {Icon ? <Icon className="text-gray-500" /> : null}
        </div>
      ) : (
        <div className="flex pb-2 font-medium hover:border-b-2 hover:border-blue-600 gap-2 items-center">
          {label}
          {Icon ? <Icon className="text-gray-500" /> : null}
        </div>
      )}
    </div>
  );
};

const PeriodeItem = ({ name, onClick, active }) => {
  return active ? (
    <div
      className="group flex flex-col items-center justify-center cursor-pointer rounded-full py-1 px-4 border-[1px] text-blue-600 border-blue-600 hover:border-blue-500 text-xs"
      onClick={() => onClick(name)}>
      <div className="">{translate(name)}</div>
    </div>
  ) : (
    <div
      className="group flex flex-col items-center justify-center cursor-pointer rounded-full py-1 px-4 border-[1px] text-gray-700 border-gray-200 hover:border-gray-300 text-xs"
      onClick={() => onClick(name)}>
      <div className="">{translate(name)}</div>
    </div>
  );
};

const Missions = styled.div`
  font-family: "Marianne";
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
      background-image: url(${require("../../../../assets/left.svg")});
    }
    a:last-child {
      background-image: url(${require("../../../../assets/right.svg")});
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
