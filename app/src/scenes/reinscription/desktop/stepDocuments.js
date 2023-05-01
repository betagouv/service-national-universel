import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { supportURL } from "../../../config";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { translate } from "snu-lib";

import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import DesktopPageContainer from "../../inscription2023/components/DesktopPageContainer";
import Error from "../../../components/error";
import MyDocs from "../../inscription2023/components/MyDocs";
import plausibleEvent from "../../../services/plausible";

export default function StepDocuments() {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);
  const [error, setError] = useState({});

  async function onSubmit() {
    const { ok, code, data: responseData } = await api.put("/young/reinscription/documents");
    if (!ok) {
      capture(code);
      setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
      return;
    }
    console.log("🚀 ~ file: stepDocuments.js ~ line 36 ~ onSubmit ~ data", responseData);
    dispatch(setYoung(responseData));
    plausibleEvent("Phase0/CTA reinscription - CI mobile");
    history.push("/reinscription/done");
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

  return (
    <DesktopPageContainer
      title="Ma pièce d’identité"
      subTitle="Choisissez le justificatif d’identité que vous souhaitez importer :"
      onClickPrevious={() => history.push("/reinscription/consentement")}
      onSubmit={onSubmit}
      disabled={young?.files.cniFiles?.length === 0}
      childrenContinueButton={"Me réinscrire au SNU"}
      questionMarckLink={`${supportURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`}>
      {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
      {docs.map((doc) => (
        <div key={doc.category} className="my-4 cursor-pointer hover:bg-gray-50" onClick={() => history.push(`televersement/${doc.category}`)}>
          <div className="my-3 flex items-center justify-between border p-4">
            <div>
              <div>{doc.title}</div>
              {doc.subtitle && <div className="text-sm text-gray-500">{doc.subtitle}</div>}
            </div>
            <ArrowRightBlueSquare />
          </div>
        </div>
      ))}
      <MyDocs />
    </DesktopPageContainer>
  );
}
