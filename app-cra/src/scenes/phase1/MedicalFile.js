import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "reactstrap";
import CloseSvg from "../../assets/Close";
import FileIcon from "../../assets/FileIcon";
import { ModalContainer } from "../../components/modals/Modal";
import { setYoung } from "../../redux/auth/actions";
import api from "../../services/api";
import DownloadButton from "./components/DownloadButton";
import { Logo, SuccessMessage } from "./components/printable";

export default function MedicalFile({ isOpen, onCancel }) {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();

  const updateDocumentInformation = async () => {
    const { ok, data } = await api.put("/young/phase1/cohesionStayMedical", { cohesionStayMedicalFileDownload: "true" });
    if (ok) dispatch(setYoung(data));
  };

  return (
    <>
      <Modal centered isOpen={isOpen} toggle={onCancel} size="xl">
        <ModalContainer className="p-12 w-100">
          <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={onCancel} />
          <h2 className="mb-4 text-center">Téléchargez votre fiche sanitaire</h2>
          <div className={`flex flex-col ${young.cohesionStayMedicalFileReceived === "true" ? "" : "md:flex-row"}`}>
            <section>
              {young.cohesionStayMedicalFileReceived === "true" ? (
                <SuccessMessage>
                  <Logo>
                    <svg height={64} width={64} fill="none" viewBox="0 0 24 24" stroke="#057a55" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </Logo>
                  Ce document a bien été réceptionné
                </SuccessMessage>
              ) : (
                <section className="bg-gray-50 px-4 py-8 rounded md:mr-4">
                  <h4>Mode d&apos;emploi</h4>
                  <ul className="text-gray-500 my-2">
                    <li>• Téléchargez et renseignez votre fiche sanitaire</li>
                    <li>
                      • Joignez-y les documents requis et mettre dans une enveloppe portant la mention <em>“A l&apos;attention de l&apos;infirmier, Pli Confidentiel”</em>
                    </li>
                    <li>• Remettez l&apos;enveloppe à votre arrivée au centre de séjour à l&apos;équipe d&apos;encadrement.</li>
                  </ul>
                  <a
                    className="link text-indigo-600 underline hover:text-indigo-800"
                    href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/note_relatives_aux_informations_d_ordre_sanitaire_2022.pdf"
                    target="blank">
                    Note relative aux informations d&apos;ordre sanitaire ›
                  </a>
                </section>
              )}
            </section>
            <section className="sm:mt-4 md:ml-4">
              {young.cohesionStayMedicalFileReceived !== "true" ? (
                <div className="flex flex-col items-center px-4 py-8 border-2 border-dashed border-gray-300 rounded">
                  <FileIcon filled={true} icon="sanitaire" />
                  <a target="blank" href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/fiche_sanitaire_2022.pdf" onClick={updateDocumentInformation}>
                    <DownloadButton text={young.cohesionStayMedicalFileDownload === "true" ? "Télécharger de nouveau la fiche sanitaire" : "Télécharger la fiche sanitaire"} />
                  </a>
                </div>
              ) : null}
              <div style={{ marginTop: "2rem" }}>
                <div style={{ color: "#9C9C9C" }}>
                  <b> Rappel : </b>Vous devez réaliser un bilan de santé obligatoire auprès de votre médecin traitant. Il est fortement recommandé de le faire avant votre séjour de
                  cohésion.
                </div>
                <a
                  href="https://www.ameli.fr/assure/sante/themes/suivi-medical-de-lenfant-et-de-ladolescent/examen-medical-propose-ladolescent-entre-15-et-16-ans"
                  className="link text-gray-600 hover:text-gray-800"
                  target="_blank"
                  rel="noreferrer">
                  Plus d&apos;informations sur le bilan de santé obligatoire ›
                </a>
              </div>
            </section>
          </div>
        </ModalContainer>
      </Modal>
    </>
  );
}
