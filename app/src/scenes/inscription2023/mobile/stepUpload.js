import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { useHistory, useParams } from "react-router-dom";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { translate } from "../../../utils";
import { supportURL } from "../../../config";
import { formatDateFR, sessions2023 } from "snu-lib";

import DatePickerList from "../../preinscription/components/DatePickerList";
import Help from "../components/Help";
import Navbar from "../components/Navbar";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import Error from "../../../components/error";
import Footer from "../../../components/footerV2";
import StickyButton from "../../../components/inscription/stickyButton";

export default function StepUpload() {
  const { category } = useParams();
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const dispatch = useDispatch();
  const [error, setError] = useState({});
  const [files, setFiles] = useState();
  const [date, setDate] = useState();

  async function onSubmit() {
    for (const file of files) {
      if (file.size > 5000000)
        return setError({
          text: `Ce fichier ${files.name} est trop volumineux.`,
        });
    }
    const res = await api.uploadFile(`/young/${young._id}/documents/cniFiles`, Array.from(files), ID[category].category, date);
    if (res.code === "FILE_CORRUPTED")
      return setError({
        text: "Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
      });
    if (!res.ok) {
      capture(res.code);
      return setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier" });
    }
    const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/next");
    if (!ok) {
      capture(code);
      return setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
    }
    dispatch(setYoung(responseData));
    // plausibleEvent("Phase0/CTA inscription - CI mobile"); On désactive en attendant la V2.
    history.push("/inscription2023/confirm");
  }

  const ID = {
    cniNew: {
      category: "cniNew",
      title: "Carte Nationale d'Identité",
      subtitle: "Nouveau format (après août 2021)",
      imgFront: "cniNewFront.png",
      imgBack: "cniNewBack.png",
      imgDate: "cniNewDate.png",
    },
    cniOld: {
      category: "cniOld",
      title: "Carte Nationale d'Identité",
      subtitle: "Ancien format",
      imgFront: "cniOldFront.png",
      imgBack: "cniOldBack.png",
      imgDate: "cniOldDate.png",
    },
    passport: {
      category: "passport",
      title: "Passeport",
      imgFront: "passport.png",
      imgDate: "passportDate.png",
    },
  };

  return (
    <>
      <Navbar />
      <div className="bg-white p-4">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="w-full flex justify-between items-center mt-2">
          <div className="text-2xl font-semibold text-gray-800 flex-1">{ID[category].title}</div>
          <a href={`${supportURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`} target="_blank" rel="noreferrer">
            <QuestionMarkBlueCircle />
          </a>
        </div>
        {ID[category].subtitle && <div className="text-xl mb-2 text-gray-600">{ID[category].subtitle}</div>}
        <div className="w-full flex items-center justify-center my-4">
          <div className="w-3/4 flex flex-col gap-4">
            <img src={require(`../../../assets/IDProof/${ID[category].imgFront}`)} alt={ID[category].title} />
            {ID[category].imgBack && <img src={require(`../../../assets/IDProof/${ID[category].imgBack}`)} alt={ID[category].title} />}
          </div>
        </div>
        <div className="my-2 border-l-8 border-l-[#6A6AF4] pl-4">
          Toutes les informations doivent être <strong>lisibles</strong>, le document doit être visible <strong>entièrement</strong>, la photo doit être <strong>nette</strong>. Le
          document doit être téléversé en <strong>recto</strong> et <strong>verso</strong>.
        </div>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <div>Ajouter un fichier</div>
        <div className="text-gray-500 text-sm mt-4">Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf. Plusieurs fichiers possibles.</div>
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
        <div className="flex w-full mt-4">
          <div>
            <label htmlFor="file-upload" className="bg-[#EEEEEE] text-sm py-2 px-3 rounded text-gray-600">
              Parcourir...
            </label>
          </div>
          <div className="ml-4">
            {files ? (
              Array.from(files).map((e) => (
                <p className="text-gray-800 text-sm mt-2" key={e.name}>
                  {e.name}
                </p>
              ))
            ) : (
              <div className="text-gray-800 text-sm mt-2">Aucun fichier sélectionné.</div>
            )}
          </div>
        </div>
        {files?.length > 0 && (
          <>
            <hr className="my-8 h-px bg-gray-200 border-0" />
            <div className="text-xl font-medium">Renseignez la date d’expiration</div>
            <div className="text-gray-600 leading-loose my-2">
              Votre pièce d’identité doit être valide à votre départ en séjour de cohésion (le {formatDateFR(sessions2023.filter((e) => e.name === young.cohort)[0].dateStart)}
              ).
            </div>
            <div className="w-3/4 mx-auto">
              <img className="mx-auto my-4" src={require(`../../../assets/IDProof/${ID[category].imgDate}`)} alt={ID.title} />
            </div>
            <DatePickerList value={date} onChange={(date) => setDate(date)} />
          </>
        )}
      </div>
      <Help />
      <Footer marginBottom="mb-[88px]" />
      <StickyButton text="Continuer" onClickPrevious={() => history.push("/inscription2023/documents")} onClick={onSubmit} disabled={!date} />
    </>
  );
}
