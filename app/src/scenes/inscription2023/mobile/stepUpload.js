import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { useHistory, useParams } from "react-router-dom";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { translate } from "../../../utils";
import { supportURL } from "../../../config";
import { formatDateFR, sessions2023, translateCorrectionReason, YOUNG_STATUS } from "snu-lib";

import DatePickerList from "../../preinscription/components/DatePickerList";
import Help from "../components/Help";
import Navbar from "../components/Navbar";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import Error from "../../../components/error";
import Footer from "../../../components/footerV2";
import StickyButton from "../../../components/inscription/stickyButton";
import MyDocs from "../components/MyDocs";
import ErrorMessage from "../components/ErrorMessage";

export default function StepUpload() {
  let { category } = useParams();
  const young = useSelector((state) => state.Auth.young);
  if (category === undefined) category = young?.latestCNIFileCategory;
  const history = useHistory();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [files, setFiles] = useState();
  const [date, setDate] = useState(young?.latestCNIFileExpirationDate ? new Date(young?.latestCNIFileExpirationDate) : null);
  const [hasDateChanged, setHasDateChanged] = useState(false);
  const correctionsFile = young?.correctionRequests?.filter((e) => ["SENT", "REMINDED"].includes(e.status) && e.field === "cniFile");
  const correctionsDate = young?.correctionRequests?.filter((e) => ["SENT", "REMINDED"].includes(e.status) && e.field === "latestCNIFileExpirationDate");

  async function onSubmit() {
    if (files.length) {
      setLoading(true);
      for (const file of files) {
        if (file.size > 5000000)
          return setError({
            text: `Ce fichier ${files.name} est trop volumineux.`,
          });
      }
      const res = await api.uploadFile(`/young/${young._id}/documents/cniFiles`, Array.from(files), ID[category].category, new Date(date));
      if (res.code === "FILE_CORRUPTED")
        return setError({
          text: "Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
        });
      if (!res.ok) {
        capture(res.code);
        setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier." });
        setLoading(false);
        return;
      }
    }
    const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/next", { date });
    if (!ok) {
      capture(code);
      setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
      setLoading(false);
      return;
    }
    dispatch(setYoung(responseData));
    plausibleEvent("Phase0/CTA inscription - CI desktop");
    history.push("/inscription2023/confirm");
  }

  async function onCorrect() {
    setLoading(true);
    if (files.length) {
      for (const file of files) {
        if (file.size > 5000000) {
          setError({ text: `Ce fichier ${files.name} est trop volumineux.` });
          setLoading(false);
          return;
        }
      }
      const res = await api.uploadFile(`/young/${young._id}/documents/cniFiles`, Array.from(files), ID[category].category, new Date(date));
      if (res.code === "FILE_CORRUPTED") {
        setError({
          text: "Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
        });
        setLoading(false);
        return;
      }
      if (!res.ok) {
        capture(res.code);
        setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier." });
        setLoading(false);
        return;
      }
    }
    try {
      const data = { latestCNIFileExpirationDate: date, latestCNIFileCategory: category };
      const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/correction", data);
      if (!ok) {
        setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
        setLoading(false);
        return;
      }
      plausibleEvent("Phase0/CTA demande correction - Corriger ID");
      dispatch(setYoung(responseData));
      history.push("/");
    } catch (e) {
      capture(e);
      setError({
        text: `Une erreur s'est produite`,
        subText: e?.code ? translate(e.code) : "",
      });
    }
    setLoading(false);
  }

  const ID = {
    cniNew: {
      category: "cniNew",
      title: "Carte Nationale d'Identité",
      subtitle: "Nouveau format (après août 2021)",
      imgFront: "cniNewFront.png",
      imgBack: "cniNewBack.png",
      imgDate: "cniNewDate.png",
    },
    cniOld: {
      category: "cniOld",
      title: "Carte Nationale d'Identité",
      subtitle: "Ancien format",
      imgFront: "cniOldFront.png",
      imgBack: "cniOldBack.png",
      imgDate: "cniOldDate.png",
    },
    passport: {
      category: "passport",
      title: "Passeport",
      imgFront: "passport.png",
      imgDate: "passportDate.png",
    },
  };

  const isDisabled = !young.files.cniFiles.length || !date || loading || (correctionsDate?.length && hasDateChanged == false) || (correctionsFile?.length && !files?.length);

  return (
    <>
      <Navbar />
      <div className="bg-white p-4">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="w-full flex justify-between items-center mt-2">
          <div className="text-2xl font-semibold text-gray-800 flex-1">{ID[category].title}</div>
          <a href={`${supportURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`} target="_blank" rel="noreferrer">
            <QuestionMarkBlueCircle />
          </a>
        </div>
        {ID[category].subtitle && <div className="text-xl mb-2 text-gray-600">{ID[category].subtitle}</div>}
        <div className="my-4">
          {correctionsFile?.map((e) => (
            <ErrorMessage key={e._id}>
              <strong>{translateCorrectionReason(e.reason)}</strong>
              {e.message && ` : ${e.message}`}
            </ErrorMessage>
          ))}
        </div>
        <div className="w-full flex items-center justify-center my-4">
          <div className="w-3/4 flex flex-col gap-4">
            <img src={require(`../../../assets/IDProof/${ID[category].imgFront}`)} alt={ID[category].title} />
            {ID[category].imgBack && <img src={require(`../../../assets/IDProof/${ID[category].imgBack}`)} alt={ID[category].title} />}
          </div>
        </div>
        <div className="my-2 border-l-8 border-l-[#6A6AF4] pl-4">
          Toutes les informations doivent être <strong>lisibles</strong>, le document doit être visible <strong>entièrement</strong>, la photo doit être <strong>nette</strong>. Le
          document doit être téléversé en <strong>recto</strong> et <strong>verso</strong>.
        </div>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <div>Ajouter un fichier</div>
        <div className="text-gray-500 text-sm mt-4">Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf. Plusieurs fichiers possibles.</div>
        <input
          type="file"
          multiple
          id="file-upload"
          name="file-upload"
          accept=".png, .jpg, .jpeg, .pdf"
          onChange={(e) => {
            setFiles(e.target.files);
          }}
          className="hidden"
        />
        <div className="flex w-full mt-4">
          <div>
            <label htmlFor="file-upload" className="bg-[#EEEEEE] text-sm py-2 px-3 rounded text-gray-600">
              Parcourir...
            </label>
          </div>
          <div className="ml-4">
            {files ? (
              Array.from(files).map((e) => (
                <p className="text-gray-800 text-sm mt-2" key={e.name}>
                  {e.name}
                </p>
              ))
            ) : (
              <div className="text-gray-800 text-sm mt-2">Aucun fichier sélectionné.</div>
            )}
          </div>
        </div>
        <MyDocs category={category} />
        {(files?.length > 0 || date) && (
          <>
            <hr className="my-8 h-px bg-gray-200 border-0" />
            <div className="text-xl font-medium">Renseignez la date d’expiration</div>
            <div className="text-gray-600 leading-loose my-2">
              Votre pièce d’identité doit être valide à votre départ en séjour de cohésion (le {formatDateFR(sessions2023.filter((e) => e.name === young.cohort)[0].dateStart)}
              ).
            </div>
            <div className="my-4">
              {correctionsDate?.map((e) => (
                <ErrorMessage key={e._id}>
                  <strong>Date d&apos;expiration incorrecte</strong>
                  {e.message && ` : ${e.message}`}
                </ErrorMessage>
              ))}
            </div>
            <div className="w-3/4 mx-auto">
              <img className="mx-auto my-4" src={require(`../../../assets/IDProof/${ID[category].imgDate}`)} alt={ID.title} />
            </div>
            <DatePickerList
              value={date}
              onChange={(date) => {
                setDate(date);
                setHasDateChanged(true);
              }}
            />
          </>
        )}
      </div>
      <Help />
      <Footer marginBottom="mb-[88px]" />
      {young.status === YOUNG_STATUS.WAITING_CORRECTION ? (
        <StickyButton text={loading ? "Scan antivirus en cours" : "Corriger"} onClick={onCorrect} disabled={isDisabled} />
      ) : (
        <StickyButton text={loading ? "Scan antivirus en cours" : "Continuer"} onClick={onSubmit} disabled={!date || loading} />
      )}
    </>
  );
}
