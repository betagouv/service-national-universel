import React, { useEffect } from "react";
import TailwindSelect from "../../../../components/TailwindSelect";
import SpeakerPhone from "../../../../assets/icons/SpeakerPhone";
import BadgeCheck from "../../../../assets/icons/BadgeCheck";
import ArrowCircleRight from "../../../../assets/icons/ArrowCircleRight";
import Warning from "../../../../assets/icons/Warning";

const Phase1PresenceFormBlock = ({ className = "", young = null, values = null, setValues, setYoung, editing = false, setLoading, isYoungCheckinOpen }) => {
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-xs text-gray-900 font-medium">Présence</p>
        {!isYoungCheckinOpen && (
          <div className="group relative">
            <Warning className="text-red-900" />
            <div className="hidden group-hover:block absolute top-[calc(100%+5px)] left-[50%] bg-gray-200 rounded-lg translate-x-[-50%] px-2 py-1 text-black shadow-sm z-10 min-w-[200px] text-center">
              <div className="absolute left-[50%] translate-x-[-50%] bg-gray-200 w-[10px] h-[10px] rotate-45 top-[-5px]"></div>
              Le pointage n&apos;est pas ouvert
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-row gap-4 mt-2 flex-wrap w-full items-stretch">
        <div className="flex-1 min-w-[250px]">
          <TailwindSelect
            name="cohesionStayPresence"
            label="Présence à l'arrivée"
            readOnly={!editing || !isYoungCheckinOpen}
            className="flex-1 min-w-[250px]"
            icon={<SpeakerPhone className="text-gray-500" width={20} height={20} />}
            setSelected={({ value }) => setModalPointagePresenceArrivee({ isOpen: true, value })}
            selected={values.cohesionStayPresence || ""}
            options={[
              { label: "Non renseigné", value: "", disabled: true, hidden: true },
              { label: "Présent", value: "true" },
              { label: "Absent", value: "false" },
            ]}
          />
        </div>
        <div className="flex-1 min-w-[250px]">
          <TailwindSelect
            name="presenceJDM"
            label="Présence JDM"
            readOnly={!editing || !isYoungCheckinOpen}
            type="select"
            icon={<BadgeCheck className="text-gray-500" width={20} height={20} />}
            setSelected={({ value }) => setModalPointagePresenceJDM({ isOpen: true, value })}
            selected={values.presenceJDM || ""}
            options={[
              { label: "Non renseigné", value: "", disabled: true, hidden: true },
              { label: "Présent", value: "true" },
              { label: "Absent", value: "false" },
            ]}
          />
        </div>
        <div className="flex-1 min-w-[250px] items-stretch">
          <div
            onClick={() => {
              if (!editing || !isYoungCheckinOpen) return;
              setModalPointageDepart({ isOpen: true });
            }}
            className={` border-gray-300 border rounded py-2 px-2.5 flex flex-row items-center justify-start ${editing && "cursor-pointer"} h-full`}>
            <ArrowCircleRight width={16} height={16} className="text-gray-400 group-hover:scale-105 mx-2 mr-3" />
            {values?.departSejourAt ? <div>{formatDateFR(values.departSejourAt)}</div> : <div className="text-gray-500">Renseigner un départ</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase1PresenceFormBlock;
