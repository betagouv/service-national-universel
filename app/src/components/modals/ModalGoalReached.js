import React, { useState } from "react";
import { Modal } from "reactstrap";
import validator from "validator";
import { toastr } from "react-redux-toastr";
import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";

export default ({ onChange, cb }) => {
  const [mail, setMail] = useState("");

  const handleClick = async () => {
    if (!mail) return onChange();
    if (!validator.isEmail(mail))
      return toastr.error("Oups, une erreur s'est produite", "Il semblerait que le format de votre mail soit invalide. Merci de réessayer", { timeOut: 3000 });
    return cb(mail);
  };

  return (
    <Modal isOpen={true} toggle={onChange}>
      <ModalContainer>
        <img src={require("../../assets/close.svg")} height={10} onClick={onChange} />
        <Header>avertissement</Header>
        <Content>
          <h1>Le SNU est victime de son succès dans votre département</h1>
          <p>
            Vous ne pouvez plus vous inscrire. Toutefois, n'hésitez pas à nous laisser votre adresse e-mail pour être recontacté par nos services dans le cadre de promotions
            d’offres d’engagement des jeunes.
          </p>
        </Content>
        <Footer>
          <input
            type="email"
            onInput={(e) => {
              setMail(e.target.value);
            }}
            placeholder="Votre e-mail"
          />
          <ModalButton color="#5245cc" onClick={handleClick}>
            Être alerté
          </ModalButton>
          <p onClick={onChange}>Annuler</p>
        </Footer>
      </ModalContainer>
    </Modal>
  );
};
