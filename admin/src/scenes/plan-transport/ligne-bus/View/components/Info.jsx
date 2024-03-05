import React from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory, Link } from "react-router-dom";
import { canEditLigneBusGeneralInfo, isBusEditionOpen, translate } from "snu-lib";
import Pencil from "../../../../../assets/icons/Pencil";
import Loader from "../../../../../components/Loader";
import { capture } from "../../../../../sentry";
import api from "../../../../../services/api";
import DatePickerList from "../../components/DatePickerList";
import Field from "../../components/Field";
import Select from "../../components/Select";
import { Button } from "@snu/ds/admin";

const options = [
  { label: "Oui", value: true },
  { label: "Non", value: false },
];

export default function Info({ bus, setBus, dataForCheck, nbYoung, cohort }) {
  const user = useSelector((state) => state.Auth.user);
  const [editInfo, setEditInfo] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [data, setData] = React.useState({
    busId: bus.busId || "",
    departuredDate: bus.departuredDate || "",
    returnDate: bus.returnDate || "",
    youngCapacity: bus.youngCapacity || "",
    totalCapacity: bus.totalCapacity || "",
    followerCapacity: bus.followerCapacity || "",
    travelTime: bus.travelTime || "",
    lunchBreak: bus.lunchBreak || false,
    lunchBreakReturn: bus.lunchBreakReturn || false,
  });

  const history = useHistory();

  React.useEffect(() => {
    setData({
      busId: bus.busId || "",
      departuredDate: bus.departuredDate || "",
      returnDate: bus.returnDate || "",
      youngCapacity: bus.youngCapacity || 0,
      totalCapacity: bus.totalCapacity || 0,
      followerCapacity: bus.followerCapacity || 0,
      travelTime: bus.travelTime || "",
      lunchBreak: bus.lunchBreak || false,
      lunchBreakReturn: bus.lunchBreakReturn || false,
    });
    setErrors({});
  }, [editInfo]);

  const onSubmitInfo = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      let errors = {};
      if (!data.busId) errors.busId = "Ce champ est obligatoire";
      if (!data.departuredDate) errors.departuredDate = "Ce champ est obligatoire";
      if (!data.returnDate) errors.returnDate = "Ce champ est obligatoire";
      if (!data.youngCapacity) errors.youngCapacity = "Ce champ est obligatoire";
      if (!data.totalCapacity) errors.totalCapacity = "Ce champ est obligatoire";
      if (!data.followerCapacity) errors.followerCapacity = "Ce champ est obligatoire";
      if (!data.travelTime) errors.travelTime = "Ce champ est obligatoire";
      if (isNaN(data?.youngCapacity)) errors.youngCapacity = "La capacité doit être un nombre";
      if (isNaN(data?.followerCapacity)) errors.followerCapacity = "La capacité doit être un nombre";
      if (isNaN(data?.totalCapacity)) errors.totalCapacity = "La capacité doit être un nombre";

      data.totalCapacity = parseInt(data.totalCapacity);
      data.youngCapacity = parseInt(data.youngCapacity);
      data.followerCapacity = parseInt(data.followerCapacity);

      //total capacity must be greater than young capacity + follower capacity
      if (data?.totalCapacity < data?.youngCapacity + data?.followerCapacity) {
        errors.totalCapacity = "La capacité totale doit être supérieure ou égale à la capacité volontaire + la capacité accompagnateurs";
      }

      if (dataForCheck.youngsCountBus > data.youngCapacity) {
        errors.youngCapacity = "La capacité volontaire est trop faible par rapport au nombre de volontaire deja affectés à cette ligne";
      }

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        setIsLoading(false);
        return;
      }

      //Save data
      const { ok, code, data: ligneInfo } = await api.put(`/ligne-de-bus/${bus._id}/info`, data);

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la modification de la ligne", translate(code));
        return setIsLoading(false);
      }
      setBus(ligneInfo);
      setEditInfo(false);
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modification de la ligne");
      setIsLoading(false);
    }
  };

  if (!dataForCheck)
    return (
      <div className="w-full rounded-xl bg-white p-8">
        <Loader />
      </div>
    );

  return (
    <div className="w-full rounded-xl bg-white p-8">
      <div className="flex items-center justify-between">
        <div className="text-xl leading-6 text-[#242526]">Informations générales</div>
        {canEditLigneBusGeneralInfo(user) || isBusEditionOpen(user, cohort) ? (
          <>
            {!editInfo ? (
              <button
                className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setEditInfo(true)}
                disabled={isLoading}>
                <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
                Modifier
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs leading-5 text-gray-700 hover:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setEditInfo(false)}
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
      <div className="my-8 flex">
        <div className="flex w-[45%] flex-col justify-between gap-4">
          <div className="flex flex-col gap-4">
            <Field label="Numéro de ligne" onChange={(e) => setData({ ...data, busId: e.target.value })} value={data.busId} error={errors?.busId} readOnly={!editInfo} />
            <div className="flex items-center gap-4">
              <DatePickerList
                label="Date de départ"
                Icon={BsArrowRight}
                onChange={(e) => setData({ ...data, departuredDate: e })}
                value={new Date(data.departuredDate)}
                error={errors?.departuredDate}
                readOnly={!editInfo}
              />
              <DatePickerList
                label="Date de retour"
                Icon={BsArrowLeft}
                onChange={(e) => setData({ ...data, returnDate: e })}
                value={new Date(data.returnDate)}
                error={errors?.returnDate}
                readOnly={!editInfo}
              />
            </div>
          </div>
          <Link to={`/ligne-de-bus/volontaires/bus/${bus._id.toString()}`} className="w-full">
            <Button type="tertiary" title={`Voir les volontaires (${nbYoung})`} className="w-full max-w-none" />
          </Link>
          {bus.classeId && (
            <Link to={`/classe/${bus.classeId}`} className="w-full">
              <Button type="tertiary" title="Voir la classe" className="w-full max-w-none" />
            </Link>
          )}
        </div>
        <div className="flex w-[10%] items-center justify-center">
          <div className="my-2 h-full w-[1px] border-r-[1px] border-gray-300"></div>
        </div>
        <div className="flex w-[45%] flex-col gap-4 ">
          <div className="flex items-center gap-4">
            <Field
              label="Capacité accompagnateur"
              onChange={(e) => setData({ ...data, followerCapacity: e.target.value })}
              value={data.followerCapacity}
              error={errors?.followerCapacity}
              readOnly={!editInfo}
            />
            <Field
              label="Capacité volontaire"
              onChange={(e) => setData({ ...data, youngCapacity: e.target.value })}
              value={data.youngCapacity}
              error={errors?.youngCapacity}
              readOnly={!editInfo}
            />
          </div>
          <div className="flex items-center gap-4">
            <Field
              label="Capacité totale"
              onChange={(e) => setData({ ...data, totalCapacity: e.target.value })}
              value={data.totalCapacity}
              error={errors?.totalCapacity}
              readOnly={!editInfo}
            />
            <Field
              label="Temps de route"
              onChange={(e) => setData({ ...data, travelTime: e.target.value })}
              value={data.travelTime}
              error={errors?.travelTime}
              readOnly={!editInfo}
            />
          </div>
          <div className="flex items-center gap-4">
            <Select
              label="Pause déjeuner aller"
              options={options}
              selected={options.find((e) => e.value === data.lunchBreak)}
              setSelected={(e) => setData({ ...data, lunchBreak: e.value })}
              readOnly={!editInfo}
            />
            <Select
              label="Pause déjeuner retour"
              options={options}
              selected={options.find((e) => e.value === data.lunchBreakReturn)}
              setSelected={(e) => setData({ ...data, lunchBreakReturn: e.value })}
              readOnly={!editInfo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
