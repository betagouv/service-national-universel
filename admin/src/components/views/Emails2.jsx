import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ROLES, TEMPLATE_DESCRIPTIONS, canViewEmailHistory, formatLongDateFR } from "snu-lib";
import { translateEmails } from "../../utils";
import { Filters, ResultTable, Save, SelectedFilters } from "../filters-system-v2";
import EmailPanel from "../panels/EmailPanel";

export default function Emails({ email, userType }) {
  const { user } = useSelector((state) => state.Auth);

  //List state
  const [data, setData] = useState([]);
  const pageId = `emails-${userType}-list`;
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({
    page: 0,
  });
  const [size, setSize] = useState(10);

  //Filters
  const filterArray = [
    {
      title: "Template",
      name: "templateId",
      missingLabel: "Non renseigné",
      showCount: false,
    },
    user.role === ROLES.ADMIN ? { title: "Dernier statut", name: "event", translate: (e) => translateEmails(e), showCount: false } : null,
  ].filter(Boolean);

  if (!canViewEmailHistory(user)) return null;

  return (
    <div className="rounded-xl bg-white text-gray-900 shadow-md">
      <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
        <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
          <Filters
            pageId={pageId}
            route={`/elasticsearch/email/${email}/search`}
            setData={(value) => setData(value)}
            filters={filterArray}
            searchPlaceholder="Rechercher un email"
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            paramData={paramData}
            setParamData={setParamData}
            size={size}
          />
        </div>
        <div className="mt-2 flex flex-row flex-wrap items-center px-4">
          <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
          <SelectedFilters filterArray={filterArray} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} paramData={paramData} setParamData={setParamData} />
        </div>

        <ResultTable
          paramData={paramData}
          setParamData={setParamData}
          currentEntryOnPage={data?.length}
          size={size}
          setSize={setSize}
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
                  <Email key={index} email={email} user={user} />
                ))}
              </tbody>
            </table>
          }
        />
      </div>
    </div>
  );
}

function Email({ email, user }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <tr
        aria-checked={open}
        className="cursor-pointer border-t border-gray-100 text-gray-700 transition hover:bg-gray-50 aria-checked:bg-blue-500 aria-checked:text-white"
        onClick={() => setOpen(true)}>
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
