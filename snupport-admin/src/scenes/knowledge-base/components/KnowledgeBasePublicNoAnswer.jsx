import React, { useState } from "react";
import Modal from "./Modal";

const KnowledgeBasePublicNoAnswer = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
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
              {"en\u00A0cliquant\u00A0ici"}
            </a>
            <br />
            <br />
            ⚠️ Ce formulaire n'est pas un formulaire de contact . Vous ne recevrez pas de réponse après l'avoir rempli.
          </p>
        </div>
      </Modal>
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
        className={`shadow-base smmd:mx-auto mx-2 my-[70px] rounded-md border-0 bg-white py-3.5 px-5 text-base font-normal text-snu-purple-200 hover:shadow-sm ${className} print:hidden`}
      >
        Je n’ai pas trouvé de réponse à ma question
      </button>
    </>
  );
};

export default KnowledgeBasePublicNoAnswer;
