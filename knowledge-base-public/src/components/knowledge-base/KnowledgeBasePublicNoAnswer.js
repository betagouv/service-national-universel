import { appURL } from "../../config";

const KnowledgeBasePublicNoAnswer = () => {
  return (
    <div className="mb-16 mt-4 flex h-full w-full flex-row items-center justify-start">
      <a href={appURL + "/besoin-d-aide"} className="flex flex-row items-center justify-center text-[16px] leading-6 text-snu-purple-200" target="_blank" rel="noopener noreferrer">
        <p className="text-blue-600">Je n&apos;ai pas trouvé de réponse à ma question&nbsp;→</p>
      </a>
    </div>
  );
};

export default KnowledgeBasePublicNoAnswer;
