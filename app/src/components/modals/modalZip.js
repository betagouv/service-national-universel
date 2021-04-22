import React, { useState } from "react";
import { Modal } from "reactstrap";
import styled from "styled-components";
import toastr from "react-redux-toastr";

import { departmentLookUp } from "../../utils";
import ModalButton from "../buttons/ModalButton";
import api from "../../services/api";

export default ({ onChange, cb }) => {
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);

  // todo: refacto ! duplicated functions /scenes/dashboard/inscription/goals
  async function fetch2020WaitingAffectation(departement) {
    const queries = [];
    queries.push({ index: "young", type: "_doc" });
    queries.push({
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": "2020" } }, { term: { "statusPhase1.keyword": "WAITING_AFFECTATION" } }] } },
      aggs: { status: { terms: { field: "statusPhase1.keyword" } } },
      size: 0,
    });

    if (departement) queries[1].query.bool.filter.push({ term: { "department.keyword": departement } });

    const { responses } = await api.esQuery(queries);
    const m = api.getAggregations(responses[0]);
    return m.WAITING_AFFECTATION || 0;
  }

  async function fetch2021Validated(departement) {
    const queries = [];
    queries.push({ index: "young", type: "_doc" });
    queries.push({
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": "2021" } }, { term: { "status.keyword": "VALIDATED" } }] } },
      aggs: { status: { terms: { field: "status.keyword" } } },
      size: 0,
    });

    if (departement) queries[1].query.bool.filter.push({ term: { "department.keyword": departement } });

    const { responses } = await api.esQuery(queries);
    const m = api.getAggregations(responses[0]);
    return m.VALIDATED || 0;
  }

  const getInscriptions = async (d) => {
    const a = await fetch2020WaitingAffectation(d);
    const b = await fetch2021Validated(d);
    return a + b;
  };

  const getInscriptionGoalReached = async (departement) => {
    const { data, ok, code } = await api.get("/inscription-goal");
    let v = 0;
    if (data) v = data.filter((d) => d.department === departement)[0].max;
    if (!ok) return toastr.error("nope");
    return v > 0 && (await getInscriptions(departement)) >= v;
  };

  const handleClick = async () => {
    //get department number
    let depart = zip.substr(0, 2);
    if (["97", "98"].includes(depart)) {
      depart = zip.substr(0, 3);
    }
    if (depart === "20") {
      depart = zip.substr(0, 2);
      if (!["2A", "2B"].includes(depart)) depart = "2B";
    }

    const d = departmentLookUp[depart];
    console.log(d);
    return cb(await getInscriptionGoalReached(d));
  };

  return (
    <Modal isOpen={true} toggle={onChange}>
      <ModalContainer>
        <img src={require("../../assets/close.svg")} height={10} onClick={onChange} />
        <Header>première étape</Header>
        <Content>
          <h1>Renseignez votre code postal</h1>
        </Content>
        <Footer>
          <input
            type="text"
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
              setZip(e.target.value);
            }}
            placeholder="Code Postal"
          ></input>
          <ModalButton color="#5245cc" onClick={handleClick}>
            Continuer
          </ModalButton>
          <p onClick={onChange}>Annuler</p>
        </Footer>
      </ModalContainer>
    </Modal>
  );
};

const ModalContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #fff;
  padding-top: 2rem;
  border-radius: 1rem;
  overflow: hidden;
  img {
    position: absolute;
    right: 0;
    top: 0;
    margin: 1rem;
    cursor: pointer;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #ef4036;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  padding-top: 0;
  h1 {
    font-size: 1.4rem;
    color: #000;
  }
  p {
    font-size: 1rem;
    margin: 0;
    color: #6e757c;
  }
`;

const Footer = styled.div`
  background-color: #f3f3f3;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  input {
    text-align: center;
    min-width: 80%;
    max-width: 80%;
    border: #696969;
    border-radius: 10px;
    padding: 7px 30px;
  }
  > * {
    margin: 0.3rem 0;
  }
  p {
    color: #696969;
    font-size: 0.8rem;
    font-weight: 400;
    :hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
`;
