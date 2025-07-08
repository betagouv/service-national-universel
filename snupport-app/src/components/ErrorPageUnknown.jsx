import React from "react";
import errorIcon2 from "../assets/errorIcon2.png";

const ErrorPageUnknown = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100">
      <img src={errorIcon2}></img>
      <p className="mt-8 h-8 text-2xl font-bold leading-7">Ooops ...</p>
      <p className="mt-6 text-xl font-normal leading-6">Une erreur s'est produite</p>
      <p className="text-base font-normal leading-6 text-gray-600">(erreur inconnue)</p>
      <p className="mt-6 text-base font-normal leading-6">Toutes nos excuses pour la gêne occasionnée. Actualisez cette page ou revenez à l'accueil.</p>
      <p className="flex flex-row text-base font-normal leading-6">
        Si le problème persiste, n'hésitez pas à&nbsp;
        <a href="https://www.snu.gouv.fr/nous-contacter/" className="cursor-pointer text-black underline">
          nous contacter
        </a>
        .
      </p>
    </div>
  );
};

export default ErrorPageUnknown;
