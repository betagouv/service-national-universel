import React from "react";

export default function JDMA({ id }) {
  const url = `https://jedonnemonavis.numerique.gouv.fr/Demarches/${id}?&view-mode=formulaire-avis&nd_source=button&key=060c41afff346d1b228c2c02d891931f`;
  const [imgSrc, setImgSrc] = React.useState("https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu.svg");
  return (
    <a href={url} target="_blank" rel="noreferrer noopener">
      <div
        className="w-36 h-16"
        onMouseEnter={() => setImgSrc("https://jedonnemonavis.numerique.gouv.fr/static/bouton-blanc.svg")}
        onMouseLeave={() => setImgSrc("https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu.svg")}>
        <img src={imgSrc} alt="Je donne mon avis" />
      </div>
    </a>
  );
}
