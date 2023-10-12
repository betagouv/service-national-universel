import React, { useState } from "react";
import { useSelector } from "react-redux";
import { resizeImage } from "../../../services/file.service";
import { ID } from "../utils";
import { formatDateFR, sessions2023, translateCorrectionReason } from "snu-lib";

import CheckBox from "../../../components/dsfr/forms/checkbox";
import DatePickerDsfr from "../../../components/dsfr/forms/DatePickerDsfr";
import Error from "../../../components/error";
import ErrorMessage from "../../../components/dsfr/forms/ErrorMessage";
import MyDocs from "../components/MyDocs";
import SignupButtonContainer from "@/components/dsfr/ui/buttons/SignupButtonContainer";

export default function StepUploadMobile({ recto, setRecto, verso, setVerso, date, setDate, error, setError, loading, setLoading, corrections, category, onSubmit, onCorrect }) {
  const young = useSelector((state) => state.Auth.young);
  const [step, setStep] = useState(getStep());
  const [checked, setChecked] = useState({
    "Toutes les informations sont lisibles": false,
    "Le document n'est pas coupé": false,
    "La photo est nette": false,
  });
  const [hasChanged, setHasChanged] = useState(false);
  const isEnabled = validate();

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
    {(recto || verso || date) && <ExpirationDate date={date} setDate={setDate} onChange={() => setHasChanged(true)} corrections={corrections} category={category} />}
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
        <SignupButtonContainer
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
          <SignupButtonContainer onClickNext={() => onCorrect(resetState)} labelNext={loading ? "Scan antivirus en cours" : "Corriger"} disabled={!isEnabled} />
        ) : (
          <SignupButtonContainer onClickNext={() => onSubmit(resetState)} labelNext={loading ? "Scan antivirus en cours" : "Continuer"} disabled={!isEnabled} />
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
        <DatePickerDsfr value={date} onChange={(date) => handleChange(date)} />
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
