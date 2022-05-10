import React from "react";
import ModalForm from "../../../../components/modals/ModalForm";
import ArrowCircleRight from "../../../../assets/icons/ArrowCircleRight";
import api from "../../../../services/api";
import { toastr } from "react-redux-toastr";
import { translate } from "../../../../utils";

export default function ModalPointageDepart({ isOpen, onSubmit, onCancel, young }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [departSejourMotif, setDepartSejourMotif] = React.useState("");
  const [departSejourAt, setDepartSejourAt] = React.useState("");
  const [departSejourMotifComment, setDepartSejourMotifComment] = React.useState("");

  React.useEffect(() => {
    if (!young) return;
    setDepartSejourMotif(young.departSejourMotif || "");
    setDepartSejourAt(young.departSejourAt?.substring(0, 10) || "");
    setDepartSejourMotifComment(young.departSejourMotifComment || "");
  }, [young]);

  const getTitle = () => (
    <span>
      Renseigner le départ de <span className="font-bold">{young.firstName}</span>
    </span>
  );
  const getMessage = () =>
    `Vous êtes sur le point de renseigner le départ de  ${young.firstName} de votre centre de séjour de cohésion. Merci de renseigner le motif et la date de départ.`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { data, ok, code } = await api.post(`/young/${young._id}/phase1/depart`, { departSejourMotif, departSejourAt, departSejourMotifComment });
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
    <ModalForm isOpen={isOpen} onCancel={onCancel}>
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex items-center justify-center text-gray-300">
          <ArrowCircleRight width={36} height={36} />
        </div>
        <div className="m-4">
          <div className="flex items-center justify-center text-gray-900 text-xl">{getTitle()}</div>
          <div className="flex items-center justify-center text-gray-500 text-base font-normal text-center">{getMessage()}</div>
        </div>
        <div className="flex gap-3 mx-4 mb-3">
          <div className={`border-[1px] rounded-lg  py-1 px-2 ${isLoading && "bg-gray-200"}`}>
            <label className="text-left text-gray-500 w-full">Motif du départ</label>
            <select
              className="w-full bg-inherit cursor-pointer disabled:cursor-not-allowed"
              value={departSejourMotif}
              onChange={(e) => setDepartSejourMotif(e.target.value)}
              disabled={isLoading}>
              <option value="" label="Motif du départ" disabled>
                Motif du départ
              </option>
              {/* todo mettre motifs en constantes */}
              {["Exclusion", "Cas de force majeure pour le volontaire", "Annulation du séjour ou mesure d’éviction sanitaire", "Autre"].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className={`border-[1px] rounded-lg  py-1 px-2 ${isLoading && "bg-gray-200"}`}>
            <label className="text-left text-gray-500 w-full">Date du départ</label>
            <input
              type="date"
              className="w-full bg-inherit cursor-pointer disabled:cursor-not-allowed"
              value={departSejourAt}
              onChange={(e) => setDepartSejourAt(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="flex mx-4">
          <div className={`w-full border-[1px] rounded-lg  py-1 px-2 ${isLoading && "bg-gray-200"}`}>
            <label className="text-left text-gray-500 w-full">Commentaire</label>
            <textarea
              placeholder="Votre commentaire facultatif"
              className="w-full bg-inherit disabled:cursor-not-allowed"
              value={departSejourMotifComment}
              onChange={(e) => setDepartSejourMotifComment(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="flex p-4 gap-2">
          <button
            className="flex items-center justify-center flex-1 border-[1px] border-gray-300 text-gray-700 rounded-lg py-2 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
            disabled={isLoading}
            onClick={onClickCancel}>
            Annuler
          </button>
          {departSejourMotif && departSejourAt ? (
            <button
              className="flex items-center justify-center flex-1 bg-snu-purple-300 text-white rounded-lg py-2 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
              disabled={isLoading}
              type="submit">
              Confirmer
            </button>
          ) : (
            <div className="flex items-center justify-center flex-1 bg-snu-purple-300 text-white rounded-lg py-2 opacity-50 cursor-not-allowed">Confirmer</div>
          )}
        </div>
      </form>
    </ModalForm>
  );
}
