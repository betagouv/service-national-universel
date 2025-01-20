import React from "react";
import Unlock from "../../../../../assets/icons/Unlock";

export default function JDMNotDone() {
  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <Unlock className="saturate-0" />
      </div>
      <p className="text-center text-xl font-bold leading-7">
        Réalisez votre JDC et <br />
        obtenez votre certificat !
      </p>
    </div>
  );
}
