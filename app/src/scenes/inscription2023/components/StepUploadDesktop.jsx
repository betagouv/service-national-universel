import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { ID } from "../utils";
import { getCohort } from "@/utils/cohorts";
import dayjs from "dayjs";
import { formatDateFR, translateCorrectionReason } from "snu-lib";
import DatePicker from "../../../components/dsfr/forms/DatePicker";
import Error from "../../../components/error";
import ErrorMessage from "../../../components/dsfr/forms/ErrorMessage";
import MyDocs from "../components/MyDocs";
import FileImport from "@/components/dsfr/forms/FileImport";
import Verify from "./VerifyDocument";
import plausibleEvent from "@/services/plausible";
import { SignupButtons } from "@snu/ds/dsfr";

export default function StepUploadDesktop({
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
  const [hasChanged, setHasChanged] = useState(false);
  const isEnabled = validate();
  const [step, setStep] = useState(0);
  const history = useHistory();
  const imageFileTypes = ["image/jpeg", "image/png", "image/jpg"];

  function validate() {
    if (!dayjs(date).isValid()) {
      return false;
    }
    if (corrections?.length) {
      return hasChanged && !loading && !error.text;
    } else {
      return (young?.files?.cniFiles?.length || (recto && (verso || category === "passport"))) && date && !loading && !error.text;
    }
  }

  function resetState() {
    setStep(0);
    setRecto();
    setVerso();
    setHasChanged(false);
    setLoading(false);
  }

  const handleOnClickNext = async () => {
    //si correction on passe directement à la vérification
    if (corrections?.length) return onCorrect(resetState);
    //si pas de nouveaux fichiers on passe directement à la vérification
    if (!recto && !verso && young?.files?.cniFiles?.length) return onSubmit(resetState);
    //sinon
    const areAllFilesImages = [recto, verso].every((e) => !e || imageFileTypes.includes(e?.type));
    if (areAllFilesImages) return setStep(1);
    else return onSubmit(resetState);
  };

  if (step === 1)
    return (
      <>
        <Verify recto={recto} verso={verso} checked={checked} setChecked={setChecked} />
        <SignupButtons
          onClickNext={() => (corrections?.length ? onCorrect(resetState) : onSubmit(resetState))}
          labelNext={loading ? "Scan antivirus en cours" : "Oui, les documents sont conformes"}
          disabled={Object.values(checked).some((e) => e === false)}
          onClickPrevious={resetState}
          labelPrevious="Non, recommencer"
        />
      </>
    );

  return (
    <>
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
          <img className="h-64" src={ID[category].imgFront} alt={ID[category].title} />
          <div className="mt-4 text-sm text-center text-gray-500">Recto</div>
        </div>

        {ID[category].imgBack && (
          <div>
            <img className="h-64" src={ID[category].imgBack} alt={ID[category].title} />
            <div className="mt-4 text-sm text-center text-gray-500">Verso</div>
          </div>
        )}
      </div>

      <div className="pl-3 border-l-4 border-l-indigo-500 text-[#3A3A3A] text-[16px] my-4 leading-6">
        Toutes les informations doivent être <strong>lisibles</strong>, le document doit être visible <strong>entièrement</strong>, la photo doit être <strong>nette</strong>. Le
        document doit être téléversé en <strong>recto</strong> et <strong>verso</strong>.
      </div>

      {young.files.cniFiles?.length > 0 && (
        <>
          <hr className="my-8" />
          <MyDocs />
        </>
      )}

      <hr className="my-8" />

      {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}

      <p className="my-4">
        Ajouter <strong>le recto</strong>
      </p>
      <FileImport id="recto" file={recto} setFile={setRecto} setError={setError} onChange={() => setHasChanged(true)} />

      {category !== "passport" && (
        <>
          <hr className="my-8" />
          <p className="my-4">
            Ajouter <strong>le verso</strong>
          </p>
          <FileImport id="verso" file={verso} setFile={setVerso} setError={setError} onChange={() => setHasChanged(true)} />
        </>
      )}

      <div className="my-4 text-sm text-gray-800">
        Vous avez besoin d’aide pour téléverser les documents ?{" "}
        <a
          href="https://support.snu.gouv.fr/base-de-connaissance/je-televerse-un-document/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={plausibleEvent("Phase0/CTA inscription - aide televerser")}
          className="underline">
          Cliquez ici
        </a>
        .
      </div>

      {(recto || verso || date) && <ExpirationDate date={date} setDate={setDate} onChange={() => setHasChanged(true)} corrections={corrections} category={category} />}

      {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
      <SignupButtons onClickNext={handleOnClickNext} disabled={!isEnabled} onClickPrevious={() => history.push("/inscription2023/documents")} />
    </>
  );
}

function ExpirationDate({ date, setDate, onChange, corrections, category }) {
  const young = useSelector((state) => state.Auth.young);
  return (
    <>
      <hr className="my-8" />
      <div className="my-4 flex w-full">
        <div className="w-1/2">
          <div className="text-xl font-medium">Renseignez la date d’expiration</div>
          {young.cohort !== "à venir" && (
            <div className="mt-2 mb-8 leading-loose text-gray-600">
              Votre pièce d’identité doit être valide à votre départ en séjour de cohésion (le {formatDateFR(formatDateFR(getCohort(young.cohort).dateStart))}
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
        </div>
        <div className="w-1/2">
          <img className="mx-auto h-32" src={ID[category].imgDate} alt={ID.title} />
        </div>
      </div>
      <div>
        <label className="flex-start mt-2 flex w-full flex-col text-base">
          Date d&apos;expiration
          <DatePicker
            displayError
            initialValue={date}
            onChange={(date) => {
              setDate(date);
              onChange && onChange();
            }}
          />
        </label>
      </div>
    </>
  );
}
