# [1.406.0](https://github.com/betagouv/service-national-universel/compare/v1.405.0...v1.406.0) (2024-05-10)


### Bug Fixes

* **admin:** sentry - Fix PDT bus validation ([#3842](https://github.com/betagouv/service-national-universel/issues/3842)) ([c506c9f](https://github.com/betagouv/service-national-universel/commit/c506c9f5df15c375955ff81c5d5b6eda73aa47bd))
* **admin:** sentry - handle dashboard todo empty ([#3843](https://github.com/betagouv/service-national-universel/issues/3843)) ([68521b5](https://github.com/betagouv/service-national-universel/commit/68521b5e983b6e65e0aec9ffb1be0266aa82c145))
* **admin:** sentry - head center session undefined ([#3835](https://github.com/betagouv/service-national-universel/issues/3835)) ([03dd694](https://github.com/betagouv/service-national-universel/commit/03dd694fee90cde418b6210b8abe6b95b33a90f4))
* **api:** bug crons dsnjExport cohesionCenterId undefined ([#3839](https://github.com/betagouv/service-national-universel/issues/3839)) ([70cea42](https://github.com/betagouv/service-national-universel/commit/70cea420e168eb32bf0855df5b5b34ad161b7965))
* **api:** bug dsnjexport  alerting youngCohort != sessionCohort ([#3849](https://github.com/betagouv/service-national-universel/issues/3849)) ([c22f616](https://github.com/betagouv/service-national-universel/commit/c22f61692dbcdf551a57bb6d8ee315dd6c9f2e26))
* **api:** Do not get department service for convocation template ([c066c19](https://github.com/betagouv/service-national-universel/commit/c066c19ed7e5474b8a98794b2589caf7f48c4f21))
* **api:** Gestion des MimeType inconnu ([#3825](https://github.com/betagouv/service-national-universel/issues/3825)) - fix import ([f2b7987](https://github.com/betagouv/service-national-universel/commit/f2b7987fad3c3e09e4f5be3ab15c5ba27ac6db3c))
* **sentry:** 45336 - Fixed meetingHour null case. ([#3840](https://github.com/betagouv/service-national-universel/issues/3840)) ([e0363a3](https://github.com/betagouv/service-national-universel/commit/e0363a39a4e6d7ec48cc2efe41b0fa3295b1fcf5))


### Features

* **api:** 2158 - use common young data to generate convocation ([#3838](https://github.com/betagouv/service-national-universel/issues/3838)) ([5c4e87b](https://github.com/betagouv/service-national-universel/commit/5c4e87b06a15c30e36a8e5e17c3eb1ca03993770))

# [1.405.0](https://github.com/betagouv/service-national-universel/compare/v1.404.0...v1.405.0) (2024-05-03)


### Bug Fixes

* **admin:** 2272 - Correction de la scrollbar sur le menu ([#3823](https://github.com/betagouv/service-national-universel/issues/3823)) ([8116dad](https://github.com/betagouv/service-national-universel/commit/8116dad10597bec53e8fc385c2cd13633b87a3a6))
* **admin:** 2446 - Fix info message component [#3830](https://github.com/betagouv/service-national-universel/issues/3830) ([2a2e080](https://github.com/betagouv/service-national-universel/commit/2a2e080ad63dd94d62198745365d4c8faca97546))
* **admin:** 2446 - info message default value and empty filter ([#3826](https://github.com/betagouv/service-national-universel/issues/3826)) ([f766f09](https://github.com/betagouv/service-national-universel/commit/f766f09bf05b7f711177cdb0b81f26c330e6e76a))
* **admin:** Corrections de l'affichage des données de session ([#3832](https://github.com/betagouv/service-national-universel/issues/3832)) ([c4a6c9d](https://github.com/betagouv/service-national-universel/commit/c4a6c9d81064f9a998836d33405326923f6674f7))
* **admin:** sentry - centerrs young undefined ([#3836](https://github.com/betagouv/service-national-universel/issues/3836)) ([45b7932](https://github.com/betagouv/service-national-universel/commit/45b79325933591a434e0d1ee376f62e028d3a1d1))
* **api:** Gestion des MimeType inconnu ([#3825](https://github.com/betagouv/service-national-universel/issues/3825)) ([ac9fb29](https://github.com/betagouv/service-national-universel/commit/ac9fb29d2df445db7bfe537298da23a1f985a08e))


### Features

* **admin,api:** 2194- Refonte export DSNJ ([#3795](https://github.com/betagouv/service-national-universel/issues/3795)) ([3b946fc](https://github.com/betagouv/service-national-universel/commit/3b946fc92c567550887566a759d924978c51da23)), closes [#3782](https://github.com/betagouv/service-national-universel/issues/3782) [#3783](https://github.com/betagouv/service-national-universel/issues/3783) [#3784](https://github.com/betagouv/service-national-universel/issues/3784) [#3780](https://github.com/betagouv/service-national-universel/issues/3780) [#3750](https://github.com/betagouv/service-national-universel/issues/3750) [#3787](https://github.com/betagouv/service-national-universel/issues/3787) [#3730](https://github.com/betagouv/service-national-universel/issues/3730) [#3784](https://github.com/betagouv/service-national-universel/issues/3784) [#3781](https://github.com/betagouv/service-national-universel/issues/3781) [#3768](https://github.com/betagouv/service-national-universel/issues/3768) [#3730](https://github.com/betagouv/service-national-universel/issues/3730) [#3778](https://github.com/betagouv/service-national-universel/issues/3778) [#3777](https://github.com/betagouv/service-national-universel/issues/3777) [#3780](https://github.com/betagouv/service-national-universel/issues/3780) [#3761](https://github.com/betagouv/service-national-universel/issues/3761) [#3786](https://github.com/betagouv/service-national-universel/issues/3786) [#3797](https://github.com/betagouv/service-national-universel/issues/3797) [#3779](https://github.com/betagouv/service-national-universel/issues/3779) [#3791](https://github.com/betagouv/service-national-universel/issues/3791)
* **app:** 2335 - New screen for young on 'a venir' cohort when reinscription is closed ([#3827](https://github.com/betagouv/service-national-universel/issues/3827)) ([bd68f24](https://github.com/betagouv/service-national-universel/commit/bd68f2450791dd7b0ecfabe2ffd10aeac3433711))
* **app, api:** 2056 - Automate reinscription closing. ([#3804](https://github.com/betagouv/service-national-universel/issues/3804)) ([2d82cc9](https://github.com/betagouv/service-national-universel/commit/2d82cc95ee844d746b4f3670431ba1e8b25bc0e2))

# [1.404.0](https://github.com/betagouv/service-national-universel/compare/v1.403.0...v1.404.0) (2024-04-26)


### Bug Fixes

* **admin:** 2370 - WAITING LIST when goals are full  ([#3820](https://github.com/betagouv/service-national-universel/issues/3820)) ([b499a26](https://github.com/betagouv/service-national-universel/commit/b499a26093204f3cc87b16ac05df692157348f61))
* **api:** 1234 - change cohort for CLE ([#3808](https://github.com/betagouv/service-national-universel/issues/3808)) ([23338e4](https://github.com/betagouv/service-national-universel/commit/23338e4a31db9aa45cc299dccc5ddd78ab04254c))
* **api:** 2390 - Fix isInscriptionOpen route [#3802](https://github.com/betagouv/service-national-universel/issues/3802) ([b0cd88e](https://github.com/betagouv/service-national-universel/commit/b0cd88e9bf19f307a415ebb4c9aad095ba9d8c15))
* **api:** Tracking JVA [#3811](https://github.com/betagouv/service-national-universel/issues/3811) ([7a35c12](https://github.com/betagouv/service-national-universel/commit/7a35c1261cc38cf0459ceef8a444daed0cdfbf05))
* **api:** Typo in contract.phase2 ([bca2150](https://github.com/betagouv/service-national-universel/commit/bca215052086cc17aef905b691a298b3484513e0))
* **api, admin:** 2342 - Export DSNJ ([#3803](https://github.com/betagouv/service-national-universel/issues/3803)) ([42acf30](https://github.com/betagouv/service-national-universel/commit/42acf307d4abade5bbbc70d6b127350d572797af))
* **api, app:** 2099 - display correction requests from previous cohorts ([#3761](https://github.com/betagouv/service-national-universel/issues/3761)) ([f136140](https://github.com/betagouv/service-national-universel/commit/f13614017198debbfa344b14753398f5fb1e343b))
* **api,app:** 2349 - Fix tracking for API Engagement ([#3801](https://github.com/betagouv/service-national-universel/issues/3801)) ([9725887](https://github.com/betagouv/service-national-universel/commit/97258875aeb4eeab4a1bf349bb1a4f24a071eb93))
* **api,app:** Retours QA sur évolutions désistement et parcours CLE [#3819](https://github.com/betagouv/service-national-universel/issues/3819) ([587d165](https://github.com/betagouv/service-national-universel/commit/587d1657adba0d0c2efa2c7ff00707c6a97a974b))
* **app, admin:** Fallback environment if not defined ([da6ea4c](https://github.com/betagouv/service-national-universel/commit/da6ea4c97b63052c3b6697d07ea9bfabcd06d2b8))
* **lib:** 2400 - remove CLE mai 2024 Martinique ([#3805](https://github.com/betagouv/service-national-universel/issues/3805)) ([66f3e63](https://github.com/betagouv/service-national-universel/commit/66f3e63b48564d833aa1ca3faafadf1f54c0cd70))


### Features

* **admin:** 2090 - Bloquer validation consentement par autrui ([#3772](https://github.com/betagouv/service-national-universel/issues/3772)) ([2a295f6](https://github.com/betagouv/service-national-universel/commit/2a295f689b38313f063fe8542605f1f56676ad92))
* **admin:** 2178 - Refonte design dashboard et ajout d'un bandeau informatif ([#3774](https://github.com/betagouv/service-national-universel/issues/3774)) ([6512dd8](https://github.com/betagouv/service-national-universel/commit/6512dd843be1a72a1fea94492ed0e2f350b8befa))
* **admin:** 2253 - Objectifs - Mise à jour sélecteur de cohort ([#3800](https://github.com/betagouv/service-national-universel/issues/3800)) ([dcc8806](https://github.com/betagouv/service-national-universel/commit/dcc8806240539f399ab10cc9f7aec518ce5edc54))
* **admin:** 2253 - Paramétrage dynamique - Mise à jour sélecteur de cohort ([#3799](https://github.com/betagouv/service-national-universel/issues/3799)) ([7560ff0](https://github.com/betagouv/service-national-universel/commit/7560ff0b93e944a5a341a6a523d137be18ebe4f1))
* **admin:** 2253 - pdt cohort switcher ([#3790](https://github.com/betagouv/service-national-universel/issues/3790)) ([41c14af](https://github.com/betagouv/service-national-universel/commit/41c14afc407532bd2429baa219aff0135233acf3))
* **admin:** 2253 - Schema de repartition - Mise à jour selecteur de cohort ([#3792](https://github.com/betagouv/service-national-universel/issues/3792)) ([a9a55d7](https://github.com/betagouv/service-national-universel/commit/a9a55d7c77e982f3753a48150b6793e61afdbee0))
* **admin:** 2261 - Centres - Mise à jour selecteur de cohort ([#3775](https://github.com/betagouv/service-national-universel/issues/3775)) ([f769b52](https://github.com/betagouv/service-national-universel/commit/f769b52b032556e7dbc56b9dc4892a174a07aad2))
* **admin:** 2261 - PDR - Mise à jour selecteur de cohort ([#3788](https://github.com/betagouv/service-national-universel/issues/3788)) ([a590d8d](https://github.com/betagouv/service-national-universel/commit/a590d8d98dee5f2a8d9b8d6e194a814ab49bafa8))
* **admin, api:** 2158 - download classroom convocation ci ([#3763](https://github.com/betagouv/service-national-universel/issues/3763)) ([ac8dc50](https://github.com/betagouv/service-national-universel/commit/ac8dc50aa1b8ecfd51af48aa0fa63cc83f0c8625))
* **api,app:** 2347 - Remove self delete for youngs ([#3793](https://github.com/betagouv/service-national-universel/issues/3793)) ([25f52f9](https://github.com/betagouv/service-national-universel/commit/25f52f94f26ca9461cc967a1482521e04ed6a090))
* **api,app,admin:** 2183 - PDFkit integration ([#3699](https://github.com/betagouv/service-national-universel/issues/3699)) ([d5fdc9b](https://github.com/betagouv/service-national-universel/commit/d5fdc9b49f162a7dcc18ccf7afd6f3d823d56246))
* **app:** 2203 - 2247 - corrected "Dans ma valise" link, changed je-veux-aider image. ([#3786](https://github.com/betagouv/service-national-universel/issues/3786)) ([706e88a](https://github.com/betagouv/service-national-universel/commit/706e88a73d266676273dd56fbf7341c3dabb7e03))
* **app:** 2283 - CLE - Add confirmation step for affected users ([#3806](https://github.com/betagouv/service-national-universel/issues/3806)) ([bb5e5ab](https://github.com/betagouv/service-national-universel/commit/bb5e5ab0c79674c04aba2529dfdfd68249fa8f27))
* **app:** 2318 - Add withdrawal dialog on Affected and Waiting affectation pages ([#3815](https://github.com/betagouv/service-national-universel/issues/3815)) ([22c531c](https://github.com/betagouv/service-national-universel/commit/22c531c1ac8626f8f7954cd8a952a6ea7b7f44db))
* **app:** 2398 - Allow CLE users to withdraw ([#3794](https://github.com/betagouv/service-national-universel/issues/3794)) ([382ce7d](https://github.com/betagouv/service-national-universel/commit/382ce7d6dc1e0033bf67ced8d8d1282a451ee4d7))
* **app, admin, lib:** 2164 - Using AddressForm on Admin. ([#3776](https://github.com/betagouv/service-national-universel/issues/3776)) ([351727d](https://github.com/betagouv/service-national-universel/commit/351727d225528269d7f0e81f64681f2c723d6678))


### Reverts

* **misc): "chore(misc:** front sentry config ([#3807](https://github.com/betagouv/service-national-universel/issues/3807))" ([2243c03](https://github.com/betagouv/service-national-universel/commit/2243c0326cc8cae273fc29a304eb8305bc3d6c13))

# [1.403.0](https://github.com/betagouv/service-national-universel/compare/v1.402.0...v1.403.0) (2024-04-19)


### Bug Fixes

* **admin:** 2348 - Disparition de la fonctionnalité d’affichage, de téléchargement et de téléversement des pièces d’identité depuis le profil des volontaires ([#3784](https://github.com/betagouv/service-national-universel/issues/3784)) ([5aa6ed9](https://github.com/betagouv/service-national-universel/commit/5aa6ed90f051d138abf7371c85e015ed127ef04b))
* **api:** dsnj export ([#3781](https://github.com/betagouv/service-national-universel/issues/3781)) ([25f80f1](https://github.com/betagouv/service-national-universel/commit/25f80f1fe93951b04bda8c807f52f4ad48e0cb07))
* **app:** VE pour connexion jeune ([#3768](https://github.com/betagouv/service-national-universel/issues/3768)) ([7d5b2e3](https://github.com/betagouv/service-national-universel/commit/7d5b2e33e0c6b89df3e4f0d98d5567feebaf36a1))


### Features

* **api:** Allow tls in production ([c4dea9e](https://github.com/betagouv/service-national-universel/commit/c4dea9eff9b15a84c12ab3611bb849124015156c))
* **api,app,admin:** 2257 - fixes for "à venir" cohort ([#3730](https://github.com/betagouv/service-national-universel/issues/3730)) ([ede9904](https://github.com/betagouv/service-national-universel/commit/ede9904822327a4258387ac9d0f762009bdc3371))
* **app:** Add maintenance notice [#3778](https://github.com/betagouv/service-national-universel/issues/3778) ([d141dc4](https://github.com/betagouv/service-national-universel/commit/d141dc46ad452ab6a0944bd73034a9ecefc29a50))
* **github:** 2341 - Updated pull request template and pr-title-checker ([#3777](https://github.com/betagouv/service-national-universel/issues/3777)) ([a7b339c](https://github.com/betagouv/service-national-universel/commit/a7b339c61d9051d955616ae79c34330ab7dd14f5))
* **terraform, admin, app:** 2236 - Sentry for app/admin ([#3780](https://github.com/betagouv/service-national-universel/issues/3780)) ([2f61f38](https://github.com/betagouv/service-national-universel/commit/2f61f3816f8897c7f0e843d97d1f8e44a7283ec4))

# [1.402.0](https://github.com/betagouv/service-national-universel/compare/v1.401.0...v1.402.0) (2024-04-12)


### Bug Fixes

* **admin:** 664 - reduire la taille des requetes volontaires ([#3734](https://github.com/betagouv/service-national-universel/issues/3734)) ([556dfe9](https://github.com/betagouv/service-national-universel/commit/556dfe9c391bc9391c1d189f4999cc95ee3320a2))
* **admin, api:** 1694 - Send new Brevo template when HTS switch to CL… ([#3711](https://github.com/betagouv/service-national-universel/issues/3711)) ([774b778](https://github.com/betagouv/service-national-universel/commit/774b77855d8454beaf9a4fe04286e1d7297463c5))
* **admin/api:** 2200 - revoir les regles de validation manuelle de la phase 2 ([#3757](https://github.com/betagouv/service-national-universel/issues/3757)) ([560fa8c](https://github.com/betagouv/service-national-universel/commit/560fa8c809471d707bc77b4213503983012980dc))
* **api:** 2199 Admin - Téléchargement d’une attestation 2022 ([#3713](https://github.com/betagouv/service-national-universel/issues/3713)) ([1fddd8e](https://github.com/betagouv/service-national-universel/commit/1fddd8e3ba874b86ac1a4801e3a29edc0c084cff))
* **app, api:** update change-cohort email template ([#3762](https://github.com/betagouv/service-national-universel/issues/3762)) ([c7978b4](https://github.com/betagouv/service-national-universel/commit/c7978b4f48a5a75e94afd536055f5ec12eddc476))


### Features

* **admin:** 1982-ajouter un champ CNI invalide lors de la validation du jeune ([#3737](https://github.com/betagouv/service-national-universel/issues/3737)) ([fd47ee7](https://github.com/betagouv/service-national-universel/commit/fd47ee7f48f307349229d32681f1293b69f795fa))
* **app, lib:** Add address search form with classic design ([#3678](https://github.com/betagouv/service-national-universel/issues/3678)) ([eec3f0c](https://github.com/betagouv/service-national-universel/commit/eec3f0cd72c9124daae6ba69f4ed19f9797e382f))

# [1.401.0](https://github.com/betagouv/service-national-universel/compare/v1.400.0...v1.401.0) (2024-04-10)


### Bug Fixes

* **app:** 2138 - Fixed error on specialSituations Checkboxes. ([05b6397](https://github.com/betagouv/service-national-universel/commit/05b63977bd8875c700706c22ab71edf0d83d7a1d))
* **app:** Fixed error on specialSituations Checkboxes - Part 2 ([532238c](https://github.com/betagouv/service-national-universel/commit/532238cc753a4b28fbc721645bf4964a07258ce7))


### Features

* **api:** 381 add typescript ([#3715](https://github.com/betagouv/service-national-universel/issues/3715)) ([bd3eda2](https://github.com/betagouv/service-national-universel/commit/bd3eda20ad9a6cacb8078c102d39c737bc518184))
* **api,app,admin:** 2270 - Add RELEASE environment variable ([#3729](https://github.com/betagouv/service-national-universel/issues/3729)) ([3992ddd](https://github.com/betagouv/service-national-universel/commit/3992ddd95e257fd4ab78c882e19610eeb5c5eb5f))
* **app, lib:** DSFR adjustments. ([#3698](https://github.com/betagouv/service-national-universel/issues/3698)) ([ba16e5d](https://github.com/betagouv/service-national-universel/commit/ba16e5d30757c541d270ccebe73d6da86d703f76))
* **misc:** 2256 - Add notion task info to release changelog ([#3724](https://github.com/betagouv/service-national-universel/issues/3724)) ([6ec2677](https://github.com/betagouv/service-national-universel/commit/6ec2677c6fcb22d6a21f85975cfef4d90dd9aba7))

# [1.400.0](https://github.com/betagouv/service-national-universel/compare/v1.399.1...v1.400.0) (2024-04-09)


### Bug Fixes

* **api:** pipeline test with new historic  ([#3736](https://github.com/betagouv/service-national-universel/issues/3736)) ([1d8c461](https://github.com/betagouv/service-national-universel/commit/1d8c46194357e8b45d13efe57f4880395c614e66))
* **api:** schoolRAMSES conflit mongoose-patch-history ([18035c0](https://github.com/betagouv/service-national-universel/commit/18035c04e56189e48402ee214719ea88a5999929))
* **deps:** update dependency @sentry/nextjs to v7.77.0 [security] ([#3252](https://github.com/betagouv/service-national-universel/issues/3252)) ([3e7d418](https://github.com/betagouv/service-national-universel/commit/3e7d418ed3d94f79eecc8952f883700f823a8a24))
* **deps:** update dependency express to v4.19.2 [security] ([#3689](https://github.com/betagouv/service-national-universel/issues/3689)) ([ceb3fd5](https://github.com/betagouv/service-national-universel/commit/ceb3fd5857044072fb3fd1d889cc1517031816c2))
* **deps:** update dependency sanitize-html to v2.12.1 [security] ([#3630](https://github.com/betagouv/service-national-universel/issues/3630)) ([f71d346](https://github.com/betagouv/service-national-universel/commit/f71d34631055e3bdeeb782aaec43445672178518))
* **deps:** update dependency turbo to v1.13.2 ([#3009](https://github.com/betagouv/service-national-universel/issues/3009)) ([080ed62](https://github.com/betagouv/service-national-universel/commit/080ed6262d5edfd604a7b8ded55cead540b8167f))
* **misc:** Rebuild if package-json.lock is updated ([#3731](https://github.com/betagouv/service-national-universel/issues/3731)) ([a6f5ff0](https://github.com/betagouv/service-national-universel/commit/a6f5ff0fe75aaec494ad6612275ed30a296fc57d))


### Features

* **api:** add history on model without history (to complete on save) ([#3675](https://github.com/betagouv/service-national-universel/issues/3675)) ([4ded73d](https://github.com/betagouv/service-national-universel/commit/4ded73d88af71c52bc004b253962c00109d80a20))

## [1.399.1](https://github.com/betagouv/service-national-universel/compare/v1.399.0...v1.399.1) (2024-04-08)


### Bug Fixes

* **app:** Fix ReInscription context bug. ([fad3adc](https://github.com/betagouv/service-national-universel/commit/fad3adcf93003cd71454bafb1a4a480af7a454c1))
* **misc:** 2181 - Wait after DNS record at custom env creation ([#3718](https://github.com/betagouv/service-national-universel/issues/3718)) ([e620539](https://github.com/betagouv/service-national-universel/commit/e6205397d27d7067107be5f3230c265f16ae77b4))

# [1.399.0](https://github.com/betagouv/service-national-universel/compare/v1.398.0...v1.399.0) (2024-04-05)


### Features

* **misc:** 2214 - Release CHANGELOG ([#3712](https://github.com/betagouv/service-national-universel/issues/3712)) ([7610628](https://github.com/betagouv/service-national-universel/commit/761062893384201940c2a37bb6603abf7354dd4b))

# [1.398.0](https://github.com/betagouv/service-national-universel/compare/v1.397.0...v1.398.0) (2024-04-04)


### Bug Fixes

* **admin:** Reopen boite reception temporairement ([d0e20b1](https://github.com/betagouv/service-national-universel/commit/d0e20b173d1889d149dc8eb59da01dc688925eda))
* **app:** 2160 - Fixed ES filter isMilitaryPreparation. ([5b7a1f5](https://github.com/betagouv/service-national-universel/commit/5b7a1f56b3f1ef3423583036382dd2b3fdb7127f))


### Features

* **api:** 1993 - Add sentry-cron integration ([#3707](https://github.com/betagouv/service-national-universel/issues/3707)) ([327d740](https://github.com/betagouv/service-national-universel/commit/327d7402a22c3b70ea1eb2567202c46a05a17abf))
* **app:** 2160 - Filtering military preparations for CLE. ([#3708](https://github.com/betagouv/service-national-universel/issues/3708)) ([effac47](https://github.com/betagouv/service-national-universel/commit/effac47a28f1c20a91cf65e87b23577b6cfa2149))
* **app, admin:** 2055 - add "à venir" in changeSejour form ([#3697](https://github.com/betagouv/service-national-universel/issues/3697)) ([9d5efc8](https://github.com/betagouv/service-national-universel/commit/9d5efc8bb7c671fb2f1cd3febfc30bd77e230207))

# [1.397.0](https://github.com/betagouv/service-national-universel/compare/v1.396.2...v1.397.0) (2024-04-02)


### Features

* **admin:** 1694 - HTS to CLE Attestation when phase1 has been done ([#3701](https://github.com/betagouv/service-national-universel/issues/3701)) ([a3254b6](https://github.com/betagouv/service-national-universel/commit/a3254b686ae31e9dc0c1bb768a7d73fe23a08cdc))
* **api/admin:** 1877 - Restore previous signin when ADMIN [#3588](https://github.com/betagouv/service-national-universel/issues/3588) ([#3667](https://github.com/betagouv/service-national-universel/issues/3667)) ([8837c2b](https://github.com/betagouv/service-national-universel/commit/8837c2b4e0c73a0c756a18171478dead1a30623e))

### Bug Fixes

* **api, app:** 2064 - Prevent RI revalidation for youngs that won't do phase1 anyway. ([#3690](https://github.com/betagouv/service-national-universel/issues/3690)) ([ae26e2b](https://github.com/betagouv/service-national-universel/commit/ae26e2bf16d442e2ff4a8319b9ed6e782b7f02ea))
* **app:** Download convocation button [#3691](https://github.com/betagouv/service-national-universel/issues/3691) ([b842097](https://github.com/betagouv/service-national-universel/commit/b842097372609729e9cf9398b34d0c06fc6f0b48))


### Features

* **api:** 1483 - Cron Reminder Waiting correction J+3 and J+7 ([#3674](https://github.com/betagouv/service-national-universel/issues/3674)) ([920553f](https://github.com/betagouv/service-national-universel/commit/920553f6df6640a46e35960236ec83a0ba38d8f1))
* **misc:** 2068 - Deploy docker image on CC ([#3683](https://github.com/betagouv/service-national-universel/issues/3683)) ([906876e](https://github.com/betagouv/service-national-universel/commit/906876e9b858d709db20f3ba9145a3d125e2ba3b))
* **misc:** Run tests on every PR ([#3688](https://github.com/betagouv/service-national-universel/issues/3688)) ([0ebeef7](https://github.com/betagouv/service-national-universel/commit/0ebeef7464911d07bab772ba5cc26ba688f2a3c9))

## [1.394.1](https://github.com/betagouv/service-national-universel/compare/v1.394.0...v1.394.1) (2024-03-21)


### Bug Fixes

* **app:** 1184 - Fixed AddressDropdown component. ([30ba59e](https://github.com/betagouv/service-national-universel/commit/30ba59e354b818ed40ff9476618aec73f67d0ad3))

# [1.394.0](https://github.com/betagouv/service-national-universel/compare/v1.393.0...v1.394.0) (2024-03-19)


### Bug Fixes

* **api:** add class check on PDT import ([4c6b635](https://github.com/betagouv/service-national-universel/commit/4c6b635d9d1e2d580b135b9c2800ecbb4a1f17a9))


### Features

* **admin:** 1834 - Wording for PDR young CLE ([#3671](https://github.com/betagouv/service-national-universel/issues/3671)) ([f40ba33](https://github.com/betagouv/service-national-universel/commit/f40ba333360c4532264250918cc1615a0f959e14))
* **api:** 2059 - Export DSNJ only french for after session ([#3672](https://github.com/betagouv/service-national-universel/issues/3672)) ([6fe27b6](https://github.com/betagouv/service-national-universel/commit/6fe27b61fc1bf1913d8cb88ca9c96092ebdccdce))

# [1.393.0](https://github.com/betagouv/service-national-universel/compare/v1.392.0...v1.393.0) (2024-03-18)

### Bug Fixes

- **app:** 1184 - Bumping react-dsfr version. ([01de6f8](https://github.com/betagouv/service-national-universel/commit/01de6f842f925734a5aa60fbea75dbfa03ece974))
- **app:** 1184 - Removed only-include-used-icons from package.json. ([6fec94a](https://github.com/betagouv/service-national-universel/commit/6fec94ad878d4a3d2736f22b60ac1fae9a4ca663))

### Features

- **app:** 1184 - React DSFR on App. ([#3438](https://github.com/betagouv/service-national-universel/issues/3438)) ([e828232](https://github.com/betagouv/service-national-universel/commit/e8282326b7cda1df6649a2a7d52f58b2d471c18e))
- **app,admin:** 1865 - Nginx & runtime environment ([#3664](https://github.com/betagouv/service-national-universel/issues/3664)) ([f27e0bb](https://github.com/betagouv/service-national-universel/commit/f27e0bb9a715a47fea8c8b7fbed9f7bd6944e220))

# [1.392.0](https://github.com/betagouv/service-national-universel/compare/v1.391.0...v1.392.0) (2024-03-15)

### Features

- **admin:** add meeting to convocation CLE ([#3666](https://github.com/betagouv/service-national-universel/issues/3666)) ([6b32403](https://github.com/betagouv/service-national-universel/commit/6b3240324e2e2da714e552e20f3963b8f72726c5))

# [1.391.0](https://github.com/betagouv/service-national-universel/compare/v1.390.0...v1.391.0) (2024-03-14)

### Features

- **api:** Fix some error on DeleteCNICron ([#3657](https://github.com/betagouv/service-national-universel/issues/3657)) ([a855edd](https://github.com/betagouv/service-national-universel/commit/a855edd3c69857d533068a497d917fbf296d0c6e))
- **app,admin:** 1964 - Modification du contrat d'engagement ([#3656](https://github.com/betagouv/service-national-universel/issues/3656)) ([328cfb1](https://github.com/betagouv/service-national-universel/commit/328cfb1856d7eb6e646f2bfa8b0063d01535308a))
- **lib:** update Attestation Phase 1 ([#3661](https://github.com/betagouv/service-national-universel/issues/3661)) ([19a6de9](https://github.com/betagouv/service-national-universel/commit/19a6de9908ce2ed2aa1acc8d321e9d8d0bd637c5))

# [1.390.0](https://github.com/betagouv/service-national-universel/compare/v1.389.1...v1.390.0) (2024-03-13)

### Bug Fixes

- **admin/api:** Fix de plusieurs bug ([#3662](https://github.com/betagouv/service-national-universel/issues/3662)) ([763bc3e](https://github.com/betagouv/service-national-universel/commit/763bc3ebcd436d56c3bbf5c1ef44c06a87381632))
- **api:** Fix application tests ([3d65fe2](https://github.com/betagouv/service-national-universel/commit/3d65fe243740dc058007cf1cf17ca06a4696aa9d))
- **misc:** Increase antivirus RAM ([#3660](https://github.com/betagouv/service-national-universel/issues/3660)) ([4fb5590](https://github.com/betagouv/service-national-universel/commit/4fb55907dcc51a1145331124f4cc5ced31c23b92))

### Features

- **admin/api:** 1757 - Pouvoir rajouter des lignes sur le pdt sans réimporté tous le pdt ([#3635](https://github.com/betagouv/service-national-universel/issues/3635)) ([f87b367](https://github.com/betagouv/service-national-universel/commit/f87b3677258aa79bd160e3b7e138b20b14ac0577))
- **misc:** 1865 - Optimize Dockerfile ([#3650](https://github.com/betagouv/service-national-universel/issues/3650)) ([b6eb75f](https://github.com/betagouv/service-national-universel/commit/b6eb75f8811f3db380f7ad8f5a74a8628cdc2a14))

## [1.389.1](https://github.com/betagouv/service-national-universel/compare/v1.389.0...v1.389.1) (2024-03-12)

### Bug Fixes

- **admin:** [CLE]- TRANSPORT - Bug export convoyeurs CLE MARS 1 ([#3653](https://github.com/betagouv/service-national-universel/issues/3653)) ([14a3643](https://github.com/betagouv/service-national-universel/commit/14a3643d80589b8953d4297f4b6fd41e43680386))
- **admin:** referent can WITHDRAWN every young ([cf336f2](https://github.com/betagouv/service-national-universel/commit/cf336f29b6e47a83ac8691245cbf27759e9cdc78))
- **admin:** sidebar ([#3658](https://github.com/betagouv/service-national-universel/issues/3658)) ([e316b50](https://github.com/betagouv/service-national-universel/commit/e316b50c7b3121bca3f3f1545e8667fcc8b2d263))
- **misc:** Always run tests ([#3652](https://github.com/betagouv/service-national-universel/issues/3652)) ([394951d](https://github.com/betagouv/service-national-universel/commit/394951d263ba0aaff10673d5200fe1756d839362))

# [1.389.0](https://github.com/betagouv/service-national-universel/compare/v1.388.0...v1.389.0) (2024-03-11)

### Bug Fixes

- **api:** 2013 - bug export classes ([#3649](https://github.com/betagouv/service-national-universel/issues/3649)) ([c382620](https://github.com/betagouv/service-national-universel/commit/c38262005fc146321c1d7f1e5fba521958ef04cb))
- **app:** bug url boutton demande ([#3651](https://github.com/betagouv/service-national-universel/issues/3651)) ([5527036](https://github.com/betagouv/service-national-universel/commit/5527036e9fb1d4aab6bf6243da65543aabc4817d))

### Features

- **app:** 1725 - breadcrumb add on App ([#3642](https://github.com/betagouv/service-national-universel/issues/3642)) ([bd74a12](https://github.com/betagouv/service-national-universel/commit/bd74a1260bc3a898275f816916621cc609d49544))

# [1.388.0](https://github.com/betagouv/service-national-universel/compare/v1.387.2...v1.388.0) (2024-03-08)

### Bug Fixes

- **api:** wait for mongodb initialization ([#3643](https://github.com/betagouv/service-national-universel/issues/3643)) ([a982509](https://github.com/betagouv/service-national-universel/commit/a982509ebeb65877934f6dc3d20468e99d393676))
- **sib:** Correct send in blue mongo import ([b033578](https://github.com/betagouv/service-national-universel/commit/b0335782816c8fac9445ebde0bc5a552087341f7))

### Features

- **admin:** 1369 - move new mission button ([#3639](https://github.com/betagouv/service-national-universel/issues/3639)) ([09fddfa](https://github.com/betagouv/service-national-universel/commit/09fddfa74259504adb0dc4c866ea8fa4ace83286))
- **admin:** 1599 - sidebar scroll ([#3641](https://github.com/betagouv/service-national-universel/issues/3641)) ([b8f4da3](https://github.com/betagouv/service-national-universel/commit/b8f4da303be62ea6593e877a30d6f9140bc0b41b))
- **admin:** 409 - shutdown bal ([#3640](https://github.com/betagouv/service-national-universel/issues/3640)) ([768aae1](https://github.com/betagouv/service-national-universel/commit/768aae127eba7f89a89c86f09e02cdc801ace1bd))
- **admin:** Better infromation ([6c38e30](https://github.com/betagouv/service-national-universel/commit/6c38e302f57dc91de6f0f7618971bdc906ef054f))
- **cron:** Add Cron basic logging ([#3647](https://github.com/betagouv/service-national-universel/issues/3647)) ([1a3b508](https://github.com/betagouv/service-national-universel/commit/1a3b5085075517649aa2b77a303919326d47fb29))

## [1.387.2](https://github.com/betagouv/service-national-universel/compare/v1.387.1...v1.387.2) (2024-03-07)

### Bug Fixes

- **admin:** export convoyeur ([#3648](https://github.com/betagouv/service-national-universel/issues/3648)) ([ad9c3e4](https://github.com/betagouv/service-national-universel/commit/ad9c3e4d84bbc6fd589e5fd10372a61c46548f6b))
- **api:** env manager staging ([f6f239c](https://github.com/betagouv/service-national-universel/commit/f6f239c55a0035a3d2fcc319c05ae28bdfa66e44))
- **api:** Fix age calculation when getting a mission [#3645](https://github.com/betagouv/service-national-universel/issues/3645) ([a5869a4](https://github.com/betagouv/service-national-universel/commit/a5869a4382048fdb3882f5c6d118ab69ca51491e))

## [1.387.1](https://github.com/betagouv/service-national-universel/compare/v1.387.0...v1.387.1) (2024-03-06)

### Bug Fixes

- **admin:** Fix ligne de bus sur les classes ([#3638](https://github.com/betagouv/service-national-universel/issues/3638)) ([25ee95d](https://github.com/betagouv/service-national-universel/commit/25ee95dc34301911b6a91630bc815f3bfa774e6c))

# [1.387.0](https://github.com/betagouv/service-national-universel/compare/v1.386.0...v1.387.0) (2024-03-05)

### Bug Fixes

- **api:** Antivirus timeout ([#3632](https://github.com/betagouv/service-national-universel/issues/3632)) ([e1b080c](https://github.com/betagouv/service-national-universel/commit/e1b080c54f444525e310656b1b97c8e66a77b922))
- **api:** Synchro api engagement ([#3634](https://github.com/betagouv/service-national-universel/issues/3634)) ([fc05d46](https://github.com/betagouv/service-national-universel/commit/fc05d46b2a4fd20679b95ab8083506711a067604))

### Features

- **api/admin:** 1772-1773 add ligne Bus sur la classe ([#3621](https://github.com/betagouv/service-national-universel/issues/3621)) ([de39104](https://github.com/betagouv/service-national-universel/commit/de391044bbdfda0d0e82155542d7a26a6f81fbb6))
- **app:** 1034 - update RL2 logic on app ([#3633](https://github.com/betagouv/service-national-universel/issues/3633)) ([aa149dc](https://github.com/betagouv/service-national-universel/commit/aa149dc7cbfb161f008020eec6988fb5499d52af))

# [1.386.0](https://github.com/betagouv/service-national-universel/compare/v1.385.3...v1.386.0) (2024-03-04)

### Features

- **admin:** 1963, 1965 - remove negative status from Classe Objective and Right Correction to Edit Cohort ([#3629](https://github.com/betagouv/service-national-universel/issues/3629)) ([f4cd437](https://github.com/betagouv/service-national-universel/commit/f4cd4375fd397d3320ac2ac15df6482afa3d509d))
- **admin/api:** 1717- Ajout d'un compteur du nombre max de pdr sur une ligne a l'import du pdt ([#3631](https://github.com/betagouv/service-national-universel/issues/3631)) ([856d2f6](https://github.com/betagouv/service-national-universel/commit/856d2f60849f1850e21cff7e4d1b35fb70ab75ae))
- **api:** 1865 - Antivirus microservice ([#3611](https://github.com/betagouv/service-national-universel/issues/3611)) ([84aaa9a](https://github.com/betagouv/service-national-universel/commit/84aaa9a43b2a585efe01e12c194300220d1ed11e))
- **api:** 1949 - CRON job ([#3624](https://github.com/betagouv/service-national-universel/issues/3624)) ([8d5d968](https://github.com/betagouv/service-national-universel/commit/8d5d968b04444fd33c875f2e027616fc7f0b3cf0))

## [1.385.3](https://github.com/betagouv/service-national-universel/compare/v1.385.2...v1.385.3) (2024-03-02)

### Bug Fixes

- **api:** Handle better S3 errors ([05c0c84](https://github.com/betagouv/service-national-universel/commit/05c0c847067f76fff4df0d77fedc3e3bbb981c88))

## [1.385.2](https://github.com/betagouv/service-national-universel/compare/v1.385.1...v1.385.2) (2024-02-29)

### Bug Fixes

- **api:** 1945-lorsqu'un jeune démémage, on update son adresse sur ses candidatures [#3622](https://github.com/betagouv/service-national-universel/issues/3622) ([6d5d4cb](https://github.com/betagouv/service-national-universel/commit/6d5d4cb2787bd7c330142316f854b6505401c170))
- **api:** probleme pour la date d'expiration des CNI ([#3620](https://github.com/betagouv/service-national-universel/issues/3620)) ([f4257f0](https://github.com/betagouv/service-national-universel/commit/f4257f050c37776d7d075371cf0bb3dc687de670))
- **app:** Add link to Change cohort on Waiting List page [#3627](https://github.com/betagouv/service-national-universel/issues/3627) ([74089b7](https://github.com/betagouv/service-national-universel/commit/74089b707ef9992dce5178140a08bf4ef549217f))
- **misc:** 1905 - fix clean action (image/app) ([#3628](https://github.com/betagouv/service-national-universel/issues/3628)) ([0a1c36b](https://github.com/betagouv/service-national-universel/commit/0a1c36b9eefaf28742ba1f7a2ac4bd88b20c343b))

## [1.385.1](https://github.com/betagouv/service-national-universel/compare/v1.385.0...v1.385.1) (2024-02-28)

### Bug Fixes

- **admin:** Visibilité affectation CLE pour ref. dep. ([#3623](https://github.com/betagouv/service-national-universel/issues/3623)) ([3dcbf07](https://github.com/betagouv/service-national-universel/commit/3dcbf0795a59815f0ff934f2d8742376f860a10a))
- **admin, api:** [CLE] Message d’erreur lors de la création d’une inscription manuelle (d’un jeune) depuis admin ([#3625](https://github.com/betagouv/service-national-universel/issues/3625)) ([1f56c2a](https://github.com/betagouv/service-national-universel/commit/1f56c2a4f04688e58f707e91f14c4c99767edddd))

# [1.385.0](https://github.com/betagouv/service-national-universel/compare/v1.384.0...v1.385.0) (2024-02-27)

### Bug Fixes

- **api:** session phase 1 certificate ([#3614](https://github.com/betagouv/service-national-universel/issues/3614)) ([dd3e2b9](https://github.com/betagouv/service-national-universel/commit/dd3e2b90af9e7f03e87436a1e320a5ae75290b8b))

### Features

- **misc:** remove sub-DNS zones ([#3617](https://github.com/betagouv/service-national-universel/issues/3617)) ([6c51066](https://github.com/betagouv/service-national-universel/commit/6c51066995741496c7bf85612ab3ca898b6b53ab))

# [1.384.0](https://github.com/betagouv/service-national-universel/compare/v1.383.0...v1.384.0) (2024-02-26)

### Features

- **misc:** CC deploy on production_cc branch ([#3612](https://github.com/betagouv/service-national-universel/issues/3612)) ([08e3f17](https://github.com/betagouv/service-national-universel/commit/08e3f17811841a1a5f30449dfd64f07a2307dcdb))
- **misc:** Normalize CC actions ([#3610](https://github.com/betagouv/service-national-universel/issues/3610)) ([5ec10c2](https://github.com/betagouv/service-national-universel/commit/5ec10c2866a99dfd774107fe8c34490dad3450e8))

# [1.383.0](https://github.com/betagouv/service-national-universel/compare/v1.382.1...v1.383.0) (2024-02-24)

### Features

- **admin:** update export classe ([c89d51f](https://github.com/betagouv/service-national-universel/commit/c89d51f029969ff5d114526e9a73325d3c544d89))
- **app, api:** 1705 - New screen and logic for ParentAcceptRI ([#3601](https://github.com/betagouv/service-national-universel/issues/3601)) ([89161d0](https://github.com/betagouv/service-national-universel/commit/89161d0336ad8a613239184945d8a47a5880e845))

## [1.382.1](https://github.com/betagouv/service-national-universel/compare/v1.382.0...v1.382.1) (2024-02-23)

### Bug Fixes

- **pdf:** add retry for failed promise ([#3608](https://github.com/betagouv/service-national-universel/issues/3608)) ([11be6cc](https://github.com/betagouv/service-national-universel/commit/11be6ccbe0e5555940e0470bd24855f8e241503c))

# [1.382.0](https://github.com/betagouv/service-national-universel/compare/v1.381.0...v1.382.0) (2024-02-22)

### Bug Fixes

- **api:** Optimise ES scroll ([#3600](https://github.com/betagouv/service-national-universel/issues/3600)) ([ce39769](https://github.com/betagouv/service-national-universel/commit/ce39769385fe15de3936ba7101e9eee531080ccb))
- **api:** snuId should be unique ([7ed8513](https://github.com/betagouv/service-national-universel/commit/7ed85134463d025c402105a016edb3ea6f9a4497))
- **lib:** Ajout cohort 2024 mayotte ([d957f24](https://github.com/betagouv/service-national-universel/commit/d957f240a9a885e69835668ab1b9acf45e38b233))

### Features

- **admin:** CLE - Disable young validation after instruction end date [#3605](https://github.com/betagouv/service-national-universel/issues/3605) ([22902f7](https://github.com/betagouv/service-national-universel/commit/22902f7f7c2583f41fe619cba36f9deee7ef46df))

# [1.381.0](https://github.com/betagouv/service-national-universel/compare/v1.380.0...v1.381.0) (2024-02-21)

### Bug Fixes

- **api, admin:** export classe schema de repartition ([#3603](https://github.com/betagouv/service-national-universel/issues/3603)) ([b46dc3b](https://github.com/betagouv/service-national-universel/commit/b46dc3b7770ff40ab034bb9749a0a7057fb7915d))

### Features

- **api:** block some jvaStructure ([#3604](https://github.com/betagouv/service-national-universel/issues/3604)) ([0f14788](https://github.com/betagouv/service-national-universel/commit/0f147884d53cb02ff593a4223c122ff2f7807dfb))
- **app:** 1769 - Ecran "Désisté" pour les CLE ([#3589](https://github.com/betagouv/service-national-universel/issues/3589)) ([03a6f22](https://github.com/betagouv/service-national-universel/commit/03a6f22b35bf743b070a9feaabd9f6cca4c30864))

# [1.380.0](https://github.com/betagouv/service-national-universel/compare/v1.379.0...v1.380.0) (2024-02-20)

### Bug Fixes

- **api:** Do not import prod in files ([caa2cee](https://github.com/betagouv/service-national-universel/commit/caa2ceef3a8714c30990f2853b5c14cfec8878f4))
- **api:** Le volontaire ne passe pas “en attente de validation” lorsque le consentement est donné depuis admin → Compte élève CLE bloqué sur en cours ([#3598](https://github.com/betagouv/service-national-universel/issues/3598)) ([b24890c](https://github.com/betagouv/service-national-universel/commit/b24890c1214861b6fa2a638462c0cde0a4b68f59))
- **api/admin:** Add student status to export ([#3599](https://github.com/betagouv/service-national-universel/issues/3599)) ([4e97d56](https://github.com/betagouv/service-national-universel/commit/4e97d56a4402ff1b584a3f074203dadca2136e0a))
- **lib:** Add sessions CLE to list ([40ea549](https://github.com/betagouv/service-national-universel/commit/40ea54904daae9778da3bfc0a3bf498f9aa8f031))

### Features

- **app, misc:** 1702, 1696 - Reglement intérieur popin + version ([#3592](https://github.com/betagouv/service-national-universel/issues/3592)) ([3ee9a95](https://github.com/betagouv/service-national-universel/commit/3ee9a9538427a5892502e83abf47f94a82133340))

# [1.379.0](https://github.com/betagouv/service-national-universel/compare/v1.378.0...v1.379.0) (2024-02-19)

### Bug Fixes

- **admin:** Filter not editable cohort from cohort list ([#3596](https://github.com/betagouv/service-national-universel/issues/3596)) ([458c806](https://github.com/betagouv/service-national-universel/commit/458c806d5edecbb712d68141c773ca17880cbf26))
- **api:** Imports should be used after sentry setup ([6b9af05](https://github.com/betagouv/service-national-universel/commit/6b9af050040ea088a2aae410e825221c2a93f80b))
- **api:** Wrong convocation downloaded + clean unused domtom convocation ([#3578](https://github.com/betagouv/service-national-universel/issues/3578)) ([4b35be8](https://github.com/betagouv/service-national-universel/commit/4b35be8115be083d3080562a7d9cc7383475a3c3))
- **lib:** Fix constants for cohorts ([0105827](https://github.com/betagouv/service-national-universel/commit/01058271cb04a802c3730805523492ebd7b2d56b))

### Features

- **admin:** 1785 - New attestations for 2024 Cohorte ([#3594](https://github.com/betagouv/service-national-universel/issues/3594)) ([37c2b72](https://github.com/betagouv/service-national-universel/commit/37c2b723763cd3bf641e6952fba6c3b39b432353))
- **misc:** 1905 - Granular build & deploy / app ([#3595](https://github.com/betagouv/service-national-universel/issues/3595)) ([93e241f](https://github.com/betagouv/service-national-universel/commit/93e241fcdbe34bc8aa20637f1b86c31fbd12f26e))
- **misc:** 1905 - run_test_api action ([#3597](https://github.com/betagouv/service-national-universel/issues/3597)) ([07000ed](https://github.com/betagouv/service-national-universel/commit/07000ed97dda16b1186d94ede2e95aa2080c3b5b))

# [1.378.0](https://github.com/betagouv/service-national-universel/compare/v1.377.0...v1.378.0) (2024-02-16)

### Features

- **app:** 1873 - update permission accessPhase2 for HTS->CLE ([#3590](https://github.com/betagouv/service-national-universel/issues/3590)) ([be0c447](https://github.com/betagouv/service-national-universel/commit/be0c44794a2b474d84c6a0a10cfa9b85628608f3))

# [1.377.0](https://github.com/betagouv/service-national-universel/compare/v1.376.0...v1.377.0) (2024-02-15)

### Bug Fixes

- **admin:** Classe view ([46bb8af](https://github.com/betagouv/service-national-universel/commit/46bb8af87294687882483184a1f85346af832b1c))

### Features

- **api/admin:** 1750 & 1755 - Dynamic settings for CLE ([#3579](https://github.com/betagouv/service-national-universel/issues/3579)) ([e032260](https://github.com/betagouv/service-national-universel/commit/e0322600198858d93b545e2bcaf43ca92a0bdeaf))

# [1.376.0](https://github.com/betagouv/service-national-universel/compare/v1.375.2...v1.376.0) (2024-02-14)

### Features

- **api, app, admin:** 1704 - Add "Other" type and text input to equivalence request ([#3559](https://github.com/betagouv/service-national-universel/issues/3559)) ([ad6d6b4](https://github.com/betagouv/service-national-universel/commit/ad6d6b475eb6e076a661fa22fb202789d957352b))

## [1.375.2](https://github.com/betagouv/service-national-universel/compare/v1.375.1...v1.375.2) (2024-02-13)

### Bug Fixes

- **api:** Fix class populate on ticket creation ([#3585](https://github.com/betagouv/service-national-universel/issues/3585)) ([b0d7410](https://github.com/betagouv/service-national-universel/commit/b0d7410aef6f35e4395109d98a2e40c32edf24e3))
- **api,admin:** test pipeline + logic on delete ref ([#3586](https://github.com/betagouv/service-national-universel/issues/3586)) ([03dfe99](https://github.com/betagouv/service-national-universel/commit/03dfe99f30fb91ac8d6d50b820bd0859e5e3cba2))

## [1.375.1](https://github.com/betagouv/service-national-universel/compare/v1.375.0...v1.375.1) (2024-02-11)

### Bug Fixes

- **app:** Minor fixes to Phase1/Affected page ([451dcfc](https://github.com/betagouv/service-national-universel/commit/451dcfcd9a0b70d3b9e11a7cc4061a280c23787c))

# [1.375.0](https://github.com/betagouv/service-national-universel/compare/v1.374.0...v1.375.0) (2024-02-08)

### Features

- **app:** 1720, 1728, 1783 - Blocking phase3 + Phase 2 Home + Phase 2 Navbar ([#3544](https://github.com/betagouv/service-national-universel/issues/3544)) ([d5ad65f](https://github.com/betagouv/service-national-universel/commit/d5ad65f38c37ea1ffea37bf8aa8aeb1e4b24d446))
- **app, lib:** 1715 - Adapt Phase1NotDone screen for CLE. ([#3512](https://github.com/betagouv/service-national-universel/issues/3512)) ([6656820](https://github.com/betagouv/service-national-universel/commit/6656820304e14de5fd70eee3a3723016099ba166))

# [1.374.0](https://github.com/betagouv/service-national-universel/compare/v1.373.0...v1.374.0) (2024-02-07)

### Bug Fixes

- is inscription open ([9d7ec30](https://github.com/betagouv/service-national-universel/commit/9d7ec30b68fafc19d9fe2983548b1978288000a7))
- **admin:** Bouton inscription eleve disabled ([#3570](https://github.com/betagouv/service-national-universel/issues/3570)) ([4814da0](https://github.com/betagouv/service-national-universel/commit/4814da0a2eca80b1f6a98e9a3c5b7ecebb38cbf0))
- **app:** 595 - Restore "Download" and "Send by mail" buttons in medical file modal [#3556](https://github.com/betagouv/service-national-universel/issues/3556) ([6c8d961](https://github.com/betagouv/service-national-universel/commit/6c8d961e0becac3a461fa0249fa2b90203ae9831))
- **app:** CLE travel info component [#3546](https://github.com/betagouv/service-national-universel/issues/3546) ([9649911](https://github.com/betagouv/service-national-universel/commit/964991128f30e25e86c1b5fbe6d76af8277efc31))
- **lib:** validated status color ([5a727e8](https://github.com/betagouv/service-national-universel/commit/5a727e8ee70cc091106ab9abd8a7ad4250d2093b))
- **lib,app,admin:** fix inscription CLE Closed constants ([#3566](https://github.com/betagouv/service-national-universel/issues/3566)) ([1f74d16](https://github.com/betagouv/service-national-universel/commit/1f74d168e27b491cff6e0d643c108bf03fd01485))
- **lib/admin:** 1810 - Dev mode & env by domain ([#3571](https://github.com/betagouv/service-national-universel/issues/3571)) ([dfd13a6](https://github.com/betagouv/service-national-universel/commit/dfd13a64e0bf90eff2b9b8b8f475fde0ef4e991c))

### Features

- **app:** Inscription CLE : Ecran de clôture globale des inscriptions ([#3562](https://github.com/betagouv/service-national-universel/issues/3562)) ([53f9dad](https://github.com/betagouv/service-national-universel/commit/53f9dadf0088eb80c3e0302915471d1dfe287d9d))

# [1.373.0](https://github.com/betagouv/service-national-universel/compare/v1.372.0...v1.373.0) (2024-02-06)

### Bug Fixes

- **api:** export etablissements ([c7fd494](https://github.com/betagouv/service-national-universel/commit/c7fd494677b3feebad48f33d4702b2902102a6f7))
- **api:** JVA block good structure ([29fc6eb](https://github.com/betagouv/service-national-universel/commit/29fc6eb99b727336805b0e6ce4057f07a5a5029c))
- **api:** qpv empty string ([#3563](https://github.com/betagouv/service-national-universel/issues/3563)) ([c700e02](https://github.com/betagouv/service-national-universel/commit/c700e023865af18660f770327730c5f1098eab61))
- **lib,app,admin:** fix inscription CLE Closed constants ([efc9126](https://github.com/betagouv/service-national-universel/commit/efc91262bc87c553247d10c95ac3280edeaa6f3d))

### Features

- **github:** Deploy clevercloud on production branch only ([6900782](https://github.com/betagouv/service-national-universel/commit/6900782e9d5cd43c27945048fecdfe69e9364fcf))

# [1.372.0](https://github.com/betagouv/service-national-universel/compare/v1.371.0...v1.372.0) (2024-02-05)

### Bug Fixes

- **api:** 1596 - Young CLE Academy ([#3560](https://github.com/betagouv/service-national-universel/issues/3560)) ([465f9c6](https://github.com/betagouv/service-national-universel/commit/465f9c6460ddaaeec97988b4004f3aa404aa8d71))
- **api:** Reput clamav back ([074aa50](https://github.com/betagouv/service-national-universel/commit/074aa506612ab82b5e9e30d841134866f9c66c80))

### Features

- **admin:** 1582 - Alert messages for all ADMINs ([#3561](https://github.com/betagouv/service-national-universel/issues/3561)) ([d3fd23f](https://github.com/betagouv/service-national-universel/commit/d3fd23ff72f2fe035f2af8920e5d01384d53d665))
- **api:** 1250 - Prénoms composés ([#3558](https://github.com/betagouv/service-national-universel/issues/3558)) ([fb8b46f](https://github.com/betagouv/service-national-universel/commit/fb8b46f74674aa001980abfd570e05f9995d2575))
- **app:** 1417 - inscription closed screen for CLE ([#3534](https://github.com/betagouv/service-national-universel/issues/3534)) ([8cabc77](https://github.com/betagouv/service-national-universel/commit/8cabc775dd97d2d5c36f3390309af7a56bd01cca))
- **app:** 1732 - Close inscription for CLE on app ([#3551](https://github.com/betagouv/service-national-universel/issues/3551)) ([72164b8](https://github.com/betagouv/service-national-universel/commit/72164b8484d417d7b3c3bfbf45062281df40b687))
- **app:** 1746 - New screen for Young CLE when inscription is closed ([#3543](https://github.com/betagouv/service-national-universel/issues/3543)) ([1db69fc](https://github.com/betagouv/service-national-universel/commit/1db69fceada0b1e755f49c875a3310f60fcb1226))
- **app:** 1784 - Phase 2 In_Progress new screen ([#3548](https://github.com/betagouv/service-national-universel/issues/3548)) ([a449472](https://github.com/betagouv/service-national-universel/commit/a44947250818ed74af0c675a1f7be42a7a2ae112))

### Reverts

- Revert "chore(github): Delete CleverCloud" ([fbe4728](https://github.com/betagouv/service-national-universel/commit/fbe47289f99532ea40c8fec2de1232cd37ee10a6))

# [1.371.0](https://github.com/betagouv/service-national-universel/compare/v1.370.0...v1.371.0) (2024-02-02)

### Bug Fixes

- **api:** bug env sentry sample rate ([#3554](https://github.com/betagouv/service-national-universel/issues/3554)) ([4b6c4f3](https://github.com/betagouv/service-national-universel/commit/4b6c4f3445b5216265aee6403e4346ad2b527b8d))

### Features

- **api:** 1767 - Add virtual fields in ES ([#3535](https://github.com/betagouv/service-national-universel/issues/3535)) ([0c18aab](https://github.com/betagouv/service-national-universel/commit/0c18aab15f41c637854750509a487e221a0cb708))

# [1.370.0](https://github.com/betagouv/service-national-universel/compare/v1.369.0...v1.370.0) (2024-02-01)

### Features

- **api/admin:** permettre la prévisualisation des CNI des jeunes au lieu de DL ([#3514](https://github.com/betagouv/service-national-universel/issues/3514)) ([a605ddf](https://github.com/betagouv/service-national-universel/commit/a605ddf118ed0420e1322efc7c5e14c8bbdb2c08))
- **app:** Update Home - status phase 2 Validated ([#3547](https://github.com/betagouv/service-national-universel/issues/3547)) ([8a691c3](https://github.com/betagouv/service-national-universel/commit/8a691c39ea5a0662cdb8bda7323cd514e3c421bf))

# [1.369.0](https://github.com/betagouv/service-national-universel/compare/v1.368.0...v1.369.0) (2024-01-31)

### Bug Fixes

- **api:** Allow empty dates on cohort edition [#3541](https://github.com/betagouv/service-national-universel/issues/3541) ([e89a346](https://github.com/betagouv/service-national-universel/commit/e89a346f31c6dfc476cc9c0df9186eddab572528))
- **api:** Fix CLE cohesion convocation ([eeb3eb6](https://github.com/betagouv/service-national-universel/commit/eeb3eb6c4659c354cebc64256ac5d37a99c549f9))
- **app:** Fix medical file info icon ([c6c81c1](https://github.com/betagouv/service-national-universel/commit/c6c81c194d6d9c2db74626f0e3fbbf16d22df806))
- etablissement export ([63c29a5](https://github.com/betagouv/service-national-universel/commit/63c29a5ed2d16d6c8b5c1a7c649737346f06e2e2))

### Features

- **api/admin:** 1558 - Liste établissement export ([#3542](https://github.com/betagouv/service-national-universel/issues/3542)) ([0366bba](https://github.com/betagouv/service-national-universel/commit/0366bba7c281e09b359e279f55b2518bf8ff27c6))
- **api/admin:** 1731 - Admin create classe for etablissement ([#3545](https://github.com/betagouv/service-national-universel/issues/3545)) ([ca729de](https://github.com/betagouv/service-national-universel/commit/ca729de440eb09e41124910d6a4fdd5b79e25665))
- **app:** 1679 - ConvocPreview For CLE ([#3521](https://github.com/betagouv/service-national-universel/issues/3521)) ([cd9ec60](https://github.com/betagouv/service-national-universel/commit/cd9ec60c4b22204f9c73c43db83bd000af53e5fa))
- **app:** CLE - "Affected" screen ([#3537](https://github.com/betagouv/service-national-universel/issues/3537)) ([f135c84](https://github.com/betagouv/service-national-universel/commit/f135c8484babaa7040b106e6e15a3653a5921217))

# [1.368.0](https://github.com/betagouv/service-national-universel/compare/v1.367.0...v1.368.0) (2024-01-30)

### Features

- **admin:** 1731-Suppression du bouton "Créer une classe" pour les admin CLE ([a2e6f21](https://github.com/betagouv/service-national-universel/commit/a2e6f210be7e268a6fd9851f5b03405a69adfba8))

# [1.367.0](https://github.com/betagouv/service-national-universel/compare/v1.366.0...v1.367.0) (2024-01-29)

### Bug Fixes

- **api:** fix populate referent [#3526](https://github.com/betagouv/service-national-universel/issues/3526) ([7f9f7a0](https://github.com/betagouv/service-national-universel/commit/7f9f7a05751e31870cf1d160d3f99fd53c34c71d))
- **api:** Save email addresses only as lowercase ([#3398](https://github.com/betagouv/service-national-universel/issues/3398)) ([5845227](https://github.com/betagouv/service-national-universel/commit/58452270cde79411a13ba8424f2a29719ff5d2b1))

### Features

- **app:** 1488-schoolManualFilling ([#3419](https://github.com/betagouv/service-national-universel/issues/3419)) ([a0679fb](https://github.com/betagouv/service-national-universel/commit/a0679fb70761851aab5cf32f5859f5411ba0134e))
- Create branch ([#3523](https://github.com/betagouv/service-national-universel/issues/3523)) ([9feda5d](https://github.com/betagouv/service-national-universel/commit/9feda5dac462ba0e4b751b833f96aca15bf1e2ad))
- **api:** create token for parent2 ([#3519](https://github.com/betagouv/service-national-universel/issues/3519)) ([d80b199](https://github.com/betagouv/service-national-universel/commit/d80b199d315994240e36aab7628893dae94e7efc))

# [1.366.0](https://github.com/betagouv/service-national-universel/compare/v1.365.1...v1.366.0) (2024-01-26)

### Bug Fixes

- **api:** Export SENTRY_PROFILE_SAMPLE_RATE ([15befca](https://github.com/betagouv/service-national-universel/commit/15befcaf9db77dcd2d2e461940287dfe7d43a867))
- **api:** fermer les invitations de chef d'etablissement avec le lien de decembre ([8d24f5a](https://github.com/betagouv/service-national-universel/commit/8d24f5acd1d30eeec78965e3a4d533815034fcb4))

### Features

- **api:** HTS > CLE keep phase2 open if phase has been DONE ([#3492](https://github.com/betagouv/service-national-universel/issues/3492)) ([2bdcb12](https://github.com/betagouv/service-national-universel/commit/2bdcb1272f942f77df14477ce3e154f60c442de8))

## [1.365.1](https://github.com/betagouv/service-national-universel/compare/v1.365.0...v1.365.1) (2024-01-25)

### Bug Fixes

- **api:** fix jva connexion ([2a535de](https://github.com/betagouv/service-national-universel/commit/2a535dec05a0d6a58d7eaa7cb10e719bba05aaca))
- **api:** Jva connexion ([84a53c9](https://github.com/betagouv/service-national-universel/commit/84a53c9713738e8b00cb41c530c3cb8db85ba7ec))
- **api:** JVA connexion ([d175b87](https://github.com/betagouv/service-national-universel/commit/d175b8771a37926508423bfccc293a93f9152154))
- **api:** JVA connexion ([61c10e2](https://github.com/betagouv/service-national-universel/commit/61c10e27ef3e58eb906067f1650640f3a420e2fe))
- **api:** passage du statut du jeune en WA apres consentement par un ref ([757e041](https://github.com/betagouv/service-national-universel/commit/757e041b0465d5cc773de3c73b777701818ce3ae))
- **app:** lauchBreak fix for fev C ([3d56236](https://github.com/betagouv/service-national-universel/commit/3d562362c27c127465802ad34ce9a71003595620))

# [1.365.0](https://github.com/betagouv/service-national-universel/compare/v1.364.0...v1.365.0) (2024-01-24)

### Bug Fixes

- **admin/api:** 561-resolution du bug de cohérence entre les centres dans l'export du SR ([ecfbea0](https://github.com/betagouv/service-national-universel/commit/ecfbea0bcf1f521caf82cec89633d6fa42daea21))

### Features

- **admin/api:** permettre aux refs CLE d'accepter le consentement OU le droit a l'image a la place des parents ([#3503](https://github.com/betagouv/service-national-universel/issues/3503)) ([e74a93e](https://github.com/betagouv/service-national-universel/commit/e74a93ee43648fa2ed8f596c88487bc80754cbcc))
- **app:** 1697 - remove MaskNeeded for session ([#3499](https://github.com/betagouv/service-national-universel/issues/3499)) ([0f45d27](https://github.com/betagouv/service-national-universel/commit/0f45d279d88ec1cd237642a7f645cea8b9aea6e5))

# [1.364.0](https://github.com/betagouv/service-national-universel/compare/v1.363.0...v1.364.0) (2024-01-23)

### Bug Fixes

- **admin:** 573 - Objectif cohort ([#3496](https://github.com/betagouv/service-national-universel/issues/3496)) ([e80ff82](https://github.com/betagouv/service-national-universel/commit/e80ff823238790abe8669e98d52d8628bba7b9c7))

### Features

- **admin:** 1542-trier les departements dans les filtres des dashboards ([#3498](https://github.com/betagouv/service-national-universel/issues/3498)) ([15b0414](https://github.com/betagouv/service-national-universel/commit/15b041402a0ba1d1cebb04ecce6a8ad85fbe1fc6))
- **admin:** 1645-affichage des cohorts pour les contacts convocation et refacto des modales ([#3497](https://github.com/betagouv/service-national-universel/issues/3497)) ([9235750](https://github.com/betagouv/service-national-universel/commit/92357504820e56fd13c6885a53096d51ecdfe27b))
- **admin/api:** 1718-Harmoniser les infos centres du SR ([#3501](https://github.com/betagouv/service-national-universel/issues/3501)) ([497a405](https://github.com/betagouv/service-national-universel/commit/497a4058ad7929994dba740c1dfbb6ce726be59b))
- **api:** 1482 - Cron email inscription reminder ([#3321](https://github.com/betagouv/service-national-universel/issues/3321)) ([756084f](https://github.com/betagouv/service-national-universel/commit/756084f93d0dfb0be4641ece4a86d35a6b26f4ed))
- **api:** 1524 - better logs ([#3481](https://github.com/betagouv/service-national-universel/issues/3481)) ([45677c7](https://github.com/betagouv/service-national-universel/commit/45677c70d30bfb7d2a81e2d7c1011dcf09ffb037))
- **api/admin:** 1688-Permettre aux refs CLE de valider le consentement des parents à leurs place ([#3491](https://github.com/betagouv/service-national-universel/issues/3491)) ([bb9c570](https://github.com/betagouv/service-national-universel/commit/bb9c570d7c85fba9790011c1031ce48813f05ea6))
- **app:** 1592 - Bloquer les candidatures aux MIG pour les cohortes 2019/2020 ([#3472](https://github.com/betagouv/service-national-universel/issues/3472)) ([ce6edba](https://github.com/betagouv/service-national-universel/commit/ce6edba354a105c8d88e7c801fa77d3798f4db92))
- **app:** Update Convoc Preview for Affected Young ([#3488](https://github.com/betagouv/service-national-universel/issues/3488)) ([a49754f](https://github.com/betagouv/service-national-universel/commit/a49754f2f1715c034fbbac1ccef40cea29a36527))

# [1.363.0](https://github.com/betagouv/service-national-universel/compare/v1.362.0...v1.363.0) (2024-01-22)

### Features

- **lib:** create cohort CLE ([#3494](https://github.com/betagouv/service-national-universel/issues/3494)) ([9a88c49](https://github.com/betagouv/service-national-universel/commit/9a88c493d6ff471e45240ae3b108937a8aa21eda))
- **lib:** delete cohort ([#3493](https://github.com/betagouv/service-national-universel/issues/3493)) ([2ea83ed](https://github.com/betagouv/service-national-universel/commit/2ea83ed48660d7b082411c4d5da8918da3de81bc))

# [1.362.0](https://github.com/betagouv/service-national-universel/compare/v1.361.0...v1.362.0) (2024-01-19)

### Bug Fixes

- **api:** Version check for old tokens ([7a845d7](https://github.com/betagouv/service-national-universel/commit/7a845d750d90e8ebdcdb64e0f7f4127089e7f9d8))

### Features

- **api:** new convocation for 2024 ([#3483](https://github.com/betagouv/service-national-universel/issues/3483)) ([c8fca45](https://github.com/betagouv/service-national-universel/commit/c8fca45aa5baf199fa6d72f1b4c97faa654a6911))
- **api:** Update get PDR functions [#3487](https://github.com/betagouv/service-national-universel/issues/3487) ([251b841](https://github.com/betagouv/service-national-universel/commit/251b841a2fd149ec299002ebcb47b35cf366ee48))

# [1.361.0](https://github.com/betagouv/service-national-universel/compare/v1.360.0...v1.361.0) (2024-01-18)

### Bug Fixes

- **api:** canSigninAs ([506c398](https://github.com/betagouv/service-national-universel/commit/506c39814a619d05ef0c96510f1be3df79fe4dfc))
- **api:** syncro pdt ligne de bus centre hours ([5aa8601](https://github.com/betagouv/service-national-universel/commit/5aa8601a80cd30fffff04ca6e0bbfd993afe693e))

### Features

- **api:** update import PDT hours format ([881a67a](https://github.com/betagouv/service-national-universel/commit/881a67a169e73a3f1d34f57a93d40ec9be1f0af3))

# [1.360.0](https://github.com/betagouv/service-national-universel/compare/v1.359.0...v1.360.0) (2024-01-17)

### Features

- **admin/lib:** 1693 - Chef dep canSigninAs Admin CLE & ref classe ([#3484](https://github.com/betagouv/service-national-universel/issues/3484)) ([9f70453](https://github.com/betagouv/service-national-universel/commit/9f704539ec9c28fa7f7384177e146117a1655796))
- **api/admin:** 1680 - Classe list add filters department & region ([#3485](https://github.com/betagouv/service-national-universel/issues/3485)) ([d6d57d3](https://github.com/betagouv/service-national-universel/commit/d6d57d3a16aef005390935ff207ca7facdb01fa9))

# [1.359.0](https://github.com/betagouv/service-national-universel/compare/v1.358.0...v1.359.0) (2024-01-16)

### Features

- **admin:** 1681 - ADMIN CLE & Ref Classe WITHDRAW young ([#3482](https://github.com/betagouv/service-national-universel/issues/3482)) ([862d960](https://github.com/betagouv/service-national-universel/commit/862d96011377552aa42b400d0e10fc99a42ed55e))
- **api:** 1010 - Api Education Gouv.Fr ([#3473](https://github.com/betagouv/service-national-universel/issues/3473)) ([aa8a6b2](https://github.com/betagouv/service-national-universel/commit/aa8a6b26ff42c77b325f78fc6deb0fec1c0ea70f))

# [1.358.0](https://github.com/betagouv/service-national-universel/compare/v1.357.1...v1.358.0) (2024-01-15)

### Bug Fixes

- **app:** onboarding wording ([bf44472](https://github.com/betagouv/service-national-universel/commit/bf444727de88d2fd35e1bb21228ed28e96c67919))

### Features

- **app:** 1636 - Hide cohesion stay dates for CLE users [#3456](https://github.com/betagouv/service-national-universel/issues/3456) ([e6b0bc3](https://github.com/betagouv/service-national-universel/commit/e6b0bc3f9fb6e18f3c70df551ca843ce6fedbe24))

## [1.357.1](https://github.com/betagouv/service-national-universel/compare/v1.357.0...v1.357.1) (2024-01-12)

### Bug Fixes

- **api:** demande de modif authorization ([17557d3](https://github.com/betagouv/service-national-universel/commit/17557d392e3c2c2eba3dbb11d44468045d2a9689))

# [1.357.0](https://github.com/betagouv/service-national-universel/compare/v1.356.0...v1.357.0) (2024-01-11)

### Bug Fixes

- **api:** 1520: remediation token duration ([#3468](https://github.com/betagouv/service-national-universel/issues/3468)) ([780d7dd](https://github.com/betagouv/service-national-universel/commit/780d7dd2992b392f450b41562340020693444c3b))
- **api:** Get referent CLE classes ([#3469](https://github.com/betagouv/service-national-universel/issues/3469)) ([b369fad](https://github.com/betagouv/service-national-universel/commit/b369fade939313c025c993cf1d400b5372139661))
- **api:** trim code 2fa signup CLE admin ([#3474](https://github.com/betagouv/service-national-universel/issues/3474)) ([a9619b6](https://github.com/betagouv/service-national-universel/commit/a9619b6e164305394b04984a7241b83a4f46dddf))

### Features

- **api:** notify transporteur on change PDT ([#3470](https://github.com/betagouv/service-national-universel/issues/3470)) ([ed7c8cb](https://github.com/betagouv/service-national-universel/commit/ed7c8cbe26d62a4b8512a18604fdd498ac7e6a43))
- **api/admin:** 1682 - Export associations ([#3471](https://github.com/betagouv/service-national-universel/issues/3471)) ([be96ff5](https://github.com/betagouv/service-national-universel/commit/be96ff54363afe99ca69e3428e97450d014b9d0b))

# [1.356.0](https://github.com/betagouv/service-national-universel/compare/v1.355.0...v1.356.0) (2024-01-10)

### Bug Fixes

- **admin:** 542 - Hide create class for non ADMINISTRATEUR_CLE ([#3465](https://github.com/betagouv/service-national-universel/issues/3465)) ([82881c7](https://github.com/betagouv/service-national-universel/commit/82881c739bd810775b9a716c24f85d10df48367c))
- **admin:** xlsx sheet name length ([11e970f](https://github.com/betagouv/service-national-universel/commit/11e970fb856e981d2123f8e901e0efe3736eea85))
- **api:** bug oublie return ([86ed457](https://github.com/betagouv/service-national-universel/commit/86ed457688fa5b47fda665f03703d5b3b8fec86a))
- **api:** GET referent - avoid crashing when resource to populate is not found ([#3466](https://github.com/betagouv/service-national-universel/issues/3466)) ([2e14fb1](https://github.com/betagouv/service-national-universel/commit/2e14fb1a3b6f07e3684e55980677a2a941813757))
- **api/admin:** 1598 - Dynamic settings required fields ([#3461](https://github.com/betagouv/service-national-universel/issues/3461)) ([0c1d42d](https://github.com/betagouv/service-national-universel/commit/0c1d42d550f64ad3d8ed04d2dfd44874597da0a5))

### Features

- **admin:** 1622 - Transporter can contact the support ([#3462](https://github.com/betagouv/service-national-universel/issues/3462)) ([3a2a4e0](https://github.com/betagouv/service-national-universel/commit/3a2a4e026dd61fc3adb3eae43ef5557a1376a56a))
- **admin:** 1664 - Add cohort name ([#3463](https://github.com/betagouv/service-national-universel/issues/3463)) ([81fd893](https://github.com/betagouv/service-national-universel/commit/81fd893859c613e831840e938193f5cc01ff2064))

# [1.355.0](https://github.com/betagouv/service-national-universel/compare/v1.354.0...v1.355.0) (2024-01-09)

### Bug Fixes

- **admin/api:** 492 - Switch HTS <> CLE status ([#3455](https://github.com/betagouv/service-national-universel/issues/3455)) ([f869d1a](https://github.com/betagouv/service-national-universel/commit/f869d1ac3379bc225acd0583dc608faac02d6c46))

### Features

- **api/admin:** Export classes list ([#3459](https://github.com/betagouv/service-national-universel/issues/3459)) ([d478bdc](https://github.com/betagouv/service-national-universel/commit/d478bdccf26492cd6670202dd130a3dd099bd0f8))
- **api/analytics:** 738: data events log youngs ([#3443](https://github.com/betagouv/service-national-universel/issues/3443)) ([e1551a5](https://github.com/betagouv/service-national-universel/commit/e1551a5537f54f4bd4b88b64f4033a8d43aa51a8))

# [1.354.0](https://github.com/betagouv/service-national-universel/compare/v1.353.0...v1.354.0) (2024-01-08)

### Bug Fixes

- **admin:** class etablissement name ([7186d9f](https://github.com/betagouv/service-national-universel/commit/7186d9f15c29262388be5eddfc7ad0ae7a890722))

### Features

- **admin:** 1609 - Modification du temps de convocation à 30 min avant le départ du transport ([#3457](https://github.com/betagouv/service-national-universel/issues/3457)) ([611e921](https://github.com/betagouv/service-national-universel/commit/611e9214c08c4f8e949516a14c43b20741cb83e4))
- **api/admin:** 1620 - Classe set center & pdr ([#3439](https://github.com/betagouv/service-national-universel/issues/3439)) ([d41cad3](https://github.com/betagouv/service-national-universel/commit/d41cad3746512ebe46bb3f7e6198053ed0eed927))
- **api/admin:** 1638 - deconnecter le SR du PDT : Route ligne-de-bus/:id/data-for-check ([#3449](https://github.com/betagouv/service-national-universel/issues/3449)) ([1582477](https://github.com/betagouv/service-national-universel/commit/158247743fcb40aa0ce16f29690408d6fa6b91a5))

# [1.353.0](https://github.com/betagouv/service-national-universel/compare/v1.352.0...v1.353.0) (2024-01-05)

### Bug Fixes

- **admin:** 501 - Modal change cohort class list without draft and withdrawn ([#3450](https://github.com/betagouv/service-national-universel/issues/3450)) ([7d5a8e1](https://github.com/betagouv/service-national-universel/commit/7d5a8e130e37b758d1fd36ab71769e2eb681f615))
- **admin:** head center team phone + mobile ([f0baba0](https://github.com/betagouv/service-national-universel/commit/f0baba0597ca09896388413d1d979630da110022))

### Features

- **admin/api:** 485-Donner la possibilité aux ref reg/dep de prendre la place de leur ref CLE [#3452](https://github.com/betagouv/service-national-universel/issues/3452) ([bb4ce61](https://github.com/betagouv/service-national-universel/commit/bb4ce61c5270d529a820888402a57e33c49a9bc6))
- **api/admin:** 1574-Retour CLE non prio ([#3442](https://github.com/betagouv/service-national-universel/issues/3442)) ([b1b4533](https://github.com/betagouv/service-national-universel/commit/b1b45334a65e90f8b10cf3cd92c835dc81b65779))

# [1.352.0](https://github.com/betagouv/service-national-universel/compare/v1.351.0...v1.352.0) (2024-01-04)

### Bug Fixes

- **admin:** 491 - Sidebar env status dev/test/prod ([#3448](https://github.com/betagouv/service-national-universel/issues/3448)) ([d7e5057](https://github.com/betagouv/service-national-universel/commit/d7e50572ab6f6d0d22790fc50ffcc3e9c5d6bf67))
- **admin:** modal change cohort CNI alert ([#3446](https://github.com/betagouv/service-national-universel/issues/3446)) ([a09aa59](https://github.com/betagouv/service-national-universel/commit/a09aa59b69997f78080bc4cc7b7392937c178894))

### Features

- **admin:** 1575 - Supprimer l’onglet “phase 3” dans les profils des élèves ([#3447](https://github.com/betagouv/service-national-universel/issues/3447)) ([af49b70](https://github.com/betagouv/service-national-universel/commit/af49b708d68199bed772da90e4b318ecffc1e564))

# [1.351.0](https://github.com/betagouv/service-national-universel/compare/v1.350.5...v1.351.0) (2024-01-03)

### Bug Fixes

- **api:** get cohort route - return all cohorts by default [#3436](https://github.com/betagouv/service-national-universel/issues/3436) ([01a5947](https://github.com/betagouv/service-national-universel/commit/01a594703e16825354a9e157be36e115e7ce86dc))
- **api:** Put mobile in referent model ([#3440](https://github.com/betagouv/service-national-universel/issues/3440)) ([5deafbb](https://github.com/betagouv/service-national-universel/commit/5deafbb5cf44b64eb111b53a037017fea16bc3e5))

### Features

- **api:** 1605- retirer le check de cohérence a l'import du pdt [#3434](https://github.com/betagouv/service-national-universel/issues/3434) ([48b15fc](https://github.com/betagouv/service-national-universel/commit/48b15fca3ee339a7ce1c9928436a91d36a796741))

## [1.350.5](https://github.com/betagouv/service-national-universel/compare/v1.350.4...v1.350.5) (2024-01-02)

### Bug Fixes

- **api:** Force to use api.snu.gouv.fr ([52fa460](https://github.com/betagouv/service-national-universel/commit/52fa46054c22c6e667ad4bd217603a78abc6669a))

## [1.350.4](https://github.com/betagouv/service-national-universel/compare/v1.350.3...v1.350.4) (2023-12-29)

### Bug Fixes

- **admin:** revert override edit fev PDR ([1056253](https://github.com/betagouv/service-national-universel/commit/105625330e2f49840108cd3c3cbd4f9f1eaa7bb2))
- **admin:** support for transporter ([6ebc7da](https://github.com/betagouv/service-national-universel/commit/6ebc7dac212e88330419c7ac28379f8da4c8d1f3))

## [1.350.3](https://github.com/betagouv/service-national-universel/compare/v1.350.2...v1.350.3) (2023-12-27)

### Bug Fixes

- **api:** remove enum in originalCohort field ([4932925](https://github.com/betagouv/service-national-universel/commit/493292568abc118a2d5dde4e7c4f2b954a5e1a61))
- **app:** handle new CLE that do not have modification end date ([36078e5](https://github.com/betagouv/service-national-universel/commit/36078e519a1045d3acb54e1095cb56a16eb791be))

## [1.350.2](https://github.com/betagouv/service-national-universel/compare/v1.350.1...v1.350.2) (2023-12-26)

### Bug Fixes

- **app:** Allow access to Waiting List home page ([b8e6adf](https://github.com/betagouv/service-national-universel/commit/b8e6adf7e4eeac82573bc2f16bdbaab8d34a2aa1))

## [1.350.1](https://github.com/betagouv/service-national-universel/compare/v1.350.0...v1.350.1) (2023-12-23)

### Bug Fixes

- **api:** get cohort ([d4b0a0b](https://github.com/betagouv/service-national-universel/commit/d4b0a0be13ae8178ade5fb95943c763954a985d0))
- **lib:** update names cohorts CLE 2024 ([d0b6eef](https://github.com/betagouv/service-national-universel/commit/d0b6eefe12d7dafd13c1aa8f91064243e4dad714))

# [1.350.0](https://github.com/betagouv/service-national-universel/compare/v1.349.1...v1.350.0) (2023-12-22)

### Bug Fixes

- **api:** fix fetching of all cohorts ([#3427](https://github.com/betagouv/service-national-universel/issues/3427)) ([bf27ad6](https://github.com/betagouv/service-national-universel/commit/bf27ad609d60567b86200266fa51840b58e8f5cc))
- 1576-cohorte-classe ([#3392](https://github.com/betagouv/service-national-universel/issues/3392)) ([830a130](https://github.com/betagouv/service-national-universel/commit/830a130adfab1c4e94210fc0068a32e77395a653))
- **api:** retirer les youngs CLE des TODO des ref dep ([#3422](https://github.com/betagouv/service-national-universel/issues/3422)) ([bbf7eaa](https://github.com/betagouv/service-national-universel/commit/bbf7eaad60886ef64214fca2eda32dd88dce17e9))

### Features

- **admin/api:** 1559 - Donner la possibilité au ref de classe d'inscrire des élèves directement ([#3411](https://github.com/betagouv/service-national-universel/issues/3411)) ([11f89c3](https://github.com/betagouv/service-national-universel/commit/11f89c38fffd244cc0c783c990ed8421cb6345ec))
- **admin/api/ds:** 1621 - Etablissement change referents ([#3423](https://github.com/betagouv/service-national-universel/issues/3423)) ([feb459a](https://github.com/betagouv/service-national-universel/commit/feb459a07bd84d0f3a93fc2f896de7ad85afa41c))
- **api:** 1559 - 1576 - ajout type cohort ([#3417](https://github.com/betagouv/service-national-universel/issues/3417)) ([6f988e0](https://github.com/betagouv/service-national-universel/commit/6f988e0e04531b42c335d6b4a6f3372d36990d4e))
- **api/admin:** 1545 - Modal Young change cohorte CLE x HTS ([#3393](https://github.com/betagouv/service-national-universel/issues/3393)) ([bf63ff8](https://github.com/betagouv/service-national-universel/commit/bf63ff8ca3abcfd6116a5b15b514f58af8107256))

## [1.349.1](https://github.com/betagouv/service-national-universel/compare/v1.349.0...v1.349.1) (2023-12-21)

### Bug Fixes

- **admin:** 482 - Admin CLE volontaire redirect ([#3416](https://github.com/betagouv/service-national-universel/issues/3416)) ([dcf007d](https://github.com/betagouv/service-national-universel/commit/dcf007df25c453a6137d423cef6d384c4939dd65))
- **admin:** cohort dashboard ([#3415](https://github.com/betagouv/service-national-universel/issues/3415)) ([e72884b](https://github.com/betagouv/service-national-universel/commit/e72884b86a21a8823f188bfc247ac669431c334e))
- **api:** bug mongoose error mail uppercase ([#3413](https://github.com/betagouv/service-national-universel/issues/3413)) ([a2e36dd](https://github.com/betagouv/service-national-universel/commit/a2e36dd6f4dffe7709731afaf7cce5f0b6b0c1f6))
- **api:** prevent etablissement to be empty on signup user CLE ([#3406](https://github.com/betagouv/service-national-universel/issues/3406)) ([1fb90ec](https://github.com/betagouv/service-national-universel/commit/1fb90ec630b268b1f9a66fc9d07b665f19e556fc))
- **api/analytics:** remove crons log etablissement ([#3412](https://github.com/betagouv/service-national-universel/issues/3412)) ([0026e0a](https://github.com/betagouv/service-national-universel/commit/0026e0a74e8501c51753d28c87460b9d59648e61))
- **terraform:** Tf stack production ([#3420](https://github.com/betagouv/service-national-universel/issues/3420)) ([0a4d4fc](https://github.com/betagouv/service-national-universel/commit/0a4d4fc3c11a02ae7a7a366f427629e241d75004))

# [1.349.0](https://github.com/betagouv/service-national-universel/compare/v1.348.0...v1.349.0) (2023-12-20)

### Bug Fixes

- **admin/api/lib:** 475 - Admin CLE email academy forced + fix edit user account ([#3394](https://github.com/betagouv/service-national-universel/issues/3394)) ([941a73e](https://github.com/betagouv/service-national-universel/commit/941a73ee6e9aeb63df2578032d16f3b7f73bcb5c))
- **analytics:** wrong field name log etablissement model ([#3403](https://github.com/betagouv/service-national-universel/issues/3403)) ([656812e](https://github.com/betagouv/service-national-universel/commit/656812e72b0607d3e7577f7fd597fac891dc61cf))
- **analytics:** wrong name ([b67d173](https://github.com/betagouv/service-national-universel/commit/b67d1734ba992c76e9513c83d4565ab16407e589))
- **api:** 478 - Classe status INSCRIPTION_IN_PROGRESS ([#3395](https://github.com/betagouv/service-national-universel/issues/3395)) ([76dcda7](https://github.com/betagouv/service-national-universel/commit/76dcda7599101ac9ba0e047264d33b6053c7ff46))
- **api/analytics:** name fields log youngs ([#3401](https://github.com/betagouv/service-national-universel/issues/3401)) ([87ca5c9](https://github.com/betagouv/service-national-universel/commit/87ca5c900a67d00ec14d2bd00efdc5badeafa509))
- **app:** Improve and simplify class fetching ([#3381](https://github.com/betagouv/service-national-universel/issues/3381)) ([5ff730c](https://github.com/betagouv/service-national-universel/commit/5ff730c731e50e96c71ea262a8f68a9957f9a83b))
- **app:** Let users from legacy cohorts access phase 2 home if validated ([6971829](https://github.com/betagouv/service-national-universel/commit/69718291d718d8b3eb8582870d8d0fda89cd4ba7))
- **terraform:** Disable lock from custom env to not interfere with ci ([#3402](https://github.com/betagouv/service-national-universel/issues/3402)) ([e419eb8](https://github.com/betagouv/service-national-universel/commit/e419eb8c7b76f67cdc010d7fd70f296e4e52b5b5))

### Features

- **admin:** 1603 - Design System Color palette ([#3409](https://github.com/betagouv/service-national-universel/issues/3409)) ([528d733](https://github.com/betagouv/service-national-universel/commit/528d7336dc672615a6dd22aae66f10f8f27b7920))
- **analytics:** 1601 - création de log_etablissements ([#3400](https://github.com/betagouv/service-national-universel/issues/3400)) ([2681784](https://github.com/betagouv/service-national-universel/commit/2681784bcce7c68e437814909b87737fe6808234))
- **analytics:** 1601 - creation log classes ([#3407](https://github.com/betagouv/service-national-universel/issues/3407)) ([08c4be4](https://github.com/betagouv/service-national-universel/commit/08c4be435531177df9890c260953ccda18e29880))
- **api:** 1601 -création crons log etablissement/classe ([#3408](https://github.com/betagouv/service-national-universel/issues/3408)) ([b27b6e0](https://github.com/betagouv/service-national-universel/commit/b27b6e0a835eb10143d0b898bca05c46347243ce))
- **api, app:** 477 - Add birthdate validation to young signup ([#3396](https://github.com/betagouv/service-national-universel/issues/3396)) ([245ba85](https://github.com/betagouv/service-national-universel/commit/245ba85f841462a883fc56a87198ae873cdeca86))
- **terraform:** TF : Image_tags output & CI concurrency improved ([#3404](https://github.com/betagouv/service-national-universel/issues/3404)) ([1215104](https://github.com/betagouv/service-national-universel/commit/12151040ad6fd7886a0b76533eb135ec70291e23))

# [1.348.0](https://github.com/betagouv/service-national-universel/compare/v1.347.0...v1.348.0) (2023-12-19)

### Bug Fixes

- **api:** oublie d'import de model ([#3386](https://github.com/betagouv/service-national-universel/issues/3386)) ([1677159](https://github.com/betagouv/service-national-universel/commit/1677159cfaae11da752a207746af97328b821a27))
- **app:** better handle no match in birth city search ([b74a9b2](https://github.com/betagouv/service-national-universel/commit/b74a9b2fe33f1ac8520ce78a5dc726177a0ae319))

### Features

- **api/analytics:** ajout champs log youngs ([#3389](https://github.com/betagouv/service-national-universel/issues/3389)) ([f487aa3](https://github.com/betagouv/service-national-universel/commit/f487aa322be2dc2216828011e829c1202723545a))
- **app:** 1591 - Home : Ecran si délai dépassé pour MIG ([#3385](https://github.com/betagouv/service-national-universel/issues/3385)) ([11d2c85](https://github.com/betagouv/service-national-universel/commit/11d2c85d60033d519592328c8332790767432fb4))
- **misc:** Changing staging domain on terraform ([#3390](https://github.com/betagouv/service-national-universel/issues/3390)) ([cb6ca40](https://github.com/betagouv/service-national-universel/commit/cb6ca4077472f7bb7739a0d8983e7b7c7a7dc830))
- **terraform:** Terraform - Stack Preprod & Prod ([#3375](https://github.com/betagouv/service-national-universel/issues/3375)) ([203938f](https://github.com/betagouv/service-national-universel/commit/203938fb592f564cef26a4207b78f75fc9c1a389))

# [1.347.0](https://github.com/betagouv/service-national-universel/compare/v1.346.1...v1.347.0) (2023-12-18)

### Bug Fixes

- **admin:** add contact convocation ui ([215b592](https://github.com/betagouv/service-national-universel/commit/215b592437601bb499979128af524a9309521a19))
- **admin:** status classe translation ([357f367](https://github.com/betagouv/service-national-universel/commit/357f367ef0041f1a4b663b07aadd573792fe088d))
- **admin:** table de repartition gestion des droits edition ([316edf8](https://github.com/betagouv/service-national-universel/commit/316edf8472fbfe87833b7abb13cf2b124e52de2a))
- **admin/api:** Add coordinateur as referent de classe ([#3376](https://github.com/betagouv/service-national-universel/issues/3376)) ([2b23ee5](https://github.com/betagouv/service-national-universel/commit/2b23ee59142d164ed5ee8d2ae720946fe3e63d30))
- **all apps:** update eslint, prettier and eslint-plugin-prettier [#3379](https://github.com/betagouv/service-national-universel/issues/3379) ([958d8e1](https://github.com/betagouv/service-national-universel/commit/958d8e1770bcec651bd40573d4fd16fc24949c6e))
- **api:** 441 - bug ticket counter ([#3384](https://github.com/betagouv/service-national-universel/issues/3384)) ([d2dc988](https://github.com/betagouv/service-national-universel/commit/d2dc988e00a8717d52bebea59368b52ec65e14d7))
- **api:** 465 - classes seatsTaken ([#3380](https://github.com/betagouv/service-national-universel/issues/3380)) ([895eb42](https://github.com/betagouv/service-national-universel/commit/895eb42287a93ad9a9eed36c1d07c032b0b3f6e9))

### Features

- **admin/api:** 1538 - Inscription - ramener la cible à 100% ([#3374](https://github.com/betagouv/service-national-universel/issues/3374)) ([2053abe](https://github.com/betagouv/service-national-universel/commit/2053abedcda03b2258945e035b0ead8fa4cb0812))
- **app:** 1536 - update Phase 2 and Phase 3 Name (HTS/CLE) ([#3378](https://github.com/betagouv/service-national-universel/issues/3378)) ([208cbe2](https://github.com/betagouv/service-national-universel/commit/208cbe2f271fa88938e2932c772282521d86e827))

## [1.346.1](https://github.com/betagouv/service-national-universel/compare/v1.346.0...v1.346.1) (2023-12-15)

### Bug Fixes

- **admin:** DSFR css ([5185344](https://github.com/betagouv/service-national-universel/commit/5185344126947299f3a4f32af80dedb6733651e8))
- **admin:** Only display demandes d'equiv when data is available ([3c10e62](https://github.com/betagouv/service-national-universel/commit/3c10e62b904d93d0cf63850650d2213e2606b528))
- **api:** Remove ds on deploy ([9d01311](https://github.com/betagouv/service-national-universel/commit/9d013110050b548a9140c786cb86a50616efb5dc))
- **app:** improve logout ([bcb43c6](https://github.com/betagouv/service-national-universel/commit/bcb43c659409d6df10b4383b7d88f843cea05c83))

### Reverts

- Revert "fix(ds): docker build for custom env" ([c4f402b](https://github.com/betagouv/service-national-universel/commit/c4f402bed93a32c33c6164405772bf36859c0e99))
- **github:** Put back tests on api prod ([62ccdd0](https://github.com/betagouv/service-national-universel/commit/62ccdd002fee757ab8ec60c69b925e7e989e91b6))

# [1.346.0](https://github.com/betagouv/service-national-universel/compare/v1.345.3...v1.346.0) (2023-12-14)

### Bug Fixes

- **admin:** fix combobox import path ([f7f05bd](https://github.com/betagouv/service-national-universel/commit/f7f05bd4a5536959ad8d7f23dc7de3043a87287f))
- **admin:** fix combobox import path again ([bc22803](https://github.com/betagouv/service-national-universel/commit/bc228035c445ff1f1700bb5669a6d5667dc35102))
- **admin,api:** 1480 - hotfixes signup referent CLE ([#3308](https://github.com/betagouv/service-national-universel/issues/3308)) ([4526185](https://github.com/betagouv/service-national-universel/commit/4526185063c184ad44497bb8a0680e731f78f0f9))
- **admin/lib:** wording / quick ui fix ([bfc95bd](https://github.com/betagouv/service-national-universel/commit/bfc95bd9763da5f1ead3b23055c786a112818846))
- **api:** absolute import mistake ([648716d](https://github.com/betagouv/service-national-universel/commit/648716d439ace3ce0012424ef0e9eebe7295d3f7))
- **api:** better error handler for signin token ([#3372](https://github.com/betagouv/service-national-universel/issues/3372)) ([1da37f7](https://github.com/betagouv/service-national-universel/commit/1da37f7756e0f61f383289d891b30eb8744c0157))
- **api:** bug envoi ticket ref ([7c9a97f](https://github.com/betagouv/service-national-universel/commit/7c9a97fd7a88ea2354a7bfc4aa0b941b26f9da59))
- **api:** Classe State Manager ([22840e5](https://github.com/betagouv/service-national-universel/commit/22840e5b739296ad7470f11263f2d5b7d40b5327))
- **api:** Classe State Manager ([ce58622](https://github.com/betagouv/service-national-universel/commit/ce586228f97c5f361b5838c02fef2be44b06d2ac))
- **api:** fix du dernier commit [#3318](https://github.com/betagouv/service-national-universel/issues/3318) ([059ec27](https://github.com/betagouv/service-national-universel/commit/059ec27449b9a3b31f2441047b76ef078e23a6d4))
- **api:** fix up undefined ref id ([7d0b7c5](https://github.com/betagouv/service-national-universel/commit/7d0b7c5302c57fc34b7f005ffd554f6ea233ec2e))
- **api:** ref right on classe ([d1b4ae6](https://github.com/betagouv/service-national-universel/commit/d1b4ae6cf0ad5549aadfdf83d560730ed73c68c4))
- **api:** signup ([d430b2e](https://github.com/betagouv/service-national-universel/commit/d430b2e6863b37953896950e1e4f86389ddd83ff))
- **api:** signup ([dbfbdb7](https://github.com/betagouv/service-national-universel/commit/dbfbdb7bef1dfab6fd86353f189725902448bde4))
- **api:** template invitation admin CLE ([8494189](https://github.com/betagouv/service-national-universel/commit/849418954249e534732865e4524c7da7878b2c52))
- **api:** ticket/form controller ([e1cb3c1](https://github.com/betagouv/service-national-universel/commit/e1cb3c1e7d1ab4abac02830234279dc4a802ed8f))
- **api:** user list ([72cd562](https://github.com/betagouv/service-national-universel/commit/72cd562691fdb7e29ba93935a64d9d9427138ed0))
- **api:** young model post save ([2a6de00](https://github.com/betagouv/service-national-universel/commit/2a6de007c8ab876f3064553485404b834b3cf1d3))
- **api:** young post save ClasseStateManager ([6b3949c](https://github.com/betagouv/service-national-universel/commit/6b3949c57804adb40ebcc42a505e6502715d5739))
- **api:** youngCle signup token + signup ref error ([f64e194](https://github.com/betagouv/service-national-universel/commit/f64e1949b8254697e495a8da3820c6d1b32b14fe))
- **api/api:** sidebar dev + ac-lyon ([0e2a397](https://github.com/betagouv/service-national-universel/commit/0e2a397bf636453afce4b3c6922ac411ba73315a))
- **api/lib:** rebase main ([382ac9e](https://github.com/betagouv/service-national-universel/commit/382ac9ef18ee4856c7d2cd9c82194c17635b92f1))
- **app:** 453 - Preinscription CLE : améliorer la validation de la date de naissance [#3361](https://github.com/betagouv/service-national-universel/issues/3361) ([2ec512b](https://github.com/betagouv/service-national-universel/commit/2ec512b077804762bdb23cfab11e471f23de0538))
- **app:** add react-dsfr to dependencies ([713d85f](https://github.com/betagouv/service-national-universel/commit/713d85f679fa6ae17b2bb06e18c9b183462ddfbe))
- **app:** Affichage des dates pour RL ([87777b7](https://github.com/betagouv/service-national-universel/commit/87777b7df61e7a056aead3ca634e96b907f82f31))
- **app:** Fixed wrong default parameter in useAuth service. ([aed748a](https://github.com/betagouv/service-national-universel/commit/aed748ae9b8b158ee234df7f2872c54c840cbbc6))
- **app:** Fixing use of coloration. ([5e13304](https://github.com/betagouv/service-national-universel/commit/5e13304be91473f1b988645c7d00249e7a5cb85e))
- **app:** public contact form: fix shool name in preset message ([d03ece5](https://github.com/betagouv/service-national-universel/commit/d03ece5f84cc5e3edbcd533a2b9d8443c4bc27e6))
- **app:** remove test import ([b7daaa9](https://github.com/betagouv/service-national-universel/commit/b7daaa935f71795e6876e0cefe0cbc5c0c1166a3))
- **app:** waitingValidation wording ([#3300](https://github.com/betagouv/service-national-universel/issues/3300)) ([5792707](https://github.com/betagouv/service-national-universel/commit/5792707c610e11e98c753a5fd3fc892bb2057b3d))
- **app, admin:** add react-dsfr to rollup external build options ([7bd00ef](https://github.com/betagouv/service-national-universel/commit/7bd00ef33f9d3526e600bdc1714a84dedf0f7389))
- **ds:** docker build for custom env ([f8ea29f](https://github.com/betagouv/service-national-universel/commit/f8ea29fb8c3b15b7e1500f0f7b138c396f351db3))
- **ds:** ReactTooltip props ([dfcbb42](https://github.com/betagouv/service-national-universel/commit/dfcbb42a524ae12695fb1cbcb2cbede21628d036))
- **ds/admin:** 1389 - ds, typo, links, design, classes & more ([#3217](https://github.com/betagouv/service-national-universel/issues/3217)) ([8438138](https://github.com/betagouv/service-national-universel/commit/8438138cb93bc69715e4c948a2ebbf3b7e2e652b))
- **ds/admin:** developers mode & Header quick fix ([#3138](https://github.com/betagouv/service-national-universel/issues/3138)) ([014f3e5](https://github.com/betagouv/service-national-universel/commit/014f3e58070eda0fc50e4b95329f4b387f8cd625))
- **ds/app:** remove absolute path on @snu/ds ([0cf7943](https://github.com/betagouv/service-national-universel/commit/0cf79437abeab8c6348be66be023ebf67338c942))
- **github:** Build ds before send to clevercloud ([38e55dc](https://github.com/betagouv/service-national-universel/commit/38e55dc0cb1e6bf007bb0bbcf1fef924520382ea))
- **lib:** new role can edit young CLE ([198a298](https://github.com/betagouv/service-national-universel/commit/198a298a95f12cb597464a261800dc2c0446cbc7))
- package lock, admin import ([2fb13dc](https://github.com/betagouv/service-national-universel/commit/2fb13dc57d3721023a83a713d5e9cdc92b02f54e))

### Features

- 1375 - DSFR React lib ([#3189](https://github.com/betagouv/service-national-universel/issues/3189)) ([6fa76ec](https://github.com/betagouv/service-national-universel/commit/6fa76ecf62db7d0ed12f4d812a017ca035beb779))
- **admin:** 1101 - Page: Mon établissement ([#3196](https://github.com/betagouv/service-national-universel/issues/3196)) ([7597b38](https://github.com/betagouv/service-national-universel/commit/7597b38ef1c8a7ae256eece89b72b7ef34c0fb30))
- **admin:** 1380 - ajout liste contact pour les refs d'établissement CLE [#3204](https://github.com/betagouv/service-national-universel/issues/3204) ([54eafaa](https://github.com/betagouv/service-national-universel/commit/54eafaa211367ed2e9da23e21bb9fb7b44914a2b))
- **admin:** 1456 - Ajout des roles CLE pour le support ([#3323](https://github.com/betagouv/service-national-universel/issues/3323)) ([44b379a](https://github.com/betagouv/service-national-universel/commit/44b379a35f8de77da14c2b78b5c739d93277ae8a))
- **admin:** add design routes for CLE roles to ease integration phase ([0d2de82](https://github.com/betagouv/service-national-universel/commit/0d2de82b2d6c6a18a6ff7e6da0c0d2cd6c23753c))
- **admin:** adding frenchNationality on ViewPhase0 and checkbox ([#3324](https://github.com/betagouv/service-national-universel/issues/3324)) ([03d8f9f](https://github.com/betagouv/service-national-universel/commit/03d8f9f2282233de0e407251ab4eea006e5b1af7))
- **admin:** cle hide mailbox ([#3366](https://github.com/betagouv/service-national-universel/issues/3366)) ([ec12c86](https://github.com/betagouv/service-national-universel/commit/ec12c866c90fbad96d65ebd2a37f07c8e0a26089))
- **admin:** hide mailbox for cle ([3df5735](https://github.com/betagouv/service-national-universel/commit/3df573511ca7ac876135cda66be1e5fe033bf765))
- **admin,api:** 1480 - wip, integration front-back inscription ([#3272](https://github.com/betagouv/service-national-universel/issues/3272)) ([cf0aee3](https://github.com/betagouv/service-national-universel/commit/cf0aee3f95e1cfee558b32407f53e21a475f92eb))
- **admin,api:** 1480 cle-referent-signup Coordinateur ([#3299](https://github.com/betagouv/service-national-universel/issues/3299)) ([99d5abf](https://github.com/betagouv/service-national-universel/commit/99d5abf6852ff5ed20425f73313ede54c066cdf2))
- **admin/api:** 1410 - liste classe ([#3271](https://github.com/betagouv/service-national-universel/issues/3271)) ([374b216](https://github.com/betagouv/service-national-universel/commit/374b216c4c9da43a23216c0711e70fe57282a34f))
- **admin/api:** 1411 - liste young CLE ([#3273](https://github.com/betagouv/service-national-universel/issues/3273)) ([26aa7e9](https://github.com/betagouv/service-national-universel/commit/26aa7e95dd6246de9dd34f32bdb6e529cf52c205))
- **admin/api:** 1430 - Adaptation de la fiche d’un Volontaire ([#3284](https://github.com/betagouv/service-national-universel/issues/3284)) ([5b06989](https://github.com/betagouv/service-national-universel/commit/5b069897c5d54534829071f15793b67e5a7d1ebf))
- **admin/api:** 1502 - ajout du back pour les établissement CLE ([#3281](https://github.com/betagouv/service-national-universel/issues/3281)) ([f045490](https://github.com/betagouv/service-national-universel/commit/f045490ec2112eb0dd68bed3237bbe6155190e4d))
- **admin/api:** integration classes admin + filtre on classe / etablissement liste young ([#3346](https://github.com/betagouv/service-national-universel/issues/3346)) ([6049b50](https://github.com/betagouv/service-national-universel/commit/6049b50ccea88175ea7601db6ba83d76455779d4))
- **admin/api:** integration établissements admin + UX / UI ([#3350](https://github.com/betagouv/service-national-universel/issues/3350)) ([b2db368](https://github.com/betagouv/service-national-universel/commit/b2db368635da8ee62fc4e916a0da660afc0d8dbe))
- **admin/api:** patch cle Young-Status et modal delete ([#3315](https://github.com/betagouv/service-national-universel/issues/3315)) ([d134569](https://github.com/betagouv/service-national-universel/commit/d1345695c54a897ec6e915388b56cda02c2158b3))
- **admin/ds:** retours design Emmanuel ([#3339](https://github.com/betagouv/service-national-universel/issues/3339)) ([4dfda86](https://github.com/betagouv/service-national-universel/commit/4dfda86232bccc518175929e94112911512b9b5b))
- **admin/lib:** 1402 - Ajout du rôle Coordinateur d’établissement ([#3247](https://github.com/betagouv/service-national-universel/issues/3247)) ([35b503b](https://github.com/betagouv/service-national-universel/commit/35b503b5fff82791fb6c0644431a19568c84b301))
- **admin/lib:** add intitution new roles, sidebar, routes, initial s… ([#3148](https://github.com/betagouv/service-national-universel/issues/3148)) ([16589eb](https://github.com/betagouv/service-national-universel/commit/16589ebefc272f2d9ab04e03f14bf675cad7fbb6))
- **admin/lib:** instruction young CLE ([#3340](https://github.com/betagouv/service-national-universel/issues/3340)) ([325e0dd](https://github.com/betagouv/service-national-universel/commit/325e0dd1bec317ae03b0cee19b83cd8ab3b78f4d))
- **api:** 1339 - 1400 - 1401 - New model CLE ([#3239](https://github.com/betagouv/service-national-universel/issues/3239)) ([faf7df3](https://github.com/betagouv/service-national-universel/commit/faf7df3d17f413270ec32f5cda8ff2c22e11956c))
- **api:** 1403 - CLE referents signup ([#3270](https://github.com/betagouv/service-national-universel/issues/3270)) ([d19893c](https://github.com/betagouv/service-national-universel/commit/d19893c7639ea22b572c041e58eb223119c61e41))
- **api:** 1406 - CLE Create classe ([#3264](https://github.com/betagouv/service-national-universel/issues/3264)) ([962e2ac](https://github.com/betagouv/service-national-universel/commit/962e2acbadde41c006368f2a3f2dc7b95f6895ae))
- **api:** 1407 - put etablissement ([#3266](https://github.com/betagouv/service-national-universel/issues/3266)) ([1a3965e](https://github.com/betagouv/service-national-universel/commit/1a3965ea52681ef2e212c409816c36f2e5e5ae5a))
- **api:** 1414 - State Managment for Class ([#3260](https://github.com/betagouv/service-national-universel/issues/3260)) ([7b8acf8](https://github.com/betagouv/service-national-universel/commit/7b8acf8b8984e6222b30504e30f2018cf3802eab))
- **api:** cle-template-signup ([#3354](https://github.com/betagouv/service-national-universel/issues/3354)) ([d477b0e](https://github.com/betagouv/service-national-universel/commit/d477b0efc81f66aaf9b88cdb46c2545202f356e3))
- **api:** template 1427 + update ref destinataire ([#3359](https://github.com/betagouv/service-national-universel/issues/3359)) ([5238c0c](https://github.com/betagouv/service-national-universel/commit/5238c0cda9b0101e8cb8da374fe8e1c29ae4abb2))
- **api, admin:** 1484 - Add email template for young validation - CLE ([#3334](https://github.com/betagouv/service-national-universel/issues/3334)) ([129347e](https://github.com/betagouv/service-national-universel/commit/129347e4abcc792d635188fc74a3b98ccae80124))
- **api, app:** 1396 - Inscription CLE : Etape coordonnées ([#3279](https://github.com/betagouv/service-national-universel/issues/3279)) ([3e7c011](https://github.com/betagouv/service-national-universel/commit/3e7c011869886e2a0f05c3f767e1eebe276b2f32))
- **api, app:** 1396 - Inscription CLE : étape Représentants légaux ([#3282](https://github.com/betagouv/service-national-universel/issues/3282)) ([c8c674a](https://github.com/betagouv/service-national-universel/commit/c8c674a39358d1424f8efe217c52260fe22c8399))
- **api, app:** 1437 - Add parcours to support controller ([#3319](https://github.com/betagouv/service-national-universel/issues/3319)) ([4c761ae](https://github.com/betagouv/service-national-universel/commit/4c761aeae75acc46871a23d165c031c44982ff05))
- **api, app:** 1437 - Contact form: display class data and forward class ID to support API ([#3325](https://github.com/betagouv/service-national-universel/issues/3325)) ([1128453](https://github.com/betagouv/service-national-universel/commit/1128453f9f6bb7f651211ab170e702bd34a69d32))
- **api,app:** 1392 - CLE : étapes Profil et Validation de l'email ([#3265](https://github.com/betagouv/service-national-universel/issues/3265)) ([531d54d](https://github.com/betagouv/service-national-universel/commit/531d54d90af17a096c1feb5b1c4ba5badfcd98ab))
- **api/admin:** 1508 - ajout du backEnd pour les Classes (creation / modif / delete / view) ([#3304](https://github.com/betagouv/service-national-universel/issues/3304)) ([c728276](https://github.com/betagouv/service-national-universel/commit/c728276111a8477632e19c0d791c5fc7cc92a7e1))
- **api/admin:** patch cle post test ([#3309](https://github.com/betagouv/service-national-universel/issues/3309)) ([859e150](https://github.com/betagouv/service-national-universel/commit/859e150bf52b69290c2070aadd9db8806947234c))
- **api/admin/lib/ds:** 1465 - liste user for new role CLE ([#3267](https://github.com/betagouv/service-national-universel/issues/3267)) ([b8005d3](https://github.com/betagouv/service-national-universel/commit/b8005d3a36c746cd63a28c08381488d8ec1cc8eb))
- **api/lib:** 1560 - [CLE][Classe] Emails Transactionnels ([#3355](https://github.com/betagouv/service-national-universel/issues/3355)) ([c1045a5](https://github.com/betagouv/service-national-universel/commit/c1045a5ef8fb7fa2d4f8ca6ad964bb7e48ce13cb))
- **app:** 1394 - CLE onboarding page ([#3263](https://github.com/betagouv/service-national-universel/issues/3263)) ([e1b711c](https://github.com/betagouv/service-national-universel/commit/e1b711cb5ce14ac167c2ef4515f465155ea2a3d7))
- **app:** 1394 - QA - added missing box-shadow. ([b1e6929](https://github.com/betagouv/service-national-universel/commit/b1e6929cdfb169e5836cb426fa8b22cd9b9833a9))
- **app:** 1395 - New step Done for CLE parcours ([#3268](https://github.com/betagouv/service-national-universel/issues/3268)) ([0b8fbdf](https://github.com/betagouv/service-national-universel/commit/0b8fbdfce1bcbdbf17d298c14edf31ece5450750))
- **app:** 1396 - Inscription CLE : étape récapitulatif ([#3293](https://github.com/betagouv/service-national-universel/issues/3293)) ([937931a](https://github.com/betagouv/service-national-universel/commit/937931af2b9478fbc008a0db744aeeb22f6d4db9))
- **app:** 1416 - QA - Disabled button color fix. ([404a4be](https://github.com/betagouv/service-national-universel/commit/404a4bedcf0be6c4f6d8e18096061cdbc761eacb))
- **app:** 1422 - Change Wording to RL1 relance for CLE ([#3280](https://github.com/betagouv/service-national-universel/issues/3280)) ([fcb6136](https://github.com/betagouv/service-national-universel/commit/fcb6136c819263e54ebdd6c550c2dffb616234f3))
- **app:** 1423 - change waitingValidation Page and changeSejour for CLE ([#3288](https://github.com/betagouv/service-national-universel/issues/3288)) ([0d37c9d](https://github.com/betagouv/service-national-universel/commit/0d37c9d9b7866968e3d58a3cfc9c8c4b73b563a2))
- **app:** 1428 - Isncription CLE : adapt header ([#3296](https://github.com/betagouv/service-national-universel/issues/3296)) ([3098d85](https://github.com/betagouv/service-national-universel/commit/3098d850e489ca7b67cf1bdf662f56a26e1693e8))
- **app:** 1429 - update Inscription progressBar for CLE parcours ([#3295](https://github.com/betagouv/service-national-universel/issues/3295)) ([265ae14](https://github.com/betagouv/service-national-universel/commit/265ae14a8f542a92c45f873a7efbc8a39b5c4893))
- **app:** 1434 - Formulaire de contact : adapter le formulaire au parcours CLE ([#3302](https://github.com/betagouv/service-national-universel/issues/3302)) ([c99769b](https://github.com/betagouv/service-national-universel/commit/c99769b4094805b1c37aa57563b319fa40a41c35))
- **app:** 1437 - Formulaire de contact : Ajout de "J’ai déjà un compte volontaire" + URL params + Accessibilité ([#3312](https://github.com/betagouv/service-national-universel/issues/3312)) ([73e778e](https://github.com/betagouv/service-national-universel/commit/73e778e6c0d5463ad4da8a2950e1748b4c96a455))
- **app:** 1438 - Added info for CLE when trying to signup as HTS. ([#3291](https://github.com/betagouv/service-national-universel/issues/3291)) ([c8dcb72](https://github.com/betagouv/service-national-universel/commit/c8dcb726063bceafd74716f8ed4176dfa428ff19))
- **app:** 1438 - QA - Design + bdc link. ([27eada9](https://github.com/betagouv/service-national-universel/commit/27eada92e82a0873cd5a9670e6e20b2210ef0529))
- **app:** 1449 waiting affectation view CLE ([#3301](https://github.com/betagouv/service-national-universel/issues/3301)) ([9efe9f4](https://github.com/betagouv/service-national-universel/commit/9efe9f42a42d72f694123fae47b76e8fe09ab868))
- **app:** 1477 - No CohortChange and SessionChange for Young CLE ([#3338](https://github.com/betagouv/service-national-universel/issues/3338)) ([3c2ccbe](https://github.com/betagouv/service-national-universel/commit/3c2ccbed6a21da82e183de8bb65098626557af50))
- **app:** 1479 - consentement RL on CLE ([#3335](https://github.com/betagouv/service-national-universel/issues/3335)) ([b675c8f](https://github.com/betagouv/service-national-universel/commit/b675c8fe7bb5e9e2d5f4ec11732ebf87f39d849c))
- **app:** 1495 - QA - Updated wording on alreadyExists account page. ([8e93eca](https://github.com/betagouv/service-national-universel/commit/8e93ecab212bc061cdccd272da6949940a677c9d))
- **app:** 1495 - QA2 - Updated wording on alreadyExists account page. ([2885470](https://github.com/betagouv/service-national-universel/commit/28854702b8c45ce1024529e4c332cad6440038ed))
- **app:** 1495 - QA3 - Temporary generic text on AccountAlreadyExists ([6281144](https://github.com/betagouv/service-national-universel/commit/628114439f9b7d77150dce8bbb701ba2c6842a8b))
- **app:** 1495 - Rerouting CLE users trying to signup as HTS. ([#3348](https://github.com/betagouv/service-national-universel/issues/3348)) ([492f41d](https://github.com/betagouv/service-national-universel/commit/492f41d79198db4fbc03d633c0338ca9cf3b9de7))
- **app:** 1497 - Rerouting CLE when they already have HTS account. ([#3344](https://github.com/betagouv/service-national-universel/issues/3344)) ([faad033](https://github.com/betagouv/service-national-universel/commit/faad033b7dd2790acd09ccbcd1beb8ded7156c7a))
- **app:** 1501 - update young profil for CLE ([#3343](https://github.com/betagouv/service-national-universel/issues/3343)) ([5d51e5d](https://github.com/betagouv/service-national-universel/commit/5d51e5d3cd1259ed4af437d142a0ac1424567e31))
- **app:** 1511 - Change BDC Link for Young CLE ([#3352](https://github.com/betagouv/service-national-universel/issues/3352)) ([345bb8d](https://github.com/betagouv/service-national-universel/commit/345bb8d4a89e65d0406703b97a05f21eff79ed1b))
- **app:** 712 - QA - open '/public-engagements' in new tab. ([a50a0c6](https://github.com/betagouv/service-national-universel/commit/a50a0c661453d8781aac78500afc35f9de2ec614))
- **app:** add @snu/ds lib ([#3139](https://github.com/betagouv/service-national-universel/issues/3139)) ([0bf2eac](https://github.com/betagouv/service-national-universel/commit/0bf2eac34e1d8fd02f75b01c7b1e88a853685cb1))
- **app:** feature flag DEVELOPERS_MODE ([894142f](https://github.com/betagouv/service-national-universel/commit/894142fb78d9434560fe6622f3e4942e96a4abb0))
- **app, api:** 1416 - Triggering inscriptions based on class status. ([#3306](https://github.com/betagouv/service-national-universel/issues/3306)) ([3719897](https://github.com/betagouv/service-national-universel/commit/3719897795224982ff0e8b22492496eef7ea246b))
- **app, api:** Moved frontEnd logic to backend using virtuals. ([#3314](https://github.com/betagouv/service-national-universel/issues/3314)) ([93b5bd6](https://github.com/betagouv/service-national-universel/commit/93b5bd612d0851abb073b882aeca4638b1d70589))
- **ds:** input phone ([#3146](https://github.com/betagouv/service-national-universel/issues/3146)) ([107c552](https://github.com/betagouv/service-national-universel/commit/107c5527c8624d249989917290f954df9ad6b25f))
- **ds:** InputText classique ([#3140](https://github.com/betagouv/service-national-universel/issues/3140)) ([50d1158](https://github.com/betagouv/service-national-universel/commit/50d11581b1179c3c529ef1cadb3d2a244a3ce490))
- **ds/admin:** 520, 718, 1150 - Modals and class view detail ([#3182](https://github.com/betagouv/service-national-universel/issues/3182)) ([26e21fd](https://github.com/betagouv/service-national-universel/commit/26e21fdbbbb7902fceb17d2e22acbadcb23b36d9))
- **ds/admin:** classes empty layout ([#3163](https://github.com/betagouv/service-national-universel/issues/3163)) ([22cfc8f](https://github.com/betagouv/service-national-universel/commit/22cfc8fd668a9696e3d3d0d50075eda70ce4a2bd))
- **ds/admin:** create class form, Label ds component & other fixs ([#3164](https://github.com/betagouv/service-national-universel/issues/3164)) ([80609e6](https://github.com/betagouv/service-national-universel/commit/80609e62a3c258a0eee3fb457845d61c77cc1d0c))
- **ds/admin:** modal component ([#3157](https://github.com/betagouv/service-national-universel/issues/3157)) ([cf9e988](https://github.com/betagouv/service-national-universel/commit/cf9e988c738eee657b2a9daec231e6d8f080de09))
- **ds/admin:** modals, modals & modals ([#3166](https://github.com/betagouv/service-national-universel/issues/3166)) ([78d5b77](https://github.com/betagouv/service-national-universel/commit/78d5b778f5e17647690edccbc342b631a1e07a41))
- **ds/admin:** template & tailwind reload fix ([#3141](https://github.com/betagouv/service-national-universel/issues/3141)) ([bd958ef](https://github.com/betagouv/service-national-universel/commit/bd958ef7bead622f9b416f5b44bc2ddcc129b29e))
- **lib:** ajout AUTRE dans le type d'etablissement ([#3328](https://github.com/betagouv/service-national-universel/issues/3328)) ([2bfac6a](https://github.com/betagouv/service-national-universel/commit/2bfac6a3fdf4f5421ecfd536078a4f1323edd891))
- **lib:** updated README ([6483563](https://github.com/betagouv/service-national-universel/commit/6483563400e419ca2a4efde186766e8840c0869e))
- **lib/admin:** ajout états actif et readOnly sur les select [#3276](https://github.com/betagouv/service-national-universel/issues/3276) ([f0ab971](https://github.com/betagouv/service-national-universel/commit/f0ab97186aeb7d3832c2ea0ca0d2d2e425f02142))
- **lib/api:** 1442- invite ADMINISTRATEUR_CLE ([#3262](https://github.com/betagouv/service-national-universel/issues/3262)) ([6d6369b](https://github.com/betagouv/service-national-universel/commit/6d6369b63978edc26e2ac72853f14e657e05b0c2))

### Reverts

- Revert "fix(app, admin): add react-dsfr to rollup external build options" ([9496b0a](https://github.com/betagouv/service-national-universel/commit/9496b0a82875d7b1c1e143ba9a57f777e7e50cd2))

## [1.345.3](https://github.com/betagouv/service-national-universel/compare/v1.345.2...v1.345.3) (2023-12-12)

### Bug Fixes

- **admin,api:** api route association ([#3345](https://github.com/betagouv/service-national-universel/issues/3345)) ([1ebb372](https://github.com/betagouv/service-national-universel/commit/1ebb37237284409cbb192c11b74dc64dcfd9b96f))

## [1.345.2](https://github.com/betagouv/service-national-universel/compare/v1.345.1...v1.345.2) (2023-12-08)

### Bug Fixes

- **admin:** maintenance page association ([#3342](https://github.com/betagouv/service-national-universel/issues/3342)) ([44c9361](https://github.com/betagouv/service-national-universel/commit/44c9361a79546dbbd039d313f436073b56d87a06))

## [1.345.1](https://github.com/betagouv/service-national-universel/compare/v1.345.0...v1.345.1) (2023-12-07)

### Bug Fixes

- **api:** bug token ([314ad0a](https://github.com/betagouv/service-national-universel/commit/314ad0a26c49e0ded77f101ac016bfc06e135f1d))
- **api:** trust token ([5d9ce12](https://github.com/betagouv/service-national-universel/commit/5d9ce1201be42463f5bc11497729b7ee5f60b270))

# [1.345.0](https://github.com/betagouv/service-national-universel/compare/v1.344.0...v1.345.0) (2023-12-06)

### Bug Fixes

- **app:** Préinscription - Fix foreign school manual input ([#3317](https://github.com/betagouv/service-national-universel/issues/3317)) ([84d597b](https://github.com/betagouv/service-national-universel/commit/84d597b2576e16bb1534d5595350b0b90f7b4dd7))

### Features

- **api:** Put a version associated with signin token and trust token and force reset ([745b312](https://github.com/betagouv/service-national-universel/commit/745b312c674c1084fd008dc08394091da0f9bcbb))
- **app:** 1444 - Hiding phase 3 for 2024 cohorts. ([#3290](https://github.com/betagouv/service-national-universel/issues/3290)) ([2f93c4b](https://github.com/betagouv/service-national-universel/commit/2f93c4b06c52ddb10634f35f31a325895722c993))

# [1.344.0](https://github.com/betagouv/service-national-universel/compare/v1.343.0...v1.344.0) (2023-11-30)

### Bug Fixes

- **1373:** Put back loose datePicker ([#3186](https://github.com/betagouv/service-national-universel/issues/3186)) ([cc1f46b](https://github.com/betagouv/service-national-universel/commit/cc1f46b313dcd88de8b659312bf1b0ea1d6c6041))
- **admin:** [Safari] Permettre au bouton "Prendre la place" d'ouvrir un nouvel onglet ([#3149](https://github.com/betagouv/service-national-universel/issues/3149)) ([1899284](https://github.com/betagouv/service-national-universel/commit/1899284af6da1dd97a0d742d11d276ccd7fe7b7d))
- **admin:** 411 - BUG création PM pour une structure Armée ([#3233](https://github.com/betagouv/service-national-universel/issues/3233)) ([ce67cd3](https://github.com/betagouv/service-national-universel/commit/ce67cd3402f46bfa2c29a4ad01b2df9c146eb153))
- **admin:** 413 - admin & structure invite role ([#3246](https://github.com/betagouv/service-national-universel/issues/3246)) ([0a21761](https://github.com/betagouv/service-national-universel/commit/0a2176187eba9ac81086e13abf35b22eaa95a172))
- **admin:** correction footer ([#3184](https://github.com/betagouv/service-national-universel/issues/3184)) ([adcd654](https://github.com/betagouv/service-national-universel/commit/adcd6545ad589e80be1247c3b2bff6bc1fc79d41))
- **admin:** disconnected redirect, updated footer ([#3085](https://github.com/betagouv/service-national-universel/issues/3085)) ([6ef81a7](https://github.com/betagouv/service-national-universel/commit/6ef81a759c4e757f68bb05984d73e6b74a529259))
- **admin:** email panel for old messageId ([7d49a99](https://github.com/betagouv/service-national-universel/commit/7d49a9950ae37132265aa45a43f44cd9e0cbd7e6))
- **admin:** email validator contract ([#3115](https://github.com/betagouv/service-national-universel/issues/3115)) ([a0c675f](https://github.com/betagouv/service-national-universel/commit/a0c675f0bf9c4f25c204ec4828490b6a66b9027b))
- **admin:** encode cohort name in query on settings page ([89a1486](https://github.com/betagouv/service-national-universel/commit/89a1486d62419360d8a2042a9213a465fb296faf))
- **admin:** first loading dashboard ([#3227](https://github.com/betagouv/service-national-universel/issues/3227)) ([4310c49](https://github.com/betagouv/service-national-universel/commit/4310c4982eb7373ce46e24ae097e62d4f2602900))
- **admin:** fix up first render dashboard ([bd32364](https://github.com/betagouv/service-national-universel/commit/bd32364126d2b53051afea72bd3db2106b4d2123))
- **admin:** footer instruction admin with sidebar ([#3171](https://github.com/betagouv/service-national-universel/issues/3171)) ([4875ab7](https://github.com/betagouv/service-national-universel/commit/4875ab7544e7c5b71f6ea1bb01477de14d99bed6))
- **admin:** hide disabled cohort mars / juin ([#3221](https://github.com/betagouv/service-national-universel/issues/3221)) ([5632b1e](https://github.com/betagouv/service-national-universel/commit/5632b1eee8dbdcac8cd09bfb3b671f8c9d57f5d7))
- **admin:** link for mission ([#3154](https://github.com/betagouv/service-national-universel/issues/3154)) ([73b6ac9](https://github.com/betagouv/service-national-universel/commit/73b6ac97be2b644d74fd2cddea4311efe497cc0f))
- **admin:** Onglet: Proposer une missions : cohort dans l'ordre dans le filtre ([0b1acc6](https://github.com/betagouv/service-national-universel/commit/0b1acc632caa25f838b517a0f8381d7ddc907b9a))
- **admin:** Prevent export component infinite load if api call is aborted [#3313](https://github.com/betagouv/service-national-universel/issues/3313) ([5579870](https://github.com/betagouv/service-national-universel/commit/55798702da8641c338b7be6682cde7398242da66))
- **admin:** quick fix dashboard ([#3259](https://github.com/betagouv/service-national-universel/issues/3259)) ([2d3e7fd](https://github.com/betagouv/service-national-universel/commit/2d3e7fd7fd216928cd4a82063db9f551fbb7f33d))
- **admin:** rajout de regex email ([#3114](https://github.com/betagouv/service-national-universel/issues/3114)) ([71545f2](https://github.com/betagouv/service-national-universel/commit/71545f229fb05886de350f28bc1eaab91f27f02f))
- **admin:** redirect url ([#3101](https://github.com/betagouv/service-national-universel/issues/3101)) ([fac49f3](https://github.com/betagouv/service-national-universel/commit/fac49f37243e9af85a9242f390ff09cfe90e3408))
- **admin:** remove applications from young identity PUT ([#3089](https://github.com/betagouv/service-national-universel/issues/3089)) ([5b12148](https://github.com/betagouv/service-national-universel/commit/5b12148d80af22d9ca6fef3eb1ca374ee880909e))
- **admin:** schema de repartition young volume ([e782117](https://github.com/betagouv/service-national-universel/commit/e78211717dc81134b502d615e590680aeb9a4bf4))
- **admin:** settings encode cohort with # ([#3169](https://github.com/betagouv/service-national-universel/issues/3169)) ([064893b](https://github.com/betagouv/service-national-universel/commit/064893ba897831cbac3402be5a6ce11afbe32236))
- **admin:** volontaire create form specificSituations ([7c05f3c](https://github.com/betagouv/service-national-universel/commit/7c05f3c149cf515d46013dc21f0c19b4fb1c341b))
- **admin:** wording tooltip instruction paramétrage dynamique ([#3152](https://github.com/betagouv/service-national-universel/issues/3152)) ([35b39e9](https://github.com/betagouv/service-national-universel/commit/35b39e90fc858bde266195ab7137263377c24267))
- **admin/api:** resp signup ([#3311](https://github.com/betagouv/service-national-universel/issues/3311)) ([6274756](https://github.com/betagouv/service-national-universel/commit/6274756febe2981564ff8f8f3e614acbe6e7340e))
- **admin/app:** query param ([f7a5d81](https://github.com/betagouv/service-national-universel/commit/f7a5d8186c5d012d8094cd8413a6271cf6eb8ee9))
- **admin/lib:** change cohort juin 2024 name ([#3170](https://github.com/betagouv/service-national-universel/issues/3170)) ([cda22f0](https://github.com/betagouv/service-national-universel/commit/cda22f053d0891f91dc24934af890ebbd3d65ce6))
- **analytics:** Fix analytics ([4043ed6](https://github.com/betagouv/service-national-universel/commit/4043ed67c1eabdeb02c163f0d8f83168d3cb43e7))
- **analytics:** Fix logs young ([c9e8cae](https://github.com/betagouv/service-national-universel/commit/c9e8cae109a92f8b8633bd1378453328635d493b))
- **analytics:** Use anonymised young for raw data ([5c96662](https://github.com/betagouv/service-national-universel/commit/5c966629b14ec6fceb856dc7686fad8b7e703899))
- **analytics/api:** Anonymise data before sending to analytics ([#3236](https://github.com/betagouv/service-national-universel/issues/3236)) ([7450e1c](https://github.com/betagouv/service-national-universel/commit/7450e1cea6bba5fbac17f0fe4c12475596f650cd))
- **analytics/api:** Charge .env file relatively of where en-manager is located ([a5cd80a](https://github.com/betagouv/service-national-universel/commit/a5cd80abc8ae183fe1889df29e7f8001e8566c33))
- **api:** 403 - Bug Stat TDB “x dossiers d'inscription ouverts” ([#3235](https://github.com/betagouv/service-national-universel/issues/3235)) ([aae2ce5](https://github.com/betagouv/service-national-universel/commit/aae2ce5edf6b36069f5b3c36db422ddeca90f50f))
- **api:** 434 - Affichage TDB ([#3289](https://github.com/betagouv/service-national-universel/issues/3289)) ([92960cf](https://github.com/betagouv/service-national-universel/commit/92960cfa044bf2bc795aaec12e67734922550c4e))
- **api:** 476 - Not setting qpv when we don't have a clear answer. ([#3176](https://github.com/betagouv/service-national-universel/issues/3176)) ([23b3664](https://github.com/betagouv/service-national-universel/commit/23b3664ae9435784d1b5529b21f2b768102fcac0))
- **api:** Add 11 hours to bornBefore date for eligibility check [#3278](https://github.com/betagouv/service-national-universel/issues/3278) ([551188e](https://github.com/betagouv/service-national-universel/commit/551188ebe42e3869cabe12867fd61b9bb342d367))
- **api:** allow coordinatesAccuracyLevel field in young model to be empty ([4590b20](https://github.com/betagouv/service-national-universel/commit/4590b20decd2333e03aab9b3e630716d996ff8fa))
- **api:** Allow empty string for zip on eligibility route ([#3223](https://github.com/betagouv/service-national-universel/issues/3223)) ([0571b61](https://github.com/betagouv/service-national-universel/commit/0571b6143e105a584b4d3d465d5cbea3a38e8ded))
- **api:** Better send in blue sentry errors ([#3116](https://github.com/betagouv/service-national-universel/issues/3116)) ([5ba7445](https://github.com/betagouv/service-national-universel/commit/5ba74459df2a933b07cb9c8644716a1a6b2b2f3e))
- **api:** bug page number negatif ([#3097](https://github.com/betagouv/service-national-universel/issues/3097)) ([4e59492](https://github.com/betagouv/service-national-universel/commit/4e59492060efd1916f87d0a3a4c79d73865f21fb))
- **api:** bug ticket counter ([396b56b](https://github.com/betagouv/service-national-universel/commit/396b56b01407a5e070be5cbb3393b17fee61cf2d))
- **api:** bug ticket counter ([#3082](https://github.com/betagouv/service-national-universel/issues/3082)) ([ad86bde](https://github.com/betagouv/service-national-universel/commit/ad86bde6da3c652f036519a33c6e025f50e57f7c))
- **api:** contactform email to lowercase ([#3162](https://github.com/betagouv/service-national-universel/issues/3162)) ([02bf03e](https://github.com/betagouv/service-national-universel/commit/02bf03ea579ab33fee3c2cf527542e3b01bf180e))
- **api:** eligibility young for change cohort admin ([#3214](https://github.com/betagouv/service-national-universel/issues/3214)) ([20c7a86](https://github.com/betagouv/service-national-universel/commit/20c7a86cf1da464038ce9ea52aabe06485d883d2))
- **api:** email validation via 2fa ([742fd92](https://github.com/betagouv/service-national-universel/commit/742fd92192f679fcc350cc900e3baf0e13ed9262))
- **api:** Fix **tester** ([5dc6125](https://github.com/betagouv/service-national-universel/commit/5dc61250aedd16b98a5c656eb23490533bfda8f8))
- **api:** Fix anonymise structure ([ef224db](https://github.com/betagouv/service-national-universel/commit/ef224db1d270d0ea5e839037dc90e36ee7404096))
- **api:** fix un fix deja fix ([#3131](https://github.com/betagouv/service-national-universel/issues/3131)) ([aff2a18](https://github.com/betagouv/service-national-universel/commit/aff2a1860faf06c41f078f3bfd9b7c6dba3f05be))
- **api:** Fix young reinscription steps ([#3218](https://github.com/betagouv/service-national-universel/issues/3218)) ([02cec5a](https://github.com/betagouv/service-national-universel/commit/02cec5a8057f18fb3cdaa446405feecbac9eba46))
- **api:** guard dashboard requests according to roles ([#3095](https://github.com/betagouv/service-national-universel/issues/3095)) ([45adbef](https://github.com/betagouv/service-national-universel/commit/45adbefef379c8b2c5c5e1dd170e02533d2a0ab9))
- **api:** JWT max age ([#3297](https://github.com/betagouv/service-national-universel/issues/3297)) ([7ac4a88](https://github.com/betagouv/service-national-universel/commit/7ac4a882d48188162eb1bb015cf42e332dc2dd35))
- **api:** public contactform gestion de roles ([#3112](https://github.com/betagouv/service-national-universel/issues/3112)) ([ff9b539](https://github.com/betagouv/service-national-universel/commit/ff9b5398fc05f34b9fbc0d3b9aa1b31ae23dc9e6))
- **api:** sentry registration in dev ([#3080](https://github.com/betagouv/service-national-universel/issues/3080)) ([3dbdefb](https://github.com/betagouv/service-national-universel/commit/3dbdefb82afa9623874a6a3cdd4374789cd66902))
- **api:** tests ([#3142](https://github.com/betagouv/service-national-universel/issues/3142)) ([495680d](https://github.com/betagouv/service-national-universel/commit/495680de664ed3357a3a2d803efdcfb42e43f032))
- **api:** ticket counter bug ([#3215](https://github.com/betagouv/service-national-universel/issues/3215)) ([a0b90a3](https://github.com/betagouv/service-national-universel/commit/a0b90a3c77e32616f497a35c8823172133a00e58))
- **api:** Timezone adaptation for inscription ([#3160](https://github.com/betagouv/service-national-universel/issues/3160)) ([d4caf6f](https://github.com/betagouv/service-national-universel/commit/d4caf6f01e68693dfd7b103d4ea899766437376f))
- **api:** todo engagement ([35f868e](https://github.com/betagouv/service-national-universel/commit/35f868e2a28a6ac417b642dfb8c02bb009288648))
- **api:** update tester ([d89041a](https://github.com/betagouv/service-national-universel/commit/d89041acd480abf2441c5f028988868f8d8ae629))
- **api:** verif droit sur put refrent ([#3303](https://github.com/betagouv/service-national-universel/issues/3303)) ([a6f37e5](https://github.com/betagouv/service-national-universel/commit/a6f37e561911d36570a84f088fefab8df51fc72e))
- **api, app:** 1382 - Inscription/étape éligibilité : retours sur la recherche d'établissement ([#3258](https://github.com/betagouv/service-national-universel/issues/3258)) ([233b58d](https://github.com/betagouv/service-national-universel/commit/233b58d68eaee6d43e942b90b5c9d6661c3f636b))
- **api/admin:** passage vers ré-inscription ([#3198](https://github.com/betagouv/service-national-universel/issues/3198)) ([64c4e50](https://github.com/betagouv/service-national-universel/commit/64c4e506b54e57d319a193d0d47fbd04866b5f4a))
- **api/app:** timeZoneOffset for inscription ([#3159](https://github.com/betagouv/service-national-universel/issues/3159)) ([145d106](https://github.com/betagouv/service-national-universel/commit/145d10694fe7dab6e5795de8966a243e60e141b1))
- **app:** 1382 - Amélio saisie établissement (retours PO) ([#3277](https://github.com/betagouv/service-national-universel/issues/3277)) ([c88fbd5](https://github.com/betagouv/service-national-universel/commit/c88fbd53dea5ac4d06d0f57943e018ee5d58bbec))
- **app:** 1383 - Display error message if address not verified + reset fields [#3210](https://github.com/betagouv/service-national-universel/issues/3210) ([ab2f96b](https://github.com/betagouv/service-national-universel/commit/ab2f96bfa309b6fa9e7a7ee5165fa0863e470edd))
- **app:** 394 - Typo on contact form ([#3200](https://github.com/betagouv/service-national-universel/issues/3200)) ([96891b8](https://github.com/betagouv/service-national-universel/commit/96891b8363c0c5782dec4b2886c9faaa066c188a))
- **app:** 410 - Filter correction requests by cohort [#3230](https://github.com/betagouv/service-national-universel/issues/3230) ([ab67339](https://github.com/betagouv/service-national-universel/commit/ab67339930a37f5f24e77183eeede0cf63d76b2f))
- **app:** 414 - Inscription/Eligibilité: autoriser la sélection d'une école sans adresse exacte en bdd [#3240](https://github.com/betagouv/service-national-universel/issues/3240) ([e545c51](https://github.com/betagouv/service-national-universel/commit/e545c51f5933b478e0f36c9c854bb489a084757c))
- **app:** 515 - Fixing wrong display on cohort year. ([#3185](https://github.com/betagouv/service-national-universel/issues/3185)) ([2870fc4](https://github.com/betagouv/service-national-universel/commit/2870fc4e58133dd379972890111dd6b019a46d37))
- **app:** access to mission based on browser timezone ([#3113](https://github.com/betagouv/service-national-universel/issues/3113)) ([bea421f](https://github.com/betagouv/service-national-universel/commit/bea421f5a78c0d35bbc73d9d977469b498e72f4f))
- **app:** Address Form: fix disabled style on safari ([224c2fb](https://github.com/betagouv/service-national-universel/commit/224c2fb72445f39056d4c6470e372f725b14392d))
- **app:** Address Search: trim query before calling api ([#3212](https://github.com/betagouv/service-national-universel/issues/3212)) ([a25a9e5](https://github.com/betagouv/service-national-universel/commit/a25a9e57e7c7d3ce89d00b8427abbea1b0830b09))
- **app:** Better handle file import if no file selected ([3487bce](https://github.com/betagouv/service-national-universel/commit/3487bce311132b113a80537b1e25a6349c8d6430))
- **app:** Capture unsupported type on front ([#3283](https://github.com/betagouv/service-national-universel/issues/3283)) ([3ccf513](https://github.com/betagouv/service-national-universel/commit/3ccf513e69b4aa2d34c1b73d38e2b7b4b26a4f6d))
- **app:** cni preview desktop ([f3c8cac](https://github.com/betagouv/service-national-universel/commit/f3c8cacedc5d9e6f3d53322f4df3dca8ff1040e6))
- **app:** CNI upload : fix form state reset on error (correction mode) ([ea08b8c](https://github.com/betagouv/service-national-universel/commit/ea08b8c08871bf3514c7478ed313cfe32968417b))
- **app:** Do not redirect fo /televersement when waiting correction ([c137718](https://github.com/betagouv/service-national-universel/commit/c13771818c5ae8bb354241f4f5833426be36eb7a))
- **app:** Do not throw error if ban request was aborted ([d49b471](https://github.com/betagouv/service-national-universel/commit/d49b4711be4d19310df9a2f7f6af88b0fa44c00a))
- **app:** email + typo ([8b00e02](https://github.com/betagouv/service-national-universel/commit/8b00e029585ba6d5eef66be7f81af5fd0d07f03d))
- **app:** email validation error message display on mobile ([bfb0792](https://github.com/betagouv/service-national-universel/commit/bfb0792918d0d80f080a570b82b47cf7acbc409c))
- **app:** error sentry status undefined ([4ac2959](https://github.com/betagouv/service-national-universel/commit/4ac2959cf8c7fc05aa030c5340ed1bc3221587af))
- **app:** fix blank screen on school select for reinscription ([f1fa58a](https://github.com/betagouv/service-national-universel/commit/f1fa58ac248fca9f3708f2c9a1c6906184c06484))
- **app:** fix dropdown ref in address search component ([ae64ef2](https://github.com/betagouv/service-national-universel/commit/ae64ef2762cb625790572adaca190437d78321ed))
- **app:** Fix error if undefined school ([d5dced7](https://github.com/betagouv/service-national-universel/commit/d5dced777979baf09323dcae088ff15cfb2cc5e2))
- **app:** fix preinscription eligibility ([3e5536f](https://github.com/betagouv/service-national-universel/commit/3e5536f30ebe146f14ebec7572f93738312f6dc3))
- **app:** fix preinscription last step if email verif is disabled ([16bcff1](https://github.com/betagouv/service-national-universel/commit/16bcff19dd542856a4e4dbd0053fc117517d9e3f))
- **app:** Get cohort start date during signup ([579834b](https://github.com/betagouv/service-national-universel/commit/579834ba0137c889c06e0209a1af44a3b9555f61))
- **app:** Improve api address error handling ([6a99211](https://github.com/betagouv/service-national-universel/commit/6a9921103b23bae532d1b5cd13205298e770d21a))
- **app:** Improve BAN error handling v3 ([812311a](https://github.com/betagouv/service-national-universel/commit/812311a4c3eef6989af26d75823b1f036dcad5bf))
- **app:** Inscription : allow pdfs ([1bc89f4](https://github.com/betagouv/service-national-universel/commit/1bc89f4a7e9b744affc9783dd8b934ab6603734a))
- **app:** Minor fixes step confirm ([#3151](https://github.com/betagouv/service-national-universel/issues/3151)) ([760d7db](https://github.com/betagouv/service-national-universel/commit/760d7dbf906f989c99f1c830f9633d150e20ef40))
- **app:** Parcours Réinscription et Correction - étape éligibilité : correction de bugs liés à l'adresse de l'établissement ([#3238](https://github.com/betagouv/service-national-universel/issues/3238)) ([59901e9](https://github.com/betagouv/service-national-universel/commit/59901e9a3f19be9ca3f8e5772f98f7e597b4f68d))
- **app:** phase 3 mission for youngs without location ([#3285](https://github.com/betagouv/service-national-universel/issues/3285)) ([a4dda4f](https://github.com/betagouv/service-national-universel/commit/a4dda4fcfec17a3c05fd3c5ae5bf190bccd64ecc))
- **app:** Préinscription - Afficher le nom de l'école même si elle n'a pas d'adresse ([f666084](https://github.com/betagouv/service-national-universel/commit/f66608486646509cd0c4d9bfca1f0130ff9e4be1))
- **app:** preinscription signup ([2d901f4](https://github.com/betagouv/service-national-universel/commit/2d901f45d8d781748c0e5dbb2f0720cf356ab174))
- **app:** Preinscription: no undefined value on school search initialization ([59aa4bb](https://github.com/betagouv/service-national-universel/commit/59aa4bb4632929c7d93a80e8fcdd91d88342f2ac))
- **app:** redirection cohort without old and a venir ([d9159a1](https://github.com/betagouv/service-national-universel/commit/d9159a1971cac9f64699cf0c5ba50e831e7b052f))
- **app:** safari mobile display ? ([9a9b9e9](https://github.com/betagouv/service-national-universel/commit/9a9b9e96a8b55ef6dbe7a36ed0221e98e606e210))
- **app, api:** Ajouter le timeZoneOffset aux appels à la fonction getSessionsFiltered ([#3216](https://github.com/betagouv/service-national-universel/issues/3216)) ([e1d472a](https://github.com/betagouv/service-national-universel/commit/e1d472a57983b1c95ce0e6a2a8e8bd43f5bc5ade))
- **app,lib:** cohort enum list and black page ([68cee61](https://github.com/betagouv/service-national-universel/commit/68cee6114eb5465e2b3011947487f06cd2da0d71))
- **app/admin/api:** id and signup correction ([#3193](https://github.com/betagouv/service-national-universel/issues/3193)) ([9869e39](https://github.com/betagouv/service-national-universel/commit/9869e390ae12c131e80cfa99b9855baf1e80596f))
- **app/api:** Signup offset for preinscription [#3213](https://github.com/betagouv/service-national-universel/issues/3213) ([bb23a3b](https://github.com/betagouv/service-national-universel/commit/bb23a3beb08604db34ac1ba1d6fc60a4b2f057fa))
- **app/api:** some fix on correction [#3173](https://github.com/betagouv/service-national-universel/issues/3173) ([434e501](https://github.com/betagouv/service-national-universel/commit/434e5017f1f275e4c63a0609acf2d3dd3061d1ae))
- **bdc:** fix plausible domain name ([528051c](https://github.com/betagouv/service-national-universel/commit/528051caa938e12c2d96d28ff5a285e3d313dfde))
- **lib:** active email verif for staging and dev ([ff10b50](https://github.com/betagouv/service-national-universel/commit/ff10b501b7b5187363b132fa67048231598038dd))
- **lib:** sentry SNU-PRODUCTION-903 ([bad97ee](https://github.com/betagouv/service-national-universel/commit/bad97ee1e034b943e6a39a3ce21e97ff1a696181))
- **lib/admin:** Inviter une structure en tant que superviseur impossible ([#3108](https://github.com/betagouv/service-national-universel/issues/3108)) ([38c46de](https://github.com/betagouv/service-national-universel/commit/38c46de61631a7a3f217ddc90b1781a221145374))
- **responsible:** Young without mission in list ([7b25537](https://github.com/betagouv/service-national-universel/commit/7b25537a61562e35d4bf3e8b8c380b0f831aab31))
- **workflows:** stop mirroring github files ([ed1ee48](https://github.com/betagouv/service-national-universel/commit/ed1ee4884835a01afb617485b24ecbef05b9920d))

### Features

- **admin:** 1353 Badge de phase right clickable sur liste volontaires ([#3205](https://github.com/betagouv/service-national-universel/issues/3205)) ([9cb213b](https://github.com/betagouv/service-national-universel/commit/9cb213b8c6c1d9590abbf218490fb783ccc72cae))
- **admin:** ajouter un bandeau informatif si une mission a le statut : Brouillon [#3124](https://github.com/betagouv/service-national-universel/issues/3124) ([4821681](https://github.com/betagouv/service-national-universel/commit/4821681fb29b695a654a024219729d86e9754c2f))
- **admin:** change cohort dashboard ([#3211](https://github.com/betagouv/service-national-universel/issues/3211)) ([ad84594](https://github.com/betagouv/service-national-universel/commit/ad84594868d192b7be825954371c05f45423382d))
- **admin:** Dashboard Todo Head Center ([#3087](https://github.com/betagouv/service-national-universel/issues/3087)) ([bc23b5f](https://github.com/betagouv/service-national-universel/commit/bc23b5fd97f663973dba41894dc19dbbe8af3ce0))
- **admin:** dynamic settings phase0 ([#3105](https://github.com/betagouv/service-national-universel/issues/3105)) ([e846767](https://github.com/betagouv/service-national-universel/commit/e84676754b926deec6fb1e753d5d3aa65f30b054))
- **admin:** MEP dashboard structure ([#3153](https://github.com/betagouv/service-national-universel/issues/3153)) ([5f99e31](https://github.com/betagouv/service-national-universel/commit/5f99e31d9b2821481259eae991454f8be516c7dd))
- **admin:** todo basic for resp and supervisor ([#3174](https://github.com/betagouv/service-national-universel/issues/3174)) ([56c3904](https://github.com/betagouv/service-national-universel/commit/56c3904d1c82a89295030143fa59de7e546b540b))
- **admin/api:** création vue dashboard Head-Center ([#3090](https://github.com/betagouv/service-national-universel/issues/3090)) ([ff6e5ea](https://github.com/betagouv/service-national-universel/commit/ff6e5eaeaa887395b780139cbb3d3e45fc4da44d))
- **admin/api:** dashboard visitors ([#3107](https://github.com/betagouv/service-national-universel/issues/3107)) ([262be0e](https://github.com/betagouv/service-national-universel/commit/262be0ea95f5c8f616576c66c37b099d716abf82))
- **admin/api:** Visualiser et exporter des graphiques de suivi de l’inscription ([#3111](https://github.com/betagouv/service-national-universel/issues/3111)) ([11cd038](https://github.com/betagouv/service-national-universel/commit/11cd0380b64f8a775eeca975031cbd61b049cfd2))
- **analytics/api:** Secret manager ([#3136](https://github.com/betagouv/service-national-universel/issues/3136)) ([5b9d0e8](https://github.com/betagouv/service-national-universel/commit/5b9d0e8420ce50972eb445da4a15d4c879fa5444))
- **api:** 1371 - Rebrancher le mail lorsque j’ai terminé l’inscription ([#3209](https://github.com/betagouv/service-national-universel/issues/3209)) ([5b02b8b](https://github.com/betagouv/service-national-universel/commit/5b02b8b76da4a74450050ee6202b446a23465b78))
- **api:** add exception for litige on structure JVA ([#3117](https://github.com/betagouv/service-national-universel/issues/3117)) ([d5e77f1](https://github.com/betagouv/service-national-universel/commit/d5e77f1aca8e2c252e611c5216b54e8afbaa5564))
- **api:** add new zones ([2f9b334](https://github.com/betagouv/service-national-universel/commit/2f9b33459b1de026a090722410649a99c4aef99e))
- **api:** anonymisation ([#3119](https://github.com/betagouv/service-national-universel/issues/3119)) ([da744ad](https://github.com/betagouv/service-national-universel/commit/da744ad71807647e56be91f83cd9a1c84d1a3c23))
- **api:** cron tester ([c2ad425](https://github.com/betagouv/service-national-universel/commit/c2ad4250d028f93875133753ef661d8cdde6b60c))
- **api:** enable 2FA on staging and dev ([ed67a35](https://github.com/betagouv/service-national-universel/commit/ed67a359a2990445ede89abe4aab7a08d4232700))
- **api:** New ImageRight template ([#3168](https://github.com/betagouv/service-national-universel/issues/3168)) ([198e557](https://github.com/betagouv/service-national-universel/commit/198e557e2c95e6229c507bc3513db8ebcebf03a3))
- **api,app:** 1382 - Preinscription : amélioration de la recherche d'établissement ([#3251](https://github.com/betagouv/service-national-universel/issues/3251)) ([51b1be5](https://github.com/betagouv/service-national-universel/commit/51b1be5400444855fa442a698154f0e6a1db5109))
- **api/admin:** align todo for referent region + département ([#3075](https://github.com/betagouv/service-national-universel/issues/3075)) ([028b79a](https://github.com/betagouv/service-national-universel/commit/028b79a46a40a086f722d71693266d613f6fa30f))
- **api/admin/app:** pass user timezone in req header ([#3237](https://github.com/betagouv/service-national-universel/issues/3237)) ([ddee667](https://github.com/betagouv/service-national-universel/commit/ddee6671f8c9cacbcd56966815fe396485923b42))
- **api/app:** 1370 - Mise à jour du tracking des étapes d'inscription et réinscription ([#3199](https://github.com/betagouv/service-national-universel/issues/3199)) ([bac6d6f](https://github.com/betagouv/service-national-universel/commit/bac6d6f1d47729a42b7079c519cd7c9f0af4d4ff))
- **api/kb:** 1453 - visibility new role cle bdc ([#3310](https://github.com/betagouv/service-national-universel/issues/3310)) ([21556b9](https://github.com/betagouv/service-national-universel/commit/21556b93c7fca75c4aa1163b3f5e39624ec74513))
- **app:** 1232 - Fix recap modal (retour d'Elise) ([#3269](https://github.com/betagouv/service-national-universel/issues/3269)) ([40563c9](https://github.com/betagouv/service-national-universel/commit/40563c97d64a0b331c537c2e7fb0f0b1fedc39a5))
- **app:** 1232 - new confirm modal for Eligibility ([#3243](https://github.com/betagouv/service-national-universel/issues/3243)) ([920dd19](https://github.com/betagouv/service-national-universel/commit/920dd19dfe01b432fe938f6e842e6fa6ef945bec))
- **app:** 1370 - Inscription: mise à jour des événements plausible ([#3203](https://github.com/betagouv/service-national-universel/issues/3203)) ([c97af07](https://github.com/betagouv/service-national-universel/commit/c97af0775687501142e0e8c57fd19fe9b097d85c))
- **app:** 1373 - Limiting datePicker ranges. ([#3179](https://github.com/betagouv/service-national-universel/issues/3179)) ([58d73de](https://github.com/betagouv/service-national-universel/commit/58d73de4a5258e1cb253110e6594b3ee78cb85b8))
- **app:** 1378 - Renommer le fichier du règlement intérieur “Règlement intérieur SNU” ([#3201](https://github.com/betagouv/service-national-universel/issues/3201)) ([b658584](https://github.com/betagouv/service-national-universel/commit/b65858446548a91a88e92400f150e3503764c600))
- **app:** 1382 - Inscription/étape éligibilité : Améliorer la saisie de l'école ([#3231](https://github.com/betagouv/service-national-universel/issues/3231)) ([f0ddc27](https://github.com/betagouv/service-national-universel/commit/f0ddc2788d90fc8544f655267bdf2f691013de2d))
- **app:** 1388, 712 - Merge reinscription and preinscription components. ([#3234](https://github.com/betagouv/service-national-universel/issues/3234)) ([35bcd1c](https://github.com/betagouv/service-national-universel/commit/35bcd1c080069e127e70a47c8c5315ee3d0eed0b))
- **app:** 1427/1431 - Wording Change(remove volontaire) for futur CLE ([#3250](https://github.com/betagouv/service-national-universel/issues/3250)) ([3158b7d](https://github.com/betagouv/service-national-universel/commit/3158b7df58c46c1573d6974dbbc6bc3fe6ba82f4))
- **app:** 394 - Update contact form ([#3183](https://github.com/betagouv/service-national-universel/issues/3183)) ([934b62b](https://github.com/betagouv/service-national-universel/commit/934b62b5a4871ecf6006b5797ae3538e443afec9))
- **app:** 399 - Afficher une info spécifique aux volontaires de 1ère GT sur la page de choix des séjours ([#3161](https://github.com/betagouv/service-national-universel/issues/3161)) ([03c867e](https://github.com/betagouv/service-national-universel/commit/03c867e89320526473990180c834213f05a79062))
- **app:** 410/1004 - add New RL info in Inscription ([#3222](https://github.com/betagouv/service-national-universel/issues/3222)) ([0e2ec55](https://github.com/betagouv/service-national-universel/commit/0e2ec55f31a776e81858ec3c57156108fc38e42f))
- **app:** 822 - change wording on footer ([#3254](https://github.com/betagouv/service-national-universel/issues/3254)) ([29d3731](https://github.com/betagouv/service-national-universel/commit/29d37316504eead6772626f61657fc8a54cb6351))
- **app:** 924 - Change on inscription coordonnée and recap ([#3255](https://github.com/betagouv/service-national-universel/issues/3255)) ([d56d1c8](https://github.com/betagouv/service-national-universel/commit/d56d1c86180ef1cb7e68e7b29b3ffbdf578e479d))
- **app:** Add link to sejour choice step to step confirm of preinscription ([#3081](https://github.com/betagouv/service-national-universel/issues/3081)) ([fdc4b05](https://github.com/betagouv/service-national-universel/commit/fdc4b0525cac7cd78649b13d49540e2e2cb73765))
- **app:** Change datepicker for birthdate and cniExpirationDate ([#3099](https://github.com/betagouv/service-national-universel/issues/3099)) ([d4363fd](https://github.com/betagouv/service-national-universel/commit/d4363fd0ef4c8a03c99ec0aad8e1e443bfb5d934))
- **app:** Change disposition order of specificAmenagement for inscription funel ([#3100](https://github.com/betagouv/service-national-universel/issues/3100)) ([c54e8d3](https://github.com/betagouv/service-national-universel/commit/c54e8d344b83bf678950495cf2912f8d700c942a))
- **app:** date picker error message ([51e35cf](https://github.com/betagouv/service-national-universel/commit/51e35cf2d07a8235abacdf4d0b32778c844f6be6))
- **app:** delete old banner for cohort < 2022 ([#3180](https://github.com/betagouv/service-national-universel/issues/3180)) ([3a814c6](https://github.com/betagouv/service-national-universel/commit/3a814c6033c33551bbc315c102baa772b69bcd67))
- **app:** disable email validation on test and staging ([#3120](https://github.com/betagouv/service-national-universel/issues/3120)) ([f347b40](https://github.com/betagouv/service-national-universel/commit/f347b40eecaef020bf16759f55b491e3dba8a3e3))
- **app:** dynamic inscription openning ([#3175](https://github.com/betagouv/service-national-universel/issues/3175)) ([c361ae3](https://github.com/betagouv/service-national-universel/commit/c361ae32a4bf7a82d93510e2a6534a86fbf63920))
- **app:** inscription & préinscription -> add default PhoneNumber Value (+33) ([#3088](https://github.com/betagouv/service-national-universel/issues/3088)) ([334be74](https://github.com/betagouv/service-national-universel/commit/334be749dfdf063042f2bd18199bbabfd09c747d))
- **app:** Inscription/téléversement : ajouter une étape de prévisualisation des documents ([#3134](https://github.com/betagouv/service-national-universel/issues/3134)) ([34416d6](https://github.com/betagouv/service-national-universel/commit/34416d6c0f545d59646e7fe06d5933ed34841d8c))
- **app:** New radio button for special situation ([#3156](https://github.com/betagouv/service-national-universel/issues/3156)) ([4a4bef8](https://github.com/betagouv/service-national-universel/commit/4a4bef8c189e24d87b25a95356c87dc27c366f7b))
- **app:** replace lib function by api call when checking if reinscription is open ([#3177](https://github.com/betagouv/service-national-universel/issues/3177)) ([a7e1de6](https://github.com/betagouv/service-national-universel/commit/a7e1de6c5b2d3df29ca8bdb15304a7cbd791bd1f))
- **app, admin:** 515 - Added missing wording. ([#3178](https://github.com/betagouv/service-national-universel/issues/3178)) ([74be6d4](https://github.com/betagouv/service-national-universel/commit/74be6d4b8fcb7039cb94caca349b97e4d7110a08))
- **app, api:** address autocomplete ([#3121](https://github.com/betagouv/service-national-universel/issues/3121)) ([9e2c001](https://github.com/betagouv/service-national-universel/commit/9e2c001fd51042c59e25528432f9e47fed984117))
- **app/admin:** 515 - Modification du contenu consentement volontaire. ([#3155](https://github.com/betagouv/service-national-universel/issues/3155)) ([ea2e11e](https://github.com/betagouv/service-national-universel/commit/ea2e11e5e5c8176e0e170cd2e298bdafa9dbba73))
- **app/api:** 828 - Préinscription et Réinscription : évolution de l'écran "Non éligible" ([#3158](https://github.com/betagouv/service-national-universel/issues/3158)) ([5a49596](https://github.com/betagouv/service-national-universel/commit/5a49596797970f6e496acbddd1ff50215cb87fcd))
- **app/api:** open change cohort for the inscriptions of the same year ([#3181](https://github.com/betagouv/service-national-universel/issues/3181)) ([5220a42](https://github.com/betagouv/service-national-universel/commit/5220a4223dddd181828bf85cbf5afa914c68f2ef))
- **lib/admin:** MEP dashboard for head_center and visitor ([#3248](https://github.com/betagouv/service-national-universel/issues/3248)) ([a995e82](https://github.com/betagouv/service-national-universel/commit/a995e82cc0c4bb19302246086bb4cb6a4d571737))
- add new cohorts ([#3150](https://github.com/betagouv/service-national-universel/issues/3150)) ([37b68ed](https://github.com/betagouv/service-national-universel/commit/37b68ed36d2286791e21da81fcdf7bec92e7af2d))

### Reverts

- Revert "chore(app): Disable temporarily secu on app" ([45d28bf](https://github.com/betagouv/service-national-universel/commit/45d28bf0c00f104a5224c218943630b4cc30bb42))
- Revert "choer(app): Disable HTTPS" ([e5008f2](https://github.com/betagouv/service-national-universel/commit/e5008f2e9a200dc28d543e83eb614c7070744f7e))
- Revert "chore(all): Force precommit for npm i as well" ([1b2211c](https://github.com/betagouv/service-national-universel/commit/1b2211ce232a190765427dbee1031bd9156c7f3b))
- Revert "chore(analytics/api): Unify env-manager (#3226)" ([c9ec9b5](https://github.com/betagouv/service-national-universel/commit/c9ec9b5babb6ed2be840e1105576260cffa89aa5)), closes [#3226](https://github.com/betagouv/service-national-universel/issues/3226)
- **api:** 507-loadtest-setup [#3188](https://github.com/betagouv/service-national-universel/issues/3188) ([#3207](https://github.com/betagouv/service-national-universel/issues/3207)) ([1871d4c](https://github.com/betagouv/service-national-universel/commit/1871d4ce72fc28ec7f2e585db10e90e7023d9e45))
- Revert "feat(app/ api) Open reinscription for other status (#3187)" (#3195) ([7468538](https://github.com/betagouv/service-national-universel/commit/746853864e3e95b18ecce9f5ea82643b7d5419c0)), closes [#3187](https://github.com/betagouv/service-national-universel/issues/3187) [#3195](https://github.com/betagouv/service-national-universel/issues/3195)
- Revert "fix(app): Disable redirection" ([859652c](https://github.com/betagouv/service-national-universel/commit/859652cfcd02281145926db3ae92231faef0200d))
- Revert "chore(all): Clean config files for front apps (#3126)" (#3127) ([537942e](https://github.com/betagouv/service-national-universel/commit/537942e8c802a8bb5838fcc2bd7ae1436a110ad6)), closes [#3126](https://github.com/betagouv/service-national-universel/issues/3126) [#3127](https://github.com/betagouv/service-national-universel/issues/3127)
- Revert "fix(admin): bug sentry undefined" ([9393043](https://github.com/betagouv/service-national-universel/commit/9393043dd5ee28b96943f4d698f8bd17bf03e877))
- Revert "fix(admin): bug mission name undefined" ([ee00afd](https://github.com/betagouv/service-national-universel/commit/ee00afdd630b205d26b3b31db4aa136c35df4fbc))
- Revert "feat(admin): MEP dashboard et sidebar pour referent (#3093)" ([0988ed2](https://github.com/betagouv/service-national-universel/commit/0988ed21bb098950c4bce70f5d3e502d61bd4ca8)), closes [#3093](https://github.com/betagouv/service-national-universel/issues/3093)

# [1.343.0](https://github.com/betagouv/service-national-universel/compare/v1.342.0...v1.343.0) (2023-10-02)

### Bug Fixes

- **analytics:** bug date crons code climate ([#3064](https://github.com/betagouv/service-national-universel/issues/3064)) ([2b2551d](https://github.com/betagouv/service-national-universel/commit/2b2551d4f2904a99208aa9e08a7e7a87ccbfda35))
- **analytics:** bug nom et type pour crons analytics dans la db postgre ([#3070](https://github.com/betagouv/service-national-universel/issues/3070)) ([4048ab7](https://github.com/betagouv/service-national-universel/commit/4048ab7f2ad453e6408967de42ab55daca83db00))
- **app:** add back swc/plugin-styled-components ([9946bc4](https://github.com/betagouv/service-national-universel/commit/9946bc4a7d59c9764efbbf125d29490ac4c867a5))
- **bdc:** put back autoprefixer ([ecf3ce9](https://github.com/betagouv/service-national-universel/commit/ecf3ce98b67a32422c0bbcb8434e338706cf6e4e))

### Features

- **admin:** finition todo moderateur ([#3061](https://github.com/betagouv/service-national-universel/issues/3061)) ([7653dca](https://github.com/betagouv/service-national-universel/commit/7653dcac2655716ee893bfa031950022117f7b50))
- **app:** POC adress combobox v2 (staging only) [#3063](https://github.com/betagouv/service-national-universel/issues/3063) ([f9097f1](https://github.com/betagouv/service-national-universel/commit/f9097f1ace1b05c0a11b75007300f7974cd8f8b1))
- **app:** poc combobox address v3 (staging only) ([74990bc](https://github.com/betagouv/service-national-universel/commit/74990bc03abf8afd06f9110af4b93fa88f45bf25))

# [1.342.0](https://github.com/betagouv/service-national-universel/compare/v1.341.1...v1.342.0) (2023-09-29)

### Bug Fixes

- **admin:** staging overide balleen problem ([44490dd](https://github.com/betagouv/service-national-universel/commit/44490dd3282c0b74ea825d2fe20e8d5ff2ec7a40))

### Features

- **admin:** environment variables ([#3057](https://github.com/betagouv/service-national-universel/issues/3057)) ([80b43f3](https://github.com/betagouv/service-national-universel/commit/80b43f3b557a79d719ca3e041dae92fcb1cab466))
- **app/api:** Préinscription : ajout de la saisie du numéro de téléphone ([#3037](https://github.com/betagouv/service-national-universel/issues/3037)) ([4935e34](https://github.com/betagouv/service-national-universel/commit/4935e3432e44bfd592b3ca890d8c497f6aca6e08))

## [1.341.1](https://github.com/betagouv/service-national-universel/compare/v1.341.0...v1.341.1) (2023-09-28)

### Bug Fixes

- **lib:** date cohort ([754aa08](https://github.com/betagouv/service-national-universel/commit/754aa08bbd2f679b5c601da6b4d8bf0e9737078c))
- **lib:** date cohort patch 2 ([b264a76](https://github.com/betagouv/service-national-universel/commit/b264a765dabe3e042e0a55aed5063f05641806f0))

# [1.341.0](https://github.com/betagouv/service-national-universel/compare/v1.340.1...v1.341.0) (2023-09-27)

### Bug Fixes

- **admin:** footer prod / dev ([2fb3d4d](https://github.com/betagouv/service-national-universel/commit/2fb3d4df565b59531116f821b9d3096ac9dc00ce))
- **api:** count total result when search with elasticsearch ([#3054](https://github.com/betagouv/service-national-universel/issues/3054)) ([1aed213](https://github.com/betagouv/service-national-universel/commit/1aed213b5d46c00f719b1ec918979853760f6bec))
- **app:** fix address combobox POC for DROMS ([32a4199](https://github.com/betagouv/service-national-universel/commit/32a41999f61c5d7858a2180249c576eed9c718ae))

### Features

- **admin:** MEP new dashboard + sidebar pour les modérateur ([#3052](https://github.com/betagouv/service-national-universel/issues/3052)) ([de22e64](https://github.com/betagouv/service-national-universel/commit/de22e6490df8cf8bf14d48b1da6123b9f2fbb883))
- **app:** Inscription: POC combobox adresse - staging only ([#3055](https://github.com/betagouv/service-national-universel/issues/3055)) ([e11b6bf](https://github.com/betagouv/service-national-universel/commit/e11b6bf3ff70010af58b5551baf75d2364da8635))
- **app:** poc combobox adresse v2 ([8232e63](https://github.com/betagouv/service-national-universel/commit/8232e632b01b3144f1ea2a8e011631d991baec27))

## [1.340.1](https://github.com/betagouv/service-national-universel/compare/v1.340.0...v1.340.1) (2023-09-26)

### Bug Fixes

- **admin:** dashboard engagement redirection mission ([#3049](https://github.com/betagouv/service-national-universel/issues/3049)) ([e6178e6](https://github.com/betagouv/service-national-universel/commit/e6178e6951167fa7c908d0d1007235393a58479a))
- **admin:** dashboard retours Emmanuel ([#3050](https://github.com/betagouv/service-national-universel/issues/3050)) ([955401e](https://github.com/betagouv/service-national-universel/commit/955401e3b219a9af4d0c9872c49ebc0dfb894b94))
- **admin:** graph tooltip font weight ([13fcba2](https://github.com/betagouv/service-national-universel/commit/13fcba273b30d55abb58ad3a41227bbd1adb0566))

# [1.340.0](https://github.com/betagouv/service-national-universel/compare/v1.339.0...v1.340.0) (2023-09-25)

### Bug Fixes

- **app:** Add redirection for old ticket path ([2d6b50c](https://github.com/betagouv/service-national-universel/commit/2d6b50c006c2b9bb78abfeadec332320a7acf4e2))

### Features

- **admin/api:** retour test bertille ([#3047](https://github.com/betagouv/service-national-universel/issues/3047)) ([5d70e7d](https://github.com/betagouv/service-national-universel/commit/5d70e7dbf0afe7f37e78156aa436ea1b6dee96c3))

# [1.339.0](https://github.com/betagouv/service-national-universel/compare/v1.338.0...v1.339.0) (2023-09-24)

### Features

- **admin:** statut phase dashboard admin refacto ([780da95](https://github.com/betagouv/service-national-universel/commit/780da95adbf8373e1b0164d1594fb85dbef71072))

# [1.338.0](https://github.com/betagouv/service-national-universel/compare/v1.337.0...v1.338.0) (2023-09-22)

### Bug Fixes

- **admin:** check adresse mission on create ([3a52537](https://github.com/betagouv/service-national-universel/commit/3a52537c6fabf1960e6bd6c8fd9d16b04fc154e4))
- **admin:** dashboard retours Bertille & bugfixs ([#3024](https://github.com/betagouv/service-national-universel/issues/3024)) ([fb171dc](https://github.com/betagouv/service-national-universel/commit/fb171dc147753bfb2cc6c32e31019cce1c6c42ec))
- **admin:** date picker dashboard engagement [#3043](https://github.com/betagouv/service-national-universel/issues/3043) ([0478dae](https://github.com/betagouv/service-national-universel/commit/0478daec2b2e291f83b77a63abc7a0743d6587e3))
- structures with ES ([#3041](https://github.com/betagouv/service-national-universel/issues/3041)) ([407e3c3](https://github.com/betagouv/service-national-universel/commit/407e3c3319029a5b924eae8a4d42aecd82b2e5d0))

### Features

- **admin:** remove dev tab dashboard ([#3035](https://github.com/betagouv/service-national-universel/issues/3035)) ([2cb2c88](https://github.com/betagouv/service-national-universel/commit/2cb2c88d47a960bb4babfc1aa6116ddf303c2d68))
- **admin/api:** add link in todo dashboard moderator ([#3021](https://github.com/betagouv/service-national-universel/issues/3021)) ([e29c3a7](https://github.com/betagouv/service-national-universel/commit/e29c3a7d0bfa4fac0d46f3e97570da3b6518f7b2))
- **admin/api:** dashboard volontaires equivalence mig ([#3023](https://github.com/betagouv/service-national-universel/issues/3023)) ([ba8321c](https://github.com/betagouv/service-national-universel/commit/ba8321c6f6828223accaf1630320e5f8f7c4fe79))

# [1.337.0](https://github.com/betagouv/service-national-universel/compare/v1.336.0...v1.337.0) (2023-09-21)

### Bug Fixes

- **analytics:** bug crons ([5b4d9e9](https://github.com/betagouv/service-national-universel/commit/5b4d9e9f7011276489207a6d09f5b4fc0fe40cc4))
- **analytics:** crons sentry/codeclimate/uptime ([23cce4e](https://github.com/betagouv/service-national-universel/commit/23cce4e7ceb87ff5dc6e4dd5f1d95b99a0e50cc6))
- **api:** async missing ([1e0a38a](https://github.com/betagouv/service-national-universel/commit/1e0a38a7c6fb860a3362ebae7b399bcfa0b5bbe5))

### Features

- **admin:** Add userback ([8157092](https://github.com/betagouv/service-national-universel/commit/8157092dac65b3fd11cb1aae20e7ec4a485849ea))

# [1.336.0](https://github.com/betagouv/service-national-universel/compare/v1.335.0...v1.336.0) (2023-09-20)

### Bug Fixes

- **admin:** places left on duplicate mission ([5c26e2a](https://github.com/betagouv/service-national-universel/commit/5c26e2ade2714c74b552625662e9a154961f4839))
- **analytics:** redis client pingInterval ([1834bf3](https://github.com/betagouv/service-national-universel/commit/1834bf3db715db8607d4650f1b6b5e2718093f54))
- **api:** Ping redis to not kill socket connection ([0488260](https://github.com/betagouv/service-national-universel/commit/048826046dc4e78c7d91edc4273bf259160289db))
- **app:** only leave signup open in staging ([7ba77b2](https://github.com/betagouv/service-national-universel/commit/7ba77b2aaee3d04d5057dafead132446a1a7d4ed))
- **app:** wording ([d583d18](https://github.com/betagouv/service-national-universel/commit/d583d18ed65d4cde060a1aba89aba3bfaeefac07))
- redis connection ([4d34d2e](https://github.com/betagouv/service-national-universel/commit/4d34d2e9eb72873101f2d5ac89c2ee50f55ddd25))

### Features

- **analytics:** cron sentry + code climate + uptimeRobot ([#3025](https://github.com/betagouv/service-national-universel/issues/3025)) ([d959436](https://github.com/betagouv/service-national-universel/commit/d959436b2c6187eee836e36cd047303e7f67f429))

### Reverts

- Revert "Revert "fix(analytics): import deps redis (#3026)"" ([e55c129](https://github.com/betagouv/service-national-universel/commit/e55c1290eba7207be3e5b142c31dc41d8d368da2)), closes [#3026](https://github.com/betagouv/service-national-universel/issues/3026)
- Revert "Revert "refacto(analytics): naming, separation of concerns, imports and more (#3020)"" ([2a390be](https://github.com/betagouv/service-national-universel/commit/2a390be671f7c3345fa1f4b2d0626d4e8f158ff4)), closes [#3020](https://github.com/betagouv/service-national-universel/issues/3020)

# [1.335.0](https://github.com/betagouv/service-national-universel/compare/v1.334.1...v1.335.0) (2023-09-19)

### Bug Fixes

- **api:** bug city undefined ([7784467](https://github.com/betagouv/service-national-universel/commit/7784467a1282b7c7ccb7e6fa5ce40e34db9f51db))
- **api:** bug packages ([bdcb5b0](https://github.com/betagouv/service-national-universel/commit/bdcb5b0541611fefa39ae0ed8fd90a3ae25c8cf3))
- **api:** package ([d5b1e9f](https://github.com/betagouv/service-national-universel/commit/d5b1e9f403f41b6f02ddac8d44aac301b1398d25))
- **api:** rerun api ([dad5750](https://github.com/betagouv/service-national-universel/commit/dad57502f4709bc6c438d571d7c6eb6849f15fa8))
- **api:** rerun package lock ([406705d](https://github.com/betagouv/service-national-universel/commit/406705d0e23886aa5d48a8c5baec1deb9e834556))

### Features

- PR template ([#2975](https://github.com/betagouv/service-national-universel/issues/2975)) ([f1e4676](https://github.com/betagouv/service-national-universel/commit/f1e467678eaac1b181f6d4716ad86dee5e2f1c8f))

### Reverts

- Revert "refacto(analytics): naming, separation of concerns, imports and more (#3020)" ([5167ce4](https://github.com/betagouv/service-national-universel/commit/5167ce4f4bbbc45c23649fff6b57db1d50defaa6)), closes [#3020](https://github.com/betagouv/service-national-universel/issues/3020)

## [1.334.1](https://github.com/betagouv/service-national-universel/compare/v1.334.0...v1.334.1) (2023-09-18)

### Bug Fixes

- **admin:** dayjs shift time to utc with daylight saving time ([#3010](https://github.com/betagouv/service-national-universel/issues/3010)) ([65f0b61](https://github.com/betagouv/service-national-universel/commit/65f0b61b64dcbe03cbe90e39cee18afb0f4c0550))
- **admin:** sort options on load ([#3004](https://github.com/betagouv/service-national-universel/issues/3004)) ([d13cab9](https://github.com/betagouv/service-national-universel/commit/d13cab94dbf785c0f994f8f6daadd478fd8fded4))
- **deps:** update dependency libphonenumber-js to v1.10.44 ([#2980](https://github.com/betagouv/service-national-universel/issues/2980)) ([bf3facd](https://github.com/betagouv/service-national-universel/commit/bf3facd436dd80775eea1167de4a46741387d38a))
- **deps:** update dependency pg to v8.11.3 ([#2981](https://github.com/betagouv/service-national-universel/issues/2981)) ([d7c27f3](https://github.com/betagouv/service-national-universel/commit/d7c27f36ee9d1e8c1436c6334134354da9f507f6))
- **deps:** update dependency redis to v4.6.8 ([#2982](https://github.com/betagouv/service-national-universel/issues/2982)) ([a238845](https://github.com/betagouv/service-national-universel/commit/a2388450255e6d0916d3d87d7d0f2f98d0c1e997))
- **deps:** update dependency redux to v4.2.1 ([#2983](https://github.com/betagouv/service-national-universel/issues/2983)) ([5c847c9](https://github.com/betagouv/service-national-universel/commit/5c847c9cebd5138670c5955c47785b6c4c62521e))
- **deps:** update dependency slate-react to v0.98.3 ([#2985](https://github.com/betagouv/service-national-universel/issues/2985)) ([34e2308](https://github.com/betagouv/service-national-universel/commit/34e2308d52900b5081915a3a8b4ceea6c6aab0a8))
- **deps:** update dependency styled-components to v5.3.11 ([#2986](https://github.com/betagouv/service-national-universel/issues/2986)) ([333a2db](https://github.com/betagouv/service-national-universel/commit/333a2db061a9e9f016cc4e9dd20f9a907fa97f11))
- **deps:** update dependency uuid to v9.0.1 ([#2987](https://github.com/betagouv/service-national-universel/issues/2987)) ([4b18519](https://github.com/betagouv/service-national-universel/commit/4b185194da0a5565cc52b308bde9c32376de49bb))

# [1.334.0](https://github.com/betagouv/service-national-universel/compare/v1.333.0...v1.334.0) (2023-09-15)

### Bug Fixes

- **admin:** structure invite behavior ([#2998](https://github.com/betagouv/service-national-universel/issues/2998)) ([cb39124](https://github.com/betagouv/service-national-universel/commit/cb39124a54302f64344ee4ff54815a4cba3f6ed3))
- **api:** searchbar with spaces ([#2970](https://github.com/betagouv/service-national-universel/issues/2970)) ([222496f](https://github.com/betagouv/service-national-universel/commit/222496f17988f08ad11b71dde69fe4b3d7ccb31f))
- **app:** fix redirection in parent context ([#2992](https://github.com/betagouv/service-national-universel/issues/2992)) ([a10b76a](https://github.com/betagouv/service-national-universel/commit/a10b76a92300e2325405b55a62fbc322d2d76cc5))
- **snu-lib:** translation phase2 status ([#2996](https://github.com/betagouv/service-national-universel/issues/2996)) ([d35b90b](https://github.com/betagouv/service-national-universel/commit/d35b90b08883595725ddba2782af01156c51cb66))

### Features

- **admin:** download/mail button attestation phase1/2/3 ([#2978](https://github.com/betagouv/service-national-universel/issues/2978)) ([2955e36](https://github.com/betagouv/service-national-universel/commit/2955e36cbe916f4750b78263d1243c1063732886))
- **admin:** update process duplicate mission + refacto page create mission ([#2952](https://github.com/betagouv/service-national-universel/issues/2952)) ([95ac9c2](https://github.com/betagouv/service-national-universel/commit/95ac9c2a961907abada843a26f207f09a28e1e3e))
- **app/admin/api:** bouton 2fa appareil ([#2997](https://github.com/betagouv/service-national-universel/issues/2997)) ([8d33a6a](https://github.com/betagouv/service-national-universel/commit/8d33a6ae31d4ebea649c20ef77ac2d651b92a8e3))

# [1.333.0](https://github.com/betagouv/service-national-universel/compare/v1.332.0...v1.333.0) (2023-09-14)

### Bug Fixes

- **app:** representants legaux - fix display of data on mobile verification page ([c3d004f](https://github.com/betagouv/service-national-universel/commit/c3d004fc2af72db9abb7c1255bccd5f76f60413d))
- **lib:** instruction end date for october ([b069fac](https://github.com/betagouv/service-national-universel/commit/b069fac0f4d1fe6dde4c184b6991d228deebd452))

### Features

- **lib:** update inscription end date for cohort in october ([7239ab6](https://github.com/betagouv/service-national-universel/commit/7239ab6a90ada5c25178fe537d16e247cbb6b552))

# [1.332.0](https://github.com/betagouv/service-national-universel/compare/v1.331.0...v1.332.0) (2023-09-13)

### Bug Fixes

- **app:** fix form validation on public contact form ([1f5f570](https://github.com/betagouv/service-national-universel/commit/1f5f570c17eda3c8dec1ef4c8f110c889c610803))
- **app:** wording ([0d3584c](https://github.com/betagouv/service-national-universel/commit/0d3584ce5c727340f88810097c2ed7a813f9f283))
- **deps:** update dependency @elastic/elasticsearch to v7.17.12 ([#2960](https://github.com/betagouv/service-national-universel/issues/2960)) ([6d3fa6b](https://github.com/betagouv/service-national-universel/commit/6d3fa6b821ac96cbde18994d03b3c29d6284796f))
- **deps:** update dependency @headlessui/react to v1.7.17 ([#2961](https://github.com/betagouv/service-national-universel/issues/2961)) ([7437bc0](https://github.com/betagouv/service-national-universel/commit/7437bc09601e4ceff8f1d80f3a800b96198b3db0))
- **deps:** update dependency @headlessui/react to v1.7.17 ([#2962](https://github.com/betagouv/service-national-universel/issues/2962)) ([ed3b961](https://github.com/betagouv/service-national-universel/commit/ed3b9613baceef5136abd5c5458b9dcc785e9c3d))
- **deps:** update dependency @rollup/plugin-commonjs to v25.0.4 ([#2963](https://github.com/betagouv/service-national-universel/issues/2963)) ([cccaef8](https://github.com/betagouv/service-national-universel/commit/cccaef8102f9982ddc83754e5d0309adffbc1aaf))
- **deps:** update dependency autoprefixer to v10.4.15 ([#2964](https://github.com/betagouv/service-national-universel/issues/2964)) ([0e95e69](https://github.com/betagouv/service-national-universel/commit/0e95e690fd15a09499afd0d7fd1ad6cf3dc7852a))
- **deps:** update dependency bootstrap to v4.6.2 ([#2966](https://github.com/betagouv/service-national-universel/issues/2966)) ([f80e2bb](https://github.com/betagouv/service-national-universel/commit/f80e2bb02b2874ed08ea937a3280877a2bc34d06))
- **deps:** update dependency dayjs to v1.11.9 ([#2967](https://github.com/betagouv/service-national-universel/issues/2967)) ([1dc5426](https://github.com/betagouv/service-national-universel/commit/1dc54262f6be256baf037da09a50502cfca350a5))
- **deps:** update dependency jsonwebtoken to v9.0.2 ([#2977](https://github.com/betagouv/service-national-universel/issues/2977)) ([2a5cfc9](https://github.com/betagouv/service-national-universel/commit/2a5cfc9466ff4ea513adcf15e348cffcee6153eb))

### Features

- **admin:** ajout des Key Numbers engagement sur le dashboard ([#2923](https://github.com/betagouv/service-national-universel/issues/2923)) ([c04303f](https://github.com/betagouv/service-national-universel/commit/c04303f5dba9142115a86fbf2598e2ebacd227fe))
- **admin:** ajout du Key number engagement new missions ([#2927](https://github.com/betagouv/service-national-universel/issues/2927)) ([6e9b5c2](https://github.com/betagouv/service-national-universel/commit/6e9b5c2fab9a0a9130ac568e866e26239fa2866d))
- **admin:** ajout Key Number engagement young proposed mission ([#2932](https://github.com/betagouv/service-national-universel/issues/2932)) ([43b2be4](https://github.com/betagouv/service-national-universel/commit/43b2be46f79271429f201d0c97333c691f5d944d))
- **admin:** ajout Key Number engagement young start Phase2 in time ([#2931](https://github.com/betagouv/service-national-universel/issues/2931)) ([0423b1f](https://github.com/betagouv/service-national-universel/commit/0423b1f8022e1f457f0950491cf154c30e413583))

# [1.331.0](https://github.com/betagouv/service-national-universel/compare/v1.330.0...v1.331.0) (2023-09-12)

### Bug Fixes

- **admin:** datepicker range ([#2969](https://github.com/betagouv/service-national-universel/issues/2969)) ([c2ad7e8](https://github.com/betagouv/service-national-universel/commit/c2ad7e8e505c433ecd38a7b0c933abf4beb99476))
- **analytics:** model mig ([2f86ddc](https://github.com/betagouv/service-national-universel/commit/2f86ddc81c0f4d453ea113228cda545cb001bd96))
- **analytics:** route log mig ([efe9573](https://github.com/betagouv/service-national-universel/commit/efe9573e51568909720b0804f1c46bf389f4616c))
- **app:** improve address search and error mgmt ([#2917](https://github.com/betagouv/service-national-universel/issues/2917)) ([63f1c00](https://github.com/betagouv/service-national-universel/commit/63f1c005c47e149340a92097cede49d18edd55d6))

### Features

- **admin:** Ajout des Key Numbers Inscription sur le dashboard ([#2909](https://github.com/betagouv/service-national-universel/issues/2909)) ([25334f2](https://github.com/betagouv/service-national-universel/commit/25334f20a919c5c4d7aae7aca6cd09963cf27e32))
- **admin:** ajout Key Number engagement contrats signés [#2937](https://github.com/betagouv/service-national-universel/issues/2937) ([eae6d2b](https://github.com/betagouv/service-national-universel/commit/eae6d2bb825a450692aa5cf457551166ae610dc0))
- **admin:** ajout Key Number engagement missions a échéance ([#2936](https://github.com/betagouv/service-national-universel/issues/2936)) ([8d44826](https://github.com/betagouv/service-national-universel/commit/8d44826233d863cb7f5af6539dc97ddf5b1b46c8))
- **bdc:** Add site map ([#2950](https://github.com/betagouv/service-national-universel/issues/2950)) ([0095331](https://github.com/betagouv/service-national-universel/commit/0095331d0b8c24046142c5f1a7f4104c04d624cb))

# [1.330.0](https://github.com/betagouv/service-national-universel/compare/v1.329.0...v1.330.0) (2023-09-11)

### Bug Fixes

- **analytics:** rename equivalence mig route ([9d7a2dc](https://github.com/betagouv/service-national-universel/commit/9d7a2dc1d921650dd723daf062c5c40c2c13bcd1))
- **app:** fix classname in app ([20f83dd](https://github.com/betagouv/service-national-universel/commit/20f83dd81ef4d272b4aa4e11e54c35eb2f8f7a78))
- **app:** temporarily remove local storage maintenance override ([aaf3f52](https://github.com/betagouv/service-national-universel/commit/aaf3f525bce79659382a266608ca6315c10b5fae))
- upgrade @sentry/integrations from 7.61.0 to 7.64.0 ([#2943](https://github.com/betagouv/service-national-universel/issues/2943)) ([d42c879](https://github.com/betagouv/service-national-universel/commit/d42c87955e160b2371c3b410781e7959353f16eb))
- upgrade @sentry/nextjs from 7.61.0 to 7.64.0 ([#2945](https://github.com/betagouv/service-national-universel/issues/2945)) ([8664f61](https://github.com/betagouv/service-national-universel/commit/8664f611ad9ecea1bab1ed246c8f33ad83911dfe))

### Features

- **analytics:** creation missionEquivalence route & model ([85ada20](https://github.com/betagouv/service-national-universel/commit/85ada20fff269a9ee2e1840a8c6534f4b4d6bd83))

### Reverts

- Revert "feat(admin/api): change process for abandon application #2914" ([14b57a3](https://github.com/betagouv/service-national-universel/commit/14b57a3696f176072dd3b1adb1c63cadeaae84dd)), closes [#2914](https://github.com/betagouv/service-national-universel/issues/2914)
- Revert "chore(deps): update dependency @swc/core to v1.3.83 (#2706)" ([eb664b2](https://github.com/betagouv/service-national-universel/commit/eb664b2bc67a990a01a1e27db72d5149529ae3fd)), closes [#2706](https://github.com/betagouv/service-national-universel/issues/2706)
- Revert "chore(deps): update dependency tailwindcss to v3.3.3 (#2853)" ([d964ccd](https://github.com/betagouv/service-national-universel/commit/d964ccda7e8560d9837c185d7754b179c1e74b49)), closes [#2853](https://github.com/betagouv/service-national-universel/issues/2853)
- Revert "fix(deps): update dependency regenerator-runtime to v0.14.0 (#2021)" ([537b759](https://github.com/betagouv/service-national-universel/commit/537b75935049604b9d462227549d53b8e7ebc62b)), closes [#2021](https://github.com/betagouv/service-national-universel/issues/2021)

# [1.329.0](https://github.com/betagouv/service-national-universel/compare/v1.328.1...v1.329.0) (2023-09-07)

### Bug Fixes

- **app:** abandon mission validate phase 2 [#2951](https://github.com/betagouv/service-national-universel/issues/2951) ([3a49dbd](https://github.com/betagouv/service-national-universel/commit/3a49dbd559f7a23bbe7c1ab789d69949a88f8a85))

### Features

- **admin/api:** add total hit value for elasticSearch list ([#2948](https://github.com/betagouv/service-national-universel/issues/2948)) ([797b8c2](https://github.com/betagouv/service-national-universel/commit/797b8c22b68176a7d2ecc7bad9ae0b0901b7d1f9))
- **app, bdc:** Nouveau workflow contact support ([#2940](https://github.com/betagouv/service-national-universel/issues/2940)) ([d86d525](https://github.com/betagouv/service-national-universel/commit/d86d525c4f128ee0b89a69bb252b8a253aceb905))

## [1.328.1](https://github.com/betagouv/service-national-universel/compare/v1.328.0...v1.328.1) (2023-09-05)

### Bug Fixes

- **lib:** add missing dep number for saint-barthelemy ([51d918f](https://github.com/betagouv/service-national-universel/commit/51d918fd0eee7ce1f41814f3c3b9918faf2f80cc))

# [1.328.0](https://github.com/betagouv/service-national-universel/compare/v1.327.1...v1.328.0) (2023-09-04)

### Bug Fixes

- **admin:** drom date managment ([#2901](https://github.com/betagouv/service-national-universel/issues/2901)) ([743fe17](https://github.com/betagouv/service-national-universel/commit/743fe1702965e0e1300ef872b6925bc653e5ba17))
- **api:** add try catch ([97b5256](https://github.com/betagouv/service-national-universel/commit/97b525629eb21f3a742dc4aecbc701fd0c9bf69d))
- **api:** Force structureId and tutorId to be defined for missions ([bcb2d06](https://github.com/betagouv/service-national-universel/commit/bcb2d0656eb131fafd062673ecda811d56a016cd))
- **app:** fix role data in public contact form ([d72f80f](https://github.com/betagouv/service-national-universel/commit/d72f80f85118ad567b6bb543643e839b9ef08cda))

### Features

- **admin:** Add Key Number Sejour Pedago Project ([#2926](https://github.com/betagouv/service-national-universel/issues/2926)) ([3ae280d](https://github.com/betagouv/service-national-universel/commit/3ae280d8bc851f1e54b667e1b950ff4685dd2a73))
- **admin:** ajout Key Number engagement New Structure ([#2928](https://github.com/betagouv/service-national-universel/issues/2928)) ([c7d0ed6](https://github.com/betagouv/service-national-universel/commit/c7d0ed652db80993082c59a0831b36c8ad73f2df))
- **admin:** ajout Key Number engagement Notes internes Phase 2 ([#2929](https://github.com/betagouv/service-national-universel/issues/2929)) ([a17d3b0](https://github.com/betagouv/service-national-universel/commit/a17d3b0427e6456f9766c6abf3705e369776ab49))
- **admin:** ajout Key Number engagement Phase 2 Validated ([#2930](https://github.com/betagouv/service-national-universel/issues/2930)) ([883713d](https://github.com/betagouv/service-national-universel/commit/883713d9b304ca7dd750e29a4f2ee4a834edc151))
- **admin/api:** change process for abandon application [#2914](https://github.com/betagouv/service-national-universel/issues/2914) ([4b14bca](https://github.com/betagouv/service-national-universel/commit/4b14bca29b76a0256e2c6e6ccce56fc99b2891d5))

## [1.327.1](https://github.com/betagouv/service-national-universel/compare/v1.327.0...v1.327.1) (2023-09-01)

### Bug Fixes

- **api:** validate email during contract edition ([af0d52b](https://github.com/betagouv/service-national-universel/commit/af0d52bac4910dce59b80c9b74af825dec98a33f))

# [1.327.0](https://github.com/betagouv/service-national-universel/compare/v1.326.0...v1.327.0) (2023-08-31)

### Bug Fixes

- **admin:** dashboard horizontalbar with 0 objective ([#2920](https://github.com/betagouv/service-national-universel/issues/2920)) ([fcbab44](https://github.com/betagouv/service-national-universel/commit/fcbab44f8daa18e08d1ec7eaa8c7453fd26c3339))
- **admin:** new sidebar -> we forgot the objectives tab ! ([21d8222](https://github.com/betagouv/service-national-universel/commit/21d82221ff222385e8a3a84afc3616602f5107e6))

### Features

- **test:** creation unit test lignetopoint/pointderassemblement ([#2905](https://github.com/betagouv/service-national-universel/issues/2905)) ([9d04ee3](https://github.com/betagouv/service-national-universel/commit/9d04ee3561c692c56732239603602f306441a2bc))

# [1.326.0](https://github.com/betagouv/service-national-universel/compare/v1.325.0...v1.326.0) (2023-08-30)

### Bug Fixes

- **admin:** field with html for mission ([66936b4](https://github.com/betagouv/service-national-universel/commit/66936b49afd58ee5e7ad6d4a133755dd7365134d))
- **app:** load cohort on phase2 and phase3 pages as well ([40d1884](https://github.com/betagouv/service-national-universel/commit/40d1884e8548ae7389b37a2472b8fe8ee6d2d44d))
- **app:** typo error ([0d6d66c](https://github.com/betagouv/service-national-universel/commit/0d6d66c3e6b79673ef33859e00c5739583cbaecb))

### Features

- **api:** add 2fa redirection ([#2913](https://github.com/betagouv/service-national-universel/issues/2913)) ([6df1da3](https://github.com/betagouv/service-national-universel/commit/6df1da33db7398d922a7b165205fa388cf01bdaf))

# [1.325.0](https://github.com/betagouv/service-national-universel/compare/v1.324.0...v1.325.0) (2023-08-29)

### Bug Fixes

- **api/crons:** modif rattrapage logs manuel ([29e61f2](https://github.com/betagouv/service-national-universel/commit/29e61f2a5e0c30ddac88b6dadf9aff626e210758))
- **app:** contract with balise ([a7d4dd1](https://github.com/betagouv/service-national-universel/commit/a7d4dd1ba5a77f3ffb4d5190109812edada26d5a))
- **app:** fix contact form filename case ([7905f58](https://github.com/betagouv/service-national-universel/commit/7905f5802845057a6ad5e493f55e343b29de2266))

### Features

- **app:** Refonte du formulaire de contact ([#2907](https://github.com/betagouv/service-national-universel/issues/2907)) ([8f35ae3](https://github.com/betagouv/service-national-universel/commit/8f35ae39abbee322d748ed155d8125068fd7cba7))

# [1.324.0](https://github.com/betagouv/service-national-universel/compare/v1.323.2...v1.324.0) (2023-08-28)

### Bug Fixes

- **admin:** add transport tab for head Center ([94c56f7](https://github.com/betagouv/service-national-universel/commit/94c56f74724387a8ecc3384be2ed9262f850b3e2))
- **admin:** items order + content badge position ([eea2b18](https://github.com/betagouv/service-national-universel/commit/eea2b18958a03fc20f85fa641c68bd0608dfa65e))
- **admin:** navbar navigation ScrollOnTop ([290fe27](https://github.com/betagouv/service-national-universel/commit/290fe27563d4a72a2cf770d9d974f0c104196386))
- **admin:** simplify sidebar popover logic + fix closing problem ([3e43791](https://github.com/betagouv/service-national-universel/commit/3e437912dc84f0f5ab94e8e20bd7b2d23ec891a7))
- **api:** allow null value for expiration date ([8ff981a](https://github.com/betagouv/service-national-universel/commit/8ff981adb8b03bb9d13d7feb697f8bd4e2164984))

### Features

- **admin:** resize sidebar on breakpoint ([60b0767](https://github.com/betagouv/service-national-universel/commit/60b07675e717a1c0d260e291329e2d08b8a634f2))
- **admin:** review design sidebar ([280146e](https://github.com/betagouv/service-national-universel/commit/280146e86d4e84e47163ba6b076a4a6d87feb597))
- added a few insights to ease onboarding ([#2895](https://github.com/betagouv/service-national-universel/issues/2895)) ([c6b36e2](https://github.com/betagouv/service-national-universel/commit/c6b36e2f71302436fb47b24bc04cd280da150398))

## [1.323.2](https://github.com/betagouv/service-national-universel/compare/v1.323.1...v1.323.2) (2023-08-26)

### Bug Fixes

- **app:** fix header import in representants-legaux ([1f994a6](https://github.com/betagouv/service-national-universel/commit/1f994a6102ba309c9deaf1e6bd02295ba22157da))

## [1.323.1](https://github.com/betagouv/service-national-universel/compare/v1.323.0...v1.323.1) (2023-08-25)

### Bug Fixes

- **api:** disable 2fa for dev mode ([a4e3d08](https://github.com/betagouv/service-national-universel/commit/a4e3d08fcb867cb592076381a3a116c304f6d10e))

# [1.323.0](https://github.com/betagouv/service-national-universel/compare/v1.322.2...v1.323.0) (2023-08-24)

### Bug Fixes

- **admin:** admin can change mission startDate in the past ([a4f779b](https://github.com/betagouv/service-national-universel/commit/a4f779b2422b937e7dd1a9e98f8af0489f0e8bee))
- **admin:** drawer ([f6c9850](https://github.com/betagouv/service-national-universel/commit/f6c9850cab57fcf851fcc1ed2c20289b237e7ddd))
- **admin:** Use history ([7311a45](https://github.com/betagouv/service-national-universel/commit/7311a45b4de1ab693f53c471a42ba631829a92e9))
- **app:** Better handling for fetchError ([895a109](https://github.com/betagouv/service-national-universel/commit/895a109ded180fbe61e63e8e3770da920f3d058b))
- **app:** Put abort controller on fetch ([ba6294e](https://github.com/betagouv/service-national-universel/commit/ba6294eff8efa54ae938ad253d830c50f4f7e833))
- **app:** Use native abortController ([411e02b](https://github.com/betagouv/service-national-universel/commit/411e02b867dc728f28eec92e6140ea93a710f719))

### Features

- **admin:** new sidebar staging ([#2898](https://github.com/betagouv/service-national-universel/issues/2898)) ([b481f6e](https://github.com/betagouv/service-national-universel/commit/b481f6ef08ab0bf0dd5c22d13070bbba8795e462))
- **admin/app:** Delete id for rgpd ([#2790](https://github.com/betagouv/service-national-universel/issues/2790)) ([6160509](https://github.com/betagouv/service-national-universel/commit/6160509c870a0bbf329399b2cfa85212905f8594))

### Reverts

- Revert "Feat/email validation (#2885)" ([0b60c01](https://github.com/betagouv/service-national-universel/commit/0b60c01ae5a7cf33661c480c14a597ea911601b5)), closes [#2885](https://github.com/betagouv/service-national-universel/issues/2885)

## [1.322.2](https://github.com/betagouv/service-national-universel/compare/v1.322.1...v1.322.2) (2023-08-22)

### Bug Fixes

- **app:** fix mission filters modal on mobile ([7287bbb](https://github.com/betagouv/service-national-universel/commit/7287bbbc477c611db0c66c73ee3e81d63da2a259))

## [1.322.1](https://github.com/betagouv/service-national-universel/compare/v1.322.0...v1.322.1) (2023-08-21)

### Bug Fixes

- **admin/app:** Fix redirect when id null ([#2891](https://github.com/betagouv/service-national-universel/issues/2891)) ([5e936cb](https://github.com/betagouv/service-national-universel/commit/5e936cbda96ef0ff4f87ffe51fc64cebe0de8578))
- **all:** Sentry infinite loop for capture ([7704ddb](https://github.com/betagouv/service-national-universel/commit/7704ddb9e557f6f3728e1fa3e9c257770973e6ec))
- **api:** fix joi validation in doc correction route ([2b4e5c6](https://github.com/betagouv/service-national-universel/commit/2b4e5c6d40af6054808213c476c09df381382037))

# [1.322.0](https://github.com/betagouv/service-national-universel/compare/v1.321.0...v1.322.0) (2023-08-18)

### Bug Fixes

- **api:** fix mission sorting order options ([260ff70](https://github.com/betagouv/service-national-universel/commit/260ff7077e468c23643b8f2b57ca03bd78e9aef2))
- **api:** fix params in /exist toute ([3689a98](https://github.com/betagouv/service-national-universel/commit/3689a981e4e5c94780511c395b6f9333a884718b))
- **api:** rate limiter sendinblue syncErrors ([#2856](https://github.com/betagouv/service-national-universel/issues/2856)) ([6b2fb45](https://github.com/betagouv/service-national-universel/commit/6b2fb45766bf9b20560779d295bc608bde2230d3))
- **appi, admin:** fix /referent/exist route ([#2888](https://github.com/betagouv/service-national-universel/issues/2888)) ([e3d97b5](https://github.com/betagouv/service-national-universel/commit/e3d97b563230daa5820d00b7b4f9f22ed8786d42))
- **lib:** ajouter les noms des ministres ([c27b821](https://github.com/betagouv/service-national-universel/commit/c27b8212edd23ccfe47336de3fa478eeb22fd800))

### Features

- **admin:** paramétrage de l'alerte du tableau de bord ([#2842](https://github.com/betagouv/service-national-universel/issues/2842)) ([1ff3e44](https://github.com/betagouv/service-national-universel/commit/1ff3e44472bfd849468bd21fb584d304c2a9a3fa))

# [1.321.0](https://github.com/betagouv/service-national-universel/compare/v1.320.5...v1.321.0) (2023-08-17)

### Bug Fixes

- **analytics:** bug packages ([84f551b](https://github.com/betagouv/service-national-universel/commit/84f551bd0b5235f5ccd9365c5f6db69f8934319e))
- **analytics:** cron jdma slack msg ([#2882](https://github.com/betagouv/service-national-universel/issues/2882)) ([74e435d](https://github.com/betagouv/service-national-universel/commit/74e435d64bfcb07ed9571df0381fefa9e1219a97))
- **bdc:** change breadcrumb color on thematique page ([#2884](https://github.com/betagouv/service-national-universel/issues/2884)) ([347ce64](https://github.com/betagouv/service-national-universel/commit/347ce64f9f547322a117017b7e42c2689dfe8f33))

### Features

- **admin:** Simplifier le systeme de pagination [#2880](https://github.com/betagouv/service-national-universel/issues/2880) ([dd0e7b6](https://github.com/betagouv/service-national-universel/commit/dd0e7b6502a08edb42042bddee83955be6ae5834))

## [1.320.5](https://github.com/betagouv/service-national-universel/compare/v1.320.4...v1.320.5) (2023-08-16)

### Bug Fixes

- **admin/api:** update export image-right ([#2881](https://github.com/betagouv/service-national-universel/issues/2881)) ([f2b9caa](https://github.com/betagouv/service-national-universel/commit/f2b9caaaa2fff544e6dad6f755987ea4ea84be7e))

## [1.320.4](https://github.com/betagouv/service-national-universel/compare/v1.320.3...v1.320.4) (2023-08-15)

### Bug Fixes

- **api:** fix session index for key numbers ([3787d04](https://github.com/betagouv/service-national-universel/commit/3787d04c8ab82feece98f5e8f36f0d5b97e42a51))
- **app, api:** fix military preparation search ([a80c0f1](https://github.com/betagouv/service-national-universel/commit/a80c0f1d522405e05420d31dd296e2843994472f))

## [1.320.3](https://github.com/betagouv/service-national-universel/compare/v1.320.2...v1.320.3) (2023-08-11)

### Bug Fixes

- **app/admin/lib:** audit injection xss ([#2855](https://github.com/betagouv/service-national-universel/issues/2855)) ([e9d67c5](https://github.com/betagouv/service-national-universel/commit/e9d67c565b86a0cc6ba8c17ce90cd34411676586))

## [1.320.2](https://github.com/betagouv/service-national-universel/compare/v1.320.1...v1.320.2) (2023-08-10)

### Bug Fixes

- **app:** do not init sentry on local ([ea21ab5](https://github.com/betagouv/service-national-universel/commit/ea21ab5889978af831f90cd937261b5ae9639cf5))
- **app:** remove useless esQuery service ([0abc9a6](https://github.com/betagouv/service-national-universel/commit/0abc9a6eb61977b07ecd09f40df6798aca60d62c))

## [1.320.1](https://github.com/betagouv/service-national-universel/compare/v1.320.0...v1.320.1) (2023-08-09)

### Bug Fixes

- **admin, api:** tickets count ([#2865](https://github.com/betagouv/service-national-universel/issues/2865)) ([3305ac2](https://github.com/betagouv/service-national-universel/commit/3305ac25cc68c860716d7545a74fc05aef899039))
- **admin/api:** es count by status ([#2867](https://github.com/betagouv/service-national-universel/issues/2867)) ([ff4020f](https://github.com/betagouv/service-national-universel/commit/ff4020f1e10aec2695b381c8cf2e0528bed5a1d4))

# [1.320.0](https://github.com/betagouv/service-national-universel/compare/v1.319.0...v1.320.0) (2023-08-08)

### Features

- **lib:** update school level and inscriptionEndDate ([#2861](https://github.com/betagouv/service-national-universel/issues/2861)) ([2c51b7c](https://github.com/betagouv/service-national-universel/commit/2c51b7c238107a45e15a932e2b880affde24b6f1))

# [1.319.0](https://github.com/betagouv/service-national-universel/compare/v1.318.2...v1.319.0) (2023-08-07)

### Features

- **admin:** Tableau de bord : Chiffres clé - Séjour ([#2837](https://github.com/betagouv/service-national-universel/issues/2837)) ([3a3385e](https://github.com/betagouv/service-national-universel/commit/3a3385e43e335aff0f936a180d1117b1a454ca57))

## [1.318.2](https://github.com/betagouv/service-national-universel/compare/v1.318.1...v1.318.2) (2023-08-04)

### Bug Fixes

- **api:** Update getDistance to be more precise ([#2854](https://github.com/betagouv/service-national-universel/issues/2854)) ([e306e4f](https://github.com/betagouv/service-national-universel/commit/e306e4fd286c4ff130843c64c2bf05600bb5a6d2))

## [1.318.1](https://github.com/betagouv/service-national-universel/compare/v1.318.0...v1.318.1) (2023-08-03)

### Bug Fixes

- **app:** Good name ([298de9a](https://github.com/betagouv/service-national-universel/commit/298de9ab9a0fa06665dc31dff384e929c577bee2))
- **app:** parametrage dates ouverture inscription octobre ([2312899](https://github.com/betagouv/service-national-universel/commit/231289938d0c2cf5f3fc70e6a46fc3591f738fa8))
- **github:** Fix for eslint ([c8f9ad2](https://github.com/betagouv/service-national-universel/commit/c8f9ad29f77ba7adaa179302cff3517bcad88b6c))
- **kb:** Error with slate ([98d72c1](https://github.com/betagouv/service-national-universel/commit/98d72c185d2fedd0820148e438f263ffa859ab70))
- **kb:** Eslint react hooks ([d535828](https://github.com/betagouv/service-national-universel/commit/d535828d5619dccc45d520608d68172ca46cfadc))
- **kb:** Fix slate error ([4050050](https://github.com/betagouv/service-national-universel/commit/40500506fdc41cac7a7e6a16c2cc7d02d23f6436))

### Reverts

- **kb:** Go back to next 13.0.2 ([ea1411f](https://github.com/betagouv/service-national-universel/commit/ea1411f04a23bbe0900b0262cfb9099ed51b3793))
- **kb:** Put old version of slate ([cf13e93](https://github.com/betagouv/service-national-universel/commit/cf13e93f37cbb9ebab89ad5b45510da0bf981c5e))

# [1.318.0](https://github.com/betagouv/service-national-universel/compare/v1.317.2...v1.318.0) (2023-08-02)

### Bug Fixes

- **api:** Correct bug on schoolRAMSES ([acc37e9](https://github.com/betagouv/service-national-universel/commit/acc37e9e2ffd92aad3f4404016b6859473b9005b))
- **lib:** Eslint errors on lib ([c3cfb67](https://github.com/betagouv/service-national-universel/commit/c3cfb676d511eccae6da67d3c8974d03f082831c))

### Features

- **all:** Test code on ([8fc3ab1](https://github.com/betagouv/service-national-universel/commit/8fc3ab106a52e3c74b3cc5ab359a50ced82acc06))
- **github:** Check for deadcode ([0ba5915](https://github.com/betagouv/service-national-universel/commit/0ba5915703ad8ce9097508ccb78fead07d0fa7fd))
- **github:** Run lint of app and admin in PR ([bcceb85](https://github.com/betagouv/service-national-universel/commit/bcceb8594f07664dc371e6aea33299151e9dffac))

## [1.317.2](https://github.com/betagouv/service-national-universel/compare/v1.317.1...v1.317.2) (2023-07-31)

### Bug Fixes

- **api:** dont take transport into account for dsnj export ([1f41432](https://github.com/betagouv/service-national-universel/commit/1f41432c1de71a42c20679817d97cfcc1e904f6b))

## [1.317.1](https://github.com/betagouv/service-national-universel/compare/v1.317.0...v1.317.1) (2023-07-29)

### Bug Fixes

- **app:** kb url on local and staging ([df50277](https://github.com/betagouv/service-national-universel/commit/df502774a784fb668c968ab6cc372afdbe8c26a7))

# [1.317.0](https://github.com/betagouv/service-national-universel/compare/v1.316.1...v1.317.0) (2023-07-26)

### Features

- **api/admin:** pouvoir selectionner le nombre d'éléments par page dans les listes ([#2828](https://github.com/betagouv/service-national-universel/issues/2828)) ([bcf20fc](https://github.com/betagouv/service-national-universel/commit/bcf20fc9bda0ce9974e48cfe300b6bcb0a9fdfef))
- **lib/app:** add 2ndePro to cohort in october ([b309a98](https://github.com/betagouv/service-national-universel/commit/b309a98e44d38efd429ab3796a672cfa4f8d4c55))

## [1.316.1](https://github.com/betagouv/service-national-universel/compare/v1.316.0...v1.316.1) (2023-07-25)

### Bug Fixes

- **lib:** fix display of tickets count ([ef1f60c](https://github.com/betagouv/service-national-universel/commit/ef1f60c5f6436abf929a4ed4197b25fcf9258a3c))

# [1.316.0](https://github.com/betagouv/service-national-universel/compare/v1.315.0...v1.316.0) (2023-07-24)

### Bug Fixes

- **api:** bug cookie duration ([#2830](https://github.com/betagouv/service-national-universel/issues/2830)) ([392547a](https://github.com/betagouv/service-national-universel/commit/392547a886ff2b5bcfb6d825ca2b7de2dab392a6))

### Features

- **admin/api:** permettre au chefs de centre d'importer le projet pédagogique de chaque session ([#2821](https://github.com/betagouv/service-national-universel/issues/2821)) ([4ed77dd](https://github.com/betagouv/service-national-universel/commit/4ed77dda7876def79e08af21efcaa215161acce5))
- **app:** modif question form + modale bdc ([#2829](https://github.com/betagouv/service-national-universel/issues/2829)) ([866dac8](https://github.com/betagouv/service-national-universel/commit/866dac87f5e2c02f1a9b76c6762f3078e9856239))

# [1.315.0](https://github.com/betagouv/service-national-universel/compare/v1.314.0...v1.315.0) (2023-07-20)

### Bug Fixes

- **Admin:** update manual inscription -> young start with the status: "WAITING_VALIDATION" ([#2824](https://github.com/betagouv/service-national-universel/issues/2824)) ([e6bf6cb](https://github.com/betagouv/service-national-universel/commit/e6bf6cb709dd782c88160648858aaa0cc082b9c6))
- **app:** reduce spacing to make both button visible on signin desktop page ([f893b01](https://github.com/betagouv/service-national-universel/commit/f893b0165f958b2fd3325d2bed4746db73b78043))
- **app:** typo ([a68b638](https://github.com/betagouv/service-national-universel/commit/a68b638362573123400cfbe67efb894e4f6920b3))

### Features

- **app:** add bouton to inscription on auth page ([0d58ecc](https://github.com/betagouv/service-national-universel/commit/0d58eccefe27d96fb198f7ab89705493725df812))
- **app:** open inscription on production ([ab8dfdf](https://github.com/betagouv/service-national-universel/commit/ab8dfdf1992f15e3086f2f76c63d5ae61f75a000))
- **app/admin:** Cookie based connection ([#2819](https://github.com/betagouv/service-national-universel/issues/2819)) ([702708e](https://github.com/betagouv/service-national-universel/commit/702708e4e924dece2f607c2bfed42a9891a56f7a))

# [1.314.0](https://github.com/betagouv/service-national-universel/compare/v1.313.0...v1.314.0) (2023-07-19)

### Bug Fixes

- **analytics:** ESLINT on analytics ([7f2f328](https://github.com/betagouv/service-national-universel/commit/7f2f328032e13fc2b27517791941a50dcace588a))
- **app:** empty school object if toggle isAbroad ([28e06db](https://github.com/betagouv/service-national-universel/commit/28e06dbd03f1905ac4fb8b7d192d5b5dcccb03d7))
- **app, admin:** Vite : force dependency pre-bundling ([ee54338](https://github.com/betagouv/service-national-universel/commit/ee54338400db3a111027e974e3178c8bd3ed27bc))
- **lib:** eligibilit date ([a56ff5b](https://github.com/betagouv/service-national-universel/commit/a56ff5baa5a4a0fe6c4018f893150a1ca9b9e1db))

### Features

- **analytics:** cron jdma ([#2807](https://github.com/betagouv/service-national-universel/issues/2807)) ([d9e9e05](https://github.com/betagouv/service-national-universel/commit/d9e9e05f46cc90292297ff9cde0f00e6266442a8))
- **analytics:** Feat cron jdma v2 ([#2822](https://github.com/betagouv/service-national-universel/issues/2822)) ([1e12f8b](https://github.com/betagouv/service-national-universel/commit/1e12f8b7d3ec172a15e2029fbefb9ff525e4e113))
- **api:** Short code 2fa ([#2815](https://github.com/betagouv/service-national-universel/issues/2815)) ([cb71652](https://github.com/betagouv/service-national-universel/commit/cb716523b18632f6e61faefcb018804dd1ee4500))
- **app:** Préinscription : message de non éligibilité dynamique ([#2817](https://github.com/betagouv/service-national-universel/issues/2817)) ([ad44f35](https://github.com/betagouv/service-national-universel/commit/ad44f357bcb60b5b3a77c100cd1e84ee37a26ea0))
- **app/admin/lib:** official dates for october ([#2823](https://github.com/betagouv/service-national-universel/issues/2823)) ([ca70f2b](https://github.com/betagouv/service-national-universel/commit/ca70f2b9e5880e37d2ce249800d911bce9b20dfe))

# [1.313.0](https://github.com/betagouv/service-national-universel/compare/v1.312.0...v1.313.0) (2023-07-18)

### Bug Fixes

- **app:** Coquille dans le front ([#2811](https://github.com/betagouv/service-national-universel/issues/2811)) ([84c6029](https://github.com/betagouv/service-national-universel/commit/84c60292b404cbb999317e47b636fe03df008d30))
- **app, api:** Réparer l'inscription ([#2808](https://github.com/betagouv/service-national-universel/issues/2808)) ([72339fb](https://github.com/betagouv/service-national-universel/commit/72339fb846bfa85b22d5d64f5e95161390eadb6d))

### Features

- **BDF front:** Modification de la page article ([#2809](https://github.com/betagouv/service-national-universel/issues/2809)) ([6048185](https://github.com/betagouv/service-national-universel/commit/6048185c6f16e6a9adc95d7fa4a81733cb8990b5))

# [1.312.0](https://github.com/betagouv/service-national-universel/compare/v1.311.0...v1.312.0) (2023-07-17)

### Bug Fixes

- **app:** move non eligible page from space ([462e1da](https://github.com/betagouv/service-national-universel/commit/462e1daf10f665c672df91dbc58472d9c7e5aeed))
- **app:** not eligible blank page ([30289c9](https://github.com/betagouv/service-national-universel/commit/30289c93adbc61c267a3fc4ae88f5793a9450779))
- **kb:** home prod ([00670e0](https://github.com/betagouv/service-national-universel/commit/00670e08f016f3e8784a4f10340e60232a203b3f))

### Features

- **kb:** New breadcrumbs (staging only) ([#2805](https://github.com/betagouv/service-national-universel/issues/2805)) ([97f8b3d](https://github.com/betagouv/service-national-universel/commit/97f8b3dd64c0c9da8a30bb48b882298bca658dff))
- **kb:** New breadcrumbs and section title (staging only) ([#2804](https://github.com/betagouv/service-national-universel/issues/2804)) ([f26f3a2](https://github.com/betagouv/service-national-universel/commit/f26f3a2c63c98554c1c6ea69aa1cf6c1a9bcbc73))

# [1.311.0](https://github.com/betagouv/service-national-universel/compare/v1.310.0...v1.311.0) (2023-07-15)

### Features

- **app:** Add sentry replays ([8114112](https://github.com/betagouv/service-national-universel/commit/8114112844c8737f2d37fcfcafde5346b90e695c))

# [1.310.0](https://github.com/betagouv/service-national-universel/compare/v1.309.1...v1.310.0) (2023-07-14)

### Bug Fixes

- **app:** Bug Sentry ([d66ce6e](https://github.com/betagouv/service-national-universel/commit/d66ce6eabcdce24d1f079a9ff7a665c29a519bf8))
- **app:** Fic bug on upload files while doing tickets ([4410be7](https://github.com/betagouv/service-national-universel/commit/4410be770640dfaeb86f3cdaa30f317219793d1c))

### Features

- **all:** Put 403 back (Baleen fixed it) ([1d33d55](https://github.com/betagouv/service-national-universel/commit/1d33d55f811733e3a977997b401e94af0a63b108))

## [1.309.1](https://github.com/betagouv/service-national-universel/compare/v1.309.0...v1.309.1) (2023-07-13)

### Bug Fixes

- **api:** validation date ([832858f](https://github.com/betagouv/service-national-universel/commit/832858f3a7cc879ceabaa041f6e6e0b1f1d6d663))
- **api:** validation errors due to timezone ([6b9d50b](https://github.com/betagouv/service-national-universel/commit/6b9d50b4173195aeacc382a720a744aded9c29a6))

# [1.309.0](https://github.com/betagouv/service-national-universel/compare/v1.308.1...v1.309.0) (2023-07-12)

### Bug Fixes

- **api:** add departureDate for Drom-Tom young ([#2800](https://github.com/betagouv/service-national-universel/issues/2800)) ([950de07](https://github.com/betagouv/service-national-universel/commit/950de07582f211516157eb0723f9d3125ba86f5e))
- **api:** dsnj departure date ([b3c4330](https://github.com/betagouv/service-national-universel/commit/b3c4330966a8ec2d3b3e73cbc8b6c4eb3ff853f0))
- **kb:** add heroicons import ([fa92446](https://github.com/betagouv/service-national-universel/commit/fa924463817681edc3e24a7de723aa229818a959))
- **kb:** explicitly pass open prop to transition ([d79711c](https://github.com/betagouv/service-national-universel/commit/d79711c3483f5dcb7af297c33234ff787134fcc5))
- **kb:** give default value to transition open prop ([234d058](https://github.com/betagouv/service-national-universel/commit/234d058e24243e68771c02ee5cacfb65d721705f))
- **kb:** old search bar in prod ([0542eaf](https://github.com/betagouv/service-national-universel/commit/0542eaf7e0ac0991e870ffc985ed91219629bb75))
- **kb:** temporarily disable transition on search bar ([f215a04](https://github.com/betagouv/service-national-universel/commit/f215a041e3ee7f896822b28ba6fcb8cd485b85c8))
- **lib:** redirection ouverte better logic ([#2801](https://github.com/betagouv/service-national-universel/issues/2801)) ([d241492](https://github.com/betagouv/service-national-universel/commit/d2414920feac8e87ebf9ff952250c2b5d198fc78))

### Features

- **kb:** New search bar (staging only) ([#2793](https://github.com/betagouv/service-national-universel/issues/2793)) ([b9b9ac2](https://github.com/betagouv/service-national-universel/commit/b9b9ac2e687a286fe7864585038c3ceac1695077))

## [1.308.1](https://github.com/betagouv/service-national-universel/compare/v1.308.0...v1.308.1) (2023-07-11)

### Bug Fixes

- **admin/app:** bug spam error sentry ([6ff24b9](https://github.com/betagouv/service-national-universel/commit/6ff24b9e4ff931d2549e5cc8b5182da44027e930))
- **app, admin:** vite - pre-bundle sentry + lib ([c287ad3](https://github.com/betagouv/service-national-universel/commit/c287ad33d05bf2f2dbb232429cb423d5898f1511))
- add --force argument to vite command ([f63b5b8](https://github.com/betagouv/service-national-universel/commit/f63b5b815ad14fabb68228677038eb173b772fe4))
- **admin:** Mettre à jour les dates de séjour pour les attestation Phase1 de Juillet ([#2789](https://github.com/betagouv/service-national-universel/issues/2789)) ([5c3330a](https://github.com/betagouv/service-national-universel/commit/5c3330aefdaa4a0a372b82f87f40e0a41c7c0ac8))

# [1.308.0](https://github.com/betagouv/service-national-universel/compare/v1.307.1...v1.308.0) (2023-07-10)

### Bug Fixes

- **admin:** dynamic settings ([5b1a9f9](https://github.com/betagouv/service-national-universel/commit/5b1a9f991f13a820fb17d312c77d2700c5361e12))
- **admin, app, kb:** File upload: improve file renaming before calling api ([#2726](https://github.com/betagouv/service-national-universel/issues/2726)) ([8174b6d](https://github.com/betagouv/service-national-universel/commit/8174b6df315472a819853a8a19fe81941a53694b))
- **admin/app:** correct file upload method name ([3881756](https://github.com/betagouv/service-national-universel/commit/3881756668389e64d91c633712f8a68faec29b03))
- **api:** add deleted to cni category enum ([7e71f34](https://github.com/betagouv/service-national-universel/commit/7e71f34d196f820b07c0f232097ecc32ea514c3a))
- **api:** time-schedule accept xls ([d090b24](https://github.com/betagouv/service-national-universel/commit/d090b247cfac17a96c0947fca19e5833ab5171d9))
- **app, admin:** correct CNI path ([b586ec6](https://github.com/betagouv/service-national-universel/commit/b586ec676b8fbe9a0d8cd82b9da14ab57f114c41))
- **kb:** add react-icons ([2203efc](https://github.com/betagouv/service-national-universel/commit/2203efc1b0a76d91d5ad219753003fe9dd1c6f8b))
- **kb:** correctly import upload file function ([96989b9](https://github.com/betagouv/service-national-universel/commit/96989b939a707053b0289a0d833f8c731aace65c))
- **kb:** import snu-lib ([ac85758](https://github.com/betagouv/service-national-universel/commit/ac85758e0122c142fec0b222ada471ebe098b227))
- **kb:** remove lib import ([25e64b8](https://github.com/betagouv/service-national-universel/commit/25e64b85030d2dc02e415fd425dbb2fc3e597bea))
- **kb:** temporarily disable linting on build ([faadcb9](https://github.com/betagouv/service-national-universel/commit/faadcb9b2f0cc7e21b9916baa7aeb18fa3853d85))

### Features

- **kb:** new design for homepage ([#2784](https://github.com/betagouv/service-national-universel/issues/2784)) ([5840839](https://github.com/betagouv/service-national-universel/commit/5840839c9348edd1126c2644965e38a2a0337af0))
- **kb:** New header design (staging only) ([#2783](https://github.com/betagouv/service-national-universel/issues/2783)) ([8130f91](https://github.com/betagouv/service-national-universel/commit/8130f910dfa8e5fff10b301fc1280c44ee925372))

### Reverts

- Revert "chore: add kb to turbo repo" ([0873393](https://github.com/betagouv/service-national-universel/commit/0873393ee17d5af3a88d91d839eb5a2b14a18f98))
- Revert "fix(app/admin): redirection-ouverte (#2792)" ([25c7d3d](https://github.com/betagouv/service-national-universel/commit/25c7d3ddc5a04bc86fa89d49ee87cda3e695064c)), closes [#2792](https://github.com/betagouv/service-national-universel/issues/2792)

## [1.307.1](https://github.com/betagouv/service-national-universel/compare/v1.307.0...v1.307.1) (2023-07-06)

### Bug Fixes

- **admin:** index on cohort to find if a cohort has a bus more quickly ([cb90d20](https://github.com/betagouv/service-national-universel/commit/cb90d2088748f72daa27037ccb6b59b309db4457))
- **admin:** open dl convocation to everyone with an acces phase1 ([19d0d1e](https://github.com/betagouv/service-national-universel/commit/19d0d1e1de20e64986d7d1cb145c5a82a6db624f))
- **app:** info convocation on phase1 not done page ([399b3ce](https://github.com/betagouv/service-national-universel/commit/399b3ceba8fe28294f4bba04d6f47c9eb0ea1c36))
- **app:** retour information on done page ([c0f48b6](https://github.com/betagouv/service-national-universel/commit/c0f48b63297fab1ed1efb924c0828f6cced7ddb0))

# [1.307.0](https://github.com/betagouv/service-national-universel/compare/v1.306.0...v1.307.0) (2023-07-05)

### Bug Fixes

- **admin:** call with sessionId undefined ([f526eda](https://github.com/betagouv/service-national-universel/commit/f526eda62142162e9adfb7135ec4744d3034272e))
- **api:** Retourner le même code d'erreur en cas de mail trouvé ou non ([6d10fa7](https://github.com/betagouv/service-national-universel/commit/6d10fa77ef3e97789fa568423db87b0e8e80301d))
- **app:** Fix for old cohort ([#2786](https://github.com/betagouv/service-national-universel/issues/2786)) ([bc32c57](https://github.com/betagouv/service-national-universel/commit/bc32c5752abc544b00e70cb2786b7835e090cdc0))
- **app:** fix bug on old cohort screen ([#2788](https://github.com/betagouv/service-national-universel/issues/2788)) ([1f551d1](https://github.com/betagouv/service-national-universel/commit/1f551d13fd4660c266b63c1b927fdad634d34f2d))

### Features

- **admin:** optimize loading time view bus ([6b7d2ee](https://github.com/betagouv/service-national-universel/commit/6b7d2ee2bfdbce5d9710cf17c807dfe6b7036e19))
- **app:** update young screen for JDM/JDC ([#2780](https://github.com/betagouv/service-national-universel/issues/2780)) ([7380c78](https://github.com/betagouv/service-national-universel/commit/7380c781f40f9f8c06ae88a5d8bee186e332af1a))

### Reverts

- Revert "Fix(admin): Redonner les droits au refDep de modifier d'autre refDep de leur departement (#2782)" (#2787) ([0dae0ba](https://github.com/betagouv/service-national-universel/commit/0dae0ba26340c6340df96e022aa219256fd87468)), closes [#2782](https://github.com/betagouv/service-national-universel/issues/2782) [#2787](https://github.com/betagouv/service-national-universel/issues/2787)

# [1.306.0](https://github.com/betagouv/service-national-universel/compare/v1.305.0...v1.306.0) (2023-07-04)

### Bug Fixes

- **admin:** firstSession ([35d0bf2](https://github.com/betagouv/service-national-universel/commit/35d0bf26e916c7d5914a142ec6cd744c284b9d1f))
- **admin:** Fix onClose ([34ebe22](https://github.com/betagouv/service-national-universel/commit/34ebe22b346a1e16df1ad62c49ee3cf26da47af8))
- **api:** 2fa ([f2bab4a](https://github.com/betagouv/service-national-universel/commit/f2bab4a7522e521764a8c84d5c6117575afec96a))
- **api:** dsnj export start date ([3467f57](https://github.com/betagouv/service-national-universel/commit/3467f57327d639a114b25e835001db52fcc10f16))

### Features

- **admin:** modification des motifs de départ de séjour ([#2781](https://github.com/betagouv/service-national-universel/issues/2781)) ([9f62def](https://github.com/betagouv/service-national-universel/commit/9f62def441ef0d6e69b9a2ca824982fe2b7b8e8b))
- **admin:** pointage des jeunes : renseigner un départ Anticipé [#2778](https://github.com/betagouv/service-national-universel/issues/2778) ([d2edb02](https://github.com/betagouv/service-national-universel/commit/d2edb020e3e9d55533c5091a8c21d32e8ba3baab))
- **app:** mep update address ([9035c1d](https://github.com/betagouv/service-national-universel/commit/9035c1daee28cc8b8607bd1c121c1ffc24cd4fa5))

# [1.305.0](https://github.com/betagouv/service-national-universel/compare/v1.304.0...v1.305.0) (2023-07-03)

### Bug Fixes

- pdt 0307 ([#2777](https://github.com/betagouv/service-national-universel/issues/2777)) ([eea46cf](https://github.com/betagouv/service-national-universel/commit/eea46cfa0e5cbaf898b8adad5ed54c7a66dfc883))
- **admin:** send convocation by email ([4bf957f](https://github.com/betagouv/service-national-universel/commit/4bf957f4da80130a46e67fb296d63bffe5c09024))
- **admin/app:** error on logout ([5695b92](https://github.com/betagouv/service-national-universel/commit/5695b9286348f823647dfc0d6aebee538f77309b))

### Features

- **admin:** add modal to change PDR in the same line ([#2775](https://github.com/betagouv/service-national-universel/issues/2775)) ([d266f0b](https://github.com/betagouv/service-national-universel/commit/d266f0b554388ab71b272b53ebc2791c24a2a495))

# [1.304.0](https://github.com/betagouv/service-national-universel/compare/v1.303.0...v1.304.0) (2023-06-30)

### Bug Fixes

- **admin:** download convocation ([3693768](https://github.com/betagouv/service-national-universel/commit/36937686d637070614c7da0188ad68738b215c8e))
- **admin:** export convoyeur ([731c1f0](https://github.com/betagouv/service-national-universel/commit/731c1f04a02df999ad0143459465e73fc8c6ca2e))
- **admin:** fix du bouton "Ajouter un encadrant" ([dc2426b](https://github.com/betagouv/service-national-universel/commit/dc2426b1c1eaa48579de488c292f3c80c531a57b))
- **admin:** nission equivalence frequency field name ([2bc0630](https://github.com/betagouv/service-national-universel/commit/2bc06301c7b96c7f9f5b7121ae3e0504aaa86a1f))
- **api:** session date in dsnj export ([9f7b527](https://github.com/betagouv/service-national-universel/commit/9f7b5277bad43f46705e463212db3389a6a8f5df))
- quick win - retour gab 3006 ([#2770](https://github.com/betagouv/service-national-universel/issues/2770)) ([2199fcf](https://github.com/betagouv/service-national-universel/commit/2199fcf5d8b6e2905f6b2a9264892a0d05a06acb))
- **api:** add noCursorTimeout flag to missionOutdated cron ([3d1fa89](https://github.com/betagouv/service-national-universel/commit/3d1fa89e45a2ed785a6ae20a1a78d564cb00621f))

### Features

- **app:** besoin d'aide modal + new questions([#2772](https://github.com/betagouv/service-national-universel/issues/2772)) ([00a16ba](https://github.com/betagouv/service-national-universel/commit/00a16bae713e3dcb7a8f4a1f77e15b5123a911d1))

### Reverts

- Revert "fix(api): Send 401 if signin_token not valid" ([e1bca7a](https://github.com/betagouv/service-national-universel/commit/e1bca7a01e20e610018fb52b08f6cdc75c903b57))

# [1.303.0](https://github.com/betagouv/service-national-universel/compare/v1.302.0...v1.303.0) (2023-06-29)

### Bug Fixes

- **admin:** update convocation file name ([b122bfd](https://github.com/betagouv/service-national-universel/commit/b122bfd1d72d98879ed530f1a847049ccfb2f0e7))
- **admin:** update convocation file name ([b71b1cc](https://github.com/betagouv/service-national-universel/commit/b71b1cce9880d485a20deb06e3afe0a705639abf))
- **admin/app:** wording error on invalid 2fa token ([6f86201](https://github.com/betagouv/service-national-universel/commit/6f862017ce9e1bb36bb17ab837f553e9bf3aeaf5))
- **api:** Conflit 2fa token ([84541e3](https://github.com/betagouv/service-national-universel/commit/84541e39ecd9f13e7b5b22820981a10762dffbef))
- **api:** convocation visual fix ([37f6dac](https://github.com/betagouv/service-national-universel/commit/37f6dac0ebf1afaee714c0fbc8db52f25637dbe5))
- **api:** fix test cohort in staging ([50331f3](https://github.com/betagouv/service-national-universel/commit/50331f3bcd94b8ba67496c74bd4fd995a4e69bc3))
- **api:** Send 401 if signin_token not valid ([ac65e56](https://github.com/betagouv/service-national-universel/commit/ac65e56780217bac8dfee7271a48bcc609ad3b75))
- **api:** update places bus ans session on WITHDRAWN ([#2765](https://github.com/betagouv/service-national-universel/issues/2765)) ([96c936c](https://github.com/betagouv/service-national-universel/commit/96c936cb077a22a0a44054a9bd9a1fb42c33ad42))
- **app, admin, api:** Correctly format support messages ([94478b3](https://github.com/betagouv/service-national-universel/commit/94478b306a53313761f9d3ac21670e5f988663ec))

### Features

- **admin/api:** optimize young list ([#2763](https://github.com/betagouv/service-national-universel/issues/2763)) ([978624a](https://github.com/betagouv/service-national-universel/commit/978624a325097f1b434afff4fd03504597a767d1))
- **api:** dsnj export fixes and local script ([daf3d54](https://github.com/betagouv/service-national-universel/commit/daf3d54f84f3fabf79416c566933393089272c0e))
- plan de transport wip 2906 ([#2764](https://github.com/betagouv/service-national-universel/issues/2764)) ([57cf827](https://github.com/betagouv/service-national-universel/commit/57cf82731572b83fdbb376f631f7cf2ad730d779))
- **all:** Rework jwt ([#2727](https://github.com/betagouv/service-national-universel/issues/2727)) ([b42e62c](https://github.com/betagouv/service-national-universel/commit/b42e62cf5133b60860bb746c7b651d00f9f7b3d0))
- **app/admin:** update 2FA info ([#2762](https://github.com/betagouv/service-national-universel/issues/2762)) ([5eb5cb5](https://github.com/betagouv/service-national-universel/commit/5eb5cb509317c3b7717197b7bd9eab91b9d3b0e5))
- **app/admin:** update 2FA information for user ([#2761](https://github.com/betagouv/service-national-universel/issues/2761)) ([a409f6b](https://github.com/betagouv/service-national-universel/commit/a409f6b540998636ada4fbb2882ce57babbb8144))

# [1.302.0](https://github.com/betagouv/service-national-universel/compare/v1.301.0...v1.302.0) (2023-06-28)

### Bug Fixes

- **admin:** allow french polynesian numbers for structure reps ([3a7f4d3](https://github.com/betagouv/service-national-universel/commit/3a7f4d3e030cea6b55e6c13a2e677b9b8ab44c8d))
- **admin/app:** trim token 2fa ([2162c0c](https://github.com/betagouv/service-national-universel/commit/2162c0c4ed81f6030c23cd8eb9cc81b595fb9ae8))
- **api:** add line break in convocation contacts ([4c4585a](https://github.com/betagouv/service-national-universel/commit/4c4585ad4cceee5d5a6b1c8571e79d4c6ff97ca1))
- **api:** correct dates on convocation dl for DROMS affected in France ([766a331](https://github.com/betagouv/service-national-universel/commit/766a33156c131f135eabfd4e4bd91c3e4a7a9524))
- **api:** sejour de test ([9eeb8fe](https://github.com/betagouv/service-national-universel/commit/9eeb8fe377ef77888d0a5d9384503df46af987c8))
- **app:** change address modal adjustements ([1b5ea30](https://github.com/betagouv/service-national-universel/commit/1b5ea3018a2fd83aa13e10ad2c032c8c430644ad))

### Features

- **api:** update autovalidationStatusPhase1 for July ([#2747](https://github.com/betagouv/service-national-universel/issues/2747)) ([18a256b](https://github.com/betagouv/service-national-universel/commit/18a256bc031844946f9d2ff7afa90f497a00e43a))
- **api:** update dsnj export with dynamic start dates ([9637a7a](https://github.com/betagouv/service-national-universel/commit/9637a7a44ca5d31d8cbbe343e968e6c9bf064103))
- **api/admin:** Ajout d'un champ "retardé" sur les lignes de bus ([#2737](https://github.com/betagouv/service-national-universel/issues/2737)) ([b02e95d](https://github.com/betagouv/service-national-universel/commit/b02e95d14abac342d440263a6c4f61049b6fb62a))
- **app:** bandeau pour les terminales ([#2755](https://github.com/betagouv/service-national-universel/issues/2755)) ([2b1a14d](https://github.com/betagouv/service-national-universel/commit/2b1a14d9cfb87847f02569d85cd7f70291780f09))
- **app:** Modale terminale affecte ([#2756](https://github.com/betagouv/service-national-universel/issues/2756)) ([c078a48](https://github.com/betagouv/service-national-universel/commit/c078a48b306ac73b815fb7f34f150bdb9f32333f))
- **app/admin:** Info for 2FA signin ([83b82fa](https://github.com/betagouv/service-national-universel/commit/83b82fae74974b72678223a3ffa0f9937080e343))

# [1.301.0](https://github.com/betagouv/service-national-universel/compare/v1.300.0...v1.301.0) (2023-06-27)

### Bug Fixes

- **admin:** cohort authorisation for schema ([e0d316a](https://github.com/betagouv/service-national-universel/commit/e0d316a54d70a3b28144b79eb7742ea1b02d96e8))
- **app/admin:** Elements de language choix PDR : services locaux -> email ([bdd4af8](https://github.com/betagouv/service-national-universel/commit/bdd4af8283614db20ef4cd5dd1718fbcd526d0b5))

### Features

- **admin:** Email automatique au référent d’origine - départ du volontaire ([#2746](https://github.com/betagouv/service-national-universel/issues/2746)) ([4e3faf8](https://github.com/betagouv/service-national-universel/commit/4e3faf8bf0c06545bfd7d2a527ca53585b03807c))
- **app:** Besoin d'aide/Contacter quelqu'un : Ajout d'une catégorie "Désistement" ([#2751](https://github.com/betagouv/service-national-universel/issues/2751)) ([c4d81fb](https://github.com/betagouv/service-national-universel/commit/c4d81fb7f521df082e578657aa3ddcff514fe14a))
- **app/admin/lib:** Donner accès au funnel d'inscription en staging ([#2733](https://github.com/betagouv/service-national-universel/issues/2733)) ([93820b3](https://github.com/betagouv/service-national-universel/commit/93820b3401514ca27badf7f559f1b620325e5fe2))

# [1.300.0](https://github.com/betagouv/service-national-universel/compare/v1.299.0...v1.300.0) (2023-06-26)

### Bug Fixes

- **api:** compareIps async ([4fc5ed9](https://github.com/betagouv/service-national-universel/commit/4fc5ed9385123c2b2d78a95f951882ad4942a2e8))
- **api:** condition for retrieving youngs for dsnj export ([f99de16](https://github.com/betagouv/service-national-universel/commit/f99de161878161db7388f614e05762d7aaf6be39))
- **app:** add slash to preferences link in menu ([84464c4](https://github.com/betagouv/service-national-universel/commit/84464c4571397c1f5aa05d76b3a274b9b63f5fae))

### Features

- **admin:** revue design Affectation Manuelle ([#2714](https://github.com/betagouv/service-national-universel/issues/2714)) ([c4295b9](https://github.com/betagouv/service-national-universel/commit/c4295b9434312e3f057bfb36e097ca6240f41dd5))
- **all:** Replace 403 with 418 (to avoid fetch errors) ([#2752](https://github.com/betagouv/service-national-universel/issues/2752)) ([1f06ebe](https://github.com/betagouv/service-national-universel/commit/1f06ebe46737d2d0726f0e76fcec988902767148))
- **api/admin:** MEP 2fa admin ([#2749](https://github.com/betagouv/service-national-universel/issues/2749)) ([8d13c9a](https://github.com/betagouv/service-national-universel/commit/8d13c9a2bec7c1b227a573098e8a2efb1323e62f))
- **api/app:** 2fa app ([#2750](https://github.com/betagouv/service-national-universel/issues/2750)) ([96dd14b](https://github.com/betagouv/service-national-universel/commit/96dd14ba1ffb9f45b17aaa167cc1770985774743))
- 2fa ([#2745](https://github.com/betagouv/service-national-universel/issues/2745)) ([b905f60](https://github.com/betagouv/service-national-universel/commit/b905f6039bdc3695601dafc2104456f0330c4358))

### Reverts

- **api:** Reopen fil downloads ([103f401](https://github.com/betagouv/service-national-universel/commit/103f4011a767ed3d414c5aff690db19e3c644882))

# [1.299.0](https://github.com/betagouv/service-national-universel/compare/v1.298.0...v1.299.0) (2023-06-23)

### Bug Fixes

- **api-adresse:** Update sentry error context ([0035cd8](https://github.com/betagouv/service-national-universel/commit/0035cd846a8c6c9722bc19d0822b4b4177adeec7))

### Features

- **admin:** Hide edit button in bus line page for transporter if isPdrOpenForTransporter is false ([#2738](https://github.com/betagouv/service-national-universel/issues/2738)) ([c343251](https://github.com/betagouv/service-national-universel/commit/c3432510ae7d5bb486e7dac33fb48c0f732cdb23))
- **admin/api:** Ajouter un bouton pour envoyer les informations de la ligne de transport aux référents ([#2739](https://github.com/betagouv/service-national-universel/issues/2739)) ([1d6f4a1](https://github.com/betagouv/service-national-universel/commit/1d6f4a1bc33495c532901ea3606e3a9f24e2ec98))
- **api:** DO NOT ALLOW TO DOWNLOAD CNI ([9d67409](https://github.com/betagouv/service-national-universel/commit/9d67409317dfba16b20412b06aafb6c3dce13de9))

# [1.298.0](https://github.com/betagouv/service-national-universel/compare/v1.297.0...v1.298.0) (2023-06-22)

### Bug Fixes

- **admin,api:** wip edit plan de transport ([#2735](https://github.com/betagouv/service-national-universel/issues/2735)) ([1cfc6db](https://github.com/betagouv/service-national-universel/commit/1cfc6db2c56bd41e339e3822db23eb8391f2142b))
- **admin/app:** Better error handling on fetch ([f1d8e5e](https://github.com/betagouv/service-national-universel/commit/f1d8e5e2b8ccb8de76a4c1d8bff1cba7ab8e9030))
- **admin/app:** Update redirection to auth handling ([e3a3761](https://github.com/betagouv/service-national-universel/commit/e3a376187cbdfb4381cb2f27a3b80eeb40f8b28e))
- **api:** Api adresse on api ([f131030](https://github.com/betagouv/service-national-universel/commit/f131030f2f3c15826e474289e141570ca16e8868))
- **api:** Update 401 handling ([16df6be](https://github.com/betagouv/service-national-universel/commit/16df6bef0faa918f622fc4e4c5f3a6ee40ba143d))
- **app:** Better capture ([f455192](https://github.com/betagouv/service-national-universel/commit/f4551926ec5d2af780285a7d3a6b3eb5f30a0e2b))

### Features

- **api/admin/app:** New sentry error ([#2734](https://github.com/betagouv/service-national-universel/issues/2734)) ([b2f086c](https://github.com/betagouv/service-national-universel/commit/b2f086c5bc4d5867bd3512db108c3b0a5d82742f))
- **app:** Phase 1 - Affecté : Mise en prod des améliorations de l'étape de choix de PDR ([60ebf4e](https://github.com/betagouv/service-national-universel/commit/60ebf4e9c159f697cb478a99c13fd17031054234))

# [1.297.0](https://github.com/betagouv/service-national-universel/compare/v1.296.0...v1.297.0) (2023-06-21)

### Bug Fixes

- **admin:** Get count of tickets instead of collection ([d789f39](https://github.com/betagouv/service-national-universel/commit/d789f396c0d4cc27e07924f928e32c947cb9f355))
- **admin:** on logout ([d801260](https://github.com/betagouv/service-national-universel/commit/d80126028c0cdb091f39e1b555f0e9c720de7454))
- **admin:** structure view open tab mission for ref ([c6ce5b2](https://github.com/betagouv/service-national-universel/commit/c6ce5b2bef3131a4b214f7051971797f98756669))
- **admin,api:** edit plan de transport wip([#2729](https://github.com/betagouv/service-national-universel/issues/2729)) ([968977e](https://github.com/betagouv/service-national-universel/commit/968977e0e53de68064ea599063252e515d3614f9))
- **admin/app:** validation contract ([0f3243b](https://github.com/betagouv/service-national-universel/commit/0f3243b83df40174454769dee7fb2c9d95636191))
- **api:** historic plan de transport ([095581a](https://github.com/betagouv/service-national-universel/commit/095581ad286f70ba89169254a19ddf56ae27affe))
- **api/admin:** Fix bug on logout ([6415e25](https://github.com/betagouv/service-national-universel/commit/6415e253c9e114c1423ab4ca080a1c7ead603eec))
- **app:** Bug no history ([8e6637a](https://github.com/betagouv/service-national-universel/commit/8e6637a9cea3dbc129a07512aaa38902a698c255))
- **app:** correct dates on MeetingPointGoAlone ([048945d](https://github.com/betagouv/service-national-universel/commit/048945d726347b8cc386500cc2e28d21e618b898))
- **app:** fix case in PDR component import ([03e31a3](https://github.com/betagouv/service-national-universel/commit/03e31a33ab555fb9b0b5a98bf6dcbe8bea36f75b))
- **app:** Fix sign as young ([ee67043](https://github.com/betagouv/service-national-universel/commit/ee67043a2343f44bcbd37ef220f8a75bad08207c))
- **app:** Integrations retours sur etape choix PDR ([ded7e6a](https://github.com/betagouv/service-national-universel/commit/ded7e6a1d86fb94aca3d3e89ea9967cc7ba4bdf8))
- **app:** step PDR retours part 2 ([d1292c0](https://github.com/betagouv/service-national-universel/commit/d1292c07c436812e5f9271f5c7b2a4daa9d26a36))

### Features

- **admin:** Fix loader ([#2725](https://github.com/betagouv/service-national-universel/issues/2725)) ([18d019b](https://github.com/betagouv/service-national-universel/commit/18d019bc8c7beb58e0f96ecbeca563b28352bb1d))
- **admin:** New Loader for exportPdf ([#2724](https://github.com/betagouv/service-national-universel/issues/2724)) ([97dd5a9](https://github.com/betagouv/service-national-universel/commit/97dd5a936b38a989403a2fce779f84167a436049))
- **admin/api:** Export Engagement global et missions ([#2612](https://github.com/betagouv/service-national-universel/issues/2612)) ([3b0546e](https://github.com/betagouv/service-national-universel/commit/3b0546e5c829c257a261db6c2bf73d1ef5de1808))
- **api:** ajout ID groupe template notifications transporteur ([#2721](https://github.com/betagouv/service-national-universel/issues/2721)) ([be21adb](https://github.com/betagouv/service-national-universel/commit/be21adb7c5373942c74b02a6cd3bf0f445eb3c10))
- **app:** Phase 1 - statut "Affecté" : Amélioration de l'affichage des choix de transport ([#2719](https://github.com/betagouv/service-national-universel/issues/2719)) ([c2ab1bd](https://github.com/betagouv/service-national-universel/commit/c2ab1bdaadd200328fadb5175dd3a0a34965105a))
- **app/admin:** gestion des 401 V2 ([#2713](https://github.com/betagouv/service-national-universel/issues/2713)) ([dccfda1](https://github.com/betagouv/service-national-universel/commit/dccfda10bd108bb9c4feb6ea0e585043b2aa6849))

# [1.296.0](https://github.com/betagouv/service-national-universel/compare/v1.295.0...v1.296.0) (2023-06-20)

### Bug Fixes

- **admin:** open affection right for all phase 1 status ([b13ea43](https://github.com/betagouv/service-national-universel/commit/b13ea43ea52c4dcbc1a67083a274ab243171f2e5))
- **api/admin:** date specific session ([#2720](https://github.com/betagouv/service-national-universel/issues/2720)) ([3eacfa0](https://github.com/betagouv/service-national-universel/commit/3eacfa03ef92a7e56267dee562c26933e82e6217))
- **app:** add loader diagoriente ([67c4ac0](https://github.com/betagouv/service-national-universel/commit/67c4ac08109065db2b0923f8bdf2edf9e8d81146))
- **app:** do not capture error on cohort fetch if user is not logged in ([df772ca](https://github.com/betagouv/service-national-universel/commit/df772cabdccb71eca0236ae06867a25147a3ea80))
- **app:** dont render transport info modal if stay is over ([f600112](https://github.com/betagouv/service-national-universel/commit/f6001122c3fc511d5c63ed6b4fc1e3a7e6b9966c))
- **app:** phase 1 done - return infos ([384aad7](https://github.com/betagouv/service-national-universel/commit/384aad7ac0fd6278223780e590d8a0fd07a48d0a))
- **app:** phase 1 infos retour transports locaux ([3791be9](https://github.com/betagouv/service-national-universel/commit/3791be9be80b0b043da6ac2eceaeeeb01c414d97))
- **app:** transport info on phase 1 done and not done pages ([ada163c](https://github.com/betagouv/service-national-universel/commit/ada163c4e973e20f3b3d881ba2c20822549b8dbb))
- **app:** wait for cohort data to load ([74a2f71](https://github.com/betagouv/service-national-universel/commit/74a2f71abf2e184ab3efcec64c7deb99b3296a22))
- **app:** waiting affectation for legacy ([1ec54a7](https://github.com/betagouv/service-national-universel/commit/1ec54a79b4cf8ff01c8bfeddc574c12208b523b2))
- **lib:** remove unnecessary throw in dates functions ([3626dcb](https://github.com/betagouv/service-national-universel/commit/3626dcb94838495812698daed3c43c68dd3c2ee6))

### Features

- **admin/api:** MEP date de sejour dynamique ([#2722](https://github.com/betagouv/service-national-universel/issues/2722)) ([c483a97](https://github.com/betagouv/service-national-universel/commit/c483a979c524fd36c3a4644fa88dbeb249769c94))

# [1.295.0](https://github.com/betagouv/service-national-universel/compare/v1.294.0...v1.295.0) (2023-06-19)

### Bug Fixes

- **admin:** fix session filtering for head centers ([e180316](https://github.com/betagouv/service-national-universel/commit/e1803169e093c66391b82faf6c3ac709747ed7c6))
- **admin:** keep old behavior in modal affectation for prod ([0437103](https://github.com/betagouv/service-national-universel/commit/04371039997dd5b0ab552a11a4968b16b0e8d3a9))
- **api:** Fix auto-validation hors Juin 2023 ([c93f37d](https://github.com/betagouv/service-national-universel/commit/c93f37d234222950d26f99ad352a04657fcc573b))
- **api/pdf:** Render pdf 10 by 10 in batch mode ([6cc8c74](https://github.com/betagouv/service-national-universel/commit/6cc8c74ba43bdfa9f327076f0c96a743cacf89cf))
- **app:** do not capture cohort fetch error when user is logged out ([e7c4bad](https://github.com/betagouv/service-national-universel/commit/e7c4bad290c209e9baabb0077415d37abdebea93))
- **app:** waiting affectation cohort data ([782cc4e](https://github.com/betagouv/service-national-universel/commit/782cc4e8d7dc177c58245170d445dca2937f37a9))
- **lib:** dont display session date for young waiting affectation ([952160c](https://github.com/betagouv/service-national-universel/commit/952160c9de9144bea68f32086b13fd70cd374a24))
- **lib:** DROMS dates globales ([e6331c6](https://github.com/betagouv/service-national-universel/commit/e6331c60623bd938fe43889bd029850ea6e31ef6))

### Features

- **admin/api/app:** Date de session spécifique ([#2705](https://github.com/betagouv/service-national-universel/issues/2705)) ([d757101](https://github.com/betagouv/service-national-universel/commit/d757101b8c0ce716a8a0521a5db92b5399989bb5))
- **api:** New condition for autovalidationStatusPhase1 ([#2716](https://github.com/betagouv/service-national-universel/issues/2716)) ([c6df6ff](https://github.com/betagouv/service-national-universel/commit/c6df6ff34f1a2b7845a5b994a62328e3e1dade69))

# [1.294.0](https://github.com/betagouv/service-national-universel/compare/v1.293.0...v1.294.0) (2023-06-18)

### Features

- **admin/api:** update export Zip certificates ([#2711](https://github.com/betagouv/service-national-universel/issues/2711)) ([c42839d](https://github.com/betagouv/service-national-universel/commit/c42839d208340668c350f47bc1d21957f27491ef))
- **api/admin:** open attestations zip all user + clean old root ([e1687ac](https://github.com/betagouv/service-national-universel/commit/e1687ac8e06c753f47efcbbc6f223d91ea871e7a))

# [1.293.0](https://github.com/betagouv/service-national-universel/compare/v1.292.0...v1.293.0) (2023-06-16)

### Bug Fixes

- **admin:** style export component ([#2709](https://github.com/betagouv/service-national-universel/issues/2709)) ([c51fb59](https://github.com/betagouv/service-national-universel/commit/c51fb598335e1fc21081b392e771666ada670dc2))
- **admin/api:** young search ([71fef4e](https://github.com/betagouv/service-national-universel/commit/71fef4e994313bc9493a618f99c9af317ef829db))
- **api:** dates convoc ([0e5fa10](https://github.com/betagouv/service-national-universel/commit/0e5fa10d0abfcc6bc90b3f08d0bac7405079fd6c))

### Features

- **admin:** Chef de centre : possibilité d’envoyer une demande de modification du droit à l’image (individuelle) ([#2703](https://github.com/betagouv/service-national-universel/issues/2703)) ([a5cdb25](https://github.com/betagouv/service-national-universel/commit/a5cdb2552814d26271a2c9f346b92de00e733d9a))
- **api:** update autovalidationSessionPhase1 for cohort: Juin 2023 ([#2710](https://github.com/betagouv/service-national-universel/issues/2710)) ([1e2b2d4](https://github.com/betagouv/service-national-universel/commit/1e2b2d40df79c5fc40c1b668ffde30a2f1eff719))

### Reverts

- Revert "feat(admin/app): gestion des 401 (#2704)" ([80688be](https://github.com/betagouv/service-national-universel/commit/80688be40858dab390b7c9bfb32eba913040abcb)), closes [#2704](https://github.com/betagouv/service-national-universel/issues/2704)

# [1.292.0](https://github.com/betagouv/service-national-universel/compare/v1.291.0...v1.292.0) (2023-06-15)

### Bug Fixes

- **admin:** more accessible input forms ([66fba12](https://github.com/betagouv/service-national-universel/commit/66fba12726a839e3a4d6e63bfa916c0e53781f55))
- **admin:** Put lastLoginAt when lastActivityAt is not defined ([8fac775](https://github.com/betagouv/service-national-universel/commit/8fac775a9eeed5678330c8910e5fb522a154f829))
- **api:** Better error handling for imageReminderParent2 ([16e3cf2](https://github.com/betagouv/service-national-universel/commit/16e3cf2e875d0aa1af935c5ee364187b79b17cba))
- **api:** Serialize young ([121e1b4](https://github.com/betagouv/service-national-universel/commit/121e1b44afd2c082d1ae45d263d07d9121f8e04d))
- **app:** disable toastr ([252caea](https://github.com/betagouv/service-national-universel/commit/252caea38473bf531a6e63320e68b32b423609cc))

### Features

- **admin/app:** gestion des 401 ([#2704](https://github.com/betagouv/service-national-universel/issues/2704)) ([861b921](https://github.com/betagouv/service-national-universel/commit/861b9219ab59c10e29c175c504e1676cdf2f4438))
- **api/app:** change address backend logic and fixes ([#2659](https://github.com/betagouv/service-national-universel/issues/2659)) ([44221e9](https://github.com/betagouv/service-national-universel/commit/44221e90268850fb53005595a914aeabd15c59d9))

# [1.291.0](https://github.com/betagouv/service-national-universel/compare/v1.290.0...v1.291.0) (2023-06-14)

### Bug Fixes

- **admin:** list error key, throw error on fail to fetch new list system ([4488d54](https://github.com/betagouv/service-national-universel/commit/4488d544a4f61ba154256b6d76fa7ad34f676645))
- **api:** bug statusMilitaryPreparationFiles ([#2700](https://github.com/betagouv/service-national-universel/issues/2700)) ([46bb89c](https://github.com/betagouv/service-national-universel/commit/46bb89cf6527af31d95a92961bd0a1707fd445ec))

### Features

- **admin:** add email copy on user ([04b15f2](https://github.com/betagouv/service-national-universel/commit/04b15f235e8179a464768775fcace29f37844c57))
- **admin:** Passage en prod du téléchargement des PDF d'attestation de droits à l'image. ([#2701](https://github.com/betagouv/service-national-universel/issues/2701)) ([33c67c3](https://github.com/betagouv/service-national-universel/commit/33c67c336000062b33ffb6e1f2640f3de3047902))
- **admin/api:** LastActivity field ([#2698](https://github.com/betagouv/service-national-universel/issues/2698)) ([3a4e2b4](https://github.com/betagouv/service-national-universel/commit/3a4e2b4cfdf87019c362b3d6e466aa773c99155b))
- **api:** better search for young ([b3d4177](https://github.com/betagouv/service-national-universel/commit/b3d4177b38576c2e4f721f903393129b743a82c8))

# [1.290.0](https://github.com/betagouv/service-national-universel/compare/v1.289.0...v1.290.0) (2023-06-13)

### Bug Fixes

- **admin,api:** pdt-wip3 ([#2699](https://github.com/betagouv/service-national-universel/issues/2699)) ([79e5fb6](https://github.com/betagouv/service-national-universel/commit/79e5fb61ffc656404b702fa49d511d25ce0a8f49))
- **api:** Download convocation date ([bfa4a33](https://github.com/betagouv/service-national-universel/commit/bfa4a338760d288d09afb3ba2e0a3cd19691df33))
- **api:** Quelle erreur Raph ! ([0d1954d](https://github.com/betagouv/service-national-universel/commit/0d1954dd2400ef5bf97c11db31c34a7a64714846))
- **api:** Remove Template 231 from api ([#2668](https://github.com/betagouv/service-national-universel/issues/2668)) ([0db4695](https://github.com/betagouv/service-national-universel/commit/0db46956746da6e972da69accedb91eb73587b07))
- **api:** Update ignore message ([1750f56](https://github.com/betagouv/service-national-universel/commit/1750f56ce14e346e5addc3b7f749c391bb42a3e3))
- **app:** Coherence des dates episode 3 ([ee12348](https://github.com/betagouv/service-national-universel/commit/ee123489c9506c39360ae80a1f977f2255cb363a))
- **app:** Fin du choix de PDR à 23:59 au lieu de 00:01 ([#2689](https://github.com/betagouv/service-national-universel/issues/2689)) ([53948e6](https://github.com/betagouv/service-national-universel/commit/53948e6931f5d0a05a01d304a7d4317340d5e963))
- **app:** JDMA ([1bbe791](https://github.com/betagouv/service-national-universel/commit/1bbe7911b099aca6a1573c635ae41369fc5a22b9))
- **app, api:** Mon Compte/Phase 1 - statut "Affecté" : Cohérence de l'affichage des dates de séjour ([#2684](https://github.com/betagouv/service-national-universel/issues/2684)) ([55cacb8](https://github.com/betagouv/service-national-universel/commit/55cacb877fde12fe6b089db7f910028633aff039))
- **security:** serialize in new elasticsearch when serializer available ([#2603](https://github.com/betagouv/service-national-universel/issues/2603)) ([24e3a42](https://github.com/betagouv/service-national-universel/commit/24e3a4279a2828baeafc2aa2d9b0297fad13d8a6))

### Features

- **admin:** Amelioration UX Affectation Manuelle ([#2691](https://github.com/betagouv/service-national-universel/issues/2691)) ([d381c24](https://github.com/betagouv/service-national-universel/commit/d381c243953f4f52aa9f0bc3a82abcf1b507a449))
- **admin/api:** ADD Export de tous les convoyeurs d'une cohort ([#2687](https://github.com/betagouv/service-national-universel/issues/2687)) ([0cb96fd](https://github.com/betagouv/service-national-universel/commit/0cb96fda86f2a1ba6e8d93d1adf501d2c368c9a3))
- **admin/api:** droit-a-image-pdf-quand-non-autorisation ([#2675](https://github.com/betagouv/service-national-universel/issues/2675)) ([53daeb4](https://github.com/betagouv/service-national-universel/commit/53daeb431da19d346e10dacfea4250f02bd0c108))
- **api:** Do not update ElasticSearch if document didn't changed ([#2697](https://github.com/betagouv/service-national-universel/issues/2697)) ([12e8ce0](https://github.com/betagouv/service-national-universel/commit/12e8ce0e869bb48edaa84bceb7579fdee9395e6b))

# [1.289.0](https://github.com/betagouv/service-national-universel/compare/v1.288.0...v1.289.0) (2023-06-12)

### Bug Fixes

- **admin:** Download file for emploi du temps séjour ([1b46455](https://github.com/betagouv/service-national-universel/commit/1b464552eb7f77e181086ca6aaaf93c0a1e817d1))
- **admin:** Download file possible ([033cedf](https://github.com/betagouv/service-national-universel/commit/033cedf540f0a7a424715d32ecc419e77039db96))
- **admin,api:** plan de transport wip2 ([#2690](https://github.com/betagouv/service-national-universel/issues/2690)) ([30101d3](https://github.com/betagouv/service-national-universel/commit/30101d32e0cb3b80a60dd0d699660668e99007ab))
- **api:** data-for-check bus ([b875959](https://github.com/betagouv/service-national-universel/commit/b8759594e856e50e14cf3bbb921aa6b5831cf8d2))
- **api:** Refetch session when updating places with multiaction ([d643631](https://github.com/betagouv/service-national-universel/commit/d6436314c256178edfcf306748a8d2037d0c11ff))
- **app:** hour view convocation ([99dac94](https://github.com/betagouv/service-national-universel/commit/99dac94ca2ebeb468d807b9b6b46bff29e54c0e1))

### Features

- **api:** volontaire pointé absent libere une place ([#2693](https://github.com/betagouv/service-national-universel/issues/2693)) ([84fa97d](https://github.com/betagouv/service-national-universel/commit/84fa97d78b74a3d326b23afc22ff8238c1304949))

# [1.288.0](https://github.com/betagouv/service-national-universel/compare/v1.287.1...v1.288.0) (2023-06-09)

### Bug Fixes

- **admin:** itinerary stepsort by hour and minute ([1c4e4a0](https://github.com/betagouv/service-national-universel/commit/1c4e4a0be393d40762af62b524093540f6d4ef8c))
- **api:** Add lexfo to exception list staging ([45b353a](https://github.com/betagouv/service-national-universel/commit/45b353a597438942d2d77edc0ee119ba549552b4))
- **api:** Remove Metabase.jar ([3aa85b0](https://github.com/betagouv/service-national-universel/commit/3aa85b0354fab83eae14dad3fb3a1f63f10ac186))
- **api:** Update ignore message ([3e3e66c](https://github.com/betagouv/service-national-universel/commit/3e3e66c57a58a5918fe03801c38f828804dc90e0))

### Features

- **api:** Add lexfo to email list for send in blue and withdraw EY ([eb4e2ac](https://github.com/betagouv/service-national-universel/commit/eb4e2ac982fa3ab19194aa4daa10aca2b5babdcc))

## [1.287.1](https://github.com/betagouv/service-national-universel/compare/v1.287.0...v1.287.1) (2023-06-08)

### Bug Fixes

- **admin:** do not crash if initials are unavailable in mission contact ([375429c](https://github.com/betagouv/service-national-universel/commit/375429c1465f8a30865c91a4664240695565b97d))
- **admin:** Statut receptionné - fiche sanitaire ([#2685](https://github.com/betagouv/service-national-universel/issues/2685)) ([fff4d74](https://github.com/betagouv/service-national-universel/commit/fff4d747c2fde28cde57d2e32b7c8343d697b5d6))
- **api:** es remove statut session ([6c01d6f](https://github.com/betagouv/service-national-universel/commit/6c01d6f9ecd12da424e326098ba62989b20782b1))

# [1.287.0](https://github.com/betagouv/service-national-universel/compare/v1.286.0...v1.287.0) (2023-06-07)

### Bug Fixes

- **api:** synchro es useless field ([b2688a4](https://github.com/betagouv/service-national-universel/commit/b2688a4235eac418377a038392e28cc80b698964))
- **app:** add military mission domain ([5bf1739](https://github.com/betagouv/service-national-universel/commit/5bf1739e1e87b43a44fe768358b626f655b74a61))

### Features

- **admin:** Add Export Convoyeur d'une Ligne ([#2682](https://github.com/betagouv/service-national-universel/issues/2682)) ([ab63eb9](https://github.com/betagouv/service-national-universel/commit/ab63eb9309a5b3c26638b5342ff2b23aeb607251))
- **admin:** update export schema ([1b13878](https://github.com/betagouv/service-national-universel/commit/1b13878c67f501290dcdf5720eecad1e6760b598))

# [1.286.0](https://github.com/betagouv/service-national-universel/compare/v1.285.0...v1.286.0) (2023-06-06)

### Bug Fixes

- **admin:** on change youngPhase1Agreement ([2c3586a](https://github.com/betagouv/service-national-universel/commit/2c3586a6f925d9b0f698bed54ea9311670a2b240))
- **lib:** es role ([0d5c83c](https://github.com/betagouv/service-national-universel/commit/0d5c83c8d08860df0a08564a0f2eea2acf4e8268))

### Features

- **admin:** plan-de-transport wip1 ([#2683](https://github.com/betagouv/service-national-universel/issues/2683)) ([f455099](https://github.com/betagouv/service-national-universel/commit/f45509995fa1d6ce58161cf79e0c60458c51c4a6))

# [1.285.0](https://github.com/betagouv/service-national-universel/compare/v1.284.0...v1.285.0) (2023-06-05)

### Bug Fixes

- **api:** fix fix young in bus with context ([8cf39e9](https://github.com/betagouv/service-national-universel/commit/8cf39e93d785fa5538509e4266580d1ded1142ca))
- **api:** list young-by-bus ([95070fc](https://github.com/betagouv/service-national-universel/commit/95070fceea3f75238bb0d6ccf4d3132a3c5ac6f5))

### Features

- **lib/app/admin:** date changes as withdrawn reason for july 2023 ([#2680](https://github.com/betagouv/service-national-universel/issues/2680)) ([0779237](https://github.com/betagouv/service-national-universel/commit/077923722337d6610e62993c993baa818910ee7d))

# [1.284.0](https://github.com/betagouv/service-national-universel/compare/v1.283.0...v1.284.0) (2023-06-02)

### Bug Fixes

- **api:** login attempts on reset mdp ([#2673](https://github.com/betagouv/service-national-universel/issues/2673)) ([9a4c310](https://github.com/betagouv/service-national-universel/commit/9a4c3101d089034f3e65426df2763c6b7adcb862))
- **api:** modal affectation bus on good cohort ([2cc3639](https://github.com/betagouv/service-national-universel/commit/2cc363984eb31f5e0408dbadfa37c2bee0aa2504))
- **api:** Password change At ([2360a4b](https://github.com/betagouv/service-national-universel/commit/2360a4b584c2608bb2f4447debcbf77d97224264))

### Features

- **app:** Mon compte/Home - Statut "Sur liste d'attente" : Ajouter liens vers changement de séjour et désistement ([#2672](https://github.com/betagouv/service-national-universel/issues/2672)) ([8ab85fc](https://github.com/betagouv/service-national-universel/commit/8ab85fc92bbdab59f4474c0e3efda18309fab600))
- **dmin/api:** Ajouter une équipe d'accompagnant sur les lignes de bus ([#2670](https://github.com/betagouv/service-national-universel/issues/2670)) ([2f76017](https://github.com/betagouv/service-national-universel/commit/2f760179c9db13f3c6d6720e9b1a3fdd8b2548e2))

# [1.283.0](https://github.com/betagouv/service-national-universel/compare/v1.282.0...v1.283.0) (2023-06-01)

### Bug Fixes

- **api:** dashboard v2 ([9d14b21](https://github.com/betagouv/service-national-universel/commit/9d14b21d091eef69eb9770014438b91f87286c9a))
- **app:** Préférences: Amélioration de l'affichage des erreurs dans le formulaire ([#2669](https://github.com/betagouv/service-national-universel/issues/2669)) ([751c3ba](https://github.com/betagouv/service-national-universel/commit/751c3badda671b847f1a7b0999831e87267f3f12))
- **lib:** Interdire aux refs dep d'éditer et supprimer les autres refs dep ([#2664](https://github.com/betagouv/service-national-universel/issues/2664)) ([d9bb5aa](https://github.com/betagouv/service-national-universel/commit/d9bb5aa34216a546da8a81d4b402f3b17cf82911))

### Features

- **admi/lib:** add comment on motif depart in export young ([a4da1ee](https://github.com/betagouv/service-national-universel/commit/a4da1ee270f04a885812df4048f39b2d695d34d6))
- **api, admin:** new dashboard step 2 ([#2656](https://github.com/betagouv/service-national-universel/issues/2656)) ([367cbc9](https://github.com/betagouv/service-national-universel/commit/367cbc9d6d5f591ca3531e83f179017be11cc474))
- **app/lib:** temporarily display new date and banner for july ([#2674](https://github.com/betagouv/service-national-universel/issues/2674)) ([54b1ffa](https://github.com/betagouv/service-national-universel/commit/54b1ffa6e734bff40cac44a6320a1ca581b12bb8))

# [1.282.0](https://github.com/betagouv/service-national-universel/compare/v1.281.0...v1.282.0) (2023-05-31)

### Bug Fixes

- **admin:** Centers/List: Improve cohorts fetching and error handling in modal ([c6dc50f](https://github.com/betagouv/service-national-universel/commit/c6dc50f6edf1ae4c307c2b0cf2a9afe365d3a00f))
- **api:** import PDT ([c4fef88](https://github.com/betagouv/service-national-universel/commit/c4fef88c9bc41fd1e93f379873af5383b742d296))
- **app:** travel info date ([4745dd8](https://github.com/betagouv/service-national-universel/commit/4745dd8d59e7d84987dd0e626feb13a7480de013))
- **app:** trip dates on travel info ([84d8f0c](https://github.com/betagouv/service-national-universel/commit/84d8f0cfd5aef3749a8b4243d9f80ddf19f4c58d))

### Features

- **api:** Disable password check on pre-prod ([5865a37](https://github.com/betagouv/service-national-universel/commit/5865a371bc661d444ecf46c4e6124b1752668b7a))

# [1.281.0](https://github.com/betagouv/service-national-universel/compare/v1.280.0...v1.281.0) (2023-05-30)

### Bug Fixes

- **admin:** export young ([52dee57](https://github.com/betagouv/service-national-universel/commit/52dee57047c43f625be1b09d8124396e9049d696))
- **admin:** Liste des volontaires - Filtres et Export : Afficher le nom de la ligne de bus au lieu de l'ID de la ressource ([#2649](https://github.com/betagouv/service-national-universel/issues/2649)) ([01a8d1f](https://github.com/betagouv/service-national-universel/commit/01a8d1f7000cdd5486aa7dd15b8e5ffbbfc2ecdb))
- **admin:** modif centre -> adresse doit être vérifiée [#2648](https://github.com/betagouv/service-national-universel/issues/2648) ([def92c2](https://github.com/betagouv/service-national-universel/commit/def92c266e8e20adaaf9ba677638ab55944bdb13))
- **api:** bug redirection support ([#2641](https://github.com/betagouv/service-national-universel/issues/2641)) ([1c60e10](https://github.com/betagouv/service-national-universel/commit/1c60e10a7f7d4e461be948e9766e12918e36567a))
- **api:** Fix a la con pour que les tests passent plus souvent ([84f64ff](https://github.com/betagouv/service-national-universel/commit/84f64ffceadc6cf134f5595a201b0edf9730d295))
- **api/app:** date cohort dynamique ([89a1114](https://github.com/betagouv/service-national-universel/commit/89a1114f4c1bff419c523f883b4e550b8cc14cd8))
- **app:** Rediriger les volontaires en statut "Réinscription" cohorte "à venir" vers l'écran d'inscription "En cours" cohorte "à venir" [#2665](https://github.com/betagouv/service-national-universel/issues/2665) ([5da6147](https://github.com/betagouv/service-national-universel/commit/5da6147e3f944616c962ab8fdfd1029c8ba920b9))

### Features

- **admin:** add meetingHours to export plan de transport ([3dc3299](https://github.com/betagouv/service-national-universel/commit/3dc3299b11374cc84f0a844b29cedd011bc71b92))
- **admin:** Ajout colonne "Participation au sejour" export volontaires d'un centre ([#2662](https://github.com/betagouv/service-national-universel/issues/2662)) ([87736ee](https://github.com/betagouv/service-national-universel/commit/87736eed5a792348d032fb38464ab829088c5740))
- **admin:** ajout colonne date onglet 'Mes candidatures' [#2653](https://github.com/betagouv/service-national-universel/issues/2653) ([d2b057a](https://github.com/betagouv/service-national-universel/commit/d2b057a7d0cd6a2a4c214ae56e6c64c136afd58a))
- **admin:** design page mission (couleur du statut et bandeau) ([#2647](https://github.com/betagouv/service-national-universel/issues/2647)) ([0377e8e](https://github.com/betagouv/service-national-universel/commit/0377e8e2a92fb652cbb0cda6fcdf40e5a6a1936c))
- **admin:** Inscription manuelle -> televersement plus lisible ([#2660](https://github.com/betagouv/service-national-universel/issues/2660)) ([6c13f45](https://github.com/betagouv/service-national-universel/commit/6c13f45607a2192bfcb67ec9184e44d6f01b45cc))
- **admin,api:** esquery modal rattacher centre ([#2667](https://github.com/betagouv/service-national-universel/issues/2667)) ([a79a223](https://github.com/betagouv/service-national-universel/commit/a79a22315c85baf14acc2866b9f8e8901314dbc6))
- **admin,api:** settings - ajout du bloquage/ouverture de l'accès des référents au schéma de répartition ([#2658](https://github.com/betagouv/service-national-universel/issues/2658)) ([2bf02e2](https://github.com/betagouv/service-national-universel/commit/2bf02e214aecd653961e89f501e12113d3a8d813))
- **api:** check PDR department on plan de transport import ([#2663](https://github.com/betagouv/service-national-universel/issues/2663)) ([1c0069d](https://github.com/betagouv/service-national-universel/commit/1c0069dfaca58f59b0cf6fa1ef6fc5de4ab3f81d))
- **api/admin:** listes associations without reactiveBase ([#2657](https://github.com/betagouv/service-national-universel/issues/2657)) ([e882cc4](https://github.com/betagouv/service-national-universel/commit/e882cc481f4c5b445617d6a19eb0670c9533a15e))

# [1.280.0](https://github.com/betagouv/service-national-universel/compare/v1.279.0...v1.280.0) (2023-05-29)

### Features

- **api/admin:** modal change tutor without reactive base ([#2646](https://github.com/betagouv/service-national-universel/issues/2646)) ([c8a638d](https://github.com/betagouv/service-national-universel/commit/c8a638d2d3f989ab07bcb76ce047ea313e515317))
- **app:** Profil/Situations particulières : hide specificAmenagementType ([#2655](https://github.com/betagouv/service-national-universel/issues/2655)) ([5745f93](https://github.com/betagouv/service-national-universel/commit/5745f93b81b098363838af7ff7884b2842f59650))

# [1.279.0](https://github.com/betagouv/service-national-universel/compare/v1.278.0...v1.279.0) (2023-05-26)

### Bug Fixes

- **admin:** accesibilité ([4181a55](https://github.com/betagouv/service-national-universel/commit/4181a55fce8174857ccfc9449a15a1c741aeaee0))
- **api:** Allow more memory for api ([e6197f1](https://github.com/betagouv/service-national-universel/commit/e6197f1f7bc665fb2ad1aa401c22ed5105cc00f2))
- **app:** cohort screen for waitin list young ([#2644](https://github.com/betagouv/service-national-universel/issues/2644)) ([812be64](https://github.com/betagouv/service-national-universel/commit/812be6480c31a37c7e907f1dd5b797d0f704963c))

### Features

- **api/admin:** Ouverture au chef de centre du plan de transport ([#2643](https://github.com/betagouv/service-national-universel/issues/2643)) ([f9e453b](https://github.com/betagouv/service-national-universel/commit/f9e453b315139ffbfba5e19af5e0cc049b84f627))

### Reverts

- Revert "feat(api/admin): Ouverture au chef de centre du plan de transport (#2643)" (#2650) ([f074886](https://github.com/betagouv/service-national-universel/commit/f0748861b675899b9926b8834ce0ca05b410bd81)), closes [#2643](https://github.com/betagouv/service-national-universel/issues/2643) [#2650](https://github.com/betagouv/service-national-universel/issues/2650)

# [1.278.0](https://github.com/betagouv/service-national-universel/compare/v1.277.0...v1.278.0) (2023-05-25)

### Features

- **api:** allow correspondance aller retour in one ([#2645](https://github.com/betagouv/service-national-universel/issues/2645)) ([82dab50](https://github.com/betagouv/service-national-universel/commit/82dab505c9df8b3a7810c9922bc5171681aa35c4))

# [1.277.0](https://github.com/betagouv/service-national-universel/compare/v1.276.0...v1.277.0) (2023-05-24)

### Bug Fixes

- **admin:** remove default filter ref young list ([30d3be2](https://github.com/betagouv/service-national-universel/commit/30d3be26db220654dac2bed983f836dd08be7836))
- **admin:** team list update on change tab ([41331e6](https://github.com/betagouv/service-national-universel/commit/41331e69591a5e111e62cc3070967bc4bb6381a1))
- **api:** head center can update team ([efbf706](https://github.com/betagouv/service-national-universel/commit/efbf706aad371d8551a50416c4d3fda83a4c94cf))
- **app:** tutor name on mission contract ([258428b](https://github.com/betagouv/service-national-universel/commit/258428b71059881d96f99c76265f523cddafa23e))

### Features

- **api/admin:** modale affectation without reactive base ([#2636](https://github.com/betagouv/service-national-universel/issues/2636)) ([80e74e3](https://github.com/betagouv/service-national-universel/commit/80e74e3e00fca9c29b6d3de370592c27a93d3149))
- **api/admin:** refacto propose mission list with new filter ([#2642](https://github.com/betagouv/service-national-universel/issues/2642)) ([a5c96eb](https://github.com/betagouv/service-national-universel/commit/a5c96eb80cc6aec4cb0491e7685a17dc8a516481))
- **app/api:** change address modal ([#2640](https://github.com/betagouv/service-national-universel/issues/2640)) ([d8ac05a](https://github.com/betagouv/service-national-universel/commit/d8ac05a337f04fa9aa34452d6fd731efa4bee01b))

# [1.276.0](https://github.com/betagouv/service-national-universel/compare/v1.275.0...v1.276.0) (2023-05-23)

### Bug Fixes

- **admin:** correction d'un mauvais require dans la vue du jeune ([#2633](https://github.com/betagouv/service-national-universel/issues/2633)) ([57fe001](https://github.com/betagouv/service-national-universel/commit/57fe0013d91e159fe171f004f452b9dbcc349eec))
- **api/lib:** Meilleure prise en compte de lib en temps réel pendant le dev ([5318845](https://github.com/betagouv/service-national-universel/commit/5318845317354c385c0e1f0f14435a6cd4d35d43))

### Features

- **admin/api:** clean Reactive Base export candidature ([#2629](https://github.com/betagouv/service-national-universel/issues/2629)) ([c90bfb9](https://github.com/betagouv/service-national-universel/commit/c90bfb9d4379f89d635900a74d1ef7283a855c67))
- **admin/api:** clean reactive base propose mission young view ([#2632](https://github.com/betagouv/service-national-universel/issues/2632)) ([0477a88](https://github.com/betagouv/service-national-universel/commit/0477a884bd0a74fa0963166412dad58369e1a180))

### Reverts

- Revert "refactor(app, admin): Split young edit endpoint (#2631)" (#2634) ([683f4a2](https://github.com/betagouv/service-national-universel/commit/683f4a2fe65552a5187367ae9a98a6a75d84b00e)), closes [#2631](https://github.com/betagouv/service-national-universel/issues/2631) [#2634](https://github.com/betagouv/service-national-universel/issues/2634)
- Revert "refactor(app/api): Split young edition endpoints (#2589)" (#2628) ([9354853](https://github.com/betagouv/service-national-universel/commit/9354853c8118ff0efd5e824ab848f7ebc708706c)), closes [#2589](https://github.com/betagouv/service-national-universel/issues/2589) [#2628](https://github.com/betagouv/service-national-universel/issues/2628)

# [1.275.0](https://github.com/betagouv/service-national-universel/compare/v1.274.1...v1.275.0) (2023-05-22)

### Bug Fixes

- **admin:** application status for responsible ans supervisor ([f2fe6d0](https://github.com/betagouv/service-national-universel/commit/f2fe6d0f9d15ed3af72e99c3b059fae35f657bc8))
- **admin:** open edit head center session for ref ([e64e4d0](https://github.com/betagouv/service-national-universel/commit/e64e4d0b48eae13858d515597e40b561eafd06b3))
- **api:** ajustement des fichiers utilisés pour les logos du PDF de droit à l'image ([#2626](https://github.com/betagouv/service-national-universel/issues/2626)) ([aef92d5](https://github.com/betagouv/service-national-universel/commit/aef92d525c4fb407afe9c26d93309df0a5e12d64))

### Features

- **admin,api:** Téléchargement massif et individuel du droit à l’image ([#2616](https://github.com/betagouv/service-national-universel/issues/2616)) ([6a7fbe1](https://github.com/betagouv/service-national-universel/commit/6a7fbe1e46407bd9893b0149e1cba894f26d4c74))
- **admin/api:** new filters user list ([#2623](https://github.com/betagouv/service-national-universel/issues/2623)) ([791206e](https://github.com/betagouv/service-national-universel/commit/791206e9c47b2f0fc36076823e25b098c6d8c75f))
- **api/admin:** new dashboard queries ([#2605](https://github.com/betagouv/service-national-universel/issues/2605)) ([ac008fc](https://github.com/betagouv/service-national-universel/commit/ac008fc1d1c5e764458c26691c5095e1e0231386))
- **lib:** Transform lib into ES module ([#2622](https://github.com/betagouv/service-national-universel/issues/2622)) ([da22031](https://github.com/betagouv/service-national-universel/commit/da220318cabbee5e34ff16173ba503284a9723b8))

## [1.274.1](https://github.com/betagouv/service-national-universel/compare/v1.274.0...v1.274.1) (2023-05-19)

### Bug Fixes

- search in volontaires allow accent and diacritics ([de2566c](https://github.com/betagouv/service-national-universel/commit/de2566cc4127c09db3ba331c2060483510418979))
- **admin:** debounce search to avoid race ([114c158](https://github.com/betagouv/service-national-universel/commit/114c158c7cb84d42e80d6645ed4cad3dde1a8acc))
- **api:** error in services/application ([0e73a3d](https://github.com/betagouv/service-national-universel/commit/0e73a3dde82617bd5ed03ac6640ae232f9624772))
- **api:** limit items to 10000 for elasticsearch to improve performance ([0575418](https://github.com/betagouv/service-national-universel/commit/05754187b0b589863094b4e851726910d1f60301))
- **api:** Remove double import of YoungModel ([e860423](https://github.com/betagouv/service-national-universel/commit/e860423c83c87b043ceaa8d46b958d06752aad4f))

# [1.274.0](https://github.com/betagouv/service-national-universel/compare/v1.273.0...v1.274.0) (2023-05-17)

### Bug Fixes

- **admin:** dashboard ([6fd47fa](https://github.com/betagouv/service-national-universel/commit/6fd47faeb01c571d384be9cd35d36775cd2693ee))
- **admin:** old dashboard redirection ([#2617](https://github.com/betagouv/service-national-universel/issues/2617)) ([a27d012](https://github.com/betagouv/service-national-universel/commit/a27d01235b3cacf2190c085368fa3156224d355c))
- **api:** mission young model require ([70d3f09](https://github.com/betagouv/service-national-universel/commit/70d3f0927e921838571ebad1768294b4fce3621a))
- **github:** Update nodeJS actions ([dfa6612](https://github.com/betagouv/service-national-universel/commit/dfa661260403fca2c9c27c4eb22fed602547ca16))

### Features

- **admin/api:** list inscription new filters ([#2615](https://github.com/betagouv/service-national-universel/issues/2615)) ([0d72371](https://github.com/betagouv/service-national-universel/commit/0d723716b341a60ec5adc067aca16f894e33d147))
- **app:** Ajouter le sélecteur de préfixe à la page des consentements ([#2604](https://github.com/betagouv/service-national-universel/issues/2604)) ([451d8d0](https://github.com/betagouv/service-national-universel/commit/451d8d00470d92aa14a2bbe9872e544438cc0800))

# [1.273.0](https://github.com/betagouv/service-national-universel/compare/v1.272.0...v1.273.0) (2023-05-16)

### Bug Fixes

- **admin:** Filters css ([766e3e1](https://github.com/betagouv/service-national-universel/commit/766e3e167d5ba9159539c1aeeacafd5890e48b9d))
- **api:** Fix pipeline schema de repartition par cohorte ([665e2d3](https://github.com/betagouv/service-national-universel/commit/665e2d3f60c4d67bcb92bc468df6d2ac2d1b8755))
- **api:** Put minimalist eslint on api ([5b87710](https://github.com/betagouv/service-national-universel/commit/5b877102c6ac4d4760775b44144f8aefbb9629a3))

### Features

- **admin:** new filters young List ([#2611](https://github.com/betagouv/service-national-universel/issues/2611)) ([dd1ddcc](https://github.com/betagouv/service-national-universel/commit/dd1ddccd9e81f38587b520c9d88214c5e80339ae))
- **app:** Ajout d'un écran pour les "à venir" en cours d'inscription ([#2613](https://github.com/betagouv/service-national-universel/issues/2613)) ([0b3727c](https://github.com/betagouv/service-national-universel/commit/0b3727c6a01abee976bd835ca55d75c9c71a998f))

# [1.272.0](https://github.com/betagouv/service-national-universel/compare/v1.271.0...v1.272.0) (2023-05-15)

### Bug Fixes

- **admin/app:** team new logique / split from dynamique parameter ([#2608](https://github.com/betagouv/service-national-universel/issues/2608)) ([a277b5e](https://github.com/betagouv/service-national-universel/commit/a277b5ea9a6884b8504142c5d245034d21f4661b))
- **api:** comment out changeCohort test ([243121e](https://github.com/betagouv/service-national-universel/commit/243121ed20b2eea94443f22e35656700c045a8c4))
- **lib:** add access to inscription modification for cohort to come ([cea241a](https://github.com/betagouv/service-national-universel/commit/cea241a891dc4da64686f10d46a349043ae8934f))
- **lib:** export format e164 phoneZone ([#2610](https://github.com/betagouv/service-national-universel/issues/2610)) ([87c653a](https://github.com/betagouv/service-national-universel/commit/87c653afda75fc16e05f87ee290fd5a49f2a9a2d))
- **monorepo:** Redeploy/rebuild on changes in lib ([c608faa](https://github.com/betagouv/service-national-universel/commit/c608faa86ca95bd0efb252faabff9e3fada051f5))
- lib path in workspace config ([cb53eb8](https://github.com/betagouv/service-national-universel/commit/cb53eb8b250bfe931a80c9525bca3f181d2a1d56))

### Features

- **admin:** add structure name on mission list ([df3c603](https://github.com/betagouv/service-national-universel/commit/df3c60362e1d606fa1e55c12fbe8799e665237cc))

# [1.271.0](https://github.com/betagouv/service-national-universel/compare/v1.270.0...v1.271.0) (2023-05-12)

### Bug Fixes

- **admin:** bugfix sur les filtres des exports d'inscription ([#2602](https://github.com/betagouv/service-national-universel/issues/2602)) ([389ad1e](https://github.com/betagouv/service-national-universel/commit/389ad1e6d1f3a0f8dc41a89a4bee895865c875f5))
- **admin:** Trim phone numbers on user info edition ([af71249](https://github.com/betagouv/service-national-universel/commit/af71249202e968dd95058a93eb0e81fef02b21c9))
- **app:** StepUpload for cohort "a venir" ([da8ace0](https://github.com/betagouv/service-national-universel/commit/da8ace0a927c2c7bd25e40157e1e2c226109b63b))

### Features

- **admin:** accessibilité onglet admin ([#2599](https://github.com/betagouv/service-national-universel/issues/2599)) ([9c2f111](https://github.com/betagouv/service-national-universel/commit/9c2f11123f9db5a7b211a49f3152c7e41f6248df))
- **admin:** ajout d'infobulle sur les places totales/places libres des centres ([#2588](https://github.com/betagouv/service-national-universel/issues/2588)) ([930568e](https://github.com/betagouv/service-national-universel/commit/930568efdc9058f0b813b6e1c606f32122e9f3ce))
- **admin:** ajout de la modif de classe dans l'edition du volontaire ([#2594](https://github.com/betagouv/service-national-universel/issues/2594)) ([e50051c](https://github.com/betagouv/service-national-universel/commit/e50051c5e19a662da1dbc6b890181da9143fb72d))
- **admin/lib:** add young travel by plane filter / export ([0db4515](https://github.com/betagouv/service-national-universel/commit/0db451581f82adaaf0f19418f27b110e96929b9f))
- **api:** delete structure === delete referent & missions vides ([#2590](https://github.com/betagouv/service-national-universel/issues/2590)) ([1681740](https://github.com/betagouv/service-national-universel/commit/16817405f4aaeeb4a93f34277acf0ab4cab9e277))
- **api/admin:** new filters for pdr youngs ([#2600](https://github.com/betagouv/service-national-universel/issues/2600)) ([f07f762](https://github.com/betagouv/service-national-universel/commit/f07f762809ea64c0fcd90ccfe099001cfc49c4a4))
- **api/admin:** Nouveaux filtres et exports de la liste des structures ([#2570](https://github.com/betagouv/service-national-universel/issues/2570)) ([bd681ad](https://github.com/betagouv/service-national-universel/commit/bd681ad4b1ea12b5604d35a906803b55e4c110d1))
- **app:** accessibilité moncompte ([#2607](https://github.com/betagouv/service-national-universel/issues/2607)) ([6819bcc](https://github.com/betagouv/service-national-universel/commit/6819bcc8e05ce1fd206adbf3c990a9f61f124fe8))

# [1.270.0](https://github.com/betagouv/service-national-universel/compare/v1.269.0...v1.270.0) (2023-05-11)

### Bug Fixes

- **admin:** filter stability ([#2592](https://github.com/betagouv/service-national-universel/issues/2592)) ([42275f3](https://github.com/betagouv/service-national-universel/commit/42275f3117fdb5928bfd9c3788b528cc135b0619))
- **admin:** missions filter default value ([#2597](https://github.com/betagouv/service-national-universel/issues/2597)) ([ca55884](https://github.com/betagouv/service-national-universel/commit/ca558849a675e085b38515ab829b62594e0075ee))
- **app:** Representants legaux - Etape verification - variable non définie ([#2595](https://github.com/betagouv/service-national-universel/issues/2595)) ([89dee01](https://github.com/betagouv/service-national-universel/commit/89dee01ce7e50e61b8b83f4dd16128ade193adf4))
- **lib:** inscriptionModificationOpenForYoungs condition ([d90e5f2](https://github.com/betagouv/service-national-universel/commit/d90e5f286f2b61e73598b9a59000f89629d4262c))
- **lib:** isSessionEditionOpen fix ([4281f92](https://github.com/betagouv/service-national-universel/commit/4281f92f35bebc09453003497f06dd2cf6efb537))
- **lib:** modification date ([915976f](https://github.com/betagouv/service-national-universel/commit/915976fb827a1fb5e559f21420b966b89eddd667))

### Features

- **api/admin:** list presence new filters ([#2575](https://github.com/betagouv/service-national-universel/issues/2575)) ([aab9141](https://github.com/betagouv/service-national-universel/commit/aab9141f7c77c7dbfd061ccfea1e8f6f6467a1f3))
- **api/admin:** team new filters ([#2596](https://github.com/betagouv/service-national-universel/issues/2596)) ([60731d5](https://github.com/betagouv/service-national-universel/commit/60731d56f478398308aeb2c61e7c31288459d4e9))
- **app/lib:** block inscription modification access for metropolitan france ([#2598](https://github.com/betagouv/service-national-universel/issues/2598)) ([2f0afe0](https://github.com/betagouv/service-national-universel/commit/2f0afe0c88a8bd25b00bce166b6ab050f282b03e))

# [1.269.0](https://github.com/betagouv/service-national-universel/compare/v1.268.0...v1.269.0) (2023-05-10)

### Bug Fixes

- **admin:** filter reload + special character ([#2591](https://github.com/betagouv/service-national-universel/issues/2591)) ([f65b777](https://github.com/betagouv/service-national-universel/commit/f65b7777407b1fcd18b147d867c2038923b307cf))
- **admin:** notif save filter pageId ([9251a57](https://github.com/betagouv/service-national-universel/commit/9251a57d4b765c68b4e599182863bcae32956bb0))

### Features

- **api/admin:** liste candidature mod / ref / resp / surperviseur new filters ([#2584](https://github.com/betagouv/service-national-universel/issues/2584)) ([03066cd](https://github.com/betagouv/service-national-universel/commit/03066cdc39e00f4f2cc49b9220de37dfd12d640d))
- **api/admin:** young email new filters ([#2586](https://github.com/betagouv/service-national-universel/issues/2586)) ([aad0c32](https://github.com/betagouv/service-national-universel/commit/aad0c3282986f640c0e176ba133249e39f508af4))

# [1.268.0](https://github.com/betagouv/service-national-universel/compare/v1.267.0...v1.268.0) (2023-05-09)

### Bug Fixes

- **admin:** change sejour ([326383a](https://github.com/betagouv/service-national-universel/commit/326383a5db3f65bbbd2684192ac2de9eb8e11346))
- **admin:** fix filters step 1 ([#2587](https://github.com/betagouv/service-national-universel/issues/2587)) ([1c0fcfa](https://github.com/betagouv/service-national-universel/commit/1c0fcfa310b3f7db92a3a32b6625e23810c4a127))
- **api:** es mission fix ([0813a30](https://github.com/betagouv/service-national-universel/commit/0813a308002eaf6e670544fbc823eddcc7b81b87))
- **app:** change sejour ([b7f52ec](https://github.com/betagouv/service-national-universel/commit/b7f52ec9ed632e8b0213a0ca35c6f38ceb8475c9))

### Features

- **admin:** trie des cohort par date dans centerV2 ([#2579](https://github.com/betagouv/service-national-universel/issues/2579)) ([8e4b854](https://github.com/betagouv/service-national-universel/commit/8e4b854439f338ede0c6bf35c8098fb6a727667e))
- **admin:** trie des cohorts/date dans les filtres [#2585](https://github.com/betagouv/service-national-universel/issues/2585) ([b48fe8f](https://github.com/betagouv/service-national-universel/commit/b48fe8f595bdb2c358b3ba1b01bfb5e6e39483a6))
- **admin/lib:** export phonenumber formatE164 ([#2581](https://github.com/betagouv/service-national-universel/issues/2581)) ([79b64c4](https://github.com/betagouv/service-national-universel/commit/79b64c413951c0606a8fe12222ed53e35b82acb0))

# [1.267.0](https://github.com/betagouv/service-national-universel/compare/v1.266.0...v1.267.0) (2023-05-08)

### Bug Fixes

- **api:** contract validation ([70c789a](https://github.com/betagouv/service-national-universel/commit/70c789a5a8b29767779b0f45f2c785e599b2dc76))
- **api:** mission es context error ([32d1401](https://github.com/betagouv/service-national-universel/commit/32d14012e39d671e7cb2fd0be1c76bd1f7cbaae6))
- **lib:** inscription end date ([0d7e91d](https://github.com/betagouv/service-national-universel/commit/0d7e91df77bee7032f985620f3ffe8ec9ed1782c))

### Features

- **api/admin:** mission list by structure + clean contexte infinite loop ([#2578](https://github.com/betagouv/service-national-universel/issues/2578)) ([134bbd6](https://github.com/betagouv/service-national-universel/commit/134bbd60e1cb4214c6e852d39fc8d2c7cad1cb41))
- **api/app/admin:** cohort a venir ([#2583](https://github.com/betagouv/service-national-universel/issues/2583)) ([54ffdfe](https://github.com/betagouv/service-national-universel/commit/54ffdfe3c2061e4ad6a7d8dc2ad89f5a5500149d))

# [1.266.0](https://github.com/betagouv/service-national-universel/compare/v1.265.0...v1.266.0) (2023-05-05)

### Bug Fixes

- **admin:** coherence between youngs bus and pdr between screens ([#2577](https://github.com/betagouv/service-national-universel/issues/2577)) ([def091f](https://github.com/betagouv/service-national-universel/commit/def091fdff6222226d48c007311cac1fafbbab2c))
- **admin:** fix parent phone validation ([#2574](https://github.com/betagouv/service-national-universel/issues/2574)) ([ddf47c7](https://github.com/betagouv/service-national-universel/commit/ddf47c769d0cb2b07465709bbfeaf8dc977189d8))
- **api:** get young if structure no longer exists ([844f1af](https://github.com/betagouv/service-national-universel/commit/844f1aff2630240b17734c1cff0e828c329aa6b1))
- **app, admin, api:** Remove apostrophe from file names and revert to 5 Mo limit ([#2576](https://github.com/betagouv/service-national-universel/issues/2576)) ([bc51014](https://github.com/betagouv/service-national-universel/commit/bc51014e97be7b20bcc05e7340485826b67aca41))
- count young on pdr, filter by cohesion stay and depart inform ([3d2bfb7](https://github.com/betagouv/service-national-universel/commit/3d2bfb7074e48f741ab4211c4fe8c97e75a31cba))
- fix bus search from PDR list ([e48a49e](https://github.com/betagouv/service-national-universel/commit/e48a49ed22d9817606877011071b95a6d8b7a717))

### Features

- **admin/api:** liste young-by-center new filters + clean ([#2573](https://github.com/betagouv/service-national-universel/issues/2573)) ([a4b88a5](https://github.com/betagouv/service-national-universel/commit/a4b88a56b3201c6f4cd2fbbe4b448b4660cdec89))
- **api:** Cron - Relance automatique du droit à l’image du RL2 à J-12 et J-2 ([#2572](https://github.com/betagouv/service-national-universel/issues/2572)) ([f7fc1b2](https://github.com/betagouv/service-national-universel/commit/f7fc1b2338f45b13135ba558f94c365416d6c7e4))
- **api:** notification au transporteur lors d'une modif de centre ([#2554](https://github.com/betagouv/service-national-universel/issues/2554)) ([c01d586](https://github.com/betagouv/service-national-universel/commit/c01d5869b8742ef7a5248b66dd6e33e4866207e6))
- **api:** notification transporteur lors d'une modif d'un groupe (create/delete/update) ([#2580](https://github.com/betagouv/service-national-universel/issues/2580)) ([4576a8c](https://github.com/betagouv/service-national-universel/commit/4576a8c5a806d74cd1d2638e530280d57831acc7))
- **api:** notification transporteur lors d'une modif PDR ([#2556](https://github.com/betagouv/service-national-universel/issues/2556)) ([53926a8](https://github.com/betagouv/service-national-universel/commit/53926a8cb359a702375132f74ae53043a18fa065))
- **api/admin:** elasticsearch new system (points de rassemblement) ([#2561](https://github.com/betagouv/service-national-universel/issues/2561)) ([e43d760](https://github.com/betagouv/service-national-universel/commit/e43d760bda3affbcd571e44aeef3f8319aede3a4))
- **api/admin:** elasticsearch new system (school) ([#2564](https://github.com/betagouv/service-national-universel/issues/2564)) ([d00ec82](https://github.com/betagouv/service-national-universel/commit/d00ec82b09619d1f7a2a444adabc693536c9b6cf))

# [1.265.0](https://github.com/betagouv/service-national-universel/compare/v1.264.1...v1.265.0) (2023-05-04)

### Bug Fixes

- **admin:** Breadcrumbs meeting points ([4e4c70f](https://github.com/betagouv/service-national-universel/commit/4e4c70f5e91af8d2df9d099de417ad3f0cbb2cdc))
- **admin:** retour design dashboard engagement ([#2571](https://github.com/betagouv/service-national-universel/issues/2571)) ([f60a2ef](https://github.com/betagouv/service-national-universel/commit/f60a2efb1598fc8ad4d9ae1fd250271f780deb3a))
- **api:** Serialize structure before response in /referent/young ([d24577f](https://github.com/betagouv/service-national-universel/commit/d24577ff9e6982a3880b3d9a2f375e1fd1337847))
- **api:** Serialize structure before response in /referent/young ([f1c7b70](https://github.com/betagouv/service-national-universel/commit/f1c7b70ecf612170c13841c4d91fbd0e70560e67))
- **app:** eligibility updates ([5ae24b7](https://github.com/betagouv/service-national-universel/commit/5ae24b7208dac6b56ac5a1930b8201c8b6b8f3f9))

### Features

- **admin/api:** new filters on mission list ([#2567](https://github.com/betagouv/service-national-universel/issues/2567)) ([c0691b3](https://github.com/betagouv/service-national-universel/commit/c0691b3f6792339f72cbe91e2b19d3aed077e75a))

## [1.264.1](https://github.com/betagouv/service-national-universel/compare/v1.264.0...v1.264.1) (2023-05-03)

### Bug Fixes

- **admin:** retour maquette dashboard general ([f35ff96](https://github.com/betagouv/service-national-universel/commit/f35ff96f3b97ea38776d983dceff28b16878f082))
- **api:** Supprimer les champs superflus lors de la modification de son profil par un volontaire ([#2541](https://github.com/betagouv/service-national-universel/issues/2541)) ([93b353d](https://github.com/betagouv/service-national-universel/commit/93b353d5fe1260e9a5a5a05de9be662a1d64b1f2))
- **app:** fix passport upload ([9135a4c](https://github.com/betagouv/service-national-universel/commit/9135a4cfe8cfb492a3e8e9000ec50deb0cee533f))
- **app/admin:** Improve ID upload ([#2558](https://github.com/betagouv/service-national-universel/issues/2558)) ([b9b2363](https://github.com/betagouv/service-national-universel/commit/b9b236380dd5272869a7113bd933139f33c15c8f))
- **sib:** Put back ip restrictions ([#2566](https://github.com/betagouv/service-national-universel/issues/2566)) ([0c0c22c](https://github.com/betagouv/service-national-universel/commit/0c0c22cd0e09e4623371b188ab4503608bf71d0f))

### Reverts

- Revert "feat(app): add question probleme transport form (#2495)" (#2568) ([4843c73](https://github.com/betagouv/service-national-universel/commit/4843c73b987c9ff353c1a9d80316d5b286c33ca2)), closes [#2495](https://github.com/betagouv/service-national-universel/issues/2495) [#2568](https://github.com/betagouv/service-national-universel/issues/2568)

# [1.264.0](https://github.com/betagouv/service-national-universel/compare/v1.263.0...v1.264.0) (2023-05-02)

### Bug Fixes

- **admin:** nav from pdr to bus ([18591aa](https://github.com/betagouv/service-national-universel/commit/18591aa750d602503b3e96bbd98bd22394f27e0a))
- **api:** Correction du test sur la création des missions ([#2563](https://github.com/betagouv/service-national-universel/issues/2563)) ([442ab9b](https://github.com/betagouv/service-national-universel/commit/442ab9bc4c514acc9b631c7976b0a9d98dd35827))
- young build context ([#2551](https://github.com/betagouv/service-national-universel/issues/2551)) ([ce69c81](https://github.com/betagouv/service-national-universel/commit/ce69c81f14870727da908c28cacd77d5c07352ca))

### Features

- **admin:** disabled head center option in invite modal for ref ([ceb4170](https://github.com/betagouv/service-national-universel/commit/ceb41708f595bc6de366508348e00fb2e2b1cf3b))
- **admin:** Finalisation Dashboard Engagement Modérateur ([#2560](https://github.com/betagouv/service-national-universel/issues/2560)) ([cccda29](https://github.com/betagouv/service-national-universel/commit/cccda29a2e2aa4042d682b0d80b6e64abdf58cef))
- **api:** CRON Envoi du rappel aux réferents la veille de la cloture des instructions ([#2548](https://github.com/betagouv/service-national-universel/issues/2548)) ([28baf46](https://github.com/betagouv/service-national-universel/commit/28baf468fb7cf93ba66eea2e81aac60de0bd0449))

# [1.263.0](https://github.com/betagouv/service-national-universel/compare/v1.262.1...v1.263.0) (2023-05-01)

### Bug Fixes

- Update link SNU 404 error ([#2559](https://github.com/betagouv/service-national-universel/issues/2559)) ([64d81e6](https://github.com/betagouv/service-national-universel/commit/64d81e6855c031efa11a51f8519da3e2dfd848f9))
- **admin:** query search on volontaire and inscription page ([238ce34](https://github.com/betagouv/service-national-universel/commit/238ce346fd657b84cfecd1021dcd5b218750a822))
- **api:** doublon account young ([a040dd3](https://github.com/betagouv/service-national-universel/commit/a040dd3d11746b5b6070f452c7386d7879282257))

### Features

- **admin/dashboard:** full redirection on dashboard sejour / inscription ([#2530](https://github.com/betagouv/service-national-universel/issues/2530)) ([48f77f5](https://github.com/betagouv/service-national-universel/commit/48f77f55bc43104e230953faf19403826c5e9ef9))
- **api:** import correspondance aller et retour ([#2540](https://github.com/betagouv/service-national-universel/issues/2540)) ([3ba93ac](https://github.com/betagouv/service-national-universel/commit/3ba93ac0ee28cfc79f36fcc4d1d42639cdb6ac34))
- **api, admin:** Update des droits des transporters sur les centres et les PDR ([#2552](https://github.com/betagouv/service-national-universel/issues/2552)) ([b77b6e3](https://github.com/betagouv/service-national-universel/commit/b77b6e3ffbd82e7804ef7d40af4381fccb261f37))

## [1.262.1](https://github.com/betagouv/service-national-universel/compare/v1.262.0...v1.262.1) (2023-04-28)

### Bug Fixes

- **api:** update mission missing import and verif ([24d58fa](https://github.com/betagouv/service-national-universel/commit/24d58fad662f8270237c5892f1ccc21f89da957f))
- **app:** waitingCorrection if no correctionRequest ([e1f4996](https://github.com/betagouv/service-national-universel/commit/e1f49960a11b0624f496ee03583692cd4822b431))
- **lib:** Réparer la fonction d'autorisation de changement de session ([#2555](https://github.com/betagouv/service-national-universel/issues/2555)) ([f545a88](https://github.com/betagouv/service-national-universel/commit/f545a883551ad1c980dd83742c1bdbe42ca3b077))
- **test:** fix mission put test probleme date ([#2553](https://github.com/betagouv/service-national-universel/issues/2553)) ([b468974](https://github.com/betagouv/service-national-universel/commit/b468974c197f02197f323232055163fe19245467))

# [1.262.0](https://github.com/betagouv/service-national-universel/compare/v1.261.0...v1.262.0) (2023-04-27)

### Bug Fixes

- **api:** tutor name for missions ([#2547](https://github.com/betagouv/service-national-universel/issues/2547)) ([1f55c4d](https://github.com/betagouv/service-national-universel/commit/1f55c4d56a15f4b4e24dcb0f71c8160c2c60dd91))
- **app:** display parent info on profil page ([ab2fb12](https://github.com/betagouv/service-national-universel/commit/ab2fb1262d3f4472ffff9a6e5dbe8483b6f170be))
- **app:** parent form reset ([695fa5d](https://github.com/betagouv/service-national-universel/commit/695fa5d1831ef6501cb0c2bdba29bcc1bf3c0c74))
- **app/api:** Amélio gestion d'erreur uploads ([#2545](https://github.com/betagouv/service-national-universel/issues/2545)) ([212a0be](https://github.com/betagouv/service-national-universel/commit/212a0bea1ea63939677d9bde264740efe8906c73))

### Features

- **app:** Inscription - Etape téléversement - Dissocier les uploads du recto et du verso de la CNI sur desktop ([#2544](https://github.com/betagouv/service-national-universel/issues/2544)) ([247b72d](https://github.com/betagouv/service-national-universel/commit/247b72d350f220e18eebe6cf34dfd4b2590777b4))

# [1.261.0](https://github.com/betagouv/service-national-universel/compare/v1.260.0...v1.261.0) (2023-04-26)

### Bug Fixes

- **api:** dont check if session isFull for reinscription ([#2543](https://github.com/betagouv/service-national-universel/issues/2543)) ([83783db](https://github.com/betagouv/service-national-universel/commit/83783db78f2272c238e06aeafb4f79ea91c8dc5a))
- **app:** Account - Do not change birthdate locale in initial form values ([84c7614](https://github.com/betagouv/service-national-universel/commit/84c7614b8fb67d07d56dc6d78c18742703e8ab0a))
- **app:** probleme de cache sentry ([#2542](https://github.com/betagouv/service-national-universel/issues/2542)) ([58e09d7](https://github.com/betagouv/service-national-universel/commit/58e09d7f735030c86a8a6790761e7c5f838c7ffb))
- **app:** reversed firstname lastname on profil page ([2d6940b](https://github.com/betagouv/service-national-universel/commit/2d6940b02c7cc847523a27f2b301dffe2e29e033))
- fix missing region to avoid crash ([868f6bb](https://github.com/betagouv/service-national-universel/commit/868f6bbb00ee5cc7413385670d37c5612515f14f))

### Features

- add step point typs in model ([e8c6381](https://github.com/betagouv/service-national-universel/commit/e8c6381184ebdccd175083457aaa941a6ce8d91f))

# [1.260.0](https://github.com/betagouv/service-national-universel/compare/v1.259.0...v1.260.0) (2023-04-25)

### Bug Fixes

- **api:** bug delete cohort in pdr ([#2535](https://github.com/betagouv/service-national-universel/issues/2535)) ([2411434](https://github.com/betagouv/service-national-universel/commit/24114345a8cad99a26cf9868ce9922f033855960))
- **api:** first names where incorrectly transformed (émile changed to éMile) ([#2533](https://github.com/betagouv/service-national-universel/issues/2533)) ([71e3380](https://github.com/betagouv/service-national-universel/commit/71e3380fb8112bde33035c053b56ea26c9927179))
- **app:** Allow youngs from DOM to make corrections ([b81be5b](https://github.com/betagouv/service-national-universel/commit/b81be5bdfa17d53a7204f0dbf2a47b7904c74afc))
- **app:** better error handling for file upload during signup ([efa0006](https://github.com/betagouv/service-national-universel/commit/efa0006c9359c8224efd62c01b8812cfc9414309))
- **app:** linter errors ([#2405](https://github.com/betagouv/service-national-universel/issues/2405)) ([5ad93dd](https://github.com/betagouv/service-national-universel/commit/5ad93ddc70a8b779ccad9b1c7b4f95c8faae755f))
- **app:** Simplifier la structure du CSS sur l'écran Phase 1/Affecté ([#2470](https://github.com/betagouv/service-national-universel/issues/2470)) ([af78ea5](https://github.com/betagouv/service-national-universel/commit/af78ea578ab7e469610a6b1678b15efe68ce0300))

### Features

- **admin:** Ajout du champs "voyage en avion" sur la page phase 1 d'un volontaire ([#2525](https://github.com/betagouv/service-national-universel/issues/2525)) ([a2fa06d](https://github.com/betagouv/service-national-universel/commit/a2fa06d271a1aa725f320820749ebb9f8b846a22))
- **admin:** Paramétrage dynamique des demandes de correction du plan de transport ([#2521](https://github.com/betagouv/service-national-universel/issues/2521)) ([74d6df2](https://github.com/betagouv/service-national-universel/commit/74d6df2eadbdbc51940d4f736f30918de3a6c157))
- **app:** Nouvelle page de profil volontaire ([#2538](https://github.com/betagouv/service-national-universel/issues/2538)) ([2b388f3](https://github.com/betagouv/service-national-universel/commit/2b388f3e1ada6cf58101d731c30c962f9a684fa3))

# [1.259.0](https://github.com/betagouv/service-national-universel/compare/v1.258.0...v1.259.0) (2023-04-24)

### Bug Fixes

- **api:** add try catch logout route ([#2532](https://github.com/betagouv/service-national-universel/issues/2532)) ([61e90c3](https://github.com/betagouv/service-national-universel/commit/61e90c379b777b11f5c7380dbef813d7c53e855a))

### Features

- list bus with new system + allow export only some fields + allow custom aggs query + limit params to 200 + simplify export title ([#2491](https://github.com/betagouv/service-national-universel/issues/2491)) ([212f884](https://github.com/betagouv/service-national-universel/commit/212f884c913fb61dc949c5e1c3741e36d6e169a6))

# [1.258.0](https://github.com/betagouv/service-national-universel/compare/v1.257.0...v1.258.0) (2023-04-21)

### Bug Fixes

- **app:** Autoriser temporairement les volontaires en cours de juin des DROM à accéder à la page d'inscription ([#2527](https://github.com/betagouv/service-national-universel/issues/2527)) ([dca2b5f](https://github.com/betagouv/service-national-universel/commit/dca2b5ff12550bab47b1d2fefe34efb7bc08658a))

### Features

- **lib, admin:** Ajout d'informations sur le trajet dans l'export des volontaires ([f5f10ea](https://github.com/betagouv/service-national-universel/commit/f5f10ea0a01fd3b5c35ac00a2db52d6a50778e5f))

# [1.257.0](https://github.com/betagouv/service-national-universel/compare/v1.256.0...v1.257.0) (2023-04-20)

### Bug Fixes

- **admin:** correction du contrôle de la capacité de volontaires sur plan de transport ([#2518](https://github.com/betagouv/service-national-universel/issues/2518)) ([6aa613f](https://github.com/betagouv/service-national-universel/commit/6aa613f0ec2abe7954b7a1c862db6befe2204901))
- **admin:** Correction legendURl sur les FullDoughnut ([#2522](https://github.com/betagouv/service-national-universel/issues/2522)) ([ab37853](https://github.com/betagouv/service-national-universel/commit/ab37853b1c9e936de3e19fb8dcd5caa3ab54376e))
- **api:** dont check is session is full at inscription ([#2517](https://github.com/betagouv/service-national-universel/issues/2517)) ([f8535f9](https://github.com/betagouv/service-national-universel/commit/f8535f954a684a6b7846668abfd6f6b03b6af83a))
- **app:** inscription birth country select ([#2523](https://github.com/betagouv/service-national-universel/issues/2523)) ([520af7c](https://github.com/betagouv/service-national-universel/commit/520af7cedc5eed2fd34b4104d645256c143d4e5c))
- **app:** Optimisation des performances de sélection d'établissement scolaire lors de la pré-inscription ([#2519](https://github.com/betagouv/service-national-universel/issues/2519)) ([c0d93e7](https://github.com/betagouv/service-national-universel/commit/c0d93e71a44525b0491845fcfd3bbfa1b194cbce))
- **lib:** set july inscription end time to 23:59 ([fd68884](https://github.com/betagouv/service-national-universel/commit/fd68884ed2b8c80c1631b7319703401bb4d8adc2))

### Features

- **admin/api:** Update listes des volontaires depuis les centres / les PDR / les lignes de bus ([#2516](https://github.com/betagouv/service-national-universel/issues/2516)) ([b67ed95](https://github.com/betagouv/service-national-universel/commit/b67ed958925118f11ac0ee3c28793dfe286603f8))
- **api/admin:** Add returnHour to young export ([#2526](https://github.com/betagouv/service-national-universel/issues/2526)) ([74a5297](https://github.com/betagouv/service-national-universel/commit/74a52974f1f9efbf2a9f08020deae391ba1d703b))

# [1.256.0](https://github.com/betagouv/service-national-universel/compare/v1.255.0...v1.256.0) (2023-04-19)

### Bug Fixes

- **api:** Add check for parent1 image rights authorization when parent2 responds ([b87de5c](https://github.com/betagouv/service-national-universel/commit/b87de5c8018e7433179ff6228ecbe91bebdf7547))
- **api:** Fix check for parent1 image rights ([5069667](https://github.com/betagouv/service-national-universel/commit/50696670a19cc2af6394ab0dce071864a76e5dec))
- **api:** update application tutor on mission tutor change ([#2512](https://github.com/betagouv/service-national-universel/issues/2512)) ([64c98b0](https://github.com/betagouv/service-national-universel/commit/64c98b03775516526ed31bb2b7076a10a5273e1f))

### Features

- **api:** getTutorName service ([c0c4ab7](https://github.com/betagouv/service-national-universel/commit/c0c4ab7681b71329011af4562b7f435406807094))

# [1.255.0](https://github.com/betagouv/service-national-universel/compare/v1.254.0...v1.255.0) (2023-04-18)

### Bug Fixes

- **admin:** Ajout de la "propriété modifiée" dans l'export du plan de transport ([#2506](https://github.com/betagouv/service-national-universel/issues/2506)) ([b1966e9](https://github.com/betagouv/service-national-universel/commit/b1966e92fb57a07c951f04a61a7744d885855ea7))
- **admin:** Fix eligibility for not scolarise ([204e0b5](https://github.com/betagouv/service-national-universel/commit/204e0b5d1a00f48b0bdf164fe8cab0e83c5963b7))
- **admin:** History - Display entire field name on hover ([6b33537](https://github.com/betagouv/service-national-universel/commit/6b335370e410685af6087c99b1adeb70e541c0d2))
- **api:** Add index on ligneId ([0260d81](https://github.com/betagouv/service-national-universel/commit/0260d8130fb5c42e11d264177f5cde16edc74256))
- **api:** Correction connexion depuis JVA ([2f247fe](https://github.com/betagouv/service-national-universel/commit/2f247fee17ff28e26054bf4915f65f0111510ebb))
- **api:** Correction de la récupération des filtres sur l'historique du plan de transport + petite correction sur le filtre des users ([#2505](https://github.com/betagouv/service-national-universel/issues/2505)) ([56dc343](https://github.com/betagouv/service-national-universel/commit/56dc343e0c671c20a7673207c1c6cbd2cc74f844))
- **api:** Correction token jva ([6eb7660](https://github.com/betagouv/service-national-universel/commit/6eb76604d88e43117279e226893af9721788b528))
- **api:** fix signin controllers get token ([#2508](https://github.com/betagouv/service-national-universel/issues/2508)) ([9d64969](https://github.com/betagouv/service-national-universel/commit/9d64969ec902fd957aa310b49ca024a7a06e5112))
- **api:** Je veux aider correction protection token ([38d0097](https://github.com/betagouv/service-national-universel/commit/38d00976fa6e1d5cf79d58ca69cd14f0e55b04c9))
- **app:** Clarification de certains termes dans le processus de pré-inscription ([#2503](https://github.com/betagouv/service-national-universel/issues/2503)) ([07d76ea](https://github.com/betagouv/service-national-universel/commit/07d76ea3cbdfc6ef52863a0ee2b441121c0ac801))

### Features

- **admin:** Configurer le paramétrage dynamique de l'édition des PDR ([#2490](https://github.com/betagouv/service-national-universel/issues/2490)) ([e7283a3](https://github.com/betagouv/service-national-universel/commit/e7283a378bde7641d717e7697f991748ae4ffa01))
- **admin,api:** Ajout d'un bouton d'export de l'historique des lignes de bus pour les Admin ([#2504](https://github.com/betagouv/service-national-universel/issues/2504)) ([e1be055](https://github.com/betagouv/service-national-universel/commit/e1be05527bccb19161d6aeff97ddc4c08524d26a))

# [1.254.0](https://github.com/betagouv/service-national-universel/compare/v1.253.1...v1.254.0) (2023-04-17)

### Bug Fixes

- **admin:** Volontaire/Phase 0 - Reset verify address button on change ([5853745](https://github.com/betagouv/service-national-universel/commit/5853745a2ef167ba11e9a0293e37d3cd23681a61))
- **api:** mission date test ([896c6df](https://github.com/betagouv/service-national-universel/commit/896c6dfd6a86806db5a6234177525bfb82136c9b))
- **api:** mission date test ([b7fd9a0](https://github.com/betagouv/service-national-universel/commit/b7fd9a02813273e7969c3d670afa3ae82f390934))
- **api:** mission dates ([#2498](https://github.com/betagouv/service-national-universel/issues/2498)) ([5cfc6a4](https://github.com/betagouv/service-national-universel/commit/5cfc6a4de1986570239b4bfd48f446febdb149f4))
- **api:** Temporarily remove geography filter for refs ([2578f74](https://github.com/betagouv/service-national-universel/commit/2578f746727e89753c0eda7c1c53f13cb0d8a9d8))
- **app:** Suggestion ville de naissance ([7c3e688](https://github.com/betagouv/service-national-universel/commit/7c3e688689e93fbc242e5bff7678dd9be40f177d))

### Features

- **admin:** Dashboard : ouverture des legendUrls dans un nouvel onglet ([#2489](https://github.com/betagouv/service-national-universel/issues/2489)) ([dbecac7](https://github.com/betagouv/service-national-universel/commit/dbecac7fddc8f0e5ce68a76ec515530582d9a0e9))
- **lib:** eligibility param for juin 2023 ([#2496](https://github.com/betagouv/service-national-universel/issues/2496)) ([2f330b6](https://github.com/betagouv/service-national-universel/commit/2f330b60e593a6ec2ca823f74bb6e245c86336e0))

## [1.253.1](https://github.com/betagouv/service-national-universel/compare/v1.253.0...v1.253.1) (2023-04-16)

### Bug Fixes

- **app:** view convo ([57aebca](https://github.com/betagouv/service-national-universel/commit/57aebca388f28e8df13d3843b69e8f91dd092066))

# [1.253.0](https://github.com/betagouv/service-national-universel/compare/v1.252.0...v1.253.0) (2023-04-15)

### Bug Fixes

- **app:** address api ([cd24fae](https://github.com/betagouv/service-national-universel/commit/cd24faefbdc2c59a23f3c2dbeddba22d7190b07b))
- **app:** New line for monday ([f7991a0](https://github.com/betagouv/service-national-universel/commit/f7991a06e0fd65f5ad30866544ac36e97f79e79a))

### Features

- **app:** add question probleme transport form ([#2495](https://github.com/betagouv/service-national-universel/issues/2495)) ([cc71eeb](https://github.com/betagouv/service-national-universel/commit/cc71eebe7c43f3e2955ff60fa1f1d4fa9830330b))
- **app:** modal warning bus prb ([#2494](https://github.com/betagouv/service-national-universel/issues/2494)) ([1e96ba9](https://github.com/betagouv/service-national-universel/commit/1e96ba9ef0454470a06fd31df995ecccd7ecaea3))
- **app:** New modal for line delayed to monday ([98b88df](https://github.com/betagouv/service-national-universel/commit/98b88dff0dcaecf14e14784cedf204e7179e4c6e))

# [1.252.0](https://github.com/betagouv/service-national-universel/compare/v1.251.0...v1.252.0) (2023-04-14)

### Bug Fixes

- **api:** convo date transport ([#2492](https://github.com/betagouv/service-national-universel/issues/2492)) ([32fadbf](https://github.com/betagouv/service-national-universel/commit/32fadbf8f11ba3eb8baa5698d8affbdd9d50cb8f))
- **app, admin:** Améliorer la saisie d'adresses en Polynésie (mise en prod) ([#2486](https://github.com/betagouv/service-national-universel/issues/2486)) ([f54371d](https://github.com/betagouv/service-national-universel/commit/f54371d79a0962c15210e2aa9b696f4a160e6f21))
- string for all filters ([502599b](https://github.com/betagouv/service-national-universel/commit/502599bf1c4c9069b67264f440ce672a200769c1))
- **api:** Allow refs to update session places ([f222401](https://github.com/betagouv/service-national-universel/commit/f222401d4148b16fe436b13f1231832d9e1773c1))
- update node to 18 ([#2487](https://github.com/betagouv/service-national-universel/issues/2487)) ([766c348](https://github.com/betagouv/service-national-universel/commit/766c3484e8a124cef5b06162a411f3d9338cec71))

### Features

- **poc:** es queries backend ([#2463](https://github.com/betagouv/service-national-universel/issues/2463)) ([0aed0ee](https://github.com/betagouv/service-national-universel/commit/0aed0ee7bfe59e44ad452d8cc71fc65d4ad8a8cf))

# [1.251.0](https://github.com/betagouv/service-national-universel/compare/v1.250.0...v1.251.0) (2023-04-13)

### Bug Fixes

- **admin:** Interdire aux référents d'un autre département/région de modifier un PDR ([#2460](https://github.com/betagouv/service-national-universel/issues/2460)) ([f9d869b](https://github.com/betagouv/service-national-universel/commit/f9d869bab323ac35572d6da7a11c6d0fc79441c9))
- **api/admin:** access to young list ([#2485](https://github.com/betagouv/service-national-universel/issues/2485)) ([eeb57b4](https://github.com/betagouv/service-national-universel/commit/eeb57b43b322253d73a3291546d65fe100472c60))
- **app:** Amélioration de la reconnaissance des adresses des communes associées en Polynésie (staging only) ([#2483](https://github.com/betagouv/service-national-universel/issues/2483)) ([b045108](https://github.com/betagouv/service-national-universel/commit/b0451080d405632a369f87760da09491f872a642))
- **app:** contract update by supervisors ([d839dca](https://github.com/betagouv/service-national-universel/commit/d839dcadca17735601a696283cf026fae747678e))
- **app:** correction adaptabilité bloc demande reconnaissance engagement et correction erreurs de syntaxe ([#2484](https://github.com/betagouv/service-national-universel/issues/2484)) ([f9a8bf5](https://github.com/betagouv/service-national-universel/commit/f9a8bf5b6d22171a364a2dbbca8a3f69cb127c8b))
- **app:** further improve address search ([843dead](https://github.com/betagouv/service-national-universel/commit/843dead81c22c7b66537de78f4619a6b94e39ce0))
- **test:** FranceConnect security ([#2474](https://github.com/betagouv/service-national-universel/issues/2474)) ([357b30b](https://github.com/betagouv/service-national-universel/commit/357b30b0624c259a16d617a262520e78cf18da77))

### Features

- **admin,api:** Tooltips et panels sur le dashboard ([#2482](https://github.com/betagouv/service-national-universel/issues/2482)) ([0379ebd](https://github.com/betagouv/service-national-universel/commit/0379ebd14957c6cdf2ca6b2f7261cfcad1f78038))

# [1.250.0](https://github.com/betagouv/service-national-universel/compare/v1.249.0...v1.250.0) (2023-04-12)

### Bug Fixes

- **api:** Warning pdf ([094f07f](https://github.com/betagouv/service-national-universel/commit/094f07feb8551cde2e7cda8be291d460b6138a95))
- **app:** isCohortDone for old cohort ([6ec1c2e](https://github.com/betagouv/service-national-universel/commit/6ec1c2e6bcb1f675b5c5d3f87093f208f4856efe))

### Features

- **admin:** dashboard inscription liste établissement ([#2477](https://github.com/betagouv/service-national-universel/issues/2477)) ([c4431d6](https://github.com/betagouv/service-national-universel/commit/c4431d65da6eaf4ec9a130e5a7538c1b4159a063))
- **admin:** export report dashboard inscription ([054eca9](https://github.com/betagouv/service-national-universel/commit/054eca9b2be85dee1572f99645705950dc7252cf))
- **admin:** Paramétrage dynamique - Gestion des droits d'édition de session phase 1 ([#2478](https://github.com/betagouv/service-national-universel/issues/2478)) ([6e0815e](https://github.com/betagouv/service-national-universel/commit/6e0815e49bfc05434e5caef316768c7c9c140bd2))
- **app:** Désactivation du bouton de reconnaissance d'engagement pour les volontaires en cours de phase 1 ([#2475](https://github.com/betagouv/service-national-universel/issues/2475)) ([0819201](https://github.com/betagouv/service-national-universel/commit/0819201b24e387a65f587d7d4fff4781df789fa0))

# [1.249.0](https://github.com/betagouv/service-national-universel/compare/v1.248.1...v1.249.0) (2023-04-11)

### Bug Fixes

- **admin:** Ouvrir les droits d’inscription a certaines situations ([#2473](https://github.com/betagouv/service-national-universel/issues/2473)) ([b8118be](https://github.com/betagouv/service-national-universel/commit/b8118bebb80f9470c90f3997c5eb77a62b7b53ff))
- **api:** cohort eligibility debug ([7303955](https://github.com/betagouv/service-national-universel/commit/7303955cf828f44ca1fff19d8c417449b9e7649f))
- **api:** remove console.log ([f6b43f2](https://github.com/betagouv/service-national-universel/commit/f6b43f20a2e471b21258b8070b4820b2985b098c))

### Features

- **admin,api:** Dashboard engagement ([#2468](https://github.com/betagouv/service-national-universel/issues/2468)) ([6a2ccf1](https://github.com/betagouv/service-national-universel/commit/6a2ccf1f1c028135f9506c9f63843d2ee87846fe))

### Reverts

- Revert "fix(api): france connect state (#2449)" ([e1a66c9](https://github.com/betagouv/service-national-universel/commit/e1a66c9d8818c107831a7859fd13a7a5e561e020)), closes [#2449](https://github.com/betagouv/service-national-universel/issues/2449)

## [1.248.1](https://github.com/betagouv/service-national-universel/compare/v1.248.0...v1.248.1) (2023-04-10)

### Bug Fixes

- **admin:** Typo ([158942e](https://github.com/betagouv/service-national-universel/commit/158942e959b2fb74d2e87abee29196b3373e41d1))
- **api:** young app change cohort ([05dfc67](https://github.com/betagouv/service-national-universel/commit/05dfc67591bf8ef5f69f9a658367bf823ff49dca))

# [1.248.0](https://github.com/betagouv/service-national-universel/compare/v1.247.1...v1.248.0) (2023-04-07)

### Bug Fixes

- **api:** france connect state ([#2449](https://github.com/betagouv/service-national-universel/issues/2449)) ([bac1eac](https://github.com/betagouv/service-national-universel/commit/bac1eac5ba2732fc046529a4ab18e004abf8e6ac))
- **app/api:** cohort filling rate check ([#2469](https://github.com/betagouv/service-national-universel/issues/2469)) ([da18bd2](https://github.com/betagouv/service-national-universel/commit/da18bd23765ec43e08223746540d2042d5776f18))

### Features

- **admin:** amélioration de la vue détaillée par région accueillies sur la table de répartition et ajout de l'export de données ([#2467](https://github.com/betagouv/service-national-universel/issues/2467)) ([439538d](https://github.com/betagouv/service-national-universel/commit/439538d7816bf63cde0dd639190a94c0b709177b))
- **admin:** Plan de transport - Export des volontaires par ligne de bus ([#2466](https://github.com/betagouv/service-national-universel/issues/2466)) ([4fa51df](https://github.com/betagouv/service-national-universel/commit/4fa51df0212807edb2d0e80ff52e7d32d0ca038f))

## [1.247.1](https://github.com/betagouv/service-national-universel/compare/v1.247.0...v1.247.1) (2023-04-06)

### Bug Fixes

- **admin:** accès en lecture seule aux données des autres régions du territoire par le référents régionaux ([#2465](https://github.com/betagouv/service-national-universel/issues/2465)) ([87200f9](https://github.com/betagouv/service-national-universel/commit/87200f9f598c7fc3a64e5cc9928a92af93f11081))
- **admin/lib:** mission young list export ([7430b02](https://github.com/betagouv/service-national-universel/commit/7430b0297edd6ed5d96d9595ed856077bd19c078))
- **lib:** Sémantique accès bloqué ([7c2643c](https://github.com/betagouv/service-national-universel/commit/7c2643c295b2d35180b2973a570afc695c438506))

# [1.247.0](https://github.com/betagouv/service-national-universel/compare/v1.246.1...v1.247.0) (2023-04-05)

### Features

- **admin:** affichage des codes départementaux ([#2464](https://github.com/betagouv/service-national-universel/issues/2464)) ([1aa8287](https://github.com/betagouv/service-national-universel/commit/1aa828738cd768bd74d9fbed74a757ef08a1d081))
- **admin:** dashboard inscription ([#2438](https://github.com/betagouv/service-national-universel/issues/2438)) ([f2248c5](https://github.com/betagouv/service-national-universel/commit/f2248c530cd37b2f920443016fa0c96f76203a97))

## [1.246.1](https://github.com/betagouv/service-national-universel/compare/v1.246.0...v1.246.1) (2023-04-04)

### Bug Fixes

- **api:** Reduce pool size mongo on prod ([647b94b](https://github.com/betagouv/service-national-universel/commit/647b94bfbae9eb358cd67d32f944944c62679fe2))
- **app:** remove missing referentManagerPhase2 alert ([9d77600](https://github.com/betagouv/service-national-universel/commit/9d77600cb43c2dfcf2fecd4f814fc8f530ffb601))
- **sib:** Lower send in blue mongoDB connection ([6dcfe65](https://github.com/betagouv/service-national-universel/commit/6dcfe65054552fc62c8c0d05bc5f55a9395f7c35))

# [1.246.0](https://github.com/betagouv/service-national-universel/compare/v1.245.0...v1.246.0) (2023-04-03)

### Bug Fixes

- **admin:** school select display when null ([75322c9](https://github.com/betagouv/service-national-universel/commit/75322c9fbe1aa51130928e5371bdaeb1c55aac2f))
- **admin:** liste demande de modifications ([2429eb9](https://github.com/betagouv/service-national-universel/commit/2429eb91a7c3a05226e7848b2531f372bb411abd))
- **admin:** session redirect ([0a93220](https://github.com/betagouv/service-national-universel/commit/0a93220b8d7199557ba7deaba25d1bebf118939f))
- **app:** correction d'une faute de conjugaison lors du choix de moyen de transport ([#2462](https://github.com/betagouv/service-national-universel/issues/2462)) ([826933f](https://github.com/betagouv/service-national-universel/commit/826933f8f966f3b36a4c20caaa78b37704433fe0))
- **app:** navbar ([9b4e700](https://github.com/betagouv/service-national-universel/commit/9b4e7009c62d8286b836f7b4b854571305aeca62))
- **app:** phase recap visual fix ([4ab2bb5](https://github.com/betagouv/service-national-universel/commit/4ab2bb550b5c35f18c38f39d41d584abc7d0e899))

### Features

- **admin:** demande liste modification bus / PDR by young + logique filter with defaultUrlParm ([#2461](https://github.com/betagouv/service-national-universel/issues/2461)) ([a9a4c70](https://github.com/betagouv/service-national-universel/commit/a9a4c7013005f5e64af904d75ded3756e614a4d6))
- **admin:** fix export plan de transport + new filters on list young by bus ([333bc41](https://github.com/betagouv/service-national-universel/commit/333bc41012a39fa488d78e45ed60cf220eb46f1b))
- **admin:** Permettre aux référents d'ajouter manuellement une école ([2e36fa2](https://github.com/betagouv/service-national-universel/commit/2e36fa2c43a3e36c9a3bbb635bdc71dae15ea0db))
- **app, admin:** Ajouter de nouveaux types d'engagements MIG ([#2455](https://github.com/betagouv/service-national-universel/issues/2455)) ([0b2fcab](https://github.com/betagouv/service-national-universel/commit/0b2fcab725ed570ff9a7d6589161c11d7dbe2f52))

# [1.245.0](https://github.com/betagouv/service-national-universel/compare/v1.244.0...v1.245.0) (2023-03-31)

### Bug Fixes

- **admin:** fill rate at user create ([#2439](https://github.com/betagouv/service-national-universel/issues/2439)) ([f011dbe](https://github.com/betagouv/service-national-universel/commit/f011dbe2dfd55781197370d12a422662925e4ce1))
- tentative de fix author ([#2456](https://github.com/betagouv/service-national-universel/issues/2456)) ([28b5491](https://github.com/betagouv/service-national-universel/commit/28b5491bf717ba4af23e54a5917a80a81d3cb09e))
- **admin:** export disabled label ([9ec71d9](https://github.com/betagouv/service-national-universel/commit/9ec71d9186332b211d3d9a6f4afe42ef85d51ae0))

### Features

- **admin:** new filters on PDT ([#2457](https://github.com/betagouv/service-national-universel/issues/2457)) ([f0e686b](https://github.com/betagouv/service-national-universel/commit/f0e686bf70ade4f95e8d3eeba280f2ee299edde2))

# [1.244.0](https://github.com/betagouv/service-national-universel/compare/v1.243.0...v1.244.0) (2023-03-30)

### Bug Fixes

- **admin/api:** ajout du nouveau logo SNU ([#2450](https://github.com/betagouv/service-national-universel/issues/2450)) ([582fd1e](https://github.com/betagouv/service-national-universel/commit/582fd1eafa0fdc17ebf8265ed3e3994ec398ab3e))
- **analytics:** remove object sync ([#2432](https://github.com/betagouv/service-national-universel/issues/2432)) ([9b568ac](https://github.com/betagouv/service-national-universel/commit/9b568ac92db6f08619eb7d700d4b472b3a0500aa))
- **api:** add access young with cohort in region/department ([#2445](https://github.com/betagouv/service-national-universel/issues/2445)) ([dec1886](https://github.com/betagouv/service-national-universel/commit/dec18868641b6c031ad086bf599270e7017f89ef))
- **api:** convocation corse ([b6da252](https://github.com/betagouv/service-national-universel/commit/b6da252d3cd2901c57ceef988f8277181ecc1176))
- **api:** correction de la suppression inattendue des numéros de téléphone à la validation d'un jeune inscrit ([#2451](https://github.com/betagouv/service-national-universel/issues/2451)) ([a0f20c9](https://github.com/betagouv/service-national-universel/commit/a0f20c95bceaee5037882c09a14aa274c0494786))
- **app:** visualisation convocation en corse ([a5b2c9a](https://github.com/betagouv/service-national-universel/commit/a5b2c9a612cebc89c11ad23141c048b7716665c8))
- **app/admin:** changement du nom de la zone téléphonique "France" à "France métropolitaine" ([#2447](https://github.com/betagouv/service-national-universel/issues/2447)) ([1b39fc6](https://github.com/betagouv/service-national-universel/commit/1b39fc629b1b1ff9968fd6856609fdd9c9dec95d))
- **app/admin:** Nouvelle favicon du SNU ([#2452](https://github.com/betagouv/service-national-universel/issues/2452)) ([13e4f4b](https://github.com/betagouv/service-national-universel/commit/13e4f4b37a4bf4982733242980a62f6aa63d2d7b))
- **knowledge:** changement logo snu ([#2411](https://github.com/betagouv/service-national-universel/issues/2411)) ([bb66f7c](https://github.com/betagouv/service-national-universel/commit/bb66f7c35b1e43ee24f84eb84979106424cfab83))
- clean code mort zammad ([#2444](https://github.com/betagouv/service-national-universel/issues/2444)) ([eca8ba3](https://github.com/betagouv/service-national-universel/commit/eca8ba340ede67c661486a7f4a41acc39078f445))

### Features

- **admin:** ajout d'un champ de confirmation sur la modale de suppression des volontaires et inscrits ([#2441](https://github.com/betagouv/service-national-universel/issues/2441)) ([7a20ee3](https://github.com/betagouv/service-national-universel/commit/7a20ee3a6e84f577282479f00193d4cf1afbfb12))
- **admin/api:** Ajout des paramètres dynamiques " Création de groupe" et "Téléchargement" sur le schéma de répartition ([#2448](https://github.com/betagouv/service-national-universel/issues/2448)) ([905ea27](https://github.com/betagouv/service-national-universel/commit/905ea279d169ca53b4bde705971f53413103d641))
- **analytics:** proof of concept for stats ([#2408](https://github.com/betagouv/service-national-universel/issues/2408)) ([b5a24c6](https://github.com/betagouv/service-national-universel/commit/b5a24c6bea8831f166f66ac76f50315bf4a4e09a))
- **app/api:** add new ticket field ([#2431](https://github.com/betagouv/service-national-universel/issues/2431)) ([d112d9a](https://github.com/betagouv/service-national-universel/commit/d112d9a2ff8fa1b1b0e096cb313879210d2be374))

# [1.243.0](https://github.com/betagouv/service-national-universel/compare/v1.242.0...v1.243.0) (2023-03-29)

### Bug Fixes

- **admin:** improve searchbar filter (add to aggreg) ([1d46e1a](https://github.com/betagouv/service-national-universel/commit/1d46e1a300d50fa0e8dfa6084f27c0d21f2fe344))
- **admin:** improve searchbar filters ([12973f1](https://github.com/betagouv/service-national-universel/commit/12973f1698b88624c77b73a1e0a0771be7647df7))
- **admin:** intégration des préfixes téléphoniques dans les exports xlsx des volontaires et des inscriptions ([#2430](https://github.com/betagouv/service-national-universel/issues/2430)) ([241a354](https://github.com/betagouv/service-national-universel/commit/241a354aee3a25200245db625374a29c16434dc4))
- **admin/app:** take tutor name update into account on contrats ([#2435](https://github.com/betagouv/service-national-universel/issues/2435)) ([9313859](https://github.com/betagouv/service-national-universel/commit/9313859abd6c7486c8f76cfa7baa494204cfb3d6))
- **api:** import plan de transport deleted PDR ([fb0f1c0](https://github.com/betagouv/service-national-universel/commit/fb0f1c025046d98b77a2f47f79fff1af8c70e7bd))
- **app:** ajout des préfixes téléphoniques sur le récapitulatif d'inscription ([#2437](https://github.com/betagouv/service-national-universel/issues/2437)) ([954caee](https://github.com/betagouv/service-national-universel/commit/954caeedb313fcfeb5f89dd59d35d903be4921ff))
- **app:** enable checkbox again on coordinates page ([18eaa83](https://github.com/betagouv/service-national-universel/commit/18eaa836cb247f7e6293377f1c4b8146f9f188a6))
- **app/admin:** correction des noms des zones géographiques liées aux préfixes téléphoniques ([#2442](https://github.com/betagouv/service-national-universel/issues/2442)) ([be50839](https://github.com/betagouv/service-national-universel/commit/be508393ee1780c29213b892c8a15aec223494b3))
- **app/admin:** corrections sur le sélecteur de préfixes sur les champs téléphones ([#2436](https://github.com/betagouv/service-national-universel/issues/2436)) ([e70d8f0](https://github.com/betagouv/service-national-universel/commit/e70d8f04b44538ab7bed23d540ca4c0b3109f3cb))

### Features

- **admin:** add external filters to filter system ([6205bb8](https://github.com/betagouv/service-national-universel/commit/6205bb817846d046cd95d182609103ee8177e5ce))
- **admin:** dashboard logique filtre region / dep / academy ([#2440](https://github.com/betagouv/service-national-universel/issues/2440)) ([24ae724](https://github.com/betagouv/service-national-universel/commit/24ae72434b89488daf79496a39adc7e6f442c0dc))
- **admin:** Dashboard séjour liste presence ([#2428](https://github.com/betagouv/service-national-universel/issues/2428)) ([2af7983](https://github.com/betagouv/service-national-universel/commit/2af798326b4d060dd335f71996df6a9ab2f7e13b))

# [1.242.0](https://github.com/betagouv/service-national-universel/compare/v1.241.0...v1.242.0) (2023-03-28)

### Bug Fixes

- **admin:** Add pageId variable to filters ([#2427](https://github.com/betagouv/service-national-universel/issues/2427)) ([cbd40f5](https://github.com/betagouv/service-national-universel/commit/cbd40f509b7644e1a2473ee5c227045d347aa420))
- **admin:** Barre de recherche centre ([34b30b8](https://github.com/betagouv/service-national-universel/commit/34b30b8873c405d61b645a9304ed95377d20d3c3))
- **admin:** remove trim in filters search bar ([8688d1f](https://github.com/betagouv/service-national-universel/commit/8688d1fe022e16b1609db752372cd0ba08e80a38))
- **api:** Add jva raw data to serializer ([b648b01](https://github.com/betagouv/service-national-universel/commit/b648b017b01bbbe15ad650b155d2d9d72573bef6))
- **api:** data paramètrage dynamique ([643c727](https://github.com/betagouv/service-national-universel/commit/643c727068a72b9a3158938c13c262cae63e4237))
- **api/admin:** amélioration de l'anonymisation des infos jeune sur les contrats et candidatures après suppression ([#2423](https://github.com/betagouv/service-national-universel/issues/2423)) ([17ed386](https://github.com/betagouv/service-national-universel/commit/17ed3864760395e17e2c36631d1b0039afa2bd06))

### Features

- **admin:** add Filters to /centre ([11d0758](https://github.com/betagouv/service-national-universel/commit/11d075883cc4e43299da90eca76382de35bb16fb))
- **admin/api/app:** ajout des préfix régionaux sur les champs téléphone ([#2419](https://github.com/betagouv/service-national-universel/issues/2419)) ([7abab14](https://github.com/betagouv/service-national-universel/commit/7abab14bac49b63e92cde720001a5f48264f89fe))
- **app:** ajout du champ de sélection de préfix régional aux champs numéro de téléphone sur la page de profil ([#2429](https://github.com/betagouv/service-national-universel/issues/2429)) ([83a07df](https://github.com/betagouv/service-national-universel/commit/83a07df992d77fad3d4b833bb2a1ec63ab78a692))

# [1.241.0](https://github.com/betagouv/service-national-universel/compare/v1.240.0...v1.241.0) (2023-03-27)

### Bug Fixes

- **admin:** allow admin to edit school info before parent info are filled ([3522f46](https://github.com/betagouv/service-national-universel/commit/3522f468e09d7d912840bfdb18e405ed079e5ecf))
- **admin:** correction des droits de changement de séjour pour un jeune ayant validé la phase 1 ([#2418](https://github.com/betagouv/service-national-universel/issues/2418)) ([9a758e5](https://github.com/betagouv/service-national-universel/commit/9a758e5ef365624a4d2968703b86abd4d6ab4519))
- **admin:** Correction rapide pour empecher l'edition des schema de repartition par les référents régionaux ([#2420](https://github.com/betagouv/service-national-universel/issues/2420)) ([2c5de83](https://github.com/betagouv/service-national-universel/commit/2c5de83e684044883eaf91dc3b181d66c82afd4c))
- **admin:** fix pagination condition ([c1c45df](https://github.com/betagouv/service-national-universel/commit/c1c45df966a98403921ce2235aede318e4abcec0))
- **api:** Correction du % d'affectés dans les affichages du schéma de répartition ([#2390](https://github.com/betagouv/service-national-universel/issues/2390)) ([970ce56](https://github.com/betagouv/service-national-universel/commit/970ce562c93818c7b6a88db5cbc2e2e3ffba9742))

### Features

- **app:** [Phase 1/Validée] Affichage conditionnel du bloc JDC en fonction de la participation à la JDM ([#2417](https://github.com/betagouv/service-national-universel/issues/2417)) ([057b744](https://github.com/betagouv/service-national-universel/commit/057b7445e76b64f0ba7e4103aed1a6ab65aa9545))
- **app:** design updates on phase 1 page ([#2406](https://github.com/betagouv/service-national-universel/issues/2406)) ([80d0cce](https://github.com/betagouv/service-national-universel/commit/80d0cce94e5f6f1e056733323501b5a8b732b0eb))

# [1.240.0](https://github.com/betagouv/service-national-universel/compare/v1.239.0...v1.240.0) (2023-03-24)

### Bug Fixes

- **admin:** lien du contrat d'engagement application jeune ([54f2ae5](https://github.com/betagouv/service-national-universel/commit/54f2ae51913e0186e5fd529c81299fc4bacb96d3))
- **app:** bug schooladdress ([e86f278](https://github.com/betagouv/service-national-universel/commit/e86f278aaabbbab91bb76b0914cd9820db6f750c))

### Features

- **admin:** logique es volontaire sejour ([#2414](https://github.com/betagouv/service-national-universel/issues/2414)) ([056d5cb](https://github.com/betagouv/service-national-universel/commit/056d5cb675054cfe01cdfb3310a6c2bf088d9e25))

# [1.239.0](https://github.com/betagouv/service-national-universel/compare/v1.238.0...v1.239.0) (2023-03-23)

### Bug Fixes

- **admin:** double filetype in export (.xlsx.xlsx) ([e3b65b2](https://github.com/betagouv/service-national-universel/commit/e3b65b2b87b350021df409e569fdb6f541192dde))
- **admin:** retour design 2 filters ([af2ede6](https://github.com/betagouv/service-national-universel/commit/af2ede69e55fd4692263154740780de15235ed13))
- **api:** coordinates next step in case of qpv erreur ([#2416](https://github.com/betagouv/service-national-universel/issues/2416)) ([3572160](https://github.com/betagouv/service-national-universel/commit/3572160b4653944be45ba83832a8caf2a3da7e72))
- **app:** address mobile fix ([835488d](https://github.com/betagouv/service-national-universel/commit/835488d9d44de205850fb4f93da807c2dda429ec))
- **app:** apiAdress filters array ([a174a46](https://github.com/betagouv/service-national-universel/commit/a174a465ebcf757fd582c0882c8d3aadebdaf9e8))
- **app:** steps logic ([fcb700b](https://github.com/betagouv/service-national-universel/commit/fcb700bfc1194b178c1ec8e8fb281bb0b3c87f7c))
- **knowledge:** design link contactform ([#2409](https://github.com/betagouv/service-national-universel/issues/2409)) ([dc9d275](https://github.com/betagouv/service-national-universel/commit/dc9d275620ea61ffa613074c0d9bd94d3eee110f))

### Features

- **admin:** add department's numbers on filters ([f38994f](https://github.com/betagouv/service-national-universel/commit/f38994fa60414f69c0cce08215b668268f791273))
- **admin:** remove selected filters ([9a38b43](https://github.com/betagouv/service-national-universel/commit/9a38b4335fb1a0338a84b3f6900327b3f9d1a71a))
- **admin/api:** Objectif des inscriptions new dashboard ([6dc6753](https://github.com/betagouv/service-national-universel/commit/6dc675304e07aaf506d68132554cd3b33ca619aa))

# [1.238.0](https://github.com/betagouv/service-national-universel/compare/v1.237.0...v1.238.0) (2023-03-22)

### Bug Fixes

- **admin:** add ids to filter dashboard ([b639f63](https://github.com/betagouv/service-national-universel/commit/b639f636975f2f8bf1d9318ae7c2473507655418))
- **admin:** retour design filtres ([a58467d](https://github.com/betagouv/service-national-universel/commit/a58467d4b38ec2295ff3fdc310ff2f013d550f24))
- **api:** MongoDB allowed connections for staging ([4492e1f](https://github.com/betagouv/service-national-universel/commit/4492e1f63bf93e2d64266d1ac556e07a2eeec38e))
- **api/sib:** Less mongoDB connections allowed on staging ([e9cc950](https://github.com/betagouv/service-national-universel/commit/e9cc950d6e716b2ce3793821f9878104ea662b3b))
- **app:** Filtrer les recherches d'adresse par code postal ([#2398](https://github.com/betagouv/service-national-universel/issues/2398)) ([aa3e4dd](https://github.com/betagouv/service-national-universel/commit/aa3e4dd600c853fe54276a0acea4299d17833f1b))
- **app:** fix coordinates fetching for location filter in misison search ([c73de28](https://github.com/betagouv/service-national-universel/commit/c73de28eb9f82ee16011c3c1fcf9fddc589cfd56))

### Features

- **admin:** Dashboard filtre base ([b8aa8dd](https://github.com/betagouv/service-national-universel/commit/b8aa8dd8fa45814d99a4a68058382ad82de7bba2))
- **admin:** front dashboard sejour ([#2402](https://github.com/betagouv/service-national-universel/issues/2402)) ([650ca56](https://github.com/betagouv/service-national-universel/commit/650ca56b8f41ed096962b29d7539ea36f21b5834))
- **app:** ajout de l'anonymisation et de la suppression des données du compte ([#2397](https://github.com/betagouv/service-national-universel/issues/2397)) ([830b52f](https://github.com/betagouv/service-national-universel/commit/830b52fedf4f37f00345d7d0ae7819a71f2d871a))
- **app:** new medical file modal ([#2399](https://github.com/betagouv/service-national-universel/issues/2399)) ([bbce4d1](https://github.com/betagouv/service-national-universel/commit/bbce4d19e9035aefb93bb9df7bbcf9b1f85df62f))

# [1.237.0](https://github.com/betagouv/service-national-universel/compare/v1.236.0...v1.237.0) (2023-03-21)

### Bug Fixes

- **admin:** update schoolId on change ([7a27136](https://github.com/betagouv/service-national-universel/commit/7a27136826a41a9a3e7709725db8801f1929cc19))
- **api:** auto-validation update ([a4dab7c](https://github.com/betagouv/service-national-universel/commit/a4dab7c1c0efea6f3113854ca7c51721b2adfda2))
- **api:** correction des espacements dans les convocation pdf ([#2400](https://github.com/betagouv/service-national-universel/issues/2400)) ([704e939](https://github.com/betagouv/service-national-universel/commit/704e939c823b2115f88ae61f3c04e566471da363))
- **api:** Reload api in dev mode ([6c43e41](https://github.com/betagouv/service-national-universel/commit/6c43e41eb36239f4d8186df5570acd96c50f5930))
- **app:** long name pdr on affected page ([dafad95](https://github.com/betagouv/service-national-universel/commit/dafad95c2d9dec52ff250e1f303de83072e10619))

### Features

- **api:** Update MongoDB connections ([#2396](https://github.com/betagouv/service-national-universel/issues/2396)) ([2724192](https://github.com/betagouv/service-national-universel/commit/27241927144e5a2e14852d498e56eade11f091bb))
- **api/admin:** Bloc "Affectation et pointage" champ “Disponibilité des listes de transport par centre ([#2392](https://github.com/betagouv/service-national-universel/issues/2392)) ([6c47898](https://github.com/betagouv/service-national-universel/commit/6c4789874a0c8feaaa875086758b6807dd6c9e09))

# [1.236.0](https://github.com/betagouv/service-national-universel/compare/v1.235.0...v1.236.0) (2023-03-20)

### Bug Fixes

- **admin:** Fix filters (css / variables / typo) ([0ad3480](https://github.com/betagouv/service-national-universel/commit/0ad3480d8c7077d12f54919517a8b078ac22cc91))
- **admin:** franceConnect wording ([c4faac9](https://github.com/betagouv/service-national-universel/commit/c4faac9a407fe745676dad9db6109c7f01c08625))
- **admin:** normalize filter search bar ([b5c0e5a](https://github.com/betagouv/service-national-universel/commit/b5c0e5a7a3ffdba6ccc6bbd636485302375ecdd6))
- **admin:** tooltip modal contact convocation ([4f3dba0](https://github.com/betagouv/service-national-universel/commit/4f3dba0ad6880b7d8b1c7e28f17c34084d0849a7))
- **admin:** typo plan de transport ([8555029](https://github.com/betagouv/service-national-universel/commit/85550291787f922176733bd8b13e2a6435bd85ee))
- **admin:** use informationAccuracy field ([cd86cdb](https://github.com/betagouv/service-national-universel/commit/cd86cdb24794272a5b45e2ac0359796208aec859))
- **api:** fix du style de la convocation pdf ([#2384](https://github.com/betagouv/service-national-universel/issues/2384)) ([41b3f01](https://github.com/betagouv/service-national-universel/commit/41b3f01604bae5eca4592428bc4a26b6f9df4529))
- **app:** fix enabled condition for step 2 affected ([4fa8a95](https://github.com/betagouv/service-national-universel/commit/4fa8a951815b561671f6d3ecd46da5b2f368aa7d))

### Features

- **admin:** Ajout nouveaux filtres sur PDR ([08e52ef](https://github.com/betagouv/service-national-universel/commit/08e52ef8e8bbf0d6970859a708a0306b5d6970aa))

### Reverts

- Revert "feat(admin): architecture dashboard (#2375)" ([1b736ec](https://github.com/betagouv/service-national-universel/commit/1b736ecb3b39c1fedee8c10ee7fb34c8ae148cd5)), closes [#2375](https://github.com/betagouv/service-national-universel/issues/2375)

# [1.235.0](https://github.com/betagouv/service-national-universel/compare/v1.234.0...v1.235.0) (2023-03-17)

### Bug Fixes

- **admin:** application export for supervisor/responsible ([3e0f2a1](https://github.com/betagouv/service-national-universel/commit/3e0f2a1c1282d8d40c0d7b0a4d0fd04503901025))
- **admin:** export inscription / volonatire add latestCNIFileExpirationDate ([3f7fa62](https://github.com/betagouv/service-national-universel/commit/3f7fa62bc6da5a8272fb999fb0ce0145aa175a47))
- **api:** remove console.error ([1a1341e](https://github.com/betagouv/service-national-universel/commit/1a1341e93e481bafce72e704552a4d8bb2f2c0c9))
- **api:** replace console.error by capture ([d8c79ca](https://github.com/betagouv/service-national-universel/commit/d8c79ca38ae27fcb9b1fbf67f20ffe4d6f64da5f))
- **api:** send mail ATTACHEMENT_PHASE_2_APPLICATION ([4ef93ec](https://github.com/betagouv/service-national-universel/commit/4ef93ec883090cef78907c9703f3af6c8c706499))

### Features

- **app:** mise en prod recap de voyage ecran affecte ([d6df6dd](https://github.com/betagouv/service-national-universel/commit/d6df6dde7a71850b30069a30997b2bdd88d79494))

# [1.234.0](https://github.com/betagouv/service-national-universel/compare/v1.233.1...v1.234.0) (2023-03-16)

### Bug Fixes

- **admin:** correction condition d'affichage du sélecteur de récupération convocation ([#2385](https://github.com/betagouv/service-national-universel/issues/2385)) ([66ae2b7](https://github.com/betagouv/service-national-universel/commit/66ae2b7e4f1faeb1914a457a01e586d6d0583e7d))
- **admin:** display center information even if session info is not returned ([#2379](https://github.com/betagouv/service-national-universel/issues/2379)) ([9c1bb2f](https://github.com/betagouv/service-national-universel/commit/9c1bb2f185ec258bff10fa60ddca8ccfcbdc6ae6))
- **admin:** dont crash waiting for focusedSession ([91bd978](https://github.com/betagouv/service-national-universel/commit/91bd9785772d7805b6a4efc9e35de78601eabb68))
- **admin:** open demande modif for staging ([f3d58c2](https://github.com/betagouv/service-national-universel/commit/f3d58c29577c213301dc974fa4dfcb7653c4ee82))
- **admin:** remove role check on call to schema ([4dcc7a1](https://github.com/betagouv/service-national-universel/commit/4dcc7a1de59aa1637089ec59e47a06ba6a552de7))
- **admin:** retour maquette settings ([ea4f81c](https://github.com/betagouv/service-national-universel/commit/ea4f81c6703cfc9dc12b2d45224f26d847556c27))
- **admin:** updatedAt liste inscription ([4cdf218](https://github.com/betagouv/service-national-universel/commit/4cdf218785fced4a53cc03804cbdeaf0ae15f825))
- **api:** correction bug sur convocations de jeunes venant au séjour par leurs propres moyens ([#2381](https://github.com/betagouv/service-national-universel/issues/2381)) ([2068642](https://github.com/betagouv/service-national-universel/commit/20686426fff8b822b5b03f8aa231fc137401c5fc))
- **api:** improve document delete route ([3bcc7ff](https://github.com/betagouv/service-national-universel/commit/3bcc7ff44acb7a2ca0f09093eb78c85798e50ca7))
- **api:** Put capture instead ([75d2c07](https://github.com/betagouv/service-national-universel/commit/75d2c07ccbae0c69f673922364e0ca60944e7415))
- **app:** retours sur recap voyage affected ([f5fe2c8](https://github.com/betagouv/service-national-universel/commit/f5fe2c8738f9894e20bb1f3e65353f8bda60ac91))
- **github:** Disable slack notifications for when ([8d9fcbe](https://github.com/betagouv/service-national-universel/commit/8d9fcbed21e2a4e4b877e671c0e975da535ec17a))
- depreciation warning ([#2382](https://github.com/betagouv/service-national-universel/issues/2382)) ([cf42136](https://github.com/betagouv/service-national-universel/commit/cf42136d2c235ec97f4cfb9d906da4d98c7a2c91))
- **kb:** Typo ([c35a87b](https://github.com/betagouv/service-national-universel/commit/c35a87b9f87f3c42ce1da0db977750732478a268))

### Features

- **admin:** ajout d'un sélecteur de récupération de convocation sur la page d'un volontaire ([#2374](https://github.com/betagouv/service-national-universel/issues/2374)) ([47bae1e](https://github.com/betagouv/service-national-universel/commit/47bae1e89b4037fbe14baa2e12d5cdd938fd5737))
- **admin/api:** filters-system ([c4316cc](https://github.com/betagouv/service-national-universel/commit/c4316cc568b91ff6d09903c57a2a49b0f83e7c75))
- **app:** [Phase 1 - Affecté] Ajout du récap de voyage et de la todo "sac à dos" ([1da6f4c](https://github.com/betagouv/service-national-universel/commit/1da6f4c853bbfb8ed308c42e7c702ba87a5e8b91))
- **app:** MEP withdrawal modal ([68e286e](https://github.com/betagouv/service-national-universel/commit/68e286e15fb22e3179e4cc526322895a29727039))
- ajout de pm2 sur l'API ([#2377](https://github.com/betagouv/service-national-universel/issues/2377)) ([f622715](https://github.com/betagouv/service-national-universel/commit/f622715907d751c0dc2d1886c21c2f646413043d))

## [1.233.1](https://github.com/betagouv/service-national-universel/compare/v1.233.0...v1.233.1) (2023-03-15)

### Bug Fixes

- **admin:** application translation statut ([cc6cce7](https://github.com/betagouv/service-national-universel/commit/cc6cce748d90f5b8d98a7d273e6f5089f02477c0))
- **api:** Fix warning node event emitter ([#2371](https://github.com/betagouv/service-national-universel/issues/2371)) ([8f017df](https://github.com/betagouv/service-national-universel/commit/8f017df715c56897acd90cbb1a48bb6627562c25))
- **app:** loading infini parent consent ([5a7f277](https://github.com/betagouv/service-national-universel/commit/5a7f2777a824a7efdc5e1969e2a907531d82cf07))
- **app:** ModalResumePhase1ForWithdrawn ([29a0b8d](https://github.com/betagouv/service-national-universel/commit/29a0b8d69417072be90705adc408cfe1311981f8))
- type and mobile design ([#2373](https://github.com/betagouv/service-national-universel/issues/2373)) ([22f7519](https://github.com/betagouv/service-national-universel/commit/22f7519481db1e81a4b755d3388a3de760af4ac9))

# [1.233.0](https://github.com/betagouv/service-national-universel/compare/v1.232.0...v1.233.0) (2023-03-14)

### Bug Fixes

- **admin/api:** Add departureHour to model ([#2366](https://github.com/betagouv/service-national-universel/issues/2366)) ([6142143](https://github.com/betagouv/service-national-universel/commit/6142143beb9646ddcf9cd78f6ff3e3127eaa8646))
- **api:** Add departureHour to plan de transport model ([b7df75d](https://github.com/betagouv/service-national-universel/commit/b7df75dbd61f52de241db9d4f0c17bc51fe6433b))
- **api/admin:** fix duplicate email error message ([#2369](https://github.com/betagouv/service-national-universel/issues/2369)) ([d7e44e2](https://github.com/betagouv/service-national-universel/commit/d7e44e2884bcc3fb1d47c79cd61a97f8bf15d57f))
- **app:** ajustement design page en attente d'affectation ([#2364](https://github.com/betagouv/service-national-universel/issues/2364)) ([24f37d9](https://github.com/betagouv/service-national-universel/commit/24f37d9d2602d3fb5580e05581873dfede4b108a))
- **app:** correction de la traduction du statut d'inscription ([#2362](https://github.com/betagouv/service-national-universel/issues/2362)) ([4035ea9](https://github.com/betagouv/service-national-universel/commit/4035ea9539b47ff0ac9dabde4829740da3c3f577))
- **app:** correction du design de la page en attente d'affectation ([#2367](https://github.com/betagouv/service-national-universel/issues/2367)) ([eccda45](https://github.com/betagouv/service-national-universel/commit/eccda451f083704164f1f27ab84bb6751d75b4a5))
- **app:** remove production condition ([2f293a7](https://github.com/betagouv/service-national-universel/commit/2f293a7060325eeccc888b60a15994e3e2f8b722))

### Features

- **app:** déploiement de la nouvelle page "en attente d'affectation" ([#2368](https://github.com/betagouv/service-national-universel/issues/2368)) ([0ee6283](https://github.com/betagouv/service-national-universel/commit/0ee6283d1ee0aa096d80e8778f3d946efa427d1d))
- **app:** Mise en production nouvelle navbar [#2363](https://github.com/betagouv/service-national-universel/issues/2363) ([6bd9289](https://github.com/betagouv/service-national-universel/commit/6bd9289dfb3afe7f5246f013a36550efcfcf9b5c))

# [1.232.0](https://github.com/betagouv/service-national-universel/compare/v1.231.0...v1.232.0) (2023-03-13)

### Bug Fixes

- **admin:** referent dep liste statut ([60df9f0](https://github.com/betagouv/service-national-universel/commit/60df9f07cf048391db1e173e1f1061b196705c25))
- **api:** Correction du bug supprimant les cohortes des invités ([#2359](https://github.com/betagouv/service-national-universel/issues/2359)) ([010984d](https://github.com/betagouv/service-national-universel/commit/010984d45e5eaa326ab9ce79d3860cb5656c3257))
- **api:** correction du style de la convocation et correction des infos concernant le déjeuner à l'aller ([#2343](https://github.com/betagouv/service-national-universel/issues/2343)) ([067a949](https://github.com/betagouv/service-national-universel/commit/067a949ced765a16601e8d30451c8d76bbc51edc))
- **api/admin:** WITHDRAW logic ([#2357](https://github.com/betagouv/service-national-universel/issues/2357)) ([93024cc](https://github.com/betagouv/service-national-universel/commit/93024cca3d88fa93510f9925dcc2dd26f781860f))
- **app:** change font size not done ([b807965](https://github.com/betagouv/service-national-universel/commit/b807965b8af7f4a9c4e062f0add17aac26790759))
- **app:** refonte de la page en attente d’affectation ([#2346](https://github.com/betagouv/service-national-universel/issues/2346)) ([5a98cdd](https://github.com/betagouv/service-national-universel/commit/5a98cdd4f03a6f0a9a9313569feeec6e371cd65e))
- **app:** retours navbars part 2 ([87975da](https://github.com/betagouv/service-national-universel/commit/87975da4f7334b856be767e8e7e9640b39767959))
- **app:** Retours sur nouvelle navbar ([#2348](https://github.com/betagouv/service-national-universel/issues/2348)) ([0f51293](https://github.com/betagouv/service-national-universel/commit/0f51293579d8f2f1d53c89b8c9a1c3498b0717ee))
- **deploy:** Do not triger staging api on pull request ([34ed791](https://github.com/betagouv/service-national-universel/commit/34ed7919172e61b193feef284d15855e5aa2d265))
- **deploy:** Notif slack api staging ([9842e21](https://github.com/betagouv/service-national-universel/commit/9842e214cf477d0a838ed2499de0aa8ffbaee3dd))
- **kb:** Disable Sentry for KB ([988fac2](https://github.com/betagouv/service-national-universel/commit/988fac2dcb62b2064f68424ba59526efe9a2fa5e))

### Features

- **admin:** refacto page settings ([#2349](https://github.com/betagouv/service-national-universel/issues/2349)) ([1f21995](https://github.com/betagouv/service-national-universel/commit/1f21995f79eff2873d7bdf22effecde5f906aed8))
- **admin:** Search for parents emails as well ([dd31998](https://github.com/betagouv/service-national-universel/commit/dd31998f90899f3439a08207f7a2c65073af8028))

# [1.231.0](https://github.com/betagouv/service-national-universel/compare/v1.230.0...v1.231.0) (2023-03-10)

### Bug Fixes

- **admin:** disabled demande de modif for fev et avril - A ([f6796a2](https://github.com/betagouv/service-national-universel/commit/f6796a2404bb8046cc47923654b0a9f25c74cb1d))
- **admin:** regex compatible DOMs ([486ac28](https://github.com/betagouv/service-national-universel/commit/486ac283596a52f47c30ab033fff7d1007c07d63))
- **api:** add missing try catch ([#2345](https://github.com/betagouv/service-national-universel/issues/2345)) ([2d159f5](https://github.com/betagouv/service-national-universel/commit/2d159f5e1fd350eb9eb84f40a8c1b088b39fd86a))
- **app:** fix withdrawal button width in profile page ([#2347](https://github.com/betagouv/service-national-universel/issues/2347)) ([dcd83da](https://github.com/betagouv/service-national-universel/commit/dcd83da17d5fd1fbadb06bd1c8ed1c41f105c608))
- **app:** style home non realise ([010e9f8](https://github.com/betagouv/service-national-universel/commit/010e9f8a5bc7a02ae3c25316f4c8ec3f95500f28))
- **app/admin:** delete jquery ([#2341](https://github.com/betagouv/service-national-universel/issues/2341)) ([0a8c9a5](https://github.com/betagouv/service-national-universel/commit/0a8c9a5b3130a94f1fd53e3599486b69535fafff))

### Features

- **admin:** add filter cohort for user ([6173c4d](https://github.com/betagouv/service-national-universel/commit/6173c4d08c1780e22218910eefa92d32b6843bb8))
- **analytics/api:** add sentry & testroute sentry ([#2351](https://github.com/betagouv/service-national-universel/issues/2351)) ([3498725](https://github.com/betagouv/service-national-universel/commit/34987257054acc1fd8ec729a4c7b71e9428b4965))
- **app:** Formulaire RL not needed ([f6509b1](https://github.com/betagouv/service-national-universel/commit/f6509b15c0c9c588be9a2cb7a6a399d690dab5e7))

# [1.230.0](https://github.com/betagouv/service-national-universel/compare/v1.229.0...v1.230.0) (2023-03-09)

### Bug Fixes

- **admin:** fix des titres du statut de validation ([#2344](https://github.com/betagouv/service-national-universel/issues/2344)) ([5a37fc2](https://github.com/betagouv/service-national-universel/commit/5a37fc263676867efa1c8b88838205563a31e6c4))
- **api:** update permission ref --> head_center ([cefccf9](https://github.com/betagouv/service-national-universel/commit/cefccf9a9164bb0b2be60289a7adc47110e03df8))
- **app:** ajout de la nouvelle modale sur la home legacy ([e2e2f2e](https://github.com/betagouv/service-national-universel/commit/e2e2f2ef9cd4ced28fa24acc3340b084481fe907))
- **app:** style modal withdrawn ([4fc3bff](https://github.com/betagouv/service-national-universel/commit/4fc3bff3769d3252677bda207a08caebfcf37455))

### Features

- **admin/app:** Pages de présentation des assets ([#2339](https://github.com/betagouv/service-national-universel/issues/2339)) ([94ca9e7](https://github.com/betagouv/service-national-universel/commit/94ca9e76b0dcdb06462bf4dd1a4c1bb0222326ee))
- **app:** Ajout d'une modale menant au choix de cohorte pour les désistés (staging) ([#2342](https://github.com/betagouv/service-national-universel/issues/2342)) ([c58d334](https://github.com/betagouv/service-national-universel/commit/c58d33480854a943fbd947e5178cc9d8e7bd25f5))
- **app:** MEP modale de changement de sejour pour desistes ([c74a3e7](https://github.com/betagouv/service-national-universel/commit/c74a3e79ac2572b26626145e42512a7ab8d75ab7))

# [1.229.0](https://github.com/betagouv/service-national-universel/compare/v1.228.0...v1.229.0) (2023-03-08)

### Bug Fixes

- **admin:** validation du dossier des jeunes inscrits d'après l'objectif départemental ([#2331](https://github.com/betagouv/service-national-universel/issues/2331)) ([1b564fc](https://github.com/betagouv/service-national-universel/commit/1b564fc5add02aa22ddd166e06665b7cd3cf65ae))
- **api:** add try catch franconnect ([9278420](https://github.com/betagouv/service-national-universel/commit/9278420c54b0991bb59cc25d317eaa936d6c40aa))
- **api:** autoValidationSessionPhase1Young ([5a057ad](https://github.com/betagouv/service-national-universel/commit/5a057ad823b4debb1c5d96c83f07efd86b4bd143))
- **app:** Modification design bouton Changer de séjour - Volontaire Phase 1 ([#2336](https://github.com/betagouv/service-national-universel/issues/2336)) ([4d5b4bf](https://github.com/betagouv/service-national-universel/commit/4d5b4bfa2b4e3c3a844e19f63c2e343ce4f7a312))
- **lib:** permission geography referent structure ([1f0a912](https://github.com/betagouv/service-national-universel/commit/1f0a9127939312658cb91a3fac341ac7a797a4bf))

### Features

- **app:** new withdrawal modal with possibility to change stay [#2335](https://github.com/betagouv/service-national-universel/issues/2335) ([c377554](https://github.com/betagouv/service-national-universel/commit/c377554a57d191853e2fe341197bda5dc8762455))

# [1.228.0](https://github.com/betagouv/service-national-universel/compare/v1.227.0...v1.228.0) (2023-03-07)

### Bug Fixes

- **app:** Fixes to new navbar ([#2340](https://github.com/betagouv/service-national-universel/issues/2340)) ([ad83367](https://github.com/betagouv/service-national-universel/commit/ad8336747d0803fae85bebc1b21a8e31db06c3ab))
- **pdf:** pdf style ([0329053](https://github.com/betagouv/service-national-universel/commit/03290535465eab49e1aa4535ec730508e6ca3737))

### Features

- **app:** refonte de la barre de navigation (staging only) ([#2322](https://github.com/betagouv/service-national-universel/issues/2322)) ([a3e2a40](https://github.com/betagouv/service-national-universel/commit/a3e2a401000a3b12401ffec43eb940f6573ff155))

# [1.227.0](https://github.com/betagouv/service-national-universel/compare/v1.226.0...v1.227.0) (2023-03-06)

### Features

- **admin:** ajout sélecteur de départements sur page schema repartition pour référents départementaux ayant plusieurs départements ([#2325](https://github.com/betagouv/service-national-universel/issues/2325)) ([caf643c](https://github.com/betagouv/service-national-universel/commit/caf643cc79fdd078ee688865c89e0cf4abca4c84))
- **kb:** mep feedbacks ([fc2e2ae](https://github.com/betagouv/service-national-universel/commit/fc2e2ae6d241efdd03ac8be08fcab29e2bca98bd))

# [1.226.0](https://github.com/betagouv/service-national-universel/compare/v1.225.1...v1.226.0) (2023-03-03)

### Bug Fixes

- **admin:** Tableau des établissements pb de comptage jeunes ds depart ([92fcc9c](https://github.com/betagouv/service-national-universel/commit/92fcc9c368ddb462781ff67ad2ef489083046752))
- **analytics:** Dependabot issues fix sequelize ([570c22c](https://github.com/betagouv/service-national-universel/commit/570c22c1b72353514b053fdb2a429200457647ed))
- **api:** Change in lib in dev mode auto refresh ([#2332](https://github.com/betagouv/service-national-universel/issues/2332)) ([1763715](https://github.com/betagouv/service-national-universel/commit/1763715b303be8191af0d115cd738778b63fe39e))

### Features

- **admin:** CENTRE - Consultation des utilisateurs (autres chefs de centre) [#2334](https://github.com/betagouv/service-national-universel/issues/2334) ([b6a552e](https://github.com/betagouv/service-national-universel/commit/b6a552e0bef01836be17c27d91229b7284d51869))
- **api:** ajout de la liste des cohortes dans le modèle référent (chef de centre) ([#2310](https://github.com/betagouv/service-national-universel/issues/2310)) ([2cf74f6](https://github.com/betagouv/service-national-universel/commit/2cf74f655ec7240dfd5199d9a4cf0537efd04c24))
- **app:** Permettre aux volontaires en statut "Phase 1 non réalisée" de choisir un autre séjour ([#2326](https://github.com/betagouv/service-national-universel/issues/2326)) ([e7ad8df](https://github.com/betagouv/service-national-universel/commit/e7ad8dfd45fb19376b1a7add798926ca7f16a595))

## [1.225.1](https://github.com/betagouv/service-national-universel/compare/v1.225.0...v1.225.1) (2023-03-03)

### Bug Fixes

- **admin:** aggregation volontaire-responsible Mes candidatures ([30f285f](https://github.com/betagouv/service-national-universel/commit/30f285f71a1063d509cd62977fd083571ec9072b))
- **admin:** remove code centre 2021 export volontaire ([6daa256](https://github.com/betagouv/service-national-universel/commit/6daa256cb505938c39a43fc313186873baa63b04))
- **admin:** typo session-phase1-partage ([38ac90f](https://github.com/betagouv/service-national-universel/commit/38ac90fd61feb278f65c64a5290d22ae4662d073))
- **api:** import PDT correspondance ([075ef63](https://github.com/betagouv/service-national-universel/commit/075ef6392230b14819793c77138bf658c508db94))
- **lib:** sameGeography ([8b80577](https://github.com/betagouv/service-national-universel/commit/8b8057724f2a41444b3932bac380b94510e3aa4e))

# [1.225.0](https://github.com/betagouv/service-national-universel/compare/v1.224.1...v1.225.0) (2023-03-01)

### Bug Fixes

- **admin:** add redirect to modification on list modification ([b3fd308](https://github.com/betagouv/service-national-universel/commit/b3fd308341d201afef1984b05dd9562ddd1e5fd6))
- **admin:** aggregationSize volontaire responsible Mes candidatures ([fac5b6d](https://github.com/betagouv/service-national-universel/commit/fac5b6dedc5217e9a799f82db2167feeacb44c88))
- **admin:** cohort query param plan de transport ([208b664](https://github.com/betagouv/service-national-universel/commit/208b6646dd40d55f4dc456dd7fe5857a9c0b7340))
- **admin:** correction du selecteur de cohort sur schema et table repartition et gestion des droits ([#2309](https://github.com/betagouv/service-national-universel/issues/2309)) ([d79b74f](https://github.com/betagouv/service-national-universel/commit/d79b74f5d5513af886f66415128608bed9849f18))
- **api:** pause dej plan de transport ([cc3adbd](https://github.com/betagouv/service-national-universel/commit/cc3adbdcd5b9dff26ba36dab101c42884545e980))
- **api:** plan de transport import ([c80f379](https://github.com/betagouv/service-national-universel/commit/c80f379891efdade984f8e58675108bf2a61a765))
- **app:** Changement d'épaisseur de texte sur les boutons suppression de compte et changement de séjour ([#2324](https://github.com/betagouv/service-national-universel/issues/2324)) ([72f2c09](https://github.com/betagouv/service-national-universel/commit/72f2c09c323dd5f85c94cbc54e506337566cd6aa))

### Features

- **admin:** ajouter les infos sur les sessions dans le panneau des chefs de centre ([#2302](https://github.com/betagouv/service-national-universel/issues/2302)) ([4779a0b](https://github.com/betagouv/service-national-universel/commit/4779a0b5af4b8c6e0ae3bbe570070216b293c34a))
- **api:** Ajout d'envoi notification par email au transporteur à l'ouverture nouvelle demande de modification sur plan de transport ([#2316](https://github.com/betagouv/service-national-universel/issues/2316)) ([927ce96](https://github.com/betagouv/service-national-universel/commit/927ce96fa10a86cf64939d2d1d1d585b84d23943))

## [1.224.1](https://github.com/betagouv/service-national-universel/compare/v1.224.0...v1.224.1) (2023-02-28)

### Bug Fixes

- **admin:** mission superviseur, probleme taille liste ([e615d5b](https://github.com/betagouv/service-national-universel/commit/e615d5be33fd1971dba5c051a016e8b5fc177a98))
- **admin:** track total hits volontaire responsible mission ([a2f2afc](https://github.com/betagouv/service-national-universel/commit/a2f2afc65403035eb9ea741204392aff98611cf3))
- **admin:** Update applications informations on mission update ([571ad04](https://github.com/betagouv/service-national-universel/commit/571ad040afb11e67504eb9d9624245746ebe4373))
- **admin:** volontaire-responsible filters visible on missionName searchParams ([82b13ec](https://github.com/betagouv/service-national-universel/commit/82b13ec572545920ec6602a88be4076c40f04f7e))
- **api:** enregistrement du schoolId dans l'édition phase 0 ([eb65873](https://github.com/betagouv/service-national-universel/commit/eb65873c9cac51ad3fd56bd875b802988da6aa09))
- **api:** Update check PDT on colums and duplicate PDR ([#2321](https://github.com/betagouv/service-national-universel/issues/2321)) ([39bee2e](https://github.com/betagouv/service-national-universel/commit/39bee2e65acffd95a5e3c76fbd8095e1b912befb))
- **app:** Mise en place bouton suppression du compte et ajout du bouton changement de séjour dans page de profil ([#2318](https://github.com/betagouv/service-national-universel/issues/2318)) ([dcd1e0e](https://github.com/betagouv/service-national-universel/commit/dcd1e0ea5e02a9ff7cfd7fffa39ea9463784f492))

# [1.224.0](https://github.com/betagouv/service-national-universel/compare/v1.223.1...v1.224.0) (2023-02-27)

### Bug Fixes

- **admin:** corrections de mise en forme pour l'édition d'attestations multiples ([be061d3](https://github.com/betagouv/service-national-universel/commit/be061d3eccd08f2cb6fba218a96fc1576274a606))
- **api:** import plan de transport ([e455361](https://github.com/betagouv/service-national-universel/commit/e455361f5c78a500d3ae89a3bed398d9064cf49b))
- **api:** remplissage des PDR dans le modèle PlanTransport à la fin de l'import ([#2315](https://github.com/betagouv/service-national-universel/issues/2315)) ([611b4fb](https://github.com/betagouv/service-national-universel/commit/611b4fb55301ce084b786315a2f6612e256087c5))
- **api:** Secure calls with sendTemplate ([bdfe0f7](https://github.com/betagouv/service-national-universel/commit/bdfe0f7ae99e547eef9a55bc1f0b309175c3006b))
- **api:** Wrong ([318a5e5](https://github.com/betagouv/service-national-universel/commit/318a5e5bee6ad8894c393f83cd1ae37a36223672))
- **app:** remplacement du wording du cta de téléchargement ficher sanitaire "Non Téléchargée" par "Télécharger" ([#2317](https://github.com/betagouv/service-national-universel/issues/2317)) ([8ffa06c](https://github.com/betagouv/service-national-universel/commit/8ffa06c1e651d872d330d262268a9c3a0b5dbe97))

### Features

- **admin:** open import plan de transport prod ([c4f70d5](https://github.com/betagouv/service-national-universel/commit/c4f70d524aa56f7d38d32db535e9f67b36ceb156))
- import plan de transport ([#2308](https://github.com/betagouv/service-national-universel/issues/2308)) ([ba0a795](https://github.com/betagouv/service-national-universel/commit/ba0a795f286dc4420661bbc5f07b72ceb1c70566))

## [1.223.1](https://github.com/betagouv/service-national-universel/compare/v1.223.0...v1.223.1) (2023-02-24)

### Bug Fixes

- **admin:** export des candidatures ([e7ecdb3](https://github.com/betagouv/service-national-universel/commit/e7ecdb39abb6b2a14836a9c76f98c63b8f90a643))
- **admin:** fix du fix des exports de candidature ([1ef9eba](https://github.com/betagouv/service-national-universel/commit/1ef9ebad60f4548151bd8353c4c0e0630fb7a631))
- **admin:** list mission only 1 line ([277cc60](https://github.com/betagouv/service-national-universel/commit/277cc60d4f28d0f14a262895bd94dc1c01bbb7eb))
- **admin:** liste mission largeur ([7b86cfa](https://github.com/betagouv/service-national-universel/commit/7b86cfaead818765a0b48e9f446f97a75ccfc13c))
- **admin:** prod style mission ? ([4c0ee18](https://github.com/betagouv/service-national-universel/commit/4c0ee184545315f64cd6553b22e0ed252bf3a676))
- **admin:** translate application filter ([bf242a0](https://github.com/betagouv/service-national-universel/commit/bf242a02de42f97c6e7b5252889ba3f2d75560b1))
- **admin:** utilisation du regex pour les pages de consentement ([9b896e0](https://github.com/betagouv/service-national-universel/commit/9b896e080a1218f5ff41cf9c00d8ce76cc6b4601))
- **api:** Add try catch ([#2311](https://github.com/betagouv/service-national-universel/issues/2311)) ([e24e2bc](https://github.com/betagouv/service-national-universel/commit/e24e2bcef4f2e90d73c480f83e1309611762099c))
- **api:** cron parentConsentReminder kill SMS ([6d6b2af](https://github.com/betagouv/service-national-universel/commit/6d6b2aff9edd27f435870c05bb967e29d5dfcd6e))
- **api:** update computeGoalsInscription ([b9b4540](https://github.com/betagouv/service-national-universel/commit/b9b4540f89d767ce5b52f506936ab3dcbf54e966))

# [1.223.0](https://github.com/betagouv/service-national-universel/compare/v1.222.4...v1.223.0) (2023-02-23)

### Bug Fixes

- **admin:** Deploy on condition ([ae2721f](https://github.com/betagouv/service-national-universel/commit/ae2721ff600a17f64abc00fc6a6afac0a6e53ea9))
- **admin:** Force domain only on production ([58d2b42](https://github.com/betagouv/service-national-universel/commit/58d2b428e7dfdef763de4360617829fa53673fc6))
- **admin:** Impossibilité d’ajouter nouvel utilisateur structure ([#2307](https://github.com/betagouv/service-national-universel/issues/2307)) ([dcdfab8](https://github.com/betagouv/service-national-universel/commit/dcdfab89be03bf59af4284fd733ffa562674d297))
- **admin:** Prendre la place staging ([c14ef3a](https://github.com/betagouv/service-national-universel/commit/c14ef3ab61145ece6de7bb146deb6914db9e988f))
- **admin:** Use env var in deployment script ([4a2011d](https://github.com/betagouv/service-national-universel/commit/4a2011d7d48071d0da007aab5e638049bdd5889e))
- **admin/app:** Autoredirect from staging ([45b0e21](https://github.com/betagouv/service-national-universel/commit/45b0e21d48fe83534248d19d4d846e03339bbf5f))
- **admin/app:** Disable force redirect ([d27e6e4](https://github.com/betagouv/service-national-universel/commit/d27e6e4d99af63025a8b157d8156fb152691baf6))
- **admin/app:** Force redirect to url in staging ([379eb85](https://github.com/betagouv/service-national-universel/commit/379eb85c30e84704441cbc78f33d2df9cc0186d4))
- **app:** button style ([d1593e3](https://github.com/betagouv/service-national-universel/commit/d1593e3eddb05bdd93c092bfdb16992a2c8d5cca))
- **app/admin:** Disable redirect for staging ([8d2fbd5](https://github.com/betagouv/service-national-universel/commit/8d2fbd51a663c0ce036efd7ccf30cd6bed4b2ee8))
- **app/admin:** Disable redirect for staging ([8347ff9](https://github.com/betagouv/service-national-universel/commit/8347ff95fd82589fe31303cadba70499d307cd30))
- **app/admin:** Redirect rules updated ([395373f](https://github.com/betagouv/service-national-universel/commit/395373f0ee153a30feda9810dc68f48b38735db9))

### Features

- **all:** Update staging URL ([#2306](https://github.com/betagouv/service-national-universel/issues/2306)) ([b95c127](https://github.com/betagouv/service-national-universel/commit/b95c127d1aec1e4b58a2262d650ee983618f54b2))

## [1.222.4](https://github.com/betagouv/service-national-universel/compare/v1.222.3...v1.222.4) (2023-02-22)

### Bug Fixes

- **admin/api:** auto-sélection du réseau à l'invitation d'une nouvelle structure par le superviseur ([#2287](https://github.com/betagouv/service-national-universel/issues/2287)) ([af8d956](https://github.com/betagouv/service-national-universel/commit/af8d956b61a8e3d15338cacdbc117af19d5891a7))
- **app:** ajout de la possibilité de saisir des numéros de tel dans les DOM ([1d08474](https://github.com/betagouv/service-national-universel/commit/1d084742cca0740d661351a041fa3dbd2ef906c1))

## [1.222.3](https://github.com/betagouv/service-national-universel/compare/v1.222.2...v1.222.3) (2023-02-21)

### Bug Fixes

- **admin:** retours design sur formulaire structure ([7d5fc56](https://github.com/betagouv/service-national-universel/commit/7d5fc567ef5aeb92c12fd01e1edef12e57cbb9a7))
- **lib:** autoriser les jeunes statusPhase1:affected et status:validated à changer le séjour ([9fe2269](https://github.com/betagouv/service-national-universel/commit/9fe2269be0446c83afa13445636c4b9a31ead17e))
- **pdf:** corrections sur l'attestation de réalisation de phase 1 ([#2286](https://github.com/betagouv/service-national-universel/issues/2286)) ([5dd27c3](https://github.com/betagouv/service-national-universel/commit/5dd27c34497a200b699602ff4ee3d1b66dcd9f74))

## [1.222.2](https://github.com/betagouv/service-national-universel/compare/v1.222.1...v1.222.2) (2023-02-20)

### Bug Fixes

- **admin:** remplacement du mot "masquer" par "afficher" quand détails masqués sur page schema répartition ([#2283](https://github.com/betagouv/service-national-universel/issues/2283)) ([19c7988](https://github.com/betagouv/service-national-universel/commit/19c7988f3982b8c72c17ba05821845c1485cce9b))
- **app:** remplacement des dates mensuelles par les dates complètes dans le sélecteur du changement de séjour ([#2284](https://github.com/betagouv/service-national-universel/issues/2284)) ([e5107b2](https://github.com/betagouv/service-national-universel/commit/e5107b2b8c9194ec1c62c9e92524480cf735ab9b))
- **app:** remplacement du mot "fournir" par "télécharger" sur bouton fiche sanitaire sur page accueil volontaire ([#2282](https://github.com/betagouv/service-national-universel/issues/2282)) ([a76fb08](https://github.com/betagouv/service-national-universel/commit/a76fb082846442be0423857ca2875acc8b83fe37))

## [1.222.1](https://github.com/betagouv/service-national-universel/compare/v1.222.0...v1.222.1) (2023-02-18)

### Bug Fixes

- **app:** allow young to apply if no endDate in cohort data ([#2279](https://github.com/betagouv/service-national-universel/issues/2279)) ([0c6ba95](https://github.com/betagouv/service-national-universel/commit/0c6ba952ec2e6455ddf49e53a82657ded34f6809))

# [1.222.0](https://github.com/betagouv/service-national-universel/compare/v1.221.0...v1.222.0) (2023-02-17)

### Bug Fixes

- **admin:** check modif bus ([bfad4eb](https://github.com/betagouv/service-national-universel/commit/bfad4eb056fc2dceb14c2f0231bb1983f4ae0ad2))
- **admin:** referent regional liste session ([7c89dc2](https://github.com/betagouv/service-national-universel/commit/7c89dc2ef2acd44a6609ab97dae708438e84f459))
- **admin:** use contractStatus field on application export ([890cfc9](https://github.com/betagouv/service-national-universel/commit/890cfc9488ba78617d155606dac26cb3704ab19d))
- **app:** [mission search] do not use focused address if no match from api-address ([0d7d5d6](https://github.com/betagouv/service-national-universel/commit/0d7d5d6ea6d379da8f322c643686c52bf8b6d89d))

### Features

- **admin:** liste mission ([#2270](https://github.com/betagouv/service-national-universel/issues/2270)) ([023e24a](https://github.com/betagouv/service-national-universel/commit/023e24a0d9c2a84893316c8516657b57485c5431))

# [1.221.0](https://github.com/betagouv/service-national-universel/compare/v1.220.0...v1.221.0) (2023-02-16)

### Bug Fixes

- **admin:** CardContact view necessary cohorts ([aa8d919](https://github.com/betagouv/service-national-universel/commit/aa8d91954df4f8f627677881d3e7bcbe0a7d8440))
- **admin:** derniers fixes sur les structures avant MEP ([2e4abe0](https://github.com/betagouv/service-national-universel/commit/2e4abe08505cd369fba2f364f714914aa275555e))
- **admin:** plan de transport aller / retour ([34313c7](https://github.com/betagouv/service-national-universel/commit/34313c734cb56815f8079fb38eed75e4435ee341))
- **admin:** plein de petits fixes ([d0e3eae](https://github.com/betagouv/service-national-universel/commit/d0e3eaec1c110a0973bae32448256faca3bac30e))
- **admin:** redirect to contrat ([0cdfd45](https://github.com/betagouv/service-national-universel/commit/0cdfd45784194af0bcc965d6e8fa280583763117))
- **admin:** Remove panel for superviser/responsible in mission youngs view ([c4a6fa9](https://github.com/betagouv/service-national-universel/commit/c4a6fa9e49bcbbcabbfe010d38d115990f7f587a))

### Features

- **admin:** Open structure prod ([#2267](https://github.com/betagouv/service-national-universel/issues/2267)) ([46b182b](https://github.com/betagouv/service-national-universel/commit/46b182b0f6eef7ad611349918e8a4b1249db2154))
- **admin:** update historique ([#2271](https://github.com/betagouv/service-national-universel/issues/2271)) ([6458602](https://github.com/betagouv/service-national-universel/commit/6458602132719c46ca125878f352c50614ed4b1f))

# [1.220.0](https://github.com/betagouv/service-national-universel/compare/v1.219.0...v1.220.0) (2023-02-15)

### Bug Fixes

- **admin:** ajout du excel dans la liste des formats acceptés ([#2266](https://github.com/betagouv/service-national-universel/issues/2266)) ([2e4913b](https://github.com/betagouv/service-national-universel/commit/2e4913bc9f5492f1c800d7507b0f05e4dc895188))
- **admin:** Désistement ([#2262](https://github.com/betagouv/service-national-universel/issues/2262)) ([bf2ae90](https://github.com/betagouv/service-national-universel/commit/bf2ae90134d2604a3d6d2bf5508aac719705bf43))
- **admin:** ES NO LIMIT on PDR list ([d87d119](https://github.com/betagouv/service-national-universel/commit/d87d11923aa6ebf9fd31286045a7470d7a858380))
- **admin:** view session ref ([e1a3d9e](https://github.com/betagouv/service-national-universel/commit/e1a3d9ec14a7316268e14ddcb16cd76c8aff548e))
- **admin/app:** filter fillingrate bus ([#2260](https://github.com/betagouv/service-national-universel/issues/2260)) ([c4b718b](https://github.com/betagouv/service-national-universel/commit/c4b718b7c5ec35f94829df04d36069b74703a9bb))
- **api:** Impossibilité pour un représetant légal d'enregistrer son consentement si le jeune a été refusé. ([#2268](https://github.com/betagouv/service-national-universel/issues/2268)) ([f876bef](https://github.com/betagouv/service-national-universel/commit/f876bef1c241470509f135d58ab709b58e4e1352))
- **api:** sync contacts support for departments and regions ([34f07b6](https://github.com/betagouv/service-national-universel/commit/34f07b60bbc15d5f2131799ec465b6edff2f0360))
- **app:** Correction des chargements de cohortes côté jeune ([#2264](https://github.com/betagouv/service-national-universel/issues/2264)) ([1937999](https://github.com/betagouv/service-national-universel/commit/1937999d548cc10738314b1604b69f0f0dc65586))
- **app:** disable continue button if no exp date in db ([a716598](https://github.com/betagouv/service-national-universel/commit/a716598a0be35c7c095da987cba8b4c692d1a795))

### Features

- **admin:** Page profil ([3bb8dd6](https://github.com/betagouv/service-national-universel/commit/3bb8dd66c6d11f9a2a9faa6b122b671789e1e958))
- **admin:** Phase 1 - Fiche volontaire lien de redirection ([377dfff](https://github.com/betagouv/service-national-universel/commit/377dfffcfbfd483583188d92187237f3abc47c47))
- **admin:** Points de rassemblement : onglet session ([#2254](https://github.com/betagouv/service-national-universel/issues/2254)) ([aa75289](https://github.com/betagouv/service-national-universel/commit/aa752896eb84e282b080d8b274388b5730435887))
- **api:** add slack mention to young patch cron ([4c2c60c](https://github.com/betagouv/service-national-universel/commit/4c2c60cf26d51b7fcf56d773eab3c0f12e5057e6))

# [1.219.0](https://github.com/betagouv/service-national-universel/compare/v1.218.0...v1.219.0) (2023-02-14)

### Bug Fixes

- **admin:** bus history filter ([9ea7c41](https://github.com/betagouv/service-national-universel/commit/9ea7c41cc27e663d9f88094204139fdb9fc0b73d))
- **admin:** fixes to notifications ([a3ef26f](https://github.com/betagouv/service-national-universel/commit/a3ef26f6df892b8eda281da17886e7ae9a344630))
- **admin:** notifs - no table render if no results ([4618c8c](https://github.com/betagouv/service-national-universel/commit/4618c8c5b7b8bb3139b984f7985c5ae536f93ff4))
- **admin/api:** head center view ([0eaebe4](https://github.com/betagouv/service-national-universel/commit/0eaebe42b01fb5107a277839605010b1d8cae764))
- **api:** test es head center ([f4f0731](https://github.com/betagouv/service-national-universel/commit/f4f0731943eb1c7d1c978cd14d37eefe070f1997))
- **app:** fix disabled check for step upload button ([d6f2435](https://github.com/betagouv/service-national-universel/commit/d6f2435d43bbc3cffcbfdabc2351ce96a42ed7bf))
- **lib:** Force redeploy ([8d0219d](https://github.com/betagouv/service-national-universel/commit/8d0219d556bc1035fee8586974d9a3b330876108))

### Features

- **admin/api:** retour test PDT + MSP demande de modif / historique ([6b93e46](https://github.com/betagouv/service-national-universel/commit/6b93e463568c747844aa58779bc2182c6345cb89))
- **api,admin:** Ajout de colonnes dans l'export du schéma de répartition. ([#2259](https://github.com/betagouv/service-national-universel/issues/2259)) ([91c3319](https://github.com/betagouv/service-national-universel/commit/91c33194e0ed5dac423d5f0ebf7a40ec345afa2a))
- **api/admin:** refonte onglet notifications avec panneau de mail envoyé ([#2240](https://github.com/betagouv/service-national-universel/issues/2240)) ([f284430](https://github.com/betagouv/service-national-universel/commit/f2844300fe1e99f8dd3503b98fbe70e51d346e97))

# [1.218.0](https://github.com/betagouv/service-national-universel/compare/v1.217.0...v1.218.0) (2023-02-13)

### Bug Fixes

- **admin:** history columns width ([0f99e39](https://github.com/betagouv/service-national-universel/commit/0f99e395c2aaef5de7db1445ecf57a8ac095b580))
- **admin:** pas de relance des parents s'ils n'ont pas d'email ([#2250](https://github.com/betagouv/service-national-universel/issues/2250)) ([987c9b7](https://github.com/betagouv/service-national-universel/commit/987c9b76590e7520bc297ef70f3d7682e106b265))
- **admin:** Support for firefox 78 ([9c3236b](https://github.com/betagouv/service-national-universel/commit/9c3236b0acabb6529bfd4bd1dfc8492b0e0c9337))
- **api/admin:** Retours structures - Carte représentant ([#2255](https://github.com/betagouv/service-national-universel/issues/2255)) ([e72d9b5](https://github.com/betagouv/service-national-universel/commit/e72d9b5edca3037f8be0f0dd567090e314a061c6))
- **lib/admin:** Retours structures - gestion des rôles ([#2252](https://github.com/betagouv/service-national-universel/issues/2252)) ([7761b80](https://github.com/betagouv/service-national-universel/commit/7761b803956ffa3b3ad7541cb8548b3e24fe3a65))

### Features

- **admin:** add link to structure page on user form ([609d2e6](https://github.com/betagouv/service-national-universel/commit/609d2e606f10a0e081acec458da023a846c8320a))
- **admin:** refonte historique structure ([2abda10](https://github.com/betagouv/service-national-universel/commit/2abda10768fda8781d09ede966577deb1f21e52f))
- **admin:** remove old user page ([e7ec011](https://github.com/betagouv/service-national-universel/commit/e7ec011d167a62b8403cbd76d88c182a7468e739))

# [1.217.0](https://github.com/betagouv/service-national-universel/compare/v1.216.0...v1.217.0) (2023-02-10)

### Bug Fixes

- **admin:** prod redirection to feature in staging ([aaff84c](https://github.com/betagouv/service-national-universel/commit/aaff84c2425f9550ba9cdb7146906699adaecdbf))
- **admin:** structure view responsible ([da446da](https://github.com/betagouv/service-national-universel/commit/da446da98aa85ed5c1b871e30b9b2f4feff0a4e8))
- **app:** french nationality ([#2251](https://github.com/betagouv/service-national-universel/issues/2251)) ([10c0500](https://github.com/betagouv/service-national-universel/commit/10c050056ccb33396e614bf3cd3d6d0402b174d3))
- **sib:** Delete contacts on soft-delete ([#2248](https://github.com/betagouv/service-national-universel/issues/2248)) ([9ff564b](https://github.com/betagouv/service-national-universel/commit/9ff564b01860ef5dfd62927f6f71e041fc53bd63))

### Features

- **app:** Modal confirmation de changement de PDR ([#2245](https://github.com/betagouv/service-national-universel/issues/2245)) ([6ce66fe](https://github.com/betagouv/service-national-universel/commit/6ce66fe9b320a907610bbabf8eaf7999ca5c8f38))

# [1.216.0](https://github.com/betagouv/service-national-universel/compare/v1.215.0...v1.216.0) (2023-02-09)

### Bug Fixes

- **admin:** center focusedSession ([80fdc4b](https://github.com/betagouv/service-national-universel/commit/80fdc4bc9787c75077e7ecdfc897b812266f71f8))
- **admin:** Fix Volontaire history et user history ([#2243](https://github.com/betagouv/service-national-universel/issues/2243)) ([416dc1d](https://github.com/betagouv/service-national-universel/commit/416dc1dcb9c62808868aecb765a320b0cf63ab3c))
- **api:** pdr name on convocaiton ([2c1fd8d](https://github.com/betagouv/service-national-universel/commit/2c1fd8dcbf894459c7203431475421343fd78fd2))
- **app:** disabled GoogleTags (a update bientot) ([1b6a1cf](https://github.com/betagouv/service-national-universel/commit/1b6a1cfd4f43b77afd964b2cd5619bb8540097f2))
- **app:** remove disabled logic on back button ([3dfad14](https://github.com/betagouv/service-national-universel/commit/3dfad14c11d252a16368837805e1805cec6cd603))
- **lib:** fix departments array for responsibles in canUpdateReferent ([1781ed4](https://github.com/betagouv/service-national-universel/commit/1781ed4397ee052c5b24a6233263b58111c1bf34))

### Features

- **admin:** Ajout convocation pdrName + complement ([#2244](https://github.com/betagouv/service-national-universel/issues/2244)) ([15f78d1](https://github.com/betagouv/service-national-universel/commit/15f78d10058b04debd8130c1193520433247d67c))
- **lib:** Ajout fichier config eslint / prettier ([#2246](https://github.com/betagouv/service-national-universel/issues/2246)) ([13c6889](https://github.com/betagouv/service-national-universel/commit/13c688970c9520ba444f697410f8bd29ba83f92e))

# [1.215.0](https://github.com/betagouv/service-national-universel/compare/v1.214.1...v1.215.0) (2023-02-08)

### Bug Fixes

- **admin:** filter drawer closed by default in history ([b354621](https://github.com/betagouv/service-national-universel/commit/b354621a59cd85a466e42675e9fbc458c3e4e6e1))
- **admin:** wait for structure load on contract page ([38a4067](https://github.com/betagouv/service-national-universel/commit/38a4067f896a4cf15d26303829e31c5c8436c24b))
- **admin:** Wrong url fix ([16af7e4](https://github.com/betagouv/service-national-universel/commit/16af7e462ff52029359318c2e856b41807612ba1))

### Features

- **admin:** reset session / bus / meeetingPoint when waiting affectation ([#2241](https://github.com/betagouv/service-national-universel/issues/2241)) ([be01318](https://github.com/betagouv/service-national-universel/commit/be0131870c7578e048df1f6dccc42bdd10c77290))
- **admin,api:** historique du plan de transports ([#2128](https://github.com/betagouv/service-national-universel/issues/2128)) ([7ef7536](https://github.com/betagouv/service-national-universel/commit/7ef7536ba9d3529da3037c102a040fe48dae1dab))
- **api:** Add ES for emails ([60b2de1](https://github.com/betagouv/service-national-universel/commit/60b2de1e8a07f27b8eac9113e812cc5a03b124fb))
- **api,admin:** Ajout des emplois du temps sur les sessions ([#2238](https://github.com/betagouv/service-national-universel/issues/2238)) ([c9738ce](https://github.com/betagouv/service-national-universel/commit/c9738ced6f3765d03327f5df7fbe29ff4ef6a870))

## [1.214.1](https://github.com/betagouv/service-national-universel/compare/v1.214.0...v1.214.1) (2023-02-07)

### Bug Fixes

- **admin:** Fix some wrong id ([3cb452a](https://github.com/betagouv/service-national-universel/commit/3cb452a2eb93927736af3a15ca1057ccb1c2e92d))
- **admin:** history improvements ([#2235](https://github.com/betagouv/service-national-universel/issues/2235)) ([f33fc9f](https://github.com/betagouv/service-national-universel/commit/f33fc9f4b9bd2c71619fd8bf11d998c3413e4530))
- **admin:** structure redirect contrat ([8c9be66](https://github.com/betagouv/service-national-universel/commit/8c9be660f27e5e5e2b070a6a451a6b599f19b37b))

# [1.214.0](https://github.com/betagouv/service-national-universel/compare/v1.213.0...v1.214.0) (2023-02-06)

### Bug Fixes

- **admin:** Modal Affectation passage cohort from db ([8861cad](https://github.com/betagouv/service-national-universel/commit/8861cad1c4bf9e9d4d79b1ed68f759893d2da65d))
- **admin:** super-admin invisible ([99510e2](https://github.com/betagouv/service-national-universel/commit/99510e2f3b37d53f18bfad16cf767ff158b35312))
- **api:** proposition PDR for admin ([6c5c85e](https://github.com/betagouv/service-national-universel/commit/6c5c85e1046b6f3b702e5376de33bc8d4a956bce))

### Features

- **admin:** Tooltip disabled choix PDR modal affectation ([f587f90](https://github.com/betagouv/service-national-universel/commit/f587f9043068babbb4850ea86f73bbc114747142))
- **admin/api:** new user page design and center edition ([#2224](https://github.com/betagouv/service-national-universel/issues/2224)) ([92f2649](https://github.com/betagouv/service-national-universel/commit/92f264979167c3c1d4ddac419738b83d21b73d1c))

# [1.213.0](https://github.com/betagouv/service-national-universel/compare/v1.212.0...v1.213.0) (2023-02-03)

### Bug Fixes

- **admin:** Tooltip showing when it shouldnt on phase2 ([9a96d40](https://github.com/betagouv/service-national-universel/commit/9a96d403ef966e298e0c7cba6f6c62615ad61010))
- **api:** Add condition ([82afdd3](https://github.com/betagouv/service-national-universel/commit/82afdd362f87dbebb914987c0ad58100c3ed5a26))
- **app/api:** eratum convocation ([6c69fdd](https://github.com/betagouv/service-national-universel/commit/6c69fdd7650c0104a50d94464d4fec1da0835cb1))

### Features

- **admin:** Fiche volontaire : phase 2 - outils d’aide - mission personnalisée ([a80462c](https://github.com/betagouv/service-national-universel/commit/a80462cf3e30b3a079109c2b50dfda3b2449835f))
- **admin:** refonte outil de proposition de mission ([#2232](https://github.com/betagouv/service-national-universel/issues/2232)) ([4e89f33](https://github.com/betagouv/service-national-universel/commit/4e89f3315dae694a0111557c5d9635db92783172))
- **app:** Changement signataire convocaiton ([e7538ef](https://github.com/betagouv/service-national-universel/commit/e7538ef7eb4ad6f2d311ae7d785441d526c35087))

# [1.212.0](https://github.com/betagouv/service-national-universel/compare/v1.211.0...v1.212.0) (2023-02-02)

### Bug Fixes

- **api:** condition for structure manager email on send contract ([a546b30](https://github.com/betagouv/service-national-universel/commit/a546b30808dfbb2dd863d1f2cce67750d40ca811))
- **api:** edit center adress ([cfa14de](https://github.com/betagouv/service-national-universel/commit/cfa14de1f0b0605342368072c5788dc72e87aeb2))
- **app:** Fix du choix d'un PDR quand plusieurs lignes de bus passent par le même PDR ([098d1c2](https://github.com/betagouv/service-national-universel/commit/098d1c21b0c9618fa00116c460184d3bb73c4ef9))
- **structurev2:** fixes to styles and form validation ([477dfe9](https://github.com/betagouv/service-national-universel/commit/477dfe935381a4401cc965726b33ca18187d31c5))

### Features

- **admin:** refonte liste structures (staging) ([#2212](https://github.com/betagouv/service-national-universel/issues/2212)) ([5069080](https://github.com/betagouv/service-national-universel/commit/5069080080336d6306250c164640c7aacb1c78e1))
- **admin:** Relancer la structure ([1a0ad66](https://github.com/betagouv/service-national-universel/commit/1a0ad660c04169246a6e3450135ab59b8eb302f1))
- **api/admin:** refonte structure : représentant de structure ([#2223](https://github.com/betagouv/service-national-universel/issues/2223)) ([4d0c0d5](https://github.com/betagouv/service-national-universel/commit/4d0c0d588ff0e8a290791eee3bc58cf41552a1b8))
- **app:** Ajout date "Trouvez une mission" ([9ee5403](https://github.com/betagouv/service-national-universel/commit/9ee5403e58b7da8dde192b2296ca1e44170c96fc))

# [1.211.0](https://github.com/betagouv/service-national-universel/compare/v1.210.0...v1.211.0) (2023-02-01)

### Bug Fixes

- **admin:** block convocation ([14858c1](https://github.com/betagouv/service-national-universel/commit/14858c13f33bccf989c192c3667fd3662fef1c92))
- **admin:** fix history multiselect input ([0f61f63](https://github.com/betagouv/service-national-universel/commit/0f61f63c580dca85e81a0df302a11dd646d2ac2a))
- **admin:** reouverture convocation + fix ([15c9234](https://github.com/betagouv/service-national-universel/commit/15c9234232ad0cb77348f8770b677f38e12b4f5b))
- **api:** Catch parents without email errors more precisely ([e8d3af6](https://github.com/betagouv/service-national-universel/commit/e8d3af66657b10fea51722c2e88abd88b29c0428))
- **api:** Catch parents without email errors more precisely ([4878c9c](https://github.com/betagouv/service-national-universel/commit/4878c9c4613c74f3dcb314b913754e755bfde8a0))
- **app:** cant download convocation ([9d301c9](https://github.com/betagouv/service-national-universel/commit/9d301c914affb3666e087ffdcaa80e8cb075f496))
- **app/api:** retour convocation ([69159de](https://github.com/betagouv/service-national-universel/commit/69159de070d14f3945e482ac0510da485b557a69))
- **lib/admin:** retours sur historique volontaires ([#2225](https://github.com/betagouv/service-national-universel/issues/2225)) ([61eac2e](https://github.com/betagouv/service-national-universel/commit/61eac2ece9dc23e3815b349d16b1acb898bc2e5a))
- **pdf:** Handle errors in try/catch ([0e79efc](https://github.com/betagouv/service-national-universel/commit/0e79efc56299705417507f06d9f041b73f373b6f))
- **sib:** Handle SIB error call more properly ([0c70571](https://github.com/betagouv/service-national-universel/commit/0c70571db00fa49951617d3a5041d80602594981))

### Features

- **api,app:** améliorations choix des PDR sur le jeune. ([#2227](https://github.com/betagouv/service-national-universel/issues/2227)) ([7f25d44](https://github.com/betagouv/service-national-universel/commit/7f25d4452526cf8b66244aa217263dc29a240949))

# [1.210.0](https://github.com/betagouv/service-national-universel/compare/v1.209.0...v1.210.0) (2023-01-31)

### Bug Fixes

- **admin:** contract wording ([ad816b2](https://github.com/betagouv/service-national-universel/commit/ad816b295912ba3617eb05c5624a175d8b3e6a2d))
- **admin:** intégration des retours sur les exports excel phase 2 ([#2221](https://github.com/betagouv/service-national-universel/issues/2221)) ([f53dbf4](https://github.com/betagouv/service-national-universel/commit/f53dbf4e343233974a1c28f346df9cdb1e13636b))
- **admin:** remove unnecessary route responsible dashboard ([6210235](https://github.com/betagouv/service-national-universel/commit/62102356d3b49f1774c4d504bd0f58333e7a088d))
- **admin:** route contrat d'engagement ([8077fde](https://github.com/betagouv/service-national-universel/commit/8077fdecdd80e67d53f4ef012c8d9bf10e92a2ca))
- **admin:** route staging/prod dashboard responsible ([2a80630](https://github.com/betagouv/service-national-universel/commit/2a80630f1586762ab284c8a6fd783a465cbe14ba))
- **api:** SIB better syncContacts ([#2222](https://github.com/betagouv/service-national-universel/issues/2222)) ([3d2ca33](https://github.com/betagouv/service-national-universel/commit/3d2ca336f3dd6c17d3d97d22b274e4569604cef9))
- **api:** support contact synchro script ([3b93ab7](https://github.com/betagouv/service-national-universel/commit/3b93ab786839ad7fe9a1466add68795234fd69a5))
- **app:** enable button for upload on mobile ([67fcf7a](https://github.com/betagouv/service-national-universel/commit/67fcf7af68a0b1c58e5f2e6dd1cc58b9a66f2b0a))

### Features

- **admin:** export missions / applications filter by status ([517e0a2](https://github.com/betagouv/service-national-universel/commit/517e0a25241b4ec3b9dfc4b9b179c389bd57d0c1))
- **admin:** structure phase 2 profil volontaire / candidature ([2767e0c](https://github.com/betagouv/service-national-universel/commit/2767e0ca6f453fc0d871ca5a87eecb6bb244b3aa))

# [1.209.0](https://github.com/betagouv/service-national-universel/compare/v1.208.0...v1.209.0) (2023-01-30)

### Bug Fixes

- **admin:** fix reponsible dashboard ([08569a8](https://github.com/betagouv/service-national-universel/commit/08569a81d942122f8a4ebed85cbd6a70dbfdb7cf))
- **admin:** fix reponsible dashboard 2 ([e689b48](https://github.com/betagouv/service-national-universel/commit/e689b48deba7670b1c27a3b1253654fd831f1943))
- **admin:** route volontaire responsible ([757fab8](https://github.com/betagouv/service-national-universel/commit/757fab86325f025eaac4d003d1fee3b2672ab791))
- **api:** PDR available for young ([cb588ad](https://github.com/betagouv/service-national-universel/commit/cb588adb9312484b7d2adf2f1865b9085bf03fc8))
- **app:** Tentative fix ([45b140e](https://github.com/betagouv/service-national-universel/commit/45b140e7ed034aba8ddf1b3caac8cd41e75bc3ad))
- **sib:** Add context for error ! ([0e3585b](https://github.com/betagouv/service-national-universel/commit/0e3585b16198c50570016aaac6272721ecb77812))

### Features

- **admin:** carte équipe structure ([#2213](https://github.com/betagouv/service-national-universel/issues/2213)) ([a4dc4a1](https://github.com/betagouv/service-national-universel/commit/a4dc4a104573778f3bbe9b4a2521e4df91000674))
- **api/app:** modifs convocation ([0de12de](https://github.com/betagouv/service-national-universel/commit/0de12de0ae78a134e35cfe8d41ad4a628b581dc0))

# [1.208.0](https://github.com/betagouv/service-national-universel/compare/v1.207.0...v1.208.0) (2023-01-27)

### Bug Fixes

- **admin:** crash navbar ([6c52cee](https://github.com/betagouv/service-national-universel/commit/6c52ceeaa905b40bd1d453faba9e5cd87d17c312))

### Features

- **admin:** open PDT to ref ([e5e8b25](https://github.com/betagouv/service-national-universel/commit/e5e8b25391a3f45ebb7c1d029bd64582be2d0ddc))
- **admin:** structure - responsible phase 2 : Mes candidatures ([#2207](https://github.com/betagouv/service-national-universel/issues/2207)) ([b0c5b41](https://github.com/betagouv/service-national-universel/commit/b0c5b4167581533d2c3ffafa94982399be371e34))
- **api/admin:** Refonte ecran structure détails ([#2218](https://github.com/betagouv/service-national-universel/issues/2218)) ([25e75aa](https://github.com/betagouv/service-national-universel/commit/25e75aa7c43af2f075f4ee3f2803336152afda80))

# [1.207.0](https://github.com/betagouv/service-national-universel/compare/v1.206.0...v1.207.0) (2023-01-26)

### Bug Fixes

- **admin:** mission wording ([5a0a16d](https://github.com/betagouv/service-national-universel/commit/5a0a16dd0f8d4efc98b8d2521a8cf1d1bbf9284d))
- **api:** Error if code only ! ([1c65ddb](https://github.com/betagouv/service-national-universel/commit/1c65ddb6426a922a5af80144d00ace2569b44b24))
- **api:** Handle SIB errors ([d9d6466](https://github.com/betagouv/service-national-universel/commit/d9d64665aa63d2b6910c932e645709e1e7b436b5))
- **api:** Return if creation was ok ! ([a316bfd](https://github.com/betagouv/service-national-universel/commit/a316bfd23459fea3bbd1d5a3ecefd4b4fa45c24c))
- **api:** Trim email ([ef96338](https://github.com/betagouv/service-national-universel/commit/ef96338c53f533ee380ff59b3d5d8bc3c57bac64))
- **api/SIB:** Do not capture for res.text() ([e10a7df](https://github.com/betagouv/service-national-universel/commit/e10a7df97245dc6832f3a54cd13cefd2a46c6140))
- **app:** correction de la suppression des SMS sur la version mobile ([#2216](https://github.com/betagouv/service-national-universel/issues/2216)) ([9738496](https://github.com/betagouv/service-national-universel/commit/973849699476d322714cc0bef20ec57819637608))

### Features

- **api,admin:** Suppression de la demande de préférence de contact pour les représentants + suppression de l'envoi par SMS ([#2211](https://github.com/betagouv/service-national-universel/issues/2211)) ([ad39b5a](https://github.com/betagouv/service-national-universel/commit/ad39b5a9d483a32914972b88fcdce5b1cefb1978))

### Reverts

- Revert "fix(api): Enrich capture SIB" ([c5a5d3c](https://github.com/betagouv/service-national-universel/commit/c5a5d3c21d11637d87b103f4b0e1156006cdf8a9))
- Revert "chore(api): improve error mgmt sib (#2158)" ([ec60b73](https://github.com/betagouv/service-national-universel/commit/ec60b73bb4c006b884cd85292f45bddf40dc8711)), closes [#2158](https://github.com/betagouv/service-national-universel/issues/2158)
- Revert "fix(api): sms error" ([2ee3aa2](https://github.com/betagouv/service-national-universel/commit/2ee3aa296be85565c25a26e13f802370f1b196b4))
- Revert "fix(api): getContact" ([0e9322d](https://github.com/betagouv/service-national-universel/commit/0e9322dbb5d2d7c1adc923332faab743105de116))

# [1.206.0](https://github.com/betagouv/service-national-universel/compare/v1.205.0...v1.206.0) (2023-01-25)

### Features

- **admin:** Completion et tri de l'export de schéma de répartition ([#2208](https://github.com/betagouv/service-national-universel/issues/2208)) ([8b101d9](https://github.com/betagouv/service-national-universel/commit/8b101d9fe12b389f51cf03ffa6c187116c456a7c))
- **admin/api:** super admin panel for cohort ([#2209](https://github.com/betagouv/service-national-universel/issues/2209)) ([ce43728](https://github.com/betagouv/service-national-universel/commit/ce43728a65a389ce1a25669f6ff3f8702d1f11da))

# [1.205.0](https://github.com/betagouv/service-national-universel/compare/v1.204.0...v1.205.0) (2023-01-24)

### Bug Fixes

- **admin:** phase 1 head center ([#2196](https://github.com/betagouv/service-national-universel/issues/2196)) ([1ff6115](https://github.com/betagouv/service-national-universel/commit/1ff61159d03582fcab803b8b518b3caae356a721))
- **admin:** remove SD contact on new session ([92e3d7c](https://github.com/betagouv/service-national-universel/commit/92e3d7c20fdb634ab75febce9f6137806029481d))
- **admin:** update region and department values ([c2c3681](https://github.com/betagouv/service-national-universel/commit/c2c368115043d85a87f9853dbfcb7f20b852fbd2))
- **api:** remove duplicated young patch cron ([735bc81](https://github.com/betagouv/service-national-universel/commit/735bc81532f4313dc3b3f962829b5cc5afc701de))
- **api:** signup invite referent ([33e0d5c](https://github.com/betagouv/service-national-universel/commit/33e0d5c8ec3e43fe76af8cfb2a809dca86c34cab))
- **api/admin:** clean meetingPoint ([18a552e](https://github.com/betagouv/service-national-universel/commit/18a552e04f8ec4c07f464ea5a95e321c5562dab7))

### Features

- **admin:** panel list demande de modifications ([#2199](https://github.com/betagouv/service-national-universel/issues/2199)) ([7827acb](https://github.com/betagouv/service-national-universel/commit/7827acbf840668cac4c98349ecd169def2bcb664))
- **admin:** update open Affectation for ref / admin ([#2204](https://github.com/betagouv/service-national-universel/issues/2204)) ([a8ee914](https://github.com/betagouv/service-national-universel/commit/a8ee914678c8316a1f5b08da2b0ffa14d87930b6))
- **api:** reset phase 1 if young change cohort or reinscription ([#2200](https://github.com/betagouv/service-national-universel/issues/2200)) ([ae846f1](https://github.com/betagouv/service-national-universel/commit/ae846f16230f1a5ddf53923860185e276dfac2cb))
- **api,admin:** Ajout du champs pdrChoiceLimitDate dans le modèle cohort. ([#2205](https://github.com/betagouv/service-national-universel/issues/2205)) ([808aac9](https://github.com/betagouv/service-national-universel/commit/808aac93c155e565a0b35f3672b6f331a252944d))
- **api/admin:** disabled edit PDR if PDR in schema ([#2202](https://github.com/betagouv/service-national-universel/issues/2202)) ([9bacd3d](https://github.com/betagouv/service-national-universel/commit/9bacd3de551e62cdb56ab15f784dec3e775a4a62))

# [1.204.0](https://github.com/betagouv/service-national-universel/compare/v1.203.0...v1.204.0) (2023-01-23)

### Bug Fixes

- **api:** Use deep copy ([6900c9f](https://github.com/betagouv/service-national-universel/commit/6900c9f5a45eedce7bd267cab37c155d31d730db))

### Features

- **admin:** add button to reset parental consent ([#2195](https://github.com/betagouv/service-national-universel/issues/2195)) ([2645f40](https://github.com/betagouv/service-national-universel/commit/2645f400090bd839661361fd6efd4a4bae64314f))
- **api:** Ajouts de tests sur les PDR ([#2198](https://github.com/betagouv/service-national-universel/issues/2198)) ([469574a](https://github.com/betagouv/service-national-universel/commit/469574a0b00246337cbfa07a9c9e541ef0ddfdda))
- **api/admin:** add hasMeetingInformation ([cd10fb3](https://github.com/betagouv/service-national-universel/commit/cd10fb32fce4dce33a6a96d5ee4ea1908ab5388f))

# [1.203.0](https://github.com/betagouv/service-national-universel/compare/v1.202.0...v1.203.0) (2023-01-20)

### Bug Fixes

- **admin:** export application issu de QPV ([13a6c9f](https://github.com/betagouv/service-national-universel/commit/13a6c9f391639c7813d881ec99dbbebd2d913514))
- **admin:** formulaire incomplet isJva mission ([85b6705](https://github.com/betagouv/service-national-universel/commit/85b67050805571c89f245a9fe8793986100d42ea))
- **admin:** formulaire incomplet_2 isJva mission ([2fa4d8e](https://github.com/betagouv/service-national-universel/commit/2fa4d8e545eb12d8527e1d3a602e30e1343d3c8a))
- **admin:** Pb nb pdr inconsistant excel ([#2197](https://github.com/betagouv/service-national-universel/issues/2197)) ([bbc085b](https://github.com/betagouv/service-national-universel/commit/bbc085b7227e48e670787d624a4ec239e062709e))
- **api:** Check if we find youngs before continue ([0b3e43e](https://github.com/betagouv/service-national-universel/commit/0b3e43e994ff016894f29246e02be30926109a42))
- **api:** missing try catch ([83b28b0](https://github.com/betagouv/service-national-universel/commit/83b28b0230f592f39e715c3c532006b7ba055a87))
- **app:** Phase 1 Jeunse Affecté : problème d'activation des étapes ([#2192](https://github.com/betagouv/service-national-universel/issues/2192)) ([ef62d85](https://github.com/betagouv/service-national-universel/commit/ef62d8535b7b1494baa8192d5ca24f539cfa180f))

### Features

- **admin:** delete old centers ([#2190](https://github.com/betagouv/service-national-universel/issues/2190)) ([f0d450c](https://github.com/betagouv/service-national-universel/commit/f0d450cfc885320cc7bd9bde738f2732e9bb6984))
- **admin:** delete old meeting points ([#2191](https://github.com/betagouv/service-national-universel/issues/2191)) ([6413334](https://github.com/betagouv/service-national-universel/commit/6413334aefa48435c0e8f2be7600fafa1c0b5e85))
- **admin:** update dashboard ([1ff96c0](https://github.com/betagouv/service-national-universel/commit/1ff96c0c2d23b977ff3d6a901735c9b968548990))
- **admin/api:** Excel plan de transport + 2/3 fix ([#2189](https://github.com/betagouv/service-national-universel/issues/2189)) ([c0cc5e5](https://github.com/betagouv/service-national-universel/commit/c0cc5e5548ea93ba6b29b712693becd6cc509feb))
- **admin/app:** remove phase2 referent manager email ([#2193](https://github.com/betagouv/service-national-universel/issues/2193)) ([d1e9aee](https://github.com/betagouv/service-national-universel/commit/d1e9aee757968eb2463eeeac7219d94b6ae97b97))
- **api/admin:** update place bus if young WITHDRAW or change cohort ([#2188](https://github.com/betagouv/service-national-universel/issues/2188)) ([f7094ce](https://github.com/betagouv/service-national-universel/commit/f7094ce188ebee373ace334849f09ddbf0fa6be6))
- **app:** add license to young contact questions ([0f7a6fb](https://github.com/betagouv/service-national-universel/commit/0f7a6fbcc9342c588c9a2a985add5c44a9684dc3))

# [1.202.0](https://github.com/betagouv/service-national-universel/compare/v1.201.0...v1.202.0) (2023-01-19)

### Bug Fixes

- **admin:** chef de centre can add team member ([18b92fe](https://github.com/betagouv/service-national-universel/commit/18b92fe00b6608a0a0bf3a14bf9e899e329e9391))
- **admin:** disabled status phase 1 Affected ([1d9022a](https://github.com/betagouv/service-national-universel/commit/1d9022a8cc1c79e5b5d521c59eaff818763e89bf))
- **admin:** Vue PDR : fix de l'erreur sur le filtre par défaut de département ([#2187](https://github.com/betagouv/service-national-universel/issues/2187)) ([b1cfbf7](https://github.com/betagouv/service-national-universel/commit/b1cfbf7246af61c97b184138a7f9895e3fe37c17))
- **admin:** Vue PDR : problème de valeur par défaut des filtres de région et département pour les référents ([#2186](https://github.com/betagouv/service-national-universel/issues/2186)) ([7c5f30f](https://github.com/betagouv/service-national-universel/commit/7c5f30fbb9a823aa26035b2bbcafa59b86582df1))
- **api:** fix autorisation affectation admin pdr ([31c1720](https://github.com/betagouv/service-national-universel/commit/31c172091e4d0bf35eac4cbe5eaca48ed4b07c6c))
- **app:** Update fiche sanitaire ecran affecté ([#2183](https://github.com/betagouv/service-national-universel/issues/2183)) ([a607399](https://github.com/betagouv/service-national-universel/commit/a607399fc55c299f8be29b40a714948e406b40a1))

### Features

- **admin:** cannot edit mission if ARCHIVED ([b833c5c](https://github.com/betagouv/service-national-universel/commit/b833c5ce40865cbe9d0c27ac3cd952d0cc65bc12))
- **admin:** modal affectation can search center by department and region ([e536790](https://github.com/betagouv/service-national-universel/commit/e536790e1b274eafd156ace8e97d6f355808357b))
- **admin:** open affectation phase 1 for admin ([85ce3a5](https://github.com/betagouv/service-national-universel/commit/85ce3a5088e0fe99879978d2a92e820cf849d745))
- **admin/api:** open plan de transport moderateur prod ([#2181](https://github.com/betagouv/service-national-universel/issues/2181)) ([17a26cb](https://github.com/betagouv/service-national-universel/commit/17a26cb4334709a40a12bf3799a723e440dfc409))
- **admin/api:** update convocation ([#2179](https://github.com/betagouv/service-national-universel/issues/2179)) ([0570f01](https://github.com/betagouv/service-national-universel/commit/0570f013bec62818e8e8ac9c7c33a0f6d4d40657))
- **api:** complétion des notifications de déménagement aux référents ([#2184](https://github.com/betagouv/service-national-universel/issues/2184)) ([5974a68](https://github.com/betagouv/service-national-universel/commit/5974a6850cc7514d2f4d8b283c025b1352441f43))

# [1.201.0](https://github.com/betagouv/service-national-universel/compare/v1.200.0...v1.201.0) (2023-01-18)

### Bug Fixes

- **admin:** modal JDM / presence + young status ([71369e7](https://github.com/betagouv/service-national-universel/commit/71369e740354b217dd59e36f42c96fe22a25bb5a))
- **admin:** update mission location when verifying address ([adec268](https://github.com/betagouv/service-national-universel/commit/adec2686f42fb3b15af6bfad4ec7478ddd3233b1))
- **admin/api:** Plan de transport : Safe division by 0 + rename fillingRate to not mix with inscription fillingRate ([6832f2e](https://github.com/betagouv/service-national-universel/commit/6832f2e335c6a0c7c7ca414407587e5153059411))
- **app:** Retours sur la phase 1 ecran Affecté ([#2180](https://github.com/betagouv/service-national-universel/issues/2180)) ([0ec2307](https://github.com/betagouv/service-national-universel/commit/0ec23072ca4b2f33deb43013e9b302ac06b794b6))
- **app:** Retours sur la phase 1 ecran Affecté (suite) ([#2182](https://github.com/betagouv/service-national-universel/issues/2182)) ([008e03a](https://github.com/betagouv/service-national-universel/commit/008e03a71cedbc996916e0d600e7a1757e60be92))

### Features

- **admin:** modification contrat quand envoyé ([c23e62c](https://github.com/betagouv/service-national-universel/commit/c23e62ccc99ff917b2a3113622250f6ee9c303d0))
- **admin:** Plan de transport ([#2152](https://github.com/betagouv/service-national-universel/issues/2152)) ([3bffa1b](https://github.com/betagouv/service-national-universel/commit/3bffa1b0663be424752fe022ca7349bd9024165a))
- **kb:** comment last updated banner ([3352cfc](https://github.com/betagouv/service-national-universel/commit/3352cfc47a379318238e007d42be508db2a69d46))

# [1.200.0](https://github.com/betagouv/service-national-universel/compare/v1.199.0...v1.200.0) (2023-01-17)

### Bug Fixes

- **api:** optimisation multiaction application ([#2178](https://github.com/betagouv/service-national-universel/issues/2178)) ([bf1871f](https://github.com/betagouv/service-national-universel/commit/bf1871f7f84a068d843febb7842abd4a4e3a227c))
- **api:** Synchronously check data ([1038f9d](https://github.com/betagouv/service-national-universel/commit/1038f9d1c3a2fb2eb99decaa88d2617e9fed0587))

### Features

- **admin/api:** Refonte fiche volontaire phase 1 ([4d9b91c](https://github.com/betagouv/service-national-universel/commit/4d9b91cee6033d444500ad3d7c9fe90c67751b93))
- **api/app:** Choix du PDR côté jeune affecté ([#2173](https://github.com/betagouv/service-national-universel/issues/2173)) ([e3105f7](https://github.com/betagouv/service-national-universel/commit/e3105f70c54633642a52fe310de588510814034a))

# [1.199.0](https://github.com/betagouv/service-national-universel/compare/v1.198.1...v1.199.0) (2023-01-16)

### Bug Fixes

- **api:** Fix JVA_TOKEN ([8b59fef](https://github.com/betagouv/service-national-universel/commit/8b59fef165eaf82496e736dbef0975945e1cd5d3))
- **api:** Fix token ([366a8be](https://github.com/betagouv/service-national-universel/commit/366a8be92a113eb39464d2e95f4927dfb13ab3eb))

### Features

- **admin/api:** filtre hasNotes ([#2176](https://github.com/betagouv/service-national-universel/issues/2176)) ([4a91dce](https://github.com/betagouv/service-national-universel/commit/4a91dcecdc7a31dc83348fd56748ea933a6f3080))
- **api:** Fix security issue JVA token ([3137455](https://github.com/betagouv/service-national-universel/commit/313745564f750eea9332f40b2469964bf295fbe2))

## [1.198.1](https://github.com/betagouv/service-national-universel/compare/v1.198.0...v1.198.1) (2023-01-13)

### Bug Fixes

- **admin:** dropdown overflow phase2 ([fcfd1de](https://github.com/betagouv/service-national-universel/commit/fcfd1de055f1c12ba9013f024cfc34ca86d735d6))
- **admin:** ref can validate young ([387f7f5](https://github.com/betagouv/service-national-universel/commit/387f7f56970e00bb905820607f98254366ce4af0))
- **admin:** typo export phase 2 ([0d8b854](https://github.com/betagouv/service-national-universel/commit/0d8b8544e237401bb54b977cdf72596c8ec78525))
- **api:** async function should have try/catch ([ab94275](https://github.com/betagouv/service-national-universel/commit/ab942751824de9991e1e5533551f2c8b31863fba))
- **api:** Fix crash api ?? ([211f808](https://github.com/betagouv/service-national-universel/commit/211f808bc7af67f5101a544decf22560d4d1145c))
- **bdc:** hide updatedAt date and display updated at banner ([fe14fea](https://github.com/betagouv/service-national-universel/commit/fe14feab181495eccda5dd7df5a8686e694f9288))

# [1.198.0](https://github.com/betagouv/service-national-universel/compare/v1.197.0...v1.198.0) (2023-01-12)

### Bug Fixes

- **admin:** export phase 2 ([7e808d9](https://github.com/betagouv/service-national-universel/commit/7e808d92d12652d5714958756b1de5245b4b5cdd))
- **admin:** mission export candidature ([c49700b](https://github.com/betagouv/service-national-universel/commit/c49700b691f7ac7273be902dae165ef3e2eecebf))
- **admin:** shadow tooltip ([cfc2582](https://github.com/betagouv/service-national-universel/commit/cfc2582e37a5f7c54700c59706605befcddbe30a))
- **admin:** wording export file ([20b9365](https://github.com/betagouv/service-national-universel/commit/20b93652e337c71978f9679b9c4b9f01f630a295))
- **admin:** wording filter ([5d3c8ef](https://github.com/betagouv/service-national-universel/commit/5d3c8ef779c0817fd5f05dc736b48072958b2d2c))
- **admin/app:** retour phase2 candidatures ([#2172](https://github.com/betagouv/service-national-universel/issues/2172)) ([c614db2](https://github.com/betagouv/service-national-universel/commit/c614db22fc2f897d95f895372fb8e88a98076e0d))
- **lib:** FROM-TO DATE translation ([4f110a9](https://github.com/betagouv/service-national-universel/commit/4f110a9624ca131a0163011563cd900dc175de5e))

### Features

- **admin:** mission list add two filters ([22ccfe8](https://github.com/betagouv/service-national-universel/commit/22ccfe8bc1d1c57cf7cde1bf0949aec197a2f6e9))
- **app:** INSCRIPTION + PHASE 1 - Ecran Liste complémentaire → ajustements ([75f98e9](https://github.com/betagouv/service-national-universel/commit/75f98e97c102fa3de875af47ec06f7dc635573f1))

# [1.197.0](https://github.com/betagouv/service-national-universel/compare/v1.196.0...v1.197.0) (2023-01-11)

### Bug Fixes

- **admin:** add search bar for original cohort list ([6310753](https://github.com/betagouv/service-national-universel/commit/6310753b6fdde4d7d32488dec8585f7912f25957))
- **admin:** add new cohort for head-center ([d0cd3f4](https://github.com/betagouv/service-national-universel/commit/d0cd3f4509f7d73072d747a7b7f70548cd26e99e))
- **admin:** add search bar for cohort list ([4a9c192](https://github.com/betagouv/service-national-universel/commit/4a9c1921477d1ec7363676c7fb9f1a1ae73e7ee5))
- **admin:** il est tard j'ai oublié un truc ([1f94050](https://github.com/betagouv/service-national-universel/commit/1f9405000fcfffd11c10070e9e40aa7061802d61))
- **admin:** notify young when validated/refused/waiting_list ([1cca3ba](https://github.com/betagouv/service-national-universel/commit/1cca3ba10d842db0fdedd7d27cb3031131eb6772))
- **sentry:** Ignore some errors provoqued by extensions ([fee418b](https://github.com/betagouv/service-national-universel/commit/fee418bccf65de89fffd65839c34952ac5e70a75))

### Features

- **admin:** synchro mission new fields ([730f8c6](https://github.com/betagouv/service-national-universel/commit/730f8c6773acd7c7c69177cc80ade576625a2f6e))

# [1.196.0](https://github.com/betagouv/service-national-universel/compare/v1.195.0...v1.196.0) (2023-01-10)

### Features

- **api/admin:** Compte transporteur + Front compte transporteur ([#2169](https://github.com/betagouv/service-national-universel/issues/2169)) ([2b4da67](https://github.com/betagouv/service-national-universel/commit/2b4da6737ab3c8f1e8f1140e51f9dd7be50fe6b0))
- **api/app:** indicateur d'ouverture des affectations sur les cohortes en base de données ([#2170](https://github.com/betagouv/service-national-universel/issues/2170)) ([8e57cc6](https://github.com/betagouv/service-national-universel/commit/8e57cc655225a757cb2bf1d3f42de9183e6237c6))

# [1.195.0](https://github.com/betagouv/service-national-universel/compare/v1.194.0...v1.195.0) (2023-01-09)

### Bug Fixes

- **admin:** Size of status aggregations was limited to 10 ([d7ff57d](https://github.com/betagouv/service-national-universel/commit/d7ff57de21e5d8022ee7d66bfa67139d15054ca0))
- **api:** dsnj export date ([f0c1155](https://github.com/betagouv/service-national-universel/commit/f0c1155ac3b8324abd5dc21e361a22ba997a034a))
- **api:** fix cron hour ([9611690](https://github.com/betagouv/service-national-universel/commit/96116907725dd38e2098b90a4f2777ca9f0cea25))
- **api:** reminder correction request ([ef07b12](https://github.com/betagouv/service-national-universel/commit/ef07b12708ec65bc7b76bb3ef41cbe99372959b8))
- **lib:** Etranger can be eligible ([d8bf876](https://github.com/betagouv/service-national-universel/commit/d8bf8766c42ce75f04094a143558860817f1729f))
- **lib:** fermeture IDF buffer back to 1.7 for fev ([26f972e](https://github.com/betagouv/service-national-universel/commit/26f972eecc22dff9430cd2c89a694ff95e922823))

### Features

- **admin:** open depart region for assignation ([8fd4034](https://github.com/betagouv/service-national-universel/commit/8fd40343ca5eaad3e46291a73a0c7463266210b4))

# [1.194.0](https://github.com/betagouv/service-national-universel/compare/v1.193.0...v1.194.0) (2023-01-06)

### Bug Fixes

- **admin:** dsnj export date time ([1001765](https://github.com/betagouv/service-national-universel/commit/100176547b5fe44d572fbab56c2323b736ce7df4))
- **admin:** ref can change code centre in edit mode ([738cc41](https://github.com/betagouv/service-national-universel/commit/738cc4139d057f781c4685f7a7f00f60717fd6b5))
- **api:** dsnj export final fixes ([#2168](https://github.com/betagouv/service-national-universel/issues/2168)) ([0ad90dd](https://github.com/betagouv/service-national-universel/commit/0ad90dd2a4f7f055e0f8575e77bba07ee2a5e63b))
- **api:** export date available from ([2353603](https://github.com/betagouv/service-national-universel/commit/23536037b63d30568b4b95ef53b2a892685d13fc))
- **api:** remove lookup table from export ([c624496](https://github.com/betagouv/service-national-universel/commit/c624496d0fbe9a7dc0745c253476f47f693ee678))
- **api/admin:** places restantes edition mission ([5ffc525](https://github.com/betagouv/service-national-universel/commit/5ffc525746f6d4de652f496d3409af2f2b06d0e6))
- **app:** proposition de sejour ([a75f426](https://github.com/betagouv/service-national-universel/commit/a75f426e571af1b2c1011b6ec87833c1681403fa))
- **app/lib:** fermeture sejour fevrier ([55d6f6c](https://github.com/betagouv/service-national-universel/commit/55d6f6cdbea9c55969ee30e2873f9281828c3481))

### Features

- **admin:** liste jeunes + export ([#2167](https://github.com/betagouv/service-national-universel/issues/2167)) ([ea8260c](https://github.com/betagouv/service-national-universel/commit/ea8260cd46ebd7072d07eaad91eb7229aea41e75))
- **admin:** Refonte page candidatures (fiche mission) ([#2164](https://github.com/betagouv/service-national-universel/issues/2164)) ([df55fd1](https://github.com/betagouv/service-national-universel/commit/df55fd1e61130e463df1d0f89f87398186727f8c))
- **admin/app/api:** Droit à l'image - modification ([#2166](https://github.com/betagouv/service-national-universel/issues/2166)) ([ede51e5](https://github.com/betagouv/service-national-universel/commit/ede51e58ca5e28701ed5840c3a2df8cea0dc87d8))

### Reverts

- Revert "Revert "fix(admin): open code centre ref creation"" ([9061947](https://github.com/betagouv/service-national-universel/commit/90619476c9fe10445347f9493daa0c446dce07d8))

# [1.193.0](https://github.com/betagouv/service-national-universel/compare/v1.192.0...v1.193.0) (2023-01-05)

### Bug Fixes

- **api:** dsnj export cron script ([adea7c0](https://github.com/betagouv/service-national-universel/commit/adea7c0d017dff50eb7b85ed87f0826b67dbf6e5))
- **api:** session isFull no longer required ([6afc200](https://github.com/betagouv/service-national-universel/commit/6afc20074c6a815639d89c5ed492473311d4f3cd))
- **app:** open cohort even if it's full ([6f26886](https://github.com/betagouv/service-national-universel/commit/6f26886a1ada5d5da756a7f9848a7e14c7585400))

### Features

- **admin:** open new phase 2 ([449f6ed](https://github.com/betagouv/service-national-universel/commit/449f6ed6bfbb6252a61c656f3a2dd58acfa73c9c))

# [1.192.0](https://github.com/betagouv/service-national-universel/compare/v1.191.4...v1.192.0) (2023-01-04)

### Bug Fixes

- **admin:** cannot affect young ([d42a497](https://github.com/betagouv/service-national-universel/commit/d42a497be8fe7d0c127e160f2c85925bb75ddfb3))
- **api:** autoValidationPhase1 si date cohort undefined ([b97beb5](https://github.com/betagouv/service-national-universel/commit/b97beb5ad78850bf3cabc521ab327d7a2dc867d5))
- **lib:** buffer sejour vers l'infini et l'au dela ([ec5d99b](https://github.com/betagouv/service-national-universel/commit/ec5d99bf49ea58b5904240898885c0d1d43422da))

### Features

- **api:** Add support in mongoDB model to save messageUUID ([56806dc](https://github.com/betagouv/service-national-universel/commit/56806dc9da1401f27aac440870f231e6633be6db))
- **api/admin:** MEP dsnj ([#2165](https://github.com/betagouv/service-national-universel/issues/2165)) ([503decb](https://github.com/betagouv/service-national-universel/commit/503decb32ae00db2aaf6ab412360b1a11a50af14))

## [1.191.4](https://github.com/betagouv/service-national-universel/compare/v1.191.3...v1.191.4) (2023-01-02)

### Bug Fixes

- **api:** fetch parent structure only if exist ([d3b6f08](https://github.com/betagouv/service-national-universel/commit/d3b6f087805e1febad6ef4ac0232be5db551f9e4))

## [1.191.3](https://github.com/betagouv/service-national-universel/compare/v1.191.2...v1.191.3) (2022-12-27)

### Bug Fixes

- **admin:** mission visibility ([fa32e77](https://github.com/betagouv/service-national-universel/commit/fa32e775ce6377732e5c21c7ae1ce639194d0b39))

## [1.191.2](https://github.com/betagouv/service-national-universel/compare/v1.191.1...v1.191.2) (2022-12-25)

### Bug Fixes

- **api:** Do not send if no parents allow SNU ([c2d82b2](https://github.com/betagouv/service-national-universel/commit/c2d82b2177b8384986017c9256ae1fa8fab4e346))

## [1.191.1](https://github.com/betagouv/service-national-universel/compare/v1.191.0...v1.191.1) (2022-12-24)

### Bug Fixes

- **admin:** Cast to ObjectId failed for value "" ([8eb6cc2](https://github.com/betagouv/service-national-universel/commit/8eb6cc2d6da0f467aeea106f151d933a26a7dbba))
- **admin:** pendingApplication Status ([4840792](https://github.com/betagouv/service-national-universel/commit/4840792240b813f466dda31342c293a29d4dc427))
- **admin:** permission edition fiche mission ([fbb1864](https://github.com/betagouv/service-national-universel/commit/fbb1864515dccb082b5856ae1b2c422c1d273373))

# [1.191.0](https://github.com/betagouv/service-national-universel/compare/v1.190.1...v1.191.0) (2022-12-23)

### Bug Fixes

- **admin:** fiche mission ([5a6d86a](https://github.com/betagouv/service-national-universel/commit/5a6d86a52a7a8805a9e476579d74ac706526e4fe))
- **api:** move patch models to dedicated files (preventing multiple instances) ([1b69b0b](https://github.com/betagouv/service-national-universel/commit/1b69b0b556cdbd60ae7b340a0ddabcae306d6d36))
- **api:** remove console.log ([71ca388](https://github.com/betagouv/service-national-universel/commit/71ca38877492ed7609692d71dc4ed4d42f6b29c9))

### Features

- **admin/api:** refonte visualition / edition Mission ([#2150](https://github.com/betagouv/service-national-universel/issues/2150)) ([9135570](https://github.com/betagouv/service-national-universel/commit/91355706db0ccb5addf65465926b8e7888e6c04c))
- **api:** Send mail change cohort ([#2163](https://github.com/betagouv/service-national-universel/issues/2163)) ([fe5b2fc](https://github.com/betagouv/service-national-universel/commit/fe5b2fc1367998b5138ee48b2db355d086810edb))
- **lib:** Update inscription rate to 170% ([a9a4350](https://github.com/betagouv/service-national-universel/commit/a9a4350e2f0fc0ab84211b07dff261633dd49089))

## [1.190.1](https://github.com/betagouv/service-national-universel/compare/v1.190.0...v1.190.1) (2022-12-22)

### Bug Fixes

- **app:** home jeune refusé [#2159](https://github.com/betagouv/service-national-universel/issues/2159) ([932f125](https://github.com/betagouv/service-national-universel/commit/932f12505afa3df2432ef1a03cab2ba680a68f35))

# [1.190.0](https://github.com/betagouv/service-national-universel/compare/v1.189.0...v1.190.0) (2022-12-21)

### Bug Fixes

- **admin:** Bug historic ([547544d](https://github.com/betagouv/service-national-universel/commit/547544d7e1702643a764862ec418eb244adc1fbf))
- **admin:** redirect support ([6184734](https://github.com/betagouv/service-national-universel/commit/6184734677597aff5f442c5f41bc3f95b8d31d88))
- **api:** dsnj export async loop ([a3babb6](https://github.com/betagouv/service-national-universel/commit/a3babb68a846ce78db628b13bc31075797ff0b1c))
- **api:** export date timezone error ([1247f68](https://github.com/betagouv/service-national-universel/commit/1247f6845fd0dd0a0109a0d420b0c447c6b8ccf7))
- **lib:** add invite dsnj template ([bf1ca35](https://github.com/betagouv/service-national-universel/commit/bf1ca350213e9d5a4a1edd6b7f7347d8ff457cb3))
- **lib:** cloture inscription date ([ed06d13](https://github.com/betagouv/service-national-universel/commit/ed06d135abe868d0e0071a32695c9c166dac3807))
- **lib:** mapping Occitanie ([eaa81c5](https://github.com/betagouv/service-national-universel/commit/eaa81c5031cd586e6e159c1d743e6c371aea68c6))
- cron for staging ([a18b900](https://github.com/betagouv/service-national-universel/commit/a18b9008217bc91a5a747be50c41fa71b0f2f9fb))
- cron for staging ([0182357](https://github.com/betagouv/service-national-universel/commit/0182357bc3af1b8bc289150f08ed0ffc622b5aa3))

### Features

- **api/admin:** generate and download dsnj exports ([#2151](https://github.com/betagouv/service-national-universel/issues/2151)) ([5c0fef2](https://github.com/betagouv/service-national-universel/commit/5c0fef215dd062dc0a9fd7a5532c5958c90b3289))

# [1.189.0](https://github.com/betagouv/service-national-universel/compare/v1.188.0...v1.189.0) (2022-12-20)

### Bug Fixes

- **admin:** filter corse department ([5dc9781](https://github.com/betagouv/service-national-universel/commit/5dc978127d4d416a1f1ced4e7967cbce911e2090))
- **admin:** redirection vers export inscription + places restantes missions ([931c2da](https://github.com/betagouv/service-national-universel/commit/931c2daeb6e5ee19b519b381cb2040e92f33d594))
- **api:** update date modification dossier ([#2157](https://github.com/betagouv/service-national-universel/issues/2157)) ([5887688](https://github.com/betagouv/service-national-universel/commit/58876880f46198352903a6b95db8a42ce7457395))

### Features

- **app:** home phase 1, en attente de validation, en attente de correction, liste complémentaire ([#2153](https://github.com/betagouv/service-national-universel/issues/2153)) ([ed7dbd4](https://github.com/betagouv/service-national-universel/commit/ed7dbd41d60fede39efd748389f9dff3f1eadb11))
- **app:** Refonte préférences phase 2 ([#2144](https://github.com/betagouv/service-national-universel/issues/2144)) ([f2f4dac](https://github.com/betagouv/service-national-universel/commit/f2f4dac60d118649e5fd028f771387cb1529d65f))

# [1.188.0](https://github.com/betagouv/service-national-universel/compare/v1.187.0...v1.188.0) (2022-12-19)

### Features

- **admin:** ajout d'une stat "Taux de dossiers ouverts" sur le dashboard inscriptions ([#2154](https://github.com/betagouv/service-national-universel/issues/2154)) ([26155a0](https://github.com/betagouv/service-national-universel/commit/26155a0b757d1d64ce113e515163455f8b4f2903))

# [1.187.0](https://github.com/betagouv/service-national-universel/compare/v1.186.0...v1.187.0) (2022-12-16)

### Bug Fixes

- **admin:** Name of filters ([2c65a7f](https://github.com/betagouv/service-national-universel/commit/2c65a7fb586c8a68f49630f0213cdcaa686b91a6))

### Features

- **app:** je donne mon avis post inscription ([#2148](https://github.com/betagouv/service-national-universel/issues/2148)) ([a1ceef8](https://github.com/betagouv/service-national-universel/commit/a1ceef8334087535695806ca9a1849ad9feb5ccb))

# [1.186.0](https://github.com/betagouv/service-national-universel/compare/v1.185.0...v1.186.0) (2022-12-15)

### Features

- **api/admin:** Liste demande de modification plan de tranport ([#2145](https://github.com/betagouv/service-national-universel/issues/2145)) ([67046f3](https://github.com/betagouv/service-national-universel/commit/67046f3b92bd2dde3a3612d96b68831c918986a9))

# [1.185.0](https://github.com/betagouv/service-national-universel/compare/v1.184.0...v1.185.0) (2022-12-14)

### Bug Fixes

- **admin:** getFilterLabel ([#2140](https://github.com/betagouv/service-national-universel/issues/2140)) ([6ac0673](https://github.com/betagouv/service-national-universel/commit/6ac0673d4b386c071841804542407d00519637dc))
- **api:** fix sib error management ([#2141](https://github.com/betagouv/service-national-universel/issues/2141)) ([e479e0b](https://github.com/betagouv/service-national-universel/commit/e479e0bc345ca50625ccb9bf0097206e17095f4c))

### Features

- **api/admin:** tags for demande de modification ([#2138](https://github.com/betagouv/service-national-universel/issues/2138)) ([346487e](https://github.com/betagouv/service-national-universel/commit/346487e1bee6a004bd661341600a207d5bbf4742))

# [1.184.0](https://github.com/betagouv/service-national-universel/compare/v1.183.0...v1.184.0) (2022-12-13)

### Bug Fixes

- **admin:** bug image upload modal ([98c95ee](https://github.com/betagouv/service-national-universel/commit/98c95ee6bf42f84e11e7bc9028febdb63515572e))
- **admin:** correction translation document [#2135](https://github.com/betagouv/service-national-universel/issues/2135) ([de124e1](https://github.com/betagouv/service-national-universel/commit/de124e178e030beacd6171d717755820de80d20d))
- **admin:** filter width css ([687bf11](https://github.com/betagouv/service-national-universel/commit/687bf119c424ef975afd28e978c4298c2c5e6c04))
- **admin:** Mission duration fix everywhere ([#2133](https://github.com/betagouv/service-national-universel/issues/2133)) ([233c17e](https://github.com/betagouv/service-national-universel/commit/233c17ee7d59be506380bc5509f19ad189305f08))
- **admin:** Retour après test phase 2 ([#2117](https://github.com/betagouv/service-national-universel/issues/2117)) ([0416f8b](https://github.com/betagouv/service-national-universel/commit/0416f8b9b75d087dd5af6a1e730c6b65bc3d2a60))
- **api:** dont make cron scripts exit ([a95d4d2](https://github.com/betagouv/service-national-universel/commit/a95d4d2319b898c8014756c4b141daf901f6d613))

### Features

- **admin:** filter contract status [#2136](https://github.com/betagouv/service-national-universel/issues/2136) ([a1d387b](https://github.com/betagouv/service-national-universel/commit/a1d387beef9b98e4287e252883418e2ae4455698))
- **admin:** filter hebergement MIG [#2137](https://github.com/betagouv/service-national-universel/issues/2137) ([89085d8](https://github.com/betagouv/service-national-universel/commit/89085d8d51518ec78a03eeba125e018a3b76d7d5))
- **api:** filtre contract Status on application ([#2129](https://github.com/betagouv/service-national-universel/issues/2129)) ([873fbb3](https://github.com/betagouv/service-national-universel/commit/873fbb35b4dc5b93be89a6b15b261c72913a994c))
- **api/admin:** Demande de modif bus ([#2134](https://github.com/betagouv/service-national-universel/issues/2134)) ([738a45b](https://github.com/betagouv/service-national-universel/commit/738a45b5374ebced7eb2a7ebbd67eed8e73c62c5))

# [1.183.0](https://github.com/betagouv/service-national-universel/compare/v1.182.1...v1.183.0) (2022-12-12)

### Bug Fixes

- **admin:** Search in school filter ([4b9a646](https://github.com/betagouv/service-national-universel/commit/4b9a646bf76a061a175f814fc8465beff3145ad5))
- **api:** slack function is async ([c3ceebe](https://github.com/betagouv/service-national-universel/commit/c3ceebee84a98b120a319861b88c57df7eb0371a))

### Features

- **admin/api:** add check for bus ([#2130](https://github.com/betagouv/service-national-universel/issues/2130)) ([5fd085d](https://github.com/betagouv/service-national-universel/commit/5fd085d2fdf166c5f1384557c240c5ba56690d6b))

## [1.182.1](https://github.com/betagouv/service-national-universel/compare/v1.182.0...v1.182.1) (2022-12-10)

### Bug Fixes

- **app:** make cron patch processes exit ([200b4df](https://github.com/betagouv/service-national-universel/commit/200b4df80c5af24278c3c29a9d737303a0c3ab33))

# [1.182.0](https://github.com/betagouv/service-national-universel/compare/v1.181.0...v1.182.0) (2022-12-09)

### Bug Fixes

- **admin:** Schema de répartition : réactivité des groupes sur la modification des lieux de rassemblements ([#2125](https://github.com/betagouv/service-national-universel/issues/2125)) ([d575442](https://github.com/betagouv/service-national-universel/commit/d5754429ef6a6ad001b1dc9574a685a185d7719b))

### Features

- **admin/api:** Mise en prod du schéma de répartition ([#2127](https://github.com/betagouv/service-national-universel/issues/2127)) ([4bf6799](https://github.com/betagouv/service-national-universel/commit/4bf679922d928923d4c46d176bbce143d1878d55))
- **api/admin/app:** ajout hebergement pour mission ([#2123](https://github.com/betagouv/service-national-universel/issues/2123)) ([543a581](https://github.com/betagouv/service-national-universel/commit/543a5817eb9d85eb34e893dace08e50728b67d3d))

### Reverts

- Revert "fix(admin): open code centre ref creation" ([be76238](https://github.com/betagouv/service-national-universel/commit/be76238c7921a7d932a24540f8a4641e3435c78c))

# [1.181.0](https://github.com/betagouv/service-national-universel/compare/v1.180.0...v1.181.0) (2022-12-08)

### Bug Fixes

- **admin:** open code centre ref creation ([4708948](https://github.com/betagouv/service-national-universel/commit/47089480f377ccb2d67a01d3ec019a8b18564f8c))

### Features

- **admin/api:** bus point de rassemblement ([#2120](https://github.com/betagouv/service-national-universel/issues/2120)) ([079feff](https://github.com/betagouv/service-national-universel/commit/079fefff9b5a73618fc51734282d74119e138f17))
- **admin/api:** Schéma de répartition : Nouvelle étape de choix des Points de rassemblements ([#2122](https://github.com/betagouv/service-national-universel/issues/2122)) ([409bd89](https://github.com/betagouv/service-national-universel/commit/409bd89a894428dc0edbcc443f2f26353f833e2c))
- **api:** template mail session waiting validation ([#2121](https://github.com/betagouv/service-national-universel/issues/2121)) ([0feeb0e](https://github.com/betagouv/service-national-universel/commit/0feeb0ed0be511773b2ccc0e4ed259f9ac571b06))

# [1.180.0](https://github.com/betagouv/service-national-universel/compare/v1.179.1...v1.180.0) (2022-12-07)

### Bug Fixes

- **admin:** fix cohorts default value PDR ([923da4b](https://github.com/betagouv/service-national-universel/commit/923da4bd02a10c042aadd02884bad9cf29d7262b))
- **admin:** fix PDR view for ref dep ([a5e6b3d](https://github.com/betagouv/service-national-universel/commit/a5e6b3dc6b550d5684b74a243cbf6023973b270e))
- **admin:** schema repartition - role référent département ([#2119](https://github.com/betagouv/service-national-universel/issues/2119)) ([b06eb6c](https://github.com/betagouv/service-national-universel/commit/b06eb6c434238b665336b5c439c30543a8b65b7e))

### Features

- **admin:** ligne de bus centre ([#2116](https://github.com/betagouv/service-national-universel/issues/2116)) ([1848250](https://github.com/betagouv/service-national-universel/commit/1848250d9d7b2beddc4241245cb4e57c22f11ec5))

## [1.179.1](https://github.com/betagouv/service-national-universel/compare/v1.179.0...v1.179.1) (2022-12-06)

### Bug Fixes

- **admin:** table de repartition vu departement ([d1e4dcd](https://github.com/betagouv/service-national-universel/commit/d1e4dcd3aa935db45ee7e6f0f3424e162b12f102))

# [1.179.0](https://github.com/betagouv/service-national-universel/compare/v1.178.1...v1.179.0) (2022-12-05)

### Bug Fixes

- **admin:** Add numeros mobile fr ! ([3012344](https://github.com/betagouv/service-national-universel/commit/30123442baf2e29b7127c88589e3c88fd8fb730b))
- **admin:** use citycode if BAN doesn't return postcode ([60f0f11](https://github.com/betagouv/service-national-universel/commit/60f0f113e3b049085cab32deb2018b1de2866fe7))
- **admin/api:** Doublon code centre ([#2113](https://github.com/betagouv/service-national-universel/issues/2113)) ([4f21760](https://github.com/betagouv/service-national-universel/commit/4f21760fa907387f677966ee38ea573f5c086ccf))
- **api:** No expirationDate for military preparation files ([92efbdc](https://github.com/betagouv/service-national-universel/commit/92efbdcdd4e466a0431470726675487e812b3a73))
- **app/api:** fix date eligibility ([#2109](https://github.com/betagouv/service-national-universel/issues/2109)) ([80db4f0](https://github.com/betagouv/service-national-universel/commit/80db4f0ff51d77f55914fc89121b91841d69bcd0))

### Features

- **admin:** Filter by schoolname ([7a043f5](https://github.com/betagouv/service-national-universel/commit/7a043f5de13fe83081d7d59e6ba64fb0c176eb95))
- **admin:** ouverture prod centre + point de rassemblement + table de répartition ([#2111](https://github.com/betagouv/service-national-universel/issues/2111)) ([7967fbf](https://github.com/betagouv/service-national-universel/commit/7967fbfcb1d3418bac9de4fc86ef7584cd799ac3))

## [1.178.1](https://github.com/betagouv/service-national-universel/compare/v1.178.0...v1.178.1) (2022-12-04)

### Bug Fixes

- **api:** remove useless slack info from cron ([457f867](https://github.com/betagouv/service-national-universel/commit/457f867226b938eea001d46d03244256702a0f41))

# [1.178.0](https://github.com/betagouv/service-national-universel/compare/v1.177.0...v1.178.0) (2022-12-02)

### Bug Fixes

- **admin:** order session by date in list center [#2104](https://github.com/betagouv/service-national-universel/issues/2104) ([0e4e13c](https://github.com/betagouv/service-national-universel/commit/0e4e13c81b18c562cae90f457ecfb6fe46b6a205))
- **api/admin:** schéma de répartition : cohérence des données + finalisation ([#2100](https://github.com/betagouv/service-national-universel/issues/2100)) ([1471872](https://github.com/betagouv/service-national-universel/commit/1471872f5fe732a85320772745db2dacabbd1499))

### Features

- **admin:** export centre / session ([#2105](https://github.com/betagouv/service-national-universel/issues/2105)) ([a17037d](https://github.com/betagouv/service-national-universel/commit/a17037d1996583ad8e65ed156b9e21f0cd1b18eb))
- **admin:** file upload from contact form ([#2097](https://github.com/betagouv/service-national-universel/issues/2097)) ([730c040](https://github.com/betagouv/service-national-universel/commit/730c0401ed209c0ed33d94db1d627e65e4920ddd))

# [1.177.0](https://github.com/betagouv/service-national-universel/compare/v1.176.0...v1.177.0) (2022-12-01)

### Bug Fixes

- **admin:** Fiche centre modal ([#2102](https://github.com/betagouv/service-national-universel/issues/2102)) ([9c56012](https://github.com/betagouv/service-national-universel/commit/9c560120842c452630ae4d7f7b17cc53c399caf0))
- **admin:** fix validation incorrectly setting waiting list status ([cd37f8e](https://github.com/betagouv/service-national-universel/commit/cd37f8eb0ed000053189639b8704629e45792b8c))
- **api:** set isEligible status in session for refs ([a6255e8](https://github.com/betagouv/service-national-universel/commit/a6255e8a28edca09e060194b6970fcab0673dae0))
- **api/lib:** add Corse department ([72038bd](https://github.com/betagouv/service-national-universel/commit/72038bda9fc1e141a11a16fff1692b27760dd87c))
- **app:** upload step improvements ([#2095](https://github.com/betagouv/service-national-universel/issues/2095)) ([97d40e8](https://github.com/betagouv/service-national-universel/commit/97d40e8aba2c8285d9e21c5d089b61d1fc1a345d))

### Features

- **admin/app:** refacto Session centre ([#2098](https://github.com/betagouv/service-national-universel/issues/2098)) ([3e90672](https://github.com/betagouv/service-national-universel/commit/3e90672c31d6fd894ec73f7ba5327a5fb2e08aac))

# [1.176.0](https://github.com/betagouv/service-national-universel/compare/v1.175.1...v1.176.0) (2022-11-30)

### Features

- **api/app/admin:** Objectives by region ([#2088](https://github.com/betagouv/service-national-universel/issues/2088)) ([316800d](https://github.com/betagouv/service-national-universel/commit/316800d6c822c14511d13ecc60e8f539096f819c))

## [1.175.1](https://github.com/betagouv/service-national-universel/compare/v1.175.0...v1.175.1) (2022-11-29)

### Bug Fixes

- **api/admin:** handle case of numeric department ([12c3804](https://github.com/betagouv/service-national-universel/commit/12c3804dc897fca67e76a9a10091b7e81a3a0c20))

# [1.175.0](https://github.com/betagouv/service-national-universel/compare/v1.174.0...v1.175.0) (2022-11-28)

### Features

- **admin/api:** modification d'un centre ([#2093](https://github.com/betagouv/service-national-universel/issues/2093)) ([200054d](https://github.com/betagouv/service-national-universel/commit/200054df54fcd8697c1cf566a8e4867f9beaad79))
- **admin/api:** Schéma de répartition : Détail des départements ([#2092](https://github.com/betagouv/service-national-universel/issues/2092)) ([2650a19](https://github.com/betagouv/service-national-universel/commit/2650a191715a5cac87979efb5b744b10646d7885))

# [1.174.0](https://github.com/betagouv/service-national-universel/compare/v1.173.0...v1.174.0) (2022-11-25)

### Features

- **admin/api:** Modal ajout d'une session à un centre ([#2087](https://github.com/betagouv/service-national-universel/issues/2087)) ([b17daed](https://github.com/betagouv/service-national-universel/commit/b17daed2d3d462c23776fb4d3bca70323ccec2ba))

# [1.173.0](https://github.com/betagouv/service-national-universel/compare/v1.172.1...v1.173.0) (2022-11-24)

### Bug Fixes

- **admin:** écran candidature ([#1845](https://github.com/betagouv/service-national-universel/issues/1845)) ([5eb3e85](https://github.com/betagouv/service-national-universel/commit/5eb3e854738392be2c82c75bab67d3b139c39f25))
- **api:** eligibility check in signup ([3d20330](https://github.com/betagouv/service-national-universel/commit/3d20330c5786dbafe005cc6f0766e435234e2630))
- **api:** revert eligibility fix ([7665faf](https://github.com/betagouv/service-national-universel/commit/7665faf05f39dcf41648124c148abce3851c48ca))

### Features

- **admin:** Export modal candidatures depuis volontaire ([#2082](https://github.com/betagouv/service-national-universel/issues/2082)) ([9c9b312](https://github.com/betagouv/service-national-universel/commit/9c9b312e7f6243c1336bfab331726100b9e0a83b))
- **admin:** page centre V2 ([#2080](https://github.com/betagouv/service-national-universel/issues/2080)) ([cf4a1e0](https://github.com/betagouv/service-national-universel/commit/cf4a1e0427395f8147b9f46902ce494fc4c64ecd))

## [1.172.1](https://github.com/betagouv/service-national-universel/compare/v1.172.0...v1.172.1) (2022-11-23)

### Bug Fixes

- **admin:** inscription par référent ([#2079](https://github.com/betagouv/service-national-universel/issues/2079)) ([69326eb](https://github.com/betagouv/service-national-universel/commit/69326eb6bcd70d8fa6505928380c0e24b5d3fd55))
- **api:** eligibility function in young change cohort route ([8786e8f](https://github.com/betagouv/service-national-universel/commit/8786e8fb4628a22f5ff83c2412d8400750ce7458))
- **api:** Let sender to SNU ([7cc7923](https://github.com/betagouv/service-national-universel/commit/7cc7923d36b81b7f001c4a1187b4af23fa504103))
- **api:** SMS are not sent anymore ([09457ee](https://github.com/betagouv/service-national-universel/commit/09457ee4d738c5cb4cfca0e07f6bbe5591b95639))
- **api:** throw error if pb with SIB ([b0979b2](https://github.com/betagouv/service-national-universel/commit/b0979b2798455f514e05c8643fdc81a602f40dab))
- **app:** ecran phase 1 - modale fiche sanitaire ([7416318](https://github.com/betagouv/service-national-universel/commit/7416318191358c31a1c7b9276ab46e3713ca86a7))
- **lib:** add "Côtes-d'Armor" (with a "-") to academic zones mapping ([49ffdf8](https://github.com/betagouv/service-national-universel/commit/49ffdf8750636be8867496cbbe42f622f24f2940))

# [1.172.0](https://github.com/betagouv/service-national-universel/compare/v1.171.0...v1.172.0) (2022-11-22)

### Features

- **admin:** refonte inscription par référent ([#2035](https://github.com/betagouv/service-national-universel/issues/2035)) ([8f786e1](https://github.com/betagouv/service-national-universel/commit/8f786e18fa4972a1fcbb6f8d3521830233e9ad30))
- **admin:** Tableau des établissement ([#2061](https://github.com/betagouv/service-national-universel/issues/2061)) ([868f3bf](https://github.com/betagouv/service-national-universel/commit/868f3bfb31793170848ddce270e17b7d396116cd))
- **app:** formulaire invitation ([#2044](https://github.com/betagouv/service-national-universel/issues/2044)) ([53f2f8b](https://github.com/betagouv/service-national-universel/commit/53f2f8bc2b940468f5466f8397499bf6d8d35413))

# [1.171.0](https://github.com/betagouv/service-national-universel/compare/v1.170.0...v1.171.0) (2022-11-21)

### Bug Fixes

- **admin:** delete note cancel ([750894d](https://github.com/betagouv/service-national-universel/commit/750894da7781d9c7727321f1390e7c83f2a02218))
- **admin:** Documents phase 1 ([#2070](https://github.com/betagouv/service-national-universel/issues/2070)) ([6c2a95c](https://github.com/betagouv/service-national-universel/commit/6c2a95c28aec96229f1bc894c3afb952fe205c18))
- **admin:** fix error when no application found on responsible dashboard ([677efca](https://github.com/betagouv/service-national-universel/commit/677efca8c011aac6f0d7b544b165e2e2874f7f3e))
- **admin:** more button style ([26be89f](https://github.com/betagouv/service-national-universel/commit/26be89f647bbdd158b338a1fd5d5aa9a0d3e6a88))
- **admin:** Use new ramses base by default ([#2059](https://github.com/betagouv/service-national-universel/issues/2059)) ([274f509](https://github.com/betagouv/service-national-universel/commit/274f50915c5b430a959afdb90a66d4cddd9c4a9b))
- **app:** correctly set birthdate for eligibility ([#2071](https://github.com/betagouv/service-national-universel/issues/2071)) ([35abfab](https://github.com/betagouv/service-national-universel/commit/35abfab1ab478bb1ffc9782c10f32eb7a57a383a))
- **pdf:** Pb with cache puppeteer v19 ([02fbe96](https://github.com/betagouv/service-national-universel/commit/02fbe9645b9c852ce61fcf5e73d1cb496f221d3d))

### Features

- **admin/api:** Note interne ([#2068](https://github.com/betagouv/service-national-universel/issues/2068)) ([74990b7](https://github.com/betagouv/service-national-universel/commit/74990b7c0668caae824bf1984cdf63a5d7236236))

# [1.170.0](https://github.com/betagouv/service-national-universel/compare/v1.169.0...v1.170.0) (2022-11-18)

### Bug Fixes

- **admin:** add function to get department for eligibility ([2bdb991](https://github.com/betagouv/service-national-universel/commit/2bdb991363941adaf14ee08a737e3345dba9cf55))
- **app:** bug when no correction on upload ([9473e72](https://github.com/betagouv/service-national-universel/commit/9473e7283dd92b690b8211fa13f752ba0462225d))
- **app:** fix error display on upload page ([2ca04c2](https://github.com/betagouv/service-national-universel/commit/2ca04c2c2e83729ad3a716e7f47c8a9f5a037d4e))

### Features

- **api/admin:** paramétrage clôture des propositions de séjour ([#2003](https://github.com/betagouv/service-national-universel/issues/2003)) ([9cfe2b2](https://github.com/betagouv/service-national-universel/commit/9cfe2b25f813067e176bfa7c9ee376aa8f646984))

# [1.169.0](https://github.com/betagouv/service-national-universel/compare/v1.168.0...v1.169.0) (2022-11-17)

### Bug Fixes

- **admin:** Can't have email empty as well ([3426de5](https://github.com/betagouv/service-national-universel/commit/3426de5a8b7949780a8842dc98c7bccf6849cf1c))
- **admin:** Can't have phone number undefined ([0863f2b](https://github.com/betagouv/service-national-universel/commit/0863f2bfbb4e8ec8d68118241a5299bfb858f642))
- **admin:** phase 0 parent2 refused style ([a654253](https://github.com/betagouv/service-national-universel/commit/a654253c69026ab6ee0acf3f5cde56c283a67308))
- **admin:** phase 0 parent2 view consent ([06b57d6](https://github.com/betagouv/service-national-universel/commit/06b57d6c06e855e015a72c6c433f220cb1fc3dda))
- **api:** allow ref deps to access reinscription ([d80dbd4](https://github.com/betagouv/service-national-universel/commit/d80dbd435871f559917c1e64488f6994a34d52f5))

### Features

- **admin:** table de repartition fini ([#2060](https://github.com/betagouv/service-national-universel/issues/2060)) ([fb0ef30](https://github.com/betagouv/service-national-universel/commit/fb0ef30ec2c322b19f80aa95cb5be7161c34a32f))
- **admin/api:** send parent reminder ([#2056](https://github.com/betagouv/service-national-universel/issues/2056)) ([f6d9287](https://github.com/betagouv/service-national-universel/commit/f6d92876ddae035dbde0d66f6c6b8155d3468b61))

# [1.168.0](https://github.com/betagouv/service-national-universel/compare/v1.167.0...v1.168.0) (2022-11-16)

### Bug Fixes

- **app:** Change restriction reinscription critary ([#2058](https://github.com/betagouv/service-national-universel/issues/2058)) ([87b9ca1](https://github.com/betagouv/service-national-universel/commit/87b9ca13eaa22ac388f35ae611d68e01da49cb25))
- **app/api:** date preinscription ([#2051](https://github.com/betagouv/service-national-universel/issues/2051)) ([12b4e67](https://github.com/betagouv/service-national-universel/commit/12b4e67092165205c9dd11e10acde84ba763dc42))

### Features

- **admin/app:** update link footer ([5064eef](https://github.com/betagouv/service-national-universel/commit/5064eefa38a784c3a32e44303366744e9745cbd4))

# [1.167.0](https://github.com/betagouv/service-national-universel/compare/v1.166.0...v1.167.0) (2022-11-15)

### Bug Fixes

- **app:** corrections et optimisations sur téléversement documents ([#2052](https://github.com/betagouv/service-national-universel/issues/2052)) ([75dedc9](https://github.com/betagouv/service-national-universel/commit/75dedc957eae414bfad562dec78710490acdb65b))
- **app:** error when no correction ([02f76a8](https://github.com/betagouv/service-national-universel/commit/02f76a812e9542c26a87650ed92d90909044f17d))
- **app:** remove capture propagation ([48c8187](https://github.com/betagouv/service-national-universel/commit/48c8187279ffb35f44b944fd0c2b0237fbea5551))

### Features

- **app:** birth city zip suggestions ([#2038](https://github.com/betagouv/service-national-universel/issues/2038))"" ([270198e](https://github.com/betagouv/service-national-universel/commit/270198e3b6a04303ad39f242214d5ccabfd49d51))
- **app:** switch to camera scan for ID upload ([2f6cdb6](https://github.com/betagouv/service-national-universel/commit/2f6cdb63bcccd1dd7e224048d9db7b758ffb38ae))

### Reverts

- Revert "feat(app): birth city zip suggestions (#2038)" ([c89d3d8](https://github.com/betagouv/service-national-universel/commit/c89d3d83eb18ab0e0340d5f2c53814d522cf5841)), closes [#2038](https://github.com/betagouv/service-national-universel/issues/2038)

# [1.166.0](https://github.com/betagouv/service-national-universel/compare/v1.165.1...v1.166.0) (2022-11-14)

### Bug Fixes

- **admin:** fix grade ([#2042](https://github.com/betagouv/service-national-universel/issues/2042)) ([b3b3a91](https://github.com/betagouv/service-national-universel/commit/b3b3a91e7501b5a9eccb50a8bf42a929ec6ea2c2))
- **api:** No parent 2 fix ([d0b7ed0](https://github.com/betagouv/service-national-universel/commit/d0b7ed0d8db00e7153892415715fea3d7ef0ecc7))
- **app:** error handling in mobile upload step + opti render ([#2046](https://github.com/betagouv/service-national-universel/issues/2046)) ([5a0b7ce](https://github.com/betagouv/service-national-universel/commit/5a0b7ce130d60542391aad887b3235d7e1ce0fec))
- **app:** fix filter list in export modal ([66567fa](https://github.com/betagouv/service-national-universel/commit/66567fa41981ce2f30663b28da1c27565d3dbfdb))

### Features

- **admin/api:** table de repartition back ([#1984](https://github.com/betagouv/service-national-universel/issues/1984)) ([7dc71e4](https://github.com/betagouv/service-national-universel/commit/7dc71e472a5d7cb8d56c62416c5a7f77ead79455))
- **app:** birth city zip suggestions ([#2038](https://github.com/betagouv/service-national-universel/issues/2038)) ([69c5635](https://github.com/betagouv/service-national-universel/commit/69c5635b60145acb9d3d2facb764ac87f3e0179e))
- **app/api:** add contact preference + branch SMS inscriptions ([#2033](https://github.com/betagouv/service-national-universel/issues/2033)) ([e8bc88c](https://github.com/betagouv/service-national-universel/commit/e8bc88c78d0b41380a1952760054d2abad369c80))

## [1.165.1](https://github.com/betagouv/service-national-universel/compare/v1.165.0...v1.165.1) (2022-11-13)

### Bug Fixes

- **api:** remove dont stringify errors ([1add8a0](https://github.com/betagouv/service-national-universel/commit/1add8a054c427132a7c37c34d2a9e02a6424d212))

# [1.165.0](https://github.com/betagouv/service-national-universel/compare/v1.164.0...v1.165.0) (2022-11-11)

### Bug Fixes

- **admin:** Repair delete button ([#2030](https://github.com/betagouv/service-national-universel/issues/2030)) ([5b24dab](https://github.com/betagouv/service-national-universel/commit/5b24daba94f0f4642f73166e6bd21714b6ae9bc1))
- **api:** delete field phase 1 on change status (REINSCRIPTION) ([8aa975c](https://github.com/betagouv/service-national-universel/commit/8aa975c76bea9d102e47cd2c205d5b336fd466ab))

### Features

- **admin:** Changement DatePicker sur fiche du Jeune dans l'admin ([#2037](https://github.com/betagouv/service-national-universel/issues/2037)) ([82cdfc3](https://github.com/betagouv/service-national-universel/commit/82cdfc359ee53ea3ac05511fa9a6dac0eb89a072))
- **admin:** copy to clipboard for email phase 0 ([e10def4](https://github.com/betagouv/service-national-universel/commit/e10def446bdaa83389f52a9cbfad7d7b33dc8428))
- **admin/api:** Consentement désaccord du RL n°2 ([#2036](https://github.com/betagouv/service-national-universel/issues/2036)) ([12118cc](https://github.com/betagouv/service-national-universel/commit/12118ccae8ce78ca347659fd53df3670fdea22fe))
- **api:** Brancher la notification de relance consentement représentant légal de l’inscription ([#2039](https://github.com/betagouv/service-national-universel/issues/2039)) ([b490ae5](https://github.com/betagouv/service-national-universel/commit/b490ae5dfc405030d6c7f10a0d10b9c70751ca74))

# [1.164.0](https://github.com/betagouv/service-national-universel/compare/v1.163.0...v1.164.0) (2022-11-10)

### Bug Fixes

- **api:** Allow no phone if different from resp or supervisor ([aece7c7](https://github.com/betagouv/service-national-universel/commit/aece7c7245d523202201d0c1b6cfc05dd0390c3c))
- **app/admin:** toastr.success upload + dispatch young PM ([#1813](https://github.com/betagouv/service-national-universel/issues/1813)) ([2318f37](https://github.com/betagouv/service-national-universel/commit/2318f37cbe5f0e72c4918f32d8e0b02e8b839982))
- **kb:** broken link design ([f28c8fd](https://github.com/betagouv/service-national-universel/commit/f28c8fddf00fc15d9950a42124e875fba549ca52))

### Features

- **api:** Delete pending applications when validating phase 2 ([#2018](https://github.com/betagouv/service-national-universel/issues/2018)) ([049e382](https://github.com/betagouv/service-national-universel/commit/049e3825c56cec7462b3869c9ef6bf380693b894))

# [1.163.0](https://github.com/betagouv/service-national-universel/compare/v1.162.0...v1.163.0) (2022-11-09)

### Bug Fixes

- **admin:** phone required for new ref structure ([#2013](https://github.com/betagouv/service-national-universel/issues/2013)) ([3606b22](https://github.com/betagouv/service-national-universel/commit/3606b2278174fd872271c56e3d62db057cacd782))
- **admin:** young eligibility + situation ([bd980e8](https://github.com/betagouv/service-national-universel/commit/bd980e865c0dd216b6413d9158aa53221c7aa9fe))
- **api:** allow null for fromPage in forms ([3ed5e7c](https://github.com/betagouv/service-national-universel/commit/3ed5e7c01259741ab7c0ca51326c0296db8b974f))
- **api:** Force redirection to reinscription on set from admin ([c84058c](https://github.com/betagouv/service-national-universel/commit/c84058ce7af79bbdd535de99a9c5ae4efbd884d4))
- **api:** Validate ID format Joi ([491c9e3](https://github.com/betagouv/service-national-universel/commit/491c9e30b6f3464da7363ee155fbfd7cc9eba845))
- **app:** fix mobile upload v2 for new accounts ([6a935a8](https://github.com/betagouv/service-national-universel/commit/6a935a836227e1366ca8af6427e2b1df9764dc9b))
- **app:** fix upload error handling v2 ([f990b87](https://github.com/betagouv/service-national-universel/commit/f990b878608dd8ec92dbbc9f04840076951e4798))
- **app:** remove status change menus ([#2026](https://github.com/betagouv/service-national-universel/issues/2026)) ([2908d60](https://github.com/betagouv/service-national-universel/commit/2908d608a6b62a6d0216d40afa7aab5bb8ef55df))
- **app:** upload error handling ([8b6dc98](https://github.com/betagouv/service-national-universel/commit/8b6dc989df8f6ca003e8509e279e429ba1aa72dd))
- **lib:** Add terminale for grades ([e4164b0](https://github.com/betagouv/service-national-universel/commit/e4164b04cd570636903455eb3b63b4f1780cbddb))
- **lib:** fix department mapping ([cf21ef9](https://github.com/betagouv/service-national-universel/commit/cf21ef913d380612232ed418e5021ed916077f0e))

### Features

- **admin:** Affiner les résultats des propositions de missions ([dc98904](https://github.com/betagouv/service-national-universel/commit/dc98904aaa0f7c44dce61face3e3d1853ae9e97f))
- **app:** info message for file upload ([#2028](https://github.com/betagouv/service-national-universel/issues/2028)) ([79bda56](https://github.com/betagouv/service-national-universel/commit/79bda56587645096b257fcefb4ef68cae1cab580))

# [1.162.0](https://github.com/betagouv/service-national-universel/compare/v1.161.0...v1.162.0) (2022-11-07)

### Bug Fixes

- **app:** add expiration date in body of req for documents/next ([#2008](https://github.com/betagouv/service-national-universel/issues/2008)) ([40f54ed](https://github.com/betagouv/service-national-universel/commit/40f54ed87e110d01b0231ab6c5d1e8ffe705437c))
- **deps:** update dependency babel-loader to v8.3.0 ([#1039](https://github.com/betagouv/service-national-universel/issues/1039)) ([fbf2f60](https://github.com/betagouv/service-national-universel/commit/fbf2f60b745a1dc119ffbf288b6d5bab15b527a4))
- **deps:** update dependency react-redux to v7.2.9 ([#2014](https://github.com/betagouv/service-national-universel/issues/2014)) ([120e227](https://github.com/betagouv/service-national-universel/commit/120e227c575a8e12bca91ab2e9e8c7d213a7c518))
- **deps:** update dependency react-router-dom to v5.3.4 ([#2015](https://github.com/betagouv/service-national-universel/issues/2015)) ([7f69e71](https://github.com/betagouv/service-national-universel/commit/7f69e7121c383f664eabd8cf783af3394daa1a36))
- **deps/KB:** Update packages ([0265462](https://github.com/betagouv/service-national-universel/commit/0265462aa02b54bf4d0be6d375b8065f1e26e8f3))

### Features

- **admin:** add filter application file type ([#2017](https://github.com/betagouv/service-national-universel/issues/2017)) ([340b7d8](https://github.com/betagouv/service-national-universel/commit/340b7d8d03195d50cbd7a12d45dab18770178782))
- **admin:** Hide button new inscription ([a9f2786](https://github.com/betagouv/service-national-universel/commit/a9f27860d71c52bca736257e76b787bbf2544732))
- **admin:** Open instruction ([#2010](https://github.com/betagouv/service-national-universel/issues/2010)) ([ced5122](https://github.com/betagouv/service-national-universel/commit/ced512264c4ca48123636859038b7079b6997b42))
- **api:** model + synchro young applications files ([#2016](https://github.com/betagouv/service-national-universel/issues/2016)) ([7e1cf7e](https://github.com/betagouv/service-national-universel/commit/7e1cf7e6167d1c127dd39f680f9520dac3f6557b))

# [1.161.0](https://github.com/betagouv/service-national-universel/compare/v1.160.0...v1.161.0) (2022-11-04)

### Bug Fixes

- **admin:** missingLabel rural filter ([8db77b2](https://github.com/betagouv/service-national-universel/commit/8db77b2916cb3b8fa0fc934697b40f869deef4ef))
- **api:** Clamav deamon ([e9a6f26](https://github.com/betagouv/service-national-universel/commit/e9a6f266a2df73fc1380aee859dbb9fe3c4ac2e6))

### Features

- **admin:** cni_expired filter volontaire / inscription ([#1999](https://github.com/betagouv/service-national-universel/issues/1999)) ([a8f4287](https://github.com/betagouv/service-national-universel/commit/a8f4287dbd10a9e6ab59b36a0f33b6f0cdff4e9b))
- **admin:** filter rural inscription / volontaire ([6f539f9](https://github.com/betagouv/service-national-universel/commit/6f539f9e4f5adbf111e75038e67024263d124794))
- **admin:** upload ID for young ([#1996](https://github.com/betagouv/service-national-universel/issues/1996)) ([9992755](https://github.com/betagouv/service-national-universel/commit/9992755473f72c4d96a5940f0ee6f3cc89c8f3ce))
- **admin/app:** ErrorBoundary ([#1699](https://github.com/betagouv/service-national-universel/issues/1699)) ([5adf7ab](https://github.com/betagouv/service-national-universel/commit/5adf7ab4ff72ca3ffc671cc9ce480b712be96512))
- **api:** young field CNIFileNotValidOnStart ([#2000](https://github.com/betagouv/service-national-universel/issues/2000)) ([d4056c8](https://github.com/betagouv/service-national-universel/commit/d4056c806f209cdbcecb9aab4fac9ee450e47525))
- **api/admin:** Retours sur l'admin de modification ([#1997](https://github.com/betagouv/service-national-universel/issues/1997)) ([009a2b9](https://github.com/betagouv/service-national-universel/commit/009a2b9e381af64db5068fb9cf329e5ca053969a))
- **api/admin:** young imageRight concat parents ([#2002](https://github.com/betagouv/service-national-universel/issues/2002)) ([d603181](https://github.com/betagouv/service-national-universel/commit/d603181336af6fb62e47bab71861d4f5da26475c))
- **app/api:** Clean old inscription ([#1993](https://github.com/betagouv/service-national-universel/issues/1993)) ([9cd0728](https://github.com/betagouv/service-national-universel/commit/9cd0728fd9d5695b1086518702c64b0deb864da0))

# [1.160.0](https://github.com/betagouv/service-national-universel/compare/v1.159.0...v1.160.0) (2022-11-03)

### Bug Fixes

- **admin:** improve address search in DOM-TOM ([33615da](https://github.com/betagouv/service-national-universel/commit/33615dad1ff0fd880f47ae18e9a96ead95c65a1a))
- **api/app:** allow young to change expiration date without reuploading (before correction step) ([#1992](https://github.com/betagouv/service-national-universel/issues/1992)) ([c9ad894](https://github.com/betagouv/service-national-universel/commit/c9ad8940ff0ff0bdadd974572ecd66db5ff37106))
- **app:** fix condition in onSubmit stepUpload ([cf3d571](https://github.com/betagouv/service-national-universel/commit/cf3d57147cff22a56abdb4b45baaf028b942b76d))
- **app:** fix condition onSubmit stepUpload v2 ([e633459](https://github.com/betagouv/service-national-universel/commit/e6334595d5f650579a596450423ca14a1d04783f))

### Features

- **admin:** filtres volontaire / inscription ([#1991](https://github.com/betagouv/service-national-universel/issues/1991)) ([ef6c268](https://github.com/betagouv/service-national-universel/commit/ef6c2687791e5da9da776709de4d049ed40387cd))
- **admin:** update dashboard ([38a2e5a](https://github.com/betagouv/service-national-universel/commit/38a2e5af4bcd28ddafa379f7a76ec471b08a6a82))
- **admin/api:** Ajout de l'édition des Jeunes côté admin ([#1982](https://github.com/betagouv/service-national-universel/issues/1982)) ([29cee46](https://github.com/betagouv/service-national-universel/commit/29cee468b87843f106d6ef2a03a772c68372f674))
- **api:** better cron slack messages ([1079701](https://github.com/betagouv/service-national-universel/commit/1079701d4435ac06685b8102b6eee3739d616459))
- **api/app:** file scan down error message ([#1989](https://github.com/betagouv/service-national-universel/issues/1989)) ([499b87b](https://github.com/betagouv/service-national-universel/commit/499b87b43d4a169ed1793686ab947dfaeab9622b))
- **app:** changement de cohort admin ([#1983](https://github.com/betagouv/service-national-universel/issues/1983)) ([1b00b2c](https://github.com/betagouv/service-national-universel/commit/1b00b2c54edfd33b9f9de8cead284c1296cc6d3e))

# [1.159.0](https://github.com/betagouv/service-national-universel/compare/v1.158.1...v1.159.0) (2022-11-02)

### Bug Fixes

- **api:** fix ([b47863a](https://github.com/betagouv/service-national-universel/commit/b47863a5d11ebb670d9329fd91289cc07c372ca0))

### Features

- **api:** cron for patch logs ([#1980](https://github.com/betagouv/service-national-universel/issues/1980)) ([e8b8305](https://github.com/betagouv/service-national-universel/commit/e8b8305dab6ff729fb4fe3f68eadab8418c512c2))
- **api/app:** file scan error message ([1d649ef](https://github.com/betagouv/service-national-universel/commit/1d649ef9836e68351ac1927149f36e16b4e66314))

## [1.158.1](https://github.com/betagouv/service-national-universel/compare/v1.158.0...v1.158.1) (2022-11-01)

### Bug Fixes

- **app:** preinscription etrangers ([39f3029](https://github.com/betagouv/service-national-universel/commit/39f3029da4b0a4e16048d9d40c142cf459d47263))

# [1.158.0](https://github.com/betagouv/service-national-universel/compare/v1.157.1...v1.158.0) (2022-10-31)

### Bug Fixes

- **api:** Clamscan use binary ([5064596](https://github.com/betagouv/service-national-universel/commit/5064596269e9254e367911ae5f9cea828d3e48f2))
- **api:** Rework output in case of file infected ([83307aa](https://github.com/betagouv/service-national-universel/commit/83307aacfeefb44540438ec13de53190d7ee4a2e))

### Features

- **api/app:** demandes de corrections pages documents et televersement ([#1981](https://github.com/betagouv/service-national-universel/issues/1981)) ([294767b](https://github.com/betagouv/service-national-universel/commit/294767b14c3d7e797bc345854ba561035877801d))

## [1.157.1](https://github.com/betagouv/service-national-universel/compare/v1.157.0...v1.157.1) (2022-10-30)

### Bug Fixes

- **app:** contact form ([a62b33d](https://github.com/betagouv/service-national-universel/commit/a62b33d70515f01faffe7c7dcefbc83273128c7a))

# [1.157.0](https://github.com/betagouv/service-national-universel/compare/v1.156.0...v1.157.0) (2022-10-28)

### Features

- **app:** Correction stepEligibilite ([#1970](https://github.com/betagouv/service-national-universel/issues/1970)) ([8988834](https://github.com/betagouv/service-national-universel/commit/89888345f3b56592073bf9f0b6a512a97c56bfa3))
- **app:** open reinscription to phase 1 exempted ([73f312c](https://github.com/betagouv/service-national-universel/commit/73f312cb4476d433b733ecf63b0d540d632349d3))

# [1.156.0](https://github.com/betagouv/service-national-universel/compare/v1.155.0...v1.156.0) (2022-10-27)

### Bug Fixes

- **app:** inscription wording SD ([1d291e6](https://github.com/betagouv/service-national-universel/commit/1d291e6072ba7c404981a2b37d653af9299acb40))

### Features

- **app:** correction page coordonnee ([#1977](https://github.com/betagouv/service-national-universel/issues/1977)) ([d1ea29a](https://github.com/betagouv/service-national-universel/commit/d1ea29a57f109f6d08c8f952a305533123e187e2))
- **app:** instruction correction RL ([#1969](https://github.com/betagouv/service-national-universel/issues/1969)) ([834232c](https://github.com/betagouv/service-national-universel/commit/834232cfe61c75068f7b55671ab0487a184e5ba9))

# [1.155.0](https://github.com/betagouv/service-national-universel/compare/v1.154.0...v1.155.0) (2022-10-26)

### Bug Fixes

- **admin/api:** wording contrat ([844b42b](https://github.com/betagouv/service-national-universel/commit/844b42b869b0ac23a33d03729bf7829b9103114a))
- **app:** Fix old footer rerender on particular pages ([69c8847](https://github.com/betagouv/service-national-universel/commit/69c8847e8c6e9f281c6a3d3ec0837d974e277c5b))
- **app:** hide situation infos for RL1 ([#1971](https://github.com/betagouv/service-national-universel/issues/1971)) ([d621aa1](https://github.com/betagouv/service-national-universel/commit/d621aa1092687ce429cfe0ffe971e9f2a0061fbc))
- **app:** radio button style ([#1972](https://github.com/betagouv/service-national-universel/issues/1972)) ([65b8351](https://github.com/betagouv/service-national-universel/commit/65b8351a8f00ba85e5701941da91a1bdf77ad302))
- **app:** reinscription home ([94a8e1a](https://github.com/betagouv/service-national-universel/commit/94a8e1a637d9dc2d41f0b9d33f52121100827649))

### Features

- **app:** open réinscriptions ([#1974](https://github.com/betagouv/service-national-universel/issues/1974)) ([4915e93](https://github.com/betagouv/service-national-universel/commit/4915e934a5d958fc91868f64a8b4618522dfb196))

# [1.154.0](https://github.com/betagouv/service-national-universel/compare/v1.153.0...v1.154.0) (2022-10-25)

### Bug Fixes

- **api/app:** Correction cote jeune routes ([#1963](https://github.com/betagouv/service-national-universel/issues/1963)) ([30dd1ef](https://github.com/betagouv/service-national-universel/commit/30dd1ef5c0f46b4e7ed225230a3e9f3bc8fe4f77))
- **app:** correct young patch trigger time ([3c7722a](https://github.com/betagouv/service-national-universel/commit/3c7722a40d92debbebf6493b69f73108b429f30b))

### Features

- **app:** correction profil ([#1968](https://github.com/betagouv/service-national-universel/issues/1968)) ([b78b78c](https://github.com/betagouv/service-national-universel/commit/b78b78c5161abb4c7af653db6d87c3eb40623630))
- **app:** home page waiting correction ([#1966](https://github.com/betagouv/service-national-universel/issues/1966)) ([c393a1b](https://github.com/betagouv/service-national-universel/commit/c393a1b413706f31fa15ff735112faf6c39569b1))

# [1.153.0](https://github.com/betagouv/service-national-universel/compare/v1.152.0...v1.153.0) (2022-10-24)

### Bug Fixes

- **admin:** Close inscriptions for non admin ([e34dbaf](https://github.com/betagouv/service-national-universel/commit/e34dbaf1ab8a800e70976fc1561c2c7e4173f91c))
- **admin:** Fix correction cni ([c793c31](https://github.com/betagouv/service-national-universel/commit/c793c31676762952645c9bfebbba3c8b2a4fa575))
- **admin:** Redirect to home except admin ([5986980](https://github.com/betagouv/service-national-universel/commit/59869800b7c9a21da5588025966c3f388442c7c9))
- **api:** Reinscription token ([9ab68ed](https://github.com/betagouv/service-national-universel/commit/9ab68ed7b3010c984f09a4d82e7b8c687af5b3b1))
- **api:** token représentant généré une seul fois ([#1958](https://github.com/betagouv/service-national-universel/issues/1958)) ([01ee305](https://github.com/betagouv/service-national-universel/commit/01ee305d48a7a717e1c127a9e0a3d7061bf904a6))
- **api:** validation contrat ([#1953](https://github.com/betagouv/service-national-universel/issues/1953)) ([c7f269a](https://github.com/betagouv/service-national-universel/commit/c7f269ae4c8fbec4f5719047825cbb9ef4d97862))
- **api/app:** réinscription done ([#1956](https://github.com/betagouv/service-national-universel/issues/1956)) ([275c9a1](https://github.com/betagouv/service-national-universel/commit/275c9a112cccb85e79d05595048ba04d43a29444))
- **app:** accept CGU ([1a2b873](https://github.com/betagouv/service-national-universel/commit/1a2b873d59c5b63402baf08f3f192fdb56a0b0fa))
- **app:** Adjust reason ([f736738](https://github.com/betagouv/service-national-universel/commit/f7367381e713edf8a89d88717f5e7516be39da08))
- **app:** change sejour ([6931a9e](https://github.com/betagouv/service-national-universel/commit/6931a9eb84c4ce87fe77783ce495858e9d1bcd04))
- **app:** consentement ([35e50af](https://github.com/betagouv/service-national-universel/commit/35e50af7d63ade872ba4790e8da902423818f331))
- **app:** Do not verify if not manual school filled ([eabafc9](https://github.com/betagouv/service-national-universel/commit/eabafc9f2e454c2b0f684e5a97d5c43035ac1000))
- **app:** fix address saving and eligibility query reinscription & preinscription ([4c9d15f](https://github.com/betagouv/service-national-universel/commit/4c9d15f9f57cab5a060aac3c4b9f0e5f5918924d))
- **app:** Fix checkbox + reinscription ([4e72799](https://github.com/betagouv/service-national-universel/commit/4e72799136656bbedf86e0d2ec06d999d0bc6f84))
- **app:** Fix modal change sejour ([f47fcb2](https://github.com/betagouv/service-national-universel/commit/f47fcb2009a7716eeaa2290e724ba0823cf00148))
- **app:** Fix reinscription ([1a3b896](https://github.com/betagouv/service-national-universel/commit/1a3b896c3d3e7b2aa367cb7b62bbb1e48e5d2458))
- **app:** footer ([beb36d6](https://github.com/betagouv/service-national-universel/commit/beb36d6cc79dbb9b116b131f86ff8ef5cd411f93))
- **app:** Link page confirm ([d964dd7](https://github.com/betagouv/service-national-universel/commit/d964dd709b080f640b5253cbb0c5f2ac8471daf2))
- **app:** Manual filling address ([8ad6738](https://github.com/betagouv/service-national-universel/commit/8ad67385c84c71aad84fdf39e84140cb4ccb8d22))
- **app:** missing school data ([#1949](https://github.com/betagouv/service-national-universel/issues/1949)) ([eb9deb9](https://github.com/betagouv/service-national-universel/commit/eb9deb9c26763f230a84e229878311b17084508d))
- **app:** plus de landing page ([796ed94](https://github.com/betagouv/service-national-universel/commit/796ed9428b4521ea5d985da70e59910d21f0cc00))
- **app:** redirect inscription ([a4c1b70](https://github.com/betagouv/service-national-universel/commit/a4c1b70fb88f53730013ee1c17ab645196aa35b2))
- **app:** reinscription desktop ([68a7368](https://github.com/betagouv/service-national-universel/commit/68a736836f1562e2fcb599247e0d1b78257efccc))
- **app:** Verify adress ([024b358](https://github.com/betagouv/service-national-universel/commit/024b3588b69046f78bc005bc1942587e1515cae7))
- **gihub:** Self host github ([d783377](https://github.com/betagouv/service-national-universel/commit/d7833774bd2f3ac24fc9867002631f9ef5db7591))
- **github:** Change to ubuntu 20 runner ([16eb1d0](https://github.com/betagouv/service-national-universel/commit/16eb1d08e70d065759592b05266e585e2eca3f58))
- **github:** Change to ubuntu 22 runner ([687f8dc](https://github.com/betagouv/service-national-universel/commit/687f8dc8a57ca8bbf1705a0e6ce4301371f415aa))
- **github:** Run api github on github machines ([4608006](https://github.com/betagouv/service-national-universel/commit/4608006349c707e0105dd26545e8a79d868bc240))

### Features

- **api/analytics:** add young patch log cron ([#1945](https://github.com/betagouv/service-national-universel/issues/1945)) ([b494277](https://github.com/betagouv/service-national-universel/commit/b4942777ccb4ec4957d66b862731fd5cfd17e487))
- **api/app:** Update reinscription with new step ([#1955](https://github.com/betagouv/service-national-universel/issues/1955)) ([41814c9](https://github.com/betagouv/service-national-universel/commit/41814c934d6e70b58fd70a680c8a63a25ab4bab4))
- **app:** ouverture inscription 2023 ([#1942](https://github.com/betagouv/service-national-universel/issues/1942)) ([86bbd47](https://github.com/betagouv/service-national-universel/commit/86bbd47eb627600d3e093e707c41244a6cea31cb))
- **app:** phase 1 Waiting-affectation ([efcd881](https://github.com/betagouv/service-national-universel/commit/efcd8811f581020939a802704abbf2d3f81890b6))
- **app:** Rework reinscription ([#1938](https://github.com/betagouv/service-national-universel/issues/1938)) ([420f2c4](https://github.com/betagouv/service-national-universel/commit/420f2c45e986f662e99d55ad41774dd8a8c7dbb2))

### Reverts

- Revert "fix(github): Run on both self-hosted and ubuntu-latest" ([3467792](https://github.com/betagouv/service-national-universel/commit/3467792e1370f1783df2812c5575d1824c371b17))

# [1.152.0](https://github.com/betagouv/service-national-universel/compare/v1.151.0...v1.152.0) (2022-10-18)

### Bug Fixes

- **app:** Correct Eligibilite reinscription ([cf5d475](https://github.com/betagouv/service-national-universel/commit/cf5d47568ebfdeba7d4c87e696cddad6f9cfc2e0))
- **app:** Fix birthDateAt ([34c637b](https://github.com/betagouv/service-national-universel/commit/34c637be5e81f2b4805b7c68984ce843074783b4))
- **app:** Fix link reinscription ([ff61405](https://github.com/betagouv/service-national-universel/commit/ff61405988d6fc01ac7c01d40265e89a690074a3))
- **app:** fix wording ([#1934](https://github.com/betagouv/service-national-universel/issues/1934)) ([cfa57ee](https://github.com/betagouv/service-national-universel/commit/cfa57eeb6aee6fbc355192e2fe081307b8935f73))
- **app:** Fixup reinscription ([54601ef](https://github.com/betagouv/service-national-universel/commit/54601efc814dd63a5eb112326fff8e140921562a))
- **app:** footer upload mobile ([26fe638](https://github.com/betagouv/service-national-universel/commit/26fe638aa53e794c93a384fbc2254769aefdb7b4))
- **app:** phase1 not done reinscription ([059cdb7](https://github.com/betagouv/service-national-universel/commit/059cdb7c936515e567ded278b618ae9debb53ad2))
- **app:** reglement interieur ([da05036](https://github.com/betagouv/service-national-universel/commit/da050368d7bddaad5916e8849c76f27295dd6cc9))

### Features

- **app:** Reinscription desktop + track begin reinscription ([#1932](https://github.com/betagouv/service-national-universel/issues/1932)) ([1eaf86d](https://github.com/betagouv/service-national-universel/commit/1eaf86d1f37faf69ff1da5e2ee18da0769b05c40))
- **app:** Reinscription desktop + track begin reinscription ([#1932](https://github.com/betagouv/service-national-universel/issues/1932)) ([ceb5fad](https://github.com/betagouv/service-national-universel/commit/ceb5fad18d077c8336aa173154771bbdddc383de))

# [1.151.0](https://github.com/betagouv/service-national-universel/compare/v1.150.0...v1.151.0) (2022-10-17)

### Bug Fixes

- **app:** date picker ([adb0585](https://github.com/betagouv/service-national-universel/commit/adb0585d40fbc05e2a133a8b84b95e2abb9a618a))
- **app:** modal sejour eligibility ([8d9adcb](https://github.com/betagouv/service-national-universel/commit/8d9adcb04d96426c692eb3f69663b50ce09babcd))
- **app:** open step done to modification ([faad37b](https://github.com/betagouv/service-national-universel/commit/faad37bda54cbb4499bd41d37831cf638024aa0a))
- **app:** Reinscription conditions ([ba4b3f6](https://github.com/betagouv/service-national-universel/commit/ba4b3f6156c5d2f46d7674654dff6c60a21b7958))
- franceconnect callback ([026306c](https://github.com/betagouv/service-national-universel/commit/026306c9c77b9c1cee9b39e84d5b29ec710063dd))
- **app:** saving cohort on mobile ([494b487](https://github.com/betagouv/service-national-universel/commit/494b4878cc0bd058c1fe4727ce46c7e8ae4d801c))

### Features

- **admin:** open new cohort for dashboard ([#1905](https://github.com/betagouv/service-national-universel/issues/1905)) ([af7f611](https://github.com/betagouv/service-national-universel/commit/af7f611fbe37bc79f47cbf52f2a71804c5d17658))
- **app:** reinscription ([#1903](https://github.com/betagouv/service-national-universel/issues/1903)) ([f7c86a9](https://github.com/betagouv/service-national-universel/commit/f7c86a93ebdb23af8533c0b6c51e645c3bda3523))
- **app:** waiting validation modify inscription ([57b0327](https://github.com/betagouv/service-national-universel/commit/57b0327c338d1897244879febb1fbd44ec5604a8))

# [1.150.0](https://github.com/betagouv/service-national-universel/compare/v1.149.0...v1.150.0) (2022-10-16)

### Bug Fixes

- **admin:** new status color ([002aa7a](https://github.com/betagouv/service-national-universel/commit/002aa7ac1b9947020fe85805a3e8df2c01bc8140))
- **app:** home closed mobile button ([80551fd](https://github.com/betagouv/service-national-universel/commit/80551fdc3efc4c706f099df3666976e649e0afb0))
- **app:** relance mail ([6bb99df](https://github.com/betagouv/service-national-universel/commit/6bb99df8c8d08a19858e124c0df5a52a861d6f47))

### Features

- **app:** link EVERYWHERE ([6abe02d](https://github.com/betagouv/service-national-universel/commit/6abe02dcc4d02eea24343562ee020c5a1b360f90))

# [1.149.0](https://github.com/betagouv/service-national-universel/compare/v1.148.0...v1.149.0) (2022-10-14)

### Bug Fixes

- **app:** step done desktop ([552d548](https://github.com/betagouv/service-national-universel/commit/552d548c2470321c7d301eaba9ef66edf53b7b3e))
- **app:** two-line fields alignment ([24eeb98](https://github.com/betagouv/service-national-universel/commit/24eeb984be6d5eef56f0236b2b44585dd144c29f))

### Features

- **admin:** Referent self delete ([#1918](https://github.com/betagouv/service-national-universel/issues/1918)) ([8728be6](https://github.com/betagouv/service-national-universel/commit/8728be627d23e081dd3664ef18cafacb807202f8))
- **api/app:** give motive for non eligibility ([#1912](https://github.com/betagouv/service-national-universel/issues/1912)) ([a6eb5ff](https://github.com/betagouv/service-national-universel/commit/a6eb5ff50e37124a2f1a9171d28a72fc5635ab89))
- **app:** cni invalide mobile ([324abf0](https://github.com/betagouv/service-national-universel/commit/324abf038c9f09a3e68cbccb4d0338c2f77c4d19))
- **app:** mobile consentement ([573a771](https://github.com/betagouv/service-national-universel/commit/573a771e5ce86056aa720d85b9cafe1b958ad0be))
- **app:** mobile rp verification + translate new status ([9481c62](https://github.com/betagouv/service-national-universel/commit/9481c62bb1f4ee4b6630c79a556abab187dcf477))
- **app:** persist data and control navigation for preinscription ([#1913](https://github.com/betagouv/service-national-universel/issues/1913)) ([c1ca4fb](https://github.com/betagouv/service-national-universel/commit/c1ca4fbc9f7ed2089b732b7d4ccc291f37fbad6a))
- **app:** rp done mobile ([9e40981](https://github.com/betagouv/service-national-universel/commit/9e40981d9356ff034f2572255dcf4343f9ab2673))
- **app:** verification version mobile ([162294c](https://github.com/betagouv/service-national-universel/commit/162294c3669f126c5502347a189310c02ef6f4d2))

# [1.148.0](https://github.com/betagouv/service-national-universel/compare/v1.147.0...v1.148.0) (2022-10-13)

### Bug Fixes

- **admin:** correct file url in inscription panel ([18385ef](https://github.com/betagouv/service-national-universel/commit/18385efe6485c2b340eb56405cd502777abc65ba))
- **admin:** structure & tutor data for mission export ([#1909](https://github.com/betagouv/service-national-universel/issues/1909)) ([0d51a80](https://github.com/betagouv/service-national-universel/commit/0d51a80f7af403cc3375e69d1081c03f9a5cd37b))
- **api:** eligibility not scolarise ([8a3b43e](https://github.com/betagouv/service-national-universel/commit/8a3b43e80efe2f3cd3dc08e9f7ad5adcfc51b90c))
- **api/lib:** sessions dates 7 inscription goals ([98d33a5](https://github.com/betagouv/service-national-universel/commit/98d33a507e384e57ddf285740885c2cc25ab1be7))
- **app:** modal change sejour ([#1907](https://github.com/betagouv/service-national-universel/issues/1907)) ([84b1c10](https://github.com/betagouv/service-national-universel/commit/84b1c10e70ceaa9bdd31e500cd1aa39cfedf0b27))
- **app:** add condition for continue button in step upload ([160f8dc](https://github.com/betagouv/service-national-universel/commit/160f8dc91174f195e1934c6ea0c1f92fb71655f0))
- **app:** contact repr step done mobile ([6361851](https://github.com/betagouv/service-national-universel/commit/6361851eca4d4de9ac40ce32840adc73b8fa6217))
- **app:** representant legal ([73736f1](https://github.com/betagouv/service-national-universel/commit/73736f1f1b346eeb538271a13751ffa3f02ac667))
- **app:** step upload ([69bd260](https://github.com/betagouv/service-national-universel/commit/69bd260f31eb68e44e9b7792b773ddc996c9ce69))

### Features

- **admin:** open inscription goal for new cohort ([3828f2e](https://github.com/betagouv/service-national-universel/commit/3828f2ef3c5b6b4cf3143e277ae69b5e5cecaef1))
- **app:** Ajout de l'envoi d'un mail lors de la mise en liste d'attente ([e19dfc9](https://github.com/betagouv/service-national-universel/commit/e19dfc965cae23fc2606ee7574492ccaa833944c))
- **app:** document desktop pages ([#1904](https://github.com/betagouv/service-national-universel/issues/1904)) ([a997d6a](https://github.com/betagouv/service-national-universel/commit/a997d6aa9472b0c633a48a7976f46b5a9af70d59))
- **app:** redirect to current step during inscription ([#1908](https://github.com/betagouv/service-national-universel/issues/1908)) ([74250cc](https://github.com/betagouv/service-national-universel/commit/74250cc0bfd25da81796f2d4f93de42d1f77ed4a))
- **app:** step eligibility desktop ([b0336e7](https://github.com/betagouv/service-national-universel/commit/b0336e76f9fdd970974b24ee52096cfef4243124))
- **app,admin:** track help center actions ([#1906](https://github.com/betagouv/service-national-universel/issues/1906)) ([92f075e](https://github.com/betagouv/service-national-universel/commit/92f075e594242948bfe1c852b894fd261bb8cd7a))

# [1.147.0](https://github.com/betagouv/service-national-universel/compare/v1.146.0...v1.147.0) (2022-10-12)

### Bug Fixes

- **api:** fix signup grade validation ([dd9c025](https://github.com/betagouv/service-national-universel/commit/dd9c02503fb573f04d12aa8192af2c81249edaec))
- **app:** continue doc ([2e22426](https://github.com/betagouv/service-national-universel/commit/2e22426a81ba160f27e3c9d38a05f9d200b0949e))
- **app:** extra condition for document pages ([#1900](https://github.com/betagouv/service-national-universel/issues/1900)) ([22fa605](https://github.com/betagouv/service-national-universel/commit/22fa605241264c2e4216675d3fb65ef78ed7523b))
- **app:** next btn active if file already uploaded ([f0b36f1](https://github.com/betagouv/service-national-universel/commit/f0b36f112d4aa88033aa15135fd70f823262b80f))
- **app:** Phone validation for all inscription pages ([4361240](https://github.com/betagouv/service-national-universel/commit/43612400ee5cc138de39f88447074ef174e63d83))
- **app:** Regex mobile ([7fb4333](https://github.com/betagouv/service-national-universel/commit/7fb433319629f3f9c787bf496e631af9b1a882a5))

### Features

- **app:** desktop coordinates page ([#1899](https://github.com/betagouv/service-national-universel/issues/1899)) ([fcce6e8](https://github.com/betagouv/service-national-universel/commit/fcce6e8ad79926fdaa846e6de6b8919516cddce4))
- **app:** step done inscription ([5703b75](https://github.com/betagouv/service-national-universel/commit/5703b751b7c032dcf3dfb8292311ed9701026c8b))
- **app:** step navigation based on user access ([#1897](https://github.com/betagouv/service-national-universel/issues/1897)) ([80849d5](https://github.com/betagouv/service-national-universel/commit/80849d5f9da9ccb8995ea833c0b9a782f9ab163e))
- **app:** user feedBack staging ([6a2ad48](https://github.com/betagouv/service-national-universel/commit/6a2ad488ccd4ef41d47d4cee5b29a0f4df47ade5))

# [1.146.0](https://github.com/betagouv/service-national-universel/compare/v1.145.0...v1.146.0) (2022-10-11)

### Bug Fixes

- **admin:** fix missing data for application export ([734bcfc](https://github.com/betagouv/service-national-universel/commit/734bcfc0eede39937226e980222db6a209a4e823))
- **api/app:** remove hostAddress fields ([#1892](https://github.com/betagouv/service-national-universel/issues/1892)) ([5eba189](https://github.com/betagouv/service-national-universel/commit/5eba1894b7675bce2b6926064d3bcf02b64876bf))
- **app:** Empty school ([3083741](https://github.com/betagouv/service-national-universel/commit/308374169bfbe04362b09fde046698c11f34e82b))
- **app:** Gestion d'erreur ([97e00a3](https://github.com/betagouv/service-national-universel/commit/97e00a337b93aebbc8d950517b9cf2f1d21acc03))
- **app:** Inscription ([b4e15e7](https://github.com/betagouv/service-national-universel/commit/b4e15e78ff67a6985101ea24bb3e041f2537b149))
- **app:** legal representant ([714c358](https://github.com/betagouv/service-national-universel/commit/714c3584172cb9ce33d07b6c7b10a326a4b77854))
- **app:** Preinscription ([e4d0339](https://github.com/betagouv/service-national-universel/commit/e4d0339775223537e7fa36f68c549da59102a2a8))
- **app:** Retour Bertille ([b5de153](https://github.com/betagouv/service-national-universel/commit/b5de153f6f07cc4f5f72279e22be6e6fe5b97948))

### Features

- **api:** update young model ([5f3e78e](https://github.com/betagouv/service-national-universel/commit/5f3e78eaaaf75c0005a54d0ca38ff04a5f3610e9))
- **api/app:** special situations ([#1896](https://github.com/betagouv/service-national-universel/issues/1896)) ([dcf27ef](https://github.com/betagouv/service-national-universel/commit/dcf27ef9064e13b33f39a302ee9a9144520036fa))
- **app:** inscription step done + notif + token resp ([7933eef](https://github.com/betagouv/service-national-universel/commit/7933eef7c168422869a0d9c9d8cd2c620b6e71fc))
- **app:** mini crud cnifiles ([8fc0ad8](https://github.com/betagouv/service-national-universel/commit/8fc0ad85e20a9d498992fdbb52993016e6e608cf))
- **app:** upload documents step for inscription 2023 ([#1867](https://github.com/betagouv/service-national-universel/issues/1867)) ([f2c0a64](https://github.com/betagouv/service-national-universel/commit/f2c0a64bc5f10129b5f94d12df0b657295b8fbaa))

# [1.145.0](https://github.com/betagouv/service-national-universel/compare/v1.144.0...v1.145.0) (2022-10-10)

### Bug Fixes

- **app:** notif step confirm -> step done ([6a4da61](https://github.com/betagouv/service-national-universel/commit/6a4da618e95b12c20da2354a3d869d4be5700dca))

### Features

- **app:** home preinscription ([1f6d8c0](https://github.com/betagouv/service-national-universel/commit/1f6d8c05e2bdec4fabea1de5816bad5f50f26eb5))
- **app:** stepNoneligible ([#1885](https://github.com/betagouv/service-national-universel/issues/1885)) ([9e3b01e](https://github.com/betagouv/service-national-universel/commit/9e3b01efba6f171b4cc5d107428fe2c0d3168bd7))
- **app:** update home page ([d393694](https://github.com/betagouv/service-national-universel/commit/d3936949ac6f5cff909f6c65b0f507c1393d3473))
- **app/api:** confirm screen inscription + canUpdateYoungStatus on route inscription ([41c43dc](https://github.com/betagouv/service-national-universel/commit/41c43dc8a253b4c3cc4d670057f49b6456ea49b9))
- **app/api:** inscription 2023 coordinates validation and api call ([#1880](https://github.com/betagouv/service-national-universel/issues/1880)) ([2946ae3](https://github.com/betagouv/service-national-universel/commit/2946ae397db8ede39292a1cafe613f4de09a49f4))

# [1.144.0](https://github.com/betagouv/service-national-universel/compare/v1.143.0...v1.144.0) (2022-10-07)

### Bug Fixes

- **admin:** temporarily revert volontaires export modal for responsibles ([#1881](https://github.com/betagouv/service-national-universel/issues/1881)) ([4a80e9a](https://github.com/betagouv/service-national-universel/commit/4a80e9adb7f3b9d8931d40b4fc199dace5a213f8))
- up ([eafbd63](https://github.com/betagouv/service-national-universel/commit/eafbd636ace11c81abc0c0d1ed85c6b59a777958))
- **api/app:** session pour Corse ([00d4f20](https://github.com/betagouv/service-national-universel/commit/00d4f20bb6c3fc1a47e081b7596f44de13ab7327))
- **app:** Better list of schools ([28ca156](https://github.com/betagouv/service-national-universel/commit/28ca1564867c24ac5815b09d75dab593b2921d7e))
- **app:** eligibilite ([bc8a54f](https://github.com/betagouv/service-national-universel/commit/bc8a54f589e5452cb212aea0d01d3cba6c61a8a1))
- **app:** Eligibility postalCode ([ddb4631](https://github.com/betagouv/service-national-universel/commit/ddb46312da75b7ad1a9b13d5a6f3510904704aed))
- **app:** navBar ([d89bfdc](https://github.com/betagouv/service-national-universel/commit/d89bfdc2e7073b49b6ddd5c0ecf6b883add6945f))

### Features

- **app:** inscription consentement / représentant desktop ([#1882](https://github.com/betagouv/service-national-universel/issues/1882)) ([5c1524b](https://github.com/betagouv/service-national-universel/commit/5c1524b02e557b9e78ae373ecf1fbdea25b13805))
- **app:** inscriptions representants legaux ([#1878](https://github.com/betagouv/service-national-universel/issues/1878)) ([87b23bf](https://github.com/betagouv/service-national-universel/commit/87b23bf9bfc58602b2379801cb52b70def816c1d))
- **app:** modal change sejour ([2fa85be](https://github.com/betagouv/service-national-universel/commit/2fa85be30201a0dcbb268d573323ea46b348a7a3))
- **app:** Preinscription desktop ([#1879](https://github.com/betagouv/service-national-universel/issues/1879)) ([d0e2b03](https://github.com/betagouv/service-national-universel/commit/d0e2b03b74c4cf499192f7bcb9b4f37f7c8ab07f))
- **app,admin:** public kb articles ([#1876](https://github.com/betagouv/service-national-universel/issues/1876)) ([5174d32](https://github.com/betagouv/service-national-universel/commit/5174d32b5f74be9863992090865fa895f3eb1061))

# [1.143.0](https://github.com/betagouv/service-national-universel/compare/v1.142.0...v1.143.0) (2022-10-06)

### Bug Fixes

- **admin:** visu COHORT ([74eb1e5](https://github.com/betagouv/service-national-universel/commit/74eb1e535fb118724f0a55cea2e4e7e194993b19))
- **api/app:** Eligibility up ([3130cfb](https://github.com/betagouv/service-national-universel/commit/3130cfbdbab71f1d580bc39649557138acf392c4))
- **app:** apostrophes & mes. d'erreur stepSejour ([e69f87e](https://github.com/betagouv/service-national-universel/commit/e69f87e3db2c3ffeb0677a563c6a78eb7d6a60ca))
- **app:** Eligibility ([29c69d1](https://github.com/betagouv/service-national-universel/commit/29c69d18cc4a158ec59eec03ea934424546661fa))
- **app:** fix error message stepSejour ([5e993a8](https://github.com/betagouv/service-national-universel/commit/5e993a86a907d005cfe7ba0d06e840d53ca6a7ef))
- **app:** new process inscription ([0c094fb](https://github.com/betagouv/service-national-universel/commit/0c094fbd85bdba657923a6e0d834733a306b6f2a))
- **app:** UPUPUP ([775f1e7](https://github.com/betagouv/service-national-universel/commit/775f1e78f6669ce53feb78e577f7a9b435959a72))
- up ([803e2a7](https://github.com/betagouv/service-national-universel/commit/803e2a7c8201ea28298928d658795a668e358935))
- **app:** Up zip code ([fcac22a](https://github.com/betagouv/service-national-universel/commit/fcac22a33992041e22c958b36d382d9fcb947f39))
- **app/api:** add cohort on signup 2023 ([1dbacef](https://github.com/betagouv/service-national-universel/commit/1dbacef41c2ab1ccc8189266249611ed24ec4ce3))

### Features

- **api:** inscription 2023 coordinates ([#1869](https://github.com/betagouv/service-national-universel/issues/1869)) ([1bbb724](https://github.com/betagouv/service-national-universel/commit/1bbb724e6061a185d8b59c8c582382371d1197ce))
- **app:** add coordinates form for inscription 2023 ([#1852](https://github.com/betagouv/service-national-universel/issues/1852)) ([8791c88](https://github.com/betagouv/service-national-universel/commit/8791c88e4577559307a82c1334b4d9a187790167))
- **app:** back representant ([1e7ff41](https://github.com/betagouv/service-national-universel/commit/1e7ff4172dca89c89cedff6abc2d5d7a9d3fdcfe))
- **app:** consentement back ([057ee9c](https://github.com/betagouv/service-national-universel/commit/057ee9c4dc88989f3e74f8c492fed9e603042422))
- **app:** front consentement ([224fd2d](https://github.com/betagouv/service-national-universel/commit/224fd2d1d2f9d2823b248ab63ae9a38b05c63494))
- **app:** front representant ([6c1f3ff](https://github.com/betagouv/service-national-universel/commit/6c1f3ff26a7df5b91cb8ff23747d2637f91ccdb1))
- **app:** header/footer inscription2023 ([a752632](https://github.com/betagouv/service-national-universel/commit/a7526329c4b93c79ac8e2fc6134932c1ab07a4aa))
- **app:** searchable seleect component ([#1868](https://github.com/betagouv/service-national-universel/issues/1868)) ([977856a](https://github.com/betagouv/service-national-universel/commit/977856a8f8ee7c0e705d1a0c7113e4e49301740c))
- **app:** searchBar help center ([#1865](https://github.com/betagouv/service-national-universel/issues/1865)) ([c1c6077](https://github.com/betagouv/service-national-universel/commit/c1c607766907e9f65b3656c279bc102e1de429f5))
- **app,api:** add school out of france component ([#1870](https://github.com/betagouv/service-national-universel/issues/1870)) ([a023448](https://github.com/betagouv/service-national-universel/commit/a0234483c8be78f70cc4365f2fc4fa9588143209))
- verify address ([#1863](https://github.com/betagouv/service-national-universel/issues/1863)) ([8cd9323](https://github.com/betagouv/service-national-universel/commit/8cd9323029e26eceb6a4a7ec87670fe196c27976))

# [1.142.0](https://github.com/betagouv/service-national-universel/compare/v1.141.0...v1.142.0) (2022-10-05)

### Bug Fixes

- **api:** non scolarisé et 1e CAP eligibles ([c751063](https://github.com/betagouv/service-national-universel/commit/c75106349b96a79637769e2c1cf16490b9ff9193))
- **app:** Better eligibility ([136e21e](https://github.com/betagouv/service-national-universel/commit/136e21eb005aaf5f6d517e4bf45d5ee363184c48))
- **app:** Disable previous on eligibilite ([8fde55a](https://github.com/betagouv/service-national-universel/commit/8fde55a55ef021d203cbbb4cabdcf83f237ff024))
- **app:** eligibilite up ([7057445](https://github.com/betagouv/service-national-universel/commit/705744587d241dcdc9637be363958b1d75c30954))
- **app:** fix eligibility api call ([30a8862](https://github.com/betagouv/service-national-universel/commit/30a886242ce0757aa6f2701938dd35f2b98cd3c3))
- **app:** fix footer preinscription ([#1857](https://github.com/betagouv/service-national-universel/issues/1857)) ([8692ceb](https://github.com/betagouv/service-national-universel/commit/8692ceb95e9d736d33a19ed18a96eb0f0e4db57d))
- **app:** fix modal preinscription and header ([#1858](https://github.com/betagouv/service-national-universel/issues/1858)) ([4a7eb56](https://github.com/betagouv/service-national-universel/commit/4a7eb560242b459417ff2dd184eb05f0212c2632))
- **app:** header young ([86b3f29](https://github.com/betagouv/service-national-universel/commit/86b3f299e8337173a8d37b4a5cb7773dc4887697))
- **app:** import error comp ([cec7ed7](https://github.com/betagouv/service-national-universel/commit/cec7ed7ba3ab2d4e62404fd29a76d5083b2f25be))
- **app:** Update eligibiility ([6c14669](https://github.com/betagouv/service-national-universel/commit/6c14669fd39e6219fb7a5ba0e06910d0e54ff120))
- **app/api:** ajout verif nationalité ([4a91057](https://github.com/betagouv/service-national-universel/commit/4a91057ed70fc68eabff46c9d899b25dbd553cef))

### Features

- **admin:** Open modal address in preference if nearRelative not set ([f7e5daa](https://github.com/betagouv/service-national-universel/commit/f7e5daab490c280d847af38204c9a7c65edecde0))
- **app:** add signup logic for preinscriptions ([#1859](https://github.com/betagouv/service-national-universel/issues/1859)) ([d97b219](https://github.com/betagouv/service-national-universel/commit/d97b219de135071a665674558caaae920b14ab95))
- **app:** connect preinscription steps 1 and 2 ([78e25b6](https://github.com/betagouv/service-national-universel/commit/78e25b6876f4ed73386c9ed59c13dee7369848b5))
- **app:** forgot password ([694d033](https://github.com/betagouv/service-national-universel/commit/694d0337ceb63f0df562a3b52dc4a12b54173a3e))
- **app:** login page ([6fdd58d](https://github.com/betagouv/service-national-universel/commit/6fdd58db5d6dc9a44927cdabbe697a9f7bc7b767))
- **app:** new archi auth ([8877690](https://github.com/betagouv/service-national-universel/commit/8877690eb1681c94840bbd936f670b85da22883c))
- **app:** reset mdp ([6d36f0c](https://github.com/betagouv/service-national-universel/commit/6d36f0c90ca259b858cc5b30fbbbab9f2da94696))

# [1.141.0](https://github.com/betagouv/service-national-universel/compare/v1.140.0...v1.141.0) (2022-10-04)

### Bug Fixes

- **app:** link program to snu ([#1854](https://github.com/betagouv/service-national-universel/issues/1854)) ([5ee7963](https://github.com/betagouv/service-national-universel/commit/5ee79634442ee4d535077070a58ca85964c2f326))

### Features

- **app:** goBack preinscription ([686a834](https://github.com/betagouv/service-national-universel/commit/686a834504c0634c6706e3c7a235215fd940e83c))
- **app:** preinscription step confirm / done ([1253a69](https://github.com/betagouv/service-national-universel/commit/1253a69561d9fe88c6e376b32dbf87124ad352a3))
- **app:** responsive footer preinscription ([#1853](https://github.com/betagouv/service-national-universel/issues/1853)) ([07c31e8](https://github.com/betagouv/service-national-universel/commit/07c31e87d3252932f9612ac0f82760ea213ee367))
- **inscription:** Scolarity first shot ([98ff2d6](https://github.com/betagouv/service-national-universel/commit/98ff2d63d1d042a6138eea07c99a4d1f2bb45d5c))

# [1.140.0](https://github.com/betagouv/service-national-universel/compare/v1.139.0...v1.140.0) (2022-10-03)

### Bug Fixes

- **app:** update stickyButton ([c0ec204](https://github.com/betagouv/service-national-universel/commit/c0ec204d435aafbbf5abf9c7f275c5202ce02d06))

### Features

- **app:** checkbox component + default value context ([1089e8a](https://github.com/betagouv/service-national-universel/commit/1089e8afdb9beb5c647e95ccb84c5daaa8de4aa5))
- **app:** help icon for inscription ([ee724e6](https://github.com/betagouv/service-national-universel/commit/ee724e634bc34d078e2210dc7af6dff160937153))
- **app:** preinscription profile ([3089352](https://github.com/betagouv/service-national-universel/commit/3089352b6dd590ac192d8f11826d36a35b1f521c))
- **app:** sticky button for mobile ([5044361](https://github.com/betagouv/service-national-universel/commit/5044361b1b41eea94da91df13ef911ad51dbc76e))
- **app/api:** architecture inscription ([#1847](https://github.com/betagouv/service-national-universel/issues/1847)) ([9efe63f](https://github.com/betagouv/service-national-universel/commit/9efe63fd97001370a374e24b9a660552a8fc73f2))

# [1.139.0](https://github.com/betagouv/service-national-universel/compare/v1.138.0...v1.139.0) (2022-09-30)

### Bug Fixes

- **admin:** Gestion erreurs preferences missions ([#1839](https://github.com/betagouv/service-national-universel/issues/1839)) ([bac2be5](https://github.com/betagouv/service-national-universel/commit/bac2be50eb1eedeaad1f67722661c237ac959335))
- **api:** fix pb affichage modal d'export avec recherche textuelle ([#1843](https://github.com/betagouv/service-national-universel/issues/1843)) ([ba307f3](https://github.com/betagouv/service-national-universel/commit/ba307f3dd305b79b447e4fc1ea62b89c71c502f7))
- **api/admin/app:** MIG - Ajout équivalence MIG ([#1842](https://github.com/betagouv/service-national-universel/issues/1842)) ([464f0e7](https://github.com/betagouv/service-national-universel/commit/464f0e7a25e3c1dfe8085459a2b71c548a47332a))

### Features

- **api:** Add model shoolRAMSES ([#1844](https://github.com/betagouv/service-national-universel/issues/1844)) ([218fb17](https://github.com/betagouv/service-national-universel/commit/218fb17b3cc493d7f09c08d723cc4a4c43e2cf68))
- **api:** Delete pendingCandidature ([#1846](https://github.com/betagouv/service-national-universel/issues/1846)) ([d21912d](https://github.com/betagouv/service-national-universel/commit/d21912d313c58dd977f98a6475713b4a84231a2c))

# [1.138.0](https://github.com/betagouv/service-national-universel/compare/v1.137.0...v1.138.0) (2022-09-29)

### Bug Fixes

- **api:** soft-delete young for ref dep ([#1841](https://github.com/betagouv/service-national-universel/issues/1841)) ([c251cc7](https://github.com/betagouv/service-national-universel/commit/c251cc70c7938a544fcae38a76bb10e2b1ebf7b5))

### Features

- **admin:** Export candidatures depuis fiche mission ([#1840](https://github.com/betagouv/service-national-universel/issues/1840)) ([4141bfb](https://github.com/betagouv/service-national-universel/commit/4141bfbdc9b1b309502dd992e9ab3bed1e7249f5))

# [1.137.0](https://github.com/betagouv/service-national-universel/compare/v1.136.0...v1.137.0) (2022-09-28)

### Bug Fixes

- **api:** Military Notifications when dossier PM validated ([bb24805](https://github.com/betagouv/service-national-universel/commit/bb24805d76b5477e041d0273b9bb7dfedcaaec2e))
- **api:** PM notif ([bbccfb1](https://github.com/betagouv/service-national-universel/commit/bbccfb18465fa644913646d0499e9acec1f2e4cd))

### Features

- **admin:** Fiche volontaire : phase 2 - MIG préférences de mission ([#1830](https://github.com/betagouv/service-national-universel/issues/1830)) ([b0e63fe](https://github.com/betagouv/service-national-universel/commit/b0e63fe3e48ba8b91148c827ebda10db1a6aa446))
- **api:** Send email to ref phase 2 priority ([#1832](https://github.com/betagouv/service-national-universel/issues/1832)) ([3c613b6](https://github.com/betagouv/service-national-universel/commit/3c613b648fecc32733f1a78e9dcf756129d59513))

# [1.136.0](https://github.com/betagouv/service-national-universel/compare/v1.135.0...v1.136.0) (2022-09-27)

### Bug Fixes

- **admin:** Add missing filter translations ([#1828](https://github.com/betagouv/service-national-universel/issues/1828)) ([3008b4b](https://github.com/betagouv/service-national-universel/commit/3008b4bb12137f684e46483e768e94aba3132517))
- **admin:** placesLeft = placesTotal for mission draft ([8fba9cf](https://github.com/betagouv/service-national-universel/commit/8fba9cf4f6eff5670be85643ef6a011aed066e03))
- **admin:** Sémantique ([2fe86c7](https://github.com/betagouv/service-national-universel/commit/2fe86c77f3c189a03468367c08505c7c0701c342))

### Features

- **admin:** structure export modal for admins ([f7255d6](https://github.com/betagouv/service-national-universel/commit/f7255d6c7920a3a848bf3600c5b12b8ff0470569))

# [1.135.0](https://github.com/betagouv/service-national-universel/compare/v1.134.0...v1.135.0) (2022-09-26)

### Bug Fixes

- **api:** allow supervisors to create or edit missions ([#1822](https://github.com/betagouv/service-national-universel/issues/1822)) ([4b0135a](https://github.com/betagouv/service-national-universel/commit/4b0135a108028517f310e3856b26e674a801e834))

### Features

- **api, admin:** export modal for missions ([#1818](https://github.com/betagouv/service-national-universel/issues/1818)) ([477fed3](https://github.com/betagouv/service-national-universel/commit/477fed3702d20b37638f24b81277f74860beb6de))

# [1.134.0](https://github.com/betagouv/service-national-universel/compare/v1.133.1...v1.134.0) (2022-09-23)

### Bug Fixes

- **admin:** front opti ([#1819](https://github.com/betagouv/service-national-universel/issues/1819)) ([a4cebba](https://github.com/betagouv/service-national-universel/commit/a4cebba24f18bfd911034906d98fa8f0967f636b))
- **api:** Update profile referent ([0112380](https://github.com/betagouv/service-national-universel/commit/0112380981956174588e1227e63cdfd121a051a2))
- **redirect:** Tentaive correction alerte sentry ([#1817](https://github.com/betagouv/service-national-universel/issues/1817)) ([1d4e3e8](https://github.com/betagouv/service-national-universel/commit/1d4e3e886d0e9acd9c7956ddac393e384db3bd11))

### Features

- **api/cron:** Add template SIB 199 ([#1820](https://github.com/betagouv/service-national-universel/issues/1820)) ([5cd0ade](https://github.com/betagouv/service-national-universel/commit/5cd0ade050d5ba4b3537197563556861fa58a536))

## [1.133.1](https://github.com/betagouv/service-national-universel/compare/v1.133.0...v1.133.1) (2022-09-22)

### Bug Fixes

- **api:** cron syncro phase2ApplicationStatus ([#1812](https://github.com/betagouv/service-national-universel/issues/1812)) ([4f0022a](https://github.com/betagouv/service-national-universel/commit/4f0022a1168c45f5f06d4fe6dea3a0e32af88b75))
- **api:** delete military files in phase2 ([f0d0b0a](https://github.com/betagouv/service-national-universel/commit/f0d0b0a291d20e74c409681b9b79e0f051ac6fd8))
- **api:** Template 173 cta ([#1815](https://github.com/betagouv/service-national-universel/issues/1815)) ([c440e8a](https://github.com/betagouv/service-national-universel/commit/c440e8a351fb1f405198176792ff0b1ef6f47565))
- **app:** Alignment ([d75cd6c](https://github.com/betagouv/service-national-universel/commit/d75cd6c5ee2a3b59e9dbf8611a24fe2a43c8efac))
- **app:** Front corrections validated phase1 screen ([#1814](https://github.com/betagouv/service-national-universel/issues/1814)) ([f6a3955](https://github.com/betagouv/service-national-universel/commit/f6a3955258e39012690d15f4807b9ab8820999a2))
- translate application status ([31c4fa7](https://github.com/betagouv/service-national-universel/commit/31c4fa7adc270d04a6fabef44b3c4a1a5e12eddc))

# [1.133.0](https://github.com/betagouv/service-national-universel/compare/v1.132.0...v1.133.0) (2022-09-21)

### Bug Fixes

- **api:** Phase 2 - Reparamétrage notif missions dispo ([#1811](https://github.com/betagouv/service-national-universel/issues/1811)) ([c5de4bf](https://github.com/betagouv/service-national-universel/commit/c5de4bfcf9e193f23cba8b94e3874f6b8b1d73bf))
- Mauvaises gestion message d'erreur ([d4c4eb7](https://github.com/betagouv/service-national-universel/commit/d4c4eb76271cd7a4b04586db9c03984f10a6343b))
- **admin:** Front admin screen phase2 - missions candidatées, préférences de missions([#1795](https://github.com/betagouv/service-national-universel/issues/1795)) ([2d00632](https://github.com/betagouv/service-national-universel/commit/2d0063252b6bcce08d72d26d35ef76ba992c6eda))
- **admin:** input mission duration ([6b3ab88](https://github.com/betagouv/service-national-universel/commit/6b3ab8810cde8994693967e7bb6fce45b3d02921))

### Features

- **api:** active cron délai d’acceptation de la proposition de mission ([312ad94](https://github.com/betagouv/service-national-universel/commit/312ad944cc477c6c1a65bdff3da526d7837dfb52))
- Notif desistement ([#1810](https://github.com/betagouv/service-national-universel/issues/1810)) ([6a54159](https://github.com/betagouv/service-national-universel/commit/6a541591821b9ddd739e2de217193953476d1304))
- **app:** lighter es query for exports ([#1807](https://github.com/betagouv/service-national-universel/issues/1807)) ([1c77ef5](https://github.com/betagouv/service-national-universel/commit/1c77ef5a8841e93507b72fb124c1b5a0b7fab4d5))

# [1.132.0](https://github.com/betagouv/service-national-universel/compare/v1.131.0...v1.132.0) (2022-09-20)

### Bug Fixes

- **app:** Ajouter le module “vérification d’adresse” sur le profil d’un volontaire ([#1804](https://github.com/betagouv/service-national-universel/issues/1804)) ([ec25ef2](https://github.com/betagouv/service-national-universel/commit/ec25ef2bf7ddc7dddbf67df7721874308d25f47f))

### Features

- **api:** Phase 2 : délai d’acceptation de la proposition de mission ([#1805](https://github.com/betagouv/service-national-universel/issues/1805)) ([551618b](https://github.com/betagouv/service-national-universel/commit/551618bd8955f83429aef536a5b24dd215e8120c))

# [1.131.0](https://github.com/betagouv/service-national-universel/compare/v1.130.1...v1.131.0) (2022-09-19)

### Bug Fixes

- **admin:** Duration is string ([fc8af75](https://github.com/betagouv/service-national-universel/commit/fc8af754add122fb50b3d917e514b86a0a43ca9f))
- **admin:** MIG - limitation du nombre d’heure d’une mission ([#1803](https://github.com/betagouv/service-national-universel/issues/1803)) ([2275aae](https://github.com/betagouv/service-national-universel/commit/2275aaee59cf9abd65484458f68ee67cea340c4e))
- Dossier d’éligibilité PM après validation phase 2 [#1798](https://github.com/betagouv/service-national-universel/issues/1798) ([b30b5bb](https://github.com/betagouv/service-national-universel/commit/b30b5bba5a5149a6f769e73046c74caf57698cfd))

### Features

- **api/admin:** Brouillon mission ([#1801](https://github.com/betagouv/service-national-universel/issues/1801)) ([43d76ce](https://github.com/betagouv/service-national-universel/commit/43d76ce3b617b60712276194d1daca4b1a2dd8c2))

## [1.130.1](https://github.com/betagouv/service-national-universel/compare/v1.130.0...v1.130.1) (2022-09-16)

### Bug Fixes

- **admin:** code postal structure ([#1797](https://github.com/betagouv/service-national-universel/issues/1797)) ([5967790](https://github.com/betagouv/service-national-universel/commit/5967790b65dab4d5e1ab7f6f9e7cbb2e34e08f7c))
- **app:** Corrections design page Trouver une mission ([#1783](https://github.com/betagouv/service-national-universel/issues/1783)) ([ef08669](https://github.com/betagouv/service-national-universel/commit/ef08669e01d06ff7119bb46c09a7db47dbd3d8ce))

# [1.130.0](https://github.com/betagouv/service-national-universel/compare/v1.129.0...v1.130.0) (2022-09-15)

### Bug Fixes

- pm status files ([#1792](https://github.com/betagouv/service-national-universel/issues/1792)) ([abe31a0](https://github.com/betagouv/service-national-universel/commit/abe31a03fdba4fbb57aeeaa0ff12d6dc1d6d915a))
- translate status pm files ([#1793](https://github.com/betagouv/service-national-universel/issues/1793)) ([43abb51](https://github.com/betagouv/service-national-universel/commit/43abb51bc1b31aaecd8236962aa0dc4543f54006))
- **all:** Rework notifications PM ([#1790](https://github.com/betagouv/service-national-universel/issues/1790)) ([d80fa93](https://github.com/betagouv/service-national-universel/commit/d80fa93d30923ef6389a726c3894705de49d49ae))

### Features

- Rework dossier PM correction ([#1794](https://github.com/betagouv/service-national-universel/issues/1794)) ([3a0bcb3](https://github.com/betagouv/service-national-universel/commit/3a0bcb3cc83c268e09d5e0ed0ac4e046581c98db))
- **api:** Add education et jeunesse et sport to be able to send mails on platform ([96b5094](https://github.com/betagouv/service-national-universel/commit/96b5094a5d624454f0d4d45b492fef41111ba6c2))

# [1.129.0](https://github.com/betagouv/service-national-universel/compare/v1.128.3...v1.129.0) (2022-09-14)

### Bug Fixes

- **admin/app:** Fix sentry error with localStorage ([5845e65](https://github.com/betagouv/service-national-universel/commit/5845e6563ce3bd1b1b52f5c2df28b87fabc92326))
- **app:** Use sentry in app ([447813e](https://github.com/betagouv/service-national-universel/commit/447813e1e5f7dfe2d37ef0ce526e6408b8ccb336))

### Features

- **admin:** Add support question ([#1788](https://github.com/betagouv/service-national-universel/issues/1788)) ([36dd07c](https://github.com/betagouv/service-national-universel/commit/36dd07cb0749eae315d092bdd339fc6f2c60bfc7))
- **admin:** open support referent ([#1789](https://github.com/betagouv/service-national-universel/issues/1789)) ([7942e8f](https://github.com/betagouv/service-national-universel/commit/7942e8f620fda1a755c5aa2b8e7bc55a4dce51af))

## [1.128.3](https://github.com/betagouv/service-national-universel/compare/v1.128.2...v1.128.3) (2022-09-13)

### Bug Fixes

- **admin:** Error with sentry ([5e4cbad](https://github.com/betagouv/service-national-universel/commit/5e4cbad5ffc71c957598d4fe3cd949ae6769ec90))
- **admin:** Search ES/cohesioncenter using department ([d0c3ec9](https://github.com/betagouv/service-national-universel/commit/d0c3ec98c14ab67c09012cf96af9835a0ac5aceb))
- **api:** Error sentry ([1719aaa](https://github.com/betagouv/service-national-universel/commit/1719aaa117afaa399079eeb7cece588218a152e7))
- **api:** Wrong call mongoDB ([57d5032](https://github.com/betagouv/service-national-universel/commit/57d5032fad9730b3747094496e27870e3a07e41f))
- wording public ([3ddfa6a](https://github.com/betagouv/service-national-universel/commit/3ddfa6aba547e6573349ae1a4cb5f1b62e54f14a))

## [1.128.2](https://github.com/betagouv/service-national-universel/compare/v1.128.1...v1.128.2) (2022-09-09)

### Bug Fixes

- **api:** Improve traca des modifications ([#1775](https://github.com/betagouv/service-national-universel/issues/1775)) ([011806f](https://github.com/betagouv/service-national-universel/commit/011806f1eacb0aedd2164b32441340135ff445e2))
- **app:** Design & responsive corrections /candidatures ([#1778](https://github.com/betagouv/service-national-universel/issues/1778)) ([05f44ee](https://github.com/betagouv/service-national-universel/commit/05f44eed71dd9fb390a46d68c0c15279b5ed54c9))
- **kb:** Load content fix for each kind of user ([#1779](https://github.com/betagouv/service-national-universel/issues/1779)) ([c6eebcf](https://github.com/betagouv/service-national-universel/commit/c6eebcf5cb7cca63ab42ac3bcf68b458a4c78d82))

## [1.128.1](https://github.com/betagouv/service-national-universel/compare/v1.128.0...v1.128.1) (2022-09-08)

### Bug Fixes

- **api:** Bug with multi-departments ([09c50ba](https://github.com/betagouv/service-national-universel/commit/09c50ba58c3185c997ae28d7d697ae038ae29db3))
- **api:** fix mimetype decryptedBuffer ([7671b6c](https://github.com/betagouv/service-national-universel/commit/7671b6c67649a25db9e8629853149585dddf4620))
- **app/admin:** Fix modal for app and admin ([3574fc4](https://github.com/betagouv/service-national-universel/commit/3574fc44c147c59e9c08457a5012e2d6fcbb9092))

# [1.128.0](https://github.com/betagouv/service-national-universel/compare/v1.127.1...v1.128.0) (2022-09-07)

### Bug Fixes

- **admin:** Ajout du role dans l'historique ([#1772](https://github.com/betagouv/service-national-universel/issues/1772)) ([b724800](https://github.com/betagouv/service-national-universel/commit/b7248006f34e08c2349ba5bc5887e54892f77685))
- **api:** Mimetype / trust extension ([#1770](https://github.com/betagouv/service-national-universel/issues/1770)) ([2cf6b0e](https://github.com/betagouv/service-national-universel/commit/2cf6b0e9775c0fd91104f184b607dbffb7ca5fdd))
- **cron:** Add 2 hours to time from JVA ([0a12b3a](https://github.com/betagouv/service-national-universel/commit/0a12b3ae66ace0b66ed85623aa7c741bc0f20e7b))
- **github:** Redeploy on changes on lib ([6530e99](https://github.com/betagouv/service-national-universel/commit/6530e99037cd9b611be480bcb15df2179adf2d04))
- **kb:** Fix change role ([#1768](https://github.com/betagouv/service-national-universel/issues/1768)) ([8eedf9a](https://github.com/betagouv/service-national-universel/commit/8eedf9aaf765fc4213875b381b74f3cb5d01372b))
- **lib:** Runtime error ! ([0b93852](https://github.com/betagouv/service-national-universel/commit/0b93852c84bd2af0ed85c9c421beda55133595ac))

### Features

- **api:** sync contact support ([#1771](https://github.com/betagouv/service-national-universel/issues/1771)) ([375d12d](https://github.com/betagouv/service-national-universel/commit/375d12d4e61d7325e4ca1368cd238554682f5298))

### Reverts

- **api:** Force redeploy api ([22e5033](https://github.com/betagouv/service-national-universel/commit/22e5033e454e6d56c852fc0f8fb4a21041fd2e93))

## [1.127.1](https://github.com/betagouv/service-national-universel/compare/v1.127.0...v1.127.1) (2022-09-06)

### Bug Fixes

- **api:** Fix mimetype errors ([#1769](https://github.com/betagouv/service-national-universel/issues/1769)) ([43cb0c8](https://github.com/betagouv/service-national-universel/commit/43cb0c891da2e607f43829ed587c72f9b9b7ada1))

# [1.127.0](https://github.com/betagouv/service-national-universel/compare/v1.126.1...v1.127.0) (2022-09-05)

### Bug Fixes

- **admin:** fix ES query for propose mission ([8b60acc](https://github.com/betagouv/service-national-universel/commit/8b60accc69c4e9ee6914d76d8b0c3c8ee3f7d5fd))
- **api:** gif refdeps access to all missions ([#1760](https://github.com/betagouv/service-national-universel/issues/1760)) ([a2a1497](https://github.com/betagouv/service-national-universel/commit/a2a14975b3e8d692c15dc3d0e96c745a87a14f0d))
- **plausible:** Use link per id ([e68a363](https://github.com/betagouv/service-national-universel/commit/e68a363e97c4c2181ff10fd675868bd5122031fd))

### Features

- **admin/app:** Improve tracking on plausible ([#1758](https://github.com/betagouv/service-national-universel/issues/1758)) ([508017f](https://github.com/betagouv/service-national-universel/commit/508017f0b1c128f5c8cd2ebfc603abeba229c3a9))

## [1.126.1](https://github.com/betagouv/service-national-universel/compare/v1.126.0...v1.126.1) (2022-09-02)

### Bug Fixes

- **admin:** hide private info in young view for resp ([#1754](https://github.com/betagouv/service-national-universel/issues/1754)) ([b4eec4f](https://github.com/betagouv/service-national-universel/commit/b4eec4f37bf87a7827bdb38ad46b7c90ce28a7ce))
- **api:** Download documents supervisor ([#1755](https://github.com/betagouv/service-national-universel/issues/1755)) ([540d7bc](https://github.com/betagouv/service-national-universel/commit/540d7bc2cbc157bc38b0da37e69a6c2d76c9d9c3))
- **api:** download files rules (to revert !!!) ([d6a6d11](https://github.com/betagouv/service-national-universel/commit/d6a6d116a4af214cdf1e41535386291779485e6e))
- **api:** Fix download rights ([5b479c2](https://github.com/betagouv/service-national-universel/commit/5b479c2c44b77316f330d5fed1b7a3883d17510d))
- **api:** log error ([ac4813e](https://github.com/betagouv/service-national-universel/commit/ac4813ec974d6a0dce7cc2675d168f260fa6e91f))

### Reverts

- **api:** Revert rights to download ([e118407](https://github.com/betagouv/service-national-universel/commit/e11840769e838d02a664f3a6db2ab60e0ab63d02))

# [1.126.0](https://github.com/betagouv/service-national-universel/compare/v1.125.0...v1.126.0) (2022-09-01)

### Bug Fixes

- **api, admin, app:** remove content-type header on calls to api-adresse ([#1753](https://github.com/betagouv/service-national-universel/issues/1753)) ([d69f19e](https://github.com/betagouv/service-national-universel/commit/d69f19ed7566def689592db69d4a516d96823889))

### Features

- **admin:** REF DEP : rattachement à plusieurs départements ([#1608](https://github.com/betagouv/service-national-universel/issues/1608)) ([0ec6a40](https://github.com/betagouv/service-national-universel/commit/0ec6a406ecc7bccf632c3e421529d8ffea536e74))

### Reverts

- Revert "chore(deploy): disable push to staging" ([286c7b1](https://github.com/betagouv/service-national-universel/commit/286c7b14b2154ea26ecbdd7930dbc58aa852e7f1))

# [1.125.0](https://github.com/betagouv/service-national-universel/compare/v1.124.2...v1.125.0) (2022-08-31)

### Features

- **admin:** add column selection to young list export ([#1735](https://github.com/betagouv/service-national-universel/issues/1735)) ([f1df43c](https://github.com/betagouv/service-national-universel/commit/f1df43cd3c186f4122af5018fbf765061a6112fa))

## [1.124.2](https://github.com/betagouv/service-national-universel/compare/v1.124.1...v1.124.2) (2022-08-30)

### Bug Fixes

- **admin:** Fix modal document head center ([d6d050f](https://github.com/betagouv/service-national-universel/commit/d6d050f795a1ab2ecb0d57dbb20775cc1965dad5))
- **admin:** restore inscription panel ([784d01d](https://github.com/betagouv/service-national-universel/commit/784d01da5fa421755a81a991b833512e657ac75f))

## [1.124.1](https://github.com/betagouv/service-national-universel/compare/v1.124.0...v1.124.1) (2022-08-29)

### Bug Fixes

- **admin:** Download PM for responsibles ([#1747](https://github.com/betagouv/service-national-universel/issues/1747)) ([0d4511b](https://github.com/betagouv/service-national-universel/commit/0d4511b31bf55d7538934aa05043c93753739247))
- **all:** Fix bugs with uuid files ([#1746](https://github.com/betagouv/service-national-universel/issues/1746)) ([255b498](https://github.com/betagouv/service-national-universel/commit/255b498e8aa284406d20e81a8d2710ffdad0c196))

# [1.124.0](https://github.com/betagouv/service-national-universel/compare/v1.123.10...v1.124.0) (2022-08-26)

### Bug Fixes

- **admin:** fix mission list address ([#1742](https://github.com/betagouv/service-national-universel/issues/1742)) ([5ce262c](https://github.com/betagouv/service-national-universel/commit/5ce262cd25e85a5bd0905bb0bcc559093e146dcb))
- **api, admin, app:** refacto file upload ([#1743](https://github.com/betagouv/service-national-universel/issues/1743)) ([c904158](https://github.com/betagouv/service-national-universel/commit/c9041583e30a50e9ac532087e1e9ba560c0afa36))
- **app:** remove error message when closing young pm file modal ([eb464e8](https://github.com/betagouv/service-national-universel/commit/eb464e850e528acf5a9e5e21cad9eb605c07c047))

### Features

- **SIB:** Add template for welcome + fixes ([#1745](https://github.com/betagouv/service-national-universel/issues/1745)) ([583d8da](https://github.com/betagouv/service-national-universel/commit/583d8daf782f44ebbf4112f163949075d45dbb70))

## [1.123.10](https://github.com/betagouv/service-national-universel/compare/v1.123.9...v1.123.10) (2022-08-25)

### Bug Fixes

- **api:** Bug with call ([02e0256](https://github.com/betagouv/service-national-universel/commit/02e0256f07282d5c6b588ea991c1555c395b169e))
- **api:** Fix call to session-phasea from centers ([0dabd01](https://github.com/betagouv/service-national-universel/commit/0dabd0126894b3e9e4595caceeae9f7611d7f756))

## [1.123.9](https://github.com/betagouv/service-national-universel/compare/v1.123.8...v1.123.9) (2022-08-24)

### Bug Fixes

- **api:** Save lasLoginAt into ES ([479c135](https://github.com/betagouv/service-national-universel/commit/479c135fb219406c58880f0741a1fa0b1cdcd0bf))

## [1.123.8](https://github.com/betagouv/service-national-universel/compare/v1.123.7...v1.123.8) (2022-08-22)

### Bug Fixes

- **admin:** Capture sentry ([ee94fdf](https://github.com/betagouv/service-national-universel/commit/ee94fdf4c94b41583ed6624aaeac4697bf8e7480))
- **all:** Delete educonnect ([#1734](https://github.com/betagouv/service-national-universel/issues/1734)) ([51c9fd2](https://github.com/betagouv/service-national-universel/commit/51c9fd2a968e71bb50e6317cc58bbc721e29b425))
- **api:** Educonnect delete session ([571a236](https://github.com/betagouv/service-national-universel/commit/571a236f22b88c3c4c78224fb49738352efe4454))

## [1.123.7](https://github.com/betagouv/service-national-universel/compare/v1.123.6...v1.123.7) (2022-08-19)

### Bug Fixes

- **admin:** Fix default filters in dashboard ([d074833](https://github.com/betagouv/service-national-universel/commit/d07483367787be867f73d89dcf1996a003aa5547))

## [1.123.6](https://github.com/betagouv/service-national-universel/compare/v1.123.5...v1.123.6) (2022-08-18)

### Bug Fixes

- **app:** adress input check for MIGs ([#1731](https://github.com/betagouv/service-national-universel/issues/1731)) ([3b88ce2](https://github.com/betagouv/service-national-universel/commit/3b88ce2305e0552b7ccbbafde53b2e867074f5b4))

### Reverts

- **api:** Force redeploy api ([095f287](https://github.com/betagouv/service-national-universel/commit/095f287ea3187a9047f897ece7407d7e85d36921))
- **api:** Force redeploy api ([4dd53cc](https://github.com/betagouv/service-national-universel/commit/4dd53cc1575c19e9d475f9426795bbd8bb90a5bb))
- **api:** Force redeploy api ([a43e894](https://github.com/betagouv/service-national-universel/commit/a43e894f2b6a1d97d1c7d189e1ea948248611da5))
- **api:** Force redeploy api ([08cc3d3](https://github.com/betagouv/service-national-universel/commit/08cc3d31b83135fba7619f62626588a2f7d7a137))

## [1.123.5](https://github.com/betagouv/service-national-universel/compare/v1.123.4...v1.123.5) (2022-08-17)

### Bug Fixes

- **github:** workflow ([8119582](https://github.com/betagouv/service-national-universel/commit/81195826604b9006afdd1571ea326f426ccab4a1))

### Reverts

- **api:** Force redeploy api ([2b6ca14](https://github.com/betagouv/service-national-universel/commit/2b6ca14374f9c85b6815119a41dedc76d015764f))
- **api:** Force redeploy api ([59c5724](https://github.com/betagouv/service-national-universel/commit/59c5724571abc06d4835571e82efb18f9b5ec0bd))
- **api:** Force redeploy api" ([5a75c7e](https://github.com/betagouv/service-national-universel/commit/5a75c7e911e350e2964d26259693304715055cf0))
- **github:** Revert as it was ([27e5059](https://github.com/betagouv/service-national-universel/commit/27e5059fa927ea566bddf60e9ae61a66741e8d74))
- **github:** Use github action only for staging ([#1730](https://github.com/betagouv/service-national-universel/issues/1730))" ([189b917](https://github.com/betagouv/service-national-universel/commit/189b91789d91775bed2e5513ca2fabdf3e4cf42c))

## [1.123.4](https://github.com/betagouv/service-national-universel/compare/v1.123.3...v1.123.4) (2022-08-16)

### Bug Fixes

- **github:** Use github action only for staging ([#1730](https://github.com/betagouv/service-national-universel/issues/1730)) ([1c7c1ec](https://github.com/betagouv/service-national-universel/commit/1c7c1ec6864b59e4e278e96c84a5e2bcf7900baf))
- **Joi:** Securise api routes ([#1729](https://github.com/betagouv/service-national-universel/issues/1729)) ([ed6f408](https://github.com/betagouv/service-national-universel/commit/ed6f408f0794bb5edf2d59e88e8248698de8c2cc))

## [1.123.3](https://github.com/betagouv/service-national-universel/compare/v1.123.2...v1.123.3) (2022-08-12)

### Bug Fixes

- **api:** disabled stats-young-metabase ([c26e9dc](https://github.com/betagouv/service-national-universel/commit/c26e9dc572000f983d4a9f4bbaacbed3d8981463))

## [1.123.2](https://github.com/betagouv/service-national-universel/compare/v1.123.1...v1.123.2) (2022-08-11)

### Bug Fixes

- **admin:** liste referent delete modal ([3ef6626](https://github.com/betagouv/service-national-universel/commit/3ef66263b75bf567effc48fcb6a729177b691d89))

## [1.123.1](https://github.com/betagouv/service-national-universel/compare/v1.123.0...v1.123.1) (2022-08-10)

### Bug Fixes

- **api:** stats-young-center ([9e1ccce](https://github.com/betagouv/service-national-universel/commit/9e1ccce395a3e122d8e040e150365f5b58281a7f))

# [1.123.0](https://github.com/betagouv/service-national-universel/compare/v1.122.0...v1.123.0) (2022-08-09)

### Bug Fixes

- **api:** Fix error sentry ([ac453e3](https://github.com/betagouv/service-national-universel/commit/ac453e36f47c7d262d8593ceb70a6aa60a9ab194))
- **kb:** Sentry fix ([5999df7](https://github.com/betagouv/service-national-universel/commit/5999df7f37336c25420b8044f9887e8ae89a33ac))

### Features

- **admin:** Add a modal to reattribute missions in case of delete ([#1716](https://github.com/betagouv/service-national-universel/issues/1716)) ([f8fc173](https://github.com/betagouv/service-national-universel/commit/f8fc17319638c50572f089515b8cd0992b2d1e98))
- **pdf:** use new pdf service for contracts ([#1728](https://github.com/betagouv/service-national-universel/issues/1728)) ([7c09afa](https://github.com/betagouv/service-national-universel/commit/7c09afaecf3b529da3e993c84cf3e123be4b7510))
- **sentry:** Add kb to new sentry ([#1719](https://github.com/betagouv/service-national-universel/issues/1719)) ([1b854c5](https://github.com/betagouv/service-national-universel/commit/1b854c554a76e6dc4d248127560279e33e888625))

# [1.122.0](https://github.com/betagouv/service-national-universel/compare/v1.121.0...v1.122.0) (2022-08-08)

### Bug Fixes

- **admin:** fix download mp files from young edit page ([3bb8492](https://github.com/betagouv/service-national-universel/commit/3bb8492bf77e757e018fd90b2278d5ec85439f82))
- **api:** download pdf file for responsible ([#1727](https://github.com/betagouv/service-national-universel/issues/1727)) ([eeb4f18](https://github.com/betagouv/service-national-universel/commit/eeb4f18f54524ba0588402a4e95f5a664c07c7cc))
- **api:** Hide data at serialization ([5e1700c](https://github.com/betagouv/service-national-universel/commit/5e1700c1f7e1688b03bc33d365f04f16a04c64e6))
- **api:** webhook mails ([c96b8ac](https://github.com/betagouv/service-national-universel/commit/c96b8ac819191ab4181855e72f00e4e71d08421a))
- **sentry:** Group transactions into sentry ([#1726](https://github.com/betagouv/service-national-universel/issues/1726)) ([71bf79b](https://github.com/betagouv/service-national-universel/commit/71bf79b78a9dbb5be1cb4ab20112e8ed7e126b93))

### Features

- **send-in-blue:** New app for webhook send in blue ([#1723](https://github.com/betagouv/service-national-universel/issues/1723)) ([21c8313](https://github.com/betagouv/service-national-universel/commit/21c83139f29066bd670f541084a99c6725f09aa0))

# [1.121.0](https://github.com/betagouv/service-national-universel/compare/v1.120.1...v1.121.0) (2022-08-05)

### Bug Fixes

- **api:** stats-young-center - young_cohort: `à venir` is not a valid enum ([8c32959](https://github.com/betagouv/service-national-universel/commit/8c32959e9daed5173efb72245f0a72ed9c73e996))
- **api:** webhooks SIB error ([#1722](https://github.com/betagouv/service-national-universel/issues/1722)) ([9ec33c6](https://github.com/betagouv/service-national-universel/commit/9ec33c653349d5c717b9f1329d37b6d143d6dfec))

### Features

- **secu:** Renouveau de la politique de mot de passe ([#1718](https://github.com/betagouv/service-national-universel/issues/1718)) ([35ec95b](https://github.com/betagouv/service-national-universel/commit/35ec95bf1800ee18064bd9a81c30152067e3c6e4))

## [1.120.1](https://github.com/betagouv/service-national-universel/compare/v1.120.0...v1.120.1) (2022-08-04)

### Bug Fixes

- **admin/api:** Sentry capture only once ([b2b96e3](https://github.com/betagouv/service-national-universel/commit/b2b96e3cc5d8fc79b2c1ca777605d6c683828d70))
- **app, admin:** correctly display the nb of results when searching for a mission ([d758f70](https://github.com/betagouv/service-national-universel/commit/d758f7018f7396548987c0b90f4d276f67d003a3))

# [1.120.0](https://github.com/betagouv/service-national-universel/compare/v1.119.2...v1.120.0) (2022-08-03)

### Bug Fixes

- **api:** save updatedAt correctly ([#1717](https://github.com/betagouv/service-national-universel/issues/1717)) ([7b982e6](https://github.com/betagouv/service-national-universel/commit/7b982e66fa043cf0db4955362d364e7aa4e79af3))
- **app:** message fermeture inscription ([5c2fe0d](https://github.com/betagouv/service-national-universel/commit/5c2fe0d49cde4f87309ccd2775621f680a9b249c))

### Features

- **pdf:** Add a way to generate pdf locally ([#1704](https://github.com/betagouv/service-national-universel/issues/1704)) ([97cf4bf](https://github.com/betagouv/service-national-universel/commit/97cf4bfede4b579a49995d3b886788fd95742ea0))

## [1.119.2](https://github.com/betagouv/service-national-universel/compare/v1.119.1...v1.119.2) (2022-08-01)

### Bug Fixes

- **admin:** canCreateOrModifyMission for responsible ([a4d890e](https://github.com/betagouv/service-national-universel/commit/a4d890ea306e7c22ec68163a261b0d1546779a1d))

## [1.119.1](https://github.com/betagouv/service-national-universel/compare/v1.119.0...v1.119.1) (2022-07-29)

### Bug Fixes

- **admin:** Ajout champs PM pour structure/mission personnalisée ([#1712](https://github.com/betagouv/service-national-universel/issues/1712)) ([5641f6d](https://github.com/betagouv/service-national-universel/commit/5641f6db9296b7a748caeecf529f807d86e7ff25))
- **admin:** erreur creation tuteur si il existe deja ([#1711](https://github.com/betagouv/service-national-universel/issues/1711)) ([ce14ed5](https://github.com/betagouv/service-national-universel/commit/ce14ed5019710d5e546e3b4b65241bd58188b7ea))
- **admin:** process mission personnalisé ([#1707](https://github.com/betagouv/service-national-universel/issues/1707)) ([82b6bc2](https://github.com/betagouv/service-national-universel/commit/82b6bc23cb62c21895a4b65590f428ddf5e9749a))
- **api:** template 341 add all referent to email ([#1709](https://github.com/betagouv/service-national-universel/issues/1709)) ([0175ccb](https://github.com/betagouv/service-national-universel/commit/0175ccb9787a2d0fa73d037c73d44d3571e2dc1b))
- **app:** notif referent PM ([#1713](https://github.com/betagouv/service-national-universel/issues/1713)) ([a4caaff](https://github.com/betagouv/service-national-universel/commit/a4caaff889d54271d0c5600776f146c677d5d029))

# [1.119.0](https://github.com/betagouv/service-national-universel/compare/v1.118.0...v1.119.0) (2022-07-28)

### Bug Fixes

- **admin:** Fix toastr message for linked_mission ([ca125b3](https://github.com/betagouv/service-national-universel/commit/ca125b3a996165ad229d8829452eef431f830870))
- **app:** échec recherche de mission si pas de location ([#1708](https://github.com/betagouv/service-national-universel/issues/1708)) ([c7cb4ef](https://github.com/betagouv/service-national-universel/commit/c7cb4ef49acc375a550c65f3fc7343558367d3f5))

### Features

- **admin:** Rajouter lien BDC sur la toolbox ([2ad3d5b](https://github.com/betagouv/service-national-universel/commit/2ad3d5b39a3e8ab82bd03ff82d4b2f149ab9d39d))

# [1.118.0](https://github.com/betagouv/service-national-universel/compare/v1.117.0...v1.118.0) (2022-07-27)

### Bug Fixes

- **admin:** Fermeture de mission à la candidature ([#1703](https://github.com/betagouv/service-national-universel/issues/1703)) ([7b7d9c4](https://github.com/betagouv/service-national-universel/commit/7b7d9c48e73ce1221f34ff20e96e26fdc6f22455))
- **api:** Communication à destination de plusieurs référents phase 2 ([#1705](https://github.com/betagouv/service-national-universel/issues/1705)) ([cb3fd0f](https://github.com/betagouv/service-national-universel/commit/cb3fd0ff843c954d04f11391d3f72f52ddaf4ee2))
- **app/admin:** disabled template 201 - 228 SIB ([#1702](https://github.com/betagouv/service-national-universel/issues/1702)) ([403ee5b](https://github.com/betagouv/service-national-universel/commit/403ee5bd25e9e40eb55a1268cb169e8fdb823de5))

### Features

- **pdf:** Branch to sentry ([#1696](https://github.com/betagouv/service-national-universel/issues/1696)) ([1dcddf9](https://github.com/betagouv/service-national-universel/commit/1dcddf9e163100c1d6080d1fe88842eef99c2dac))

# [1.117.0](https://github.com/betagouv/service-national-universel/compare/v1.116.0...v1.117.0) (2022-07-26)

### Bug Fixes

- **admin:** Differencier missions liées et seul responsable sur la structure ([#1693](https://github.com/betagouv/service-national-universel/issues/1693)) ([ae26b21](https://github.com/betagouv/service-national-universel/commit/ae26b21964300558bc44e9e14d29ae0a9fad9c99))
- **admin:** Proposition de mission : liste des volontaires ([#1698](https://github.com/betagouv/service-national-universel/issues/1698)) ([bc1b13c](https://github.com/betagouv/service-national-universel/commit/bc1b13cd57b14c88c698373561be79c1092c2c0d))
- **api:** on delete structure update referent structureId ([#1694](https://github.com/betagouv/service-national-universel/issues/1694)) ([35b1af8](https://github.com/betagouv/service-national-universel/commit/35b1af8f9f773dcb155ea443e2e40df51e276c31))
- **api:** sync sendinblue referent ([95905c1](https://github.com/betagouv/service-national-universel/commit/95905c105bef8315d9f2666f99efffc3a81d972c))
- **api:** sync young ([4662e58](https://github.com/betagouv/service-national-universel/commit/4662e585d45622acf88ef6ba4ecd4226ee38a944))
- **lib:** Add translation ([4d1fbe7](https://github.com/betagouv/service-national-universel/commit/4d1fbe76277125a6398d8025907af49d6538eab3))

### Features

- **admin/app:** favicon for dev ([#1691](https://github.com/betagouv/service-national-universel/issues/1691)) ([b6638fa](https://github.com/betagouv/service-national-universel/commit/b6638fa5c87a266c80f91bb1be4b2eb883662215))
- **api, admin:** add equivalence status filter ([#1688](https://github.com/betagouv/service-national-universel/issues/1688)) ([21e8b0a](https://github.com/betagouv/service-national-universel/commit/21e8b0a4306847ce1cddae519467d212ac846219))
- **app:** ajout modal annulation de candidature ([#1680](https://github.com/betagouv/service-national-universel/issues/1680)) ([ba3a290](https://github.com/betagouv/service-national-universel/commit/ba3a290dde81a77db33ffcb30545c8ca62763744))
- **app:** new home phase 2 ([#1690](https://github.com/betagouv/service-national-universel/issues/1690)) ([59ede43](https://github.com/betagouv/service-national-universel/commit/59ede4312d56f243cb0cf9d741f37feecc73c407))
- **app:** vérifier l’adresse du proche ([#1692](https://github.com/betagouv/service-national-universel/issues/1692)) ([6fb9817](https://github.com/betagouv/service-national-universel/commit/6fb9817f59dac83a7ab7ea694e14ee61afd7c03f))
- **pdf:** Handle timeout and pdf service down ([#1686](https://github.com/betagouv/service-national-universel/issues/1686)) ([dc1fe00](https://github.com/betagouv/service-national-universel/commit/dc1fe00070b5be7b9a91f0373c52bc6b89a453bd))
- (all) sentry setup ([#1685](https://github.com/betagouv/service-national-universel/issues/1685)) ([c1d5411](https://github.com/betagouv/service-national-universel/commit/c1d5411a796f45ba18dc0e029278e7b8b875464c))

# [1.116.0](https://github.com/betagouv/service-national-universel/compare/v1.115.1...v1.116.0) (2022-07-25)

### Bug Fixes

- **api:** mongodb poolSize to 100 ([ab8fd82](https://github.com/betagouv/service-national-universel/commit/ab8fd820ba17bd3be072735dcd0490b3d64165ec))

### Features

- **app:** add event tracking phase2 plausible ([#1689](https://github.com/betagouv/service-national-universel/issues/1689)) ([87b5696](https://github.com/betagouv/service-national-universel/commit/87b56961c5c06bf249e6503fdad8ec20218741e3))

### Reverts

- Revert "feat: (all) sentry setup (#1685)" ([13b8764](https://github.com/betagouv/service-national-universel/commit/13b8764f6c1c6067af19aa939e01462940e1de57)), closes [#1685](https://github.com/betagouv/service-national-universel/issues/1685)
- Revert "fix: (admin) Send events to admin sentry" ([2b5a655](https://github.com/betagouv/service-national-universel/commit/2b5a655fa7f080f4b8f9022ccd5c878df8736d8f))

## [1.115.1](https://github.com/betagouv/service-national-universel/compare/v1.115.0...v1.115.1) (2022-07-22)

### Bug Fixes

- **app:** PM propose mission ([#1684](https://github.com/betagouv/service-national-universel/issues/1684)) ([af6f629](https://github.com/betagouv/service-national-universel/commit/af6f629c2b849d5c4042e5272d9584ee279c299e))
- (api) Disable sentry logs ([86f9cc8](https://github.com/betagouv/service-national-universel/commit/86f9cc802dc263fba37f28716a0f1b7c7c906d8c))
- force deploy ([32cc122](https://github.com/betagouv/service-national-universel/commit/32cc1227d3ae18a058612945451d4bc500882284))

### Reverts

- Revert "fix (app, admin): safe names for PM uploads (#1681)" ([893373c](https://github.com/betagouv/service-national-universel/commit/893373cb4e1f9ba6bec7614c8597cf0a3fcad2ac)), closes [#1681](https://github.com/betagouv/service-national-universel/issues/1681)

# [1.115.0](https://github.com/betagouv/service-national-universel/compare/v1.114.0...v1.115.0) (2022-07-21)

### Bug Fixes

- (api) Fix for download pdf for admin ([07ac900](https://github.com/betagouv/service-national-universel/commit/07ac9001ca488af3ff62830ccd6866c5766f15f0))
- (api) Import from sentry ([86289e0](https://github.com/betagouv/service-national-universel/commit/86289e0bde5c20cfa144763b7e5b9e8d25560bd8))
- (app) fixup org sentry ([fa6e841](https://github.com/betagouv/service-national-universel/commit/fa6e84114025b629f62d54abedeed5d8d186a09f))
- (Sentry) Reduce sample rate ([fcabd76](https://github.com/betagouv/service-national-universel/commit/fcabd762ba9492713674b3dfd602f792843fba8e))
- Sentry logs ([b647110](https://github.com/betagouv/service-national-universel/commit/b647110274967b87be28716cb2744dd8a1f0c79f))
- **api:** mail equivalence validée ([6b2e61e](https://github.com/betagouv/service-national-universel/commit/6b2e61ecd3e12fdbc5a7525e07ceb60887f8c916))

### Features

- Add new sentry to repo ([1235192](https://github.com/betagouv/service-national-universel/commit/12351921f1931a506252ddd4d369c70291ba320a))

# [1.114.0](https://github.com/betagouv/service-national-universel/compare/v1.113.0...v1.114.0) (2022-07-20)

### Features

- **admin:** open support sso Normandie ([#1679](https://github.com/betagouv/service-national-universel/issues/1679)) ([3b49537](https://github.com/betagouv/service-national-universel/commit/3b4953761bb3f6f4a57c21ef21cc364ebd7bd487))

# [1.113.0](https://github.com/betagouv/service-national-universel/compare/v1.112.0...v1.113.0) (2022-07-19)

### Features

- **app:** Telechargement contrat phase2 ([#1671](https://github.com/betagouv/service-national-universel/issues/1671)) ([dcebf4a](https://github.com/betagouv/service-national-universel/commit/dcebf4a8926a39ce45aa2adb35edb114a8b1562e))

# [1.112.0](https://github.com/betagouv/service-national-universel/compare/v1.111.2...v1.112.0) (2022-07-18)

### Features

- **admin:** open sso support ([#1674](https://github.com/betagouv/service-national-universel/issues/1674)) ([3226c9d](https://github.com/betagouv/service-national-universel/commit/3226c9dc0914bff1b0b10eba817cb236f3923c6b))

## [1.111.2](https://github.com/betagouv/service-national-universel/compare/v1.111.1...v1.111.2) (2022-07-15)

### Bug Fixes

- (admin) Replace statut with statut général in excel génération ([7c52aa7](https://github.com/betagouv/service-national-universel/commit/7c52aa7058d52b273da0bca30a2f4e000f9edfe2))

## [1.111.1](https://github.com/betagouv/service-national-universel/compare/v1.111.0...v1.111.1) (2022-07-13)

### Bug Fixes

- loading button attestation ([a6f7211](https://github.com/betagouv/service-national-universel/commit/a6f7211193369dc442ca31a199cde4314adb529f))
- **admin + app:** open attestation + convocation ([aad0c9e](https://github.com/betagouv/service-national-universel/commit/aad0c9e9fd288a138c37e3ca6c514da997cd3956))
- **api:** multi page on attestation ([7d9cf7b](https://github.com/betagouv/service-national-universel/commit/7d9cf7b84ddaf3499f9fe36faaf500d910924056))

# [1.111.0](https://github.com/betagouv/service-national-universel/compare/v1.110.0...v1.111.0) (2022-07-12)

### Bug Fixes

- **app:** hide attestation jeune mobile ([d07661d](https://github.com/betagouv/service-national-universel/commit/d07661d6a85b9d50b50bcf19bea78126a1df4feb))
- (admin) hide button attestations phase1 ([6fc7c2c](https://github.com/betagouv/service-national-universel/commit/6fc7c2ce1c2fe9f9d142ef723b358078b1bc261c))
- **admin:** blank page view mission ([0207290](https://github.com/betagouv/service-national-universel/commit/0207290c2ae2c8c2bd3fae0d52d4c36b41990c53))
- **admin:** file PM ([#1668](https://github.com/betagouv/service-national-universel/issues/1668)) ([b892a3d](https://github.com/betagouv/service-national-universel/commit/b892a3dfced54bddb82d10d870d8a751be9dbe41))
- **app:** blank page view mission ([1535bdd](https://github.com/betagouv/service-national-universel/commit/1535bdda16ec61904b83d9e1c01413b296b7ce0d))
- **app:** hide mail convocation mobile ([1e76f00](https://github.com/betagouv/service-national-universel/commit/1e76f00fdf591bbf1fce650dac5bd408c4477bef))
- **app:** ouverture des heures retour sur les convocations ([#1670](https://github.com/betagouv/service-national-universel/issues/1670)) ([7e47b50](https://github.com/betagouv/service-national-universel/commit/7e47b50317f480f6d3d01d11016a6f040bb9a495))
- **app:** status candidature/PM ([a4e871b](https://github.com/betagouv/service-national-universel/commit/a4e871be6668ec27a56d00a8c45a98ca6c63f1e4))
- (admin) Block download attestation loading-effect ([238543e](https://github.com/betagouv/service-national-universel/commit/238543ee645b6b96fad0c5a6ae8c28d4cfb15fe4))
- (admin) Block download for head centers ([7725d95](https://github.com/betagouv/service-national-universel/commit/7725d95c783928784bf9df0005cc54feefba272d))
- Téléchargement par centre ([#1665](https://github.com/betagouv/service-national-universel/issues/1665)) ([7fe722a](https://github.com/betagouv/service-national-universel/commit/7fe722a7b288f90f1ee142e6a586712779c6d0a6))

### Features

- **app, admin, api:** Televersement fichier phase2 ([#1661](https://github.com/betagouv/service-national-universel/issues/1661)) ([4bfabbf](https://github.com/betagouv/service-national-universel/commit/4bfabbfb582ca4cb8833a0b0f452291cb89a51b5))

# [1.110.0](https://github.com/betagouv/service-national-universel/compare/v1.109.0...v1.110.0) (2022-07-11)

### Bug Fixes

- Cacher bouton attestation phase1 ([948204e](https://github.com/betagouv/service-national-universel/commit/948204e2f52c89d25dbab63973afdc412191032c))
- Cacher bouton attestation phase1 ([535d786](https://github.com/betagouv/service-national-universel/commit/535d786400ac9c7f574404510af885225725fbc9))
- **app:** home par défaut pour les 2022 ([8f921f5](https://github.com/betagouv/service-national-universel/commit/8f921f5268610c63b9a28ca973cd4b5a83dcdc30))
- (admin) No download certificate ([3a10049](https://github.com/betagouv/service-national-universel/commit/3a100492d78cea2edae427cb0cab9433e3d31ffc))
- certificates dates & templates ([#1659](https://github.com/betagouv/service-national-universel/issues/1659)) ([8c214fb](https://github.com/betagouv/service-national-universel/commit/8c214fb4cf292ed0a6b6957d79662f0be9f88d23))
- convocation ([dc0b282](https://github.com/betagouv/service-national-universel/commit/dc0b282ad3262a3c760f84bffda715d948e5e1f7))
- **api:** certificate phase 1 ([315ef11](https://github.com/betagouv/service-national-universel/commit/315ef11f342279de3f9aeef7bf444c52ac7fa124))
- **api:** remove some field from es ([b4405b8](https://github.com/betagouv/service-national-universel/commit/b4405b8b7bb0837816350ff810a4bc4dfada7615))
- **app:** Rajouter un hover texte pour les candidatures MIG des jeunes encore en séjour ([057c759](https://github.com/betagouv/service-national-universel/commit/057c759515ed9a0620b8589863361bd3901bc801))
- **export:** fix temporaire export volumineux ([306491b](https://github.com/betagouv/service-national-universel/commit/306491b835dbf49a52db8a9af55196e6c6023baa))

### Features

- **app:** Evolution écran de phase 1 validée + Ouvrir le changement de séjour pour les volontaires d’HDFAMI00201 ([#1649](https://github.com/betagouv/service-national-universel/issues/1649)) ([30fad54](https://github.com/betagouv/service-national-universel/commit/30fad5494aa68068e5ecb2f52d70f235bdc1938e))

# [1.109.0](https://github.com/betagouv/service-national-universel/compare/v1.108.3...v1.109.0) (2022-07-08)

### Bug Fixes

- **kb:** domain names ([a5fe847](https://github.com/betagouv/service-national-universel/commit/a5fe84714c46dfce3e55e389187329afdedff708))

### Features

- **admin:** open modification PDR ref regional ([f2db237](https://github.com/betagouv/service-national-universel/commit/f2db2377f106f2a314df189de95d413abface9e3))
- **api:** Open new PDF generator 🎉 ([470a838](https://github.com/betagouv/service-national-universel/commit/470a838bf16ad796ef6a54d6bf65cb97594dcb38))

## [1.108.3](https://github.com/betagouv/service-national-universel/compare/v1.108.2...v1.108.3) (2022-07-07)

### Bug Fixes

- **api:** certif phase 1 v8 ([4c90bbd](https://github.com/betagouv/service-national-universel/commit/4c90bbdd621be0de961d3f5c4fe9b2dae55ccedc))

### Reverts

- Revert "fix(api): cors pdf" ([1fb672f](https://github.com/betagouv/service-national-universel/commit/1fb672f6b1d07058cd6a0e66c5b64aa2aa1dd809))

## [1.108.2](https://github.com/betagouv/service-national-universel/compare/v1.108.1...v1.108.2) (2022-07-06)

### Bug Fixes

- **admin:** Inviter une structure en rentrant l’adresse manuellement ([905482e](https://github.com/betagouv/service-national-universel/commit/905482e5d2760bec90f9ae7f009880bc5740f440))
- **admin:** UI doc phase 1 ([624a9b0](https://github.com/betagouv/service-national-universel/commit/624a9b032881983f0571666b9e16cab4cf7a6d23))

## [1.108.1](https://github.com/betagouv/service-national-universel/compare/v1.108.0...v1.108.1) (2022-07-05)

### Bug Fixes

- **api,admin:** ajout nom du centre - espace chef de centre ([07498a1](https://github.com/betagouv/service-national-universel/commit/07498a118acc3f60ad0753e80e3a46d8756c1cbd))
- condition validation phase 1 ([b8c68d0](https://github.com/betagouv/service-national-universel/commit/b8c68d05c3cfc64a22714e234d2b572065b8887a))
- **admin:** pointage ([768bc9a](https://github.com/betagouv/service-national-universel/commit/768bc9ac1d38db9d51cb1884ae626826fcad6469))

# [1.108.0](https://github.com/betagouv/service-national-universel/compare/v1.107.3...v1.108.0) (2022-07-04)

### Bug Fixes

- add filter visibility mission ([52122eb](https://github.com/betagouv/service-national-universel/commit/52122eb2853bd4beff0b6c244211345ea833bdf9))
- **admin:** BUG pointage des volontaires par les CDC ([f524905](https://github.com/betagouv/service-national-universel/commit/f5249058afebd871d4015ead5ed7a881a8e7749d))
- **api:** sécurité automatisation suppression fichier préparation militaire ([#1646](https://github.com/betagouv/service-national-universel/issues/1646)) ([7b204a1](https://github.com/betagouv/service-national-universel/commit/7b204a13ff4ec266020fd61583bdf7a05315b4e7))
- **app:** reopen form SNUpport ([50f9d2b](https://github.com/betagouv/service-national-universel/commit/50f9d2b9a4e57596ada20cbad7c6b6ca934f167b))

### Features

- **admin:** ouverture creation equivalence pour les referent ([#1634](https://github.com/betagouv/service-national-universel/issues/1634)) ([604d3de](https://github.com/betagouv/service-national-universel/commit/604d3dec0a17b0d08a511dc3f86f982b9cf23dce))
- **api:** sync referent support ([#1647](https://github.com/betagouv/service-national-universel/issues/1647)) ([47d7ec2](https://github.com/betagouv/service-national-universel/commit/47d7ec207b39fe2f599d1a1a2a7671280e206658))
- **app, admin:** Masquer la mission pour suspendre les candidatures ([#1630](https://github.com/betagouv/service-national-universel/issues/1630)) ([9624322](https://github.com/betagouv/service-national-universel/commit/962432237b368c96c79ab1242c657a04c5e7e69c))

## [1.107.3](https://github.com/betagouv/service-national-universel/compare/v1.107.2...v1.107.3) (2022-07-03)

### Bug Fixes

- **api:** reactivate crons ([441e0d5](https://github.com/betagouv/service-national-universel/commit/441e0d5ec85076d3a30a12ac686ea1b5d188312a))

## [1.107.2](https://github.com/betagouv/service-national-universel/compare/v1.107.1...v1.107.2) (2022-07-01)

### Bug Fixes

- **admin:** PM file download ([d620442](https://github.com/betagouv/service-national-universel/commit/d6204425aa57701491126f86ec0f6206c5681855))
- **api:** convocation for DOMTOM ([6cd8886](https://github.com/betagouv/service-national-universel/commit/6cd8886e267e8bbf56b7a04919f1e6ec14d3bc23))
- warning message IDF ([8661e98](https://github.com/betagouv/service-national-universel/commit/8661e9856bf5dda0df74ef3902e4546e87889a5b))

## [1.107.1](https://github.com/betagouv/service-national-universel/compare/v1.107.0...v1.107.1) (2022-06-30)

### Bug Fixes

- change sender ([9e3ce6e](https://github.com/betagouv/service-national-universel/commit/9e3ce6ef4e89f4fd805993354e0d286e6b1c230d))
- envoie par mail ([04b49af](https://github.com/betagouv/service-national-universel/commit/04b49aff975b6371a6f3250fd0a73ff85b9b7a13))
- remove middleware es young ([4df0427](https://github.com/betagouv/service-national-universel/commit/4df04274d49a088aa50bd140cb39b8355655dbc2))
- up pdf ([8af6dd2](https://github.com/betagouv/service-national-universel/commit/8af6dd2aa04c4cba03dd39c2698819b9d792b79c))
- **admin:** cacher bouton download ([0e79a70](https://github.com/betagouv/service-national-universel/commit/0e79a709a33ab5015d7762efc302117c421f9290))
- up ([df35256](https://github.com/betagouv/service-national-universel/commit/df35256b9247f23b77ef2c2cd0980d9f3481b517))
- **admin:** affectation jeune temp ([9fd4a61](https://github.com/betagouv/service-national-universel/commit/9fd4a61501ed9ad3a299066512e7213f1654a310))
- **admin:** fix fix fix fix ([ef8e19e](https://github.com/betagouv/service-national-universel/commit/ef8e19eb5afc79632d668905de6739922bf27e87))
- **api,app:** envoie de convocation par mail ([04f351f](https://github.com/betagouv/service-national-universel/commit/04f351fbb92d2f2a41552a3682f272929582f22b))
- delete zammad ([#1638](https://github.com/betagouv/service-national-universel/issues/1638)) ([647f8fc](https://github.com/betagouv/service-national-universel/commit/647f8fcc70e27882dfd3f52b0ed84baaa9a0c1e0))
- deploy ([8203c6e](https://github.com/betagouv/service-national-universel/commit/8203c6e451bd491d6da3580eeae7fac848e932df))
- disable login while submit ([96ace24](https://github.com/betagouv/service-national-universel/commit/96ace241015d87f2411b454b5c981ec5fdec7b91))
- up ([77c3c9d](https://github.com/betagouv/service-national-universel/commit/77c3c9d9e65cbc4067b9be338da3cd7b4069c3ef))
- **admin:** maintenance ([74f8bc7](https://github.com/betagouv/service-national-universel/commit/74f8bc7e599b7ece57bab7c8d9ac693b962761b5))
- **admin:** maintenance auth page ([adf202b](https://github.com/betagouv/service-national-universel/commit/adf202b61a6334c2f87fd0f86bd2ee86a7563381))
- **admin:** msg maintenance ([6448337](https://github.com/betagouv/service-national-universel/commit/6448337c0623d6f823ff2cd1dc11ff62bc19c709))
- **admin:** reduce perpage meetingPoint ([b554ae3](https://github.com/betagouv/service-national-universel/commit/b554ae35589b90a1409e5b6a27d1b113699d51b3))
- **admin:** update maintenance hour ([7fb943a](https://github.com/betagouv/service-national-universel/commit/7fb943a068779867c9a5ef66f45176d2ff62507e))
- **api:** early return tickets ([8dfe308](https://github.com/betagouv/service-national-universel/commit/8dfe308b403d0a08431e39aa9e21b65199f3a6da))
- **app:** masquage téléchargement/mail convocation ([7b4344a](https://github.com/betagouv/service-national-universel/commit/7b4344a942216a4a8587bc86382ab0a8d7fff484))
- **app:** ouverture partielle 15% ([ff7a32b](https://github.com/betagouv/service-national-universel/commit/ff7a32bc59fc631d01ee04a2d2f8dc5b74a1800a))
- **app:** ouverture partielle 30% ([3380b64](https://github.com/betagouv/service-national-universel/commit/3380b648c23d1040ddeb8decb37bde501e8797aa))
- desactivation telechargement convoc ([8d6631c](https://github.com/betagouv/service-national-universel/commit/8d6631c669dc93d92bab2d12dcf6a27a2abaacea))
- ouverture partielle 5% ([f2d1db8](https://github.com/betagouv/service-national-universel/commit/f2d1db883fc6af15b75d659f0799fc60d0124e8b))
- override maintenance ([#1639](https://github.com/betagouv/service-national-universel/issues/1639)) ([2b2e465](https://github.com/betagouv/service-national-universel/commit/2b2e46548ceffaa37d3e04c4778ad4e9c1395803))
- remove sync sendinblue and lastloginat ([f0bf3ec](https://github.com/betagouv/service-national-universel/commit/f0bf3ec63f6ba927a3d3e049971928d97abcb8de))

### Reverts

- Revert "Revert "fix(admin): mise en maintenance"" ([a27f2da](https://github.com/betagouv/service-national-universel/commit/a27f2dad1cabcc2df0b8c8181e27d653647330e1))

# [1.107.0](https://github.com/betagouv/service-national-universel/compare/v1.106.0...v1.107.0) (2022-06-29)

### Bug Fixes

- **admin:** vue temp affected ([9aa715f](https://github.com/betagouv/service-national-universel/commit/9aa715f7cf4f0a51e4033e6c53a1424eb79951f1))
- **app:** delete modal support affectation ([8147501](https://github.com/betagouv/service-national-universel/commit/81475014b48c3a5da96f58a638cbbd4b01da6a01))
- hide retour ([37615bc](https://github.com/betagouv/service-national-universel/commit/37615bc126e5a06cbc0d1972719519ee29b3e302))

### Features

- **admin:** add grade user attributes support ([#1636](https://github.com/betagouv/service-national-universel/issues/1636)) ([afd9ed7](https://github.com/betagouv/service-national-universel/commit/afd9ed71b651dfe69f188d85882c85cb910613bb))
- **app:** Cards mission ([#1632](https://github.com/betagouv/service-national-universel/issues/1632)) ([b22d141](https://github.com/betagouv/service-national-universel/commit/b22d141a032b93362834b858fb9c24232fc25d17))
- **app:** Change convocation date for return ([fd29acf](https://github.com/betagouv/service-national-universel/commit/fd29acf9ae0c7370cc39a4ce89bfe74fe3bfa5b1))
- **app:** Forms ([#1633](https://github.com/betagouv/service-national-universel/issues/1633)) ([05935cf](https://github.com/betagouv/service-national-universel/commit/05935cfd3f3c3e68a46871254ccb53b2832bb758))

# [1.106.0](https://github.com/betagouv/service-national-universel/compare/v1.105.0...v1.106.0) (2022-06-28)

### Bug Fixes

- **api:** Erreur certificat phase 1 ([80f4b64](https://github.com/betagouv/service-national-universel/commit/80f4b64565972a3fb50d37948256cd8a71b566f8))
- **app:** désistement message obligatoire ([590b488](https://github.com/betagouv/service-national-universel/commit/590b488c02f9dab0f29b5214ebc84f53502038a4))

### Features

- **admin:** add filter volontaire list ([6010afc](https://github.com/betagouv/service-national-universel/commit/6010afc53ee91c6bfe8501244909db4b88a3cb5c))
- **admin:** add mail equivalence ([#1629](https://github.com/betagouv/service-national-universel/issues/1629)) ([ae3f65c](https://github.com/betagouv/service-national-universel/commit/ae3f65c9170bfee908c2916658dcbb8fbb9081dd))
- **api:** utm batch 3 ([#1626](https://github.com/betagouv/service-national-universel/issues/1626)) ([68f75ff](https://github.com/betagouv/service-national-universel/commit/68f75ff3306f3494954cbda47ce647cadb33e7d1))
- **app:** find mission mobile ([#1621](https://github.com/betagouv/service-national-universel/issues/1621)) ([3306e76](https://github.com/betagouv/service-national-universel/commit/3306e762f3820cb063f15b73c8c455742afd22f9))
- **app:** ouverture des écrans phase 2 à la consultation pendant le séjour ([#1617](https://github.com/betagouv/service-national-universel/issues/1617)) ([82164fb](https://github.com/betagouv/service-national-universel/commit/82164fb7e6a3675fe8582a0f1ad381e6e81c290d))

# [1.105.0](https://github.com/betagouv/service-national-universel/compare/v1.104.1...v1.105.0) (2022-06-27)

### Bug Fixes

- **admin:** Element déclencheur validation sejour phase1 ([e4ca4b9](https://github.com/betagouv/service-national-universel/commit/e4ca4b99776cc95da76c5e49ac352e8a28bf48af))
- **api,app:** change ordre candidature [#1618](https://github.com/betagouv/service-national-universel/issues/1618) ([49664cb](https://github.com/betagouv/service-national-universel/commit/49664cb91822d5d92eed4be8342c8cca776756ca))
- **app:** classement candidatures responsive ([79bcb47](https://github.com/betagouv/service-national-universel/commit/79bcb47d680f73b63ce0efc0803ccedbbf0269e3))
- **app:** pop up support affectation ([e69dc7a](https://github.com/betagouv/service-national-universel/commit/e69dc7a0a1a508f7c0d53d224ab0af579980f416))

### Features

- **admin:** suppression depart phase 1 ([#1620](https://github.com/betagouv/service-national-universel/issues/1620)) ([c41057c](https://github.com/betagouv/service-national-universel/commit/c41057c0ffa4a849bde171e5e3dd061e93019993))
- **app:** add modal ([#1625](https://github.com/betagouv/service-national-universel/issues/1625)) ([14247e7](https://github.com/betagouv/service-national-universel/commit/14247e732d5f2fa3cfc8ee25c61932a264efe437))

## [1.104.1](https://github.com/betagouv/service-national-universel/compare/v1.104.0...v1.104.1) (2022-06-24)

### Bug Fixes

- **api:** La Majuscule ! (fixup) ([721667a](https://github.com/betagouv/service-national-universel/commit/721667ac6d5314fa7a9e85acb59f33bd867ab12e))
- **app:** désistement jeune sur liste complémentaire ([6e61cd1](https://github.com/betagouv/service-national-universel/commit/6e61cd13036189b27cb3af83dab2558dad8fe6b9))

# [1.104.0](https://github.com/betagouv/service-national-universel/compare/v1.103.1...v1.104.0) (2022-06-23)

### Bug Fixes

- **admin:** affichage session par défaut chef de centre multi séjour ([ae0733c](https://github.com/betagouv/service-national-universel/commit/ae0733cc5a21a4cedc837b9780900a776e002057))
- **admin:** pointage presence JDM ([20a0acc](https://github.com/betagouv/service-national-universel/commit/20a0acc5e2eee84568472cfc964a7b0589705849))
- **api:** auto validation status phase1 ([a6dcbca](https://github.com/betagouv/service-national-universel/commit/a6dcbca884a0d9a654697ba28724d6df34930d60))
- **app:** candidature PM conditionnel ([f78fdd2](https://github.com/betagouv/service-national-universel/commit/f78fdd247d856881f67f31b052dd150260d50e4e))
- **app:** change image phase 1 validée ([a0a8944](https://github.com/betagouv/service-national-universel/commit/a0a8944a61e7489e50f3a184e643a2fa87ea7200))
- **app:** missionName not defined in application ([56c79ba](https://github.com/betagouv/service-national-universel/commit/56c79ba8a8455a7c2f7b38baed7ae29970f6e14e))
- **app:** phase 2 button attestion ([81499f8](https://github.com/betagouv/service-national-universel/commit/81499f8c1d88a2879f5313aa759a321e35a8ab3b))
- **app:** raccourci vers preparation militaire ([54679ed](https://github.com/betagouv/service-national-universel/commit/54679ed02923022ca49386091cf525ea68e00c79))
- **app:** recherche missions - supprimer form ([68babb0](https://github.com/betagouv/service-national-universel/commit/68babb013e9f587405ad1d58384020c1b922411f))
- **app:** ui phase 1 done ([77e452b](https://github.com/betagouv/service-national-universel/commit/77e452bb95f2bbe37f0c457febb1d2181bb81f63))

### Features

- **app+admin:** open new phase 2 ([ec64ab1](https://github.com/betagouv/service-national-universel/commit/ec64ab12fdae4a83ce37ef2943946a6d7964783f))

## [1.103.1](https://github.com/betagouv/service-national-universel/compare/v1.103.0...v1.103.1) (2022-06-22)

### Bug Fixes

- **admin:** enlever option changement vers juillet 2022 ([7d35d91](https://github.com/betagouv/service-national-universel/commit/7d35d91fcbc79b93e54835496f6b5a1b79e15d39))
- **admin:** Fix traductions ([56c75ff](https://github.com/betagouv/service-national-universel/commit/56c75ffe7604bc1aced6e8df4700456d84518a69))
- **app:** convocation terminale ([1444554](https://github.com/betagouv/service-national-universel/commit/144455468e38c82db770284cce69ce61149ee35b))
- **app:** redirection carte candidature ([921b54d](https://github.com/betagouv/service-national-universel/commit/921b54d689eede389399695bc053978b21f84634))

# [1.103.0](https://github.com/betagouv/service-national-universel/compare/v1.102.0...v1.103.0) (2022-06-21)

### Bug Fixes

- **admin:** young center 50 per page ([697c838](https://github.com/betagouv/service-national-universel/commit/697c838b47b5679538416310240594e6c76a7e19))
- **api:** plural on attestation ([3ab0714](https://github.com/betagouv/service-national-universel/commit/3ab071418a5f10cb0262552e8591427899bf8f75))
- **api:** QW export presence ([9615027](https://github.com/betagouv/service-national-universel/commit/9615027b20b6d6650ea2daed06468d3e2e330680))

### Features

- **api:** update jva information ([#1611](https://github.com/betagouv/service-national-universel/issues/1611)) ([7bedc81](https://github.com/betagouv/service-national-universel/commit/7bedc81a41b6401de5e4354fb0230cd2959fd4a3))

# [1.102.0](https://github.com/betagouv/service-national-universel/compare/v1.101.0...v1.102.0) (2022-06-20)

### Bug Fixes

- **admin:** wording status phase 1 ([632f9d9](https://github.com/betagouv/service-national-universel/commit/632f9d91938fb487d05a3de6ec7f1fb8f92e587b))
- **admin,api:** bon template certificat en masse ([f0dfb42](https://github.com/betagouv/service-national-universel/commit/f0dfb428e9160f525b9af6a83074e49a807dc5ff))
- ajouter cohorte `à venir` fiche edition volontaire ([dfc91ef](https://github.com/betagouv/service-national-universel/commit/dfc91efae1a4237c16bfbabc70248a53f313dc0a))

### Features

- **api:** automatisation validation du séjour de cohésion ([#1590](https://github.com/betagouv/service-national-universel/issues/1590)) ([8b01209](https://github.com/betagouv/service-national-universel/commit/8b0120988ef1c86536f024821d9bfd4df4f1ff4e))

# [1.101.0](https://github.com/betagouv/service-national-universel/compare/v1.100.1...v1.101.0) (2022-06-17)

### Bug Fixes

- **api,app:** ouverture changement de séjour pour dourdan ([71d6fc0](https://github.com/betagouv/service-national-universel/commit/71d6fc08c038506c6cfdeba9f3f6633560ccc641))

### Features

- attestation phase1 ([01988aa](https://github.com/betagouv/service-national-universel/commit/01988aaf6754028c95c2f12e8036114ec56f8265))
- export-presence ([#1610](https://github.com/betagouv/service-national-universel/issues/1610)) ([2bcf9a0](https://github.com/betagouv/service-national-universel/commit/2bcf9a0a998e1131e9dcdd576773cc43fcc5154f))

## [1.100.1](https://github.com/betagouv/service-national-universel/compare/v1.100.0...v1.100.1) (2022-06-16)

### Bug Fixes

- **api:** re-ouverture séjour juillet ([6df72fd](https://github.com/betagouv/service-national-universel/commit/6df72fde0bdb00393b9d2fceefccd15dc42909b2))

# [1.100.0](https://github.com/betagouv/service-national-universel/compare/v1.99.2...v1.100.0) (2022-06-15)

### Bug Fixes

- **app:** pouvoir masquer une candidature ([f6f498e](https://github.com/betagouv/service-national-universel/commit/f6f498e8af20b1df5331425c5b4801f442c2fca0))

### Features

- change sejour waiting list ([#1609](https://github.com/betagouv/service-national-universel/issues/1609)) ([53ec27c](https://github.com/betagouv/service-national-universel/commit/53ec27cdc7113e3627cd208b909d085e04c260ba))

## [1.99.2](https://github.com/betagouv/service-national-universel/compare/v1.99.1...v1.99.2) (2022-06-14)

### Bug Fixes

- **admin:** commentaire de départ obligatoire ([1d32937](https://github.com/betagouv/service-national-universel/commit/1d3293760976113c4ab313c66dcbc9c8b8e947dd))
- **admin:** dashboard centre - ne pas compter prendre en compte les desistés ([039ac9b](https://github.com/betagouv/service-national-universel/commit/039ac9b50d1af153b1de0a920997ac8d1b74913b))
- **app:** add drag and drop candidatures ([cc934ca](https://github.com/betagouv/service-national-universel/commit/cc934ca3222d2cafe89bac7d21ce6250998d7351))
- **app:** start candidatures v2 ([273300a](https://github.com/betagouv/service-national-universel/commit/273300a5ee177ae9c041eb6a19f000bfdd1526f5))
- **app:** wip candidatures ([8ec44e7](https://github.com/betagouv/service-national-universel/commit/8ec44e77f24915989816c0549820181442615662))

## [1.99.1](https://github.com/betagouv/service-national-universel/compare/v1.99.0...v1.99.1) (2022-06-13)

### Bug Fixes

- **admin:** open download young file to referent reception center ([#1607](https://github.com/betagouv/service-national-universel/issues/1607)) ([e205a58](https://github.com/betagouv/service-national-universel/commit/e205a5899293466690bbe2668148899746f8e665))
- **admin:** Show status désistement ([6a810d6](https://github.com/betagouv/service-national-universel/commit/6a810d6a2bf62dce70f965c98dedc55e6510aa43))

# [1.99.0](https://github.com/betagouv/service-national-universel/compare/v1.98.1...v1.99.0) (2022-06-10)

### Bug Fixes

- **admin:** head center dashboard ([5b493ec](https://github.com/betagouv/service-national-universel/commit/5b493ec4a96e4243e7b31b9112227526d4d6bc2e))
- **admin:** PDR session share ([0fbc925](https://github.com/betagouv/service-national-universel/commit/0fbc925ed98b77a21ed6133794ebb11293b2f097))
- **api:** ne pas supprimer session si ya des jeunes ([ec2e4d3](https://github.com/betagouv/service-national-universel/commit/ec2e4d3868ff227a12f00ed0152794e1409e6a92))

### Features

- **admin:** delete meeting point ([#1600](https://github.com/betagouv/service-national-universel/issues/1600)) ([9544f57](https://github.com/betagouv/service-national-universel/commit/9544f57cd890c73098fb39ac88e855f2ecd2ec3d))

## [1.98.1](https://github.com/betagouv/service-national-universel/compare/v1.98.0...v1.98.1) (2022-06-09)

### Bug Fixes

- **admin,app,support:** Ministère de l’éducation nationale et de la jeunesse ([fe5cf0c](https://github.com/betagouv/service-national-universel/commit/fe5cf0c26673769f8c7d02c167f035cf1668aed2))
- add count sessionPhase1 share ([528ac9c](https://github.com/betagouv/service-national-universel/commit/528ac9ccafa0fc5033b6533b56713ad743fdab40))
- **admin:** list of user's sessions ([e2ea76a](https://github.com/betagouv/service-national-universel/commit/e2ea76a39d16441eaccc4204db78796afebe814c))
- **admin:** séjour sélectionné par défaut ([14fe339](https://github.com/betagouv/service-national-universel/commit/14fe3396d9b9b9f5953e80caa53ede332e653a33))
- **admin:** selection du séjour initiale - vue centre ([734d639](https://github.com/betagouv/service-national-universel/commit/734d639302f7c5128aca3a930380d89d229827dd))
- **api:** afficher uniquement volontaires validés - partage données sessionPhase1 ([336a3c9](https://github.com/betagouv/service-national-universel/commit/336a3c9f71295e81a0d3e003d0863b9dca8f3a6d))

# [1.98.0](https://github.com/betagouv/service-national-universel/compare/v1.97.0...v1.98.0) (2022-06-07)

### Features

- **api:** send step1form connected young ([#1597](https://github.com/betagouv/service-national-universel/issues/1597)) ([43d67ee](https://github.com/betagouv/service-national-universel/commit/43d67ee77067eca0161a8924da0d60a3362ea361))

# [1.97.0](https://github.com/betagouv/service-national-universel/compare/v1.96.1...v1.97.0) (2022-06-06)

### Bug Fixes

- ajout link écran phase 1 affecté ([ed7d8d5](https://github.com/betagouv/service-national-universel/commit/ed7d8d5fd19f0fbc8b0197bc1909de7d2e2e2747))
- **admin:** create meeting point center ([af4c519](https://github.com/betagouv/service-national-universel/commit/af4c519d0fe97d714e09c59c78a3da01beda992d))
- **admin:** remove `statusPhase1Tmp` from export ([d43a7e9](https://github.com/betagouv/service-national-universel/commit/d43a7e9b66be53b34e375159a08e715aeebd69b5))
- **api,admin:** changer ou pas centre de destination point de rassemblement ([a8ba06b](https://github.com/betagouv/service-national-universel/commit/a8ba06b342c7a3cdbaac6998aa3a1929f73e13d7))

### Features

- **admin,api:** creation point de rassemblement ([#1596](https://github.com/betagouv/service-national-universel/issues/1596)) ([da4dc7b](https://github.com/betagouv/service-national-universel/commit/da4dc7bad69fa4524655fd33bd4ceb8236266159))
- **admin,api:** ouverture création point de rassemblement en prod ([dab3518](https://github.com/betagouv/service-national-universel/commit/dab35180402cb0589179dd59b42b4bf944b14395))

## [1.96.1](https://github.com/betagouv/service-national-universel/compare/v1.96.0...v1.96.1) (2022-06-03)

### Bug Fixes

- **admin:** referent peut voir details point de rassemblement ([3f43288](https://github.com/betagouv/service-national-universel/commit/3f4328815d52010d9540374260281fc0a165224b))
- **app:** Bloquer onglets phase 1/2/3 aux volontaires désistés ([#1595](https://github.com/betagouv/service-national-universel/issues/1595)) ([2ecf773](https://github.com/betagouv/service-national-universel/commit/2ecf773868fdbc7f70538186acde5ea38776b26d))

# [1.96.0](https://github.com/betagouv/service-national-universel/compare/v1.95.0...v1.96.0) (2022-06-02)

### Bug Fixes

- **admin:** referent can't edit meeting point ([d3270ef](https://github.com/betagouv/service-national-universel/commit/d3270ef50b7da0d27ade83674d4a62a28297625a))
- continue v2 mission + home phase 2 ([8092fa0](https://github.com/betagouv/service-national-universel/commit/8092fa0c6d0d455df69b70e121cf5b8f438c3c08))

### Features

- **admin:** PR ouverture à la consultation pour les référents régionaux et départementaux ([#1594](https://github.com/betagouv/service-national-universel/issues/1594)) ([13f671a](https://github.com/betagouv/service-national-universel/commit/13f671add877ed2c549e6427ff9fbe08e5c59a9f))

# [1.95.0](https://github.com/betagouv/service-national-universel/compare/v1.94.0...v1.95.0) (2022-06-01)

### Bug Fixes

- start new screen missions ([242c9c2](https://github.com/betagouv/service-national-universel/commit/242c9c2bb664dab7593a37790d8f3fc1df1c32c4))
- **admin:** affectation par ref regional ([df9867c](https://github.com/betagouv/service-national-universel/commit/df9867c599e08be9906ff7bf7ac7c5680faf0256))
- **admin:** statut available for new affectation by referent ([a22f918](https://github.com/betagouv/service-national-universel/commit/a22f918e44259bfaa58dabec94b49f25a2212e15))
- **app:** header in mobile home phase2 ([828164b](https://github.com/betagouv/service-national-universel/commit/828164b0ef242d7fce5c1cb6d4442074ad8dc4a0))
- **app,admin:** font faces ([d22c9d7](https://github.com/betagouv/service-national-universel/commit/d22c9d7a6be6044f94dbb401dd3b47d7538a4854))
- home phase 2 wip ([ada32c0](https://github.com/betagouv/service-national-universel/commit/ada32c0100fd83b248440d8513544430acfa7fbe))
- **app:** phase2 home + add router ([8255a37](https://github.com/betagouv/service-national-universel/commit/8255a375ab4b0fa0f3fdc2c8b86d4b34f6e2acf5))
- phase2 home ([9387f1b](https://github.com/betagouv/service-national-universel/commit/9387f1b3224cee28fd41f47fb316ed56517c7033))

### Features

- **app:** font Marianne ✨ ([78283f8](https://github.com/betagouv/service-national-universel/commit/78283f84a6373a8c59e2452ffeb62fc9edc82949))
- setup phase2v2 ([#1593](https://github.com/betagouv/service-national-universel/issues/1593)) ([f8e3206](https://github.com/betagouv/service-national-universel/commit/f8e32063bbe0e6f7670cabe3b2059939e4bc2e59))
- **admin:** Ouvrir l’affectation aux référents régionaux ([#1591](https://github.com/betagouv/service-national-universel/issues/1591)) ([396366e](https://github.com/betagouv/service-national-universel/commit/396366eacccdeeec980cc0cba22de1c86451fd5f))

# [1.94.0](https://github.com/betagouv/service-national-universel/compare/v1.93.0...v1.94.0) (2022-05-31)

### Features

- **admin:** rajouter choix de la cohorte création nouvelle inscription ([#1592](https://github.com/betagouv/service-national-universel/issues/1592)) ([de0d5f3](https://github.com/betagouv/service-national-universel/commit/de0d5f3f2fa78e4582d6354e843245b2e95a3335))

# [1.93.0](https://github.com/betagouv/service-national-universel/compare/v1.92.0...v1.93.0) (2022-05-30)

### Bug Fixes

- **admin:** article centre de support chef de centre ([#1588](https://github.com/betagouv/service-national-universel/issues/1588)) ([5951430](https://github.com/betagouv/service-national-universel/commit/59514300fc80d86edba03865d4c53df0af4e4bc6))
- **app:** se désister, changer lien de redirection vers article BDC ([b2063f7](https://github.com/betagouv/service-national-universel/commit/b2063f707863fecf9a18edc3da2fc590f4096db8))

### Features

- **admin:** ouvrir modification affectation référents régionaux ([#1589](https://github.com/betagouv/service-national-universel/issues/1589)) ([e89a66c](https://github.com/betagouv/service-national-universel/commit/e89a66c0cc00efc7ff06d34a57957a1e83b0a05e))

# [1.92.0](https://github.com/betagouv/service-national-universel/compare/v1.91.0...v1.92.0) (2022-05-25)

### Bug Fixes

- **admin:** chef de centre - session la plus proche dans le future active par défaut ([2c1eb26](https://github.com/betagouv/service-national-universel/commit/2c1eb2699aef10c5f5a78ceb39b5752227a17c5d))
- **app+admin:** from page for support ([#1586](https://github.com/betagouv/service-national-universel/issues/1586)) ([c3dc217](https://github.com/betagouv/service-national-universel/commit/c3dc2174c8e45c9f3378d7df5c063ec6b5de1062))
- **security:** file upload only for a few routes ([#1537](https://github.com/betagouv/service-national-universel/issues/1537)) ([d79f61d](https://github.com/betagouv/service-national-universel/commit/d79f61d7d6012d9f1ed17719196ff0875256a825))

### Features

- **admin:** use-local-storage pour le selecteur de séjour [#1585](https://github.com/betagouv/service-national-universel/issues/1585) ([e4c8dba](https://github.com/betagouv/service-national-universel/commit/e4c8dbad8681a994d2810bb35a0ba7e6df4c4f6d))
- **api:** utm batch 2 ([#1584](https://github.com/betagouv/service-national-universel/issues/1584)) ([508d41e](https://github.com/betagouv/service-national-universel/commit/508d41e3e69f423bfbc16ad36b5cabffb9171cd0))

# [1.91.0](https://github.com/betagouv/service-national-universel/compare/v1.90.0...v1.91.0) (2022-05-24)

### Bug Fixes

- **admin:** dashboard centre - filtre session par cohorte ([6e4a7df](https://github.com/betagouv/service-national-universel/commit/6e4a7df1e0e1e14c35ca7c0dac05e33491cc116d))
- **admin:** duplicate structure on spam click ([7f009a9](https://github.com/betagouv/service-national-universel/commit/7f009a91cc227ee965fc48590bcb82d46b2dd416))
- **app:** vue candidatures ([f720eca](https://github.com/betagouv/service-national-universel/commit/f720ecabee0f2d5940fe992e2a8d33313fe14a35))

### Features

- **admin:** mobile - Export des volontaires par ligne de transport / lieu de rassemblement ([#1580](https://github.com/betagouv/service-national-universel/issues/1580)) ([b4c09c4](https://github.com/betagouv/service-national-universel/commit/b4c09c48955a188375cc90fff5f423cf496c055c))
- **api,admin:** add stats centre [#1583](https://github.com/betagouv/service-national-universel/issues/1583) ([cb4046d](https://github.com/betagouv/service-national-universel/commit/cb4046d99aa2d2c3bd3e3cd4c335260131d273d9))

# [1.90.0](https://github.com/betagouv/service-national-universel/compare/v1.89.0...v1.90.0) (2022-05-23)

### Bug Fixes

- **admin:** add breadcrumbs in tabs ([be38fd1](https://github.com/betagouv/service-national-universel/commit/be38fd17ca17011d2f2c42bcfbc68c49a92090ff))
- **admin:** meeting point department ([08aedba](https://github.com/betagouv/service-national-universel/commit/08aedba100d09b104e8fe177b4e8e797e7c5f41f))
- **admin:** text dashboard admin/chef de centre ([6e6053a](https://github.com/betagouv/service-national-universel/commit/6e6053a822497170c70992cc24d22b1c63d29b32))
- **knowledge-base:** eslint error ([9345fdd](https://github.com/betagouv/service-national-universel/commit/9345fddf3de47371c4cf963527415a8aa74cf1c3))
- **knowledge-base:** Plausible event event ([ab49ac4](https://github.com/betagouv/service-national-universel/commit/ab49ac400e668b43e0863783eecb491ff7f411e0))
- **knowledge-base:** remove plausible import ([eadfff9](https://github.com/betagouv/service-national-universel/commit/eadfff9479fc98621a74db6944e476f9b22e49df))

### Features

- **admin:** bus-complet-meeting-point [#1581](https://github.com/betagouv/service-national-universel/issues/1581) ([cf4b32d](https://github.com/betagouv/service-national-universel/commit/cf4b32d18e72d8105b225b2e511d633ad0e63e44))
- **api,admin:** ajout historique point de rassemblement ([599ff11](https://github.com/betagouv/service-national-universel/commit/599ff114293398cada046e85bd114eb0453ffc56))

# [1.89.0](https://github.com/betagouv/service-national-universel/compare/v1.88.0...v1.89.0) (2022-05-20)

### Bug Fixes

- add `fromUser` ([168ecf4](https://github.com/betagouv/service-national-universel/commit/168ecf4c8dfa7ece2792e044808035d0cc213537))

### Features

- **admin:** inviter chef centre si besoin [#1579](https://github.com/betagouv/service-national-universel/issues/1579) ([97af790](https://github.com/betagouv/service-national-universel/commit/97af7909cde956135668d7895bca26db281f95c8))

# [1.88.0](https://github.com/betagouv/service-national-universel/compare/v1.87.1...v1.88.0) (2022-05-19)

### Bug Fixes

- **admin:** ajout redirection vers centre et point de rassemblement depuis fiche jeune ([75c302b](https://github.com/betagouv/service-national-universel/commit/75c302b3a1b1d0e24f7b3a7c9ff1946dd5141750))
- **admin:** masquage depart dans edit point de rassemblement ([f2013cc](https://github.com/betagouv/service-national-universel/commit/f2013ccfe30bfd5cd58d70c381fd72b5c9d554ca))
- **admin:** n'afficher que les points de rassemblements qui vont au centre du jeune ([055d24c](https://github.com/betagouv/service-national-universel/commit/055d24c039363db30f25d8abcbfbba8583682577))
- **admin:** ouvrir meetingPoint pour les référents ([9e7f716](https://github.com/betagouv/service-national-universel/commit/9e7f7166d38f3dda3f904c41ae40e5b79f9cfa72))
- **admin:** vue pointage sur espace chef de centre ([6409d0f](https://github.com/betagouv/service-national-universel/commit/6409d0f6a325e4b143bb7e59cc4ae012b127e9c5))
- **api:** add patches meetingPoint ([5d12c1c](https://github.com/betagouv/service-national-universel/commit/5d12c1ced1649eb7cfaff5bf2d3ff4bbe19d124d))
- **api:** ouvrir changement de cohorte vers juillet jusqu'au 16 juin ([24c375d](https://github.com/betagouv/service-national-universel/commit/24c375d95b5144a8d314a78344bb664b1b9bbadb))
- add crumbs centres ([e0f51bb](https://github.com/betagouv/service-national-universel/commit/e0f51bbd4cb5ff5062c44b045c3644ef781120d8))
- convoc ([68d3360](https://github.com/betagouv/service-national-universel/commit/68d33609e109e14b3c0602252594c656d780389d))
- convoc dom tom ([556d001](https://github.com/betagouv/service-national-universel/commit/556d001fa512a2ba349ca4e2dfbaca69e19b7707))
- convoc plateforme ([6f76868](https://github.com/betagouv/service-national-universel/commit/6f76868e67edbbc3f1df041c6a31516f9e2f2e51))
- **api:** `updatePlacesBus` quand le jeune se désiste ([fd6c5d0](https://github.com/betagouv/service-national-universel/commit/fd6c5d0a00322cb4c0db4fd1ac12a438d4c54db8))
- **app:** cacher department si besoin ([05d258a](https://github.com/betagouv/service-national-universel/commit/05d258a40e5c67b81a33936c5bc577ff0155b893))
- **app:** loader sur le désistement ([d6ee577](https://github.com/betagouv/service-national-universel/commit/d6ee57742b7ffa65c5013245601ceab58ac4fac2))
- **app:** responsive again ([22908af](https://github.com/betagouv/service-national-universel/commit/22908af3a8b9741676075750818e5e95034f620c))
- **app:** responsive phase1 ([86c1131](https://github.com/betagouv/service-national-universel/commit/86c1131f9c6753aec7543986f10bbb5f25fecd9d))
- **app:** responsive phase1 files ([ce465f2](https://github.com/betagouv/service-national-universel/commit/ce465f26a71b5b46bb8db58b121d6b738567e45a))
- filtre par défaut point de rassemblement ([214578f](https://github.com/betagouv/service-national-universel/commit/214578fd8669383fad03313924b6fa7a86ddb856))
- redirect centre ([2587a44](https://github.com/betagouv/service-national-universel/commit/2587a44f4e3f7e078a5a151d01abdb10bdf3c92a))

### Features

- **admin:** breadcrumbs :sparkles: ([8d1032c](https://github.com/betagouv/service-national-universel/commit/8d1032c051f292cb07d4d5aca6b50318aa68dd24))
- **api:** add checkbox hide department in convoc ([1d30eac](https://github.com/betagouv/service-national-universel/commit/1d30eace5e68500815246273df41fec71eb9a858))
- **api:** batch3 mails ([#1540](https://github.com/betagouv/service-national-universel/issues/1540)) ([385e93f](https://github.com/betagouv/service-national-universel/commit/385e93f2f6ac3041e688eb371c227cb8b9e8808f))

## [1.87.1](https://github.com/betagouv/service-national-universel/compare/v1.87.0...v1.87.1) (2022-05-18)

### Bug Fixes

- **app:** écran phase1 - liste d'attente ([856ba9a](https://github.com/betagouv/service-national-universel/commit/856ba9a444c6ff40a177f1042f0bfac674c9c1bf))
- `codeCenter` + `pageSize` point de rassemblement ([f5e1730](https://github.com/betagouv/service-national-universel/commit/f5e1730ccc14fc9c5a9641fc8b735f996bfbb701))
- add horaire de départ ([cfbebae](https://github.com/betagouv/service-national-universel/commit/cfbebaed24c461138b232977281cbe935668ec76))
- open new style center ([e37d325](https://github.com/betagouv/service-national-universel/commit/e37d32565b5d24826e6b3fc5d036682a8b11e2fd))
- open onglet général ([2d729bc](https://github.com/betagouv/service-national-universel/commit/2d729bca594557f957a1e2fc494cf1b8a3a5a200))
- **api:** `updatePlacesBus` ([b49e46d](https://github.com/betagouv/service-national-universel/commit/b49e46de1ec3d6ad1f55b8969e1928f3c2ea8517))

### Reverts

- Revert "(educonnect) allow Inscription for test" ([022d3cf](https://github.com/betagouv/service-national-universel/commit/022d3cf82a9ddcf945a8c7f9684e5ea788bb4811))

# [1.87.0](https://github.com/betagouv/service-national-universel/compare/v1.86.0...v1.87.0) (2022-05-17)

### Bug Fixes

- hide bouton créer nouveau séjour ([1035bc2](https://github.com/betagouv/service-national-universel/commit/1035bc28ad17f1ae687b11c931c0490a78a33113))
- QW ajout session ([050a36a](https://github.com/betagouv/service-national-universel/commit/050a36af882422204946563107d17dde08e1d38b))
- style liste point de rassemblement ([68e0576](https://github.com/betagouv/service-national-universel/commit/68e0576e0d58c19276498a9e5626aa27478b0f0b))
- style point de rassemblement ([b57f10b](https://github.com/betagouv/service-national-universel/commit/b57f10b590362cdabbaebce34eba3ab123f7d2db))
- up ([61e4b00](https://github.com/betagouv/service-national-universel/commit/61e4b006422aac6f0cda8e6701ceff339e4f9d07))
- **admin:** click-outside-select-session ([50d1f90](https://github.com/betagouv/service-national-universel/commit/50d1f90dfb8bb37112d5ea7f0eeb59b1dfe564c2))

### Features

- **admin:** add statusPhase1Tmp ([a57cbd5](https://github.com/betagouv/service-national-universel/commit/a57cbd51b71990ad0d34f24b9027c597fb634801))
- **admin:** equipe centre tw ([3d9caae](https://github.com/betagouv/service-national-universel/commit/3d9caae5b850b39a7ccaafe465b1f6d1a548c8fa))
- **admin:** Evolution fiche volontaire phase 1 ([#1565](https://github.com/betagouv/service-national-universel/issues/1565)) ([b2b95f4](https://github.com/betagouv/service-national-universel/commit/b2b95f47c978c217423225878532de66918bb051))
- **api:** tmp affectation phase 1 ([aa62045](https://github.com/betagouv/service-national-universel/commit/aa6204527229701e7c46fceabec1e6b9126539f8))

# [1.86.0](https://github.com/betagouv/service-national-universel/compare/v1.85.0...v1.86.0) (2022-05-16)

### Bug Fixes

- **admin:** margin boutons ([38508ec](https://github.com/betagouv/service-national-universel/commit/38508eceedb2e86afb310379764296a8ef1b73d3))

### Features

- multi centers ([#1539](https://github.com/betagouv/service-national-universel/issues/1539)) ([bfdb797](https://github.com/betagouv/service-national-universel/commit/bfdb797557853a57b29c29c9fe1719db12e52ad4))

# [1.85.0](https://github.com/betagouv/service-national-universel/compare/v1.84.0...v1.85.0) (2022-05-13)

### Bug Fixes

- **admin:** cacher onglet historique pour les superivseur ([cb5cf40](https://github.com/betagouv/service-national-universel/commit/cb5cf40d659fd73be10ca540f6f6eed2bb1c98ed))
- **admin:** enlever changement vers juin ([11832d9](https://github.com/betagouv/service-national-universel/commit/11832d9489bb6e9ed1482caaa36a3f8ccd99fffe))
- add count in select ([394b08f](https://github.com/betagouv/service-national-universel/commit/394b08fd8454d8da8a691ea53a89abfa50ff9891))
- dashboard center ([c63b28e](https://github.com/betagouv/service-national-universel/commit/c63b28e53cb4dcc83ae890371838bcf3414e891e))
- multi action pointage ([7123b3c](https://github.com/betagouv/service-national-universel/commit/7123b3cad3f43d434972c19bc5346df3949f189f))

### Features

- multi action depart ([fad23a4](https://github.com/betagouv/service-national-universel/commit/fad23a4da56e172169e8bec34f0343342649a4cf))

# [1.84.0](https://github.com/betagouv/service-national-universel/compare/v1.83.0...v1.84.0) (2022-05-12)

### Bug Fixes

- add select components ([6072589](https://github.com/betagouv/service-national-universel/commit/607258912ebeaf5d19803d969de7554680dee66f))

### Features

- **admin:** add correction and ready for prod ([#1555](https://github.com/betagouv/service-national-universel/issues/1555)) ([30f4a87](https://github.com/betagouv/service-national-universel/commit/30f4a87df8f01dce87beb54cc71ab484939fcea5))

# [1.83.0](https://github.com/betagouv/service-national-universel/compare/v1.82.0...v1.83.0) (2022-05-11)

### Bug Fixes

- **admin,app:** supression colonne `contact` support ([8749424](https://github.com/betagouv/service-national-universel/commit/87494241ab9049832e0c9f7984c12922a271c855))
- **api:** contract-token-young-adult ([#1547](https://github.com/betagouv/service-national-universel/issues/1547)) ([7d73e6e](https://github.com/betagouv/service-national-universel/commit/7d73e6e862fbdf68e6a859f11dd802b4ff2e0181))

### Features

- **admin:** suppression des membres d’équipe ([#1553](https://github.com/betagouv/service-national-universel/issues/1553)) ([244851b](https://github.com/betagouv/service-national-universel/commit/244851be2ff3f18731ab031753f8bd39c1d2c28d))
- **admin,api:** multi action pointage ([7ea4502](https://github.com/betagouv/service-national-universel/commit/7ea45023ee99df845baebe6c9238a898fb972a19))
- **api:** welcome mail referents ([#1552](https://github.com/betagouv/service-national-universel/issues/1552)) ([644c04c](https://github.com/betagouv/service-national-universel/commit/644c04c74c3112436c64816af7a00f0e7ace9b5c))
- **app:** modif validated phase 1 ([#1554](https://github.com/betagouv/service-national-universel/issues/1554)) ([1fb9c4b](https://github.com/betagouv/service-national-universel/commit/1fb9c4b439303602122ef6bc54fa87207354e1a4))

# [1.82.0](https://github.com/betagouv/service-national-universel/compare/v1.81.1...v1.82.0) (2022-05-10)

### Bug Fixes

- add depart sejour ([ad22682](https://github.com/betagouv/service-national-universel/commit/ad22682c4d20d3ce9b19bf464423f394bde7b3a0))
- **api,admin:** simplification routes pointage ([a634a78](https://github.com/betagouv/service-national-universel/commit/a634a78b1781c3ee46c0be8520a9ce058f339e7e))
- add filter `code2022` ([046debf](https://github.com/betagouv/service-national-universel/commit/046debf1d50d2b3d51465172776211653e86f421))
- add view `code2022` ([248abd6](https://github.com/betagouv/service-national-universel/commit/248abd6a0a1ce93893d39e8a0f4081b840471ea1))
- **api:** limit query size ([#1542](https://github.com/betagouv/service-national-universel/issues/1542)) ([02f2495](https://github.com/betagouv/service-national-universel/commit/02f24954df4697bf6c0aeec0c448d0955ee37955))

### Features

- **admin:** multi select et multi actions pointage ([379f8f0](https://github.com/betagouv/service-national-universel/commit/379f8f0c124d7d1d81b18f69793484d62c8c660a))

## [1.81.1](https://github.com/betagouv/service-national-universel/compare/v1.81.0...v1.81.1) (2022-05-09)

### Bug Fixes

- empty env var necessary ([0abbac0](https://github.com/betagouv/service-national-universel/commit/0abbac054f38acabf8b5fb8b946b127b4df0a9fe))
- **admin:** add edit `TraitementDonneesPersonnelles` ([120ac93](https://github.com/betagouv/service-national-universel/commit/120ac93d6872af4b1f2143839d50983fe16ce3f9))
- **admin:** view structure réseau ([28428c3](https://github.com/betagouv/service-national-universel/commit/28428c372c9f5c61f23e2ad2a204b0970a2878ad))
- **api,admin:** droit phase 1 ([bdc9676](https://github.com/betagouv/service-national-universel/commit/bdc9676891eccc7cee2d8aed9fa7d8af01f21e62))

# [1.81.0](https://github.com/betagouv/service-national-universel/compare/v1.80.1...v1.81.0) (2022-05-06)

### Bug Fixes

- center wip ([f18b423](https://github.com/betagouv/service-national-universel/commit/f18b423cd284cae135aba3835c0695956a67535b))
- centre onglet pointage ([7c9d0ff](https://github.com/betagouv/service-national-universel/commit/7c9d0ff2350faebf9dc20c89f15dd6fd216a956b))
- modal pointage jdm ([bcb601a](https://github.com/betagouv/service-national-universel/commit/bcb601a14cdc8d09e9080d36a3842e613519de89))
- pointage fiche sanitaire ([56ceb41](https://github.com/betagouv/service-national-universel/commit/56ceb4126c3312fe0f392a87db971efddb01b245))
- style filter volontaires centres ([af6350c](https://github.com/betagouv/service-national-universel/commit/af6350ca89cf2cc2847e10c5ab61cfca662e9649))
- style pointage ([ab40df2](https://github.com/betagouv/service-national-universel/commit/ab40df2ce081c6c0e546c8b8f81366c4f6adb111))
- style pointage general ([0bc9413](https://github.com/betagouv/service-national-universel/commit/0bc9413f0b781a7f34b2b6b321353add1804b3b2))

### Features

- **api:** ajout `presenceJDM` ([aff60a1](https://github.com/betagouv/service-national-universel/commit/aff60a180ceffae9901ff8a84ff3f3f9f731e55c))

## [1.80.1](https://github.com/betagouv/service-national-universel/compare/v1.80.0...v1.80.1) (2022-05-05)

### Bug Fixes

- lib/inscriptionModificationOpenForYoungs ([e4557ef](https://github.com/betagouv/service-national-universel/commit/e4557efaab7d66a94db501f1543f751e60bf14d8))
- step center ([42ee685](https://github.com/betagouv/service-national-universel/commit/42ee685db5c6287e9110860c8706933f1dc6a16d))
- **app:** home "a venir" ([347e8fe](https://github.com/betagouv/service-national-universel/commit/347e8fe1a72393d6bdc577c51a5337b2cd5956ff))

# [1.80.0](https://github.com/betagouv/service-national-universel/compare/v1.79.0...v1.80.0) (2022-05-04)

### Bug Fixes

- canModifyReferent ([6977d83](https://github.com/betagouv/service-national-universel/commit/6977d837b87b65a7d86bb797ed65bb82ff5a449b))
- center ui ([c43d774](https://github.com/betagouv/service-national-universel/commit/c43d774b65af03ceabb915744039ce7d17a95822))
- centre affichage membres équipe ([16b18d5](https://github.com/betagouv/service-national-universel/commit/16b18d5225c1f4cec8b92e54608d6c2d1b8329e3))
- equipe centre ([32b995f](https://github.com/betagouv/service-national-universel/commit/32b995fbbfb44c01c5e02a8e90c677d19b092aac))
- htmlCleaner messagerie ([1c77247](https://github.com/betagouv/service-national-universel/commit/1c772470d1af6966e806d3138f369e40da6bdd58))
- translate state tickets ([e5f8dfd](https://github.com/betagouv/service-national-universel/commit/e5f8dfdae111973eff7aa673defdb25f4dfcf248))
- url SNUpport ([5ec20cc](https://github.com/betagouv/service-national-universel/commit/5ec20cc698421d50fce7661b88ee355d0e52c1b6))
- view center ([339a801](https://github.com/betagouv/service-national-universel/commit/339a80150c758bf0629ca1ee383942b2737a60e8))
- **api:** includes SNUpport ([92a4e7a](https://github.com/betagouv/service-national-universel/commit/92a4e7a545384b1979b301742eb6bd98af746127))
- **api:** notify referent ([376924c](https://github.com/betagouv/service-national-universel/commit/376924ccb5e251067bf20b77ca3f5097c863b04a))
- **api:** remove notif update ticket support ([20e8077](https://github.com/betagouv/service-national-universel/commit/20e80771954f393971b158448d135442de2746f0))

### Features

- **admin:** font Marianne ([#1494](https://github.com/betagouv/service-national-universel/issues/1494)) ([cf6a44b](https://github.com/betagouv/service-national-universel/commit/cf6a44b3bfc3f0e17d778e79c3a002dd0b03e141))
- pointage sejour - 1 ([#1544](https://github.com/betagouv/service-national-universel/issues/1544)) ([622f06f](https://github.com/betagouv/service-national-universel/commit/622f06f38486211bef71f700e15f6718aaabec85))

# [1.79.0](https://github.com/betagouv/service-national-universel/compare/v1.78.0...v1.79.0) (2022-05-03)

### Bug Fixes

- **admin:** error on delete document phase1 ([42edcf7](https://github.com/betagouv/service-national-universel/commit/42edcf791a9eb68be5c885a63c3b0a50f744f3bc))
- **api:** can view cohesion center ([0efbc8c](https://github.com/betagouv/service-national-universel/commit/0efbc8cd93736a60f7b20339270521f279592f90))
- **security:** check authorization step 2 ([#1524](https://github.com/betagouv/service-national-universel/issues/1524)) ([b2da1c3](https://github.com/betagouv/service-national-universel/commit/b2da1c3abdf9cb33d59a30f765479843890bbd63))
- **security:** remove last error leak info ([#1538](https://github.com/betagouv/service-national-universel/issues/1538)) ([d6695be](https://github.com/betagouv/service-national-universel/commit/d6695bea15a4ab05aceb36817a8ab2605afc5022))

### Features

- **admin:** cancel-session-young ([#1533](https://github.com/betagouv/service-national-universel/issues/1533)) ([23b32d1](https://github.com/betagouv/service-national-universel/commit/23b32d16ea42ecf60b5c0d2301e3e53c181ce6dc))
- **admin:** referent-can-change-meeting-point ([#1532](https://github.com/betagouv/service-national-universel/issues/1532)) ([7a45b3b](https://github.com/betagouv/service-national-universel/commit/7a45b3bbcf011fb9456f50517131390c81f3c4c6))

# [1.78.0](https://github.com/betagouv/service-national-universel/compare/v1.77.2...v1.78.0) (2022-05-02)

### Bug Fixes

- invalid date for session ([8a4d9a6](https://github.com/betagouv/service-national-universel/commit/8a4d9a6517d2e70ab70acb3a11ce831a904d2a86))

### Features

- **admin:** dashboard status center + front center ([#1528](https://github.com/betagouv/service-national-universel/issues/1528)) ([1af6fc4](https://github.com/betagouv/service-national-universel/commit/1af6fc44575ae736f73578568886958529c652d5))

## [1.77.2](https://github.com/betagouv/service-national-universel/compare/v1.77.1...v1.77.2) (2022-04-30)

### Bug Fixes

- add limit date inscription juillet ([eaf8939](https://github.com/betagouv/service-national-universel/commit/eaf89397a46a05163d3fe8e0c627b87db0cf59a0))
- auto closed dimanche soir ([f922aa5](https://github.com/betagouv/service-national-universel/commit/f922aa530503ad71c48d8642bc3ddfd7a6ac8742))
- fermeture inscription dynamiques - 2 etapes ([6c851bd](https://github.com/betagouv/service-national-universel/commit/6c851bd693e3ce0351dd4da4b9f354856b66ddd7))
- update home closed ([fb58d01](https://github.com/betagouv/service-national-universel/commit/fb58d01a665dc82f283f3794bc935bd957006efd))

## [1.77.1](https://github.com/betagouv/service-national-universel/compare/v1.77.0...v1.77.1) (2022-04-29)

### Bug Fixes

- **admin:** Ajout erreur formulaire centre ([#1525](https://github.com/betagouv/service-national-universel/issues/1525)) ([09bb92f](https://github.com/betagouv/service-national-universel/commit/09bb92f4dffdfc4ed67be461ba85151e24936517))
- **admin:** head-center bug in user list ([e09a67a](https://github.com/betagouv/service-national-universel/commit/e09a67a6c07da24cc8e2a7a594d420be4f1c913a))
- **api:** check authorization everywhere ([#1503](https://github.com/betagouv/service-national-universel/issues/1503)) ([859acbe](https://github.com/betagouv/service-national-universel/commit/859acbe355b4bc01cf252bae529c9de30768fc9c))
- **api:** clean outdated mission status blacklist ([#1522](https://github.com/betagouv/service-national-universel/issues/1522)) ([ac3a52f](https://github.com/betagouv/service-national-universel/commit/ac3a52f48c37837edcab8b941172ba24e9d1b740))
- **api:** remove dead ([#1517](https://github.com/betagouv/service-national-universel/issues/1517)) ([f25a86c](https://github.com/betagouv/service-national-universel/commit/f25a86c3b999bcfc51a80762050cee4b8547f584))
- **app:** goal inscription modal ([#1527](https://github.com/betagouv/service-national-universel/issues/1527)) ([a25831a](https://github.com/betagouv/service-national-universel/commit/a25831a88890e07db41ae739e78c92a563d7d4ba))
- ajout décimal taux de remplissage ([8d5108b](https://github.com/betagouv/service-national-universel/commit/8d5108bb32c3908a4fac25fa77622afe75f5f8fa))
- blacklist historic fields ([c951cc2](https://github.com/betagouv/service-national-universel/commit/c951cc23be52797342fb1aab966faf91dd11e5af))

# [1.77.0](https://github.com/betagouv/service-national-universel/compare/v1.76.0...v1.77.0) (2022-04-28)

### Bug Fixes

- **app,admin:** reset password input on wrong login ([86af87b](https://github.com/betagouv/service-national-universel/commit/86af87b185d83e2e8ec92d3774b562c82d28429a))
- **security:** update phase3 via -id only for login user (referent) ([c3903c6](https://github.com/betagouv/service-national-universel/commit/c3903c6dae3220e5d245ff3c289b0108259352cf))

### Features

- **admin:** display cohortChangeReason in panel ([e0b87c7](https://github.com/betagouv/service-national-universel/commit/e0b87c77efa1fb84618178962bcababc1e6e51d1))
- **admin:** Statut et Export des statuts ([#1513](https://github.com/betagouv/service-national-universel/issues/1513)) ([10de599](https://github.com/betagouv/service-national-universel/commit/10de599ca3f088ee21581f4f5e2ae9bbd0917ee5))
- **api:** model cohesionCenter ([#1514](https://github.com/betagouv/service-national-universel/issues/1514)) ([9390a4f](https://github.com/betagouv/service-national-universel/commit/9390a4fe4ebee3eacfe8b83a89ac7e2c139280cc))
- **support:** open support to referent ([#1509](https://github.com/betagouv/service-national-universel/issues/1509)) ([7f9981b](https://github.com/betagouv/service-national-universel/commit/7f9981bf83bf9473f08d984f15ce2dc314d2c0cb))

# [1.76.0](https://github.com/betagouv/service-national-universel/compare/v1.75.0...v1.76.0) (2022-04-26)

### Bug Fixes

- close inscription access juin 2022 ([150d0b1](https://github.com/betagouv/service-national-universel/commit/150d0b110adf7c7b6beaa5c1dbc7c6936342dbd0))
- **admin:** Filtres volontaire : Champs “Non Renseigné” [#1512](https://github.com/betagouv/service-national-universel/issues/1512) ([3790085](https://github.com/betagouv/service-national-universel/commit/3790085136f74dd2ef5635fb0454b4346abdc424))
- rules deleteReferent ([aec8bea](https://github.com/betagouv/service-national-universel/commit/aec8beacc7602a4effdacc1c4ca940c4e903bbd3))

### Features

- **admit:** Ajout statut session ([#1496](https://github.com/betagouv/service-national-universel/issues/1496)) ([fe645bd](https://github.com/betagouv/service-national-universel/commit/fe645bd811b6ec7927a389abf8c001adc23d57c5))
- **api:** limit login attempts ([#1506](https://github.com/betagouv/service-national-universel/issues/1506)) ([f0a7131](https://github.com/betagouv/service-national-universel/commit/f0a7131081cb9af3148025a4ef533af28d61b654))

# [1.75.0](https://github.com/betagouv/service-national-universel/compare/v1.74.0...v1.75.0) (2022-04-25)

### Bug Fixes

- **admin:** withoutChangingRole updateReferent ([ec103d6](https://github.com/betagouv/service-national-universel/commit/ec103d6a1c25e98482de031759ba2d7ac199519b))
- **api:** remove error detail on 400 error ([#1497](https://github.com/betagouv/service-national-universel/issues/1497)) ([b1fda56](https://github.com/betagouv/service-national-universel/commit/b1fda5630a77147bc20bdf0231cffa886fbf48e7))
- **api:** remove error detail on 500 error ([#1500](https://github.com/betagouv/service-national-universel/issues/1500)) ([208181e](https://github.com/betagouv/service-national-universel/commit/208181ef29027ae7366c637af370901d1518c815))
- **app:** show juin is closed ([b1752fb](https://github.com/betagouv/service-national-universel/commit/b1752fb6d07bc0fdc098069c411e36a97b31a432))

### Features

- **admin:** filter historic element ([#1499](https://github.com/betagouv/service-national-universel/issues/1499)) ([289226d](https://github.com/betagouv/service-national-universel/commit/289226dc2654d8289bcb4bcdde3fe9209796bd89))

# [1.74.0](https://github.com/betagouv/service-national-universel/compare/v1.73.0...v1.74.0) (2022-04-22)

### Features

- Référents régionaux : Module de gestion d’équipes ([#1488](https://github.com/betagouv/service-national-universel/issues/1488)) ([437e9c7](https://github.com/betagouv/service-national-universel/commit/437e9c793bbb67ff42d2d9f7a98ad49c98e68edd))

# [1.73.0](https://github.com/betagouv/service-national-universel/compare/v1.72.2...v1.73.0) (2022-04-21)

### Bug Fixes

- Modifier les articles mis en avant ([#1492](https://github.com/betagouv/service-national-universel/issues/1492)) ([e0a1a7c](https://github.com/betagouv/service-national-universel/commit/e0a1a7c7bf3556d5b4ee34473ad4dbbc1042f709))
- **admin:** dashboard structures ([27fd0c5](https://github.com/betagouv/service-national-universel/commit/27fd0c5ca1f694980fe66a0415b942bef5f937c9))
- **api:** verify file magic numbers + mime type for uploads ([#1490](https://github.com/betagouv/service-national-universel/issues/1490)) ([c241b7c](https://github.com/betagouv/service-national-universel/commit/c241b7c0e2593b718ac98c0acb47adb40938632e))
- message obligatoire signup structure ([02b5ce0](https://github.com/betagouv/service-national-universel/commit/02b5ce05745b7d645f6aba653bb7aec259bd75a0))
- **api:** structure can not be created without being authenticated ([#1489](https://github.com/betagouv/service-national-universel/issues/1489)) ([c3e5c69](https://github.com/betagouv/service-national-universel/commit/c3e5c693d8c2ffcc8e3b2c458d1ac33dca0ed0e3))
- **security:** missing noreferrer ([4a87075](https://github.com/betagouv/service-national-universel/commit/4a87075d75c109b562efe402eacddce732753949))
- **security:** protect URL in href ([#1455](https://github.com/betagouv/service-national-universel/issues/1455)) ([6aa0b64](https://github.com/betagouv/service-national-universel/commit/6aa0b642cb709ddd2fe62af3ee56847f6143e264))

### Features

- **admin:** Possibilité de modifier Phase 3 ([#1484](https://github.com/betagouv/service-national-universel/issues/1484)) ([b355de6](https://github.com/betagouv/service-national-universel/commit/b355de667a015ba94128d85137e99f114662e656))
- **admin:** structure statuses ([#1443](https://github.com/betagouv/service-national-universel/issues/1443)) ([4f29346](https://github.com/betagouv/service-national-universel/commit/4f293467ee3da25d94405f29cb496400e5f5b171))

## [1.72.2](https://github.com/betagouv/service-national-universel/compare/v1.72.1...v1.72.2) (2022-04-20)

### Bug Fixes

- add knowledge base public ([#1486](https://github.com/betagouv/service-national-universel/issues/1486)) ([64deb32](https://github.com/betagouv/service-national-universel/commit/64deb32f9ff1cfcb37e20f924f4ec8ce20375f7d))
- unauthorized on accept cgu ([ec1e2cb](https://github.com/betagouv/service-national-universel/commit/ec1e2cb1956b7c9e170a8ffed51079d012ecaabc))

## [1.72.1](https://github.com/betagouv/service-national-universel/compare/v1.72.0...v1.72.1) (2022-04-19)

### Bug Fixes

- **admin:** article pour les référents ([aebab79](https://github.com/betagouv/service-national-universel/commit/aebab795b36cb4851f06514797041c66f8958258))
- **admin:** url articles besoin d'aide ([ef59473](https://github.com/betagouv/service-national-universel/commit/ef59473a9c2f4a574459706124c3f4eeedc1693a))
- **app:** wording public besoin d'aide ([87dfba8](https://github.com/betagouv/service-national-universel/commit/87dfba81792ec72ea41db629ef0042a4b384043b))

# [1.72.0](https://github.com/betagouv/service-national-universel/compare/v1.71.0...v1.72.0) (2022-04-14)

### Bug Fixes

- **admin:** add profile link & departmentReferentPhase2Link to SNUpport ([#1477](https://github.com/betagouv/service-national-universel/issues/1477)) ([de1c858](https://github.com/betagouv/service-national-universel/commit/de1c858380e9d14483fb4e2a59d73a1a816f0fe4))

### Features

- **admin,app:** cohorte `à venir` ([#1450](https://github.com/betagouv/service-national-universel/issues/1450)) ([57608e1](https://github.com/betagouv/service-national-universel/commit/57608e1ffb77e84a00f119b41d1c805b1f3154e4))

# [1.71.0](https://github.com/betagouv/service-national-universel/compare/v1.70.0...v1.71.0) (2022-04-13)

### Bug Fixes

- **app:** Information téléversement du règlement intérieur ([#1475](https://github.com/betagouv/service-national-universel/issues/1475)) ([4cee56f](https://github.com/betagouv/service-national-universel/commit/4cee56fd6b1610a362ed5b4334a80ecefc543634))

### Features

- export jeunes scolarisés dans un département / région ([#1472](https://github.com/betagouv/service-national-universel/issues/1472)) ([428eecd](https://github.com/betagouv/service-national-universel/commit/428eecd6ddc9e3a0f566fd1f1c9877192650d262))

# [1.70.0](https://github.com/betagouv/service-national-universel/compare/v1.69.0...v1.70.0) (2022-04-12)

### Bug Fixes

- **admin:** open form to all visitor to new support ([#1471](https://github.com/betagouv/service-national-universel/issues/1471)) ([5db6320](https://github.com/betagouv/service-national-universel/commit/5db6320cb5e213cd247c884c0bc80e679cc4aab4))
- Pièces justificatives phase 1 ([#1454](https://github.com/betagouv/service-national-universel/issues/1454)) ([233fe76](https://github.com/betagouv/service-national-universel/commit/233fe76fc9274e380efb874951a12f4d179a7055))
- **admin:** historic JVA structure/mission ([#1469](https://github.com/betagouv/service-national-universel/issues/1469)) ([8e74ffa](https://github.com/betagouv/service-national-universel/commit/8e74ffa2154e05ee81321042686edea19388f7fa))
- **api:** MIG JVA SNU add check JVA structure to endpoint ([#1468](https://github.com/betagouv/service-national-universel/issues/1468)) ([aefd170](https://github.com/betagouv/service-national-universel/commit/aefd1708ab28833785a059506bb6e28768d185e6))

### Features

- **admin,api:** historic contract ([#1464](https://github.com/betagouv/service-national-universel/issues/1464)) ([31a89f0](https://github.com/betagouv/service-national-universel/commit/31a89f09170fce435f883a22c0af296a0c9209d5))

# [1.69.0](https://github.com/betagouv/service-national-universel/compare/v1.68.1...v1.69.0) (2022-04-11)

### Bug Fixes

- **admin:** MIG JVA / SNU : bloquer la possibilité pour les référents de modifier la fiche d’une mission JVA ([#1466](https://github.com/betagouv/service-national-universel/issues/1466)) ([286cc6f](https://github.com/betagouv/service-national-universel/commit/286cc6f1aa8c1c5a5a2000170aad0d45009bc3dc))
- **admin:** panel inscription supprimée ([#1463](https://github.com/betagouv/service-national-universel/issues/1463)) ([9864b54](https://github.com/betagouv/service-national-universel/commit/9864b544639eadbad7f829b491be3411510ca069))
- **admin:** retour a la ligne et retour chariot ([#1467](https://github.com/betagouv/service-national-universel/issues/1467)) ([8da5f88](https://github.com/betagouv/service-national-universel/commit/8da5f88167cad8b9fd20e460a92099e798079fc8))
- **app:** home screen abandon inscription ([#1458](https://github.com/betagouv/service-national-universel/issues/1458)) ([fced7fe](https://github.com/betagouv/service-national-universel/commit/fced7fe0ae957896bbb1d0bcf6a81999f0a96bc2))

### Features

- add original cohort view ([#1453](https://github.com/betagouv/service-national-universel/issues/1453)) ([11bdc35](https://github.com/betagouv/service-national-universel/commit/11bdc3541d41235a909b3ef5934e9d9290bcadbc))

## [1.68.1](https://github.com/betagouv/service-national-universel/compare/v1.68.0...v1.68.1) (2022-04-08)

### Bug Fixes

- **admin:** remove filter `status` in structures list ([ff292a9](https://github.com/betagouv/service-national-universel/commit/ff292a911aef6e1767d75acfe460d6539ec9bc89))
- add `Non renseigné` niveau scolaire ([703785a](https://github.com/betagouv/service-national-universel/commit/703785a77f3eb62f1a7a5e6574d2acbea4472465))
- remove default value `""` ([#1446](https://github.com/betagouv/service-national-universel/issues/1446)) ([4fdd8d7](https://github.com/betagouv/service-national-universel/commit/4fdd8d7907ee2ab76546793408dd6da3fa161dd5))
- step profil footer ([dbab023](https://github.com/betagouv/service-national-universel/commit/dbab023fd9aa327ee5cdff11d59bd944cd5cc539))
- **admin:** loader logs email ([73d37dd](https://github.com/betagouv/service-national-universel/commit/73d37dd30d0a655ec36041ee6ed754e7e503e9cc))
- **admin:** toggle button log email ([87f9aa4](https://github.com/betagouv/service-national-universel/commit/87f9aa48b3dfea812b60084eabfad108fba2e4ac))
- **app:** display button `J'ai terminé la correction de mon dossier` ([be841f9](https://github.com/betagouv/service-national-universel/commit/be841f94a8923ab8fd9587f6bc012976f3d9d2f5))

# [1.68.0](https://github.com/betagouv/service-national-universel/compare/v1.67.0...v1.68.0) (2022-04-07)

### Bug Fixes

- reinit-fields-change-cohort ([ec7169a](https://github.com/betagouv/service-national-universel/commit/ec7169a94d388252b274df7d48be923cbaa5a442))
- **app:** remove cookies ([085f4f6](https://github.com/betagouv/service-national-universel/commit/085f4f684aa45eef5b2283fe1c6c504486878ece))

### Features

- **admin:** open sendinblue referents ([3df19ef](https://github.com/betagouv/service-national-universel/commit/3df19ef7a3de431a926921959fb916615251e66e))

# [1.67.0](https://github.com/betagouv/service-national-universel/compare/v1.66.0...v1.67.0) (2022-04-06)

### Bug Fixes

- filtre volontaire/inscription : allergies/intolérance ([#1441](https://github.com/betagouv/service-national-universel/issues/1441)) ([5974bc6](https://github.com/betagouv/service-national-universel/commit/5974bc6202b4597470165637ed40f65b9c935e88))

### Features

- création d'un composant générique pour les erreurs ([8e0463a](https://github.com/betagouv/service-national-universel/commit/8e0463adac12a179fb86c2872743c0610536d480))

# [1.66.0](https://github.com/betagouv/service-national-universel/compare/v1.65.0...v1.66.0) (2022-04-05)

### Bug Fixes

- **admin:** translate application status ([0ed9d70](https://github.com/betagouv/service-national-universel/commit/0ed9d70fd641478b8705cc21b8af00795011f55c))
- MIG SNU JVA endDate + maj status ([8d41be8](https://github.com/betagouv/service-national-universel/commit/8d41be88022b5ac301ea0ac0bf5ebd1ac9be9f19))
- MIG SNU JVA remove update status ([fe13534](https://github.com/betagouv/service-national-universel/commit/fe135347d0fcfc8577f95de543743e8e0ff9f649))
- **api:** delete console log jeVeuxAiderDaily ([39ad2ff](https://github.com/betagouv/service-national-universel/commit/39ad2ff3566f1e6ccfa4624844fad8ae447a357a))

### Features

- ajout représentants légaux en cc ([#1419](https://github.com/betagouv/service-national-universel/issues/1419)) ([335134d](https://github.com/betagouv/service-national-universel/commit/335134d307ab5db30b37befcd8f5b3fd269e4e21))

# [1.65.0](https://github.com/betagouv/service-national-universel/compare/v1.64.0...v1.65.0) (2022-04-04)

### Bug Fixes

- **admin:** telephone format ([b7a83bd](https://github.com/betagouv/service-national-universel/commit/b7a83bda6a8b341725f130b296cc895e3c087107))
- **app:** inscription consentement error ([#1432](https://github.com/betagouv/service-national-universel/issues/1432)) ([851d532](https://github.com/betagouv/service-national-universel/commit/851d532fa79330744010fac6712e743233b43868))

### Features

- **admin:** delete young button in edit ([#1428](https://github.com/betagouv/service-national-universel/issues/1428)) ([b947190](https://github.com/betagouv/service-national-universel/commit/b947190e773ae8caec100e267f4d3e9a303934f9))
- **api:** droit referent delete youngs ([3ed4ebf](https://github.com/betagouv/service-national-universel/commit/3ed4ebfab02bdb309ff736820fe5a8d73561dbb3))

# [1.64.0](https://github.com/betagouv/service-national-universel/compare/v1.63.1...v1.64.0) (2022-04-01)

### Bug Fixes

- `schoolLevel` is not `grade` + date limit change session ([#1421](https://github.com/betagouv/service-national-universel/issues/1421)) ([c82d2eb](https://github.com/betagouv/service-national-universel/commit/c82d2eb91e54d4dc2a0eba06bfbcd305520d398c))
- FILTRES - Ajouter texte aide ([63e9b2f](https://github.com/betagouv/service-national-universel/commit/63e9b2f6234dbecb634d160feeaa264662f7ea34))
- modal déménagement ([#1423](https://github.com/betagouv/service-national-universel/issues/1423)) ([1ef1043](https://github.com/betagouv/service-national-universel/commit/1ef10434bc3b7bb0fd652ea9fc9f7b88d1bf958d))

### Features

- Amélioration navigation d’une page à une autre ([5bce2e4](https://github.com/betagouv/service-national-universel/commit/5bce2e40bc89366bbe45a423294aa452656b48bc))

## [1.63.1](https://github.com/betagouv/service-national-universel/compare/v1.63.0...v1.63.1) (2022-03-31)

### Bug Fixes

- help text upload docs ([9662dd9](https://github.com/betagouv/service-national-universel/commit/9662dd93379b6785bcbca6174edf9b9fef5d7af5))
- page blanche - création centre ([cb2578a](https://github.com/betagouv/service-national-universel/commit/cb2578a04ec908bee3f5baf929158fa14bdfe700))
- status mission on duplicate ([903b8e9](https://github.com/betagouv/service-national-universel/commit/903b8e9a55e15f233eff7da082c067a0f547888b))

# [1.63.0](https://github.com/betagouv/service-national-universel/compare/v1.62.0...v1.63.0) (2022-03-30)

### Bug Fixes

- **app:** links BDC ([9b9fd4c](https://github.com/betagouv/service-national-universel/commit/9b9fd4c85fc9dbd1fe269b65ce0ec7807f0aa82a))
- add `Saint-Barthélemy` in `departmentList` ([f549713](https://github.com/betagouv/service-national-universel/commit/f5497136991e09c3b81ec323306a020cd237114d))
- ajout de session et nombre de place ([67edc80](https://github.com/betagouv/service-national-universel/commit/67edc80e57ee5683bf3bcc840f9d47a37057a621))
- export mission translate ([3c1093e](https://github.com/betagouv/service-national-universel/commit/3c1093eb59cdee19b422715ef0a4d3be6e741c06))
- remove default filter "Février 2022" ([6e1085e](https://github.com/betagouv/service-national-universel/commit/6e1085e8062bf518cbec7954c4187986a6c950c3))
- Tableau de bord mission export ([#1403](https://github.com/betagouv/service-national-universel/issues/1403)) ([d5e34af](https://github.com/betagouv/service-national-universel/commit/d5e34afd2f0294fe0a4dfd27b8fce0b17650af08))

### Features

- **admin:** head center can open a zammad ticket ([#1407](https://github.com/betagouv/service-national-universel/issues/1407)) ([13a4758](https://github.com/betagouv/service-national-universel/commit/13a4758bb0e1ecf421641e1afb2f91e2b25b368e))
- **admin:** schooled young referent region ([#1402](https://github.com/betagouv/service-national-universel/issues/1402)) ([2bc9fc4](https://github.com/betagouv/service-national-universel/commit/2bc9fc475be6d7542812a330a7628070cb3563e6))
- **api:** new kb connection ([#1404](https://github.com/betagouv/service-national-universel/issues/1404)) ([2293b71](https://github.com/betagouv/service-national-universel/commit/2293b71ff1fff3318a36a8fe5dd42b66e3e9861a))

# [1.62.0](https://github.com/betagouv/service-national-universel/compare/v1.61.2...v1.62.0) (2022-03-29)

### Bug Fixes

- `tout sélectionner` filtre places mission ([b5c97f5](https://github.com/betagouv/service-national-universel/commit/b5c97f5188506295564b5be796774f3d6afe4b40))
- `youngCanChangeSession` array ([7efabf4](https://github.com/betagouv/service-national-universel/commit/7efabf4fdee8e9be68036a493a433950f77c221b))
- nom de la stucture dans panel ([#1400](https://github.com/betagouv/service-national-universel/issues/1400)) ([895cc2f](https://github.com/betagouv/service-national-universel/commit/895cc2f75539fde54cbfeecc3388dd53d33c3fdb))
- ouverture du rapport d'inscription aux référents ([e901422](https://github.com/betagouv/service-national-universel/commit/e901422a4e3bec5828c7371752695515f2450bee))

### Features

- MIG SNU via JVA ([#1381](https://github.com/betagouv/service-national-universel/issues/1381)) ([01f69e5](https://github.com/betagouv/service-national-universel/commit/01f69e597a88359c886c16213300c4d9b1e7fcab))
- mutualiser les droits de changement de séjour en fonction d'un profil ([#1365](https://github.com/betagouv/service-national-universel/issues/1365)) ([677a3a4](https://github.com/betagouv/service-national-universel/commit/677a3a4e858f6cf30f683d68260fc152df400253))
- Tableau de bord mission filtre préférence de mission ([0e11560](https://github.com/betagouv/service-national-universel/commit/0e11560043888557601a67c82b7cf36239e3ca0f))

## [1.61.2](https://github.com/betagouv/service-national-universel/compare/v1.61.1...v1.61.2) (2022-03-24)

### Bug Fixes

- filtre mission comportement intervalle ([a26a7af](https://github.com/betagouv/service-national-universel/commit/a26a7af90e1e1b8c92a47f3117e3ce593f1a5fb8))

## [1.61.1](https://github.com/betagouv/service-national-universel/compare/v1.61.0...v1.61.1) (2022-03-22)

### Bug Fixes

- **api:** upload file with av ([69a67fb](https://github.com/betagouv/service-national-universel/commit/69a67fbd4ac91730f03c6b29d08da2d866fe715a))

# [1.61.0](https://github.com/betagouv/service-national-universel/compare/v1.60.0...v1.61.0) (2022-03-21)

### Features

- **api+app:** connect public form to new support ([#1373](https://github.com/betagouv/service-national-universel/issues/1373)) ([5ad9b5d](https://github.com/betagouv/service-national-universel/commit/5ad9b5d7b22b682a31c7f7610bb4841e1ccc672e))
- clamav in prod ([#1378](https://github.com/betagouv/service-national-universel/issues/1378)) ([9aa52c5](https://github.com/betagouv/service-national-universel/commit/9aa52c514868aed20d7a2e6f74927c5023af3d23))
- **mails:** activate 171 ([#1377](https://github.com/betagouv/service-national-universel/issues/1377)) ([6d443d2](https://github.com/betagouv/service-national-universel/commit/6d443d29b3f65b5d4a1015026c2e0ed9ff89a6f5))

# [1.60.0](https://github.com/betagouv/service-national-universel/compare/v1.59.0...v1.60.0) (2022-03-18)

### Features

- Tableau de bord mission filtre date ([#1354](https://github.com/betagouv/service-national-universel/issues/1354)) ([8e47215](https://github.com/betagouv/service-national-universel/commit/8e47215083a3f065d7921121172ec3c0ef8a12ed))
- **api+app:** delete files when refused ([#1358](https://github.com/betagouv/service-national-universel/issues/1358)) ([8fa09f7](https://github.com/betagouv/service-national-universel/commit/8fa09f79c9ec9e3b9b383ddf369b8eb9ae6ebf1f))
- **app:** add abandoned status ([#1340](https://github.com/betagouv/service-national-universel/issues/1340)) ([3156b19](https://github.com/betagouv/service-national-universel/commit/3156b19801c7cd4c2e733bf241f5603bf5dbc9ea))

# [1.59.0](https://github.com/betagouv/service-national-universel/compare/v1.58.1...v1.59.0) (2022-03-17)

### Bug Fixes

- remove option visitor for referent_department ([e0459cc](https://github.com/betagouv/service-national-universel/commit/e0459ccffee6d46959fea9c467e4558c498f68cc))
- **api:** up clamscan ([71e21b2](https://github.com/betagouv/service-national-universel/commit/71e21b2765ebac55cfa2bcaa35c91393d52b70f4))

### Features

- **admin:** proposer une mission - ouverture aux référents ([#1374](https://github.com/betagouv/service-national-universel/issues/1374)) ([6ce4852](https://github.com/betagouv/service-national-universel/commit/6ce485294964a1a18f4dabdd856e12901454575e))
- **api:** test clamscan antivirus ([#1372](https://github.com/betagouv/service-national-universel/issues/1372)) ([b20e762](https://github.com/betagouv/service-national-universel/commit/b20e7627760520db7c3f82bc52c15fd0e693277b))

## [1.58.1](https://github.com/betagouv/service-national-universel/compare/v1.58.0...v1.58.1) (2022-03-16)

### Bug Fixes

- **admin:** en cours dashboard referent ([68139a4](https://github.com/betagouv/service-national-universel/commit/68139a4416a6cb70f8414f34c106cd895fbe6c06))
- **api:** application pending template ([#1370](https://github.com/betagouv/service-national-universel/issues/1370)) ([bf21f50](https://github.com/betagouv/service-national-universel/commit/bf21f505909b350c2c69c7696aafa2c7d7c90f09))

# [1.58.0](https://github.com/betagouv/service-national-universel/compare/v1.57.0...v1.58.0) (2022-03-15)

### Bug Fixes

- <div> cannot appear as a descendant of <p> ([#1362](https://github.com/betagouv/service-national-universel/issues/1362)) ([26a748e](https://github.com/betagouv/service-national-universel/commit/26a748ee3c22133870bd4656d6e10e08a1318b0c))
- schooledId in inscription ([9e08bb9](https://github.com/betagouv/service-national-universel/commit/9e08bb94ff6f69fa4dcc4352a28f53c8edee8b54))

### Features

- ouvrir les en cours aux référents ([8c55bcf](https://github.com/betagouv/service-national-universel/commit/8c55bcfb357d83a8a3672f5a3f80d87581efcb26))

# [1.57.0](https://github.com/betagouv/service-national-universel/compare/v1.56.0...v1.57.0) (2022-03-14)

### Bug Fixes

- **admin:** tailwind - admin profile ([#1351](https://github.com/betagouv/service-national-universel/issues/1351)) ([72dacaf](https://github.com/betagouv/service-national-universel/commit/72dacafa9269d353e8cfa916d746eaf4091af0cf))
- **api:** default status structure ([52b7276](https://github.com/betagouv/service-national-universel/commit/52b72769f8283a09361e1b52c8109fd36af64efe))
- **api:** fix email eslint notices ([b164647](https://github.com/betagouv/service-national-universel/commit/b164647b32fb10de899f8052cd080911100f7a60))

### Features

- Tableau de bord mission encart ([#1350](https://github.com/betagouv/service-national-universel/issues/1350)) ([c8d945a](https://github.com/betagouv/service-national-universel/commit/c8d945a6762362972bd4f8a38bddd7f8456cd4d7))
- **app:** pm documents status ([#1345](https://github.com/betagouv/service-national-universel/issues/1345)) ([05955e8](https://github.com/betagouv/service-national-universel/commit/05955e874bb6676046b22ecb38299438f1d34f0c))

# [1.56.0](https://github.com/betagouv/service-national-universel/compare/v1.55.0...v1.56.0) (2022-03-10)

### Bug Fixes

- **api:** template changement de département ([#1281](https://github.com/betagouv/service-national-universel/issues/1281)) ([d4be6b2](https://github.com/betagouv/service-national-universel/commit/d4be6b2bbe5a7b1a20530dd9d52d168f8a95d6f8))
- **api,admin:** soft delete - clean patches ([#1304](https://github.com/betagouv/service-national-universel/issues/1304)) ([3091f3f](https://github.com/betagouv/service-national-universel/commit/3091f3f485dccec2fca296dc4f0ad09eed8ad65c))
- **app:** required files PM ([#1330](https://github.com/betagouv/service-national-universel/issues/1330)) ([2181e5d](https://github.com/betagouv/service-national-universel/commit/2181e5de3f3fd1bda194a4bf94c41893a0f22809))

### Features

- **api:** visibilité sur les visiteurs par réf. régional ([7a6bcb6](https://github.com/betagouv/service-national-universel/commit/7a6bcb60d690356bd44033abb61c296f86c2e3ac))

# [1.55.0](https://github.com/betagouv/service-national-universel/compare/v1.54.0...v1.55.0) (2022-03-09)

### Bug Fixes

- **admin:** filtres dashboard volontaires ([7cd2cfe](https://github.com/betagouv/service-national-universel/commit/7cd2cfe0259d19af14efeea20136c5a11b7c202d))
- **api:** ratio goal inscription ([2a4f40a](https://github.com/betagouv/service-national-universel/commit/2a4f40afaa0afb10113033099a6a7e31e36b71e5))

### Features

- jva endpoint v1 ([#1341](https://github.com/betagouv/service-national-universel/issues/1341)) ([a642f23](https://github.com/betagouv/service-national-universel/commit/a642f232d4f567b694bb7749d55931f886fab3a3))

# [1.54.0](https://github.com/betagouv/service-national-universel/compare/v1.53.1...v1.54.0) (2022-03-08)

### Bug Fixes

- **admin:** header - drawer position ([#1329](https://github.com/betagouv/service-national-universel/issues/1329)) ([7880ce8](https://github.com/betagouv/service-national-universel/commit/7880ce8c3ed5de19cbe2ab8b8fda9cf795862792))
- **app:** Update header.js signin ([8878caa](https://github.com/betagouv/service-national-universel/commit/8878caaf4d2878c738134f99b37afc81778af731))

### Features

- **app:** tailwind - migrate auth ([#1321](https://github.com/betagouv/service-national-universel/issues/1321)) ([558661c](https://github.com/betagouv/service-national-universel/commit/558661c4b41f9ef0e544b6d2cb8e1a1808025a56))
- **app:** tailwind - migrate landing page ([#1322](https://github.com/betagouv/service-national-universel/issues/1322)) ([980445d](https://github.com/betagouv/service-national-universel/commit/980445d24006e4c8294717b89fb35e9c6b6d9009))

## [1.53.1](https://github.com/betagouv/service-national-universel/compare/v1.53.0...v1.53.1) (2022-03-07)

### Bug Fixes

- **admin:** add status tab volontaire ([#1317](https://github.com/betagouv/service-national-universel/issues/1317)) ([69cdaa5](https://github.com/betagouv/service-national-universel/commit/69cdaa544066695f188f380a804dd87b8995fbb0))
- open history to referent ([cdcb37d](https://github.com/betagouv/service-national-universel/commit/cdcb37da4b3844777a4857f5a9e599532225ffed))
- **app:** accès aux certificats depuis phase1 ([6b73426](https://github.com/betagouv/service-national-universel/commit/6b73426840cd4bb1f0c9311250cbb7c434e1b4fc))

# [1.53.0](https://github.com/betagouv/service-national-universel/compare/v1.52.0...v1.53.0) (2022-03-04)

### Bug Fixes

- error message ([ee506f3](https://github.com/betagouv/service-national-universel/commit/ee506f30f49f393a3dc607efe61f72f798637782))
- view deleted in inscription tab ([57efdd0](https://github.com/betagouv/service-national-universel/commit/57efdd04e07c840f19157460e81fef77cf47f849))
- **admin:** realigner création de nouvelle mission depuis onglet phase2 jeune ([#1316](https://github.com/betagouv/service-national-universel/issues/1316)) ([336002f](https://github.com/betagouv/service-national-universel/commit/336002f1d8432f6cc8e8fe030bb60f3957847c8a))
- **api/crons:** application pending ([#1280](https://github.com/betagouv/service-national-universel/issues/1280)) ([241be50](https://github.com/betagouv/service-national-universel/commit/241be50acc4f86b0568c02d6565300c6139a53bd))
- open only for fev 2022 ([507b76b](https://github.com/betagouv/service-national-universel/commit/507b76b036040a524ee53465bf4215382ef25b53))
- open to every cohort ([f3d4225](https://github.com/betagouv/service-national-universel/commit/f3d422542fad6929447f77e1e58c17e045a754df))

### Features

- **api,admin:** soft delete + anonymisation ([#1296](https://github.com/betagouv/service-national-universel/issues/1296)) ([1b87836](https://github.com/betagouv/service-national-universel/commit/1b8783607067013b6873ad8d508b4375325c8b13))
- **app:** volontaire - changement de séjour ([#1268](https://github.com/betagouv/service-national-universel/issues/1268)) ([5f3a6ad](https://github.com/betagouv/service-national-universel/commit/5f3a6ade522988aa6489068cf4c109ffc15b4a8e))

# [1.52.0](https://github.com/betagouv/service-national-universel/compare/v1.51.0...v1.52.0) (2022-03-03)

### Bug Fixes

- **admin:** filtre onglet utilisateur/mission/structure ([#1315](https://github.com/betagouv/service-national-universel/issues/1315)) ([f029ad5](https://github.com/betagouv/service-national-universel/commit/f029ad5ba0b0e5696fb532b25a019a765f69bb7e))
- filter inscription ([c8f3a93](https://github.com/betagouv/service-national-universel/commit/c8f3a930601483bcdead8856c517fc0acc8fcb95))
- list user ([677b912](https://github.com/betagouv/service-national-universel/commit/677b91286ea6a382c8a4858d56eb17fdbc6796c8))
- qw list user ([d707e95](https://github.com/betagouv/service-national-universel/commit/d707e95a8fc8cd7aecfa67672a8ed195eb4ae3e6))
- wording waiting-affectation ([db74878](https://github.com/betagouv/service-national-universel/commit/db74878ac5e5aed70c1428659732cefc952e0110))

### Features

- **admin:** filter and analytics with mainDomain ([#1303](https://github.com/betagouv/service-national-universel/issues/1303)) ([3894df6](https://github.com/betagouv/service-national-universel/commit/3894df61b2bd416a2720229063bb18ecb040ee0b))
- **admin:** pouvoir réinitialiser les filtres ([#1314](https://github.com/betagouv/service-national-universel/issues/1314)) ([fbb02ef](https://github.com/betagouv/service-national-universel/commit/fbb02efddb81511ec7c36a58068ab3de5a3eb8c2))
- **api+admin:** connecting to SNUpport ([#1293](https://github.com/betagouv/service-national-universel/issues/1293)) ([b84164c](https://github.com/betagouv/service-national-universel/commit/b84164ccd970eaec9fce6a21f336ccee58950626))

# [1.51.0](https://github.com/betagouv/service-national-universel/compare/v1.50.3...v1.51.0) (2022-03-02)

### Bug Fixes

- filter youngs ([8687e01](https://github.com/betagouv/service-national-universel/commit/8687e0161de1be5a814e318ebdbed696d8eabe52))
- filters inscriptions ([d76b021](https://github.com/betagouv/service-national-universel/commit/d76b021940f2ae2799b69f871c6412195dffba1a))
- **admin:** dynamic title document ([8348a93](https://github.com/betagouv/service-national-universel/commit/8348a93cc8c25cd9dc06fdda7c3c8c9fe7502205))

### Features

- **admin:** referent region can invite visitor ([#1299](https://github.com/betagouv/service-national-universel/issues/1299)) ([b4c039c](https://github.com/betagouv/service-national-universel/commit/b4c039cdd9da16d6fc4a2f4c244134f135146b8c))
- **admin,api:** Changement de cohorte/séjour ([#1246](https://github.com/betagouv/service-national-universel/issues/1246)) ([3560c50](https://github.com/betagouv/service-national-universel/commit/3560c50574f192778664f10237108db882a76c0b))

## [1.50.3](https://github.com/betagouv/service-national-universel/compare/v1.50.2...v1.50.3) (2022-03-01)

### Bug Fixes

- copy icon ([b24e516](https://github.com/betagouv/service-national-universel/commit/b24e516d59da5d8d887dc5f86646cc966d219024))

## [1.50.2](https://github.com/betagouv/service-national-universel/compare/v1.50.1...v1.50.2) (2022-02-28)

### Bug Fixes

- cross svg ([ac97b44](https://github.com/betagouv/service-national-universel/commit/ac97b4451cd8933c83eb094f76491c142ea60e30))
- **admin,app:** phase 2 dates ([ca5c6c7](https://github.com/betagouv/service-national-universel/commit/ca5c6c7194119ad0d90c0a9282f6a75b1ca1dd40))

## [1.50.1](https://github.com/betagouv/service-national-universel/compare/v1.50.0...v1.50.1) (2022-02-26)

### Bug Fixes

- create an action dropdown ([#1236](https://github.com/betagouv/service-national-universel/issues/1236)) ([a580fe1](https://github.com/betagouv/service-national-universel/commit/a580fe14ebe50e99e7f2d3f9c83a0588e9286453))

# [1.50.0](https://github.com/betagouv/service-national-universel/compare/v1.49.0...v1.50.0) (2022-02-25)

### Bug Fixes

- **api:** update only contract that linked to active application ([#1292](https://github.com/betagouv/service-national-universel/issues/1292)) ([b6fc590](https://github.com/betagouv/service-national-universel/commit/b6fc5907d280940cdc2932f689eab9b2e5932b76))

### Features

- contrat - Ajouter date et nom en dessous de valider ([#1291](https://github.com/betagouv/service-national-universel/issues/1291)) ([5aa77d0](https://github.com/betagouv/service-national-universel/commit/5aa77d04f814ddc2a53cb50f6dd918810db6dde7))

# [1.49.0](https://github.com/betagouv/service-national-universel/compare/v1.48.0...v1.49.0) (2022-02-24)

### Bug Fixes

- **app:** button apply mission ([d9e94ee](https://github.com/betagouv/service-national-universel/commit/d9e94ee4270a891c4f09dfff5eec6d654e870046))
- date in attestation ([cbc8ff6](https://github.com/betagouv/service-national-universel/commit/cbc8ff674dd600d8edf4c1360e66c0b1d8c8b1b0))
- quick win PM ([#1284](https://github.com/betagouv/service-national-universel/issues/1284)) ([6ac954d](https://github.com/betagouv/service-national-universel/commit/6ac954d8a36acc702642181cebd07e1d3af7c803))
- qwick win PM 2 ([#1285](https://github.com/betagouv/service-national-universel/issues/1285)) ([c2ad059](https://github.com/betagouv/service-national-universel/commit/c2ad05924fd992103c4c8e44705cce586ea70154))
- wording ([bb3b4e8](https://github.com/betagouv/service-national-universel/commit/bb3b4e8edf5ae0dc1a381048eb564fe3823f4d01))

### Features

- **app+admin:** remove referents tags in public form ([#1283](https://github.com/betagouv/service-national-universel/issues/1283)) ([1cc1bb4](https://github.com/betagouv/service-national-universel/commit/1cc1bb43a728cc6d9c7d820a4a5f08186150676c))

# [1.48.0](https://github.com/betagouv/service-national-universel/compare/v1.47.0...v1.48.0) (2022-02-23)

### Bug Fixes

- **api:** test young document ([00ea38b](https://github.com/betagouv/service-national-universel/commit/00ea38bc5cb10b5ad16c396ba9772373780be649))
- download attestation phase1 ([26a8029](https://github.com/betagouv/service-national-universel/commit/26a8029d4358eed171cd5166d93d95b7360e8b18))
- **admin:** add referent phase 2 contact in structure panel ([a864ce0](https://github.com/betagouv/service-national-universel/commit/a864ce0bf96dbb92c93d525b1bf359ea43460696))
- **admin:** beautify historic view ([#1277](https://github.com/betagouv/service-national-universel/issues/1277)) ([6119d9e](https://github.com/betagouv/service-national-universel/commit/6119d9ea6890a6cddfd2409c8cdce9e095d9273c))
- **api:** download attestation ([99f7510](https://github.com/betagouv/service-national-universel/commit/99f75103433caff285563c376f41997df75faa8f))

### Features

- **admin:** tailwind drawer + header ([#1274](https://github.com/betagouv/service-national-universel/issues/1274)) ([b3f19d6](https://github.com/betagouv/service-national-universel/commit/b3f19d66098b54da2bf6c34df379783941ca428b))

# [1.47.0](https://github.com/betagouv/service-national-universel/compare/v1.46.0...v1.47.0) (2022-02-22)

### Bug Fixes

- **admin:** cancel ([fb02e01](https://github.com/betagouv/service-national-universel/commit/fb02e015bcfc4e33d2f3392d94e95946d7ab3ce3))
- **admin:** list UI & card mission propose ([29de6b6](https://github.com/betagouv/service-national-universel/commit/29de6b6c6f7a7215177a300646c0362c0c0827ba))
- **admin:** search department by number ([4707ab6](https://github.com/betagouv/service-national-universel/commit/4707ab620689154436c98c3ec91bc72c892c40c7))
- **api:** validate status is forbidden ([#1258](https://github.com/betagouv/service-national-universel/issues/1258)) ([bdcb57a](https://github.com/betagouv/service-national-universel/commit/bdcb57af64ce241fff33c55fac7dbcdab9d5849a))

### Features

- redirect inscription.snu.gouv.fr 👉 moncompte.snu.gouv.fr ([#612](https://github.com/betagouv/service-national-universel/issues/612)) ([035315e](https://github.com/betagouv/service-national-universel/commit/035315e9285cb85851d5c686104977a8fca235ee)), closes [#604](https://github.com/betagouv/service-national-universel/issues/604)
- **api:** pointage presence -> change statusPhase1 ([#1278](https://github.com/betagouv/service-national-universel/issues/1278)) ([585732a](https://github.com/betagouv/service-national-universel/commit/585732aab1e8fbc62a056f302323cf6a68e72d0f))
- **app:** Phase 2 - ajouter un renvoi vers la BDC ([#1279](https://github.com/betagouv/service-national-universel/issues/1279)) ([7c92a20](https://github.com/betagouv/service-national-universel/commit/7c92a206d50b522d58a473527a5c4a4ca4c43fd4))

# [1.46.0](https://github.com/betagouv/service-national-universel/compare/v1.45.0...v1.46.0) (2022-02-21)

### Bug Fixes

- **admin:** drawer style ([#1273](https://github.com/betagouv/service-national-universel/issues/1273)) ([7b322ed](https://github.com/betagouv/service-national-universel/commit/7b322edba4958480893a65078c279891cfd67b5b))
- es search proposal mission ([80ac6b0](https://github.com/betagouv/service-national-universel/commit/80ac6b06a597e398349682cce490c93ae4036111))
- **app:** more svg size ([68f02cb](https://github.com/betagouv/service-national-universel/commit/68f02cbae103bb1deb08194cf76066e63d1d4ae7))
- **app:** svg size ([d33290b](https://github.com/betagouv/service-national-universel/commit/d33290ba673538ba635e58fd7bcb3ef093ea6e06))
- **app:** tailwind fix-1 ([#1272](https://github.com/betagouv/service-national-universel/issues/1272)) ([e92abad](https://github.com/betagouv/service-national-universel/commit/e92abad35ffdf978927b0350fc3d5b3cbb4d1249))
- **app:** tailwind in auth ([c906883](https://github.com/betagouv/service-national-universel/commit/c906883324bca5a44600e7a6cea04d27da4fa572))
- profile modale ([0b4aaeb](https://github.com/betagouv/service-national-universel/commit/0b4aaebb10833046dd1b1d6964175905cdbaf3b9))

### Features

- **admin:** button add a tutor ([#1270](https://github.com/betagouv/service-national-universel/issues/1270)) ([5b35e91](https://github.com/betagouv/service-national-universel/commit/5b35e91a02991431c80b2588799fe6c7805813e4))
- **admin,app:** tailwind-setup ([#1255](https://github.com/betagouv/service-national-universel/issues/1255)) ([cfd5021](https://github.com/betagouv/service-national-universel/commit/cfd5021b19c76503db7a7017c72ec68ea973f5d0))

# [1.45.0](https://github.com/betagouv/service-national-universel/compare/v1.44.1...v1.45.0) (2022-02-18)

### Bug Fixes

- **admin:** add `showMissing` on mulitdropdownlist ([1fd7b46](https://github.com/betagouv/service-national-universel/commit/1fd7b46440e326484db2982c433d02094e901f43))
- translation ([c17112f](https://github.com/betagouv/service-national-universel/commit/c17112f9b18e55e4a6ccb4c3c6b9bf6a8e20eb90))
- **admin:** mettre `folded` sur les toutes les barres de recherches ([#1260](https://github.com/betagouv/service-national-universel/issues/1260)) ([284875f](https://github.com/betagouv/service-national-universel/commit/284875f65eb8d144b4ab14a1a1ea2aa696f940a6))
- **api:** withdrawn phases if needed ([7c86d2f](https://github.com/betagouv/service-national-universel/commit/7c86d2f1ec07c62ad46c1a6c739fb298cedbe383))

### Features

- **admin:** options status ([6be305a](https://github.com/betagouv/service-national-universel/commit/6be305a02885e4d35c1b6db9c78b10d56e9737f6))

## [1.44.1](https://github.com/betagouv/service-national-universel/compare/v1.44.0...v1.44.1) (2022-02-16)

### Bug Fixes

- **search:** search with/without accent ([#1256](https://github.com/betagouv/service-national-universel/issues/1256)) ([bb0b057](https://github.com/betagouv/service-national-universel/commit/bb0b0576806c0f5096164b248977d99d2c544507))

# [1.44.0](https://github.com/betagouv/service-national-universel/compare/v1.43.0...v1.44.0) (2022-02-15)

### Bug Fixes

- **admin:** mission status ([#1254](https://github.com/betagouv/service-national-universel/issues/1254)) ([33a7914](https://github.com/betagouv/service-national-universel/commit/33a791450e6b4f9e6c903fcf4be63c89bc129821))

### Features

- **admin:** Proposer une mission à un volontaire depuis une mission ([#1229](https://github.com/betagouv/service-national-universel/issues/1229)) ([dad2351](https://github.com/betagouv/service-national-universel/commit/dad2351b270bebd94cc5b6fdd9a1e88e7818dd8a))
- **api:** batch2 sendinblue ([#1233](https://github.com/betagouv/service-national-universel/issues/1233)) ([3d08f43](https://github.com/betagouv/service-national-universel/commit/3d08f433cf98f29115c63fc21fd79244ffbee029))
- **api:** stats table youngs ([#1245](https://github.com/betagouv/service-national-universel/issues/1245)) ([541a7b9](https://github.com/betagouv/service-national-universel/commit/541a7b93e24ed97f2d94984159b891d375ea7a7f))

# [1.43.0](https://github.com/betagouv/service-national-universel/compare/v1.42.0...v1.43.0) (2022-02-14)

### Bug Fixes

- restrict role change for visitors ([#1250](https://github.com/betagouv/service-national-universel/issues/1250)) ([09a7620](https://github.com/betagouv/service-national-universel/commit/09a7620bc9b202b0d72ebb7bc1aba8d7a0bc36f0))

### Features

- Pointage : ouverture aux admin depuis onglet centre ([#1253](https://github.com/betagouv/service-national-universel/issues/1253)) ([52e70ce](https://github.com/betagouv/service-national-universel/commit/52e70ce4895add349512a4e85bf0a5b6f52acbc9))
- Visiteur : changement de fonction ([#1244](https://github.com/betagouv/service-national-universel/issues/1244)) ([e589463](https://github.com/betagouv/service-national-universel/commit/e589463c142a98e21ef8fd29ff2b117febea59b1))

# [1.42.0](https://github.com/betagouv/service-national-universel/compare/v1.41.0...v1.42.0) (2022-02-11)

### Features

- **admin:** Chef de centre : pointage et validation ([#1231](https://github.com/betagouv/service-national-universel/issues/1231)) ([7be9e54](https://github.com/betagouv/service-national-universel/commit/7be9e547a5ed6c76aa1a026032a6b9d77656088c)), closes [#1228](https://github.com/betagouv/service-national-universel/issues/1228)

# [1.41.0](https://github.com/betagouv/service-national-universel/compare/v1.40.0...v1.41.0) (2022-02-10)

### Bug Fixes

- **admin:** pagination `NaN-NaN` dans certaine ReactiveList ([#1237](https://github.com/betagouv/service-national-universel/issues/1237)) ([ef0f8d4](https://github.com/betagouv/service-national-universel/commit/ef0f8d42f3892b07a8397e4abdf96a785b016af7))
- **deps:** update dependency swr to v1.2.1 ([#1036](https://github.com/betagouv/service-national-universel/issues/1036)) ([1a0a0a3](https://github.com/betagouv/service-national-universel/commit/1a0a0a31507f7efc08721ebc4f5f10dd028dccfb))

### Features

- **api:** count more than 10k with es ([#1238](https://github.com/betagouv/service-national-universel/issues/1238)) ([07a35c8](https://github.com/betagouv/service-national-universel/commit/07a35c813a1de35e78ff3fa6abdc0cb5fc8c48ba))

# [1.40.0](https://github.com/betagouv/service-national-universel/compare/v1.39.0...v1.40.0) (2022-02-09)

### Bug Fixes

- **supp:** lint ([#1230](https://github.com/betagouv/service-national-universel/issues/1230)) ([351f358](https://github.com/betagouv/service-national-universel/commit/351f358677439c0b5d130551b3bfeca2c3fad9e8))

### Features

- **admin:** ajouter message erreurs dans la modal invitation ([#1215](https://github.com/betagouv/service-national-universel/issues/1215)) ([cc611bb](https://github.com/betagouv/service-national-universel/commit/cc611bb8a1b0021ea5b6bd3a9aca48cdadf3c2f5)), closes [#1202](https://github.com/betagouv/service-national-universel/issues/1202) [#1202](https://github.com/betagouv/service-national-universel/issues/1202)

# [1.39.0](https://github.com/betagouv/service-national-universel/compare/v1.38.0...v1.39.0) (2022-02-08)

### Bug Fixes

- **support:** folders org ([#1209](https://github.com/betagouv/service-national-universel/issues/1209)) ([674fd15](https://github.com/betagouv/service-national-universel/commit/674fd152e770287d4be1d00fa0a62ce4e7e12101))
- **support:** tailwind styling for v3 ([#1212](https://github.com/betagouv/service-national-universel/issues/1212)) ([779b06c](https://github.com/betagouv/service-national-universel/commit/779b06cac29b92d72778ec6c150f13e4d90ed42e))

### Features

- **admin:** permettre de mettre à jour les capacités des `sessionPhase1` ([#1188](https://github.com/betagouv/service-national-universel/issues/1188)) ([baae113](https://github.com/betagouv/service-national-universel/commit/baae1137bb247dfde5c29a274695f2e9021b7849))
- **admin,api:** permettre à un admin de changer un volontaire de session ([#1190](https://github.com/betagouv/service-national-universel/issues/1190)) ([a2577f0](https://github.com/betagouv/service-national-universel/commit/a2577f0adad2d68e36e5bb035b68b0128ee52abb))
- **admin,api:** repasser la mission en validation si changement de champs critiques + UX ([#1208](https://github.com/betagouv/service-national-universel/issues/1208)) ([1dbfec1](https://github.com/betagouv/service-national-universel/commit/1dbfec1d5cfbe060c222b0703b95c51c6d3c0c4f))
- **support:** add pagination ([#1210](https://github.com/betagouv/service-national-universel/issues/1210)) ([ad6d84b](https://github.com/betagouv/service-national-universel/commit/ad6d84bb40e489d771ae11f6b02940ac702cf3dd))
- **support:** can display ticket ([#1214](https://github.com/betagouv/service-national-universel/issues/1214)) ([ec4b31c](https://github.com/betagouv/service-national-universel/commit/ec4b31c9911c6dcbfe14a0ca8f635c2d3f97285d))

# [1.38.0](https://github.com/betagouv/service-national-universel/compare/v1.37.0...v1.38.0) (2022-02-07)

### Features

- **admin:** add required fields ([#1200](https://github.com/betagouv/service-national-universel/issues/1200)) ([42fc95a](https://github.com/betagouv/service-national-universel/commit/42fc95abb385400ae8ae74ec1121b7f40c4b820a))

# [1.37.0](https://github.com/betagouv/service-national-universel/compare/v1.36.0...v1.37.0) (2022-02-04)

### Features

- **admin:** add rules young in export ([#1197](https://github.com/betagouv/service-national-universel/issues/1197)) ([616a8b2](https://github.com/betagouv/service-national-universel/commit/616a8b28cf3b81fb941bb4aaa198e6d815babf3f))
- **app:** protocole sanitaire ([#1199](https://github.com/betagouv/service-national-universel/issues/1199)) ([d28caf1](https://github.com/betagouv/service-national-universel/commit/d28caf107cbd283874cad935d5b931346d237ee0))

# [1.36.0](https://github.com/betagouv/service-national-universel/compare/v1.35.1...v1.36.0) (2022-02-03)

### Bug Fixes

- **admin:** add plausibleEvents ([4debbb3](https://github.com/betagouv/service-national-universel/commit/4debbb3eaf18b731488e3c23c65adf10d79f035e))
- **admin:** restrict head center access ([#1182](https://github.com/betagouv/service-national-universel/issues/1182)) ([24cfad5](https://github.com/betagouv/service-national-universel/commit/24cfad5dfe13b541494e858baffa2eba946a51b2))
- **api:** back to normal export young in center ([a2ba86d](https://github.com/betagouv/service-national-universel/commit/a2ba86d6ee52fd571e3fdbe0480bf0cf14de20c1))

### Features

- **admin:** change source of data in the dashboard (cohort -> session) ([#1181](https://github.com/betagouv/service-national-universel/issues/1181)) ([86e1d8b](https://github.com/betagouv/service-national-universel/commit/86e1d8bd06bbfc72c1bce2bfb93fb5c1fae2d217))
- **admin:** event Plausible ([#1192](https://github.com/betagouv/service-national-universel/issues/1192)) ([b5ccaea](https://github.com/betagouv/service-national-universel/commit/b5ccaea2003b044a6ce5ca219b0831207b2c7454))
- **admin:** remonter la session du chef de centre dans sa fiche utilisateur ([#1191](https://github.com/betagouv/service-national-universel/issues/1191)) ([cf48811](https://github.com/betagouv/service-national-universel/commit/cf48811f7e5d7e1459f4906dbf667a78cda32c3b))
- **admin,api:** open certificate only bretagne ([#1194](https://github.com/betagouv/service-national-universel/issues/1194)) ([2985e34](https://github.com/betagouv/service-national-universel/commit/2985e34195106ed95918ad82b069507df34a03a3))

## [1.35.1](https://github.com/betagouv/service-national-universel/compare/v1.35.0...v1.35.1) (2022-02-02)

### Bug Fixes

- **api:** joi email young ([1972885](https://github.com/betagouv/service-national-universel/commit/19728857fb1440bacd9093a61b0ad202bdfc2ab3))
- **api:** saint-martin et saint-barthelemy in Guadeloupe ([2671034](https://github.com/betagouv/service-national-universel/commit/267103494301e683d679b99df9cbeb4c816ee13c))
- **app,api:** add contact mail ([#1187](https://github.com/betagouv/service-national-universel/issues/1187)) ([1daf25a](https://github.com/betagouv/service-national-universel/commit/1daf25a713b224a048b824a540bf6e9d36ad366e))

# [1.35.0](https://github.com/betagouv/service-national-universel/compare/v1.34.0...v1.35.0) (2022-02-01)

### Bug Fixes

- **app:** droit phase 2 ([63a2c0c](https://github.com/betagouv/service-national-universel/commit/63a2c0c27c54d471e6f0272cf425e0d2c4874906))
- **app:** message desistement ([7728bd4](https://github.com/betagouv/service-national-universel/commit/7728bd4e1033c02650d2c6c9d0222bd0a0fd67a2))

### Features

- **admin:** grouper membre d'équipe par role ([#1172](https://github.com/betagouv/service-national-universel/issues/1172)) ([c0337ca](https://github.com/betagouv/service-national-universel/commit/c0337ca9feeb26b11f4c5747835a587bc68c78ba))
- **support:** kb metadata ([#1174](https://github.com/betagouv/service-national-universel/issues/1174)) ([4f69dc8](https://github.com/betagouv/service-national-universel/commit/4f69dc800408253a7c74558cd91d8d512fefd8c9))

# [1.34.0](https://github.com/betagouv/service-national-universel/compare/v1.33.1...v1.34.0) (2022-01-31)

### Bug Fixes

- **admin:** remove export cas particulier ([cea8a69](https://github.com/betagouv/service-national-universel/commit/cea8a69b8313b6841ac4c4215891ec041915b021))
- **admin:** view head center ([4776614](https://github.com/betagouv/service-national-universel/commit/4776614504a3ba2d6c2c8e8b6c7e981687acfe30))
- **api:** privileges `canCreateOrUpdateSessionPhase1` ([49a2795](https://github.com/betagouv/service-national-universel/commit/49a2795f4a5bf6d00d03978ba581c89afbac197f))
- **api:** sync places sessions ([9a1a456](https://github.com/betagouv/service-national-universel/commit/9a1a45642cc995c1a79aee55a4b9e2b7e87d4f4e))

### Features

- **admin:** onglet "Mon centre" espace chef de centre ([#1164](https://github.com/betagouv/service-national-universel/issues/1164)) ([182405d](https://github.com/betagouv/service-national-universel/commit/182405df5ab3f9cb9b2cc086e36120f61e8bf4cf))
- **app:** add passwordEye ([#1167](https://github.com/betagouv/service-national-universel/issues/1167)) ([bdaaf6d](https://github.com/betagouv/service-national-universel/commit/bdaaf6d26b1b16a8e58cb1b8a3c736e484dbba7b))
- **support:** metadata for knowledge base ([#1173](https://github.com/betagouv/service-national-universel/issues/1173)) ([f2c29e6](https://github.com/betagouv/service-national-universel/commit/f2c29e671d542ed23283d47de98d739eb36e0be6))
- inviter un chef de centre ([#1147](https://github.com/betagouv/service-national-universel/issues/1147)) ([d2ef68f](https://github.com/betagouv/service-national-universel/commit/d2ef68f9cce5e50dfa62f3fbe709b36c01783bce))

## [1.33.1](https://github.com/betagouv/service-national-universel/compare/v1.33.0...v1.33.1) (2022-01-29)

### Bug Fixes

- **support:** clean lint ([#1165](https://github.com/betagouv/service-national-universel/issues/1165)) ([8a10a62](https://github.com/betagouv/service-national-universel/commit/8a10a629fddd5e083e6b424d3d4000ab80ef0f29))

# [1.33.0](https://github.com/betagouv/service-national-universel/compare/v1.32.0...v1.33.0) (2022-01-28)

### Bug Fixes

- remove test ([5886f9f](https://github.com/betagouv/service-national-universel/commit/5886f9f5f97befdb088751607f2351bb66e482d5))
- **admin:** ES for head center ([0d900bc](https://github.com/betagouv/service-national-universel/commit/0d900bcf248ffcf9a3bcb9372cc9a39e3849f6d7))
- **api:** controller es for head center ([af455ef](https://github.com/betagouv/service-national-universel/commit/af455eff22f62e18b847d9452027f1d3c92ab71a))
- **api:** test es for head center ([af6d0c7](https://github.com/betagouv/service-national-universel/commit/af6d0c774decf7f9d8081bf696514cfe4d734d91))
- **api,app:** default date convocation ([10607cb](https://github.com/betagouv/service-national-universel/commit/10607cbf7112d973527c8e7e14d85522b22a8c3b))
- **app:** cookies dentsu ([#1163](https://github.com/betagouv/service-national-universel/issues/1163)) ([014eca1](https://github.com/betagouv/service-national-universel/commit/014eca1406efa1e86fae8721132211c76b7a5e75))

### Features

- **admin:** tableau de bord - centres ([#1160](https://github.com/betagouv/service-national-universel/issues/1160)) ([9dffc9b](https://github.com/betagouv/service-national-universel/commit/9dffc9bbab21c23f780c61d75a6d8ba4e71ff629))
- **app-plausible:** event on inscription validation ([a988104](https://github.com/betagouv/service-national-universel/commit/a9881044af50e716e84182346a17fe67208e665e))
- **app,api:** desistement cascade [#1142](https://github.com/betagouv/service-national-universel/issues/1142) ([#1149](https://github.com/betagouv/service-national-universel/issues/1149)) ([5f3adce](https://github.com/betagouv/service-national-universel/commit/5f3adcedbea55cfeb957ecc89bb6ca48cb6dd5fe))
- **support:** tickets models + interface ([#1135](https://github.com/betagouv/service-national-universel/issues/1135)) ([e3e3caa](https://github.com/betagouv/service-national-universel/commit/e3e3caa2bd76a80c254679b739859e4a9a4fb52a))

# [1.32.0](https://github.com/betagouv/service-national-universel/compare/v1.31.0...v1.32.0) (2022-01-27)

### Bug Fixes

- **admin:** export youngs ([6a24a00](https://github.com/betagouv/service-national-universel/commit/6a24a00d81215ec8c7940c3d2e29ae54fbc42238))
- **api:** `max-width` oin contact convocation ([4f2bc2c](https://github.com/betagouv/service-national-universel/commit/4f2bc2ce058bb16a28cc9f9edc3f252710e9a781))
- **app:** department for young ([#1148](https://github.com/betagouv/service-national-universel/issues/1148)) ([d226c03](https://github.com/betagouv/service-national-universel/commit/d226c032df2729a904a740da161749201661415a))
- **app:** display convoc, even for PDL ([e004254](https://github.com/betagouv/service-national-universel/commit/e00425417424bd7afc132077cfbc90c7ccc98ced))
- **app:** typo ([dbc7325](https://github.com/betagouv/service-national-universel/commit/dbc732506ebfc8391ae95bc74f7b96fa16bc0457))
- **deps:** update dependency core-js to v3.20.3 ([#1027](https://github.com/betagouv/service-national-universel/issues/1027)) ([e735b71](https://github.com/betagouv/service-national-universel/commit/e735b71de31f78d75d2b872f996025ddf71421c5))
- export when empty ([f15075d](https://github.com/betagouv/service-national-universel/commit/f15075dfa09788a70417eb3761cd42ab72e8a552))
- permette modification de la premiere etape du formulaire ([#1129](https://github.com/betagouv/service-national-universel/issues/1129)) ([85390a6](https://github.com/betagouv/service-national-universel/commit/85390a6d5019b8c9bd1562f5d572e7f47edeedbe)), closes [#1063](https://github.com/betagouv/service-national-universel/issues/1063)

### Features

- **admin:** ajout filtres liste des volontaires / sessionPhase1 ([#1146](https://github.com/betagouv/service-national-universel/issues/1146)) ([86c9c51](https://github.com/betagouv/service-national-universel/commit/86c9c51a6f2be31fc00d9cf7f6664d6d942397d7))
- **admin:** ajout filtres vue chef de centre ([#1144](https://github.com/betagouv/service-national-universel/issues/1144)) ([702c84c](https://github.com/betagouv/service-national-universel/commit/702c84c99c7e2716f725ad1fc29de321d13cea0e))
- **admin:** création de l'équipe pour les séjours ([#1136](https://github.com/betagouv/service-national-universel/issues/1136)) ([a1ec06b](https://github.com/betagouv/service-national-universel/commit/a1ec06b3d6800407f02a6d9b8989a1a13b0ddf8d))
- **admin:** visibilité du numéro de téléphone entre chefs de centre ([#1145](https://github.com/betagouv/service-national-universel/issues/1145)) ([ed59b12](https://github.com/betagouv/service-national-universel/commit/ed59b12ce487e9f81dac7b1d884297a61a7ccdda))
- **app:** add CGU for youngs ([#1082](https://github.com/betagouv/service-national-universel/issues/1082)) ([5ac8be1](https://github.com/betagouv/service-national-universel/commit/5ac8be18de9dbe1e34ac1ab543eaa579740ad414))
- **app:** event-plausible ([#1138](https://github.com/betagouv/service-national-universel/issues/1138)) ([4f2aeec](https://github.com/betagouv/service-national-universel/commit/4f2aeecbda2811fb099c96ac60ff63e77834dbf8))

# [1.31.0](https://github.com/betagouv/service-national-universel/compare/v1.30.0...v1.31.0) (2022-01-26)

### Bug Fixes

- **admin:** edit young ([94ded8f](https://github.com/betagouv/service-national-universel/commit/94ded8fa71e9c67a22d2ff7207cc50875466a924))
- **app:** display convocation in browser ([6e5a14e](https://github.com/betagouv/service-national-universel/commit/6e5a14ee450f150e1eae80d6f1e9d7a5353f380a))
- **app:** links base de connaissance ([327d424](https://github.com/betagouv/service-national-universel/commit/327d424ca9056de5f10f7a042df1c19959bee38f))
- **app:** url in `affected` scene ([3d53071](https://github.com/betagouv/service-national-universel/commit/3d53071aa5e12e6502c7e17605d0def4acff1805))
- **app:** wording validation `deplacementPhase1Autonomous` ([1e11599](https://github.com/betagouv/service-national-universel/commit/1e11599b2dfe87efdee4c2e9af9643db12a6c2a1))

### Features

- **admin,api:** rules canDeleteReferent by another referent ([#1128](https://github.com/betagouv/service-national-universel/issues/1128)) ([3a13174](https://github.com/betagouv/service-national-universel/commit/3a131742b1242708eeafe234be3c71681d78c108))
- **app:** display convoc for EVERYBODY ([094cbfd](https://github.com/betagouv/service-national-universel/commit/094cbfdd5399201309a3c63999d9c4c635785618))

# [1.30.0](https://github.com/betagouv/service-national-universel/compare/v1.29.0...v1.30.0) (2022-01-25)

### Bug Fixes

- **app:** text affectation ([#1134](https://github.com/betagouv/service-national-universel/issues/1134)) ([e540290](https://github.com/betagouv/service-national-universel/commit/e540290ccfe747f6773b1fad69b69e6d98dfb91d))
- change support-center to zammad-support-center ([#1133](https://github.com/betagouv/service-national-universel/issues/1133)) ([1dda5a2](https://github.com/betagouv/service-national-universel/commit/1dda5a237bc8fc84b129f5f7cda0476c50d3aa2c))

### Features

- **admin:** restrict access of head center ([#1127](https://github.com/betagouv/service-national-universel/issues/1127)) ([27c793d](https://github.com/betagouv/service-national-universel/commit/27c793d5a1373b19e213ef46ce0b8572416cb4e5))

# [1.29.0](https://github.com/betagouv/service-national-universel/compare/v1.28.1...v1.29.0) (2022-01-24)

### Bug Fixes

- **support:** can delete article ([#1124](https://github.com/betagouv/service-national-universel/issues/1124)) ([6954c38](https://github.com/betagouv/service-national-universel/commit/6954c386ee6c9ce6241cb6cbef423aa17607da13))

### Features

- **app:** ajout modal desistement - confirmation ([#1131](https://github.com/betagouv/service-national-universel/issues/1131)) ([3f06cfe](https://github.com/betagouv/service-national-universel/commit/3f06cfe17b32fac0a842c98208cd62e15382040a))
- **app,api:** get cohesionCenter via sessionPhase1 ([#1120](https://github.com/betagouv/service-national-universel/issues/1120)) ([bba1020](https://github.com/betagouv/service-national-universel/commit/bba102051372708827b2aac7f97648ad5b2ddfc1))
- **support:** admin global interface + print button ([#1123](https://github.com/betagouv/service-national-universel/issues/1123)) ([f4b2690](https://github.com/betagouv/service-national-universel/commit/f4b26903dbc8a00d316e0bbc31c1ade6b4ea7f92))
- **support:** first integration tickets ([#1130](https://github.com/betagouv/service-national-universel/issues/1130)) ([c2240da](https://github.com/betagouv/service-national-universel/commit/c2240dabe157403100daa75ba2fd1c29016afcbb))
- **support:** print button ([#1122](https://github.com/betagouv/service-national-universel/issues/1122)) ([40afc8c](https://github.com/betagouv/service-national-universel/commit/40afc8c578f89702be498fb9b07dd5086866f738))

## [1.28.1](https://github.com/betagouv/service-national-universel/compare/v1.28.0...v1.28.1) (2022-01-22)

### Bug Fixes

- **api:** add fields to meetingpoint model ([ab646b1](https://github.com/betagouv/service-national-universel/commit/ab646b16b73831f98a08d43f8675199f6dcaec44))

# [1.28.0](https://github.com/betagouv/service-national-universel/compare/v1.27.0...v1.28.0) (2022-01-21)

### Bug Fixes

- **admin:** cancel meetingpoint ([17ac237](https://github.com/betagouv/service-national-universel/commit/17ac237c45dfc535bc88a48f614647dd7bd8ef6e))
- **admin:** enable change meetingPoint from admin ([596ac83](https://github.com/betagouv/service-national-universel/commit/596ac8360d027fd5216bf27970afe22c329411f2))
- **api:** test allow route meeting point ([#1116](https://github.com/betagouv/service-national-universel/issues/1116)) ([09a651e](https://github.com/betagouv/service-national-universel/commit/09a651e7f2ce5c5386eaf431d7124bed0c5fd43c))
- **api:** update rules download convocation ([877c337](https://github.com/betagouv/service-national-universel/commit/877c337789249dde0e59c1c82be4f53feb760474))
- **app:** add modal confirm autonomous ([6df2a8a](https://github.com/betagouv/service-national-universel/commit/6df2a8a02ab575c53305eb8f8e9b24582c87a619))
- **app:** link in footer convocation ([181b49b](https://github.com/betagouv/service-national-universel/commit/181b49b7dae14437905667fe037d143b979c5ed2))
- **app:** maj reglement interieur dans convoc ([7a398c9](https://github.com/betagouv/service-national-universel/commit/7a398c9229af3551f23aaad2c171791916037299))
- **app:** phase 1 convoc + allow router ([33a5ec0](https://github.com/betagouv/service-national-universel/commit/33a5ec050f6ff477805aa781ac44b5d4fb33b6a9))
- **app:** update Convocation.js ([#1110](https://github.com/betagouv/service-national-universel/issues/1110)) ([ad275f8](https://github.com/betagouv/service-national-universel/commit/ad275f8f50d832446e93b6d9daf8cd8b268e9382))
- **app:** update home ([e2a09fb](https://github.com/betagouv/service-national-universel/commit/e2a09fb5d2c35c4a7f7539bce593fdea15ec6e01))
- **app:** warning message convocation not found ([#1119](https://github.com/betagouv/service-national-universel/issues/1119)) ([c44635b](https://github.com/betagouv/service-national-universel/commit/c44635bd8b4e5aa34c9b922429a2d724ac1db786))
- **app:** wording ([ac3a075](https://github.com/betagouv/service-national-universel/commit/ac3a07527e4a92ddae65fb035b54bad9357cfba9))
- **app,api:** deplacementPhase1Autonomous + display center infos ([#1117](https://github.com/betagouv/service-national-universel/issues/1117)) ([becfcc7](https://github.com/betagouv/service-national-universel/commit/becfcc77847bd9c3c1f4225294e95ba215b77a0f))
- **support:** can insert mailto stuff ([#1112](https://github.com/betagouv/service-national-universel/issues/1112)) ([fdf8252](https://github.com/betagouv/service-national-universel/commit/fdf8252c3fde830dd3a038a153ff75691c04276c))
- **support:** many stuff in knowledge-base ([#1121](https://github.com/betagouv/service-national-universel/issues/1121)) ([885535c](https://github.com/betagouv/service-national-universel/commit/885535cf206e4a06655d8cb881aef85dc03a290f))
- **support:** redirections ([#1113](https://github.com/betagouv/service-national-universel/issues/1113)) ([8cf758f](https://github.com/betagouv/service-national-universel/commit/8cf758f76508db73c6ad4936e5d065ed78886e16))
- **support:** update slug only when needed + fix change slugs when no content yet ([#1114](https://github.com/betagouv/service-national-universel/issues/1114)) ([4c088cf](https://github.com/betagouv/service-national-universel/commit/4c088cff5f9d9749a8d780e8b64b8499546be549))

### Features

- **app:** affichage date/heure convoc app ([#1118](https://github.com/betagouv/service-national-universel/issues/1118)) ([34dac93](https://github.com/betagouv/service-national-universel/commit/34dac9359d92a6bf0b96f0fadfbb22db4bd12caf))
- **app:** phase1 affecté ([#1097](https://github.com/betagouv/service-national-universel/issues/1097)) ([5a8f216](https://github.com/betagouv/service-national-universel/commit/5a8f21621712657c98fa2a333690117c89d03dd7))

# [1.27.0](https://github.com/betagouv/service-national-universel/compare/v1.26.0...v1.27.0) (2022-01-20)

### Bug Fixes

- **admin:** add hidden close button cgu modal ([5861942](https://github.com/betagouv/service-national-universel/commit/5861942c07c9f1c2caed119c81ccce7b58d8388c))
- **admin:** allow null contact ([dde9782](https://github.com/betagouv/service-national-universel/commit/dde9782e694cefeeef3258a5a6d8426223c066e2))
- **admin:** infos center in young/id/phase1 ([#1105](https://github.com/betagouv/service-national-universel/issues/1105)) ([0e63bff](https://github.com/betagouv/service-national-universel/commit/0e63bffdf723a00dca125926eb54b595f63522f8))
- **support:** see as for referent and admin ([#1104](https://github.com/betagouv/service-national-universel/issues/1104)) ([b154852](https://github.com/betagouv/service-national-universel/commit/b154852bc9c2c5d10a0c0f2595b7b689ce80149b))
- **support:** show seeas banner only when seeas is active ([#1108](https://github.com/betagouv/service-national-universel/issues/1108)) ([63b9d06](https://github.com/betagouv/service-national-universel/commit/63b9d06d3ccc1cab3db300d5bb8f14f1c8de54b1))

### Features

- **app:** enable edit files in phase1 ([#1109](https://github.com/betagouv/service-national-universel/issues/1109)) ([76ced2b](https://github.com/betagouv/service-national-universel/commit/76ced2bfc8b67039c49d833c1410b852e6dde868))
- **app:** event plausible - step 2 ([85cefca](https://github.com/betagouv/service-national-universel/commit/85cefca34b5a84db5018a9c4156d8ba3cd12b765))

# [1.26.0](https://github.com/betagouv/service-national-universel/compare/v1.25.0...v1.26.0) (2022-01-19)

### Bug Fixes

- **admin:** add shortcut to young referents ([ddd04c7](https://github.com/betagouv/service-national-universel/commit/ddd04c712ced4a215ebc0869861027f0a76e61b7))
- **app:** redirect to http url ([#1102](https://github.com/betagouv/service-national-universel/issues/1102)) ([c841c4d](https://github.com/betagouv/service-national-universel/commit/c841c4d0582c9929d0a71cf5d526a22e7e4ccf8e))
- **support:** lint ([#1103](https://github.com/betagouv/service-national-universel/issues/1103)) ([cea670c](https://github.com/betagouv/service-national-universel/commit/cea670c94f1b52402bb5819d07c09192b420cca5))
- **support:** see as with bandeau ([#1098](https://github.com/betagouv/service-national-universel/issues/1098)) ([7255709](https://github.com/betagouv/service-national-universel/commit/72557091db9c95db9190f13846c6a390442a77c8))

### Features

- **api:** update convocation pour fevrier 2022 ([#1100](https://github.com/betagouv/service-national-universel/issues/1100)) ([77349ad](https://github.com/betagouv/service-national-universel/commit/77349ad5b77e4029a5fa9bf0f2a3f896bb7d54c2))
- **support:** tickets first iteration ([#1099](https://github.com/betagouv/service-national-universel/issues/1099)) ([6fb472c](https://github.com/betagouv/service-national-universel/commit/6fb472cfbb2dadac5400e4ddb098ddfc2f016b2c))

# [1.25.0](https://github.com/betagouv/service-national-universel/compare/v1.24.0...v1.25.0) (2022-01-18)

### Bug Fixes

- **admin:** add filter cohort in meetingPoint list ([87b7700](https://github.com/betagouv/service-national-universel/commit/87b77007a7eaae9cd0c06dbce73b876ecc86c5e2))
- **support:** resizable drawer ([#1096](https://github.com/betagouv/service-national-universel/issues/1096)) ([5f5a38d](https://github.com/betagouv/service-national-universel/commit/5f5a38d2260d27173c03d5399c98a07e9ea1e54e))

### Features

- **support:** imporve voir en tant que + remove read for not admin + added searched ([#1095](https://github.com/betagouv/service-national-universel/issues/1095)) ([bf6166d](https://github.com/betagouv/service-national-universel/commit/bf6166de909ecb85aeba5af9aaa4808c8778a52b))

# [1.24.0](https://github.com/betagouv/service-national-universel/compare/v1.23.0...v1.24.0) (2022-01-17)

### Bug Fixes

- **admin,center:** display places and codes ([b92eaa3](https://github.com/betagouv/service-national-universel/commit/b92eaa3cc5cf0bf3ea67e99cc75aebbb89188200))

### Features

- **admin:** admin can delete referent ([#1092](https://github.com/betagouv/service-national-universel/issues/1092)) ([90dc7b1](https://github.com/betagouv/service-national-universel/commit/90dc7b1b90c26a0fad75d6c47cb2a32cc7520dbc))
- **admin:** contact-departement by cohort ([#1091](https://github.com/betagouv/service-national-universel/issues/1091)) ([aca74e1](https://github.com/betagouv/service-national-universel/commit/aca74e1172c2b355be7fc8062b12a0099633af65))
- **admin:** unavailable feature screen ([#1090](https://github.com/betagouv/service-national-universel/issues/1090)) ([f660cc1](https://github.com/betagouv/service-national-universel/commit/f660cc18196f6ef51be862137858ac45072f9da5))
- **tmp,admin:** export temporary columns ([b765680](https://github.com/betagouv/service-national-universel/commit/b7656804e9841c7abebca02805c9c272236381c3))
- add three tmp columns ([22e3c58](https://github.com/betagouv/service-national-universel/commit/22e3c589e2e6d79a707440c63a9b184769aba671))
- **admin,app,api:** prise en compte field `sessionPhase1` ([#1072](https://github.com/betagouv/service-national-universel/issues/1072)) ([f5cb53b](https://github.com/betagouv/service-national-universel/commit/f5cb53b1181a59fddaf3260e0eb55e0b254520e6))

# [1.23.0](https://github.com/betagouv/service-national-universel/compare/v1.22.0...v1.23.0) (2022-01-14)

### Bug Fixes

- **admin,center:** add ids in export ([700799b](https://github.com/betagouv/service-national-universel/commit/700799bf3fcb9a2df51717a08949174f4ec69e97))
- **app:** Update GoogleTags.js ([9e1b124](https://github.com/betagouv/service-national-universel/commit/9e1b124dcdb1bf1bbcf001a23f922f40c021b4f4))
- **support:** can see as ([#1088](https://github.com/betagouv/service-national-universel/issues/1088)) ([8daeae2](https://github.com/betagouv/service-national-universel/commit/8daeae2900682a6d7537923147dbe00de7cd263d))
- **support:** many fixes ([#1081](https://github.com/betagouv/service-national-universel/issues/1081)) ([fefe565](https://github.com/betagouv/service-national-universel/commit/fefe565bc529917702c24d8144ba4f264b58a75c))
- **support:** new support url ([#1086](https://github.com/betagouv/service-national-universel/issues/1086)) ([0aed5d5](https://github.com/betagouv/service-national-universel/commit/0aed5d5e5afbb7178f73233fe589864cee10e9fd))
- **support:** preview scroll ([#1085](https://github.com/betagouv/service-national-universel/issues/1085)) ([f3328fa](https://github.com/betagouv/service-national-universel/commit/f3328fa2fdf23108b4077aca94a28ec2ab277125))
- **support:** redirect modal style ([#1087](https://github.com/betagouv/service-national-universel/issues/1087)) ([d48a2bf](https://github.com/betagouv/service-national-universel/commit/d48a2bf9eb5869da31e7abbae5424fc389b1a8d2))

### Features

- **admin:** accept cgu ([#1079](https://github.com/betagouv/service-national-universel/issues/1079)) ([07d067e](https://github.com/betagouv/service-national-universel/commit/07d067ebb9abdffec7ca90164b8f892781138015))
- **app+admin:** change all urls ([#1076](https://github.com/betagouv/service-national-universel/issues/1076)) ([b007ceb](https://github.com/betagouv/service-national-universel/commit/b007ceb193e5ed099244e499d3b02631963660b8))
- **support:** show login popup for protected articles ([#1078](https://github.com/betagouv/service-national-universel/issues/1078)) ([2f6882c](https://github.com/betagouv/service-national-universel/commit/2f6882c9cb35ca03b9773dc5a42f1b281d5da159))

# [1.22.0](https://github.com/betagouv/service-national-universel/compare/v1.21.0...v1.22.0) (2022-01-13)

### Bug Fixes

- **admin,api:** add code2022 for centers ([12b2434](https://github.com/betagouv/service-national-universel/commit/12b243459e9ed8639c807ac32eff7c7242f1fceb))
- **admin,center:** enable edit center code ([1be67b4](https://github.com/betagouv/service-national-universel/commit/1be67b425d9b6a5e0d357949799af808a106febe))
- **support:** support many fixes with loadingType + search ([#1077](https://github.com/betagouv/service-national-universel/issues/1077)) ([eb6db41](https://github.com/betagouv/service-national-universel/commit/eb6db41bb7742eda6fb19f00948567b86c63e64f))

### Features

- **api,cron:** cancel applications when the mission is automatically archived [#1073](https://github.com/betagouv/service-national-universel/issues/1073) ([ef39cb5](https://github.com/betagouv/service-national-universel/commit/ef39cb5cbd314e950890d4aa24ffcb06e4923f66))
- **app:** update conditions in landing page ([2951261](https://github.com/betagouv/service-national-universel/commit/29512617363d8b3f0cfde1b3ad865a92bbae2edd))

# [1.21.0](https://github.com/betagouv/service-national-universel/compare/v1.20.0...v1.21.0) (2022-01-12)

### Bug Fixes

- **app+admin:** reopen support center ([#1075](https://github.com/betagouv/service-national-universel/issues/1075)) ([d92c640](https://github.com/betagouv/service-national-universel/commit/d92c640b64b5fe762b86bc8e3dca5177d7c9d961))

### Features

- **api-zammad:** change zammad url ([#1074](https://github.com/betagouv/service-national-universel/issues/1074)) ([870a6a9](https://github.com/betagouv/service-national-universel/commit/870a6a9f059b8a6c618c8eae6c73def69e8c35d6))
- **app-inscription:** add sessions to eligibility module ([#1070](https://github.com/betagouv/service-national-universel/issues/1070)) ([0ef2fee](https://github.com/betagouv/service-national-universel/commit/0ef2feee7dc02cca78411923f13116241e965b6d))

# [1.20.0](https://github.com/betagouv/service-national-universel/compare/v1.19.1...v1.20.0) (2022-01-11)

### Bug Fixes

- **api,support:** remove useless file ([#1065](https://github.com/betagouv/service-national-universel/issues/1065)) ([9f32216](https://github.com/betagouv/service-national-universel/commit/9f3221658f195c3ec7bd1789845a6732abbfa36a))
- **support:** support many stuff ([#1066](https://github.com/betagouv/service-national-universel/issues/1066)) ([ecb08f7](https://github.com/betagouv/service-national-universel/commit/ecb08f716362bfb4450b6c4118a70f08041c8d3a))
- **support:** fix search showing no answer button on page load ([#1068](https://github.com/betagouv/service-national-universel/issues/1068)) ([7aa37be](https://github.com/betagouv/service-national-universel/commit/7aa37befae7e990e85b1b84d91330b597d1eb207))
- **support:** zammad search by id and by type ([#1069](https://github.com/betagouv/service-national-universel/issues/1069)) ([cdafb9d](https://github.com/betagouv/service-national-universel/commit/cdafb9d32448af51f8f66ede857f83c86afce2d9))

### Features

- **support:** redirect pages coming from old zammad links ([#1064](https://github.com/betagouv/service-national-universel/issues/1064)) ([465d290](https://github.com/betagouv/service-national-universel/commit/465d2905ca5d522b335f0b8bf6197c7aa631c566))

## [1.19.1](https://github.com/betagouv/service-national-universel/compare/v1.19.0...v1.19.1) (2022-01-10)

### Bug Fixes

- **api,cron:** error in noticePushMission ([#1062](https://github.com/betagouv/service-national-universel/issues/1062)) ([120a693](https://github.com/betagouv/service-national-universel/commit/120a693f02d3c0b6f1f76192d543e1a88a86dd62))

# [1.19.0](https://github.com/betagouv/service-national-universel/compare/v1.18.0...v1.19.0) (2022-01-07)

### Features

- **admin+app:** remove obsolete phase1 status ([#1061](https://github.com/betagouv/service-national-universel/issues/1061)) ([dee3f46](https://github.com/betagouv/service-national-universel/commit/dee3f4679ec8c3c47f9849ac6b653d783fbddb09))
- **app:** inscription data checking ([#1056](https://github.com/betagouv/service-national-universel/issues/1056)) ([d7c0cd9](https://github.com/betagouv/service-national-universel/commit/d7c0cd99945d20bbc1cfabbdcde8ed41e089cbc5))
- **app,inscription:** block access to the inscriptions screen for cohorts ([#1057](https://github.com/betagouv/service-national-universel/issues/1057)) ([717ca20](https://github.com/betagouv/service-national-universel/commit/717ca201fb2cfa7eb58e6cfb45ed774ff21ea270))

# [1.18.0](https://github.com/betagouv/service-national-universel/compare/v1.17.0...v1.18.0) (2022-01-06)

### Bug Fixes

- **app,inscription:** block inscription for some status ([8177820](https://github.com/betagouv/service-national-universel/commit/8177820b014dd63e51dee3b79ac6f80ffbe14cf5))

### Features

- **admin,export,young:** add foreign and host informations ([da31a1f](https://github.com/betagouv/service-national-universel/commit/da31a1fb10f6713fc5b67b974ded4765ba7b50d7))
- **admin,young:** rules validation in details ([9838748](https://github.com/betagouv/service-national-universel/commit/9838748c4f87876b8d0ad5e4847c813dca3000d2))
- **app,inscription:** do not show february anymore in stepAvailability ([#1010](https://github.com/betagouv/service-national-universel/issues/1010)) ([de2f469](https://github.com/betagouv/service-national-universel/commit/de2f469f44b305c001c55a4e7d7ff33eccbfe12f))

# [1.17.0](https://github.com/betagouv/service-national-universel/compare/v1.16.0...v1.17.0) (2022-01-05)

### Bug Fixes

- **support:** elastic search results ([#1052](https://github.com/betagouv/service-national-universel/issues/1052)) ([ae825ff](https://github.com/betagouv/service-national-universel/commit/ae825ff88513ce19f23feaca983dd93c33283761))

### Features

- **support:** can look for items ([#1051](https://github.com/betagouv/service-national-universel/issues/1051)) ([1096c14](https://github.com/betagouv/service-national-universel/commit/1096c14c64e7714e9dadb0e2a085f1c016a9dda3))
- **support:** many stuff ([#1055](https://github.com/betagouv/service-national-universel/issues/1055)) ([5727186](https://github.com/betagouv/service-national-universel/commit/5727186f93626c3f69de6bda2d7e91c25b03603f))

# [1.16.0](https://github.com/betagouv/service-national-universel/compare/v1.15.0...v1.16.0) (2022-01-04)

### Bug Fixes

- **admin:** add country filter in inscription list ([b2af477](https://github.com/betagouv/service-national-universel/commit/b2af477d185f2e7137c74161418df793bec1234c))
- **admin:** public support and visitor support ([#1048](https://github.com/betagouv/service-national-universel/issues/1048)) ([60f9b39](https://github.com/betagouv/service-national-universel/commit/60f9b39b0482b80c84019a7dd93df5675a517256))
- **api,zammad:** stop sync only if there is a role and it is not authorized ([65d641d](https://github.com/betagouv/service-national-universel/commit/65d641d774c632c2ab887a0b9564bea49336047a))

### Features

- **support:** support responsive ([#1038](https://github.com/betagouv/service-national-universel/issues/1038)) ([1a66cdc](https://github.com/betagouv/service-national-universel/commit/1a66cdcd142fae2f921b2c1d3ca2f9ee5c58fb06))
- open center tab ([#1049](https://github.com/betagouv/service-national-universel/issues/1049)) ([7645159](https://github.com/betagouv/service-national-universel/commit/7645159e02e799a6b7f27f6200dea1cf5925938a))

# [1.15.0](https://github.com/betagouv/service-national-universel/compare/v1.14.1...v1.15.0) (2022-01-03)

### Bug Fixes

- **admin,sessionPhase1:** list young filters ([37281fe](https://github.com/betagouv/service-national-universel/commit/37281fe85e06c3e57e337e645f426516f25f9013))
- create/delete session phase1 ([#1026](https://github.com/betagouv/service-national-universel/issues/1026)) ([e2c67a0](https://github.com/betagouv/service-national-universel/commit/e2c67a000881882dbf7830226628368b6869a0b2))
- **admin,list:** displayed results on incomplete list pages ([ba395fe](https://github.com/betagouv/service-national-universel/commit/ba395fe190aa5fa0b3dadf186a7dc27b8de15175))
- **app,plausible:** fix props and add clic besoin d'aide ([debd1df](https://github.com/betagouv/service-national-universel/commit/debd1df09b70d56dffa166604efb803f45a6419a))

### Features

- **api,patches:** add patches on cohesionCenter ([c230a47](https://github.com/betagouv/service-national-universel/commit/c230a47395715cbf5f5d0e838979de8d646ca863))
- add event goal plausible ([#1046](https://github.com/betagouv/service-national-universel/issues/1046)) ([35dae56](https://github.com/betagouv/service-national-universel/commit/35dae56d729847257428e938db0946691e3a74cf))
- Ajouter bouton "J'ai terminé la correction de mon dossier" ([#1045](https://github.com/betagouv/service-national-universel/issues/1045)) ([0215459](https://github.com/betagouv/service-national-universel/commit/021545969d6e36497a56845e97b55d0001c9c8c0))
- Ajouter bouton suppression de compte sur la fiche d'autres référents ([#1044](https://github.com/betagouv/service-national-universel/issues/1044)) ([dbdf3b1](https://github.com/betagouv/service-national-universel/commit/dbdf3b10e35034fcfe35bdd9681e953e15d1c552))

## [1.14.1](https://github.com/betagouv/service-national-universel/compare/v1.14.0...v1.14.1) (2021-12-31)

### Bug Fixes

- **admin app:** change icon color ([a118287](https://github.com/betagouv/service-national-universel/commit/a118287f2c7e29b3acdd0f77c65d78885ba8499a))

# [1.14.0](https://github.com/betagouv/service-national-universel/compare/v1.13.0...v1.14.0) (2021-12-24)

### Bug Fixes

- **admin,center:** filter by cohorts in list ([16f6623](https://github.com/betagouv/service-national-universel/commit/16f66238818a490c8d6f0741ea28c37013e3d894))
- **admin,center:** refacto center ([4e1dab3](https://github.com/betagouv/service-national-universel/commit/4e1dab373b0ef4fad6dc7a77fab4727f5a56f7cd))
- **admin,center:** refacto nav bar ([9f0768b](https://github.com/betagouv/service-national-universel/commit/9f0768b879f95746c5aee21f8b1b2c4142ba4db3))
- **admin,center:** remove useless fetch hEAdCenTeR ([3137c4e](https://github.com/betagouv/service-national-universel/commit/3137c4e1e82a0a54696e1dbda4965bd047d6a269))
- **deps:** pin dependency react-cookie to 4.1.1 ([#1034](https://github.com/betagouv/service-national-universel/issues/1034)) ([ced267a](https://github.com/betagouv/service-national-universel/commit/ced267a91c256a1aad8c6a8c33f1a8f1ec23f32e))

### Features

- **api:** add es route sessionPhase1 ([296f929](https://github.com/betagouv/service-national-universel/commit/296f929b71effe15a28e3600f28c52b5c72176af))
- **api,test:** add test sessionPhase1 ([#1009](https://github.com/betagouv/service-national-universel/issues/1009)) ([69be56b](https://github.com/betagouv/service-national-universel/commit/69be56bb7796261d75be19cc2680b983d7322466))
- **app:** add cookie bar and modal ([#1033](https://github.com/betagouv/service-national-universel/issues/1033)) ([b23e2d7](https://github.com/betagouv/service-national-universel/commit/b23e2d74fb5637d55bbef2470c061a6164ccb187))
- **support:** restrict access to public db - v2 ([#1011](https://github.com/betagouv/service-national-universel/issues/1011)) ([00e716b](https://github.com/betagouv/service-national-universel/commit/00e716bd6e38e2b7e1a5e6d0e7a1fe910c807c62))

# [1.13.0](https://github.com/betagouv/service-national-universel/compare/v1.12.1...v1.13.0) (2021-12-23)

### Bug Fixes

- **admin:** cohesion center listing ([#1022](https://github.com/betagouv/service-national-universel/issues/1022)) ([2de9afc](https://github.com/betagouv/service-national-universel/commit/2de9afc851e7b83e4035d00fe7b1d632e101128e))
- **api,test:** jest should work locally ([#1029](https://github.com/betagouv/service-national-universel/issues/1029)) ([4385e8f](https://github.com/betagouv/service-national-universel/commit/4385e8f060f6467564b6bd0a523c05a4873db1cb))

### Features

- **admin:** add export young school in department for referent department ([#1025](https://github.com/betagouv/service-national-universel/issues/1025)) ([e5d4963](https://github.com/betagouv/service-national-universel/commit/e5d4963c24942897462a2b0783ec6e1390ec556a))

## [1.12.1](https://github.com/betagouv/service-national-universel/compare/v1.12.0...v1.12.1) (2021-12-22)

### Bug Fixes

- **api:** base-de-connaissance.snu.gouv.fr ([#1019](https://github.com/betagouv/service-national-universel/issues/1019)) ([6c876ad](https://github.com/betagouv/service-national-universel/commit/6c876ad48f9d0c8578083156e5377b567638c6b0))
- **availability:** enable 1ere CAP for fevrier and juin ([ddfbf28](https://github.com/betagouv/service-national-universel/commit/ddfbf2804ec43013a4b272c18652ca96ed9b9782))
- **invite:** only admin can invite visitor ([4f9bc8e](https://github.com/betagouv/service-national-universel/commit/4f9bc8e42f405c6be0bab8fa0e7a9c1091dc3894))
- **support:** image alt ([#1020](https://github.com/betagouv/service-national-universel/issues/1020)) ([697e9ed](https://github.com/betagouv/service-national-universel/commit/697e9ed89c5e3b749913173115e0f7953e2fcb6e))
- **support:** image delete button appears only on hover ([#1021](https://github.com/betagouv/service-national-universel/issues/1021)) ([d94a271](https://github.com/betagouv/service-national-universel/commit/d94a2711d31878764e1a719ea338809dfba554e6))
- **support:** next build ([#1018](https://github.com/betagouv/service-national-universel/issues/1018)) ([7b7e3a9](https://github.com/betagouv/service-national-universel/commit/7b7e3a92a705535a6f17c30f1e9773d383bd4645))
- **support:** small design fixes ([#1023](https://github.com/betagouv/service-national-universel/issues/1023)) ([1fe6168](https://github.com/betagouv/service-national-universel/commit/1fe6168a13e6c061f10a1a114a548b0a9ac31773))

# [1.12.0](https://github.com/betagouv/service-national-universel/compare/v1.11.0...v1.12.0) (2021-12-22)

### Bug Fixes

- **app-drawer:** fix subtitle phase status ([b6e232e](https://github.com/betagouv/service-national-universel/commit/b6e232e6a22fc2a7d890e342dfe895cb904ae77b))
- **auth:** change forgot password wording ([d76cfd1](https://github.com/betagouv/service-national-universel/commit/d76cfd18412469c7c40157fc53d1c3ded11600b4))

### Features

- **admin:** add roles control on dashboard ([#1012](https://github.com/betagouv/service-national-universel/issues/1012)) ([1dd7a01](https://github.com/betagouv/service-national-universel/commit/1dd7a01ba682e4efb82fb91bca96879f9060fe86))
- **admin:** add visitor role ([#1003](https://github.com/betagouv/service-national-universel/issues/1003)) ([b9f7266](https://github.com/betagouv/service-national-universel/commit/b9f7266b53f2c8c481d1cefd8133b8f04b1e4a20))
- **support:** add loaders ([#1007](https://github.com/betagouv/service-national-universel/issues/1007)) ([7df0b36](https://github.com/betagouv/service-national-universel/commit/7df0b3688a04cd62f0dcbb7c26fe2c88a9fc4083))
- **support:** redirect to google form if no answer ([#1013](https://github.com/betagouv/service-national-universel/issues/1013)) ([d54e197](https://github.com/betagouv/service-national-universel/commit/d54e1973e62c77bb3bc2157f49a647b72468c669))

# [1.11.0](https://github.com/betagouv/service-national-universel/compare/v1.10.3...v1.11.0) (2021-12-21)

### Bug Fixes

- **applicationStatus:** remove option CANCEL ([e30b6e1](https://github.com/betagouv/service-national-universel/commit/e30b6e196b8eadaf3e6954cde05ad991e22565e6))
- **cron:** activate the pushMission cron for everyone ([8ea831b](https://github.com/betagouv/service-national-universel/commit/8ea831bdaf1c92ff4474d7033af2c56915b36bb9))
- **phase1:** exclude all dom toms for february session ([35f570b](https://github.com/betagouv/service-national-universel/commit/35f570bc51aa892f758771101ed3c7184cc4ca61))

### Features

- add field sessionPhase1Id in models ([#1006](https://github.com/betagouv/service-national-universel/issues/1006)) ([2e9414f](https://github.com/betagouv/service-national-universel/commit/2e9414f1939144caa332b890079f479e6d7d5828))
- controller session phase 1 ([#1005](https://github.com/betagouv/service-national-universel/issues/1005)) ([c521880](https://github.com/betagouv/service-national-universel/commit/c521880829c4450cec42ab4417270b9aa5ac6fe0))
- **support:** zammad migration ([#1004](https://github.com/betagouv/service-national-universel/issues/1004)) ([7dadba0](https://github.com/betagouv/service-national-universel/commit/7dadba095a121d765707c05f299bde3d3af6a691))

## [1.10.3](https://github.com/betagouv/service-national-universel/compare/v1.10.2...v1.10.3) (2021-12-17)

### Bug Fixes

- **deps:** pin dependencies ([#995](https://github.com/betagouv/service-national-universel/issues/995)) ([5aef953](https://github.com/betagouv/service-national-universel/commit/5aef953a480ca124314dde4d04f471a32e4250b1))
- **deps:** update dependency express to v4.17.2 ([#1000](https://github.com/betagouv/service-national-universel/issues/1000)) ([fdeaf72](https://github.com/betagouv/service-national-universel/commit/fdeaf7212acbb8b33ea1926570a7a512bf069d5a))

## [1.10.2](https://github.com/betagouv/service-national-universel/compare/v1.10.1...v1.10.2) (2021-12-17)

### Bug Fixes

- **deps:** update dependency i18n-iso-countries to v7.2.0 ([#982](https://github.com/betagouv/service-national-universel/issues/982)) ([b110354](https://github.com/betagouv/service-national-universel/commit/b110354d9842eb148e97f7c8b5adbf9e0a5170ec))

## [1.10.1](https://github.com/betagouv/service-national-universel/compare/v1.10.0...v1.10.1) (2021-12-17)

### Bug Fixes

- **deps:** update dependency core-js to v3.20.0 ([#992](https://github.com/betagouv/service-national-universel/issues/992)) ([caa78ac](https://github.com/betagouv/service-national-universel/commit/caa78ac6e4997760cd778b60217347a0473d860d))
- **deps:** update dependency slugify to v1.6.4 ([#996](https://github.com/betagouv/service-national-universel/issues/996)) ([bbba92a](https://github.com/betagouv/service-national-universel/commit/bbba92abd0ed36e44bc25612480bce9cb19b0a1a))

# [1.10.0](https://github.com/betagouv/service-national-universel/compare/v1.9.2...v1.10.0) (2021-12-16)

### Features

- **api:** add model sessionPhase1 ([#997](https://github.com/betagouv/service-national-universel/issues/997)) ([c1bf8ac](https://github.com/betagouv/service-national-universel/commit/c1bf8ac7e1f971fb88e4943acd3b9045fa46e28f))

## [1.9.2](https://github.com/betagouv/service-national-universel/compare/v1.9.1...v1.9.2) (2021-12-16)

### Bug Fixes

- **admin:** 2 steps finding departments ([#999](https://github.com/betagouv/service-national-universel/issues/999)) ([3b76648](https://github.com/betagouv/service-national-universel/commit/3b76648162d615437dbb6053c68ebd459226462c))

## [1.9.1](https://github.com/betagouv/service-national-universel/compare/v1.9.0...v1.9.1) (2021-12-16)

### Bug Fixes

- add uai in export young ([9640013](https://github.com/betagouv/service-national-universel/commit/9640013b423385dda45ed23b2b7133fb6833634f))

# [1.9.0](https://github.com/betagouv/service-national-universel/compare/v1.8.5...v1.9.0) (2021-12-16)

### Features

- **support:** zammad first migration ([#994](https://github.com/betagouv/service-national-universel/issues/994)) ([bb8ce0f](https://github.com/betagouv/service-national-universel/commit/bb8ce0fb4f0b5ea621b0b1a7648f5d5103aac2d9))

## [1.8.5](https://github.com/betagouv/service-national-universel/compare/v1.8.4...v1.8.5) (2021-12-16)

### Bug Fixes

- **inscription:** add infos residence outre mer ([176f2e0](https://github.com/betagouv/service-national-universel/commit/176f2e02c156c16893ac9579519f4ce0696b49ee))

## [1.8.4](https://github.com/betagouv/service-national-universel/compare/v1.8.3...v1.8.4) (2021-12-16)

### Bug Fixes

- wording dashboard ([19c4eca](https://github.com/betagouv/service-national-universel/commit/19c4ecab49520d22aedda8526f5353fe91a666b8))

## [1.8.3](https://github.com/betagouv/service-national-universel/compare/v1.8.2...v1.8.3) (2021-12-16)

### Bug Fixes

- **patches:** add from user (contract) ([#990](https://github.com/betagouv/service-national-universel/issues/990)) ([53b5495](https://github.com/betagouv/service-national-universel/commit/53b5495e7f436c427921bc3683b5d6776bca9f24))

## [1.8.2](https://github.com/betagouv/service-national-universel/compare/v1.8.1...v1.8.2) (2021-12-16)

### Bug Fixes

- **app:** withdrawn in inscription ([3bda83a](https://github.com/betagouv/service-national-universel/commit/3bda83ac1cab077a69b826b5adcb0a6a83569b0f))

## [1.8.1](https://github.com/betagouv/service-national-universel/compare/v1.8.0...v1.8.1) (2021-12-16)

### Bug Fixes

- desistement url ([#986](https://github.com/betagouv/service-national-universel/issues/986)) ([238971d](https://github.com/betagouv/service-national-universel/commit/238971d25defd122eb0ffe29d03f15af32a54c71))

# [1.8.0](https://github.com/betagouv/service-national-universel/compare/v1.7.0...v1.8.0) (2021-12-15)

### Features

- app inscription infos ([#991](https://github.com/betagouv/service-national-universel/issues/991)) ([a205941](https://github.com/betagouv/service-national-universel/commit/a20594167d95b4f2bd004dd016733b5f7bde8ee6))

# [1.7.0](https://github.com/betagouv/service-national-universel/compare/v1.6.3...v1.7.0) (2021-12-15)

### Features

- **patches:** add patches on contract ([4473050](https://github.com/betagouv/service-national-universel/commit/4473050d131f72fefd4bd3e409d5811e81e24e60))

## [1.6.3](https://github.com/betagouv/service-national-universel/compare/v1.6.2...v1.6.3) (2021-12-15)

### Bug Fixes

- display correctionMessage if young is waiting_validation ([e708e2e](https://github.com/betagouv/service-national-universel/commit/e708e2ef7e68c3173ea163df3d6a9789680b28d8))

## [1.6.2](https://github.com/betagouv/service-national-universel/compare/v1.6.1...v1.6.2) (2021-12-15)

### Bug Fixes

- **cron:** add cohort in logs ([669152f](https://github.com/betagouv/service-national-universel/commit/669152f92da94be38f3fc9e9e712cd82dc28d2bb))

## [1.6.1](https://github.com/betagouv/service-national-universel/compare/v1.6.0...v1.6.1) (2021-12-15)

### Bug Fixes

- **cron:** add count by cohort ([4dc1342](https://github.com/betagouv/service-national-universel/commit/4dc1342d607ab173b0de2ccafe8fdd0d4607fef9))

# [1.6.0](https://github.com/betagouv/service-national-universel/compare/v1.5.1...v1.6.0) (2021-12-15)

### Features

- **cron:** push mission(s) to youngs ([#987](https://github.com/betagouv/service-national-universel/issues/987)) ([80dcc67](https://github.com/betagouv/service-national-universel/commit/80dcc67263eb996ad45179939e32fad0adfb6077))

## [1.5.1](https://github.com/betagouv/service-national-universel/compare/v1.5.0...v1.5.1) (2021-12-14)

### Bug Fixes

- availability non-eligible ([6c43a00](https://github.com/betagouv/service-national-universel/commit/6c43a003a61a4d5270f7e1a3f3733e3c8f040f95))

# [1.5.0](https://github.com/betagouv/service-national-universel/compare/v1.4.1...v1.5.0) (2021-12-14)

### Features

- **support:** allowed roles ([#984](https://github.com/betagouv/service-national-universel/issues/984)) ([89d425f](https://github.com/betagouv/service-national-universel/commit/89d425f4742bc64e1fa8af4813bf4acde64ab26f))

## [1.4.1](https://github.com/betagouv/service-national-universel/compare/v1.4.0...v1.4.1) (2021-12-14)

### Bug Fixes

- **addressInput:** fix update depart and region onChange zip ([7b8000b](https://github.com/betagouv/service-national-universel/commit/7b8000b549f441b20985d7b732de98b6cea9017e))

# [1.4.0](https://github.com/betagouv/service-national-universel/compare/v1.3.3...v1.4.0) (2021-12-14)

### Features

- admin center - step1 ([#973](https://github.com/betagouv/service-national-universel/issues/973)) ([d1c895c](https://github.com/betagouv/service-national-universel/commit/d1c895c1fdbf541d6e7e20515e1cc00a45dec58c))

## [1.3.3](https://github.com/betagouv/service-national-universel/compare/v1.3.2...v1.3.3) (2021-12-14)

### Bug Fixes

- **deps:** update dependency swr to v1.1.1 ([#976](https://github.com/betagouv/service-national-universel/issues/976)) ([4194073](https://github.com/betagouv/service-national-universel/commit/4194073dab0ea0c3aa7e0cddb5092df8e163737d))

## [1.3.2](https://github.com/betagouv/service-national-universel/compare/v1.3.1...v1.3.2) (2021-12-14)

### Bug Fixes

- **support:** knowledge base review ([#981](https://github.com/betagouv/service-national-universel/issues/981)) ([5ec3767](https://github.com/betagouv/service-national-universel/commit/5ec37675afcdcb1a393dfa2b392066db71d4df32))

## [1.3.1](https://github.com/betagouv/service-national-universel/compare/v1.3.0...v1.3.1) (2021-12-13)

### Bug Fixes

- **deps:** update sentry-javascript monorepo to v6.16.1 ([#938](https://github.com/betagouv/service-national-universel/issues/938)) ([1531c34](https://github.com/betagouv/service-national-universel/commit/1531c34b74d348934213258b4e22b893f5e62a5d))

# [1.3.0](https://github.com/betagouv/service-national-universel/compare/v1.2.0...v1.3.0) (2021-12-13)

### Features

- **zammad:** add infos in user's profile ([#978](https://github.com/betagouv/service-national-universel/issues/978)) ([78b3a4d](https://github.com/betagouv/service-national-universel/commit/78b3a4d1af013af6842e95fb8fe1e38f2889494f))

# [1.2.0](https://github.com/betagouv/service-national-universel/compare/v1.1.8...v1.2.0) (2021-12-13)

### Features

- **inscription:** changement ordre étape inscription ([#839](https://github.com/betagouv/service-national-universel/issues/839)) ([675b93e](https://github.com/betagouv/service-national-universel/commit/675b93ed38c81051e26257eea680ad3b6b207c50))

## [1.1.8](https://github.com/betagouv/service-national-universel/compare/v1.1.7...v1.1.8) (2021-12-13)

### Bug Fixes

- **address:** update department, region and academy with zip ([e48588a](https://github.com/betagouv/service-national-universel/commit/e48588a5a6cd398a3fa43d024cfb8d311f08e020))

## [1.1.7](https://github.com/betagouv/service-national-universel/compare/v1.1.6...v1.1.7) (2021-12-13)

### Bug Fixes

- **support:** redirect if not connected ([27e2a76](https://github.com/betagouv/service-national-universel/commit/27e2a763dba42dcd50371d7e8951ae8664d1416d))

## [1.1.6](https://github.com/betagouv/service-national-universel/compare/v1.1.5...v1.1.6) (2021-12-13)

### Bug Fixes

- **support:** add name in slack notification ([fdded54](https://github.com/betagouv/service-national-universel/commit/fdded5402e7be3e6dca572bc000cee13d01806f9))

## [1.1.5](https://github.com/betagouv/service-national-universel/compare/v1.1.4...v1.1.5) (2021-12-13)

### Bug Fixes

- **patches:** style see more button ([5f0aa5f](https://github.com/betagouv/service-national-universel/commit/5f0aa5fcf36b8ec4b86b0daafdc24cd26b79a6ee))

## [1.1.4](https://github.com/betagouv/service-national-universel/compare/v1.1.3...v1.1.4) (2021-12-13)

### Bug Fixes

- **patches:** referents can see patches ([a7e50e9](https://github.com/betagouv/service-national-universel/commit/a7e50e9d290e01ba942cecc0767c4b632b0185ad))

## [1.1.3](https://github.com/betagouv/service-national-universel/compare/v1.1.2...v1.1.3) (2021-12-13)

### Bug Fixes

- **young edition:** change birthdate - january ([eba06c2](https://github.com/betagouv/service-national-universel/commit/eba06c206258d6f5caa3e20e80e6fd0a4e9bd37b))

## [1.1.2](https://github.com/betagouv/service-national-universel/compare/v1.1.1...v1.1.2) (2021-12-13)

### Bug Fixes

- **deps:** update dependency slate-react to v0.72.1 ([#974](https://github.com/betagouv/service-national-universel/issues/974)) ([9b3a7cb](https://github.com/betagouv/service-national-universel/commit/9b3a7cbdeb2876d17b961a45d50cdd24f2f48a6c))

## [1.1.1](https://github.com/betagouv/service-national-universel/compare/v1.1.0...v1.1.1) (2021-12-10)

### Bug Fixes

- destructure tags ([431755f](https://github.com/betagouv/service-national-universel/commit/431755fd9f960c3900e48c9cff22cce94b67e368))

# [1.1.0](https://github.com/betagouv/service-national-universel/compare/v1.0.2...v1.1.0) (2021-12-10)

### Features

- add slack notification on technical ticket ([293a418](https://github.com/betagouv/service-national-universel/commit/293a41810201f26c8753e118773683cceaaf40d7))

## [1.0.2](https://github.com/betagouv/service-national-universel/compare/v1.0.1...v1.0.2) (2021-12-10)

### Bug Fixes

- **ci:** deploy api ([df820f1](https://github.com/betagouv/service-national-universel/commit/df820f1235563ac2d0bd0e3c323e18e87ad0f9a0))

## [1.0.1](https://github.com/betagouv/service-national-universel/compare/v1.0.0...v1.0.1) (2021-12-10)

### Bug Fixes

- **ci:** fix changleog ([#972](https://github.com/betagouv/service-national-universel/issues/972)) ([86d81f0](https://github.com/betagouv/service-national-universel/commit/86d81f0f819eb6c7e8b3463ad5c89c68b182fa99))

# 1.0.0 (2021-12-10)

### Bug Fixes

- .fr ([4d750c5](https://github.com/betagouv/service-national-universel/commit/4d750c59bb07cdf468176dc3d255ed986d049062))
- (re)open ticket on message from an agent ([5918905](https://github.com/betagouv/service-national-universel/commit/5918905f18b5916e664cfa1b1a7d6e1ca82f8cf1))
- 400 bad ID for contract ([ccdb315](https://github.com/betagouv/service-national-universel/commit/ccdb3158ef52f00ff91e9fc167abc98d14f543ee))
- 404 when not found ([869f24d](https://github.com/betagouv/service-national-universel/commit/869f24daa31b76cd447e5ee2c8cf324ef887edc4))
- 404 when template not found ([19d3f03](https://github.com/betagouv/service-national-universel/commit/19d3f03773cc34545b7823ec11e2ab1ced1d7a7e))
- academy constant ([07b3a29](https://github.com/betagouv/service-national-universel/commit/07b3a29a0321bf7e5ef364b98552f5ca15adf475))
- accept empty in cohesionStayPresence model ([df8129d](https://github.com/betagouv/service-national-universel/commit/df8129d80fc60f35c97fdc9567bc7713e4487ad3))
- accept empty values for cohesionStayPresence ([3955190](https://github.com/betagouv/service-national-universel/commit/39551907c42595a25d14aa3165a3c7eaca9d8509))
- accept pm ([03e1cee](https://github.com/betagouv/service-national-universel/commit/03e1ceea9410469a59fe2eed9611a30659e81710))
- activate cron ([d31a103](https://github.com/betagouv/service-national-universel/commit/d31a1036a2e86252efa804270bb55ef45f4a88de))
- add academy dashboard ([6b87787](https://github.com/betagouv/service-national-universel/commit/6b87787841da2dce67a6c2a4e378d4abe4548b22))
- add address on center ([1c2039c](https://github.com/betagouv/service-national-universel/commit/1c2039c9879834d13eddf54d03bd86a7410ab2a2))
- add cgu in footer ([3108eab](https://github.com/betagouv/service-national-universel/commit/3108eab80c82ad3de71aac313f08d11a20c2c48d))
- add column state ([9ad32f8](https://github.com/betagouv/service-national-universel/commit/9ad32f8905b5011031c034dc30ba14e76ef514aa))
- add confirm message pm files ([437072b](https://github.com/betagouv/service-national-universel/commit/437072bb103b273878b4da0187dcd2e1bf1fba64))
- add consentement in panel inscription ([ef811b2](https://github.com/betagouv/service-national-universel/commit/ef811b276f0126e5bb67f89c854fab77be407b8a))
- add consentment file ([e5afdec](https://github.com/betagouv/service-national-universel/commit/e5afdecfe7e1f5420635665926f1e0ab1ad83965))
- add contact in dashboard support list ([0c474f5](https://github.com/betagouv/service-national-universel/commit/0c474f5ad92743488aee6be50bf069f56561a411))
- add date in attestation ([3999cd4](https://github.com/betagouv/service-national-universel/commit/3999cd4549b33636ca4ed8313fa592ee824922d7))
- add excluded status in goals ([0d97dab](https://github.com/betagouv/service-national-universel/commit/0d97dab7d88b6000c204ffafdff33c4c96764dd8))
- add fields admin ([#786](https://github.com/betagouv/service-national-universel/pull/786)) ([fba60bb](https://github.com/betagouv/service-national-universel/commit/fba60bb133bcae2e62a1d94d2987feac7db4a7ae))
- add file notes relatives ([205b35f](https://github.com/betagouv/service-national-universel/commit/205b35fee070db7c002a09a2675c9201117ea152))
- add filter department in young mission ([eb921a9](https://github.com/betagouv/service-national-universel/commit/eb921a9781831aa867f46ad3a740411e636b541b))
- add filter young in mission ([74905e7](https://github.com/betagouv/service-national-universel/commit/74905e7f9ff33bd445e9bbc7a1793aecb0773206))
- add group and remove useless routes ([a67b18e](https://github.com/betagouv/service-national-universel/commit/a67b18e03c3603c460ed6e4ad57e6b4e82655198))
- add gtag again ([#174](https://github.com/betagouv/service-national-universel/pull/174)) ([67e8fe3](https://github.com/betagouv/service-national-universel/commit/67e8fe30e1486a611bf20f41f519fd253527d83c))
- add history ([846e51c](https://github.com/betagouv/service-national-universel/commit/846e51c222e0328d4646c983f1c946d39909b804))
- add infos in stepAvailability ([efcfcfe](https://github.com/betagouv/service-national-universel/commit/efcfcfee737456732c32518753885657e321b9ba))
- add label 'moi' in chat ([14bafe4](https://github.com/betagouv/service-national-universel/commit/14bafe4cb32d461d5cf310d7a18971aee707ce9d))
- add link in phase2 home ([5795922](https://github.com/betagouv/service-national-universel/commit/579592201225e83aa81cf492fe0889e87d3e7f07))
- add loading button ([ace8f74](https://github.com/betagouv/service-national-universel/commit/ace8f74bd01006b4ac65ae3e5241613f595a2721))
- add message availability for every sessions ([f239ef4](https://github.com/betagouv/service-national-universel/commit/f239ef4a5313636c82f08d3f78197ea87e613dba))
- add missing fields in export ([#791](https://github.com/betagouv/service-national-universel/pull/791)) ([0431ee6](https://github.com/betagouv/service-national-universel/commit/0431ee6403c1bfc1802ef0205e6638370e7a9496))
- add network mission in list ([8c10d7d](https://github.com/betagouv/service-national-universel/commit/8c10d7d421b068233d803ef05f1f9f71b7bbb370))
- add possibility exempted for phase1 ([3e025a0](https://github.com/betagouv/service-national-universel/commit/3e025a003590b413ff7681df38380ad53951af18))
- add priority in export applications ([c4818c0](https://github.com/betagouv/service-national-universel/commit/c4818c0fc09537e304fed250230800980c6c6899))
- add state in dashboard support ([90f0eac](https://github.com/betagouv/service-national-universel/commit/90f0eacc4028ca2e2546c58fb538b1493ccdf305))
- add status indicator ([1a6bb90](https://github.com/betagouv/service-national-universel/commit/1a6bb90397b28f5e62e5cb71bc3f31db3e9471ca))
- add status message ([cd50d13](https://github.com/betagouv/service-national-universel/commit/cd50d1325b49b62c3379eddb428a65bc9c78102a))
- add Tag for referent ([425582f](https://github.com/betagouv/service-national-universel/commit/425582fde25cef9fd9315c9edf41e898b6ea2bed))
- add tags tickets - v1 ([85c8508](https://github.com/betagouv/service-national-universel/commit/85c850878f893376c97bc4054183292df3ea6ece))
- add template id ([c300009](https://github.com/betagouv/service-national-universel/commit/c3000094ede832755e6485660faec5ccd42810ab))
- add unknown ([f0ee6cd](https://github.com/betagouv/service-national-universel/commit/f0ee6cd291e8a372a95efc597f248f1b119e94e6))
- add user in validation ([5cfbb6f](https://github.com/betagouv/service-national-universel/commit/5cfbb6ff923b128f3261cf438d059cce84ac9850))
- add view button in inscription list ([e088c57](https://github.com/betagouv/service-national-universel/commit/e088c572e9ed101cb8c686a7b658ae211234148c))
- add withdrawn button in inscription drawer ([01d54ab](https://github.com/betagouv/service-national-universel/commit/01d54ab07f633b9d075434adf718700807dd5882))
- add young infos ([78e367e](https://github.com/betagouv/service-national-universel/commit/78e367ec5223d55b187a74b8c6725a2e1136ca1e))
- admin.snu.gouv.fr ([9adffc3](https://github.com/betagouv/service-national-universel/commit/9adffc34bd4cb968f586651eaffa83e0b24d2530))
- **admin:** add new young fields ([#727](https://github.com/betagouv/service-national-universel/pull/727)) ([1b14aee](https://github.com/betagouv/service-national-universel/commit/1b14aeee1cc48b2f20a503e47396ebf4d74123db))
- **admin:** cant add goal for Wallis et Futuna ([#811](https://github.com/betagouv/service-national-universel/pull/811)) ([abb2228](https://github.com/betagouv/service-national-universel/commit/abb22288a5cd907b253e1f829fefed7afe83291e))
- **admin:** create a mission from young screen ([#814](https://github.com/betagouv/service-national-universel/pull/814)) ([c4637c1](https://github.com/betagouv/service-national-universel/commit/c4637c1baf755c141be2f622464a1887bf5bf2b2))
- **admin:** message when changing email ([#701](https://github.com/betagouv/service-national-universel/pull/701)) ([3a7f831](https://github.com/betagouv/service-national-universel/commit/3a7f8312fecf424293a5090ee2f7d30e05fb9b96)), closes [#697](https://github.com/betagouv/service-national-universel/pull/697)
- affichage nombre de place dans l'historique ([#765](https://github.com/betagouv/service-national-universel/pull/765)) ([192de47](https://github.com/betagouv/service-national-universel/commit/192de478c866299dbb90a1e515e25ab390489ec4))
- age eligibility ([5a37634](https://github.com/betagouv/service-national-universel/commit/5a3763406ece910582333b0c67ed5de4aa82a19a))
- ajouter bouton retour en vue mobile ([#709](https://github.com/betagouv/service-national-universel/pull/709)) ([a9a51d3](https://github.com/betagouv/service-national-universel/commit/a9a51d3844ee8284d0d6cac96fcc3beaab202398))
- alert goal reached 2022 ([#924](https://github.com/betagouv/service-national-universel/pull/924)) ([50a4738](https://github.com/betagouv/service-national-universel/commit/50a47380e35b27d3f7b7a6816e6ff201e1c3c2c0))
- allow empty file ([6b22b06](https://github.com/betagouv/service-national-universel/commit/6b22b060c079d273f0b61fd47b38aacea2d63c3f))
- allow youngs to log in ([49647af](https://github.com/betagouv/service-national-universel/commit/49647af5cb4c8c3028172ee8ee474c7e4a36700e))
- **app:** handle connexion lost to ES ([#739](https://github.com/betagouv/service-national-universel/pull/739)) ([62f5a0b](https://github.com/betagouv/service-national-universel/commit/62f5a0b9e4d717346baa0c3fb3ab2278c04459df))
- **application:** fix validate files for military preparation ([83ca2a6](https://github.com/betagouv/service-national-universel/commit/83ca2a6e9f9224886c015e8e6b2bacb21691293f))
- **application:** hotfix wording modal ([1ff6019](https://github.com/betagouv/service-national-universel/commit/1ff60190624df1940a0a46c5c94c2753924909c3))
- **application:** lookup proposition application status ([49872e6](https://github.com/betagouv/service-national-universel/commit/49872e6558e230c4e72060d1385fd437e7f97250))
- **association:** count places ([#559](https://github.com/betagouv/service-national-universel/pull/559)) ([0ddc0ce](https://github.com/betagouv/service-national-universel/commit/0ddc0ce9b8b0016e023b3ca744ac47868d16dac0)), closes [#553](https://github.com/betagouv/service-national-universel/pull/553)
- **association:** optimize mission loading ([#562](https://github.com/betagouv/service-national-universel/pull/562)) ([12781ad](https://github.com/betagouv/service-national-universel/commit/12781ad8f36eff79f324f05e2b41d812592c9b93)), closes [#554](https://github.com/betagouv/service-national-universel/pull/554) [#566](https://github.com/betagouv/service-national-universel/pull/566)
- **association:** text with parenthesis ([#558](https://github.com/betagouv/service-national-universel/pull/558)) ([d8489bc](https://github.com/betagouv/service-national-universel/commit/d8489bc5e86cdd383e815afff7ffa53813a7b3eb)), closes [#552](https://github.com/betagouv/service-national-universel/pull/552)
- associationTypes filter ([09a3f43](https://github.com/betagouv/service-national-universel/commit/09a3f43609f38e332eae465b5f5183eac299b0d2))
- attestation in details ([0288195](https://github.com/betagouv/service-national-universel/commit/0288195f575d90dd2a9a75e835379f1bc484d734))
- beautify modals ([c119f43](https://github.com/betagouv/service-national-universel/commit/c119f436dcd04a563ccb604feb9635ecf9b2c789))
- beautify modals ([aa6fe83](https://github.com/betagouv/service-national-universel/commit/aa6fe83cb915257db0f4fabd507d9617705ca00d))
- **besoindaide:** connection link style ([36785ed](https://github.com/betagouv/service-national-universel/commit/36785ed5a97191fca92d46ed64e393eaa46efb63))
- blink status (alternative version) ([#300](https://github.com/betagouv/service-national-universel/pull/300)) ([90d88fb](https://github.com/betagouv/service-national-universel/commit/90d88fb60bf752841e37bbc04c95a3bd3d520c57))
- block access screen phase2 ([#909](https://github.com/betagouv/service-national-universel/pull/909)) ([b1bc8a8](https://github.com/betagouv/service-national-universel/commit/b1bc8a8ad6a05bd798859aef0b88485ee319cf67))
- block inscription for old cohort ([997f0e9](https://github.com/betagouv/service-national-universel/commit/997f0e94e492f64d3b2968ffa16e0668bbc6ef66))
- browser-compat ([#97](https://github.com/betagouv/service-national-universel/pull/97)) ([c4e6648](https://github.com/betagouv/service-national-universel/commit/c4e6648d595896b026b2bd4fc02c6dfce9ec82da))
- bug cookies ([#827](https://github.com/betagouv/service-national-universel/pull/827)) ([17141aa](https://github.com/betagouv/service-national-universel/commit/17141aa19a7eba28c8b51229ec4ba996c8cf71b0))
- bug coordonnées step ([#669](https://github.com/betagouv/service-national-universel/pull/669)) ([5deff20](https://github.com/betagouv/service-national-universel/commit/5deff20d7c406313a64842b74a378ab2d1c16e44))
- bug on new contract ([f4664be](https://github.com/betagouv/service-national-universel/commit/f4664bea01b9fa4b48417817a68ea44476f22789))
- button confirm ([92bc229](https://github.com/betagouv/service-national-universel/commit/92bc229d74527e067b1175e035e1c854dc3adf24))
- cancel app pm ([3fbecb8](https://github.com/betagouv/service-national-universel/commit/3fbecb8c3903c5ad1f590ae8c47841dc93af032e))
- cancel military preparation ([d7544e0](https://github.com/betagouv/service-national-universel/commit/d7544e07c0302ed08a9effb5a6ecdef6f0a6ece5))
- cannot change for WITHDRAWN ([ed3edf9](https://github.com/betagouv/service-national-universel/commit/ed3edf94b887123cb62c8b8d220d7c73d918ee64))
- canSigninAs ([975df3c](https://github.com/betagouv/service-national-universel/commit/975df3ce69015fc1b1e7ccbc73c67ecd099ae665))
- center view missions ([97d9ecb](https://github.com/betagouv/service-national-universel/commit/97d9ecbc37dc28f92c30aefc6926a4f64746dce0))
- **certificate:** move date in text (comprehension issue) ([704a9be](https://github.com/betagouv/service-national-universel/commit/704a9be3206008b76a027d00f1e2674ef558877c))
- **CGU:** add in admin ([#695](https://github.com/betagouv/service-national-universel/pull/695)) ([3d4b6e5](https://github.com/betagouv/service-national-universel/commit/3d4b6e5218393e341506339be0605be4f44271df))
- **CGU:** style ([f1d8402](https://github.com/betagouv/service-national-universel/commit/f1d84027920fcc6b983a361300b932c3c8f963b2))
- change component address admin ([#956](https://github.com/betagouv/service-national-universel/pull/956)) ([440119c](https://github.com/betagouv/service-national-universel/commit/440119c33eb8e4fec85c47467d9eae113119e438))
- change name route support to besoin-d-aide ([bd57524](https://github.com/betagouv/service-national-universel/commit/bd57524f91eedf6acbfe30c3a1b1746edbcf48bf))
- changement de status - referent ([6ef3d8c](https://github.com/betagouv/service-national-universel/commit/6ef3d8ce8049ad0e76ce0dae89b64e8adb1c531c))
- chat ([a7d48ee](https://github.com/betagouv/service-national-universel/commit/a7d48eef767b3f4845ea8be7eb124b0dcc8a490b))
- check if young is an object ([#741](https://github.com/betagouv/service-national-universel/pull/741)) ([cb4c286](https://github.com/betagouv/service-national-universel/commit/cb4c2865e14056285b60cdcc3107fb4830bb092c))
- **ci:** jest ignore dirs ([d32fe1d](https://github.com/betagouv/service-national-universel/commit/d32fe1d303a01d92152b3f2b8ffb9449c4b996f6))
- cityCode in AddressInput ([#769](https://github.com/betagouv/service-national-universel/pull/769)) ([99cc57d](https://github.com/betagouv/service-national-universel/commit/99cc57dbb0665a16fea05bcea3015e6eee10260c))
- clean list ([0d8eb1b](https://github.com/betagouv/service-national-universel/commit/0d8eb1b3317c84d3c7054c74e4539c41219800bc))
- clean log cron ([b7090b1](https://github.com/betagouv/service-national-universel/commit/b7090b103587ea30ecda648146c2be887c4435b4))
- click everywhere ([eff4f25](https://github.com/betagouv/service-national-universel/commit/eff4f2534bb0b678f575f5222becca0cb260bfff))
- click on young list ([2f8d51d](https://github.com/betagouv/service-national-universel/commit/2f8d51df5a07135dc1be6bc2226451f1c163c5e8))
- cohort ([ae92e06](https://github.com/betagouv/service-national-universel/commit/ae92e06023572254a7c81298d0d17f3bae29f72a))
- color pruple button ([#549](https://github.com/betagouv/service-national-universel/pull/549)) ([ffedd5f](https://github.com/betagouv/service-national-universel/commit/ffedd5f8ec3eaa43aed6b37122d4aee8a8818f0d))
- connection issues ([#764](https://github.com/betagouv/service-national-universel/pull/764)) ([60ca3f4](https://github.com/betagouv/service-national-universel/commit/60ca3f40a693da693d9bcd205164d921b0106ce6)), closes [#759](https://github.com/betagouv/service-national-universel/pull/759)
- consentements checked ([#699](https://github.com/betagouv/service-national-universel/pull/699)) ([35b3c3c](https://github.com/betagouv/service-national-universel/commit/35b3c3c33abd122e7d270a313710f5bf6b94611d))
- contract list ([02cb2e0](https://github.com/betagouv/service-national-universel/commit/02cb2e0ce4812255f2e60649ae2000fb44c588c9))
- **contract:** send contract to young once it is validated ([#586](https://github.com/betagouv/service-national-universel/pull/586)) ([614872f](https://github.com/betagouv/service-national-universel/commit/614872fb416c0724523959289208f254329f17ac))
- controller cohort-session ([b1072be](https://github.com/betagouv/service-national-universel/commit/b1072beb4d91ee94a6dd8b791824fca1262aff43))
- cookie domain ([134f7f5](https://github.com/betagouv/service-national-universel/commit/134f7f5592cf3790de92eefe734cc383430a6e7d))
- cookie for staging (waiting for valid subdomain) ([e2cfea7](https://github.com/betagouv/service-national-universel/commit/e2cfea707c71bb6f9345523b0a46e12b68eb4b30))
- **cors:** add https ([6489f09](https://github.com/betagouv/service-national-universel/commit/6489f0963c02ae47765e077a5656c33717da574d))
- count mails ([b9a6450](https://github.com/betagouv/service-national-universel/commit/b9a64509183ede2d008c241fca9e31c836bf23e1))
- create mission ([9c9a747](https://github.com/betagouv/service-national-universel/commit/9c9a7472f54d80d8b8fe8e53187a6b7cd9d556ad))
- createMission - no validation tutorId when creating tutor ([4724b3c](https://github.com/betagouv/service-national-universel/commit/4724b3c70a0db392d0d3ff61dff1b567a50249e3))
- créer nouveau composant AddressInput ([#662](https://github.com/betagouv/service-national-universel/pull/662)) ([0668d42](https://github.com/betagouv/service-national-universel/commit/0668d42acefc2c344893f8c7f9b2f32831611c97))
- cron recap - only 5 departments for first batch ([e3be949](https://github.com/betagouv/service-national-universel/commit/e3be94900c5cd21d636beb7e07c5eb8201e6d404))
- dashboards ([78f882d](https://github.com/betagouv/service-national-universel/commit/78f882d8a4e17c4e034fedde7a4485a4a13982bb))
- date format export ([4551501](https://github.com/betagouv/service-national-universel/commit/45515013fd1a6398225c10b344b824eef638621f))
- date on certificate phase 2 ([31ef1b4](https://github.com/betagouv/service-national-universel/commit/31ef1b438933b99b864be8802744a409dc5cdd2c))
- default cohort is 2022 ([e90d169](https://github.com/betagouv/service-national-universel/commit/e90d169688682f7c7627e0ef0e722ca0eeddf220))
- delete center ([547d4e6](https://github.com/betagouv/service-national-universel/commit/547d4e6a8e799059d3411ca087f430989d226c8a))
- delete structure ([a868b32](https://github.com/betagouv/service-national-universel/commit/a868b32f47a8a4185a4d4a54928cbafd582dfd71))
- dep and region ([#742](https://github.com/betagouv/service-national-universel/pull/742)) ([8d7e18f](https://github.com/betagouv/service-national-universel/commit/8d7e18f80f4701d5af544beda2a538c69a8b748e))
- deploy fix ([9670577](https://github.com/betagouv/service-national-universel/commit/9670577ee72da59858318d9bb7daaa68d3d32a86))
- **deps:** pin dependencies ([#865](https://github.com/betagouv/service-national-universel/pull/865)) ([8311800](https://github.com/betagouv/service-national-universel/commit/83118001be011640b1ac5b1a10a28ee484ea6cd6))
- **deps:** pin dependencies ([#955](https://github.com/betagouv/service-national-universel/pull/955)) ([ce040b5](https://github.com/betagouv/service-national-universel/commit/ce040b5ef726b7d69e6d5233b961b0ed6b3f0c5b))
- **deps:** pin dependency validator to 13.7.0 ([#934](https://github.com/betagouv/service-national-universel/pull/934)) ([f29b1cc](https://github.com/betagouv/service-national-universel/commit/f29b1cc208b3d2b22ea9db35d49a8401e9f4d4ee))
- **deps:** update dependency bootstrap to v4.6.1 ([#866](https://github.com/betagouv/service-national-universel/pull/866)) ([e73fb1e](https://github.com/betagouv/service-national-universel/commit/e73fb1e603d73b5c1c72385ae9cdf8d07ece21d7))
- **deps:** update dependency core-js to v3.19.2 ([#895](https://github.com/betagouv/service-national-universel/pull/895)) ([d7c1e8a](https://github.com/betagouv/service-national-universel/commit/d7c1e8a0a24961b816150d067bdfd85f6972ee4d))
- **deps:** update dependency core-js to v3.19.3 ([#905](https://github.com/betagouv/service-national-universel/pull/905)) ([e751198](https://github.com/betagouv/service-national-universel/commit/e751198e9a617738ed1dcdfb4790a63d988959b2))
- **deps:** update dependency dayjs to v1.10.7 ([#869](https://github.com/betagouv/service-national-universel/pull/869)) ([3b927a6](https://github.com/betagouv/service-national-universel/commit/3b927a6ac5eaaeec733ede0276689d9ca8dfe9fd))
- **deps:** update dependency dotenv to v10 ([#940](https://github.com/betagouv/service-national-universel/pull/940)) ([dd8a093](https://github.com/betagouv/service-national-universel/commit/dd8a09302f12eaa29503227ac7496c91397d2fcf))
- **deps:** update dependency forcedomain to v2.2.11 ([#870](https://github.com/betagouv/service-national-universel/pull/870)) ([94b0237](https://github.com/betagouv/service-national-universel/commit/94b02379b497ed370ff71ccdec6197b11682bbb2))
- **deps:** update dependency formik to v2.2.9 ([#872](https://github.com/betagouv/service-national-universel/pull/872)) ([5ba54f5](https://github.com/betagouv/service-national-universel/commit/5ba54f5ed462dfbe2c9baf0e6e7b903b7ac57659))
- **deps:** update dependency i18n-iso-countries to v7 ([#943](https://github.com/betagouv/service-national-universel/pull/943)) ([e07615a](https://github.com/betagouv/service-national-universel/commit/e07615a112b5478d7f10a36c7719e4c2d8d222d5))
- **deps:** update dependency less to v4.1.2 ([#873](https://github.com/betagouv/service-national-universel/pull/873)) ([b7a53da](https://github.com/betagouv/service-national-universel/commit/b7a53da2816a5e322cb2819bb78aa51f3a1d7ee6))
- **deps:** update dependency less-loader to v7.3.0 ([#896](https://github.com/betagouv/service-national-universel/pull/896)) ([2bc81c2](https://github.com/betagouv/service-national-universel/commit/2bc81c2ac2e01d60a0758fbf2b17566bdd1ffe12))
- **deps:** update dependency passport to ^0.5.0 ([#897](https://github.com/betagouv/service-national-universel/pull/897)) ([8daf300](https://github.com/betagouv/service-national-universel/commit/8daf300bc0d5c363451aaf080a68de54676cf169))
- **deps:** update dependency react-autosuggest to v10.1.0 ([#907](https://github.com/betagouv/service-national-universel/pull/907)) ([501f67e](https://github.com/betagouv/service-national-universel/commit/501f67ec9609a0fbbaa590fc3d27c8a20e7e5c9a))
- **deps:** update dependency react-redux to v7.2.6 ([#874](https://github.com/betagouv/service-national-universel/pull/874)) ([dec90b4](https://github.com/betagouv/service-national-universel/commit/dec90b4b9a07d725c83a26af3ceec38734220bc4))
- **deps:** update dependency react-redux-toastr to v7.6.6 ([#875](https://github.com/betagouv/service-national-universel/pull/875)) ([2234fe9](https://github.com/betagouv/service-national-universel/commit/2234fe979eaf276c81cf5f0337335435ff09b4e6))
- **deps:** update dependency react-responsive-carousel to v3.2.22 ([#876](https://github.com/betagouv/service-national-universel/pull/876)) ([ac99a79](https://github.com/betagouv/service-national-universel/commit/ac99a79b0ecc79a05f6c3c28864a8f6a8fb757b5))
- **deps:** update dependency react-router-dom to v5.3.0 ([#912](https://github.com/betagouv/service-national-universel/pull/912)) ([f0ec7e6](https://github.com/betagouv/service-national-universel/commit/f0ec7e6af73ea4efca8638e8c4e3a74e3606260d))
- **deps:** update dependency react-select to v4.3.1 ([#915](https://github.com/betagouv/service-national-universel/pull/915)) ([fc35a55](https://github.com/betagouv/service-national-universel/commit/fc35a553c0bf374ce27b99c73ea7e78d06a86e4e))
- **deps:** update dependency redux to v4.1.2 ([#877](https://github.com/betagouv/service-national-universel/pull/877)) ([cd51a8f](https://github.com/betagouv/service-national-universel/commit/cd51a8ff7d67761c98577912fcaa773100761b60))
- **deps:** update dependency regenerator-runtime to v0.13.9 ([#878](https://github.com/betagouv/service-national-universel/pull/878)) ([95f3435](https://github.com/betagouv/service-national-universel/commit/95f34353537b74ce991eb17e488968ed9bcd4714))
- **deps:** update dependency slate to v0.72.0 ([#932](https://github.com/betagouv/service-national-universel/pull/932)) ([432f19c](https://github.com/betagouv/service-national-universel/commit/432f19c852018238b1923843fc49b4fd0fc8a4eb))
- **deps:** update dependency slate-react to v0.72.0 ([#933](https://github.com/betagouv/service-national-universel/pull/933)) ([f0358c7](https://github.com/betagouv/service-national-universel/commit/f0358c75ac2a3bcfc1e8767049834bb13bc84acd))
- **deps:** update dependency styled-components to v5.3.3 ([#879](https://github.com/betagouv/service-national-universel/pull/879)) ([5401921](https://github.com/betagouv/service-national-universel/commit/54019217f32af6aa86046e1c4b7bea271e46e890))
- **deps:** update dependency swr to v1.1.0 ([#919](https://github.com/betagouv/service-national-universel/pull/919)) ([42a2bb1](https://github.com/betagouv/service-national-universel/commit/42a2bb170f3454f9bdfd1cdefa9251bb49f696f2))
- **deps:** update dependency xlsx to v0.17.4 ([#880](https://github.com/betagouv/service-national-universel/pull/880)) ([465cfac](https://github.com/betagouv/service-national-universel/commit/465cfac698fbcfea5cc622cec41ae11edf023061))
- **deps:** update sentry-javascript monorepo to v6.15.0 ([#921](https://github.com/betagouv/service-national-universel/pull/921)) ([5fee889](https://github.com/betagouv/service-national-universel/commit/5fee8897fcebbd1e63d4f256fb799a5e4c58af42))
- disable cron ([b3fa471](https://github.com/betagouv/service-national-universel/commit/b3fa47153f672f1482aec24c0ba7efd7ef359b7a))
- disable departement and region ([b332b22](https://github.com/betagouv/service-national-universel/commit/b332b22c07d8c415ddccdeb03e4eaa5d5d424ff9))
- disabled button on sending ([782c292](https://github.com/betagouv/service-national-universel/commit/782c29287660b2e1abbb8ac734384ee0153a1590))
- disabled screen phase 1 for 2022 ([9da6488](https://github.com/betagouv/service-national-universel/commit/9da6488497aff2dfcd8644bfcfac96855786822c))
- disabled update application infos ([be04ab7](https://github.com/betagouv/service-national-universel/commit/be04ab7ff9a8488e6c618fc82050b4039a6fca04))
- display ([adb15ff](https://github.com/betagouv/service-national-universel/commit/adb15ff50038c1bf0d4eb813de8c3ad234acad02))
- display day month and year in firefox < 77 ([#38](https://github.com/betagouv/service-national-universel/pull/38)) ([16413ea](https://github.com/betagouv/service-national-universel/commit/16413ea997c4b7316ef11722a64a28092bcdf67c))
- display gps condition ([bcee2d8](https://github.com/betagouv/service-national-universel/commit/bcee2d88d9a77b5b2213b36617e69b43d70ef63b))
- do not check date for admin ([#39](https://github.com/betagouv/service-national-universel/pull/39)) ([5f817ff](https://github.com/betagouv/service-national-universel/commit/5f817ff9092038c9dd8a1a3ec8150526ea1bafbf))
- document in modal ([#87](https://github.com/betagouv/service-national-universel/pull/87)) ([3e4fe04](https://github.com/betagouv/service-national-universel/commit/3e4fe047a70e6b1308d1edda984ef56cd255e075))
- done have to be considered for places in center ([7f82b83](https://github.com/betagouv/service-national-universel/commit/7f82b83c0ea32704af05eacd6044b6cb13858e51))
- drag and drop ([#110](https://github.com/betagouv/service-national-universel/pull/110)) ([386fe2a](https://github.com/betagouv/service-national-universel/commit/386fe2a10d979d34d9f5a94d6f40d169ee77f929))
- drag and drop file upload ([#770](https://github.com/betagouv/service-national-universel/pull/770)) ([91faef1](https://github.com/betagouv/service-national-universel/commit/91faef18475523338a3f990165a474a902b351ec))
- **drawer:** hotfix props - toggle for small screens ([#591](https://github.com/betagouv/service-national-universel/pull/591)) ([3a36522](https://github.com/betagouv/service-national-universel/commit/3a36522e9f346610d3976f30d6708a335bc3e228))
- **drawer:** inbox - add closed tickets icon ([#592](https://github.com/betagouv/service-national-universel/pull/592)) ([b39ab33](https://github.com/betagouv/service-national-universel/commit/b39ab331d5b88696447eeae6efe3976fd6c6d0e9))
- duplicates ([6796a44](https://github.com/betagouv/service-national-universel/commit/6796a44302f17cb0c6b7616395014c4601799278))
- dynamic height textarea ([f9cfc51](https://github.com/betagouv/service-national-universel/commit/f9cfc51fb6e39bfe9d902c09d7e79adb94bb4b90))
- edit mission ([1609d0e](https://github.com/betagouv/service-national-universel/commit/1609d0e99eb69f4081be85c137702c00f2f0807a))
- empty city and departement for volontaires ([ef608b5](https://github.com/betagouv/service-national-universel/commit/ef608b561e67a12d5878e16cfe8d78b932de1e10))
- enable inscription in staging ([ae1b4a7](https://github.com/betagouv/service-national-universel/commit/ae1b4a7669d731a67daf8501bc644e45a6874837))
- error message ([07c2369](https://github.com/betagouv/service-national-universel/commit/07c2369f43e3a1a10b744caa05690578aad17994))
- error message email already in use ([35110cd](https://github.com/betagouv/service-national-universel/commit/35110cd907a3fc114b2dd140c3e6cef475851b30))
- error message email young ([34976dc](https://github.com/betagouv/service-national-universel/commit/34976dca597f3d3b960848c26157005450a534e3))
- error on dashboard ([#69](https://github.com/betagouv/service-national-universel/pull/69)) ([3ce996c](https://github.com/betagouv/service-national-universel/commit/3ce996c2be3204cbbcf26f36e75a94b694fdbfb0))
- error on es ([226bff1](https://github.com/betagouv/service-national-universel/commit/226bff11516501666ab1e7b6662725e35d5743f1))
- error undefined ([3c83456](https://github.com/betagouv/service-national-universel/commit/3c83456bfe827692ff5196dde2fbcd9b6e67400d))
- error when missing young ([d0bb914](https://github.com/betagouv/service-national-universel/commit/d0bb91486767343afdec240192de61c46cdfee20))
- error when missing young ([b4e6fd1](https://github.com/betagouv/service-national-universel/commit/b4e6fd1bc00f0ed384e8b8133d62103e9e457985))
- error when no tutor ([7c75768](https://github.com/betagouv/service-national-universel/commit/7c75768c78241c07b0b544011c6a7e98c6aed284))
- error when structure is not found ([2365fd0](https://github.com/betagouv/service-national-universel/commit/2365fd0c95e5c484d03b5c53ec0bb0c01e58063c))
- error when tutor is not found ([59e65d5](https://github.com/betagouv/service-national-universel/commit/59e65d5409f29add0b782fb259ee2cac011cc11d))
- error when validating contract ([97f8dd9](https://github.com/betagouv/service-national-universel/commit/97f8dd9619fab1aa0bae20fc7e72b87327fb2a30))
- ES ([d2855ff](https://github.com/betagouv/service-national-universel/commit/d2855ff09825448cc510343f1b23db8e4607f262))
- eslint + force build ([5930b95](https://github.com/betagouv/service-national-universel/commit/5930b9592b5f8a09038069f9e04e99a5394f8405))
- exclude CAP ([158e6bf](https://github.com/betagouv/service-national-universel/commit/158e6bf4c85a007f061392837503886d48229865))
- export ([424ef0f](https://github.com/betagouv/service-national-universel/commit/424ef0f851623ae79bad114d927e193ac624ce46))
- export 10000 ([eae993f](https://github.com/betagouv/service-national-universel/commit/eae993fa6ff17e3d30d1708b423831d5843095af))
- export csv data inscription ([#49](https://github.com/betagouv/service-national-universel/pull/49)) ([12289b1](https://github.com/betagouv/service-national-universel/commit/12289b10820c188d10781d62abaa4f456a56426b))
- **export:** add date in young's mission export ([157aa9c](https://github.com/betagouv/service-national-universel/commit/157aa9c1e64a1887328dce2bd8e841e96cb1853c))
- filter and redirect from dashboard ([d81f8d8](https://github.com/betagouv/service-national-universel/commit/d81f8d81d1152f5cb884f7c1841a952e2873f929))
- filter by most recent updated_at ([8bf0742](https://github.com/betagouv/service-national-universel/commit/8bf074237c922eaac6c0b437cd3243d11e1000ff))
- filter dashboard status application ([9838cff](https://github.com/betagouv/service-national-universel/commit/9838cff3fe86cf3493990f49fa399a52e2c09865))
- filter display ([b72bb26](https://github.com/betagouv/service-national-universel/commit/b72bb26527af03e09dfe039b1e55767ffe8d92c1))
- filter in mission young ([981abff](https://github.com/betagouv/service-national-universel/commit/981abff516ed409ecfe2acf98f0535f52d73ec83))
- filter tickets ([6bb507f](https://github.com/betagouv/service-national-universel/commit/6bb507fdc7a042bced078d6d608b89c46977265d))
- filter year ([a9ed36b](https://github.com/betagouv/service-national-universel/commit/a9ed36b8b1b7f2f7063237d6b6a04ad6dc50d093))
- fix ([00e6dce](https://github.com/betagouv/service-national-universel/commit/00e6dcefb038ca006f8ca8cd6b843b854db14541))
- fix ([af2afc5](https://github.com/betagouv/service-national-universel/commit/af2afc58ec760ac79b43e0e75f1c47a3c03d9163))
- fix ([06ef5b1](https://github.com/betagouv/service-national-universel/commit/06ef5b1dc39a28936f0be1eb37bd2af54c4b0efa))
- fix ([c3effff](https://github.com/betagouv/service-national-universel/commit/c3effff039ca72e835728378f1d6a00a67769aa3))
- fix ([50e41eb](https://github.com/betagouv/service-national-universel/commit/50e41eb9a10ec978bc2f6c605d7fdc1b0e165c87))
- fix ([c34ae68](https://github.com/betagouv/service-national-universel/commit/c34ae68d092a027f079425ee9962e5fb77aec3d9))
- fix ([a60a414](https://github.com/betagouv/service-national-universel/commit/a60a41436e29f39f9c7614c6dd5764e9e6a02e35))
- fix api endpoint ([e83fa5b](https://github.com/betagouv/service-national-universel/commit/e83fa5b2deb98f3a8cff71461248f7aa239bccf7))
- fix blank page ([8445521](https://github.com/betagouv/service-national-universel/commit/84455212120df800da581ca8c22e377afbcfa5a0))
- fix close panel ([d003ab2](https://github.com/betagouv/service-national-universel/commit/d003ab2c3b4fc9abc9e78c6eeb737ad2043d02d1))
- fix cohesion 2020 ([bcf257a](https://github.com/betagouv/service-national-universel/commit/bcf257a0bdaba382cb87c05e607ae02ea7e18e2f))
- fix content ([e59a1a2](https://github.com/betagouv/service-national-universel/commit/e59a1a295154ddcdd4a754a1e6782f8e635f0b89))
- fix controller ([7bc61e5](https://github.com/betagouv/service-national-universel/commit/7bc61e565fac828d26dea5d69cb7622900b6cb3c))
- fix corse ([c0c494e](https://github.com/betagouv/service-national-universel/commit/c0c494ee560b5d8fc796c929c4e4ae12dcff7935))
- fix date picker ([8e248ac](https://github.com/betagouv/service-national-universel/commit/8e248ac43af882137efe56516c0330d5cc1b0e49))
- fix désistés ([bfea9c1](https://github.com/betagouv/service-national-universel/commit/bfea9c1f3a6adbf047d586d3b7484d2d3d663155))
- fix fixture ([641cc1c](https://github.com/betagouv/service-national-universel/commit/641cc1c90eb25367562af17bfc95acd4914ceca8))
- fix footer issues ([#129](https://github.com/betagouv/service-national-universel/pull/129)) ([347bc82](https://github.com/betagouv/service-national-universel/commit/347bc82dd7fa199ed3547a7cba027a60971f1cff))
- fix hack ([5b16055](https://github.com/betagouv/service-national-universel/commit/5b160552fa5c6f7bb87524ce04898158ac13d0f1))
- fix initials ([7c37d20](https://github.com/betagouv/service-national-universel/commit/7c37d2059230ee0ac185651baffd2c8d92e1a362))
- fix invitation ([d457968](https://github.com/betagouv/service-national-universel/commit/d457968d9f52da42c9650923e4be5511f2a1a9a1))
- fix is network ([f177476](https://github.com/betagouv/service-national-universel/commit/f1774766cd34da66df9066948572091df3a3b7cd))
- fix licence ([8cb0f79](https://github.com/betagouv/service-national-universel/commit/8cb0f79639323f98d69fbb6be2c8b53ce979cf54))
- fix logout ([94d7e43](https://github.com/betagouv/service-national-universel/commit/94d7e4354cb568c5144ab844a393fdffcbb8fddc))
- fix logout ([2a28038](https://github.com/betagouv/service-national-universel/commit/2a28038991c2fdcf5d09421996849e08626c1330))
- fix lumiere ([948fbce](https://github.com/betagouv/service-national-universel/commit/948fbce72029aec2926e38159bd930607cf239c7))
- fix mime type ([#51](https://github.com/betagouv/service-national-universel/pull/51)) ([9fb3cd0](https://github.com/betagouv/service-national-universel/commit/9fb3cd009d20cbe21e215418bad3abc302836e50))
- fix multiselect ([df2c3d0](https://github.com/betagouv/service-national-universel/commit/df2c3d0cdb78bcf2db8bd1dcfb010b1bd76efd92))
- fix nan ([3de9b41](https://github.com/betagouv/service-national-universel/commit/3de9b41ffd02a9c24539ea504545746f112d1f4c))
- fix pdf download ([2e3c3be](https://github.com/betagouv/service-national-universel/commit/2e3c3be6b5100a6ed3696647f230e3065217bd4f))
- fix priority ([b61ab82](https://github.com/betagouv/service-national-universel/commit/b61ab820b6e23b5e7925e73c433d4cd4d4ed1985))
- fix production vs staging ([7233724](https://github.com/betagouv/service-national-universel/commit/7233724a529ea4e54e9dfe431927a0a0147d470b))
- fix program test ([46cff3e](https://github.com/betagouv/service-national-universel/commit/46cff3e981df6eb457b1a1353a85318448a19981))
- fix serialization of head center ([650de72](https://github.com/betagouv/service-national-universel/commit/650de724787dd9df222e12fda2ad0a81077a6a76))
- fix serializer ([2e9c1db](https://github.com/betagouv/service-national-universel/commit/2e9c1dbfd2378e0069df3ee61ea6ac2d9cb2ceb6))
- fix signin ([41a6192](https://github.com/betagouv/service-national-universel/commit/41a619259c5e62c190108aacf58b1d89e22ea1c8))
- fix structure migration ([d6e8646](https://github.com/betagouv/service-national-universel/commit/d6e8646ff9be5d8f2bd4b2d98dac568bc59a6bd7))
- fix support ([ea9855e](https://github.com/betagouv/service-national-universel/commit/ea9855ea70098413c006447e27d2bec65187157c))
- fix test ([ed5fa79](https://github.com/betagouv/service-national-universel/commit/ed5fa79e857a77aa84331f8bdd9460378ed09525))
- fix test ([2fc02ef](https://github.com/betagouv/service-national-universel/commit/2fc02efd6c97f3ce2040345b78d00fa825e80569))
- fix test helper ([eb40964](https://github.com/betagouv/service-national-universel/commit/eb4096428a40a068cf61eecead9aad306aa7d36f))
- fix url ([d9d1397](https://github.com/betagouv/service-national-universel/commit/d9d1397d74574be5b4984708b0e85e71cd2142e3))
- **footer:** besoin daide link ([d0e36fe](https://github.com/betagouv/service-national-universel/commit/d0e36fe41a0e9aaf72a27d60e00937e420efb495))
- force build admin ([14a0705](https://github.com/betagouv/service-national-universel/commit/14a0705f253176eaadf2495560181f944c2b8e89))
- force status ([c1daf4e](https://github.com/betagouv/service-national-universel/commit/c1daf4e4ea831dd77bc4d94087935d8f374dab26))
- foreign school ([#746](https://github.com/betagouv/service-national-universel/pull/746)) ([5040179](https://github.com/betagouv/service-national-universel/commit/5040179aa0bb9e0eda3ffb90b278ea34eff391e2))
- france connect url ([3dce5cd](https://github.com/betagouv/service-national-universel/commit/3dce5cd88990710e3404182603d56fac7de25a33))
- getAge ([26a95ee](https://github.com/betagouv/service-national-universel/commit/26a95eeafa9bbc52afe35802f48458e0ea367ea2))
- getBaseUrl ([6932aac](https://github.com/betagouv/service-national-universel/commit/6932aac6a3d08925e94e44f2bed4d28a36915739))
- head center can only see head center ([149361d](https://github.com/betagouv/service-national-universel/commit/149361d7faca2c3159c16f6d22c0753173931d5e))
- hide contract if waiting_validation ([a7f5029](https://github.com/betagouv/service-national-universel/commit/a7f50294502d6015b410e833d7a89210500b4455))
- hide error when navigator blocks popup opening ([a3d4521](https://github.com/betagouv/service-national-universel/commit/a3d45210d6ab1bc25541b494cb592dc74eeaf17f))
- hide resolve ticket button ([3af0639](https://github.com/betagouv/service-national-universel/commit/3af063937f61310b1ff722bedae5a7a481f8e55b))
- historic length ([46ecd94](https://github.com/betagouv/service-national-universel/commit/46ecd9440a41ce8265485212c449dbc5edebd873))
- hit error ([#312](https://github.com/betagouv/service-national-universel/pull/312)) ([1ab2fcb](https://github.com/betagouv/service-national-universel/commit/1ab2fcb64d1eec7bf34355961820375e14b3f845))
- home phase3 - app ([#551](https://github.com/betagouv/service-national-universel/pull/551)) ([8694f44](https://github.com/betagouv/service-national-universel/commit/8694f44fb6294328022f8c14767f065636eb8a0e))
- hostadress and address ([#716](https://github.com/betagouv/service-national-universel/pull/716)) ([f2318ad](https://github.com/betagouv/service-national-universel/commit/f2318ad7ae93c1e88185aae4f320527bb7790eea))
- hot fix on structure + security on referents ([aad21f2](https://github.com/betagouv/service-national-universel/commit/aad21f26b8d474c30ee1fa87b895e3a6a787f6af))
- hotfix ([1d13aa3](https://github.com/betagouv/service-national-universel/commit/1d13aa31dd3e97ace560bde4972b36c785d3f558))
- id is required ([8adbffc](https://github.com/betagouv/service-national-universel/commit/8adbffcf498dc10153f742026434e3815b9d8369))
- ignore array with error ([77ef029](https://github.com/betagouv/service-national-universel/commit/77ef0299e64a5ebabb0d2a60ffbd0c7b99153693))
- ignore historic in es ([#513](https://github.com/betagouv/service-national-universel/pull/513)) ([4e3ccec](https://github.com/betagouv/service-national-universel/commit/4e3ccecb3fa329475145a1db06d80f27dd183fde))
- Impact new fields in young ([#751](https://github.com/betagouv/service-national-universel/pull/751)) ([cec4b17](https://github.com/betagouv/service-national-universel/commit/cec4b1744de6e2b07f8131fb6b5d0d6f2c009ca1))
- import and wording ([b0bebef](https://github.com/betagouv/service-national-universel/commit/b0bebefe75d5e129d4641428157e31993fe3c36b))
- **import:** can not find toastr ([#590](https://github.com/betagouv/service-national-universel/pull/590)) ([a48f062](https://github.com/betagouv/service-national-universel/commit/a48f0620b354056504a61898bf3ded11f6ba71ba))
- improved dashboard ([6282546](https://github.com/betagouv/service-national-universel/commit/62825465ecc89e8b5ad61dfc3dca0774e56f5d51))
- in progress 2022 ([2086ef4](https://github.com/betagouv/service-national-universel/commit/2086ef4995449949aa4162f0b4af541dbb11c741))
- in progress dashboard (includes cohort 2022) ([b0df097](https://github.com/betagouv/service-national-universel/commit/b0df0970b14b535556b58ed18ee516ceef24c51a))
- **inbox:** beautify notification badges ([#738](https://github.com/betagouv/service-national-universel/pull/738)) ([63cf0bf](https://github.com/betagouv/service-national-universel/commit/63cf0bf7e5e23cc70fec1205a67fa020f5b7cbce)), closes [#593](https://github.com/betagouv/service-national-universel/pull/593)
- **inbox:** dispatch ticket state to inbox header ([#595](https://github.com/betagouv/service-national-universel/pull/595)) ([2271ba0](https://github.com/betagouv/service-national-universel/commit/2271ba01064432e278868e72e71fbd60d80d6c43))
- **inbox:** dynamic height textarea ([#635](https://github.com/betagouv/service-national-universel/pull/635)) ([e62969f](https://github.com/betagouv/service-national-universel/commit/e62969f2a92a615a0d3a584bce87c6de041fe42e))
- infos young in panel and details ([ffc7b64](https://github.com/betagouv/service-national-universel/commit/ffc7b640378fa9362bbbafa18d020cd827b459ef))
- input height ([f8e125c](https://github.com/betagouv/service-national-universel/commit/f8e125c49ba755e2c94987ac012abf7c94b549a5))
- **inscription - profil:** responsive for checkbox ([#682](https://github.com/betagouv/service-national-universel/pull/682)) ([72b2f6c](https://github.com/betagouv/service-national-universel/commit/72b2f6ceaf4ab95c46f9cce66a6aaef805bfc25a))
- **inscription:** add docs - s3 url ([24c3dc4](https://github.com/betagouv/service-national-universel/commit/24c3dc44c8a20b8064b8750c652b552fb9f534dd))
- **inscription:** add host list ([#686](https://github.com/betagouv/service-national-universel/pull/686)) ([f865dba](https://github.com/betagouv/service-national-universel/commit/f865dba7e6b187a49f379c28039ecc74e202bcaa))
- **inscription:** address radio button ([fddad90](https://github.com/betagouv/service-national-universel/commit/fddad9068220ca56b76d96c153107d40794a6976))
- **inscription:** age eligibility ([9b03b81](https://github.com/betagouv/service-national-universel/commit/9b03b81b6705ad7403765f710ca3ae89cf19080d))
- **inscription:** age eligibility ([#613](https://github.com/betagouv/service-national-universel/pull/613)) ([04d0ac7](https://github.com/betagouv/service-national-universel/commit/04d0ac7c74b6768d5e2b6aff8728e4ff1ef3f3d3))
- **inscription:** ajouter ecran de validation inscription ([#712](https://github.com/betagouv/service-national-universel/pull/712)) ([f039870](https://github.com/betagouv/service-national-universel/commit/f0398706dcd477af384714141813ddb05552ef5a))
- **inscription:** besoin d aide button ([#724](https://github.com/betagouv/service-national-universel/pull/724)) ([5376db5](https://github.com/betagouv/service-national-universel/commit/5376db56f0a5b108857620be0f02f8a375647a33))
- **inscription:** birthCountry radio button ([#755](https://github.com/betagouv/service-national-universel/pull/755)) ([0ea0a68](https://github.com/betagouv/service-national-universel/commit/0ea0a68a97fb364f7dd55ab99e6c68f5937aa324))
- **inscription:** birthdate for 2022 session ([#731](https://github.com/betagouv/service-national-universel/pull/731)) ([bc23f74](https://github.com/betagouv/service-national-universel/commit/bc23f7449d68ec1aefa6458ad9d0d271997acfdb))
- **inscription:** coordonnees ([#648](https://github.com/betagouv/service-national-universel/pull/648)) ([4d2f145](https://github.com/betagouv/service-national-universel/commit/4d2f1450e96ae72219f3ad5cbb8b1b569163eb80))
- **inscription:** display data collect conditions ([#685](https://github.com/betagouv/service-national-universel/pull/685)) ([fd7aac6](https://github.com/betagouv/service-national-universel/commit/fd7aac69c4782c7436ec01ae81582aa13b488166))
- **inscription:** display data collect if young < 15 ([#684](https://github.com/betagouv/service-national-universel/pull/684)) ([839be0e](https://github.com/betagouv/service-national-universel/commit/839be0e35e88d819384a56bc2d8427c3494da179))
- **inscription:** display hostaddress only if the young live abroad ([#658](https://github.com/betagouv/service-national-universel/pull/658)) ([7658a3e](https://github.com/betagouv/service-national-universel/commit/7658a3e71a1051c1b640394dc44e1489001eae98))
- **inscription:** error when no hit matches selected school ([4c40947](https://github.com/betagouv/service-national-universel/commit/4c40947435ec6f467a75dae83b100f69d8f28ae8))
- **inscription:** figma feedback ([d5764cd](https://github.com/betagouv/service-national-universel/commit/d5764cd8522885bcbe75e1b529561fab27cc74bb))
- **inscription:** hotfix nav icons ([731eed1](https://github.com/betagouv/service-national-universel/commit/731eed15e74dd1e68ff18632f0410cad2df22c36))
- **inscription:** hotfix wording ([6d032d7](https://github.com/betagouv/service-national-universel/commit/6d032d750330f53c42e5744ddc563ce6af12d02f))
- **inscription:** improve display for etablissements ([91b2988](https://github.com/betagouv/service-national-universel/commit/91b2988b4bd16807c04006c630076f315c038319))
- **inscription:** links in landing page ([2278f69](https://github.com/betagouv/service-national-universel/commit/2278f69d2d76dffa0f0b34c294e8f9d5af67f9aa))
- **inscription:** notion feedback changes ([#708](https://github.com/betagouv/service-national-universel/pull/708)) ([ecb3491](https://github.com/betagouv/service-national-universel/commit/ecb34914214b9c26117bc1c33bc31b6482af1532))
- **inscription:** open landing page in prod ([3c48560](https://github.com/betagouv/service-national-universel/commit/3c4856038107265544e3e60f7bf2eef5bf6824d7))
- **inscription:** parametrage écran disponibilité ([#643](https://github.com/betagouv/service-national-universel/pull/643)) ([50f698a](https://github.com/betagouv/service-national-universel/commit/50f698aac51a718166ddad3bc6b0225a27fe2cff))
- **inscription:** préparer dashboard pour inscription 2022 ([#663](https://github.com/betagouv/service-national-universel/pull/663)) ([cb8b514](https://github.com/betagouv/service-national-universel/commit/cb8b514cc8599c10e2e7bad17cee11882a427a9b))
- **inscription:** proposer session en fonction des objectifs ([#687](https://github.com/betagouv/service-national-universel/pull/687)) ([fe931fa](https://github.com/betagouv/service-national-universel/commit/fe931fa010854dff2083b4a4a625070456bd35b3))
- **inscription:** remove default false ([e68837d](https://github.com/betagouv/service-national-universel/commit/e68837dac8b45146d86fcde5fd90367425dac108))
- **inscription:** remove modal in coordonnees - improve inscription etablissement ([db31708](https://github.com/betagouv/service-national-universel/commit/db31708c1eccefa7312f289459b5faff891765f3))
- **inscription:** remove password fixed width ([#680](https://github.com/betagouv/service-national-universel/pull/680)) ([87607bd](https://github.com/betagouv/service-national-universel/commit/87607bde5c7e54a80abc25aa428d9160ac56c256))
- **inscription:** signup step 5 ([#628](https://github.com/betagouv/service-national-universel/pull/628)) ([7721e1c](https://github.com/betagouv/service-national-universel/commit/7721e1c9d18d2edfb7161226e8859aa983389549))
- **inscription:** small figma changes ([#668](https://github.com/betagouv/service-national-universel/pull/668)) ([3706035](https://github.com/betagouv/service-national-universel/commit/3706035a482827f1df84b05097f3a822726be5a1))
- **inscription:** step 1 - profil ([#621](https://github.com/betagouv/service-national-universel/pull/621)) ([f500397](https://github.com/betagouv/service-national-universel/commit/f5003970dde09e3af2bf5730bbce50ac04d9bf0b))
- **inscription:** step 3 ([#622](https://github.com/betagouv/service-national-universel/pull/622)) ([a1d297e](https://github.com/betagouv/service-national-universel/commit/a1d297ea717217b877e7554666b9b1419874834a))
- **inscription:** store message status ([#745](https://github.com/betagouv/service-national-universel/pull/745)) ([221eee5](https://github.com/betagouv/service-national-universel/commit/221eee5ea5789991b5971f1c18a6b63fe6553527))
- **inscription:** style inscription ([#614](https://github.com/betagouv/service-national-universel/pull/614)) ([960f73e](https://github.com/betagouv/service-national-universel/commit/960f73e82c309689c861fd0fd91700c7ee318e95))
- **inscription:** style navbar ([#634](https://github.com/betagouv/service-national-universel/pull/634)) ([cf7611b](https://github.com/betagouv/service-national-universel/commit/cf7611b57298c6d751c8a5e063662be769a8dec3))
- **inscription:** validate field onChange ([#679](https://github.com/betagouv/service-national-universel/pull/679)) ([ee7b48d](https://github.com/betagouv/service-national-universel/commit/ee7b48d4123268299be73b550ab62a49fe6d26dc))
- **inscription:** Vérification nom, prénom et âge ([#615](https://github.com/betagouv/service-national-universel/pull/615)) ([a99df15](https://github.com/betagouv/service-national-universel/commit/a99df157faf71db6878431f5b1c56b9b8504b4ad))
- **inscription:** wording + exclude 1ere fevrier ([65926b5](https://github.com/betagouv/service-national-universel/commit/65926b5bd716e99e12ca2b7a5d323dc6f0f1b610))
- **inscription:** wording and small fixes ([57a4a94](https://github.com/betagouv/service-national-universel/commit/57a4a94e1098257d11cbda79fa2c33a77924f234))
- invalid params on young ([26efc03](https://github.com/betagouv/service-national-universel/commit/26efc0361e70caf63c583e6e8eaf07677fc2a354))
- invitation security ([9c8967c](https://github.com/betagouv/service-national-universel/commit/9c8967c0f861dda36bf48c72a3e4cf7026b471a1))
- invitation token ([375f1f7](https://github.com/betagouv/service-national-universel/commit/375f1f76707acb8ef4b3d5b5a50bf8a632df6eb0))
- invite ([bc75dba](https://github.com/betagouv/service-national-universel/commit/bc75dba5d754e2b31b0d4c5241ee83c14d8e2ce3))
- keep 200 status code when template not found ([a5211f9](https://github.com/betagouv/service-national-universel/commit/a5211f99e1d5d12816899cb4555da910c6a0a324))
- key in map ([9687f4b](https://github.com/betagouv/service-national-universel/commit/9687f4b2b83a3060d771f47fcf482776f1cc3e73))
- key warning ([597b89b](https://github.com/betagouv/service-national-universel/commit/597b89bd8503a9f70b658c61f8465af42625d8fd))
- **landing-page:** small style fixes ([#637](https://github.com/betagouv/service-national-universel/pull/637)) ([af96003](https://github.com/betagouv/service-national-universel/commit/af960032dc3a5c57f4fece5b07e2d016ecb4af67))
- **landing-page:** wording ([a4da75a](https://github.com/betagouv/service-national-universel/commit/a4da75accd7873a5ae9d7a334297cfb17fe4e04b))
- lib in old es ([5bbe2f4](https://github.com/betagouv/service-national-universel/commit/5bbe2f4941697520040caee634918a271f41bbde))
- link from dashboard ([00d5ae6](https://github.com/betagouv/service-national-universel/commit/00d5ae6cf1bcbe5d9c2f14f9a4b788641ac6e780))
- links for kb ([8dbc076](https://github.com/betagouv/service-national-universel/commit/8dbc076f1f8ad004667f31d13795d56abd0d1853))
- load tutor only if there is actually a tutor ([bd8f1fe](https://github.com/betagouv/service-national-universel/commit/bd8f1fee6b96aa52afc162952e9973dbf4ab765d))
- loader ([de50b76](https://github.com/betagouv/service-national-universel/commit/de50b76cf6aa1a4efaa48843b893c76083a3e41a))
- loading ([e6e4ba9](https://github.com/betagouv/service-national-universel/commit/e6e4ba915d12c17ac94c43f9224c12d635ab6a89))
- location undefined ([8004080](https://github.com/betagouv/service-national-universel/commit/80040805fc003cef592b692da52cf75c811d28fd))
- lol ([1ca4430](https://github.com/betagouv/service-national-universel/commit/1ca44305e92317f00444ba0d0c2563be165bb9d9))
- lower case email on save ([#52](https://github.com/betagouv/service-national-universel/pull/52)) ([ad84d0d](https://github.com/betagouv/service-national-universel/commit/ad84d0d7ab6977e044cd06b48936bdb8f1eae89d))
- mail - notif de confirmation de creation de compte ([#700](https://github.com/betagouv/service-national-universel/pull/700)) ([493a7b0](https://github.com/betagouv/service-national-universel/commit/493a7b0ce13cd7a52fefe344e4940fc2eb76b518))
- mail new application pm ([#452](https://github.com/betagouv/service-national-universel/pull/452)) ([5d31c72](https://github.com/betagouv/service-national-universel/commit/5d31c720a17ce06da2d300e48dbe744efadc4fe1))
- **mail:** invite structure ([3d23a3e](https://github.com/betagouv/service-national-universel/commit/3d23a3e9c58843af3d0dbe9d32e2656b9a1e8a8a))
- **mail:** notification abandon application ([c59963f](https://github.com/betagouv/service-national-universel/commit/c59963f395c57d5a34e6e03a27a64ba355f95093))
- mascarade cookie ([2b7da8f](https://github.com/betagouv/service-national-universel/commit/2b7da8fa77647023efc1b893a41f82ec975e2d41))
- **military:** translate missing when error occurs ([4752bdc](https://github.com/betagouv/service-national-universel/commit/4752bdc76ce18182bf347b21f193378f7825ab25))
- mission details ([3fc2241](https://github.com/betagouv/service-national-universel/commit/3fc2241867b110100f5014570e01555259461884))
- mission display ([63cbcf1](https://github.com/betagouv/service-national-universel/commit/63cbcf11b88d71aaf58dba72169f23ef33b89e5b))
- modal change status mission ([f7f11f1](https://github.com/betagouv/service-national-universel/commit/f7f11f1561591400f24879f8d50447193daea0bb))
- modal correction and refused ([406935f](https://github.com/betagouv/service-national-universel/commit/406935fb8226efe76103515276cd1ba2adce1c4f))
- more 404 ([ec3597b](https://github.com/betagouv/service-national-universel/commit/ec3597b052ca6204920a34ea94f0b3ffb578e624))
- multiple files ([#35](https://github.com/betagouv/service-national-universel/pull/35)) ([650acaf](https://github.com/betagouv/service-national-universel/commit/650acafceb9cea96ce35284cee30c65ed9024790))
- mysql ([#50](https://github.com/betagouv/service-national-universel/pull/50)) ([4bcf744](https://github.com/betagouv/service-national-universel/commit/4bcf7444855798ad32c349baac1c1f62051c5520))
- name country ([#726](https://github.com/betagouv/service-national-universel/pull/726)) ([087b22c](https://github.com/betagouv/service-national-universel/commit/087b22c7afda5c8f4ef220b81533d486c22988fe))
- nan age ([44683d8](https://github.com/betagouv/service-national-universel/commit/44683d85f07001deb896594252d8dd8e38cf40d6))
- network ([bd9c924](https://github.com/betagouv/service-national-universel/commit/bd9c9245d75fceeee8d98ad8f2455c1d31308c0a))
- new mission - send to all manager phase 2 ([9eb0e28](https://github.com/betagouv/service-national-universel/commit/9eb0e28865bbc8c37abb72a7b19a6506dcb142e3))
- no es2020 in lib ([e646366](https://github.com/betagouv/service-national-universel/commit/e646366e32fabbdbc801e42d7b95972b48e5cb1b))
- no location found ([b95f9eb](https://github.com/betagouv/service-national-universel/commit/b95f9ebfc42b26e5fae343f7d444acc540514da3))
- no result ([a8e1c21](https://github.com/betagouv/service-national-universel/commit/a8e1c2196a304de66eecec0b4dce0cdeff8be7de))
- nom de naissance ([#100](https://github.com/betagouv/service-national-universel/pull/100)) ([2f196eb](https://github.com/betagouv/service-national-universel/commit/2f196eb745dd2b20d817b1ce9b70256355c6a521))
- non breaking space + fix link ([f846f0d](https://github.com/betagouv/service-national-universel/commit/f846f0d4ee6cf6b3488b40c104e06790da1b6b31))
- not found cohesion center ([8d6456e](https://github.com/betagouv/service-national-universel/commit/8d6456e577511617fa35e2520f41b93b952aa987))
- not that useless code ([d51131e](https://github.com/betagouv/service-national-universel/commit/d51131ef49c24d6ea8c2a3b161d7705ce35134b7))
- npm ([695fa30](https://github.com/betagouv/service-national-universel/commit/695fa306f7c131d12cd175b6c9403fea1944c588))
- null is not an object ([0830837](https://github.com/betagouv/service-national-universel/commit/083083728e149fd3a2843f7fef5610abe2e8e6a5))
- number in export ([54206af](https://github.com/betagouv/service-national-universel/commit/54206af6e0abb700fb615f53cdedc07d6d80f0a4))
- octal notation ([770233f](https://github.com/betagouv/service-national-universel/commit/770233f3a1b9136a6ce07fd9be8296d6d6af2e2a))
- only archive for admin ([60e10ca](https://github.com/betagouv/service-national-universel/commit/60e10ca97746aebd222fa6d1abf9b7c3101f4beb))
- oops ([6d82c28](https://github.com/betagouv/service-national-universel/commit/6d82c28453ad742f748dbbb4adc24c8b58e33f6d))
- oops ([49bc754](https://github.com/betagouv/service-national-universel/commit/49bc7542cb1d8205ba2a55d55a29f2977d2cf822))
- oops ([9ca38f5](https://github.com/betagouv/service-national-universel/commit/9ca38f56b6b239bf1e38e392b2123b7697721c85))
- oops ([60abfcb](https://github.com/betagouv/service-national-universel/commit/60abfcb682cd2b19bbf5e07aa3d4567aa229edd9))
- oops ([0cf00ea](https://github.com/betagouv/service-national-universel/commit/0cf00ea3d394ff1473db6debc450c85e4d9c7442))
- panel right ([72f4ea6](https://github.com/betagouv/service-national-universel/commit/72f4ea605295100c07d3a48912bf7c7be66cf715))
- **panel+details:** add space-between and border bottom ([#796](https://github.com/betagouv/service-national-universel/pull/796)) ([69469d4](https://github.com/betagouv/service-national-universel/commit/69469d43f21bff285e1a9fe4c95db7a080101b80))
- passport should return JSON for 401 ([#518](https://github.com/betagouv/service-national-universel/pull/518)) ([f335aae](https://github.com/betagouv/service-national-universel/commit/f335aaec7e5e96e2fc393d90ffd5dd042fcc8012)), closes [#512](https://github.com/betagouv/service-national-universel/pull/512)
- password ([4fd0fd9](https://github.com/betagouv/service-national-universel/commit/4fd0fd9d10fa53ca97a79aa683908141fb2eb1b6))
- password ([a9c1bee](https://github.com/betagouv/service-national-universel/commit/a9c1bee452a04709e999db8318488e4f0b6cf114))
- password message ([#42](https://github.com/betagouv/service-national-universel/pull/42)) ([4ca9a9d](https://github.com/betagouv/service-national-universel/commit/4ca9a9d62dc31e90a760abc8d303212765a5b6a6))
- password validation in signup ([0af4c7c](https://github.com/betagouv/service-national-universel/commit/0af4c7cca5f99474f32a74b65715c869fc6de36b))
- patch history ([df67aa1](https://github.com/betagouv/service-national-universel/commit/df67aa10d8e199655e4dc03d0e2025882f23f231))
- **patches:** format date in historic values ([#584](https://github.com/betagouv/service-national-universel/pull/584)) ([cc50f3a](https://github.com/betagouv/service-national-universel/commit/cc50f3ad6aaf23f5a39fd51ab8e8b8e917abb3ee))
- pdf js ([#98](https://github.com/betagouv/service-national-universel/pull/98)) ([656aa78](https://github.com/betagouv/service-national-universel/commit/656aa782595db76ed464327c5f77172b581247b9))
- **permission:** enable phase2 for exempted ([16ac58f](https://github.com/betagouv/service-national-universel/commit/16ac58f620f09afbbbdf79fa015409add98aed64))
- phase 3 ([cbfbc09](https://github.com/betagouv/service-national-universel/commit/cbfbc09b08667d243c9eb2f0aa0fe765b2961ec2))
- pieces justificative - message bloquant ([#683](https://github.com/betagouv/service-national-universel/pull/683)) ([9747a6c](https://github.com/betagouv/service-national-universel/commit/9747a6c0e731558a5ef50cf61258fea1067e7f96))
- place left ([076e99c](https://github.com/betagouv/service-national-universel/commit/076e99c2ebc62e72618a80feece9f0c9c705aafd))
- plausible quotes in admin ([0fd79a8](https://github.com/betagouv/service-national-universel/commit/0fd79a84856be0c5a7b89b6c0ec8b94ff410358b))
- post file ([a5b726e](https://github.com/betagouv/service-national-universel/commit/a5b726e72d0f9594f9b6a3a8e8e7ee3c06f4b89d))
- **post-inscription:** change all home screens according to Figma ([#664](https://github.com/betagouv/service-national-universel/pull/664)) ([21b9793](https://github.com/betagouv/service-national-universel/commit/21b97938474c1d383d747c425580a34e2b246383))
- precommit ([a9185c5](https://github.com/betagouv/service-national-universel/commit/a9185c5ceb2a48e1205e9e16b8101cde5f33da82))
- programmes visibility ([617a523](https://github.com/betagouv/service-national-universel/commit/617a5237ae0ae2e5b06f1e4c4c93affd0c26b56b))
- **public-support:** design and articles changes ([#715](https://github.com/betagouv/service-national-universel/pull/715)) ([0067f2e](https://github.com/betagouv/service-national-universel/commit/0067f2ee9c6a1290ff4e9c62bc76fd74792b8621))
- queryFormat ([c5ceb1e](https://github.com/betagouv/service-national-universel/commit/c5ceb1e64c0e0c5f5706c6b656764c62a358fe65))
- qwick win - support ([#475](https://github.com/betagouv/service-national-universel/pull/475)) ([b2ef3bc](https://github.com/betagouv/service-national-universel/commit/b2ef3bc1242510971d0e3ba9a83d38fc0c427412))
- redirect ([ecdbc7c](https://github.com/betagouv/service-national-universel/commit/ecdbc7c8c544aae142d0583c09110bdbfa8a98cf))
- redirect on save ([1cea9da](https://github.com/betagouv/service-national-universel/commit/1cea9daef2c7df5ba94b3d64903c8ce58057bdfb))
- redirect undefined ([17ca619](https://github.com/betagouv/service-national-universel/commit/17ca6198196950d48a49e669f4674604ba363bbc))
- redirect when es query fails ([#55](https://github.com/betagouv/service-national-universel/pull/55)) ([567c32a](https://github.com/betagouv/service-national-universel/commit/567c32af9db9f1dc117c17cfa6b9edaa6c961be0))
- refacto button validate file pm ([e166241](https://github.com/betagouv/service-national-universel/commit/e16624117e8c3daa5700b53053385f255513bed8))
- refacto tab filters ([03df8bb](https://github.com/betagouv/service-national-universel/commit/03df8bbb2e6eca2ea2f4cee34ebbe4801bf0e95a))
- **refacto:** modal isOpen ([#417](https://github.com/betagouv/service-national-universel/pull/417)) ([d8a8cf8](https://github.com/betagouv/service-national-universel/commit/d8a8cf8140423d2fdc197e44afc33b94442e3e9b))
- **refacto:** remove useless code ([ce772f7](https://github.com/betagouv/service-national-universel/commit/ce772f7b49184862e72a22107daabe07a86034c4))
- referent's notif zammad auth ([0572b0e](https://github.com/betagouv/service-national-universel/commit/0572b0e74db30402a32cc0f2196d3285f0a9424f))
- refresh when resolve ticket ([b6ccf23](https://github.com/betagouv/service-national-universel/commit/b6ccf236d9293cabf41d6d9753a880ddd925eac6))
- regex zip ([795944f](https://github.com/betagouv/service-national-universel/commit/795944ffb7de7ccb2426a2197eace4ea5ebb0c75))
- release admin and app ([e973113](https://github.com/betagouv/service-national-universel/commit/e973113853f531f4e162d25de6f3a74f243dd793))
- remainder crisp link ([8965649](https://github.com/betagouv/service-national-universel/commit/8965649bc69acd33a8fd55660316525973bdd019))
- remove analytics ([519c3a9](https://github.com/betagouv/service-national-universel/commit/519c3a90dd0fa310e9b553f335c838489384a814))
- remove blank page on certificates ([#508](https://github.com/betagouv/service-national-universel/pull/508)) ([6550b32](https://github.com/betagouv/service-national-universel/commit/6550b32a59636832576c4d8259136cf906376eaa)), closes [#499](https://github.com/betagouv/service-national-universel/pull/499)
- remove cc young ([fc49102](https://github.com/betagouv/service-national-universel/commit/fc4910292055d42affe11b86a134b043b23403e4))
- remove debugger, remove link ([31dc089](https://github.com/betagouv/service-national-universel/commit/31dc08985b72d733e5e7406e758e784fad842100))
- remove deja inscrits ([#447](https://github.com/betagouv/service-national-universel/pull/447)) ([1938d70](https://github.com/betagouv/service-national-universel/commit/1938d704c9abc5efffced3c2ac5f119730dba465))
- remove findByIdAndUpdate ([#440](https://github.com/betagouv/service-national-universel/pull/440)) ([3f0ff74](https://github.com/betagouv/service-national-universel/commit/3f0ff74fde792355c166306ebda87c6cd9fa55fc))
- remove helmet ([ec5b1a1](https://github.com/betagouv/service-national-universel/commit/ec5b1a18437ac2176147bd00ef052e9643cf9fe1))
- remove helmet ([855da8b](https://github.com/betagouv/service-national-universel/commit/855da8b8972baf35667abb424bf1eb4f7294ea99))
- remove inclusive ([277867a](https://github.com/betagouv/service-national-universel/commit/277867a65f156e0e691abe40ee5746dc9138353a))
- remove json example ([274483a](https://github.com/betagouv/service-national-universel/commit/274483a23a7a5733929ec7ecfafdc9e9c3dc712b))
- remove limit for the search of commune ([#735](https://github.com/betagouv/service-national-universel/pull/735)) ([2042998](https://github.com/betagouv/service-national-universel/commit/2042998fc7941dfe2c5f533b8acb1d81aa485f90))
- remove logs ([cae3dfb](https://github.com/betagouv/service-national-universel/commit/cae3dfb5450aa217905675160a260fbe6e29e127))
- remove misleading info ([f8e7d84](https://github.com/betagouv/service-national-universel/commit/f8e7d84c554750c6b52afc940a97a7f6efe706b2))
- remove mission visibility 3w ([d3c01c7](https://github.com/betagouv/service-national-universel/commit/d3c01c7edd8422123624ce4755372cb16914f259))
- remove option selected ([e0a398a](https://github.com/betagouv/service-national-universel/commit/e0a398a2042caa50d1a8b38e03dbe56e59daf7f0))
- remove period crash ([060f146](https://github.com/betagouv/service-national-universel/commit/060f1463c3f6b661a1caaae2ce0edd313b3f5d8e))
- remove required in edit young ([1d92930](https://github.com/betagouv/service-national-universel/commit/1d92930089b4fc92ff569d3fb4d6963e8bdcde80))
- remove response error ([7b703a4](https://github.com/betagouv/service-national-universel/commit/7b703a43b761effeb3cf3508ed90d067a59d0147))
- remove unused files ([d58ce18](https://github.com/betagouv/service-national-universel/commit/d58ce1893d811b4aedf2409bd16aa7add8b70ffc))
- remove useless button ([3c21273](https://github.com/betagouv/service-national-universel/commit/3c21273898a5e0aa86f8473763d3f942c1d936a6))
- remove useless error ([#53](https://github.com/betagouv/service-national-universel/pull/53)) ([f8422ab](https://github.com/betagouv/service-national-universel/commit/f8422ab854754384b83d4ce903f85be9b25a2d24))
- remove useless status badge ([74d9ee9](https://github.com/betagouv/service-national-universel/commit/74d9ee9e5d5b9c3244b6356e089b9eb61365f21f))
- remove wording ([10dcef6](https://github.com/betagouv/service-national-universel/commit/10dcef61ad9afbc6ae7a0c511c112cb40173bcaf))
- rename routes ([4e6b8e4](https://github.com/betagouv/service-national-universel/commit/4e6b8e4506f62a2098764fd04618e3d57cac94d9))
- replace 401 with 403 ([#744](https://github.com/betagouv/service-national-universel/pull/744)) ([48fc29d](https://github.com/betagouv/service-national-universel/commit/48fc29d68bf7afe4eeace0a42708895be5eeaa9c))
- replace window.open ([#743](https://github.com/betagouv/service-national-universel/pull/743)) ([39d83ea](https://github.com/betagouv/service-national-universel/commit/39d83ead7672b46ed8e2975a3cb4d62449b6913d)), closes [#740](https://github.com/betagouv/service-national-universel/pull/740)
- responsive chat ([11e0936](https://github.com/betagouv/service-national-universel/commit/11e093676dc62342ecc38e271a49fd6cd04a2d05))
- return 404 when young or mission not found ([f0e7250](https://github.com/betagouv/service-national-universel/commit/f0e7250fe3a0ca592a9fc570200f586e551b6b28))
- revert panel right ([042c304](https://github.com/betagouv/service-national-universel/commit/042c3047d380fb740d37d71c856a86df8426485d))
- rightPanel inbox ([3811fc2](https://github.com/betagouv/service-national-universel/commit/3811fc26b0212292b716b2e2ecec3a5c9ae6091a))
- route support ([2d74be9](https://github.com/betagouv/service-national-universel/commit/2d74be9e84c2baefbc938f773ac227b0b1760675))
- route support admin ([e08d2b9](https://github.com/betagouv/service-national-universel/commit/e08d2b918f4d4009be4c6e1f549225e70172ac0e))
- save mission and include tutor in mission ([4bbd897](https://github.com/betagouv/service-national-universel/commit/4bbd897d3a1568e54eeef29412b4b08356d5d217))
- school search ([#758](https://github.com/betagouv/service-national-universel/pull/758)) ([0ab485a](https://github.com/betagouv/service-national-universel/commit/0ab485a38e39d36b88add57a213b402c0e337ff5))
- screen if no sessions available ([#710](https://github.com/betagouv/service-national-universel/pull/710)) ([f43882c](https://github.com/betagouv/service-national-universel/commit/f43882c74648f363a1131a8e6ddb0aa129d56321))
- script to update school id ([#56](https://github.com/betagouv/service-national-universel/pull/56)) ([9b96678](https://github.com/betagouv/service-national-universel/commit/9b96678bc8a6b0aeaa9e220df133f8789da7cd1f))
- scroll in message ([7679c82](https://github.com/betagouv/service-national-universel/commit/7679c82543f6c527c88a459dc777735a2880cb40))
- search by email ([d4d2207](https://github.com/betagouv/service-national-universel/commit/d4d2207dee68f2f2077e9f0cb87cc40499e58aa5))
- search by tags ([1cf7eff](https://github.com/betagouv/service-national-universel/commit/1cf7eff1b0231ec97aa3245102a55e66c70a947d))
- search mission more relevant ([9eac066](https://github.com/betagouv/service-national-universel/commit/9eac066822fc811abc6522da70130296b411c57f))
- **security:** auth ([58f910c](https://github.com/betagouv/service-national-universel/commit/58f910c7e4c1def200db17c71faa0084c21539bf))
- select status application waiting_verification ([b8a57a7](https://github.com/betagouv/service-national-universel/commit/b8a57a720d31e6afc8b3d6addc5a0ecaf9ac610b))
- selectStatusMission location ([311f904](https://github.com/betagouv/service-national-universel/commit/311f9049cf5f52060c7587596a08425904ea858d))
- sendinblue in dev ([5da473c](https://github.com/betagouv/service-national-universel/commit/5da473c94e7dba4fd066683bdbd6f2dbfd5da825))
- sendinblue lists ([f6fc187](https://github.com/betagouv/service-national-universel/commit/f6fc187b2d5a76855d41cc65e4229f40f63621bc))
- **sentry:** Cannot read properties of null ([#567](https://github.com/betagouv/service-national-universel/pull/567)) ([6d0718a](https://github.com/betagouv/service-national-universel/commit/6d0718ad5bced04d3c1a7c88230e05ff2c346183)), closes [#564](https://github.com/betagouv/service-national-universel/pull/564)
- session 1ere CAP ([59320b8](https://github.com/betagouv/service-national-universel/commit/59320b8bd7376b8deccdb90da6f2e52f13ad8d27))
- show inbox button in prod ([01f7ec2](https://github.com/betagouv/service-national-universel/commit/01f7ec2e8c8c4e9e05d152a9a0c845a2e40270c3))
- signed url ([f7ba0f6](https://github.com/betagouv/service-national-universel/commit/f7ba0f6b64d2cd2b58e2bfa9afb49dbd807f8e56))
- signin header ([5671316](https://github.com/betagouv/service-national-universel/commit/56713169ed4ac2353afaaeb337a21121254bfee5))
- **signin:** hot fix ([#931](https://github.com/betagouv/service-national-universel/pull/931)) ([3054941](https://github.com/betagouv/service-national-universel/commit/30549415ba0e529fa7a2ff861fd0d968682f2b46))
- signup retry template ([#412](https://github.com/betagouv/service-national-universel/pull/412)) ([1809e00](https://github.com/betagouv/service-national-universel/commit/1809e008eb913611230f413774858c85252ee956))
- signup step 6 ([#629](https://github.com/betagouv/service-national-universel/pull/629)) ([0efa943](https://github.com/betagouv/service-national-universel/commit/0efa94365d88ab6ce10275129dbe2cbbe086c946))
- signup step4 ([#626](https://github.com/betagouv/service-national-universel/pull/626)) ([56215b2](https://github.com/betagouv/service-national-universel/commit/56215b2a98c68904b9351e2f4a898359723d37f5))
- signup structure ([cd0ca07](https://github.com/betagouv/service-national-universel/commit/cd0ca07005528913f61e6b0038fe35c44a82a596))
- signup structure description ([3268c41](https://github.com/betagouv/service-national-universel/commit/3268c4110172770007ada8fe778903f50f6568a9))
- **signupInvite:** add repassword and passwordEye ([#650](https://github.com/betagouv/service-national-universel/pull/650)) ([9f7329b](https://github.com/betagouv/service-national-universel/commit/9f7329bbf39fb7358858cb8027c595308cd64105))
- simplify info in availability ([dbfbbc3](https://github.com/betagouv/service-national-universel/commit/dbfbbc3c39faeec9af55839cc9a56fce67f61460))
- snu lib ([c5b9ea5](https://github.com/betagouv/service-national-universel/commit/c5b9ea5208bcde0b011e446ed004e7dd00dd0f13))
- sort country list ([#749](https://github.com/betagouv/service-national-universel/pull/749)) ([4a2bcbd](https://github.com/betagouv/service-national-universel/commit/4a2bcbd9aa08a71a909f077b553227d91888b19c))
- sort UI readability ([#490](https://github.com/betagouv/service-national-universel/pull/490)) ([caf6fe3](https://github.com/betagouv/service-national-universel/commit/caf6fe395a7b880225909f1198d714cab4cfa66d))
- split paragraph ([84a983c](https://github.com/betagouv/service-national-universel/commit/84a983cca1f5c69d90a56941278c990f3f8b98a0))
- status issue [#489](https://github.com/betagouv/service-national-universel/pull/489) ([#491](https://github.com/betagouv/service-national-universel/pull/491)) ([cf4dc80](https://github.com/betagouv/service-national-universel/commit/cf4dc80d26df9d539388b4772f7ae9993d5b3d54))
- status phase ([c6404b8](https://github.com/betagouv/service-national-universel/commit/c6404b889c49b02acaafffe9643a4329db1288f3))
- status pm files ([#574](https://github.com/betagouv/service-national-universel/pull/574)) ([075edce](https://github.com/betagouv/service-national-universel/commit/075edce37b563145a05f50569548288624c64c08))
- status structure on create new mission ([358a470](https://github.com/betagouv/service-national-universel/commit/358a4700296add932174a4a901dc66c7e3305191))
- **status:** changement statut annulée -> dispensée ([#610](https://github.com/betagouv/service-national-universel/pull/610)) ([4a2e0e6](https://github.com/betagouv/service-national-universel/commit/4a2e0e61d613f3a10d2cfbba5ae915f0a4771689))
- stop script ([ed82ae6](https://github.com/betagouv/service-national-universel/commit/ed82ae63343f49adf0e32fbbe51c84e3b3dc2c7f))
- structure and young details ([1c594c1](https://github.com/betagouv/service-national-universel/commit/1c594c122f29f3523078622044b608c6135d4649))
- structure router ([ec5a657](https://github.com/betagouv/service-national-universel/commit/ec5a6573cc7efc0aa8c83407500765e69241e807))
- structures ([918de74](https://github.com/betagouv/service-national-universel/commit/918de74c8c2d6ebd79a59db03ead407f58fffbc7))
- style ([2365ef0](https://github.com/betagouv/service-national-universel/commit/2365ef05fee1af614a888e843f2560630c7faf02))
- style + wording ([97bfafd](https://github.com/betagouv/service-national-universel/commit/97bfafd1e5881fa68fbd92ab71cd89b31a8a6c92))
- style button ([51151ff](https://github.com/betagouv/service-national-universel/commit/51151ff3d87837630d6da2617bcc7647195ea2f6))
- style button ([8107b15](https://github.com/betagouv/service-national-universel/commit/8107b15410ccba634dc60d173749b41ce3d298a5))
- style chat ([56758b5](https://github.com/betagouv/service-national-universel/commit/56758b5d9aa17b4155e2b9cabd950f127ccf12a6))
- style chat :sparkles: ([45d2407](https://github.com/betagouv/service-national-universel/commit/45d2407808ea6f290f8f614104178215b41acd58))
- style dropdown dashboard ([318124b](https://github.com/betagouv/service-national-universel/commit/318124b986826c2c60d648e342a68df7339a3b95))
- style informations ([75bf70b](https://github.com/betagouv/service-national-universel/commit/75bf70be59f0ffdf16df7295ebd677bbe5283ed8))
- style new ticket ([c2a625a](https://github.com/betagouv/service-national-universel/commit/c2a625a6d6098a1f3333bb1e80475e816a1cd903))
- style phase3 ([ec916e5](https://github.com/betagouv/service-national-universel/commit/ec916e57cf0232e2e00e1d6e8985313be5e41c23))
- style pm ([7f4edb0](https://github.com/betagouv/service-national-universel/commit/7f4edb07c98a38cdc8793119c9c1edebff3b0f2c))
- style upload doc preparation militaire ([4db4e74](https://github.com/betagouv/service-national-universel/commit/4db4e7484a818ee7d0eb4e7396175e500c6fc106))
- **style:** add margin on besoin d'aide ([#502](https://github.com/betagouv/service-national-universel/pull/502)) ([0e5ddf7](https://github.com/betagouv/service-national-universel/commit/0e5ddf70738c6b7e164fbda5eff3d940a008a6b0)), closes [#495](https://github.com/betagouv/service-national-universel/pull/495)
- **style:** badge on profil page ([#501](https://github.com/betagouv/service-national-universel/pull/501)) ([1f2aada](https://github.com/betagouv/service-national-universel/commit/1f2aada0228fe799c83e7a695d189ab8f3eb71ca)), closes [#496](https://github.com/betagouv/service-national-universel/pull/496)
- styled component ([852eff0](https://github.com/betagouv/service-national-universel/commit/852eff037cad74a61477c738aeb9eb97ba955a97))
- **style:** header height ([#288](https://github.com/betagouv/service-national-universel/pull/288)) ([57a2c91](https://github.com/betagouv/service-national-universel/commit/57a2c91523cc1b168ac2d70b3efafd16e8b76827))
- **style:** lire la suite ([1b3d7fb](https://github.com/betagouv/service-national-universel/commit/1b3d7fb37e8dfa83fc549eda44ee99bc6dd821ef))
- **style:** margin in support ([832d8f2](https://github.com/betagouv/service-national-universel/commit/832d8f2eb406b902935ba1aa1f4094675215b5cb))
- submenu - app drawer ([453b1d4](https://github.com/betagouv/service-national-universel/commit/453b1d4d541ba8a757aa5d618e9c1790847350f6))
- suggestion error on etablissement ([#58](https://github.com/betagouv/service-national-universel/pull/58)) ([8a81ae2](https://github.com/betagouv/service-national-universel/commit/8a81ae2b7da75c64f684e8e2c1f0363cf95fa8b5))
- supervisor and responsible ([3f7fad1](https://github.com/betagouv/service-national-universel/commit/3f7fad15a6503641b4de6a1519387d1618e9ee06))
- support - several fixes ([#532](https://github.com/betagouv/service-national-universel/pull/532)) ([b8c177a](https://github.com/betagouv/service-national-universel/commit/b8c177a59ce5faf32445ef08643d8ffc6935fef8))
- support center UI ([bfaf41e](https://github.com/betagouv/service-national-universel/commit/bfaf41e2e204b48dc1d713cb6e2808daaa4e05f8))
- support ui ([a6600e6](https://github.com/betagouv/service-national-universel/commit/a6600e687c09ed7dede8c90f66db59f004e2cdc4))
- **support-center:** add return if there's no tickets ([#630](https://github.com/betagouv/service-national-universel/pull/630)) ([19df74f](https://github.com/betagouv/service-national-universel/commit/19df74f94891548373e3de314c995b7b0e4859eb))
- **support:** add loading button ([#772](https://github.com/betagouv/service-national-universel/pull/772)) ([2b1f86c](https://github.com/betagouv/service-national-universel/commit/2b1f86caeb1826617294f39b65a4ac08df96f8c2))
- **support:** app url in staging ([#817](https://github.com/betagouv/service-national-universel/pull/817)) ([5388b3f](https://github.com/betagouv/service-national-universel/commit/5388b3fe5cb7f2fd37c35bed77f267bf10d5e068))
- **supportCenter:** add log ([fd4535c](https://github.com/betagouv/service-national-universel/commit/fd4535c142e9692f9cc35762cb3082748f1e9be0))
- **supportCenter:** change email ([2526269](https://github.com/betagouv/service-national-universel/commit/25262696222a9cd3decec1d7a487dc393f3f4217))
- **supportCenter:** change email and console log ([b6ad36c](https://github.com/betagouv/service-national-universel/commit/b6ad36cc8e39b689c2ec5c03d85fe6615bcacd18))
- **supportCenter:** referent object ([8734502](https://github.com/betagouv/service-national-universel/commit/87345026e169c6b958cb505872aea2066f80acd4))
- **supportCenter:** remove all log ([ca6f8d5](https://github.com/betagouv/service-national-universel/commit/ca6f8d5d7a346f8b155fae892b198c4415d760dd))
- **support:** change knowledge base articles ([f42c924](https://github.com/betagouv/service-national-universel/commit/f42c924f79450888251a5a40f290aea83135a26b))
- **support:** eslint prevent building ([#902](https://github.com/betagouv/service-national-universel/pull/902)) ([a732c6b](https://github.com/betagouv/service-national-universel/commit/a732c6bb26c631e6902ea1f3a65427d3dff599b7))
- **support:** get tickets ([#627](https://github.com/betagouv/service-national-universel/pull/627)) ([24277df](https://github.com/betagouv/service-national-universel/commit/24277df7119c388aedc37cb93bb35454f226862b))
- **support:** hide internal notes ([9212efa](https://github.com/betagouv/service-national-universel/commit/9212efaa1dfe9507dfe46b1221c6de02d1b7df9e))
- **support:** if no item ([#966](https://github.com/betagouv/service-national-universel/pull/966)) ([474cbaa](https://github.com/betagouv/service-national-universel/commit/474cbaaa872e6166d11f9f5fdec3ca5730715db8))
- **support:** lint ([#903](https://github.com/betagouv/service-national-universel/pull/903)) ([756452d](https://github.com/betagouv/service-national-universel/commit/756452d0a538bb8694571185a6b1e869bf02c184))
- **support:** minor deisgn changes ([#901](https://github.com/betagouv/service-national-universel/pull/901)) ([3a2dbdb](https://github.com/betagouv/service-national-universel/commit/3a2dbdb5070ad4c90f932185a1e69639ed58421f))
- **support:** NEXT_PUBLIC_ENVIRONMENT variable ([#818](https://github.com/betagouv/service-national-universel/pull/818)) ([9860d37](https://github.com/betagouv/service-national-universel/commit/9860d375f3195d9232cc0b952f4e189b089c68a0))
- **support:** text editor + tree ([#854](https://github.com/betagouv/service-national-universel/pull/854)) ([1bb111c](https://github.com/betagouv/service-national-universel/commit/1bb111c9c58c8b8a4dec6932ae16cab409e5184e))
- **support:** tree + text editor ([#867](https://github.com/betagouv/service-national-universel/pull/867)) ([0e1baab](https://github.com/betagouv/service-national-universel/commit/0e1baab103afb36829ee0bfe0c4e5f3bc52725be))
- sync info jeune avec ses applications ([#580](https://github.com/betagouv/service-national-universel/pull/580)) ([c20fcc0](https://github.com/betagouv/service-national-universel/commit/c20fcc09902fa600305511769fc6749e95c6c42e)), closes [#578](https://github.com/betagouv/service-national-universel/pull/578)
- sync with zammad roles ([#598](https://github.com/betagouv/service-national-universel/pull/598)) ([84b781c](https://github.com/betagouv/service-national-universel/commit/84b781c044291540eeed514d2fd98ed56be35e46))
- tabs in url - dashboard ([#845](https://github.com/betagouv/service-national-universel/pull/845)) ([1148b08](https://github.com/betagouv/service-national-universel/commit/1148b08dc036142caf0b77a5806650b21c33feb9)), closes [#774](https://github.com/betagouv/service-national-universel/pull/774)
- take control ([f36375b](https://github.com/betagouv/service-national-universel/commit/f36375b280335f3ca24fa2ffdad5e60f7ae7c865))
- take control ([d2f236c](https://github.com/betagouv/service-national-universel/commit/d2f236c4da8ec89e60b5acd3fb7e95114e14b88a))
- taux de remplissage dashboard ([#842](https://github.com/betagouv/service-national-universel/pull/842)) ([5c010dc](https://github.com/betagouv/service-national-universel/commit/5c010dc0403c5365a37aae646ec756c5a4f2cfbc))
- test cron env ([048681d](https://github.com/betagouv/service-national-universel/commit/048681d12e8171e1dece6bf6fd775204c6fb7122))
- text input support ([9314918](https://github.com/betagouv/service-national-universel/commit/9314918c5558eb728d4220d15f9a1331f5ee18ee))
- thanks eslint ([75168b2](https://github.com/betagouv/service-national-universel/commit/75168b24a0075beda1f93d42cf420c2892445127))
- title on invite ([4cd55d6](https://github.com/betagouv/service-national-universel/commit/4cd55d64102e477f8b3ddb1b543aae2234f26ede))
- total steps in nav mobile ([bf95ae6](https://github.com/betagouv/service-national-universel/commit/bf95ae6617891dbde20166525271825785a2f382))
- translate export ([768e018](https://github.com/betagouv/service-national-universel/commit/768e0185688c6223a3a1c1d59eb5ec813ef296eb))
- translate not defined ([9e534a0](https://github.com/betagouv/service-national-universel/commit/9e534a0d5222ffedc394a659e3fb6fe1fc86a0bf))
- translation exempted ([52c7a74](https://github.com/betagouv/service-national-universel/commit/52c7a74257d764343e330ccc4f4212f92fd21e68))
- try catch missing ([dab23c6](https://github.com/betagouv/service-national-universel/commit/dab23c66655ca4c2a14b52b6daa7b8378412d93e))
- try to fix reactivesearch error ([#62](https://github.com/betagouv/service-national-universel/pull/62)) ([b45e6b8](https://github.com/betagouv/service-national-universel/commit/b45e6b82fc5ba9843698ca492599f981759a3479))
- UI alert in contract ([d92e280](https://github.com/betagouv/service-national-universel/commit/d92e280b1519fee37782d092f9542f946f9e50fa))
- **ui:** content grid ([70c5807](https://github.com/betagouv/service-national-universel/commit/70c580737f283869a2fa0de6ec9ae39d6e118e09))
- **ui:** hide drawer small screen ([1714698](https://github.com/betagouv/service-national-universel/commit/1714698f70deb7f5864addc4d8eaf1afa7640eef))
- **ui:** style list ([6e1b70b](https://github.com/betagouv/service-national-universel/commit/6e1b70b7723b592ded09af23bc0047fb67bbc96d))
- unable to get property doc_count ([#70](https://github.com/betagouv/service-national-universel/pull/70)) ([53b50c1](https://github.com/betagouv/service-national-universel/commit/53b50c1a57eb0ef0b1872d7b01afd8251ebc164c))
- update a ticket by its id ([e459919](https://github.com/betagouv/service-national-universel/commit/e459919bd2dcc54d2353dced7ceb19551910dbac))
- update categories supprot admin ([5122255](https://github.com/betagouv/service-national-universel/commit/512225557a13efa739a61d1e4b39aba5d6f4ae16))
- update cohesion center dependencies ([#324](https://github.com/betagouv/service-national-universel/pull/324)) ([fa502e7](https://github.com/betagouv/service-national-universel/commit/fa502e70652d1d639d3c574db8e63597ff5c8127))
- update date info ([25f0a5a](https://github.com/betagouv/service-national-universel/commit/25f0a5a825a0742b71857b9a74349adf7f4f3035))
- update document ([3969b93](https://github.com/betagouv/service-national-universel/commit/3969b932f8446bcacaa6e92cb882f5b638ee1560))
- update excluded grades for sessions ([6e0391f](https://github.com/betagouv/service-national-universel/commit/6e0391fc386fc73b300c342c0debbf666069b8ab))
- update puppeteer ([f138149](https://github.com/betagouv/service-national-universel/commit/f138149bfee24423283b974e422fcc675698142b))
- update template doc pm ([1029f3a](https://github.com/betagouv/service-national-universel/commit/1029f3a605a78a4c90a76bbce27b622ac25caf46))
- update ticket ([f8e48d7](https://github.com/betagouv/service-national-universel/commit/f8e48d78e288b6d2f1f41c2ae0217d34f3774b95))
- upload file case ([45a5ae8](https://github.com/betagouv/service-national-universel/commit/45a5ae8b002592ec58803d4f1ddbee0c25a74bae))
- url faq ([9d7e796](https://github.com/betagouv/service-national-universel/commit/9d7e796a8617f60b7985d42273b525a356078c17))
- url for cta ([d97a63e](https://github.com/betagouv/service-national-universel/commit/d97a63e3d249edaf8c473909a528f494d24d0bfe))
- useless filter ([f34c7e8](https://github.com/betagouv/service-national-universel/commit/f34c7e82c4471834837147b9c413cd08f1bf4d23))
- ux ticket ([a102139](https://github.com/betagouv/service-national-universel/commit/a102139778fa144e04e15452516812e2453e1a98))
- validate cohesion center ([5caca61](https://github.com/betagouv/service-national-universel/commit/5caca61e4d2dcc34dd3ac5c8f6af643e244ed2e7))
- validate optional ID ([2c49197](https://github.com/betagouv/service-national-universel/commit/2c49197bf126cb61d5b56e238a5dc3da931c8418))
- validate with cohesion center for young with joi ([35a6c49](https://github.com/betagouv/service-national-universel/commit/35a6c49b697911d214d925f221ed27093f0d3cc3))
- validation adresse ([#918](https://github.com/betagouv/service-national-universel/pull/918)) ([2259d77](https://github.com/betagouv/service-national-universel/commit/2259d777e97c87a93739833088646b97e7ed430b)), closes [#908](https://github.com/betagouv/service-national-universel/pull/908)
- validation field signup ([#688](https://github.com/betagouv/service-national-universel/pull/688)) ([5173287](https://github.com/betagouv/service-national-universel/commit/51732875ab382af3458119d20046138d452dfb26))
- validation phase 3 ([#568](https://github.com/betagouv/service-national-universel/pull/568)) ([cd8da34](https://github.com/betagouv/service-national-universel/commit/cd8da34e94f9a4be5ca4aaa413070bf7051bf903)), closes [#563](https://github.com/betagouv/service-national-universel/pull/563)
- validator ([2250e8e](https://github.com/betagouv/service-national-universel/commit/2250e8ef802b2c67a0dd011c3b91d196ceb32c9d))
- valider ville et code postal de naissance ([#698](https://github.com/betagouv/service-national-universel/pull/698)) ([9ec9707](https://github.com/betagouv/service-national-universel/commit/9ec970767c26e40266c76593cfe4238ebbc5ca57)), closes [#692](https://github.com/betagouv/service-national-universel/pull/692)
- verify address and style ([c797d79](https://github.com/betagouv/service-national-universel/commit/c797d79ab9fcd1ae2927d2260451661f1b250cfe))
- visibility mission ([dfae36c](https://github.com/betagouv/service-national-universel/commit/dfae36c081e941df2814c02285c3088c20b49fc4))
- volontaires ([b850336](https://github.com/betagouv/service-national-universel/commit/b850336368588a975b9516920f407b791dee8b87))
- warning in default value ([255d0c6](https://github.com/betagouv/service-national-universel/commit/255d0c65704b62f458bb3291f4f05be34444a4d5))
- wording ([dc627e1](https://github.com/betagouv/service-national-universel/commit/dc627e1014022739ce76c243817da1a3a845b66d))
- wording ([b3ea018](https://github.com/betagouv/service-national-universel/commit/b3ea01887f1d7fe2a02b538d39bb0fa9de4d02fa))
- wording ([cb9379f](https://github.com/betagouv/service-national-universel/commit/cb9379fd347aba4c5f57942c3fc7abd80a8cd660))
- wording consentement ([865b9e3](https://github.com/betagouv/service-national-universel/commit/865b9e36262fa3225cf3e286936c33d0311a2794))
- wording export young ([43b6e0e](https://github.com/betagouv/service-national-universel/commit/43b6e0e1bf7d967d0d59cb1b169e51e93e685db9))
- wording modals ([e71b02e](https://github.com/betagouv/service-national-universel/commit/e71b02e5d3a03aaafe34ffa37f68adcf80c3ceec))
- wording toastr account duplicate ([82389ab](https://github.com/betagouv/service-national-universel/commit/82389ab9b9ac9d8a24cbb4f5cda706d959b6fbd1))
- **wording:** motif exempted phase 1 in app ([86b7861](https://github.com/betagouv/service-national-universel/commit/86b786148f3c77d8af9433bd660ffa2c54184c6a))
- **wording:** phase1/view - exempted motif ([429dda7](https://github.com/betagouv/service-national-universel/commit/429dda73de99250f34bd3447d38abbbba277cb1c))
- young cannot change its names ([afc9143](https://github.com/betagouv/service-national-universel/commit/afc9143b473cfefca372536d1164ac395c981069))
- young details style ([3b535aa](https://github.com/betagouv/service-national-universel/commit/3b535aa815f101c30f62b7ac1af2ec77f15d115e))
- **young list:** items clickable ([#753](https://github.com/betagouv/service-national-universel/pull/753)) ([58b18ef](https://github.com/betagouv/service-national-universel/commit/58b18ef76a7f6d251ded41e21c62e06aa8b1d759))
- **young:** set inscriptionMessage in set status ([#752](https://github.com/betagouv/service-national-universel/pull/752)) ([9a05f43](https://github.com/betagouv/service-national-universel/commit/9a05f43c6d20612733513067c5854a20f8f9f219))
- zammad chat ([3bc4571](https://github.com/betagouv/service-national-universel/commit/3bc45714f41fb6119103944017bdecba4bff6fe4))
- zammad chat (follow guidelines) ([aaecfe8](https://github.com/betagouv/service-national-universel/commit/aaecfe8269a7efda7db45933a9f0a81492c13ef0))
- zammad group Structures ([9465f7f](https://github.com/betagouv/service-national-universel/commit/9465f7f063f7b89d2092391f7dbbf98dbc51699d))
- **zammadAuth:** add logs and remove tripe equals ([1bf95ee](https://github.com/betagouv/service-national-universel/commit/1bf95eea9137ef328b764fe6df523f65727bd421))
- ZammadChat ([d609d58](https://github.com/betagouv/service-national-universel/commit/d609d58f941dcaca3190627e2e2900f290d5dd90))
- **zammad:** load chat only if jquery is here ([b9ccd06](https://github.com/betagouv/service-national-universel/commit/b9ccd06ba87668416d8182309c86a3fbfa254d32))
- **zammad:** remove referent region notification ([#838](https://github.com/betagouv/service-national-universel/pull/838)) ([904a175](https://github.com/betagouv/service-national-universel/commit/904a175e9c8a02cef379dc01f4a4d0fc1c62613e))
- zrr ([#713](https://github.com/betagouv/service-national-universel/pull/713)) ([67e628b](https://github.com/betagouv/service-national-universel/commit/67e628b3506d44651d9a0a48ec64f9fb338c3f8e))

### Features

- knowledge base articles ([#510](https://github.com/betagouv/service-national-universel/pull/510)) ([087142f](https://github.com/betagouv/service-national-universel/commit/087142feda6d9519ad06f3f1f14f48a3da52a7e7))
- accept cgu new users ([#800](https://github.com/betagouv/service-national-universel/pull/800)) ([eaba955](https://github.com/betagouv/service-national-universel/commit/eaba95555b8158af0c3b000276edccf49ac54d53))
- activate recap bi hebdo ([f3bb525](https://github.com/betagouv/service-national-universel/commit/f3bb5250e250f350b0a4c43c2a37749f230810ed))
- add 2019 on dashboard ([6eedfc5](https://github.com/betagouv/service-national-universel/commit/6eedfc5f815a199951618852ac966f2c362160f9))
- add academy in export ([01f0514](https://github.com/betagouv/service-national-universel/commit/01f0514859142ab834d6a332c58a6e3e1443990c))
- add academy in inscriptoinGoals ([a776b47](https://github.com/betagouv/service-national-universel/commit/a776b4700afad11c0eaec4f45d431a46a22c428b))
- add aknowledgment checkbox ([76fd24f](https://github.com/betagouv/service-national-universel/commit/76fd24f786985b861bb92f3773e65177aead41d6))
- add application status in young to improve filters ([9e0c972](https://github.com/betagouv/service-national-universel/commit/9e0c972911afe3da0e9c87d6858ad07aefb9d8ff))
- add auto affectation expired ([23fb96a](https://github.com/betagouv/service-national-universel/commit/23fb96a6f8b5d0b2fcdbb82e159e5020c2c8190b))
- add bilan santé ([5cb46b4](https://github.com/betagouv/service-national-universel/commit/5cb46b40f0a662385a5b377ebc808bce76c8740e))
- add birthdateAt in view ([f368588](https://github.com/betagouv/service-national-universel/commit/f36858813ed21c7779f355a718bca3d068b38e56))
- add button ([7cf1a42](https://github.com/betagouv/service-national-universel/commit/7cf1a42ecc9faf109abbe093fa1ed25cb3d2fb5d))
- add button archive in panel inscription ([f970ff2](https://github.com/betagouv/service-national-universel/commit/f970ff2cf8a4fd4c499c0fb3c6e4e22b9afe8e0e))
- add button export applications for a young ([6cdb244](https://github.com/betagouv/service-national-universel/commit/6cdb244274b3b2ebf3e6e615978bbf18478135af))
- add chat in app ([371882f](https://github.com/betagouv/service-national-universel/commit/371882ffaddcf23d4094ca37f626049c4a0cc96d))
- add cohesionStayPresence ([340ddf0](https://github.com/betagouv/service-national-universel/commit/340ddf0512809ff983fdaa31d7137f811c8c7264))
- add cohort in inscription list ([5ffec63](https://github.com/betagouv/service-national-universel/commit/5ffec6399406769e0ed7f7a931d4b833e5ab39b7))
- add cohort on inscription ([#656](https://github.com/betagouv/service-national-universel/pull/656)) ([b055689](https://github.com/betagouv/service-national-universel/commit/b05568981821fbbe69f76165c12be9127039546f))
- add consentements in view young ([#840](https://github.com/betagouv/service-national-universel/pull/840)) ([a68619b](https://github.com/betagouv/service-national-universel/commit/a68619b24265f3811ee9d1c273171ddad578b903))
- add contact manager_phase2 ([e232c37](https://github.com/betagouv/service-national-universel/commit/e232c37f7c5ffed6cad13e8ab5eb2d66ea293497))
- add contact referent department ([0f08e54](https://github.com/betagouv/service-national-universel/commit/0f08e54ac23f81849c4ec9548a2b9252274a3995))
- add contact referent on validate screen ([93470d0](https://github.com/betagouv/service-national-universel/commit/93470d0bbec246981883fb803f9e750982a6b64e))
- add corps en uniforme ([fda7462](https://github.com/betagouv/service-national-universel/commit/fda7462372e8aeceb802e6910ae347989a099dbd))
- add corps en uniforme ([347fa9a](https://github.com/betagouv/service-national-universel/commit/347fa9a480d3e24761710fe07105ae374144d4e7))
- add correction messages history ([#828](https://github.com/betagouv/service-national-universel/pull/828)) ([6b7c5e3](https://github.com/betagouv/service-national-universel/commit/6b7c5e3b97348d70f13c06ecc4dfb8bc1439a931))
- add country in school model ([abd5ff5](https://github.com/betagouv/service-national-universel/commit/abd5ff58835b504021e0bc591b4cd9f80c32c978))
- add create mission link for responsible ([1c05902](https://github.com/betagouv/service-national-universel/commit/1c05902bae670e5459ef0bb19c20380f4f157258))
- add desistes ([dfe9340](https://github.com/betagouv/service-national-universel/commit/dfe9340d927ea45a76983f25e5c41af6b2061a34))
- add duplicate script ([52d7eb3](https://github.com/betagouv/service-national-universel/commit/52d7eb32f642362fbaab88a6328961259a64d43d))
- add events in admin ([#80](https://github.com/betagouv/service-national-universel/pull/80)) ([9406361](https://github.com/betagouv/service-national-universel/commit/9406361b2c8382187025a3dba793ad86bf003b99))
- add export youngs in centers ([d3e479e](https://github.com/betagouv/service-national-universel/commit/d3e479ec76b6ff972f01a20d59643c1e0fd64f27))
- add fc in admin ([08cdc03](https://github.com/betagouv/service-national-universel/commit/08cdc03389040a2713b198af90c2302d3d72d5ab))
- add fetch-rety in app and admin ([#734](https://github.com/betagouv/service-national-universel/pull/734)) ([6601510](https://github.com/betagouv/service-national-universel/commit/6601510e6a36d4f80f0e1443e34b7d6bd1b24f19)), closes [#732](https://github.com/betagouv/service-national-universel/pull/732)
- add fillingRate cron ([003fc31](https://github.com/betagouv/service-national-universel/commit/003fc31153dddace1a46218793937c9af5387ee9))
- add filters in young ([a193a62](https://github.com/betagouv/service-national-universel/commit/a193a6256e175be99f84f4c16c7d57a2a8353e31))
- add google tag manager ([1c07655](https://github.com/betagouv/service-national-universel/commit/1c076557c87389e70a64231334fc00e09b3563ef))
- add helmet ([#339](https://github.com/betagouv/service-national-universel/pull/339)) ([6a28dc3](https://github.com/betagouv/service-national-universel/commit/6a28dc3d38a442cb2e6d69f2f7bf38f27bae1edf))
- add help text ([4b98656](https://github.com/betagouv/service-national-universel/commit/4b98656faae7e8825188d492b46866e3fa450fc4))
- add hours MIG ([#458](https://github.com/betagouv/service-national-universel/pull/458)) ([3b99edc](https://github.com/betagouv/service-national-universel/commit/3b99edc88a9476d3088747f1be2664bad649f007))
- add item dashboard 2022 ([#761](https://github.com/betagouv/service-national-universel/pull/761)) ([428d555](https://github.com/betagouv/service-national-universel/commit/428d555d241d9d2de05342442dbc9f61b373511b))
- add jdma ([#767](https://github.com/betagouv/service-national-universel/pull/767)) ([8ad6ecc](https://github.com/betagouv/service-national-universel/commit/8ad6ecc35302c9d6217b70b6d8fd8c692e649362))
- add joi on mission controller (+test) ([#241](https://github.com/betagouv/service-national-universel/pull/241)) ([e697e5d](https://github.com/betagouv/service-national-universel/commit/e697e5d774bb26aa37fefc12d453ace7d0ca94e0))
- add loaders on inscription buttons ([#737](https://github.com/betagouv/service-national-universel/pull/737)) ([1f33520](https://github.com/betagouv/service-national-universel/commit/1f335205ee6cc23105d710c7e1a0e25e994c9c66)), closes [#736](https://github.com/betagouv/service-national-universel/pull/736)
- add lumiere ([#167](https://github.com/betagouv/service-national-universel/pull/167)) ([d39377b](https://github.com/betagouv/service-national-universel/commit/d39377b0604e5e1ccb51295d5035af842d96aa03))
- add mail to responsible - mission waiting validation ([8273869](https://github.com/betagouv/service-national-universel/commit/827386920718e5200350de3fe03ab77baae01e87))
- add military preparation docs reminder ([67c24ad](https://github.com/betagouv/service-national-universel/commit/67c24ad1b2822f8655da3e3d33e61ef0a28478b8))
- add mission duration in application and hours in young ([#457](https://github.com/betagouv/service-national-universel/pull/457)) ([02d4c54](https://github.com/betagouv/service-national-universel/commit/02d4c548c1d78985a145e41ae50b682ac02970ab))
- add missions list in structure panel ([#514](https://github.com/betagouv/service-national-universel/pull/514)) ([4a26a5a](https://github.com/betagouv/service-national-universel/commit/4a26a5a690692020d0c248e44c07b62350ad96b1)), closes [#503](https://github.com/betagouv/service-national-universel/pull/503)
- add mobile scripts to package.json ([319e394](https://github.com/betagouv/service-national-universel/commit/319e394dcd24bf737ebbec24b3d50fc184a7e737))
- add more template from sendinblue ([4afbf24](https://github.com/betagouv/service-national-universel/commit/4afbf24fc8094fe9987e8e21bd134462f7ce33e1))
- add mysql in env example ([dcbfa4f](https://github.com/betagouv/service-national-universel/commit/dcbfa4fe98b0f152960d4cdef8a1060eb8fb7bc0))
- add network name in structure ([bbd40f5](https://github.com/betagouv/service-national-universel/commit/bbd40f5e915f3d8d1613b13654f08306f7352246))
- add network name in structure, export volontaires excel ([#144](https://github.com/betagouv/service-national-universel/pull/144)) ([08f604d](https://github.com/betagouv/service-national-universel/commit/08f604dbca128ceea5b0ba10b041ce6b1c634dfd))
- add new matomo ([4127d4b](https://github.com/betagouv/service-national-universel/commit/4127d4bb0a432d78a94efe144dc81304ccdb11b8))
- add new tabs for referents ([7446d73](https://github.com/betagouv/service-national-universel/commit/7446d73970485edd630c4407252d212294f8aa91))
- add note in step representant ([0371500](https://github.com/betagouv/service-national-universel/commit/0371500e2256cb1bb4b002427d662970f2e19d8b))
- add number of applications for each mission ([b58bb87](https://github.com/betagouv/service-national-universel/commit/b58bb8761171e0939d3e1f074169436ff7e91809))
- add passwordEye ([0ef4fbc](https://github.com/betagouv/service-national-universel/commit/0ef4fbc5812ea187d4844463058a160418d39c32))
- add place mission in young application ([215fef2](https://github.com/betagouv/service-national-universel/commit/215fef2caf981ea36017f0b9676a9833823f1bb2))
- add plausible ([66d08f1](https://github.com/betagouv/service-national-universel/commit/66d08f1b0fd9899d5d2dc4ddca82541969b5304e))
- add plausible admin ([bf38538](https://github.com/betagouv/service-national-universel/commit/bf38538261b483466d12e1eaa70bf34c7c1eb918))
- add referents in export structure ([96eddd6](https://github.com/betagouv/service-national-universel/commit/96eddd6363fb3f17ff663ef28ecbeff9542414b3))
- add schools stats ([#61](https://github.com/betagouv/service-national-universel/pull/61)) ([038c8a2](https://github.com/betagouv/service-national-universel/commit/038c8a2ee460ad8db8a8681ecf62be933880b59a))
- add scrolldown messages ([aa433cd](https://github.com/betagouv/service-national-universel/commit/aa433cd5feaa46a9a4f112ee449dd1f15b52c765))
- add slack in outdated missions cron ([fe0abdd](https://github.com/betagouv/service-national-universel/commit/fe0abddf10630ac6703546f4a3592cc743ee49f6))
- add slack notif in sync api engagement ([d8bfa3c](https://github.com/betagouv/service-national-universel/commit/d8bfa3cd846eb320e42b5c1e68778cb7d422fee9))
- add slack service ([2db7aa2](https://github.com/betagouv/service-national-universel/commit/2db7aa2c614b1f6006a11e113fd98415070e2276))
- add status in young ([d820f1f](https://github.com/betagouv/service-national-universel/commit/d820f1ff58c6fda523d815e27ae67a4d2a6ec802))
- add status mission comment in details ([5297706](https://github.com/betagouv/service-national-universel/commit/5297706a08bc8b686bfc09038c0db0c2b0fb4581))
- add structures ([#83](https://github.com/betagouv/service-national-universel/pull/83)) ([57e74c4](https://github.com/betagouv/service-national-universel/commit/57e74c412da6729edc1581c362024ed0da9e91c7))
- add tag campagne media ([#910](https://github.com/betagouv/service-national-universel/pull/910)) ([e8cde1d](https://github.com/betagouv/service-national-universel/commit/e8cde1dc070b2a487ae69f21324d358a993ac7e0))
- add team in structure ([4ce7e6d](https://github.com/betagouv/service-national-universel/commit/4ce7e6dccf2e1c6cc89ac5050977896acb5f1cde))
- add text ([b490afb](https://github.com/betagouv/service-national-universel/commit/b490afb29fe618f4481fa28ee608961ff8380190))
- add ticket/search-by-tags route ([54460f8](https://github.com/betagouv/service-national-universel/commit/54460f89f40264d8563bf0066d36c8e83a48a6ed))
- add trigger campain ([76f0a6e](https://github.com/betagouv/service-national-universel/commit/76f0a6e925a2ce364befdcc4f786505094baf651))
- add tutor name in applications and missions ([#135](https://github.com/betagouv/service-national-universel/pull/135)) ([b2aa395](https://github.com/betagouv/service-national-universel/commit/b2aa3958c74b39f943a7f51dfbf0edf75c8db167))
- add URLParams in searchbox ([945d26a](https://github.com/betagouv/service-national-universel/commit/945d26aea673557bea1416939ef3ca19d6abda99))
- add user in patches application ([91fb7fb](https://github.com/betagouv/service-national-universel/commit/91fb7fb8a00360508979acd57fa4fe8a9034c3ba))
- add user in patches mission ([d053d6d](https://github.com/betagouv/service-national-universel/commit/d053d6d9ae79d102d4dc1a62841d378dd4b29147))
- add user in patches referent ([3e60748](https://github.com/betagouv/service-national-universel/commit/3e60748259c7a9cada800abebe14ab2c59403dbb))
- add user info for admin in chat ([fc3cd70](https://github.com/betagouv/service-national-universel/commit/fc3cd70bc9ab376746545297bdb8acbabd9d57e3))
- add user un patches structure ([48a81ea](https://github.com/betagouv/service-national-universel/commit/48a81eac77e5b1fb520a251e50414ce668eb6c9a))
- add utilisateurs for referents ([fd00537](https://github.com/betagouv/service-national-universel/commit/fd0053729f26c587b77559e0e48ce8409e025289))
- add volontaires for responsible ([89113cb](https://github.com/betagouv/service-national-universel/commit/89113cb15535270cf648a7ff180ef504c904ed57))
- add wording ([09eea87](https://github.com/betagouv/service-national-universel/commit/09eea8720fb112a9af035007ea47ad4938c81a4f))
- add zammad chat in admin ([#439](https://github.com/betagouv/service-national-universel/pull/439)) ([b3089b2](https://github.com/betagouv/service-national-universel/commit/b3089b2b7ddf6cad253b287604d2cfdd8905b93e))
- address component in mission ([#846](https://github.com/betagouv/service-national-universel/pull/846)) ([1239f20](https://github.com/betagouv/service-national-universel/commit/1239f20f1ce6481d22df1a5262d131d9beff8dfa)), closes [#844](https://github.com/betagouv/service-national-universel/pull/844)
- **admin:** a referent should be able to view/modify responsible ([#815](https://github.com/betagouv/service-national-universel/pull/815)) ([b9ed842](https://github.com/betagouv/service-national-universel/commit/b9ed8428bd1d58e4ff0311fdb069ea6904855dfa))
- **admin:** add cohort filter ([b2ba5e4](https://github.com/betagouv/service-national-universel/commit/b2ba5e4c60ea955078a576b5f9777b09461b0e4d))
- **admin:** add knowledge base articles ([#892](https://github.com/betagouv/service-national-universel/pull/892)) ([c1ac3ee](https://github.com/betagouv/service-national-universel/commit/c1ac3ee4fa9580927dd5efd77dc59b7b5357f228))
- **admin:** add public support center ([#799](https://github.com/betagouv/service-national-universel/pull/799)) ([afa5314](https://github.com/betagouv/service-national-universel/commit/afa53148cd37e07a85a44beef1e0c0d2bf9bbaea))
- ajout académie dans profil volontaire ([#768](https://github.com/betagouv/service-national-universel/pull/768)) ([781a90e](https://github.com/betagouv/service-national-universel/commit/781a90e34b42da419cc0024dc260ee1ba9e049a7))
- ajouter un lien pour envoyer le contrat par mail ([#601](https://github.com/betagouv/service-national-universel/pull/601)) ([15d0624](https://github.com/betagouv/service-national-universel/commit/15d0624daf37207ed86b6a0b6d029c97e6f29db5)), closes [#597](https://github.com/betagouv/service-national-universel/pull/597) [#597](https://github.com/betagouv/service-national-universel/pull/597)
- allow young to access phase 2 during phase 1 ([63b6204](https://github.com/betagouv/service-national-universel/commit/63b620462ee1f86b7d97327b1e02ada9484f6437))
- améliorer UI du bouton "Télécharger modèle" ([#520](https://github.com/betagouv/service-national-universel/pull/520)) ([2ca27bb](https://github.com/betagouv/service-national-universel/commit/2ca27bb1978693659d29a55c8e8f5f203e14edb5))
- archive young ([#900](https://github.com/betagouv/service-national-universel/pull/900)) ([9c9b686](https://github.com/betagouv/service-national-universel/commit/9c9b686f6c900a17bf2bb0ce5899dcfc67b841de))
- association directory ([#466](https://github.com/betagouv/service-national-universel/pull/466)) ([8282b92](https://github.com/betagouv/service-national-universel/commit/8282b92b0bf82b1da13907a72953027c19cd2f20))
- **association:** add a link ([#560](https://github.com/betagouv/service-national-universel/pull/560)) ([11f322e](https://github.com/betagouv/service-national-universel/commit/11f322e7c71ec4abd23794c0fb98c6665a26df29)), closes [#555](https://github.com/betagouv/service-national-universel/pull/555)
- **association:** add mission from API engagement ([#535](https://github.com/betagouv/service-national-universel/pull/535)) ([71b7dcd](https://github.com/betagouv/service-national-universel/commit/71b7dcd2c1eb596024167cba32ad8ae988e854c5)), closes [#511](https://github.com/betagouv/service-national-universel/pull/511) [#511](https://github.com/betagouv/service-national-universel/pull/511)
- **association:** delete phone button ([#529](https://github.com/betagouv/service-national-universel/pull/529)) ([6ca3741](https://github.com/betagouv/service-national-universel/commit/6ca3741a592521069a50598f28c8a2bf947773d7)), closes [#521](https://github.com/betagouv/service-national-universel/pull/521)
- **association:** open mailto on click on @ button ([#527](https://github.com/betagouv/service-national-universel/pull/527)) ([bf812e2](https://github.com/betagouv/service-national-universel/commit/bf812e23a8bbebaf25876e174972afdac96baad9)), closes [#524](https://github.com/betagouv/service-national-universel/pull/524)
- **association:** open url field when click on url button ([#528](https://github.com/betagouv/service-national-universel/pull/528)) ([267dbdb](https://github.com/betagouv/service-national-universel/commit/267dbdb59cdd7e6bdfb346dae1531b32b659e330)), closes [#523](https://github.com/betagouv/service-national-universel/pull/523)
- **association:** singularize lien when there is only one ([#526](https://github.com/betagouv/service-national-universel/pull/526)) ([4a987e8](https://github.com/betagouv/service-national-universel/commit/4a987e80fcb96f17261ceee97df96f2e029ffba2)), closes [#525](https://github.com/betagouv/service-national-universel/pull/525)
- auto affectation ([#210](https://github.com/betagouv/service-national-universel/pull/210)) ([db2042d](https://github.com/betagouv/service-national-universel/commit/db2042de280eb746b187a5fc817b2d466db8be2c))
- auto cancel application ([#428](https://github.com/betagouv/service-national-universel/pull/428)) ([48c9f18](https://github.com/betagouv/service-national-universel/commit/48c9f180eb7cead30483afab1e6e422d20bea3e8))
- back to profil button in inscription ([#784](https://github.com/betagouv/service-national-universel/pull/784)) ([c88abd5](https://github.com/betagouv/service-national-universel/commit/c88abd5ba67493da3f399d5166764ab18814e746))
- badges cliquables ([#582](https://github.com/betagouv/service-national-universel/pull/582)) ([4bbc643](https://github.com/betagouv/service-national-universel/commit/4bbc64368143ff52be52ab0864f3d9655abdcedc))
- banner reinscription 2021 ([#810](https://github.com/betagouv/service-national-universel/pull/810)) ([7aa6cdb](https://github.com/betagouv/service-national-universel/commit/7aa6cdb8de66e5be7d832dee2e69b003bc46e1e7))
- besoin d aide v2 ([#763](https://github.com/betagouv/service-national-universel/pull/763)) ([835740d](https://github.com/betagouv/service-national-universel/commit/835740dbd7470ca5df7627231b3be67773d7b8dc))
- besoin d'aide button in admin ([753accd](https://github.com/betagouv/service-national-universel/commit/753accdb180dea29817a11209ed8632c79372999))
- besoin daide filters ([#773](https://github.com/betagouv/service-national-universel/pull/773)) ([6c261b5](https://github.com/betagouv/service-national-universel/commit/6c261b572e2c7767f6bde24b23228271f47ded39))
- better structure info in panel ([#476](https://github.com/betagouv/service-national-universel/pull/476)) ([50d14da](https://github.com/betagouv/service-national-universel/commit/50d14da0c410135a7ad3ed768eeed9d0716cbd70)), closes [#473](https://github.com/betagouv/service-national-universel/pull/473)
- better time/date ([#45](https://github.com/betagouv/service-national-universel/pull/45)) ([7466f5c](https://github.com/betagouv/service-national-universel/commit/7466f5c96f688a44fda4ebfaeae6a7f652a547b5))
- bigger button and cookies ([#185](https://github.com/betagouv/service-national-universel/pull/185)) ([661dc17](https://github.com/betagouv/service-national-universel/commit/661dc17b40c1cf7757d1fe490b00673317fe5a44))
- change application status from waiting_verification ([5b5e884](https://github.com/betagouv/service-national-universel/commit/5b5e884ff610133248da0c1805d25042e5310421))
- change code inscription.snu.gouv.fr 👉 moncompte.snu.gouv.fr ([#611](https://github.com/betagouv/service-national-universel/pull/611)) ([7a44d3b](https://github.com/betagouv/service-national-universel/commit/7a44d3b22e87a4bd0b04c43cd9a4eccc166f70a6))
- changement de statut du ticket -nouveau message ([#544](https://github.com/betagouv/service-national-universel/pull/544)) ([6196785](https://github.com/betagouv/service-national-universel/commit/619678576308d4bf00631486a44d88e2604165aa)), closes [#539](https://github.com/betagouv/service-national-universel/pull/539)
- close inscription ([#200](https://github.com/betagouv/service-national-universel/pull/200)) ([7b3d058](https://github.com/betagouv/service-national-universel/commit/7b3d058efdae902243389f4a888d89c1a21f84ea))
- close inscriptions ([f6f3dfe](https://github.com/betagouv/service-national-universel/commit/f6f3dfed27d35a8c1e2675c4d252a6f87ca8e763))
- cohesion 2020 ([#142](https://github.com/betagouv/service-national-universel/pull/142)) ([9bd7f7b](https://github.com/betagouv/service-national-universel/commit/9bd7f7b62a1bc927629a01e5e2957d98ace00d29))
- color for internal notes inbox ([a235860](https://github.com/betagouv/service-national-universel/commit/a23586005adc69c3d0b89f8cad6ba533ce4f07d3))
- component address and etablissement in input ([#801](https://github.com/betagouv/service-national-universel/pull/801)) ([3a2f090](https://github.com/betagouv/service-national-universel/commit/3a2f090f241db7b56f2dfb1f4b27f6a7def43bd0))
- connect with france connect in prod too ([6eadcc6](https://github.com/betagouv/service-national-universel/commit/6eadcc69525f1dcb09fd710bd759a1a24fccd57b))
- consentement ([55006cc](https://github.com/betagouv/service-national-universel/commit/55006ccd8af0d393a74d270277b282fcad5d5f19))
- contract status filter + dashboard ([#226](https://github.com/betagouv/service-national-universel/pull/226)) ([332be70](https://github.com/betagouv/service-national-universel/commit/332be70425103d79ad9973679fd61197b065ddaf))
- contract step x ([f6cea3d](https://github.com/betagouv/service-national-universel/commit/f6cea3d8935401909c132caeb0e7f85ec254ec25))
- contrat engagement ([#216](https://github.com/betagouv/service-national-universel/pull/216)) ([00fb596](https://github.com/betagouv/service-national-universel/commit/00fb5961255c20f856c99d7f1ee6c3a472216936))
- correction mail ([d0d661d](https://github.com/betagouv/service-national-universel/commit/d0d661de3defbb42fbcf9204adf609f36790a8dc))
- create mission ([c0c12cf](https://github.com/betagouv/service-national-universel/commit/c0c12cf0330cb2e5767d33318218cc3a9e0fe869))
- create state translation function ([#599](https://github.com/betagouv/service-national-universel/pull/599)) ([60dec37](https://github.com/betagouv/service-national-universel/commit/60dec376bd3fa3f3dec6ccf7b9aa1a1dd332c853))
- create ticket with chat ([#460](https://github.com/betagouv/service-national-universel/pull/460)) ([4add3b5](https://github.com/betagouv/service-national-universel/commit/4add3b503fc9ab9f0ae1c0f82134be714b892b52))
- cron auto archive outdated missions ([#456](https://github.com/betagouv/service-national-universel/pull/456)) ([1f40327](https://github.com/betagouv/service-national-universel/commit/1f403273728c6b6a7a9dbebaf2b1dec0747369a9))
- dashboard for responsible ([320bc8a](https://github.com/betagouv/service-national-universel/commit/320bc8a93533bea4dfac0f63e79d88914fdd6075))
- **dashboard:** export all ([#843](https://github.com/betagouv/service-national-universel/pull/843)) ([22a5b98](https://github.com/betagouv/service-national-universel/commit/22a5b98c13da9607231e9dc28781734421eeb376))
- dashboards ([90b943a](https://github.com/betagouv/service-national-universel/commit/90b943a0fe59dd1eee63025c0a2199d68f4e53e4))
- delete and list files ([6483c40](https://github.com/betagouv/service-national-universel/commit/6483c401682a7209cd435bc81f63af3f60d7e87c))
- delete user ([#63](https://github.com/betagouv/service-national-universel/pull/63)) ([759cdc5](https://github.com/betagouv/service-national-universel/commit/759cdc5973ac5219ebc1c9d1228db37104c2b393))
- desistés on list ([7b0bb5f](https://github.com/betagouv/service-national-universel/commit/7b0bb5f789a149ef4c2ad813913dc32356e07d61))
- diagoriente integration ([#221](https://github.com/betagouv/service-national-universel/pull/221)) ([c911b39](https://github.com/betagouv/service-national-universel/commit/c911b39db65c78c1520647aa0fc93ec9ac287b81))
- disable cohesion presence for all but admin ([bbfa10e](https://github.com/betagouv/service-national-universel/commit/bbfa10e68f1b54ba0e1a472be0b5101a2f0c7247))
- display mail content in logs ([263527a](https://github.com/betagouv/service-national-universel/commit/263527af74b8c880397c48eead732cdcf620a7a9))
- downaload contract young ([#420](https://github.com/betagouv/service-national-universel/pull/420)) ([06c57b9](https://github.com/betagouv/service-national-universel/commit/06c57b956c3688ebc258008776cb111738bcf2a2))
- download attestation batch ([#318](https://github.com/betagouv/service-national-universel/pull/318)) ([1b065be](https://github.com/betagouv/service-national-universel/commit/1b065beb754c030e4d7b9e4d082ff572e7119fa9))
- download doc ([#95](https://github.com/betagouv/service-national-universel/pull/95)) ([8f43511](https://github.com/betagouv/service-national-universel/commit/8f435112089e788a85b6580e18b3486d1922f459))
- edit young preferences ([#437](https://github.com/betagouv/service-national-universel/pull/437)) ([b2686b4](https://github.com/betagouv/service-national-universel/commit/b2686b4f2d5e1bed8934c49ef2433073e82bfbc7))
- email phase 1 done ([9abf002](https://github.com/betagouv/service-national-universel/commit/9abf002abdf4010d5a3f29bb333ad6e5ee1d3584))
- enable attestation snu ([434bdf2](https://github.com/betagouv/service-national-universel/commit/434bdf25b0a51691be57b604e9505eeb83358f11))
- enable support prod ([d7cb249](https://github.com/betagouv/service-national-universel/commit/d7cb2498327473243d7b6c28cf70570f8a80f385))
- end of details first steps ([cc956bc](https://github.com/betagouv/service-national-universel/commit/cc956bc5094e5c8d10fbab451be388ffe28527fd))
- envoyer message personnalisé à l'annulation d'une mission ([#573](https://github.com/betagouv/service-national-universel/pull/573)) ([74920dc](https://github.com/betagouv/service-national-universel/commit/74920dccd557e12217fd822ead5a84f254773413))
- export more than 10k records ([#479](https://github.com/betagouv/service-national-universel/pull/479)) ([2eff280](https://github.com/betagouv/service-national-universel/commit/2eff2804532c375859349011b1b151b9a266afb8))
- export with sheetjs ([#72](https://github.com/betagouv/service-national-universel/pull/72)) ([4e60f86](https://github.com/betagouv/service-national-universel/commit/4e60f862130dc46043fbd3a61d630d61b64280f4))
- **export:** add transformAll property ([#286](https://github.com/betagouv/service-national-universel/pull/286)) ([71db0d9](https://github.com/betagouv/service-national-universel/commit/71db0d94adf8d78541c062b15706bc33c2062fbd))
- force domain ([9ffeb53](https://github.com/betagouv/service-national-universel/commit/9ffeb532284b05bb33fce4c0503a1d7b092e98cb))
- france connect ([7275623](https://github.com/betagouv/service-national-universel/commit/7275623dbcad1a358f0006376d112ce42d647bfd))
- france connect logout ([#92](https://github.com/betagouv/service-national-universel/pull/92)) ([16703cd](https://github.com/betagouv/service-national-universel/commit/16703cdba11b14de7c6f5a1e46bf84b9e85e70df))
- franceconnect prod ([f8dc03f](https://github.com/betagouv/service-national-universel/commit/f8dc03f6b0c8b76098709b579f55c7e7c253bba2))
- get ticket list ([013e89b](https://github.com/betagouv/service-national-universel/commit/013e89b4bcb8361dbd42156e17c5b8c90e0d6540))
- get validation link for admin in contract ([#321](https://github.com/betagouv/service-national-universel/pull/321)) ([f8761ba](https://github.com/betagouv/service-national-universel/commit/f8761baedd8c6b92abb9416858b5e5bb3618eba8))
- goals on dashboard ([f4c74a2](https://github.com/betagouv/service-national-universel/commit/f4c74a225049b43a50b5793caa22250d5f9ae478))
- head center can download phase 1 doc ([90e52aa](https://github.com/betagouv/service-national-universel/commit/90e52aa11493aa66ded433f3546a460b2999c1f3))
- header link ([d4a34e2](https://github.com/betagouv/service-national-universel/commit/d4a34e2d30429d84822d978afa7bfeddb9bb3da7))
- helmet only in staging ([f0703d1](https://github.com/betagouv/service-national-universel/commit/f0703d1461a8731e2b31bbe91847e9e32653c32e))
- helmet only in staging for now ([eb8af6c](https://github.com/betagouv/service-national-universel/commit/eb8af6c2bf266ef2c3c667e790121e606a1b4cea))
- icon copy ([068b327](https://github.com/betagouv/service-national-universel/commit/068b3270e6956bfda4621a0988210913fdebd5fa))
- improve mission search ([ebdc1f6](https://github.com/betagouv/service-national-universel/commit/ebdc1f6176a58778569dac0133a29b644c290df3))
- improved user search ([cef6d5d](https://github.com/betagouv/service-national-universel/commit/cef6d5df5229b3428820cfa38ad8dac05963138c))
- inbox dashboard ([8a2fc87](https://github.com/betagouv/service-national-universel/commit/8a2fc873df94166631808f48f0870a21258132db))
- inscription goal ([b58cb86](https://github.com/betagouv/service-national-universel/commit/b58cb86bd672fc206f0fe42c9ff2c565b1af8e18))
- **inscription:** add cgu ([#689](https://github.com/betagouv/service-national-universel/pull/689)) ([682a590](https://github.com/betagouv/service-national-universel/commit/682a590cf4f59d3b0a9da35e9fbe432058b482cb))
- **inscription:** new landing page ([#633](https://github.com/betagouv/service-national-universel/pull/633)) ([2dd045e](https://github.com/betagouv/service-national-universel/commit/2dd045ef6aa9450cbba6b9c743ae9af0dbb80045))
- invert icon in multiselect dashboard ([2838ba6](https://github.com/betagouv/service-national-universel/commit/2838ba65ac7bb405b0d978ff6eb2866c8aca902b))
- invitation admin and referent_region ([#25](https://github.com/betagouv/service-national-universel/pull/25)) ([44c0a33](https://github.com/betagouv/service-national-universel/commit/44c0a3365444596b9d420ffbd9cd026b2f2821aa))
- jdc ([057a621](https://github.com/betagouv/service-national-universel/commit/057a6213fa88dec1e114f21e4d5ef1d0423a162e))
- liens réseaux sociaux dans le drawer ([#516](https://github.com/betagouv/service-national-universel/pull/516)) ([cc8ef88](https://github.com/betagouv/service-national-universel/commit/cc8ef882bb2374bd691935156c72179b2d972729))
- log with morgan in dev ([#488](https://github.com/betagouv/service-national-universel/pull/488)) ([e4c507f](https://github.com/betagouv/service-national-universel/commit/e4c507f5efdf2e3bb628916a81b3d1d1076f195e))
- mail sendinblue contract ([#425](https://github.com/betagouv/service-national-universel/pull/425)) ([468907a](https://github.com/betagouv/service-national-universel/commit/468907a9c817e4403d835e944906ea7d95c3d191))
- **mail:** add forgetPassword template ([24b2d8a](https://github.com/betagouv/service-national-universel/commit/24b2d8a10b880b29a574c15cd3ceb1e565dd541c))
- main in staging+prod ([#112](https://github.com/betagouv/service-national-universel/pull/112)) ([b7d82a0](https://github.com/betagouv/service-national-universel/commit/b7d82a0d5bf3b31ba1160fa09bd96dc0675c33e4))
- matomo track password error ([#119](https://github.com/betagouv/service-national-universel/pull/119)) ([4edcf82](https://github.com/betagouv/service-national-universel/commit/4edcf82d2ff75eec09c6de2f63ac9dea8323e5fe))
- message for 2020 ([07f5064](https://github.com/betagouv/service-national-universel/commit/07f50646b23f9f1fe319e8a8595ba93c2f59146c))
- migrate school ([#57](https://github.com/betagouv/service-national-universel/pull/57)) ([a0d03f3](https://github.com/betagouv/service-national-universel/commit/a0d03f33b58d283dddf34efc94a1b0543cabfdcf))
- mind map - support ([#531](https://github.com/betagouv/service-national-universel/pull/531)) ([d6d8ab8](https://github.com/betagouv/service-national-universel/commit/d6d8ab863922cd2893411d6fffdcad720df58a39))
- mindmap support - plateforme admin ([#557](https://github.com/betagouv/service-national-universel/pull/557)) ([26e1fd3](https://github.com/betagouv/service-national-universel/commit/26e1fd3bf7449cee0aab5beecf1cbc875a12eaf9))
- mission details ([8fe9017](https://github.com/betagouv/service-national-universel/commit/8fe90176f8f8346373eae56c7918c37a87d6e42c))
- mission refused mail ([05cacce](https://github.com/betagouv/service-national-universel/commit/05caccec78f7d47a722515d32762e020e7d40db0))
- modal backdrop color ([0886579](https://github.com/betagouv/service-national-universel/commit/0886579c5f7cae62ab48b8e3da6bd57dda530989))
- modal withdrawn young ([edd8f85](https://github.com/betagouv/service-national-universel/commit/edd8f8544519d9277bc9279b95570998df5ca20b))
- modify cohort for volontaire ([5612147](https://github.com/betagouv/service-national-universel/commit/5612147eee1cf31c083ed91ca832f1cc5f7067dd))
- more structure ([0000a66](https://github.com/betagouv/service-national-universel/commit/0000a663b953dc2b055d57f1d9c20de5fe232473))
- multi filter in dashboard ([#802](https://github.com/betagouv/service-national-universel/pull/802)) ([5ede278](https://github.com/betagouv/service-national-universel/commit/5ede278a07e6cc720b72138c3d14642b5784b002))
- new etablissement search ([#714](https://github.com/betagouv/service-national-universel/pull/714)) ([c0115c9](https://github.com/betagouv/service-national-universel/commit/c0115c95514b552c421bda4fc6e06f47181c4642))
- new matomo ([#79](https://github.com/betagouv/service-national-universel/pull/79)) ([386c25a](https://github.com/betagouv/service-national-universel/commit/386c25a1429a9fab271b543cc9ce1f18fd9397bd))
- new message when mission is archived ([#812](https://github.com/betagouv/service-national-universel/pull/812)) ([aa9e9e9](https://github.com/betagouv/service-national-universel/commit/aa9e9e9717187534c13c54a94a3b4a4bf08ce555))
- new period lists for mig ([#809](https://github.com/betagouv/service-national-universel/pull/809)) ([de6fab8](https://github.com/betagouv/service-national-universel/commit/de6fab8cbb531cd158792b1608a4d3a2efa05451))
- no more edition for waiting correction and waiting validation ([#202](https://github.com/betagouv/service-national-universel/pull/202)) ([fbdb40c](https://github.com/betagouv/service-national-universel/commit/fbdb40c82b3178136539406afb1399d4a5513c3b))
- notif validate phase 2 ([84eca6b](https://github.com/betagouv/service-national-universel/commit/84eca6bb25dcb98d9c66527bf14c5be91d041539))
- notify on validate phase 3 ([bf4e238](https://github.com/betagouv/service-national-universel/commit/bf4e238f9467451d734b7cb2e8929888ed64a0fc))
- open inscription 2022 ([2b3604f](https://github.com/betagouv/service-national-universel/commit/2b3604f947de6f716b0d94ca3300e1d8c17b161a))
- password component ([#579](https://github.com/betagouv/service-national-universel/pull/579)) ([e779655](https://github.com/betagouv/service-national-universel/commit/e77965561bb6995647b685f7e410f226fb0cde19)), closes [#575](https://github.com/betagouv/service-national-universel/pull/575)
- phase 1 done ([63ce984](https://github.com/betagouv/service-national-universel/commit/63ce9840a2af151d43ab11add737d3d10d083f9a))
- pimp historic step 1 ([903a571](https://github.com/betagouv/service-national-universel/commit/903a571fbfaead24e43a2e052b48cc77a667e179))
- qw inbox ([518c493](https://github.com/betagouv/service-national-universel/commit/518c493c255664684e7a4b01ff90a5d06cc2d58a))
- re-send mail for application to structure [#471](https://github.com/betagouv/service-national-universel/pull/471) ([#478](https://github.com/betagouv/service-national-universel/pull/478)) ([eef0703](https://github.com/betagouv/service-national-universel/commit/eef0703d97974717f75bf3273b675008902628de))
- redirect ([c126f4e](https://github.com/betagouv/service-national-universel/commit/c126f4e867103029852d575575ca123967012def))
- refacto email templates ([#418](https://github.com/betagouv/service-national-universel/pull/418)) ([5366780](https://github.com/betagouv/service-national-universel/commit/5366780d80e45725c88370d49ddea60f02160b9b))
- refacto panel ([80209b0](https://github.com/betagouv/service-national-universel/commit/80209b0c88145369e4f6fb1edbf430e21d4150d4))
- relance pour demander les docs de preparation militaire ([#583](https://github.com/betagouv/service-national-universel/pull/583)) ([8b6990a](https://github.com/betagouv/service-national-universel/commit/8b6990a868b979e2961d252d1f00fde7d6addf10))
- remove image watermark ([#41](https://github.com/betagouv/service-national-universel/pull/41)) ([6584b1a](https://github.com/betagouv/service-national-universel/commit/6584b1a6a01e69e8b8d38dbc63d4c4c187212636))
- remove real emails in dev ([#128](https://github.com/betagouv/service-national-universel/pull/128)) ([61ec471](https://github.com/betagouv/service-national-universel/commit/61ec4715eccf325c3e05361ff5d8a06b6a01b571))
- renvoie de mails au structures pour traiter une candidature ([#545](https://github.com/betagouv/service-national-universel/pull/545)) ([6e94b14](https://github.com/betagouv/service-national-universel/commit/6e94b14a4d240e7683c02dff1b3b8f2ae98df7af)), closes [#543](https://github.com/betagouv/service-national-universel/pull/543)
- routes for missions ([b44c625](https://github.com/betagouv/service-national-universel/commit/b44c625ce730934ea8ba712493f67f441bf6c295))
- routes for structure view ([dfcde4b](https://github.com/betagouv/service-national-universel/commit/dfcde4b70b3a482e98a356f6bd8674151f7fc54a))
- save school id ([#59](https://github.com/betagouv/service-national-universel/pull/59)) ([9f7787d](https://github.com/betagouv/service-national-universel/commit/9f7787db257f2459848c596ce89f8fd22baa33ba))
- save structure ([94fdf9e](https://github.com/betagouv/service-national-universel/commit/94fdf9e1a93674b6b740d9b5963e5ea7f02ee9b6))
- screen waiting affectation ([#780](https://github.com/betagouv/service-national-universel/pull/780)) ([6a2affc](https://github.com/betagouv/service-national-universel/commit/6a2affc1c2618e13a2c077ed362bff0b6f85fca1))
- script update places in missions ([4c4cbd3](https://github.com/betagouv/service-national-universel/commit/4c4cbd36b7128a04a7ce1d1d0acd1ebaad3e0278))
- **security:** add helmet ([ad4820f](https://github.com/betagouv/service-national-universel/commit/ad4820f301a55ec5b7ff5173c9bee6031cad3a66))
- send attachment by mail ([#426](https://github.com/betagouv/service-national-universel/pull/426)) ([0c87f9a](https://github.com/betagouv/service-national-universel/commit/0c87f9a0c464bbe854310fa51602129a057a4c4c))
- send contract again ([#459](https://github.com/betagouv/service-national-universel/pull/459)) ([8197f2e](https://github.com/betagouv/service-national-universel/commit/8197f2e0c829a967ad5348a1db3d7c84a06781c0))
- send contract to new emails ([#292](https://github.com/betagouv/service-national-universel/pull/292)) ([50c0fbd](https://github.com/betagouv/service-national-universel/commit/50c0fbd6fec38dc6548e48c055794f38b2b5b4ad))
- signup structure ([#463](https://github.com/betagouv/service-national-universel/pull/463)) ([62b4d0d](https://github.com/betagouv/service-national-universel/commit/62b4d0d97f4f92105a250878adecde3a7b5c2288))
- sous onglet dans url dashboard ([#917](https://github.com/betagouv/service-national-universel/pull/917)) ([8e201df](https://github.com/betagouv/service-national-universel/commit/8e201df0729e04fa7a66d025a462bf0d2e5bfd8c)), closes [#858](https://github.com/betagouv/service-national-universel/pull/858)
- status phase2 updatedAt ([#477](https://github.com/betagouv/service-national-universel/pull/477)) ([7051642](https://github.com/betagouv/service-national-universel/commit/705164202841b9d5a0313acd63607501122cc8b1))
- structure list ready ([e795f22](https://github.com/betagouv/service-national-universel/commit/e795f22059262c06a6966e0ddfa92c8caabb4015))
- structure types ([583f868](https://github.com/betagouv/service-national-universel/commit/583f8681ac687fe7741bc05a81c771d00806ee41))
- support - setup project ([#779](https://github.com/betagouv/service-national-universel/pull/779)) ([6e83e3d](https://github.com/betagouv/service-national-universel/commit/6e83e3dbdffa46f8b1a1aeb824cfc1ec17605275))
- **support:** second big iteration - clean ([#852](https://github.com/betagouv/service-national-universel/pull/852)) ([b8985c2](https://github.com/betagouv/service-national-universel/commit/b8985c206333bda4384ad7946000bf48fbbb7691))
- **support:** second big iteration ([#850](https://github.com/betagouv/service-national-universel/pull/850)) ([212b9ca](https://github.com/betagouv/service-national-universel/commit/212b9cab2e4fb70c335d7712be2d3b3fe925a9fe))
- **support:** add knowledge base pages ([#825](https://github.com/betagouv/service-national-universel/pull/825)) ([923f39b](https://github.com/betagouv/service-national-universel/commit/923f39b3873575e7da07e730716aa6b081cb22ac))
- **support:** can add link, can preview., etc. ([#965](https://github.com/betagouv/service-national-universel/pull/965)) ([b9957d0](https://github.com/betagouv/service-national-universel/commit/b9957d004801d3b6efcad9b6ef75b4b476fe1ceb))
- **support:** can add pictures to texteditor ([#963](https://github.com/betagouv/service-national-universel/pull/963)) ([192c836](https://github.com/betagouv/service-national-universel/commit/192c83688bcc244693d9676ebaa60e6c8bd43ed0))
- **support:** can upload image for section ([#914](https://github.com/betagouv/service-national-universel/pull/914)) ([6c00fa5](https://github.com/betagouv/service-national-universel/commit/6c00fa5fa9918c6220fc05cbfa60acd9a58bcf3f))
- **supportCenter:** activate referents notif ([ea2c54b](https://github.com/betagouv/service-national-universel/commit/ea2c54b4a7385e33e07a53011089da5c4c362e64))
- **supportCenter:** implement sendinblue notif ([#778](https://github.com/betagouv/service-national-universel/pull/778)) ([ab6bc85](https://github.com/betagouv/service-national-universel/commit/ab6bc8508fdcf2740d861983e8afefabc57fd92d))
- **support:** choose svg ([#954](https://github.com/betagouv/service-national-universel/pull/954)) ([6776c8b](https://github.com/betagouv/service-national-universel/commit/6776c8bdf9c5e675550530595ddec33fe6a3632a))
- **support:** knowledge base admin ([#816](https://github.com/betagouv/service-national-universel/pull/816)) ([bcd401c](https://github.com/betagouv/service-national-universel/commit/bcd401c1aae78a688f5410d4142cd3a15fc98379))
- **support:** new navbar ([#862](https://github.com/betagouv/service-national-universel/pull/862)) ([694236d](https://github.com/betagouv/service-national-universel/commit/694236d3f421c46c59bd62fa223b37f79bdef3c9))
- **support:** public kb ([#961](https://github.com/betagouv/service-national-universel/pull/961)) ([61e416d](https://github.com/betagouv/service-national-universel/commit/61e416d17cf7e87523fa7e980ba9ebb5420e3a4d))
- **support:** public kb ([#962](https://github.com/betagouv/service-national-universel/pull/962)) ([62c2f9c](https://github.com/betagouv/service-national-universel/commit/62c2f9ce2d511bfe21db946894b75bced4f071a5))
- **support:** public zammad form ([#696](https://github.com/betagouv/service-national-universel/pull/696)) ([94c8835](https://github.com/betagouv/service-national-universel/commit/94c883594683dfa955f60889b199a1d10590af56))
- test - notif bi hebdo referent ([#871](https://github.com/betagouv/service-national-universel/pull/871)) ([e7f99b5](https://github.com/betagouv/service-national-universel/commit/e7f99b585b786e44878c1295a6adb028049b1e91))
- ticketing dashboard ([#465](https://github.com/betagouv/service-national-universel/pull/465)) ([070f987](https://github.com/betagouv/service-national-universel/commit/070f987ec00b1ac78bae662745f5066ea5b9c9a7))
- translate columns in export ([#73](https://github.com/betagouv/service-national-universel/pull/73)) ([afd4a0a](https://github.com/betagouv/service-national-universel/commit/afd4a0ad4b894b993558e035f5cfa57830f81e9e))
- up modal applications ([7bb118f](https://github.com/betagouv/service-national-universel/commit/7bb118fd8b216486b7c2edee4cc71857dd1d08fc))
- update lumiere ([#170](https://github.com/betagouv/service-national-universel/pull/170)) ([d7557c9](https://github.com/betagouv/service-national-universel/commit/d7557c99eda107ad6571fffb69bf5132c366232f))
- upload docs and delete for referents ([#109](https://github.com/betagouv/service-national-universel/pull/109)) ([ddf3687](https://github.com/betagouv/service-national-universel/commit/ddf3687b52793e7e0699cac053c2520ac6bf2683))
- upload file from admin ([#484](https://github.com/betagouv/service-national-universel/pull/484)) ([b29a5b6](https://github.com/betagouv/service-national-universel/commit/b29a5b696e3f2bcd754b05e1e3ff80a0638f6a0d))
- use mongoose-elastic ([#136](https://github.com/betagouv/service-national-universel/pull/136)) ([cc594d1](https://github.com/betagouv/service-national-universel/commit/cc594d1f93128ee4e4456ce573f7384821610e3e))
- user in patch on create doc ([#556](https://github.com/betagouv/service-national-universel/pull/556)) ([00f1fec](https://github.com/betagouv/service-national-universel/commit/00f1fecc0a1fb85bf3d330e4b86f47aec7852a27)), closes [#546](https://github.com/betagouv/service-national-universel/pull/546)
- user in patches ([#293](https://github.com/betagouv/service-national-universel/pull/293)) ([2de578f](https://github.com/betagouv/service-national-universel/commit/2de578fd94e882e8b49f199ce8f4d80209fadce5))
- **wip:** create and edit mission ([58db34e](https://github.com/betagouv/service-national-universel/commit/58db34e249b336c813936ffd4fe6c47900d9a0af))
- withdrawn modal with list ([#835](https://github.com/betagouv/service-national-universel/pull/835)) ([503107a](https://github.com/betagouv/service-national-universel/commit/503107a72d547bc6b40f730e2790425eda298f6c))
- Zammad ([#397](https://github.com/betagouv/service-national-universel/pull/397)) ([0b88c8f](https://github.com/betagouv/service-national-universel/commit/0b88c8fc4d1ef973cd376cad4e7130f06aa7f79b))
- zammad monkey patch ([#449](https://github.com/betagouv/service-national-universel/pull/449)) ([93d46ef](https://github.com/betagouv/service-national-universel/commit/93d46ef733ab9692e7c6fa5995bace5b92bf575d))

### Reverts

- Revert "fix: couleur bouton violet (#540)" ([bb889b0](https://github.com/betagouv/service-national-universel/commit/bb889b04653aeb7aabcead633d9c237dd91f7368)), closes [#540](https://github.com/betagouv/service-national-universel/pull/540)
- Revert "fix: case email login" ([19e020c](https://github.com/betagouv/service-national-universel/commit/19e020c8908f5721b4dc00651e5fa16d5fe14c65))
- Revert "refacto : create 2 components Title and Subtitle" ([04f23c7](https://github.com/betagouv/service-national-universel/commit/04f23c70f604444a14777c0bc5fab0df91846dcb))
- Revert "refactor: cookie (#194)" ([db68ab7](https://github.com/betagouv/service-national-universel/commit/db68ab7c10cf35b8d00b95737b5a67ea099b2059)), closes [#194](https://github.com/betagouv/service-national-universel/pull/194)
- Revert "fix : add defaultQuery export xlsx" ([df7247e](https://github.com/betagouv/service-national-universel/commit/df7247e4a8215349d6c3ac419a2b7dfd7e0655cc))
