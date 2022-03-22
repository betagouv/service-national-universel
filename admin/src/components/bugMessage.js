import React from "react";
import Warning from "../assets/RoundWarning";

export default function BugMessage() {
  return (
    <div className="flex bg-[#fff] p-8 border mx-4 mb-4 border-[#e2e2ea] rounded-[10px] items-center">
      <article>
        <h2 className="flex items-center text-xl font-bold mt-0">
          <Warning className="mr-2" />
          BUG - Pièces téléversées impossibles à télécharger
        </h2>
        <section className="">
          Pour tous les jeunes dont le statut d&apos;inscription actuel est : <strong>En cours</strong> • <strong>En attente de validation</strong> •{" "}
          <strong>En attente de correction</strong> - ET qui ont téléversé des documents entre le <strong>21 mars 14H50 et le 22 mars 10H30</strong>, il faut :
          <ol className="list-decimal ml-3">
            <li>Supprimer l&apos;ensemble des documents</li>
            <li>
              Passer leur dossier : <strong>en attente de correction</strong>
            </li>
            <li>
              Leur demander de les re-téléverser (voir modèle ci-joint) :{" "}
              <em>
                "Suite à un bug technique, l&apos;ensemble de vos pièces ont été endommagées, nous avons dû les supprimer. Pouvez-vous les téléverser à nouveau ? Veuillez nous
                excuser pour la gêne occasionnée."
              </em>
            </li>
          </ol>
          <p>Nous nous excusons pour la gêne occasionnée et restons disponible pour toute sollicitation.</p>
        </section>
      </article>
    </div>
  );
}
