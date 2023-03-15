import React from "react";
import Modal from "../ui/modals/Modal";
import ButtonLinkPrimary from "../ui/buttons/ButtonLinkPrimary";
import YellowWarning from "../../assets/YellowWarning";
import ExternalLinkPrimary from "../ui/links/ExternalLinkPrimary";
import { appURL } from "../../config";

const ModalCGU = ({ isOpen, onAccept: handleAccept }) => (
  <Modal isOpen={isOpen} className="w-[512px] bg-white rounded-xl p-6">
    <Modal.Header>
      <YellowWarning />
      <h2 className="my-0 text-xl font-bold">Conditions générales d&apos;utilisation</h2>
    </Modal.Header>
    <Modal.Content>
      <p className="mb-1">Les conditions générales d&apos;utilisation du SNU ont été mises à jour. Vous devez les accepter afin de continuer à accéder à votre compte SNU.</p>
      <p>
        <ExternalLinkPrimary title="Consulter les CGU" href={`${appURL}/conditions-generales-utilisation`} target="_blank" rel="noreferrer" />
      </p>
    </Modal.Content>
    <Modal.Footer>
      <ButtonLinkPrimary to="changer-de-sejour" className="drop-shadow-none shadow-ninaBlue" onClick={handleAccept}>
        J&apos;accepte les conditions générales d&apos;utilisation
      </ButtonLinkPrimary>
    </Modal.Footer>
  </Modal>
);

export default ModalCGU;
