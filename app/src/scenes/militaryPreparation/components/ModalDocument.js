import React from "react";
import { Modal } from "reactstrap";
import DndFileInput from "../../../components/dndFileInputV2";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import { Formik } from "formik";
import { urlWithScheme, translate } from "../../../utils";
import { setYoung } from "../../../redux/auth/actions";
import { useDispatch } from "react-redux";

export default function ModalDocument({ isOpen, onCancel, title, subTitle, subsubTitle = null, name, template = null, young }) {
  const dispatch = useDispatch();

  const updateStatus = async () => {
    if (young.statusMilitaryPreparationFiles === "WAITING_CORRECTION") {
      const responseChangeStatusPM = await api.put(`/young/${young._id}/phase2/militaryPreparation/status`, { statusMilitaryPreparationFiles: "WAITING_VERIFICATION" });
      if (!responseChangeStatusPM.ok) return toastr.error(translate(responseChangeStatusPM?.code), "Oups, une erreur est survenue de la modification de votre dossier.");
      else dispatch(setYoung(responseChangeStatusPM.data));
    }
  };

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
            <div className="flex mt-2 items-center justify-center">
              <DndFileInput className="flex flex-col items-center" value={undefined} name={name} path={`/young/${young._id}/documents/${name}`} onChange={updateStatus} />
            </div>
          </Formik>
          <button className="my-4 border-[1px] border-gray-300 text-gray-700 rounded-lg py-2 cursor-pointer w-full" onClick={onCancel}>
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
