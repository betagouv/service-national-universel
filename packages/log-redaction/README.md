# @snu/log-redaction

Redaction des secrets et des données personnelles avant écriture dans les logs et avant envoi à Sentry.

Partagé entre `api` et `snupport-api`. Aucune dépendance runtime : le module est du TypeScript pur.

## Usage

```ts
import { redactLogInfo, redactSentryEvent, redactUrl, redactValue } from "@snu/log-redaction";

// winston : filet global sur tout appel logger.*
format.combine(format(redactLogInfo)(), format.simple());

// Sentry : body, en-têtes, cookies, extra, URL et query string
init({ beforeSend: redactSentryEvent });
```

## Ce que le module couvre

- **secrets** (`password`, `token*`, `*Token`, `authorization`, `cookie`, clés d'API…) → `**********`
- **emails** → tronqués (`j***@domaine.tld`), y compris encodés (`%40`) et dans un texte libre
- **téléphones** → masqués
- **URL** → secret porté par un segment de chemin (`/contract/token/<valeur>`), par un paramètre de route
  ou par la query string
- **dumps JSON**, **query strings** et **messages de validation Joi** dans un message texte

Les dates et compteurs dérivés d'un secret (`token2FAExpires`, `passwordChangedAt`, `attempts2FA`) sont
conservés : ils sont utiles au debug et ne sont pas rejouables.

## Limite

C'est un filet de sécurité **pour les secrets**, pas une garantie d'absence de PII : une donnée
personnelle sans nom de clé reconnaissable (identité, adresse, santé, texte libre) passe au travers.
**Ne jamais journaliser un document métier ou un corps de requête complet en production.**
