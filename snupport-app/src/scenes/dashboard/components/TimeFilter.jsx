import React, { useState } from "react";
import { classNames } from "../../../utils";

const TimeFilter = ({ timePeriod, setTimePeriod, setStartDate, setEndDate }) => {
  const [isPeriod, setIsPeriod] = useState(false);
  const Button = ({ text, value, onClick }) => {
    return (
      <button
        className={classNames(
          timePeriod === value || (text === "Personnalisé" && isPeriod === true) ? "text-gray-900" : "text-gray-900/50",
          "text-base font-medium transition-colors"
        )}
        onClick={onClick}
      >
        {text}
      </button>
    );
  };
  return (
    <div className="flex gap-x-[50px] gap-y-4">
      {!isPeriod && (
        <>
          <Button text="Les 7 derniers jours" value="7" onClick={() => setTimePeriod("7")} />
          <Button text="Les 30 derniers jours" value="30" onClick={() => setTimePeriod("30")} />
          <Button text="Les 6 derniers mois" value="182" onClick={() => setTimePeriod("182")} />
          <Button text="Depuis 1 an" value="365" onClick={() => setTimePeriod("365")} />
          <Button text="Personnalisé" onClick={() => setIsPeriod(true)} />
        </>
      )}
      {isPeriod && (
        <>
          <Button
            text="Défaut"
            onClick={() => {
              setIsPeriod(false);
              setStartDate(undefined);
              setEndDate(undefined);
            }}
          />
          <Button text="Personnalisé" onClick={() => setIsPeriod(true)} />
          <span className="mt-2 text-base font-medium text-gray-900/50 transition-colors ">Début : </span>
          <input
            type="date"
            className="w-[200px] rounded-md border border-gray-300 bg-white pl-4  pr-3 text-gray-500"
            onChange={(e) => setStartDate(`${e.target.value} 00:00:00`)}
          />
          <span className="mt-2 text-base font-medium text-gray-900/50 transition-colors ">Fin : </span>
          <input
            type="date"
            className="w-[200px] rounded-md border border-gray-300 bg-white pl-4  pr-3 text-gray-500"
            onChange={(e) => setEndDate(`${e.target.value} 23:59:59:999`)}
          />
        </>
      )}
    </div>
  );
};

export default TimeFilter;
