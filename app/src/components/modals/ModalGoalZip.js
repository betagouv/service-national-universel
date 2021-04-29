import React, { useState } from "react";
import { Modal } from "reactstrap";
import { toastr } from "react-redux-toastr";
import { ModalContainer, Content, Footer, Header } from "./Modal";
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
        return toastr.error("Oups, une erreur s'est produite", "Il semblerait que le format soit invalide. Merci de réessayer");
      }
      max = f?.max;
    }
    if (!ok) return toastr.error("Oups, une erreur s'est produite", translate(code));
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
            placeholder="Code Postal (ex : 44000)"
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
