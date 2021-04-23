import React, { useState } from "react";
import { Modal } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";

import { departmentLookUp, translate } from "../../utils";
import ModalButton from "../buttons/ModalButton";
import api from "../../services/api";

export default ({ onChange, cb }) => {
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);

  const getInscriptions = async (department) => {
    const { data, ok, code } = await api.post(`/inscription-goal/current`, { department });
    return data;
  };

  const getInscriptionGoalReachedNormalized = async (departement) => {
    setLoading(true);
    const { data, ok, code } = await api.get("/inscription-goal");
    let max = 0;
    if (data) {
      const f = data.filter((d) => d.department === departement)[0];
      if (!f || f.length === 0) {
        setLoading(false);
        return toastr.error("Oups, une erreur s'est produite", "Il semblerait que le format soit invalide. Merci de ressayer");
      }
      max = f?.max;
    }
    if (!ok) return toastr.error("Oups, une erreur s'eset produite", translate(code));
    const nbYoungs = await getInscriptions(departement);
    setLoading(false);
    return max > 0 && { ...nbYoungs, max };
  };

  const handleClick = async () => {
    let n = zip.substr(0, 2);
    if (["97", "98"].includes(n)) {
      n = zip.substr(0, 3);
    }
    if (n === "20") {
      if (!["2A", "2B"].includes(n)) n = "2B";
    }
    const depart = departmentLookUp[n];
    return cb(zip, await getInscriptionGoalReachedNormalized(depart));
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
            type="tel"
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
              setZip(e.target.value);
            }}
            placeholder="Code Postal"
          ></input>
          <ModalButton loading={loading} color="#5245cc" onClick={handleClick}>
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
