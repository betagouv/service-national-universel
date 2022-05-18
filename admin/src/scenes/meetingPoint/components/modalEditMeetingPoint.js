import React, { useEffect } from "react";
import ModalForm from "../../../components/modals/ModalForm";

const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

export default function ModalExportMail({ isOpen, onSubmit, onCancel, values }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState({});
  const [error, setError] = React.useState(null);

  const splitDate = (dateString) => {
    let temp = dateString.split(",");
    const [day, date, month] = temp[0].split(" ");
    const [hour, minute] = temp[1].split(" ")[1].split(":");
    return {
      day,
      date,
      month,
      hour,
      minute,
    };
  };

  useEffect(() => {
    setData({
      departureAddress: values?.departureAddress || "",
      departureAt: values?.departureAtString ? splitDate(values?.departureAtString) : {},
      returnAt: values?.returnAtString ? splitDate(values?.returnAtString) : {},
      capacity: values?.capacity || 0,
      placesLeft: values?.placesLeft || 0,
    });
  }, [values]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    data.capacity = parseInt(data.capacity);
    if (data.capacity < values.capacity - values.placesLeft) {
      setError("La capacitée doit être supérieure ou égale au nombre de place occupées");
      setIsLoading(false);
      return;
    }
    data.departureAtString = `${data.departureAt.day} ${data.departureAt.date} ${data.departureAt.month} ${values.cohort ? values.cohort : 2022}, ${data.departureAt.hour}:${
      data.departureAt.minute
    }`;
    data.returnAtString = `${data.returnAt.day} ${data.returnAt.date} ${data.returnAt.month} ${values.cohort ? values.cohort : 2022}, ${data.returnAt.hour}:${
      data.returnAt.minute
    }`;
    setError(null);
    await onSubmit(data);
    setIsLoading(false);
  };

  const onClickCancel = (e) => {
    e.preventDefault();
    onCancel();
  };
  return (
    <ModalForm isOpen={isOpen} onCancel={onCancel} showCloseIcon={false}>
      <div className="w-full">
        <div className="mx-4">
          <div className="flex items-center justify-center text-gray-900 text-xl font-medium">Point de rassemblement</div>
          <div className="flex items-center justify-center text-gray-500 text-sm font-normal text-center">Vous êtes sur le point de modifier les informations suivante(s) :</div>
          <div className="mt-4 flex flex-col gap-4">
            <div className={`flex flex-1 flex-col border-[1px] rounded-lg py-1 px-2 ${isLoading && "bg-gray-200"}`}>
              <label htmlFor="departureAddress" className="w-full m-0 text-left text-gray-500">
                Adresse postale
              </label>
              <input
                required
                type="text"
                disabled={isLoading}
                className="w-full disabled:bg-gray-200"
                id="departureAddress"
                onChange={(e) => setData({ ...data, departureAddress: e.target.value })}
                value={data.departureAddress}
              />
            </div>
            <div className="flex flex-1 flex-col border-[1px] rounded-lg py-1 px-2 bg-gray-200">
              <label htmlFor="departureAddress" className="w-full m-0 text-left text-gray-500">
                Département
              </label>
              <input type="text" disabled className="w-full disabled:bg-gray-200" value={values?.department} />
            </div>

            <div className={`flex flex-1 flex-col border-[1px] rounded-lg py-1 px-2 ${isLoading && "bg-gray-200"}`}>
              <label htmlFor="departureAt" className="w-full m-0 text-left text-gray-500">
                Date et heure de rendez-vous aller
              </label>
              {SelectDate({
                date: data.departureAt,
                year: values?.cohort || "2022",
                handleChange: (e) => setData({ ...data, departureAt: { ...data.departureAt, [e.target.name]: e.target.value } }),
              })}
            </div>
            <div className={`flex flex-1 flex-col border-[1px] rounded-lg py-1 px-2 ${isLoading && "bg-gray-200"}`}>
              <label htmlFor="returnAt" className="w-full m-0 text-left text-gray-500">
                Date et heure de rendez-vous retour
              </label>
              {SelectDate({
                date: data.returnAt,
                year: values?.cohort || "2022",
                handleChange: (e) => setData({ ...data, returnAt: { ...data.returnAt, [e.target.name]: e.target.value } }),
              })}
            </div>
            <div className={`flex flex-1 flex-col border-[1px] rounded-lg py-1 px-2 ${isLoading && "bg-gray-200"}`}>
              <label htmlFor="capacity" className="w-full m-0 text-left text-gray-500">
                Capacité du bus ({values?.capacity - values?.placesLeft || 0} places occupées)
              </label>
              <input
                required
                className="w-full"
                disabled={isLoading}
                type="number"
                id="capacity"
                value={data.capacity}
                onChange={(e) => setData({ ...data, capacity: e.target.value })}
              />
            </div>
            {error && <div className="text-red-500 text-xs italic text-center">{error}</div>}
          </div>
        </div>

        <div className="flex p-4 gap-2">
          <button
            className="flex items-center justify-center flex-1 border-[1px] border-gray-300 text-gray-700 rounded-lg py-2 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
            disabled={isLoading}
            onClick={onClickCancel}
            type="button">
            Annuler
          </button>
          <button
            className="flex items-center justify-center flex-1 bg-snu-purple-300 text-white rounded-lg py-2 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
            disabled={isLoading}
            onClick={handleSubmit}
            type="button">
            Confirmer
          </button>
        </div>
      </div>
    </ModalForm>
  );
}

const SelectDate = ({ date, handleChange, year }) => {
  return (
    <div className="flex flex-row">
      <select className="bg-inherit" name="day" value={date?.day} onChange={handleChange}>
        {days.map((day, index) => (
          <option key={index} value={day}>
            {day}
          </option>
        ))}
      </select>
      <select className="bg-inherit pl-1" name="date" value={date?.date} onChange={handleChange}>
        {Array.from({ length: 31 }, (_, i) => i + 1).map((date, index) => (
          <option key={index} value={date}>
            {date}
          </option>
        ))}
      </select>
      <select className="bg-inherit pl-1" name="month" value={date?.month} onChange={handleChange}>
        {months.map((month, index) => (
          <option key={index} value={month}>
            {month}
          </option>
        ))}
      </select>
      <div className="px-2 text-center">{year} à : </div>
      <select className="bg-inherit pl-1" name="hour" value={date?.hour} onChange={handleChange}>
        {Array.from(Array(24).keys()).map((hour, index) => (
          <option key={index} value={hour.toString().length === 1 ? `0${hour}` : `${hour}`}>
            {hour.toString().length === 1 ? `0${hour}` : `${hour}`}
          </option>
        ))}
      </select>
      <div className="pl-1 text-center">h</div>
      <select className="bg-inherit pl-1" name="minute" value={date?.minute} onChange={handleChange}>
        {Array.from(Array(60).keys()).map((min, index) => (
          <option key={index} value={min.toString().length === 1 ? `0${min}` : `${min}`}>
            {min.toString().length === 1 ? `0${min}` : `${min}`}
          </option>
        ))}
      </select>
    </div>
  );
};
