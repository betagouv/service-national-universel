import { appURL, adminURL } from "../../config";
import useUser from "../../hooks/useUser";
import { useEffect, useState } from "react";
const KnowledgeBasePublicNoAnswer = () => {
  const { restriction } = useUser();
  const [userRole, setUserRole] = useState(restriction || "public");

  let url;
  if (userRole === "young" || userRole === "public") url = appURL;
  else if (userRole !== null && userRole !== "public" && userRole !== "young") url = adminURL;
  else url = appURL;

  return (
    <div className="mb-16 mt-4 flex flex-row items-center justify-start">
      <a href={url + "/besoin-d-aide"} className="flex flex-row items-center justify-center text-[16px] leading-6 text-snu-purple-200" target="_blank" rel="noopener noreferrer">
        <p className="text-blue-600">Je n&apos;ai pas trouvé de réponse à ma question&nbsp;→</p>
      </a>
    </div>
  );
};

export default KnowledgeBasePublicNoAnswer;
