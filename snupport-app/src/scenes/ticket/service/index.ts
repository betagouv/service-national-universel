import API from "../../../services/api";
import { filterObjectByKeys } from "../../../utils";

type TicketsData = { tickets: any[]; aggregations: Record<string, number>; total: number };

function serializeTicketFilters(source: Record<string, any>) {
  const filters = filterObjectByKeys(
    source,
    [
      "size",
      "page",
      "folderId",
      "tag",
      "status",
      "contactId",
      "agentId",
      "ticketId",
      "sorting",
      "sources",
      "contactGroup",
      "contactDepartment",
      "contactCohort",
      "parcours",
      "advancedSearch",
      "agent",
    ],
    { dropEmptyValue: true }
  );
  for (let key of ["creationDate", "lastActivityDate"]) {
    if (source[key]) {
      const value = filterObjectByKeys(source[key], ["from", "to"], { dropEmptyValue: true });
      if (Object.keys(value).length) {
        filters[key] = value;
      }
    }
  }
  return filters;
}

export async function getTickets(filters: Record<string, any>): Promise<TicketsData> {
  const body = serializeTicketFilters(filters);
  const res = await API.post({ path: "/ticket/search", body });
  if (!res.ok) throw new Error(res.code);
  return { tickets: res.data, aggregations: res.aggregations, total: res.total };
}

export function serializeTicketUpdate(source: Record<string, any>) {
  const ticket = filterObjectByKeys(source, [
    "subject",
    "contactEmail",
    "canal",
    "copyRecipients",
    "files",
    "status",
    "messageDraft",
    "feedback",
    "contactGroup",
    "contactDepartment",
    "agentId",
    "agentFirstName",
    "agentLastName",
    "agentEmail",
    "referentDepartmentId",
    "referentDepartmentFirstName",
    "referentDepartmentLastName",
    "referentDepartmentEmail",
    "referentRegionId",
    "referentRegionFirstName",
    "referentRegionLastName",
    "referentRegionEmail",
    "formSubjectStep1",
  ]);
  if (source.tags && Array.isArray(source.tags)) {
    ticket.tagsId = source.tags.map((i) => i._id);
  }
    if (source.notes && Array.isArray(source.notes)) {
    ticket.notes = source.notes.map(i => filterObjectByKeys(i, ["authorName", "createdAt", "content"]))
  }
  if (source.contactAttributes && Array.isArray(source.contactAttributes)) {
    ticket.contactAttributes = source.contactAttributes.map((i) => filterObjectByKeys(i, ["name", "value", "format"]));
  }
  return ticket;
}

export async function updateTicket({ ticketId, payload }) {
  const body = serializeTicketUpdate(payload);
  const { ok, code, data } = await API.patch({ path: `/ticket/${ticketId}`, body });
  if (!ok) throw new Error(code);
  return data;
}
