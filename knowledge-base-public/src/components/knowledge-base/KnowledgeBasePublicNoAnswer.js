import { appURL, adminURL } from "../../config";
import useUser from "../../hooks/useUser";

const adminRole = [
  "admin",
  "referent_region",
  "referent_department",
  "administrateur_cle_referent_etablissement",
  "administrateur_cle_coordinateur_cle",
  "referent_classe",
  "head_center",
  "referent",
  "dsnj",
];

const KnowledgeBasePublicNoAnswer = () => {
  const { restriction } = useUser();
  const url = adminRole.includes(restriction) ? adminURL : appURL;

  return (
    <div className="mb-16 mt-4 flex flex-row items-center justify-start">
      <a href={url + "/besoin-d-aide"} className="flex flex-row items-center justify-center text-[16px] leading-6 text-snu-purple-200" target="_blank" rel="noopener noreferrer">
        <p className="text-blue-600">Je n&apos;ai pas trouvé de réponse à ma question&nbsp;→</p>
      </a>
    </div>
  );
};

export default KnowledgeBasePublicNoAnswer;
