import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import api from "../../../services/api";
import { capture } from "../../../sentry";
import { translate } from "snu-lib";
import { supportURL } from "../../../config";

import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import Navbar from "../components/Navbar";
import StickyButton from "../../../components/inscription/stickyButton";
import Error from "../../../components/error";
import Help from "../../inscription2023/components/Help";
import MyDocs from "../../inscription2023/components/MyDocs";

export default function StepDocuments() {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);
  const [error, setError] = useState({});

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
    const { ok, code, data: responseData } = await api.put("/young/reinscription/documents");
    if (!ok) {
      capture(code);
      setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
      return;
    }
    dispatch(setYoung(responseData));
    history.push("/reinscription/done");
  }

  return (
    <>
      <Navbar />
      <div className="bg-white p-4">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-semibold">Ma pièce d’identité</h1>
          <a href={`${supportURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`} target="_blank" rel="noreferrer">
            <QuestionMarkBlueCircle />
          </a>
        </div>
        <div className="mt-2 text-sm text-gray-800">Choisissez le justificatif d’identité que vous souhaitez importer :</div>
        {IDs.map((id) => (
          <Link key={id.category} to={`televersement/${id.category}`}>
            <div className="my-4">
              <div className="my-3 flex items-center justify-between border p-4">
                <div>
                  <div>{id.title}</div>
                  {id.subtitle && <div className="text-sm text-gray-500">{id.subtitle}</div>}
                </div>
                <ArrowRightBlueSquare />
              </div>
            </div>
          </Link>
        ))}
        <MyDocs />
      </div>
      <Help />
      <StickyButton
        text="Me réinscrire au SNU"
        onClick={onSubmit}
        onClickPrevious={() => history.push("/reinscription/consentement")}
        disabled={young?.files.cniFiles.length === 0}
      />
    </>
  );
}
