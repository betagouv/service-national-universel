import React from "react";
import { useHistory } from "react-router-dom";
import PaperClip from "../../../assets/icons/PaperClip";
import AddImage from "../../../assets/icons/AddImage";
import { toastr } from "react-redux-toastr";
import api from "../../../services/api";
import validator from "validator";
import InformationCircle from "../../../assets/icons/InformationCircle";
import { slugifyFileName } from "../../../utils";
import { capture } from "../../../sentry";
import YoungHeader from "../../phase0/components/YoungHeader";
import { ENGAGEMENT_LYCEEN_TYPES, ENGAGEMENT_TYPES, UNSS_TYPE } from "snu-lib";
import Select from "../../../components/forms/SelectHookForm";
import InputText from "../../../components/ui/forms/InputTextHookForm";
import InputNumber from "../../../components/ui/forms/InputNumberHookForm";
import { useForm, Controller } from "react-hook-form";

export default function FormEquivalence({ young, onChange }) {
  const [clickStartDate, setClickStartDate] = React.useState(false);
  const [clickEndDate, setClickEndDate] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [filesList, setFilesList] = React.useState([]);
  const [uploading, setUploading] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    control,
    setValue,
  } = useForm({ reValidateMode: "onSubmit" });

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
    const res = await api.uploadFiles("/referent/file/equivalenceFiles", files, { youngId: young._id });
    if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
    // We update it instant ( because the bucket is updated instant )
    setValue("files", res.data);
    toastr.success("Fichier téléversé");
    setUploading(false);
  };

  const sendData = async (data) => {
    setLoading(true);
    try {
      const { ok } = await api.post(`/young/${young._id.toString()}/phase2/equivalence`, data);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue");
        setLoading(false);
        return;
      }
      toastr.success("Votre demande d'équivalence a bien été envoyée");
      history.push(`/volontaire/${young._id}/phase2`);
      setLoading(false);
    } catch (error) {
      capture(error);
      toastr.error("Oups, une erreur est survenue");
      setLoading(false);
      return;
    }
  };

  const type = watch("type");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const files = watch("files");

  const hasErrors = Object.keys(errors).length !== 0;

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
          {hasErrors ? (
            <div className="rounded-lg border-[1px] border-red-400 bg-red-50">
              <div className="flex items-center justify-center px-4 py-3">
                <InformationCircle className="text-red-400" />
                <div className="ml-4 text-sm font-medium leading-5 text-red-800">Vous devez remplir tous les champs du formulaire pour pouvoir le soumettre</div>
              </div>
            </div>
          ) : null}
          <form className="flex items-stretch gap-6" onSubmit={handleSubmit(sendData)}>
            <div className="flex basis-1/2 flex-col rounded-xl bg-white p-6">
              <div className="text-lg font-bold leading-7">Informations générales</div>
              <div className="mt-2 text-sm font-normal leading-5 text-gray-500">Veuillez compléter le formulaire ci-dessous.</div>
              <div className="mt-6 text-xs font-medium leading-4">Quoi ?</div>

              <div className="mt-3 space-y-4">
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { ref, ...rest } }) => <Select {...rest} options={ENGAGEMENT_TYPES} label="Type d'engagement" />}
                />

                {type === "Certification Union Nationale du Sport scolaire (UNSS)" && (
                  <Controller
                    rules={{ required: true }}
                    name="sousType"
                    control={control}
                    render={({ field: { ref, ...rest } }) => <Select {...rest} options={UNSS_TYPE} label="Catégorie" />}
                  />
                )}

                {type === "Engagements lycéens" && (
                  <Controller
                    rules={{ required: true }}
                    name="sousType"
                    control={control}
                    render={({ field: { ref, ...rest } }) => <Select {...rest} options={ENGAGEMENT_LYCEEN_TYPES} label="Catégorie" />}
                  />
                )}

                {type === "Autre" && <InputText register={register} name="desc" label="Engagement réalisé" validation={{ required: true }} />}

                <InputText register={register} name="structureName" label="Nom de la structure d'accueil" validation={{ required: true }} />
              </div>

              <div className="mt-4 text-xs font-medium leading-4">Où ?</div>

              <div className="mt-3 space-y-4">
                <InputText register={register} name="address" label="Adresse du lieu" validation={{ required: true }} />
                <div className="flex items-stretch gap-2">
                  <InputText register={register} name="zip" label="Code postal" validation={{ required: true }} />
                  <InputText register={register} name="city" label="Ville" validation={{ required: true }} />
                </div>
              </div>

              <div className="mt-4 text-xs font-medium leading-4">Quand ?</div>
              <div className="flex items-stretch gap-2 align-middle">
                <div className="mt-3 flex w-full flex-col justify-center rounded-lg border-[1px] border-gray-300 px-3 py-2">
                  {startDate || clickStartDate ? <div className="text-xs font-normal leading-4 text-gray-500">Date de début</div> : null}
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
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
                          startDate ? (e.target.type = "date") : (e.target.type = "text");
                          setClickStartDate(false);
                          field.onBlur(e);
                        }}
                      />
                    )}
                  />
                </div>
                <div className="mt-3 flex w-full flex-col justify-center rounded-lg border-[1px] border-gray-300 px-3 py-2">
                  {endDate || clickEndDate ? <div className="text-xs font-normal leading-4 text-gray-500">Date de fin</div> : null}
                  <Controller
                    name="endDate"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5"
                        placeholder="Date de fin"
                        min={startDate}
                        max={formatDate(new Date())}
                        type="text"
                        ref={refEndDate}
                        onFocus={(e) => {
                          e.target.type = "date";
                          setClickEndDate(true);
                        }}
                        onBlur={(e) => {
                          endDate ? (e.target.type = "date") : (e.target.type = "text");
                          setClickEndDate(false);
                          field.onBlur(e);
                        }}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="mt-4 text-xs font-medium leading-4">Combien de temps ?</div>
              <div className="mt-3 space-y-4">
                <div className="flex items-stretch gap-2">
                  <InputNumber register={register} name="missionDuration" label="durée (en heures)" validation={{ required: true }} />
                </div>
              </div>
            </div>
            <div className="flex basis-1/2 flex-col justify-between pb-2">
              <div className="rounded-xl bg-white p-6">
                <div className="text-lg font-bold leading-7">Personne contact au sein de la structure d’accueil</div>
                <div className="mt-2 text-sm font-normal leading-5 text-gray-500">
                  Cette personne doit vous connaître et pourra être contactée par l’administration sur votre dossier.
                </div>

                <div className="mt-4 space-y-4">
                  <InputText register={register} name="contactFullName" label="Prénom et Nom" validation={{ required: true }} />
                  <InputText
                    register={register}
                    name="contactEmail"
                    label="Adresse email"
                    validation={{ validate: validator.isEmail, required: true }}
                    error={errors.contactEmail?.type === "validate" ? "L'adresse email n'est pas valide." : ""}
                  />
                </div>
              </div>
              <div className="rounded-xl bg-white p-6">
                <div className="text-lg font-bold leading-7">Document justificatif d’engagement</div>
                {files?.length
                  ? files.map((file, index) => (
                      <div key={index} className="mt-1 flex w-full flex-row items-center justify-between rounded-lg border-[1px] border-gray-300 py-2 px-3">
                        <div className="flex flex-row items-center">
                          <PaperClip className="mr-2 text-gray-400" />
                          <div className="text-sm font-normal leading-5 text-gray-800">{file}</div>
                        </div>
                        <div
                          className="cursor-pointer text-sm font-normal leading-5 text-gray-800 hover:underline"
                          onClick={() =>
                            setValue(
                              "files",
                              files.filter((f) => file !== f),
                            )
                          }>
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
                  <Controller
                    rules={{ required: true }}
                    name="files"
                    control={control}
                    render={({ field }) => (
                      <input {...field} type="file" ref={hiddenFileInput} value={undefined} onChange={handleUpload} className="hidden" accept=".jpg, .jpeg, .png, .pdf" multiple />
                    )}
                  />
                  <div className="mt-1 text-xs font-normal leading-4 text-gray-500">PDF, PNG, JPG jusqu’à 5Mo</div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg border-[1px] border-blue-600 bg-blue-600 py-2 text-sm font-medium leading-5 text-white hover:bg-white hover:!text-blue-600 disabled:border-blue-300 disabled:bg-blue-300 disabled:!text-white"
                disabled={loading || uploading}>
                {loading ? "Chargement" : "Valider ma demande"}
              </button>
            </div>
          </form>
          {hasErrors ? (
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
