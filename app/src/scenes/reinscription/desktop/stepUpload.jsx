import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { translate } from "../../../utils";
import { ID } from "../../inscription2023/utils";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [files, setFiles] = useState({});
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
    <DesktopPageContainer
      title={ID[category].title}
      subTitle={ID[category].subTitle}
      onSubmit={onSubmit}
      childrenContinueButton={"Me réinscrire au SNU"}
      disabled={!date}
      loading={loading}
      questionMarckLink={`${supportURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`}>
      {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
      <div className="my-16 flex w-full justify-around">
        <img className="h-64" src={require(`../../../assets/IDProof/${ID[category].imgFront}`)} alt={ID[category].title} />
        {ID[category].imgBack && <img className="h-64" src={require(`../../../assets/IDProof/${ID[category].imgBack}`)} alt={ID[category].title} />}
      </div>
      <div className="border-l-8 border-l-[#6A6AF4] pl-8 leading-loose">
        Toutes les informations doivent être <strong>lisibles</strong>, le document doit être visible <strong>entièrement</strong>, la photo doit être <strong>nette</strong>. Le
        document doit être téléversé en <strong>recto</strong> et <strong>verso</strong>.
      </div>
      <hr className="my-8 h-px border-0 bg-gray-200" />
      <div>Ajouter un fichier</div>
      <div className="my-4 text-sm text-gray-500">Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf. Plusieurs fichiers possibles.</div>
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
      <div className="my-4 flex w-full">
        <div>
          <label htmlFor="file-upload" className="cursor-pointer rounded bg-[#EEEEEE] py-2 px-3 text-sm text-gray-600">
            Parcourir...
          </label>
        </div>
        <div className="ml-4 mt-2">
          {files.length ? (
            Array.from(files).map((e) => (
              <p className="text-sm text-gray-800" key={e.name}>
                {e.name}
              </p>
            ))
          ) : (
            <div className="text-sm text-gray-800">Aucun fichier sélectionné.</div>
          )}
        </div>
      </div>
      <div className="my-4 text-sm text-gray-800">
        Vous avez besoin d’aide pour téléverser les documents ?{" "}
        <a href="https://support.snu.gouv.fr/base-de-connaissance/je-televerse-un-document/" className="underline">
          Cliquez ici
        </a>
        .
      </div>
      {files.length > 0 && (
        <>
          <hr className="my-8 h-px border-0 bg-gray-200" />
          <div className="flex w-full">
            <div className="w-1/2">
              <div className="text-xl font-medium">Renseignez la date d’expiration</div>
              {young.cohort !== "à venir" && (
                <div className="mt-2 mb-8 leading-loose text-gray-600">
                  Votre pièce d’identité doit être valide à votre départ en séjour de cohésion (le {formatDateFR(sessions2023.filter((e) => e.name === young.cohort)[0].dateStart)}
                  ).
                </div>
              )}
              <p className="text-gray-800">Date d&apos;expiration</p>
              <DatePickerList value={date} onChange={(date) => setDate(date)} />
            </div>
            <div className="w-1/2">
              <img className="mx-auto h-32" src={require(`../../../assets/IDProof/${ID[category].imgDate}`)} alt={ID.title} />
            </div>
          </div>
        </>
      )}
    </DesktopPageContainer>
  );
}
