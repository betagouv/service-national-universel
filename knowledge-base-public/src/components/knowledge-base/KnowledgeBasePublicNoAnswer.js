import { useState } from "react";
import Modal from "../Modal";
import { environment } from "../../config";

const KnowledgeBasePublicNoAnswer = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {environment === "production" ? (
        <>
          <Modal className="!h-auto !w-[95vw] !max-w-4xl overflow-hidden rounded-xl" fullScreen isOpen={isOpen} onRequestClose={() => setIsOpen(false)}>
            <div className="flex h-full w-full flex-col items-center p-12">
              <h2 className="mb-8 text-lg font-bold">Je n'ai pas trouvé de réponse à ma question</h2>
              <p className="text-justify">
                Bonjour,
                <br />
                <br /> La base de connaissance du SNU se construit au fil des évolutions de la plateforme et également des besoins des utilisateurs. <br />
                Si vous n'avez pas trouvé de réponse à votre question, vous pouvez nous suggérer un sujet d'article{" "}
                <a href="https://forms.gle/tUPfh6iZwYqV3Hws9" className="text-snu-purple-200 underline" target="_blank" rel="noreferrer">
                  {"en\u00A0cliquant\u00A0ici."}
                </a>
                <br />
                <br />
                ⚠️ Ce formulaire n'est pas un formulaire de contact . Vous ne recevrez pas de réponse après l'avoir rempli.
              </p>
              <div>
                Vous pouvez nous contacter{" "}
                <a href="https://moncompte.snu.gouv.fr/public-besoin-d-aide" className="text-snu-purple-200 underline" target="_blank" rel="noopener noreferrer">
                  en cliquant ici.
                </a>
              </div>
            </div>
          </Modal>
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(true);
            }}
            className={`mx-2 my-[70px] rounded-md border-0 bg-white px-5 py-3.5 text-base font-normal text-snu-purple-200 shadow-base hover:shadow-sm smmd:mx-auto ${className} print:hidden`}
          >
            Je n’ai pas trouvé de réponse à ma question
          </button>
        </>
      ) : (
        <>
          <div className="flex h-full w-full flex-row items-center justify-start mt-4 mb-16">
            <a href="https://moncompte.snu.gouv.fr/public-besoin-d-aide" className="text-[16px] flex flex-row leading-6 text-snu-purple-200" target="_blank" rel="noopener noreferrer">
              <p>Je n'ai pas trouvé de réponse à ma question</p>
              <span className="material-icons ml-2 text-[16px] leading-6 text-snu-purple-200">arrow_forward</span>
            </a>
          </div>
        </>
      )}
    </>
  );
};

export default KnowledgeBasePublicNoAnswer;
