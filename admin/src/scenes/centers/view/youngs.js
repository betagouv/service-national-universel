import React, { useState } from "react";
import { ReactiveBase, ReactiveList, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";

import { apiURL } from "../../../config";
import SelectStatus from "../../../components/selectStatus";
import api from "../../../services/api";
import CenterView from "./wrapper";
import Panel from "../../volontaires/panel";
import { getFilterLabel, YOUNG_STATUS_PHASE1, translate } from "../../../utils";
import Loader from "../../../components/Loader";
import { Filter, FilterRow, ResultTable, Table, TopResultStats, BottomResultStats, MultiLine } from "../../../components/list";
const FILTERS = ["SEARCH", "STATUS", "COHORT", "DEPARTMENT", "REGION", "STATUS_PHASE_1", "STATUS_PHASE_2", "STATUS_PHASE_3", "STATUS_APPLICATION", "LOCATION"];

export default ({ center, updateCenter }) => {
  const [young, setYoung] = useState();

  const getDefaultQuery = () => ({
    query: {
      bool: {
        filter: [{ terms: { "status.keyword": ["VALIDATED", "WITHDRAWN"] } }, { term: { cohesionCenterId: center._id } }],
        must_not: [{ term: { "statusPhase1.keyword": "WAITING_LIST" } }],
      },
    },
  });

  const handleClick = async (young) => {
    const { ok, data } = await api.get(`/referent/young/${young._id}`);
    if (ok) setYoung(data);
  };

  if (!center) return <Loader />;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <CenterView center={center} tab="volontaires">
        <div>
          <ReactiveBase url={`${apiURL}/es`} app="cohesionyoung" headers={{ Authorization: `JWT ${api.getToken()}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Filter>
                  <DataSearch
                    defaultQuery={getDefaultQuery}
                    showIcon={false}
                    placeholder="Rechercher par prénom, nom, email, ville, code postal..."
                    componentId="SEARCH"
                    dataField={["email.keyword", "firstName", "lastName", "city", "zip"]}
                    react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                    // fuzziness={2}
                    style={{ flex: 2 }}
                    innerClass={{ input: "searchbox" }}
                    autosuggest={false}
                    queryFormat="and"
                  />
                  <FilterRow>
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
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Statut phase 1")}
                    />
                  </FilterRow>
                </Filter>
                <ResultTable>
                  <ReactiveList
                    defaultQuery={getDefaultQuery}
                    componentId="result"
                    react={{ and: FILTERS }}
                    pagination={true}
                    paginationAt="both"
                    innerClass={{ pagination: "pagination" }}
                    size={30}
                    showLoader={true}
                    dataField="lastName.keyword"
                    sortBy="asc"
                    loader={<div style={{ padding: "0 20px" }}>Chargement...</div>}
                    innerClass={{ pagination: "pagination" }}
                    renderNoResults={() => <div style={{ padding: "10px 25px" }}>Aucun résultat.</div>}
                    renderResultStats={(e) => {
                      return (
                        <>
                          <TopResultStats>
                            Affiche {e.displayedResults * e.currentPage + 1} à {e.displayedResults * (e.currentPage + 1)} résultats sur {e.numberOfResults} résultats
                          </TopResultStats>
                          <BottomResultStats>
                            Affiche {e.displayedResults * e.currentPage + 1} à {e.displayedResults * (e.currentPage + 1)} résultats sur {e.numberOfResults} résultats
                          </BottomResultStats>
                        </>
                      );
                    }}
                    render={({ data }) => (
                      <Table>
                        <thead>
                          <tr>
                            <th width="70%">Volontaire</th>
                            <th>Affectation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((hit, i) => (
                            <Hit key={i} hit={hit} onClick={() => handleClick(hit)} selected={young?._id === hit._id} onChangeYoung={updateCenter} />
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
      </CenterView>
      <Panel
        value={young}
        onChange={() => {
          setYoung(null);
        }}
      />
    </div>
  );
};

const Hit = ({ hit, onClick, selected, onChangeYoung }) => {
  const user = useSelector((state) => state.Auth.user);

  const getAge = (d) => {
    const now = new Date();
    const date = new Date(d);
    const diffTime = Math.abs(date - now);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  };
  return (
    <tr style={{ backgroundColor: selected && "#e6ebfa" }} onClick={onClick}>
      <td>
        <MultiLine>
          <h2>{`${hit.firstName} ${hit.lastName}`}</h2>
          <p>
            {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {`• ${hit.city || ""} (${hit.department || ""})`}
          </p>
        </MultiLine>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatus
          disabled={user.role !== "admin"}
          hit={hit}
          callback={onChangeYoung}
          options={Object.keys(YOUNG_STATUS_PHASE1).filter((e) => e !== "WAITING_LIST")}
          statusName="statusPhase1"
          phase="COHESION_STAY"
        />
      </td>
    </tr>
  );
};
