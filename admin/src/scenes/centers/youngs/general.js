import React, { useState, useEffect } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch, ReactiveComponent } from "@appbaseio/reactivesearch";
import { useParams } from "react-router";

import { apiURL } from "../../../config";
import Badge from "../../../components/Badge";
import FilterSvg from "../../../assets/icons/Filter";
import None from "../../../assets/icons/None";
import ArrowCircleRight from "../../../assets/icons/ArrowCircleRight";
import api from "../../../services/api";
import Panel from "../../volontaires/panel";
import { RegionFilter, DepartmentFilter } from "../../../components/filters";
import { getFilterLabel, translate, translatePhase1, getAge, YOUNG_STATUS_COLORS, formatDateFR } from "../../../utils";
import Loader from "../../../components/Loader";
import { Filter2, FilterRow, ResultTable } from "../../../components/list";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
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
export default function General({ updateFilter }) {
  const [young, setYoung] = useState();
  const [focusedSession, setFocusedSession] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const { sessionId } = useParams();

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
    })();
  }, [sessionId]);

  const handleClick = async (young) => {
    const { ok, data } = await api.get(`/referent/young/${young._id}`);
    if (ok) setYoung(data);
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
                  <div className="flex items-center mb-2 gap-2">
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
                    render={({ data }) => (
                      <table className="w-full">
                        <thead className="">
                          <tr className="text-xs uppercase text-gray-400 border-y-[1px] border-gray-100">
                            <th className="py-3 pl-4">Volontaire</th>
                            <th className="">Présence à l&apos;arrivée</th>
                            <th className="">Présence JDM</th>
                            <th className="">Départ</th>
                            <th className="">Fiche Sanitaire</th>
                            <th className="">Statut phase 1</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {data.map((hit) => (
                            <Line key={hit._id} hit={hit} onClick={() => handleClick(hit)} selected={young?._id === hit._id} />
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
    </div>
  );
}

const Line = ({ hit, onClick, selected }) => {
  const [value, setValue] = useState(null);

  useEffect(() => {
    setValue(hit);
  }, [hit._id]);

  if (!value) return <></>;

  const bgColor = selected && "bg-snu-purple-300";
  const mainTextColor = selected ? "text-white" : "text-[#242526]";
  const secondTextColor = selected ? "text-blue-100" : "text-[#738297]";

  return (
    <tr className={`${!selected && "hover:!bg-gray-100"}`} onClick={onClick}>
      <td className={`${bgColor} py-3 pl-4 ml-2 rounded-l-lg`}>
        <div>
          <div className={`font-bold ${mainTextColor} text-[15px]`}>{`${hit.firstName} ${hit.lastName}`}</div>
          <div className={`font-normal text-xs ${secondTextColor}`}>
            {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {`• ${hit.city || ""} (${hit.department || ""})`}
          </div>
        </div>
      </td>
      <td className={`${bgColor}`}>
        <div className={`font-normal text-xs ${mainTextColor}`}>
          {!value.cohesionStayPresence && <span className="text-gray-400 italic">Non renseignée</span>}
          {value.cohesionStayPresence === "true" && "Présent"}
          {value.cohesionStayPresence === "false" && "Absent"}
        </div>
      </td>
      <td className={`${bgColor}`}>
        <div className={`font-normal text-xs ${mainTextColor}`}>
          {!value.presenceJDM && <span className="text-gray-400 italic">Non renseignée</span>}
          {value.presenceJDM === "true" && "Présent"}
          {value.presenceJDM === "false" && "Absent"}
        </div>
      </td>
      <td className={`${bgColor}`}>
        <div className={`font-normal text-xs ${mainTextColor}`}>
          {value.departSejourAt ? (
            <div className="flex gap-1 items-center cursor-pointer">
              <ArrowCircleRight className="text-gray-400" />
              <div>{!value.departSejourAt ? "Renseigner un départ" : formatDateFR(value.departSejourAt)}</div>
            </div>
          ) : (
            <None className="text-gray-500" />
          )}
        </div>
      </td>
      <td className={`${bgColor}`}>
        <div className={`font-normal text-xs ${mainTextColor}`}>
          {!value.cohesionStayMedicalFileReceived && <span className="text-gray-400 italic">Non renseignée</span>}
          {value.cohesionStayMedicalFileReceived === "true" && "Réceptionnée"}
          {value.cohesionStayMedicalFileReceived === "false" && "Non réceptionnée"}
        </div>
      </td>
      <td className={`${bgColor} rounded-r-lg`}>
        <div>
          <Badge text={translate(value.statusPhase1)} color={YOUNG_STATUS_COLORS[value.statusPhase1]} />
        </div>
      </td>
    </tr>
  );
};
