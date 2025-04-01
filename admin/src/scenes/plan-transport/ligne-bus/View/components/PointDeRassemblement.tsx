import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { BsSearch } from "react-icons/bs";
import { toastr } from "react-redux-toastr";
import { useToggle } from "react-use";

import { ACTIONS, CohortType, hasPermission, LigneBusDto, PointDeRassemblementType, ROLES, translate } from "snu-lib";

import { AuthState } from "@/redux/auth/reducer";
import api from "@/services/api";
import { capture } from "@/sentry";
import Loader from "@/components/Loader";

import Select from "../../components/Select";
import Field from "../../components/Field";
import PDRIcon from "../../components/Icons/PDR";
import { Button, EditButton } from "@snu/ds/admin";
import { checkTime } from "snu-lib";

import PointDeRassemblementLabel from "./PointDeRassemblementLabel";
import ConfirmChangesModal from "./ConfirmChangesModal";

const options = [
  { label: "Bus", value: "bus" },
  { label: "Train", value: "train" },
  { label: "Avion", value: "avion" },
];

interface FormErrors {
  meetingHour?: string;
  busArrivalHour?: string;
  departureHour?: string;
  returnHour?: string;
}

export type PointDeRassemblementFormValueChanges = Partial<
  PointDeRassemblementType &
    LigneBusDto & {
      transportType?: string;
      meetingHour?: string;
      busArrivalHour?: string;
      departureHour?: string;
      returnHour?: string;
      meetingPointId?: string;
    }
>;

interface PointDeRassemblementProps {
  bus: LigneBusDto;
  onBusChange: React.Dispatch<React.SetStateAction<LigneBusDto>>;
  index: number;
  pdr: PointDeRassemblementFormValueChanges;
  volume?: { youngsCount: number; meetingPointId: string }[];
  getVolume?: () => void;
  cohort: CohortType;
}

export default function PointDeRassemblement({ bus, onBusChange, index, pdr, volume, getVolume, cohort }: PointDeRassemblementProps) {
  const user = useSelector((state: AuthState) => state.Auth.user);

  const [editPdr, setEditPdr] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [open, setOpen] = React.useState(false);
  const [listPDR, setListPDR] = React.useState<PointDeRassemblementFormValueChanges[]>([]);
  const [filteredPDR, setFilteredPDR] = React.useState<PointDeRassemblementFormValueChanges[]>([]);
  const [search, setSearch] = React.useState("");
  const [selectedPDR, setSelectedPDR] = React.useState<PointDeRassemblementFormValueChanges>(pdr);
  const [data, setData] = React.useState<PointDeRassemblementFormValueChanges>({
    transportType: pdr.transportType || "bus",
    meetingHour: pdr.meetingHour || "",
    busArrivalHour: pdr.busArrivalHour || "",
    departureHour: pdr.departureHour || "",
    returnHour: pdr.returnHour || "",
  });
  const [showConfirmChangesModal, toggleConfirmChangesModal] = useToggle(false);

  const refSelect = React.useRef<HTMLDivElement>(null);
  const refInput = React.useRef<HTMLInputElement>(null);
  const refButtonChangesPDR = React.useRef<HTMLButtonElement>(null);

  const youngsCount = volume?.find((v) => v.meetingPointId === pdr._id)?.youngsCount || 0;

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (refButtonChangesPDR.current && refButtonChangesPDR.current.contains(event.target)) {
        setOpen((open) => !open);
      } else if (refSelect.current && !refSelect.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { ok, data } = await api.get(`/ligne-de-bus/${bus._id}/availablePDRByRegion`);
        if (!ok) {
          return;
        }
        setListPDR(data);
        setFilteredPDR(data);
      } catch (error) {
        capture(error);
      }
    };
    fetchData();
  }, []);

  React.useEffect(() => {
    setData({
      transportType: pdr.transportType || "bus",
      meetingHour: pdr.meetingHour || "",
      busArrivalHour: pdr.busArrivalHour || "",
      departureHour: pdr.departureHour || "",
      returnHour: pdr.returnHour || "",
    });
    setSelectedPDR(pdr);
    setErrors({});
  }, [editPdr]);

  React.useEffect(() => {
    if (listPDR.length === 0) return;
    const searchFields = ["name", "address", "particularitesAcces", "region", "department", "code", "city", "zip", "matricule"];

    const filteredPDR = listPDR.filter((item) => {
      if (selectedPDR?._id === item._id) return false;
      if (search === "") return true;
      return searchFields.some((field) => item[field]?.toString().toLowerCase().includes(search.toLowerCase()));
    });

    setFilteredPDR(filteredPDR);
  }, [search, listPDR, bus]);

  const handleCancelChanges = useCallback(() => {
    toggleConfirmChangesModal(false);
    setEditPdr(false);
  }, [toggleConfirmChangesModal]);

  const handleSubmitInfo = async (sendEmailCampaign: boolean = false) => {
    try {
      setIsLoading(true);
      setErrors({});
      const errors: FormErrors = {};

      const regex = new RegExp("^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$");
      if (!regex.test(data.meetingHour || "")) errors.meetingHour = "Format invalide (hh:mm)";
      if (!regex.test(data.busArrivalHour || "")) errors.busArrivalHour = "Format invalide (hh:mm)";
      if (!regex.test(data.departureHour || "")) errors.departureHour = "Format invalide (hh:mm)";
      if (!regex.test(data.returnHour || "")) errors.returnHour = "Format invalide (hh:mm)";

      //check if meeting hour is before bus arrival hour
      if (checkTime(data.departureHour, data.meetingHour)) errors.meetingHour = "L'heure de convocation doit être avant l'heure de départ";
      //check if bus arrival hour is before departure hour
      if (checkTime(data.departureHour, data.busArrivalHour)) errors.busArrivalHour = "L'heure d'arrivée du bus doit être avant l'heure de départ";

      if (Object.keys(errors).length > 0) {
        toggleConfirmChangesModal(false);
        toastr.error("Oups, une erreur est survenue lors de la modification des informations du point de rassemblement", "Veuillez vérifier les champs en rouge du formulaire");
        setErrors(errors);
        setIsLoading(false);
        return;
      }

      // Save data
      const {
        ok,
        code,
        data: ligneInfo,
      } = await api.put(`/ligne-de-bus/${bus._id}/updatePDRForLine`, { ...data, meetingPointId: pdr.meetingPointId, newMeetingPointId: selectedPDR._id, sendEmailCampaign });

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la modification des informations du point de rassemblement", translate(code));
        return setIsLoading(false);
      }
      onBusChange(ligneInfo);
      await getVolume?.();
      setEditPdr(false);
      setIsLoading(false);
      toggleConfirmChangesModal(false);
      toastr.success("Les informations du point de rassemblement ont été modifiées avec succès", "");
      setSearch("");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modification des informations du point de rassemblement", "");
      setIsLoading(false);
    }
  };

  const handleConfirmChangesPDR = useCallback(
    async (e) => {
      e.preventDefault();
      toggleConfirmChangesModal(true);
    },
    [toggleConfirmChangesModal],
  );

  if (!volume) {
    return (
      <div className="w-full rounded-xl bg-white p-8">
        <Loader />
      </div>
    );
  }

  const message = "Vous n'avez pas l'autorisation de modifier le point de rassemblement.";
  const canUpdateTransport = hasPermission(user, ACTIONS.TRANSPORT.UPDATE, { cohort });
  const canUpdatePdrId = hasPermission(user, ACTIONS.TRANSPORT.UPDATE_PDR_ID, { cohort });
  const canUpdatePdrSchedule = hasPermission(user, ACTIONS.TRANSPORT.UPDATE_PDR_SCHEDULE, { cohort });
  const canUpdatePdrTransportType = hasPermission(user, ACTIONS.TRANSPORT.UPDATE_TYPE, { cohort });
  const canSendNotification = hasPermission(user, ACTIONS.TRANSPORT.SEND_NOTIFICATION, { cohort });

  return (
    <>
      <form onSubmit={handleConfirmChangesPDR} className="w-full rounded-xl bg-white p-8">
        <div className="relative flex items-start justify-between flex-wrap-reverse gap-y-4">
          <div className="flex items-center gap-4">
            <div className="text-xl leading-6 text-[#242526]">Point de rassemblement</div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-sm">{index}</div>
          </div>
          <EditButton isEditing={editPdr} setIsEditing={setEditPdr} isLoading={isLoading} onReset={handleCancelChanges} disabled={!canUpdateTransport} tooltipMessage={message} />
        </div>
        <div className="mt-8 flex flex-col">
          <div className="flex flex-col border border-gray-300 rounded-lg py-2 px-2.5">
            <div className="flex justify-between flex-row items-center">
              <PointDeRassemblementLabel pdr={selectedPDR} showLink={user.role !== ROLES.TRANSPORTER} />
              {canUpdatePdrId && editPdr && (
                <button type="button" ref={refButtonChangesPDR} className="text-xs font-normal leading-6 text-blue-500">
                  Changer de lieu
                </button>
              )}
            </div>
          </div>
          {/* List PDR Dropdown */}
          <div className="relative">
            <div
              ref={refSelect}
              className={`${!open ? "hidden" : ""} ${
                filteredPDR.length > 5 ? "h-[300px] overflow-y-auto" : ""
              } absolute left-0 z-50 w-full rounded-lg border border-gray-300 bg-white px-3 shadow-lg`}>
              <div className="sticky top-0 z-10 bg-white pt-3">
                <div className="flex flex-row items-center gap-2">
                  <BsSearch className="text-gray-400" />
                  <input
                    ref={refInput}
                    type="text"
                    placeholder="Rechercher un point de rassemblement"
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-[13px] leading-3 text-gray-800"
                  />
                </div>
                <hr className="my-2" />
              </div>
              {filteredPDR.map((p) => (
                <div key={p._id}>
                  <div
                    onClick={() => {
                      setSelectedPDR(p);
                      setOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-4 rounded-lg py-1 px-2 hover:bg-gray-50 ">
                    <PointDeRassemblementLabel pdr={p} showLink={false} />
                  </div>
                  <hr className="my-2" />
                </div>
              ))}
              {filteredPDR.length === 0 && (
                <div className="flex items-center justify-center gap-2 pt-2 pb-4">
                  <div className="text-xs leading-4 text-gray-900">Aucun point de rassemblement trouvé</div>
                </div>
              )}
            </div>
          </div>
          {/* End List PDR Dropdown */}

          <div className="mt-8 flex flex-col gap-4">
            <Select
              label="Type de transport"
              options={options}
              selected={options.find((e) => e.value === data.transportType)}
              setSelected={(e) => setData({ ...data, transportType: e.value })}
              readOnly={!editPdr || !canUpdatePdrTransportType}
            />
            <div className="text-xs font-medium leading-4 text-gray-900">Aller</div>
            <div className="flex items-center gap-4">
              <Field
                label="Heure d’arrivée du transport"
                onChange={(e) => setData({ ...data, busArrivalHour: e.target.value })}
                placeholder="hh:mm"
                value={data?.busArrivalHour}
                error={errors?.busArrivalHour}
                readOnly={!editPdr}
                disabled={editPdr && !canUpdatePdrSchedule}
              />
              <Field
                label="Heure de convocation"
                onChange={(e) => setData({ ...data, meetingHour: e.target.value })}
                placeholder="hh:mm"
                value={data.meetingHour}
                error={errors?.meetingHour}
                readOnly={!editPdr}
                disabled={editPdr && !canUpdatePdrSchedule}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-1/2 text-xs font-medium leading-4 text-gray-900">Aller</div>
              <div className="w-1/2 text-xs font-medium leading-4 text-gray-900">Retour</div>
            </div>
            <div className="flex items-center gap-4">
              <Field
                label="Heure de départ"
                onChange={(e) => setData({ ...data, departureHour: e.target.value })}
                placeholder="hh:mm"
                value={data?.departureHour}
                error={errors?.departureHour}
                readOnly={!editPdr}
                disabled={editPdr && !canUpdatePdrSchedule}
              />
              <Field
                label="Heure d’arrivée"
                onChange={(e) => setData({ ...data, returnHour: e.target.value })}
                placeholder="hh:mm"
                value={data.returnHour}
                error={errors?.returnHour}
                readOnly={!editPdr}
                disabled={editPdr && !canUpdatePdrSchedule}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="pb-1 text-lg font-medium leading-5 text-gray-900"> </div>
            <Link
              target="_blank"
              to={`/ligne-de-bus/volontaires/point-de-rassemblement/${pdr._id?.toString()}?cohort=${cohort?.name}&ligneId=${bus._id.toString()}`}
              className="w-full">
              <Button type="tertiary" title={`Voir les volontaires (${youngsCount})`} className="w-full max-w-none" />
            </Link>
          </div>
          <div className="mt-8 flex justify-end">
            <PDRIcon />
          </div>
        </div>
      </form>
      <ConfirmChangesModal
        isOpen={showConfirmChangesModal}
        onCancel={handleCancelChanges}
        onConfirm={handleSubmitInfo}
        cohort={cohort || null}
        beforeChangeFormData={pdr}
        afterChangeFormData={{
          ...selectedPDR,
          transportType: data.transportType || "bus",
          meetingHour: data.meetingHour || "",
          busArrivalHour: data.busArrivalHour || "",
          departureHour: data.departureHour || "",
          returnHour: data.returnHour || "",
        }}
        youngsCount={youngsCount}
        areNotificationsEnabled={canSendNotification}
        loading={isLoading}
      />
    </>
  );
}
