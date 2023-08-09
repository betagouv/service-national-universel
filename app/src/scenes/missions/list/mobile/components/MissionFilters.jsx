import React, { useEffect, useState } from "react";
import { MISSION_PERIOD_DURING_HOLIDAYS, MISSION_PERIOD_DURING_SCHOOL } from "../../../../../utils";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { capture } from "../../../../../sentry";
import API from "../../../../../services/api";
import { apiAdress } from "../../../../../services/api-adresse";

import Sante from "../../../../../assets/mission-domaines/sante";
import Solidarite from "../../../../../assets/mission-domaines/solidarite";
import Citoyennete from "../../../../../assets/mission-domaines/citoyennete";
import Education from "../../../../../assets/mission-domaines/education";
import Sport from "../../../../../assets/mission-domaines/sport";
import DefenseEtMemoire from "../../../../../assets/mission-domaines/defense-et-memoire";
import Environment from "../../../../../assets/mission-domaines/environment";
import Securite from "../../../../../assets/mission-domaines/securite";
import Culture from "../../../../../assets/mission-domaines/culture";
import PreparationMilitaire from "../../../../../assets/mission-domaines/preparation-militaire";

import AcademicCap from "../../../../../assets/icons/AcademicCap";
import Sun from "../../../../../assets/icons/Sun";
import Calendar from "../../../../../assets/icons/Calendar";
import Search from "../../../../../assets/icons/Search";
import DomainFilter from "./DomainFilter";
import PeriodeTab from "./PeriodeTab";
import PietonSvg from "../../../assets/Pieton";
import VeloSvg from "../../../assets/Velo";
import VoitureSvg from "../../../assets/Voiture";
import TrainSvg from "../../../assets/Train";
import FuseeSvg from "../../../assets/Fusee";

import { HiOutlineAdjustments, HiOutlineArrowNarrowRight } from "react-icons/hi";
import RadioInput from "../../../../../assets/radioInput.svg";
import RadioUnchecked from "../../../../../assets/radioUnchecked.svg";
import Select from "./Select.jsx";
import Toggle from "./Toggle";
import Modal from "../../../../../components/ui/modals/Modal";

export default function MissionFilters({ filters, setFilters }) {
  const young = useSelector((state) => state.Auth.young);

  const [referentManagerPhase2, setReferentManagerPhase2] = useState();
  const [dropdownControlDistanceOpen, setDropdownControlDistanceOpen] = React.useState(false);
  const [dropdownControlWhenOpen, setDropdownControlWhenOpen] = React.useState(false);
  const [focusedAddress, setFocusedAddress] = React.useState({ address: young?.address, zip: young?.zip });
  const [modalControl, setModalControl] = React.useState(false);
  const [keyWordOpen, setKeyWordOpen] = React.useState(false);
  const [keyWord, setKeyWord] = React.useState("");
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const refDropdownControlDistance = React.useRef(null);
  const refDropdownControlWhen = React.useRef(null);

  const DISTANCE_MAX = 100;
  const marginDistance = getMarginDistance(document.getElementById("distanceKm"));

  const handleToggleChangeDomain = (domain) => {
    setFilters((prev) => {
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
    setFilters((prev) => {
      const newFilter = { ...prev };
      if (newFilter?.subPeriod?.includes(period)) {
        newFilter.subPeriod = newFilter.subPeriod.filter((d) => d !== period);
      } else {
        newFilter.subPeriod = [...(newFilter.subPeriod || []), period];
      }
      return newFilter;
    });
  };

  useEffect(() => {
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

  useEffect(() => {
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

  useEffect(() => {
    (async () => {
      if (!young) return;
      const filterLocation = young?.location || (await getCoordinates({ q: young?.address, postcode: young?.zip }));
      setFilters({ ...filters, location: filterLocation });
    })();
    getManagerPhase2();
  }, [young]);

  useEffect(() => {
    if (!focusedAddress) return;
    (async () => {
      let location;
      location = await getCoordinates({ q: focusedAddress.address, postcode: focusedAddress.zip });
      if (location) setFilters((prev) => ({ ...prev, location }));
    })();
  }, [focusedAddress]);

  function getMarginDistance(ele) {
    if (ele) return Number((ele.scrollWidth + ((filters?.distance - DISTANCE_MAX) * ele.scrollWidth) / DISTANCE_MAX) * 0.92);
    return false;
  }

  const getLabelWhen = (when) => {
    switch (when) {
      case "DURING_SCHOOL":
        return "Période extra-scolaire";
      case "DURING_HOLIDAYS":
        return "Pendant les vacances";
      case "CUSTOM":
        return "Choisir une période";
      default:
        return "N'importe quand";
    }
  };

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

  const getManagerPhase2 = async () => {
    try {
      if (!young) return;
      const { ok, data } = await API.get(`/referent/manager_phase2/${young.department}`);
      if (ok) setReferentManagerPhase2(data);
    } catch (e) {
      capture(e);
    }
  };

  return (
    <>
      <div className=" mx-4 mb-3 flex items-center justify-between rounded-full border py-1  pl-2.5 pr-1">
        <input
          value={filters?.searchbar}
          onChange={(e) => {
            e.persist();
            setFilters((prev) => ({ ...prev, searchbar: e.target.value }));
          }}
          className="w-11/12 text-[11px] "
          type="text"
          placeholder="Mot clé • N'importe quand • Distance max 100km..."
        />
        <div className="flex h-10 w-10 rounded-full bg-blue-600 " onClick={() => setModalControl(true)}>
          <HiOutlineAdjustments className="m-auto text-white" />
        </div>
      </div>

      <div className="mb-1 w-full space-y-6 rounded-lg bg-white">
        <Modal isOpen={modalControl} onClose={() => setModalControl(false)} className="bg-gray-50 p-3">
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
                    <div className="text-md text-gray-500">{filters?.searchbar || "Aucun"}</div>
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
                          setFilters((prev) => ({ ...prev, searchbar: keyWord }));
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
                    <div className="text-md text-gray-500">{filters?.distance || 100}km max</div>
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
                            Il existe des offres de missions accessibles pour vous sous conditions partout en France, notamment certaines préparations militaires. Si vous souhaitez
                            connaitre ces offres et y accéder, contactez tout de suite votre référent phase 2 :
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
                        <Toggle toggled={filters.hebergement} onClick={() => setFilters((prev) => ({ ...prev, hebergement: !prev.hebergement }))} />
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
                          value={filters?.distance}
                          min="1"
                          max={DISTANCE_MAX}
                          step="1"
                          onChange={(e) => {
                            e.persist();
                            setFilters((prev) => ({ ...prev, distance: e.target.value }));
                          }}
                        />
                        <div className={`absolute  -mt-10 -ml-2 w-full  font-bold ${!marginDistance && " ml-1 flex justify-center"} `} style={{ left: `${marginDistance}px` }}>
                          {filters?.distance}km
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
                        <PeriodeTab label={getLabelWhen("")} active={!filters?.period} name="" onClick={() => setFilters((prev) => ({ ...prev, period: "" }))} />
                        <PeriodeTab
                          Icon={Calendar}
                          label={getLabelWhen("CUSTOM")}
                          active={filters?.period === "CUSTOM"}
                          name="CUSTOM"
                          onClick={() => setFilters((prev) => ({ ...prev, period: "CUSTOM" }))}
                        />
                        <PeriodeTab
                          Icon={AcademicCap}
                          label={getLabelWhen("DURING_SCHOOL")}
                          active={filters?.period === "DURING_SCHOOL"}
                          name="DURING_SCHOOL"
                          onClick={() => setFilters((prev) => ({ ...prev, period: "DURING_SCHOOL" }))}
                        />
                        <PeriodeTab
                          Icon={Sun}
                          label={getLabelWhen("DURING_HOLIDAYS")}
                          active={filters?.period === "DURING_HOLIDAYS"}
                          name="DURING_HOLIDAYS"
                          onClick={() => setFilters((prev) => ({ ...prev, period: "DURING_HOLIDAYS" }))}
                        />
                      </div>
                      {filters.period === "DURING_SCHOOL" ? (
                        <Select
                          placeholder={getLabelWhen("DURING_SCHOOL")}
                          options={MISSION_PERIOD_DURING_SCHOOL}
                          handleChangeValue={handleToggleChangePeriod}
                          value={filters.subPeriod}
                        />
                      ) : null}
                      {filters.period === "DURING_HOLIDAYS" ? (
                        <Select
                          placeholder={getLabelWhen("DURING_HOLIDAYS")}
                          options={MISSION_PERIOD_DURING_HOLIDAYS}
                          handleChangeValue={handleToggleChangePeriod}
                          value={filters.subPeriod}
                        />
                      ) : null}
                      {filters.period === "CUSTOM" ? (
                        <div className="mt-6 flex flex-col items-center justify-center gap-2">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <div className="flex items-center gap-2 rounded-lg border-[1px]  py-1 px-2">
                              <label className="m-0 w-full text-left text-gray-500">Du</label>
                              <input
                                required
                                type="date"
                                className="w-full cursor-pointer bg-inherit disabled:cursor-not-allowed"
                                value={filters?.fromDate}
                                onChange={(e) => {
                                  e.persist();
                                  setFilters((prev) => ({ ...prev, fromDate: e.target.value }));
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border-[1px]  py-1 px-2">
                              <label className="m-0 w-full text-left text-gray-500">Au</label>
                              <input
                                required
                                type="date"
                                className="w-full cursor-pointer bg-inherit disabled:cursor-not-allowed"
                                value={filters?.toDate}
                                onChange={(e) => {
                                  e.persist();
                                  setFilters((prev) => ({ ...prev, toDate: e.target.value }));
                                }}
                              />
                            </div>
                          </div>
                          {filters?.fromDate || filters?.toDate ? (
                            <div className="cursor-pointer text-xs text-gray-600 hover:underline" onClick={() => setFilters((prev) => ({ ...prev, toDate: "", fromDate: "" }))}>
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

        <div className="relative">
          <div className="flex gap-4 overflow-x-scroll px-4">
            <DomainFilter Icon={Sante} name="HEALTH" label="Santé" onClick={handleToggleChangeDomain} active={(filters?.DOMAINS || []).includes("HEALTH")} />
            <DomainFilter Icon={Solidarite} name="SOLIDARITY" label="Solidarité" onClick={handleToggleChangeDomain} active={(filters?.DOMAINS || []).includes("SOLIDARITY")} />
            <DomainFilter Icon={Citoyennete} name="CITIZENSHIP" label="Citoyenneté" onClick={handleToggleChangeDomain} active={(filters?.DOMAINS || []).includes("CITIZENSHIP")} />
            <DomainFilter Icon={Education} name="EDUCATION" label="Éducation" onClick={handleToggleChangeDomain} active={(filters?.DOMAINS || []).includes("EDUCATION")} />
            <DomainFilter Icon={Sport} name="SPORT" label="Sport" onClick={handleToggleChangeDomain} active={(filters?.DOMAINS || []).includes("SPORT")} />
            <DomainFilter
              Icon={DefenseEtMemoire}
              name="DEFENSE"
              label="Défense et mémoire"
              onClick={handleToggleChangeDomain}
              active={(filters?.DOMAINS || []).includes("DEFENSE")}
            />
            <DomainFilter Icon={Environment} name="ENVIRONMENT" label="Environment" onClick={handleToggleChangeDomain} active={(filters?.DOMAINS || []).includes("ENVIRONMENT")} />
            <DomainFilter Icon={Securite} name="SECURITY" label="Sécurité" onClick={handleToggleChangeDomain} active={(filters?.DOMAINS || []).includes("SECURITY")} />
            <DomainFilter Icon={Culture} name="CULTURE" label="Culture" onClick={handleToggleChangeDomain} active={(filters?.DOMAINS || []).includes("CULTURE")} />
            <DomainFilter
              Icon={PreparationMilitaire}
              label="Préparations militaires"
              active={filters?.isMilitaryPreparation === "true"}
              onClick={() =>
                setFilters((prev) => {
                  const newFilter = { ...prev };
                  if (newFilter?.isMilitaryPreparation === "true") newFilter.isMilitaryPreparation = "false";
                  else newFilter.isMilitaryPreparation = "true";
                  return newFilter;
                })
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}
