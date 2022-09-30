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
        <div className="flex justify-end gap-4">
          <button
            onClick={() => onSubmit()}
            className="my-4 px-4 border-[1px] text-white rounded-xl py-2 hover:bg-white hover:!text-blue-600  bg-blue-600 border-blue-600 cursor-pointer">
            Enregistrer
          </button>
        </div>
      </div>
    </Modal>
  );
}
