import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { useHistory, useParams } from "react-router-dom";
import { supportURL } from "../../../config";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { formatDateFR, sessions2023 } from "snu-lib";
import { translate } from "../../../utils";
import { ID } from "../../inscription2023/utils";

import DatePickerList from "../../preinscription/components/DatePickerList";
import Error from "../../../components/error";
import Footer from "../../../components/footerV2";
import Help from "../../inscription2023/components/Help";
import Navbar from "../components/Navbar";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import StickyButton from "../../../components/inscription/stickyButton";

export default function StepUpload() {
  const { category } = useParams();
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [files, setFiles] = useState();
  const [date, setDate] = useState();

  async function onSubmit() {
    setLoading(true);
    if (files) {
      for (const file of files) {
        if (file.size > 5000000)
          return setError({
            text: `Ce fichier ${files.name} est trop volumineux.`,
          });
      }
      const res = await api.uploadFile(`/young/${young._id}/documents/cniFiles`, Array.from(files), ID[category].category, new Date(date));
      if (res.code === "FILE_CORRUPTED") {
        setError({
          text: "Le fichier semble corrompu. Pouvez-vous changer le format ou régénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
        });
        setLoading(false);
        return;
      }
      if (!res.ok) {
        capture(res.code);
        setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier.", subText: res.code ? translate(res.code) : "" });
        setLoading(false);
        return;
      }
    }
    const { ok, code, data: responseData } = await api.put("/young/reinscription/documents");
    if (!ok) {
      capture(code);
      setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
      setLoading(false);
      return;
    }
    dispatch(setYoung(responseData));
    plausibleEvent("Phase0/CTA reinscription - CI desktop");
    history.push("/reinscription/done");
  }

  return (
    <>
      <Navbar />
      <div className="bg-white p-4">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="mt-2 flex w-full items-center justify-between">
          <div className="flex-1 text-2xl font-semibold text-gray-800">{ID[category].title}</div>
          <a href={`${supportURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`} target="_blank" rel="noreferrer">
            <QuestionMarkBlueCircle />
          </a>
        </div>
        {ID[category].subtitle && <div className="mb-2 text-xl text-gray-600">{ID[category].subtitle}</div>}
        <div className="my-4 flex w-full items-center justify-center">
          <div className="flex w-3/4 flex-col gap-4">
            <img src={require(`../../../assets/IDProof/${ID[category].imgFront}`)} alt={ID[category].title} />
            {ID[category].imgBack && <img src={require(`../../../assets/IDProof/${ID[category].imgBack}`)} alt={ID[category].title} />}
          </div>
        </div>
        <div className="my-2 border-l-8 border-l-[#6A6AF4] pl-4">
          Toutes les informations doivent être <strong>lisibles</strong>, le document doit être visible <strong>entièrement</strong>, la photo doit être <strong>nette</strong>. Le
          document doit être téléversé en <strong>recto</strong> et <strong>verso</strong>.
        </div>
        <hr className="my-4 h-px border-0 bg-gray-200" />
        <div>Ajouter un fichier</div>
        <div className="mt-4 text-sm text-gray-500">Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf. Plusieurs fichiers possibles.</div>
        <input
          type="file"
          multiple
          id="file-upload"
          name="file-upload"
          accept=".png, .jpg, .jpeg, .pdf"
          onChange={(e) => {
            setFiles(e.target.files);
          }}
          className="hidden"
        />
        <div className="mt-4 flex w-full">
          <div>
            <label htmlFor="file-upload" className="rounded bg-[#EEEEEE] py-2 px-3 text-sm text-gray-600">
              Parcourir...
            </label>
          </div>
          <div className="ml-4">
            {files ? (
              Array.from(files).map((e) => (
                <p className="mt-2 text-sm text-gray-800" key={e.name}>
                  {e.name}
                </p>
              ))
            ) : (
              <div className="mt-2 text-sm text-gray-800">Aucun fichier sélectionné.</div>
            )}
          </div>
        </div>
        {files?.length > 0 && (
          <>
            <hr className="my-8 h-px border-0 bg-gray-200" />
            <div className="text-xl font-medium">Renseignez la date d’expiration</div>
            {young.cohort !== "à venir" && (
              <div className="my-2 leading-loose text-gray-600">
                Votre pièce d’identité doit être valide à votre départ en séjour de cohésion (le {formatDateFR(sessions2023.filter((e) => e.name === young.cohort)[0].dateStart)}
                ).
              </div>
            )}
            <div className="mx-auto w-3/4">
              <img className="mx-auto my-4" src={require(`../../../assets/IDProof/${ID[category].imgDate}`)} alt={ID.title} />
            </div>
            <DatePickerList value={date} onChange={(date) => setDate(date)} />
          </>
        )}
      </div>
      <Help />
      <Footer marginBottom="mb-[88px]" />
      <StickyButton text={loading ? "Scan antivirus en cours" : "Me réinscrire au SNU"} onClick={onSubmit} disabled={!date || loading} />
    </>
  );
}
