import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import Modal from "../../../../../../components/ui/modals/Modal";
import ChangeAddressConfirmModalContent from "./ChangeAddressConfirmModalContent";
import AddressFormModalContent from "./AddressFormModalContent";
import { updateYoung } from "../../../../../../services/young.service";
import { capture } from "../../../../../../sentry";
import { setYoung } from "../../../../../../redux/auth/actions";

const changeAddressSteps = {
  CONFIRM: "CONFIRM",
  NEW_ADDRESS: "NEW_ADDRESS",
};

// GOO-65 (lot P23) : le changement d'adresse ne dépend plus de l'affectation ni de l'éligibilité au
// séjour (changement de séjour et objectifs d'inscription décommissionnés) : la nouvelle adresse est
// simplement enregistrée.
const ChangeAddressModal = ({ onClose, isOpen }) => {
  const [step, setStep] = useState(changeAddressSteps.CONFIRM);
  const [isLoading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const onCancel = () => {
    setStep(changeAddressSteps.CONFIRM);
    onClose();
  };

  const updateAddress = async (address) => {
    try {
      setLoading(true);
      const { title, message, data: updatedYoung } = await updateYoung("address", address);
      toastr.success(title, message);
      dispatch(setYoung(updatedYoung));
      setStep(changeAddressSteps.CONFIRM);
      onClose();
    } catch (error) {
      const { title, message } = error;
      toastr.error(title, message);
      capture(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Comme auparavant, un clic hors de la fenêtre ne l'interrompt pas en cours de saisie.
    <Modal isOpen={isOpen} onClose={() => {}}>
      {step === changeAddressSteps.CONFIRM && <ChangeAddressConfirmModalContent onCancel={onClose} onConfirm={() => setStep(changeAddressSteps.NEW_ADDRESS)} />}
      {step === changeAddressSteps.NEW_ADDRESS && <AddressFormModalContent onCancel={onCancel} onConfirm={updateAddress} isLoading={isLoading} />}
    </Modal>
  );
};

export default ChangeAddressModal;
