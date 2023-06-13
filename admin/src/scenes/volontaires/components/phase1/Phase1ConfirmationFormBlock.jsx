import React, { useState } from "react";
import TailwindSelect from "../../../../components/TailwindSelect";
import Plane from "../../../../assets/icons/Plane";
import { updateYoungPhase1Agreement } from "../../../../services/young.service";
import { toastr } from "react-redux-toastr";
import ModalPrimary from "../../../../components/ui/modals/ModalPrimary";
import ModalChangeTravelByPlane from "../../../../components/modals/young/ModalChangeTravelByPlane";

const Phase1ConfirmationFormBlock = ({ className = "", young = null, values = null, setValues, setYoung, editing = false, setLoading }) => {
  const [isYoungModalAgreementOpen, setIsYoungModalAgreementOpen] = useState(false);
  const [isYoungTravelingByPlaneModalOpen, setIsYoungTravelingByPlaneModalOpen] = useState(false);

  const handleChangeYoungAgreement = ({ value }) => {
    setValues((prevValue) => ({
      ...prevValue,
      youngPhase1Agreement: value,
    }));
    setIsYoungModalAgreementOpen(true);
  };

  const handleConfirmationYoungAgreement = async () => {
    if (!young) {
      return;
    }

    try {
      setLoading(true);
      const { title, message, data } = await updateYoungPhase1Agreement({ youngId: young._id, isAgree: values.youngPhase1Agreement });
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

  const handleChangeTravelingByPlane = ({ value }) => {
    setValues((prevValue) => ({
      ...prevValue,
      isTravelingByPlane: value,
    }));
    setIsYoungTravelingByPlaneModalOpen(true);
  };

  const handleConfirmYoungTravelingByPlane = (data) => {
    setValues(data);
    setYoung(data);
    setIsYoungTravelingByPlaneModalOpen(false);
  };

  const handleCancel = () => {
    setValues((prevValue) => ({
      ...prevValue,
      youngPhase1Agreement: young?.youngPhase1Agreement || "false",
      isTravelingByPlane: young?.isTravelingByPlane || "",
    }));
    setIsYoungModalAgreementOpen(false);
    setIsYoungTravelingByPlaneModalOpen(false);
  };

  return (
    <>
      <div className={className}>
        <p className="mb-2 text-xs font-medium text-gray-900">Confirmation</p>
        <div className="mt-2 flex w-full flex-wrap items-stretch gap-4">
          <div className="min-w-[250px] flex-1">
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
          <div className="min-w-[250px] flex-1">
            <TailwindSelect
              name="isTravelingByPlane"
              label="Voyage en avion"
              icon={<Plane className="!text-gray-500" />}
              readOnly={!editing}
              setSelected={handleChangeTravelingByPlane}
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
        onCancel={handleCancel}
      />
      <ModalChangeTravelByPlane
        isOpen={isYoungTravelingByPlaneModalOpen}
        young={young}
        value={values.isTravelingByPlane}
        onConfirm={handleConfirmYoungTravelingByPlane}
        onCancel={handleCancel}
        onLoading={setLoading}
      />
    </>
  );
};

export default Phase1ConfirmationFormBlock;
