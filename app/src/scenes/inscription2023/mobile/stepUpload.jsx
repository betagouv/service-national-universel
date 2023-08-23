import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import dayjs from "dayjs";

import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { resizeImage } from "../../../services/file.service";
import { translate } from "../../../utils";
import { getCorrectionsForStepUpload } from "../../../utils/navigation";
import { ID } from "../utils";
import { formatDateFR, sessions2023, translateCorrectionReason } from "snu-lib";

import CheckBox from "../../../components/inscription/checkbox";
import DatePickerList from "../../preinscription/components/DatePickerList";
import Error from "../../../components/error";
import ErrorMessage from "../components/ErrorMessage";
import Footer from "@/components/dsfr/components/Footer";
import Help from "../components/Help";
import MyDocs from "../components/MyDocs";
import Navbar from "../components/Navbar";
import StickyButton from "../../../components/inscription/stickyButton";

export default function StepUpload() {
  let { category } = useParams();
  const young = useSelector((state) => state.Auth.young);
  if (!category) category = young.latestCNIFileCategory;
  const history = useHistory();
  const dispatch = useDispatch();
  const corrections = getCorrectionsForStepUpload(young);

  const [step, setStep] = useState(getStep());
  const [loading, setLoading] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [error, setError] = useState({});
  const [recto, setRecto] = useState();
  const [verso, setVerso] = useState();
  const [checked, setChecked] = useState({
    "Toutes les informations sont lisibles": false,
    "Le document n'est pas coupé": false,
    "La photo est nette": false,
  });
  const [date, setDate] = useState(young.latestCNIFileExpirationDate ? new Date(young.latestCNIFileExpirationDate) : null);

  const isEnabled = validate();
  const expirationDate = dayjs(date).locale("fr").format("YYYY-MM-DD");

  function validate() {
    if (corrections?.length) {
      return hasChanged && !loading && !error.text;
    } else {
      return (young?.files?.cniFiles?.length || (recto && (verso || category === "passport"))) && date && !loading && !error.text;
    }
  }

  function getStep() {
    if (corrections?.some(({ reason }) => reason === "MISSING_BACK")) return "verso";
    if (corrections?.some(({ field }) => field === "cniFile")) return "recto";
    if (corrections?.some(({ field }) => field === "latestCNIFileExpirationDate")) return "date";
    return "recto";
  }

  function renderStep(step) {
    if (step === "recto") return <Recto />;
    if (step === "verso") return <Verso />;
    if (step === "verify")
      return (
        <>
          <Gallery recto={recto} verso={verso} />
          <Verify />
        </>
      );
    if (step === "date") return <ExpirationDate />;
  }

  function resetState() {
    setRecto();
    setVerso();
    setStep(getStep());
    setLoading(false);
  }

  async function uploadFiles() {
    if (recto) {
      const res = await api.uploadFiles(`/young/${young._id}/documents/cniFiles`, recto, { category, expirationDate, side: "recto" });
      if (!res.ok) {
        capture(res.code);
        setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier." });
        resetState();
        return { ok: false };
      }
    }

    if (verso) {
      const res = await api.uploadFiles(`/young/${young._id}/documents/cniFiles`, verso, { category, expirationDate, side: "verso" });
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
        setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données.", subText: code });
        resetState();
        return;
      }

      plausibleEvent("Phase0/CTA inscription - CI mobile");
      dispatch(setYoung(responseData));
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
        setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données.", subText: translate(code) });
        setLoading(false);
        return;
      }

      plausibleEvent("Phase0/CTA demande correction - Corriger ID");
      dispatch(setYoung(responseData));
      history.push("/");
    } catch (e) {
      capture(e);
      setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données." });
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="bg-white p-4">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        {young?.files?.cniFiles?.length + recto?.length + verso?.length > 2 && (
          <>
            <Error text={`Vous ne pouvez téleverser plus de 3 fichiers. Vous avez déjà ${young.files.cniFiles?.length} fichiers en ligne.`} />
            <MyDocs />
          </>
        )}
        {renderStep(step)}
      </div>
      <Help />
      <Footer marginBottom="mb-[88px]" />
      {step === "verify" && (
        <StickyButton
          text="Continuer"
          onClick={() => setStep("date")}
          onClickPrevious={() => {
            setRecto(null);
            setVerso(null);
            setHasChanged(false);
            setStep(corrections?.some(({ reason }) => reason === "MISSING_BACK") ? "verso" : "recto");
          }}
          disabled={Object.values(checked).some((e) => e === false)}
        />
      )}
      {step === "date" &&
        (corrections?.length ? (
          <StickyButton text={loading ? "Scan antivirus en cours" : "Corriger"} onClick={onCorrect} disabled={!isEnabled} />
        ) : (
          <StickyButton text={loading ? "Scan antivirus en cours" : "Continuer"} onClick={onSubmit} disabled={!isEnabled} />
        ))}
    </>
  );

  function Recto() {
    async function handleChange(e) {
      const image = await resizeImage(e.target.files[0]);
      if (image.size > 5000000) return setError({ text: "Ce fichier est trop volumineux." });

      setRecto(image);
      setHasChanged(true);
      setStep(corrections?.some(({ reason }) => reason === "MISSING_FRONT") || category === "passport" ? "verify" : "verso");
    }

    return (
      <>
        <div className="mb-4">
          {corrections
            ?.filter(({ field }) => field == "cniFile")
            ?.map((e) => (
              <ErrorMessage key={e._id} className="">
                <strong>{translateCorrectionReason(e.reason)}</strong>
                {e.message && ` : ${e.message}`}
              </ErrorMessage>
            ))}
        </div>
        <div className="mb-4 flex w-full items-center justify-center">
          <img src={ID[category]?.imgFront} alt={ID[category]?.title} />
        </div>
        <input type="file" id="file-upload" name="file-upload" accept="image/*" onChange={handleChange} className="hidden" />
        <button className="flex w-full">
          <label htmlFor="file-upload" className="flex w-full items-center justify-center bg-[#000091] p-2 text-white">
            {category === "passport" ? "Scannez le document" : "Scannez le recto du document"}
          </label>
        </button>
      </>
    );
  }

  function Verso() {
    async function handleChange(e) {
      const image = await resizeImage(e.target.files[0]);
      if (image.size > 5000000) return setError({ text: "Ce fichier est trop volumineux." });

      setVerso(image);
      setHasChanged(true);
      setStep("verify");
    }

    return (
      <>
        <div className="mb-4">
          {corrections
            ?.filter(({ field }) => field == "cniFile")
            ?.map((e) => (
              <ErrorMessage key={e._id}>
                <strong>{translateCorrectionReason(e.reason)}</strong>
                {e.message && ` : ${e.message}`}
              </ErrorMessage>
            ))}
        </div>
        <div className="mb-4 flex w-full items-center justify-center">{ID[category].imgBack && <img src={ID[category]?.imgBack} alt={ID[category]?.title} />}</div>
        <input type="file" id="file-upload" name="file-upload" accept="image/*" onChange={handleChange} className="hidden" />
        <button className="flex w-full">
          <label htmlFor="file-upload" className="flex w-full items-center justify-center bg-[#000091] p-2 text-white">
            Scannez le verso du document
          </label>
        </button>
      </>
    );
  }

  function Verify() {
    return (
      <>
        <p className="my-4 text-lg font-semibold text-gray-800">Vérifiez les points suivants</p>
        {Object.entries(checked).map(([key, value]) => (
          <div className="my-2 flex items-center" key={key}>
            <CheckBox type="checkbox" checked={value} onChange={() => setChecked({ ...checked, [key]: !checked[key] })} />
            <span className="ml-2 mr-2">{key}</span>
          </div>
        ))}
      </>
    );
  }

  function ExpirationDate() {
    function handleChange(date) {
      setDate(date);
      setHasChanged(true);
    }

    return (
      <>
        <div className="mb-4">
          {corrections
            ?.filter(({ field }) => field === "latestCNIFileExpirationDate")
            ?.map((e) => (
              <ErrorMessage key={e._id}>
                <strong>Date d&apos;expiration incorrecte</strong>
                {e.message && ` : ${e.message}`}
              </ErrorMessage>
            ))}
        </div>
        <div className="text-xl font-medium">Renseignez la date d’expiration</div>
        {young.cohort !== "à venir" && (
          <div className="my-2 text-gray-600">
            Votre pièce d’identité doit être valide à votre départ en séjour de cohésion (le {formatDateFR(sessions2023.filter((e) => e.name === young.cohort)[0].dateStart)}
            ).
          </div>
        )}
        <div className="mx-auto w-3/4">
          <img className="mx-auto my-4" src={ID[category]?.imgDate} alt={ID.title} />
        </div>
        <DatePickerList value={date} onChange={(date) => handleChange(date)} />
      </>
    );
  }
}

function Gallery({ recto, verso }) {
  return (
    <div className="mb-4 flex h-48 w-full space-x-2 overflow-x-auto">
      {recto && <img src={URL.createObjectURL(recto)} className="w-3/4 object-contain" />}
      {verso && <img src={URL.createObjectURL(verso)} className="w-3/4 object-contain" />}
    </div>
  );
}
