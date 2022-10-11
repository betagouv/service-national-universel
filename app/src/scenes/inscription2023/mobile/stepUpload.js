import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Error from "../../../components/error";
import api from "../../../services/api";
import { SENDINBLUE_TEMPLATES, START_DATE_SESSION_PHASE1 } from "snu-lib";
import { appURL } from "../../../config";
import { capture } from "../../../sentry";
import { translate } from "../../../utils";
import { setYoung } from "../../../redux/auth/actions";
import StickyButton from "../../../components/inscription/stickyButton";
import Navbar from "../components/Navbar";
import ExpirationDate from "../components/ExpirationDate";

export default function StepUpload({ step }) {
  const { category } = useParams();
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const dispatch = useDispatch();
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState({});
  const [ID, setID] = useState();
  const [files, setFiles] = useState();
  const [date, setDate] = useState();

  async function upload(files) {
    for (const file of files) {
      if (file.size > 5000000) {
        return setFileError({
          text: `Ce fichier ${files.name} est trop volumineux.`,
        });
      }
    }
    const res = await api.uploadFile(`/young/${young._id}/documents/cniFiles`, files, ID.category, new Date(date));
    if (res.code === "FILE_CORRUPTED") {
      setFileError({
        text: "Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
      });
    } else if (!res.ok) {
      capture(res.code);
      setFileError({ text: "Une erreur s'est produite lors du téléversement de votre fichier" });
    }
  }

  async function onSubmit() {
    setLoading(true);
    try {
      // If ID proof expires before session start, notify parent 1.
      if (new Date(date) < START_DATE_SESSION_PHASE1[young.cohort]) {
        const res = await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.parent.OUTDATED_ID_PROOF}`, {
          cta: `${appURL}/`,
        });
        if (!res.ok) return setFileError({ text: "Votre pièce d'identité ne sera pas valide au début de votre session. Impossible de prévenir votre rprésentant légal." });
      }

      await upload([...files]);
      if (error.length) return setLoading(false);

      const { ok, code, data: responseData } = await api.put(`/young/inscription2023/documents/next`);
      if (!ok) {
        capture(code);
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

  useEffect(() => {
    if (category === "cniNew")
      setID({
        category: "cniNew",
        title: "Carte Nationale d'Identité",
        subtitle: "Nouveau format (après août 2021)",
        imgFront: "cniNewFront.png",
        imgBack: "cniNewBack.png",
        imgDate: "cniNewDate.png",
      });
    if (category === "cniOld")
      setID({
        category: "cniOld",
        title: "Carte Nationale d'Identité",
        subtitle: "Ancien format",
        imgFront: "cniOldFront.png",
        imgBack: "cniOldBack.png",
        imgDate: "cniOldDate.png",
      });
    if (category === "passport") {
      setID({
        category: "passport",
        title: "Passeport",
        imgFront: "passport.png",
        imgDate: "passportDate.png",
      });
    }
  }, []);

  if (!ID) return <div>Loading</div>;
  return (
    <>
      <Navbar step={step} />
      <div className="bg-white p-4">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        {/* <div
          className="mt-2 mb-4"
          onClick={() => {
            setID(null);
            setFiles(null);
          }}>
          <BackArrow />
        </div> */}
        <div className="text-2xl font-semibold mt-2 text-gray-800">{ID.title}</div>
        {ID.subtitle && <div className="text-xl mb-2 text-gray-600">{ID.subtitle}</div>}
        <div className="w-full flex items-center justify-center my-4">
          <div className="w-3/4 flex flex-col gap-4">
            <img src={require(`../../../assets/IDProof/${ID.imgFront}`)} alt={ID.title} />
            {ID.imgBack && <img src={require(`../../../assets/IDProof/${ID.imgBack}`)} alt={ID.title} />}
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
        <label htmlFor="file-upload" className="bg-[#EEEEEE] text-sm py-2 px-3 rounded text-gray-600 mt-4">
          Parcourir...
        </label>
        {files ? (
          Array.from(files).map((e) => (
            <div className="text-gray-800 text-sm mt-2" key={e.name}>
              {e.name}
            </div>
          ))
        ) : (
          <div className="text-gray-800 text-sm mt-2">Aucun fichier sélectionné.</div>
        )}
        {Object.keys(fileError).length > 0 && <Error {...fileError} onClose={() => setError({})} />}
        {files && <ExpirationDate ID={ID} date={date} setDate={setDate} />}
      </div>
      <StickyButton text="Continuer" onClickPrevious={() => history.push("/inscription2023/documents")} onClick={() => onSubmit(files)} disabled={!date || !error || loading} />
    </>
  );
}
