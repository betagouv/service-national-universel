import React from "react";
import styled from "styled-components";

export default function Index() {
  return (
    <Container>
      <Header>
        <Logos>
          <a href="https://www.snu.gouv.fr/">
            <img src={require("../../assets/fr.png")} />
          </a>
          <a href="https://www.snu.gouv.fr/">
            <img src={require("../../assets/logo-snu.png")} />
          </a>
        </Logos>
        <h1>CONDITIONS GÉNÉRALES D&apos;UTILISATION (CGU)</h1>
      </Header>
      <p>
        admin.snu.gouv.fr et moncompte.snu.gouv.fr (ci-après la « Plateforme ») sont deux sites mis en œuvre par la Direction de la jeunesse, de l&apos;éducation populaire et de la
        vie associative (DJEPVA) du Ministère de l’éducation nationale et de la jeunesse et des sports (MENJS), dans le cadre de sa politique publique. La Plateforme permet aux
        volontaires du Service National Universel (SNU) de s’inscrire et de suivre leur parcours, à l’administration de piloter et accompagner la mise en œuvre du SNU, et à des
        structures publiques, privées ou associatives de déposer des missions d’intérêt général.
      </p>
      <p>
        Les présentes conditions générales d’utilisation (ci-après dénommées « CGU ») ont pour objet de déterminer les modalités d’utilisation de la « Plateforme ». En vous
        inscrivant, vous vous engagez à respecter l’ensemble de ses dispositions, ainsi que ses éventuelles mises à jour.
      </p>
      <p>
        Cette plateforme vise à favoriser la réalisation du parcours SNU Volontaire. Par l’accès à l’information, la modification et le suivi du dossier SNU par les parties
        prenantes (Utilisateurs). Les Utilisateurs doivent adopter une disponibilité, des qualités humaines et une attitude en cohérence avec les objectifs de la Plateforme. Les
        Utilisateurs agissant dans le cadre des missions d’intérêt général se doivent de respecter les règles et valeurs de la Charte de la Réserve Civique dans la cadre de la «
        Réserve du Service National Universel”, selon les articles 7 à 11 du décret n° 2020-922 du 29 juillet 2020.
      </p>
      <section>
        <h3>Définitions</h3>
        <p>Les termes employés avec une majuscule au sein des présentes Conditions Générales d’Utilisation de la Plateforme ont la définition suivante :</p>
        <p>
          • « Service National Universel» correspond au dispositif institué par le décret n° 2020-922 du 29 juillet 2020 portant diverses dispositions relatives au Service National
          Universel.
        </p>
        <p>
          • « Utilisateur » désigne soit le « Volontaire », soit les représentants de la « Structure », soit le « Référent », soit le « Chef de centre », soit le « Modérateur ».
        </p>
        <p>
          • « Volontaire » désigne toute personne physique dotée de la capacité juridique qui souhaite s’inscrire au Service National Universel et ainsi effectuer un séjour de
          cohésion et une mission d’intérêt général.
        </p>
        <p>
          • « Structure » désigne toute personne morale constituée, sans but lucratif de droit français ou service public, souhaitant proposer une mission d&apos;intérêt général
          répondant aux orientations du Service National Universel et aux valeurs qu&apos;il promeut.
        </p>
        <p>
          • « Référent » désigne l’agent de l’administration territoriale qui veille à la mise en œuvre et à l’accompagnement des volontaires et des structures dans son territoire.
        </p>
        <p>• « Chef de centre » désigne la personne physique mandatée par l’administration pour la gestion du lieu de séjour de cohésion.</p>
        <p>
          • « Modérateur » désigne l’agent de l’administration en centrale et le membre de l’équipe de la Start Up d’Etat dédiée au SNU qui encadre la mise en œuvre du Service
          National Universel dans les territoires.
        </p>
        <p>• « Profil » désigne les informations ou données consultables en ligne par les Utilisateurs inscrits en vue de l’utilisation de la Plateforme.</p>
        <p>• « Séjour de cohésion » désigne une période de vie collective avec hébergement réalisée par le « Volontaire » et encadrée par le « Chef de centre ».</p>
        <p>• « Mission d’intérêt général » désigne la proposition d’action faite par une « Structure ».</p>
      </section>
      <section>
        <h3>Engagements de la Plateforme</h3>
        <p>En tant qu’éditeur de la Plateforme, la DJEPVA s’engage à :</p>
        <p>
          • mettre à disposition de l’Utilisateur une Plateforme permettant la réalisation du parcours du Service National Universel, se déclinant en la participation à un séjour
          de cohésion et la réalisation de 84 heures de mission d’intérêt général ;
        </p>
        <p>• mettre à disposition le service gratuitement ;</p>
        <p>• collecter, conserver, traiter, héberger les données et/ou contributions de manière loyale et conformément aux finalités de la Plateforme ;</p>
        <p>
          • prendre toute mesure nécessaire de nature à garantir la sécurité et la confidentialité des informations fournies par l’usager et notamment empêcher qu’elles soient
          déformées, endommagées ou que des tiers non autorisés y aient accès ;
        </p>
        <p>• ne commercialiser, d’aucune manière, les informations et pièces justificatives récoltées dans le cadre de la Plateforme ;</p>
        <p>
          • prendre toute mesure nécessaire de nature à garantir la sécurité et la confidentialité des informations fournies par l’usager et notamment empêcher qu’elles soient
          déformées, endommagées ou que des tiers non autorisés y aient accès ;
        </p>
        <p>• ne commercialiser, d’aucune manière, les informations et pièces justificatives récoltées dans le cadre de la Plateforme ;</p>
        <p>
          • La DJEPVA s’autorise à supprimer, sans préavis ni indemnité d’aucune sorte, tout compte faisant l’objet d’une utilisation contrevenante aux présentes CGU ou au cadre
          juridique du Service National Universel et toute Structure dont la DJEPVA estimerait que la mission ne serait pas clairement proposée sans but lucratif. L’indisponibilité
          de la Plateforme ne donne droit à aucune indemnité.
        </p>
      </section>
      <section>
        <h3>Engagements de l’Utilisateur</h3>
        <p>L’Utilisateur reconnait avoir lu les présentes CGU et s’engage à :</p>
        <p>• accepter la Charte de la Réserve civique dans le cadre de la Réserve du Service National Universel ;</p>
        <p>• accepter toute modification à venir des présentes CGU dont il aura été informé au préalable via la Plateforme;</p>
        <p>• choisir des identifiants personnels et confidentiels ;</p>
        <p>• prévenir immédiatement l’éditeur de toute utilisation non autorisée de son compte ou de ses informations ;</p>
        <p>
          • communiquer des informations à jour et exactes notamment s’agissant des informations relatives au profil, sa situation personnelle et les missions proposées. Il est
          rappelé que toute personne procédant à une fausse déclaration pour elle-même ou pour autrui s’expose, notamment, aux sanctions prévues à l’article 441-1 du Code Pénal,
          prévoyant des peines pouvant aller jusqu’à trois ans d’emprisonnement et 45 000 euros d’amende.
        </p>
        <p>
          • de ne pas tenter de nuire au bon fonctionnement du site <br />• d’utiliser le site conformément à sa destination
        </p>
        <p>
          Les Utilisateurs peuvent signaler toute description, information ou commentaire ne répondant pas aux CGU. L’éditeur se réserve le droit de supprimer et de modérer sans
          préavis, un Profil, une Mission d’intérêt général ou un commentaire si les présentes règles ne sont pas respectées.
        </p>
      </section>
      <section>
        <h3>Durée</h3>
        <p>Le présent engagement vaut pour toute la durée d’utilisation du Plateforme</p>
        <p>
          L’Utilisateur peut à tout moment et sans justification demander la fermeture de son profil en envoyant un mail à{" "}
          <a href="mailto:contact@snu.gouv.fr">contact@snu.gouv.fr</a>.
        </p>
      </section>
      <Article>
        <h3>ANNEXE</h3>
        <h5>CHARTE DE LA RÉSERVE CIVIQUE</h5>
        <h6>1° Principes directeurs</h6>
        <p>
          La réserve civique permet à toute personne qui le souhaite de s&apos;engager à servir les valeurs de la République en participant à des missions d&apos;intérêt général, à
          titre bénévole et occasionnel.
        </p>
        <p>
          La réserve civique, ses sections territoriales et les réserves thématiques qu&apos;elle comporte favorisent la participation de tout citoyen à ces missions, dans un cadre
          collectif, ponctuel ou, à titre exceptionnel, récurrent, quelles que soient ses aptitudes et compétences. Elle concourt au renforcement du lien social en favorisant la
          mixité sociale.
        </p>
        <p>
          Les domaines d&apos;actions de la réserve civique, de ses sections territoriales et des réserves thématiques recouvrent des champs d&apos;actions variés : la solidarité,
          l&apos;éducation, la culture, la santé, l&apos;environnement, le sport, la mémoire et la citoyenneté, la coopération internationale, la sécurité ou encore les
          interventions d&apos;urgence en situation de crise ou d&apos;événement exceptionnel.
        </p>
        <p>
          La réserve civique est complémentaire des autres formes d&apos;engagement citoyen que sont, d&apos;une part, la garde nationale et les réserves opérationnelles et,
          d&apos;autre part, l&apos;engagement bénévole et volontaire.
        </p>
        <h6>2° Engagements et obligations des réservistes et des organismes d&apos;accueil</h6>
        <p>L&apos;affectation à une mission nécessite l&apos;accord de l&apos;organisme d&apos;accueil et du réserviste.</p>
        <span>A. - Engagements et obligations des réservistes</span>
        <p>
          Sous réserve de satisfaire aux conditions légales et réglementaires qui régissent la réserve civique et ses sections territoriales et aux règles spécifiques propres aux
          réserves thématiques qu&apos;elle comporte, peut être réserviste toute personne volontaire souhaitant s&apos;engager dans le respect des principes directeurs de la
          réserve civique.
        </p>
        <p>Toute personne qui participe à la réserve civique, ses sections territoriales ou l&apos;une des réserves thématiques qu&apos;elle comporte s&apos;engage à :</p>
        <p>- respecter la présente charte ;</p>
        <p>- apporter son concours à titre bénévole ;</p>
        <p>- s&apos;engager pour une période déterminée, qui peut être renouvelée avec son accord ;</p>
        <p>
          - accomplir la mission pour laquelle elle est mobilisée selon les instructions données par le responsable de l&apos;organisme au sein duquel elle effectue sa mission - ou
          par toute personne que ce responsable a désignée - en tenant compte des règles de service et de fonctionnement ;
        </p>
        <p>- faire preuve d&apos;une disponibilité adaptée aux exigences de son engagement ;</p>
        <p>- observer un devoir de réserve, de discrétion et de neutralité pendant l&apos;exercice de sa mission ;</p>
        <p>- faire preuve de bienveillance envers toute personne en contact avec une mission de la réserve ;</p>
        <p>- rendre compte de sa mission à l&apos;organisme qui l&apos;accueille ;</p>
        <p>- signaler à l&apos;autorité de gestion de la réserve compétente tout incident ou anomalie survenu à l&apos;occasion de sa période d&apos;engagement ;</p>
        <p>- promouvoir l&apos;engagement citoyen sous toutes ses formes.</p>
        <span>B. - Engagements et obligations des organismes d&apos;accueil</span>
        <p>
          Les organismes qui accueillent les réservistes sont les services de l&apos;Etat, les personnes morales de droit public, notamment les établissements publics et les
          collectivités territoriales, ainsi que les organismes sans but lucratif de droit français qui portent un projet d&apos;intérêt général, répondant aux orientations de la
          réserve civique et aux valeurs qu&apos;elle promeut.
        </p>
        <p>
          Une association cultuelle ou politique, une organisation syndicale, une congrégation, une fondation d&apos;entreprise ou un comité d&apos;entreprise ne peut accueillir de
          réserviste.
        </p>
        <p>
          Les organismes éligibles proposent aux réservistes des missions compatibles avec leurs obligations professionnelles. Il ne peut être opposé à l&apos;employeur une
          quelconque forme de réquisition.
        </p>
        <p>
          Les missions impliquant une intervention récurrente de réservistes citoyens sont préalablement validées par l&apos;autorité de gestion compétente de la réserve civique.
        </p>
        <p>Les organismes d&apos;accueil s&apos;engagent à :</p>
        <p>- respecter la présente charte ;</p>
        <p>- proposer des missions conformes à l&apos;objet de la réserve civique, ses sections territoriales et ses réserves thématiques ;</p>
        <p>- proposer des missions non substituables à un emploi ou à un stage ;</p>
        <p>- préparer le réserviste à l&apos;exercice de sa mission ;</p>
        <p>- prendre en considération les attentes, les compétences et les disponibilités exprimées par le réserviste au regard des besoins de la mission proposée ;</p>
        <p>- le cas échéant, compléter la convention d&apos;engagement décrivant précisément la mission du réserviste (fréquence, lieu d&apos;exercice, durée) ;</p>
        <p>- attester du déroulement de la mission ;</p>
        <p>- participer à des actions de communication, de sensibilisation et de promotion de la réserve civique ;</p>
        <p>- couvrir le réserviste contre les dommages subis par lui ou causés à des tiers dans l&apos;accomplissement de sa mission.</p>
        <p>
          Les organismes d&apos;accueil peuvent par ailleurs rembourser les frais réellement engagés par le réserviste dans l&apos;exercice de la mission qu&apos;ils lui ont
          confiée.
        </p>
        <p>
          Tout manquement aux principes et engagements énoncés par la présente charte justifie qu&apos;il soit mis fin à la participation de la personne ou de l&apos;organisme
          concerné à la réserve civique, ses sections territoriales ou ses réserves thématiques.
        </p>
      </Article>
    </Container>
  );
}

const Header = styled.header`
  h1 {
    color: #32257f;
    letter-spacing: 1px;
    text-align: center;
    font-size: 1.8rem;
    margin: 2rem 0;
  }
`;

const Container = styled.div`
  margin: 0 auto;
  max-width: 1000px;
  padding: 1rem 3rem;
  h3 {
    font-size: 1.4rem;
    margin: 2rem 0;
  }
`;

const Article = styled.article`
  h3 {
    text-align: center;
  }
  h6 {
    margin: 1.5rem 0;
  }
  span {
    display: block;
    margin: 1rem 0;
    font-style: italic;
  }
`;

const Logos = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  a:hover {
    background-color: transparent;
    box-shadow: none;
  }
  img {
    vertical-align: top;
    height: 4rem;
    @media (max-width: 1400px) {
      height: 2.5rem;
      .mobileHide {
        height: 80px;
      }
    }
  }
`;
