import React, { useState } from "react";
import TailwindSelect from "../../../../components/TailwindSelect";
import Plane from "../../../../assets/icons/Plane";
import { updateYoungPhase1Agreement } from "../../../../services/young.service";
import { toastr } from "react-redux-toastr";
import ModalPrimary from "../../../../components/ui/modals/ModalPrimary";

const Phase1ConfirmationFormBlock = ({ className = "", young = null, values = null, setValues, setYoung, editing = false, setLoading }) => {
  const [isYoungModalAgreementOpen, setIsYoungModalAgreementOpen] = useState(false);

  const handleChangeYoungAgreement = ({ value }) => {
    setValues((prevValue) => ({
      ...prevValue,
      youngPhase1Agreement: value,
    }));
    setIsYoungModalAgreementOpen(true);
  };

  const handleCancelConfirmYoungAgreement = () => {
    setValues((prevValue) => ({
      ...prevValue,
      youngPhase1Agreement: young?.youngPhase1Agreement || "false",
    }));
    setIsYoungModalAgreementOpen(false);
  };

  const handleConfirmationYoungAgreement = async (value) => {
    if (!young) {
      return;
    }

    try {
      setLoading(true);
      const { title, message, data } = await updateYoungPhase1Agreement({ youngId: young.id, isAgree: value });
      toastr.success(title, message);
      setValues(data);
      setYoung(data);
    } catch (error) {
      const { title, message } = error;
      toastr.error(title, message);
    } finally {
      setLoading(false);
      setIsYoungModalAgreementOpen(false);
    }
  };

  return (
    <>
      <div className={className}>
        <p className="text-xs text-gray-900 font-medium mb-2">Confirmation</p>
        <div className="flex gap-4 mt-2 flex-wrap w-full items-stretch">
          <div className="flex-1 min-w-[250px]">
            <TailwindSelect
              name="youngPhase1Agreement"
              label="Confirmation de la participation"
              readOnly={!editing}
              type="select"
              setSelected={handleChangeYoungAgreement}
              selected={values?.youngPhase1Agreement || "false"}
              options={[
                { label: "Oui", value: "true" },
                { label: "Non", value: "false" },
              ]}
            />
          </div>
          <div className="flex-1 min-w-[250px]">
            <TailwindSelect
              name="isTravelingByPlane"
              label="Voyage en avion"
              icon={<Plane className="!text-gray-500" />}
              readOnly={!editing}
              setSelected={handleChangeYoungAgreement}
              selected={values.isTravelingByPlane || ""}
              hint="Indiquez “Oui” si vous avez confirmé individuellement avec le jeune son affectation à un séjour qui nécessite un voyage en avion."
              options={[
                { label: "Non renseigné", value: "", disabled: true, hidden: true },
                { label: "Oui", value: "true" },
                { label: "Non", value: "false" },
              ]}
            />
          </div>
        </div>
      </div>
      <ModalPrimary
        title="Confirmation de la participation"
        message={`Êtes-vous sûr de vouloir modifier la confirmation de participation de ${young.firstName} ${young.lastName} à  ${
          values?.youngPhase1Agreement === "true" ? "oui" : "non"
        }`}
        isOpen={isYoungModalAgreementOpen}
        onConfirm={handleConfirmationYoungAgreement}
        onCancel={handleCancelConfirmYoungAgreement}
      />
    </>
  );
};

export default Phase1ConfirmationFormBlock;
