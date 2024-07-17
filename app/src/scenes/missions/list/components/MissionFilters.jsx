import React, { useEffect, useState } from "react";
import { MISSION_PERIOD_DURING_HOLIDAYS, MISSION_PERIOD_DURING_SCHOOL } from "../../../../utils";
import { Link } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { capture } from "../../../../sentry";
import API from "../../../../services/api";

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

import CloseSvg from "../../../../assets/Close";
import AcademicCap from "../../../../assets/icons/AcademicCap";
import Sun from "../../../../assets/icons/Sun";
import Calendar from "../../../../assets/icons/Calendar";
import Search from "../../../../assets/icons/Search";
import DomainFilter from "./DomainFilter";
import PeriodeTab from "./PeriodeTab";
import PeriodeItem from "./PeriodItem";
import PietonSvg from "../../assets/Pieton";
import VeloSvg from "../../assets/Velo";
import VoitureSvg from "../../assets/Voiture";
import TrainSvg from "../../assets/Train";
import FuseeSvg from "../../assets/Fusee";
import InfobulleIcon from "../../../../assets/infobulleIcon.svg";

import { HiOutlineAdjustments, HiOutlineArrowNarrowRight } from "react-icons/hi";
import RadioInput from "../../../../assets/radioInput.svg";
import RadioUnchecked from "../../../../assets/radioUnchecked.svg";
import Select from "./Select.jsx";
import Toggle from "./Toggle";
import Modal from "../../../../components/ui/modals/Modal";
import { useAddress } from "snu-lib";
import useAuth from "@/services/useAuth";
import { CityForm } from "@snu/ds/common";
import { useDebounce } from "@uidotdev/usehooks";

const useOutsideClick = (callback) => {
  const ref = React.useRef();

  React.useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && event.target.compareDocumentPosition(ref.current) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
        callback();
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [ref]);

  return ref;
};

function _location(results) {
  if (!results) {
    return undefined;
  }
  if (Array.isArray(results) && results.length > 0) {
    return results[0].location;
  }
  return undefined;
}

export default function MissionFilters({ filters, setFilters }) {
  const { young } = useAuth();
  const [cityFilter, setCityFilter] = useState({ zip: young.zip, city: young.city, location: young.location });
  const [query, setQuery] = useState("");
  const [referentManagerPhase2, setReferentManagerPhase2] = useState();
  const [dropdownControlDistanceOpen, setDropdownControlDistanceOpen] = React.useState(false);
  const [dropdownControlWhenOpen, setDropdownControlWhenOpen] = React.useState(false);
  const [modalControl, setModalControl] = React.useState(false);
  const [keyWordOpen, setKeyWordOpen] = React.useState(false);
  const [keyWord, setKeyWord] = React.useState("");
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const refDropdownControlDistance = useOutsideClick(() => setDropdownControlDistanceOpen(false));
  const refDropdownControlWhen = useOutsideClick(() => setDropdownControlWhenOpen(false));

  const updateAddressData = (address) => {
    setCityFilter(address);
    setFilters((prev) => ({ ...prev, location: address.location }));
  };

  const debouncedQuery = useDebounce(query, 300);
  const { results } = useAddress({ query: debouncedQuery, options: { limit: 10, type: "municipality" }, enabled: debouncedQuery.length > 2 });

  const DISTANCE_MAX = 100;
  const marginDistance = getMarginDistance(document.getElementById("distanceKm"));

  const handleToggleChangeDomain = (domain) => {
    setFilters((prev) => {
      const newFilter = { ...prev };
      if (filters.domains?.includes(domain)) {
        newFilter.domains = newFilter.domains.filter((d) => d !== domain);
      } else {
        newFilter.domains = [...(newFilter.domains || []), domain];
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
    if (!young) return;

    const getManagerPhase2 = async () => {
      try {
        const { ok, data } = await API.get(`/referent/manager_phase2/${young.department}`);
        if (ok) setReferentManagerPhase2(data);
      } catch (e) {
        capture(e);
      }
    };

    getManagerPhase2();
  }, [young]);

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

  return (
    <>
      {/* Mobile */}
      <div className="mx-auto space-y-4 my-4 md:hidden rounded-xl">
        <div className="max-w-3xl mx-auto flex bg-white items-center justify-between rounded-full border py-1 pl-2.5 pr-1">
          <input
            value={filters?.searchbar}
            onChange={(e) => {
              e.persist();
              setFilters((prev) => ({ ...prev, searchbar: e.target.value }));
            }}
            className="w-11/12 text-xs"
            type="text"
            placeholder="Mot clé • N'importe quand • Distance max 100km..."
          />
          <button className="flex h-10 w-10 rounded-full bg-blue-600" onClick={() => setModalControl(true)}>
            <HiOutlineAdjustments className="m-auto text-white" />
          </button>
        </div>

        <div className="relative">
          <div className="flex gap-4 mx-auto overflow-x-scroll md:justify-center mt-6">
            <DomainFilter Icon={Sante} name="HEALTH" label="Santé" onClick={handleToggleChangeDomain} active={(filters?.domains || []).includes("HEALTH")} />
            <DomainFilter Icon={Solidarite} name="SOLIDARITY" label="Solidarité" onClick={handleToggleChangeDomain} active={(filters?.domains || []).includes("SOLIDARITY")} />
            <DomainFilter Icon={Citoyennete} name="CITIZENSHIP" label="Citoyenneté" onClick={handleToggleChangeDomain} active={(filters?.domains || []).includes("CITIZENSHIP")} />
            <DomainFilter Icon={Education} name="EDUCATION" label="Éducation" onClick={handleToggleChangeDomain} active={(filters?.domains || []).includes("EDUCATION")} />
            <DomainFilter Icon={Sport} name="SPORT" label="Sport" onClick={handleToggleChangeDomain} active={(filters?.domains || []).includes("SPORT")} />
            <DomainFilter
              Icon={DefenseEtMemoire}
              name="DEFENSE"
              label="Défense et mémoire"
              onClick={handleToggleChangeDomain}
              active={(filters?.domains || []).includes("DEFENSE")}
            />
            <DomainFilter Icon={Environment} name="ENVIRONMENT" label="Environment" onClick={handleToggleChangeDomain} active={(filters?.domains || []).includes("ENVIRONMENT")} />
            <DomainFilter Icon={Securite} name="SECURITY" label="Sécurité" onClick={handleToggleChangeDomain} active={(filters?.domains || []).includes("SECURITY")} />
            <DomainFilter Icon={Culture} name="CULTURE" label="Culture" onClick={handleToggleChangeDomain} active={(filters?.domains || []).includes("CULTURE")} />
            <DomainFilter
              Icon={PreparationMilitaire}
              label="Préparations militaires"
              active={filters?.isMilitaryPreparation}
              onClick={() => setFilters((prev) => ({ ...prev, isMilitaryPreparation: !prev.isMilitaryPreparation }))}
            />
          </div>
        </div>

        <Modal isOpen={modalControl} onClose={() => setModalControl(false)} className="bg-gray-50 p-3 md:w-[40rem]">
          {/* Header */}
          <div className="rounded-xl bg-gray-50 p-2">
            <div className="mb-3 ml-2 flex items-center justify-between">
              <button
                className="text-xs py-2 text-gray-500"
                onClick={() => {
                  setModalControl(false);
                  setShowMoreDetails(false);
                }}>
                Fermer
              </button>
              <div>Filtrez</div>
              <button
                className="flex h-10 w-10 rounded-full bg-blue-600 "
                onClick={() => {
                  setModalControl(false);
                }}>
                <Search className="m-auto  text-white " />
              </button>
            </div>

            {/* Form */}
            <div className="flex flex-col space-y-5">
              {/* Keyword */}
              <div className="rounded-xl border bg-white py-3.5 px-4">
                {!keyWordOpen && (
                  <button
                    className="w-full flex justify-between"
                    onClick={() => {
                      setDropdownControlDistanceOpen(false);
                      setDropdownControlWhenOpen(false);
                      setKeyWordOpen(true);
                    }}>
                    <div className="font-bold">Mot clé</div>
                    <div className="text-md text-gray-500">{filters?.searchbar || "Aucun"}</div>
                  </button>
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

              {/* Distance */}
              <div className="rounded-xl border bg-white py-3.5 px-4">
                {!dropdownControlDistanceOpen && (
                  <button
                    onClick={() => {
                      setDropdownControlDistanceOpen(true);
                      setDropdownControlWhenOpen(false);
                      setKeyWordOpen(false);
                    }}
                    className="w-full flex justify-between">
                    <div className="font-bold">Distance maximum</div>
                    <div className="text-md text-gray-500">{filters?.distance || 100}km max</div>
                  </button>
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
                        <CityForm data={cityFilter} updateData={updateAddressData} query={query} setQuery={setQuery} options={results} />
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
                        <div className={`absolute -mt-10 -ml-2 font-bold ${!marginDistance && "ml-1 flex justify-center"} `} style={{ left: `${marginDistance}px` }}>
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

              {/* When */}
              <div className="rounded-xl border bg-white py-3.5 ">
                {!dropdownControlWhenOpen && (
                  <button
                    className="w-full flex justify-between px-4"
                    onClick={() => {
                      setDropdownControlDistanceOpen(false);
                      setDropdownControlWhenOpen(true);
                      setKeyWordOpen(false);
                    }}>
                    <div className="font-bold">Période</div>
                    <div className="text-md text-gray-500">{getLabelWhen(filters.period)}</div>
                  </button>
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

            {/* Footer */}
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
      </div>

      {/* Desktop */}
      <div className="hidden md:block my-4 space-y-6 rounded-xl p-10">
        {/* search bar */}
        <div className="relative flex flex-col justify-center">
          <div className="flex pl-8 pr-8 mb-2 w-full items-center overflow-hidden rounded-full border-[1px] border-gray-300 bg-white  p-1.5">
            <input
              value={filters.searchbar}
              onChange={(e) => {
                e.persist();
                setFilters((prev) => ({ ...prev, searchbar: e.target.value }));
              }}
              className="w-full flex-1 p-1 px-3 text-sm text-gray-700 placeholder:text-gray-400"
              type="text"
              placeholder="Rechercher une mission..."
            />
            <div
              // className="flex w-full flex-1 cursor-pointer items-center border-l-[1px] border-gray-300 p-1 px-3 text-sm text-gray-700 placeholder:text-gray-400"
              className={`flex ${
                dropdownControlDistanceOpen ? "text-blue-600" : "text-gray-700"
              } w-full flex-1 cursor-pointer items-center border-l-[1px] border-gray-300 p-1 px-3 text-sm  placeholder:text-gray-400`}
              onClick={() => {
                setDropdownControlDistanceOpen((e) => !e);
                setDropdownControlWhenOpen(false);
              }}>
              Distance max. {filters.distance}km
            </div>
            <div
              className={`flex ${
                dropdownControlWhenOpen ? "text-blue-600" : "text-gray-700"
              } w-full flex-1 cursor-pointer items-center border-l-[1px] border-gray-300 p-1 px-3 text-sm placeholder:text-gray-400`}
              onClick={() => {
                setDropdownControlWhenOpen((e) => !e);
                setDropdownControlDistanceOpen(false);
              }}>
              {getLabelWhen(filters.period)}
            </div>
          </div>
          {/* BEGIN MODAL CONTROL DISTANCE */}
          <div
            ref={refDropdownControlDistance}
            className={`${
              dropdownControlDistanceOpen ? "max-h-96" : "max-h-0 overflow-hidden"
            } h-auto w-full relative rounded-2xl bg-white transition-maxHeight duration-200 ease-in-out`}>
            <div className="flex items-center pt-2 justify-center">
              <CloseSvg className="absolute right-4 top-4 cursor-pointer" height={10} width={10} onClick={() => setDropdownControlDistanceOpen(false)} />
            </div>
            <div className="flex w-full flex-col space-y-2 py-2 px-4">
              <div className="my-3 flex flex-row justify-around">
                <div className="flex w-1/2 flex-col items-center justify-center">
                  <CityForm data={cityFilter} updateData={updateAddressData} query={query} setQuery={setQuery} options={results} />
                </div>
                <div className="flex w-1/2 flex-col items-center justify-center">
                  <div className="flex  flex-row items-center justify-center">
                    <Toggle toggled={filters.hebergement} onClick={() => setFilters((prev) => ({ ...prev, hebergement: !prev.hebergement }))} />
                    <div className="ml-4">
                      <div className="text-[13px]">Mission avec hébergement</div>
                      <div className="text-[15px]">Dans toute la France</div>
                    </div>
                    <div className="pl-4">
                      <img src={InfobulleIcon} data-tip data-for="info" />
                      <ReactTooltip clickable={true} id="info" className="w-[527px] bg-white opacity-100 shadow-xl" arrowColor="white">
                        <div className="mb-2 text-left text-[15px] text-[#414458]">Visibilité des missions</div>
                        <div className="text-left text-[12px] bg-white text-[#83869A]">
                          Vous ne voyez que les missions proposées à moins de 100 km du domicile que vous avez déclaré. Il existe des offres de missions accessibles pour vous sous
                          conditions partout en France, notamment certaines préparations militaires. Si vous souhaitez connaître ces offres et y accéder, contactez tout de suite
                          votre référent phase 2 : <a href={`mailto:${referentManagerPhase2?.email}`}>{referentManagerPhase2?.email}</a>
                        </div>
                      </ReactTooltip>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <input
                  list="distance-list"
                  type="range"
                  className="distanceKm h-2 w-full cursor-pointer appearance-none items-center  rounded-full bg-gray-200"
                  min="1"
                  max={DISTANCE_MAX}
                  step="1"
                  onChange={(e) => {
                    e.persist();
                    setFilters((prev) => ({ ...prev, distance: e.target.value }));
                  }}
                />
                <div className={`absolute -ml-2 -mt-10 w-full font-bold ${!marginDistance && " ml-1 flex justify-center"} `} style={{ left: `${marginDistance}px` }}>
                  {filters.distance}km
                </div>
              </div>
              <div className="mt-4 flex w-full items-center justify-between px-[10px] text-gray-200">
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
              dropdownControlWhenOpen ? "max-h-62" : "max-h-0"
            } h-auto w-full relative overflow-hidden rounded-2xl bg-white transition-maxHeight duration-200 ease-in-out`}>
            <CloseSvg className="absolute right-4 top-4 cursor-pointer" height={10} width={10} onClick={() => setDropdownControlWhenOpen(false)} />
            <div className="flex w-full flex-col pt-2 pb-4 px-4">
              <div className="mt-4 flex w-full justify-center gap-2 px-[10px] text-sm font-medium text-gray-700">
                <PeriodeTab label={getLabelWhen("")} active={!filters.period} name="" onClick={() => setFilters((prev) => ({ ...prev, period: undefined }))} />
                <PeriodeTab
                  Icon={AcademicCap}
                  label={getLabelWhen("DURING_SCHOOL")}
                  active={filters.period === "DURING_SCHOOL"}
                  name="DURING_SCHOOL"
                  onClick={() => setFilters((prev) => ({ ...prev, period: "DURING_SCHOOL" }))}
                />
                <PeriodeTab
                  Icon={Sun}
                  label={getLabelWhen("DURING_HOLIDAYS")}
                  active={filters.period === "DURING_HOLIDAYS"}
                  name="DURING_HOLIDAYS"
                  onClick={() => setFilters((prev) => ({ ...prev, period: "DURING_HOLIDAYS" }))}
                />
                <PeriodeTab
                  Icon={Calendar}
                  label={getLabelWhen("CUSTOM")}
                  active={filters.period === "CUSTOM"}
                  name="CUSTOM"
                  onClick={() => setFilters((prev) => ({ ...prev, period: "CUSTOM" }))}
                />
              </div>
              {filters.period === "DURING_SCHOOL" ? (
                <div className="mt-6 flex flex-col items-center justify-center gap-2">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <PeriodeItem
                      name={MISSION_PERIOD_DURING_SCHOOL.EVENING}
                      onClick={handleToggleChangePeriod}
                      active={filters.subPeriod.includes(MISSION_PERIOD_DURING_SCHOOL.EVENING)}
                    />
                    <PeriodeItem
                      name={MISSION_PERIOD_DURING_SCHOOL.END_DAY}
                      onClick={handleToggleChangePeriod}
                      active={filters.subPeriod.includes(MISSION_PERIOD_DURING_SCHOOL.END_DAY)}
                    />
                    <PeriodeItem
                      name={MISSION_PERIOD_DURING_SCHOOL.WEEKEND}
                      onClick={handleToggleChangePeriod}
                      active={filters.subPeriod.includes(MISSION_PERIOD_DURING_SCHOOL.WEEKEND)}
                    />
                  </div>
                  {filters.subPeriod.length ? (
                    <div className="cursor-pointer text-xs text-gray-600 hover:underline" onClick={() => setFilters((prev) => ({ ...prev, subPeriod: [] }))}>
                      Effacer
                    </div>
                  ) : null}
                </div>
              ) : null}
              {filters.period === "DURING_HOLIDAYS" ? (
                <div className="mt-6 flex flex-col items-center justify-center gap-2">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <PeriodeItem
                      name={MISSION_PERIOD_DURING_HOLIDAYS.SUMMER}
                      onClick={handleToggleChangePeriod}
                      active={filters.subPeriod.includes(MISSION_PERIOD_DURING_HOLIDAYS.SUMMER)}
                    />
                    <PeriodeItem
                      name={MISSION_PERIOD_DURING_HOLIDAYS.AUTUMN}
                      onClick={handleToggleChangePeriod}
                      active={filters.subPeriod.includes(MISSION_PERIOD_DURING_HOLIDAYS.AUTUMN)}
                    />
                    <PeriodeItem
                      name={MISSION_PERIOD_DURING_HOLIDAYS.DECEMBER}
                      onClick={handleToggleChangePeriod}
                      active={filters.subPeriod.includes(MISSION_PERIOD_DURING_HOLIDAYS.DECEMBER)}
                    />
                    <PeriodeItem
                      name={MISSION_PERIOD_DURING_HOLIDAYS.WINTER}
                      onClick={handleToggleChangePeriod}
                      active={filters.subPeriod.includes(MISSION_PERIOD_DURING_HOLIDAYS.WINTER)}
                    />
                    <PeriodeItem
                      name={MISSION_PERIOD_DURING_HOLIDAYS.SPRING}
                      onClick={handleToggleChangePeriod}
                      active={filters.subPeriod.includes(MISSION_PERIOD_DURING_HOLIDAYS.SPRING)}
                    />
                  </div>
                  {filters.subPeriod.length ? (
                    <div className="cursor-pointer text-xs text-gray-600 hover:underline" onClick={() => setFilters((prev) => ({ ...prev, subPeriod: [] }))}>
                      Effacer
                    </div>
                  ) : null}
                </div>
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
                        value={filters.fromDate}
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
                        value={filters.toDate}
                        onChange={(e) => {
                          e.persist();
                          setFilters((prev) => ({ ...prev, toDate: e.target.value }));
                        }}
                      />
                    </div>
                  </div>
                  {filters.fromDate || filters.toDate ? (
                    <div className="cursor-pointer text-xs text-gray-600 hover:underline" onClick={() => setFilters((prev) => ({ ...prev, fromDate: "", toDate: "" }))}>
                      Effacer
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          {/* END MODAL CONTROL WHEN */}
        </div>
        <div className="flex flex-wrap justify-start xl:justify-between gap-2">
          <DomainFilter Icon={Sante} name="HEALTH" label="Santé" onClick={handleToggleChangeDomain} active={filters.domains.includes("HEALTH")} />
          <DomainFilter Icon={Solidarite} name="SOLIDARITY" label="Solidarité" onClick={handleToggleChangeDomain} active={filters.domains.includes("SOLIDARITY")} />
          <DomainFilter Icon={Citoyennete} name="CITIZENSHIP" label="Citoyenneté" onClick={handleToggleChangeDomain} active={filters.domains.includes("CITIZENSHIP")} />
          <DomainFilter Icon={Education} name="EDUCATION" label="Éducation" onClick={handleToggleChangeDomain} active={filters.domains.includes("EDUCATION")} />
          <DomainFilter Icon={Sport} name="SPORT" label="Sport" onClick={handleToggleChangeDomain} active={filters.domains.includes("SPORT")} />
          <DomainFilter Icon={DefenseEtMemoire} name="DEFENSE" label="Défense et mémoire" onClick={handleToggleChangeDomain} active={filters.domains.includes("DEFENSE")} />
          <DomainFilter Icon={Environment} name="ENVIRONMENT" label="Environment" onClick={handleToggleChangeDomain} active={filters.domains.includes("ENVIRONMENT")} />
          <DomainFilter Icon={Securite} name="SECURITY" label="Sécurité" onClick={handleToggleChangeDomain} active={filters.domains.includes("SECURITY")} />
          <DomainFilter Icon={Culture} name="CULTURE" label="Culture" onClick={handleToggleChangeDomain} active={filters.domains.includes("CULTURE")} />
          {young?.frenchNationality === "true" && (
            <DomainFilter
              Icon={PreparationMilitaire}
              label="Préparations militaires"
              active={filters.isMilitaryPreparation}
              onClick={() => setFilters((prev) => ({ ...prev, isMilitaryPreparation: !prev.isMilitaryPreparation }))}
            />
          )}
        </div>
      </div>
    </>
  );
}
