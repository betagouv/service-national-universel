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
import { YOUNG_STATUS_PHASE1, YOUNG_STATUS, translate, getCohortPeriod, isCle, CohortType, YoungType } from "snu-lib";
import useCohort from "@/services/useCohort";
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

const shouldChangeCohort = (young: YoungType, newAddress) => {
  return (
    !isCle(young) &&
    newAddress.department !== young.department &&
    young.cohort !== "à venir" &&
    young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION &&
    (young.status === YOUNG_STATUS.VALIDATED || young.status === YOUNG_STATUS.WAITING_LIST)
  );
};

const ChangeAddressModal = ({ onClose, isOpen, young }) => {
  const { cohort: currentCohort, isCohortDone } = useCohort();
  const [selectedCohortId, setSelectedCohortId] = useState<string>();
  const [availableCohorts, setAvailableCohorts] = useState<CohortType[]>([]);
  const cohortOptions =
    availableCohorts?.length > 0
      ? availableCohorts?.map((cohort) => ({ value: cohort._id, label: `Séjour ${getCohortPeriod(cohort)}` }))
      : { value: "à venir", label: "Séjour à venir" };
  const newCohort = selectedCohortId ? availableCohorts?.find((c) => c._id === selectedCohortId) : currentCohort;
  const [newAddress, setNewAddress] = useState<any>();
  const [step, setStep] = useState(changeAddressSteps.CONFIRM);
  const [isLoading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const onCancel = () => {
    setStep(changeAddressSteps.CONFIRM);
    setSelectedCohortId(undefined);
    setNewAddress(undefined);
    onClose();
  };

  const onAddressEntered = async (newAddress) => {
    setNewAddress(newAddress);
    if (shouldChangeCohort(young, newAddress)) {
      await getAvailableCohorts(newAddress);
    } else {
      updateAddress(newAddress);
    }
  };

  const checkIfGoalIsReached = async (cohortName: string, address) => {
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

  const checkInscriptionGoal = async (cohortName: string, address) => {
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

  const fetchAvailableCohorts = async (address) => {
    try {
      setLoading(true);
      const { data } = await api.post("/cohort-session/eligibility/2023", {
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
      let cohorts: CohortType[] = [];
      // get all available cohorts except the current one
      if (isArray) {
        const isCurrentCohortAvailable = data.find((cohort) => cohort.name === young.cohort);
        if (isCurrentCohortAvailable) return checkInscriptionGoal(young.cohort, address);
        cohorts = data.filter((cohort) => cohort.id !== young.cohortId);
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

  const chooseNewCohort = async (cohort: CohortType) => {
    setSelectedCohortId(cohort._id);
    if (cohort.name === "à venir") {
      updateAddress(newAddress, young.status);
    } else {
      checkInscriptionGoal(cohort.name, newAddress);
    }
  };

  const updateAddress = async (address = newAddress, status = young.status) => {
    if (!newCohort) throw new Error("Aucune cohorte sélectionnée.");
    try {
      setLoading(true);
      const dataToUpdate = { ...address, status, cohortId: newCohort._id, cohortName: newCohort.name };
      const { title, message, data: updatedYoung } = await updateYoung("address", dataToUpdate);
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
              cohorts={cohortOptions}
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
