import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import Modal from "../../../../../../components/ui/modals/Modal";
import ChangeAddressConfirmModalContent from "./ChangeAddressConfirmModalContent";
import AddressFormModalContent from "./AddressFormModalContent";
import ContactSupportModalContent from "./ContactSupportModalContent";
import { updateYoung } from "../../../../../../services/young.service";
import { capture } from "../../../../../../sentry";
import { YOUNG_STATUS_PHASE1 } from "snu-lib";
import useCohort from "@/services/useCohort";
import { setYoung } from "../../../../../../redux/auth/actions";

const changeAddressSteps = {
  CONFIRM: "CONFIRM",
  NEW_ADDRESS: "NEW_ADDRESS",
};

const ChangeAddressModal = ({ onClose, isOpen, young }) => {
  const { isCohortDone } = useCohort();
  const [step, setStep] = useState(changeAddressSteps.CONFIRM);
  const [isLoading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const onCancel = () => {
    setStep(changeAddressSteps.CONFIRM);
    onClose();
  };

  // Seule l'adresse est envoyée : la cohorte et le statut ne se choisissent plus côté volontaire.
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

  const cantChangeAddress = young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && !isCohortDone;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (cantChangeAddress) onClose();
      }}>
      {cantChangeAddress ? (
        <ContactSupportModalContent onClose={onClose} />
      ) : (
        <>
          {step === changeAddressSteps.CONFIRM && <ChangeAddressConfirmModalContent onCancel={onClose} onConfirm={() => setStep(changeAddressSteps.NEW_ADDRESS)} />}
          {step === changeAddressSteps.NEW_ADDRESS && <AddressFormModalContent onCancel={onCancel} onConfirm={updateAddress} isLoading={isLoading} />}
        </>
      )}
    </Modal>
  );
};

export default ChangeAddressModal;
