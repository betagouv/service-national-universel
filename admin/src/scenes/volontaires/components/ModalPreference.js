import React from "react";
import { Modal } from "reactstrap";
import validator from "validator";

export default function ModalPreference({ isOpen, onCancel, setData, data }) {
  const [values, setValues] = React.useState({
    mobilityNearRelativeName: "",
    mobilityNearRelativeAddress: "",
    mobilityNearRelativeZip: "",
    mobilityNearRelativeCity: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    setValues({
      mobilityNearRelativeName: data.mobilityNearRelativeName,
      mobilityNearRelativeAddress: data.mobilityNearRelativeAddress,
      mobilityNearRelativeZip: data.mobilityNearRelativeZip,
      mobilityNearRelativeCity: data.mobilityNearRelativeCity,
    });
  }, [data]);

  const onSubmit = async () => {
    let error = {};
    setLoading(true);

    if (!validator.isPostalCode(values.mobilityNearRelativeZip, "FR")) {
      error.mobilityNearRelativeZip = "Ce champ est au mauvais format. Exemples de format attendu : 44000, 08300";
    }

    Object.keys(values).forEach((key) => {
      if (!values[key] || values[key] === "") {
        error[key] = "Ce champ est obligatoire";
      }
    });

    if (Object.keys(error).length) {
      setErrors(error);
    } else {
      setErrors({});
      setData({ ...data, ...values });
      onCancel();
    }

    setLoading(false);
  };

  return (
    <Modal centered isOpen={isOpen} onCancel={onCancel} size="l">
      <div className="flex flex-col px-8 py-4">
        <div className="text-sm leading-5 font-bold text-center ">Renseigner l’adresse d’un proche</div>
        <div className="border-[1px] border-gray-300 w-full px-3 py-2 rounded-lg mt-4">
          <div className="text-xs leading-4 font-normal text-gray-500">Nom</div>
          <input
            className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500 disabled:bg-transparent"
            type="text"
            value={values.mobilityNearRelativeName}
            onChange={(e) => setValues({ ...values, mobilityNearRelativeName: e.target.value })}
          />
        </div>
        {errors?.mobilityNearRelativeName ? <div className="text-xs leading-4 font-normal text-red-500">{errors.mobilityNearRelativeName}</div> : null}
        <div className="border-[1px] border-gray-300 w-full px-3 py-2 rounded-lg mt-4">
          <div className="text-xs leading-4 font-normal text-gray-500">Adresse</div>
          <input
            className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500 disabled:bg-transparent"
            type="text"
            value={values.mobilityNearRelativeAddress}
            onChange={(e) => setValues({ ...values, mobilityNearRelativeAddress: e.target.value })}
          />
        </div>
        {errors?.mobilityNearRelativeAddress ? <div className="text-xs leading-4 font-normal text-red-500">{errors.mobilityNearRelativeAddress}</div> : null}
        <div className="flex flex-row gap-2">
          <div className="w-full">
            <div className="border-[1px] border-gray-300 w-full px-3 py-2 rounded-lg mt-4">
              <div className="text-xs leading-4 font-normal text-gray-500">Code postal</div>
              <input
                className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500 disabled:bg-transparent"
                type="text"
                value={values.mobilityNearRelativeZip}
                onChange={(e) => setValues({ ...values, mobilityNearRelativeZip: e.target.value })}
              />
            </div>
            {errors?.mobilityNearRelativeZip ? <div className="text-xs leading-4 font-normal text-red-500">{errors.mobilityNearRelativeZip}</div> : null}
          </div>
          <div className="w-full">
            <div className="border-[1px] border-gray-300 w-full px-3 py-2 rounded-lg mt-4">
              <div className="text-xs leading-4 font-normal text-gray-500">Ville</div>
              <input
                className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500 disabled:bg-transparent"
                type="text"
                value={values.mobilityNearRelativeCity}
                onChange={(e) => setValues({ ...values, mobilityNearRelativeCity: e.target.value })}
              />
            </div>
            {errors?.mobilityNearRelativeCity ? <div className="text-xs leading-4 font-normal text-red-500">{errors.mobilityNearRelativeCity}</div> : null}
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={onCancel} className={`my-4 px-4 border-[1px] border-gray-300 text-white rounded-lg py-2 bg-blue-600 cursor-pointer`}>
            Annuler
          </button>
          <button
            onClick={() => onSubmit()}
            className={`my-4 px-4 border-[1px] border-gray-300 text-white rounded-lg py-2  ${loading ? "bg-blue-300" : "bg-blue-600 cursor-pointer"}`}>
            Enregistrer
          </button>
        </div>
      </div>
    </Modal>
  );
}
