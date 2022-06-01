import React, { useState, useRef } from "react";
import InformationCircle from "../../../assets/icons/InformationCircle";
import ChevronDown from "../../../assets/icons/ChevronDown";
import { BsCheck2 } from "react-icons/bs";
import { AiOutlinePlus } from "react-icons/ai";

export default function Equivalence() {
  const optionsType = ["Service Civique", "BAFA", "Jeune Sapeur Pompier"];
  const optionsDuree = ["Heure(s)", "Demi-journée(s)", "Jour(s)"];
  const optionsFrequence = ["Par semaine", "Par mois", "Par an"];
  const [data, setData] = useState({});
  const [openType, setOpenType] = useState(false);
  const [openDuree, setOpenDuree] = useState(false);
  const [openFrequence, setOpenFrequence] = useState(false);
  const [clickStartDate, setClickStartDate] = useState(false);
  const [clickEndDate, setClickEndDate] = useState(false);
  const [frequence, setFrequence] = useState(false);
  const refType = useRef(null);
  const refStartDate = useRef(null);
  const refEndDate = useRef(null);
  const refDuree = useRef(null);
  const refFrequence = useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (refType.current && !refType.current.contains(event.target)) {
        setOpenType(false);
      }
      if (refDuree.current && !refDuree.current.contains(event.target)) {
        setOpenDuree(false);
      }
      if (refFrequence.current && !refFrequence.current.contains(event.target)) {
        setOpenFrequence(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);
  return (
    <div className="flex justify-center align-center my-4 ">
      <div className="md:w-1/2 p-4">
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
          <div className="border-[1px] border-gray-300 w-full rounded-lg mt-3 px-3 py-2.5">
            {data?.type ? <div className="text-xs leading-4 font-normal text-gray-500">Type d&apos;engagement</div> : null}
            <div className="relative" ref={refType}>
              <button className="flex justify-between items-center cursor-pointer disabled:opacity-50 disabled:cursor-wait w-full" onClick={() => setOpenType((e) => !e)}>
                <div className="flex items-center gap-2">
                  {data?.type ? (
                    <span className="text-sm leading-5 font-normal">{data?.type}</span>
                  ) : (
                    <span className="text-gray-400 text-sm leading-5 font-normal">Type d’engagement</span>
                  )}
                </div>
                <ChevronDown className="text-gray-400" />
              </button>
              {/* display options */}
              <div className={`${openType ? "block" : "hidden"}  rounded-lg min-w-full bg-white transition absolute left-0 shadow overflow-hidden z-50 top-[30px]`}>
                {optionsType.map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setData({ ...data, type: option });
                      setOpenType(false);
                    }}
                    className={`${option === data.type && "font-bold bg-gray"}`}>
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
          <div className="mt-4 text-xs leading-4 font-medium">Où ?</div>
          <div className="border-[1px] border-gray-300 w-full px-3 py-2 rounded-lg mt-3">
            {data?.address ? <div className="text-xs leading-4 font-normal text-gray-500">Adresse du lieu</div> : null}
            <input
              className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500"
              placeholder="Adresse du lieu"
              type="text"
              onChange={(e) => setData({ ...data, address: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="border-[1px] border-gray-300 w-2/3 px-3 py-2 rounded-lg mt-3">
              {data?.zip ? <div className="text-xs leading-4 font-normal text-gray-500">Code postal</div> : null}
              <input
                className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500"
                placeholder="Code postal"
                type="text"
                onChange={(e) => setData({ ...data, zip: e.target.value })}
              />
            </div>
            <div className="border-[1px] border-gray-300 w-full px-3 py-2 rounded-lg mt-3">
              {data?.city ? <div className="text-xs leading-4 font-normal text-gray-500">Ville</div> : null}
              <input
                className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500"
                placeholder="Ville"
                type="text"
                onChange={(e) => setData({ ...data, city: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 text-xs leading-4 font-medium">Quand ?</div>
          <div className="flex gap-2 items-stretch align-middle">
            <div className="flex justify-center flex-col border-[1px] border-gray-300 w-full px-3 py-2 rounded-lg mt-3">
              {data?.startDate || clickStartDate ? <div className="text-xs leading-4 font-normal text-gray-500">Date de début</div> : null}
              <input
                className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500"
                placeholder="Date de début"
                type="text"
                ref={refStartDate}
                onFocus={(e) => {
                  e.target.type = "date";
                  setClickStartDate(true);
                }}
                onBlur={(e) => {
                  data.startDate ? (e.target.type = "date") : (e.target.type = "text");
                  setClickStartDate(false);
                }}
                onChange={(e) => setData({ ...data, startDate: e.target.value })}
              />
            </div>
            <div className="flex justify-center flex-col border-[1px] border-gray-300 w-full px-3 py-2 rounded-lg mt-3">
              {data?.endDate || clickEndDate ? <div className="text-xs leading-4 font-normal text-gray-500">Date de fin</div> : null}
              <input
                className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500"
                placeholder="Date de fin"
                type="text"
                ref={refEndDate}
                onFocus={(e) => {
                  e.target.type = "date";
                  setClickEndDate(true);
                }}
                onBlur={(e) => {
                  data.endDate ? (e.target.type = "date") : (e.target.type = "text");
                  setClickEndDate(false);
                }}
                onChange={(e) => setData({ ...data, endDate: e.target.value })}
              />
            </div>
          </div>
          {frequence ? (
            <>
              <div className="flex items-stretch gap-2">
                <div className="flex flex-col justify-center border-[1px] border-gray-300 px-3 py-2 rounded-lg mt-3 w-1/2">
                  {data?.nombre ? <div className="text-xs leading-4 font-normal text-gray-500">Nombre</div> : null}
                  <input
                    className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500"
                    placeholder="Nombre"
                    type="text"
                    onChange={(e) => setData({ ...data, nombre: e.target.value })}
                  />
                </div>
                <div className="flex flex-col justify-center border-[1px] border-gray-300 w-full rounded-lg mt-3 px-3 py-2.5">
                  {data?.duree ? <div className="text-xs leading-4 font-normal text-gray-500">Durée</div> : null}
                  <div className="relative" ref={refDuree}>
                    <button className="flex justify-between items-center cursor-pointer disabled:opacity-50 disabled:cursor-wait w-full" onClick={() => setOpenDuree((e) => !e)}>
                      <div className="flex items-center gap-2">
                        {data?.duree ? (
                          <span className="text-sm leading-5 font-normal">{data?.duree}</span>
                        ) : (
                          <span className="text-gray-400 text-sm leading-5 font-normal">Durée</span>
                        )}
                      </div>
                      <ChevronDown className="text-gray-400" />
                    </button>
                    {/* display options */}
                    <div className={`${openDuree ? "block" : "hidden"}  rounded-lg min-w-full bg-white transition absolute left-0 shadow overflow-hidden z-50 top-[30px]`}>
                      {optionsDuree.map((option) => (
                        <div
                          key={option}
                          onClick={() => {
                            setData({ ...data, duree: option });
                            setOpenDuree(false);
                          }}
                          className={`${option === data.duree && "font-bold bg-gray"}`}>
                          <div className="group flex justify-between items-center gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                            <div>{option}</div>
                            {option === data.duree ? <BsCheck2 /> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center border-[1px] border-gray-300 w-full rounded-lg mt-3 px-3 py-2.5">
                  {data?.frequence ? <div className="text-xs leading-4 font-normal text-gray-500">Fréquence</div> : null}
                  <div className="relative" ref={refFrequence}>
                    <button
                      className="flex justify-between items-center cursor-pointer disabled:opacity-50 disabled:cursor-wait w-full"
                      onClick={() => setOpenFrequence((e) => !e)}>
                      <div className="flex items-center gap-2">
                        {data?.frequence ? (
                          <span className="text-sm leading-5 font-normal">{data?.frequence}</span>
                        ) : (
                          <span className="text-gray-400 text-sm leading-5 font-normal">Fréquence</span>
                        )}
                      </div>
                      <ChevronDown className="text-gray-400" />
                    </button>
                    {/* display options */}
                    <div className={`${openFrequence ? "block" : "hidden"}  rounded-lg min-w-full bg-white transition absolute left-0 shadow overflow-hidden z-50 top-[30px]`}>
                      {optionsFrequence.map((option) => (
                        <div
                          key={option}
                          onClick={() => {
                            setData({ ...data, frequence: option });
                            setOpenFrequence(false);
                          }}
                          className={`${option === data.frequence && "font-bold bg-gray"}`}>
                          <div className="group flex justify-between items-center gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                            <div>{option}</div>
                            {option === data.frequence ? <BsCheck2 /> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="text-sm leading-5 font-normal text-indigo-600 mt-2 hover:underline text-center"
                onClick={() => {
                  setFrequence(false);
                  setData({ ...data, frequence: null, duree: null, nombre: null });
                }}>
                Supprimer la fréquence
              </div>
            </>
          ) : (
            <>
              <div className="group flex items-center justify-center rounded-lg mt-3 bg-blue-50 py-3 cursor-pointer" onClick={() => setFrequence(true)}>
                <AiOutlinePlus className="text-indigo-400 mr-2 h-5 w-5 group-hover:scale-110" />
                <div className="text-sm leading-5 font-medium text-blue-700 group-hover:underline">Ajouter la fréquence (facultatif)</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
