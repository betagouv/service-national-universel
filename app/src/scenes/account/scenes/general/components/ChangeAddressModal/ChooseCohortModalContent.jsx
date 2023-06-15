import React, { useState } from "react";
import Modal from "../../../../../../components/ui/modals/Modal";
import RadioButton from "../../../../../../components/forms/inputs/RadioButton";
import Calendar from "../../../../../../assets/icons/CalendarFill";

const ChooseCohortModalContent = ({ onConfirm, currentCohortPeriod, cohorts, isLoading }) => {
  const [newCohort, setNewCohort] = useState(null);
  return (
    <>
      <div className="flex justify-center">
        <div className="w-11 h-11 flex justify-center items-center bg-yellow-100 rounded-full mb-6">
          <Calendar className="text-yellow-600" />
        </div>
      </div>
      <Modal.Title>Choisir un séjour</Modal.Title>
      <Modal.Subtitle>
        <div className="text-gray-500 md:text-center">
          Malheureusement, aucun séjour de cohésion n&apos;est prévu <span className="text-gray-900 font-medium">{currentCohortPeriod}</span> dans votre nouveau département de
          résidence.
        </div>
      </Modal.Subtitle>
      <div className="my-6 h-[1px] bg-gray-200" />
      <RadioButton className="mb-6" label="Choisissez un nouveau séjour :" value={newCohort} onChange={setNewCohort} options={cohorts} />
      <Modal.Buttons onConfirm={() => onConfirm(newCohort)} confirmText="Valider ce séjour" disabled={isLoading || !newCohort} />
    </>
  );
};

export default ChooseCohortModalContent;
