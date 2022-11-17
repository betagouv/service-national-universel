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
            <div className="flex mx-4 gap-4">
              <div onClick={() => setViewList(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 cursor-pointer">
                <ArrowNarrowLeft className="text-gray-700" />
              </div>
              <div className="flex items-center justify-center text-gray-900 text-xl font-medium">{getTitle()}</div>
            </div>
            <div className="m-4">
              {values.map((volontaire) => (
                <div key={volontaire._id} className="flex items-center justify-center text-gray-900 text-base font-normal">
                  {volontaire.firstName} {volontaire.lastName}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex mx-4 justify-end">
              <div onClick={() => setViewList(true)} className="flex gap-1 items-center cursor-pointer hover:underline text-snu-purple-300">
                <ViewList />
                Voir la liste
              </div>
            </div>
            <div className="flex items-center justify-center text-gray-300">
              <SpeakerPhone width={36} height={36} />
            </div>
            <div className="m-4">
              <div className="flex items-center justify-center text-gray-900 text-xl font-medium">{getTitle()}</div>
              <div className="flex items-center justify-center text-gray-500 text-base font-normal text-center">{getMessage()}</div>
            </div>
          </>
        )}
        <div className="flex p-4 gap-2">
          <button
            className="flex items-center justify-center flex-1 border-[1px] border-gray-300 text-gray-700 rounded-lg py-2 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
            disabled={isLoading}
            onClick={onClickCancel}>
            Annuler
          </button>
          <button
            className="flex items-center justify-center flex-1 bg-snu-purple-300 text-white rounded-lg py-2 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
            disabled={isLoading}
            type="submit">
            Confirmer
          </button>
        </div>
      </form>
    </ModalForm>
  );
}
