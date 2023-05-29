import Img3 from "../../../../assets/left.svg";
import Img2 from "../../../../assets/right.svg";
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
import { HiOutlineAdjustments, HiOutlineArrowNarrowRight } from "react-icons/hi";
import PietonSvg from "../../assets/Pieton";
import VeloSvg from "../../assets/Velo";
import VoitureSvg from "../../assets/Voiture";
import TrainSvg from "../../assets/Train";
import FuseeSvg from "../../assets/Fusee";
import { Modal } from "reactstrap";
import ChevronDown from "../../../../assets/icons/ChevronDown";
import { capture } from "../../../../../src/sentry";
import RadioInput from "../../../../assets/radioInput.svg";
import RadioUnchecked from "../../../../assets/radioUnchecked.svg";
import { apiAdress } from "../../../../services/api-adresse";

const FILTERS = ["DOMAINS", "SEARCH", "STATUS", "GEOLOC", "DATE", "PERIOD", "RELATIVE", "MILITARY_PREPARATION", "HEBERGEMENT"];

export default function List() {
  const young = useSelector((state) => state.Auth.young);
  const [filter, setFilter] = React.useState({ DOMAINS: [], DISTANCE: 50 });
  const [dropdownControlDistanceOpen, setDropdownControlDistanceOpen] = React.useState(false);
  const [dropdownControlWhenOpen, setDropdownControlWhenOpen] = React.useState(false);
  const [focusedAddress, setFocusedAddress] = React.useState({ address: young?.address, zip: young?.zip });
  const DISTANCE_MAX = 100;
  const refDropdownControlDistance = React.useRef(null);
  const refDropdownControlWhen = React.useRef(null);
  const [modalControl, setModalControl] = React.useState(false);
  const [keyWordOpen, setKeyWordOpen] = React.useState(false);
  const [keyWord, setKeyWord] = React.useState("");
  const [marginDistance, setMarginDistance] = useState();
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [referentManagerPhase2, setReferentManagerPhase2] = useState();
  const [hebergement, setHebergement] = React.useState(false);

  const callSingleAddressAPI = async (q, postcode) => {
    try {
      const res = await apiAdress(q, { postcode });
      return res?.features[0];
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const getCoordinates = async ({ q, postcode }) => {
    try {
      let adresse = await callSingleAddressAPI(q, postcode);
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
        return "Période extra-scolaire";
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
        if (ok) setReferentManagerPhase2(data);
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
      if (location) setFilter((prev) => ({ ...prev, LOCATION: location }));
    })();
  }, [focusedAddress]);

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

  React.useEffect(() => {
    setFilter((prev) => ({ ...prev, HEBERGEMENT: hebergement.toString() }));
  }, [hebergement]);

  const marginLeftDistance = (ele) => {
    if (ele) {
      return Number((ele.scrollWidth + ((filter?.DISTANCE - DISTANCE_MAX) * ele.scrollWidth) / DISTANCE_MAX) * 0.92);
    }
    return false;
  };

  useEffect(() => {
    const ele = document.getElementById("distanceKm");
    if (ele) {
      setMarginDistance(marginLeftDistance(ele));
    }
  }, [filter?.DISTANCE]);

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

        <div className=" mx-4 mb-3 flex items-center justify-between rounded-full border py-1  pl-2.5 pr-1">
          <input
            value={filter?.SEARCH}
            onChange={(e) => {
              e.persist();
              setFilter((prev) => ({ ...prev, SEARCH: e.target.value }));
            }}
            className="w-11/12 text-[11px] "
            type="text"
            placeholder="Mot clé • N'importe quand • Distance max 100km..."
          />
          <div className="flex h-10 w-10 rounded-full bg-blue-600 " onClick={() => setModalControl(true)}>
            <HiOutlineAdjustments className="m-auto text-white" />
          </div>
        </div>

        {/* BEGIN CONTROL */}
        <div className="mb-1 w-full space-y-6 rounded-lg bg-white">
          {/* BEGIN MODAL CONTROL*/}
          <Modal size={"20px"} isOpen={modalControl} toggle={setModalControl}>
            <div className="rounded-xl bg-gray-50 p-2">
              <div className="mb-3 ml-2 flex items-center justify-between">
                <div
                  className="text-xs text-gray-500"
                  onClick={() => {
                    setModalControl(false);
                    setShowMoreDetails(false);
                  }}>
                  Fermer
                </div>
                <div>Filtrez</div>
                <div
                  className="flex h-10 w-10 rounded-full bg-blue-600 "
                  onClick={() => {
                    setModalControl(false);
                  }}>
                  <Search className="m-auto  text-white " />
                </div>
              </div>
              <div className="flex flex-col space-y-5">
                <div className=" rounded-xl border bg-white py-3.5 pl-4 pr-4">
                  {!keyWordOpen && (
                    <div
                      className="flex justify-between "
                      onClick={() => {
                        setDropdownControlDistanceOpen(false);
                        setDropdownControlWhenOpen(false);
                        setKeyWordOpen(true);
                      }}>
                      <div className="font-bold">Mot clé</div>
                      <div className="text-md text-gray-500">{filter?.SEARCH || "Aucun"}</div>
                    </div>
                  )}
                  {keyWordOpen && (
                    <div>
                      <div className="text-center font-bold ">Mot clé</div>
                      <input
                        value={keyWord}
                        onChange={(e) => {
                          setKeyWord(e.target.value);
                        }}
                        className="my-3 w-full flex-1 rounded-md border border-gray-300 py-1.5  pl-3 text-sm text-gray-700 placeholder:text-gray-400"
                        type="text"
                        placeholder="Rechercher par mot clé..."
                      />
                      <div className="flex justify-end ">
                        <div
                          className="w-2/5 rounded-md bg-blue-600 p-2 text-center text-white "
                          onClick={() => {
                            setKeyWordOpen(!keyWordOpen);
                            setFilter((prev) => ({ ...prev, SEARCH: keyWord }));
                          }}>
                          Valider
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className=" rounded-xl border bg-white py-3.5 pl-4 pr-4"
                  onClick={() => {
                    setDropdownControlDistanceOpen(true);
                    setDropdownControlWhenOpen(false);
                    setKeyWordOpen(false);
                  }}>
                  {!dropdownControlDistanceOpen && (
                    <div className="flex justify-between">
                      <div className="font-bold">Distance maximum</div>
                      <div className="text-md text-gray-500">{filter?.DISTANCE || 100}km max</div>
                    </div>
                  )}
                  {dropdownControlDistanceOpen && (
                    <div>
                      <div className="mb-2 text-center font-bold ">Distance maximum</div>

                      <div className="text-center text-xs text-gray-500">
                        Vous ne voyez que les missions proposées à moins de 100 km du domicile que vous avez déclaré.{" "}
                        {showMoreDetails === false ? (
                          <button
                            className="text-blue-500"
                            onClick={() => {
                              setShowMoreDetails(true);
                            }}>
                            En savoir plus
                          </button>
                        ) : (
                          <>
                            <span>
                              Il existe des offres de missions accessibles pour vous sous conditions partout en France, notamment certaines préparations militaires. Si vous
                              souhaitez connaitre ces offres et y accéder, contactez tout de suite votre référent phase 2 :
                            </span>{" "}
                            <a href={`mailto:${referentManagerPhase2?.email}`}>{referentManagerPhase2?.email}</a>
                          </>
                        )}
                      </div>

                      <div className="flex w-full flex-col space-y-2 py-2 px-2">
                        <div className="my-3 flex justify-around">
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
                              <span className="text-xs leading-[15px] text-gray-700">Autour de mon adresse principale</span>
                              <br />
                              <span className="text-[13px] text-gray-700">{young.city}</span>
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
                                <span className="text-xs text-gray-700">Autour de l&apos;adresse d&apos; un proche</span>
                                <br />
                                <span className="text-[13px] text-gray-700">{young?.mobilityNearRelativeCity}</span>
                              </label>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input id="second-address" name="address" type="radio" value={young.city} disabled />
                              <label htmlFor="second-address">
                                <span className="text-xs text-gray-400">Autour de l&apos;adresse d&apos; un proche</span>
                                <br />
                                <Link to="/preferences" className="text-[13px] text-blue-600 underline hover:underline">
                                  Renseigner une adresse
                                </Link>
                              </label>
                            </div>
                          )}
                        </div>
                        <div className="mb-3 flex flex-row items-center justify-start">
                          <Toggle toggled={hebergement} onClick={() => setHebergement((old) => !old)} />
                          <div className="ml-4">
                            <div className="text-[12px]">Mission avec hébergement</div>
                            <div className="text-[13px]">Dans toute la France</div>
                          </div>
                        </div>
                        <div className="relative">
                          <input
                            id="distanceKm"
                            list="distance-list"
                            type="range"
                            className="h-2  w-full cursor-pointer appearance-none items-center rounded-full bg-gray-200"
                            value={filter?.DISTANCE}
                            min="1"
                            max={DISTANCE_MAX}
                            step="1"
                            onChange={(e) => {
                              e.persist();
                              setFilter((prev) => ({ ...prev, DISTANCE: e.target.value }));
                            }}
                          />
                          <div className={`absolute  -mt-10 -ml-2 w-full  font-bold ${!marginDistance && " ml-1 flex justify-center"} `} style={{ left: `${marginDistance}px` }}>
                            {filter?.DISTANCE}km
                          </div>
                        </div>
                        <div className="mt-2 flex w-full items-center justify-between px-[10px] text-gray-200">
                          <PietonSvg />
                          <VeloSvg />
                          <VoitureSvg />
                          <TrainSvg />
                          <FuseeSvg />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="rounded-xl border bg-white py-3.5 ">
                  {!dropdownControlWhenOpen && (
                    <div
                      className="flex justify-between px-4"
                      onClick={() => {
                        setDropdownControlDistanceOpen(false);
                        setDropdownControlWhenOpen(true);
                        setKeyWordOpen(false);
                      }}>
                      <div className="font-bold">Période</div>
                      <div className="text-md text-gray-500">N&apos;importe quand</div>
                    </div>
                  )}
                  {dropdownControlWhenOpen && (
                    <div>
                      <div className="text-center font-bold ">Période</div>
                      <div>
                        <div className="mt-3 flex flex-wrap text-sm">
                          <PeriodeTab
                            label={getLabelWhen("")}
                            active={!filter?.PERIOD_PARENT}
                            name=""
                            onClick={() => setFilter((prev) => ({ ...prev, PERIOD_PARENT: undefined }))}
                          />
                          <PeriodeTab
                            Icon={Calendar}
                            label={getLabelWhen("CUSTOM")}
                            active={filter?.PERIOD_PARENT === "CUSTOM"}
                            name="CUSTOM"
                            onClick={() => setFilter((prev) => ({ ...prev, PERIOD_PARENT: "CUSTOM" }))}
                          />
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
                        </div>
                        {filter?.PERIOD_PARENT === "SCOLAIRE" ? (
                          <Select
                            placeholder={getLabelWhen("SCOLAIRE")}
                            options={MISSION_PERIOD_DURING_SCHOOL}
                            handleChangeValue={handleToggleChangePeriod}
                            value={filter?.PERIOD}
                          />
                        ) : null}
                        {filter?.PERIOD_PARENT === "VACANCES" ? (
                          <Select
                            placeholder={getLabelWhen("VACANCES")}
                            options={MISSION_PERIOD_DURING_HOLIDAYS}
                            handleChangeValue={handleToggleChangePeriod}
                            value={filter?.PERIOD}
                          />
                        ) : null}
                        {filter?.PERIOD_PARENT === "CUSTOM" ? (
                          <div className="mt-6 flex flex-col items-center justify-center gap-2">
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              <div className="flex items-center gap-2 rounded-lg border-[1px]  py-1 px-2">
                                <label className="m-0 w-full text-left text-gray-500">Du</label>
                                <input
                                  required
                                  type="date"
                                  className="w-full cursor-pointer bg-inherit disabled:cursor-not-allowed"
                                  value={filter?.FROM}
                                  onChange={(e) => {
                                    e.persist();
                                    setFilter((prev) => ({ ...prev, FROM: e.target.value }));
                                  }}
                                />
                              </div>
                              <div className="flex items-center gap-2 rounded-lg border-[1px]  py-1 px-2">
                                <label className="m-0 w-full text-left text-gray-500">Au</label>
                                <input
                                  required
                                  type="date"
                                  className="w-full cursor-pointer bg-inherit disabled:cursor-not-allowed"
                                  value={filter?.TO}
                                  onChange={(e) => {
                                    e.persist();
                                    setFilter((prev) => ({ ...prev, TO: e.target.value }));
                                  }}
                                />
                              </div>
                            </div>
                            {filter?.FROM || filter?.TO ? (
                              <div className="cursor-pointer text-xs text-gray-600 hover:underline" onClick={() => setFilter((prev) => ({ ...prev, TO: "", FROM: "" }))}>
                                Effacer
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Link to="/preferences">
                <div className="mx-3 mt-4 flex items-center justify-between pb-20">
                  <div>
                    <div className="font-bold">Gagnez du temps</div>
                    <div className="text-xs text-gray-600">Renseignez vos préférences pour les prochaines fois</div>
                  </div>
                  <HiOutlineArrowNarrowRight className="w-5 text-gray-500" />
                </div>
              </Link>
            </div>
          </Modal>
          {/* END MODAL CONTROL*/}

          <div className="relative">
            <div className="flex gap-4 overflow-x-scroll px-4">
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
        </div>
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

const DomainFilter = ({ Icon, name, label, onClick, active }) => {
  return (
    <div className="flex basis-20 cursor-pointer flex-col items-center justify-start space-y-2" onClick={() => onClick(name)}>
      <div className={`${active ? "bg-[#212B44]" : "bg-gray-200"} flex h-9 w-9 items-center justify-center rounded-xl transition duration-200 ease-in`}>
        <Icon className="text-white" />
      </div>
      <div className="text-center text-xs text-gray-700">{label}</div>
    </div>
  );
};

const PeriodeTab = ({ Icon, name, label, onClick, active }) => {
  return (
    <div className="ml-2 mb-2" onClick={() => onClick(name)}>
      {active ? (
        <div className="flex cursor-pointer items-center justify-center rounded-full border-[1px]  border-blue-600 py-1 px-2 font-medium text-blue-600 hover:border-blue-500 ">
          {label}
          {Icon ? <Icon className="ml-1 text-gray-500" /> : null}
        </div>
      ) : (
        <div className="group flex cursor-pointer items-center justify-center rounded-full border-[1px] border-gray-200 py-1 px-2 font-medium text-gray-700 hover:border-gray-300">
          {label}
          {Icon ? <Icon className="ml-1 text-gray-500" /> : null}
        </div>
      )}
    </div>
  );
};

const Select = ({ value, options, handleChangeValue, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");

  const values = Object.values(options);

  useEffect(() => {
    let placeholderValue = "";
    values.forEach((option) => ((value || []).includes(option) ? (placeholderValue += ", " + translate(option)) : null));

    setSelected(placeholderValue === "" ? placeholder : placeholderValue.length <= 28 ? placeholderValue.slice(2) : placeholderValue.slice(2, 26) + "...");
  }, [value]);

  return (
    <div style={{ fontFamily: "Marianne" }} className="flex justify-center">
      {/* select item */}
      <div>
        <button
          className="flex min-w-[250px] cursor-pointer items-center justify-between gap-3 rounded-lg border-[1px] px-3 py-2 disabled:cursor-wait disabled:opacity-50"
          style={{ fontFamily: "Marianne" }}
          onClick={() => setOpen((e) => !e)}>
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-sm font-medium text-gray-700 ">{selected}</span>
          </div>
          <ChevronDown className="text-gray-400" />
        </button>

        {/* display options */}
        <div className=" relative flex h-0 flex-col justify-end">
          <div className={`${open ? "block" : "hidden"} border-3 absolute  left-0 right-0 bottom-11 z-50 overflow-hidden rounded-lg border-red-600 bg-white shadow transition `}>
            {values.map((option, index) => (
              <div key={index} className={`${(value || []).includes(option) && "bg-gray font-bold"}`}>
                <div
                  className="group flex  cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    handleChangeValue(option);
                  }}>
                  <input type="checkbox" className="rounded-xl" checked={(value || []).includes(option)} />
                  <div>{translate(option)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
const Toggle = ({ toggled, onClick }) => {
  return toggled ? (
    <div onClick={onClick} name="visibility" className={`flex h-6 w-10 cursor-pointer items-center rounded-full bg-blue-600 transition duration-100 ease-in`}>
      <div className="flex h-6 w-6 translate-x-[16px] items-center justify-center rounded-full border-[1px] border-blue-600 bg-white shadow-nina transition duration-100 ease-in"></div>
    </div>
  ) : (
    <div
      onClick={onClick}
      name="visibility"
      className={`flex h-6 w-10 cursor-pointer items-center rounded-full border-[1px] border-blue-600 bg-white transition duration-100 ease-in`}>
      <div className="flex h-6 w-6 translate-x-[-1px] items-center justify-center rounded-full border-[1px] border-blue-600 bg-white shadow-nina transition duration-100 ease-in"></div>
    </div>
  );
};
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

// const DistanceRange = styled.div`
//   input[type="range"]::-webkit-slider-thumb {
//     border-radius: 50%;
//     background: #4b5563;
//   }
// `;
