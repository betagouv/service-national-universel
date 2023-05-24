import React, { useState } from "react";
import Modal from "../../../../../../components/ui/modals/Modal";
import RadioButton from "../../../../../../components/forms/inputs/RadioButton";
import Calendar from "../../../../../../assets/icons/CalendarFill";

const ChoseCohortModalContent = ({ onClose, cohortPeriod }) => {
  const [value, setValue] = useState("juillet");
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
          Malheureusement, aucun séjour de cohésion n&apos;est prévu <span className="text-gray-900 font-medium">{cohortPeriod}</span> dans votre nouveau département de résidence.
        </div>
      </Modal.Subtitle>
      <div className="my-6 h-[1px] bg-gray-200" />
      <RadioButton
        className="mb-6"
        label="Choisissez un nouveau séjour :"
        value={value}
        onChange={setValue}
        options={[
          { label: "Du 19 au 30 juin 2023", value: "juin" },
          { label: "Du 04 au 16 juillet 2023", value: "juillet" },
          { label: "Du 04 au 16 aout 2023", value: "aout" },
        ]}
      />
      <Modal.Buttons onConfirm={onClose} confirmText="Valider ce séjour" />
    </>
  );
};

export default ChoseCohortModalContent;
