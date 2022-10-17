import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { translate } from "../../../utils";
import { supportURL } from "../../../config";

import DesktopPageContainer from "../components/DesktopPageContainer";
import Error from "../../../components/error";
import ExpirationDate from "../components/ExpirationDate";
import plausibleEvent from "../../../services/plausible";

export default function StepUpload() {
  const { category } = useParams();
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const dispatch = useDispatch();
  const [error, setError] = useState({});
  const [files, setFiles] = useState({});
  const [date, setDate] = useState();

  async function onSubmit() {
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
      return setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier" });
    }
    const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/next");
    if (!ok) {
      capture(code);
      return setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
    }
    dispatch(setYoung(responseData));
    plausibleEvent("Phase0/CTA inscription - CI mobile");
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
    <DesktopPageContainer
      title={ID[category].title}
      subTitle={ID[category].subTitle}
      onClickPrevious={() => history.push("/inscription2023/documents")}
      onSubmit={onSubmit}
      disabled={!date}
      questionMarckLink={`${supportURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`}>
      <div className="bg-white p-4">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="w-full flex mb-4">
          <div className="flex align-center items-center">
            <img className={`${ID[category].imgBack ? "w-1/4" : "w-1/2"} px-4`} src={require(`../../../assets/IDProof/${ID[category].imgFront}`)} alt={ID[category].title} />
            {ID[category].imgBack && <img className="w-1/4 px-4" src={require(`../../../assets/IDProof/${ID[category].imgBack}`)} alt={ID[category].title} />}
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
            <label htmlFor="file-upload" className="cursor-pointer bg-[#EEEEEE] text-sm py-2 px-3 rounded text-gray-600">
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
        {files.length > 0 && <ExpirationDate ID={ID[category]} date={date} setDate={setDate} />}
      </div>
    </DesktopPageContainer>
  );
}
