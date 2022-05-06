import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setYoung } from "../../../redux/auth/actions";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";

export default function RulesDetail({ young, setShowStep = null, show = null }) {
  const dispatch = useDispatch();
  const [showCompleteRules, setShowCompleteRules] = useState(false);
  const [accept, setAccept] = useState();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (young) {
      setAccept(young.rulesYoung === "true");
    }
  }, [young]);

  const handleSubmit = async () => {
    if (accept) {
      if (show) setShowStep(!show);
      const { data, ok } = await api.put(`/young/phase1/rules`, { rulesYoung: "true" });
      if (!ok) return toastr.error("Une erreur est survenue lors de la validation du réglement");
      toastr.success("Modification enregistrée");
      dispatch(setYoung(data));
    } else {
      setError(true);
    }
  };

  return (
    <>
      <div className="flex flex-col px-2 md:px-14">
        <p className="text-sm text-gray-600 leading-5 text-center">
          Vous devez lire et accepter les règles de fonctionnement propres aux centres du Service National Universel exposées dans le règlement intérieur ci-joint avant votre
          départ en séjour. Cette étape est un pré-requis au séjour de cohésion.
        </p>
        {showCompleteRules ? (
          completeRules()
        ) : (
          <>
            <div className="border-[1px] p-6 mt-6 rounded-xl">
              <p className="text-gray-500 md:text-sm text-xs leading-5 md:text-justify">
                PRÉAMBULE <br /> Le service national universel (SNU) est un projet d'émancipation des jeunes, complémentaire de l'instruction obligatoire. Il s'articule autour d'un
                « séjour de cohésion », de deux semaines, et d'une « mission d'intérêt général », de deux semaines également, qui peuvent être complétés par « engagement volontaire
                » de l'appelé.
              </p>
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                className="border-[1px] px-4 py-2 mt-6 border-blue-700 text-blue-700 rounded-lg text-sm hover:scale-105 hover:shadow-sm cursor-pointer"
                onClick={() => setShowCompleteRules(true)}>
                Lire l'intégralité (obligatoire)
              </button>
            </div>
            <div className="border-[1px] p-6 mt-6 rounded-xl">
              <p className="text-gray-500 text-xs md:text-sm leading-5 md:text-justify">
                ... <br />
                1.2.3 Laïcité <br /> Le respect de la laïcité s'impose aux cadres, personnels, intervenants et aux volontaires des centres SNU : l'ensemble des cadres, intervenants
                et des personnels mobilisés dans le cadre des centres SNU exercent une mission de service public et sont donc soumis à l'obligation de stricte neutralité
                religieuse, en application de l'article 1er de la loi du 20 avril 2016. Les signes et manifestations d'appartenance religieuse des cadres, intervenants et
                personnels sont rigoureusement proscrits au sein du centre SNU et au cours des activités. De la même façon, il est interdit aux volontaires de porter tout signe
                ostensible d'appartenance religieuse au sein des centres SNU, à l'exclusion des espaces privés (le cas échéant, leur chambre personnelle uniquement). Un espace
                dédié, accessible à tous et réservé au recueillement individuel, est aménagé dans chaque centre.
              </p>
            </div>
          </>
        )}
        <div className="flex flex-row bg-gray-50 rounded-xl mt-6 px-8 py-2">
          <input type="checkbox" className="rounded-lg mr-3 cursor-pointer" checked={accept} onChange={(e) => setAccept(e.target.checked)} disabled={young.rulesYoung === "true"} />
          <div className="flex-1 text-xs md:text-sm leading-5 text-gray-500">
            Je,{" "}
            <strong>
              {young.firstName} {young.lastName}
            </strong>{" "}
            certifie avoir lu et accepté les règles de fonctionnement propres aux centres du Service National Universel exposées dans le règlement intérieur ci-dessus.
          </div>
        </div>
        {error ? <p className="text-xs text-red-500 text-center">Vous devez accepter le reglement interieure pour continuer</p> : null}

        <div className="flex justify-center md:justify-end items-stretch my-6">
          {young.rulesYoung !== "true" ? (
            <button
              type="button"
              className={`flex-1 md:flex-none md:px-16 py-2 bg-blue-600 text-white rounded-lg text-sm hover:scale-105 hover:shadow-sm disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-auto cursor-pointer`}
              disabled={!showCompleteRules}
              onClick={handleSubmit}>
              Accepter
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}

const completeRules = () => {
  return (
    <div>
      <div className="border-[1px] p-6 mt-6 rounded-xl text-gray-500 md;text-sm text-xs leading-5 md:text-justify">
        <p className="pb-2">PRÉAMBULE</p>
        Le service national universel (SNU) est un projet d'émancipation des jeunes, complémentaire de l'instruction obligatoire. Il s'articule autour d'un « séjour de cohésion »,
        de deux semaines, et d'une «mission d'intérêt général», de deux semaines également, qui peuvent être complétés par «engagement volontaire» de l'appelé.
        <p className="pb-2">
          Le séjour de cohésion est organisé par l'État, sous la direction des préfets de département et des recteurs d'académie. Il s'effectue dans le respect des obligations de
          sécurité des accueils collectifs de mineurs (ACM), telles que définies par l'article L. 227-4 du Code de l'action sociale et des familles (CASF) conformément à l'arrêté
          du 14 mars 2019.
        </p>
        <p className="pb-2">
          Le présent règlement intérieur définit les règles de fonctionnement propres aux centres SNU, sans préjudice des dispositions relatives à l'usage des locaux des règlements
          intérieurs des établissements dans lesquels ils sont hébergés, et conformément à la réglementation en vigueur spécifique aux ACM. Le règlement intérieur du CSNU a pour
          objet d'assurer la parfaite sécurité des volontaires pendant le séjour de cohésion et de favoriser l'atteinte des quatre objectifs des séjours de cohésion :
        </p>
        <p className="pb-2 pl-4">
          • Accroître la cohésion et la résilience de la Nation en développant une culture de l'engagement. <br />
          • Garantir un brassage social et territorial de l'ensemble d'une classe d'âge. <br />
          • Renforcer l'orientation et l'accompagnement des volontaires dans la construction de leur parcours personnel et professionnel.
          <br /> • Valoriser les territoires, leurs dynamiques et leur patrimoine culturel et naturel.
        </p>
        <p className="pb-2">
          Les enjeux de développement durable, de transition écologique et solidaire, sont au cœur du fonctionnement quotidien du séjour de cohésion. Cet engagement se traduit,
          autant que faire se peut, par une organisation en cohérence avec les ambitions portées.
        </p>
        <p className="pb-2">
          Le règlement intérieur commun est porté à la connaissance de chaque volontaire et de ses représentants légaux, qui attestent par écrit en avoir pris connaissance et
          s'engager à respecter ses dispositions. Le règlement intérieur représente un engagement réciproque entre le volontaire et l'État ; il oblige les signataires à le
          respecter et à le faire respecter.
        </p>
        <p className="pb-2">1. VALEURS, DROITS ET OBLIGATIONS DES VOLONTAIRES</p>
        <p className="pb-2 indent-8 underline">1.1 TRANSMISSION DES VALEURS DE LA RÉPUBLIQUE</p>
        <p className="pb-2 indent-16 italic">1.1.1 Rites de la vie en collectivité</p>
        <p className="pb-2">
          La promotion des valeurs républicaines et l'éducation à la citoyenneté, dans le cadre d'une expérience de la vie collective, sont au cœur des finalités du séjour de
          cohésion.
        </p>
        <p className="pb-2">
          À cette fin, la journée débute par un moment organisé autour des symboles de la République, en particulier le lever des couleurs et le chant de l'hymne national. La
          participation de l'ensemble des cadres, du personnel et des volontaires à ces temps collectifs est obligatoire.
        </p>
        <p className="pb-2">Le port de la tenue est obligatoire afin de promouvoir les valeurs de cohésion et d'égalité.</p>
        <p className="pb-2">Les cadres expliquent le sens de ces symboles aux volontaires afin que ceux-ci en perçoivent les finalités.</p>
        <p className="pb-2">
          À la fin du séjour, une cérémonie est organisée par les autorités civiles et militaires de l'État dans le département les cadres et le personnel du centre ainsi que les
          volontaires sont tenus d'y prendre part.
        </p>
        <p className="pb-2">
          Chaque fois que celles-ci sont possibles, les commémorations nationales sont célébrées dans le centre ou dans une ou plusieurs communes avoisinantes (18 juin, 11
          novembre, 8 mai, etc.).
        </p>
        <p className="pb-2 indent-16 italic">1.1.2 Démocratie interne</p>
        <p className="pb-2">
          La démocratie interne fait partie intégrante de la formation à la citoyenneté des volontaires. Elle est organisée en particulier par les cadres lors de temps dédiés
          quotidiennement.
        </p>
        <p className="pb-2">Il s'agit autant d'un temps de retour sur la journée que d'un temps de participation des volontaires qui pourront exprimer leur opinion.</p>
        <p className="pb-2">
          Sous la responsabilité des cadres responsables, des conseils permettent d'aborder tous les sujets touchant à la vie de la maisonnée contenu des modules, rythme de la
          journée, aspects matériels, relations entre les volontaires et les cadres, propositions des volontaires, etc.
        </p>
        <p className="pb-2">
          Lors de ces conseils, les cadres veillent à diversifier les modalités de sollicitation de l'expression des volontaires pour la rendre vivante et susciter la participation
          de tous. Ils veillent en particulier à l'absence de propos offensants, discriminants ou contraires aux valeurs de neutralité du service public.
        </p>
        <p className="pb-2 indent-8 underline">1.2 APPRENTISSAGE DES PRINCIPES RÉPUBLICAINS</p>
        <p className="pb-2 indent-16 italic">1.2.1 Respect des principes républicains</p>
        <p className="pb-2">
          Le séjour de cohésion vise à promouvoir les valeurs républicaines auprès des volontaires et à préparer la réalisation d'une mission d'intérêt général.
        </p>
        <p className="pb-2">
          Par conséquent, les volontaires sont tenus à un comportement compatible avec la réalisation d'une mission d'intérêt général auprès de la population comme à la
          participation à des cérémonies nationales ou locales. En particulier, les principes d'égalité et de laïcité doivent être strictement respectés par les cadres, les
          intervenants, les personnels comme par les volontaires.
        </p>
        <p className="pb-2 indent-16 italic">1.2.2 Égalité</p>
        <p className="pb-2">Les cadres, les intervenants et le personnel veillent à l'égalité de traitement des volontaires dans le respect strict du principe d'égalité.</p>
        <p className="pb-2 indent-16 italic">1.2.3 Laïcité</p>
        <p className="pb-2">
          Le respect de la laïcité s'impose aux cadres, personnels, intervenants et aux volontaires des centres SNU l'ensemble des cadres, intervenants et des personnels mobilisés
          dans le cadre des centres SNU exercent une mission de service public et sont donc soumis à l'obligation de stricte neutralité religieuse, en application de l'article 1er
          de la loi du 20 avril 2016.
        </p>
        <p className="pb-2">
          Les signes et manifestations d'appartenance religieuse des cadres, intervenants et personnels sont rigoureusement proscrits au sein du centre SNU et au cours des
          activités. De la même façon, il est interdit aux volontaires de porter tout signe ostensible d'appartenance religieuse au sein des centres SNU, à l'exclusion des espaces
          privés (le cas échéant, leur chambre personnelle uniquement).
        </p>
        <p className="pb-2">Un espace dédié, accessible à tous et réservé au recueillement individuel, est aménagé dans chaque centre.</p>
        <p className="pb-2 indent-16 italic">1.2.4 Neutralité</p>
        <p className="pb-2">
          Les volontaires, les cadres et l'ensemble des personnels mobilisés dans les centres et au cours des activités veillent au respect de la neutralité philosophique et
          politique en application de l'article 1er de la loi du 9 décembre 1905.
        </p>
        <p className="pb-2">
          Les convictions religieuses, politiques, idéologiques de chacun sont respectées mais ne doivent pas donner lieu à des actions de propagandes ou à du prosélytisme,
          lesquelles constituent des atteintes à l'ordre public.
        </p>
        <p className="pb-2 indent-8 underline">1.3 PROMOTION DE LA CULTURE DE L'ENGAGEMENT</p>
        <p className="pb-2 indent-16 italic">1.3.1 Obligation de participer aux activités</p>
        <p className="pb-2">
          Le séjour de cohésion est une phase obligatoire du SNU et l'ensemble des activités qui sont proposées pendant son déroulement sont obligatoires. Le volontaire qui ne
          participe pas à une ou plusieurs activités s'expose à la non-validation de sa participation au séjour de cohésion, sauf si l'équipe du centre a préalablement autorisé
          explicitement son défaut de participation.
        </p>
        <p className="pb-2 indent-16 italic">1.3.2 Ponctualité</p>
        <p className="pb-2">La ponctualité aux activités est une exigence pour chacun pendant toute la durée du séjour. Tout retard non justifié aux activités est sanctionné.</p>
        <p className="pb-2">
          Les tuteurs de maisonnée sont responsables devant le chef de compagnie de la ponctualité et de la participation aux activités des volontaires dont ils ont la charge.
        </p>
        <p className="pb-2">2. ORGANISATION DE LA VIE COMMUNE</p>
        <p className="pb-2 indent-8 underline">2.1 MODÈLE D'ENCADREMENT</p>
        <p className="pb-2">La direction du centre est assurée par par une équipe de direction composée de trois cadres expérimentés :</p>
        <p className="pb-2 pl-4">
          • <strong>un chef de centre</strong>, nommé par le préfet de région et le recteur de région académique sur proposition conjointe du préfet et de l'IA-DASEN. Premier
          formateur du centre, il est garant du respect des finalités du stage et de la pédagogie mise en œuvre. Pour les volontaires et pour les cadres, il incarne l'autorité de
          l'État et donne du sens à l'ensemble du séjour de cohésion ; <br />• <strong>un adjoint éducatif</strong>, chargé des activités, justifiant d'une expérience préalable
          dans la direction d'une structure d'accueil de mineurs ou comme personnel de direction de l'Éducation nationale ; <br /> • <strong>un adjoint encadrement</strong>, chargé
          de la direction et de la coordination des cadres, justifiant d'une expérience d'encadrement, notamment dans les armées, dans un établissement éducatif des armées, ou dans
          un établissement de l'Éducation nationale ou populaire.
        </p>
        <p className="pb-2">
          L'encadrement des compagnies est assuré par un binôme de cadres expérimentés. On distingue un cadre de compagnie, chargé du dialogue avec l'équipe de direction et de
          l'animation de la compagnie, et un adjoint. Ce binôme est responsable de l'encadrement de la vie courante de la compagnie. II dirige l'action des tuteurs et résout les
          éventuelles difficultés rencontrées par la compagnie, notamment disciplinaires.
        </p>
        <p className="pb-2">
          Chaque maisonnée est animée par un tuteur, chargé de l'encadrement de proximité des volontaires. Placé sous l'autorité du cadre de compagnie et de son adjoint, il fait
          vivre la discipline courante, mobilise les volontaires en vue des activités prévues et des services confiés à leur maisonnée, et s'assure de la bonne participation au
          quotidien des volontaires en situation de handicap ou présentant des problèmes de santé. Le tuteur crée les conditions propices à l'objectif de brassage et de cohésion,
          il veille à susciter un esprit d'appartenance, par exemple au travers de signes de reconnaissance de la maisonnée, qui peuvent faire l'objet d'activités dédiées. En cas
          de difficulté, il rend compte au cadre de compagnie ou à son adjoint. Les tuteurs peuvent également, selon leurs compétences et le projet éducatif mis en œuvre,
          participer à l'animation de certaines activités.
        </p>
        <p className="pb-2">
          Une équipe de soutien de trois personnes, à la disposition du chef et de ses adjoints, appuie les cadres de contact et les tuteurs. Cette équipe est composée :
        </p>
        <p className="pb-2 pl-4">
          • d'un intendant du centre, en charge des aspects administratifs et logistiques, qui dispose idéalement d'un véhicule utilitaire dédié ; <br /> • d'un infirmier, qui peut
          également assurer la fonction de référent sanitaire et qui dispense les soins infirmiers aux jeunes volontaires et aux cadres, met en œuvre la procédure relative au
          repérage des jeunes éloignés du système de santé et contribue à la promotion de la santé ; <br /> • d'un référent sport et cohésion, chargé de renforcer le continuum
          éducatif des séjours veillant à fonder, autant que possible, l'ensemble des activités sur la mise en activité et a cohésion.
        </p>
        <p className="pb-2 indent-8 underline">2.2 LES CONSEILS DE DÉMOCRATIE</p>
        <p className="pb-2">Afin de permettre la participation des volontaires à la vie du centre, les conseils suivants sont réunis :</p>
        <p className="pb-2 indent-16 italic">2.2.1 Les conseils de maisonnée</p>
        <p className="pb-2">Ils rassemblent les volontaires d'une même maisonnée autour de leur tuteur. Ils se réunissent tous les jours à l'issue des activités.</p>
        <p className="pb-2">
          Des échanges thématiques peuvent également être organisés dans ce cadre. Ils permettent l'apprentissage de la culture du débat, de la prise de parole en public, de
          l'argumentation et de la tolérance.
        </p>
        <p className="pb-2 indent-16 italic">2.2.2 Les conseils de compagnie</p>
        <p className="pb-2">
          Réunis deux à quatre fois au cours du séjour, ils rassemblent un représentant de chaque maisonnée, désigné sur la base du volontariat ou tiré au sort, et le cadre de
          compagnie. Les représentants lors des conseils sont renouvelés à chaque réunion.
        </p>
        <p className="pb-2 indent-16 italic">2.2.3 Le conseil de brigade</p>
        <p className="pb-2">
          Les conseils de brigade sont réunis au moins deux fois par séjour sous l'autorité du chef de centre, en particulier afin de préciser les modalités d'organisation de la
          cérémonie finale. Le conseil de brigade peut également être convoqué autant que de besoin par le chef de centre.
        </p>
        <p className="pb-2">Ces conseils sont composés d'un représentant de chaque compagnie désigné sur la base du volontariat ou tiré au sort.</p>
        <p className="pb-2 indent-8 underline">2.3 PARTICIPATION À LA VIE COMMUNE</p>
        <p className="pb-2">
          La répartition des volontaires en maisonnées vise à encourager la cohésion et la responsabilité collective, le brassage géographique et social ainsi que la participation
          à la gestion de la maisonnée au travers des réunions des conseils de démocratie interne.
        </p>
        <p className="pb-2">
          Dans une démarche de responsabilisation, les volontaires sont associés à l'ensemble des travaux d'entretien et de fonctionnement du centre, au travers des permanences de
          « services » organisées par roulement.
        </p>
        <p className="pb-2">
          Ces services comprennent des tâches quotidiennes liées aux repas, au nettoyage et à la gestion des déchets ainsi que la participation à l'organisation des activités ou à
          la réception des intervenants.
        </p>
        <p className="pb-2">
          L'adjoint au chef de centre en charge de l'encadrement fixe l'organisation de ces services par compagnie, au travers d'un tableau de services, décliné par les chefs de
          compagnie par maisonnée. Les conseils de compagnie sont autant que possible associés à l'élaboration du tableau de service.
        </p>
        <p className="pb-2">3. SÉCURITÉ DES PERSONNES ET DES BIENS</p>
        <p className="pb-2 indent-8 underline">3.1 SÉCURITÉ DES PERSONNES</p>
        <p className="pb-2 indent-16 italic">3.1.1 Consignes générales de sécurité</p>
        <p className="pb-2">
          Les consignes générales de « sécurité-hygiène » des établissements qui hébergent les centres SNU s'appliquent sous la responsabilité des tuteurs. À leur arrivée, les
          volontaires sont informés par le tuteur des consignes de sécurité.
        </p>
        <p className="pb-2 indent-16 italic">3.1.2 Sécurité incendie</p>
        <p className="pb-2">Un exercice de sécurité incendie est organisé dans chaque centre, dès le début du séjour.</p>
        <p className="pb-2">
          Pendant le déroulement du séjour, en cas d'ordre d'évacuation, les volontaires se conforment à la procédure prévue dans le règlement intérieur de l'établissement
          hébergeur.
        </p>
        <p className="pb-2">Les volontaires se conforment également aux instructions du tuteur ou autres cadres du centre qui conduisent l'opération d'évacuation.</p>
        <p className="pb-2 indent-16 italic">3.1.3 Visites et sorties</p>
        <p className="pb-2">
          Sauf autorisation expresse du chef de centre, les visites aux volontaires pendant le séjour ne sont pas autorisées. Il est interdit de faire pénétrer dans le centre toute
          personne qui n'aurait pas reçu l'autorisation expresse de l'administration.
        </p>
        <p className="pb-2">
          Les sorties ne sont pas admises pendant l'ensemble du séjour de cohésion. Dans les cas le justifiant, une sortie exceptionnelle peut être autorisée par le chef du centre
          à la demande des représentants légaux des volontaires.
        </p>
        <p className="pb-2">
          Le chef prévoit, selon le cas, un accompagnement du volontaire. Le volontaire n'est alors plus sous la responsabilité du centre SNU s'il est pris en charge pour sa sortie
          par ses représentants légaux.
        </p>
        <p className="pb-2 indent-16 italic">3.1.4 Responsabilité, assurance et suivi médical</p>
        <p className="pb-2">Les volontaires sont couverts pour tous les dommages qu'ils pourraient subir dans le cadre des activités organisées par le centre SNU.</p>
        <p className="pb-2">
          Le présent règlement vaut information auprès des responsables légaux du volontaire de leur intérêt à se garantir pour les dommages que celui-ci pourrait causer du fait
          d'une faute personnelle dépourvue de tout lien avec le service et dont ils seront tenus responsables en application de l'article 1242 du code civil.
        </p>
        <p className="pb-2">
          Lors de l'inscription, un formulaire précisant les informations médicales à fournir en application de la réglementation des ACM est remis aux représentants légaux des
          volontaires.
        </p>
        <p className="pb-2 indent-8 underline">3.2 SÉCURITÉ DES BIENS</p>
        <p className="pb-2 indent-16 italic">3.2.1 Détention d'objets dangereux</p>
        <p className="pb-2">
          Il est interdit d'introduire dans le centre tout produit toxique ou inflammable ainsi que tout objet dangereux, par nature ou par destination. Tout manquement est
          sanctionné.
        </p>
        <p className="pb-2 indent-16 italic">3.2.2 Protection contre le vol</p>
        <p className="pb-2">
          L'État ne peut être tenu responsable des effets personnels des volontaires durant leur séjour. Avant de quitter les lieux de vie, les volontaires rangent leurs affaires
          dans les armoires ou casiers mis à leur disposition et les ferment à clé, ou les rangent dans tout autre endroit sécurisé indiqué par les cadres.
        </p>
        <p className="pb-2 indent-8 underline">3.3 TENUE ET HYGIÈNE</p>
        <p className="pb-2 indent-16 italic">3.3.1 Tenue</p>
        <p className="pb-2">Chaque volontaire et chaque cadre reçoit gracieusement une tenue à son arrivée.</p>
        <p className="pb-2">
          Le volontaire est responsable de sa tenue qu'il doit protéger contre le vol et la dégradation. Le port de ces tenues doit être digne, et en particulier, la tenue doit
          être propre et sans panachage.
        </p>
        <p className="pb-2">Chaque volontaire se munit d'un trousseau personnel, contenant les articles nécessaires pour la durée du séjour.</p>
        <p className="pb-2 indent-16 italic">3.3.2 Hygiène</p>
        <p className="pb-2">
          Les règles d'hygiène personnelle sont observées durant le séjour. matin et soir, dans le rythme quotidien des volontaires. À cet effet, un temps d'hygiène est prévu,
        </p>
        <p className="pb-2">
          Chaque volontaire veille à éviter de porter tout élément d'ornement corporel susceptible de présenter un risque en termes d'hygiène ou de sécurité pour lui ou pour les
          autres volontaires, en particulier lors des activités sportives ou lors de certains temps collectifs. Les bijoux comme le maquillage doivent être discrets.
        </p>
        <p className="pb-2">4. SANTÉ ET HANDICAP</p>
        <p className="pb-2 indent-8 underline">4.1 SUIVI SANITAIRE</p>
        <p className="pb-2">Un infirmier est chargé d'assurer le suivi sanitaire des volontaires.</p>
        <p className="pb-2">
          Chaque centre dispose d'un local permettant d'isoler les malades et d'assurer également l'accueil des volontaires et la prise en charge des incidents mineurs.
        </p>
        <p className="pb-2">
          Tout volontaire qui présente une pathologie chronique ou qui doit suivre un traitement médical pendant le séjour dispose avec lui d'une ordonnance médicale pour toute
          prise de médicaments.
        </p>
        <p className="pb-2 indent-8 underline">4.2 PRISE EN CHARGE INDIVIDUALISÉE (PAI) ET PROJET PERSONNALISÉ DE SCOLARISATION (PPS)</p>
        <p className="pb-2">
          Lorsqu'un volontaire bénéficie d'un protocole de prise en charge individualisée (PAI) du fait d'une pathologie chronique ou aiguë, il en informe le responsable du centre
          SNU lors de son inscription et en transmet une copie, en même temps que sa fiche sanitaire. Le centre prendra en compte ces PAI et PPS afin d'anticiper et mettre en place
          les modalités organisationnelles et matérielles requises, en concertation avec le volontaire et sa famille et, le cas échéant, le médecin ou l'équipe qui le suit
          habituellement au titre de son PAI ou PPS.
        </p>
        <p className="pb-2">
          Le responsable du centre veille à ce que les modalités d'adaptation requises par le PAI ou le PPS soient effectives, répondent aux besoins des volontaires et permettent
          leur intégration dans de bonnes conditions.
        </p>
        <p className="pb-2 indent-8 underline">4.3 GESTION DES ACCIDENTS</p>
        <p className="pb-2">
          En cas d'accident, le cadre responsable du suivi sanitaire, ou en son absence un autre cadre, assure les premiers secours et contacte les secours si nécessaire. Il en
          informe immédiatement le chef de centre, alors chargé de l'information des familles et des autorités publiques.
        </p>
        <p className="pb-2">Un protocole d'urgence est prévu dans le centre. Il est porté à la connaissance de tous les encadrants.</p>
        <p className="pb-2 indent-8 underline">4.4 TABAC, ALCOOL ET STUPEFIANTS</p>
        <p className="pb-2">Le chef de centre est responsable du respect de l'interdiction de fumer conformément aux dispositions légales applicables.</p>
        <p className="pb-2">
          L'introduction et la consommation d'alcool et de stupéfiants dans le centre sont formellement interdites. Le manquement à cette règle peut entraîner des mesures pouvant
          aller jusqu'à l'exclusion.
        </p>
        <p className="my-2 py-2 px-2 border-2 border-black bg-violet-100">
          Pour faciliter l'application de cette interdiction relative à la consommation de tabac, alcool, stupéfiants, les volontaires pourront bénéficier d'un accompagnement par
          l'infirmier(e) du centre
        </p>
        <p className="pb-2">5. RÈGLES DE COMPORTEMENT</p>
        <p className="pb-2 indent-8 underline">5.1 RESPECT DES PERSONNES</p>
        <p className="pb-2 indent-16 italic">5.1.1 Règles générales</p>
        <p className="pb-2">
          Pour chaque volontaire et encadrant toute attitude inconvenante ou irrespectueuse est proscrite. Toute forme de brimade entre volontaires est proscrite et sanctionnée.
        </p>
        <p className="pb-2 indent-16 italic">5.1.2 Harcèlement, discrimination et sexisme</p>
        <p className="pb-2">
          Toute discrimination fondée sur les convictions politiques, religieuses, philosophiques, syndicales ou tenant à l'origine sociale, au sexe, à l'état de santé, au
          handicap, à l'origine ethnique ou à toute forme de discrimination prévue par la loi, est proscrite et est sanctionnée.
        </p>
        <p className="pb-2">
          Il est rappelé que le harcèlement, la discrimination et l'outrage sexiste sont systématiquement signalés au procureur de la République par le chef de centre conformément
          à l'article 40 du code de procédure pénale.
        </p>
        <p className="pb-2 indent-16 italic">5.1.3 Agressions et violences</p>
        <p className="pb-2">
          Les agressions physiques ou sexuelles sont sanctionnées et signalées au procureur de la République conformément à l'article 40 du code de procédure pénale.
        </p>
        <p className="pb-2">
          À l'occasion de la première cérémonie de lever des couleurs, l'adjoint encadrement rappelle les dispositions spécifiques du code pénal visant la prévention et la
          répression des infractions sexuelles et du bizutage (articles -. 225-16-1 à L. 225-16-3 du code pénal).
        </p>
        <p className="pb-2 indent-8 underline">5.2 RESPECT DES BIENS</p>
        <p className="pb-2 indent-16 italic">5.2.1 Respect des locaux et du cadre de vie</p>
        <p className="pb-2">Les volontaires s'engagent à se conformer aux règles de vie mises en place dans le centre.</p>
        <p className="pb-2">De l'extinction des feux au lever, le sommeil des volontaires partageant une même maisonnée doit être respecté. </p>
        <p className="pb-2 indent-16 italic">5.2.2 Respect des matériels</p>
        <p className="pb-2">Les volontaires utilisent le matériel mis à leur disposition avec respect et précaution.</p>
        <p className="pb-2 indent-8 underline">5.3 POLITESSE ET COURTOISIE</p>
        <p className="pb-2 indent-16 italic">5.3.1 Civilité</p>
        <p className="pb-2">Les règles de politesse et de courtoisie en usage doivent être respectées envers l'ensemble des encadrants du centre ainsi qu'entre volontaires.</p>
        <p className="pb-2">
          Les volontaires doivent appeler les militaires par leur grade lorsque ceux-ci sont en tenue, le personnel civil « madame ou monsieur » et sont tenus de vouvoyer
          l'ensemble du personnel.
        </p>
        <p className="pb-2">Les militaires en tenue se présenteront par leur grade afin que celui-ci soit connu des volontaires.</p>
        <p className="pb-2 indent-16 italic">5.3.2 Langage</p>
        <p className="pb-2">
          Tout propos inconvenant est proscrit, en particulier dans le cadre de la mixité filles/garçons. Tout propos discriminant, humiliant et dégradant donne lieu à une
          intervention adaptée d'un membre du corps encadrant.
        </p>
        <p className="pb-2 indent-16 italic">5.3.3 Usage des téléphones portables</p>
        <p className="pb-2">
          L'usage par les volontaires de leur téléphone portable et autres objets numériques personnels est proscrit pendant les activités, sauf autorisation d'un cadre. La durée
          totale d'utilisation des téléphones portables sur une journée ne pourra excéder une heure.
        </p>
        <p className="pb-2">
          chef de centre définit les modalités de contact entre les volontaires et leur famille. Les tuteurs peuvent, le cas échéant, se voir confier un téléphone portable à cet
          effet.
        </p>
        <p className="pb-2">
          La législation relative à la protection de la vie privée s'applique de plein droit, conformément à l'article 9 du code civil et aux articles 226-1 à 226-3-1 du code
          pénal, aux personnels comme aux volontaires, sous la responsabilité du chef de maisonnée.
        </p>
        <p className="pb-2">
          En particulier, les volontaires s'abstiennent de diffuser des photos et vidéos afin de ne pas porter atteinte au droit à l'image des autres volontaires et des cadres. Les
          cadres de compagnie s'assurent en particulier du respect de cette consigne.
        </p>
        <p className="pb-2">6. SANCTIONS</p>
        <p className="pb-2">
          Les sanctions collectives sont proscrites. Les sanctions disciplinaires concernent les atteintes aux personnes et aux biens ainsi que des manquements graves ou répétés
          aux obligations du volontaire.
        </p>
        <p className="pb-2">
          Une réflexion autour des faits qui donnent lieu à sanction et du sens des sanctions peut faire l'objet d'une discussion lors d'un créneau de démocratie interne.
        </p>
        <p className="pb-2 indent-8 underline">6.1 ÉCHELLE DES SANCTIONS</p>
        <p className="pb-2">L'échelle des sanctions qui peuvent être prononcées à l'encontre des volontaires est la suivante, par ordre de gravité :</p>
        <p className="pb-2 pl-4">
          • punition sous forme de services individuels, décidée par les chefs de compagnie ; <br /> • avertissement, prononcé par le chef de centre, après avis du conseil de
          discipline ; <br />
          • exclusion prononcée par le chef de centre, après avis du conseil de discipline.
        </p>
        <p className="pb-2 indent-8 underline">6.2 PUNITIONS </p>
        <p className="pb-2">
          Les infractions mineures au règlement intérieur sont sanctionnées de punitions visant à responsabiliser les volontaires. Ces punitions sont laissées à l'autorité des
          chefs de compagnie, sur proposition éventuelle des cadres de compagnie et des tuteurs.
        </p>
        <p className="pb-2">
          Ces sanctions consistent dans la participation de l'appelé sanctionné aux services du centre, en sus des services confiés aux volontaires par roulement. Sont exclus les
          travaux humiliants ou vexatoires. Afin d'éviter toute confusion entre, d'une part, la participation à la vie commune et, d'autre part, les punitions, les chefs de
          compagnie veillent à prononcer à titre de punition des tâches distinctes des tâches réalisées au titre de la participation à la vie commune.
        </p>
        <p className="pb-2">La réalisation des mesures de responsabilisation confiées aux volontaires punis s'effectue sous le contrôle de l'adjoint encadrement</p>
        <p className="pb-2">Le conseil de compagnie passe systématiquement en revue les punitions décidées à l'encontre des volontaires de la compagnie à des fins éducatives.</p>
        <p className="pb-2 indent-16 italic">6.2.2 L'exclusion</p>
        <p className="pb-2">
          L'exclusion est prononcée par le chef de centre, sur proposition de l'adjoint encadrement ou sur saisine d'office et après avis du conseil de discipline.
        </p>
        <p className="pb-2">Elle peut être prononcée dans les cas suivants</p>
        <p className="pb-2 pl-4">
          • si le comportement de l'appelé s'avère incompatible avec la vie en groupe ; <br /> • si l'appelé est responsable de troubles graves ; <br /> • en cas de récidive ou de
          nouvelle infraction grave après un avertissement.
        </p>
        <p className="pb-2">Elle est systématiquement prononcée en cas d'agression physique ou d'infraction pénale. </p>
        <p className="pb-2">En cas d'exclusion, le chef de centre organise, en lien avec les représentants légaux de l'appelé, les modalités de son retour vers son domicile.</p>
        <p className="pb-2">L'exclusion donne lieu à une notification écrite du chef de centre.</p>
        <p className="pb-2 indent-8 underline">6.3 LE CONSEIL DE DISCIPLINE </p>
        <p className="pb-2">
          En cas de faute grave susceptible d'emporter un avertissement ou une exclusion, le chef de centre, sur proposition de l'adjoint encadrement ou sur saisine d'office,
          convoque un conseil de discipline
        </p>
        <p className="pb-2">Le conseil de discipline, présidé par le chef de centre, se compose des personnes suivantes</p>
        <p className="pb-2 pl-4">
          • chef de centre ; <br /> • adjoint encadrement ;<br /> • adjoint éducatif; <br /> • chef de compagnie de l'appelé ; <br /> • tuteur de maisonnée de l'appelé ; <br /> •
          représentant de la compagnie désigné par un conseil de compagnie, à l'exclusion des volontaires de la maisonnée de l'appelé incriminé.
        </p>
        <p className="pb-2">
          Lors de la réunion du conseil de discipline, l'appelé dispose du droit d'être entendu et peut être assisté par une personne de son choix, sous réserve que celle-ci puisse
          intervenir sans délai et sans frais auprès du volontaire.
        </p>
        <p className="pb-2">
          La réunion du conseil de discipline donne lieu à un avis collégial, prononcé à la majorité absolue des membres. Cet avis est rendu à l'attention du chef de centre, qui
          reste seule autorité décisionnaire.
        </p>
        <p className="pb-2">
          Dans l'attente de la réunion du conseil de discipline, le volontaire peut faire l'objet à titre provisoire d'une mise à pied qui l'exclut de la participation aux
          activités.
        </p>
        <p className="pt-6 pb-2">Tableau indicatif des sanctions (non exhaustif)</p>
        <div className="flex justify-center">
          <img className="md:max-w-2xl" src={require("../../../assets/tabRulesYoung.png")} />
        </div>
      </div>
    </div>
  );
};
