import express, { Response } from "express";

import { ERRORS, YOUNG_STATUS_PHASE2 } from "snu-lib";

import { capture } from "../../sentry";
import { UserRequest } from "../../controllers/request";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { PatchDocument, YoungModel } from "../../models";

const router = express.Router();

router.put("/unsubscribe-missions", authMiddleware(["young"]), async (req: UserRequest, res: Response) => {
  try {
    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.USER_NOT_FOUND });

    young.set({ statusPhase2: YOUNG_STATUS_PHASE2.DESENGAGED });
    await young.save();

    return res.status(200).send({ ok: true, data: { statusPhase2: young.statusPhase2 } });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

router.put("/subscribe-missions", authMiddleware(["young"]), async (req: UserRequest, res: Response) => {
  try {
    const young = await YoungModel.findById(req.user._id);
    if (!young) return res.status(404).send({ ok: false, code: ERRORS.USER_NOT_FOUND });
    if (young.statusPhase2 !== YOUNG_STATUS_PHASE2.DESENGAGED) return res.status(422).send({ ok: false, code: ERRORS.BAD_REQUEST });

    // get old status from patches
    let oldStatus: string | null = null;
    // @ts-ignore
    const patches: PatchDocument[] = await young.patches.find({ ref: young._id }).sort("-date").lean();
    for (const patch of patches) {
      for (const operation of patch.ops) {
        if (operation.op === "replace" && operation.path === "/statusPhase2" && operation.value === YOUNG_STATUS_PHASE2.DESENGAGED) {
          oldStatus = operation.originalValue || null;
          break;
        }
      }
    }
    if (!oldStatus) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

    young.set({ statusPhase2: YOUNG_STATUS_PHASE2.WAITING_REALISATION });
    await young.save();

    return res.status(200).send({ ok: true, data: { statusPhase2: young.statusPhase2 } });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

export default router;
