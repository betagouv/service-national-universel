import React from "react";
import { useSelector } from "react-redux";
import { canEditLigneBusCenter, CohortType, isBusEditionOpen, LigneBusDto } from "snu-lib";
import Field from "../../../components/Field";
import Iceberg from "../../../components/Icons/Iceberg";
import { AuthState } from "@/redux/auth/reducer";
import SessionSelector from "./SessionSelector";
import useUpdateSessionSurLigneDeBus from "@/scenes/plan-transport/lib/useUpdateSessionSurLigneDeBus";
import CentreModal from "./CentreModal";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import EditButton from "@/components/buttons/EditButton";

type Props = {
  bus: LigneBusDto;
  setBus: (data: LigneBusDto) => void;
  cohort?: CohortType | null;
};

export type CentreFormValues = {
  centerArrivalTime: string;
  centerDepartureTime: string;
  sessionId: string;
};

const pattern = new RegExp("^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$");

export default function Centre({ bus, setBus, cohort }: Props) {
  const user = useSelector((state: AuthState) => state.Auth.user);
  const { mutate, isPending } = useUpdateSessionSurLigneDeBus(bus._id);
  const [isEditing, setIsEditing] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    defaultValues: {
      centerArrivalTime: bus.centerArrivalTime || "",
      centerDepartureTime: bus.centerDepartureTime || "",
      sessionId: bus.sessionId,
    },
  });

  const disabled = !canEditLigneBusCenter(user) || !isBusEditionOpen(user, cohort) || isPending;

  const onSubmit: SubmitHandler<CentreFormValues> = (data) => {
    if (data.sessionId !== bus.sessionId) {
      setOpenModal(true);
    } else {
      handleConfirm(data, false);
    }
  };

  function handleConfirm(data: CentreFormValues, sendCampaign?: boolean) {
    const payload = { ...data, sendCampaign };
    mutate(payload, {
      onSuccess: (ligneInfo) => {
        setOpenModal(false);
        setBus(ligneInfo);
        setIsEditing(false);
      },
    });
  }

  return (
    <form id="edit-center" onSubmit={handleSubmit(onSubmit)} className="w-1/2 rounded-xl bg-white p-8">
      <div className="flex items-center justify-between">
        <div className="text-lg leading-7 text-gray-900 font-bold">Centre de cohésion</div>
        <EditButton form="edit-center" isEditing={isEditing} setIsEditing={setIsEditing} disabled={disabled} reset={reset} />
      </div>

      <div className="mt-8 flex flex-col">
        <Controller
          name="sessionId"
          control={control}
          render={({ field }) => <SessionSelector sessionId={field.value} setSessionId={field.onChange} ligne={bus} disabled={!isEditing} />}
        />

        <div className="mt-8 flex items-center gap-4">
          <Controller
            name="centerArrivalTime"
            control={control}
            disabled={!isEditing}
            rules={{ required: isEditing && "L'heure d'arrivée est requise", pattern }}
            render={({ field }) => (
              <Field label="Heure d’arrivée" onChange={field.onChange} placeholder="hh:mm" value={field.value} readOnly={!isEditing} error={errors.centerArrivalTime?.message} />
            )}
          />

          <Controller
            name="centerDepartureTime"
            control={control}
            disabled={!isEditing}
            rules={{ required: isEditing && "L'heure de départ est requise", pattern }}
            render={({ field }) => (
              <Field label="Heure de départ" onChange={field.onChange} placeholder="hh:mm" value={field.value} readOnly={!isEditing} error={errors.centerDepartureTime?.message} />
            )}
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
        formData={{ sessionId: getValues("sessionId"), centerArrivalTime: getValues("centerArrivalTime"), centerDepartureTime: getValues("centerDepartureTime") }}
        count={bus.youngSeatsTaken}
        isLoading={isPending}
      />
    </form>
  );
}
