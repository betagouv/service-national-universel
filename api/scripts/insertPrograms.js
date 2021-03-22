require("dotenv").config({ path: "./../.env-staging" });
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
    description:
      "Qu’est-ce que c’est ? Un engagement volontaire au service de l’intérêt général, en France ou à l’étranger, auprès d’organisations à but non lucratif ou publiques, dans 9 domaines d’actions jugés « prioritaires pour la Nation » : solidarité, santé, éducation pour tous, culture et loisirs, sport, environnement, mémoire et citoyenneté, développement international et action humanitaire, intervention d’urgence. Il permet de développer sa citoyenneté comme ses compétences professionnelles. C’est pour ... les jeunes de 16 à 25 ans, jusqu’à 30 ans en situation de handicap, sans condition de diplôme. Est-ce indemnisé ? Oui, à hauteur de 580 euros net par mois. Quelle durée d’engagement ? 24 heures par semaine minimum, entre 6 et 12 mois.",
    url: "https://www.service-civique.gouv.fr/",
    type: "ENGAGEMENT",
    visibility: "NATIONAL",
    imageString: "service-civique.jpg",
  },
  {
    name: "JeVeuxAider.gouv.fr par la Réserve Civique",
    description:
      "Qu’est-ce que c’est ? Un dispositif d’engagement civique accessible à tous, auprès d’organisations publiques ou associatives, dans dix domaines d’action : santé, éducation, protection de l’environnement, culture, sport, protection ... la liste complète est disponible ici.)C’est pour ... tous les résidents du territoire français, âgés de plus de 16 ans.Est-ce indemnisé ? Non.Quelle durée d’engagement ? Les missions peuvent être courtes ou longues, ponctuelles ou récurrentes, en fonction des besoins des organisations et des envies des bénévoles.",
    url: "https://jeveuxaider.gouv.fr/",
    visibility: "NATIONAL",
    type: "ENGAGEMENT",
    imageString: "je-veux-aider.png",
  },
  {
    name: "Réserve la Gendarmerie nationale",
    description:
      "Qu’est-ce que c’est ?C’est pour ... les français de 17 à 40 ans ayant une bonne aptitude physique et ayant effectué leur JDCEst-ce indemnisé ? Oui, selon une grille fixeQuelle durée d’engagement ? Jusqu'à 30 jours par an",
    url: "https://www.gendarmerie.interieur.gouv.fr/notre-institution/generalites/nos-effectifs/reserve-gendarmerie/devenir-reserviste",
    visibility: "NATIONAL",
    type: "ENGAGEMENT",
    imageString: "reserve-gendarmerie.jpg",
  },
  {
    name: "Réserve des Armées",
    description:
      "Qu’est-ce que c’est ? Un engagement permettant de contribuer à la sécurité du pays en consacrant une partie de son temps à la défense de la France, notamment en participant à des missions de protection de la population.",
    url: "https://www.reservistes.defense.gouv.fr/",
    visibility: "NATIONAL",
    type: "ENGAGEMENT",
    imageString: "reserve-armees.jpg",
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
