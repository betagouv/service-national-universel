import React from "react";
import { useHistory } from "react-router-dom";
import { AiOutlinePlus } from "react-icons/ai";
import PaperClip from "../../../assets/icons/PaperClip";
import AddImage from "../../../assets/icons/AddImage";
import { toastr } from "react-redux-toastr";
import api from "../../../services/api";
import validator from "validator";
import InformationCircle from "../../../assets/icons/InformationCircle";
import { slugifyFileName, UNSS_TYPE } from "../../../utils";
import { capture } from "../../../sentry";
import YoungHeader from "../../phase0/components/YoungHeader";
import { ENGAGEMENT_LYCEEN_TYPES, ENGAGEMENT_TYPES } from "snu-lib";
import Select from "../../../components/forms/Select";
import InputText from "../../../components/ui/forms/InputText";

export default function FormEquivalence({ young, onChange }) {
  const optionsDuree = ["Heure(s)", "Demi-journée(s)", "Jour(s)"];
  const optionsFrequence = ["Par semaine", "Par mois", "Par an"];
  const keyList = ["type", "sousType", "structureName", "address", "zip", "city", "startDate", "endDate", "frequency", "contactFullName", "contactEmail", "files"];
  const [data, setData] = React.useState({});
  const [clickStartDate, setClickStartDate] = React.useState(false);
  const [clickEndDate, setClickEndDate] = React.useState(false);
  const [frequence, setFrequence] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [filesList, setFilesList] = React.useState([]);
  const [uploading, setUploading] = React.useState(false);
  const [errorMail, setErrorMail] = React.useState(false);

  const refStartDate = React.useRef(null);
  const refEndDate = React.useRef(null);
  const history = useHistory();

  const hiddenFileInput = React.useRef(null);

  const handleClickUpload = () => {
    hiddenFileInput.current.click();
  };

  const handleUpload = (event) => {
    const files = event.target.files;
    for (let index = 0; index < Object.keys(files).length; index++) {
      let i = Object.keys(files)[index];
      if (!isFileSupported(files[i].name)) return toastr.error(`Le type du fichier ${files[i].name} n'est pas supporté.`);
      if (files[i].size > 5000000) return toastr.error(`Ce fichier ${files[i].name} est trop volumineux.`);
      const fileName = files[i].name.match(/(.*)(\..*)/);
      const newName = `${slugifyFileName(fileName[1])}-${filesList.length + index}${fileName[2]}`;
      Object.defineProperty(files[i], "name", {
        writable: true,
        value: newName,
      });
    }
    uploadFiles([...filesList, ...files]);
  };

  const uploadFiles = async (files) => {
    setFilesList(files);
    setUploading(true);
    const res = await api.uploadFile("/referent/file/equivalenceFiles", files, { youngId: young._id });
    if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
    // We update it instant ( because the bucket is updated instant )
    setData({ ...data, files: res.data });
    toastr.success("Fichier téléversé");
    setUploading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
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
      } else if (key === "sousType") {
        if (["Certification Union Nationale du Sport scolaire (UNSS)", "Engagements lycéens"].includes(data.type) && (data?.sousType === undefined || data.sousType === "")) {
          error = true;
        }
      } else if (data[key] === undefined || data[key] === "") {
        error = true;
      }

      if (key === "contactEmail") {
        if (data[key] && !validator.isEmail(data[key])) {
          setErrorMail(true);
          error = true;
        } else {
          setErrorMail(false);
        }
      }
    }
    setError(error);

    try {
      if (!error) {
        if (!["Certification Union Nationale du Sport scolaire (UNSS)", "Engagements lycéens"].includes(data.type) && (data?.sousType === "" || data?.sousType))
          delete data.sousType;

        const { ok } = await api.post(`/young/${young._id.toString()}/phase2/equivalence`, data);
        if (!ok) {
          toastr.error("Oups, une erreur est survenue");
          setLoading(false);
          return;
        }
        toastr.success("Votre demande d'équivalence a bien été envoyée");
        history.push(`/volontaire/${young._id}/phase2`);
      }
      setLoading(false);
    } catch (error) {
      capture(error);
      toastr.error("Oups, une erreur est survenue");
      setLoading(false);
      return;
    }
  };

  return (
    <>
      <YoungHeader young={young} tab="phase2" onChange={onChange} />
      <div className="p-[30px]">
        <div className="flex flex-col pt-3 gap-8">
          <div className="flex items-center pb-3">
            <div className="rounded-full p-2 bg-gray-200 cursor-pointer hover:scale-105" onClick={() => history.push(`/volontaire/${young._id}/phase2`)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.83333 13.3334L2.5 10.0001M2.5 10.0001L5.83333 6.66675M2.5 10.0001L17.5 10.0001"
                  stroke="#374151"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex flex-1 justify-center text-3xl leading-8 font-bold tracking-tight">
              Déclarer une équivalence MIG pour {young.firstName} {young.lastName}
            </div>
          </div>
          {error ? (
            <div className="border-[1px] border-red-400 rounded-lg bg-red-50">
              <div className="flex items-center justify-center px-4 py-3">
                <InformationCircle className="text-red-400" />
                <div className="ml-4 text-red-800 text-sm leading-5 font-medium">Vous devez remplir tous les champs du formulaire pour pouvoir le soumettre</div>
              </div>
            </div>
          ) : null}
          <div className="flex items-stretch gap-6">
            <div className="flex flex-col basis-1/2 rounded-xl bg-white p-6">
              <div className="text-lg leading-7 font-bold">Informations générales</div>
              <div className="text-sm leading-5 font-normal text-gray-500 mt-2">Veuillez compléter le formulaire ci-dessous.</div>
              <div className="mt-6 text-xs leading-4 font-medium">Quoi ?</div>

              <div className="space-y-4 mt-3">
                <Select label="Type d'engagement" options={ENGAGEMENT_TYPES} selected={data?.type} setSelected={(e) => setData({ ...data, type: e })} />

                {data.type === "Certification Union Nationale du Sport scolaire (UNSS)" && (
                  <Select label="Catégorie" options={UNSS_TYPE} selected={data?.sousType} setSelected={(e) => setData({ ...data, sousType: e })} />
                )}

                {data.type === "Engagements lycéens" && (
                  <Select label="Catégorie" options={ENGAGEMENT_LYCEEN_TYPES} selected={data?.sousType} setSelected={(e) => setData({ ...data, sousType: e })} />
                )}

                <InputText label="Nom de la structure d'accueil" value={data?.structureName} onChange={(e) => setData({ ...data, structureName: e.target.value })} />
              </div>

              <div className="mt-4 text-xs leading-4 font-medium">Où ?</div>

              <div className="space-y-4 mt-3">
                <InputText label="Adresse du lieu" value={data?.address} onChange={(e) => setData({ ...data, address: e.target.value })} />

                <div className="flex items-stretch gap-2">
                  <InputText label="Code postal" value={data?.zip} onChange={(e) => setData({ ...data, zip: e.target.value })} />
                  <InputText label="Ville" value={data?.city} onChange={(e) => setData({ ...data, city: e.target.value })} />
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
                    max={formatDate(new Date())}
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
                    min={data?.startDate}
                    max={formatDate(new Date())}
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
                    <InputText label="Nombre" onChange={(e) => setData({ ...data, frequency: { ...data.frequency, nombre: e.target.value } })} value={data?.frequency?.nombre} />

                    <Select
                      label="Durée"
                      options={optionsDuree}
                      selected={data?.frequency?.duree}
                      setSelected={(e) => setData({ ...data, frequency: { ...data.frequency, duree: e } })}
                    />

                    <Select
                      label="Fréquence"
                      options={optionsFrequence}
                      selected={data?.frequency?.frequence}
                      setSelected={(e) => setData({ ...data, frequency: { ...data.frequency, frequence: e } })}
                    />
                  </div>

                  <button
                    className="text-sm leading-5 font-normal text-indigo-600 mt-3 hover:underline text-center"
                    onClick={() => {
                      setFrequence(false);
                      setData({ ...data, frequency: undefined });
                    }}>
                    Supprimer la fréquence
                  </button>
                </>
              ) : (
                <div className="group flex items-center justify-center rounded-lg mt-4 bg-blue-50 py-3 cursor-pointer" onClick={() => setFrequence(true)}>
                  <AiOutlinePlus className="text-indigo-400 mr-2 h-5 w-5 group-hover:scale-110" />
                  <div className="text-sm leading-5 font-medium text-blue-700 group-hover:underline">Ajouter la fréquence (facultatif)</div>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-between basis-1/2 pb-2">
              <div className="rounded-xl bg-white p-6">
                <div className="text-lg leading-7 font-bold">Personne contact au sein de la structure d’accueil</div>
                <div className="text-sm leading-5 font-normal text-gray-500 mt-2">
                  Cette personne doit vous connaître et pourra être contactée par l’administration sur votre dossier.
                </div>

                <div className="space-y-4 mt-4">
                  <InputText label="Prénom et Nom" value={data?.contactFullName} onChange={(e) => setData({ ...data, contactFullName: e.target.value })} />
                  <InputText label="Adresse email" value={data?.contactEmail} onChange={(e) => setData({ ...data, contactEmail: e.target.value })} error={errorMail} />
                  {errorMail ? <div className="text-sm leading-5 font-normal text-red-500 mt-2 text-center">L&apos;adresse email n&apos;est pas valide.</div> : null}
                </div>
              </div>
              <div className="rounded-xl bg-white p-6">
                <div className="text-lg leading-7 font-bold">Document justificatif d’engagement</div>
                {data?.files?.length
                  ? data.files.map((file, index) => (
                      <div key={index} className="flex flex-row justify-between items-center border-[1px] border-gray-300 w-full rounded-lg py-2 px-3 mt-1">
                        <div className="flex flex-row items-center">
                          <PaperClip className="text-gray-400 mr-2" />
                          <div className="text-sm leading-5 font-normal text-gray-800">{file}</div>
                        </div>
                        <div
                          className="text-sm leading-5 font-normal text-gray-800 hover:underline cursor-pointer"
                          onClick={() => setData({ ...data, files: data?.files.filter((f) => file !== f) })}>
                          Retirer
                        </div>
                      </div>
                    ))
                  : null}
                <div className="flex flex-col items-center border-[1px] border-dashed border-gray-300 w-full rounded-lg py-4 mt-3">
                  <AddImage className="text-gray-400" />
                  <div className="text-sm leading-5 font-medium text-blue-600 hover:underline mt-2 cursor-pointer" onClick={handleClickUpload}>
                    Téléversez le formulaire
                  </div>
                  <input type="file" ref={hiddenFileInput} onChange={handleUpload} className="hidden" accept=".jpg, .jpeg, .png, .pdf" multiple />
                  <div className="text-xs leading-4 font-normal text-gray-500 mt-1">PDF, PNG, JPG jusqu’à 5Mo</div>
                </div>
              </div>
              <button
                className="rounded-lg w-full py-2 text-sm leading-5 font-medium bg-blue-600 text-white border-[1px] border-blue-600 hover:bg-white hover:!text-blue-600 disabled:bg-blue-300 disabled:!text-white disabled:border-blue-300"
                disabled={loading || uploading}
                onClick={() => handleSubmit()}>
                {loading ? "Chargement" : "Valider ma demande"}
              </button>
            </div>
          </div>
          {error ? (
            <div className="border-[1px] border-red-400 rounded-lg bg-red-50">
              <div className="flex items-center justify-center px-4 py-3">
                <InformationCircle className="text-red-400" />
                <div className="ml-4 text-red-800 text-sm leading-5 font-medium">Vous devez remplir tous les champs du formulaire pour pouvoir le soumettre</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

function isFileSupported(fileName) {
  const allowTypes = ["jpg", "jpeg", "png", "pdf"];
  const dotted = fileName.split(".");
  const type = dotted[dotted.length - 1];
  if (!allowTypes.includes(type.toLowerCase())) return false;
  return true;
}

const formatDate = (date) => {
  let d = new Date(date);
  let month = (d.getMonth() + 1).toString();
  let day = d.getDate().toString();
  let year = d.getFullYear();
  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }
  return [year, month, day].join("-");
};
