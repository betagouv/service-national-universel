import React from "react";
import { Redirect } from "react-router-dom";

import GenericError from "./GenericError";
import Search from "@/assets/icons/Search";
import { BiMapPin } from "react-icons/bi";

export default function NotFound({ location, homePath }) {
  if (homePath && location?.pathname === "/") {
    return <Redirect to={homePath} />;
  }
  const isEnigme = location?.pathname.includes("emptypage");
  return (
    <GenericError
      icon={isEnigme ? <BiMapPin className="text-4xl" /> : <Search />}
      title={isEnigme ? "Il semble que vous ayez utilisé une mauvaise navigation !" : "Nous n’avons pas trouvé la page demandée !"}
      details={isEnigme ? "erreur type ENIGME" : "erreur type 404"}
    />
  );
}
