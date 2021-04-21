import React, { useEffect, useState } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";

import api from "../services/api";

import { translate, YOUNG_STATUS, YOUNG_PHASE, YOUNG_STATUS_COLORS } from "../utils";
import { toastr } from "react-redux-toastr";
import matomo from "../services/matomo";

import ModalCorrection from "./modals/ModalCorrection";
import ModalRefused from "./modals/ModalRefused";
import ModalWithdrawn from "./modals/ModalWithdrawn";
import ModalGoal from "./modals/ModalGoal";
import Chevron from "./Chevron";

export default ({ hit, options = Object.keys(YOUNG_STATUS), statusName = "status", phase = YOUNG_PHASE.INSCRIPTION }) => {
  const [modal, setModal] = useState(null);
  const [young, setYoung] = useState(null);
  const user = useSelector((state) => state.Auth.user);

  // todo: refacto ! duplicated functions /scenes/dashboard/inscription/goals
  async function fetch2020WaitingAffectation() {
    const queries = [];
    queries.push({ index: "young", type: "_doc" });
    queries.push({
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": "2020" } }, { term: { "statusPhase1.keyword": "WAITING_AFFECTATION" } }] } },
      aggs: { status: { terms: { field: "statusPhase1.keyword" } } },
      size: 0,
    });

    if (young.region) queries[1].query.bool.filter.push({ term: { "region.keyword": young.region } });
    if (young.department) queries[1].query.bool.filter.push({ term: { "department.keyword": young.department } });

    const { responses } = await api.esQuery(queries);
    const m = api.getAggregations(responses[0]);
    return m.WAITING_AFFECTATION || 0;
  }

  async function fetch2021Validated() {
    const queries = [];
    queries.push({ index: "young", type: "_doc" });
    queries.push({
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": "2021" } }, { term: { "status.keyword": "VALIDATED" } }] } },
      aggs: { status: { terms: { field: "status.keyword" } } },
      size: 0,
    });

    if (young.region) queries[1].query.bool.filter.push({ term: { "region.keyword": young.region } });
    if (young.department) queries[1].query.bool.filter.push({ term: { "department.keyword": young.department } });

    const { responses } = await api.esQuery(queries);
    const m = api.getAggregations(responses[0]);
    return m.VALIDATED || 0;
  }

  const getInscriptions = async () => {
    const a = await fetch2020WaitingAffectation();
    const b = await fetch2021Validated();
    return a + b;
  };

  const getInscriptionGoalReached = async (departement) => {
    const { data, ok, code } = await api.get(`/inscription-goal/departement/${departement}`);
    if (!ok) return toastr.error("nope");
    return (await getInscriptions()) >= data.max;
  };

  useEffect(() => {
    (async () => {
      const id = hit && hit._id;
      if (!id) return setYoung(null);
      const { data } = await api.get(`/referent/young/${id}`);
      setYoung(data);
    })();
  }, [hit]);

  if (!young) return <div />;

  const handleClickStatus = async (status) => {
    if (!confirm("Êtes-vous sûr(e) de vouloir modifier le statut de ce profil?\nUn email sera automatiquement envoyé à l'utlisateur.")) return;
    if ([YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WITHDRAWN].includes(status)) return setModal(status);
    if (status === YOUNG_STATUS.VALIDATED && phase === YOUNG_PHASE.INSCRIPTION) {
      const goalReached = await getInscriptionGoalReached(young.department);
      if (goalReached) return setModal("goal");
    }
    setStatus(status);
  };

  const setStatus = async (status, note) => {
    const prevStatus = young.status;
    young.historic.push({ phase, userName: `${user.firstName} ${user.lastName}`, userId: user._id, status, note });
    young[statusName] = status;
    young.lastStatusAt = Date.now();
    if (status === "WITHDRAWN" && note) young.withdrawnMessage = note;
    if (status === YOUNG_STATUS.VALIDATED && phase === YOUNG_PHASE.INTEREST_MISSION) young.phase = YOUNG_PHASE.CONTINUE;
    try {
      // we decided to let the validated youngs in the INSCRIPTION phase
      // referents use the export and need ALL the youngs of the current year
      // we'll pass every youngs currently in INSCRIPTION in COHESION_STAY once the campaign is done (~20 april 2021)

      // if (status === YOUNG_STATUS.VALIDATED && young.phase === YOUNG_PHASE.INSCRIPTION) {
      //   young.phase = YOUNG_PHASE.COHESION_STAY;
      // }

      const { ok, code, data: newYoung } = await api.put(`/referent/young/${young._id}`, young);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));

      if (status === YOUNG_STATUS.VALIDATED && phase === YOUNG_PHASE.INSCRIPTION) {
        matomo.logEvent("status_update", YOUNG_STATUS.VALIDATED);
        window.lumiere("sendEvent", "status_update", YOUNG_STATUS.VALIDATED, { prevStatus, status: YOUNG_STATUS.VALIDATED }); // cat, action, props
        await api.post(`/referent/email/validate/${young._id}`, { subject: "Inscription validée", prevStatus });
      }
      if (status === YOUNG_STATUS.REFUSED) {
        matomo.logEvent("status_update", YOUNG_STATUS.REFUSED);
        window.lumiere("sendEvent", "status_update", YOUNG_STATUS.REFUSED, { prevStatus, status: YOUNG_STATUS.REFUSED }); // cat, action, props
      }
      if (status === YOUNG_STATUS.WAITING_LIST) {
        matomo.logEvent("status_update", YOUNG_STATUS.WAITING_LIST);
        window.lumiere("sendEvent", "status_update", YOUNG_STATUS.WAITING_LIST, { prevStatus, status: YOUNG_STATUS.WAITING_LIST }); // cat, action, props
        await api.post(`/referent/email/waiting_list/${young._id}`);
      }
      setYoung(newYoung);
      toastr.success("Mis à jour!");
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  };

  return (
    <>
      {modal === YOUNG_STATUS.WAITING_CORRECTION && (
        <ModalCorrection
          value={young}
          onChange={() => setModal(false)}
          onSend={(msg) => {
            setStatus(YOUNG_STATUS.WAITING_CORRECTION, msg);
            setModal(null);
          }}
        />
      )}
      {modal === YOUNG_STATUS.REFUSED && (
        <ModalRefused
          value={young}
          onChange={() => setModal(false)}
          onSend={(msg) => {
            setStatus(YOUNG_STATUS.REFUSED, msg);
            setModal(null);
          }}
        />
      )}
      {modal === YOUNG_STATUS.WITHDRAWN && (
        <ModalWithdrawn
          value={young}
          onChange={() => setModal(false)}
          onSend={(msg) => {
            setStatus(YOUNG_STATUS.WITHDRAWN, msg);
            setModal(null);
          }}
        />
      )}
      {modal === "goal" && (
        <ModalGoal
          onChange={() => setModal(false)}
          onValidate={() => {
            setStatus(YOUNG_STATUS.VALIDATED);
            setModal(null);
          }}
          callback={() => {
            setStatus(YOUNG_STATUS.WAITING_LIST);
            setModal(null);
          }}
        />
      )}
      <ActionBox color={YOUNG_STATUS_COLORS[young[statusName]]}>
        <UncontrolledDropdown setActiveFromChild>
          <DropdownToggle tag="button">
            {translate(young[statusName])}
            <Chevron color={YOUNG_STATUS_COLORS[young[statusName]]} />
          </DropdownToggle>
          <DropdownMenu>
            {options.map((status) => {
              return (
                <DropdownItem key={status} className="dropdown-item" onClick={() => handleClickStatus(status)}>
                  {translate(status)}
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        </UncontrolledDropdown>
        {/* <div>{JSON.stringify(young)}</div> */}
      </ActionBox>
    </>
  );
};

const ActionBox = styled.div`
  .dropdown-menu {
    max-width: 250px;
    min-width: 250px;
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
    ${({ color }) => `
      background-color: ${color}15;
      border: 1px solid ${color};
      color: ${color};
    `}
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
    max-width: 250px;
    min-width: 250px;
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
