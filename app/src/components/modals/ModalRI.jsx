import React from "react";
import Modal from "../ui/modals/Modal";
import ButtonPrimary from "../ui/buttons/ButtonPrimary";
import DangerCircled from "../../assets/icons/DangerCircled";

const ModalRI = ({ isOpen = false, onAccept: handleAccept = () => {} }) => {
  return (
    <Modal isOpen={isOpen} className="w-[512px] rounded-xl bg-white p-6">
      <Modal.Header>
        <DangerCircled />
        <h2 className="my-0 text-xl font-bold">Le règlement intérieur a été mis à jour</h2>
      </Modal.Header>
      <Modal.Content>
        Dans le cadre du SNU, nous vous demandons de bien vouloir accepter le nouveau{" "}
        <a
          className="text-blue-800 underline"
          href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/SNU-reglement-interieur-2024.pdf"
          target="_blank"
          rel="noreferrer">
          règlement intérieur
        </a>
        .
      </Modal.Content>
      <Modal.Footer>
        <ButtonPrimary className="w-full shadow-ninaBlue drop-shadow-none" onClick={handleAccept}>
          ✓ J&apos;accepte le règlement intérieur
        </ButtonPrimary>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRI;
