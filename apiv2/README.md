## Description

![Test](https://github.com/Johannbr/nest-poc/actions/workflows/run-tests-api.yml/badge.svg)

## 
- docker compose up
- nest start api
- nest start job

Domaine : https://www.figma.com/board/whn9m3PNb72IYSQjjSHTeZ/SNU-Identification-des-Domaines?node-id=0-1&t=37n9Fla1p9oMVVZT-0

En cours:

- [ ] gestion des exceptions
    - [x] créer une classe d'exception fonctionnelle : 422
    - [ ] enum des exceptions fonctionnelles par domaine
    - [x] erreur technique (autre que FunctionalException), on envoie un id de correlation au front, qui l'affiche dans un toaster avec un message d'erreur générique avec l'id
        - [x] middleware pour logs de toutes les erreurs
        - [x] ajout d'un correlationId dans les logs et le retour de l'api pour les exceptions
        - [ ] voir si on utilise Asynchronous context tracking de nodejs pour avoir le correlationId dans toutes les couches (logs applicatifs)

- [ ] guards
    - [x] mise en place des guards et "cache" via l'objet request 
    - [ ] faire valider le fonctionnement du "cache" des guards par l'équipe
    => étant donné que tout est basé sur des rôles on muliplie les guards
        - [ ] trouver une autre approche : un guard basé sur des ressources ?

- [x] synchro ES via event stream 
    - [x] POC monstache
    - [x] déploiement sur CI

- [x] ~~renommer en PascalCase (on garde les ".spec.ts" pour différencier via l'IDE)~~
- [x] brancher sur snu-lib

- [ ] premier use-case  
    - [x] vérifier une classe
    - [x] brancher classe sur bdd (~~temporaire, partage schéma~~)
    - [x] brancher établissement sur bdd  (~~temporaire, partage schéma~~)
    - [x] envoi des emails
    - [x] génération token

- [ ] convention de nommage
    - [x] ~~Casse des fichiers, classes et méthodes (PascalCase)~~
    - [x] nommage des fichiers, classes et méthodes (terme métier en français et préfixe, verbe d'action technique et suffixe en anglais)
        - ex: findByMatricule(), verifierClasse(), updateJeune(), jeuneService.findByNomPrenom(), updateStatutToEnCours(), passerJeuneFromLPToLC()
        - complexité particulière : le modèle, les enum et les statuts existants sont principalement en anglais
    - [x] nommage suffixe : validé
        - ReferentMongo.repository.ts 
        - .service.ts 
        - .gateway.ts 
        - .provider.ts 
        - .facade.ts 
        - .usecase.ts 
        - .model.ts 
        - .mapper.ts 
        - .module.ts 
        - .guard.ts 
        - .spec.ts 
        - .spec.ts 
        - .controller.ts 
        - .middleware.ts 
        - .filter.ts 
        - .decorator.ts
        - .producer.ts
    - [x] se mettre d'accord sur nommage des descriptions de tests ("should ... ") terme métier en français et préposition et verbe d'action technique en anglais :
        - "should return true if utilisateur.region matches classe.region"
        - "should call classeGateway.findById if classe does not exist in the request"
        - "should add classe to request object"
        - "should call VerifierClasse once"

- [ ] tests
    - [x] exemple de tests unitaires
    - [x] valider où on met les tests unitaires (au plus proche du code, mais ça crée une adhérence supplémentaire avec nestjs dans le core)
    - [x] exemple de tests d'intégration, ~~jest utilise le terme : e2e (endToEnd) dans le dossier test~~ Auth.controller.spec.ts
    - [x] decribe Auth.controller -> describe /POST register -> it("")
    - [x] tests unitaires de controller sont facultatifs
    - [x] intégrer test container et externaliser la config dans Config.module (Johann)
    - [x] on utilise les gateway pour la création des jeux de tests
    - [ ] lib faker-js ?
    - [x] jeux de tests : 
        - [ ] ~~des gros fichiers mutualisés entre les plans de tests IT et QA pour les PO~~
        - [x] en mode fixture par "controller"

- [ ] Validation Pipe pour les "id" qui doivent être castés en ObjectId par Mongoose

- [x] Gestion de l'authentification
    - [x] Mettre en place le service d'authentification signin
    - [x] Contrôle du token jwt
    - [x] Ajout du user à la request
    - [ ] Refresh token

- [ ] valider les payload, partage entre front et back (Eric)
    - [ ] partage de class-validator entre front et back
        - [ ] poc utilisation class-validator avec les RouteResponse de la v1 ou autres (autres: partage de DTO, CreateClassePayloadDto, VerifyClasseResponseDto, SearchClasseQueryDto)
        - [ ] mapper dans controller pour certains cas, on peut parfois renvoyer un model complet

- [x] Se mettre d'accord : Envoi de notification
    - [x] Se mettre d'accord : NotificationModule qui exporte des providers, sendEmail, sendSMS, etc.
    - [x] Se mettre d'accord :TempateIds : enum dans Notification
    - [x] Se mettre d'accord :Enveloppe des params (type TS, classe ES6) :  Notification
    - [x] Se mettre d'accord :Construit l'objet param, dans le usecase avant l'appel de notificationService.send*
    - [x] Retour du consumer en cas de failure

- [ ] Service de notification
    - [x] NotificationModule : producer et consumer de message, export sendMessage
    - [x] Point d'entrée mainNotification.ts qui importe un NotificationModule et lance un worker
    - [x] config Brevo
    - [ ] config déploiement
    - [ ] catch d'exception et formattage de logs sur les standalone
    => ~~problème avec les workers, on ne peut pas utiliser la DI et la IoC, on crée des instances à chaque fois ...~~ => résolu avec le mode standalone

- [ ] Mettre en place le déploiement (Romain)
    - [ ] Serveur et worker en fonction du point d'entrée
    - [ ] iso-apiv1

 - [ ] Synchro brevo : young et referent 
    - [x] consumer et producer 
    - [ ] sync young 
    - [ ] sync referents 

- [ ] Transaction (Anselme et Johann)
    - [ ] decorator @Transactional
    - [ ] transaction mongo à partager avec les repo appelé par le useCase (featureCase)
    - [ ] https://stackoverflow.com/questions/67879357/nestjs-how-to-use-mongoose-to-start-a-session-for-transaction

- [ ] Config et init
    - [x] Construire la config:
        - [x] Depuis les VE, on construit un object avec les VE : ConfigModule
    - [x] Déclarer les modules initialisations des ressources de façon explicite :
        - On injecte ConfigModule (ConfigService)
        - /infra/auth/AuthModule
        - /infra/queue/QueueModule
        - /infra/database/DatabaseModule
        - ...
    - [ ] Clean shutdown

- [ ] alias dans les imports
    - [x] valider le fonctionnement lors du build
    - [x] un alias par module (à l'exception de Admin et Jeune)

- [x] Multi noeuds Mongodb pour dév' local via docker-compose pour Synchro ES et Transaction (Anselme)
    -  [ ] synchro monstache

- [ ] Branchement avec la data (quid de l'infra data)
    - [x] plugin mongoose patch-history patché dans les repo (déjà patché dans monorepo)
        -  [x] utilisation de Asynchronous context tracking de nodejs pour setter et récupérer les infos

- [ ] Soucis de typage sur les repo
    - [ ] Devrait retourner une erreur (probablement lié à l'inférence de type Mongoose) :    
        ```
        async findById(id: string): Promise<EtablissementModel> {
            return this.etablissementMongooseEntity.findById(id)
        }
        ```

\


TODO:
- [ ] Finaliser les mapper des ressources utilisées pour le premier usecase
- [x] Se mettre d'accord sur l'arborescence des domaines/sous-domaines
- [ ] Écrire les premiers ADR (où ? Notion ?)
- [ ] Mettre en place une FAQ ?
    - [ ] ~~branchement monstache sur change stream et envoie des logs formatés à la data~~
    - [ ] ~~sur update des collections, on envoie un message sur la queue Redis, consommé et qui met à jour~~
- [ ] Gestion des secrets
    - [ ] ~~node-config (ou autres?) avec un service ConfigService qui est importé où on veut~~
- [ ] Gestion des logs
    - [ ] définir format des logs, identique à v1 pour ne pas avoir à faire de la conf' rsyslog
    - [ ] notion de route comme dans Django (voir avec Romain)

- [ ] ~~Fil asynchrone ?~~
    - [ ] ~~Export lourds ?~~
- [ ] Passer dans monorepo
- [ ] ~~service de type request scope qui persiste l'utilisateur pour récupérer les infos lors de l'enregisrement de ressource~~
- [ ] Sentry : Nomenclature à définir : Filtre apiv2, Route, verbe, FunctionalException
- [ ] Point d'entrée mainCron.ts qui importe un AppModule et lance un worker
- [ ] ~~Historique des modifications : https://github.com/codepunkt/mongoose-patch-history ou service custom appelé depuis les .repostory~~
- [ ] ~~Synchro brevo : young et referent : service dédié, middleware monstache~~

<!--
## 1- Arborescence 2 niveaux de sous-modules

Idée: Sortir tous les usecase des modules, les mettre dans un dossier "usecase" à la racine du module principal.

```
src/
├── AppModule
└── admin/
    └── AdminModule.ts
    └── iam/
        └── IamModule.ts
        └── core/
        └── infra/
    └── sejour/
        └── SejourModule.ts
            └── core/
                └── domain/
                    └── cle/
                        ├── classe/
                        └── etablissement/
            └── infra/
                └── cle/
                    └── classe/
                        ├── api/
                        └── repository/          
                    └── etablissement
                        └── api/
                    └── repository/
    └── engagement/
        └── EngagementModule.ts
            └── core/
                └── domain/
                    └── mission/
                        ...
            └── infra/
                └── mission/
                    ...
└── jeune/
    └── JeuneModule.ts
└── shared/
    └── SharedModule.ts
└── config/
    └── ConfigModule.ts
        └── Database.ts

```
-->
<!-- ## 2- Arborescence 3 niveaux de sous modules

```
src/
├── AppModule
└── admin
    └── AdminModule.ts
    └── iam/
        └── IamModule.ts
        └── core/
        └── infra/
    └── sejour/
        └── SejourModule.ts
            └── cle
                └── CleModule.ts
                └── core
                    └── domain
                        ├── classe
                        └── etablissement
                └── infra
                    └── classe
                        ├── api
                        └── repository            
                    └── etablissement
                        └── api
                        └── repository
    └── engagement/
        └── EngagementModule.ts
        └── mission
            └── core
                └── domain
                    └── mission
                        ...
            └── infra
                └── mission
                    ...
└── jeune
    └── JeuneModule.ts
└── shared
    └── SharedModule.ts
└── config
    └── ConfigModule.ts
        └── Database.ts

``` -->

## 3- Arborescence 1 niveau de sous module (admin/jeune)

```
src/
├── AppModule
└── admin
    └── AdminModule.ts
    └── core
            └── iam/
            └── sejour/
                └── cle
                    └── classe
                    └── etablissement
            └── gestionjeune/
                updateById
    └── infra
        └── sejour/
            └── cle
                └── classe
                    └── api
                    └── repository            
                └── etablissement
                    └── api
                    └── repository
            └── gestionjeune/
└── jeune - utilisateur jeune
    └── JeuneModule.ts
    └── core
        └── sejour
            └── gestionjeune
                └── updateMe
└── shared
    └── SharedModule.ts
    └── JeuneRepository
└── config
    └── ConfigModule.ts
        └── Database.ts
```

<!-- ## 4- Arborescence sans sous module

```
src/
├── AppModule
└── core/
    └── domain/
        └── admin/
                └── iam/
                └── sejour/
                    └── cle
                        └── classe
                        └── etablissement
                ...
        └── jeune/
            └── sejour
            └── engagement
    └── infra
        └── admin/
            └── iam/
            └── sejour/
                └── cle
                    └── classe
                        └── api
                        └── repository            
                    └── etablissement
                        └── api
                        └── repository
        └── jeune/
            └── sejour
            └── engagement
└── shared
    └── SharedModule.ts
└── config
    └── ConfigModule.ts
        └── Database.ts
``` -->