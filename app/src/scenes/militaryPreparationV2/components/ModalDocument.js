import React from "react";
import { Modal } from "reactstrap";
import DndFileInput from "../../../components/dndFileInput";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import { Formik } from "formik";
import { urlWithScheme } from "../../../utils";
import { setYoung } from "../../../redux/auth/actions";
import { useDispatch } from "react-redux";

export default function ModalDocument({ isOpen, onCancel, title, subTitle, subsubTitle = null, name, template = null, young }) {
  const dispatch = useDispatch();

  return (
    <Modal centered isOpen={isOpen} onCancel={onCancel} size="lg">
      <div className="w-full">
        <div className="flex flex-col items-center justify-center mx-4">
          <div className="text-gray-900 text-lg font-medium mt-4 mb-1 uppercase">Documents requis</div>
          <div className="text-gray-900 text-xl font-bold text-center uppercase">{title}</div>
          <div className=" text-gray-500 text-base font-normal text-center mt-4">{subTitle}</div>
          {subsubTitle ? <div className=" text-gray-500 text-sm font-normal text-center mt-4">{subsubTitle}</div> : null}
          {template ? (
            <div className="flex flex-col items-center bg-gray-50 mt-4 py-3 rounded-lg mb-3 w-full">
              <a
                href={urlWithScheme(template)}
                target="_blank"
                rel="noreferrer"
                className="rounded-[10px] border-[1px] py-2.5 px-3 items-center bg-blue-600 hover:bg-white hover:border-blue-600 mt-4 text-[#ffffff] hover:text-blue-600 text-sm">
                Télécharger le modèle obligatoire
              </a>
              <div className="text-xs leading-none font-normal text-gray-700 mt-2">puis téléversez le formulaire rempli ci-contre</div>
            </div>
          ) : null}

          <Formik initialValues={young} validateOnChange={false} validateOnBlur={false}>
            {({ values, handleChange }) => (
              <>
                <div className="flex mt-2 items-center justify-center">
                  <DndFileInput
                    className="flex flex-col items-center"
                    value={values[name]}
                    name={name}
                    onChange={async (e) => {
                      const res = await api.uploadFile(`/young/file/${name}`, e.target.files);
                      if (res.code === "FILE_CORRUPTED") {
                        return toastr.error(
                          "Le fichier semble corrompu",
                          "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                          { timeOut: 0 },
                        );
                      }
                      if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                      // We update it instant ( because the bucket is updated instant )
                      toastr.success("Fichier téléversé");
                      handleChange({ target: { value: res.data, name } });
                      dispatch(setYoung(res.young));
                    }}
                  />
                </div>
              </>
            )}
          </Formik>
          <button className="my-4 border-[1px] border-gray-300 text-gray-700 rounded-lg py-2 cursor-pointer w-full" onClick={onCancel}>
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
