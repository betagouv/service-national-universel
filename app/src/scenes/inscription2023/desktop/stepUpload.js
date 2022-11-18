import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { translate } from "../../../utils";
import { ID } from "../utils";
import { supportURL } from "../../../config";
import { formatDateFR, sessions2023, translateCorrectionReason } from "snu-lib";

import DatePickerList from "../../preinscription/components/DatePickerList";
import DesktopPageContainer from "../components/DesktopPageContainer";
import Error from "../../../components/error";
import plausibleEvent from "../../../services/plausible";
import ErrorMessage from "../components/ErrorMessage";

export default function StepUpload() {
  let { category } = useParams();
  const young = useSelector((state) => state.Auth.young);
  if (!category) category = young?.latestCNIFileCategory;
  const history = useHistory();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [files, setFiles] = useState([]);
  const [date, setDate] = useState(young?.latestCNIFileExpirationDate ? new Date(young?.latestCNIFileExpirationDate) : null);
  const corrections = young.correctionRequests?.filter((e) => ["SENT", "REMINDED"].includes(e.status) && ["cniFile", "latestCNIFileExpirationDate"].includes(e.field));

  async function uploadFiles() {
    for (const file of files) {
      if (file.size > 5000000) return { error: { text: `Ce fichier ${files.name} est trop volumineux.` } };
    }
    const res = await api.uploadFile(`/young/${young._id}/documents/cniFiles`, files, category, new Date(date));
    if (res.code === "FILE_CORRUPTED")
      return {
        error: {
          text: "Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
        },
      };
    if (!res.ok) {
      capture(res.code);
      return { error: { text: "Une erreur s'est produite lors du téléversement de votre fichier.", subText: res.code ? translate(res.code) : "" } };
    }
  }

  async function onSubmit() {
    setLoading(true);
    if (files) {
      const res = await uploadFiles();
      if (res?.error) {
        setError(res.error);
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
    if (files) {
      const res = await uploadFiles();
      if (res?.error) {
        setError(res.error);
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

  if (!category) return <div>Loading</div>;
  return (
    <DesktopPageContainer
      title={ID[category].title}
      subTitle={ID[category].subTitle}
      onSubmit={onSubmit}
      modeCorrection={corrections?.length > 0}
      onCorrection={onCorrect}
      disabled={!young.files.cniFiles || !date || loading}
      loading={loading}
      questionMarckLink={`${supportURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`}>
      {corrections
        ?.filter(({ field }) => field === "cniFile")
        .map((e) => (
          <ErrorMessage key={e._id}>
            <strong>{translateCorrectionReason(e.reason)}</strong>
            {e.message && ` : ${e.message}`}
          </ErrorMessage>
        ))}
      <div className="w-full my-16 flex justify-around">
        <img className="h-64" src={require(`../../../assets/IDProof/${ID[category].imgFront}`)} alt={ID[category].title} />
        {ID[category].imgBack && <img className="h-64" src={require(`../../../assets/IDProof/${ID[category].imgBack}`)} alt={ID[category].title} />}
      </div>
      <div className="border-l-8 border-l-[#6A6AF4] pl-8 leading-loose">
        Toutes les informations doivent être <strong>lisibles</strong>, le document doit être visible <strong>entièrement</strong>, la photo doit être <strong>nette</strong>. Le
        document doit être téléversé en <strong>recto</strong> et <strong>verso</strong>.
      </div>
      <hr className="my-8 h-px bg-gray-200 border-0" />
      <div className="my-4">Ajouter un fichier</div>
      {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
      <div className="text-gray-500 text-sm my-4">Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf. Plusieurs fichiers possibles.</div>
      <input
        type="file"
        multiple
        id="file-upload"
        name="file-upload"
        accept=".png, .jpg, .jpeg, .pdf"
        onChange={(e) => setFiles(files.concat(Array.from(e.target.files)))}
        className="hidden"
      />
      <div className="flex w-full my-4">
        <div>
          <label htmlFor="file-upload" className="cursor-pointer bg-[#EEEEEE] text-sm py-2 px-3 rounded text-gray-600">
            Parcourir...
          </label>
        </div>
        <div className="ml-4 mt-2">
          {files ? (
            Array.from(files).map((e) => (
              <p className="text-gray-800 text-sm" key={e.name}>
                {e.name}
              </p>
            ))
          ) : (
            <div className="text-gray-800 text-sm">Aucun fichier sélectionné.</div>
          )}
        </div>
      </div>
      <div className="text-gray-800 text-sm my-4">
        Vous avez besoin d’aide pour téléverser les documents ?{" "}
        <a href="https://support.snu.gouv.fr/base-de-connaissance/je-televerse-un-document/" className="underline">
          Cliquez ici
        </a>
        .
      </div>
      {(files || date) && (
        <>
          <hr className="my-8 h-px bg-gray-200 border-0" />
          <div className="w-full flex">
            <div className="w-1/2">
              <div className="text-xl font-medium">Renseignez la date d’expiration</div>
              <div className="text-gray-600 leading-loose mt-2 mb-8">
                Votre pièce d’identité doit être valide à votre départ en séjour de cohésion (le {formatDateFR(sessions2023.filter((e) => e.name === young.cohort)[0].dateStart)}
                ).
              </div>
              {corrections
                ?.filter(({ field }) => field === "latestCNIFileExpirationDate")
                .map((e) => (
                  <ErrorMessage key={e._id}>
                    <strong>Date d&apos;expiration incorrecte</strong>
                    {e.message && ` : ${e.message}`}
                  </ErrorMessage>
                ))}
              <p className="text-gray-800 mt-4">Date d&apos;expiration</p>
              <DatePickerList
                value={date}
                onChange={(date) => {
                  setDate(date);
                }}
              />
            </div>
            <div className="w-1/2">
              <img className="h-32 mx-auto" src={require(`../../../assets/IDProof/${ID[category].imgDate}`)} alt={ID.title} />
            </div>
          </div>
        </>
      )}
    </DesktopPageContainer>
  );
}
