import express, { Response, Router } from "express";
import { capture } from "../../sentry";
import esClient from "../../es";
import { ERRORS } from "../../utils";
import { allRecords } from "../../es/utils";
import { joiElasticSearch, buildNdJson, buildRequestBody } from "./utils";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { UserRequest } from "../request";

const router: Router = express.Router();

router.post("/:action(search|export)", authMiddleware(["referent"]), async (req: UserRequest, res: Response) => {
  try {
    // Configuration
    const { user, body } = req;
    const searchFields: any = {
      searchFields: ["name", "address", "particularitesAcces", "region", "department", "code", "city", "zip", "matricule"],
      filterFields: ["cohorts.keyword", "region.keyword", "department.keyword", "matricule.keyword"],
      sortFields: [],
    };

    // Body params validation
    const { queryFilters, page, sort, error, size } = joiElasticSearch({ filterFields: searchFields.filterFields, sortFields: searchFields.sortFields, body: req.body });
    if (error) return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });

    // Context filters
    const contextFilters: any[] = [{ bool: { must_not: { exists: { field: "deletedAt" } } } }, { exists: { field: "matricule" } }];

    // Build request body
    const { hitsRequestBody, aggsRequestBody } = buildRequestBody({
      searchFields: searchFields.searchFields,
      filterFields: searchFields.filterFields,
      queryFilters,
      page,
      sort,
      contextFilters,
      size,
    });

    if (req.params.action === "export") {
      const response = await allRecords("pointderassemblement", hitsRequestBody.query);
      return res.status(200).send({ ok: true, data: response });
    } else {
      const response = await esClient.msearch({
        index: "pointderassemblement",
        body: buildNdJson({ index: "pointderassemblement", type: "_doc" }, hitsRequestBody, aggsRequestBody),
      });
      return res.status(200).send(response.body);
    }
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
