import React from "react";
import { useSelector } from "react-redux";
import { canEditLigneBusPointDeRassemblement, isBusEditionOpen, isPdrEditionOpen, ROLES, translate } from "snu-lib";
import DoubleProfil from "../../components/Icons/DoubleProfil";
import Pencil from "../../../../../assets/icons/Pencil";
import ExternalLink from "../../../../../assets/icons/ExternalLink";
import { Link } from "react-router-dom";
import Select from "../../components/Select";
import Field from "../../components/Field";
import PDR from "../../components/Icons/PDR";
import { BsChevronDown, BsSearch } from "react-icons/bs";
import { capture } from "../../../../../sentry";
import { toastr } from "react-redux-toastr";
import api from "../../../../../services/api";
import Loader from "../../../../../components/Loader";

const options = [
  { label: "Bus", value: "bus" },
  { label: "Train", value: "train" },
  { label: "Avion", value: "avion" },
  // { label: "Fusée", value: "fusée" },
];

const keys = ["code", "name", "city", "zip", "department", "region"];

export default function PointDeRassemblement({ bus, setBus, index, pdr, volume, getVolume, cohort }) {
  const user = useSelector((state) => state.Auth.user);
  const [editPdr, setEditPdr] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [open, setOpen] = React.useState(false);
  const [listPDR, setListPDR] = React.useState([]);
  const [filteredPDR, setFilteredPDR] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [selectedPDR, setSelectedPDR] = React.useState(pdr);
  const [data, setData] = React.useState({
    transportType: pdr.transportType || "bus",
    meetingHour: pdr.meetingHour || "",
    busArrivalHour: pdr.busArrivalHour || "",
    departureHour: pdr.departureHour || "",
    returnHour: pdr.returnHour || "",
  });

  const refSelect = React.useRef(null);
  const refInput = React.useRef(null);
  const refContainer = React.useRef(null);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (refContainer.current && refContainer.current.contains(event.target)) {
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
        const { ok, data } = await api.get(`/ligne-de-bus/${bus._id}/availablePDR`);
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
    let filteredPDR = listPDR
      .filter((item) => {
        if (search === "") return true;
        for (let key of keys) {
          if (item[key].toLowerCase().includes(search?.toLowerCase())) {
            return true;
          }
        }
        return false;
      })
      .filter((item) => !bus.meetingPointsIds.includes(item._id.toString()));

    setFilteredPDR(filteredPDR);
  }, [search, listPDR, bus]);

  const onSubmitInfo = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      let errors = {};

      const regex = new RegExp("^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$");
      if (!regex.test(data.meetingHour)) errors.meetingHour = "Format invalide (hh:mm)";
      if (!regex.test(data.busArrivalHour)) errors.busArrivalHour = "Format invalide (hh:mm)";
      if (!regex.test(data.departureHour)) errors.departureHour = "Format invalide (hh:mm)";
      if (!regex.test(data.returnHour)) errors.returnHour = "Format invalide (hh:mm)";

      //check if meeting hour is before bus arrival hour
      if (checkTime(data.departureHour, data.meetingHour)) errors.meetingHour = "L'heure de convocation doit être avant l'heure de départ";
      //check if bus arrival hour is before departure hour
      if (checkTime(data.departureHour, data.busArrivalHour)) errors.busArrivalHour = "L'heure d'arrivée du bus doit être avant l'heure de départ";

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        setIsLoading(false);
        return;
      }

      // Save data
      const {
        ok,
        code,
        data: ligneInfo,
      } = await api.put(`/ligne-de-bus/${bus._id}/pointDeRassemblement`, { ...data, meetingPointId: pdr.meetingPointId, newMeetingPointId: selectedPDR._id });

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la modification des informations du point de rassemblement", translate(code));
        return setIsLoading(false);
      }
      setBus(ligneInfo);
      await getVolume();
      setEditPdr(false);
      setIsLoading(false);
      setSearch("");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modification des informations du point de rassemblement");
      setIsLoading(false);
    }
  };

  if (!volume)
    return (
      <div className="w-full rounded-xl bg-white p-8">
        <Loader />
      </div>
    );

  return (
    <div className="w-full rounded-xl bg-white p-8">
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="text-lg leading-7 text-gray-900 font-bold">Point de rassemblement</div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-sm">{index}</div>
          <div className="ml-3 flex items-center gap-2">
            <DoubleProfil className="text-gray-400" />
            <div className="pb-1 text-lg font-medium leading-5 text-gray-900">{volume.find((v) => v.meetingPointId === pdr._id)?.youngsCount || 0} </div>
          </div>
        </div>
        {canEditLigneBusPointDeRassemblement(user) || isBusEditionOpen(user, cohort) ? (
          <>
            {!editPdr ? (
              <button
                className="absolute top-0 right-0 flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setEditPdr(true)}
                disabled={isLoading}>
                <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
                Modifier
              </button>
            ) : (
              <div className="absolute top-0 right-0 flex flex-col items-end justify-end gap-2">
                <button
                  className="flex cursor-pointer items-center gap-2 rounded-full  border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={onSubmitInfo}
                  disabled={isLoading}>
                  <Pencil stroke="#2563EB" className="mr-[6px] h-[12px] w-[12px]" />
                  Enregistrer les changements
                </button>
                <button
                  className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs leading-5 text-gray-700 hover:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setEditPdr(false)}
                  disabled={isLoading}>
                  Annuler
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
      <div className="mt-8 flex flex-col">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-medium leading-6 text-[#242526]">
              {pdr.department} • {pdr.region}
            </p>
            {user.role !== ROLES.TRANSPORTER && (
              <Link
                to={`/point-de-rassemblement/${pdr._id}`}
                onClick={(e) => {
                  e.stopPropagation();
                }}>
                <ExternalLink className="text-[#9CA3AF]" />
              </Link>
            )}
          </div>
          <p className="text-xs font-light leading-4 text-[#738297]">{pdr.name}</p>
          <p className="text-xs font-light leading-4 text-[#738297]">
            {pdr.address}, {pdr.zip}, {pdr.city}
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-4">
          {user.role === ROLES.ADMIN && editPdr && !volume.find((v) => v.meetingPointId === pdr._id)?.youngsCount && (
            <div className="relative">
              <div
                ref={refContainer}
                className={`mt-2 flex h-[63px] w-full items-center justify-between rounded-lg bg-white py-2 px-2.5 ${
                  open ? "border-2 border-blue-500" : "border-[1px] border-gray-300"
                }`}>
                <div className="flex w-[90%] flex-col justify-center">
                  <div className="text-xs font-normal leading-6 text-gray-500">Choisir un point de rassemblement</div>
                  <div className="w-full flex-1 truncate text-sm leading-6 text-gray-800">
                    {selectedPDR.name}, {selectedPDR.address}, {selectedPDR.zip}, {selectedPDR.city} ({selectedPDR.department} • {selectedPDR.region})
                  </div>
                </div>
                <div className="pointer-events-none flex items-center pr-2">
                  <BsChevronDown className={` h-4 w-4 text-gray-400  ${open ? "rotate-180 transform" : ""}`} />
                </div>
              </div>
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
                      <div className="text-sm leading-5 text-gray-900">{p.name}</div>
                      <div className="flex-1 truncate text-sm leading-5 text-gray-500">
                        {p.department} • {p.region}
                      </div>
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
          )}
          <Select
            label="Type de transport"
            options={options}
            selected={options.find((e) => e.value === data.transportType)}
            setSelected={(e) => setData({ ...data, transportType: e.value })}
            readOnly={!editPdr}
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
              disabled={editPdr && ![ROLES.TRANSPORTER, ROLES.ADMIN].includes(user.role)}
            />
            <Field
              label="Heure de convocation"
              onChange={(e) => setData({ ...data, meetingHour: e.target.value })}
              placeholder="hh:mm"
              value={data.meetingHour}
              error={errors?.meetingHour}
              readOnly={!editPdr}
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
              disabled={editPdr && ![ROLES.TRANSPORTER, ROLES.ADMIN].includes(user.role)}
            />
            <Field
              label="Heure d’arrivée"
              onChange={(e) => setData({ ...data, returnHour: e.target.value })}
              placeholder="hh:mm"
              value={data.returnHour}
              error={errors?.returnHour}
              readOnly={!editPdr}
              disabled={editPdr && ![ROLES.TRANSPORTER, ROLES.ADMIN].includes(user.role)}
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <PDR />
        </div>
      </div>
    </div>
  );
}

function checkTime(time1, time2) {
  var time1Split = time1.split(":");
  var time2Split = time2.split(":");

  // Check if the hours are equal
  if (time1Split[0] === time2Split[0]) {
    // If the hours are equal, check if the minutes in time2 are greater than time1
    if (time2Split[1] >= time1Split[1]) {
      return true;
    } else {
      return false;
    }
  } else {
    // If the hours are not equal, check if the hours in time2 are greater than time1
    if (time2Split[0] > time1Split[0]) {
      return true;
    } else {
      return false;
    }
  }
}
