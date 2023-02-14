import { DataSearch, MultiDropdownList, ReactiveBase, ReactiveList } from "@appbaseio/reactivesearch";
import React from "react";
import { useSelector } from "react-redux";
import { canViewEmailHistory, formatLongDateFR, ROLES, TEMPLATE_DESCRIPTIONS } from "snu-lib";
import FilterIcon from "../../assets/icons/Filter";
import { apiURL } from "../../config";
import API from "../../services/api";
import { translateEmails } from "../../utils";
import DeleteFilters from "../buttons/DeleteFilters";
import EmailPanel from "../panels/EmailPanel";

export default function Emails({ email }) {
  const { user } = useSelector((state) => state.Auth);
  const [open, setOpen] = React.useState(false);

  if (!canViewEmailHistory(user)) return null;

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
            <div className="flex flex-wrap gap-6 items-center">
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
                showCount={false}
                renderLabel={(label) => {
                  if (Object.keys(label).length === 0) return "Template";
                  return (
                    <p className="max-w-64 truncate">
                      Template :{" "}
                      {Object.keys(label)
                        .map((e) => translateEmails(e))
                        .join(", ")}
                    </p>
                  );
                }}
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
                  renderLabel={(label) => {
                    if (Object.keys(label).length === 0) return "Statut";
                    return (
                      <p className="max-w-64 truncate">
                        Statut :{" "}
                        {Object.keys(label)
                          .map((e) => translateEmails(e))
                          .join(", ")}
                      </p>
                    );
                  }}
                  showCount={false}
                />
              )}
              <DeleteFilters />
            </div>
          )}
        </div>

        <ReactiveList
          componentId="result"
          dataField="createdAt"
          pagination={false}
          distinctField="messageId.keyword"
          defaultQuery={getDefaultQuery}
          react={{ and: FILTERS }}
          showResultStats={false}
          sortBy="desc"
          render={({ data }) => (
            <table className="table-auto w-full">
              <thead>
                <tr className="uppercase border-t border-t-slate-100">
                  <th className="w-1/2 font-normal px-4 py-3 text-xs text-gray-500">Objet de l&apos;email</th>
                  <th className="w-1/6 font-normal px-4 py-3 text-xs text-gray-500">Template ID</th>
                  {user.role === ROLES.ADMIN && <th className="w-1/6 font-normal px-4 py-3 text-xs text-gray-500">Dernier statut</th>}
                  <th className="w-1/6 font-normal px-4 py-3 text-xs text-gray-500">Date{user.role === ROLES.ADMIN && " du dernier statut"}</th>
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
        <td className="px-4 py-3 truncate text-xs">{email.templateId || ""}</td>
        {user.role === ROLES.ADMIN && <td className="px-4 py-3 truncate text-xs">{translateEmails(email.event)}</td>}
        <td className="px-4 py-3 truncate text-xs">{formatLongDateFR(email.date)}</td>
      </tr>
      <EmailPanel open={open} setOpen={setOpen} email={email} />
    </>
  );
}
