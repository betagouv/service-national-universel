import React from "react";
import { useSelector } from "react-redux";
import { canEditLigneBusCenter, CohortType, isBusEditionOpen, LigneBusDto } from "snu-lib";
import Pencil from "../../../../../../assets/icons/Pencil";
import Field from "../../../components/Field";
import Iceberg from "../../../components/Icons/Iceberg";
import { AuthState } from "@/redux/auth/reducer";
import CentreSelector from "./CentreSelector";
import useUpdateLigneBus from "@/scenes/plan-transport/lib/useUpdateCentreSurLigneDeBus";
import CentreModal from "./CentreModal";

type Props = {
  initialData: LigneBusDto;
  setBus: (data) => void;
  cohort: CohortType;
};

export default function Centre({ initialData, setBus, cohort }: Props) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);

  const [centerArrivalTime, setCenterArrivalTime] = React.useState(initialData.centerArrivalTime || "");
  const [centerDepartureTime, setCenterDepartureTime] = React.useState(initialData.centerDepartureTime || "");
  const [centerDetail, setCenterDetail] = React.useState(initialData.centerDetail);

  const user = useSelector((state: AuthState) => state.Auth.user);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const { mutate, isPending } = useUpdateLigneBus(initialData._id);

  const disabled = !canEditLigneBusCenter(user) || !isBusEditionOpen(user, cohort) || isPending;

  function resetData() {
    setCenterArrivalTime(initialData.centerArrivalTime || "");
    setCenterDepartureTime(initialData.centerDepartureTime || "");
    setCenterDetail(initialData.centerDetail);
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
      // centerId: center._id,
      // sendCampaign
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
        <CentreSelector center={centerDetail} setCenter={setCenterDetail} cohort={cohort} disabled={!isEditing} />

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
        initialData={initialData}
        formData={{ centerDetail, centerArrivalTime, centerDepartureTime }}
        count={initialData.youngSeatsTaken}
      />
    </form>
  );
}
