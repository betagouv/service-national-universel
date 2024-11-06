import React from "react";

export default function JDMA({ id }) {
  const url = `https://jedonnemonavis.numerique.gouv.fr/Demarches/${id}?&view-mode=formulaire-avis&nd_source=button&key=060c41afff346d1b228c2c02d891931f`;
  const [imgSrc, setImgSrc] = React.useState("https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu.svg");

  return (
    <>
      <style>
        {`
          .no-underline {
            text-decoration: none;
          }
          .no-after::after {
            display: none;
          }
        `}
      </style>
      <a href={url} target="_blank" rel="noreferrer noopener" className="no-underline no-after">
        <div
          className="w-36 h-16"
          onMouseEnter={() => setImgSrc("https://jedonnemonavis.numerique.gouv.fr/static/bouton-blanc.svg")}
          onMouseLeave={() => setImgSrc("https://jedonnemonavis.numerique.gouv.fr/static/bouton-bleu.svg")}>
          <img src={imgSrc} alt="Je donne mon avis" />
        </div>
      </a>
    </>
  );
}
