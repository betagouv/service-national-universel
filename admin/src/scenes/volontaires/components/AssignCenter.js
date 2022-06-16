import React, { useState, useEffect } from "react";
import { toastr } from "react-redux-toastr";
import { ReactiveBase, DataSearch } from "@appbaseio/reactivesearch";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

import { apiURL } from "../../../config";
import api from "../../../services/api";
import { Filter, ResultTable, BottomResultStats, Table, MultiLine } from "../../../components/list";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import { translate, getResultLabel } from "../../../utils";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import Chevron from "../../../components/Chevron";
import ModalConfirm from "../../../components/modals/ModalConfirm";

export default function AssignCenter({ young, onAffect }) {
  const FILTERS = ["SEARCH"];
  const [searchedValue, setSearchedValue] = useState("");
  const [modal, setModal] = useState({ isOpen: false, message: "", onConfirm: () => {} });
  const history = useHistory();

  const handleAffectation = async (center) => {
    try {
      const session = await api.get(`/cohesion-center/${center._id}/cohort/${center.session}/session-phase1`);
      const response = await api.post(`/session-phase1/${session.data._id}/assign-young/${young._id}`);
      if (!response.ok) return toastr.error("Oups, une erreur est survenue lors de l'affectation du jeune", translate(response.code));
      toastr.success(`${response.young.firstName} a été affecté(e) au centre ${center.name} !`);
      setSearchedValue("");
      onAffect?.(response.data, response.young);
      history.go(0);
      setModal((prevState) => ({ ...prevState, isOpen: false }));
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
      <ReactiveBase url={`${apiURL}/es`} app="edit-cohesioncenter" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ flex: 2, position: "relative" }}>
          <Filter>
            <DataSearch
              showIcon={false}
              placeholder="Rechercher par nom de centre, code postal, departement..."
              componentId="SEARCH"
              dataField={["name", "city", "zip", "code", "department"]}
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
                    <BottomResultStats>{getResultLabel(e, 3)}</BottomResultStats>
                  </div>
                );
              }}
              render={({ data }) => (
                <Table>
                  <thead>
                    <tr>
                      <th>Centre</th>
                      <th>Séjour</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((hit) => (
                      <HitCenter
                        key={hit._id}
                        hit={hit}
                        onSend={(center) =>
                          setModal({
                            isOpen: true,
                            title: "Changement de centre",
                            message: (
                              <p>
                                Voulez-vous affecter <b>{young.firstName}</b> au centre <b>{center.name}</b> au séjour de <b>{center.session}</b>.
                              </p>
                            ),
                            onConfirm: () => handleAffectation(center),
                          })
                        }
                      />
                    ))}
                  </tbody>
                </Table>
              )}
            />
          </ResultTable>
        </div>
      </ReactiveBase>
      <ModalConfirm
        isOpen={modal.isOpen}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        onCancel={() => setModal((prevState) => ({ ...prevState, isOpen: false }))}
      />
    </>
  );
}

const HitCenter = ({ hit, onSend }) => {
  const [selectedSession, setSelectedSession] = useState(hit.cohorts[0]);
  const options = hit.cohorts.filter((cohort) => cohort !== selectedSession);

  const [sessions, setSessions] = useState();

  useEffect(() => {
    try {
      (async () => {
        const { data } = await api.get(`/cohesion-center/${hit._id}/session-phase1`);
        setSessions(data);
      })();
    } catch (e) {
      console.log(e);
    }
  }, [hit]);

  if (!sessions) return null;

  return (
    <tr>
      <td>
        <MultiLine>
          <span className="font-bold text-black">{hit.name}</span>
          <p>{`${hit.city || ""} • ${hit.department || ""}`}</p>
        </MultiLine>
      </td>
      <td>
        <ActionBox>
          <UncontrolledDropdown disabled={!options.length} setActiveFromChild>
            <DropdownToggle tag="button">
              {selectedSession}
              {!!options.length && <Chevron color={"#444"} />}
            </DropdownToggle>
            <DropdownMenu>
              {options.map((cohort) => {
                return (
                  <DropdownItem key={cohort} className="dropdown-item" onClick={() => setSelectedSession(cohort)}>
                    {cohort}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </UncontrolledDropdown>
        </ActionBox>
      </td>
      {sessions.find((session) => session.cohort === selectedSession)?.placesLeft <= 0 ? (
        <td>
          <div className="font-bold border-[1px] rounded-lg text-center p-1 bg-white text-[#555]">Complet</div>
        </td>
      ) : (
        <td onClick={(e) => e.stopPropagation()}>
          <PanelActionButton onClick={() => onSend({ ...hit, session: selectedSession })} title="Affecter à ce centre" />
        </td>
      )}
    </tr>
  );
};

const ActionBox = styled.div`
  .dropdown-menu {
    max-width: 200px;
    min-width: 200px;
    a,
    div {
      white-space: nowrap;
      font-size: 14px;
      :hover {
        color: inherit;
      }
    }
  }
  button {
    background-color: #fff;
    border: 1px solid #ced4da;
    color: #495057;
    display: inline-flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    border-radius: 0.5rem;
    padding: 0 0 0 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    outline: 0;
    width: 100%;
    max-width: 200px;
    min-width: 200px;
    min-height: 34px;
    .edit-icon {
      height: 17px;
      margin-right: 10px;
      path {
        fill: ${({ color }) => `${color}`};
      }
    }
    .down-icon {
      margin-left: auto;
      padding: 7px 15px;
      margin-left: 15px;
      svg {
        height: 10px;
      }
      svg polygon {
        fill: ${({ color }) => `${color}`};
      }
    }
  }
  .dropdown-item {
    border-radius: 0;
    background-color: transparent;
    border: none;
    color: #767676;
    white-space: nowrap;
    font-size: 14px;
    padding: 5px 15px;
    font-weight: 400;
    :hover {
      background-color: #f3f3f3;
    }
  }
`;
