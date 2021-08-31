import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { ReactiveBase, DataSearch } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";

import { apiURL } from "../../../config";
import api from "../../../services/api";
import { translate, getAge, ROLES, getResultLabel } from "../../../utils";
import { Filter, ResultTable, BottomResultStats, Table, MultiLine } from "../../../components/list";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import ReactiveListComponent from "../../../components/ReactiveListComponent";

export default ({ center, onAffect, onClick }) => {
  const getDefaultQuery = () => ({
    query: {
      bool: {
        filter: [{ terms: { "status.keyword": ["VALIDATED", "WAITING_LIST"] } }, { terms: { "statusPhase1.keyword": ["WAITING_AFFECTATION", "WAITING_LIST"] } }],
        // must_not: [
        //   {
        //     exists: {
        //       field: "cohesionCenterId",
        //     },
        //   },
        // ],
      },
    },
  });

  const FILTERS = ["SEARCH"];
  const [searchedValue, setSearchedValue] = useState("");

  const handleAffectation = async (young) => {
    try {
      const { ok, code } = await api.post(`/cohesion-center/${center._id}/assign-young/${young._id}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de l'affectation du jeune", translate(code));
      toastr.success(`${young.firstName} a été affecté(e) au centre ${center.name} !`);

      return onAffect?.();
    } catch (error) {
      if (error.code === "OPERATION_NOT_ALLOWED")
        return toastr.error("Oups, une erreur est survenue lors de l'affectation du jeune. Il semblerait que ce centre soit déjà complet", translate(error?.code), {
          timeOut: 5000,
        });
      return toastr.error("Oups, une erreur est survenue lors du traitement de l'affectation du jeune", translate(error?.code));
    }
  };

  const handleWaitingList = async (young) => {
    try {
      const { ok, code } = await api.post(`/cohesion-center/${center._id}/assign-young-waiting-list/${young._id}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de l'affectation du jeune", translate(code));
      toastr.success(`${young.firstName} a été placé(e) en liste d'attente sur le centre ${center.name} !`);

      return onAffect?.();
    } catch (error) {
      return toastr.error("Oups, une erreur est survenue lors du traitement de l'affectation du jeune", translate(error?.code));
    }
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
              <ReactiveListComponent
                defaultQuery={getDefaultQuery}
                scrollOnChange={false}
                react={{ and: FILTERS }}
                paginationAt="bottom"
                size={3}
                renderResultStats={(e) => {
                  return (
                    <div>
                      <BottomResultStats>{getResultLabel(e)}</BottomResultStats>
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
                        <HitYoung key={i} hit={hit} handleAffect={() => handleAffectation(hit)} handleWaitingList={() => handleWaitingList(hit)} onClick={() => onClick(hit)} />
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

const HitYoung = ({ hit, handleAffect, handleWaitingList, onClick }) => {
  const user = useSelector((state) => state.Auth.user);
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
        <div style={{ display: "flex" }}>
          <PanelActionButton onClick={handleAffect} title="Affecter à ce centre" />
          {[ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role) ? <PanelActionButton onClick={handleWaitingList} title="Placer en liste d'attente" /> : null}
        </div>
      </td>
    </tr>
  );
};
