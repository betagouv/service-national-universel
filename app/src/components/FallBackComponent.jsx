import { appURL, environment } from "@/config";
import React from "react";
import LogoSNU from "../assets/logo-snu.png";

export default function FallbackComponent({ error, componentStack }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-1 text-gray-800 text-center p-1">
      <img src={LogoSNU} alt="logo" className="w-36" />
      <p className="mt-4 font-bold text-2xl">Oups... une erreur s’est produite&nbsp;!</p>
      <p className="mt-2">Toutes nos excuses pour la gêne occasionnée.</p>
      <p>
        <a
          href=""
          className="text-blue-600 underline underline-offset-2"
          onClick={(e) => {
            e.preventDefault();
            window.location.reload();
          }}>
          Actualisez cette page
        </a>{" "}
        ou revenez à l’accueil.
      </p>

      <p>
        Si le problème persiste, n’hésitez pas à{" "}
        <a href={`${appURL}/besoin-d-aide?from=${window.location.pathname}`} className="text-blue-600 underline underline-offset-2">
          nous contacter
        </a>
        .
      </p>

      {error && environment !== "production" && (
        <div className="mt-8 text-left font-mono text-sm bg-white p-4 rounded-xl shadow">
          <div>You have encountered an error</div>
          <div>{error?.toString()}</div>
          <div className="whitespace-pre-wrap none">{componentStack}</div>
        </div>
      )}
    </div>
  );
}
