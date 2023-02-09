import { DataSearch, DateRange, MultiDropdownList, ReactiveBase } from "@appbaseio/reactivesearch";
import React from "react";
import { useSelector } from "react-redux";
import { formatLongDateFR, ROLES, TEMPLATE_DESCRIPTIONS } from "snu-lib";
import FilterIcon from "../../assets/icons/Filter";
import { apiURL } from "../../config";
import API from "../../services/api";
import { translateEmails } from "../../utils";
import DeleteFilters from "../buttons/DeleteFilters";
import EmailPanel from "../panels/EmailPanel";
import ReactiveListComponent from "../ReactiveListComponent";

export default function Emails({ email }) {
  const { user } = useSelector((state) => state.Auth);
  const [open, setOpen] = React.useState(false);

  const FILTERS = ["SEARCH", "DATE", "TEMPLATE_ID", "EVENT"];

  const getDefaultQuery = () => {
    const query = {
      query: {
        bool: {
          filter: [{ term: { "email.keyword": email } }],
        },
      },
      collapse: { field: "messageId.keyword" },
      track_total_hits: true,
    };
    return query;
  };
  return (
    <div className="bg-white rounded-xl shadow-md text-gray-700">
      <ReactiveBase url={`${apiURL}/es`} app="email" headers={{ Authorization: `JWT ${API.getToken()}` }}>
        <div className="p-4 space-y-6">
          <div className="flex gap-4">
            <DataSearch
              defaultQuery={getDefaultQuery}
              showIcon={false}
              componentId="SEARCH"
              dataField={["subject"]}
              placeholder="Rechercher un email"
              react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
              URLParams={true}
              autosuggest={false}
              className="datasearch-searchfield"
              innerClass={{ input: "searchbox" }}
            />
            <button onClick={() => setOpen(!open)} className="group py-2 px-3 rounded-lg flex items-center gap-2 bg-gray-100 hover:bg-gray-400 transition">
              <FilterIcon className="fill-gray-400 group-hover:fill-gray-100 transition" />
              <p className="text-gray-400 group-hover:text-gray-100 transition">Filtres</p>
            </button>
          </div>

          {open && (
            <div className="flex flex-wrap gap-4">
              <DateRange
                defaultQuery={getDefaultQuery}
                componentId="DATE"
                dataField="date"
                react={{ and: FILTERS.filter((e) => e !== "DATE") }}
                URLParams={true}
                title=""
                showFilter={true}
                filterLabel="Date"
                // className="date-filter"
                // innerClass={{ label: "text-xs", "input-container": "input-container" }}
              />
              <MultiDropdownList
                defaultQuery={getDefaultQuery}
                className="dropdown-filter"
                placeholder="Template"
                componentId="TEMPLATE_ID"
                dataField="templateId.keyword"
                react={{ and: FILTERS.filter((e) => e !== "TEMPLATE_ID") }}
                title=""
                URLParams={true}
                sortBy="asc"
                showSearch={true}
                searchPlaceholder="Rechercher..."
                size={1000}
              />
              {user.role === ROLES.ADMIN && (
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Dernier statut"
                  componentId="EVENT"
                  dataField="event.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "EVENT") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                  renderItem={(label) => {
                    return <span>{translateEmails(label)}</span>;
                  }}
                />
              )}
              <DeleteFilters />
            </div>
          )}
        </div>

        <div className="reactive-result">
          <ReactiveListComponent
            distinctField="messageId.keyword"
            pageSize={20}
            defaultQuery={getDefaultQuery}
            react={{ and: FILTERS }}
            paginationAt="bottom"
            showTopResultStats={false}
            render={({ data }) => (
              <table className="table-auto w-full">
                <thead>
                  <tr className="uppercase border-t border-t-slate-100">
                    <th className="w-1/2 font-normal px-4 py-3 text-xs text-gray-500">Objet de l&apos;email</th>
                    <th className="w-1/6 font-normal px-4 py-3 text-xs text-gray-500">Date d&apos;envoi</th>
                    <th className="w-1/6 font-normal px-4 py-3 text-xs text-gray-500">Template ID</th>
                    {user.role === ROLES.ADMIN && <th className="w-1/6 font-normal px-4 py-3 text-xs text-gray-500">Dernier statut</th>}
                  </tr>
                </thead>
                <tbody>
                  {data?.map((email, index) => (
                    <Email key={index} email={email} />
                  ))}
                </tbody>
              </table>
            )}
          />
        </div>
      </ReactiveBase>
    </div>
  );
}

function Email({ email }) {
  const { user } = useSelector((state) => state.Auth);
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <tr
        aria-checked={open}
        className="border-t border-gray-100 hover:bg-gray-50 text-gray-700 cursor-pointer aria-checked:bg-blue-500 aria-checked:text-white transition"
        onClick={() => setOpen(!open)}>
        <td className="px-4 py-3">
          <p className="text-sm font-semibold max-w-2xl truncate">{email.subject}</p>
          <p className="text-xs">{TEMPLATE_DESCRIPTIONS[email.templateId] || ""}</p>
        </td>
        <td className="px-4 py-3 truncate text-xs">{formatLongDateFR(email.date)}</td>
        <td className="px-4 py-3 truncate text-xs">{email.templateId || ""}</td>
        {user.role === ROLES.ADMIN && <td className="px-4 py-3 truncate text-xs">{translateEmails(email.event)}</td>}
      </tr>
      <EmailPanel open={open} setOpen={setOpen} email={email} />
    </>
  );
}
