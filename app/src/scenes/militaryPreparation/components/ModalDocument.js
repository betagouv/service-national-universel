import { Formik } from "formik";
import React from "react";
import { useDispatch } from "react-redux";
import { Modal } from "reactstrap";
import DndFileInput from "../../../components/dndFileInputV2";
import { setYoung } from "../../../redux/auth/actions";
import { urlWithScheme } from "../../../utils";

export default function ModalDocument({ isOpen, onCancel, title, subTitle, subsubTitle = null, name, template = null, young }) {
  const dispatch = useDispatch();
  return (
    <Modal centered isOpen={isOpen} onCancel={onCancel} size="lg">
      <div className="w-full">
        <div className="mx-4 flex flex-col items-center justify-center">
          <div className="mt-4 mb-1 text-lg font-medium uppercase text-gray-900">Documents requis</div>
          <div className="text-center text-xl font-bold uppercase text-gray-900">{title}</div>
          <div className=" mt-4 text-center text-base font-normal text-gray-500">{subTitle}</div>
          {subsubTitle ? <div className=" mt-4 text-center text-sm font-normal text-gray-500">{subsubTitle}</div> : null}
          {template ? (
            <div className="mt-4 mb-3 flex w-full flex-col items-center rounded-lg bg-gray-50 py-3">
              <a
                href={urlWithScheme(template)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 items-center rounded-[10px] border-[1px] bg-blue-600 py-2.5 px-3 text-sm text-[#ffffff] hover:border-blue-600 hover:bg-white hover:text-blue-600">
                Télécharger le modèle obligatoire
              </a>
              <div className="mt-2 text-xs font-normal leading-none text-gray-700">puis téléversez le formulaire rempli ci-contre</div>
            </div>
          ) : null}

          <Formik initialValues={young} validateOnChange={false} validateOnBlur={false}>
            <div className="mt-2 flex items-center justify-center">
              <DndFileInput
                className="flex flex-col items-center"
                value={undefined}
                name={name}
                path={`/young/${young._id}/documents/${name}`}
                onChange={(res) => dispatch(setYoung(res?.young))}
              />
            </div>
          </Formik>
          <button className="my-4 w-full cursor-pointer rounded-lg border-[1px] border-gray-300 py-2 text-gray-700" onClick={onCancel}>
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
