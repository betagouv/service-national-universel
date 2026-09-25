/**
 * Mot de passe explicite pour les (rares) tests qui en ont réellement besoin.
 *
 * Les fixtures `getNewYoungFixture` / `getNewReferentFixture` ne portent
 * volontairement PAS de mot de passe : le hook `pre("save")` des modèles
 * hache alors le champ avec bcryptjs (coût 10, ~100 ms par document en CI),
 * ce qui représentait ~40 s de la suite api pour des tests qui ne regardent
 * jamais ce champ. Les tests d'authentification, de non-écrasement du hash
 * et d'anonymisation passent donc le mot de passe explicitement.
 */
export const FIXTURE_PASSWORD = "Test1234567!";
