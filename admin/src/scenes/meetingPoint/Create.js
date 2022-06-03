import { DataSearch, ReactiveBase } from "@appbaseio/reactivesearch";
import React, { useState } from "react";
import { BiHandicap } from "react-icons/bi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import ArrowCircleRight from "../../assets/icons/ArrowCircleRight";
import BusSvg from "../../assets/icons/Bus";
import Plus from "../../assets/icons/Plus";
import Pencil from "../../assets/icons/Pencil";
import Breadcrumbs from "../../components/Breadcrumbs";
import { BottomResultStats, Filter2, ResultTable, Table } from "../../components/list";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import { apiURL } from "../../config";
import api from "../../services/api";
import { canCreateMeetingPoint, getResultLabel, departmentList, department2region, getDepartmentNumber } from "../../utils";
import { SelectDate } from "./components/modalEditMeetingPoint";

const FILTERS_BUS = ["SEARCH"];
const FILTERS_CENTER = ["SEARCH"];

export default function Create() {
  const [bus, setBus] = useState();
  const [center, setCenter] = useState();
  const [occupationPercentage, setOccupationPercentage] = React.useState();
  const user = useSelector((state) => state.Auth.user);
  const [searchedValueCenter, setSearchedValueCenter] = useState("");
  const [searchedValueBus, setSearchedValueBus] = useState("");
  const [data, setData] = useState({});
  const [loading, setLoading] = React.useState(false);
  const [year, setYear] = React.useState("2022");

  const urlParams = new URLSearchParams(window.location.search);
  const bus_id = urlParams.get("bus_id");
  const center_id = urlParams.get("center_id");

  const getDefaultQueryBus = () => ({
    query: {
      bool: {
        // filter: [{ term: { "cohorts.keyword": bus.cohort } }],
      },
    },
  });

  const getDefaultQueryCenter = () => ({
    query: {
      bool: {
        filter: [{ term: { "cohorts.keyword": bus.cohort } }],
      },
    },
  });

  React.useEffect(() => {
    if (!bus_id) return;
    (async () => {
      const { data, ok } = await api.get(`/bus/${bus_id}`);
      if (!ok) return;
      setBus(data);
      setData((prev) => ({ ...prev, busId: data._id.toString(), busExcelId: data.idExcel }));
    })();
  }, [bus_id]);

  React.useEffect(() => {
    if (!center_id) return;
    (async () => {
      const { data, ok } = await api.get(`/cohesion-center/${center_id}`);
      if (!ok) return;
      setCenter(data);
      setData((prev) => ({ ...prev, centerId: data._id.toString(), centerCode: data.code2022 }));
    })();
  }, [center_id]);

  React.useEffect(() => {
    if (!bus) return;
    const occupation = bus.capacity ? (((bus.capacity - bus.placesLeft) * 100) / bus.capacity).toFixed(2) : 0;
    setOccupationPercentage(occupation);
    if (!center?.cohorts?.includes(bus.cohort)) setCenter(null);
  }, [bus]);

  React.useEffect(() => {
    if (!data.departureDepartment) return setData((prev) => ({ ...prev, departureRegion: "" }));
    setData((prev) => ({ ...prev, departureRegion: department2region[data.departureDepartment] }));
  }, [data.departureDepartment]);

  // todo: degage si t'as pas le droit
  if (!canCreateMeetingPoint(user)) return null;

  const handleClickCenter = (hit) => {
    setCenter(hit);
    setSearchedValueCenter(null);
    setData((prev) => ({ ...prev, centerId: hit._id.toString(), centerCode: hit.code2022 }));
  };

  const handleClickTransport = (hit) => {
    setBus(hit);
    setSearchedValueBus(null);
    setData((prev) => ({ ...prev, busId: hit._id.toString(), busExcelId: hit.idExcel }));
  };

  const submit = () => {
    // todo : post meetingPoint
    setLoading(true);
    console.log(data);
    // wait 2 seconds
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const meetingPointIsComplete = () => {
    console.log({
      departureAddress: data.departureAddress,
      departureDepartment: data.departureDepartment,
      departureAt: data.departureAt,
      returnAt: data.returnAt,
      busId: data.busId,
      busExcelId: data.busExcelId,
      centerId: data.centerId,
      centerCode: data.centerCode,
    });
    return data.departureAddress && data.departureDepartment && data.departureAt && data.returnAt && data.busId && data.busExcelId && data.centerId && data.centerCode;
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Points de rassemblement", to: `/point-de-rassemblement` }, { label: "Création d'un nouveau point de rassemblement" }]} />
      <div className="m-9">
        <div className="flex flex-row items-center justify-between mb-4">
          <div className="flex flex-row items-center">
            <BusSvg className="h-10 w-10 text-gray-400" />
            <div className="font-bold text-2xl ml-4">Nouveau point de rassemblement</div>
          </div>
          <div>
            {loading ? (
              <button disabled className="font-bold py-2 px-4 rounded disabled:bg-gray-300 disabled:text-gray-100 disabled:cursor-wait">
                Chargement...
              </button>
            ) : (
              <button
                disabled={!meetingPointIsComplete()}
                className="bg-blue-500 hover:bg-blue-700 text-[#ffffff] font-bold py-2 px-4 rounded disabled:bg-gray-300 disabled:text-gray-100 disabled:cursor-not-allowed"
                onClick={submit}>
                Créer le point de rassemblement
              </button>
            )}
          </div>
        </div>
        <div className="space-y-8">
          <div className="flex flex-row justify-center items-center">
            <div className="flex flex-col w-3/5 bg-white rounded-xl p-9 self-stretch">
              <div className="flex justify-between">
                <h4>
                  <strong>Choix du transport</strong>
                </h4>
                <Link to="/point-de-rassemblement/nouveau-transport">
                  <div className="group flex gap-1 rounded-[10px] border-[1px] border-blue-600 py-2.5 px-3 items-center hover:bg-blue-600 hover:text-gray-800 cursor-pointer">
                    <Plus className="text-blue-600 group-hover:text-white" />
                    <div className="text-blue-600 group-hover:text-white text-sm flex-1 leading-4">Créer un transport</div>
                  </div>
                </Link>
              </div>
              <div className="flex mt-4">
                <>
                  <ReactiveBase url={`${apiURL}/es`} app="bus" headers={{ Authorization: `JWT ${api.getToken()}` }}>
                    <div style={{ flex: 2, position: "relative" }}>
                      <Filter2>
                        <DataSearch
                          showIcon={false}
                          placeholder="Rechercher..."
                          componentId="SEARCH"
                          dataField={["idExcel", "cohort"]}
                          react={{ and: FILTERS_BUS.filter((e) => e !== "SEARCH") }}
                          style={{ flex: 2 }}
                          innerClass={{ input: "searchbox" }}
                          autosuggest={false}
                          queryFormat="and"
                          onValueChange={setSearchedValueBus}
                        />
                      </Filter2>
                      <ResultTable hide={!searchedValueBus}>
                        <ReactiveListComponent
                          URLParams={false}
                          defaultQuery={getDefaultQueryBus}
                          scrollOnChange={false}
                          react={{ and: FILTERS_BUS }}
                          paginationAt="bottom"
                          size={10}
                          renderResultStats={(e) => {
                            return (
                              <div>
                                <BottomResultStats>{getResultLabel(e, 3)}</BottomResultStats>
                              </div>
                            );
                          }}
                          render={({ data }) => (
                            <Table>
                              <thead>
                                <tr>
                                  <th className="w-[38%]">Nº</th>
                                  <th className="w-[38%]">capacité</th>
                                  <th className="w-1/4">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.map((hit, i) => (
                                  <HitTransport key={i} hit={hit} onSend={() => handleClickTransport(hit)} />
                                ))}
                              </tbody>
                            </Table>
                          )}
                        />
                      </ResultTable>
                    </div>
                  </ReactiveBase>
                </>
              </div>
            </div>
          </div>
          {!bus ? null : (
            <div className="flex flex-row  justify-center gap-4 items-center">
              <div className="flex flex-col w-2/5 bg-white rounded-xl p-9 self-stretch">
                <div className="flex justify-between">
                  <h4>
                    <strong>Point de rassemblement</strong>
                  </h4>
                </div>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col justify-center border-[1px] border-gray-300 w-2/3 px-3 py-2 rounded-lg mt-3">
                    {data?.departureAddress ? <div className="text-xs leading-4 font-normal text-gray-500">Adresse</div> : null}
                    <input
                      className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500"
                      placeholder="Adresse"
                      type="text"
                      onChange={(e) => {
                        e.persist();
                        setData((prev) => ({ ...prev, departureAddress: e.target.value }));
                      }}
                    />
                  </div>
                  <Select value={data?.departureDepartment} options={departmentList.sort()} name="departureDepartment" onChange={setData} placeholder="Département" />
                  {/* {data?.departureRegion ? (
                    <Select value={data?.departureRegion} options={regionList.sort()} name="departureRegion" onChange={setData} placeholder="Région" disabled />
                  ) : null} */}
                  <div className="flex flex-1 py-1 px-2 justify-start items-center gap-2">
                    <input
                      type="checkbox"
                      id="hideDepartmentInConvocation"
                      name="hideDepartmentInConvocation"
                      className="cursor-pointer"
                      checked={data.hideDepartmentInConvocation === "true"}
                      value={data?.hideDepartmentInConvocation}
                      onChange={(e) => setData({ ...data, hideDepartmentInConvocation: e.target.checked ? "true" : "false" })}
                    />
                    <label className="flex-1 mb-0 cursor-pointer" htmlFor="hideDepartmentInConvocation">
                      Ne pas afficher le département sur le compte volontaire
                    </label>
                  </div>
                  {data?.hideDepartmentInConvocation === "true" ? (
                    <div className="flex gap-2 bg-blue-50 rounded-lg p-2 text-blue-700">
                      Le département ne sera pas visible sur le compte des volontaires.
                      <br />
                      Merci de rendre l&apos;adresse postale la plus explicite possible.
                    </div>
                  ) : null}
                  <div className={`flex flex-1 flex-col border-[1px] rounded-lg py-1 px-2 ${loading && "bg-gray-200"}`}>
                    <label htmlFor="departureAt" className="w-full m-0 text-left text-gray-500">
                      Date et heure de rendez-vous aller
                    </label>
                    {SelectDate({
                      date: data.departureAt,
                      year,
                      handleChange: (e) => setData({ ...data, departureAt: { ...data.departureAt, [e.target.name]: e.target.value } }),
                    })}
                  </div>
                  <div className={`flex flex-1 flex-col border-[1px] rounded-lg py-1 px-2 ${loading && "bg-gray-200"}`}>
                    <label htmlFor="returnAt" className="w-full m-0 text-left text-gray-500">
                      Date et heure de rendez-vous retour
                    </label>
                    {SelectDate({
                      date: data.returnAt,
                      year,
                      handleChange: (e) => setData({ ...data, returnAt: { ...data.returnAt, [e.target.name]: e.target.value } }),
                    })}
                  </div>
                  <div className="flex flex-col justify-center border-[1px] border-gray-300 bg-gray-100 w-2/3 px-3 py-2 rounded-lg mt-3">
                    {bus?.idExcel ? <div className="text-xs leading-4 font-normal text-gray-500">Nº du transport</div> : null}
                    <input disabled className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500" placeholder="Nº du transport" type="text" value={bus?.idExcel} />
                  </div>
                  <div className="flex flex-col justify-center border-[1px] border-gray-300 bg-gray-100 w-2/3 px-3 py-2 rounded-lg mt-3">
                    {bus?.capacity ? <div className="text-xs leading-4 font-normal text-gray-500">Capacité du transport</div> : null}
                    <input
                      disabled
                      className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500"
                      placeholder="Capacité du transport"
                      type="text"
                      value={bus?.capacity}
                    />
                  </div>
                </div>
              </div>
              <ArrowCircleRight className="w-10 h-10 text-gray-500" />
              <div className="flex flex-col w-2/5 bg-white rounded-xl p-9 self-stretch">
                <div className="flex justify-between ">
                  <h4>
                    <strong>Informations du centre</strong>
                  </h4>
                  {center?.pmr === "true" ? (
                    <div className="flex bg-[#14B8A6] rounded-full px-3 py-1 items-center text-[#F0FDFA] text-md gap-1">
                      <BiHandicap size={20} />
                      <div>Accessible&nbsp;PMR</div>
                    </div>
                  ) : null}
                </div>
                <div>
                  {center ? (
                    <div>
                      <Donnee title={"Nom du centre"} value={center.name} number={""} />
                      <Donnee title={"Code 2022"} value={center.code2022 || <span className="italic text-gray-500">Non renseigné</span>} number={""} />
                      <Donnee title={"Région"} value={center.region} number={""} />
                      <Donnee title={"Département"} value={center.department} number={`(${getDepartmentNumber(center.department)})`} />
                      <Donnee title={"Ville"} value={center.city} number={`(${center.zip})`} />
                      <Donnee title={"Adresse"} value={center.address} number={""} />
                      <div className="flex flex-col items-center mt-8">
                        <div
                          className="group flex gap-1 rounded-[10px] border-[1px] border-blue-600 py-2.5 px-3 items-center hover:bg-blue-600 hover:text-gray-800 cursor-pointer"
                          onClick={() => setCenter(null)}>
                          <Pencil className="text-blue-600 group-hover:text-white text-sm" />
                          <div className="text-blue-600 group-hover:text-white text-sm flex-1 leading-4">Changer de centre</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex mt-4">
                      <>
                        <ReactiveBase url={`${apiURL}/es`} app="edit-cohesioncenter" headers={{ Authorization: `JWT ${api.getToken()}` }}>
                          <div style={{ flex: 2, position: "relative" }}>
                            <Filter2>
                              <DataSearch
                                showIcon={false}
                                placeholder="Rechercher par nom de centre, code postal, departement..."
                                componentId="SEARCH"
                                dataField={["name", "city", "zip", "code", "department"]}
                                react={{ and: FILTERS_CENTER.filter((e) => e !== "SEARCH") }}
                                style={{ flex: 2 }}
                                innerClass={{ input: "searchbox" }}
                                autosuggest={false}
                                queryFormat="and"
                                onValueChange={setSearchedValueCenter}
                              />
                            </Filter2>
                            <ResultTable hide={!searchedValueCenter}>
                              <ReactiveListComponent
                                URLParams={false}
                                defaultQuery={getDefaultQueryCenter}
                                scrollOnChange={false}
                                react={{ and: FILTERS_CENTER }}
                                paginationAt="bottom"
                                size={10}
                                renderResultStats={(e) => {
                                  return (
                                    <div>
                                      <BottomResultStats>{getResultLabel(e, 3)}</BottomResultStats>
                                    </div>
                                  );
                                }}
                                render={({ data }) => (
                                  <Table>
                                    <thead>
                                      <tr>
                                        <th className="w-[38%]">Centre</th>
                                        <th className="w-[38%]">Séjour</th>
                                        <th className="w-1/4">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {data.map((hit, i) => (
                                        <HitCentre key={i} hit={hit} cohort={bus.cohort} onClick={() => handleClickCenter(hit)} />
                                      ))}
                                    </tbody>
                                  </Table>
                                )}
                              />
                            </ResultTable>
                          </div>
                        </ReactiveBase>
                      </>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* // Taux doccupation */}
        <div className="flex items-center justify-center mt-4">
          <OccupationCard occupationPercentage={occupationPercentage} placesTotal={bus?.capacity} placesLeft={bus?.placesLeft} />
        </div>
      </div>
    </>
  );
}

const Donnee = ({ title, value, number, showLabelHide }) => {
  return (
    <div className="flex pt-4">
      <div className="w-1/2 text-brand-detail_title "> {title} : </div>
      <div className="w-1/2 font-medium">
        {value} {number} {showLabelHide ? <span className="italic text-gray-500 text-xs">masqué</span> : ""}
      </div>
    </div>
  );
};

const OccupationCard = ({ occupationPercentage, placesLeft, placesTotal }) => {
  let height = `h-0`;
  if (occupationPercentage < 20) height = "h-[20%]";
  else if (occupationPercentage < 30) height = "h-[30%]";
  else if (occupationPercentage < 40) height = "h-[40%]";
  else if (occupationPercentage < 50) height = "h-[50%]";
  else if (occupationPercentage < 60) height = "h-[60%]";
  else if (occupationPercentage < 70) height = "h-[70%]";
  else if (occupationPercentage < 80) height = "h-[80%]";
  else if (occupationPercentage < 100) height = "h-[90%]";
  else if (occupationPercentage >= 100) height = "h-[100%]";

  let bgColor = "bg-snu-purple-300";
  if (occupationPercentage > 100) bgColor = "bg-red-500";

  return occupationPercentage ? (
    <div className="bg-white rounded-lg shadow-sm py-4 px-8 max-w-xl">
      <div className="text-lg font-medium mb-1 text-gray-900">Taux d&apos;occupation</div>
      <div className="flex gap-4">
        {/* barre */}
        <div className="flex flex-col justify-end w-9 h-[100px] bg-gray-200 rounded-lg overflow-hidden">
          <div className={`flex justify-center items-center w-9 ${height} ${bgColor} rounded-lg text-white font-bold text-xs`}>{Math.floor(occupationPercentage)}%</div>
        </div>
        {/* nombres */}
        <div className="flex flex-col justify-around">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-200" />
            <div>
              <div className="text-xs font-normal">Place disponibles</div>
              <div className="text-base font-bold">{placesLeft}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-snu-purple-300" />
            <div>
              <div className="text-xs font-normal">Place occupées</div>
              <div className="text-base font-bold">{placesTotal - placesLeft}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

const HitTransport = ({ hit, onSend }) => {
  return (
    <tr className={`${hit.placesLeft <= 0 ? "bg-gray-50" : ""}`}>
      <td>
        <div className="flex flex-col">
          <div>{hit.idExcel}</div>
          <div className="text-sm text-gray-500">{hit.cohort}</div>
        </div>
      </td>
      <td>
        <div>
          {hit.placesLeft <= 0 ? (
            <div className="font-bold">Complet</div>
          ) : (
            <span className="text-[#242526] text-xs">
              <span className="font-bold text-[15px]">{hit.placesLeft} </span>places disponibles
            </span>
          )}
          <div className="font-normal text-xs text-[#738297]">sur {hit.capacity} places proposées</div>
        </div>
      </td>
      {hit?.placesLeft <= 0 ? (
        <td>
          <div className="font-bold">Complet</div>
        </td>
      ) : (
        <td onClick={(e) => e.stopPropagation()}>
          <div
            className="flex rounded-[10px] border-[1px] border-blue-600 py-1 px-2 items-center justify-center hover:bg-blue-600 text-blue-600 hover:text-white cursor-pointer"
            onClick={onSend}>
            Choisir
          </div>
        </td>
      )}
    </tr>
  );
};

const HitCentre = ({ hit, onClick, cohort }) => {
  return (
    <tr className={`${hit.placesLeft <= 0 ? "bg-gray-50" : ""}`}>
      <td>
        <div className="flex flex-col">
          <div>{hit.name}</div>
          <div className="text-sm text-gray-500">{hit.code2022}</div>
        </div>
      </td>
      <td>
        <div className="flex flex-col">
          <div>{cohort}</div>
        </div>
      </td>

      <td onClick={(e) => e.stopPropagation()}>
        <div
          className="flex rounded-[10px] border-[1px] border-blue-600 py-1 px-2 items-center justify-center hover:bg-blue-600 text-blue-600 hover:text-white cursor-pointer"
          onClick={onClick}>
          Choisir
        </div>
      </td>
    </tr>
  );
};

const Select = ({ value, name, options, onChange, placeholder: defaultPlaceholder, disabled }) => {
  const [showLabel, setShowLabel] = useState(false);
  const [placeholder, setPlaceHolder] = useState(defaultPlaceholder);

  return (
    <div className="flex flex-col justify-center border-[1px] border-gray-300 w-2/3 px-3 py-2 rounded-lg mt-3">
      {showLabel || value ? <div className="text-xs leading-4 font-normal text-gray-500">{defaultPlaceholder}</div> : null}
      <select
        value={value}
        disabled={disabled}
        onFocus={() => {
          setPlaceHolder("");
          setShowLabel(true);
        }}
        onBlur={() => {
          setPlaceHolder(defaultPlaceholder);
          setShowLabel(false);
        }}
        className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500 cursor-pointer disabled:cursor-not-allowed"
        placeholder={placeholder}
        onChange={(e) => {
          e.persist();
          onChange((prev) => ({ ...prev, [name]: e.target.value }));
        }}>
        <option disabled selected value={null} label={defaultPlaceholder}>
          {defaultPlaceholder}
        </option>
        {options.map((item) => (
          <option key={item} value={item} label={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
};
