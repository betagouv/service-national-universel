import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import Error from "../../../components/error";
import Footer from "../../../components/footerV2";
import StickyButton from "../../../components/inscription/stickyButton";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { translate } from "../../../utils";
import ExpirationDate from "../components/ExpirationDate";
import Help from "../components/Help";
import Navbar from "../components/Navbar";

export default function StepUpload() {
  const { category } = useParams();
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const dispatch = useDispatch();
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState({});
  const [recto, setRecto] = useState();
  const [verso, setVerso] = useState();
  const [filesUploaded, setFilesUploaded] = useState();
  const [date, setDate] = useState();

  async function upload(files) {
    for (const file of files) {
      if (file.size > 5000000)
        return setFileError({
          text: `Ce fichier ${files.name} est trop volumineux.`,
        });
    }
    const res = await api.uploadFile(`/young/${young._id}/documents/cniFiles`, files, ID[category].category, new Date(date));
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
      if (recto) await upload([...recto, ...verso]);
      if (error.length) return setLoading(false);
      const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/next");
      if (!ok) {
        capture(code);
        setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
        setLoading(false);
        return;
      }
      dispatch(setYoung(responseData));
      plausibleEvent("Phase0/CTA inscription - CI mobile");
      history.push("/inscription2023/confirm");
    } catch (e) {
      capture(e);
      setError({
        text: `Une erreur s'est produite`,
        subText: e?.code ? translate(e.code) : "",
      });
    }
    setLoading(false);
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

  useEffect(() => {
    setFilesUploaded(young.files.cniFiles.filter((e) => e.category === category));
  }, [young]);

  return (
    <>
      <Navbar />
      <div className="bg-white p-4">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        {/* <div className="text-2xl font-semibold mt-2 text-gray-800">{ID[category].title}</div>
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
        <hr className="my-4 h-px bg-gray-200 border-0" /> */}

        {!recto && (
          <>
            <div>Scannez le recto du document</div>
            <div className="w-full flex items-center justify-center my-4">
              <div className="w-3/4 flex flex-col gap-4">
                <img src={require(`../../../assets/IDProof/${ID[category].imgFront}`)} alt={ID[category].title} />
              </div>
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
            <div className="flex w-full mt-4">
              <div>
                <label htmlFor="file-upload" className="bg-[#EEEEEE] text-sm py-2 px-3 rounded text-gray-600">
                  Parcourir...
                </label>
              </div>
            </div>
          </>
        )}

        {ID[category].imgBack && recto && !verso && (
          <>
            <div>Scannez le verso du document</div>
            <div className="w-full flex items-center justify-center my-4">
              <div className="w-3/4 flex flex-col gap-4">
                <img src={require(`../../../assets/IDProof/${ID[category].imgBack}`)} alt={ID[category].title} />
              </div>
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
            <div className="flex w-full mt-4">
              <div>
                <label htmlFor="file-upload" className="bg-[#EEEEEE] text-sm py-2 px-3 rounded text-gray-600">
                  Parcourir...
                </label>
              </div>
            </div>
          </>
        )}
        {Object.keys(fileError).length > 0 && <Error {...fileError} onClose={() => setError({})} />}
        {verso && <ExpirationDate ID={ID[category]} date={date} setDate={setDate} />}
      </div>
      <Help />
      <Footer marginBottom="mb-[88px]" />
      <StickyButton text="Continuer" onClickPrevious={() => history.push("/inscription2023/documents")} onClick={onSubmit} disabled={!date && !filesUploaded} />
    </>
  );
}
