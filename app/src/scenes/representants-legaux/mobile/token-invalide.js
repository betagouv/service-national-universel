import React from "react";
import { environment } from "../../../config";

export default function MobileCniInvalide() {
  return (
    <>
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Jeton de validation invalide</h1>
        <p>Le jeton de validation est invalide. Veuillez vérifier que vous avez bien copié le lien complet du mail</p>
        {environment !== "production" && (
          <div className="grid gap-4 bg-amber-200 border-amber-500 p-6 my-4">
            <p>Ce message ne s&apos;affiche pas en prod :)</p>
            <p>
              Pensez bien à mettre un token dans le parent1Inscription2023Token d&apos;un young puis appeler l&apos;URL avec le token dedans genre:
              http://localhost:8081/representants-legaux?token=1234
            </p>
          </div>
        )}
      </div>
    </>
  );
}
