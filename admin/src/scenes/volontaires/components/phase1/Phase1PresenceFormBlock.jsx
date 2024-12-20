import React, { useState } from "react";
import { HiOutlineCalendar } from "react-icons/hi";

import { Label, Select } from "@snu/ds/admin";
import { translate } from "snu-lib";
import { COHORTS_WITH_JDM_COUNT, formatDateFR } from "@/utils";

import ModalChangePresenceOnArrival from "@/components/modals/young/ModalChangePresenceOnArrival";
import ModalChangePresenceJDM from "@/components/modals/young/ModalChangePresenceJDM";
import ModalPointageDepart from "../../../centersV2/components/modals/ModalPointageDepart";

const Phase1PresenceFormBlock = ({ young = null, values = null, setValues, setYoung, editing = false, setLoading, isYoungCheckinOpen }) => {
  const [isPresenceOnArrivalModalOpen, setIsPresenceOnArrivalModalOpen] = useState(false);
  const [isPresenceJDMModalOpen, setIsPresenceJDMModalOpen] = useState(false);
  const [isDepartureModalOpen, setIsDepartureModalOpen] = useState(false);

  const handleChangePresenceOnArrival = ({ value }) => {
    setValues((prevValue) => ({
      ...prevValue,
      cohesionStayPresence: value,
    }));
    setIsPresenceOnArrivalModalOpen(true);
  };

  const handleOnChangePresenceJDM = ({ value }) => {
    setValues((prevValue) => ({
      ...prevValue,
      presenceJDM: value,
    }));
    setIsPresenceJDMModalOpen(true);
  };

  const handleConfirm = (data) => {
    setIsPresenceJDMModalOpen(false);
    setIsPresenceOnArrivalModalOpen(false);
    setYoung(data);
    setValues(data);
  };

  const handleCancel = () => {
    setValues((prevValue) => ({
      ...prevValue,
      cohesionStayPresence: young?.cohesionStayPresence || "",
      presenceJDM: young?.presenceJDM || "",
    }));
    setIsPresenceOnArrivalModalOpen(false);
    setIsPresenceJDMModalOpen(false);
    setIsDepartureModalOpen(false);
  };

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col w-full">
          <Label title="Présence" name="presence" tooltip={!isYoungCheckinOpen ? "Le pointage n'est pas ouvert" : null} tooltipIconClassName={"!text-red-900"} />
          {editing ? (
            <div className="flex justify-between gap-4">
              <Select
                className="mb-3 w-full"
                label="À l'arrivée"
                isActive={editing && isYoungCheckinOpen}
                readOnly={!editing || !isYoungCheckinOpen}
                placeholder="Non renseigné"
                options={[
                  { label: "Oui", value: "true" },
                  { label: "Non", value: "false" },
                ]}
                closeMenuOnSelect={true}
                value={values?.cohesionStayPresence ? { value: values?.cohesionStayPresence, label: translate(values?.cohesionStayPresence) } : null}
                onChange={handleChangePresenceOnArrival}
              />
              {COHORTS_WITH_JDM_COUNT.includes(young?.cohort) && (
                <Select
                  className="mb-4 w-full"
                  label="JDM"
                  isActive={editing && isYoungCheckinOpen}
                  readOnly={!editing || !isYoungCheckinOpen}
                  placeholder="Non renseigné"
                  options={[
                    { label: "Oui", value: "true" },
                    { label: "Non", value: "false" },
                  ]}
                  closeMenuOnSelect={true}
                  value={values?.presenceJDM ? { value: values?.presenceJDM, label: translate(values?.presenceJDM) } : null}
                  onChange={handleOnChangePresenceJDM}
                />
              )}
            </div>
          ) : (
            <div className="mb-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
              <p>
                <span className="text-gray-500">À l'arrivée : </span>
                {translate(values.cohesionStayPresence)}
              </p>
              {COHORTS_WITH_JDM_COUNT.includes(young?.cohort) && (
                <p>
                  <span className="text-gray-500">JDM : </span>
                  {translate(values.presenceJDM)}
                </p>
              )}
            </div>
          )}
        </div>
        {values.departSejourAt && (
          <div className="mb-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
            <p>
              <span className="text-gray-500">Départ le : </span>
              {formatDateFR(values.departSejourAt)}
            </p>
            <p>
              <span className="text-gray-500">Motif : </span>
              {young.departSejourMotif}
            </p>
            {young.departSejourMotifComment && (
              <p>
                <span className="text-gray-500">Commentaire : </span>
                {young.departSejourMotifComment}
              </p>
            )}
          </div>
        )}

        {editing && isYoungCheckinOpen && (
          <div className="flex gap-2 justify-end cursor-pointer text-blue-600 hover:underline" onClick={() => setIsDepartureModalOpen(true)}>
            <HiOutlineCalendar size={16} className="mt-0.5" />
            <p>{values?.departSejourAt ? "Modifier ces informations" : "Renseigner un départ anticipé"}</p>
          </div>
        )}
      </div>
      <ModalChangePresenceOnArrival
        isOpen={isPresenceOnArrivalModalOpen}
        young={young}
        value={values.cohesionStayPresence}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onLoading={setLoading}
      />
      <ModalChangePresenceJDM isOpen={isPresenceJDMModalOpen} young={young} value={values.presenceJDM} onConfirm={handleConfirm} onCancel={handleCancel} onLoading={setLoading} />
      <ModalPointageDepart isOpen={isDepartureModalOpen} onCancel={handleCancel} onSubmit={handleConfirm} young={young} />
    </>
  );
};

export default Phase1PresenceFormBlock;
