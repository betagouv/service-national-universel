const YoungObject = require("../models/young");
const ReferentObject = require("../models/referent");
const zammood = require("../zammood");
const { capture } = require("../sentry");
const slack = require("../slack");
const { getUserAttributes } = require("../services/support");

exports.handler = async () => {
  try {
    const youngs = await YoungObject.find({ updatedAt: { $gte: new Date(new Date() - 24 * 60 * 60 * 1000) } });
    const referents = await ReferentObject.find({ updatedAt: { $gte: new Date(new Date() - 24 * 60 * 60 * 1000) } });
    const contacts = youngs.concat(referents);
    const contactsWithAttributes = [];
    for (const contact of contacts) {
      const attributes = await getUserAttributes(contact);
      contactsWithAttributes.push({ ...contact.toObject(), attributes });
    }
    let updatedLength = 0;
    while (updatedLength < contacts.length) {
      let length = 100;
      if (updatedLength + 100 > contacts.length) length = contacts.length - updatedLength;
      const slicedContacts = contactsWithAttributes.slice(updatedLength, updatedLength + length);
      const response = await zammood.api(`/v0/contact`, { method: "POST", credentials: "include", body: JSON.stringify({ contacts: slicedContacts }) });
      if (!response.ok) slack.error({ title: "Fail sync contacts (young + ref) to Zammood", text: JSON.stringify(response.code) });
      updatedLength += 100;
    }
  } catch (e) {
    capture(e);
  }
};
