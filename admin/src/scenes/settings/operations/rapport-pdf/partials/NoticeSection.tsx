import React from "react";

export default function NoticeSection() {
  return (
    <section className="break-after-page p-8">
      <h1 className="text-2xl font-bold mb-4">Lecture du rapport :</h1>
      <p className="mb-2">
        Le rapport est ordonné par région. Pour chaque région des statistiques sont afichées pour les centres concernés. Chaque page affiche les statistiques d'un centre ordonnées
        comme suit :
      </p>
      <ul>
        <li>
          Statistique sur le centre concernant (affichées en %) :
          <ul className="ml-4">
            <li>Taux de remplissage : Prises = places prises, Restantes = Places restantes.</li>
            <li>Genre : répartition des garçons et des filles. </li>
            <li>QPV- : NE venant PAS d'un quartier prioritaire. QPV+ : venant d'un quartier prioritaire. </li>
            <li>PSH- : PAS en situation de handicap. PSH+ : en situation de handicap.</li>
          </ul>
        </li>
        <li>
          Statistique liée aux lignes allant au centre (valeurs absolues) :
          <ul className="ml-4">
            <li>Cercle central : nombre de places prises (vert) et nombre de places restantes (rouge). </li>
            <li>Couronne extérieure : Lignes (id) et nombre de places prises pour le centre.</li>
          </ul>
        </li>
        <li>
          Statistique liée aux remplissages des lignes (valeurs absolues) :
          <ul className="ml-4">
            <li>Cercle central : Foncé = places prises, Clair = places restantes. </li>
            <li>
              Couronne : Pour le nombre de places restantes, affiche en rouge le nombre de jeunes disponibles pouvant théoriquement être affectés sur la ligne (même département).
            </li>
          </ul>
        </li>
      </ul>
    </section>
  );
}
