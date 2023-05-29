import React from "react";

export default function JDMA({ id }) {
  return (
    <div className="flex justify-end pt-4 pb-8 pr-8">
      <a href={`https://jedonnemonavis.numerique.gouv.fr/Demarches/${id}?&view-mode=formulaire-avis&nd_source=button&key=060c41afff346d1b228c2c02d891931f`}>
        <img src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu.svg" alt="Je donne mon avis" className="h-[60px]" />
      </a>
    </div>
  );
}
