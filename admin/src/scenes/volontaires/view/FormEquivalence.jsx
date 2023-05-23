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
        <div className="flex flex-col gap-8 pt-3">
          <div className="flex items-center pb-3">
            <div className="cursor-pointer rounded-full bg-gray-200 p-2 hover:scale-105" onClick={() => history.push(`/volontaire/${young._id}/phase2`)}>
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
            <div className="flex flex-1 justify-center text-3xl font-bold leading-8 tracking-tight">
              Déclarer une équivalence MIG pour {young.firstName} {young.lastName}
            </div>
          </div>
          {error ? (
            <div className="rounded-lg border-[1px] border-red-400 bg-red-50">
              <div className="flex items-center justify-center px-4 py-3">
                <InformationCircle className="text-red-400" />
                <div className="ml-4 text-sm font-medium leading-5 text-red-800">Vous devez remplir tous les champs du formulaire pour pouvoir le soumettre</div>
              </div>
            </div>
          ) : null}
          <div className="flex items-stretch gap-6">
            <div className="flex basis-1/2 flex-col rounded-xl bg-white p-6">
              <div className="text-lg font-bold leading-7">Informations générales</div>
              <div className="mt-2 text-sm font-normal leading-5 text-gray-500">Veuillez compléter le formulaire ci-dessous.</div>
              <div className="mt-6 text-xs font-medium leading-4">Quoi ?</div>

              <div className="mt-3 space-y-4">
                <Select label="Type d'engagement" options={ENGAGEMENT_TYPES} selected={data?.type} setSelected={(e) => setData({ ...data, type: e })} />

                {data.type === "Certification Union Nationale du Sport scolaire (UNSS)" && (
                  <Select label="Catégorie" options={UNSS_TYPE} selected={data?.sousType} setSelected={(e) => setData({ ...data, sousType: e })} />
                )}

                {data.type === "Engagements lycéens" && (
                  <Select label="Catégorie" options={ENGAGEMENT_LYCEEN_TYPES} selected={data?.sousType} setSelected={(e) => setData({ ...data, sousType: e })} />
                )}

                <InputText label="Nom de la structure d'accueil" value={data?.structureName} onChange={(e) => setData({ ...data, structureName: e.target.value })} />
              </div>

              <div className="mt-4 text-xs font-medium leading-4">Où ?</div>

              <div className="mt-3 space-y-4">
                <InputText label="Adresse du lieu" value={data?.address} onChange={(e) => setData({ ...data, address: e.target.value })} />

                <div className="flex items-stretch gap-2">
                  <InputText label="Code postal" value={data?.zip} onChange={(e) => setData({ ...data, zip: e.target.value })} />
                  <InputText label="Ville" value={data?.city} onChange={(e) => setData({ ...data, city: e.target.value })} />
                </div>
              </div>

              <div className="mt-4 text-xs font-medium leading-4">Quand ?</div>
              <div className="flex items-stretch gap-2 align-middle">
                <div className="mt-3 flex w-full flex-col justify-center rounded-lg border-[1px] border-gray-300 px-3 py-2">
                  {data?.startDate || clickStartDate ? <div className="text-xs font-normal leading-4 text-gray-500">Date de début</div> : null}

                  <input
                    className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5"
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
                <div className="mt-3 flex w-full flex-col justify-center rounded-lg border-[1px] border-gray-300 px-3 py-2">
                  {data?.endDate || clickEndDate ? <div className="text-xs font-normal leading-4 text-gray-500">Date de fin</div> : null}
                  <input
                    className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5"
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
                  <div className="mt-2 flex flex-wrap items-stretch gap-2 md:!flex-nowrap">
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
                    className="mt-3 text-center text-sm font-normal leading-5 text-indigo-600 hover:underline"
                    onClick={() => {
                      setFrequence(false);
                      setData({ ...data, frequency: undefined });
                    }}>
                    Supprimer la fréquence
                  </button>
                </>
              ) : (
                <div className="group mt-4 flex cursor-pointer items-center justify-center rounded-lg bg-blue-50 py-3" onClick={() => setFrequence(true)}>
                  <AiOutlinePlus className="mr-2 h-5 w-5 text-indigo-400 group-hover:scale-110" />
                  <div className="text-sm font-medium leading-5 text-blue-700 group-hover:underline">Ajouter la fréquence (facultatif)</div>
                </div>
              )}
            </div>
            <div className="flex basis-1/2 flex-col justify-between pb-2">
              <div className="rounded-xl bg-white p-6">
                <div className="text-lg font-bold leading-7">Personne contact au sein de la structure d’accueil</div>
                <div className="mt-2 text-sm font-normal leading-5 text-gray-500">
                  Cette personne doit vous connaître et pourra être contactée par l’administration sur votre dossier.
                </div>

                <div className="mt-4 space-y-4">
                  <InputText label="Prénom et Nom" value={data?.contactFullName} onChange={(e) => setData({ ...data, contactFullName: e.target.value })} />
                  <InputText label="Adresse email" value={data?.contactEmail} onChange={(e) => setData({ ...data, contactEmail: e.target.value })} error={errorMail} />
                  {errorMail ? <div className="mt-2 text-center text-sm font-normal leading-5 text-red-500">L&apos;adresse email n&apos;est pas valide.</div> : null}
                </div>
              </div>
              <div className="rounded-xl bg-white p-6">
                <div className="text-lg font-bold leading-7">Document justificatif d’engagement</div>
                {data?.files?.length
                  ? data.files.map((file, index) => (
                      <div key={index} className="mt-1 flex w-full flex-row items-center justify-between rounded-lg border-[1px] border-gray-300 py-2 px-3">
                        <div className="flex flex-row items-center">
                          <PaperClip className="mr-2 text-gray-400" />
                          <div className="text-sm font-normal leading-5 text-gray-800">{file}</div>
                        </div>
                        <div
                          className="cursor-pointer text-sm font-normal leading-5 text-gray-800 hover:underline"
                          onClick={() => setData({ ...data, files: data?.files.filter((f) => file !== f) })}>
                          Retirer
                        </div>
                      </div>
                    ))
                  : null}
                <div className="mt-3 flex w-full flex-col items-center rounded-lg border-[1px] border-dashed border-gray-300 py-4">
                  <AddImage className="text-gray-400" />
                  <div className="mt-2 cursor-pointer text-sm font-medium leading-5 text-blue-600 hover:underline" onClick={handleClickUpload}>
                    Téléversez le formulaire
                  </div>
                  <input type="file" ref={hiddenFileInput} onChange={handleUpload} className="hidden" accept=".jpg, .jpeg, .png, .pdf" multiple />
                  <div className="mt-1 text-xs font-normal leading-4 text-gray-500">PDF, PNG, JPG jusqu’à 5Mo</div>
                </div>
              </div>
              <button
                className="w-full rounded-lg border-[1px] border-blue-600 bg-blue-600 py-2 text-sm font-medium leading-5 text-white hover:bg-white hover:!text-blue-600 disabled:border-blue-300 disabled:bg-blue-300 disabled:!text-white"
                disabled={loading || uploading}
                onClick={() => handleSubmit()}>
                {loading ? "Chargement" : "Valider ma demande"}
              </button>
            </div>
          </div>
          {error ? (
            <div className="rounded-lg border-[1px] border-red-400 bg-red-50">
              <div className="flex items-center justify-center px-4 py-3">
                <InformationCircle className="text-red-400" />
                <div className="ml-4 text-sm font-medium leading-5 text-red-800">Vous devez remplir tous les champs du formulaire pour pouvoir le soumettre</div>
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
