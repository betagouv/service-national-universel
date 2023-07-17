import React from "react";
import { HiExclamationCircle } from "react-icons/hi";

export default function PreinscriptionBanner() {
  return (
    <div className="w-full bg-blue-50 border-2 rounded-md text- text-blue-800 p-4 border-blue-100 my-3 flex gap-2 items-center">
      <HiExclamationCircle className="flex-none text-2xl text-blue-400" />
      <p>Connectez-vous à votre compte pour poursuivre votre inscription.</p>
    </div>
  );
}
