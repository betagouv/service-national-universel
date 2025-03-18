import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import { canEditLigneBusCenter, isBusEditionOpen, ROLES, translate } from "snu-lib";
import ExternalLink from "../../../../../assets/icons/ExternalLink";
import Pencil from "../../../../../assets/icons/Pencil";
import { capture } from "../../../../../sentry";
import api from "../../../../../services/api";
import Field from "../../components/Field";
import Iceberg from "../../components/Icons/Iceberg";

export default function Centre({ bus, setBus, cohort }) {
  const user = useSelector((state) => state.Auth.user);
  const [editCenter, setEditCenter] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [data, setData] = React.useState({
    centerArrivalTime: bus.centerArrivalTime || "",
    centerDepartureTime: bus.centerDepartureTime || "",
  });

  React.useEffect(() => {
    setData({
      centerArrivalTime: bus.centerArrivalTime || "",
      centerDepartureTime: bus.centerDepartureTime || "",
    });
    setErrors({});
  }, [editCenter]);

  const onSubmitInfo = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      let errors = {};

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
      setBus(ligneInfo);
      setEditCenter(false);
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modification des informations du centre");
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
                onClick={() => setEditCenter(true)}
                disabled={isLoading}>
                <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
                Modifier
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs leading-5 text-gray-700 hover:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setEditCenter(false)}
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
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-medium leading-6 text-[#242526]">
              {bus.centerDetail.department} • {bus.centerDetail.region}
            </p>
            {user.role !== ROLES.TRANSPORTER && (
              <Link
                to={`/centre/${bus.centerDetail._id}`}
                onClick={(e) => {
                  e.stopPropagation();
                }}>
                <ExternalLink className="text-[#9CA3AF]" />
              </Link>
            )}
          </div>
          <p className="text-xs font-light leading-4 text-[#738297]">{bus.centerDetail.name}</p>
          <p className="text-xs font-light leading-4 text-[#738297]">
            {bus.centerDetail.address}, {bus.centerDetail.zip}, {bus.centerDetail.city}
          </p>
        </div>
        <div>{/* TODO V2 modif de centre de destination */}</div>
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
    </div>
  );
}
