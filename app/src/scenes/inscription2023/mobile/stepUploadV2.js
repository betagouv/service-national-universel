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
import Navbar from "../components/Navbar";
import StickyButton from "../../../components/inscription/stickyButton";

export default function StepUpload() {
  let { category } = useParams();
  const young = useSelector((state) => state.Auth.young);
  if (!category) category = young.latestCNIFileCategory;
  const history = useHistory();
  const dispatch = useDispatch();
  const correctionsFile = young.correctionRequests?.filter((e) => ["SENT", "REMINDED"].includes(e.status) && e.field === "cniFile");
  const correctionsDate = young.correctionRequests?.filter((e) => ["SENT", "REMINDED"].includes(e.status) && e.field === "latestCNIFileExpirationDate");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [recto, setRecto] = useState();
  const [verso, setVerso] = useState();
  const [checked, setChecked] = useState({ coupe: false, lisible: false, nette: false });
  const [date, setDate] = useState(young.latestCNIFileExpirationDate ? new Date(young.latestCNIFileExpirationDate) : null);
  const [step, setStep] = useState(getStep());

  function getStep() {
    if (correctionsFile?.some((e) => e.reason === "MISSING_BACK")) return "verso";
    if (correctionsFile?.length) return "recto";
    if (correctionsDate?.length) return "date";
    return "recto";
  }

  function renderStep(step) {
    if (step === "recto") return <Recto />;
    if (step === "verso") return <Verso />;
    if (step === "verify") return <Verify />;
    if (step === "date") return <ExpirationDate />;
  }

  async function uploadFiles() {
    let files = [...recto];
    if (verso) files = [...files, ...verso];
    for (const file of files) {
      if (file.size > 5000000)
        return setError({
          text: `Ce fichier ${files.name} est trop volumineux.`,
        });
    }
    const res = await api.uploadFile(`/young/${young._id}/documents/cniFiles`, files, ID[category].category, new Date(date));
    if (res.code === "FILE_CORRUPTED")
      return setError({
        text: "Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
      });
    if (!res.ok) {
      capture(res.code);
      setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier.", subText: res.code ? translate(res.code) : "" });
      setLoading(false);
      return;
    }
  }

  async function onSubmit() {
    setLoading(true);
    if (recto) await uploadFiles();
    if (error) return setLoading(false);
    const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/next", { date });
    if (!ok) {
      capture(code);
      setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
      setLoading(false);
      return;
    }
    plausibleEvent("Phase0/CTA inscription - CI mobile");
    dispatch(setYoung(responseData));
    history.push("/inscription2023/confirm");
  }

  async function onCorrect() {
    setLoading(true);
    if (recto) await uploadFiles();
    if (error) return setLoading(false);
    const data = { latestCNIFileExpirationDate: date, latestCNIFileCategory: category };
    const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/correction", data);
    if (!ok) {
      capture(code);
      setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
      setLoading(false);
      return;
    }
    plausibleEvent("Phase0/CTA demande correction - Corriger ID");
    dispatch(setYoung(responseData));
    history.push("/");
  }

  return (
    <>
      <Navbar />
      <div className="bg-white p-4">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
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
            setStep(correctionsFile?.some((e) => e.reason === "MISSING_BACK") ? "verso" : "recto");
          }}
          disabled={Object.values(checked).some((e) => e === false)}
        />
      )}
      {step === "date" &&
        (correctionsFile.length || correctionsDate.length ? (
          <StickyButton text={loading ? "Scan antivirus en cours" : "Corriger"} onClick={onCorrect} disabled={!date || loading} />
        ) : (
          <StickyButton text={loading ? "Scan antivirus en cours" : "Continuer"} onClick={onSubmit} disabled={!date || loading} />
        ))}
    </>
  );

  function Recto() {
    return (
      <>
        <div className="mb-4">
          {correctionsFile?.map((e) => (
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
          capture="environment"
          id="file-upload"
          name="file-upload"
          accept="image/*"
          onChange={(e) => {
            setRecto(e.target.files);
            setStep(correctionsFile?.some((e) => e.reason === "MISSING_FRONT") || category === "passport" ? "verify" : "verso");
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
          {correctionsFile?.map((e) => (
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
          capture="environment"
          id="file-upload"
          name="file-upload"
          accept="image/*"
          onChange={(e) => {
            setVerso(e.target.files);
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
        <div className="w-full h-48 flex overflow-x-auto mb-4 space-x-2">
          <img src={URL.createObjectURL(recto[0])} className="w-3/4 object-contain" />
          {verso && <img src={URL.createObjectURL(verso[0])} className="w-3/4 object-contain" />}
        </div>
        <p className="text-lg text-gray-800 font-semibold my-4">Vérifiez les points suivants</p>
        <div className="flex items-center my-2">
          <CheckBox type="checkbox" checked={checked.lisible} onChange={() => setChecked((prev) => ({ ...prev, lisible: !checked.lisible }))} />
          <span className="ml-2 mr-2">
            Toutes les informations sont <strong>lisibles</strong>
          </span>
        </div>
        <div className="flex items-center my-4">
          <CheckBox type="checkbox" checked={checked.coupe} onChange={() => setChecked((prev) => ({ ...prev, coupe: !checked.coupe }))} />
          <span className="ml-2 mr-2">
            Le document n&apos;est <strong>pas coupé</strong>
          </span>
        </div>
        <div className="flex items-center my-4">
          <CheckBox type="checkbox" checked={checked.nette} onChange={() => setChecked((prev) => ({ ...prev, nette: !checked.nette }))} />
          <span className="ml-2 mr-2">
            La photo est <strong>nette</strong>
          </span>
        </div>
      </>
    );
  }

  function ExpirationDate() {
    return (
      <>
        <div className="mb-4">
          {correctionsDate?.map((e) => (
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
        <DatePickerList value={date} onChange={(date) => setDate(date)} />
      </>
    );
  }
}
