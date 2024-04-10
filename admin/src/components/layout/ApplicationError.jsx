import React from "react";

import GenericError from "./GenericError";
import Puzzle from "@/assets/icons/Puzzle";

export default function ApplicationError({ error, componentStack }) {
  return <GenericError icon={<Puzzle />} title="Une erreur s’est produite !" details="erreur inconnue" error={error} componentStack={componentStack} />;
}
