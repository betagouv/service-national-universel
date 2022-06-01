import React, { useState, useRef, useEffect } from "react";
import InformationCircle from "../../../assets/icons/InformationCircle";
import ChevronDown from "../../../assets/icons/ChevronDown";
import AddImage from "../../../assets/icons/AddImage";
import { BsCheck2 } from "react-icons/bs";
import { AiOutlinePlus } from "react-icons/ai";
import PaperClip from "../../../assets/icons/PaperClip";

export default function Equivalence() {
  const optionsType = ["Service Civique", "BAFA", "Jeune Sapeur Pompier"];
  const optionsDuree = ["Heure(s)", "Demi-journée(s)", "Jour(s)"];
  const optionsFrequence = ["Par semaine", "Par mois", "Par an"];
  const keyList = ["type", "structureName", "address", "zip", "city", "startDate", "endDate", "frequency", "contactFullName", "contactEmail", "files"];
  const [data, setData] = useState({
    files: ["test1.pdf", "test2.pdf", "test3.pdf"],
  });
  const [openType, setOpenType] = useState(false);
  const [openDuree, setOpenDuree] = useState(false);
  const [openFrequence, setOpenFrequence] = useState(false);
  const [clickStartDate, setClickStartDate] = useState(false);
  const [clickEndDate, setClickEndDate] = useState(false);
  const [frequence, setFrequence] = useState(false);
  const [error, setError] = useState(false);
  const refType = useRef(null);
  const refStartDate = useRef(null);
  const refEndDate = useRef(null);
  const refDuree = useRef(null);
  const refFrequence = useRef(null);

  useEffect(() => {
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

  const handleSubmit = () => {
    let error = false;
    for (const key of keyList) {
      if (key === "files" && !data[key]?.length) {
        error = true;
      } else if (key === "frequency") {
        if (
          frequence &&
          (data[key]?.nombre === "" ||
            data[key]?.nombre === undefined ||
            data[key]?.duree === "" ||
            data[key]?.duree === undefined ||
            data[key]?.frequence === "" ||
            data[key]?.frequence === undefined)
        ) {
          error = true;
        }
      } else if (data[key] === undefined || data[key] === "") {
        error = true;
      }
    }
    setError(error);
  };

  return (
    <div className="flex justify-center align-center my-4 ">
      <div className="lg:w-1/2 p-4">
        <div className="text-2xl md:text-4xl text-center font-extrabold leading-10 tracking-tight ">Je demande la reconnaissance d’un engagement déjà réalisé</div>
        <div className="border-[1px] border-blue-400 rounded-lg bg-blue-50 mt-4">
          <div className="flex items-center px-4 py-3">
            <InformationCircle className="text-blue-400" />
            <div className="flex-1 ml-4 text-blue-800 text-sm leading-5 font-medium">Pour être reconnu et validé, votre engagement doit être terminé.</div>
          </div>
        </div>
        {error ? (
          <div className="border-[1px] border-red-400 rounded-lg bg-red-50 mt-4">
            <div className="flex items-center px-4 py-3">
              <InformationCircle className="text-red-400" />
              <div className="flex-1 ml-4 text-red-800 text-sm leading-5 font-medium">Vous devez remplir tous le formulaire pour pouvoir le soumettre</div>
            </div>
          </div>
        ) : null}
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
            {error?.type ? <div className="text-xs leading-4 font-normal text-red-500">{error.type}</div> : null}
          </div>
          <div className="border-[1px] border-gray-300 w-full px-3 py-2 rounded-lg mt-3">
            {data?.structureName ? <div className="text-xs leading-4 font-normal text-gray-500">Nom de la structure</div> : null}
            <input
              className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500"
              placeholder="Nom de la structure d’accueil"
              type="text"
              onChange={(e) => setData({ ...data, structureName: e.target.value })}
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
              <div className="flex items-stretch gap-2 mt-2 flex-wrap md:!flex-nowrap">
                <div className="flex flex-1 gap-2 md:flex-none">
                  <div className="flex flex-col justify-center border-[1px] border-gray-300 px-3 py-2 rounded-lg mt-3 w-1/2">
                    {data?.frequency?.nombre ? <div className="text-xs leading-4 font-normal text-gray-500">Nombre</div> : null}
                    <input
                      className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500"
                      placeholder="Nombre"
                      type="text"
                      onChange={(e) => setData({ ...data, frequency: { ...data.frequency, nombre: e.target.value } })}
                    />
                  </div>
                  <div className="flex flex-col justify-center border-[1px] border-gray-300 w-full rounded-lg mt-3 px-3 py-2.5">
                    {data?.frequency?.duree ? <div className="text-xs leading-4 font-normal text-gray-500">Durée</div> : null}
                    <div className="relative" ref={refDuree}>
                      <button className="flex justify-between items-center cursor-pointer disabled:opacity-50 disabled:cursor-wait w-full" onClick={() => setOpenDuree((e) => !e)}>
                        <div className="flex items-center gap-2">
                          {data?.frequency?.duree ? (
                            <span className="text-sm leading-5 font-normal">{data?.frequency?.duree}</span>
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
                              setData({ ...data, frequency: { ...data.frequency, duree: option } });
                              setOpenDuree(false);
                            }}
                            className={`${option === data.frequency?.duree && "font-bold bg-gray"}`}>
                            <div className="group flex justify-between items-center gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                              <div>{option}</div>
                              {option === data?.frequency?.duree ? <BsCheck2 /> : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center border-[1px] border-gray-300 w-full rounded-lg mt-3 px-3 py-2.5">
                  {data?.frequency?.frequence ? <div className="text-xs leading-4 font-normal text-gray-500">Fréquence</div> : null}
                  <div className="relative" ref={refFrequence}>
                    <button
                      className="flex justify-between items-center cursor-pointer disabled:opacity-50 disabled:cursor-wait w-full"
                      onClick={() => setOpenFrequence((e) => !e)}>
                      <div className="flex items-center gap-2">
                        {data?.frequency?.frequence ? (
                          <span className="text-sm leading-5 font-normal">{data?.frequency?.frequence}</span>
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
                            setData({ ...data, frequency: { ...data.frequency, frequence: option } });
                            setOpenFrequence(false);
                          }}
                          className={`${option === data?.frequency?.frequence && "font-bold bg-gray"}`}>
                          <div className="group flex justify-between items-center gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                            <div>{option}</div>
                            {option === data?.frequency?.frequence ? <BsCheck2 /> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="text-sm leading-5 font-normal text-indigo-600 mt-3 hover:underline text-center"
                onClick={() => {
                  setFrequence(false);
                  setData({ ...data, frequency: { frequence: null, duree: null, nombre: null } });
                }}>
                Supprimer la fréquence
              </div>
            </>
          ) : (
            <>
              <div className="group flex items-center justify-center rounded-lg mt-4 bg-blue-50 py-3 cursor-pointer" onClick={() => setFrequence(true)}>
                <AiOutlinePlus className="text-indigo-400 mr-2 h-5 w-5 group-hover:scale-110" />
                <div className="text-sm leading-5 font-medium text-blue-700 group-hover:underline">Ajouter la fréquence (facultatif)</div>
              </div>
            </>
          )}
        </div>
        <div className="rounded-lg bg-white mt-4 p-6">
          <div className="text-lg leading-7 font-bold">Personne contact au sein de la structure d’accueil</div>
          <div className="text-sm leading-5 font-normal text-gray-500 mt-2">
            Cette personne doit vous connaître et pourra être contactée par l’administration sur votre dossier.
          </div>
          <div className="border-[1px] border-gray-300 w-full px-3 py-2 rounded-lg mt-3">
            {data?.contactFullName ? <div className="text-xs leading-4 font-normal text-gray-500">Prénom et Nom</div> : null}
            <input
              className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500"
              placeholder="Prénom et Nom"
              type="text"
              onChange={(e) => setData({ ...data, contactFullName: e.target.value })}
            />
          </div>
          <div className="border-[1px] border-gray-300 w-full px-3 py-2 rounded-lg mt-3">
            {data?.contactEmail ? <div className="text-xs leading-4 font-normal text-gray-500">Adresse email</div> : null}
            <input
              className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500"
              placeholder="Adresse email"
              type="text"
              onChange={(e) => setData({ ...data, contactEmail: e.target.value })}
            />
          </div>
        </div>
        <div className="rounded-lg bg-white mt-4 p-6">
          <div className="text-lg leading-7 font-bold">Document justificatif d’engagement</div>
          <div className="flex flex-col items-center bg-gray-50 mt-4 py-10 rounded-lg mb-3">
            <button className="rounded-lg px-3 py-2 text-sm leading-5 font-medium bg-blue-600 text-white border-[1px] border-blue-600 hover:bg-white hover:!text-blue-600">
              Télécharger le modèle à remplir
            </button>
            <div className="text-xs leading-none font-normal text-gray-700 mt-2">puis téléversez le formulaire rempli ci-contre</div>
          </div>
          {data?.files?.length
            ? data.files.map((file, index) => (
                <div key={index} className="flex flex-row justify-between items-center border-[1px] border-gray-300 w-full rounded-lg py-2 px-3 mt-1">
                  <div className="flex flex-row items-center">
                    <PaperClip className="text-gray-400 mr-2" />
                    <div className="text-sm leading-5 font-normal text-gray-800">{file}</div>
                  </div>
                  <div className="text-sm leading-5 font-normal text-gray-800 hover:underline cursor-pointer">Retirer</div>
                </div>
              ))
            : null}
          <div className="flex flex-col items-center border-[1px] border-dashed border-gray-300 w-full rounded-lg py-4 mt-3">
            <AddImage className="text-gray-400" />
            <div className="text-sm leading-5 font-medium text-blue-600 hover:underline mt-2">Téléversez le formulaire</div>
            <div className="text-xs leading-4 font-normal text-gray-500 mt-1">PDF, PNG, JPG jusqu’à 5Mo</div>
          </div>
        </div>
        {error ? (
          <div className="border-[1px] border-red-400 rounded-lg bg-red-50 mt-4">
            <div className="flex items-center px-4 py-3">
              <InformationCircle className="text-red-400" />
              <div className="flex-1 ml-4 text-red-800 text-sm leading-5 font-medium">Vous devez remplir tous le formulaire pour pouvoir le soumettre</div>
            </div>
          </div>
        ) : null}
        <button
          className="rounded-lg w-full py-2 mt-4 text-sm leading-5 font-medium bg-blue-600 text-white border-[1px] border-blue-600 hover:bg-white hover:!text-blue-600"
          onClick={() => handleSubmit()}>
          Valider ma demande
        </button>
      </div>
    </div>
  );
}
