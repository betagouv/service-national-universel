const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { buildArbitratyNdJson } = require("./utils");
const { ROLES } = require("snu-lib");
const CohortModel = require("../../models/cohort");

router.post("/default", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    function queryFromFilter(filter, { regionField = "region.keyword", departmentField = "department.keyword" } = {}) {
      const body = {
        size: 0,
        track_total_hits: 1000, // We don't need the exact number of hits when more than 1000.
        query: { bool: { must: { match_all: {} }, filter } },
      };
      if (req.user.role === ROLES.REFERENT_REGION) body.query.bool.filter.push({ term: { [regionField]: req.user.region } });
      if (req.user.role === ROLES.REFERENT_DEPARTMENT) body.query.bool.filter.push({ terms: { [departmentField]: req.user.department } });
      return body;
    }

    const cohorts = await CohortModel.find({});
    const cohortsNotFinished = cohorts.filter((c) => new Date(c.dateEnd) > Date.now()).map((e) => e.name);
    const cohortsNotStarted = cohorts.filter((c) => new Date(c.dateStart) > Date.now()).map((e) => e.name);

    const response = await esClient.msearch({
      index: "young",
      body: buildArbitratyNdJson(
        //
        // Inscriptions (5/5 done)
        //

        // Dossier (À instruire) X dossiers d’inscriptions sont en attente de validation.
        // inscription_en_attente_de_validation
        { index: "young", type: "_doc" },
        queryFromFilter([
          { terms: { "cohort.keyword": cohortsNotFinished } },
          { terms: { "status.keyword": ["WAITING_VALIDATION"] } },
          { bool: { must_not: { exists: { field: "correctionRequests.keyword" } } } },
        ]),
        // Dossier (À instruire) X dossiers d’inscription corrigés sont à instruire de nouveau.
        // inscription_corrigé_à_instruire_de_nouveau
        { index: "young", type: "_doc" },
        queryFromFilter([
          { terms: { "cohort.keyword": cohortsNotFinished } },
          { terms: { "status.keyword": ["WAITING_VALIDATION"] } },
          { bool: { must: { exists: { field: "correctionRequests.keyword" } } } },
        ]),
        // Dossier (À relancer) X dossiers d’inscription en attente de correction
        // inscription_en_attente_de_correction
        { index: "young", type: "_doc" },
        queryFromFilter([{ terms: { "cohort.keyword": cohortsNotFinished } }, { terms: { "status.keyword": ["WAITING_CORRECTION"] } }]),
        // Droit à l’image (À relancer) X volontaires sans accord renseigné
        // inscription_sans_accord_renseigné
        { index: "young", type: "_doc" },
        queryFromFilter([
          { terms: { "cohort.keyword": cohortsNotFinished } },
          { term: { isAssignmentAnnouncementsOpenForYoung: true } },
          { range: { dateEnd: { lt: "now" } } },
          { bool: { should: [{ term: { status: "VALIDATED" } }, { term: { status: "WAITING_LIST" } }], minimum_should_match: 1 } },
          { bool: { should: [{ term: { parentAllowSNU: "N/A" } }, { bool: { must_not: { exists: { field: "parentAllowSNU" } } } }], minimum_should_match: 1 } },
        ]),

        //
        // Séjours
        //

        // Point de rassemblement (À suivre) X volontaires n’ont pas confirmé leur point de rassemblement
        // sejour_rassemblement_non_confirmé
        { index: "young", type: "_doc" },
        queryFromFilter([
          { terms: { "cohort.keyword": cohortsNotFinished } },
          { exists: { field: "sessionId" } },
          { exists: { field: "lineId" } },
          { bool: { should: [{ term: { mettingPointId: "N/A" } }, { bool: { must_not: { exists: { field: "mettingPointId" } } } }], minimum_should_match: 1 } },
        ]),
        // Participation (À suivre) X volontaires n’ont pas confirmé leur participation au séjour de [Février 2023-C]
        // sejour_participation_non_confirmée
        { index: "young", type: "_doc" },
        queryFromFilter([
          {
            bool: {
              should: [{ term: { youngPhase1Agreement: "false" } }, { bool: { must_not: { exists: { field: "youngPhase1Agreement" } } } }],
              minimum_should_match: 1,
            },
          },
        ]),
        // Point de rassemblement (À déclarer) Au moins 1 point de rassemblement est à déclarer.
        // TODO!
        // Centre (À déclarer) Au moins 1 centre est en attente de déclaration.
        // TODO!
        // Emploi du temps (À relancer) X emplois du temps n’ont pas été déposés pour le séjour de [Février 2023 -C].
        // sejour_emploi_du_temps
        { index: "sessionphase1", type: "_doc" },
        queryFromFilter([{ terms: { "hasTimeSchedule.keyword": ["true"] } }]),
        // Contact (À renseigner) Au moins 1 contact de convocation doit être renseigné.
        // TODO!
        // Cas particuliers (À contacter) X volontaires à contacter pour préparer leur accueil pour le séjour de [Février 2023 - C]
        // sejour_cas_particulier
        { index: "young", type: "_doc" },
        queryFromFilter([
          {
            bool: {
              should: [{ term: { ppsBeneficiary: "true" } }, { term: { paiBeneficiary: "true" } }, { term: { allergies: "true" } }, { term: { handicap: "true" } }],
              minimum_should_match: 1,
            },
          },
        ]),
        // Chef de centre (A renseigner) X chefs de centre sont à renseigner pour le séjour de [Février 2023 - C]
        // sejour_chef_de_centre
        { index: "sessionphase1", type: "_doc" },
        queryFromFilter([{ terms: { "cohort.keyword": cohortsNotStarted } }, { exists: { field: "headCenterId" } }]),
        // Pointage. X centres n’ont pas pointés tous leurs volontaires à l’arrivée au séjour de [Février 2023-C] (A renseigner)
        // TODO. cohortsFinishedInLessThan2Weeks,
        // Pointage. X centres n’ont pas pointés tous leurs volontaires à la JDM sur le séjour de [Février 2023-C] (A renseigner)
        // TODO. cohortsFinishedInLessThan2Weeks,

        //
        // Engagement
        //

        // Contrat (À suivre) X contrats d’engagement sont à éditer par la structure d’accueil et à envoyer en signature
        // engagement_contrat_à_éditer
        { index: "application", type: "_doc" },
        queryFromFilter(
          [
            // { terms: { "youngCohort.keyword": cohortsNotFinished } },
            { terms: { "contractStatus.keyword": ["WAITING_VALIDATION"] } },
            { terms: { "status.keyword": ["VALIDATED", "IN_PROGRESS"] } },
          ],
          {
            regionField: "youngRegion",
            departmentField: "youngDepartment",
          },
        ),
        // Contrat (À suivre) X contrats d’engagement sont en attente de signature.
        // engagement_contrat_en_attente_de_signature
        { index: "application", type: "_doc" },
        queryFromFilter([{ terms: { "contractStatus.keyword": ["SENT"] } }, { terms: { "status.keyword": ["VALIDATED", "IN_PROGRESS"] } }], {
          regionField: "youngRegion",
          departmentField: "youngDepartment",
        }),
        // Contrat (À renseigner) 1 représentant de l’État est à renseigner.
        // TODO.
        // Dossier d’éligibilité (À vérifier)  X dossiers d’éligibilité en préparation militaire sont en attente de vérification.
        // engagement_dossier_militaire_en_attente_de_validation
        { index: "young", type: "_doc" },
        queryFromFilter([{ terms: { "statusMilitaryPreparationFiles.keyword": ["WAITING_VERIFICATION"] } }]),
        // Mission (À instruire) X missions sont en attente de validation
        // engagement_mission_en_attente_de_validation
        { index: "mission", type: "_doc" },
        queryFromFilter([{ terms: { "status.keyword": ["WAITING_VALIDATION"] } }]),
        // Équivalence (À vérifier) X demandes d’équivalence MIG sont en attente de vérification
        // TODO
        // Volontaires (À suivre) X volontaires ayant commencé leur mission sans contrat signé
        // TODO (trop lourd)
        // Volontaires (À suivre) X volontaires ayant commencé leur mission sans statut à jour
        // TODO (trop lourd)
        // Volontaires (À suivre) X volontaires ayant achevé leur mission sans statut à jour
        // TODO (trop lourd)
        // Phase 3 (À suivre) X demandes de validation de phase 3 à suivre
        // engagement_phase3_en_attente_de_validation
        { index: "young", type: "_doc" },
        queryFromFilter([{ terms: { "statusPhase3.keyword": ["WAITING_VALIDATION"] } }]),
      ),
    });
    return res.status(200).send(response.body);
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
