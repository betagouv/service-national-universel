import React from "react";
import Unlock from "../../../../../assets/icons/Unlock";

export default function JDMNotDone() {
  return (
    <div className="mt-8 mb-16 space-y-3 px-6 md:mt-0 md:mb-8 md:max-w-md md:px-10">
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