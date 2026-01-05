# Plateforme du Service National Universel

![CI](https://github.com/betagouv/service-national-universel/actions/workflows/api.yml/badge.svg)

Code source de la [Plateforme du Service National Universel](https://www.snu.gouv.fr/), organisé en plusieurs services :

- [Interface publique](https://github.com/betagouv/service-national-universel/tree/master/app)
- [Interface de gestion](https://github.com/betagouv/service-national-universel/tree/master/admin)
- [API](https://github.com/betagouv/service-national-universel/tree/master/api)

Il est conseillé de lire le fichier `README.md` de chacun de ces services.

## Installation et utilisation

Voir le `README.md` de chacun des services.

Pour run les principales app :
npm i
npm run dev


## Pull Requests
Les pull requests sont toujours squashées dans `main`, il est donc particulièrement important de respecter la convention de nommage suivante:
Pour une feature, préfixer par `feat`, pour un fix, par `fix`, suivi, entre parentheses, du domaine d'impact. Enfin, vous devez si il y en a un ajouter l'ID du ticket Notion.

Valeurs autorisées pour le préfixe: `fix`, `feat`, `chore`

Valeurs autorisées pour le domaine d'impact: `admin`, `api`, `app`, `lib`, `misc`

Exemples:

```
feat(api): 1789 - Chopping heads off.
fix(app, lib): 1794 - Corrected error with human rights.
chore(lib): Updating human rights package version to 2.0.
```

## Branches

Le nom des branches doit toujours etre précédé par `feat` ou `fix` suivi de l'ID tu ticket Notion (si existant), il est possible d'ajouter une breve description.

Exemples:
```
feat-1789-chopping-heads-off
fix-1792
fix-saving-the-day
```

## Tests et déploiement

### Main

La branche `main` ne doit contenir que des incréments qui ont été testés et validés, a chaque push, l'environnement d'intégration continue `CI` est redéployé.

### Customs Envs

Il est possible et conseillé de déployer un environnement de test pour une Pull Request donnée, pour cela, appliquer à la Pull Request le label `deploy`. Chaque push sur la branche associée mettra ensuite a jour l'environnement concerné.
Les environnements de test sont stoppés par un cron chaque soir ou lorsque l'on enlève le label `deploy`.
Les environnements de tests sont supprimés lorsque la branche associée est supprimée. (Par exemple, lors du merge de la PR)


### Livraison

Les déploiements sont effectués de maniere hebdomadaire. Pour lancer un déploiement, merger la branche `main` dans la branche `production`, ce qui lancera le pipeline de déploiement basé sur les Github Actions.



## Contact

Plus d'information sur la plateforme du Service National Universel et l'engagement civique ici : [https://beta.gouv.fr/startups/snu.html](https://beta.gouv.fr/startups/snu.html)

Pour contacter l’équipe: <contact@snu.gouv.fr>
