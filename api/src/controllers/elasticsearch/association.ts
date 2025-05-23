import express, { Response } from "express";
import fetch from "node-fetch";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "snu-lib";
import { capture } from "../../sentry";
import { ERRORS } from "../../utils";
import { config } from "../../config";
import { UserRequest } from "../request";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { permissionAccessControlMiddleware } from "../../middlewares/permissionAccessControlMiddleware";

interface ApiEngagementParams {
  path?: string;
  body: any;
}

interface AssociationHit {
  _id: string;
  _source: any;
}

const apiEngagement = async ({ path = "/", body }: ApiEngagementParams): Promise<any> => {
  try {
    const myHeaders = new fetch.Headers();
    myHeaders.append("X-API-KEY", config.API_ENGAGEMENT_KEY);
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(body),
    };
    const res = await fetch(`${config.API_ENGAGEMENT_URL}${path}`, requestOptions);
    return await res.json();
  } catch (e) {
    capture(e, { extra: { path: path } });
  }
};

const router = express.Router();

router.post(
  "/:action(search|export)",
  authMiddleware(["referent"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.ASSOCIATION, action: PERMISSION_ACTIONS.READ }]),
  async (req: UserRequest, res: Response) => {
    try {
      const { body } = req;

      if (req.params.action === "export") {
        const associations: AssociationHit[] = [];
        let total: number | undefined;
        let maxIteration = 1000;
        let page = 0;
        while (associations.length < (total ?? 200) && maxIteration > 0) {
          const response = await apiEngagement({ path: `/v0/association/snu`, body: { ...body, page, size: 100 } });
          if (!response.responses[0]?.hits?.hits?.length) break;
          if (!total) total = response.responses[0].hits.total.value;
          associations.push(...response.responses[0].hits.hits.map((hit) => ({ _id: hit._id, ...hit._source })));
          maxIteration--;
          page++;
        }
        return res.status(200).send({ ok: true, data: associations });
      }

      const response = await apiEngagement({ path: `/v0/association/snu`, body });
      return res.status(200).send(response);
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

export default router;
