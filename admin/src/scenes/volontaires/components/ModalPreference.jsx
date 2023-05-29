import React, { useRef } from "react";
import { Modal } from "reactstrap";
import validator from "validator";
import CloseSvg from "../../../assets/Close";

export default function ModalPreference({ isOpen, onCancel, setData, data, setModal }) {
  const [values, setValues] = React.useState({
    mobilityNearRelativeName: "",
    mobilityNearRelativeAddress: "",
    mobilityNearRelativeZip: "",
    mobilityNearRelativeCity: "",
  });
  const [errors, setErrors] = React.useState({});
  const ref = useRef();

  React.useEffect(() => {
    setValues({
      mobilityNearRelativeName: data.mobilityNearRelativeName,
      mobilityNearRelativeAddress: data.mobilityNearRelativeAddress,
      mobilityNearRelativeZip: data.mobilityNearRelativeZip,
      mobilityNearRelativeCity: data.mobilityNearRelativeCity,
    });
  }, [data]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setModal({ isOpen: false });
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const onSubmit = async () => {
    let error = {};

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
  };

  return (
    <Modal centered isOpen={isOpen} onCancel={onCancel} size="l">
      <div className="flex flex-col px-8 py-4" ref={ref}>
        <div className="flex justify-end">
          <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={onCancel} />
        </div>
        <div className="text-center text-sm font-bold leading-5 ">Renseigner l’adresse d’un proche</div>
        <div className="mt-4 w-full rounded-lg border-[1px] border-gray-300 px-3 py-2">
          <div className="text-xs font-normal leading-4 text-gray-500">Nom</div>
          <input
            className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5 disabled:bg-transparent"
            type="text"
            value={values.mobilityNearRelativeName}
            onChange={(e) => setValues({ ...values, mobilityNearRelativeName: e.target.value })}
          />
        </div>
        {errors?.mobilityNearRelativeName ? <div className="text-xs font-normal leading-4 text-red-500">{errors.mobilityNearRelativeName}</div> : null}
        <div className="mt-4 w-full rounded-lg border-[1px] border-gray-300 px-3 py-2">
          <div className="text-xs font-normal leading-4 text-gray-500">Adresse</div>
          <input
            className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5 disabled:bg-transparent"
            type="text"
            value={values.mobilityNearRelativeAddress}
            onChange={(e) => setValues({ ...values, mobilityNearRelativeAddress: e.target.value })}
          />
        </div>
        {errors?.mobilityNearRelativeAddress ? <div className="text-xs font-normal leading-4 text-red-500">{errors.mobilityNearRelativeAddress}</div> : null}
        <div className="flex flex-row gap-2">
          <div className="w-full">
            <div className="mt-4 w-full rounded-lg border-[1px] border-gray-300 px-3 py-2">
              <div className="text-xs font-normal leading-4 text-gray-500">Code postal</div>
              <input
                className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5 disabled:bg-transparent"
                type="text"
                value={values.mobilityNearRelativeZip}
                onChange={(e) => setValues({ ...values, mobilityNearRelativeZip: e.target.value })}
              />
            </div>
            {errors?.mobilityNearRelativeZip ? <div className="text-xs font-normal leading-4 text-red-500">{errors.mobilityNearRelativeZip}</div> : null}
          </div>
          <div className="w-full">
            <div className="mt-4 w-full rounded-lg border-[1px] border-gray-300 px-3 py-2">
              <div className="text-xs font-normal leading-4 text-gray-500">Ville</div>
              <input
                className="::placeholder:text-gray-500 w-full text-sm font-normal leading-5 disabled:bg-transparent"
                type="text"
                value={values.mobilityNearRelativeCity}
                onChange={(e) => setValues({ ...values, mobilityNearRelativeCity: e.target.value })}
              />
            </div>
            {errors?.mobilityNearRelativeCity ? <div className="text-xs font-normal leading-4 text-red-500">{errors.mobilityNearRelativeCity}</div> : null}
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => onSubmit()}
            className="my-4 cursor-pointer rounded-xl border-[1px] border-blue-600 bg-blue-600 px-4 py-2  text-white hover:bg-white hover:!text-blue-600">
            Enregistrer
          </button>
        </div>
      </div>
    </Modal>
  );
}
