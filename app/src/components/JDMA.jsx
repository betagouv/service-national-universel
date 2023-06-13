import React from "react";

export default function JDMA({ id }) {
  return (
    <a
      href={`https://jedonnemonavis.numerique.gouv.fr/Demarches/${id}?&view-mode=formulaire-avis&nd_source=button&key=060c41afff346d1b228c2c02d891931f`}
      className="relative w-36 h-16"
      onClick={handleClick}>
      <img src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-blanc.svg" alt="Je donne mon avis" className="absolute h-16" />
      <img src="https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu.svg" alt="Je donne mon avis" className="absolute h-16 hover:hidden" />
    </a>
  );
}
