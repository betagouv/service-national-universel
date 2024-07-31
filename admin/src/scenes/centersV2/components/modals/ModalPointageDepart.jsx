import React from "react";
import ModalForm from "../../../../components/modals/ModalForm";
import ArrowCircleRight from "../../../../assets/icons/ArrowCircleRight";
import api from "../../../../services/api";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import Trash from "../../../../assets/icons/Trash";

export default function ModalPointageDepart({ isOpen, onSubmit, onCancel, young }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [departSejourMotif, setDepartSejourMotif] = React.useState("");
  const [departSejourAt, setDepartSejourAt] = React.useState("");
  const [departSejourMotifComment, setDepartSejourMotifComment] = React.useState("");
  const [depart, setDepart] = React.useState("");
  const motifArray = ["Exclusion", "Cas de force majeure (Fermeture du centre, éviction pour raison sanitaitre, rapatriement médical, convocation judiciaire, etc.)", "Autre"];

  React.useEffect(() => {
    if (!young) return;
    setDepartSejourMotif(young.departSejourMotif || "");
    setDepartSejourAt(young.departSejourAt?.substring(0, 10) || "");
    setDepartSejourMotifComment(young.departSejourMotifComment || "");
    setDepart(young?.departInform || false);
  }, [young]);

  const getTitle = () => (
    <span>
      Renseigner le départ anticipé de <span className="font-bold">{young.firstName}</span>
    </span>
  );
  const getMessage = () =>
    `Vous êtes sur le point de renseigner le départ anticipé de  ${young.firstName} de votre centre de séjour de cohésion. Merci de renseigner le motif et la date de départ.`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, ok, code } = await api.post(`/young/${young._id}/phase1/depart`, { departSejourMotif, departSejourAt, departSejourMotifComment });
      if (!ok) {
        toastr.error("Oups, une erreur s'est produite", translate(code));
        setIsLoading(false);
        return;
      }
      await onSubmit(data);
    } catch (error) {
      toastr.error("Oups, une erreur s'est produite", translate(error.code));
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const { data, ok, code } = await api.put(`/young/${young._id}/phase1/depart`);
    if (!ok) {
      toastr.error("Oups, une erreur s'est produite", translate(code));
      setIsLoading(false);
      return;
    }
    await onSubmit(data);
    setIsLoading(false);
  };

  const onClickCancel = (e) => {
    e.preventDefault();
    onCancel();
  };

  return (
    <ModalForm isOpen={isOpen} onCancel={onCancel} showCloseIcon={false}>
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex items-center justify-center text-gray-300">
          <ArrowCircleRight width={36} height={36} />
        </div>
        <div className="m-4">
          <div className="flex items-center justify-center text-xl text-gray-900">{getTitle()}</div>
          <div className="flex items-center justify-center text-center text-base font-normal text-gray-500">{getMessage()}</div>
        </div>
        <div className="mx-4 mb-3 flex gap-3">
          <div className={`rounded-lg border-[1px]  py-1 px-2 ${isLoading && "bg-gray-200"}`}>
            <label className="w-full text-left text-gray-500">Motif du départ</label>
            <select
              required
              className="w-full cursor-pointer bg-inherit disabled:cursor-not-allowed"
              value={departSejourMotif}
              onChange={(e) => setDepartSejourMotif(e.target.value)}
              disabled={isLoading}>
              <option value="" label="Motif du départ" disabled>
                Motif du départ
              </option>
              {motifArray.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className={`rounded-lg border-[1px]  py-1 px-2 ${isLoading && "bg-gray-200"}`}>
            <label className="w-full text-left text-gray-500">Date du départ</label>
            <input
              required
              type="date"
              className="w-full cursor-pointer bg-inherit disabled:cursor-not-allowed"
              value={departSejourAt}
              onChange={(e) => setDepartSejourAt(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="mx-4 flex">
          <div className={`w-full rounded-lg border-[1px]  py-1 px-2 ${isLoading && "bg-gray-200"}`}>
            <label className="w-full text-left text-gray-500">Commentaire</label>
            <textarea
              required
              placeholder="Votre commentaire"
              className="w-full bg-inherit disabled:cursor-not-allowed"
              value={departSejourMotifComment}
              onChange={(e) => setDepartSejourMotifComment(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        {depart ? (
          <div className="flex justify-center">
            <div className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-red-500 hover:underline" onClick={() => handleDelete()}>
              <Trash className="h-4 w-4" />
              Supprimer
            </div>
          </div>
        ) : null}
        <div className="flex gap-2 p-4">
          <button
            className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border-[1px] border-gray-300 py-2 text-gray-700 disabled:cursor-wait disabled:opacity-50"
            disabled={isLoading}
            onClick={onClickCancel}>
            Annuler
          </button>
          {departSejourMotif && departSejourAt && departSejourMotifComment ? (
            <button
              className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-snu-purple-300 py-2 text-white disabled:cursor-wait disabled:opacity-50"
              disabled={isLoading}
              type="submit">
              Confirmer
            </button>
          ) : (
            <div className="flex flex-1 cursor-not-allowed items-center justify-center rounded-lg bg-snu-purple-300 py-2 text-white opacity-50">Confirmer</div>
          )}
        </div>
      </form>
    </ModalForm>
  );
}
