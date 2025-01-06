import React, { useState } from "react";
import { Label, Select } from "@snu/ds/admin";
import { updateYoungPhase1Agreement } from "../../../../services/young.service";
import { toastr } from "react-redux-toastr";
import ModalPrimary from "../../../../components/ui/modals/ModalPrimary";
import ModalChangeTravelByPlane from "../../../../components/modals/young/ModalChangeTravelByPlane";
import { translate } from "snu-lib";

const Phase1ConfirmationFormBlock = ({ young = null, values = null, setValues, setYoung, editing = false, setLoading }) => {
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
      <div className="w-full">
        <div>
          <Label title="Confirmation de la participation" name="confirmation" />
          {editing ? (
            <Select
              name="confirmation"
              className="mb-3"
              isActive={editing}
              readOnly={!editing}
              options={[
                { label: "Oui", value: "true" },
                { label: "Non", value: "false" },
              ]}
              closeMenuOnSelect={true}
              value={values?.youngPhase1Agreement ? { value: values?.youngPhase1Agreement, label: translate(values?.youngPhase1Agreement) } : { value: "false", label: "Non" }}
              onChange={handleChangeYoungAgreement}
            />
          ) : (
            <div className="mb-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
              <p>{translate(values.youngPhase1Agreement)}</p>
            </div>
          )}
        </div>
        <div>
          <Label
            title="Voyage en avion"
            name="isTravelingByPlane"
            tooltip="Indiquez “Oui” si vous avez confirmé individuellement avec le jeune son affectation à un séjour qui nécessite un voyage en avion."
          />
          {editing ? (
            <Select
              name="isTravelingByPlane"
              className="mb-3"
              placeholder={"Non renseigné"}
              isActive={editing}
              readOnly={!editing}
              options={[
                { label: "Oui", value: "true" },
                { label: "Non", value: "false" },
              ]}
              closeMenuOnSelect={true}
              value={values.isTravelingByPlane ? { value: values.isTravelingByPlane, label: translate(values.isTravelingByPlane) } : null}
              onChange={handleChangeTravelingByPlane}
            />
          ) : (
            <div className="mb-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
              <p>{values.isTravelingByPlane ? translate(values.isTravelingByPlane) : "Non"}</p>
            </div>
          )}
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
