import React, { useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { knowledgebaseURL } from "../../../config";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { translate, translateCorrectionReason, translateField, YOUNG_STATUS } from "snu-lib";
import { capture } from "../../../sentry";
import api from "../../../services/api";

import { RiArrowRightLine } from "react-icons/ri";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import Error from "../../../components/error";
import ErrorMessage from "../../../components/dsfr/forms/ErrorMessage";
import MyDocs from "../components/MyDocs";
import Info from "../../../components/info";
import plausibleEvent from "@/services/plausible";
import { SignupButtons } from "@snu/ds/dsfr";

export default function StepDocuments() {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);
  const [error, setError] = useState({});
  const corrections = young?.correctionRequests?.filter(
    (correction) => ["cniFile", "latestCNIFileExpirationDate", "latestCNIFileCategory"].includes(correction.field) && ["SENT", "REMINDED"].includes(correction.status),
  );
  const disabledUpload = young?.files?.cniFiles?.length > 2;

  const IDs = [
    {
      category: "cniNew",
      title: "Carte Nationale d'Identité",
      subtitle: "Nouveau format (après août 2021)",
      event: "Phase0/CTA inscription - nouvelle CI",
    },
    {
      category: "cniOld",
      title: "Carte Nationale d'Identité",
      subtitle: "Ancien format",
      event: "Phase0/CTA inscription - ancienne CI",
    },
    {
      category: "passport",
      title: "Passeport",
      event: "Phase0/CTA inscription - passeport",
    },
  ];

  const disabled = !young?.files?.cniFiles?.length || !young?.latestCNIFileExpirationDate || !young?.latestCNIFileCategory;

  async function onSubmit() {
    const {
      ok,
      code,
      data: responseData,
    } = await api.put("/young/inscription2023/documents/next", { date: young.latestCNIFileExpirationDate, latestCNIFileCategory: young?.latestCNIFileCategory });
    if (!ok) {
      capture(new Error(code));
      setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
      return;
    }
    dispatch(setYoung(responseData));
    history.push("/inscription/confirm");
  }

  function handleClick(doc) {
    if (!disabledUpload) {
      plausibleEvent(doc.event);
      history.push(`televersement/${doc.category}`);
    }
  }

  function goBack() {
    return history.push("/inscription/representants");
  }

  const supportLink = `${knowledgebaseURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`;

  if (young?.status === YOUNG_STATUS.WAITING_CORRECTION) {
    if (corrections?.length === 0) return <Redirect to="/" />;
    // if (corrections?.some((e) => ["MISSING_FRONT", "MISSING_BACK"].includes(e.reason))) return <Redirect to="televersement" />;
    // if (corrections?.some((e) => e.field === "latestCNIFileExpirationDate") && young?.files.cniFiles.length) return <Redirect to="televersement" />;
  }

  return (
    <>
      <DSFRContainer title="Ma pièce d’identité" supportLink={supportLink} supportEvent="Phase0/aide inscription - CI">
        <div className="my-4">
          {corrections?.map((e) => (
            <ErrorMessage key={e._id}>
              <strong>{translateCorrectionReason(e.reason) || translateField(e.field)}</strong>
              {e.message && ` : ${e.message}`}
            </ErrorMessage>
          ))}
        </div>

        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}

        {young.files?.cniFiles?.length > 0 && (
          <div className="mb-4">
            <MyDocs />
            <hr className="my-2" />
          </div>
        )}

        {disabledUpload && (
          <Info text="Vous ne pouvez téléverser que trois fichiers maximum." subText="Si vous devez en ajouter un, merci de supprimer d'abord un document ci-dessous." />
        )}

        <div className="mt-2 text-sm text-gray-800">Choisissez le justificatif d’identité que vous souhaitez importer :</div>
        <div className="flex flex-col my-3 gap-3">
          {IDs.map((doc) => (
            <button
              key={doc.category}
              onClick={() => handleClick(doc)}
              className={`cursor-pointer hover:bg-[#FAFAFA] w-full flex items-center justify-between border p-4 group ${
                disabledUpload ? "cursor-not-allowed bg-[#FAFAFA] text-gray-400" : ""
              }`}>
              <div className="text-left flex flex-col">
                <span>{doc.title}</span>
                {doc.subtitle && <span className="text-sm text-gray-500">{doc.subtitle}</span>}
              </div>
              <div className={`w-10 h-10 ${disabledUpload ? "bg-gray-400" : "bg-blue-france-sun-113 group-hover:bg-blue-france-sun-113-hover"}`}>
                <RiArrowRightLine className="text-white w-6 h-6 mx-auto my-2" />
              </div>
            </button>
          ))}
        </div>
        <SignupButtons onClickNext={corrections ? null : onSubmit} onClickPrevious={corrections ? null : goBack} disabled={disabled} />
      </DSFRContainer>
    </>
  );
}
