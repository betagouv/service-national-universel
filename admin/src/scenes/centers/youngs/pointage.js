import React, { useState, useEffect } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { apiURL } from "../../../config";
import FilterSvg from "../../../assets/icons/Filter";
import ArrowCircleRight from "../../../assets/icons/ArrowCircleRight";
import SpeakerPhone from "../../../assets/icons/SpeakerPhone";
import BadgeCheck from "../../../assets/icons/BadgeCheck";
import api from "../../../services/api";
import Panel from "../../volontaires/panel";
import { RegionFilter, DepartmentFilter } from "../../../components/filters";
import ModalPointagePresenceArrivee from "../components/modals/ModalPointagePresenceArrivee";
import ModalPointagePresenceJDM from "../components/modals/ModalPointagePresenceJDM";
import ModalMultiPointagePresenceJDM from "../components/modals/ModalMultiPointagePresenceJDM";
import ModalMultiPointagePresenceArrivee from "../components/modals/ModalMultiPointagePresenceArrivee";
import ModalMultiPointageDepart from "../components/modals/ModalMultiPointageDepart";
import ModalPointageDepart from "../components/modals/ModalPointageDepart";
import { getFilterLabel, translate, translatePhase1, getAge, formatDateFR } from "../../../utils";
import Loader from "../../../components/Loader";
import { Filter2, FilterRow, ResultTable } from "../../../components/list";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import SelectAction from "../../../components/SelectAction";
import CursorClick from "../../../assets/icons/CursorClick";

const FILTERS = [
  "SEARCH",
  "STATUS",
  "STATUS_PHASE_1",
  "REGION",
  "DEPARTMENT",
  "GRADE",
  "HANDICAP",
  "PPS",
  "PAI",
  "QPV",
  "ALLERGIES",
  "SPECIFIC_AMENAGEMENT",
  "PMR",
  "MEDICAL_FILE_RECEIVED",
  "COHESION_PRESENCE",
  "COHESION_JDM",
  "DEPART",
  "DEPART_MOTIF",
];

export default function Pointage({ updateFilter }) {
  const history = useHistory();
  const [young, setYoung] = useState();
  const [focusedSession, setFocusedSession] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [youngSelected, setYoungSelected] = useState([]);
  const [youngsInPage, setYoungsInPage] = useState([]);
  const checkboxRef = React.useRef();
  const { sessionId } = useParams();

  const [modalPointagePresenceArrivee, setModalPointagePresenceArrivee] = useState({ isOpen: false });
  const [modalMultiPointagePresenceJDM, setModalMultiPointagePresenceJDM] = useState({ isOpen: false });

  //todo
  const [modalPointageDepart, setModalPointageDepart] = useState({ isOpen: false });

  const getDefaultQuery = () => ({
    query: {
      bool: { filter: [{ terms: { "status.keyword": ["VALIDATED", "WITHDRAWN", "WAITING_LIST"] } }, { term: { "sessionPhase1Id.keyword": focusedSession?._id.toString() } }] },
    },
    sort: [{ "lastName.keyword": "asc" }],
    track_total_hits: true,
  });

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      const { data } = await api.get(`/session-phase1/${sessionId}`);
      setFocusedSession(data);
      updateFilter({ SESSION: data._id.toString() });
    })();
  }, [sessionId]);

  useEffect(() => {
    if (!checkboxRef.current) return;
    if (youngSelected?.length === 0) {
      checkboxRef.current.checked = false;
      checkboxRef.current.indeterminate = false;
    } else if (youngSelected?.length < youngsInPage?.length) {
      checkboxRef.current.checked = false;
      checkboxRef.current.indeterminate = true;
    } else if (youngSelected?.length === youngsInPage?.length) {
      checkboxRef.current.checked = true;
      checkboxRef.current.indeterminate = false;
    }
  }, [youngSelected]);

  const handleClick = async (young) => {
    const { ok, data } = await api.get(`/referent/young/${young._id}`);
    if (ok) setYoung(data);
  };

  const onClickMainCheckBox = () => {
    if (youngSelected.length === 0) {
      setYoungSelected(youngsInPage);
    } else {
      setYoungSelected([]);
    }
  };

  if (!focusedSession) return <Loader />;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
        <div>
          <ReactiveBase url={`${apiURL}/es`} app={`sessionphase1young/${focusedSession._id}`} headers={{ Authorization: `JWT ${api.getToken()}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Filter2>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DataSearch
                        defaultQuery={getDefaultQuery}
                        showIcon={false}
                        placeholder="Rechercher par prénom, nom, email, ville, code postal..."
                        componentId="SEARCH"
                        dataField={["email.keyword", "firstName.folded", "lastName.folded", "city.folded", "zip"]}
                        react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                        // fuzziness={2}
                        innerClass={{ input: "searchbox" }}
                        autosuggest={false}
                        queryFormat="and"
                        onValueChange={(e) => updateFilter({ SEARCH: e })}
                      />
                      <div
                        className="flex gap-2 items-center px-3 py-2 rounded-lg bg-gray-100 text-[14px] font-medium text-gray-700 cursor-pointer hover:underline"
                        onClick={() => setFilterVisible((e) => !e)}>
                        <FilterSvg className="text-gray-400" />
                        Filtres
                      </div>
                      <div>
                        {youngSelected?.length > 0 ? (
                          <div className="text-gray-600 font-normal text-sm">
                            <span className="font-bold">{youngSelected?.length}</span>&nbsp;sélectionné{youngSelected?.length > 1 ? "s" : ""}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <SelectAction
                        Icon={<CursorClick className="text-gray-400" />}
                        title="Actions"
                        alignItems="right"
                        optionsGroup={[
                          {
                            title: "L'arrivée au séjour",
                            items: [
                              {
                                action: async () => {
                                  if (youngSelected.length === 0) return;
                                  setModalPointagePresenceArrivee({
                                    isOpen: true,
                                    values: youngSelected,
                                    value: "true",
                                    onSubmit: async () => {
                                      const { ok, code } = await api.post(`/young/phase1/multiaction/cohesionStayPresence`, {
                                        value: "true",
                                        ids: youngSelected.map((y) => y._id),
                                      });
                                      if (!ok) {
                                        toastr.error("Oups, une erreur s'est produite", translate(code));
                                        return;
                                      }
                                      history.go(0);
                                    },
                                  });
                                },
                                render: (
                                  <div className="group flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
                                    <SpeakerPhone className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
                                    <div className="font-normal">
                                      Marquer <span className="font-bold">présent</span>
                                      {youngSelected.length > 0 ? ` (${youngSelected.length})` : ""}
                                    </div>
                                  </div>
                                ),
                              },
                              {
                                action: async () => {
                                  if (youngSelected.length === 0) return;
                                  setModalPointagePresenceArrivee({
                                    isOpen: true,
                                    values: youngSelected,
                                    value: "false",
                                    onSubmit: async () => {
                                      const { ok, code } = await api.post(`/young/phase1/multiaction/cohesionStayPresence`, {
                                        value: "false",
                                        ids: youngSelected.map((y) => y._id),
                                      });
                                      if (!ok) {
                                        toastr.error("Oups, une erreur s'est produite", translate(code));
                                        return;
                                      }
                                      history.go(0);
                                    },
                                  });
                                },
                                render: (
                                  <div className="group flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
                                    <SpeakerPhone className="text-gray-400 group-hover:scale-105 group-hover:text-orange-600" />
                                    <div>
                                      Marquer <span className="font-bold">absent</span>
                                      {youngSelected.length > 0 ? ` (${youngSelected.length})` : ""}
                                    </div>
                                  </div>
                                ),
                              },
                            ],
                          },
                          {
                            title: "La JDM",
                            items: [
                              {
                                action: async () => {
                                  if (youngSelected.length === 0) return;
                                  setModalMultiPointagePresenceJDM({
                                    isOpen: true,
                                    values: youngSelected,
                                    value: "true",
                                    onSubmit: async () => {
                                      const { ok, code } = await api.post(`/young/phase1/multiaction/presenceJDM`, { value: "true", ids: youngSelected.map((y) => y._id) });
                                      if (!ok) {
                                        toastr.error("Oups, une erreur s'est produite", translate(code));
                                        return;
                                      }
                                      history.go(0);
                                    },
                                  });
                                },
                                render: (
                                  <div className="group flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
                                    <BadgeCheck className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
                                    <div>
                                      Marquer <span className="font-bold">présent</span>
                                      {youngSelected.length > 0 ? ` (${youngSelected.length})` : ""}
                                    </div>
                                  </div>
                                ),
                              },
                              {
                                action: async () => {
                                  if (youngSelected.length === 0) return;
                                  setModalMultiPointagePresenceJDM({
                                    isOpen: true,
                                    values: youngSelected,
                                    value: "false",
                                    onSubmit: async () => {
                                      const { ok, code } = await api.post(`/young/phase1/multiaction/presenceJDM`, { value: "false", ids: youngSelected.map((y) => y._id) });
                                      if (!ok) {
                                        toastr.error("Oups, une erreur s'est produite", translate(code));
                                        return;
                                      }
                                      history.go(0);
                                    },
                                  });
                                },
                                render: (
                                  <div className="group flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
                                    <BadgeCheck className="text-gray-400 group-hover:scale-105 group-hover:text-orange-600" />
                                    <div>
                                      Marquer <span className="font-bold">absent</span>
                                      {youngSelected.length > 0 ? ` (${youngSelected.length})` : ""}
                                    </div>
                                  </div>
                                ),
                              },
                            ],
                          },
                          {
                            items: [
                              {
                                action: async () => {
                                  if (youngSelected.length === 0) return;
                                  setModalPointageDepart({
                                    isOpen: true,
                                    values: youngSelected,
                                    value: "false",
                                    onSubmit: () => {
                                      history.go(0);
                                    },
                                  });
                                },
                                render: (
                                  <div className="group flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
                                    <ArrowCircleRight className="text-gray-400 group-hover:scale-105 group-hover:text-orange-600" />
                                    Renseigner un départ
                                    {youngSelected.length > 0 ? ` (${youngSelected.length})` : ""}
                                  </div>
                                ),
                              },
                            ],
                          },
                        ]}
                      />
                    </div>
                  </div>
                  <FilterRow visible={filterVisible}>
                    <div className="uppercase text-xs text-snu-purple-800">Général</div>
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      componentId="STATUS"
                      dataField="status.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "STATUS") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Statut")}
                      onValueChange={(e) => updateFilter({ STATUS: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      componentId="STATUS_PHASE_1"
                      dataField="statusPhase1.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "STATUS_PHASE_1") }}
                      renderItem={(e, count) => {
                        return `${translatePhase1(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Statut phase 1")}
                      onValueChange={(e) => updateFilter({ STATUS_PHASE_1: e })}
                    />
                    <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} onValueChange={(e) => updateFilter({ REGION: e })} />
                    <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} onValueChange={(e) => updateFilter({ DEPARTMENT: e })} />
                  </FilterRow>
                  <FilterRow visible={filterVisible}>
                    <div className="uppercase text-xs text-snu-purple-800">Dossier</div>
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="Classe"
                      componentId="GRADE"
                      dataField="grade.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "GRADE") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Classe", "Classe")}
                      onValueChange={(e) => updateFilter({ GRADE: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="HANDICAP"
                      componentId="HANDICAP"
                      dataField="handicap.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "HANDICAP") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      renderLabel={(items) => getFilterLabel(items, "Handicap", "Handicap")}
                      onValueChange={(e) => updateFilter({ HANDICAP: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="PPS"
                      componentId="PPS"
                      dataField="ppsBeneficiary.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "PPS") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      renderLabel={(items) => getFilterLabel(items, "PPS", "PPS")}
                      onValueChange={(e) => updateFilter({ PPS: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="PAI"
                      componentId="PAI"
                      dataField="paiBeneficiary.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "PAI") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      renderLabel={(items) => getFilterLabel(items, "PAI", "PAI")}
                      onValueChange={(e) => updateFilter({ PAI: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="QPV"
                      componentId="QPV"
                      dataField="qpv.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "QPV") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      renderLabel={(items) => getFilterLabel(items, "QPV", "QPV")}
                      onValueChange={(e) => updateFilter({ QPV: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder=""
                      componentId="ALLERGIES"
                      dataField="allergies.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "ALLERGIES") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      renderLabel={(items) => getFilterLabel(items, "Allergies ou intolérances", "Allergies ou intolérances")}
                      showMissing
                      missingLabel="Non renseigné"
                      onValueChange={(e) => updateFilter({ ALLERGIES: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="Aménagement spécifique"
                      componentId="SPECIFIC_AMENAGEMENT"
                      dataField="specificAmenagment.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "SPECIFIC_AMENAGEMENT") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      renderLabel={(items) => getFilterLabel(items, "Aménagement spécifique", "Aménagement spécifique")}
                      onValueChange={(e) => updateFilter({ SPECIFIC_AMENAGEMENT: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="PMR"
                      componentId="PMR"
                      dataField="reducedMobilityAccess.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "PMR") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      renderLabel={(items) => getFilterLabel(items, "Aménagement PMR", "Aménagement PMR")}
                      onValueChange={(e) => updateFilter({ PMR: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      componentId="MEDICAL_FILE_RECEIVED"
                      dataField="cohesionStayMedicalFileReceived.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "MEDICAL_FILE_RECEIVED") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Fiches sanitaires", "Fiches sanitaires")}
                      showMissing
                      missingLabel="Non renseigné"
                      onValueChange={(e) => updateFilter({ MEDICAL_FILE_RECEIVED: e })}
                    />
                  </FilterRow>
                  <FilterRow visible={filterVisible}>
                    <div className="uppercase text-xs text-snu-purple-800">Pointage</div>
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      componentId="COHESION_PRESENCE"
                      dataField="cohesionStayPresence.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "COHESION_PRESENCE") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Présence à l'arrivée")}
                      showMissing
                      missingLabel="Non renseigné"
                      onValueChange={(e) => updateFilter({ COHESION_PRESENCE: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      componentId="COHESION_JDM"
                      dataField="presenceJDM.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "COHESION_JDM") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Présence à la JDM")}
                      showMissing
                      missingLabel="Non renseigné"
                      onValueChange={(e) => updateFilter({ COHESION_JDM: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      componentId="DEPART"
                      dataField="departInform.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "DEPART") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Départ renseigné")}
                      showMissing
                      missingLabel="Non renseigné"
                      onValueChange={(e) => updateFilter({ DEPART: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      componentId="DEPART_MOTIF"
                      dataField="departSejourMotif.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "DEPART_MOTIF") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Motif du départ")}
                      showMissing
                      missingLabel="Non renseigné"
                      onValueChange={(e) => updateFilter({ DEPART_MOTIF: e })}
                    />
                  </FilterRow>
                </Filter2>
                <ResultTable>
                  <ReactiveListComponent
                    defaultQuery={getDefaultQuery}
                    react={{ and: FILTERS }}
                    dataField="lastName.keyword"
                    sortBy="asc"
                    paginationAt="bottom"
                    showTopResultStats={false}
                    onData={async ({ rawData }) => {
                      if (rawData?.hits?.hits) setYoungsInPage(rawData.hits.hits.map((h) => ({ _id: h._id, firstName: h._source.firstName, lastName: h._source.lastName })));
                    }}
                    render={({ data }) => (
                      <table className="w-full">
                        <thead className="">
                          <tr className="text-xs uppercase text-gray-400 border-y-[1px] border-gray-100">
                            <th className="py-3 pl-4">
                              <input ref={checkboxRef} className="cursor-pointer" type="checkbox" onChange={onClickMainCheckBox} />
                            </th>
                            <th className="">Volontaire</th>
                            <th className="">Présence à l&apos;arrivée</th>
                            <th className="">Présence JDM</th>
                            <th className="">Départ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {data.map((hit) => (
                            <Line
                              key={hit._id}
                              hit={hit}
                              onClick={() => handleClick(hit)}
                              opened={young?._id === hit._id}
                              onSelect={(newItem) =>
                                setYoungSelected((prev) => {
                                  if (prev.find((e) => e._id.toString() === newItem._id.toString())) {
                                    return prev.filter((e) => e._id.toString() !== newItem._id.toString());
                                  }
                                  return [...prev, { _id: newItem._id, firstName: newItem.firstName, lastName: newItem.lastName }];
                                })
                              }
                              selected={youngSelected.find((e) => e._id.toString() === hit._id.toString())}
                            />
                          ))}
                        </tbody>
                      </table>
                    )}
                  />
                </ResultTable>
              </div>
            </div>
          </ReactiveBase>
        </div>
      </div>
      <Panel
        value={young}
        onChange={() => {
          setYoung(null);
        }}
      />
      <ModalMultiPointagePresenceJDM
        isOpen={modalMultiPointagePresenceJDM?.isOpen}
        onCancel={() => setModalMultiPointagePresenceJDM({ isOpen: false, value: null })}
        onSubmit={modalMultiPointagePresenceJDM?.onSubmit}
        values={modalMultiPointagePresenceJDM?.values}
        value={modalMultiPointagePresenceJDM?.value}
      />
      <ModalMultiPointagePresenceArrivee
        isOpen={modalPointagePresenceArrivee?.isOpen}
        onCancel={() => setModalPointagePresenceArrivee({ isOpen: false, value: null })}
        onSubmit={modalPointagePresenceArrivee?.onSubmit}
        values={modalPointagePresenceArrivee?.values}
        value={modalPointagePresenceArrivee?.value}
      />
      <ModalMultiPointageDepart
        isOpen={modalPointageDepart?.isOpen}
        onCancel={() => setModalPointageDepart({ isOpen: false, value: null })}
        onSubmit={modalPointageDepart?.onSubmit}
        values={modalPointageDepart?.values}
        value={modalPointageDepart?.value}
      />
    </div>
  );
}

const Line = ({ hit, onClick, opened, onSelect, selected }) => {
  const [value, setValue] = useState(null);
  const [modalPointagePresenceArrivee, setModalPointagePresenceArrivee] = useState({ isOpen: false });
  const [modalPointagePresenceJDM, setModalPointagePresenceJDM] = useState({ isOpen: false });
  const [modalPointageDepart, setModalPointageDepart] = useState({ isOpen: false });

  useEffect(() => {
    setValue(hit);
  }, [hit._id]);

  if (!value) return <></>;

  const bgColor = selected ? "bg-blue-500" : opened ? "bg-blue-100" : "";
  const mainTextColor = selected ? "text-white" : "text-[#242526]";
  const secondTextColor = selected ? "text-blue-100" : "text-[#738297]";

  const cohesionStayPresenceBgColor = value.cohesionStayPresence === "false" && "bg-gray-100";
  const cohesionStayPresenceTextColor = !value.cohesionStayPresence && "text-gray-400";

  const presenceJDMBgColor = value.presenceJDM === "false" && "bg-gray-100";
  const presenceJDMTextColor = !value.presenceJDM && "text-gray-400";

  const onSubmit = async (newValue) => {
    setValue(newValue);

    // on ferme les modales
    setModalPointagePresenceArrivee({ isOpen: false, value: null });
    setModalPointagePresenceJDM({ isOpen: false, value: null });
    setModalPointageDepart({ isOpen: false, value: null });
  };

  return (
    <>
      <tr className={`${!opened && "hover:!bg-gray-100"}`} onClick={onClick}>
        <td className={`${bgColor} pl-4 ml-2 rounded-l-lg`}>
          <div onClick={(e) => e.stopPropagation()}>
            <input className="cursor-pointer" type="checkbox" checked={selected} onChange={() => onSelect(value)} />
          </div>
        </td>
        <td className={`${bgColor} py-3 `}>
          <div>
            <div className={`font-bold ${mainTextColor} text-[15px]`}>{`${hit.firstName} ${hit.lastName}`}</div>
            <div className={`font-normal text-xs ${secondTextColor}`}>
              {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {`• ${hit.city || ""} (${hit.department || ""})`}
            </div>
          </div>
        </td>
        <td className={`${bgColor}`}>
          <div className="font-normal text-xs text-[#242526]" onClick={(e) => e.stopPropagation()}>
            <select
              className={`border-[1px] border-gray-200 rounded-lg text-black py-2 px-3 cursor-pointer ${cohesionStayPresenceBgColor} ${cohesionStayPresenceTextColor}`}
              value={value.cohesionStayPresence || ""}
              onChange={(e) => {
                setModalPointagePresenceArrivee({
                  isOpen: true,
                  value: e.target.value,
                });
              }}
              style={{ fontFamily: "Marianne" }}>
              <option disabled label="Présence à l'arrivée">
                Présence à l&apos;arrivée
              </option>
              {[
                { label: "Non renseigné", value: "", disabled: true, hidden: true },
                { label: "Présent", value: "true" },
                { label: "Absent", value: "false" },
              ].map((option, i) => (
                <option key={i} value={option.value} label={option.label} disabled={option.disabled} hidden={option.hidden}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </td>
        <td className={`${bgColor}`}>
          <div className="font-normal text-xs text-[#242526]" onClick={(e) => e.stopPropagation()}>
            <select
              className={`border-[1px] border-gray-200 rounded-lg text-black py-2 px-3 cursor-pointer ${presenceJDMBgColor} ${presenceJDMTextColor}`}
              value={value.presenceJDM || ""}
              onChange={(e) => {
                setModalPointagePresenceJDM({
                  isOpen: true,
                  value: e.target.value,
                });
              }}
              style={{ fontFamily: "Marianne" }}>
              <option disabled label="Présence JDM">
                Présence JDM
              </option>
              {[
                { label: "Non renseigné", value: "", disabled: true, hidden: true },
                { label: "Présent", value: "true" },
                { label: "Absent", value: "false" },
              ].map((option, i) => (
                <option key={i} value={option.value} label={option.label} disabled={option.disabled} hidden={option.hidden}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </td>
        <td className={`${bgColor} rounded-r-lg mr-2`}>
          <div className={`font-normal text-xs  ${mainTextColor}`} onClick={(e) => e.stopPropagation()}>
            <div
              className="flex gap-1 items-center group cursor-pointer"
              onClick={(e) => {
                setModalPointageDepart({
                  isOpen: true,
                  value: e.target.value,
                });
              }}>
              <ArrowCircleRight className="text-gray-400 group-hover:scale-105" />
              <div className="group-hover:underline">{!value.departSejourAt ? "Renseigner un départ" : formatDateFR(value.departSejourAt)}</div>
            </div>
          </div>
        </td>
      </tr>
      <ModalPointagePresenceArrivee
        isOpen={modalPointagePresenceArrivee?.isOpen}
        onCancel={() => setModalPointagePresenceArrivee({ isOpen: false, value: null })}
        onSubmit={onSubmit}
        value={modalPointagePresenceArrivee?.value}
        young={value}
      />
      <ModalPointagePresenceJDM
        isOpen={modalPointagePresenceJDM?.isOpen}
        onCancel={() => setModalPointagePresenceJDM({ isOpen: false, value: null })}
        onSubmit={onSubmit}
        value={modalPointagePresenceJDM?.value}
        young={value}
      />
      <ModalPointageDepart
        isOpen={modalPointageDepart?.isOpen}
        onCancel={() => setModalPointageDepart({ isOpen: false, value: null })}
        onSubmit={onSubmit}
        value={modalPointageDepart?.value}
        young={value}
      />
    </>
  );
};
