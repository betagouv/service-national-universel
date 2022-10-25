import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import { formatDateFR, translate } from "snu-lib";
import api from "../../../services/api";
import Error from "../../../components/error";
import Bin from "../../../assets/icons/Bin";

export default function MyDocs({ young }) {
  const dispatch = useDispatch();
  const [error, setError] = useState({});

  async function deleteFile(fileId) {
    const res = await api.remove(`/young/${young._id}/documents/cniFiles/${fileId}`);
    if (!res.ok) return setError({ text: "Erreur lors de la suppression de votre fichier." });
    let newYoung = { ...young };
    newYoung.files.cniFiles = res.data;
    dispatch(setYoung(newYoung));
  }

  return (
    <div className="w-full md:w-1/2">
      <h2 className="text-base text-gray-800 font-semibold my-2">Mes documents en ligne</h2>
      {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
      {young.files.cniFiles.map((e) => (
        <div key={e._id} className="flex w-full justify-between my-4">
          <div className="w-2/3">
            <p className="text-gray-800 text-sm truncate">{e.name}</p>
            <p className="text-gray-500 text-xs truncate">
              {translate(e.category)} - Expire le {formatDateFR(e.expirationDate)}
            </p>
          </div>
          <div className="text-blue-800 cursor-pointer hover:text-blue-600 flex">
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
  );
}
