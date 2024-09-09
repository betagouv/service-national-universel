import { createContact } from "../brevo";

type lead = {
  email: string;
  firstname: string;
  lastname: string;
  region: string;
};

const leadListId = 706;

export async function createLead(value: lead) {
  const res = await createContact({
    email: value.email,
    listIds: [leadListId],
    attributes: {
      FIRSTNAME: value.firstname,
      LASTNAME: value.lastname,
      REGION: value.region,
    },
  });
  console.log(res);
  return res.data;
}
