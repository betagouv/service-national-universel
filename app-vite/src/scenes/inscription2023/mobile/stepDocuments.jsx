import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { supportURL } from "../../../config";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { translate, translateCorrectionReason, translateField, YOUNG_STATUS } from "snu-lib";
import { capture } from "../../../sentry";
import api from "../../../services/api";

import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import Error from "../../../components/error";
import Footer from "../../../components/footerV2";
import Help from "../components/Help";
import Navbar from "../components/Navbar";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import StickyButton from "../../../components/inscription/stickyButton";
import MyDocs from "../components/MyDocs";
import ErrorMessage from "../components/ErrorMessage";
import Info from "../../../components/info";

export default function StepDocuments() {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);
  const [error, setError] = useState({});
  const corrections = young?.correctionRequests?.filter((e) => ["cniFile", "latestCNIFileExpirationDate"].includes(e.field) && ["SENT", "REMINDED"].includes(e.status));
  const disabledUpload = young?.files.cniFiles.length > 2;

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

  const disabled = !young?.files?.cniFiles?.length || !young?.latestCNIFileExpirationDate;

  async function onSubmit() {
    const { ok, code, data: responseData } = await api.put("/young/inscription2023/documents/next", { date: young.latestCNIFileExpirationDate });
    if (!ok) {
      capture(code);
      setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
      return;
    }
    dispatch(setYoung(responseData));
    history.push("/inscription2023/confirm");
  }

  function handleClick(doc) {
    if (!disabledUpload) history.push(`televersement/${doc.category}`);
  }

  if (young?.status === YOUNG_STATUS.WAITING_CORRECTION && corrections?.length === 0) return <Redirect to="/" />;
  if (corrections?.some((e) => ["MISSING_FRONT", "MISSING_BACK"].includes(e.reason))) return <Redirect to="televersement" />;
  if (corrections?.some((e) => e.field === "latestCNIFileExpirationDate") && young?.files.cniFiles.length) return <Redirect to="televersement" />;
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
        <div className="my-4">
          {corrections?.map((e) => (
            <ErrorMessage key={e._id}>
              <strong>{translateCorrectionReason(e.reason) || translateField(e.field)}</strong>
              {e.message && ` : ${e.message}`}
            </ErrorMessage>
          ))}
        </div>
        <div className="text-gray-800 mt-2 text-sm">Choisissez le justificatif d’identité que vous souhaitez importer :</div>
        {IDs.map((doc) => (
          <div
            key={doc.category}
            className={`my-4 bg-[#FFFFFF] hover:bg-[#FAFAFA] cursor-pointer ${disabledUpload && "bg-[#FAFAFA] cursor-default"}`}
            onClick={() => handleClick(doc)}>
            <div className="border p-4 my-3 flex justify-between items-center">
              <div>
                <div>{doc.title}</div>
                {doc.subtitle && <div className="text-gray-500 text-sm">{doc.subtitle}</div>}
              </div>
              <ArrowRightBlueSquare fill={disabledUpload ? "gray" : "#000091"} />
            </div>
          </div>
        ))}
        {disabledUpload && (
          <Info text="Vous ne pouvez téléverser que trois fichiers maximum." subText="Si vous devez en ajouter un, merci de supprimer d'abord un document ci-dessous." />
        )}
        <MyDocs />
      </div>
      <Help />
      <Footer marginBottom="mb-[88px]" />
      <StickyButton text="Continuer" onClickPrevious={() => history.push("/inscription2023/representants")} onClick={onSubmit} disabled={disabled} />
    </>
  );
}
