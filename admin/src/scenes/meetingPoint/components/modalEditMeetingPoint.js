import React, { useEffect } from "react";
import ModalForm from "../../../components/modals/ModalForm";

export default function ModalExportMail({ isOpen, onSubmit, onCancel, values }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState({});
  const [error, setError] = React.useState(false);

  useEffect(() => {
    if (values) {
      setData({
        adress: values.adress,
        departureAt: values.departureAt,
        returnAt: values.returnAt,
      });
    }
  }, [values]);

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
      <div className="w-full">
        <div className="mx-4">
          <div className="flex items-center justify-center text-gray-900 text-xl font-medium">Point de rassemblement</div>
          <div className="flex items-center justify-center text-gray-500 text-sm font-normal text-center">Vous êtes sur le point de modifier les informations suivante(s) :</div>
          <div className="mx-4">
            <div className="flex flex-row items-center border-[1px] border-gray-400 rounded-lg p-2">
              <div className="text-sm text-gray-700">tgvgtvAdress gdgfgdfd: </div>
              <input type="text" className="w-full" value={data.adress} />
            </div>
          </div>
        </div>
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
            onClick={handleSubmit}>
            Confirmer
          </button>
        </div>
      </div>
    </ModalForm>
  );
}
