import React from "react";
import { apiURL } from "../../../config";
import API from "../../../services/api";
import { DataSearch, DateRange, MultiDropdownList, ReactiveBase } from "@appbaseio/reactivesearch";

import ReactiveListComponent from "../../ReactiveListComponent";
import Email from "./components/Email";
import DeleteFilters from "../../buttons/DeleteFilters";
import FilterIcon from "../../../assets/icons/Filter";
import { ROLES } from "snu-lib";
import { useSelector } from "react-redux";

export default function Emails({ young }) {
  const { user } = useSelector((state) => state.Auth);
  const [open, setOpen] = React.useState(true);

  const FILTERS = ["SEARCH", "DATE", "TEMPLATE_ID", "EVENT"];

  const getDefaultQuery = () => {
    const query = {
      query: {
        bool: {
          filter: [{ term: { "email.keyword": young.email } }],
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
                filterLabel="Date d'envoi"
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
              <DeleteFilters />
            </div>
          )}
        </div>

        <div className="reactive-result">
          <ReactiveListComponent
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
