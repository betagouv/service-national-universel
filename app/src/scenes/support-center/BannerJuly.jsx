import React from "react";
import { CgDanger } from "react-icons/cg";

function BannerJuly() {
  return (
    <div className="bg-yellow-50 border-yellow-400 border-2 text-gray-800 p-4 rounded-md flex flex-col md:flex-row gap-4 my-8 max-w-6xl mx-[0.5rem] md:mx-auto">
      <CgDanger className="text-yellow-400 mx-auto" size={24} />
      <div className="flex-1 text-left space-y-4 leading-relaxed text-sm">
        <p>
          <strong>Séjour de juillet 2023 : évolution des dates de séjour</strong>
        </p>
        <p>
          Suite à la modification des dates du séjour de cohésion prévu au mois de juillet, nous avons conscience des difficultés engendrées pour les volontaires. Vous recevrez, à
          partir de la mi-juin, un e-mail vous informant de la disponibilité de votre convocation, et trouverez sur celle-ci les modalités et horaires de transport précis. Vous
          pourrez dès lors contacter votre référent départemental en cas de difficultés.
        </p>
        <p>
          En attendant la réception de votre convocation, nous ne pouvons malheureusement pas vous transmettre d'informations supplémentaires, et nous vous invitons à consulter les
          articles suivants dans notre base de connaissance :
        </p>
        <ul className="list-disc space-y-4">
          <li>
            <a
              href="https://support.snu.gouv.fr/base-de-connaissance/phase-1-le-sejour-de-cohesion"
              className="text-blue-600 underline underline-offset-2 hover:underline hover:text-blue-800">
              Phase 1 : Le séjour de cohésion
            </a>
            <p>Vous trouverez notamment des informations sur les activités prévues pendant le séjour, votre point de rassemblement, etc.</p>
          </li>
          <li>
            <a
              href="https://support.snu.gouv.fr/base-de-connaissance/examens-brevet-baccalaureat"
              className="text-blue-600 underline underline-offset-2 hover:underline hover:text-blue-800">
              Baccalauréat
            </a>
            <p>Modalités de participation, etc.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default BannerJuly;
