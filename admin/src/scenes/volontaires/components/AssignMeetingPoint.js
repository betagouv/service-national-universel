import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { ReactiveBase, ReactiveList, DataSearch } from "@appbaseio/reactivesearch";

import { apiURL } from "../../../config";
import api from "../../../services/api";
import { Filter, ResultTable, BottomResultStats, Table, MultiLine } from "../../../components/list";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import { formatStringLongDate } from "../../../utils";

export default ({ young, onAffect, onClick }) => {
  const FILTERS = ["SEARCH"];
  const [searchedValue, setSearchedValue] = useState("");

  const getDefaultQuery = () => ({
    query: {
      bool: {
        filter: [{ term: { "centerId.keyword": young.cohesionCenterId } }, { term: { "departureDepartment.keyword": young.department } }],
      },
    },
  });

  const handleAffectation = async (meetingPoint) => {
    const { data, ok, code } = await api.put(`/young/${young._id}/meeting-point`, { meetingPointId: meetingPoint._id });
    if (!ok) return toastr.error("Oups, une erreur est survenue lors de la sélection du point de rassemblement", code);
    toastr.success(
      `${young.firstName} a choisi le point de rassemblement affecté(e) au centre ${meetingPoint.departureAddress} à ${formatStringLongDate(meetingPoint.departureAt)}`
    );
    setSearchedValue("");
    return onAffect?.();
  };

  return (
    <>
      <ReactiveBase url={`${apiURL}/es`} app="meetingpoint" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ flex: 2, position: "relative" }}>
          <Filter>
            <DataSearch
              showIcon={false}
              placeholder="Rechercher..."
              componentId="SEARCH"
              dataField={["centerCode", "departureAddress", "busExcelId"]}
              react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
              style={{ flex: 2 }}
              innerClass={{ input: "searchbox" }}
              autosuggest={false}
              queryFormat="and"
              onValueChange={setSearchedValue}
            />
          </Filter>
          <ResultTable hide={!searchedValue}>
            <ReactiveList
              defaultQuery={getDefaultQuery}
              componentId="result"
              scrollOnChange={false}
              react={{ and: FILTERS }}
              pagination={true}
              paginationAt="bottom"
              innerClass={{ pagination: "pagination" }}
              size={3}
              showLoader={true}
              dataField="createdAt"
              sortBy="desc"
              loader={<div style={{ padding: "0 20px" }}>Chargement...</div>}
              renderNoResults={() => <div style={{ padding: "10px 25px" }}>Aucun Résultat.</div>}
              renderResultStats={(e) => {
                return (
                  <div>
                    <BottomResultStats>
                      Affiche {e.displayedResults * e.currentPage + 1} à {e.displayedResults * (e.currentPage + 1)} résultats sur {e.numberOfResults} résultats
                    </BottomResultStats>
                  </div>
                );
              }}
              render={({ data }) => (
                <Table>
                  <thead>
                    <tr>
                      <th style={{ width: "16,66%" }}>Bus</th>
                      <th style={{ width: "16,67%" }}>Centre</th>
                      <th style={{ width: "50%" }}>Depart</th>
                      <th style={{ width: "16,67%" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((hit, i) => (
                      <HitMeetingPoint key={i} hit={hit} onSend={() => handleAffectation(hit)} onClick={() => onClick?.(hit)} />
                    ))}
                  </tbody>
                </Table>
              )}
            />
          </ResultTable>
        </div>
      </ReactiveBase>
    </>
  );
};

const HitMeetingPoint = ({ hit, onSend, onClick }) => {
  return (
    <tr>
      <td>{hit.busExcelId}</td>
      <td>
        <a href={`/centre/${hit.centerId}`} target="_blank">
          {hit.centerCode}
        </a>
      </td>
      <td>
        <MultiLine>
          <h2>{hit.departureAddress}</h2>
          <p>{formatStringLongDate(hit.departureAt)}</p>
        </MultiLine>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <PanelActionButton onClick={onSend} title="choisir" />
      </td>
    </tr>
  );
};
