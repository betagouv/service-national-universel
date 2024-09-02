export const mockEsClient = (results: { [key: string]: any[] } = {}) => {
  jest.mock("@selego/mongoose-elastic", () => () => jest.fn());

  const mock = jest.mock("../../es", () => ({
    search: async (params: { index: string; scroll: "1m"; size: 1000; body: { query: any; _source: "*" } }) => {
      return {
        body: {
          hits: {
            total: { value: results[params.index]?.length || 0, relation: "eq" },
            hits: results[params.index] || [],
          },
          aggregations: {
            group_by_etablissement: {
              buckets: [],
            },
          },
        },
      };
    },
    scroll: async () => ({
      body: {
        _scroll_id: null,
        hits: {
          total: { value: 0 },
          hits: [], // empty
        },
      },
    }),
  }));
  return mock;
};
