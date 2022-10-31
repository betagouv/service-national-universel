import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { translate } from "snu-lib";
import api from "../../../services/api";
import Error from "../../../components/error";
import Bin from "../../../assets/icons/Bin";

export default function MyDocs({ category = "" }) {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const [error, setError] = useState({});
  const files = category ? young?.files.cniFiles.filter((e) => e.category === category) : young?.files.cniFiles;

  async function deleteFile(fileId) {
    const res = await api.remove(`/young/${young._id}/documents/cniFiles/${fileId}`);
    if (!res.ok) return setError({ text: "Erreur lors de la suppression de votre fichier." });
    let newYoung = { ...young };
    newYoung.files.cniFiles = res.data;
    dispatch(setYoung(newYoung));
  }

  if (files.length === 0) return <></>;
  return (
    <div className="w-full">
      <h2 className="text-xl text-gray-800 font-medium my-4">Mes documents en ligne</h2>
      {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
      {files.map((e) => (
        <div key={e._id} className="flex w-full justify-between my-4">
          <div className="w-2/3">
            <p className="text-gray-800 text-sm truncate">{e.name}</p>
            <p className="text-gray-500 text-xs truncate">{translate(e.category)}</p>
          </div>
          <div className="text-blue-600 cursor-pointer hover:text-blue-400 flex">
            <div className="mt-1 mr-1">
              <Bin />
            </div>
            <div className="text-sm font-medium" onClick={() => deleteFile(e._id)}>
              Supprimer
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
