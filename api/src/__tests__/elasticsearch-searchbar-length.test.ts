import { joiElasticSearch, searchSubQuery } from "../controllers/elasticsearch/utils";

/**
 * PM12 : le champ `searchbar` n'avait pas de longueur maximale — la requête ES générée par
 * `searchSubQuery` grossit avec le nombre de mots (3 clauses multi_match par mot), ce qui pouvait
 * bloquer l'API sur une chaîne de plusieurs centaines de Ko. Seul le nombre d'éléments du tableau
 * était borné (`.max(200)`), pas la longueur de la chaîne elle-même ni le nombre de mots retenus.
 */
describe("elasticsearch searchbar : longueur et nombre de mots bornés (PM12)", () => {
  describe("joiElasticSearch", () => {
    it("accepte une searchbar de longueur raisonnable", () => {
      const { error, queryFilters } = joiElasticSearch({ filterFields: [], body: { filters: { searchbar: ["jean dupont"] } } });

      expect(error).toBeUndefined();
      expect(queryFilters.searchbar).toEqual(["jean dupont"]);
    });

    it("rejette une searchbar de plus de 200 caractères", () => {
      const { error } = joiElasticSearch({ filterFields: [], body: { filters: { searchbar: ["a".repeat(201)] } } });

      expect(error).toBeDefined();
    });

    it("accepte une searchbar d'exactement 200 caractères", () => {
      const { error } = joiElasticSearch({ filterFields: [], body: { filters: { searchbar: ["a".repeat(200)] } } });

      expect(error).toBeUndefined();
    });

    it("ne borne pas en longueur les autres filtres (facettes à valeurs fermées)", () => {
      const { error, queryFilters } = joiElasticSearch({ filterFields: ["status"], body: { filters: { status: ["a".repeat(201)] } } });

      expect(error).toBeUndefined();
      expect(queryFilters.status).toEqual(["a".repeat(201)]);
    });
  });

  describe("searchSubQuery", () => {
    it("génère 3 clauses multi_match par mot en-dessous du plafond", () => {
      const query = searchSubQuery(["jean dupont"], ["nom", "prenom"]);

      expect(query.bool.should).toHaveLength(2 * 3);
    });

    it("plafonne le nombre de mots retenus à 20, même si la chaîne en contient davantage", () => {
      const manyWords = Array.from({ length: 50 }, (_, i) => `mot${i}`).join(" ");

      const query = searchSubQuery([manyWords], ["nom", "prenom"]);

      expect(query.bool.should).toHaveLength(20 * 3);
    });
  });
});
