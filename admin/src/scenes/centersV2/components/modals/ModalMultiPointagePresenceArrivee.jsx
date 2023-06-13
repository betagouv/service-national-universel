import React from "react";
import ModalForm from "../../../../components/modals/ModalForm";
import SpeakerPhone from "../../../../assets/icons/SpeakerPhone";
import ArrowNarrowLeft from "../../../../assets/icons/ArrowNarrowLeft";
import ViewList from "../../../../assets/icons/ViewList";

export default function ModalPointagePresenceJDM({ isOpen, onSubmit, onCancel, values, value }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [viewList, setViewList] = React.useState(false);
  const isPlural = values?.length > 1;

  const getTitle = () => `Marquer ${value === "true" ? "présent" : "absent"}${isPlural ? "s" : ""} ${values?.length} volontaire${isPlural ? "s" : ""}`;
  const getMessage = () =>
    `Vous êtes sur le point de marquer ${value === "true" ? "présent" : "absent"}${isPlural ? "s" : ""} ${values?.length} volontaire${isPlural ? "s" : ""} au séjour de cohésion.`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await onSubmit();
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
              {values.map((volontaire) => (
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
              <SpeakerPhone width={36} height={36} />
            </div>
            <div className="m-4">
              <div className="flex items-center justify-center text-xl font-medium text-gray-900">{getTitle()}</div>
              <div className="flex items-center justify-center text-center text-base font-normal text-gray-500">{getMessage()}</div>
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
