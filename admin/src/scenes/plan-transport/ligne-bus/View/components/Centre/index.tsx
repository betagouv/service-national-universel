import React, { useState } from "react";
import { useSelector } from "react-redux";
import { actions, CohortType, hasPermission, LigneBusDto } from "snu-lib";
import Field from "../../../components/Field";
import Iceberg from "../../../components/Icons/Iceberg";
import { AuthState } from "@/redux/auth/reducer";
import SessionSelector from "./SessionSelector";
import useUpdateSessionSurLigneDeBus from "@/scenes/plan-transport/lib/useUpdateSessionSurLigneDeBus";
import CentreModal from "./CentreModal";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { EditButton } from "@snu/ds/admin";

type Props = {
  bus: LigneBusDto;
  setBus: (data: LigneBusDto) => void;
  cohort: CohortType;
};

export type CentreFormValues = {
  centerArrivalTime: string;
  centerDepartureTime: string;
  sessionId: string;
};

const pattern = new RegExp("^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$");

export default function Centre({ bus, setBus, cohort }: Props) {
  const user = useSelector((state: AuthState) => state.Auth.user);
  const { mutate: updateSessionSurLigneDeBus, isPending } = useUpdateSessionSurLigneDeBus(bus._id);
  const [isEditing, setIsEditing] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const { control, handleSubmit, reset, getValues } = useForm({
    defaultValues: {
      centerArrivalTime: bus.centerArrivalTime,
      centerDepartureTime: bus.centerDepartureTime,
      sessionId: bus.sessionId,
    },
  });

  const onSubmit: SubmitHandler<CentreFormValues> = (data) => {
    if (data.sessionId !== bus.sessionId) {
      setOpenModal(true);
    } else {
      handleConfirm(data, false);
    }
  };

  function handleConfirm(data: CentreFormValues, sendCampaign?: boolean) {
    const payload = { ...data, sendCampaign };
    updateSessionSurLigneDeBus(payload, {
      onSuccess: (ligneInfo) => {
        setOpenModal(false);
        setBus(ligneInfo);
        setIsEditing(false);
      },
    });
  }

  const message = "Vous n'avez pas l'autorisation de modifier la ligne de transport.";
  const canUpdateTransport = hasPermission(user, cohort, actions.transport.UPDATE);
  const canUpdateCenterId = hasPermission(user, cohort, actions.transport.UPDATE_SESSION_ID);
  const canUpdateCenterSchedule = hasPermission(user, cohort, actions.transport.UPDATE_CENTER_SCHEDULE);
  const canSendNotifications = hasPermission(user, cohort, actions.transport.NOTIFY_AFTER_UPDATE);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-1/2 rounded-xl bg-white p-8">
      <div className="flex items-center justify-between">
        <p className="text-lg leading-7 text-gray-900 font-bold">Centre de cohésion</p>
        <EditButton isEditing={isEditing} setIsEditing={setIsEditing} disabled={!canUpdateTransport} onReset={reset} tooltipMessage={message} isLoading={isPending} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8">
        <Controller
          name="sessionId"
          control={control}
          render={({ field }) => (
            <div className="col-span-2">
              <SessionSelector sessionId={field.value} setSessionId={field.onChange} ligne={bus} readOnly={!isEditing} disabled={!canUpdateCenterId} />
            </div>
          )}
        />
        <Controller
          name="centerArrivalTime"
          control={control}
          rules={{ required: isEditing && "L'heure d'arrivée est requise", pattern: { value: pattern, message: "Format attendu: hh:mm" } }}
          render={({ field, fieldState }) => (
            <Field
              label="Heure d’arrivée"
              value={field.value}
              onChange={field.onChange}
              placeholder="hh:mm"
              readOnly={!isEditing}
              error={fieldState.error?.message}
              disabled={isEditing && !canUpdateCenterSchedule}
            />
          )}
        />
        <Controller
          name="centerDepartureTime"
          control={control}
          rules={{ required: isEditing && "L'heure de départ est requise", pattern: { value: pattern, message: "Format attendu: hh:mm" } }}
          render={({ field, fieldState }) => (
            <Field
              label="Heure de départ"
              value={field.value}
              onChange={field.onChange}
              placeholder="hh:mm"
              readOnly={!isEditing}
              error={fieldState.error?.message}
              disabled={isEditing && !canUpdateCenterSchedule}
            />
          )}
        />
      </div>

      <div className="mt-8 flex justify-end">
        <Iceberg />
      </div>

      <CentreModal
        isOpen={openModal}
        onCancel={() => setOpenModal(false)}
        onConfirm={handleConfirm}
        initialData={bus}
        formData={getValues()}
        count={bus.youngSeatsTaken}
        areNotificationsEnabled={canSendNotifications}
        isLoading={isPending}
      />
    </form>
  );
}
