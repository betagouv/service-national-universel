import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Error from "../../../components/error";
import api from "../../../services/api";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";

export default function StepDocuments() {
  const young = useSelector((state) => state.Auth.young);
  const [error, setError] = useState({});
  const [justificatif, setJustificatif] = useState();

  function isFileSupported(fileName) {
    const allowTypes = ["jpg", "jpeg", "png", "pdf"];
    const dotted = fileName.split(".");
    const type = dotted[dotted.length - 1];
    if (!allowTypes.includes(type.toLowerCase())) return false;
    return true;
  }

  async function handleUpload([...newFiles]) {
    for (let index = 0; index < Object.keys(newFiles).length; index++) {
      let i = Object.keys(newFiles)[index];
      if (!isFileSupported(newFiles[i].name))
        setError({
          text: `Le type du fichier ${newFiles[i].name} n'est pas supporté.`,
        });
      if (newFiles[i].size > 5000000)
        return setError({
          text: `Ce fichier ${newFiles[i].name} est trop volumineux.`,
        });
    }
    const path = `/young/${young._id}/documents/cniFiles`;
    const res = await api.uploadFile(`${path}`, newFiles);
    if (res.code === "FILE_CORRUPTED") {
      setError({
        text: "Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
      });
    }
    if (!res.ok) setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier" });
    setJustificatif();
  }

  return (
    <div className="bg-white p-4">
      {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
      <div className="w-full flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Ma pièce d’identité</h1>
        <Link to="/public-besoin-d-aide/">
          <QuestionMarkBlueCircle />
        </Link>
      </div>
      <div className="text-gray-500 text-sm">Choisissez le justificatif d’identité que vous souhaitez importer.</div>
      <hr className="my-4 h-px bg-gray-200 border-0" />
      {justificatif ? (
        <>
          <div className="w-full border p-4 space-y-4">
            <div>Téléversez votre {justificatif}</div>
            <div className="text-gray-500 text-sm">Taille maximale : 500 Mo. Formats supportés : jpg, pmg, pdf. Plusieurs fichiers possibles.</div>
            <input
              type="file"
              multiple
              id="file-upload"
              name="file-upload"
              onChange={(e) => {
                handleUpload(e.target.files);
              }}
            />
          </div>
          <div
            className="my-4 text-blue-600 hover:text-blue-400 underline underline-offset-4"
            onClick={() => {
              setJustificatif();
            }}>
            Retour au choix du document
          </div>
        </>
      ) : (
        <>
          <div className="my-4">
            <div
              className="border p-4 my-3 flex justify-between items-center"
              onClick={() => {
                setJustificatif("carte d’identité (nouveau format)");
              }}>
              <div>
                <div>Carte nationale d’identité</div>
                <div className="text-gray-500 text-sm">Nouveau format (après août 2021)</div>
              </div>
              <ArrowRightBlueSquare />
            </div>
          </div>
          <div className="my-4">
            <div
              className="border p-4 my-3 flex justify-between items-center"
              onClick={() => {
                setJustificatif("carte d’identité (ancien format)");
              }}>
              <div>
                <div>Carte nationale d’identité</div>
                <div className="text-gray-500 text-sm">Ancien format</div>
              </div>
              <ArrowRightBlueSquare />
            </div>
          </div>
          <div className="my-4">
            <div
              className="border p-4 my-3 flex justify-between items-center"
              onClick={() => {
                setJustificatif("passeport");
              }}>
              <div>
                <div>Passeport</div>
              </div>
              <ArrowRightBlueSquare />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
