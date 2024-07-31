import React, { useState } from "react";
import TailwindSelect from "../../../../components/TailwindSelect";
import SpeakerPhone from "../../../../assets/icons/SpeakerPhone";
import BadgeCheck from "../../../../assets/icons/BadgeCheck";
import ArrowCircleRight from "../../../../assets/icons/ArrowCircleRight";
import Warning from "../../../../assets/icons/Warning";
import { formatDateFR, COHORTS_BEFORE_JULY_2023 } from "snu-lib";
import ModalChangePresenceOnArrival from "../../../../components/modals/young/ModalChangePresenceOnArrival";
import ModalChangePresenceJDM from "../../../../components/modals/young/ModalChangePresenceJDM";
import ModalPointageDepart from "../../../centersV2/components/modals/ModalPointageDepart";

const Phase1PresenceFormBlock = ({ className = "", young = null, values = null, setValues, setYoung, editing = false, setLoading, isYoungCheckinOpen }) => {
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
      <div className={className}>
        <div className="mb-2 flex items-center gap-2">
          <p className="text-xs font-medium text-gray-900">Présence</p>
          {!isYoungCheckinOpen && (
            <div className="group relative">
              <Warning className="text-red-900" />
              <div className="absolute top-[calc(100%+5px)] left-[50%] z-10 hidden min-w-[200px] translate-x-[-50%] rounded-lg bg-gray-200 px-2 py-1 text-center text-black shadow-sm group-hover:block">
                <div className="absolute left-[50%] top-[-5px] h-[10px] w-[10px] translate-x-[-50%] rotate-45 bg-gray-200"></div>
                Le pointage n&apos;est pas ouvert
              </div>
            </div>
          )}
        </div>
        <div className="mt-2 flex w-full flex-row flex-wrap items-stretch gap-4">
          <div className="min-w-[250px] flex-1">
            <TailwindSelect
              name="cohesionStayPresence"
              label="Présence à l'arrivée"
              readOnly={!editing || !isYoungCheckinOpen}
              className="min-w-[250px] flex-1"
              icon={<SpeakerPhone className="text-gray-500" width={20} height={20} />}
              setSelected={handleChangePresenceOnArrival}
              selected={values.cohesionStayPresence || ""}
              options={[
                { label: "Non renseigné", value: "", disabled: true, hidden: true },
                { label: "Présent", value: "true" },
                { label: "Absent", value: "false" },
              ]}
            />
          </div>
          {COHORTS_BEFORE_JULY_2023.includes(young?.cohort) ? (
            <div className="min-w-[250px] flex-1">
              <TailwindSelect
                name="presenceJDM"
                label="Présence JDM"
                readOnly={!editing || !isYoungCheckinOpen}
                type="select"
                icon={<BadgeCheck className="text-gray-500" width={20} height={20} />}
                setSelected={handleOnChangePresenceJDM}
                selected={values.presenceJDM || ""}
                options={[
                  { label: "Non renseigné", value: "", disabled: true, hidden: true },
                  { label: "Présent", value: "true" },
                  { label: "Absent", value: "false" },
                ]}
              />
            </div>
          ) : null}
          <div className="min-w-[250px] flex-1 items-stretch">
            <div
              onClick={() => {
                if (!editing || !isYoungCheckinOpen) return;
                setIsDepartureModalOpen(true);
              }}
              className={` flex flex-row items-center justify-start rounded border border-gray-300 py-2 px-2.5 ${editing && "cursor-pointer"} h-full`}>
              <ArrowCircleRight width={16} height={16} className="mx-2 mr-3 text-gray-400 group-hover:scale-105" />
              {values?.departSejourAt ? <div>{formatDateFR(values.departSejourAt)}</div> : <div className="text-gray-500">Renseigner un départ anticipé</div>}
            </div>
          </div>
        </div>
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
