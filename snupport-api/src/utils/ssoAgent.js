// GET /v0/sso/signin délivre une session agent complète. Il ne recevait que l'adresse email du
// référent SNU et prenait n'importe quel compte agent la portant — y compris les comptes du
// support (AGENT, ADMIN, DG), qui ne viennent d'aucune synchronisation et ne doivent jamais être
// joignables par SSO.
//
// L'identité est donc `snuReferentId`, l'identifiant du référent sur la plateforme SNU, posé par
// la synchronisation POST /v0/referent (cron `syncReferentSupport`, qui ne pousse que les rôles
// REFERENT_DEPARTMENT et REFERENT_REGION). L'email ne sert plus que de contrôle de cohérence.
// Sans identifiant, la requête ne prouve rien : on refuse plutôt que de retomber sur l'email.
function buildSsoAgentQuery({ email, snuReferentId }) {
  if (!snuReferentId || !email) return null;
  return { snuReferentId, email };
}

module.exports = { buildSsoAgentQuery };
