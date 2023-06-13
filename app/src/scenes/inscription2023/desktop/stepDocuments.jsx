import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { supportURL } from "../../../config";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { translate, translateCorrectionReason, translateField, YOUNG_STATUS } from "snu-lib";

import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import DesktopPageContainer from "../components/DesktopPageContainer";
import Error from "../../../components/error";
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

  const docs = [
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

  if (young?.status === YOUNG_STATUS.WAITING_CORRECTION && corrections?.length === 0) return <Redirect to="/" />;
  if (corrections?.some((e) => ["MISSING_FRONT", "MISSING_BACK"].includes(e.reason))) return <Redirect to="televersement" />;
  if (corrections?.some((e) => e.field === "latestCNIFileExpirationDate") && young?.files.cniFiles.length) return <Redirect to="televersement" />;
  return (
    <DesktopPageContainer
      title="Ma pièce d’identité"
      subTitle="Choisissez le justificatif d’identité que vous souhaitez importer :"
      onClickPrevious={() => history.push("/inscription2023/representants")}
      onSubmit={onSubmit}
      disabled={!young?.files.cniFiles.length > 0 || corrections?.length > 0}
      questionMarckLink={`${supportURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`}>
      {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
      {corrections?.map((e) => (
        <ErrorMessage key={e._id}>
          <strong>{translateCorrectionReason(e.reason) || translateField(e.field)}</strong>
          {e.message && ` : ${e.message}`}
        </ErrorMessage>
      ))}
      {docs.map((doc) => (
        <div
          key={doc.category}
          className={`my-4 cursor-pointer bg-[#FFFFFF] hover:bg-[#FAFAFA] ${disabledUpload && "cursor-default bg-[#FAFAFA]"}`}
          onClick={() => handleClick(doc)}>
          <div className="my-3 flex items-center justify-between border p-4">
            <div>
              <div>{doc.title}</div>
              {doc.subtitle && <div className="text-sm text-gray-500">{doc.subtitle}</div>}
            </div>
            <ArrowRightBlueSquare fill={disabledUpload ? "gray" : "#000091"} />
          </div>
        </div>
      ))}
      {disabledUpload && (
        <Info text="Vous ne pouvez téléverser que trois fichiers maximum." subText="Si vous devez en ajouter un, merci de supprimer d'abord un document ci-dessous." />
      )}
      <MyDocs />
    </DesktopPageContainer>
  );
}
