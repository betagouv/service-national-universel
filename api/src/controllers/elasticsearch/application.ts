import passport from "passport";
import express, { Response } from "express";
import Joi from "joi";

import { PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "snu-lib";

import { capture } from "../../sentry";
import esClient from "../../es";
import { ERRORS } from "../../utils";
import { allRecords } from "../../es/utils";
import { joiElasticSearch, buildNdJson, buildRequestBody } from "./utils";
import { serializeApplications, serializeYoungs, serializeMissions, serializeStructures, serializeReferents } from "../../utils/es-serializer";
import { buildApplicationContext } from "./utils";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { permissionAccessControlMiddleware } from "../../middlewares/permissionAccessControlMiddleware";
import { UserRequest } from "../request";

const router = express.Router();

async function populateApplications(applications: any[], exportFields: string[]): Promise<any[]> {
  if (!applications || !applications.length) return applications;

  if (exportFields.includes("youngId")) {
    const youngIds = [...new Set(applications.map((item) => item.youngId))].filter(Boolean);
    const youngs = await allRecords("young", { bool: { must: { ids: { values: youngIds } } } });
    const serializedYoungs = youngs.length ? serializeYoungs(youngs) : [];
    applications = applications.map((item) => ({ ...item, young: serializedYoungs.find((e) => e._id === item.youngId) || {} }));
  }

  if (exportFields.includes("missionId")) {
    const missionIds = [...new Set(applications.map((item) => item.missionId))].filter(Boolean);
    const missions = await allRecords("mission", { bool: { must: { ids: { values: missionIds } } } });
    const serializedMissions = missions.length ? serializeMissions(missions) : [];
    applications = applications.map((item) => ({ ...item, mission: serializedMissions.find((e) => e._id === item.missionId) || {} }));
  }

  if (exportFields.includes("tutorId")) {
    const tutorIds = [...new Set(applications.map((item) => item.tutorId))].filter(Boolean);
    const tutors = await allRecords("referent", { bool: { must: { ids: { values: tutorIds } } } });
    const serializedTutors = tutors.length ? serializeReferents(tutors) : [];
    applications = applications.map((item) => ({ ...item, tutor: serializedTutors.find((e) => e._id === item.tutorId) || {} }));
  }
  if (exportFields.includes("structureId")) {
    const structureIds = [...new Set(applications.map((item) => item.structureId))].filter(Boolean);
    const structures = await allRecords("structure", { bool: { must: { ids: { values: structureIds } } } });
    const serializedStructures = structures.length ? serializeStructures(structures) : [];
    applications = applications.map((item) => ({ ...item, structure: serializedStructures.find((e) => e._id === item.structureId) || {} }));
  }

  if (exportFields.includes("youngId")) {
    const youngIds = [...new Set(applications.map((item) => item.youngId))].filter(Boolean);
    const youngs = await allRecords("young", { bool: { must: { ids: { values: youngIds } } } });
    const serializedYoungs = youngs.length ? serializeYoungs(youngs) : [];
    applications = applications.map((item) => ({ ...item, young: serializedYoungs.find((e) => e._id === item.youngId) || {} }));
  }

  return applications;
}

router.post("/by-mission/:id/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { user, body } = req as any;
    // Configuration
    const searchFields = ["youngEmail", "youngFirstName", "youngLastName"];
    const filterFields = ["status.keyword", "contractStatus.keyword", "filesType.keyword", "youngDepartment.keyword", "missionId.keyword"];
    const sortFields: string[] = [];

    // Body params validation
    const { queryFilters, page, sort, error, size, exportFields } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { error: errorQuery, value: query } = Joi.object({
      tab: Joi.string().trim().valid("all", "follow", "pending"),
    }).validate(req.query, { stripUnknown: true });
    if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { applicationContextFilters, applicationContextError } = await buildApplicationContext(user);
    if (applicationContextError) {
      return res.status(applicationContextError.status).send(applicationContextError.body);
    }

    // Context filters
    const contextFilters = [
      // @ts-ignore
      ...applicationContextFilters,
      { term: { "missionId.keyword": req.params.id } },
      query.tab === "pending" ? { terms: { "status.keyword": ["WAITING_VALIDATION"] } } : null,
      query.tab === "follow" ? { terms: { "status.keyword": ["IN_PROGRESS", "VALIDATED"] } } : null,
    ].filter(Boolean);

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      page,
      sort,
      contextFilters,
      size,
    });

    if (req.params.action === "export") {
      const fieldsToExport = exportFields === null || Array.isArray(exportFields) ? undefined : exportFields;
      const response = await allRecords("application", hitsRequestBody.query, esClient, fieldsToExport);
      let data = serializeApplications(response);
      data = await populateApplications(data, Array.isArray(exportFields) ? exportFields : []);
      return res.status(200).send({ ok: true, data });
    } else {
      const response = await esClient.msearch({ index: "application", body: buildNdJson({ index: "application", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(serializeApplications(response.body));
    }
  } catch (error: any) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post(
  "/:action(search|export)",
  authMiddleware(["referent"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.APPLICATION, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { user, body } = req as any;
      // Configuration
      const searchFields = ["youngEmail", "youngFirstName", "youngLastName"];
      const filterFields = [
        "status.keyword",
        "contractStatus.keyword",
        "filesType.keyword",
        "youngDepartment.keyword",
        "missionId.keyword",
        "tutorName.keyword",
        "missionName.keyword",
        "contractStatus.keyword",
      ];
      const sortFields: string[] = [];

      // Body params validation
      const { queryFilters, exportFields, page, sort, error, size } = joiElasticSearch({ filterFields, sortFields, body });
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const { error: errorQuery, value: query } = Joi.object({
        tab: Joi.string().trim().valid("all", "follow", "pending"),
      }).validate(req.query, { stripUnknown: true });
      if (errorQuery) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const { applicationContextFilters, applicationContextError } = await buildApplicationContext(user);
      if (applicationContextError) {
        return res.status(applicationContextError.status).send(applicationContextError.body);
      }

      // Context filters
      const contextFilters = [
        // @ts-ignore
        ...applicationContextFilters,
        // { term: { "missionId.keyword": req.params.id } },
        query.tab === "pending" ? { terms: { "status.keyword": ["WAITING_VALIDATION"] } } : null,
        query.tab === "follow" ? { terms: { "status.keyword": ["IN_PROGRESS", "VALIDATED"] } } : null,
      ].filter(Boolean);

      // Build request body
      const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
        searchFields,
        filterFields,
        queryFilters,
        page,
        sort,
        contextFilters,
        size,
      });

      if (req.params.action === "export") {
        const fieldsToExport = exportFields === null || Array.isArray(exportFields) ? undefined : exportFields;
        const response = await allRecords("application", hitsRequestBody.query, esClient, fieldsToExport);
        let data = serializeApplications(response);
        data = await populateApplications(data, Array.isArray(exportFields) ? exportFields : []);
        return res.status(200).send({ ok: true, data });
      } else {
        const response = await esClient.msearch({ index: "application", body: buildNdJson({ index: "application", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
        return res.status(200).send(serializeApplications(response.body));
      }
    } catch (error: any) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

router.post("/by-young/:id/:action(search|export)", passport.authenticate(["referent"], { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  try {
    const { user, body } = req as any;
    // Configuration
    const searchFields: string[] = [];
    const filterFields: string[] = [];
    const sortFields: string[] = ["priority.keyword"];

    // Body params validation
    const { queryFilters, page, sort, exportFields, error, size } = joiElasticSearch({ filterFields, sortFields, body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    const { applicationContextFilters, applicationContextError } = await buildApplicationContext(user);
    if (applicationContextError) {
      return res.status(applicationContextError.status).send(applicationContextError.body);
    }

    // Context filters
    const contextFilters = [...applicationContextFilters, { term: { "youngId.keyword": req.params.id } }].filter(Boolean);

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields,
      filterFields,
      queryFilters,
      page,
      sort,
      contextFilters,
      size,
    });

    if (req.params.action === "export") {
      const response = await allRecords(
        "application",
        hitsRequestBody.query,
        esClient,
        // @ts-ignore
        exportFields === null ? undefined : exportFields === "*" ? "*" : (exportFields as string[]),
      );
      let data = serializeApplications(response);
      data = await populateApplications(data, Array.isArray(exportFields) ? exportFields : []);
      return res.status(200).send({ ok: true, data });
    } else {
      const response = await esClient.msearch({ index: "application", body: buildNdJson({ index: "application", type: "_doc" }, hitsRequestBody, aggsRequestBody) });
      return res.status(200).send(serializeApplications(response.body));
    }
  } catch (error: any) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.post(
  "/count-by-status",
  authMiddleware(["referent"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.APPLICATION, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { user, body } = req as any;
      // Configuration
      const filterFields = ["structureId.keyword"];

      // Body params validation
      const { queryFilters, error } = joiElasticSearch({ filterFields, body });
      if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

      const { applicationContextFilters, applicationContextError } = await buildApplicationContext(user);
      if (applicationContextError) {
        return res.status(applicationContextError.status).send(applicationContextError.body);
      }

      const query = {
        query: {
          bool: {
            must: Array.isArray(applicationContextFilters) ? applicationContextFilters : [],
          },
        },
        aggs: {
          all: { filter: { terms: { "structureId.keyword": queryFilters.structureId } } },
          pending: {
            filter: { terms: { "structureId.keyword": queryFilters.structureId } },
            aggs: { pending: { filter: { terms: { "status.keyword": ["WAITING_VALIDATION"] } } } },
          },
          follow: {
            filter: { terms: { "structureId.keyword": queryFilters.structureId } },
            aggs: { follow: { filter: { terms: { "status.keyword": ["IN_PROGRESS", "VALIDATED"] } } } },
          },
        },
        size: 0,
        track_total_hits: true,
      };

      const response = await esClient.msearch({ index: "application", body: buildNdJson({ index: "application", type: "_doc" }, query) });
      return res.status(200).send(response.body);
    } catch (error: any) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

export default router;
