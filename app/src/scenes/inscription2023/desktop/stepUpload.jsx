import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import dayjs from "dayjs";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { ID } from "../utils";
import { supportURL } from "../../../config";
import { formatDateFR, sessions2023, translateCorrectionReason } from "snu-lib";

import DatePickerList from "../../preinscription/components/DatePickerList";
import DesktopPageContainer from "../components/DesktopPageContainer";
import Error from "../../../components/error";
import ErrorMessage from "../components/ErrorMessage";
import MyDocs from "../components/MyDocs";
import FileImport from "../components/FileImport";
import { getCorrectionsForStepUpload } from "../../../utils/navigation";
const images = import.meta.globEager("../../../assets/IDProof/*");

export default function StepUpload() {
  let { category } = useParams();
  const young = useSelector((state) => state.Auth.young);
  if (!category) category = young?.latestCNIFileCategory;
  const history = useHistory();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [hasChanged, setHasChanged] = useState(false);
  const [recto, setRecto] = useState();
  const [verso, setVerso] = useState();
  const [date, setDate] = useState(young?.latestCNIFileExpirationDate ? new Date(young?.latestCNIFileExpirationDate) : null);

  const expirationDate = dayjs(date).locale("fr").format("YYYY-MM-DD");
  const corrections = getCorrectionsForStepUpload(young);
  const filesCount = getFilesCount();
  const isEnabled = validate();

  function getFilesCount() {
    let count = young?.files?.cniFiles?.length || 0;
    if (recto) count++;
    if (verso) count++;
    return count;
  }

  function validate() {
    if (corrections?.length) {
      return hasChanged && !loading && !error.text;
    } else {
      return (young?.files?.cniFiles?.length || (recto && (verso || category === "passport"))) && date && !loading && !error.text;
    }
  }

  function resetState() {
    setRecto();
    setVerso();
    setHasChanged(false);
    setLoading(false);
  }

  async function uploadFiles() {
    if (filesCount > 3) {
      setError({ text: `Vous ne pouvez téléverser plus de 3 fichiers. Vous avez déjà ${young.files.cniFiles?.length} fichiers en ligne.` });
      setLoading(false);
      return { ok: false };
    }

    const oversizedFiles = [recto, verso].filter((e) => e && e.size > 5000000).map((e) => e.name);
    if (oversizedFiles.length) {
      setError({ text: `Fichier(s) trop volumineux : ${oversizedFiles.join(", ")}.` });
      resetState();
      return { ok: false };
    }

    if (recto) {
      const res = await api.uploadFiles(young._id, recto, { category, expirationDate, side: "recto" });
      if (!res.ok) {
        capture(res.code);
        setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier." });
        resetState();
        return { ok: false };
      }
    }

    if (verso) {
      const res = await api.uploadFiles(young._id, verso, { category, expirationDate, side: "verso" });
      if (!res.ok) {
        capture(res.code);
        setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier." });
        resetState();
        return { ok: false };
      }
    }

    return { ok: true };
  }

  async function onSubmit() {
    try {
      setLoading(true);

      const { ok: uploadOk } = await uploadFiles();
      if (!uploadOk) return;

      const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/next", { date: expirationDate });

      if (!ok) {
        capture(code);
        setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données." });
        resetState();
        return;
      }

      dispatch(setYoung(responseData));
      plausibleEvent("Phase0/CTA inscription - CI desktop");
      history.push("/inscription2023/confirm");
    } catch (e) {
      capture(e);
      setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données." });
      resetState();
    }
  }

  async function onCorrect() {
    try {
      setLoading(true);

      const { ok: uploadOk } = await uploadFiles();
      if (!uploadOk) return;

      const data = { latestCNIFileExpirationDate: date, latestCNIFileCategory: category };
      const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/correction", data);

      if (!ok) {
        capture(code);
        setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données.", subText: code });
        resetState();
        return;
      }

      plausibleEvent("Phase0/CTA demande correction - Corriger ID");
      dispatch(setYoung(responseData));
      history.push("/");
    } catch (e) {
      capture(e);
      setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données." });
      resetState();
    }
  }

  if (!category) return <div>Loading</div>;

  return (
    <DesktopPageContainer
      title={ID[category].title}
      subTitle={ID[category].subTitle}
      onSubmit={onSubmit}
      modeCorrection={corrections?.length > 0}
      onCorrection={onCorrect}
      disabled={!isEnabled}
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

      <div className="my-10 flex w-full justify-around">
        <div>
          <img className="h-64" src={images[`../../assets/IDProof/${ID[category].imgFront}`]?.default} alt={ID[category].title} />
          <div className="mt-4 text-sm text-center text-gray-500">Recto</div>
        </div>

        {ID[category].imgBack && (
          <div>
            <img className="h-64" src={images[`../../assets/IDProof/${ID[category].imgBack}`]?.default} alt={ID[category].title} />
            <div className="mt-4 text-sm text-center text-gray-500">Verso</div>
          </div>
        )}
      </div>

      <div className="border-l-8 border-l-[#6A6AF4] pl-8 leading-loose">
        Toutes les informations doivent être <strong>lisibles</strong>, le document doit être visible <strong>entièrement</strong>, la photo doit être <strong>nette</strong>. Le
        document doit être téléversé en <strong>recto</strong> et <strong>verso</strong>.
      </div>

      {young.files.cniFiles?.length > 0 && (
        <>
          <hr className="my-8 h-px border-0 bg-gray-200" />
          <MyDocs />
        </>
      )}

      <hr className="my-8 h-px border-0 bg-gray-200" />

      {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}

      <p className="my-4">
        Ajouter <strong>le recto</strong>
      </p>
      <FileImport id="recto" file={recto} setFile={setRecto} setError={setError} onChange={() => setHasChanged(true)} />

      {category !== "passport" && (
        <>
          <hr className="my-8 h-px border-0 bg-gray-200" />
          <p className="my-4">
            Ajouter <strong>le verso</strong>
          </p>
          <FileImport id="verso" file={verso} setFile={setVerso} setError={setError} onChange={() => setHasChanged(true)} />
        </>
      )}

      <div className="my-4 text-sm text-gray-800">
        Vous avez besoin d’aide pour téléverser les documents ?{" "}
        <a href="https://support.snu.gouv.fr/base-de-connaissance/je-televerse-un-document/" className="underline">
          Cliquez ici
        </a>
        .
      </div>

      {(recto || verso || date) && <ExpirationDate date={date} setDate={setDate} onChange={() => setHasChanged(true)} corrections={corrections} category={category} />}

      {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
    </DesktopPageContainer>
  );
}

function ExpirationDate({ date, setDate, onChange, corrections, category }) {
  const young = useSelector((state) => state.Auth.young);

  return (
    <>
      <hr className="my-8 h-px border-0 bg-gray-200" />
      <div className="my-4 flex w-full">
        <div className="w-1/2">
          <div className="text-xl font-medium">Renseignez la date d’expiration</div>
          {young.cohort !== "à venir" && (
            <div className="mt-2 mb-8 leading-loose text-gray-600">
              Votre pièce d’identité doit être valide à votre départ en séjour de cohésion (le {formatDateFR(sessions2023.filter((e) => e.name === young.cohort)[0].dateStart)}
              ).
            </div>
          )}
          {corrections
            ?.filter(({ field }) => field === "latestCNIFileExpirationDate")
            .map((e) => (
              <ErrorMessage key={e._id}>
                <strong>Date d&apos;expiration incorrecte</strong>
                {e.message && ` : ${e.message}`}
              </ErrorMessage>
            ))}
          <p className="mt-4 text-gray-800">Date d&apos;expiration</p>
          <DatePickerList
            value={date}
            onChange={(date) => {
              setDate(date);
              onChange && onChange();
            }}
          />
        </div>
        <div className="w-1/2">
          <img className="mx-auto h-32" src={images[`../../../assets/IDProof/${ID[category].imgDate}`]} alt={ID.title} />
        </div>
      </div>
    </>
  );
}
