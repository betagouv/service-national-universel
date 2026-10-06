# Lot V13 : journaux et validation des paramètres d'apiv2

Date : 2026-10-06 · Constats PL14, PL15, PL16 (reprise après la vérification des correctifs du 05/10/2026) ·
Branche `nuit/goo-158`, base `origin/main` (`723d7cbf4`)

Déploiement : apiv2 seul. Aucun contrat de front modifié, aucune migration, aucune variable d'environnement.

## Ce qui est corrigé

### Journaux d'erreur et événements Sentry (PL16)

- Le filtre d'exceptions n'écrit plus l'URL brute de la requête : il journalise le chemin de la route (ou, à défaut,
  l'URL passée par la fonction de redaction partagée `@snu/log-redaction`). Le message envoyé à Sentry suit la même
  règle. Le texte complet du journal d'erreur (message d'exception et pile, y compris pour une route inexistante) passe
  par la redaction. Le code qui lisait l'ancienne structure interne du routeur, absente d'Express 5, est supprimé.
- Le fournisseur Brevo du plan marketing ne journalise plus l'URL de notification transmise à l'import de contacts :
  seul le nom de la liste est écrit. L'URL complète reste transmise à Brevo.

### Journaux d'emails (PL14)

- L'envoi d'un email journalise le template et le **nombre** de destinataires, plus aucune adresse ni aucun nom.
- La synchronisation des contacts référents journalise l'identifiant et l'opération, plus l'adresse ; le message
  d'erreur de synchronisation ne contient plus d'adresse.

### Identifiant de campagne invalide (PL15)

- `CampagneService.findById` répond `CAMPAIGN_NOT_FOUND` (erreur fonctionnelle, HTTP 422) quand l'identifiant n'a pas
  la forme d'un ObjectId, sans interroger la base. Cela couvre `GET /campagne/:id` et `PUT /campagne/:id` (identifiant
  du corps) : plus d'erreur 500 ni d'événement Sentry sur ces appels.

## Tests ajoutés

| Spec | Ce qu'il vérifie |
| --- | --- |
| `test/shared/AllExceptionsLogRedaction.filter.spec.ts` | le journal d'erreur et le message Sentry ne contiennent pas la valeur du paramètre sensible de l'URL ; la route reste journalisée |
| `src/plan-marketing/infra/provider/PlanMarketingBrevo.provider.spec.ts` | l'import de contacts ne journalise pas l'URL de notification, mais la transmet à Brevo |
| `src/notification/infra/email/Email.consumer.spec.ts` | ni adresse ni nom dans les journaux, template et nombre présents |
| `src/notification/infra/email/Contact.consumer.spec.ts` | pas d'adresse du référent dans les journaux, y compris en cas d'échec |
| `src/plan-marketing/core/service/Campagne.service.findById.spec.ts` | identifiant invalide : erreur fonctionnelle, base non interrogée |
| `test/plan-marketing/CampagneMiseAJourIdentifiant.spec.ts` | `PUT /campagne/:id` avec identifiant de corps invalide : 422, pas d'événement Sentry, pas de mise à jour |

Les tests apiv2 qui touchent la base se lancent avec une base MongoDB externe (`TEST_MONGO_URI`, voir
`apiv2/README.md`), en série (`--runInBand`).

## Hors périmètre, resté ouvert

- PL13 (garde d'hôte) : la restriction d'origine reste confiée à l'infrastructure, décision inchangée.
- `PUT /campagne/:id` n'exige pas que l'identifiant de l'URL soit égal à celui du corps.
- Le journal d'erreur de l'envoi d'email écrit encore le corps d'erreur renvoyé par le fournisseur.
