import React, { useState } from "react";
import { useSelector } from "react-redux";
import { resizeImage } from "../../../services/file.service";
import { ID } from "../utils";
import { translateCorrectionReason } from "snu-lib";
import dayjs from "dayjs";

import Error from "../../../components/error";
import ErrorMessage from "../../../components/dsfr/forms/ErrorMessage";
import MyDocs from "../components/MyDocs";
import { SignupButtons } from "@snu/ds/dsfr";
import Verify from "./VerifyDocument";
import Input from "@/components/dsfr/forms/input";

export default function StepUploadMobile({
  recto,
  setRecto,
  verso,
  setVerso,
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
  day,
  setDay,
  month,
  setMonth,
  year,
  setYear,
}) {
  const young = useSelector((state) => state.Auth.young);
  const [step, setStep] = useState(getStep());
  const [hasChanged, setHasChanged] = useState(false);
  const fullDate = day && month && year ? new Date(year, month - 1, day) : null;

  function validate() {
    let error = {};

    if (!day || day < 1 || day > 31) {
      error.day = "Veuillez entrer un jour valide, compris entre 1 et 31";
    }
    if (!month || month < 1 || month > 12) {
      error.month = "Veuillez entrer un mois valide, compris entre 1 et 12";
    }
    if (!year || year < 1990 || year > 2070) {
      error.year = "Veuillez entrer une année valide, comprise entre 1990 et 2070";
    }
    if (!dayjs(fullDate).isValid()) {
      error.text = "Date invalide. Veuillez entrer une date valide.";
    }
    if (corrections?.length) {
      if (!hasChanged && !loading) {
        error.text = "Veuillez Modifier vos informations personnelles";
      } else {
        return error;
      }
    }
    // Check if there are errors
    if (Object.keys(error).length > 0) {
      setError(error);
      return error;
    }
    setError({});
    return error;
  }

  // Handle the next button click
  const handleOnClickNext = () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setError(errors);
      return;
    }

    if (corrections?.length) {
      onCorrect(resetState); // If there are corrections
    } else {
      onSubmit(resetState); // If it's a new submission
    }
  };

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
    if (step === "date")
      return (
        <ExpirationDate
          day={day}
          setDay={setDay}
          month={month}
          setMonth={setMonth}
          year={year}
          setYear={setYear}
          onChange={() => setHasChanged(true)}
          error={error}
          setError={setError}
          corrections={corrections}
          category={category}
        />
      );
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
      {step === "date" && <SignupButtons onClickNext={handleOnClickNext} labelNext={loading ? "Scan antivirus en cours" : "Continuer"} />}
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

function ExpirationDate({ day, setDay, month, setMonth, year, setYear, onChange, error, corrections, category }) {
  const young = useSelector((state) => state.Auth.young);

  const blockInvalidChar = (e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault();

  return (
    <>
      <>
        <hr className="my-8" />
        <div className="my-4 flex w-full">
          <div className="w-1/2">
            <div className="text-xl font-medium">Renseignez la date d’expiration</div>
            {young.cohort !== "à venir" && (
              <div className="mt-2 mb-8 leading-loose text-gray-600">
                Votre pièce d’identité doit être valide à votre départ en séjour de cohésion (le {dayjs(young.cohort.dateStart).format("DD/MM/YYYY")}).
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
          </div>
          <div className="w-1/2">
            <img className="mx-auto h-32" src={ID[category].imgDate} alt={ID.title} />
          </div>
        </div>
        <div>
          <label className="flex-start mt-2 flex w-full flex-col text-base">
            Date d&apos;expiration
            <div className="grid grid-cols-3 gap-4">
              <Input
                id="day"
                type="number"
                min="1"
                max="31"
                value={day}
                onKeyDown={blockInvalidChar}
                onChange={(e) => {
                  setDay(e);
                  onChange();
                }}
                placeholder="Jour"
                hintText="Exemple : 14"
                maxLength="2"
                state={error.day ? "error" : "default"}
                stateRelatedMessage={error.day}
              />
              <Input
                id="month"
                type="number"
                min="1"
                max="12"
                value={month}
                onKeyDown={blockInvalidChar}
                onChange={(e) => {
                  setMonth(e);
                  onChange();
                }}
                placeholder="Mois"
                hintText="Exemple : 12"
                maxLength="2"
                state={error.month ? "error" : "default"}
                stateRelatedMessage={error.month}
              />
              <Input
                id="year"
                type="number"
                min="1990"
                max="2070"
                value={year}
                onKeyDown={blockInvalidChar}
                onChange={(e) => {
                  setYear(e);
                  onChange();
                }}
                placeholder="Année"
                hintText="Exemple : 2024"
                maxLength="4"
                state={error.year ? "error" : "default"}
                stateRelatedMessage={error.year}
              />
            </div>
          </label>
        </div>
      </>
    </>
  );
}
