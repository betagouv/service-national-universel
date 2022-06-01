import React, { useState, useRef } from "react";
import InformationCircle from "../../../assets/icons/InformationCircle";
import ChevronDown from "../../../assets/icons/ChevronDown";
import { BsCheck2 } from "react-icons/bs";

export default function Equivalence() {
  const options = ["Service Civique", "BAFA", "Jeune Sapeur Pompier"];
  const [data, setData] = useState({});
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);
  return (
    <div className="flex justify-center align-center my-4 ">
      <div className="w-1/2 p-4">
        <div className="text-4xl text-center font-extrabold leading-10 tracking-tight ">Je demande la reconnaissance d’un engagement déjà réalisé</div>
        <div className="border-[1px] border-blue-400 rounded-lg bg-blue-50 mt-4">
          <div className="flex items-center px-4 py-3">
            <InformationCircle className="text-blue-400" />
            <div className="ml-4 text-blue-800 text-sm leading-5 font-medium">Pour être reconnu et validé, votre engagement doit être terminé.</div>
          </div>
        </div>
        <div className="rounded-lg bg-white mt-4 p-6">
          <div className="text-lg leading-7 font-bold">Informations générales</div>
          <div className="text-sm leading-5 font-normal text-gray-500 mt-2">Veuillez compléter le formulaire ci-dessous.</div>
          <div className="mt-6 text-xs leading-4 font-medium">Quoi ?</div>
          <div className="border-[1px] border-gray-300 w-full rounded-lg mt-3 px-3 py-2">
            {data?.type ? <div className="text-xs leading-4 font-normal text-gray-500">Type d&apos;engagement</div> : null}
            <div className="relative" ref={ref}>
              <button className="flex justify-between items-center cursor-pointer disabled:opacity-50 disabled:cursor-wait w-full" onClick={() => setOpen((e) => !e)}>
                <div className="flex items-center gap-2">
                  {data?.type ? (
                    <span className="text-sm leading-5 font-normal">{data?.type}</span>
                  ) : (
                    <span className="text-gray-500 text-sm leading-5 font-normal">Type d’engagement</span>
                  )}
                </div>
                <ChevronDown className="text-gray-400" />
              </button>
              {/* display options */}
              <div className={`${open ? "block" : "hidden"}  rounded-lg min-w-full bg-white transition absolute left-0 shadow overflow-hidden z-50 top-[30px]`}>
                {options.map((option) => (
                  <div key={option} onClick={() => setData({ ...data, type: option })} className={`${option === data.type && "font-bold bg-gray"}`}>
                    <div className="group flex justify-between items-center gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                      <div>{option}</div>
                      {option === data.type ? <BsCheck2 /> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-[1px] border-gray-300 w-full px-3 py-2 rounded-lg mt-3">
            {data?.structure ? <div className="text-xs leading-4 font-normal text-gray-500">Nom de la structure</div> : null}
            <input
              className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500"
              placeholder="Nom de la structure d’accueil"
              type="text"
              onChange={(e) => setData({ ...data, structure: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
