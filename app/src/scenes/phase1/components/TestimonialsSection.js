import React from "react";
import TestimonialCard from "./TestimonialCard";
import temoignageOrianeMaelle from "../../../assets/temoignages/temoignage-oriane-maelle.jpg";
import temoignageJulie from "../../../assets/temoignages/temoignage-julie.png";
import temoignageElly from "../../../assets/temoignages/temoignage-elly.jpg";
import temoignageLeilaSamuelElisa from "../../../assets/temoignages/temoignage-leila-samuel-elisa.png";

const TestimonialsSection = () => {
  const testimonials = [
    {
      title: "Oriane et Maëlle racontent leur jour 1",
      description: "Pas facile d'arriver sans repère et sans connaissance mais dès l'installation dans nos chambres, nous avons rencontré nos...",
      picture: temoignageOrianeMaelle,
      link: "https://www.snu.gouv.fr/oriane-et-maelle-racontent-leur-jour-1/",
      readingTime: "1mn de lecture",
    },
    {
      title: "A votre avis quelle est la meilleure raison d'avoir fait le SNU pour Judie et Mehdy ?",
      description: "Judie et Mehdi vous parlent de tous les bénéfices de faire le SNU.",
      picture: temoignageJulie,
      link: "https://www.snu.gouv.fr/a-votre-avis-quelle-la-meilleure-raison-davoir-fait-le-snu-pour-judie-et-mehdy/",
      readingTime: "23 secondes",
      isVideo: true,
    },
    {
      title: "Activité Théâtre pour Elly",
      description: "Pour moi, le SNU est un engagement important, basé sur un principe de solidarité entre camarades et encadrants. Il permet de tisser des liens...",
      picture: temoignageElly,
      link: "https://www.snu.gouv.fr/activite-theatre-pour-elly/",
      readingTime: "1mn de lecture",
    },
    {
      title: "Le SNU s'adresse bien à tous selon Samuel, Leïla et Élisa.",
      description: "Samuel, Leïla et Élisa vous expliquent pourquoi vous inscrire au SNU.",
      picture: temoignageLeilaSamuelElisa,
      link: "https://www.snu.gouv.fr/aucun-doute-la-snu-sadresse-bien-a-tous-selon-samuel-leila-et-elisa/",
      readingTime: "24 secondes",
      isVideo: true,
    },
  ];
  return (
    <section>
      <h2 className="m-0 mb-4 text-xl font-bold">Ils racontent leur séjour</h2>
      <div className="scrollbar-x flex justify-between gap-4 overflow-x-auto">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} />
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
