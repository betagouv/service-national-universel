import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { supportURL } from "../../../config";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { translate } from "snu-lib";

import ArrowRightBlueSquare from "../../../assets/icons/ArrowRightBlueSquare";
import Bin from "../../../assets/icons/Bin";
import DesktopPageContainer from "../components/DesktopPageContainer";
import Error from "../../../components/error";

export default function StepDocuments() {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);
  const [error, setError] = useState({});
  const [files, setFiles] = useState(young?.files.cniFiles);

  async function deleteFile(fileId) {
    try {
      const res = await api.remove(`/young/${young._id}/documents/cniFiles/${fileId}`);
      if (!res.ok) setError({ text: "Impossible de supprimer ce document" });
      setFiles(res.data);
    } catch (e) {
      capture(e);
      setError({ text: "Impossible de supprimer ce fichier." });
    }
  }

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

  const documents = [
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
      disabled={!files.length}
      questionMarckLink={`${supportURL}/base-de-connaissance/je-minscris-et-justifie-mon-identite`}>
      {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
      {documents.map((doc) => (
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
      <div className="mt-2">
        {files?.length > 0 && (
          <>
            <h2 className="text-base text-gray-800 font-semibold my-3">Mes documents en ligne&nbsp;:</h2>
            <div className="space-y-3">
              {files.map((e) => (
                <div key={e._id} className="flex w-1/2 justify-between">
                  <div className="w-2/3">
                    <p className="text-gray-800 text-sm truncate">{e.name}</p>
                    <p className="text-gray-500 text-xs truncate">{translate(e.category)}</p>
                  </div>
                  <div className="flex text-blue-800 hover:text-blue-500 cursor-pointer" onClick={() => deleteFile(e._id)}>
                    <div className="mt-1 mr-1">
                      <Bin />
                    </div>
                    <p className="text-sm font-medium">Supprimer</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DesktopPageContainer>
  );
}
