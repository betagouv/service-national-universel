import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { ReactiveBase, DataSearch } from "@appbaseio/reactivesearch";

import { apiURL } from "../../../config";
import api from "../../../services/api";
import { Filter, ResultTable, BottomResultStats, Table, MultiLine } from "../../../components/list";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import { getResultLabel, translate } from "../../../utils";
import ReactiveListComponent from "../../../components/ReactiveListComponent";

export default function AssignMeetingPoint({ young, onAffect, onClick }) {
  const FILTERS = ["SEARCH"];
  const [searchedValue, setSearchedValue] = useState("");
  const [cohesionCenter, setCohesionCenter] = useState();

  React.useEffect(() => {
    if (young.sessionPhase1Id) {
      try {
        (async () => {
          const { data, code, ok } = await api.get(`/session-phase1/${young.sessionPhase1Id}/cohesion-center`);
          if (!ok) return toastr.error(`Erreur`, translate(code));
          setCohesionCenter(data);
        })();
      } catch (e) {
        console.log(e);
      }
    }
  }, [young]);

  const getDefaultQuery = () => ({
    query: {
      bool: {
        filter: [{ term: { "cohort.keyword": young.cohort } }, { term: { "centerCode.keyword": cohesionCenter?.code2022 || "" } }],
      },
    },
    track_total_hits: true,
  });

  const handleAffectation = async (meetingPoint) => {
    const { ok, code } = await api.put(`/young/${young._id}/meeting-point`, { meetingPointId: meetingPoint._id });
    if (!ok) return toastr.error("Oups, une erreur est survenue lors de la sélection du point de rassemblement", code);
    toastr.success(`${young.firstName} a choisi le point de rassemblement affecté(e) au centre ${meetingPoint.departureAddress}, ${meetingPoint.departureAtString}`);
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
            <ReactiveListComponent
              defaultQuery={getDefaultQuery}
              scrollOnChange={false}
              react={{ and: FILTERS }}
              paginationAt="bottom"
              size={3}
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
}

const HitMeetingPoint = ({ hit, onSend }) => {
  const [bus, setBus] = useState();

  useEffect(() => {
    try {
      (async () => {
        const { data } = await api.get(`/bus/${hit.busId}`);
        setBus(data);
      })();
    } catch (e) {
      console.log(e);
    }
  }, [hit]);

  if (!bus) return null;

  return (
    <tr>
      <td>{hit.busExcelId}</td>
      <td>
        <a href={`/centre/${hit.centerId}`} target="_blank" rel="noreferrer">
          {hit.centerCode}
        </a>
      </td>
      <td>
        <MultiLine>
          <span className="font-bold text-black">{hit.departureAddress}</span>
          <p>{hit.departureAtString}</p>
        </MultiLine>
      </td>
      {bus?.placesLeft <= 0 ? (
        <td>
          <div className="font-bold">Complet</div>
        </td>
      ) : (
        <td onClick={(e) => e.stopPropagation()}>
          <PanelActionButton onClick={onSend} title="choisir" />
        </td>
      )}
    </tr>
  );
};
