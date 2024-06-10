const YoungObject = require("../models/young");
const ReferentObject = require("../models/referent");
const SNUpport = require("../SNUpport");
const { capture } = require("../sentry");
const slack = require("../slack");
const { getUserAttributes } = require("../services/support");

exports.handler = async () => {
  try {
    const processContacts = async (Model, type) => {
      const cursor = Model.find({ updatedAt: { $gte: new Date(new Date() - 24 * 60 * 60 * 1000) } }).cursor();
      let updatedLength = 0;
      // let batchCount = 0;
      let contactsWithAttributes = [];

      while (true) {
        const contact = await cursor.next();
        if (!contact) break;

        contact.email = contact.email.toLowerCase();

        const attributes = await getUserAttributes(contact);
        contactsWithAttributes.push({ ...contact.toObject(), attributes });
        updatedLength++;

        if (updatedLength % 100 === 0) {
          const response = await SNUpport.api(`/v0/contact`, { method: "POST", credentials: "include", body: JSON.stringify({ contacts: contactsWithAttributes }) });
          if (!response.ok) {
            slack.error({ title: `Fail sync ${type} contacts to SNUpport`, text: JSON.stringify(response.code) });
          }
          // batchCount += contactsWithAttributes.length;
          // console.log(`Processed batch ${batchCount} (${updatedLength} ${type} contacts)`);
          contactsWithAttributes = [];
        }
      }

      if (contactsWithAttributes.length > 0) {
        const response = await SNUpport.api(`/v0/contact`, { method: "POST", credentials: "include", body: JSON.stringify({ contacts: contactsWithAttributes }) });
        if (!response.ok) {
          slack.error({ title: `Fail sync ${type} contacts to SNUpport`, text: JSON.stringify(response.code) });
        }
        // batchCount += contactsWithAttributes.length;
        // console.log(`Processed batch ${batchCount} (${updatedLength} ${type} contacts)`);
      }

      slack.success({ title: `Successfully synced ${type} contacts to SNUpport` });
    };

    await processContacts(YoungObject, "young");
    await processContacts(ReferentObject, "referent");
  } catch (e) {
    capture(e);
    throw e;
  }
};
