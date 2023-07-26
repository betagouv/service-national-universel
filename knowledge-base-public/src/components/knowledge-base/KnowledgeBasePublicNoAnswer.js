import { useState } from "react";
import Modal from "../Modal";
import { environment } from "../../config";
import { HiArrowNarrowRight } from "react-icons/hi";

const KnowledgeBasePublicNoAnswer = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-16 mt-4 flex h-full w-full flex-row items-center justify-start">
      <a
        href="https://moncompte.snu.gouv.fr/public-besoin-d-aide"
        className="flex flex-row items-center justify-center text-[16px] leading-6 text-snu-purple-200"
        target="_blank"
        rel="noopener noreferrer"
      >
        <p className="text-blue-600">Je n'ai pas trouvé de réponse à ma question →</p>
      </a>
    </div>
  );
};

export default KnowledgeBasePublicNoAnswer;
