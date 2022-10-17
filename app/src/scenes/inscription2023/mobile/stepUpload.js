import React, { useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
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
  const [recto, setRecto] = useState();
  const [verso, setVerso] = useState();
  const [checked, setChecked] = useState({ lisible: false, coupe: false, nette: false });
  const [date, setDate] = useState();

  async function upload(files) {
    for (const file of files) {
      if (file.size > 5000000)
        return setError({
          text: `Ce fichier ${files.name} est trop volumineux.`,
        });
    }
    const res = await api.uploadFile(`/young/${young._id}/documents/cniFiles`, files, ID[category].category, new Date(date));
    if (res.code === "FILE_CORRUPTED") {
      setError({
        text: "Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
      });
    } else if (!res.ok) {
      capture(res.code);
      setError({ text: "Une erreur s'est produite lors du téléversement de votre fichier" });
    }
  }

  async function onSubmit() {
    try {
      if (verso) await upload([...recto, ...verso]);
      else await upload([...recto]);
      if (error.length) return;
      const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/next");
      if (!ok) {
        capture(code);
        setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
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
              <label htmlFor="file-upload" className="bg-[#EEEEEE] text-sm py-2 px-3 rounded text-gray-600">
                Scanner
              </label>
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
              <label htmlFor="file-upload" className="bg-[#EEEEEE] text-sm py-2 px-3 rounded text-gray-600">
                Scanner
              </label>
            </div>
          </>
        )}
        {((ID[category].imgBack && verso) || (!ID[category].imgBack && recto)) && (
          <>
            {checked.lisible === true && checked.coupe === true && checked.nette === true ? (
              <ExpirationDate ID={ID[category]} date={date} setDate={setDate} />
            ) : (
              <>
                <div className="w-full flex items-center justify-center mb-4">
                  <div className="w-3/4 flex flex-col gap-4">
                    <img src={URL.createObjectURL(recto[0])} className="border" />
                    {verso && <img src={URL.createObjectURL(verso[0])} className="border" />}
                  </div>
                </div>
                <p className="text-lg text-gray-800 font-semibold my-2">Vérifiez les points suivants :</p>
                <label>
                  <input type="checkbox" checked={checked.lisible} onChange={() => setChecked((prev) => ({ ...prev, lisible: !checked.lisible }))} className="mr-2" />
                  Toutes les informations sont <strong>lisibles</strong>
                </label>
                <label>
                  <input type="checkbox" checked={checked.coupe} onChange={() => setChecked((prev) => ({ ...prev, coupe: !checked.coupe }))} className="mr-2" />
                  Le document n&apos;est <strong>pas coupé</strong>
                </label>
                <label>
                  <input type="checkbox" checked={checked.nette} onChange={() => setChecked((prev) => ({ ...prev, nette: !checked.nette }))} className="mr-2" />
                  La photo est <strong>nette</strong>
                </label>
                <div className="flex w-full space-x-2 mt-2">
                  <button
                    className="w-1/2 flex items-center justify-center border-[1px] border-[#000091] p-2"
                    onClick={() => {
                      setRecto();
                      setVerso();
                    }}>
                    <FiChevronLeft className="text-[#000091] font-bold" />
                    <span className="text-[#000091] ml-2">Reprendre</span>
                  </button>
                  {/* <button
                    className={`flex items-center justify-center p-2 w-1/2 cursor-pointer ${disabled ? "bg-[#E5E5E5] text-[#929292]" : "bg-[#000091] text-white"}`}
                    onClick={() => !disabled && onClick()}>
                    Continuer
                  </button> */}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <Help />
      <Footer marginBottom="mb-[88px]" />
      <StickyButton text="Continuer" onClickPrevious={() => history.push("/inscription2023/documents")} onClick={onSubmit} disabled={!date} />
    </>
  );
}
