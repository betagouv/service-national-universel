import React, { useEffect, useState } from "react";
import { ReactiveBase, ReactiveList, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";
import styled from "styled-components";

import { apiURL } from "../../../config";
import api from "../../../services/api";
import CenterView from "./wrapper";
import Panel from "../../volontaires/panel";
import { getFilterLabel, YOUNG_STATUS_PHASE1, translate, getAge, enableAssignCenter } from "../../../utils";
import Loader from "../../../components/Loader";
import { Filter, FilterRow, ResultTable, Table, TopResultStats, BottomResultStats, MultiLine } from "../../../components/list";
import { toastr } from "react-redux-toastr";
const FILTERS = ["SEARCH", "STATUS", "COHORT", "DEPARTMENT", "REGION", "STATUS_PHASE_1", "STATUS_PHASE_2", "STATUS_PHASE_3", "STATUS_APPLICATION", "LOCATION"];
import PanelActionButton from "../../../components/buttons/PanelActionButton";

export default ({ center, updateCenter }) => {
  const [young, setYoung] = useState();
  const [list, setList] = useState([]);
  const user = useSelector((state) => state.Auth.user);

  const handleClick = async (young) => {
    const { ok, data } = await api.get(`/referent/young/${young._id}`);
    if (ok) setYoung(data);
  };

  const getYoung = async (id) => {
    const { data, ok, code } = await api.get(`/referent/young/${id}`);
    if (!ok) {
      toastr.error(`Impossible de récupérer les information du volontaire ${id}`, translate(code));
      return null;
    }
    return data;
  };

  const getData = async () => {
    return Promise.all(center.waitingList.map((id) => getYoung(id)));
  };

  const handleAffectation = async (young) => {
    try {
      const { ok, code } = await api.post(`/cohesion-center/${center._id}/assign-young/${young._id}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de l'affectation du jeune", translate(code));
      toastr.success(`${young.firstName} a été affecté(e) au centre ${center.name} !`);

      return updateCenter();
    } catch (error) {
      if (error.code === "OPERATION_NOT_ALLOWED")
        return toastr.error("Oups, une erreur est survenue lors de l'affectation du jeune. Il semblerait que ce centre soit déjà complet", translate(error?.code), {
          timeOut: 5000,
        });
      console.log(error);
      return toastr.error("Oups, une erreur est survenue lors du traitement de l'affectation du jeune", translate(error?.code));
    }
  };

  useEffect(() => {
    (async () => {
      const enrichedWaitingList = await getData();
      setList(enrichedWaitingList);
    })();
  }, []);

  if (!center) return <Loader />;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <CenterView center={center} tab="waiting_list">
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <ResultTable>
                {list.length === 0 ? (
                  <NoResult>La liste d'attente est vide</NoResult>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th width="70%">Volontaire</th>
                        {enableAssignCenter(user) ? <th>Affectation</th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((hit, i) => (
                        <Hit
                          key={i}
                          index={i}
                          hit={hit}
                          onClick={() => handleClick(hit)}
                          onSend={() => handleAffectation(hit)}
                          selected={young?._id === hit._id}
                          onChangeYoung={updateCenter}
                        />
                      ))}
                    </tbody>
                  </Table>
                )}
              </ResultTable>
            </div>
          </div>
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

const Hit = ({ index, hit, onSend, onClick, selected, onChangeYoung }) => {
  const user = useSelector((state) => state.Auth.user);
  return (
    <tr style={{ backgroundColor: selected && "#e6ebfa" }} onClick={onClick}>
      <td>{index + 1}</td>
      <td>
        <MultiLine>
          <h2>{`${hit.firstName} ${hit.lastName}`}</h2>
          <p>
            {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {`• ${hit.city || ""} (${hit.department || ""})`}
          </p>
        </MultiLine>
      </td>
      {enableAssignCenter(user) ? (
        <td onClick={(e) => e.stopPropagation()}>
          <PanelActionButton onClick={onSend} title="Affecter à ce centre" />
        </td>
      ) : null}
    </tr>
  );
};

const NoResult = styled.div`
  font-style: italic;
  padding: 1rem;
`;
