import Joi from "joi";
import { ROLES, canSearchInElasticSearch } from "snu-lib";
import { capture } from "../../sentry";
import { ERRORS, isYoung, isReferent } from "../../utils";
import { StructureModel } from "../../models";
import { UserDto } from "snu-lib";

const ES_NO_LIMIT = 10000;

type SearchFields = string[];
type FilterFields = string[];
type QueryFilters = {
  searchbar?: string[];
  [key: string]: string[] | number[] | undefined;
};
type ContextFilters = any[];
type CustomQueries = {
  [key: string]: (query: any, value?: any) => any;
};
type Sort = {
  field: string;
  order: "asc" | "desc";
} | null;

function searchSubQuery([value]: string[], fields: SearchFields) {
  const words = value?.trim().split(" ");

  const shouldClauses = words.map((word) => {
    return [
      {
        multi_match: {
          query: word,
          fields,
          type: "cross_fields",
          operator: "and",
        },
      },
      { multi_match: { query: word, fields, type: "phrase", operator: "and" } },
      { multi_match: { query: word, fields: fields.map((e) => e.replace(".keyword", "")), type: "phrase_prefix", operator: "and" } },
    ];
  });

  return {
    bool: {
      should: shouldClauses.flat(),
      minimum_should_match: 1,
    },
  };
}

function hitsSubQuery(query: any, key: string, value: any[], customQueries?: CustomQueries) {
  const keyWithoutKeyword = key.replace(".keyword", "");
  if (customQueries?.[keyWithoutKeyword]) {
    query = customQueries[keyWithoutKeyword](query, value);
  } else if (value.includes("N/A")) {
    query.bool.filter.push({ bool: { should: [{ bool: { must_not: { exists: { field: key } } } }, { terms: { [key]: value.filter((e) => e !== "N/A") } }] } });
  } else {
    query.bool.must.push({ terms: { [key]: value } });
  }
  return query;
}

function aggsSubQuery(keys: FilterFields, aggsSearchQuery: any, queryFilters: QueryFilters, contextFilters: ContextFilters, customQueries?: CustomQueries) {
  let aggs: Record<string, any> = {};
  for (const key of keys) {
    const keyWithoutKeyword = key.replace(".keyword", "");
    let filter = unsafeStrucuredClone({ bool: { must: [], filter: contextFilters } });
    if (aggsSearchQuery) filter.bool.must.push(aggsSearchQuery);

    for (const subKey of keys) {
      const subKeyWithoutKeyword = subKey.replace(".keyword", "");
      if (subKey === key) continue;
      if (!queryFilters[subKeyWithoutKeyword]?.length) continue;
      filter = hitsSubQuery(filter, subKey, queryFilters[subKeyWithoutKeyword]!, customQueries);
    }

    if (customQueries?.[keyWithoutKeyword + "Aggs"]) {
      aggs[keyWithoutKeyword] = { filter, aggs: { names: customQueries[keyWithoutKeyword + "Aggs"](key) } };
    } else if (key.includes(".keyword")) {
      aggs[keyWithoutKeyword] = { filter, aggs: { names: { terms: { field: key, missing: "N/A", size: ES_NO_LIMIT } } } };
    } else {
      aggs[key] = { filter, aggs: { names: { histogram: { field: key, interval: 1, min_doc_count: 1 } } } };
    }
  }
  return aggs;
}

function buildSort(sort: Sort) {
  if (!sort) return [{ createdAt: { order: "desc" } }];
  return [{ [sort.field]: { order: sort.order } }];
}

function unsafeStrucuredClone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

function buildNdJson(header: any, hitsQuery: any, aggsQuery: any = null): string {
  if (!aggsQuery) return [JSON.stringify(header), JSON.stringify(hitsQuery)].join("\n") + "\n";
  return [JSON.stringify(header), JSON.stringify(hitsQuery), JSON.stringify(header), JSON.stringify(aggsQuery)].join("\n") + "\n";
}

function buildArbitratyNdJson(...args: any[]): string {
  return args.map((e) => JSON.stringify(e)).join("\n") + "\n";
}

interface RequestBodyParams {
  searchFields: SearchFields;
  filterFields: FilterFields;
  queryFilters: QueryFilters;
  page: number;
  sort: Sort;
  contextFilters: ContextFilters;
  customQueries?: CustomQueries;
  size?: number;
}

function buildRequestBody({ searchFields, filterFields, queryFilters, page, sort, contextFilters, customQueries, size = 10 }: RequestBodyParams) {
  // We always need a fresh query to avoid side effects.
  const getMainQuery = () => unsafeStrucuredClone({ bool: { must: [{ match_all: {} }], filter: contextFilters } });
  // Search query
  const searchbar = queryFilters?.searchbar || [];
  const search = searchbar.filter((e) => e.trim()).length ? searchSubQuery(searchbar, searchFields) : null;
  // Hits request body
  const hitsRequestBody: any = { query: getMainQuery(), size, from: page * size, sort: buildSort(sort) };
  let countAggsQuery = unsafeStrucuredClone({ bool: { must: [], filter: contextFilters } });
  if (search) {
    hitsRequestBody.query.bool.must.push(search);
    countAggsQuery.bool.must.push(search);
    // We want to sort by score if there a search.
    delete hitsRequestBody.sort;
  }
  for (const key of filterFields) {
    const keyWithoutKeyword = key.replace(".keyword", "");
    if (!queryFilters[keyWithoutKeyword]?.length) continue;
    // Special case for seatsTaken
    if (keyWithoutKeyword === "seatsTaken") {
      const seatsTakenFilter = queryFilters.seatsTaken as number[];
      if (seatsTakenFilter.includes(0)) {
        hitsRequestBody.query.bool.must.push({ term: { seatsTaken: 0 } });
        countAggsQuery.bool.must.push({ term: { seatsTaken: 0 } });
      } else if (seatsTakenFilter.includes(1)) {
        hitsRequestBody.query.bool.must.push({ range: { seatsTaken: { gt: 0 } } });
        countAggsQuery.bool.must.push({ range: { seatsTaken: { gt: 0 } } });
      }
    } else {
      // Comportement par default pour les autres filtres
      hitsRequestBody.query = hitsSubQuery(hitsRequestBody.query, key, queryFilters[keyWithoutKeyword]!, customQueries);
      countAggsQuery = hitsSubQuery(countAggsQuery, key, queryFilters[keyWithoutKeyword]!, customQueries);
    }
  }
  // Aggs request body
  const aggsRequestBody = { query: getMainQuery(), aggs: aggsSubQuery(filterFields, search, queryFilters, contextFilters, customQueries), size: 0, track_total_hits: true };
  //add agg for count all of documents that maths the query
  aggsRequestBody.aggs.count = { filter: countAggsQuery, aggs: { total: { value_count: { field: "_id" } } } };
  return { hitsRequestBody, aggsRequestBody };
}

interface JoiElasticSearchParams {
  filterFields: FilterFields;
  sortFields?: string[];
  body: any;
}

interface JoiElasticSearchResult {
  queryFilters: QueryFilters;
  page: number;
  sort: Sort;
  exportFields: string[] | "*" | null;
  size: number;
  error?: Joi.ValidationError;
}

function joiElasticSearch({ filterFields, sortFields = [], body }: JoiElasticSearchParams): JoiElasticSearchResult {
  const schema = Joi.object({
    filters: Joi.object(
      ["searchbar", ...filterFields].reduce((acc, field) => {
        const fieldWithoutKeyword = field.replace(".keyword", "");

        // For the classe we need to handle the filter seatsTaken which is a number
        if (fieldWithoutKeyword === "seatsTaken") {
          return { ...acc, [fieldWithoutKeyword]: Joi.array().items(Joi.number().allow(null)).max(200) };
        }

        // Default case: filter is a string
        return { ...acc, [fieldWithoutKeyword]: Joi.array().items(Joi.string().allow("")).max(200) };
      }, {}),
    ),
    page: Joi.number()
      .integer()
      .default(0)
      .custom((value, helpers) => {
        if (value < 0) {
          return 0;
        }
        return value;
      }),
    sort: Joi.object({
      field: Joi.string().valid(...sortFields),
      order: Joi.string().valid("asc", "desc"),
    })
      .allow(null)
      .default(null),
    exportFields: Joi.alternatives().try(Joi.array().items(Joi.string()).max(200).allow(null).default(null), Joi.string().valid("*")),
    size: Joi.number().integer().min(10).max(100).default(10),
  });

  const { error, value } = schema.validate({ ...body }, { stripUnknown: true });
  if (error) capture(error);
  return { queryFilters: value.filters, page: value.page, sort: value.sort, exportFields: value.exportFields, size: value.size, error };
}

interface MissionContextResult {
  missionContextFilters?: ContextFilters;
  missionContextError?: {
    status: number;
    body: { ok: boolean; code: string };
  };
}

async function buildMissionContext(user: UserDto): Promise<MissionContextResult> {
  const contextFilters: ContextFilters = [];

  // A young can only see validated missions.
  if (isYoung(user)) contextFilters.push({ term: { "status.keyword": "VALIDATED" } });
  if (isReferent(user) && !canSearchInElasticSearch(user, "mission")) return { missionContextError: { status: 403, body: { ok: false, code: ERRORS.OPERATION_UNAUTHORIZED } } };

  // A responsible cans only see their structure's missions.
  if (user.role === ROLES.RESPONSIBLE) {
    if (!user.structureId) return { missionContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    contextFilters.push({ terms: { "structureId.keyword": [user.structureId] } });
  }

  // A supervisor can only see their structures' missions.
  if (user.role === ROLES.SUPERVISOR) {
    if (!user.structureId) return { missionContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const data = await StructureModel.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
    contextFilters.push({ terms: { "structureId.keyword": data.map((e) => e._id.toString()) } });
  }

  return { missionContextFilters: contextFilters };
}

interface ApplicationContextResult {
  applicationContextFilters?: ContextFilters;
  applicationContextError?: {
    status: number;
    body: { ok: boolean; code: string };
  };
}

async function buildApplicationContext(user: UserDto): Promise<ApplicationContextResult> {
  const contextFilters: ContextFilters = [];

  if (!canSearchInElasticSearch(user, "application")) return { applicationContextError: { status: 403, body: { ok: false, code: ERRORS.OPERATION_UNAUTHORIZED } } };

  // A responsible can only see their structure's applications.
  if (user.role === ROLES.RESPONSIBLE) {
    if (!user.structureId) return { applicationContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    contextFilters.push({ terms: { "structureId.keyword": [user.structureId] } });
    contextFilters.push({ terms: { "status.keyword": ["WAITING_VALIDATION", "VALIDATED", "REFUSED", "CANCEL", "IN_PROGRESS", "DONE", "ABANDON", "WAITING_VERIFICATION"] } });
  }

  // A supervisor can only see their structures' applications.
  if (user.role === ROLES.SUPERVISOR) {
    if (!user.structureId) return { applicationContextError: { status: 404, body: { ok: false, code: ERRORS.NOT_FOUND } } };
    const data = await StructureModel.find({ $or: [{ networkId: String(user.structureId) }, { _id: String(user.structureId) }] });
    contextFilters.push({ terms: { "structureId.keyword": data.map((e) => e._id.toString()) } });
    contextFilters.push({ terms: { "status.keyword": ["WAITING_VALIDATION", "VALIDATED", "REFUSED", "CANCEL", "IN_PROGRESS", "DONE", "ABANDON", "WAITING_VERIFICATION"] } });
  }

  return { applicationContextFilters: contextFilters };
}

interface DashboardUserRoleContextResult {
  dashboardUserRoleContextFilters: ContextFilters;
}

function buildDashboardUserRoleContext(user: UserDto): DashboardUserRoleContextResult {
  const contextFilters: ContextFilters = [];
  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    contextFilters.push({ terms: { "department.keyword": user.department } });
  }
  if (user.role === ROLES.REFERENT_REGION || user.role === ROLES.VISITOR) {
    contextFilters.push({ terms: { "region.keyword": [user.region] } });
  }
  return { dashboardUserRoleContextFilters: contextFilters };
}

function getResponsibleCenterField(role: string | undefined): string | null {
  if (!role) return null;
  let field = "";
  if (role === ROLES.HEAD_CENTER) {
    field = "headCenterId";
  } else if (role === ROLES.HEAD_CENTER_ADJOINT || role === ROLES.REFERENT_SANITAIRE) {
    field = "adjointsIds";
  }
  return field;
}

export {
  buildNdJson,
  buildArbitratyNdJson,
  buildRequestBody,
  joiElasticSearch,
  buildMissionContext,
  buildApplicationContext,
  buildDashboardUserRoleContext,
  getResponsibleCenterField,
};
