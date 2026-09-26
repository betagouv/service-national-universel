# GOO-16 : cookies de session limités à l'hôte de l'API

## Ce qui change

Les cookies de session de l'API v1 (`jwt_ref`, `jwt_young`) et les trust tokens de la 2FA (`trust_token-<id>`)
n'ont plus d'attribut `Domain` en production, en staging et en CI. Ils étaient posés sur le domaine parent
(`.snu.gouv.fr`, `.beta-snu.dev`) et partaient donc vers tous les sous-domaines : moncompte, admin, support,
la KB et tout autre service hébergé sous ce domaine. Ils ne partent plus que vers l'hôte de l'API.

Seuls l'API v1 et l'apiv2 lisent ces cookies. Elles partagent le même hôte : `api.snu.gouv.fr` et
`api.snu.gouv.fr/v2` (le garde d'hôte de l'apiv2 l'impose), et le même serveur nginx en staging et en CI. Les
fronts continuent de les envoyer à leurs appels, parce que c'est l'hôte de la requête qui décide de l'envoi,
pas celui de la page. La KB appelle `/signin/*` sur l'hôte de l'API ; son serveur Next ne lit aucun de ces
cookies.

`jwtzamoud` garde le domaine parent (`sharedCookieOptions`) : l'API v1 le pose au SSO support, et
snupport-api, sur un autre hôte, le lit.

Rien ne change en développement (`localhost`) ni dans les recettes (`custom`), qui étaient déjà sans domaine
parent.

## Cookies posés avant le déploiement

Un navigateur garde l'ancien cookie du domaine parent jusqu'à son expiration. Un cookie de même nom limité à
l'hôte ne le remplace pas : les deux seraient envoyés, et le plus ancien serait lu en premier. Une
déconnexion laisserait aussi l'ancien en place. `setSessionCookie` et `clearSessionCookie` expirent donc
l'ancien cookie du domaine parent à chaque pose et à chaque effacement. Une session ouverte avant le
déploiement continue de fonctionner jusqu'à son prochain renouvellement, qui la migre.

## Reste ouvert

- Un sous-domaine compromis peut toujours **poser** un cookie `jwt_ref` sur `.snu.gouv.fr` (cookie tossing).
  Seul le préfixe `__Host-` l'empêche, au prix d'un renommage des cookies dans l'API v1, l'apiv2 et
  `@snu/log-redaction`.
- snupport-api pose lui aussi `jwtzamoud` sur le domaine parent (`snupport-api/src/cookie-options.js`). Ce
  cookie doit rester lisible depuis l'hôte de snupport-api après le SSO, qui le pose depuis l'hôte de l'API.
