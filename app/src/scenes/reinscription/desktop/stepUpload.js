import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { translate } from "../../../utils";
import { supportURL } from "../../../config";
import { formatDateFR, sessions2023 } from "snu-lib";

import DatePickerList from "../../preinscription/components/DatePickerList";
import DesktopPageContainer from "../../inscription2023/components/DesktopPageContainer";
import Error from "../../../components/error";
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
        text: "Le fichier semble corrompu. Pouvez-vous changer le format ou régénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
      });
    if (!res.ok) {
      capture(res.code);
      return setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier." });
    }
    const { ok, code, data: responseData } = await api.put("/young/reinscription/documents");
    if (!ok) {
      capture(code);
      return setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
    }
    dispatch(setYoung(responseData));
    plausibleEvent("Phase0/CTA reinscription - CI mobile");
    history.push("/reinscription/done");
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
      <DesktopPageContainer
        title={ID[category].title}
        subTitle={ID[category].subTitle}
        onClickPrevious={() => history.push("/reinscription/documents")}
        onSubmit={onSubmit}
        disabled={!date}
        questionMarckLink={`${supportURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`}>
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="w-full my-16 flex justify-around">
          <img className="h-64" src={require(`../../../assets/IDProof/${ID[category].imgFront}`)} alt={ID[category].title} />
          {ID[category].imgBack && <img className="h-64" src={require(`../../../assets/IDProof/${ID[category].imgBack}`)} alt={ID[category].title} />}
        </div>
        <div className="border-l-8 border-l-[#6A6AF4] pl-8 leading-loose">
          Toutes les informations doivent être <strong>lisibles</strong>, le document doit être visible <strong>entièrement</strong>, la photo doit être <strong>nette</strong>. Le
          document doit être téléversé en <strong>recto</strong> et <strong>verso</strong>.
        </div>
        <hr className="my-8 h-px bg-gray-200 border-0" />
        <div>Ajouter un fichier</div>
        <div className="text-gray-500 text-sm my-4">Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf. Plusieurs fichiers possibles.</div>
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
        <div className="flex w-full my-4">
          <div>
            <label htmlFor="file-upload" className="cursor-pointer bg-[#EEEEEE] text-sm py-2 px-3 rounded text-gray-600">
              Parcourir...
            </label>
          </div>
          <div className="ml-4 mt-2">
            {files.length ? (
              Array.from(files).map((e) => (
                <p className="text-gray-800 text-sm" key={e.name}>
                  {e.name}
                </p>
              ))
            ) : (
              <div className="text-gray-800 text-sm">Aucun fichier sélectionné.</div>
            )}
          </div>
        </div>
        <div className="text-gray-800 text-sm my-4">
          Vous avez besoin d’aide pour téléverser les documents ?{" "}
          <a href="https://support.snu.gouv.fr/base-de-connaissance/je-televerse-un-document/" className="underline">
            Cliquez ici
          </a>
          .
        </div>
        {files.length > 0 && (
          <>
            <hr className="my-8 h-px bg-gray-200 border-0" />
            <div className="w-full flex">
              <div className="w-1/2">
                <div className="text-xl font-medium">Renseignez la date d’expiration</div>
                <div className="text-gray-600 leading-loose mt-2 mb-8">
                  Votre pièce d’identité doit être valide à votre départ en séjour de cohésion (le {formatDateFR(sessions2023.filter((e) => e.name === young.cohort)[0].dateStart)}
                  ).
                </div>
                <p className="text-gray-800">Date d&apos;expiration</p>
                <DatePickerList value={date} onChange={(date) => setDate(date)} />
              </div>
              <div className="w-1/2">
                <img className="h-32 mx-auto" src={require(`../../../assets/IDProof/${ID[category].imgDate}`)} alt={ID.title} />
              </div>
            </div>
          </>
        )}
      </DesktopPageContainer>
    </>
  );
}
