const { YoungModel, ReferentModel } = require("../models");
const SNUpport = require("../SNUpport");
const { capture } = require("../sentry");
const slack = require("../slack");
const { getUserAttributes } = require("../services/support");
const { logger } = require("../logger");
const { YOUNG_STATUS } = require("snu-lib");

exports.handler = async () => {
  try {
    const processContacts = async (Model, type) => {
      const query = { updatedAt: { $gte: new Date(new Date() - 24 * 60 * 60 * 1000) } };
      if (type === "young") {
        query.status = { $ne: YOUNG_STATUS.DELETED };
      }
      const cursor = Model.find(query).cursor();
      let contactsWithAttributes = [];

      async function syncContacts(contactsWithAttributes, type) {
        const response = await SNUpport.api(`/v0/contact`, { method: "POST", credentials: "include", body: JSON.stringify({ contacts: contactsWithAttributes }) });
        if (!response.ok) {
          slack.error({ title: `Fail sync ${type} contacts to SNUpport`, text: JSON.stringify(response.code) });
        }
        logger.info(`Processed batch ${contactsWithAttributes.length} (${type} contacts)`);
      }

      for await (const contact of cursor) {
        if (!contact.email) continue;
        contact.email = contact.email.toLowerCase();
        const attributes = await getUserAttributes(contact);
        contactsWithAttributes.push({
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          attributes,
        });

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

    await processContacts(YoungModel, "young");
    await processContacts(ReferentModel, "referent");
  } catch (e) {
    capture(e);
    throw e;
  }
};
