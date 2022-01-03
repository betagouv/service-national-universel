import React, { useState } from "react";
import Modal from "./modal";

export default function EligibilityModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Modal className="!w-[95vw] !max-w-4xl !h-auto rounded-xl overflow-hidden" fullScreen isOpen={isOpen} onRequestClose={() => setIsOpen(false)}>
        <div className="w-full h-full flex flex-col p-12 items-center">
          <h2 className="font-bold text-lg mb-8">Je n&apos;ai pas trouvé de réponse à ma question</h2>
          <p className="text-justify">
            Bonjour,
            <br />
            <br /> La base de connaissances du SNU se construit au fil des évolutions de la plateforme et également des besoins des utilisateurs. <br />
            Si vous n&apos;avez pas trouvé de réponse à votre question, vous pouvez nous suggérer un sujet d&apos;article{" "}
            <a href="https://forms.gle/tUPfh6iZwYqV3Hws9" className="text-[#4F46E5] underline" target="_blank" rel="noreferrer">
              {"en\u00A0cliquant\u00A0ici"}
            </a>
            <br />
            <br />
            ⚠️ Ce formulaire n&apos;est pas un formulaire de contact . Vous ne recevrez pas de réponse après l&apos;avoir rempli.
          </p>
        </div>
      </Modal>
      <button onClick={() => setIsOpen(true)} className="bg-white text-[#4F46E5] my-[70px] text-base shadow-base rounded-md py-3.5 px-5 mx-auto">
        Vérifier mon éligibilité
      </button>
    </>
  );
}
