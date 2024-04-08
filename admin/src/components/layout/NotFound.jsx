import React from "react";
import { Redirect } from "react-router-dom";

import GenericError from "./GenericError";
import Search from "@/assets/icons/Search";

export default function NotFound({ location, homePath }) {
  if (homePath && location.pathname === "/") {
    return <Redirect to={homePath} />;
  }
  return <GenericError icon={<Search />} title="Nous n’avons pas trouvé la page demandée !" details="erreur type 404" />;
}
