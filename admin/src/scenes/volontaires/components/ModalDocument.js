import React from "react";
import { Modal } from "reactstrap";
import { toastr } from "react-redux-toastr";
import api from "../../../services/api";
import CloseSvg from "../../../assets/Close";
import { ModalContainer, Footer } from "../../../components/modals/Modal";
import DndFileInput from "../../../components/dndFileInputV2";
import { Formik } from "formik";
import Select from "../components/Select";
import { translate } from "../../../utils";
import ModalButton from "../../../components//buttons/ModalButton";

export default function ModalDocument({ isOpen, onCancel, initialValues, young, updateYoung, title, name, nameFiles, comment }) {
  return (
    <Modal centered isOpen={isOpen} toggle={onCancel} size="lg">
      <ModalContainer>
        <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={onCancel} />
        <Formik
          initialValues={initialValues}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (values) => {
            try {
              const { ok, code } = await api.put(`/referent/young/${young._id}/phase1Files/${name}`, values);
              if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
              toastr.success("Mis à jour!");
              updateYoung();
            } catch (e) {
              console.log(e);
              toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
            }
          }}>
          {({ values, handleChange, handleSubmit }) => (
            <>
              <div className="p-2 text-center w-full flex flex-col items-center">
                <div className="mb-4">
                  <h3 className="mb-3">{title}</h3>
                  {values[nameFiles]?.length && !name ? null : (
                    <div className="px-3 py-6 my-2 mx-auto">
                      {!values[nameFiles]?.length && (
                        <p className="mb-3 text-gray-500">
                          <em>Le volontaire n&apos;a pas encore renseigné sa pièce justificative.</em>
                        </p>
                      )}
                      {name && (
                        <Select
                          placeholder="Non renseigné"
                          name={name}
                          values={values}
                          handleChange={(e) => {
                            handleChange(e), handleSubmit();
                          }}
                          title="Accord :"
                          options={[
                            { value: "true", label: "Oui" },
                            { value: "false", label: "Non" },
                          ]}
                        />
                      )}
                    </div>
                  )}
                </div>
                <section className="flex flex-col items-center rounded-lg  w-[90%] lg:w-[70%]">
                  <DndFileInput
                    placeholder="un document justificatif"
                    errorMessage="Vous devez téléverser un document justificatif"
                    value={undefined} // Since this is a modal, the component will handle the data fetching by itself
                    path={`/young/${young._id}/documents/${nameFiles}`}
                    name={nameFiles}
                  />
                </section>
                {comment && (
                  <section className="flex flex-col items-center bg-gray-50 rounded-lg p-10 w-[90%] lg:w-[70%] my-4">
                    <p className="w-[90%]">
                      <strong>Correction demandée :</strong>
                      <br /> <em>&ldquo;{comment}&rdquo;</em>
                    </p>
                  </section>
                )}
              </div>
            </>
          )}
        </Formik>
        <Footer>
          <ModalButton onClick={onCancel}>Retour</ModalButton>
        </Footer>
      </ModalContainer>
    </Modal>
  );
}
