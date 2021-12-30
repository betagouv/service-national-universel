import { useState } from "react";
import Modal from "../Modal";

const KnowledgeBasePublicNoAnswer = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Modal className="!w-[95vw] !max-w-4xl !h-auto rounded-xl overflow-hidden" fullScreen isOpen={isOpen} onRequestClose={() => setIsOpen(false)}>
        <div className="w-full h-full flex flex-col p-12 items-center">
          <h2 className="font-bold text-lg mb-8">Je n'ai pas trouvé de réponse à ma question</h2>
          <p className="text-justify">
            Bonjour,
            <br />
            <br /> La base de connaissances du SNU se construit au fil des évolutions de la plateforme et également des besoins des utilisateurs. <br />
            Si vous n'avez pas trouvé de réponse à votre question, vous pouvez nous suggérer un sujet d'article{" "}
            <a href="https://forms.gle/tUPfh6iZwYqV3Hws9" className="text-snu-purple-200 underline" target="_blank" rel="noreferrer">
              {"en\u00A0cliquant\u00A0ici"}
            </a>
            <br />
            <br />
            ⚠️ Ce formulaire n'est pas un formulaire de contact . Vous ne recevrez pas de réponse après l'avoir rempli.
          </p>
        </div>
      </Modal>
      <button
        onClick={() => setIsOpen(true)}
        className="mx-2 bg-white hover:shadow-sm text-snu-purple-200 my-[70px] text-base font-normal shadow-base rounded-md border-0 py-3.5 px-5 smmd:mx-auto"
      >
        Je n’ai pas trouvé réponse à ma question
      </button>
    </>
  );
};

export default KnowledgeBasePublicNoAnswer;
