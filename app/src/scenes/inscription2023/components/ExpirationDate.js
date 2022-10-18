import { data } from "autoprefixer";
import React from "react";
import DatePickerList from "../../preinscription/components/DatePickerList";
import { formatDateFR, sessions2023 } from "snu-lib";

export default function ExpirationDate({ ID, date, setDate, young }) {
  return (
    <>
      <hr className="my-8 h-px bg-gray-200 border-0" />
      <div className="w-full flex">
        <div className="w-1/2">
          <div className="text-xl font-medium">Renseignez la date d’expiration</div>
          <div className="text-gray-600 leading-loose mt-2 mb-8">
            Votre pièce d’identité doit être valide à votre départ en séjour de cohésion (le {formatDateFR(sessions2023.filter((e) => e.name === young.cohort)[0].dateStart)}).
          </div>
          <DatePickerList value={date} onChange={(date) => setDate({ ...data, date })} />
        </div>
        <div className="w-1/2">
          <img className="h-64 mx-auto" src={require(`../../../assets/IDProof/${ID.imgDate}`)} alt={ID.title} />
        </div>
      </div>
    </>
  );
}
