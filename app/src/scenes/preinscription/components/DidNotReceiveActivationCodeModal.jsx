import React from "react";
import { emailValidationNoticeModal } from "./Modals";
import DidNotReceiveActivationReasons from "@/scenes/account/scenes/general/components/DidNotReceiveActivationReasons";

const DidNotReceiveActivationCodeModal = ({ onRequestNewToken }) => {
  const [loading, setLoading] = React.useState(false);

  async function handleClick() {
    setLoading(true);
    onRequestNewToken();
    setLoading(false);
  }

  return (
    <emailValidationNoticeModal.Component
      title="Je n'ai pas reçu le code d'activation par e-mail"
      iconId="fr-icon-arrow-right-line"
      buttons={[
        {
          children: "Recevoir un nouveau code d’activation",
          onClick: handleClick,
          disabled: loading,
        },
      ]}>
      <p>Si vous ne recevez pas le mail, nous vous invitons à vérifier que&nbsp;:</p>
      <DidNotReceiveActivationReasons />
    </emailValidationNoticeModal.Component>
  );
};

export default DidNotReceiveActivationCodeModal;
