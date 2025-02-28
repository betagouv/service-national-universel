import React from "react";
import { useSelector } from "react-redux";
import { canEditLigneBusCenter, CohortType, isBusEditionOpen, LigneBusDto } from "snu-lib";
import Pencil from "../../../../../../assets/icons/Pencil";
import Field from "../../../components/Field";
import Iceberg from "../../../components/Icons/Iceberg";
import { AuthState } from "@/redux/auth/reducer";
import SessionSelector from "./SessionSelector";
import useUpdateCentreSurLigneDeBus from "@/scenes/plan-transport/lib/useUpdateCentreSurLigneDeBus";
import CentreModal from "./CentreModal";

type Props = {
  bus: LigneBusDto;
  setBus: (data: LigneBusDto) => void;
  cohort?: CohortType | null;
};

export default function Centre({ bus, setBus, cohort }: Props) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);

  const [centerArrivalTime, setCenterArrivalTime] = React.useState(bus.centerArrivalTime || "");
  const [centerDepartureTime, setCenterDepartureTime] = React.useState(bus.centerDepartureTime || "");
  const [sessionId, setSessionId] = React.useState(bus.sessionId);

  const user = useSelector((state: AuthState) => state.Auth.user);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const { mutate, isPending } = useUpdateCentreSurLigneDeBus(bus._id);

  const disabled = !canEditLigneBusCenter(user) || !isBusEditionOpen(user, cohort) || isPending;

  function resetData() {
    setCenterArrivalTime(bus.centerArrivalTime || "");
    setCenterDepartureTime(bus.centerDepartureTime || "");
    setSessionId(bus.sessionId);
    setErrors({});
  }

  function handleClick() {
    setIsEditing(!isEditing);
    resetData();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErrors({});
    const errors: Record<string, string> = {};
    const regex = new RegExp("^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$");
    if (!regex.test(centerArrivalTime)) errors.centerArrivalTime = "Format invalide (hh:mm)";
    if (!regex.test(centerDepartureTime)) errors.centerDepartureTime = "Format invalide (hh:mm)";
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    setOpenModal(true);
  }

  function handleConfirm(sendCampaign: boolean) {
    const payload = {
      centerArrivalTime,
      centerDepartureTime,
      sessionId,
      sendCampaign,
    };

    mutate(payload, {
      onSuccess: (ligneInfo) => {
        setBus(ligneInfo);
        setIsEditing(false);
        setOpenModal(false);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-1/2 rounded-xl bg-white p-8">
      <div className="flex items-center justify-between">
        <div className="text-lg leading-7 text-gray-900 font-bold">Centre de cohésion</div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClick}
              disabled={isPending}
              className="flex items-center gap-2 rounded-full border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs leading-5 text-gray-700 hover:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-full  border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
              <Pencil stroke="#2563EB" className="mr-[6px] h-[12px] w-[12px]" />
              Enregistrer les changements
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className="flex items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
            <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
            Modifier
          </button>
        )}
      </div>

      <div className="mt-8 flex flex-col">
        <SessionSelector sessionId={sessionId} setSessionId={setSessionId} ligne={bus} disabled={!isEditing} />

        <div className="mt-8 flex items-center gap-4">
          <Field
            label="Heure d’arrivée"
            onChange={(e) => setCenterArrivalTime(e.target.value)}
            placeholder="hh:mm"
            value={centerArrivalTime}
            error={errors?.centerArrivalTime}
            readOnly={!isEditing}
          />
          <Field
            label="Heure de départ"
            onChange={(e) => setCenterDepartureTime(e.target.value)}
            placeholder="hh:mm"
            value={centerDepartureTime}
            error={errors?.centerDepartureTime}
            readOnly={!isEditing}
          />
        </div>
        <div className="mt-8 flex justify-end">
          <Iceberg />
        </div>
      </div>

      <CentreModal
        isOpen={openModal}
        onCancel={() => setOpenModal(false)}
        onConfirm={handleConfirm}
        initialData={bus}
        formData={{ sessionId, centerArrivalTime, centerDepartureTime }}
        count={bus.youngSeatsTaken}
      />
    </form>
  );
}
