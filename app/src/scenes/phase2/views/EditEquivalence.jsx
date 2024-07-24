import React, { useEffect, useRef, useState } from "react";
import { BsCheck2 } from "react-icons/bs";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useHistory, useParams } from "react-router-dom";
import AddImage from "../../../assets/icons/AddImage";
import ChevronDown from "../../../assets/icons/ChevronDown";
import InformationCircle from "../../../assets/icons/InformationCircle";
import PaperClip from "../../../assets/icons/PaperClip";
import api from "../../../services/api";
import validator from "validator";
import { slugifyFileName, UNSS_TYPE, translate } from "../../../utils";
import { capture } from "../../../sentry";
import { ENGAGEMENT_LYCEEN_TYPES, ENGAGEMENT_TYPES } from "snu-lib";
import { GrClose } from "react-icons/gr";
import { queryClient } from "@/services/react-query";
import Header from "../components/Header";

export default function EditEquivalence() {
  const young = useSelector((state) => state.Auth.young);
  const keyList = ["type", "desc", "structureName", "address", "zip", "city", "startDate", "endDate", "contactFullName", "contactEmail", "files", "missionDuration"];
  const [data, setData] = useState();
  console.log("🚀 ~ EditEquivalence ~ data:", data);
  const [openType, setOpenType] = useState(false);
  const [openSousType, setOpenSousType] = React.useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filesList, setFilesList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errorMail, setErrorMail] = useState(false);
  const [duration, setDuration] = useState(null);
  const [errorDuration, setErrorDuration] = useState(false);
  console.log("🚀 ~ EditEquivalence ~ errorDuration:", errorDuration);
  const [unit, setUnit] = useState("heures");
  const refType = useRef(null);
  const refSousType = React.useRef(null);
  const history = useHistory();
  const { id } = useParams();
  const mode = id ? "edit" : "create";

  const hiddenFileInput = useRef(null);

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
    const res = await api.uploadFiles("/young/file/equivalenceFiles", files);
    if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier", translate(res.code));
    // We update it instant ( because the bucket is updated instant )
    setData({ ...data, files: res.data });
    toastr.success("Fichier téléversé");
    setUploading(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refType.current && !refType.current.contains(event.target)) {
        setOpenType(false);
      }
      if (refSousType.current && !refSousType.current.contains(event.target)) {
        setOpenSousType(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  useEffect(() => {
    if (young && id)
      (async () => {
        const { ok, data } = await api.get(`/young/${young._id.toString()}/phase2/equivalence/${id}`);
        if (ok) {
          setData(data);
          setDuration(data.missionDuration);
          return;
        }
      })();
  }, [young, id]);

  const handleSubmit = async () => {
    setErrorMail(false);
    setErrorDuration(false);
    let error = false;
    for (const key of keyList) {
      if (key === "files" && !data[key]?.length) {
        error = true;
      } else if (key === "sousType") {
        if (["Certification Union Nationale du Sport scolaire (UNSS)", "Engagements lycéens"].includes(data.type) && (data?.sousType === undefined || data.sousType === "")) {
          error = true;
        }
      } else if (key === "desc") {
        if (data.type === "Autre" && (data[key] === undefined || data[key] === "")) {
          error = true;
        }
        if (data.type !== "Autre") {
          delete data.desc;
        }
      }
      if (key === "contactEmail") {
        if (data[key] && !validator.isEmail(data[key])) {
          setErrorMail(true);
          error = true;
        } else {
          setErrorMail(false);
        }
      }
      if (key === "missionDuration") {
        if (data[key] === undefined || data[key] === "" || data[key] == 0) {
          setErrorDuration(true);
          error = true;
        }
      }
    }
    setError(error);
    console.log("🚀 ~ handleSubmit ~ error:", error);

    try {
      if (!error) {
        delete data._id;
        delete data.youngId;
        delete data.createdAt;
        delete data.__v;

        if (!["Certification Union Nationale du Sport scolaire (UNSS)", "Engagements lycéens"].includes(data.type) && (data?.sousType === "" || data?.sousType))
          delete data.sousType;

        data.status = "WAITING_VERIFICATION";
        let ok = false;
        setLoading(true);
        if (mode === "create") ok = (await api.post(`/young/${young._id.toString()}/phase2/equivalence`, data)).ok;
        if (mode === "edit") ok = (await api.put(`/young/${young._id.toString()}/phase2/equivalence/${id}`, data)).ok;

        if (!ok) {
          toastr.error("Oups, une erreur est survenue");
          setLoading(false);
          return;
        }
        queryClient.invalidateQueries({ queryKey: ["equivalence"] });
        toastr.success("Votre modification d'équivalence a bien été envoyée");
        history.push(`/phase2/equivalence/${id}`);
      }
      setLoading(false);
    } catch (error) {
      capture(error);
      toastr.error("Oups, une erreur est survenue");
      setLoading(false);
      return;
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    let missionDuration;

    if (value === "") {
      setDuration(null);
      missionDuration = 0;
    } else {
      const roundedValue = Math.round(Number(value));
      setDuration(roundedValue);
      missionDuration = unit === "jours" ? String(roundedValue * 8) : String(roundedValue);
    }

    setData((prevData) => ({
      ...prevData,
      missionDuration: missionDuration,
    }));
  };

  const handleSelectChange = (e) => {
    const value = e.target.value;
    setUnit(value);
    setDuration("");
    setData((prevData) => ({
      ...prevData,
      missionDuration: "",
    }));
  };

  if (data?._id && !["WAITING_VERIFICATION", "WAITING_CORRECTION"].includes(data?.status)) history.push("/phase2");

  return (
    <div className="bg-white pb-12">
      <Header
        title={mode === "create" ? "Ajouter un engagement" : "Je modifie ma demande de reconnaissance d'engagement"}
        backAction={
          <Link to={data?._id ? `/phase2/equivalence/${data._id}` : "/phase2"} className="flex items-center gap-1">
            <GrClose className="text-xl text-gray-500" />
          </Link>
        }
      />

      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg border-[1px] border-blue-400 bg-blue-50">
          <div className="flex items-center px-4 py-3">
            <InformationCircle className="text-blue-400" />
            <div className="ml-4 flex-1 text-sm font-medium leading-5 text-blue-800">Pour être reconnu et validé, votre engagement doit être terminé.</div>
          </div>
        </div>
        {data?.status === "WAITING_CORRECTION" ? (
          <div className="mt-4 rounded-lg border-[1px] border-gray-200 bg-white">
            <div className="flex flex-col gap-2 px-3 py-2">
              <div className="text-base font-medium leading-5 text-neutral-900">Corrections demandées</div>
              <div className="text-sm font-medium leading-5 text-gray-500">{data?.message}</div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-lg border-[1px] border-red-400 bg-red-50">
            <div className="flex items-center px-4 py-3">
              <InformationCircle className="text-red-400" />
              <div className="ml-4 flex-1 text-xs font-medium leading-5 text-red-800">Vous devez remplir tous les champs du formulaire pour pouvoir le soumettre</div>
            </div>
          </div>
        ) : null}
        <div className="mt-4 rounded-lg bg-white p-4 border">
          <h2 className="text-lg font-bold leading-7 mt-0">Informations générales</h2>
          <p className="mt-2 text-sm font-normal leading-5 text-gray-500">Veuillez compléter le formulaire ci-dessous.</p>
          <p className="mt-6 text-xs font-medium leading-4">Quoi ?</p>
          <div className="mt-3 w-full rounded-lg border-[1px] border-gray-300 px-3 py-2.5">
            {data?.type ? <p className="text-xs font-normal leading-4 text-gray-500">Type d&apos;engagement</p> : null}
            <div className="relative" ref={refType}>
              <button className="flex w-full cursor-pointer items-center justify-between disabled:cursor-wait disabled:opacity-50" onClick={() => setOpenType((e) => !e)}>
                <div className="flex items-center gap-2">
                  {data?.type ? (
                    <span className="text-sm font-normal leading-5">{data?.type}</span>
                  ) : (
                    <span className="text-sm font-normal leading-5 text-gray-400">Type d’engagement</span>
                  )}
                </div>
                <ChevronDown className="text-gray-400" />
              </button>
              {/* display options */}
              <div className={`${openType ? "block" : "hidden"}  absolute left-0 top-[30px] z-50 min-w-full overflow-hidden rounded-lg bg-white shadow transition`}>
                {ENGAGEMENT_TYPES.map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setData({ ...data, type: option, sousType: "" });
                      setOpenType(false);
                    }}
                    className={`${option === data?.type && "bg-gray font-bold"}`}>
                    <div className="group flex cursor-pointer items-center justify-between gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                      <div>{option}</div>
                      {option === data?.type ? <BsCheck2 /> : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {error?.type ? <div className="text-xs font-normal leading-4 text-red-500">{error.type}</div> : null}
          </div>
          {data?.type === "Certification Union Nationale du Sport scolaire (UNSS)" ? (
            <div className="mt-3 w-full rounded-lg border-[1px] border-gray-300 px-3 py-2.5">
              {data?.sousType ? <div className="text-xs font-normal leading-4 text-gray-500">Catégorie</div> : null}
              <div className="relative" ref={refSousType}>
                <button className="flex w-full cursor-pointer items-center justify-between disabled:cursor-wait disabled:opacity-50" onClick={() => setOpenSousType((e) => !e)}>
                  <div className="flex items-center gap-2">
                    {data?.sousType ? (
                      <span className="text-sm font-normal leading-5">{data?.sousType}</span>
                    ) : (
                      <span className="text-sm font-normal leading-5 text-gray-400">Catégorie</span>
                    )}
                  </div>
                  <ChevronDown className="text-gray-400" />
                </button>
                {/* display options */}
                <div className={`${openSousType ? "block" : "hidden"}  absolute left-0 top-[30px] z-50 min-w-full overflow-hidden rounded-lg bg-white shadow transition`}>
                  {UNSS_TYPE.map((option) => (
                    <div
                      key={option}
                      onClick={() => {
                        setData({ ...data, sousType: option });
                        setOpenSousType(false);
                      }}
                      className={`${option === data?.sousType && "bg-gray font-bold"}`}>
                      <div className="group flex cursor-pointer items-center justify-between gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                        <div>{option}</div>
                        {option === data?.sousType ? <BsCheck2 /> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {error?.sousType ? <div className="text-xs font-normal leading-4 text-red-500">{error.sousType}</div> : null}
            </div>
          ) : null}

          {data?.type === "Engagements lycéens" && (
            <div className="mt-3 w-full rounded-lg border-[1px] border-gray-300 px-3 py-2.5">
              {data?.sousType && <div className="text-xs font-normal leading-4 text-gray-500">Catégorie</div>}
              <div className="relative" ref={refSousType}>
                <button className="flex w-full cursor-pointer items-center justify-between disabled:cursor-wait disabled:opacity-50" onClick={() => setOpenSousType((e) => !e)}>
                  <div className="flex items-center gap-2">
                    {data?.sousType ? (
                      <span className="text-sm font-normal leading-5">{data?.sousType}</span>
                    ) : (
                      <span className="text-sm font-normal leading-5 text-gray-400">Catégorie</span>
                    )}
                  </div>
                  <ChevronDown className="text-gray-400" />
                </button>
                {/* display options */}
                <div className={`${openSousType ? "block" : "hidden"}  absolute left-0 top-[30px] z-50 min-w-full overflow-hidden rounded-lg bg-white shadow transition`}>
                  {ENGAGEMENT_LYCEEN_TYPES.map((option) => (
                    <div
                      key={option}
                      onClick={() => {
                        setData({ ...data, sousType: option });
                        setOpenSousType(false);
                      }}
                      className={`${option === data?.sousType && "bg-gray font-bold"}`}>
                      <div className="group flex cursor-pointer items-center justify-between gap-2 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                        <div>{option}</div>
                        {option === data?.sousType && <BsCheck2 />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {error?.sousType && <div className="text-xs font-normal leading-4 text-red-500">{error.sousType}</div>}
            </div>
          )}

          {data?.type === "Autre" && (
            <div className="mt-3 w-full rounded-lg border-[1px] border-gray-300 px-3 py-2.5">
              {data?.desc ? <div className="text-xs font-normal leading-4 text-gray-500">Engagement réalisé</div> : null}
              <input
                placeholder="Engagement réalisé"
                type="text"
                value={data?.desc}
                onChange={(e) => setData({ ...data, desc: e.target.value })}
                className="w-full text-sm font-normal leading-5"
              />
              {error?.desc && <div className="text-xs font-normal leading-4 text-red-500">{error.desc}</div>}
            </div>
          )}

          <div className="mt-3 w-full rounded-lg border-[1px] border-gray-300 px-3 py-2">
            {data?.structureName ? <div className="text-xs font-normal leading-4 text-gray-500">Nom de la structure</div> : null}
            <input
              className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5"
              placeholder="Nom de la structure d’accueil"
              type="text"
              value={data?.structureName}
              onChange={(e) => setData({ ...data, structureName: e.target.value })}
            />
          </div>
          <div className="mt-4 text-xs font-medium leading-4">Où ?</div>
          <div className="mt-3 w-full rounded-lg border-[1px] border-gray-300 px-3 py-2">
            {data?.address ? <div className="text-xs font-normal leading-4 text-gray-500">Adresse du lieu</div> : null}
            <input
              className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5"
              placeholder="Adresse du lieu"
              type="text"
              value={data?.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
            />
          </div>
          <div className="flex items-stretch gap-2">
            <div className="mt-3 flex w-2/3 flex-col justify-center rounded-lg border-[1px] border-gray-300 px-3 py-2">
              {data?.zip ? <div className="text-xs font-normal leading-4 text-gray-500">Code postal</div> : null}
              <input
                className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5"
                placeholder="Code postal"
                type="text"
                value={data?.zip}
                onChange={(e) => setData({ ...data, zip: e.target.value })}
              />
            </div>
            <div className="mt-3 flex w-full flex-col justify-center rounded-lg border-[1px] border-gray-300 px-3 py-2">
              {data?.city ? <div className="text-xs font-normal leading-4 text-gray-500">Ville</div> : null}
              <input
                className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5"
                placeholder="Ville"
                type="text"
                value={data?.city}
                onChange={(e) => setData({ ...data, city: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 text-xs font-medium leading-4">Quand ?</div>
          <div className="flex items-stretch gap-2 align-middle">
            <div className="mt-3 flex w-full flex-col justify-center rounded-lg border-[1px] border-gray-300 px-3 py-2">
              {data?.startDate ? <div className="text-xs font-normal leading-4 text-gray-500">Date de début</div> : null}
              <input
                className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5"
                placeholder="Date de début"
                type="date"
                max={formatDate(new Date())}
                value={formatDate(data?.startDate)}
                onChange={(e) => setData({ ...data, startDate: e.target.value })}
              />
            </div>
            <div className="mt-3 flex w-full flex-col justify-center rounded-lg border-[1px] border-gray-300 px-3 py-2">
              {data?.endDate ? <div className="text-xs font-normal leading-4 text-gray-500">Date de fin</div> : null}
              <input
                className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5"
                placeholder="Date de fin"
                min={formatDate(data?.startDate)}
                max={formatDate(new Date())}
                type="date"
                value={formatDate(data?.endDate)}
                onChange={(e) => setData({ ...data, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium leading-4">Combien de temps ?</div>
            <div className="mt-3 flex flex-row  items-stretch gap-2 align-middle">
              <div className="w-full rounded-lg border-[1px] border-gray-300 px-3 py-2">
                <input
                  className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5"
                  placeholder="Exemple: 10"
                  type="number"
                  min="1"
                  step="1"
                  value={duration}
                  onChange={handleInputChange}
                />
              </div>
              <div className="w-full rounded-lg border-[1px] border-gray-300 px-3 py-2">
                <select className="text-gray-500 w-full text-sm font-normal leading-5" value={unit} onChange={handleSelectChange}>
                  <option value="heures">Heures</option>
                  <option value="jours">Jours</option>
                </select>
              </div>
            </div>
            <p className="text-gray-500 w-full text-xs font-normal leading-5 mt-1">Arrondir à l'entier supérieur.</p>
            {errorDuration ? <div className="text-xs font-normal leading-4 text-red-500">Veuillez rentrer un nombre supérieur à 0</div> : null}
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-white p-4 border">
          <div className="text-lg font-bold leading-7">Personne contact au sein de la structure d’accueil</div>
          <div className="mt-2 text-sm font-normal leading-5 text-gray-500">
            Cette personne doit vous connaître et pourra être contactée par l’administration sur votre dossier.
          </div>
          <div className="mt-3 w-full rounded-lg border-[1px] border-gray-300 px-3 py-2">
            {data?.contactFullName ? <div className="text-xs font-normal leading-4 text-gray-500">Prénom et Nom</div> : null}
            <input
              className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5"
              placeholder="Prénom et Nom"
              type="text"
              value={data?.contactFullName}
              onChange={(e) => setData({ ...data, contactFullName: e.target.value })}
            />
          </div>
          <div className="mt-3 w-full rounded-lg border-[1px] border-gray-300 px-3 py-2">
            {data?.contactEmail ? <div className="text-xs font-normal leading-4 text-gray-500">Adresse email</div> : null}
            <input
              className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5"
              placeholder="Adresse email"
              type="text"
              value={data?.contactEmail}
              onChange={(e) => setData({ ...data, contactEmail: e.target.value })}
            />
          </div>
          {errorMail ? <div className="mt-2 text-center text-sm font-normal leading-5 text-red-500">L&apos;adresse email n&apos;est pas valide.</div> : null}
        </div>
        <div className="mt-4 rounded-lg bg-white p-4 border">
          <div className="text-lg font-bold leading-7">Document justificatif d’engagement</div>

          {data?.sousType === "Elu au sein du conseil des délégués pour la vie lycéenne (CVL)" && (
            <p className="mt-2 text-sm font-normal leading-5 text-gray-500">
              Téléverser une attestation individuelle de la réalisation d&apos;un mandat d&apos;un an signée par le chef d&apos;établissement ou le référent vie lycéenne.
            </p>
          )}
          {data?.sousType === "Elu au sein du conseil académique de la vie lycéenne (CAVL)" && (
            <p className="mt-2 text-sm font-normal leading-5 text-gray-500">
              Téléverser une attestation individuelle de la réalisation d&apos;un mandat d&apos;un an signée par le recteur ou le délégué académique à la vie lycéenne et
              collégienne.
            </p>
          )}
          {data?.sousType === "Elu au sein des conseils régionaux des jeunes" && (
            <p className="mt-2 text-sm font-normal leading-5 text-gray-500">
              Téléverser une attestation individuelle de la réalisation d&apos;un mandat d&apos;un an signée par le président du conseil régional ou son représentant.
            </p>
          )}
          {data?.type === "Préparation militaire hors offre MIG des armées" && (
            <p className="mt-2 text-sm font-normal leading-5 text-gray-500">Téléverser l&apos;attestation de réalisation de la préparation militaire</p>
          )}

          {/* <div className="flex flex-col items-center bg-gray-50 mt-4 py-10 rounded-lg mb-3">
            <button className="rounded-lg px-3 py-2 text-sm leading-5 font-medium bg-blue-600 text-white border-[1px] border-blue-600 hover:bg-white hover:!text-blue-600">
              Télécharger le modèle à remplir
            </button>
            <div className="text-xs leading-none font-normal text-gray-700 mt-2">puis téléversez le formulaire rempli ci-contre</div>
          </div> */}
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
        {error ? (
          <div className="mt-4 rounded-lg border-[1px] border-red-400 bg-red-50">
            <div className="flex items-center px-4 py-3">
              <InformationCircle className="text-red-400" />
              <div className="ml-4 flex-1 text-xs font-medium leading-5 text-red-800">Vous devez remplir tous les champs du formulaire pour pouvoir le soumettre</div>
            </div>
          </div>
        ) : null}
        <button
          className="mt-4 w-full rounded-lg border-[1px] border-blue-600 bg-blue-600 py-2 text-sm font-medium leading-5 text-white hover:bg-white hover:!text-blue-600 disabled:border-blue-300 disabled:bg-blue-300 disabled:!text-white"
          disabled={loading || uploading}
          onClick={() => handleSubmit()}>
          {loading ? "Chargement" : mode === "edit" ? "Modifier ma demande" : "Soumettre ma demande"}
        </button>
      </div>
    </div>
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
