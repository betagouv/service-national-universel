import React from "react";
import Modal from "../ui/modals/Modal";
import ButtonPrimary from "../ui/buttons/ButtonPrimary";
import ExternalLinkPrimary from "../ui/links/ExternalLinkPrimary";
import { appURL } from "../../config";
import Danger from "../../assets/icons/Danger";

const ModalCGU = ({ isOpen = false, onAccept: handleAccept = () => {} }) => (
  <Modal isOpen={isOpen} className="w-[512px] bg-white rounded-xl p-6">
    <Modal.Header>
      <Danger />
      <h2 className="my-0 text-xl font-bold">Conditions générales d&apos;utilisation</h2>
    </Modal.Header>
    <Modal.Content>
      <p className="mb-2">Les conditions générales d&apos;utilisation du SNU ont été mises à jour. Vous devez les accepter afin de continuer à accéder à votre compte SNU.</p>
      <p>
        <ExternalLinkPrimary title="Consulter les CGU" href={`${appURL}/conditions-generales-utilisation`} target="_blank" rel="noreferrer" />
      </p>
    </Modal.Content>
    <Modal.Footer>
      <ButtonPrimary className="drop-shadow-none shadow-ninaBlue w-full" onClick={handleAccept}>
        J&apos;accepte les conditions générales d&apos;utilisation
      </ButtonPrimary>
    </Modal.Footer>
  </Modal>
);

export default ModalCGU;
