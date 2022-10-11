import React from "react";
import DatePickerList from "../../preinscription/components/DatePickerList";

export default function ExpirationDate({ ID, date, setDate }) {
  return (
    <>
      <hr className="my-4 h-px bg-gray-200 border-0" />
      <div className="text-2xl font-semibold">Renseignez la date d’expiration</div>
      <div className="text-gray-600 text-sm mt-2">Votre pièce d’identité doit être valide à votre départ en séjour de cohésion.</div>
      <div className="w-full flex items-center justify-center my-4">
        <div className="w-3/4 flex flex-col gap-4">
          <img src={require(`../../../assets/IDProof/${ID.imgDate}`)} alt={ID.title} />
        </div>
      </div>
      <div className="flex flex-col flex-start my-4">
        <DatePickerList title="" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
    </>
  );
}
