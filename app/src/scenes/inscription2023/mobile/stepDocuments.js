import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { supportURL } from "../../../config";
import { useDispatch, useSelector } from "react-redux";
import { capture } from "../../../sentry";
import { translate } from "snu-lib";
import { setYoung } from "../../../redux/auth/actions";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import Navbar from "../components/Navbar";
import StickyButton from "../../../components/inscription/stickyButton";
import Footer from "../../../components/footerV2";
import Help from "../components/Help";
import Bin from "../../../assets/icons/Bin";
import api from "../../../services/api";
import Error from "../../../components/error";

export default function StepDocuments() {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);
  const [filesUploaded, setFilesUploaded] = useState();
  console.log("🚀 ~ file: stepDocuments.js ~ line 23 ~ StepDocuments ~ filesUploaded", filesUploaded);
  const [error, setError] = useState({});

  useEffect(() => {
    setFilesUploaded(young.files.cniFiles);
  }, [young]);

  async function deleteFile(fileId) {
    try {
      const res = await api.remove(`/young/${young._id}/documents/cniFiles/${fileId}`);
      if (!res.ok) setError({ text: "Wesh" });
      setFilesUploaded(res.data);
    } catch (e) {
      capture(e);
      setError({ text: "Impossible de supprimer ce fichier." });
    }
  }

  const IDs = [
    {
      category: "cniNew",
      title: "Carte Nationale d'Identité",
      subtitle: "Nouveau format (après août 2021)",
    },
    {
      category: "cniOld",
      title: "Carte Nationale d'Identité",
      subtitle: "Ancien format",
    },
    {
      category: "passport",
      title: "Passeport",
    },
  ];

  async function onSubmit() {
    const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/next");
    if (!ok) {
      capture(code);
      setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
      return;
    }
    dispatch(setYoung(responseData));
    history.push("/inscription2023/confirm");
  }

  return (
    <>
      <Navbar />
      <div className="bg-white p-4">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Ma pièce d’identité</h1>
          <a href={`${supportURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`} target="_blank" rel="noreferrer">
            <QuestionMarkBlueCircle />
          </a>
        </div>
        <div className="text-gray-800 mt-2 text-sm">Choisissez le justificatif d’identité que vous souhaitez importer :</div>
        {IDs.map((id) => (
          <Link key={id.category} to={`televersement/${id.category}`}>
            <div className="my-4">
              <div className="border p-4 my-3 flex justify-between items-center">
                <div>
                  <div>{id.title}</div>
                  {id.subtitle && <div className="text-gray-500 text-sm">{id.subtitle}</div>}
                </div>
                <ArrowRightBlueSquare />
              </div>
            </div>
          </Link>
        ))}
        {filesUploaded?.length > 0 && (
          <>
            <h2 className="text-base text-gray-800 font-semibold my-2">Documents en ligne&nbsp;:</h2>
            <div className="space-y-2">
              {filesUploaded.map((e) => (
                <div key={e._id} className="flex w-full justify-between">
                  <div className="w-2/3">
                    <p className="text-gray-800 text-sm truncate">{e.name}</p>
                    <p className="text-gray-600 text-xs truncate">{translate(e.category)}</p>
                  </div>
                  <div className="text-blue-800 flex">
                    <div className="mt-1 mr-1">
                      <Bin />
                    </div>
                    <p className="text-sm font-medium" onClick={() => deleteFile(e._id)}>
                      Supprimer
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Help />
      <Footer marginBottom="mb-[88px]" />
      <StickyButton text="Continuer" onClickPrevious={() => history.push("/inscription2023/representants")} onClick={onSubmit} disabled={filesUploaded?.length === 0} />
    </>
  );
}
