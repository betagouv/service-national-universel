import React from "react";
import { adminURL } from "../../config";

function ViewStructureLink({ structureId, className = "" }) {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      href={`${adminURL}/structure/${structureId}/edit`}
      className={`mt-4 inline-block w-full cursor-pointer rounded border-[1px] border-blue-600 py-2 text-center text-blue-600 ${className}`}>
      Voir la structure
    </a>
  );
}

export default ViewStructureLink;
