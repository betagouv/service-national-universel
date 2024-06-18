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
      let contactsWithAttributes = [];

      async function syncContacts(contactsWithAttributes, type) {
        const response = await SNUpport.api(`/v0/contact`, { method: "POST", credentials: "include", body: JSON.stringify({ contacts: contactsWithAttributes }) });
        if (!response.ok) {
          slack.error({ title: `Fail sync ${type} contacts to SNUpport`, text: JSON.stringify(response.code) });
        }
        console.log(`Processed batch ${contactsWithAttributes.length} (${type} contacts)`);
      }

      for await (const contact of cursor) {
        contact.email = contact.email.toLowerCase();
        const attributes = await getUserAttributes(contact);
        contactsWithAttributes.push({ ...contact.toObject(), attributes });

        if (contactsWithAttributes.length % 100 === 0) {
          await syncContacts(contactsWithAttributes, type);
          contactsWithAttributes = [];
        }
      }

      if (contactsWithAttributes.length > 0) {
        await syncContacts(contactsWithAttributes, type);
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
