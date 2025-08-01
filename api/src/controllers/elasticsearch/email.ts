import express, { Response, Router } from "express";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES, ROLES } from "snu-lib";
import { capture } from "../../sentry";
import esClient from "../../es";
import { ERRORS } from "../../utils";
import { allRecords } from "../../es/utils";
import { joiElasticSearch, buildNdJson, buildRequestBody } from "./utils";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { UserRequest } from "../request";
import { permissionAccessControlMiddleware } from "../../middlewares/permissionAccessControlMiddleware";

interface SearchParams {
  queryFilters: any;
  page: any;
  sort: any;
  error?: any;
}

interface ContextFilters {
  term: {
    [key: string]: string | undefined;
  };
}

const router: Router = express.Router();

router.post(
  "/:email/:action(search|export)",
  authMiddleware(["referent"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.USER_NOTIFICATIONS, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  async (req: UserRequest, res: Response) => {
    try {
      // Configuration
      const searchFields: string[] = ["subject"];
      const filterFields: string[] = ["templateId.keyword", "event.keyword"];
      const sortFields: string[] = [];

      const { user, body, params } = req;

      // Body params validation
      const { queryFilters, page, sort, error }: SearchParams = joiElasticSearch({ filterFields, sortFields, body });
      if (error) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      // Context filters
      const contextFilters: ContextFilters[] = [user.role !== ROLES.ADMIN ? { term: { "event.keyword": "delivered" } } : null, { term: { "email.keyword": params.email } }].filter(
        Boolean,
      ) as ContextFilters[];

      // Build request body
      const { hitsRequestBody, aggsRequestBody } = buildRequestBody({ searchFields, filterFields, queryFilters, page, sort, contextFilters });

      //add collapse to hitsRequestBody and aggsRequestBody
      (hitsRequestBody as any).collapse = { field: "messageId.keyword" };
      (aggsRequestBody as any).collapse = { field: "messageId.keyword" };

      if (req.params.action === "export") {
        const response = await allRecords("email", hitsRequestBody.query);
        return res.status(200).send({ ok: true, data: response });
      } else {
        const response = await esClient.msearch({
          index: "email",
          body: buildNdJson({ index: "email", type: "_doc" }, hitsRequestBody, aggsRequestBody),
        });
        return res.status(200).send(response.body);
      }
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

export default router;
