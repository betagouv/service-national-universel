import React from "react";
import Modal from "../../../../../../components/ui/modals/Modal";
import AppLink from "../../../../../../components/ui/buttons/AppLink";

const ContactSupportModalContent = ({ onClose }) => {
  return (
    <>
      <Modal.Title>J’ai changé d’adresse</Modal.Title>
      <Modal.Subtitle>Vous avez changé d&apos;adresse alors que vous êtes affecté(e) à un séjour de cohésion, contactez le support : </Modal.Subtitle>
      <div>
        <AppLink to="/besoin-d-aide">Je contacte le support</AppLink>
      </div>
    </>
  );
};

export default ContactSupportModalContent;
