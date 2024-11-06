import React from "react";
import ModalForm from "../../../../components/modals/ModalForm";
import ArrowCircleRight from "../../../../assets/icons/ArrowCircleRight";
import ArrowNarrowLeft from "../../../../assets/icons/ArrowNarrowLeft";
import ViewList from "../../../../assets/icons/ViewList";
import api from "../../../../services/api";
import { toastr } from "react-redux-toastr";
import { translate } from "../../../../utils";

export default function ModalPointagePresenceJDM({ isOpen, onSubmit, onCancel, values }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [viewList, setViewList] = React.useState(false);
  const isPlural = values?.length > 1;

  const [departSejourMotif, setDepartSejourMotif] = React.useState("");
  const [departSejourAt, setDepartSejourAt] = React.useState("");
  const [departSejourMotifComment, setDepartSejourMotifComment] = React.useState("");

  const motifArray = ["Exclusion", "Cas de force majeure (Fermeture du centre, éviction pour raison sanitaitre, rapatriement médical, convocation judiciaire, etc.)", "Autre"];

  const getTitle = () => `Renseigner le départ de ${values?.length} volontaire${isPlural ? "s" : ""}`;
  const getMessage = () =>
    `Vous êtes sur le point de renseigner le départ groupé de ${values?.length}
volontaire${isPlural ? "s" : ""} de votre centre de séjour de cohésion. Merci de
renseigner le motif et la date de départ.`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { ok, code } = await api.post(`/young/phase1/multiaction/depart`, { departSejourMotif, departSejourAt, departSejourMotifComment, ids: values.map((y) => y._id) });
      if (!ok) {
        toastr.error("Oups, une erreur s'est produite", translate(code));
        return;
      }
      onSubmit();
    } catch (e) {
      toastr.error("Oups, une erreur s'est produite", translate(e.code));
    }
    setIsLoading(false);
  };

  const onClickCancel = (e) => {
    e.preventDefault();
    onCancel();
  };

  return (
    <ModalForm isOpen={isOpen} onCancel={onCancel} showCloseIcon={false}>
      <form className="w-full" onSubmit={handleSubmit}>
        {viewList ? (
          <>
            <div className="mx-4 flex gap-4">
              <div onClick={() => setViewList(false)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gray-200">
                <ArrowNarrowLeft className="text-gray-700" />
              </div>
              <div className="flex items-center justify-center text-xl font-medium text-gray-900">{getTitle()}</div>
            </div>
            <div className="m-4">
              {values?.map((volontaire) => (
                <div key={volontaire._id} className="flex items-center justify-center text-base font-normal text-gray-900">
                  {volontaire.firstName} {volontaire.lastName}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mx-4 flex justify-end">
              <div onClick={() => setViewList(true)} className="flex cursor-pointer items-center gap-1 text-snu-purple-300 hover:underline">
                <ViewList />
                Voir la liste
              </div>
            </div>
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
                  placeholder="Votre commentaire facultatif"
                  className="w-full bg-inherit disabled:cursor-not-allowed"
                  value={departSejourMotifComment}
                  onChange={(e) => setDepartSejourMotifComment(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </>
        )}
        <div className="flex gap-2 p-4">
          <button
            className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border-[1px] border-gray-300 py-2 text-gray-700 disabled:cursor-wait disabled:opacity-50"
            disabled={isLoading}
            onClick={onClickCancel}>
            Annuler
          </button>
          <button
            className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-snu-purple-300 py-2 text-white disabled:cursor-wait disabled:opacity-50"
            disabled={isLoading}
            type="submit">
            Confirmer
          </button>
        </div>
      </form>
    </ModalForm>
  );
}
