import React, { useState, useEffect } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { toastr } from "react-redux-toastr";
import { useParams } from "react-router";

import { apiURL } from "../../../config";
import SelectStatus from "../../../components/selectStatus";
import api from "../../../services/api";
import Panel from "../../volontaires/panel";
import Chevron from "../../../components/Chevron";
import { RegionFilter, DepartmentFilter } from "../../../components/filters";
import Select from "../../volontaires-head-center/components/Select";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import {
  getFilterLabel,
  YOUNG_STATUS_PHASE1,
  translate,
  translatePhase1,
  translatePhase2,
  formatDateFRTimezoneUTC,
  isInRuralArea,
  formatLongDateFR,
  getAge,
  colors,
  getLabelWithdrawnReason,
  confirmMessageChangePhase1Presence,
  ES_NO_LIMIT,
  PHASE1_HEADCENTER_OPEN_ACCESS_CHECK_PRESENCE,
} from "../../../utils";
import Loader from "../../../components/Loader";
import { Filter, FilterRow, ResultTable, Table, MultiLine } from "../../../components/list";
const FILTERS = ["SEARCH", "STATUS", "COHORT", "DEPARTMENT", "REGION", "STATUS_PHASE_1", "STATUS_PHASE_2", "STATUS_PHASE_3", "STATUS_APPLICATION", "LOCATION", "COHESION_PRESENCE"];
import ReactiveListComponent from "../../../components/ReactiveListComponent";

export default function Youngs({ updateCenter }) {
  const [young, setYoung] = useState();
  const [center, setCenter] = useState(null);
  const [meetingPoints, setMeetingPoints] = useState(null);
  const [focusedSession, setFocusedSession] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const { id, sessionId } = useParams();

  const getDefaultQuery = () => ({
    query: { bool: { filter: [{ terms: { "status.keyword": ["VALIDATED", "WITHDRAWN", "WAITING_LIST"] } }, { term: { "cohort.keyword": focusedSession?.cohort } }] } },
    sort: [{ "lastName.keyword": "asc" }],
    track_total_hits: true,
  });
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/meeting-point/all");
      setMeetingPoints(data);
    })();
  }, []);
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await api.get(`/cohesion-center/${id}`);
      setCenter(data);
    })();
  }, [id]);
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
                <Filter>
                  <FilterRow visible>
                    <DataSearch
                      defaultQuery={getDefaultQuery}
                      showIcon={false}
                      placeholder="Rechercher par prénom, nom, email, ville, code postal..."
                      componentId="SEARCH"
                      dataField={["email.keyword", "firstName.folded", "lastName.folded", "city.folded", "zip"]}
                      react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                      // fuzziness={2}
                      style={{ flex: 1, marginRight: "1rem" }}
                      innerClass={{ input: "searchbox" }}
                      autosuggest={false}
                      queryFormat="and"
                    />
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
                    />
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
                      renderLabel={(items) => getFilterLabel(items, "Participations au séjour de cohésion")}
                      showMissing
                      missingLabel="Non renseigné"
                    />
                    <Chevron color="#444" style={{ cursor: "pointer", transform: filterVisible && "rotate(180deg)" }} onClick={() => setFilterVisible((e) => !e)} />
                  </FilterRow>
                  <FilterRow visible={filterVisible}>
                    <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
                    <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} />
                  </FilterRow>
                </Filter>
                <ResultTable style={{ borderRadius: "8px", boxShadow: "0px 3px 2px #edf2f7" }}>
                  <ReactiveListComponent
                    defaultQuery={getDefaultQuery}
                    react={{ and: FILTERS }}
                    dataField="lastName.keyword"
                    sortBy="asc"
                    render={({ data }) => (
                      <Table>
                        <thead>
                          <tr>
                            <th width="65%">Volontaire</th>
                            <th>Affectation</th>
                            <th>Présence</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((hit) => (
                            <Hit key={hit._id} hit={hit} onClick={() => handleClick(hit)} selected={young?._id === hit._id} onChangeYoung={updateCenter} />
                          ))}
                        </tbody>
                      </Table>
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

const Hit = ({ hit, onClick, selected, onChangeYoung }) => {
  const [value, setValue] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const updateYoung = async (v) => {
    const { data, ok, code } = await api.put(`/referent/young/${value._id}`, v);
    if (!ok) return toastr.error("Oups, une erreur s'est produite", translate(code));
    setValue(data);
  };

  useEffect(() => {
    setValue(hit);
  }, [hit._id]);

  if (!value) return <></>;

  return (
    <tr style={{ backgroundColor: (selected && "#e6ebfa") || (hit.status === "WITHDRAWN" && colors.extraLightGrey) }} onClick={onClick}>
      <td>
        <MultiLine>
          <span className="font-bold text-black">{`${hit.firstName} ${hit.lastName}`}</span>
          <p>
            {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {`• ${hit.city || ""} (${hit.department || ""})`}
          </p>
        </MultiLine>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatus
          disabled
          hit={hit}
          callback={onChangeYoung}
          options={Object.keys(YOUNG_STATUS_PHASE1).filter((e) => e !== "WAITING_LIST")}
          statusName="statusPhase1"
          phase="COHESION_STAY"
        />
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <Select
          placeholder="Non renseigné"
          options={[
            { value: "true", label: "Présent" },
            { value: "false", label: "Absent" },
          ]}
          value={value.cohesionStayPresence}
          name="cohesionStayPresence"
          disabled={PHASE1_HEADCENTER_OPEN_ACCESS_CHECK_PRESENCE[value.cohort].getTime() > Date.now()}
          handleChange={(e) => {
            const value = e.target.value;
            setModal({
              isOpen: true,
              onConfirm: () => {
                updateYoung({ cohesionStayPresence: value });
              },
              title: "Changement de présence",
              message: confirmMessageChangePhase1Presence(value),
            });
          }}
        />
      </td>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </tr>
  );
};
