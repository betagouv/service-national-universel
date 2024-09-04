import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import Modal from "../../../../../../components/ui/modals/Modal";
import ChangeAddressConfirmModalContent from "./ChangeAddressConfirmModalContent";
import AddressFormModalContent from "./AddressFormModalContent";
import ContactSupportModalContent from "./ContactSupportModalContent";
import ChangedDepartmentInfoModalContent from "./ChangedDepartmentInfoModalContent";
import ChooseCohortModalContent from "./ChooseCohortModalContent";
import { updateYoung } from "../../../../../../services/young.service";
import { capture } from "../../../../../../sentry";
import { isCohortDone } from "../../../../../../utils/cohorts";
import { YOUNG_STATUS_PHASE1, YOUNG_STATUS, translate, calculateAge, getCohortPeriod, isCle } from "snu-lib";
import api from "../../../../../../services/api";
import { setYoung } from "../../../../../../redux/auth/actions";

const changeAddressSteps = {
  CONFIRM: "CONFIRM",
  NEW_ADDRESS: "NEW_ADDRESS",
  COMPLEMENTARY_LIST: "COMPLEMENTARY_LIST",
  CHOOSE_COHORT: "CHOOSE_COHORT",
  NO_AVAILABLE_COHORT: "NO_AVAILABLE_COHORT",
  NOT_ELIGIBLE: "NOT_ELIGIBLE",
};

const ChangeAddressModal = ({ onClose, isOpen, young }) => {
  const currentCohort = young.cohortData;
  const [newCohortName, setNewCohortName] = useState();
  const [newAddress, setNewAddress] = useState();
  const [step, setStep] = useState(changeAddressSteps.CONFIRM);
  const [isLoading, setLoading] = useState(false);
  const [availableCohorts, setAvailableCohorts] = useState([]);

  const dispatch = useDispatch();

  const onCancel = () => {
    setStep(changeAddressSteps.CONFIRM);
    setNewCohortName(undefined);
    setNewAddress(undefined);
    onClose();
  };

  const onAddressEntered = async (newAddress) => {
    setNewAddress(newAddress);
    if (
      !isCle(young) &&
      newAddress.department !== young.department &&
      young.cohort !== "à venir" &&
      young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION &&
      (young.status === YOUNG_STATUS.VALIDATED || young.status === YOUNG_STATUS.WAITING_LIST)
    ) {
      await getAvailableCohorts(newAddress);
    } else {
      updateAddress(newAddress);
    }
  };

  const checkIfGoalIsReached = async (cohortName, address) => {
    try {
      setLoading(true);
      const res = await api.get(`/inscription-goal/${cohortName}/department/${address.department}/reached`);
      if (!res.ok) throw new Error(res);
      return res.data;
    } catch (error) {
      capture(error);
      toastr.error("Oups, une erreur est survenue", translate(error.code));
    } finally {
      setLoading(false);
    }
  };

  const checkInscriptionGoal = async (cohortName, address) => {
    try {
      const isGoalReached = await checkIfGoalIsReached(cohortName, address);
      if (isGoalReached && young.status === YOUNG_STATUS.VALIDATED) {
        setStep(changeAddressSteps.COMPLEMENTARY_LIST);
      } else {
        updateAddress(address, isGoalReached ? YOUNG_STATUS.WAITING_LIST : YOUNG_STATUS.VALIDATED);
      }
    } catch (error) {
      capture(error);
      toastr.error("Oups, une erreur est survenue", translate(error.code));
    }
  };

  const fetchAvailableCohorts = async (address = {}) => {
    try {
      setLoading(true);
      const { data } = await api.post("/cohort-session/eligibility/2023?timeZoneOffset=${new Date().getTimezoneOffset()}", {
        grade: young.grade,
        birthdateAt: young.birthdateAt,
        ...address,
      });
      return data;
    } catch (error) {
      capture(error);
      toastr.error("Oups, une erreur est survenue", translate(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getAvailableCohorts = async (address = {}) => {
    try {
      const data = await fetchAvailableCohorts(address);
      const isArray = Array.isArray(data);
      let cohorts = [];
      // get all available cohorts except the current one
      if (isArray) {
        const isCurrentCohortAvailable = data.find((cohort) => cohort.name === young.cohort);
        if (isCurrentCohortAvailable) return checkInscriptionGoal(young.cohort, address);
        cohorts = data.map((cohort) => cohort.name).filter((cohort) => cohort !== young.cohort);
      }
      // if no available cohort, check eligibility and add "à venir" cohort
      // @todo : this date should come from the db
      if (cohorts.length === 0 && calculateAge(young.birthdateAt, new Date("2023-09-30")) < 18) {
        cohorts.push("à venir");
      }
      // if any available cohort, show modal to choose one
      if (cohorts.length > 0) {
        setAvailableCohorts(cohorts);
        setStep(changeAddressSteps.CHOOSE_COHORT);
        // if no available cohort show modal to inform user
      } else {
        setStep(changeAddressSteps.NOT_ELIGIBLE);
      }
    } catch (error) {
      capture(error);
      toastr.error("Oups, une erreur est survenue", translate(error.code));
    }
  };

  const chooseNewCohort = async (cohort) => {
    setNewCohortName(cohort);
    if (cohort === "à venir") {
      updateAddress(newAddress, young.status, cohort);
    } else {
      checkInscriptionGoal(cohort, newAddress);
    }
  };

  const updateAddress = async (address = newAddress, status = young.status, cohort = newCohortName || young.cohort) => {
    try {
      setLoading(true);
      const { title, message, data: updatedYoung } = await updateYoung("address", { ...address, status, cohort });
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

  const cantChangeAddress = young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && !isCohortDone(young.cohortData);

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
          {step === changeAddressSteps.NEW_ADDRESS && <AddressFormModalContent onCancel={onCancel} onConfirm={onAddressEntered} isLoading={isLoading} />}
          {step === changeAddressSteps.COMPLEMENTARY_LIST && (
            <ChangedDepartmentInfoModalContent
              onCancel={onCancel}
              onConfirm={() => updateAddress(newAddress, YOUNG_STATUS.WAITING_LIST)}
              cohortPeriod={getCohortPeriod(currentCohort)}
              type="COMPLEMENTARY_LIST"
              isLoading={isLoading}
            />
          )}
          {step === changeAddressSteps.NOT_ELIGIBLE && (
            <ChangedDepartmentInfoModalContent
              onCancel={onCancel}
              onConfirm={() => updateAddress(newAddress, YOUNG_STATUS.NOT_ELIGIBLE)}
              cohortPeriod={getCohortPeriod(currentCohort)}
              type="NOT_ELIGIBLE"
              isLoading={isLoading}
            />
          )}
          {step === changeAddressSteps.CHOOSE_COHORT && (
            <ChooseCohortModalContent
              onCancel={onCancel}
              onConfirm={chooseNewCohort}
              cohorts={availableCohorts.map((cohort) => ({ value: cohort, label: cohort === "à venir" ? "Séjour à venir" : `Séjour ${getCohortPeriod(young.cohortData)}` }))}
              currentCohortPeriod={getCohortPeriod(currentCohort)}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </Modal>
  );
};

export default ChangeAddressModal;
