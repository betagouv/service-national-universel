import React from "react";
import StatusText from "./StatusText";

export default function OccupationBarVertical({ percentage, nbDepart, departMotif }) {
  let height = `h-0`;
  let bgColor = "bg-blue-700";
  let occupationPercentage = percentage * 100;

  const exclusion = departMotif?.Exclusion || 0;
  const forceMajeure = departMotif && "Cas de force majeure pour le volontaire" in departMotif ? departMotif["Cas de force majeure pour le volontaire"] : 0;
  const annulation = departMotif && "Annulation du séjour ou mesure d’éviction sanitaire" in departMotif ? departMotif["Annulation du séjour ou mesure d’éviction sanitaire"] : 0;
  const autre = departMotif?.Autre || 0;

  if (isNaN(occupationPercentage)) occupationPercentage = 0;

  if (occupationPercentage < 20) height = "h-[20%]";
  else if (occupationPercentage < 30) height = "h-[30%]";
  else if (occupationPercentage < 40) height = "h-[40%]";
  else if (occupationPercentage < 50) height = "h-[50%]";
  else if (occupationPercentage < 60) height = "h-[60%]";
  else if (occupationPercentage < 70) height = "h-[70%]";
  else if (occupationPercentage < 80) height = "h-[80%]";
  else if (occupationPercentage < 100) height = "h-[90%]";
  else if (occupationPercentage >= 100) height = "h-[100%]";

  return (
    <div className="flex items-center gap-10">
      <div className="flex flex-col gap-5">
        {Math.floor(occupationPercentage) === 0 ? (
          <div className="flex h-52 w-16 flex-col items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-xs font-bold">0%</div>
        ) : (
          <div className="flex h-52 w-16  flex-col justify-end overflow-hidden rounded-lg bg-gray-100">
            <div className={`flex w-16 items-center justify-center ${height} ${bgColor} rounded-lg text-xs font-bold text-white`}>{Math.floor(occupationPercentage)}%</div>
          </div>
        )}
        <p className="text-sm font-bold leading-4 text-gray-900">{nbDepart || 0} départs</p>
      </div>
      <div className="flex flex-col gap-5">
        <p className="text-base font-bold leading-5 text-gray-900">Motifs de départ</p>
        <div className="flex flex-col gap-1">
          <StatusText status="Exclusion" nb={exclusion} percentage={nbDepart ? Math.floor((exclusion / nbDepart) * 100) : 0} />
          <StatusText status="Cas de force majeur" nb={forceMajeure} percentage={nbDepart ? Math.floor((forceMajeure / nbDepart) * 100) : 0} />
          <StatusText status="Annulation séjour, éviction sanitaire" nb={annulation} percentage={nbDepart ? Math.floor((annulation / nbDepart) * 100) : 0} />
          <StatusText status="Autre" nb={autre} percentage={nbDepart ? Math.floor((autre / nbDepart) * 100) : 0} />
        </div>
      </div>
    </div>
  );
}
