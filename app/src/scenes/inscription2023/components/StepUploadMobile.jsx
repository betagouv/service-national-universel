import React, { useState } from "react";
import { useSelector } from "react-redux";
import { resizeImage } from "../../../services/file.service";
import { ID } from "../utils";
import { getCohort } from "@/utils/cohorts";
import { formatDateFR, translateCorrectionReason } from "snu-lib";
import dayjs from "dayjs";

import DatePicker from "../../../components/dsfr/forms/DatePicker";
import Error from "../../../components/error";
import ErrorMessage from "../../../components/dsfr/forms/ErrorMessage";
import MyDocs from "../components/MyDocs";
import { SignupButtons } from "@snu/ds/dsfr";
import Verify from "./VerifyDocument";

export default function StepUploadMobile({
  recto,
  setRecto,
  verso,
  setVerso,
  date,
  setDate,
  error,
  setError,
  loading,
  setLoading,
  corrections,
  category,
  checked,
  setChecked,
  onSubmit,
  onCorrect,
}) {
  const young = useSelector((state) => state.Auth.young);
  const [step, setStep] = useState(getStep());
  const [hasChanged, setHasChanged] = useState(false);
  const isEnabled = validate();

  function validate() {
    if (!dayjs(date).isValid()) {
      return false;
    }
    if (dayjs(date).year() < 1990 || dayjs(date).year() > 2070) return false;
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
    if (step === "recto") return <Recto corrections={corrections} category={category} setRecto={setRecto} setStep={setStep} setHasChanged={setHasChanged} setError={setError} />;
    if (step === "verso") return <Verso corrections={corrections} category={category} setVerso={setVerso} setStep={setStep} setHasChanged={setHasChanged} setError={setError} />;
    if (step === "verify") return <Verify recto={recto} verso={verso} checked={checked} setChecked={setChecked} />;
    if (step === "date") return <ExpirationDate corrections={corrections} category={category} young={young} date={date} setDate={setDate} setHasChanged={setHasChanged} />;
  }

  function resetState() {
    setRecto();
    setVerso();
    setStep && setStep(getStep());
    setLoading(false);
  }

  return (
    <>
      {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
      {young?.files?.cniFiles?.length + recto?.length + verso?.length > 2 && (
        <>
          <Error text={`Vous ne pouvez téleverser plus de 3 fichiers. Vous avez déjà ${young.files.cniFiles?.length} fichiers en ligne.`} />
          <MyDocs />
        </>
      )}
      {renderStep(step)}
      {step === "verify" && (
        <SignupButtons
          labelNext="Continuer"
          onClickNext={() => setStep("date")}
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
          <SignupButtons onClickNext={() => onCorrect(resetState)} labelNext={loading ? "Scan antivirus en cours" : "Corriger"} disabled={!isEnabled} />
        ) : (
          <SignupButtons onClickNext={() => onSubmit(resetState)} labelNext={loading ? "Scan antivirus en cours" : "Continuer"} disabled={!isEnabled} />
        ))}
    </>
  );
}

function Recto({ corrections, category, setRecto, setStep, setHasChanged, setError }) {
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

function Verso({ corrections, category, setVerso, setStep, setHasChanged, setError }) {
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

function ExpirationDate({ corrections, category, young, date, setDate, setHasChanged }) {
  const [error, setError] = useState(false);
  const handleChange = (date) => {
    setDate(date);
    setHasChanged(true);

    if (!date) return setError("Veuillez renseigner une date d'expiration.");
    if (dayjs(date).year() < 1990 || dayjs(date).year() > 2070) return setError("Veuillez renseigner une date d'expiration valide. Elle doit être comprise entre 1990 et 2070.");
    setError(false);
  };
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
          Votre pièce d’identité doit être valide à votre départ en séjour de cohésion (le {formatDateFR(getCohort(young.cohort).dateStart)}
          ).
        </div>
      )}
      <div className="mx-auto w-3/4">
        <img className="mx-auto my-4" src={ID[category]?.imgDate} alt={ID.title} />
      </div>
      <DatePicker
        state={error ? "error" : "default"}
        errorText={error}
        initialValue={date}
        onChange={(date) => {
          handleChange(date);
        }}
      />
    </>
  );
}
