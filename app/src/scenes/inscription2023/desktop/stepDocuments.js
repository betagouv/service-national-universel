import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { supportURL } from "../../../config";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { translate, YOUNG_STATUS } from "snu-lib";

import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import DesktopPageContainer from "../components/DesktopPageContainer";
import Error from "../../../components/error";
import MyDocs from "../components/MyDocs";
import { getCorrectionByStep } from "../../../utils/navigation";

export default function StepDocuments() {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);
  const { step } = useParams();
  const [error, setError] = useState({});
  // const [corrections, setCorrections] = useState({});
  const corrections = getCorrectionByStep(young, step);
  console.log("🚀 ~ file: stepDocuments.js ~ line 23 ~ StepDocuments ~ corrections", corrections);

  // useEffect(() => {
  //   if (!young) return;
  //   if (young.status === YOUNG_STATUS.WAITING_CORRECTION) {
  //     const corrections = getCorrectionByStep(young, step);
  //     if (!Object.keys(corrections).length) return history.push("/");
  //     else setCorrections(corrections);
  //   } else {
  //     history.push("/");
  //   }
  //   // setData({ email: young.email, emailConfirm: young.email, firstName: young.firstName, lastName: young.lastName });
  // }, [young]);

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
      onClickPrevious={() => history.push("/inscription2023/representants")}
      onSubmit={onSubmit}
      disabled={!young?.files.cniFiles.length}
      questionMarckLink={`${supportURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`}>
      {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
      {docs.map((doc) => (
        <div key={doc.category} className="my-4 hover:bg-gray-50 cursor-pointer" onClick={() => history.push(`televersement/${doc.category}`)}>
          <div className="border p-4 my-3 flex justify-between items-center">
            <div>
              <div>{doc.title}</div>
              {doc.subtitle && <div className="text-gray-500 text-sm">{doc.subtitle}</div>}
            </div>
            <ArrowRightBlueSquare />
          </div>
        </div>
      ))}
      <MyDocs young={young} />
    </DesktopPageContainer>
  );
}
