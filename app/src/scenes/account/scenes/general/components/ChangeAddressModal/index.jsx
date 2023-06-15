import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import Modal from "../../../../../../components/ui/modals/Modal";
import ChangeAddressConfirmModalContent from "./ChangeAddressConfirmModalContent";
import AddressFormModalContent from "./AddressFormModalContent";
import ContactSupportModalContent from "./ContactSupportModalContent";
import ChangedDepartmentInfoModalContent from "./ChangedDepartmentInfoModalContent";
import ChooseCohortModalContent from "./ChooseCohortModalContent";
import { updateYoung } from "../../../../../../services/young.service";
import API from "../../../../../../services/api";
import { capture } from "../../../../../../sentry";
import { getCohortPeriod, isCohortDone } from "../../../../../../utils/cohorts";
import { YOUNG_STATUS_PHASE1, YOUNG_STATUS, translate, calculateAge, translateCohort } from "snu-lib";
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
  const [currentCohort, setCurrentCohort] = useState();
  const [newCohortName, setNewCohortName] = useState();
  const [newAddress, setNewAddress] = useState();
  const [step, setStep] = useState(changeAddressSteps.CONFIRM);
  const [isLoading, setLoading] = useState(false);
  const [availableCohorts, setAvailableCohorts] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (young) {
      getCohort();
    }
  }, [young]);

  const getCohort = async () => {
    try {
      setLoading(true);
      const { ok, data } = await API.get(`/cohort/${young.cohort}`);
      if (ok) setCurrentCohort(data);
      else throw new Error(`cohort ${young.cohort} not found`);
    } catch (e) {
      capture(e);
    } finally {
      setLoading(false);
    }
  };

  const onAddressEntered = async (newAddress) => {
    setNewAddress(newAddress);
    if (
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

  const checkInscriptionGoal = async (cohortName, department = newAddress.department) => {
    setLoading(true);
    try {
      const res = await api.get(`/inscription-goal/${cohortName}/department/${department}/reached`);
      if (!res.ok) throw new Error(res);
      const isGoalReached = res.data;
      if (isGoalReached && young.status === YOUNG_STATUS.VALIDATED) {
        setStep(changeAddressSteps.COMPLEMENTARY_LIST);
      } else {
        updateAddress(newAddress, isGoalReached ? YOUNG_STATUS.WAITING_LIST : YOUNG_STATUS.VALIDATED);
      }
    } catch (error) {
      capture(error);
      toastr.error("Oups, une erreur est survenue", translate(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getAvailableCohorts = async (address = {}) => {
    try {
      setLoading(true);
      const { data } = await api.post("/cohort-session/eligibility/2023/", { ...young, ...address });
      const isArray = Array.isArray(data);
      let cohorts = [];
      // get all available cohorts except the current one
      if (isArray) {
        const isCurrentCohortAvailable = data.find((cohort) => cohort.name === young.cohort);
        if (isCurrentCohortAvailable) return checkInscriptionGoal(young.cohort);
        cohorts = data.map((cohort) => cohort.name).filter((cohort) => cohort !== young.cohort);
      }
      // if no available cohort, check eligibility and add "à venir" cohort
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
    } finally {
      setLoading(false);
    }
  };

  const chooseNewCohort = async (cohort) => {
    setNewCohortName(cohort);
    if (cohort === "à venir") {
      updateAddress(newAddress, young.status, cohort);
    } else {
      checkInscriptionGoal(cohort);
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

  const cantChangeAddress = young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && !isCohortDone(young.cohort);

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
          {step === changeAddressSteps.NEW_ADDRESS && <AddressFormModalContent onClose={onClose} onConfirm={onAddressEntered} isLoading={isLoading} />}
          {step === changeAddressSteps.COMPLEMENTARY_LIST && (
            <ChangedDepartmentInfoModalContent
              onConfirm={() => updateAddress(newAddress, YOUNG_STATUS.WAITING_LIST)}
              cohortPeriod={getCohortPeriod(currentCohort)}
              type="COMPLEMENTARY_LIST"
              isLoading={isLoading}
            />
          )}
          {step === changeAddressSteps.NOT_ELIGIBLE && (
            <ChangedDepartmentInfoModalContent
              onConfirm={() => updateAddress(newAddress, YOUNG_STATUS.NOT_ELIGIBLE)}
              cohortPeriod={getCohortPeriod(currentCohort)}
              type="NOT_ELIGIBLE"
              isLoading={isLoading}
            />
          )}
          {step === changeAddressSteps.CHOOSE_COHORT && (
            <ChooseCohortModalContent
              onConfirm={chooseNewCohort}
              cohorts={availableCohorts.map((cohort) => ({ value: cohort, label: `Séjour ${translateCohort(cohort)}` }))}
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
