import { ElasticsearchQueryBuilder, escapeWildcard } from "./ElasticQuery.builder";

describe("ElasticsearchQueryBuilder.setSearchTerm", () => {
    it("échappe les métacaractères wildcard du terme saisi", () => {
        expect(escapeWildcard("a*b?c\\d")).toBe("a\\*b\\?c\\\\d");
    });

    it("garde le terme littéral dans la requête", () => {
        const query = new ElasticsearchQueryBuilder<any>("mission")
            .setSearchTerm({ value: "*a*b*", fields: ["name"] })
            .build();

        expect(JSON.stringify(query)).toContain('"value":"\\\\*a\\\\*b\\\\**"');
        expect(JSON.stringify(query)).toContain('"value":"*\\\\*a\\\\*b\\\\*"');
    });
});
