import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { translate } from "../../../utils";
import { ID } from "../utils";
import { formatDateFR, sessions2023, translateCorrectionReason } from "snu-lib";

import CheckBox from "../../../components/inscription/checkbox";
import DatePickerList from "../../preinscription/components/DatePickerList";
import Error from "../../../components/error";
import ErrorMessage from "../components/ErrorMessage";
import Footer from "../../../components/footerV2";
import Help from "../components/Help";
import MyDocs from "../components/MyDocs";
import Navbar from "../components/Navbar";
import StickyButton from "../../../components/inscription/stickyButton";

import dayjs from "dayjs";
export default function StepUpload() {
  let { category } = useParams();
  const young = useSelector((state) => state.Auth.young);
  if (!category) category = young.latestCNIFileCategory;
  const history = useHistory();
  const dispatch = useDispatch();
  const corrections = young.correctionRequests?.filter((e) => ["SENT", "REMINDED"].includes(e.status) && ["cniFile", "latestCNIFileExpirationDate"].includes(e.field));

  const [step, setStep] = useState(getStep());
  const [loading, setLoading] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [error, setError] = useState({});
  const [recto, setRecto] = useState([]);
  const [verso, setVerso] = useState([]);
  const [checked, setChecked] = useState({
    "Toutes les informations sont lisibles": false,
    "Le document n'est pas coupé": false,
    "La photo est nette": false,
  });
  const [date, setDate] = useState(young.latestCNIFileExpirationDate ? new Date(young.latestCNIFileExpirationDate) : null);

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

  async function uploadFiles() {
    try {
      let files = [];
      if (recto) files = [...files, ...recto];
      if (verso) files = [...files, ...verso];
      for (const file of files) {
        if (file.size > 5000000) return { error: `Ce fichier ${files.name} est trop volumineux.` };
      }
      const res = await api.uploadFile(`/young/${young._id}/documents/cniFiles`, files, ID[category].category, dayjs(date).locale("fr").format("YYYY-MM-DD"));
      if (res.code === "FILE_CORRUPTED")
        return {
          error:
            "Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support : inscription@snu.gouv.fr",
        };
      if (!res.ok) {
        capture(res.code);
        return res.code;
      }
    } catch (e) {
      capture(e);
      return { error: translate(e) };
    }
  }

  async function onSubmit() {
    try {
      setLoading(true);
      if (recto) {
        const res = await uploadFiles();
        if (res?.error) {
          setRecto([]);
          setVerso([]);
          setHasChanged(false);
          setStep(getStep());
          setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier.", subText: res?.error });
          setLoading(false);
          return;
        }
      }
      const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/next", { date: dayjs(date).locale("fr").format("YYYY-MM-DD") });
      if (!ok) {
        capture(code);
        setLoading(false);
        setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données.", subText: translate(code) });
        return;
      }
      plausibleEvent("Phase0/CTA inscription - CI mobile");
      dispatch(setYoung(responseData));
      history.push("/inscription2023/confirm");
    } catch (e) {
      capture(e);
      setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données.", subText: translate(e) });
      setLoading(false);
    }
  }

  async function onCorrect() {
    try {
      setLoading(true);
      if (recto || verso) {
        const res = await uploadFiles();
        if (res?.error) {
          setRecto([]);
          setVerso([]);
          setHasChanged(false);
          setStep(getStep());
          setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier.", subText: res?.error });
          setLoading(false);
          return;
        }
      }
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
      setError({ text: "Une erreur s'est produite lors de la mise à jour de vos données.", subText: translate(e) });
      setLoading(false);
    }
  }

  const isEnabled = corrections?.length
    ? hasChanged && !loading && !error.text
    : (young?.files?.cniFiles?.length || [...recto, ...verso].length) && date && !loading && !error.text;

  return (
    <>
      <Navbar />
      <div className="bg-white p-4">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        {young?.files?.cniFiles?.length + recto?.length + verso?.length > 3 && (
          <>
            <Error
              text={
                young?.files?.cniFiles?.length
                  ? `Vous ne pouvez téleverser plus de 3 fichiers. Vous avez déjà ${young.files.cniFiles.length} fichiers en ligne.`
                  : "Vous ne pouvez téleverser plus de 3 fichiers."
              }
            />
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
        <div className="w-full flex items-center justify-center mb-4">
          <img src={require(`../../../assets/IDProof/${ID[category].imgFront}`)} alt={ID[category].title} />
        </div>
        <input
          type="file"
          id="file-upload"
          name="file-upload"
          accept="image/*"
          onChange={(e) => {
            setRecto(e.target.files);
            setHasChanged(true);
            setStep(corrections?.some(({ reason }) => reason === "MISSING_FRONT") || category === "passport" ? "verify" : "verso");
          }}
          className="hidden"
        />
        <button className="flex w-full">
          <label htmlFor="file-upload" className="flex items-center justify-center p-2 w-full bg-[#000091] text-white">
            {category === "passport" ? "Scannez le document" : "Scannez le recto du document"}
          </label>
        </button>
      </>
    );
  }

  function Verso() {
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
        <div className="w-full flex items-center justify-center mb-4">
          <img src={require(`../../../assets/IDProof/${ID[category].imgBack}`)} alt={ID[category].title} />
        </div>
        <input
          type="file"
          id="file-upload"
          name="file-upload"
          accept="image/*"
          onChange={(e) => {
            setVerso(e.target.files);
            setHasChanged(true);
            setStep("verify");
          }}
          className="hidden"
        />
        <button className="flex w-full">
          <label htmlFor="file-upload" className="flex items-center justify-center p-2 w-full bg-[#000091] text-white">
            Scannez le verso du document
          </label>
        </button>
      </>
    );
  }

  function Verify() {
    return (
      <>
        <p className="text-lg text-gray-800 font-semibold my-4">Vérifiez les points suivants</p>
        {Object.entries(checked).map(([key, value]) => (
          <div className="flex items-center my-2" key={key}>
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
        <div className="text-gray-600 my-2">
          Votre pièce d’identité doit être valide à votre départ en séjour de cohésion (le {formatDateFR(sessions2023.filter((e) => e.name === young.cohort)[0].dateStart)}
          ).
        </div>
        <div className="w-3/4 mx-auto">
          <img className="mx-auto my-4" src={require(`../../../assets/IDProof/${ID[category].imgDate}`)} alt={ID.title} />
        </div>
        <DatePickerList value={date} onChange={(date) => handleChange(date)} />
      </>
    );
  }
}

function Gallery({ recto, verso }) {
  return (
    <div className="w-full h-48 flex overflow-x-auto mb-4 space-x-2">
      {recto.length > 0 && <img src={URL.createObjectURL(recto[0])} className="w-3/4 object-contain" />}
      {verso.length > 0 && <img src={URL.createObjectURL(verso[0])} className="w-3/4 object-contain" />}
    </div>
  );
}
