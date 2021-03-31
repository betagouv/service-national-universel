require("dotenv").config({ path: "./../.env-prod" });
require("../src/mongo");

const ProgramModel = require("../src/models/program");

const TYPE = {
  ENGAGEMENT: "ENGAGEMENT",
  FORMATION: "FORMATION",
  RECONNAISSANCE: "RECONNAISSANCE",
};

const programs = [
  {
    name: "Service Civique",
    descriptionText:
      "Qu’est-ce que c’est ? Un engagement volontaire au service de l’intérêt général, en France ou à l’étranger, auprès d’organisations à but non lucratif ou publiques, dans 9 domaines d’actions jugés « prioritaires pour la Nation » : solidarité, santé, éducation pour tous, culture et loisirs, sport, environnement, mémoire et citoyenneté, développement international et action humanitaire, intervention d’urgence. Il permet de développer sa citoyenneté comme ses compétences professionnelles. C’est pour ... les jeunes de 16 à 25 ans, jusqu’à 30 ans en situation de handicap, sans condition de diplôme. Est-ce indemnisé ? Oui, à hauteur de 580 euros net par mois. Quelle durée d’engagement ? 24 heures par semaine minimum, entre 6 et 12 mois.",
    url: "https://www.service-civique.gouv.fr/",
    type: "Engagement",
    visibility: "NATIONAL",
    imageString: "service-civique.jpg",
  },
  {
    name: "JeVeuxAider.gouv.fr par la Réserve Civique",
    descriptionText:
      "Qu’est-ce que c’est ? Un dispositif d’engagement civique accessible à tous, auprès d’organisations publiques ou associatives, dans dix domaines d’action : santé, éducation, protection de l’environnement, culture, sport, protection ... la liste complète est disponible ici.)C’est pour ... tous les résidents du territoire français, âgés de plus de 16 ans.Est-ce indemnisé ? Non.Quelle durée d’engagement ? Les missions peuvent être courtes ou longues, ponctuelles ou récurrentes, en fonction des besoins des organisations et des envies des bénévoles.",
    url: "https://jeveuxaider.gouv.fr/",
    visibility: "NATIONAL",
    type: "Engagement",
    imageString: "je-veux-aider.png",
  },
  {
    name: "Réserve la Gendarmerie nationale",
    descriptionText:
      "Qu’est-ce que c’est ?C’est pour ... les français de 17 à 40 ans ayant une bonne aptitude physique et ayant effectué leur JDCEst-ce indemnisé ? Oui, selon une grille fixeQuelle durée d’engagement ? Jusqu'à 30 jours par an",
    url: "https://www.gendarmerie.interieur.gouv.fr/notre-institution/generalites/nos-effectifs/reserve-gendarmerie/devenir-reserviste",
    visibility: "NATIONAL",
    type: "Engagement",
    imageString: "reserve-gendarmerie.jpg",
  },
  {
    name: "Réserve des Armées",
    descriptionText:
      "Qu’est-ce que c’est ? Un engagement permettant de contribuer à la sécurité du pays en consacrant une partie de son temps à la défense de la France, notamment en participant à des missions de protection de la population.",
    url: "https://www.reservistes.defense.gouv.fr/",
    visibility: "NATIONAL",
    type: "Engagement",
    imageString: "reserve-armees.jpg",
  },
  {
    name: "Réserve Civile Police Nationale",
    descriptionText:
      "Qu’est-ce que c’est ? la réserve civile de la police nationale, ouverte aux jeunes de plus de 18 ans, qui leur permet d’apporter un soutien à l’activité opérationnelle et administrative de la police ou une expertise (interprètes, juristes, informaticiens…)",
    url: "",
    visibility: "NATIONAL",
    type: "",
    imageString: "reserve-police.jpg",
  },
  {
    name: "Réserve Citoyenne de l'Education Nationale",
    descriptionText:
      "Qu’est-ce que c’est ?  C'est la possibilité de s‘engager bénévolement pour transmettre et faire vivre les valeurs de la République à l’École, aux côtés des enseignants, ou dans le cadre d’activités périscolaires. C’est pour ... les citoyens français de plus de 18 ans, dotés de compétences spécifiques. Est-ce indemnisé ? Dans certains cas, oui. Quelle durée d’engagement ? Elle est variable en fonction des situations.",
    url: "https://www.education.gouv.fr/la-reserve-citoyenne-3020",
    visibility: "NATIONAL",
    type: "Engagement",
    imageString: "reserve-education.jpg",
  },
  {
    name: "Sapeurs Pompier volontaires",
    descriptionText:
      "Qu’est-ce que c’est ? Un engagement en 4 cycles de formation sucessifs permettant de découvrir les matériels et les comportements qui sauvent, l’engagement citoyen et de mettre en œuvre procédure et matériels dans des contextes de plus en plus proches de la réalité opérationnelle. C’est pour ... les citoyens français et résidents réguliers âgés de 16 à 60 ans. Est-ce indemnisé ? Oui. Quelle durée d’engagement ? De 1 à 3 ans, à raison de 30 heures de formations puis de 6 interventions par mois en moyenne",
    url: "https://www.pompiers.fr/grand-public/devenir-sapeur-pompier/devenir-sapeur-pompier-volontaire-spv",
    visibility: "NATIONAL",
    type: "Engagement",
    imageString: "sapeur-pompier-2.jpg",
  },
  {
    name: "Chantiers de jeune bénévoles",
    descriptionText:
      "Qu’est-ce que c’est ? Les chantiers de jeunes bénévoles vous proposent des expériences de bénévolat en France et à l’étranger et rassemblent des jeunes autour d’un projet utile à la collectivité C’est pour ... les jeunes à partir de 13 ans. Est-ce indemnisé ? Non. Quelle durée d’engagement ? De 2 à 3 semaine",
    url: "https://www.jeunes.gouv.fr/Chantiers-de-jeunes-benevoles",
    visibility: "NATIONAL",
    type: "Engagement",
    imageString: "jeune-benevole.jpg",
  },
  {
    name: "BAFA",
    descriptionText:
      "Qu’est-ce que c’est ? Le brevet d’aptitude aux fonctions d’animateur d’accueil collectif de mineurs (BAFA) permet d’encadrer à titre non professionnel, de façon occasionnelle, des enfants et des adolescents en accueils collectifs de mineurs (plus généralement appelés colo/centres de vacances et centres de loisirs). C’est pour ... les jeunes dès 17 ans. Est-ce indemnisé ? Non, mais ensuite vous pouvez encadrer des mineurs en étant indemnisé. Quelle durée d’engagement ? 28 jours minimum, en 3 temps : 8 jours de formation, 14 jours effectifs en stage de formation et 6 à 8 jours d'approndissement ensuite",
    url: "https://www.jeunes.gouv.fr/spip.php?article3676",
    visibility: "NATIONAL",
    type: "Formation",
    imageString: "bafa.jpg",
  },
  {
    name: "Brevet Fédéraux ou diplôme des fédérations sportives",
    descriptionText: "",
    url: "https://sports.gouv.fr/emplois-metiers/diplomes-et-encadrement/",
    visibility: "NATIONAL",
    type: "Formation",
    imageString: "brevet-federaux.jpg",
  },
  {
    name: "Engagement bénévole",
    descriptionText:
      "Tout engagement associatif, ouvert à tous les citoyens, permettant de s’investir bénévolement en faveur de l’intérêt général au sein d’une association.",
    url: "https://www.jeunes.gouv.fr/-Benevolat-",
    visibility: "NATIONAL",
    type: "Engagement",
    imageString: "benevole.jpg",
  },
  {
    name: "Présentation du CEC",
    descriptionText: "",
    url: "https://www.moncompteformation.gouv.fr/espace-public/le-compte-engagement-citoyen-cec",
    visibility: "NATIONAL",
    type: "Reconnaissance",
    imageString: "cec.jpg",
  },
  {
    name: "Juniors Association",
    descriptionText:
      "Qu’est-ce que c’est ? Junior Association est une démarche souple qui permet à tout groupe de jeunes de mettre en place des projets dans une dynamique associative. C’est pour ... les jeunes de 11 à 18 ans. Est-ce indemnisé ? Non. Quelle durée d’engagement ? Cela dépend de la Junior Association",
    url: "https://juniorassociation.org/index.php",
    visibility: "NATIONAL",
    type: "Engagement",
    imageString: "juniors-association.jpg",
  },
  {
    name: "Le Corps européen de solidarité",
    descriptionText:
      "Qu’est-ce que c’est ? Le corps européen de solidarité offre la possibilité de se porter volontaires dans des projets organisés en France ou à l’étranger et destinés à aider des communautés et des personnes dans toute l’Europe. C’est pour ... les jeunes de 18 à 30 ans. Est-ce indemnisé ? Non. Quelle durée d’engagement ? De 2 à 12 mois",
    url: "https://corpseuropeensolidarite.fr/",
    visibility: "NATIONAL",
    type: "Engagement",
    imageString: "corps-europeen-solidarite.png",
  },
  {
    name: "Le Volontariat de Solidarité Internationale",
    descriptionText:
      "Qu’est-ce que c’est ? les différentes formes de volontariat à l’international, et notamment le volontariat de solidarité internationale ou le service civique à l’international. C’est pour ... les citoyens du monde de plus de 18 ans (sans condition de nationalité ni limite d'âge) Est-ce indemnisé ? Oui, le montant dépend du pays de la mission et votre logement, vos frais de transport et nourriture sont pris en charge. Quelle durée d’engagement ? Une mission dure entre 1 an et 2 ans.",
    url: "https://www.france-volontaires.org/avant-le-volontariat/les-differents-volontariats/le-volontariat-de-solidarite-internationale-vsi/",
    visibility: "NATIONAL",
    type: "Engagement",
    imageString: "volontariat-solidarite-internationale.jpg",
  },
  {
    name: "Le Service Civique à l'International",
    descriptionText:
      "Qu’est-ce que c’est ? Le VSI permet de s'engager auprès d'associations agréées ayant pour objet des actions de solidarité internationale (enseignement, développement urbain et rural, santé, actions d'urgence...). C’est pour ... tous les jeunes entre 16 à 25 ans (jusqu'à 30 ans pour les jeunes en situation de handicap). Est-ce indemnisé ? Oui, à hauteur de 522 euros net par mois. Quelle durée d’engagement ? De 6 à 12 mois ",
    url: "https://www.france-volontaires.org/avant-le-volontariat/les-differents-volontariats/le-service-civique/",
    visibility: "NATIONAL",
    type: "Engagement",
    imageString: "service-civique-international.jpg",
  },
  {
    name: "Erasmus +, programme de l'Agence du Service Civique",
    descriptionText:
      "Qu’est-ce que c’est ? Le programme vise à donner aux étudiants, aux stagiaires, au personnel et d'une manière générale aux jeunes de moins de 30 ans avec ou sans diplôme, la possibilité de séjourner à l’étranger pour renforcer leurs compétences et accroître leur employabilité. C’est pour ... les jeunes de 16 à 25 ans (jusqu'à 30 ans pour les jeunes en situation de handicap). Est-ce indemnisé ? Oui. Quelle durée d’engagement ? De 6 à 12 mois",
    url: "https://info.erasmusplus.fr/",
    visibility: "NATIONAL",
    type: "Engagement",
    imageString: "erasmus.jpg",
  },
];

(async () => {
  let count = 0;
  await ProgramModel.deleteMany({});
  for (let i = 0; i < programs.length; i++) {
    try {
      const program = programs[i];
      await ProgramModel.create(program);
      count++;
      console.log(count, program.name);
    } catch (e) {
      console.log("e", e);
    }
  }
  process.exit(1);
})();
