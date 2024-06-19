import { AppelAProjetDemarcheSimplifieeDto } from "../../../providers/demarcheSimplifiee/appelAProjetDemarcheSimplifieeDto";

export const getMockAppelAProjetDto = (hasNextPage: boolean): AppelAProjetDemarcheSimplifieeDto => ({
  data: {
    demarche: {
      id: "id",
      number: 91716,
      title: 'Appel à projets "classe engagée"',
      dossiers: {
        pageInfo: {
          hasPreviousPage: true,
          hasNextPage: hasNextPage,
          startCursor: "startCursor",
          endCursor: "endCursor",
        },
        nodes: [
          {
            __typename: "Dossier",
            id: "dossierId",
            number: 1000,
            archived: false,
            prefilled: false,
            state: "en_instruction",
            motivation: null,
            usager: {
              email: "email@usager.fr",
            },
            prenomMandataire: "prenomMandataire",
            nomMandataire: "nomMandataire",
            deposeParUnTiers: true,
            connectionUsager: "password",
            demandeur: {
              __typename: "PersonnePhysique",
              civilite: "Mme",
              nom: "nom",
              prenom: "prenom",
              email: null,
            },
            demarche: {
              revision: {
                id: "idRevision",
              },
            },
            instructeurs: [
              {
                id: "idInstructeur=",
                email: "email@instructeur.fr",
              },
            ],
            traitements: [
              {
                state: "en_construction",
                emailAgentTraitant: null,
                dateTraitement: "2024-05-27T09:13:18+02:00",
                motivation: null,
              },
            ],
            champs: [
              {
                id: "Q2hhbXAtMzI2MTY1OA==",
                champDescriptorId: "Q2hhbXAtMzI2MTY1OA==",
                label: "La « classe engagée » développe, au niveau de la seconde et en première année de CAP, un projet pédagogique qui répond à plusieurs critères :",
                stringValue: "",
              },
              {
                id: "Q2hhbXAtNDA3MDY1Ng==",
                champDescriptorId: "Q2hhbXAtNDA3MDY1Ng==",
                label:
                  "Les candidatures pour obtenir le label « classe engagée » s’effectuent au moyen du présent questionnaire. Chaque projet de « classe engagée » doit faire l’objet d’une candidature séparée.",
                stringValue: "",
              },
              {
                id: "Q2hhbXAtMzI2MTcwNQ==",
                champDescriptorId: "Q2hhbXAtMzI2MTcwNQ==",
                label: "1. INFORMATIONS GENERALES",
                stringValue: "",
              },
              {
                id: "Q2hhbXAtNDA1MTE2NQ==",
                champDescriptorId: "Q2hhbXAtNDA1MTE2NQ==",
                label: "Sur l'établissement",
                stringValue: "",
              },
              {
                id: "Q2hhbXAtNDA1MTE3NQ==",
                champDescriptorId: "Q2hhbXAtNDA1MTE3NQ==",
                label: "Région académique",
                stringValue: "Auvergne-Rhône-Alpes",
              },
              {
                id: "Q2hhbXAtNDA1MTE3OA==",
                champDescriptorId: "Q2hhbXAtNDA1MTE3OA==",
                label: "Académie",
                stringValue: "Grenoble",
              },
              {
                id: "Q2hhbXAtMzI3Njc4NQ==",
                champDescriptorId: "Q2hhbXAtMzI3Njc4NQ==",
                label: "Département",
                stringValue: "07 - Ardèche",
              },
              {
                id: "Q2hhbXAtMzI2MTcwMw==",
                champDescriptorId: "Q2hhbXAtMzI2MTcwMw==",
                label: "Etablissement, Ville (UAI)",
                stringValue: "Un nom de lycée, Grenoble (SOME_UAI)",
              },
              {
                id: "Q2hhbXAtNDA5MDU1MA==",
                champDescriptorId: "Q2hhbXAtNDA5MDU1MA==",
                label: "Veuillez cocher cette case si, et seulement si, le souffleur du champ précédent ne propose ni le nom, ni le numéro UAI de votre établissement.",
                stringValue: "false",
              },
              {
                id: "Q2hhbXAtNDA1MTI1OA==",
                champDescriptorId: "Q2hhbXAtNDA1MTI1OA==",
                label: "Secteur",
                stringValue: "Etablissement public",
              },
              {
                id: "Q2hhbXAtMzI2MjQ4Mw==",
                champDescriptorId: "Q2hhbXAtMzI2MjQ4Mw==",
                label: "Adresse électronique générique de l'établissement",
                stringValue: "mail@etablissement.fr",
              },
              {
                id: "Q2hhbXAtNDA1MTQ0Mg==",
                champDescriptorId: "Q2hhbXAtNDA1MTQ0Mg==",
                label: "L’établissement est-il situé dans un quartier prioritaire de la politique de la ville (QPV) ?",
                stringValue: "false",
              },
              {
                id: "Q2hhbXAtNDA1MTQ0Mw==",
                champDescriptorId: "Q2hhbXAtNDA1MTQ0Mw==",
                label: "L’établissement a-t-il mis en place un projet de classe engagée en 2023/2024 ?",
                stringValue: "true",
              },
              {
                id: "Q2hhbXAtNDA1MTQ0OQ==",
                champDescriptorId: "Q2hhbXAtNDA1MTQ0OQ==",
                label: "Sur le chef d'établissement",
                stringValue: "",
              },
              {
                id: "Q2hhbXAtMzI2MjQ4MA==",
                champDescriptorId: "Q2hhbXAtMzI2MjQ4MA==",
                label: "Nom du chef d'établissement :",
                stringValue: "NOM_CHEF_ETABLISSEMENT",
              },
              {
                id: "Q2hhbXAtNDA1MTQ1MQ==",
                champDescriptorId: "Q2hhbXAtNDA1MTQ1MQ==",
                label: "Prénom du chef d'établissement",
                stringValue: "PRENOM_CHEF_ETABLISSEMENT",
              },
              {
                id: "Q2hhbXAtNDA1MTUxMw==",
                champDescriptorId: "Q2hhbXAtNDA1MTUxMw==",
                label: "Sur le référent de la classe engagée",
                stringValue: "",
              },
              {
                id: "Q2hhbXAtNDA1MTUxNg==",
                champDescriptorId: "Q2hhbXAtNDA1MTUxNg==",
                label: "Nom du référent",
                stringValue: "NOM_REFERENT",
              },
              {
                id: "Q2hhbXAtNDA1MTUxNw==",
                champDescriptorId: "Q2hhbXAtNDA1MTUxNw==",
                label: "Prénom du référent",
                stringValue: "PRENOM_REFERENT",
              },
              {
                id: "Q2hhbXAtNDA1MTUxOA==",
                champDescriptorId: "Q2hhbXAtNDA1MTUxOA==",
                label: "Discipline d'enseignement ou statut",
                stringValue: "DISCIPLINE 1",
              },
              {
                id: "Q2hhbXAtMzI2MjU4MA==",
                champDescriptorId: "Q2hhbXAtMzI2MjU4MA==",
                label: "Adresse électronique du référent :",
                stringValue: "email@referent.fr",
              },
              {
                id: "Q2hhbXAtMzI2MjU4NQ==",
                champDescriptorId: "Q2hhbXAtMzI2MjU4NQ==",
                label: "2.\tDESCRIPTION DU PROJET PEDAGOGIQUE DE LA CLASSE",
                stringValue: "",
              },
              {
                id: "Q2hhbXAtNDA1NDIzMg==",
                champDescriptorId: "Q2hhbXAtNDA1NDIzMg==",
                label: "Quel intitulé avez-vous donné à votre classe engagée ?",
                stringValue: "SNU 2024 2025",
              },
              {
                id: "Q2hhbXAtMzI2MjY4MQ==",
                champDescriptorId: "Q2hhbXAtMzI2MjY4MQ==",
                label: "Quelles sont les disciplines qui portent le projet ?",
                stringValue: "ACTIVITES NON SPECIALISEES",
              },
              {
                id: "Q2hhbXAtNDA1NDEyNg==",
                champDescriptorId: "Q2hhbXAtNDA1NDEyNg==",
                label: "Elèves concernés : Le projet concerne-t-il :",
                stringValue: "Un groupe d’élèves issus de plusieurs classes",
              },
              {
                id: "Q2hhbXAtNDA1NDEzNA==",
                champDescriptorId: "Q2hhbXAtNDA1NDEzNA==",
                label:
                  "Nombre d’élèves prévus : Attention l’effectif minimal pour la labellisation d’un projet de CLE est fixé à 15 élèves, tout projet proposant un effectif inférieur devra faire l’objet d’une argumentation spécifique concernant le nombre d’élèves impliqués dans la présentation prévue ci-dessous.",
                stringValue: "42",
              },
              {
                id: "Q2hhbXAtNDA1NDE3OQ==",
                champDescriptorId: "Q2hhbXAtNDA1NDE3OQ==",
                label: "Le projet concerne :",
                stringValue: "Des élèves scolarisés en voie professionnelle ou en apprentissage",
              },
              {
                id: "Q2hhbXAtNDA1NDIyNQ==",
                champDescriptorId: "Q2hhbXAtNDA1NDIyNQ==",
                label: "Ces élèves sont-ils concernés par les dispositifs suivants ?",
                stringValue: "",
              },
              {
                id: "Q2hhbXAtNDA1NDI0Mw==",
                champDescriptorId: "Q2hhbXAtNDA1NDI0Mw==",
                label:
                  "Quelle est la thématique dominante de votre projet  (cette thématique déterminera la coloration que suivront les élèves pendant le séjour de cohésion du SNU qu’ils effectueront dans le cadre de ce projet) ?",
                stringValue: "Résilience et prévention des risques",
              },
              {
                id: "Q2hhbXAtNDA1NDI1Mg==",
                champDescriptorId: "Q2hhbXAtNDA1NDI1Mg==",
                label: "Présentez votre projet en quelques lignes en insistant notamment sur l'articulation de votre projet et du séjour de cohésion du SNU (600 mots maximum).",
                stringValue: "Mon projet",
              },
              {
                id: "Q2hhbXAtNDA1NDI1Mw==",
                champDescriptorId: "Q2hhbXAtNDA1NDI1Mw==",
                label: "Si vous le souhaitez, vous pouvez joindre un document de présentation au format pdf.",
                stringValue: "",
              },
              {
                id: "Q2hhbXAtNDA1NDI2Mg==",
                champDescriptorId: "Q2hhbXAtNDA1NDI2Mg==",
                label: "Votre établissement bénéficie-t-il déjà d’un label ?",
                stringValue: "Un label",
              },
              {
                id: "Q2hhbXAtMzI2NTc3OA==",
                champDescriptorId: "Q2hhbXAtMzI2NTc3OA==",
                label: "3. REALISATION DU SEJOUR DE COHESION DU SERVICE NATIONAL UNIVERSEL (SNU)",
                stringValue: "",
              },
              {
                id: "Q2hhbXAtMzI2NTc5Mg==",
                champDescriptorId: "Q2hhbXAtMzI2NTc5Mg==",
                label:
                  "La labellisation d’une « classe engagée » implique la participation, sur une même période, de l'ensemble des élèves de la classe ou du groupe impliqués dans le projet à un séjour de cohésion SNU de douze jours sur temps scolaire à l'identique des séjours hors temps scolaire.",
                stringValue: "",
              },
              {
                id: "Q2hhbXAtNDA1NDQyMw==",
                champDescriptorId: "Q2hhbXAtNDA1NDQyMw==",
                label:
                  "A quelle période souhaitez-vous que votre classe réalise prioritairement le séjour de cohésion ? La date précise de réalisation du séjour vous sera communiquée fin août/début septembre 2024.",
                stringValue: "Au 3ème trimestre (séjour réalisé en avril, mai ou juin 2025).",
              },
              {
                id: "Q2hhbXAtNDA3NzUxOA==",
                champDescriptorId: "Q2hhbXAtNDA3NzUxOA==",
                label:
                  "Si votre candidature au label concerne une ou plusieurs classes de l’enseignement professionnel, précisez les dates déjà fixées pour les périodes de formation en milieu professionnel (PFMP), afin que celles-ci puissent être prises en compte lors du processus d’affectation de la classe engagée en séjour de cohésion :",
                stringValue: "DATE 2",
              },
            ],
            annotations: [],
          },
        ],
      },
    },
  },
});
