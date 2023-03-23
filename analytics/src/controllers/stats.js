const express = require("express");
const router = express.Router();
const { capture } = require("../sentry");
const Joi = require("joi");
const { db } = require("../postgresql");

/*
Example with curl:

```
curl --request POST \
  --url http://localhost:8085/stats/young-status-region/count \
  --header 'Content-Type: application/json' \
  --data '{
  "cohort": "Avril 2023 - A",
  "region": "Occitanie",
  "status": "VALIDATED",
  "startDate": "2023-01-01",
  "endDate": "2023-02-08"
}
```
*/
router.post("/young-status-region/count", async (req, res) => {
  try {
    const { error, value } = Joi.object({
      cohort: Joi.string().required(),
      region: Joi.string().required(),
      status: Joi.string().valid("VALIDATED", "WAITING_VALIDATION").required(),
      startDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(),
      endDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(),
    }).validate(req.body);

    if (error) {
      console.log(error);
      return res.status(400).send({ ok: false, code: "INVALID_PARAMS" });
    }

    const result = await db.query(`
select count (distinct user_id) from "public"."log_youngs"
where user_region = :region and "raw_data"->>'status'= :status and "raw_data"->>'cohort' = :cohort and "date" between :startDate and :endDate::date + 1;`, {
      type: db.QueryTypes.SELECT,
      replacements: { region: value.region, status: value.status, cohort: value.cohort, startDate: value.startDate, endDate: value.endDate },
    });
    return res.status(200).send({ ok: true, data: result });
  } catch (error) {
    console.log("Error ", error);
    capture(error);
  }
});

module.exports = router;
