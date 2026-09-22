const { capture } = require("../sentry");
const { ReferentModel, YoungModel } = require("../models");
const slack = require("../slack");
const { LOGIN_ATTEMPTS_WINDOW_MS } = require("../services/auth/attemptCounters");

/**
 * Purge des compteurs de connexion dormants.
 *
 * Ce cron remettait à zéro le compteur de TOUS les comptes chaque nuit à 1h :
 * le blocage dur à 12 tentatives ne tenait donc jamais plus d'une journée, et
 * un attaquant n'avait qu'à attendre l'horloge commune pour repartir d'un
 * budget neuf (L27 de l'audit du 21/09/2026).
 *
 * L'expiration est désormais portée par chaque compte, via la fenêtre
 * glissante de `consumeLoginAttempt`. Ce cron ne fait plus que de l'entretien :
 * il efface les compteurs dont la dernière tentative est hors fenêtre, ce qui
 * n'accorde aucune tentative que la fenêtre glissante n'accorderait déjà.
 */
exports.handler = async () => {
  await clean(ReferentModel);
  await clean(YoungModel);
};

const clean = async (model) => {
  try {
    const windowStart = new Date(Date.now() - LOGIN_ATTEMPTS_WINDOW_MS);
    await model.updateMany(
      {
        loginAttempts: { $gt: 0 },
        $or: [{ nextLoginAttemptIn: { $lt: windowStart } }, { nextLoginAttemptIn: null }, { nextLoginAttemptIn: { $exists: false } }],
      },
      { $set: { loginAttempts: 0, nextLoginAttemptIn: null } },
    );
  } catch (e) {
    capture(e);
    slack.error({ title: "loginAttempts", text: JSON.stringify(e) });
    throw e;
  }
};
