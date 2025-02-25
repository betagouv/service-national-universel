import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import { canEditLigneBusCenter, isBusEditionOpen, isSuperAdmin, ROLES, translate } from "snu-lib";
import ExternalLink from "../../../../../assets/icons/ExternalLink";
import Pencil from "../../../../../assets/icons/Pencil";
import { capture } from "../../../../../sentry";
import api from "../../../../../services/api";
import Field from "../../components/Field";
import Iceberg from "../../components/Icons/Iceberg";
import { BsSearch } from "react-icons/bs";
import { AuthState } from "@/redux/auth/reducer";
import CentreLabel from "./CentreLabel";
import { useQuery } from "@tanstack/react-query";

export default function Centre({ bus, setBus, cohort }) {
  const user = useSelector((state: AuthState) => state.Auth.user);
  const [editCenter, setEditCenter] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [data, setData] = React.useState({
    centerArrivalTime: bus.centerArrivalTime || "",
    centerDepartureTime: bus.centerDepartureTime || "",
  });

  function resetData() {
    setData({
      centerArrivalTime: bus.centerArrivalTime || "",
      centerDepartureTime: bus.centerDepartureTime || "",
    });
    setErrors({});
  }

  function setCenter(center) {
    setBus({ ...bus, centerDetail: center });
  }

  const onSubmitInfo = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      const errors: Record<string, string> = {};

      const regex = new RegExp("^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$");
      if (!regex.test(data.centerArrivalTime)) errors.centerArrivalTime = "Format invalide (hh:mm)";
      if (!regex.test(data.centerDepartureTime)) errors.centerDepartureTime = "Format invalide (hh:mm)";

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        setIsLoading(false);
        return;
      }
      // Save data
      const { ok, code, data: ligneInfo } = await api.put(`/ligne-de-bus/${bus._id}/centre`, data);

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la modification des informations du centre", translate(code));
        return setIsLoading(false);
      }
      resetData();
      setBus(ligneInfo);
      setEditCenter(false);
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups", "Une erreur est survenue lors de la modification des informations du centre");
      setIsLoading(false);
    }
  };
  return (
    <div className="w-1/2 rounded-xl bg-white p-8">
      <div className="flex items-center justify-between">
        <div className="text-lg leading-7 text-gray-900 font-bold">Centre de cohésion</div>
        {canEditLigneBusCenter(user) || isBusEditionOpen(user, cohort) ? (
          <>
            {!editCenter ? (
              <button
                className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => {
                  setEditCenter(true);
                  resetData();
                }}
                disabled={isLoading}>
                <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
                Modifier
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs leading-5 text-gray-700 hover:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => {
                    setEditCenter(false);
                    resetData();
                  }}
                  disabled={isLoading}>
                  Annuler
                </button>
                <button
                  className="flex cursor-pointer items-center gap-2 rounded-full  border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={onSubmitInfo}
                  disabled={isLoading}>
                  <Pencil stroke="#2563EB" className="mr-[6px] h-[12px] w-[12px]" />
                  Enregistrer les changements
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
      <div className="mt-8 flex flex-col">
        <SelectCenter center={bus.centerDetail} setCenter={setCenter} disabled={!editCenter} />
        <div className="mt-8 flex items-center gap-4">
          <Field
            label="Heure d’arrivée"
            onChange={(e) => setData({ ...data, centerArrivalTime: e.target.value })}
            placeholder="hh:mm"
            value={data.centerArrivalTime}
            error={errors?.centerArrivalTime}
            readOnly={!editCenter}
          />
          <Field
            label="Heure de départ"
            onChange={(e) => setData({ ...data, centerDepartureTime: e.target.value })}
            placeholder="hh:mm"
            value={data.centerDepartureTime}
            error={errors?.centerDepartureTime}
            readOnly={!editCenter}
          />
        </div>
        <div className="mt-8 flex justify-end">
          <Iceberg />
        </div>
      </div>
      {/* <ConfirmChangesModal
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
      /> */}
    </div>
  );
}

const mockCenters = [
  {
    _id: "1",
    name: "Centre de Paris",
    department: "Paris",
    region: "Ile-de-France",
    address: "1 rue de Paris",
    zip: "75000",
    city: "Paris",
  },
  {
    _id: "2",
    name: "Centre de Marseille",
    department: "Bouches-du-Rhône",
    region: "Provence-Alpes-Côte d'Azur",
    address: "1 rue de Marseille",
    zip: "13000",
    city: "Marseille",
  },
];

function useCenter({ search }) {
  return useQuery({
    queryKey: ["centre", { search }],
    queryFn: () => mockCenters,
  });
}

function SelectCenter({ center, setCenter, disabled }) {
  const user = useSelector((state: AuthState) => state.Auth.user);
  const [search, setSearch] = React.useState("");
  const { data, isPending, isError } = useCenter({ search });

  const [open, setOpen] = React.useState(false);
  const refSelect = React.useRef<HTMLDivElement>(null);
  const refInput = React.useRef<HTMLInputElement>(null);
  const refButtonChangesPDR = React.useRef<HTMLButtonElement>(null);

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

  return (
    <>
      <div className="flex flex-col border border-gray-300 rounded-lg py-2 px-2.5">
        <div className="flex justify-between">
          <CentreLabel centre={center} showLink={user.role !== ROLES.TRANSPORTER} />
          {isSuperAdmin(user) && !disabled && (
            <button ref={refButtonChangesPDR} className="text-xs font-normal leading-6 text-blue-500">
              Changer de lieu
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="relative">
          <div ref={refSelect} className="max-h-[300px] overflow-y-auto absolute left-0 z-50 w-full rounded-lg border border-gray-300 bg-white px-3 shadow-lg">
            <div className="sticky top-0 z-10 bg-white pt-3">
              <div className="flex flex-row items-center gap-2">
                <BsSearch className="text-gray-400" />
                <input
                  ref={refInput}
                  type="text"
                  placeholder="Rechercher un centre"
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-[13px] leading-3 text-gray-800"
                />
              </div>
              <hr className="my-2" />
            </div>
            <div className="pb-2">
              {isPending ? (
                <div className="text-xs leading-4 text-gray-900">Chargement...</div>
              ) : isError ? (
                <div className="text-xs leading-4 text-red-900">Une erreur est survenue</div>
              ) : data.length === 0 ? (
                <div className="text-xs leading-4 text-gray-900">Aucun point de rassemblement trouvé</div>
              ) : (
                data.map((c) => (
                  <div key={c._id}>
                    <button
                      onClick={() => {
                        setCenter(c);
                        setOpen(false);
                      }}
                      className="w-full gap-4 rounded-lg py-1 px-2 hover:bg-gray-50 ">
                      <CentreLabel centre={c} showLink={false} />
                    </button>
                    <hr className="my-2" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
