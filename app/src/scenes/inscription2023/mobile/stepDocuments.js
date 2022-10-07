import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Error from "../../../components/error";
import api from "../../../services/api";
import { SENDINBLUE_TEMPLATES, START_DATE_SESSION_PHASE1 } from "snu-lib";
import { appURL } from "../../../config";
import { capture } from "../../../sentry";
import { translate } from "../../../utils";
import { setYoung } from "../../../redux/auth/actions";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import DatePickerList from "../../preinscription/components/DatePickerList";
import StickyButton from "../../../components/inscription/stickyButton";

export default function StepDocuments() {
  const young = useSelector((state) => state.Auth.young);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [IDProof, setIDProof] = useState();
  const [files, setFiles] = useState();
  const [date, setDate] = useState();
  const history = useHistory();
  const dispatch = useDispatch();

  function isFileSupported(fileName) {
    const allowTypes = ["jpg", "jpeg", "png", "pdf"];
    const dotted = fileName.split(".");
    const type = dotted[dotted.length - 1];
    if (!allowTypes.includes(type.toLowerCase())) return false;
    return true;
  }

  const IDs = [
    {
      id: "cniNew",
      title: "Carte d'identité",
      subtitle: "Nouveau format (après août 2021)",
      imgFront: "cniNewFront.png",
      imgBack: "cniNewBack.png",
      imgDate: "cniNewDate.png",
    },
    {
      id: "cniOld",
      title: "Carte d'identité",
      subtitle: "Ancien format",
      imgFront: "cniOldFront.png",
      imgBack: "cniOldBack.png",
      imgDate: "cniOldDate.png",
    },
    {
      id: "cniNew",
      title: "Passeport",
      imgFront: "passport.png",
      imgDate: "passportDate.png",
    },
  ];

  async function onSubmit([...files]) {
    setLoading(true);
    try {
      // Check expiration date
      if (date > START_DATE_SESSION_PHASE1[young.cohort]) {
        await api.post(`/inscription2023/${young._id}/emailtoparent/${SENDINBLUE_TEMPLATES.young.OUTDATED_ID_PROOF}`, {
          cta: `${appURL}/`,
        });
      }

      // Upload file(s)
      for (let index = 0; index < Object.keys(files).length; index++) {
        let i = Object.keys(files)[index];
        if (!isFileSupported(files[i].name))
          setError({
            text: `Le type du fichier ${files[i].name} n'est pas supporté.`,
          });
        if (files[i].size > 5000000)
          return setError({
            text: `Ce fichier ${files[i].name} est trop volumineux.`,
          });
      }
      const path = `/young/${young._id}/documents/cniFiles`;
      const res = await api.uploadFile(`${path}`, files, IDProof.id, date);
      if (res.code === "FILE_CORRUPTED") {
        setError({
          text: "Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
        });
      }
      if (!res.ok) setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier" });

      // Continue
      const { ok, code, data: responseData } = await api.put(`/young/inscription2023/documents/next`);
      if (!ok) {
        setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
        setLoading(false);
        return;
      }
      dispatch(setYoung(responseData));
      history.push("/inscription2023/done");
    } catch (e) {
      capture(e);
      setError({
        text: `Une erreur s'est produite`,
        subText: e?.code ? translate(e.code) : "",
      });
    }

    setLoading(false);
  }

  return (
    <>
      <div className="bg-white p-4">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}

        {/* Choix de la piece d'identite */}
        {!IDProof && (
          <>
            <div className="w-full flex justify-between items-center">
              <h1 className="text-2xl font-semibold">Ma pièce d’identité</h1>
              <Link to="/public-besoin-d-aide/">
                <QuestionMarkBlueCircle />
              </Link>
            </div>
            <div className="text-gray-500 text-sm">Choisissez le justificatif d’identité que vous souhaitez importer.</div>
            <hr className="my-4 h-px bg-gray-200 border-0" />
            {IDs.map((id) => (
              <div className="my-4" key={id.id}>
                <div
                  className="border p-4 my-3 flex justify-between items-center"
                  onClick={() => {
                    setIDProof(id);
                  }}>
                  <div>
                    <div>{id.title}</div>
                    {id.subtitle && <div className="text-gray-500 text-sm">{id.subtitle}</div>}
                  </div>
                  <ArrowRightBlueSquare />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Upload du fichier */}
        {IDProof && (
          <>
            <div className="text-2xl font-semibold mt-2 text-gray-800">{IDProof.title}</div>
            {IDProof.subtitle && <div className="text-xl font-semibold mb-2 text-gray-800">{IDProof.subtitle}</div>}
            <div className="w-full flex items-center justify-center my-4">
              <div className="w-3/4 flex flex-col gap-4">
                <img src={require(`../../../assets/IDProof/${IDProof.imgFront}`)} />
                {IDProof.imgBack && <img src={require(`../../../assets/IDProof/${IDProof.imgBack}`)} />}
              </div>
            </div>
            <div className="my-2 border-l-4 border-l-blue-600 pl-4">
              Toutes les informations doivent être <strong>lisibles</strong>, le document doit être visible <strong>entièrement</strong>, la photo doit être <strong>nette</strong>.
              Le document doit être téléversé en <strong>recto</strong> et <strong>verso</strong>.
            </div>
            <hr className="my-4 h-px bg-gray-200 border-0" />
            <div>Ajouter un fichier</div>
            <div className="text-gray-500 text-sm mt-4">Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf. Plusieurs fichiers possibles.</div>
            <input
              type="file"
              multiple
              id="file-upload"
              name="file-upload"
              onChange={(e) => {
                setFiles(e.target.files);
              }}
              className="hidden"
            />
            <div className="flex mt-4">
              <label htmlFor="file-upload" className="bg-[#EEEEEE] text-sm p-2 h-10 rounded text-gray-600">
                Parcourir...
              </label>
              {files && <div className="text-gray-500 text-sm p-2 ml-2">{files.item(0).name}</div>}
            </div>
          </>
        )}

        {/* Date d'expiration */}
        {files && (
          <>
            <hr className="my-4 h-px bg-gray-200 border-0" />
            <div className="text-2xl font-semibold">Renseignez la date d’expiration</div>
            <div className="text-gray-500 text-sm">Votre pièce d’identité doit être valide à votre départ en séjour de cohésion.</div>
            <div className="w-full flex items-center justify-center my-4">
              <div className="w-3/4 flex flex-col gap-4">
                <img src={require(`../../../assets/IDProof/${IDProof.imgDate}`)} />
              </div>
            </div>
            <div className="flex flex-col flex-start my-4">
              <DatePickerList title="" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </>
        )}
      </div>
      <StickyButton text="Continuer" onClickPrevious={() => history.push("/inscription2023/representants")} onClick={() => onSubmit(files)} disabled={!date || loading} />
    </>
  );
}
