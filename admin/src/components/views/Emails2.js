import { ReactiveBase } from "@appbaseio/reactivesearch";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ROLES, TEMPLATE_DESCRIPTIONS, canViewEmailHistory, formatLongDateFR } from "snu-lib";
import { apiURL } from "../../config";
import API from "../../services/api";
import { translateEmails } from "../../utils";
import { Filters, ResultTable, Save, SelectedFilters } from "../filters-system-v2";
import EmailPanel from "../panels/EmailPanel";

export default function Emails({ email }) {
  const { user } = useSelector((state) => state.Auth);

  //List state
  const [data, setData] = useState([]);
  const pageId = "emails-young-list";
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({
    page: 0,
  });

  //Filters
  const filterArray = [
    {
      title: "Template",
      name: "templateId",
      missingLabel: "Non renseigné",
      translate: (e) => translateEmails(e) + " - " + e,
    },
    user.role === ROLES.ADMIN ? { title: "Dernier statut", name: "event", translate: (e) => translateEmails(e) } : null,
  ].filter(Boolean);

  if (!canViewEmailHistory(user)) return null;

  return (
    <div className="rounded-xl bg-white text-gray-900 shadow-md">
      <ReactiveBase url={`${apiURL}/es`} app="email" headers={{ Authorization: `JWT ${API.getToken()}` }}>
        <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
          <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
            <Filters
              pageId={pageId}
              route={`/elasticsearch/email/${email}/search`}
              setData={(value) => setData(value)}
              filters={filterArray}
              searchPlaceholder="Rechercher par mots clés, ville, code postal..."
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              paramData={paramData}
              setParamData={setParamData}
            />
          </div>
          <div className="mt-2 flex flex-row flex-wrap items-center px-4">
            <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
            <SelectedFilters
              filterArray={filterArray}
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              paramData={paramData}
              setParamData={setParamData}
            />
          </div>

          <ResultTable
            paramData={paramData}
            setParamData={setParamData}
            currentEntryOnPage={data?.length}
            render={
              <table className="mt-6 mb-2 w-full table-auto font-marianne">
                <thead>
                  <tr className="border-t border-t-slate-100 uppercase">
                    <th className="w-1/2 px-4 py-3 text-xs font-normal text-gray-500">Objet de l&apos;email</th>
                    <th className="w-1/6 px-4 py-3 text-xs font-normal text-gray-500">Template ID</th>
                    {user.role === ROLES.ADMIN && <th className="w-1/6 px-4 py-3 text-xs font-normal text-gray-500">Dernier statut</th>}
                    <th className="w-1/6 px-4 py-3 text-xs font-normal text-gray-500">Date{user.role === ROLES.ADMIN && " du dernier statut"}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((email, index) => (
                    <Email key={index} email={email} />
                  ))}
                </tbody>
              </table>
            }
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
        className="cursor-pointer border-t border-gray-100 text-gray-700 transition hover:bg-gray-50 aria-checked:bg-blue-500 aria-checked:text-white"
        onClick={() => setOpen(!open)}>
        <td className="px-4 py-3">
          <p className="max-w-2xl truncate text-sm font-semibold">{email.subject}</p>
          <p className="text-xs">{TEMPLATE_DESCRIPTIONS[email.templateId] || ""}</p>
        </td>
        <td className="truncate px-4 py-3 text-xs">{email.templateId || ""}</td>
        {user.role === ROLES.ADMIN && <td className="truncate px-4 py-3 text-xs">{translateEmails(email.event)}</td>}
        <td className="truncate px-4 py-3 text-xs">{formatLongDateFR(email.date)}</td>
      </tr>
      <EmailPanel open={open} setOpen={setOpen} email={email} />
    </>
  );
}
