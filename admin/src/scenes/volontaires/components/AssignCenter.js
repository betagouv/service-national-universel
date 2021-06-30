import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { ReactiveBase, DataSearch } from "@appbaseio/reactivesearch";

import { apiURL } from "../../../config";
import api from "../../../services/api";
import { Filter, ResultTable, BottomResultStats, Table, MultiLine } from "../../../components/list";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import { translate } from "../../../utils";
import ReactiveListComponent from "../../../components/ReactiveListComponent";

export default ({ young, onAffect, onClick }) => {
  const FILTERS = ["SEARCH"];
  const [searchedValue, setSearchedValue] = useState("");

  const handleAffectation = async (center) => {
    try {
      const response = await api.post(`/cohesion-center/${center._id}/assign-young/${young._id}`);
      if (!response.ok) return toastr.error("Oups, une erreur est survenue lors de l'affectation du jeune", translate(response.code));
      toastr.success(`${response.young.firstName} a été affecté(e) au centre ${response.data.name} !`);
      setSearchedValue("");
      return onAffect?.(response.data, response.young);
    } catch (error) {
      if (error.code === "OPERATION_NOT_ALLOWED")
        return toastr.error("Oups, une erreur est survenue lors de l'affectation du jeune. Il semblerait que ce centre soit déjà complet", translate(error?.code), {
          timeOut: 5000,
        });
      return toastr.error("Oups, une erreur est survenue lors du traitement de l'affectation du jeune", translate(error?.code));
    }
  };

  return (
    <>
      <ReactiveBase url={`${apiURL}/es`} app="cohesioncenter" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ flex: 2, position: "relative" }}>
          <Filter>
            <DataSearch
              showIcon={false}
              placeholder="Rechercher par nom de centre..."
              componentId="SEARCH"
              dataField={["name", "city", "zip", "code"]}
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
              scrollOnChange={false}
              react={{ and: FILTERS }}
              paginationAt="bottom"
              size={3}
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
                      <th>Centre</th>
                      <th>Places</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((hit, i) => (
                      <HitCenter key={i} hit={hit} onSend={() => handleAffectation(hit)} onClick={() => onClick?.(hit)} />
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

const HitCenter = ({ hit, onSend, onClick }) => {
  return (
    <tr>
      <td>
        <MultiLine onClick={onClick}>
          <h2>{hit.name}</h2>
          <p>{`${hit.city || ""} • ${hit.department || ""}`}</p>
        </MultiLine>
      </td>
      <td>
        <MultiLine>
          <h2>{hit.placesLeft} places disponibles</h2>
          <p>sur {hit.placesTotal} places proposées</p>
        </MultiLine>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <PanelActionButton onClick={onSend} title="Affecter à ce centre" />
      </td>
    </tr>
  );
};
