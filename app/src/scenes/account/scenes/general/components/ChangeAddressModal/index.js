import React, { useState, useEffect } from "react";
import Modal from "../../../../../../components/ui/modals/Modal";
import ChangeAddressConfirmModalContent from "./ChangeAddressConfirmModalContent";
import AddressFormModalContent from "./AddressFormModalContent";
import ContactSupportModalContent from "./ContactSupportModalContent";
import ChangedDepartmentInfoModalContent from "./ChangedDepartmentInfoModalContent";
import ChoseCohortModalContent from "./ChoseCohortModalContent";
import API from "../../../../../../services/api";
import { capture } from "../../../../../../sentry";
import { getCohortPeriod } from "../../../../../../utils/cohorts";

const changeAddressSteps = {
  CONFIRM: "CONFIRM",
  NEW_ADDRESS: "NEW_ADDRESS",
};

const ChangeAddressModal = ({ onClose, isOpen, young }) => {
  const [cohort, setCohort] = useState();
  const [step, setStep] = useState(changeAddressSteps.CONFIRM);
  useEffect(() => {
    if (young && young.cohort) {
      getCohort();
    }
  }, [young]);

  const getCohort = async () => {
    try {
      const { ok, data } = await API.get(`/cohort/${young.cohort}`);
      if (ok) setCohort(data);
      else throw new Error(`cohort ${young.cohort} not found`);
    } catch (e) {
      capture(e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setStep(changeAddressSteps.CONFIRM);
        onClose();
      }}>
      {step === changeAddressSteps.CONFIRM && <ChangeAddressConfirmModalContent onCancel={onClose} onConfirm={() => setStep(changeAddressSteps.NEW_ADDRESS)} />}
      {step === changeAddressSteps.NEW_ADDRESS && (
        <AddressFormModalContent
          onClose={() => {
            setStep(changeAddressSteps.CONFIRM);
            onClose();
          }}
        />
      )}
      {/* <AddressFormModalContent onClose={onClose} /> */}
      {/* <ContactSupportModalContent onClose={onClose} /> */}
      {/* <ChangedDepartmentInfoModalContent onClose={onClose} cohortPeriod={getCohortPeriod(cohort)} type="NO_COHORT" /> */}
      {/* <ChangedDepartmentInfoModalContent onClose={onClose} cohortPeriod={getCohortPeriod(cohort)} type="COMPLEMENTARY_LIST" /> */}
      {/* <ChoseCohortModalContent onClose={onClose} cohortPeriod={getCohortPeriod(cohort)} type="COMPLEMENTARY_LIST" /> */}
    </Modal>
  );
};

export default ChangeAddressModal;
