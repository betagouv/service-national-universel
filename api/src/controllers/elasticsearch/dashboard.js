const passport = require("passport");
const express = require("express");
const router = express.Router();
const { capture } = require("../../sentry");
const esClient = require("../../es");
const { ERRORS } = require("../../utils");
const { buildArbitratyNdJson } = require("./utils");
const { sessions2023, ROLES } = require("snu-lib");
const CohortModel = require("../../models/cohort");

router.post("/default", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req, res) => {
  try {
    const cohorts = await CohortModel.find({});
    const cohortsNotFinished = cohorts.filter((c) => new Date(c.dateEnd) > Date.now()).map((e) => e.name);
    const cohortsNotStarted = cohorts.filter((c) => new Date(c.dateStart) > Date.now()).map((e) => e.name);
    const cohortsAssignementOpen = cohorts.filter((c) => Boolean(c.isAssignmentAnnouncementsOpenForYoung) && cohortsNotFinished.includes(c)).map((e) => e.name);
    const cohorts5daysBeforeInscriptionEnd = sessions2023
      .filter((c) => new Date(c.eligibility.instructionEndDate) - Date.now() < 5 * 24 * 60 * 60 * 1000 && new Date(c.eligibility.instructionEndDate) - Date.now() > 0)
      .map((e) => e.name);
    const cohorts5dayBeforepdrChoiceLimitDate = cohorts
      .filter((c) => new Date(c.pdrChoiceLimitDate) - Date.now() < 5 * 24 * 60 * 60 * 1000 && new Date(c.pdrChoiceLimitDate) - Date.now() > 0)
      .map((e) => e.name);

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

    function withAggs(body, fieldName = "cohort.keyword") {
      return {
        ...body,
        aggs: { cohort: { terms: { field: fieldName, size: 1000 } } },
      };
    }

    // Dossier. X dossiers d’inscription en attente de validation pour le séjour de [Février 2023 C] (A instruire)
    // inscription_en_attente_de_validation_cohorte
    async function inscriptionAttenteValidationParCohorte() {
      const cohorts = cohorts5daysBeforeInscriptionEnd;
      if (!cohorts.length) return { inscription_en_attente_de_validation_cohorte: [] };

      const response = await esClient.msearch({
        index: "young",
        body: buildArbitratyNdJson(
          { index: "young", type: "_doc" },
          withAggs(queryFromFilter([{ terms: { "cohort.keyword": cohorts } }, { terms: { "status.keyword": ["WAITING_VALIDATION"] } }]), "cohort.keyword"),
        ),
      });

      return {
        inscription_en_attente_de_validation_cohorte: response.body.responses[0].aggregations.cohort.buckets.map((e) => {
          return {
            cohort: e.key,
            count: e.doc_count,
          };
        }),
      };
    }

    // Droit à l’image (À relancer) X volontaires sans accord renseigné
    // inscription_sans_accord_renseigné
    async function droitImageParCohorte() {
      const cohorts = cohortsAssignementOpen;
      if (!cohorts.length) return { inscription_sans_accord_renseigné: [] };

      const response = await esClient.msearch({
        index: "young",
        body: buildArbitratyNdJson(
          { index: "young", type: "_doc" },
          withAggs(
            queryFromFilter([
              { terms: { "cohort.keyword": cohorts } },
              { terms: { "status.keyword": ["VALIDATED", "WAITING_LIST"] } },
              { bool: { should: [{ term: { parentAllowSNU: "N/A" } }, { bool: { must_not: { exists: { field: "parentAllowSNU" } } } }], minimum_should_match: 1 } },
            ]),
            "cohort.keyword",
          ),
        ),
      });

      return {
        inscription_sans_accord_renseigné: response.body.responses[0].aggregations.cohort.buckets.map((e) => {
          return {
            cohort: e.key,
            count: e.doc_count,
          };
        }),
      };
    }

    // Point de rassemblement (À suivre) X volontaires n’ont pas confirmé leur point de rassemblement
    // sejour_rassemblement_non_confirmé
    async function sejourRassemblementNonConfirmé() {
      const cohorts = cohorts5dayBeforepdrChoiceLimitDate;
      if (!cohorts.length) return { sejour_rassemblement_non_confirmé: [] };

      const response = await esClient.msearch({
        index: "young",
        body: buildArbitratyNdJson(
          { index: "young", type: "_doc" },
          withAggs(
            queryFromFilter([
              { terms: { "cohort.keyword": cohorts } },
              { exists: { field: "sessionId" } },
              { exists: { field: "lineId" } },
              { bool: { should: [{ term: { mettingPointId: "N/A" } }, { bool: { must_not: { exists: { field: "mettingPointId" } } } }], minimum_should_match: 1 } },
            ]),
            "cohort.keyword",
          ),
        ),
      });

      return {
        sejour_rassemblement_non_confirmé: response.body.responses[0].aggregations.cohort.buckets.map((e) => {
          return {
            cohort: e.key,
            count: e.doc_count,
          };
        }),
      };
    }

    // Participation (À suivre) X volontaires n’ont pas confirmé leur participation au séjour de [Février 2023-C]
    // sejour_participation_non_confirmée
    async function sejourParticipationNonConfirmée() {
      const cohorts = cohortsNotStarted.filter((e) => cohortsAssignementOpen.includes(e));
      if (!cohorts.length) return { sejour_participation_non_confirmée: [] };

      const response = await esClient.msearch({
        index: "young",
        body: buildArbitratyNdJson(
          { index: "young", type: "_doc" },
          withAggs(
            queryFromFilter([
              {
                bool: {
                  should: [{ term: { youngPhase1Agreement: "false" } }, { bool: { must_not: { exists: { field: "youngPhase1Agreement" } } } }],
                  minimum_should_match: 1,
                },
              },
              { terms: { "cohort.keyword": cohorts } },
              { terms: { "status.keyword": ["VALIDATED"] } },
              { terms: { "statusPhase1.keyword": ["AFFECTED"] } },
            ]),
          ),
        ),
      });

      return {
        sejour_participation_non_confirmée: response.body.responses[0].aggregations.cohort.buckets.map((e) => {
          return {
            cohort: e.key,
            count: e.doc_count,
          };
        }),
      };
    }

    async function basicInscriptions() {
      const response = await esClient.msearch({
        index: "young",
        body: buildArbitratyNdJson(
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
        ),
      });
      const results = response.body.responses;
      return {
        inscription_en_attente_de_validation: results[0].hits.total.value,
        inscription_corrigé_à_instruire_de_nouveau: results[1].hits.total.value,
        inscription_en_attente_de_correction: results[2].hits.total.value,
      };
    }
    /*
    const response = await esClient.msearch({
      index: "young",
      body: buildArbitratyNdJson(

        //
        // Séjours
        //
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
        // TODO! Je ne comprends pas.
        // Centre (À déclarer) Au moins 1 centre est en attente de déclaration.
        // TODO! Je ne comprends pas.
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
    */
    return res.status(200).send({
      ok: true,
      data: {
        inscription: {
          ...(await basicInscriptions()),
          ...(await droitImageParCohorte()),
          ...(await inscriptionAttenteValidationParCohorte()),
        },
        sejour: {
          ...(await sejourRassemblementNonConfirmé()),
          ...(await sejourParticipationNonConfirmée()),
        },
      },
    });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

module.exports = router;
