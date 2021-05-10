import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { ReactiveBase, ReactiveList, DataSearch } from "@appbaseio/reactivesearch";

import { apiURL } from "../../../config";
import api from "../../../services/api";
import { YOUNG_STATUS_PHASE1 } from "../../../utils";
import { Filter, ResultTable, BottomResultStats, Table, MultiLine } from "../../../components/list";
import PanelActionButton from "../../../components/buttons/PanelActionButton";

export default ({ center, onAffect, onClick }) => {
  const getDefaultQuery = () => ({ query: { bool: { filter: { terms: { "status.keyword": ["VALIDATED", "WITHDRAWN"] } } } } });

  const FILTERS = ["SEARCH"];
  const [searchedValue, setSearchedValue] = useState("");

  const handleAffectation = async (young) => {
    const { data, ok, code } = await api.post(`/cohesion-center/${center._id}/assign-young/${young._id}`);
    if (!ok) return toastr.error("Oups, une erreur est survenue lors de l'affectation du jeune", code);
    toastr.success(`${young.firstName} a été affecté(e) au centre ${center.name} !`);

    return onAffect?.();
  };

  return (
    <>
      <ReactiveBase url={`${apiURL}/es`} app="young" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
          <div style={{ flex: 2, position: "relative" }}>
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
                        <th width="70%">Volontaire</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit, i) => (
                        <HitYoung key={i} hit={hit} onSend={() => handleAffectation(hit)} onClick={() => onClick(hit)} />
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </ResultTable>
          </div>
        </div>
      </ReactiveBase>
    </>
  );
};

const HitYoung = ({ hit, onSend, onClick }) => {
  const getAge = (d) => {
    const now = new Date();
    const date = new Date(d);
    const diffTime = Math.abs(date - now);
    const age = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    if (!age || isNaN(age)) return "?";
    return age;
  };
  return (
    <tr>
      <td>
        <MultiLine onClick={onClick}>
          <h2>{`${hit.firstName} ${hit.lastName}`}</h2>
          <p>
            {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {`• ${hit.city || ""} (${hit.department || ""})`}
          </p>
        </MultiLine>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <PanelActionButton onClick={onSend} title="Affecter à ce centre" />
      </td>
    </tr>
  );
};
