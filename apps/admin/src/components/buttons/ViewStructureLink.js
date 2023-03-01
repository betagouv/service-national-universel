import React from "react";
import { adminURL } from "../../config";

function ViewStructureLink({ structureId, className = "" }) {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      href={`${adminURL}/structure/${structureId}/edit`}
      className={`inline-block w-full border-[1px] py-2 cursor-pointer text-blue-600 rounded border-blue-600 text-center mt-4 ${className}`}>
      Voir la structure
    </a>
  );
}

export default ViewStructureLink;
