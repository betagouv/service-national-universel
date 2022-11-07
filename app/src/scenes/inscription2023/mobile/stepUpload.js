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
  if (category === undefined) category = young?.latestCNIFileCategory;
  const history = useHistory();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [recto, setRecto] = useState();
  const [verso, setVerso] = useState();
  const [checked, setChecked] = useState({ coupe: false, lisible: false, nette: false });
  const [date, setDate] = useState(young?.latestCNIFileExpirationDate ? new Date(young?.latestCNIFileExpirationDate) : null);

  const correctionsFile = young?.correctionRequests?.filter((e) => ["SENT", "REMINDED"].includes(e.status) && e.field === "cniFile");
  const correctionsDate = young?.correctionRequests?.filter((e) => ["SENT", "REMINDED"].includes(e.status) && e.field === "latestCNIFileExpirationDate");
  const mode = correctionsFile.length || correctionsDate.length ? "correction" : "inscription";

  async function uploadFiles() {
    let files = [...recto];
    if (verso?.length) files = [...files, ...verso];
    setLoading(true);
    for (const file of files) {
      if (file.size > 5000000)
        return setError({
          text: `Ce fichier ${files.name} est trop volumineux.`,
        });
    }
    const res = await api.uploadFile(`/young/${young._id}/documents/cniFiles`, Array.from(files), ID[category].category, new Date(date));
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
    if (recto) uploadFiles();
    const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/next", { date });
    if (!ok) {
      capture(code);
      setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
      setLoading(false);
      return;
    }
    dispatch(setYoung(responseData));
    plausibleEvent("Phase0/CTA inscription - CI mobile");
    history.push("/inscription2023/confirm");
  }

  async function onCorrect() {
    setLoading(true);
    if (recto?.length) uploadFiles();
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
    setLoading(false);
  }

  function renderInscription() {
    if (recto && ["cniNew", "cniOld"].includes(category) && !verso) return <Verso />;
    if (checked.lisible === true && checked.coupe === true && checked.nette === true) return <ExpirationDate />;
    if (verso || (recto && category === "passport")) return <Confirm />;
    return <Recto />;
  }

  function renderCorrection() {
    if (category === null) return <div>Loading</div>;
    if (correctionsFile?.length && correctionsFile?.some((e) => e.reason === "MISSING_BACK")) return <Verso />;
    if (correctionsDate?.length) return <ExpirationDate />;
    if (verso || (recto && category === "passport")) return <Confirm />;
    return <Recto />;
  }

  return (
    <>
      <Navbar />
      <div className="bg-white p-4">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        {correctionsFile?.map((e) => (
          <ErrorMessage key={e._id}>
            <strong>{translateCorrectionReason(e.reason)}</strong>
            {e.message && ` : ${e.message}`}
          </ErrorMessage>
        ))}
        {mode === "correction" ? renderCorrection() : renderInscription()}
      </div>
      <Help />
      <Footer marginBottom="mb-[88px]" />
      {mode === "correction" ? (
        <StickyButton text={loading ? "Scan antivirus en cours" : "Corriger"} onClick={onCorrect} disabled={correctionsDate.length || correctionsFile.length} />
      ) : (
        <StickyButton text={loading ? "Scan antivirus en cours" : "Continuer"} onClick={onSubmit} disabled={!date || loading} />
      )}
    </>
  );

  function Recto() {
    return (
      <>
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
          }}
          className="hidden"
        />
        <button className="flex w-full">
          <label htmlFor="file-upload" className="flex items-center justify-center p-2 w-full bg-[#000091] text-white">
            Scannez le {ID[category].imgBack && "recto du"} document
          </label>
        </button>
      </>
    );
  }

  function Verso() {
    return (
      <>
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

  function Confirm() {
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
        {correctionsDate?.map((e) => (
          <ErrorMessage key={e._id}>
            <strong>Date d&apos;expiration incorrecte</strong>
            {e.message && ` : ${e.message}`}
          </ErrorMessage>
        ))}
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
