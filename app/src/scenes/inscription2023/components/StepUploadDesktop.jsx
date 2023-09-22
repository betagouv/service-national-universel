import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ID } from "../utils";
import { formatDateFR, translateCorrectionReason } from "snu-lib";
import dayjs from "dayjs";
import DatePicker from "../../../components/dsfr/forms/DatePicker";
import Error from "../../../components/error";
import ErrorMessage from "../../../components/dsfr/forms/ErrorMessage";
import MyDocs from "../components/MyDocs";
import SignupButtonContainer from "@/components/dsfr/ui/buttons/SignupButtonContainer";
import FileImport from "@/components/dsfr/forms/FileImport";
import { getCohort } from "@/utils/cohorts";

export default function StepUploadDesktop({ recto, setRecto, verso, setVerso, date, setDate, error, setError, loading, setLoading, corrections, category, onSubmit, onCorrect }) {
  const young = useSelector((state) => state.Auth.young);
  const [hasChanged, setHasChanged] = useState(false);
  const isEnabled = validate();

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
    setRecto();
    setVerso();
    setHasChanged(false);
    setLoading(false);
  }

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
      {corrections?.length ? (
        <SignupButtonContainer onClickNext={() => onCorrect(resetState)} labelNext={loading ? "Scan antivirus en cours" : "Corriger"} disabled={!isEnabled} />
      ) : (
        <SignupButtonContainer onClickNext={() => onSubmit(resetState)} labelNext={loading ? "Scan antivirus en cours" : "Continuer"} disabled={!isEnabled} />
      )}
    </>
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
              Votre pièce d’identité doit être valide à votre départ en séjour de cohésion (le {formatDateFR(getCohort(young.cohort).dateStart)}
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
        </div
      </div>
      <div>
        <label className="flex-start mt-2 flex w-full flex-col text-base">
          Date d&apos;expiration
          <DatePicker
            value={date}
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
